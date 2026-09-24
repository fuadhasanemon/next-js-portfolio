import { prisma } from "@/lib/prisma";
import { checkLimit, clientIp, recordHit } from "@/lib/rateLimit";

// One counted view per reader per post per half hour. The client also skips
// repeat views within a browser session; this catches scripted refreshes.
const VIEW = { limit: 1, windowMs: 30 * 60 * 1000 };
// Enough to change your mind a few times, not enough to farm likes.
const LIKE = { limit: 6, windowMs: 10 * 60 * 1000 };

const ACTIONS = ["view", "like", "unlike"];

const counts = (stats) => ({ views: stats?.views ?? 0, likes: stats?.likes ?? 0 });

/**
 * Public view/like counters for a published post.
 *   GET                         -> { views, likes }
 *   POST { action: "view" }     -> counts a view (rate limited), returns counts
 *   POST { action: "like" }     -> +1 like
 *   POST { action: "unlike" }   -> -1 like, never below zero
 * Over-limit requests are answered with the current counts rather than an
 * error: nothing a reader can do about it, so nothing worth showing them.
 */
export default async function handler(req, res) {
  if (req.method !== "GET" && req.method !== "POST") {
    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const slug = String(req.query.slug || "");

  try {
    const post = await prisma.post.findUnique({
      where: { slug },
      select: { id: true, published: true, stats: true },
    });
    if (!post || !post.published) {
      return res.status(404).json({ error: "Post not found" });
    }

    res.setHeader("Cache-Control", "no-store");

    if (req.method === "GET") return res.status(200).json(counts(post.stats));

    const action = req.body?.action;
    if (!ACTIONS.includes(action)) {
      return res.status(400).json({ error: "Unknown action" });
    }

    const rule = action === "view" ? VIEW : LIKE;
    const key = `${action === "view" ? "view" : "like"}:${slug}:${clientIp(req)}`;
    if (!checkLimit(key, rule).allowed) {
      return res.status(200).json(counts(post.stats));
    }

    let stats;
    if (action === "unlike") {
      // updateMany so the guard and the decrement are one statement.
      await prisma.postStats.updateMany({
        where: { postId: post.id, likes: { gt: 0 } },
        data: { likes: { decrement: 1 } },
      });
      stats = await prisma.postStats.findUnique({ where: { postId: post.id } });
    } else {
      const field = action === "view" ? "views" : "likes";
      stats = await prisma.postStats.upsert({
        where: { postId: post.id },
        create: { postId: post.id, [field]: 1 },
        update: { [field]: { increment: 1 } },
      });
    }

    recordHit(key, rule);
    return res.status(200).json(counts(stats));
  } catch (error) {
    console.error(`[stats] ${slug}: ${error.message}`);
    return res.status(500).json({ error: "Could not update stats" });
  }
}

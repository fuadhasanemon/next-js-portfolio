import { requireAdmin } from "@/lib/auth";
import { postData } from "@/lib/content";
import { prisma } from "@/lib/prisma";
import { postPaths, revalidatePaths } from "@/lib/revalidate";

export default async function handler(req, res) {
  if (!(await requireAdmin(req, res))) return;

  if (req.method === "GET") {
    const posts = await prisma.post.findMany({
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    });
    return res.status(200).json(posts);
  }

  if (req.method === "POST") {
    const data = await postData(req.body || {});
    const first = await prisma.post.findFirst({
      orderBy: { order: "asc" },
      select: { order: true },
    });

    const post = await prisma.post.create({
      data: { ...data, order: (first?.order ?? 0) - 1 },
    });

    await revalidatePaths(res, postPaths(post.slug));
    return res.status(201).json(post);
  }

  res.setHeader("Allow", "GET, POST");
  return res.status(405).json({ error: "Method not allowed" });
}

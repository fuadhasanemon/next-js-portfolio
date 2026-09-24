import { requireAdmin } from "@/lib/auth";
import { deleteImage, isOwnedId, searchImages } from "@/lib/cloudinary";
import { findUsage } from "@/lib/mediaUsage";

/**
 *   GET    ?folder=all|blog|work&cursor=   -> { items, total, nextCursor }
 *   DELETE ?publicId=portfolio/blog/abc    -> 204, or 409 while in use
 *
 * Each item carries `usage`, the posts/projects that reference it.
 */
export default async function handler(req, res) {
  if (!(await requireAdmin(req, res))) return;

  try {
    if (req.method === "GET") {
      const page = await searchImages({
        folder: String(req.query.folder || "all"),
        cursor: req.query.cursor ? String(req.query.cursor) : undefined,
      });
      const usage = await findUsage(page.items.map((i) => i.publicId));
      return res.status(200).json({
        ...page,
        items: page.items.map((item) => ({ ...item, usage: usage[item.publicId] || [] })),
      });
    }

    if (req.method === "DELETE") {
      const publicId = String(req.query.publicId || "");
      if (!isOwnedId(publicId)) {
        return res.status(400).json({ error: "Not an image from this site's library." });
      }

      // Checked here as well as in the UI: a stale page must not be able to
      // delete an image that something started using since it loaded.
      const uses = (await findUsage([publicId]))[publicId];
      if (uses.length) {
        return res.status(409).json({
          error: `Still used by ${uses.map((u) => u.title).join(", ")}.`,
        });
      }

      if (!(await deleteImage(publicId))) {
        return res.status(404).json({ error: "Image not found." });
      }
      return res.status(204).end();
    }
  } catch (error) {
    console.error(`[media] ${error.message}`);
    return res.status(502).json({ error: error.message });
  }

  res.setHeader("Allow", "GET, DELETE");
  return res.status(405).json({ error: "Method not allowed" });
}

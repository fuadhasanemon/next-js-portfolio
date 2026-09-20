import { requireAdmin } from "@/lib/auth";
import { postData } from "@/lib/content";
import { prisma } from "@/lib/prisma";
import { postPaths, revalidatePaths } from "@/lib/revalidate";

export default async function handler(req, res) {
  if (!(await requireAdmin(req, res))) return;

  const { id } = req.query;
  const existing = await prisma.post.findUnique({ where: { id } });
  if (!existing) return res.status(404).json({ error: "Not found" });

  if (req.method === "GET") return res.status(200).json(existing);

  if (req.method === "PUT" || req.method === "PATCH") {
    const data = await postData(req.body || {}, existing);
    const post = await prisma.post.update({ where: { id }, data });
    await revalidatePaths(res, postPaths(post.slug, existing.slug));
    return res.status(200).json(post);
  }

  if (req.method === "DELETE") {
    await prisma.post.delete({ where: { id } });
    await revalidatePaths(res, postPaths(null, existing.slug));
    return res.status(200).json({ ok: true });
  }

  res.setHeader("Allow", "GET, PUT, PATCH, DELETE");
  return res.status(405).json({ error: "Method not allowed" });
}

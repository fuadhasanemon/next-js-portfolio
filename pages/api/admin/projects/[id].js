import { requireAdmin } from "@/lib/auth";
import { projectData } from "@/lib/content";
import { prisma } from "@/lib/prisma";
import { projectPaths, revalidatePaths } from "@/lib/revalidate";

export default async function handler(req, res) {
  if (!(await requireAdmin(req, res))) return;

  const { id } = req.query;
  const existing = await prisma.project.findUnique({ where: { id } });
  if (!existing) return res.status(404).json({ error: "Not found" });

  if (req.method === "GET") return res.status(200).json(existing);

  if (req.method === "PUT" || req.method === "PATCH") {
    const data = await projectData(req.body || {}, existing);
    const project = await prisma.project.update({ where: { id }, data });
    await revalidatePaths(res, projectPaths(project.slug, existing.slug));
    return res.status(200).json(project);
  }

  if (req.method === "DELETE") {
    await prisma.project.delete({ where: { id } });
    await revalidatePaths(res, projectPaths(null, existing.slug));
    return res.status(200).json({ ok: true });
  }

  res.setHeader("Allow", "GET, PUT, PATCH, DELETE");
  return res.status(405).json({ error: "Method not allowed" });
}

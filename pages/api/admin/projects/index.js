import { requireAdmin } from "@/lib/auth";
import { projectData } from "@/lib/content";
import { prisma } from "@/lib/prisma";
import { projectPaths, revalidatePaths } from "@/lib/revalidate";

export default async function handler(req, res) {
  if (!(await requireAdmin(req, res))) return;

  if (req.method === "GET") {
    const projects = await prisma.project.findMany({
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    });
    return res.status(200).json(projects);
  }

  if (req.method === "POST") {
    const data = await projectData(req.body || {});
    // New projects go to the top of the manual ordering.
    const first = await prisma.project.findFirst({
      orderBy: { order: "asc" },
      select: { order: true },
    });

    const project = await prisma.project.create({
      data: { ...data, order: (first?.order ?? 0) - 1 },
    });

    await revalidatePaths(res, projectPaths(project.slug));
    return res.status(201).json(project);
  }

  res.setHeader("Allow", "GET, POST");
  return res.status(405).json({ error: "Method not allowed" });
}

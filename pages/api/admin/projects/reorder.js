import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePaths } from "@/lib/revalidate";

export default async function handler(req, res) {
  if (!(await requireAdmin(req, res))) return;

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { ids } = req.body || {};
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: "ids[] required" });
  }

  // One transaction so a partial drag never leaves the list half-ordered.
  await prisma.$transaction(
    ids.map((id, index) =>
      prisma.project.update({ where: { id }, data: { order: index } })
    )
  );

  await revalidatePaths(res, ["/", "/work"]);
  return res.status(200).json({ ok: true });
}

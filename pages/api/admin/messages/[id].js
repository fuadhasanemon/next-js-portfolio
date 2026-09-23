import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const STATUSES = ["NEW", "READ", "ARCHIVED"];

export default async function handler(req, res) {
  if (!(await requireAdmin(req, res))) return;

  const { id } = req.query;

  if (req.method === "PATCH") {
    const { status } = req.body || {};
    if (!STATUSES.includes(status)) {
      return res.status(400).json({ error: "Unknown status" });
    }

    try {
      const message = await prisma.contactMessage.update({
        where: { id },
        data: { status },
      });
      return res.status(200).json(message);
    } catch {
      return res.status(404).json({ error: "Message not found" });
    }
  }

  res.setHeader("Allow", "PATCH");
  return res.status(405).json({ error: "Method not allowed" });
}

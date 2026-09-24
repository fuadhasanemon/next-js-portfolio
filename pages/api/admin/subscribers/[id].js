import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const STATUSES = ["ACTIVE", "UNSUBSCRIBED"];

export default async function handler(req, res) {
  if (!(await requireAdmin(req, res))) return;

  const { id } = req.query;

  if (req.method === "PATCH") {
    const { status } = req.body || {};
    if (!STATUSES.includes(status)) {
      return res.status(400).json({ error: "Unknown status" });
    }

    try {
      const subscriber = await prisma.subscriber.update({
        where: { id },
        data: { status },
      });
      return res.status(200).json(subscriber);
    } catch {
      return res.status(404).json({ error: "Subscriber not found" });
    }
  }

  if (req.method === "DELETE") {
    try {
      await prisma.subscriber.delete({ where: { id } });
      return res.status(204).end();
    } catch {
      return res.status(404).json({ error: "Subscriber not found" });
    }
  }

  res.setHeader("Allow", "PATCH, DELETE");
  return res.status(405).json({ error: "Method not allowed" });
}

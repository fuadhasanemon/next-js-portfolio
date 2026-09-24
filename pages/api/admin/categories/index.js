import { requireAdmin } from "@/lib/auth";
import { findClash, listCategories, validateCategory } from "@/lib/categories";
import { prisma } from "@/lib/prisma";

export default async function handler(req, res) {
  if (!(await requireAdmin(req, res))) return;

  if (req.method === "GET") {
    return res.status(200).json(await listCategories());
  }

  if (req.method === "POST") {
    const { data, errors } = validateCategory(req.body || {});
    if (Object.keys(errors).length) {
      return res.status(400).json({ error: "Please check the form.", errors });
    }

    const clash = await findClash(data);
    if (clash) {
      const error = `"${clash.name}" already exists.`;
      return res.status(409).json({ error, errors: { name: error } });
    }

    // A new category has no posts yet, so nothing public needs revalidating.
    const category = await prisma.category.create({ data });
    return res.status(201).json({ ...category, postCount: 0 });
  }

  res.setHeader("Allow", "GET, POST");
  return res.status(405).json({ error: "Method not allowed" });
}

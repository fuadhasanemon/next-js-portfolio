import { requireAdmin } from "@/lib/auth";
import { findClash, validateCategory } from "@/lib/categories";
import { prisma } from "@/lib/prisma";
import { postPaths, revalidatePaths } from "@/lib/revalidate";

export default async function handler(req, res) {
  if (!(await requireAdmin(req, res))) return;

  if (req.method !== "PATCH" && req.method !== "DELETE") {
    res.setHeader("Allow", "PATCH, DELETE");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const existing = await prisma.category.findUnique({
    where: { id: String(req.query.id) },
  });
  if (!existing) return res.status(404).json({ error: "Category not found" });

  const posts = await prisma.post.findMany({
    where: { category: existing.name },
    select: { slug: true },
  });

  if (req.method === "DELETE") {
    // Deleting a category in use would leave posts on a name the picker no
    // longer offers. Move them first; the admin UI says so up front.
    if (posts.length) {
      const n = posts.length;
      return res.status(409).json({
        error: `${n} ${n === 1 ? "post uses" : "posts use"} this category. Move ${
          n === 1 ? "it" : "them"
        } to another category first.`,
      });
    }

    await prisma.category.delete({ where: { id: existing.id } });
    return res.status(204).end();
  }

  const { data, errors } = validateCategory(req.body || {});
  if (Object.keys(errors).length) {
    return res.status(400).json({ error: "Please check the form.", errors });
  }

  const clash = await findClash(data, existing.id);
  if (clash) {
    const error = `"${clash.name}" already exists.`;
    return res.status(409).json({ error, errors: { name: error } });
  }

  const renamed = data.name !== existing.name;

  // Raw SQL for the posts on purpose: Prisma's update/updateMany would bump
  // Post.updatedAt (@updatedAt), and a rename is not an edit. It must not
  // put "Updated" on every article or move their sitemap lastmod.
  const [category] = await prisma.$transaction([
    prisma.category.update({ where: { id: existing.id }, data }),
    ...(renamed
      ? [
          prisma.$executeRaw`UPDATE "Post" SET "category" = ${data.name} WHERE "category" = ${existing.name}`,
        ]
      : []),
  ]);

  if (renamed && posts.length) {
    await revalidatePaths(res, posts.flatMap((p) => postPaths(p.slug)));
  }

  return res.status(200).json({ ...category, postCount: posts.length });
}

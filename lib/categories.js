import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/site";

export const LIMITS = { name: 60, description: 300 };

const str = (v) => (typeof v === "string" ? v.trim() : "");

/** Returns { data, errors } like the other validators; errors keyed by field. */
export function validateCategory(body = {}) {
  // Collapse inner whitespace so "Next.js  AI" and "Next.js AI" can't both exist.
  const name = str(body.name).replace(/\s+/g, " ");
  const description = str(body.description);

  const errors = {};
  if (!name) errors.name = "A name is required.";
  else if (name.length > LIMITS.name)
    errors.name = `Keep this under ${LIMITS.name} characters.`;
  else if (!slugify(name)) errors.name = "Use at least one letter or number.";

  if (description.length > LIMITS.description)
    errors.description = `Keep this under ${LIMITS.description} characters.`;

  return { data: { name, slug: slugify(name), description }, errors };
}

/**
 * Case-insensitive clash check on name, plus the slug, so "react" can't sit
 * next to "React" and "Next.js" can't collide with "Next JS" on the slug.
 */
export function findClash({ name, slug }, ignoreId) {
  return prisma.category.findFirst({
    where: {
      ...(ignoreId ? { id: { not: ignoreId } } : {}),
      OR: [{ name: { equals: name, mode: "insensitive" } }, { slug }],
    },
    select: { name: true },
  });
}

/**
 * Every category with how many posts use it, alphabetical. Categories that
 * posts use but the table lacks (written before this list existed) are
 * created on the way, so neither the admin list nor the editor ever hides a
 * category that's live on the site.
 */
export async function listCategories() {
  const [categories, usage] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.post.groupBy({ by: ["category"], _count: { _all: true } }),
  ]);

  const known = new Set(categories.map((c) => c.name.toLowerCase()));
  const missing = usage
    .map((u) => u.category)
    .filter((name) => name && !known.has(name.toLowerCase()) && slugify(name));

  if (missing.length) {
    await prisma.category.createMany({
      data: missing.map((name) => ({ name, slug: slugify(name) })),
      skipDuplicates: true,
    });
    return listCategories();
  }

  const counts = new Map(usage.map((u) => [u.category, u._count._all]));
  return categories.map((c) => ({ ...c, postCount: counts.get(c.name) || 0 }));
}

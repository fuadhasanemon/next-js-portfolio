import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/site";

const str = (v, fallback = "") => (typeof v === "string" ? v.trim() : fallback);
const nullable = (v) => {
  const s = str(v);
  return s === "" ? null : s;
};
const list = (v) =>
  Array.isArray(v)
    ? v.map((i) => String(i).trim()).filter(Boolean)
    : str(v)
        .split(",")
        .map((i) => i.trim())
        .filter(Boolean);

/** Appends -2, -3… until the slug is free, ignoring the record being edited. */
export async function uniqueSlug(model, desired, fallback, ignoreId) {
  const base = slugify(desired) || slugify(fallback) || "untitled";
  let candidate = base;

  for (let n = 2; n < 100; n++) {
    const existing = await prisma[model].findUnique({
      where: { slug: candidate },
      select: { id: true },
    });
    if (!existing || existing.id === ignoreId) return candidate;
    candidate = `${base}-${n}`;
  }

  return `${base}-${Date.now()}`;
}

export async function projectData(body, existing) {
  const title = str(body.title, existing?.title || "Untitled project");
  const slug = await uniqueSlug(
    "project",
    body.slug || existing?.slug || title,
    title,
    existing?.id
  );

  return {
    title,
    slug,
    shortDescription: str(body.shortDescription),
    description: str(body.description),
    role: str(body.role),
    technologies: list(body.technologies),
    coverImage: nullable(body.coverImage),
    coverAlt: str(body.coverAlt),
    gallery: Array.isArray(body.gallery) ? body.gallery : [],
    liveUrl: nullable(body.liveUrl),
    githubUrl: nullable(body.githubUrl),
    featured: Boolean(body.featured),
    published: Boolean(body.published),
    seoTitle: nullable(body.seoTitle),
    seoDescription: nullable(body.seoDescription),
    canonicalUrl: nullable(body.canonicalUrl),
    ogImage: nullable(body.ogImage),
    noIndex: Boolean(body.noIndex),
  };
}

export async function postData(body, existing) {
  const title = str(body.title, existing?.title || "Untitled post");
  const slug = await uniqueSlug(
    "post",
    body.slug || existing?.slug || title,
    title,
    existing?.id
  );

  const published = Boolean(body.published);
  // First publish stamps the date; later edits keep whatever is set.
  let publishedAt = existing?.publishedAt ?? null;
  if (body.publishedAt) publishedAt = new Date(body.publishedAt);
  else if (published && !publishedAt) publishedAt = new Date();

  return {
    title,
    slug,
    excerpt: str(body.excerpt),
    content: str(body.content),
    coverImage: nullable(body.coverImage),
    coverAlt: str(body.coverAlt),
    category: str(body.category),
    tags: list(body.tags),
    author: str(body.author, "Fuad Hasan Emon"),
    featured: Boolean(body.featured),
    published,
    publishedAt,
    seoTitle: nullable(body.seoTitle),
    seoDescription: nullable(body.seoDescription),
    canonicalUrl: nullable(body.canonicalUrl),
    ogTitle: nullable(body.ogTitle),
    ogDescription: nullable(body.ogDescription),
    ogImage: nullable(body.ogImage),
    noIndex: Boolean(body.noIndex),
  };
}

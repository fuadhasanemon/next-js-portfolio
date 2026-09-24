import { prisma } from "@/lib/prisma";

const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * Where each image is referenced. A Cloudinary URL ends in
 * ".../upload/<transforms>/v123/<publicId>.<ext>", so a match is the public id
 * followed by the extension dot — which keeps "abc" from matching "abcd".
 * Markdown bodies and project galleries are searched as well as the cover
 * and social image fields, so an image dropped into an article counts.
 *
 * Returns { [publicId]: [{ kind, title, href, field }] }.
 */
export async function findUsage(publicIds) {
  if (!publicIds.length) return {};

  const [posts, projects] = await Promise.all([
    prisma.post.findMany({
      select: { id: true, title: true, coverImage: true, ogImage: true, content: true },
    }),
    prisma.project.findMany({
      select: {
        id: true,
        title: true,
        coverImage: true,
        ogImage: true,
        gallery: true,
        description: true,
      },
    }),
  ]);

  const sources = [
    ...posts.map((p) => ({
      kind: "Post",
      title: p.title,
      href: `/admin/posts/${p.id}`,
      fields: { cover: p.coverImage, "social image": p.ogImage, body: p.content },
    })),
    ...projects.map((p) => ({
      kind: "Project",
      title: p.title,
      href: `/admin/projects/${p.id}`,
      fields: {
        cover: p.coverImage,
        "social image": p.ogImage,
        gallery: JSON.stringify(p.gallery ?? []),
        description: p.description,
      },
    })),
  ];

  const usage = {};
  for (const id of publicIds) {
    const pattern = new RegExp(`/${escape(id)}\\.`);
    usage[id] = [];
    for (const source of sources) {
      const field = Object.keys(source.fields).find(
        (key) => source.fields[key] && pattern.test(source.fields[key])
      );
      if (field) {
        usage[id].push({ kind: source.kind, title: source.title, href: source.href, field });
      }
    }
  }
  return usage;
}

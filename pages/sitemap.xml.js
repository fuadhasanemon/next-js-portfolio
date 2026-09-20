import { prisma, safeQuery } from "@/lib/prisma";
import { SITE_URL } from "@/lib/site";

const STATIC_PAGES = [
  { path: "/", priority: "1.0", changefreq: "monthly" },
  { path: "/work", priority: "0.9", changefreq: "weekly" },
  { path: "/blog", priority: "0.9", changefreq: "weekly" },
  { path: "/about", priority: "0.7", changefreq: "monthly" },
  { path: "/tech", priority: "0.6", changefreq: "monthly" },
  { path: "/timeline", priority: "0.6", changefreq: "monthly" },
];

const escape = (value) =>
  String(value).replace(/[<>&'"]/g, (c) =>
    ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" }[c])
  );

const urlEntry = ({ path, lastmod, changefreq, priority }) =>
  [
    "  <url>",
    `    <loc>${escape(SITE_URL + path)}</loc>`,
    lastmod ? `    <lastmod>${new Date(lastmod).toISOString()}</lastmod>` : "",
    changefreq ? `    <changefreq>${changefreq}</changefreq>` : "",
    priority ? `    <priority>${priority}</priority>` : "",
    "  </url>",
  ]
    .filter(Boolean)
    .join("\n");

export async function getServerSideProps({ res }) {
  // Only published, indexable content. Drafts, /admin and API routes never
  // appear here, so the sitemap stays in step with what is actually public.
  const { data } = await safeQuery(
    () =>
      Promise.all([
    prisma.project.findMany({
      where: { published: true, noIndex: false },
      select: { slug: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.post.findMany({
      where: { published: true, noIndex: false },
      select: { slug: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
    }),
      ]),
    [[], []]
  );

  const [projects, posts] = data;

  const entries = [
    ...STATIC_PAGES,
    ...projects.map((p) => ({
      path: `/work/${p.slug}`,
      lastmod: p.updatedAt,
      changefreq: "monthly",
      priority: "0.8",
    })),
    ...posts.map((p) => ({
      path: `/blog/${p.slug}`,
      lastmod: p.updatedAt,
      changefreq: "monthly",
      priority: "0.8",
    })),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.map(urlEntry).join("\n")}
</urlset>`;

  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");
  res.write(xml);
  res.end();

  return { props: {} };
}

export default function Sitemap() {
  return null;
}

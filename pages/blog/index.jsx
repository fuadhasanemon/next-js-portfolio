import Link from "next/link";

import PostCard from "@/components/PostCard";
import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";
import Seo from "@/components/Seo";
import { useRevealGroup } from "@/hooks/useReveal";
import { breadcrumbSchema, collectionSchema } from "@/lib/jsonld";
import { deriveExcerpt } from "@/lib/markdown";
import { prisma, revalidateFor, safeQuery, serialize } from "@/lib/prisma";
import { readingTime } from "@/lib/site";

const DESCRIPTION =
  "Notes on full-stack development, AI agents, automation with n8n and Claude Code, Next.js, React and interactive web experiences — by Fuad Hasan Emon.";

export default function Blog({ featured, posts, categories }) {
  const revealRef = useRevealGroup();
  const all = featured ? [featured, ...posts] : posts;

  return (
    <>
      <Seo
        title="Blog"
        description={DESCRIPTION}
        path="/blog"
        jsonLd={[
          collectionSchema({
            name: "Blog",
            description: DESCRIPTION,
            path: "/blog",
            items: all.map((p) => ({ name: p.title, path: `/blog/${p.slug}` })),
          }),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Blog", path: "/blog" },
          ]),
        ]}
      />

      <div ref={revealRef} className="shell pb-28 pt-36 sm:pt-40">
        <SectionHeading
          as="h1"
          align="left"
          eyebrow="Blog"
          title="Things I'm building, learning and exploring"
          lead="Practical notes from real projects — AI agents, automation, and the engineering behind modern web products."
        />

        {all.length === 0 ? (
          <Reveal className="mt-20 text-center">
            <p className="text-fluid-base text-muted">
              The first article is on its way. In the meantime, have a look at{" "}
              <Link href="/work" className="link-underline text-ink">
                what I&apos;ve built
              </Link>
              .
            </p>
          </Reveal>
        ) : (
          <>
            {featured && (
              <section className="mt-20">
                <h2 className="eyebrow mb-6">Featured</h2>
                <PostCard post={featured} featured />
              </section>
            )}

            {categories.length > 0 && (
              <Reveal className="mt-20">
                <h2 className="eyebrow">Topics</h2>
                <ul className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
                  {categories.map((category) => (
                    <li
                      key={category}
                      className="font-space text-xs uppercase tracking-[0.12em] text-faint"
                    >
                      {category}
                    </li>
                  ))}
                </ul>
              </Reveal>
            )}

            {posts.length > 0 && (
              <section className="mt-20">
                <h2 className="eyebrow mb-8">Latest articles</h2>
                <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
                  {posts.map((post, i) => (
                    <PostCard key={post.slug} post={post} delay={(i % 3) * 110} />
                  ))}
                </div>
              </section>
            )}
          </>
        )}

        <Reveal className="mt-24 border-t pt-12" style={{ borderColor: "rgb(var(--line) / 0.1)" }}>
          <p className="max-w-prose text-fluid-base text-muted">
            Looking for someone to build or automate something similar?{" "}
            <Link href="/work" className="link-underline text-ink">
              See my work
            </Link>{" "}
            or{" "}
            <Link href="/#contact" className="link-underline text-ink">
              get in touch
            </Link>
            .
          </p>
        </Reveal>
      </div>
    </>
  );
}

export async function getStaticProps() {
  const { data: rows, ok } = await safeQuery(
    () =>
      prisma.post.findMany({
    where: { published: true },
    orderBy: [{ featured: "desc" }, { order: "asc" }, { publishedAt: "desc" }],
    select: {
      slug: true,
      title: true,
      excerpt: true,
      content: true,
      coverImage: true,
      coverAlt: true,
      category: true,
      publishedAt: true,
      featured: true,
    },
      }),
    []
  );

  const posts = rows.map(({ content, ...post }) => ({
    ...post,
    excerpt: post.excerpt || deriveExcerpt(content),
    readingTime: readingTime(content),
  }));

  const featured = posts.find((p) => p.featured) || null;
  const rest = featured ? posts.filter((p) => p.slug !== featured.slug) : posts;
  const categories = [...new Set(posts.map((p) => p.category).filter(Boolean))];

  return {
    props: {
      featured: serialize(featured),
      posts: serialize(rest),
      categories,
    },
    revalidate: revalidateFor(ok),
  };
}

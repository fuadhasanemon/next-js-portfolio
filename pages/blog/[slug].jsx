import Image from "next/image";
import Link from "next/link";

import PostCard, { formatDate } from "@/components/PostCard";
import Reveal from "@/components/Reveal";
import Seo from "@/components/Seo";
import { useRevealGroup } from "@/hooks/useReveal";
import { blogPostingSchema, breadcrumbSchema } from "@/lib/jsonld";
import { deriveExcerpt, extractToc, markdownToHtml } from "@/lib/markdown";
import { prisma, revalidateFor, safeQuery, serialize } from "@/lib/prisma";
import { absoluteUrl, readingTime, truncate } from "@/lib/site";

/**
 * One table of contents, rendered into the sidebar on large screens and into
 * a disclosure everywhere else. Only ever one of the two is displayed, so the
 * shared aria-label cannot collide.
 */
const TocList = ({ toc }) => (
  <ul
    className="space-y-2.5 border-l pl-4"
    style={{ borderColor: "rgb(var(--line) / 0.12)" }}
  >
    {toc.map((item) => (
      <li key={item.id} className={item.depth === 3 ? "pl-3" : ""}>
        <a
          href={`#${item.id}`}
          className="block py-1 text-sm leading-snug text-muted transition-colors duration-300 hover:text-accent"
        >
          {item.text}
        </a>
      </li>
    ))}
  </ul>
);

export default function Article({ post, html, toc, related, minutes }) {
  const revealRef = useRevealGroup();

  const url = post.canonicalUrl || absoluteUrl(`/blog/${post.slug}`);
  const description = truncate(post.seoDescription || post.excerpt);
  const image = post.ogImage || post.coverImage || undefined;
  const updated =
    post.updatedAt && post.publishedAt && post.updatedAt !== post.publishedAt
      ? post.updatedAt
      : null;

  // Below three headings a contents list is longer than what it indexes.
  const hasToc = toc.length > 2;

  return (
    <>
      <Seo
        title={post.seoTitle || post.title}
        description={description}
        path={`/blog/${post.slug}`}
        canonical={post.canonicalUrl || undefined}
        ogTitle={post.ogTitle || undefined}
        ogDescription={post.ogDescription || undefined}
        ogImage={image}
        ogType="article"
        noIndex={post.noIndex}
        publishedTime={post.publishedAt}
        modifiedTime={post.updatedAt}
        tags={post.tags}
        jsonLd={[
          blogPostingSchema(post, { url, description, image }),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Blog", path: "/blog" },
            { name: post.title, path: `/blog/${post.slug}` },
          ]),
        ]}
      />

      <div ref={revealRef} className="shell pb-28 pt-36 sm:pt-40">
        <Reveal as="nav" className="mb-10" aria-label="Breadcrumb">
          <Link
            href="/blog"
            className="font-space text-xs text-faint transition-colors duration-300 hover:text-ink"
          >
            ← Blog
          </Link>
        </Reveal>

        {/* Masthead, cover and body all carry .article-rail, so the piece keeps
            one left edge and one measure from the title to the last link. */}
        <article>
          <header className="article-rail">
            {post.category && (
              <Reveal as="p" className="eyebrow" style={{ color: "rgb(var(--accent))" }}>
                {post.category}
              </Reveal>
            )}

            <Reveal
              as="h1"
              delay={60}
              className="mt-5 text-fluid-title font-semibold text-ink"
            >
              {post.title}
            </Reveal>

            {post.excerpt && (
              <Reveal as="p" delay={120} className="mt-6 text-fluid-lead text-muted">
                {post.excerpt}
              </Reveal>
            )}

            {/* The masthead ends at this hairline; the credits sit below it. */}
            <Reveal delay={170} y={0} blur={0} className="rule mt-9" />

            <Reveal
              delay={210}
              y={12}
              className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 font-space text-xs text-faint"
            >
              <span className="text-muted">{post.author}</span>
              <span aria-hidden="true">·</span>
              {post.publishedAt && (
                <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
              )}
              <span aria-hidden="true">·</span>
              <span>{minutes} min read</span>
              {updated && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>Updated {formatDate(updated)}</span>
                </>
              )}
            </Reveal>
          </header>

          {post.coverImage && (
            <Reveal
              delay={250}
              className="article-rail relative mt-12 aspect-[16/9] overflow-hidden rounded-2xl border"
              style={{ borderColor: "rgb(var(--line) / 0.12)" }}
            >
              <Image
                fill
                priority
                src={post.coverImage}
                alt={post.coverAlt || ""}
                sizes="(max-width: 1024px) 100vw, 720px"
                className="object-cover"
              />
            </Reveal>
          )}

          <div className="article-grid mt-14">
            <div className="article-rail">
              {hasToc && (
                <details className="toc-inline mb-12 lg:hidden">
                  <summary>Contents</summary>
                  <nav aria-label="Table of contents" className="pb-5">
                    <TocList toc={toc} />
                  </nav>
                </details>
              )}

              {/* Reveal is intentionally absent on the body: long-form text
                  should never wait on an observer to become readable. */}
              <div className="prose" dangerouslySetInnerHTML={{ __html: html }} />

              {post.tags?.length > 0 && (
                <div
                  className="mt-14 border-t pt-8"
                  style={{ borderColor: "rgb(var(--line) / 0.1)" }}
                >
                  <h2 className="eyebrow">Tags</h2>
                  {/* Labels, not controls — nothing here filters, so nothing
                      here is dressed up as a button. */}
                  <ul className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
                    {post.tags.map((tag) => (
                      <li
                        key={tag}
                        className="font-space text-xs uppercase tracking-[0.12em] text-faint"
                      >
                        {tag}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div
                className="mt-12 border-t pt-8"
                style={{ borderColor: "rgb(var(--line) / 0.1)" }}
              >
                <h2 className="eyebrow">Written by</h2>
                <p className="mt-4 text-fluid-base text-muted">
                  <Link href="/about" className="link-underline text-ink">
                    {post.author}
                  </Link>
                  . I build full-stack products and AI automation.{" "}
                  <Link href="/work" className="link-underline text-ink">
                    See my work
                  </Link>{" "}
                  or{" "}
                  <a href="mailto:fuadhasanemon8@gmail.com" className="link-underline text-ink">
                    start a conversation
                  </a>
                  .
                </p>
              </div>
            </div>

            {hasToc && (
              <aside className="hidden lg:sticky lg:top-28 lg:block lg:self-start">
                <h2 className="eyebrow">On this page</h2>
                <nav aria-label="Table of contents" className="mt-4">
                  <TocList toc={toc} />
                </nav>
              </aside>
            )}
          </div>
        </article>

        {related.length > 0 && (
          <section className="mt-24 border-t pt-12" style={{ borderColor: "rgb(var(--line) / 0.1)" }}>
            <h2 className="text-fluid-h3 font-semibold text-ink">Related articles</h2>
            <div className="mt-8 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item, i) => (
                <PostCard key={item.slug} post={item} delay={i * 110} />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}

export async function getStaticPaths() {
  const { data: posts } = await safeQuery(
    () =>
      prisma.post.findMany({
        where: { published: true },
        select: { slug: true },
      }),
    []
  );

  return {
    paths: posts.map((p) => ({ params: { slug: p.slug } })),
    fallback: "blocking",
  };
}

export async function getStaticProps({ params }) {
  const { data: post } = await safeQuery(
    () => prisma.post.findUnique({ where: { slug: params.slug } }),
    null
  );

  // Drafts 404 publicly. A failed lookup also 404s rather than throwing a 500,
  // which is what a crawler would otherwise see during a database blip.
  if (!post || !post.published) return { notFound: true, revalidate: 60 };

  const html = await markdownToHtml(post.content);
  const toc = extractToc(post.content);
  const excerpt = post.excerpt || deriveExcerpt(post.content);

  const { data: relatedRows, ok } = await safeQuery(
    () =>
      prisma.post.findMany({
    where: {
      published: true,
      slug: { not: post.slug },
      ...(post.category || post.tags.length
        ? {
            OR: [
              post.category ? { category: post.category } : undefined,
              post.tags.length ? { tags: { hasSome: post.tags } } : undefined,
            ].filter(Boolean),
          }
        : {}),
    },
    orderBy: { publishedAt: "desc" },
    take: 3,
    select: {
      slug: true,
      title: true,
      excerpt: true,
      content: true,
      coverImage: true,
      coverAlt: true,
      category: true,
      publishedAt: true,
    },
      }),
    []
  );

  const related = relatedRows.map(({ content, ...item }) => ({
    ...item,
    excerpt: item.excerpt || deriveExcerpt(content),
    readingTime: readingTime(content),
  }));

  return {
    props: {
      post: serialize({ ...post, excerpt }),
      html,
      toc,
      minutes: readingTime(post.content),
      related: serialize(related),
    },
    revalidate: revalidateFor(ok),
  };
}

import { useRef, useState } from "react";
import Image from "next/image";
import { HiHeart, HiOutlineHeart } from "react-icons/hi";
import Link from "next/link";

import NewsletterSignup from "@/components/NewsletterSignup";
import PostCard, { formatDate } from "@/components/PostCard";
import ReadingProgress from "@/components/ReadingProgress";
import Reveal from "@/components/Reveal";
import Seo from "@/components/Seo";
import ShareButtons from "@/components/ShareButtons";
import useActiveHeading from "@/hooks/useActiveHeading";
import usePostStats from "@/hooks/usePostStats";
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
const TocList = ({ toc, activeId }) => (
  <ul
    className="space-y-2.5 border-l pl-4"
    style={{ borderColor: "rgb(var(--line) / 0.12)" }}
  >
    {toc.map((item) => {
      const active = item.id === activeId;
      return (
        <li
          key={item.id}
          className={`relative ${item.depth === 3 ? "pl-3" : ""}`}
        >
          {/* Sits over the list's own hairline, so the marker slides along
              the rule rather than floating beside it. */}
          <span
            aria-hidden="true"
            className={`absolute -left-[17px] top-1 bottom-1 w-px bg-accent transition-opacity duration-300 ${
              active ? "opacity-100" : "opacity-0"
            }`}
          />
          <a
            href={`#${item.id}`}
            aria-current={active ? "location" : undefined}
            className={`block py-1 text-sm leading-snug transition-colors duration-300 hover:text-accent ${
              active ? "text-ink" : "text-muted"
            }`}
          >
            {item.text}
          </a>
        </li>
      );
    })}
  </ul>
);

/**
 * Older/newer neighbours by publish date. Either side can be missing at the
 * ends of the archive, so each keeps its own column and alignment.
 */
const PostNav = ({ previous, next }) => (
  <nav
    aria-label="More articles"
    className="article-rail mt-16 grid gap-6 border-t pt-8 sm:grid-cols-2"
    style={{ borderColor: "rgb(var(--line) / 0.1)" }}
  >
    {previous && (
      <Link href={`/blog/${previous.slug}`} className="group block">
        <span className="eyebrow">← Previous</span>
        <span className="mt-3 block text-fluid-base font-semibold leading-snug text-ink transition-colors duration-300 group-hover:text-accent">
          {previous.title}
        </span>
      </Link>
    )}
    {next && (
      <Link
        href={`/blog/${next.slug}`}
        className="group block sm:col-start-2 sm:text-right"
      >
        <span className="eyebrow">Next →</span>
        <span className="mt-3 block text-fluid-base font-semibold leading-snug text-ink transition-colors duration-300 group-hover:text-accent">
          {next.title}
        </span>
      </Link>
    )}
  </nav>
);

function Article({ post, html, toc, related, previous, next, minutes }) {
  const revealRef = useRevealGroup();
  const articleRef = useRef(null);
  const { stats, liked, toggleLike } = usePostStats(post.slug);

  const url = post.canonicalUrl || absoluteUrl(`/blog/${post.slug}`);
  const description = truncate(post.seoDescription || post.excerpt);
  const image = post.ogImage || post.coverImage || undefined;
  const updated =
    post.updatedAt && post.publishedAt && post.updatedAt !== post.publishedAt
      ? post.updatedAt
      : null;

  // Below three headings a contents list is longer than what it indexes.
  const hasToc = toc.length > 2;
  const activeId = useActiveHeading(hasToc ? toc.map((item) => item.id) : []);

  // Code-block copy buttons are baked into the HTML at build time (see
  // lib/markdown.js); one delegated listener here serves all of them.
  const [copyStatus, setCopyStatus] = useState("");
  const copyTimers = useRef(new WeakMap());
  const onProseClick = async (event) => {
    const button = event.target.closest("[data-copy-code]");
    if (!button) return;
    const code = button.parentElement.querySelector("pre")?.textContent ?? "";
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      return; // Clipboard blocked (insecure context, permissions).
    }
    button.textContent = "Copied";
    button.dataset.copied = "";
    setCopyStatus("Code copied to clipboard");
    clearTimeout(copyTimers.current.get(button));
    copyTimers.current.set(
      button,
      setTimeout(() => {
        button.textContent = "Copy";
        delete button.dataset.copied;
        setCopyStatus("");
      }, 2000)
    );
  };

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

      <ReadingProgress targetRef={articleRef} />

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
        <article ref={articleRef}>
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
              {/* Arrives after hydration; it sits last so nothing shifts. */}
              {stats && stats.views > 0 && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>
                    {stats.views.toLocaleString("en-US")}{" "}
                    {stats.views === 1 ? "view" : "views"}
                  </span>
                </>
              )}
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
                    <TocList toc={toc} activeId={activeId} />
                  </nav>
                </details>
              )}

              {/* Reveal is intentionally absent on the body: long-form text
                  should never wait on an observer to become readable. */}
              <div
                className="prose"
                onClick={onProseClick}
                dangerouslySetInnerHTML={{ __html: html }}
              />
              <span role="status" aria-live="polite" className="sr-only">
                {copyStatus}
              </span>

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
                <h2 className="eyebrow">Enjoyed it? Like or share</h2>
                <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-3">
                  <button
                    type="button"
                    onClick={toggleLike}
                    aria-pressed={liked}
                    // The label replaces the button's text for screen readers,
                    // so the count has to be spoken as part of it.
                    aria-label={`${liked ? "Unlike" : "Like"} this article${
                      stats ? `, ${stats.likes} ${stats.likes === 1 ? "like" : "likes"}` : ""
                    }`}
                    className="group inline-flex h-10 items-center gap-2 rounded-full border px-4 transition-colors duration-300 hover:border-accent"
                    style={{
                      borderColor: liked
                        ? "rgb(var(--accent) / 0.6)"
                        : "rgb(var(--line) / 0.14)",
                    }}
                  >
                    {liked ? (
                      <HiHeart className="h-4 w-4 text-accent" />
                    ) : (
                      <HiOutlineHeart className="h-4 w-4 text-muted transition-colors duration-300 group-hover:text-accent" />
                    )}
                    <span className="font-space text-xs text-muted">
                      {stats ? stats.likes.toLocaleString("en-US") : "Like"}
                    </span>
                  </button>
                  <ShareButtons url={url} title={post.title} />
                </div>
              </div>

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
                  <Link href="/#contact" className="link-underline text-ink">
                    start a conversation
                  </Link>
                  .
                </p>
              </div>
            </div>

            {hasToc && (
              <aside className="hidden lg:sticky lg:top-28 lg:block lg:self-start">
                <h2 className="eyebrow">On this page</h2>
                <nav aria-label="Table of contents" className="mt-4">
                  <TocList toc={toc} activeId={activeId} />
                </nav>
              </aside>
            )}
          </div>
        </article>

        {(previous || next) && <PostNav previous={previous} next={next} />}

        <NewsletterSignup source={post.slug} />

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

/**
 * Next reuses this component when moving between two articles (related,
 * previous/next links), so without a key the reveal observer, scroll hooks
 * and like state would all carry over from the last post — and cards new to
 * this one would never be revealed. Keying by slug gives each article a
 * fresh mount.
 */
export default function ArticlePage(props) {
  return <Article key={props.post.slug} {...props} />;
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

  // Neighbours by publish date, for the previous/next links. Only the two
  // fields the links render are fetched.
  const neighbour = (direction) =>
    safeQuery(
      () =>
        prisma.post.findFirst({
          where: {
            published: true,
            slug: { not: post.slug },
            publishedAt: { [direction === "older" ? "lt" : "gt"]: post.publishedAt },
          },
          orderBy: { publishedAt: direction === "older" ? "desc" : "asc" },
          select: { slug: true, title: true },
        }),
      null
    );
  const [{ data: previous }, { data: next }] = post.publishedAt
    ? await Promise.all([neighbour("older"), neighbour("newer")])
    : [{ data: null }, { data: null }];

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
      previous,
      next,
    },
    revalidate: revalidateFor(ok),
  };
}

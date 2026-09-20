import Image from "next/image";
import Link from "next/link";

import Reveal from "@/components/Reveal";

export const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "";

export const PostMeta = ({ post, className = "" }) => (
  <p className={`flex flex-wrap items-center gap-x-2 gap-y-1 font-space text-[0.7rem] text-faint ${className}`}>
    {post.category && (
      <>
        <span style={{ color: "rgb(var(--accent))" }}>{post.category}</span>
        <span aria-hidden="true">·</span>
      </>
    )}
    {post.publishedAt && (
      <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
    )}
    {post.readingTime && (
      <>
        <span aria-hidden="true">·</span>
        <span>{post.readingTime} min read</span>
      </>
    )}
  </p>
);

const PostCard = ({ post, delay = 0, featured = false }) => (
  <Reveal as="article" delay={delay} y={26} className="group">
    <Link href={`/blog/${post.slug}`} className={featured ? "grid gap-8 lg:grid-cols-2 lg:items-center" : "block"}>
      {post.coverImage && (
        <div
          className={`relative overflow-hidden rounded-xl border ${
            featured ? "aspect-[16/10]" : "aspect-[16/9]"
          }`}
          style={{ borderColor: "rgb(var(--line) / 0.12)" }}
        >
          <Image
            fill
            src={post.coverImage}
            alt={post.coverAlt || ""}
            sizes={featured ? "(max-width: 1024px) 100vw, 50vw" : "(max-width: 640px) 100vw, 33vw"}
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03] motion-reduce:transition-none"
          />
        </div>
      )}

      <div className={post.coverImage && !featured ? "mt-4" : featured ? "" : ""}>
        <PostMeta post={post} />

        <h3
          className={`mt-2 font-semibold text-ink transition-colors duration-300 group-hover:text-accent ${
            featured ? "text-fluid-h2" : "text-fluid-h3"
          }`}
        >
          {post.title}
        </h3>

        {post.excerpt && (
          <p className={`mt-3 text-muted ${featured ? "text-fluid-base" : "text-sm leading-relaxed"}`}>
            {post.excerpt}
          </p>
        )}

        {featured && (
          <span className="btn-ghost mt-7">Read article</span>
        )}
      </div>
    </Link>
  </Reveal>
);

export default PostCard;

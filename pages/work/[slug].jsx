import Link from "next/link";
import { BsArrowUpRight } from "react-icons/bs";

import Reveal from "@/components/Reveal";
import ScreenshotPreview from "@/components/ScreenshotPreview";
import Seo from "@/components/Seo";
import { useRevealGroup } from "@/hooks/useReveal";
import { breadcrumbSchema, projectSchema } from "@/lib/jsonld";
import { markdownToHtml } from "@/lib/markdown";
import { prisma, revalidateFor, safeQuery, serialize } from "@/lib/prisma";
import { absoluteUrl, truncate } from "@/lib/site";

export default function ProjectPage({ project, html, relatedPosts }) {
  const revealRef = useRevealGroup();

  const url = project.canonicalUrl || absoluteUrl(`/work/${project.slug}`);
  const description = truncate(
    project.seoDescription || project.shortDescription || project.description
  );
  const image = project.ogImage || project.coverImage || undefined;

  return (
    <>
      <Seo
        title={project.seoTitle || project.title}
        description={description}
        path={`/work/${project.slug}`}
        canonical={project.canonicalUrl || undefined}
        ogImage={image}
        noIndex={project.noIndex}
        jsonLd={[
          projectSchema(project, { url, description, image }),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Work", path: "/work" },
            { name: project.title, path: `/work/${project.slug}` },
          ]),
        ]}
      />

      <article ref={revealRef} className="shell pb-28 pt-36 sm:pt-40">
        <Reveal as="nav" className="mb-8" aria-label="Breadcrumb">
          <Link href="/work" className="font-space text-xs text-faint hover:text-ink">
            ← Work
          </Link>
        </Reveal>

        <header className="max-w-prose">
          {project.role && <Reveal as="p" className="eyebrow">{project.role}</Reveal>}

          <Reveal as="h1" delay={60} className="mt-4 text-fluid-h1 font-semibold text-ink">
            {project.title}
          </Reveal>

          {project.shortDescription && (
            <Reveal as="p" delay={120} className="mt-6 text-fluid-lead text-muted">
              {project.shortDescription}
            </Reveal>
          )}

          <Reveal delay={180} className="mt-8 flex flex-wrap gap-3">
            {project.liveUrl && (
              <a href={project.liveUrl} target="_blank" rel="noreferrer" className="btn-primary">
                Visit site
                <BsArrowUpRight className="h-3.5 w-3.5" />
              </a>
            )}
            {project.githubUrl && (
              <a href={project.githubUrl} target="_blank" rel="noreferrer" className="btn-ghost">
                Source
                <BsArrowUpRight className="h-3 w-3" />
              </a>
            )}
          </Reveal>
        </header>

        {project.coverImage && (
          <Reveal delay={120} className="mt-14">
            <ScreenshotPreview
              src={project.coverImage}
              alt={project.coverAlt || `${project.title} — full page screenshot`}
              liveUrl={project.liveUrl}
            />
          </Reveal>
        )}

        {project.technologies?.length > 0 && (
          <Reveal className="mt-14">
            <h2 className="eyebrow">Built with</h2>
            <ul className="mt-4 flex flex-wrap gap-2">
              {project.technologies.map((tech) => (
                <li
                  key={tech}
                  className="rounded-full border px-3 py-1 text-sm text-muted"
                  style={{ borderColor: "rgb(var(--line) / 0.14)" }}
                >
                  {tech}
                </li>
              ))}
            </ul>
          </Reveal>
        )}

        {html && (
          <Reveal
            className="prose mt-14"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        )}

        {relatedPosts.length > 0 && (
          <Reveal className="mt-20 border-t pt-12" style={{ borderColor: "rgb(var(--line) / 0.1)" }}>
            <h2 className="text-fluid-h3 font-semibold text-ink">Related reading</h2>
            <ul className="mt-6 space-y-3">
              {relatedPosts.map((post) => (
                <li key={post.slug}>
                  <Link href={`/blog/${post.slug}`} className="link-underline text-fluid-base text-muted">
                    {post.title}
                  </Link>
                </li>
              ))}
            </ul>
          </Reveal>
        )}

        <Reveal className="mt-20 flex flex-wrap gap-3">
          <Link href="/work" className="btn-ghost">
            All work
          </Link>
          <Link href="/#content" className="btn-primary">
            Work with me
          </Link>
        </Reveal>
      </article>
    </>
  );
}

export async function getStaticPaths() {
  const { data: projects } = await safeQuery(
    () =>
      prisma.project.findMany({
        where: { published: true },
        select: { slug: true },
      }),
    []
  );

  return {
    paths: projects.map((p) => ({ params: { slug: p.slug } })),
    fallback: "blocking",
  };
}

export async function getStaticProps({ params }) {
  const { data: project } = await safeQuery(
    () => prisma.project.findUnique({ where: { slug: params.slug } }),
    null
  );

  // Drafts 404 publicly, exactly like a project that does not exist. A failed
  // lookup also 404s rather than surfacing a 500 to crawlers.
  if (!project || !project.published) return { notFound: true, revalidate: 60 };

  const html = project.description ? await markdownToHtml(project.description) : "";

  // Surface articles that share a technology with this project.
  const { data: relatedPosts, ok } = project.technologies?.length
    ? await safeQuery(
        () =>
          prisma.post.findMany({
        where: {
          published: true,
          OR: [
            { tags: { hasSome: project.technologies } },
            { category: { in: project.technologies } },
          ],
        },
        orderBy: { publishedAt: "desc" },
        take: 3,
            select: { slug: true, title: true },
          }),
        []
      )
    : { data: [], ok: true };

  return {
    props: {
      project: serialize(project),
      html,
      relatedPosts: serialize(relatedPosts),
    },
    revalidate: revalidateFor(ok),
  };
}

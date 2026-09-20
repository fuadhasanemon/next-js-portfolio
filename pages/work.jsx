import Link from "next/link";

import ProjectCard from "@/components/ProjectCard";
import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";
import Seo from "@/components/Seo";
import { useRevealGroup } from "@/hooks/useReveal";
import { breadcrumbSchema, collectionSchema } from "@/lib/jsonld";
import { prisma, revalidateFor, safeQuery, serialize } from "@/lib/prisma";

const DESCRIPTION =
  "Selected web projects by Fuad Hasan Emon — full-stack React and Next.js builds, AI automation and interactive web experiences for fintech, real estate, agency and product teams.";

export default function Work({ projects, recentPosts }) {
  const revealRef = useRevealGroup();

  return (
    <>
      <Seo
        title="Work"
        description={DESCRIPTION}
        path="/work"
        jsonLd={[
          collectionSchema({
            name: "Work",
            description: DESCRIPTION,
            path: "/work",
            items: projects.map((p) => ({
              name: p.title,
              path: `/work/${p.slug}`,
            })),
          }),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Work", path: "/work" },
          ]),
        ]}
      />

      <div ref={revealRef} className="shell pb-28 pt-36 sm:pt-40">
        <SectionHeading
          as="h1"
          eyebrow="Selected work"
          title="Things I've built"
          lead="A cross-section of client and product work — fintech, real estate, agencies and internal tools. Each one shipped, each one with its own constraints."
        />

        <div className="mt-20">
          <ProjectCard projects={projects} />
        </div>

        {recentPosts.length > 0 && (
          <Reveal className="mt-24 border-t pt-12" style={{ borderColor: "rgb(var(--line) / 0.1)" }}>
            <h2 className="eyebrow">Writing</h2>
            <p className="mt-4 max-w-prose text-fluid-base text-muted">
              I write about how these are built — architecture decisions, tooling
              and the automation behind them.
            </p>
            <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-3">
              {recentPosts.map((post) => (
                <li key={post.slug}>
                  <Link href={`/blog/${post.slug}`} className="link-underline text-sm text-ink">
                    {post.title}
                  </Link>
                </li>
              ))}
            </ul>
            <Link href="/blog" className="btn-ghost mt-8">
              Read the blog
            </Link>
          </Reveal>
        )}
      </div>
    </>
  );
}

export async function getStaticProps() {
  const { data, ok } = await safeQuery(
    () =>
      Promise.all([
    prisma.project.findMany({
      where: { published: true },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      select: {
        id: true,
        title: true,
        slug: true,
        shortDescription: true,
        coverImage: true,
        coverAlt: true,
        technologies: true,
      },
    }),
    prisma.post.findMany({
      where: { published: true },
      orderBy: { publishedAt: "desc" },
      take: 3,
      select: { slug: true, title: true },
    }),
      ]),
    [[], []]
  );

  const [projects, recentPosts] = data;

  return {
    props: { projects: serialize(projects), recentPosts: serialize(recentPosts) },
    revalidate: revalidateFor(ok),
  };
}

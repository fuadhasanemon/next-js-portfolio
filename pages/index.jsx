import Link from "next/link";

import Contact from "@/components/Contact";
import Experience from "@/components/Experience";
import Hero from "@/components/Hero";
import PostCard from "@/components/PostCard";
import ProjectCard from "@/components/ProjectCard";
import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";
import Seo from "@/components/Seo";
import { useRevealGroup } from "@/hooks/useReveal";
import { personSchema, websiteSchema } from "@/lib/jsonld";
import { deriveExcerpt } from "@/lib/markdown";
import { prisma, revalidateFor, safeQuery, serialize } from "@/lib/prisma";
import { SITE, readingTime } from "@/lib/site";

const PROJECT_FIELDS = {
  id: true,
  title: true,
  slug: true,
  shortDescription: true,
  coverImage: true,
  coverAlt: true,
  technologies: true,
};

/** Tenure since July 2020, computed at render so it never goes stale. */
function tenure() {
  const today = new Date();
  const start = new Date(2020, 6);
  let years = today.getFullYear() - start.getFullYear();
  let months = today.getMonth() - start.getMonth();
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  return { years, months: months + 1 };
}

export default function Home({ featuredProjects, latestPosts }) {
  const { years, months } = tenure();
  const revealRef = useRevealGroup();

  return (
    <>
      <Seo
        description={SITE.description}
        path="/"
        jsonLd={[personSchema(), websiteSchema()]}
      />

      <div ref={revealRef}>
        <Hero years={years} months={months} />

        <Experience years={years} months={months} />

        {featuredProjects.length > 0 && (
          <section className="shell py-24 sm:py-28">
            <SectionHeading
              eyebrow="Featured work"
              title="Recent projects"
              lead="A few builds worth a closer look."
            />
            <div className="mt-16">
              <ProjectCard projects={featuredProjects} />
            </div>
            <Reveal className="mt-14 text-center">
              <Link href="/work" className="btn-ghost">
                All projects
              </Link>
            </Reveal>
          </section>
        )}

        {latestPosts.length > 0 && (
          <section className="shell py-24 sm:py-28">
            <SectionHeading
              eyebrow="Writing"
              title="Things I'm building and learning"
              lead="Notes on AI agents, automation and modern web engineering."
            />
            <div className="mt-16 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {latestPosts.map((post, i) => (
                <PostCard key={post.slug} post={post} delay={(i % 3) * 110} />
              ))}
            </div>
            <Reveal className="mt-14 text-center">
              <Link href="/blog" className="btn-ghost">
                Read the blog
              </Link>
            </Reveal>
          </section>
        )}

        <section id="contact" className="shell pb-28 pt-8 sm:pb-36">
          <Contact />
        </section>
      </div>
    </>
  );
}

export async function getStaticProps() {
  const { data, ok } = await safeQuery(
    () =>
      Promise.all([
    prisma.project.findMany({
      where: { published: true, featured: true },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      take: 3,
      select: PROJECT_FIELDS,
    }),
    prisma.project.findMany({
      where: { published: true },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      take: 3,
      select: PROJECT_FIELDS,
    }),
    prisma.post.findMany({
      where: { published: true },
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
      ]),
    [[], [], []]
  );

  const [featured, fallback, postRows] = data;

  // Nothing flagged as featured yet? Show the top of the manual ordering.
  const featuredProjects = featured.length > 0 ? featured : fallback;

  const latestPosts = postRows.map(({ content, ...post }) => ({
    ...post,
    excerpt: post.excerpt || deriveExcerpt(content),
    readingTime: readingTime(content),
  }));

  return {
    props: {
      featuredProjects: serialize(featuredProjects),
      latestPosts: serialize(latestPosts),
    },
    revalidate: revalidateFor(ok),
  };
}

import Link from "next/link";
import { BsArrowUpRight } from "react-icons/bs";

import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";

const DISCIPLINES = [
  {
    index: "01",
    title: "Development",
    accent: "rgb(var(--glow-b))",
    body: "React and Next.js at the centre, TypeScript throughout. I build interfaces that stay quick on real devices — considered state, sensible bundles, and rendering that holds up under load.",
    tags: ["React", "Next.js", "TypeScript", "Node.js"],
  },
  {
    index: "02",
    title: "Design",
    accent: "rgb(var(--glow-c))",
    body: "Type, spacing and motion treated as engineering concerns. Design systems that stay consistent as a product grows, rather than a set of one-off screens.",
    tags: ["Design systems", "Motion", "Tailwind", "Figma"],
  },
  {
    index: "03",
    title: "Delivery",
    accent: "rgb(var(--glow-a))",
    body: "Comfortable owning a feature end to end — API surface, data layer, deployment and the measurement that tells you whether any of it worked.",
    tags: ["GraphQL", "PostgreSQL", "AWS", "CI/CD"],
  },
];

const Experience = ({ years, months }) => (
  <section className="shell py-24 sm:py-32">
    <SectionHeading
      eyebrow="What I do"
      title="Three disciplines, one craft"
      lead={`${years}.${months} years of frontend-led engineering — strong problem solving, quick adaptation to new tools, and a bias toward interfaces that feel considered.`}
    />

    <div className="mt-16 grid gap-px overflow-hidden rounded-2xl border sm:mt-20 lg:grid-cols-3"
      style={{
        borderColor: "rgb(var(--line) / 0.12)",
        background: "rgb(var(--line) / 0.08)",
      }}
    >
      {DISCIPLINES.map((item, i) => (
        <Reveal
          key={item.title}
          delay={i * 120}
          y={26}
          className="group relative flex flex-col gap-5 bg-bg p-7 transition-colors duration-500 hover:bg-surface sm:p-9"
        >
          <span
            aria-hidden="true"
            className="absolute inset-x-0 top-0 h-px scale-x-0 transition-transform duration-700 ease-out group-hover:scale-x-100"
            style={{ background: item.accent, transformOrigin: "left" }}
          />

          <div className="flex items-baseline justify-between">
            <span className="font-space text-eyebrow text-faint">
              {item.index}
            </span>
            <span
              aria-hidden="true"
              className="h-2 w-2 rounded-full opacity-60 transition-opacity duration-500 group-hover:opacity-100"
              style={{ background: item.accent }}
            />
          </div>

          <h3 className="text-fluid-h3 font-semibold text-ink">{item.title}</h3>

          <p className="text-fluid-sm text-muted">{item.body}</p>

          <ul className="mt-auto flex flex-wrap gap-2 pt-2">
            {item.tags.map((tag) => (
              <li
                key={tag}
                className="rounded-full border px-2.5 py-1 text-[0.7rem] text-faint"
                style={{ borderColor: "rgb(var(--line) / 0.14)" }}
              >
                {tag}
              </li>
            ))}
          </ul>
        </Reveal>
      ))}
    </div>

    <Reveal
      delay={120}
      className="mt-16 flex flex-col items-center gap-6 text-center sm:mt-20"
    >
      <p className="max-w-prose text-fluid-base text-muted">
        That&apos;s the short version. The longer one lives in the work — have a
        look at a few things I&apos;ve built.
      </p>
      <Link href="/work" className="btn-primary">
        Selected work
        <BsArrowUpRight className="h-3.5 w-3.5" />
      </Link>
    </Reveal>
  </section>
);

export default Experience;

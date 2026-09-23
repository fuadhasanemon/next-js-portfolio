import Image from "next/image";
import Link from "next/link";

import Reveal from "@/components/Reveal";
import Seo from "@/components/Seo";
import SectionHeading from "@/components/SectionHeading";
import { useRevealGroup } from "@/hooks/useReveal";
import { personSchema } from "@/lib/jsonld";

import Flash from "@/public/Flash.svg";
import Portrait from "@/public/fuadhasanemon.png";
import Rocket from "@/public/Rocket.svg";
import Sparkles from "@/public/Sparkles.svg";

const INTERESTS = ["Develop", "Design", "Anime", "Psychology"];

const CONTACTS = [
  {
    label: "Email",
    value: "fuadhasanemon8@gmail.com",
    href: "mailto:fuadhasanemon8@gmail.com",
  },
  {
    label: "LinkedIn",
    value: "Fuad Hasan Emon",
    href: "https://www.linkedin.com/in/fuadhasanemon/",
  },
  {
    label: "Instagram",
    value: "@emonfuad",
    href: "https://www.instagram.com/emonfuad/",
  },
];

const Marker = ({ src }) => (
  <span className="mx-1 inline-flex translate-y-0.5 items-baseline">
    <Image src={src} alt="" aria-hidden="true" className="h-5 w-5 self-center" />
  </span>
);

export default function About() {
  const revealRef = useRevealGroup();

  return (
    <>
      <Seo
        title="About"
        description="About Fuad Hasan Emon - a software engineer focused on elegant, efficient and robust user interfaces, full-stack React/Next.js products and AI automation."
        path="/about"
        jsonLd={personSchema()}
      />

      <div ref={revealRef} className="shell pb-28 pt-36 sm:pt-40">
        <SectionHeading
          as="h1"
          eyebrow="About"
          title="A little about me"
          lead="Not a widely recognised figure — but not hard to find either."
        />

        <Reveal delay={80} className="mt-16 flex flex-col items-center">
          <div className="relative">
            <span
              aria-hidden="true"
              className="absolute -inset-3 rounded-full opacity-40 blur-2xl"
              style={{
                background:
                  "conic-gradient(from 180deg, rgb(var(--glow-b)), rgb(var(--glow-a)), rgb(var(--glow-c)), rgb(var(--glow-b)))",
              }}
            />
            <Image
              src={Portrait}
              width={640}
              height={640}
              priority
              alt="Fuad Hasan Emon"
              className="relative h-36 w-36 select-none rounded-full object-cover sm:h-44 sm:w-44"
            />
          </div>

          <ul className="mt-8 flex flex-wrap justify-center gap-2">
            {INTERESTS.map((item) => (
              <li
                key={item}
                className="rounded-full border px-3 py-1 text-sm text-muted"
                style={{ borderColor: "rgb(var(--line) / 0.14)" }}
              >
                {item}
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal
          delay={140}
          className="mx-auto mt-16 max-w-prose space-y-6 text-fluid-base text-muted"
        >
          <p>
            A wizard who loves design and code.
            <Marker src={Rocket} />I develop modern, reactive and user-friendly
            web applications with the current generation of tooling.
          </p>
          <p>
            I believe a perfect blend of UI architecture is one where the goals
            and the needs are accounted for in an elegant, efficient and robust
            design of the user interface.
            <Marker src={Sparkles} />
          </p>
          <p>
            Experienced in React.js, Next.js and state management with Redux and
            Zustand, alongside JavaScript, TypeScript, Tailwind CSS and SASS.
            Comfortable with large-scale web applications, cross-browser
            constraints and building genuinely responsive interfaces.
            <Marker src={Flash} />
          </p>
        </Reveal>

        <Reveal delay={200} className="mx-auto mt-20 max-w-prose">
          <p className="eyebrow">Contact</p>
          <p className="mt-4 text-fluid-base text-muted">
            The quickest way to reach me is the form — it tells me what you need
            up front.
          </p>
          <Link href="/#contact" className="btn-primary mt-6">
            Start a project
          </Link>
          <ul
            className="mt-8 divide-y"
            style={{ borderColor: "rgb(var(--line) / 0.1)" }}
          >
            {CONTACTS.map((item) => (
              <li key={item.label} style={{ borderColor: "rgb(var(--line) / 0.1)" }}>
                <a
                  href={item.href}
                  target={item.href.startsWith("mailto:") ? undefined : "_blank"}
                  rel="noreferrer"
                  className="group flex items-baseline justify-between gap-4 py-3.5"
                >
                  <span className="text-sm text-faint">{item.label}</span>
                  <span className="link-underline truncate text-sm text-ink">
                    {item.value}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={260} className="mt-20 text-center">
          <p className="font-app text-xl tracking-wider text-faint sm:text-2xl">
            dattebayo
          </p>
        </Reveal>
      </div>
    </>
  );
}

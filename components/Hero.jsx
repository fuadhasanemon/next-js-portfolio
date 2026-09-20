import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "next-themes";

import { BsArrowUpRight } from "react-icons/bs";

import Avatar_Black from "@/public/Avatar-black.svg";
import Avatar_White from "@/public/Avatar-white.svg";

// WebGL never runs on the server, and it must not block first paint either.
const HeroField = dynamic(() => import("@/components/three/HeroField"), {
  ssr: false,
});

const Hero = ({ years, months }) => {
  const stats = [
    { value: `${years}+`, label: "Years shipping" },
    { value: "25+", label: "Projects delivered" },
    { value: "3", label: "Product teams" },
  ];

  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <section className="relative isolate flex min-h-[100svh] items-center overflow-hidden pt-28 pb-20 sm:pt-32 lg:pt-24">
      {/* Aurora — also the fallback when WebGL is unavailable. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-20 overflow-hidden"
      >
        <div className="absolute left-1/2 top-[-18%] h-[46rem] w-[46rem] -translate-x-1/2 rounded-full opacity-[0.22] blur-[120px] dark:opacity-[0.3]"
          style={{
            background:
              "radial-gradient(circle at 30% 30%, rgb(var(--glow-b)), transparent 60%), radial-gradient(circle at 70% 60%, rgb(var(--glow-a)), transparent 60%)",
          }}
        />
        <div className="absolute bottom-[-10%] right-[-10%] h-[28rem] w-[28rem] rounded-full opacity-[0.16] blur-[110px] dark:opacity-[0.22]"
          style={{
            background:
              "radial-gradient(circle, rgb(var(--glow-c)), transparent 65%)",
          }}
        />
      </div>

      <HeroField className="pointer-events-none absolute inset-0 -z-10 h-full w-full" />

      <div className="shell relative">
        <div className="grid items-center gap-14 lg:grid-cols-[minmax(0,1fr)_auto]">
          <div className="max-w-3xl">
            <div
              className="reveal inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs text-muted"
              style={{ borderColor: "rgb(var(--line) / 0.15)" }}
            >
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
              </span>
              Available for new work
            </div>

            <h1 className="reveal mt-7 text-fluid-h1 font-semibold text-ink" style={{ "--reveal-delay": "80ms" }}>
              Interfaces built
              <br />
              with <span className="gradient-text animate-shimmer">intent</span>.
            </h1>

            <p
              className="reveal mt-7 max-w-prose text-fluid-lead text-muted"
              style={{ "--reveal-delay": "180ms" }}
            >
              I&apos;m Fuad — a software engineer who designs and builds modern,
              reactive web applications. Careful typography, honest motion, and
              interfaces that stay fast under real conditions.
            </p>

            <div
              className="reveal mt-9 flex flex-wrap items-center gap-3"
              style={{ "--reveal-delay": "260ms" }}
            >
              <Link href="/work" className="btn-primary">
                View selected work
                <BsArrowUpRight className="h-3.5 w-3.5" />
              </Link>
              <Link href="/about" className="btn-ghost">
                About me
              </Link>
            </div>

            <dl
              className="reveal mt-12 grid max-w-lg grid-cols-3 gap-6 border-t pt-7"
              style={{
                "--reveal-delay": "340ms",
                borderColor: "rgb(var(--line) / 0.12)",
              }}
            >
              {stats.map((stat) => (
                <div key={stat.label}>
                  <dt className="sr-only">{stat.label}</dt>
                  <dd className="text-fluid-h3 font-semibold text-ink">
                    {stat.value}
                  </dd>
                  <p className="mt-1 text-xs leading-snug text-faint">
                    {stat.label}
                  </p>
                </div>
              ))}
            </dl>
          </div>

          {/* Identity card — the human anchor next to the abstract field. */}
          <div
            className="reveal card w-full max-w-xs p-6 lg:w-72"
            style={{ "--reveal-delay": "420ms", "--reveal-y": "34px" }}
          >
            <div className="flex items-center gap-4">
              <div className="animate-floatY">
                {mounted && (
                  <Image
                    src={resolvedTheme === "dark" ? Avatar_White : Avatar_Black}
                    alt=""
                    width={56}
                    height={56}
                    priority
                  />
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate font-medium text-ink">Fuad Hasan Emon</p>
                <Link
                  href="https://www.linkedin.com/in/fuadhasanemon/"
                  target="_blank"
                  rel="noreferrer"
                  className="link-underline inline-flex items-center gap-1 text-sm text-faint"
                >
                  @fuadhasanemon
                  <BsArrowUpRight className="h-3 w-3" />
                </Link>
              </div>
            </div>

            <div
              className="mt-5 border-t pt-5 text-sm"
              style={{ borderColor: "rgb(var(--line) / 0.12)" }}
            >
              <p className="eyebrow">Currently</p>
              <p className="mt-2 leading-relaxed text-muted">
                Software Engineer at{" "}
                <span className="text-ink">Silicon Orchard Ltd.</span>
              </p>
              <p className="mt-3 text-xs text-faint">
                {years}.{months} years of professional experience
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll hint */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-3 sm:flex"
      >
        <span className="font-space text-[0.6rem] uppercase tracking-[0.3em] text-faint">
          Scroll
        </span>
        <span className="block h-10 w-px bg-faint/50">
          <span className="block h-full w-full origin-top animate-scrollHint bg-accent" />
        </span>
      </div>
    </section>
  );
};

export default Hero;

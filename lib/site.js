/** Single source of truth for canonical URLs and default metadata. */

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://fuadhasanemon.vercel.app"
).replace(/\/$/, "");

export const SITE = {
  name: "Fuad Hasan Emon",
  title: "Fuad ✦ Developer, Designer",
  tagline: "Software Engineer — React, Next.js, AI automation",
  description:
    "Fuad Hasan Emon — software engineer building modern, reactive web applications with React, Next.js, TypeScript and AI automation.",
  locale: "en_US",
  twitter: "@fuadhasanemon",
  defaultOgImage:
    "https://res.cloudinary.com/dfiyn4flk/image/upload/v1717730929/jyz2u89kjwk7aq5o41ig.jpg",
  profiles: [
    "https://www.linkedin.com/in/fuadhasanemon/",
    "https://github.com/fuadhasanemon",
    "https://www.instagram.com/emonfuad/",
  ],
};

export const absoluteUrl = (path = "/") =>
  `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;

/** Trim to a clean meta-description length without cutting mid-word. */
export function truncate(text = "", max = 160) {
  const clean = String(text).replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1).replace(/\s+\S*$/, "")}…`;
}

export function slugify(input = "") {
  return String(input)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/** ~200 wpm, rounded up, floored at 1. */
export function readingTime(markdown = "") {
  const words = String(markdown).trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export const CATEGORIES = [
  "AI",
  "AI Agents",
  "Claude Code",
  "n8n",
  "Automation",
  "Full-Stack Development",
  "Next.js",
  "React",
  "Three.js",
  "Web Development",
  "Product Development",
  "Developer Tools",
  "Freelancing",
];

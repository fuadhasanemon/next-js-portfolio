/**
 * One-off: fills the Category table with the preset list the post editor
 * used to hard-code (CATEGORIES in lib/site.js). Categories that posts
 * already use are added automatically by lib/categories.js, so this only
 * matters for the presets nobody has used yet. Safe to re-run: existing
 * names are skipped.
 *
 *   node scripts/seed-categories.mjs
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const slugify = (input) =>
  String(input)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const PRESETS = [
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

const { count } = await prisma.category.createMany({
  data: PRESETS.map((name) => ({ name, slug: slugify(name) })),
  skipDuplicates: true,
});

console.log(`Added ${count} of ${PRESETS.length} preset categories.`);
await prisma.$disconnect();

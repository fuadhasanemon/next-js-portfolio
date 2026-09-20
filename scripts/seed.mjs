/**
 * One-off migration of the 27 projects that used to be hardcoded in
 * components/ProjectCard.jsx. Images keep pointing at /public/work, so nothing
 * needs re-uploading. Safe to re-run: existing slugs are skipped.
 *
 *   node scripts/seed.mjs
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const slugify = (input) =>
  String(input)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const PROJECTS = [
  ["Clubswan", "A fintech website for Clubswan", "/work/clubswan.jpg", ""],
  ["Gables Realty", "A property rental and sales website for Gables Realty", "/work/gablesrealty-ca.jpg", "https://gablesrealty.ca/"],
  ["Dnotch", "An agency website for Dnotch", "/work/dnotch.png", "https://dnotch.ca/"],
  ["AWR Real Estate", "A portfolio website for AWR Real Estate", "/work/awr.jpg", "https://awr-alpha.netlify.app/"],
  ["Aurae Lifestyle", "A fintech lifestyle platform for Aurae Lifestyle", "/work/aure.png", "https://auraelifestyle.com/"],
  ["Supportive Colleges", "A lead generation site for Supportive Colleges", "/work/supportive-college.png", "https://supportivecolleges.com/"],
  ["Visual i", "A software company website for Visual i", "/work/visuali.png", "https://visualiweb.com/"],
  ["Scribe", "A template for Scribe", "/work/scribe.jpg", "https://fuadhasanemon.github.io/Scribe-template/"],
  ["UCB", "An educational website for UCB Bangladesh", "/work/ucb.png", "https://ucbbd.org/"],
  ["Eco Ceramics", "A portfolio and e-commerce website for Eco Ceramics", "/work/eco-ceramic.jpg", "https://ecoceramics.com.bd/"],
  ["Morden Roaring", "A website for Morden Roaring Lion", "/work/mordenroaringlion.jpg", ""],
  ["Marketing Clubswan", "Marketing website for Clubswan", "/work/marketing-clubswan.jpg", ""],
  ["Divas Theme", "A WordPress theme for Divas", "/work/diva.jpg", ""],
  ["Best College Quest", "A website to find the best colleges in the USA", "/work/bestcollegequest.jpg", "https://bestcollegequest.com/"],
  ["Canada Choise Store", "An affiliate website for Canada Choise Store", "/work/canadachoicestor.jpg", ""],
  ["CoinX Licenses", "A website for CoinX Licenses", "/work/coinx-licenses.jpg", ""],
  ["Educo", "An educational website for Educo", "/work/educo.jpg", "https://edukopathwaysbd.com/"],
  ["Laksha Group", "A website for agricultural company Laksha Group", "/work/laksha-group.jpg", ""],
  ["Simple Living Insider", "An affiliate website for Simple Living Insider", "/work/simplelivinginsider.jpg", "https://simplelivinginsider.com/"],
  ["Stroller Insider", "An affiliate website for Stroller Insider", "/work/strollerinsider.jpg", "https://strollerinsider.com/"],
  ["TEDx Morden", "A membership website for TEDx Morden", "/work/tedxmorden.jpg", "https://tedxmordenroaringlion.com/"],
  ["Slick Digital", "A digital agency website for Slick Digital", "/work/slick-digital.png", "https://slickdigital.io/"],
  ["Direct Homes 2U", "A property selling website for Direct Homes 2U", "/work/directhomes2u.png", "https://directhomes2u.com/"],
  ["JCX", "A real estate portfolio website for JCX", "/work/jcx.png", "https://jcxbd.com/"],
  ["Dhaka Tech", "A job market website for Dhaka Tech", "/work/dhakatech.png", "https://dhakatechnology.com/"],
  ["Silicon Orchard", "A digital agency website for Silicon Orchard", "/work/silicon0orchard.png", "https://www.siliconorchard.com/"],
  ["Sol Chat", "A web app for Sol Chat, an AI chatbot company", "/work/sol-chat.jpg", "https://sol-chat.app/"],
];

async function main() {
  let created = 0;
  let skipped = 0;

  for (const [index, [title, shortDescription, coverImage, liveUrl]] of PROJECTS.entries()) {
    const slug = slugify(title);
    const existing = await prisma.project.findUnique({ where: { slug } });

    if (existing) {
      skipped += 1;
      continue;
    }

    await prisma.project.create({
      data: {
        title,
        slug,
        shortDescription,
        coverImage,
        coverAlt: `${title} — project screenshot`,
        liveUrl: liveUrl || null,
        published: true,
        featured: index < 3,
        order: index,
      },
    });
    created += 1;
  }

  console.log(`Seed complete — ${created} created, ${skipped} already present.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());

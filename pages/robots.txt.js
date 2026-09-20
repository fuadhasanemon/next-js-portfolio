import { SITE_URL } from "@/lib/site";

export async function getServerSideProps({ res }) {
  const body = `User-agent: *
Allow: /

Disallow: /admin
Disallow: /admin/
Disallow: /api/

Sitemap: ${SITE_URL}/sitemap.xml
`;

  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Cache-Control", "public, s-maxage=86400");
  res.write(body);
  res.end();

  return { props: {} };
}

export default function Robots() {
  return null;
}

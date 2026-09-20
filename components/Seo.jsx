import Head from "next/head";

import { SITE, absoluteUrl, truncate } from "@/lib/site";

/**
 * One head for every public page. Pages Router has no Metadata API, so this
 * component is the equivalent single choke point for titles, canonicals,
 * Open Graph, Twitter cards and JSON-LD.
 */
const Seo = ({
  title,
  description,
  path = "/",
  canonical,
  ogImage,
  ogTitle,
  ogDescription,
  ogType = "website",
  noIndex = false,
  publishedTime,
  modifiedTime,
  tags = [],
  jsonLd,
}) => {
  const url = canonical || absoluteUrl(path);
  const metaTitle = title ? `${title} ✦ Fuad` : SITE.title;
  const metaDescription = truncate(description || SITE.description);
  const image = ogImage || SITE.defaultOgImage;
  const blocks = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : [];

  return (
    <Head>
      <title>{metaTitle}</title>
      <meta name="description" content={metaDescription} />
      <link rel="canonical" href={url} />

      {noIndex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta
          name="robots"
          content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
        />
      )}

      <meta property="og:type" content={ogType} />
      <meta property="og:site_name" content={SITE.name} />
      <meta property="og:locale" content={SITE.locale} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={ogTitle || metaTitle} />
      <meta
        property="og:description"
        content={truncate(ogDescription || metaDescription)}
      />
      <meta property="og:image" content={image} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={SITE.twitter} />
      <meta name="twitter:creator" content={SITE.twitter} />
      <meta name="twitter:title" content={ogTitle || metaTitle} />
      <meta
        name="twitter:description"
        content={truncate(ogDescription || metaDescription)}
      />
      <meta name="twitter:image" content={image} />

      {ogType === "article" && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {ogType === "article" && modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}
      {ogType === "article" &&
        tags.map((tag) => (
          <meta property="article:tag" content={tag} key={tag} />
        ))}

      {blocks.map((block, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(block) }}
        />
      ))}
    </Head>
  );
};

export default Seo;

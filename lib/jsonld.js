import { SITE, SITE_URL, absoluteUrl, truncate } from "@/lib/site";

const PERSON_ID = `${SITE_URL}/#person`;
const SITE_ID = `${SITE_URL}/#website`;

/** Only facts already stated on the site — no invented credentials. */
export function personSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": PERSON_ID,
    name: SITE.name,
    url: SITE_URL,
    jobTitle: "Software Engineer",
    description: SITE.description,
    image: SITE.defaultOgImage,
    sameAs: SITE.profiles,
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": SITE_ID,
    url: SITE_URL,
    name: SITE.name,
    description: SITE.description,
    inLanguage: "en",
    publisher: { "@id": PERSON_ID },
  };
}

export function breadcrumbSchema(items = []) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function blogPostingSchema(post, { url, description, image }) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    headline: truncate(post.title, 110),
    description,
    image: image ? [image] : undefined,
    datePublished: post.publishedAt || post.createdAt,
    dateModified: post.updatedAt || post.publishedAt || post.createdAt,
    author: { "@type": "Person", name: post.author || SITE.name, url: SITE_URL },
    publisher: { "@id": PERSON_ID },
    keywords: post.tags?.length ? post.tags.join(", ") : undefined,
    articleSection: post.category || undefined,
    url,
    inLanguage: "en",
  };
}

/** A portfolio project is a created work, not a product with a price. */
export function projectSchema(project, { url, description, image }) {
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    "@id": url,
    name: project.title,
    headline: truncate(project.title, 110),
    description,
    image: image ? [image] : undefined,
    url,
    dateCreated: project.createdAt,
    dateModified: project.updatedAt,
    creator: { "@id": PERSON_ID },
    author: { "@id": PERSON_ID },
    keywords: project.technologies?.length
      ? project.technologies.join(", ")
      : undefined,
  };
}

export function collectionSchema({ name, description, path, items = [] }) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    description,
    url: absoluteUrl(path),
    isPartOf: { "@id": SITE_ID },
    about: { "@id": PERSON_ID },
    mainEntity: {
      "@type": "ItemList",
      itemListElement: items.map((item, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: item.name,
        url: absoluteUrl(item.path),
      })),
    },
  };
}

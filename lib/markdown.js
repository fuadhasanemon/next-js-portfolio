import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeHighlight from "rehype-highlight";
import rehypeStringify from "rehype-stringify";

/**
 * Wide code blocks and tables scroll sideways, and a scroll container that
 * cannot be focused is unreachable by keyboard (WCAG 2.1.1). A <pre> takes
 * the tab stop directly. A table gets a wrapper instead, because overriding
 * a table's own `display` to make it scroll strips its role from the
 * accessibility tree — rows and cells stop being announced as tabular data.
 */
function rehypeScrollable() {
  return (tree) => {
    const walk = (node) => {
      if (!node.children) return;

      node.children = node.children.map((child) => {
        walk(child);
        if (child.type !== "element") return child;

        if (child.tagName === "pre") {
          child.properties = { ...child.properties, tabIndex: 0 };
          // The copy button lives outside the <pre> so it stays pinned while
          // a wide block scrolls sideways. Clicks are delegated from the
          // article page (see pages/blog/[slug].jsx).
          return {
            type: "element",
            tagName: "div",
            properties: { className: ["code-block"] },
            children: [
              child,
              {
                type: "element",
                tagName: "button",
                properties: {
                  type: "button",
                  className: ["code-copy"],
                  dataCopyCode: true,
                  ariaLabel: "Copy code",
                },
                children: [{ type: "text", value: "Copy" }],
              },
            ],
          };
        }

        if (child.tagName === "table") {
          return {
            type: "element",
            tagName: "div",
            properties: {
              className: ["prose-scroll"],
              tabIndex: 0,
              role: "region",
              ariaLabel: "Table",
            },
            children: [child],
          };
        }

        return child;
      });
    };

    walk(tree);
  };
}

/**
 * Server-only. Markdown is compiled to HTML during getStaticProps so none of
 * the remark/rehype/highlight weight ever reaches the browser.
 */
export async function markdownToHtml(markdown = "") {
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings, {
      behavior: "wrap",
      properties: { className: "heading-anchor" },
    })
    .use(rehypeHighlight, { detect: true, ignoreMissing: true })
    .use(rehypeScrollable)
    .use(rehypeStringify)
    .process(markdown || "");

  return String(file);
}

/** Pull h2/h3 headings for the article table of contents. */
export function extractToc(markdown = "") {
  const toc = [];
  let inFence = false;

  for (const line of String(markdown).split("\n")) {
    if (/^\s*(```|~~~)/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;

    const match = /^(#{2,3})\s+(.+?)\s*#*\s*$/.exec(line);
    if (!match) continue;

    const text = match[2].replace(/[*_`]/g, "").trim();
    toc.push({
      depth: match[1].length,
      text,
      // Must match rehype-slug's github-slugger output.
      id: text
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-"),
    });
  }

  return toc;
}

/** First paragraph of prose, used when no excerpt was written. */
export function deriveExcerpt(markdown = "", max = 160) {
  const plain = String(markdown)
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/^\s*#{1,6}\s+/gm, "")
    .replace(/[*_>`#|-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (plain.length <= max) return plain;
  return `${plain.slice(0, max - 1).replace(/\s+\S*$/, "")}…`;
}

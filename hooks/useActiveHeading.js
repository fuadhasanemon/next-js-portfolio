import { useEffect, useState } from "react";

// Headings land 7rem below the viewport top when jumped to (scroll-margin-top),
// so a heading counts as "current" once it crosses a line just under that.
const OFFSET = 128;

/**
 * Scrollspy for the table of contents: returns the id of the last heading
 * that has scrolled past the top of the viewport. Measured on scroll rather
 * than with an IntersectionObserver, because an observer only reports
 * headings as they cross, and a long section leaves none in view.
 */
export default function useActiveHeading(ids) {
  const [activeId, setActiveId] = useState(null);
  const key = ids.join("|");

  useEffect(() => {
    if (!key) return undefined;

    const headings = key
      .split("|")
      .map((id) => document.getElementById(id))
      .filter(Boolean);
    if (!headings.length) return undefined;

    let frame = 0;
    const update = () => {
      frame = 0;
      let current = null;
      for (const heading of headings) {
        if (heading.getBoundingClientRect().top - OFFSET > 0) break;
        current = heading.id;
      }
      // At the very bottom the last sections may never reach the line.
      const atBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 2;
      if (atBottom && current) current = headings[headings.length - 1].id;
      setActiveId(current);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [key]);

  return activeId;
}

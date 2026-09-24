import { useEffect, useRef } from "react";

/**
 * Thin bar pinned to the top of the viewport that fills as the reader moves
 * through `targetRef` — the article itself, not the whole page, so related
 * posts and the footer don't count as reading. Written straight to the DOM
 * on scroll, so it never re-renders the page.
 *
 * Sits under .route-progress (z-100) so a page navigation still reads as one.
 */
const ReadingProgress = ({ targetRef }) => {
  const barRef = useRef(null);

  useEffect(() => {
    const target = targetRef.current;
    const bar = barRef.current;
    if (!target || !bar) return undefined;

    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = target.getBoundingClientRect();
      const scrollable = rect.height - window.innerHeight;
      const progress =
        scrollable > 0
          ? Math.min(1, Math.max(0, -rect.top / scrollable))
          : rect.bottom <= window.innerHeight
          ? 1
          : 0;
      bar.style.transform = `scaleX(${progress})`;
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
  }, [targetRef]);

  // Decorative: position in the article is already conveyed by the
  // scrollbar and, for assistive tech, by the table of contents.
  return <div ref={barRef} aria-hidden="true" className="reading-progress" />;
};

export default ReadingProgress;

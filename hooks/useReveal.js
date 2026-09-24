import { useEffect, useRef } from "react";

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Reveals `.reveal` descendants (and the node itself) once they enter the
 * viewport. Elements stay revealed — no re-animating on scroll-up, which reads
 * as jitter rather than polish.
 */
export function useRevealGroup({ threshold = 0.15, rootMargin = "0px 0px -8% 0px" } = {}) {
  const ref = useRef(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    const targets = [
      ...(root.classList.contains("reveal") ? [root] : []),
      ...root.querySelectorAll(".reveal"),
    ];

    const instant =
      prefersReducedMotion() || typeof IntersectionObserver === "undefined";

    const io = instant
      ? null
      : new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                entry.target.classList.add("is-visible");
                io.unobserve(entry.target);
              }
            });
          },
          { threshold, rootMargin }
        );

    const watch = (el) => {
      if (el.classList.contains("is-visible")) return;
      if (instant) el.classList.add("is-visible");
      else io.observe(el);
    };

    targets.forEach(watch);

    // Content rendered after mount (load more, filtering) would otherwise sit
    // at its hidden starting state forever, so pick up .reveal nodes as they
    // are added.
    const mo = new MutationObserver((mutations) => {
      mutations.forEach((m) =>
        m.addedNodes.forEach((node) => {
          if (node.nodeType !== 1) return;
          if (node.classList.contains("reveal")) watch(node);
          node.querySelectorAll(".reveal").forEach(watch);
        })
      );
    });
    mo.observe(root, { childList: true, subtree: true });

    return () => {
      mo.disconnect();
      io?.disconnect();
    };
  }, [threshold, rootMargin]);

  return ref;
}

/** Normalised 0→1 progress of an element travelling through the viewport. */
export function useScrollProgress(onProgress) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      const raw = (vh - rect.top) / (vh + rect.height);
      onProgress(Math.min(1, Math.max(0, raw)), el);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [onProgress]);

  return ref;
}

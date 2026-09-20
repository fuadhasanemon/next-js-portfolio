/* eslint-disable @next/next/no-img-element */
import { useCallback, useEffect, useRef, useState } from "react";

// Long enough that brushing past the image does nothing, short enough that a
// deliberate hover feels responsive.
const HOVER_DELAY = 420;
// Reading speed for the pan, in CSS px per second.
const PAN_SPEED = 300;
const MIN_PAN = 2600;
const MAX_PAN = 15000;
const RETURN_MS = 850;
// Below this the screenshot is not really a "long page" — leave it static.
const MIN_OVERFLOW = 24;

/** Let Cloudinary do the format/quality work; local /public paths pass through. */
const optimized = (src) =>
  typeof src === "string" && src.includes("res.cloudinary.com") && src.includes("/upload/")
    ? src.replace("/upload/", "/upload/f_auto,q_auto,w_1600/")
    : src;

/**
 * Presents a full-page screenshot the way it actually exists: a tall document
 * inside a viewport. A deliberate hover pans it top → bottom slowly enough to
 * read the design; leaving returns it. Touch gets an explicit tap toggle, and
 * reduced-motion users get a natively scrollable frame instead of animation.
 */
const ScreenshotPreview = ({ src, alt, liveUrl, className = "" }) => {
  const frameRef = useRef(null);
  const imgRef = useRef(null);
  const timerRef = useRef(null);

  const [overflow, setOverflow] = useState(0);
  const [ratio, setRatio] = useState(1);
  const [playing, setPlaying] = useState(false);
  const [canHover, setCanHover] = useState(true);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const hover = window.matchMedia("(hover: hover) and (pointer: fine)");
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      setCanHover(hover.matches);
      setReduced(motion.matches);
    };
    sync();
    hover.addEventListener("change", sync);
    motion.addEventListener("change", sync);
    return () => {
      hover.removeEventListener("change", sync);
      motion.removeEventListener("change", sync);
    };
  }, []);

  // Re-measure on load and on resize; the frame's aspect ratio is fixed, so
  // nothing here can shift layout.
  const measure = useCallback(() => {
    const frame = frameRef.current;
    const img = imgRef.current;
    if (!frame || !img || !img.naturalWidth) return;

    const frameH = frame.clientHeight;
    const renderedH = (frame.clientWidth * img.naturalHeight) / img.naturalWidth;
    setOverflow(Math.max(0, renderedH - frameH));
    setRatio(frameH > 0 ? renderedH / frameH : 1);
  }, []);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(measure);
    ro.observe(frame);
    return () => ro.disconnect();
  }, [measure]);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const interactive = overflow > MIN_OVERFLOW && !reduced;
  const panMs = Math.min(MAX_PAN, Math.max(MIN_PAN, (overflow / PAN_SPEED) * 1000));

  const arm = () => {
    if (!interactive || !canHover) return;
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setPlaying(true), HOVER_DELAY);
  };

  const disarm = () => {
    clearTimeout(timerRef.current);
    setPlaying(false);
  };

  const toggle = () => {
    if (!interactive) return;
    clearTimeout(timerRef.current);
    setPlaying((p) => !p);
  };

  const onKeyDown = (e) => {
    if (!interactive) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggle();
    }
    if (e.key === "Escape") disarm();
  };

  const hint = !interactive
    ? null
    : playing
    ? canHover
      ? null
      : "Tap to reset"
    : canHover
    ? "Hover to explore the full page"
    : "Tap to preview the full page";

  return (
    <figure className={`screenshot ${className}`}>
      <div
        ref={frameRef}
        className="screenshot__frame"
        data-interactive={interactive ? "true" : "false"}
        data-scrollable={reduced && overflow > MIN_OVERFLOW ? "true" : "false"}
        onPointerEnter={(e) => e.pointerType === "mouse" && arm()}
        onPointerLeave={(e) => e.pointerType === "mouse" && disarm()}
        // Click works on every input type: it skips the hover delay on desktop
        // and pauses mid-pan, which is what role="button" promises.
        onClick={toggle}
        onKeyDown={onKeyDown}
        onBlur={disarm}
        tabIndex={interactive ? 0 : -1}
        role={interactive ? "button" : undefined}
        aria-label={
          interactive
            ? `${alt}. Activate to pan through the full page screenshot.`
            : undefined
        }
      >
        <img
          ref={imgRef}
          src={optimized(src)}
          alt={alt}
          onLoad={measure}
          decoding="async"
          className="screenshot__img"
          style={{
            transform: playing ? `translate3d(0, -${overflow}px, 0)` : "translate3d(0,0,0)",
            transitionDuration: `${playing ? panMs : RETURN_MS}ms`,
          }}
        />

        {/* Position rail — shows how far through the page you are. */}
        {interactive && (
          <span aria-hidden="true" className="screenshot__rail">
            <span
              className="screenshot__thumb"
              style={{
                height: `${Math.max(12, 100 / ratio)}%`,
                transform: playing
                  ? `translateY(${(ratio - 1) * (100 / ratio) * 100}%)`
                  : "translateY(0)",
                transitionDuration: `${playing ? panMs : RETURN_MS}ms`,
              }}
            />
          </span>
        )}

        {hint && (
          <span className="screenshot__hint">
            <span aria-hidden="true" className="screenshot__caret" />
            {hint}
          </span>
        )}

        {interactive && (
          <span aria-hidden="true" className="screenshot__scale">
            {ratio.toFixed(1)}× screen
          </span>
        )}
      </div>

      {liveUrl && (
        <figcaption className="screenshot__caption">
          {liveUrl.replace(/^https?:\/\//, "").replace(/\/$/, "")}
        </figcaption>
      )}
    </figure>
  );
};

export default ScreenshotPreview;

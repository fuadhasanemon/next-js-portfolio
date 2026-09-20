import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";

// Navigations under this are imperceptible; showing a bar for them would only
// flicker. Anything slower gets feedback within a frame or two of the click.
const SHOW_AFTER = 120;
const HIDE_AFTER = 280;

/**
 * Thin top progress bar driven by the router. It creeps toward 90% while the
 * next route resolves, then completes — so a slow page never looks frozen and
 * a fast one never flashes.
 */
const RouteProgress = () => {
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  const showTimer = useRef(null);
  const hideTimer = useRef(null);
  const creep = useRef(null);

  useEffect(() => {
    const clearAll = () => {
      clearTimeout(showTimer.current);
      clearTimeout(hideTimer.current);
      clearInterval(creep.current);
    };

    const start = () => {
      clearAll();
      showTimer.current = setTimeout(() => {
        setVisible(true);
        setProgress(12);
        // Decelerating creep: fast at first, asymptotic toward 90%.
        creep.current = setInterval(() => {
          setProgress((p) => (p >= 90 ? p : p + (90 - p) * 0.16));
        }, 180);
      }, SHOW_AFTER);
    };

    const done = () => {
      clearAll();
      setProgress((p) => (p === 0 ? 0 : 100));
      hideTimer.current = setTimeout(() => {
        setVisible(false);
        setProgress(0);
      }, HIDE_AFTER);
    };

    router.events.on("routeChangeStart", start);
    router.events.on("routeChangeComplete", done);
    router.events.on("routeChangeError", done);

    return () => {
      clearAll();
      router.events.off("routeChangeStart", start);
      router.events.off("routeChangeComplete", done);
      router.events.off("routeChangeError", done);
    };
  }, [router.events]);

  return (
    <>
      <div
        aria-hidden="true"
        className="route-progress"
        data-visible={visible ? "true" : "false"}
        style={{ transform: `scaleX(${progress / 100})` }}
      />
      {/* Announced to screen readers; the bar itself is decorative. */}
      <span role="status" aria-live="polite" className="sr-only">
        {visible ? "Loading page" : ""}
      </span>
    </>
  );
};

export default RouteProgress;

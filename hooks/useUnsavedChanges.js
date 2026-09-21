import { useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/router";

const DEFAULT_MESSAGE =
  "You have unsaved changes. Leave this page and lose them?";

// Next aborts a route change when a `routeChangeStart` listener throws. The
// string is only ever surfaced in the dev console, so it explains itself.
const ABORT = "Route change aborted by the unsaved-changes guard.";

/**
 * Warns before the editor is left with unsaved edits — on tab close, on a
 * `<Link>` click, and on the browser back button.
 *
 * The page owns the `dirty` flag (it knows what "saved" looks like); this hook
 * owns the plumbing. It returns `release`, which suppresses the guard for the
 * *next* navigation only — call it before a redirect the page performs itself,
 * such as the one that follows a successful create.
 */
export default function useUnsavedChanges(dirty, message = DEFAULT_MESSAGE) {
  const router = useRouter();

  // Listeners are registered once and must read the current value, not the one
  // captured when they were attached.
  const dirtyRef = useRef(dirty);
  dirtyRef.current = dirty;

  const bypass = useRef(false);
  const release = useCallback(() => {
    bypass.current = true;
  }, []);

  useEffect(() => {
    const onBeforeUnload = (e) => {
      if (!dirtyRef.current) return;
      // Browsers show their own wording; both lines are needed for coverage.
      e.preventDefault();
      e.returnValue = "";
    };

    const onRouteChangeStart = (url) => {
      if (bypass.current) {
        bypass.current = false;
        return;
      }
      if (!dirtyRef.current || url === router.asPath) return;
      if (window.confirm(message)) return;

      // Without this the route-progress bar would be left mid-flight.
      router.events.emit("routeChangeError");
      throw ABORT;
    };

    // Back/forward is intercepted here instead, because by the time
    // `routeChangeStart` fires the address bar has already moved.
    const onPopState = () => {
      if (!dirtyRef.current) return true;
      if (window.confirm(message)) {
        // The confirmed navigation still emits `routeChangeStart`; skip it so
        // the prompt cannot appear twice for one back press.
        bypass.current = true;
        return true;
      }
      window.history.forward();
      return false;
    };

    window.addEventListener("beforeunload", onBeforeUnload);
    router.events.on("routeChangeStart", onRouteChangeStart);
    router.beforePopState(onPopState);

    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
      router.events.off("routeChangeStart", onRouteChangeStart);
      router.beforePopState(() => true);
    };
  }, [router, message]);

  return release;
}

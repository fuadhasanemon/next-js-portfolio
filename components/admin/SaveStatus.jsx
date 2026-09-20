import Spinner from "@/components/Spinner";

/**
 * Small inline status for background work (reorder saves), so the admin never
 * has to guess whether a change persisted.
 */
const SaveStatus = ({ state }) => {
  if (!state || state === "idle") return null;

  const copy = {
    saving: "Saving…",
    saved: "Saved",
    error: "Could not save",
  }[state];

  const tone =
    state === "error"
      ? "text-red-500"
      : state === "saved"
      ? "text-emerald-500"
      : "text-faint";

  return (
    <span
      role="status"
      aria-live="polite"
      className={`inline-flex items-center gap-1.5 text-xs transition-opacity duration-300 ${tone}`}
    >
      {state === "saving" && <Spinner className="h-3 w-3" />}
      {state === "saved" && <span aria-hidden="true">✓</span>}
      {copy}
    </span>
  );
};

export default SaveStatus;

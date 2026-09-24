export const MEDIA_FOLDERS = [
  { label: "All", value: "all" },
  { label: "Blog", value: "blog" },
  { label: "Work", value: "work" },
];

/** Folder switcher shared by the media page and the picker dialog. */
const MediaFilter = ({ value, onChange, total }) => (
  <div className="flex flex-wrap items-center gap-1">
    {MEDIA_FOLDERS.map((f) => (
      <button
        key={f.value}
        type="button"
        onClick={() => onChange(f.value)}
        aria-pressed={value === f.value}
        className={`rounded-full px-3 py-1.5 text-sm transition-colors ${
          value === f.value ? "bg-accent/[0.12] text-ink" : "text-muted hover:text-ink"
        }`}
      >
        {f.label}
        {value === f.value && total != null && (
          <span className="ml-1.5 text-xs text-faint">{total}</span>
        )}
      </button>
    ))}
  </div>
);

export default MediaFilter;

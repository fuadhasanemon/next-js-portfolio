import Spinner from "@/components/Spinner";

const base =
  "w-full rounded-lg border bg-transparent px-3 py-2 text-sm text-ink outline-none transition-colors placeholder:text-faint focus:border-accent";
const borderStyle = { borderColor: "rgb(var(--line) / 0.16)" };

export const Field = ({ label, hint, children }) => (
  <label className="block">
    <span className="mb-1.5 block text-xs font-medium text-muted">{label}</span>
    {children}
    {hint && <span className="mt-1 block text-xs text-faint">{hint}</span>}
  </label>
);

export const Input = (props) => (
  <input {...props} className={base} style={borderStyle} />
);

export const Textarea = ({ rows = 4, ...props }) => (
  <textarea {...props} rows={rows} className={base} style={borderStyle} />
);

export const Select = ({ children, ...props }) => (
  <select {...props} className={base} style={borderStyle}>
    {children}
  </select>
);

export const Toggle = ({ label, checked, onChange, hint }) => (
  <label className="flex cursor-pointer items-start gap-3">
    <input
      type="checkbox"
      checked={!!checked}
      onChange={(e) => onChange(e.target.checked)}
      className="mt-0.5 h-4 w-4 accent-[rgb(var(--accent))]"
    />
    <span>
      <span className="block text-sm text-ink">{label}</span>
      {hint && <span className="block text-xs text-faint">{hint}</span>}
    </span>
  </label>
);

export const Panel = ({ title, description, children }) => (
  <section
    className="rounded-2xl border p-5 sm:p-6"
    style={{ borderColor: "rgb(var(--line) / 0.12)" }}
  >
    {title && (
      <header className="mb-5">
        <h2 className="text-sm font-semibold text-ink">{title}</h2>
        {description && (
          <p className="mt-1 text-xs text-faint">{description}</p>
        )}
      </header>
    )}
    <div className="space-y-4">{children}</div>
  </section>
);

export const Button = ({
  variant = "primary",
  loading = false,
  disabled,
  children,
  className = "",
  ...props
}) => {
  const styles =
    variant === "primary"
      ? "bg-[rgb(var(--accent))] text-white hover:opacity-90"
      : variant === "danger"
      ? "border border-red-500/40 text-red-500 hover:bg-red-500/10"
      : "border text-ink hover:border-accent/50";

  return (
    <button
      {...props}
      // Disabling while in flight is what actually prevents a double submit.
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={`btn inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all disabled:cursor-not-allowed disabled:opacity-60 ${styles} ${className}`}
      style={variant === "ghost" ? borderStyle : undefined}
    >
      {loading && <Spinner />}
      {children}
    </button>
  );
};

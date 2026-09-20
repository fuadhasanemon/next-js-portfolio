import { useRef, useState } from "react";

const TOOLBAR = [
  { label: "H2", wrap: ["## ", ""], block: true },
  { label: "H3", wrap: ["### ", ""], block: true },
  { label: "B", wrap: ["**", "**"] },
  { label: "I", wrap: ["_", "_"] },
  { label: "Link", wrap: ["[", "](https://)"] },
  { label: "Code", wrap: ["`", "`"] },
  { label: "Block", wrap: ["\n```js\n", "\n```\n"] },
  { label: "Quote", wrap: ["> ", ""], block: true },
  { label: "List", wrap: ["- ", ""], block: true },
];

/**
 * Plain markdown with a small toolbar. Deliberately not a rich-text engine:
 * the stored value stays portable and the public site renders it server-side.
 */
const MarkdownEditor = ({ value = "", onChange }) => {
  const ref = useRef(null);
  const [preview, setPreview] = useState(false);

  const apply = ({ wrap: [before, after], block }) => {
    const el = ref.current;
    if (!el) return;

    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = value.slice(start, end);

    // Block markers belong at the start of the line, not mid-sentence.
    const insertAt = block ? value.lastIndexOf("\n", start - 1) + 1 : start;
    const next = block
      ? value.slice(0, insertAt) + before + value.slice(insertAt)
      : value.slice(0, start) + before + selected + after + value.slice(end);

    onChange(next);

    requestAnimationFrame(() => {
      el.focus();
      const caret = block ? start + before.length : start + before.length + selected.length;
      el.setSelectionRange(caret, caret);
    });
  };

  return (
    <div
      className="overflow-hidden rounded-xl border"
      style={{ borderColor: "rgb(var(--line) / 0.16)" }}
    >
      <div
        className="flex flex-wrap items-center gap-1 border-b px-2 py-1.5"
        style={{ borderColor: "rgb(var(--line) / 0.12)" }}
      >
        {TOOLBAR.map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={() => apply(item)}
            className="rounded px-2 py-1 font-space text-xs text-muted transition-colors hover:bg-ink/5 hover:text-ink"
          >
            {item.label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setPreview((p) => !p)}
          className="ml-auto rounded px-2 py-1 font-space text-xs text-muted transition-colors hover:text-ink"
        >
          {preview ? "Write" : "Preview"}
        </button>
      </div>

      {preview ? (
        <pre className="max-h-[32rem] overflow-auto whitespace-pre-wrap p-4 font-space text-xs leading-relaxed text-muted">
          {value || "Nothing to preview yet."}
        </pre>
      ) : (
        <textarea
          ref={ref}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          spellCheck
          rows={24}
          placeholder={"## Heading\n\nWrite your article in Markdown.\n\n```js\nconsole.log('code blocks are supported')\n```"}
          className="w-full resize-y bg-transparent p-4 font-space text-sm leading-relaxed text-ink outline-none placeholder:text-faint"
        />
      )}
    </div>
  );
};

export default MarkdownEditor;

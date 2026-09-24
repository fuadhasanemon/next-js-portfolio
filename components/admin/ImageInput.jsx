/* eslint-disable @next/next/no-img-element */
import { useRef, useState } from "react";

import Spinner from "@/components/Spinner";
import Skeleton from "@/components/admin/Skeleton";
import { Field, Input } from "@/components/admin/Fields";
import MediaPicker from "@/components/admin/MediaPicker";
import { uploadImage } from "@/lib/upload";

/**
 * An image URL field with two ways to fill it: upload a new file straight to
 * Cloudinary (see lib/upload.js), or pick one already in the media library.
 */
const ImageInput = ({ label, folder = "work", value, alt, onChange, onAltChange }) => {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [picking, setPicking] = useState(false);
  const inputRef = useRef(null);

  const upload = async (file) => {
    if (!file) return;
    setBusy(true);
    setError("");

    try {
      const json = await uploadImage(file, folder);
      onChange(json.secure_url);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-3">
      <Field label={label}>
        <div className="flex gap-2">
          <Input
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://res.cloudinary.com/…"
          />
          <button
            type="button"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
            aria-busy={busy || undefined}
            className="inline-flex shrink-0 items-center gap-2 rounded-lg border px-3 text-sm text-muted transition-colors hover:text-ink disabled:opacity-50"
            style={{ borderColor: "rgb(var(--line) / 0.16)" }}
          >
            {busy && <Spinner className="h-3 w-3" />}
            {busy ? "Uploading…" : "Upload"}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => setPicking(true)}
            className="inline-flex shrink-0 items-center gap-2 rounded-lg border px-3 text-sm text-muted transition-colors hover:text-ink disabled:opacity-50"
            style={{ borderColor: "rgb(var(--line) / 0.16)" }}
          >
            Library
          </button>
        </div>
      </Field>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => upload(e.target.files?.[0])}
      />

      {error && <p className="text-xs text-red-500">{error}</p>}

      {picking && (
        <MediaPicker
          folder={folder}
          current={value}
          onSelect={(url) => {
            setError("");
            onChange(url);
          }}
          onClose={() => setPicking(false)}
        />
      )}

      {onAltChange && (
        <Field label="Alt text" hint="Describes the image for screen readers and search engines.">
          <Input
            value={alt || ""}
            onChange={(e) => onAltChange(e.target.value)}
            placeholder="Screenshot of the project homepage"
          />
        </Field>
      )}

      {busy && !value && <Skeleton className="h-36 w-full" />}

      {value && (
        <img
          src={value}
          alt={alt || ""}
          className={`h-36 w-full rounded-lg border object-cover transition-opacity duration-300 ${
            busy ? "opacity-50" : ""
          }`}
          style={{ borderColor: "rgb(var(--line) / 0.12)" }}
        />
      )}
    </div>
  );
};

export default ImageInput;

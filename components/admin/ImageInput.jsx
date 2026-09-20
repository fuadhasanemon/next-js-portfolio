/* eslint-disable @next/next/no-img-element */
import { useRef, useState } from "react";

import Spinner from "@/components/Spinner";
import Skeleton from "@/components/admin/Skeleton";
import { Field, Input } from "@/components/admin/Fields";

/**
 * Uploads straight to Cloudinary using a signature minted by
 * /api/admin/upload, so no image bytes pass through our own API routes.
 */
const ImageInput = ({ label, folder = "work", value, alt, onChange, onAltChange }) => {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  const upload = async (file) => {
    if (!file) return;
    setBusy(true);
    setError("");

    try {
      const sigRes = await fetch("/api/admin/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folder }),
      });
      if (!sigRes.ok) throw new Error((await sigRes.json()).error || "Signing failed");

      const sig = await sigRes.json();
      const form = new FormData();
      form.append("file", file);
      form.append("api_key", sig.apiKey);
      form.append("timestamp", sig.timestamp);
      form.append("signature", sig.signature);
      form.append("folder", sig.folder);

      const upRes = await fetch(sig.uploadUrl, { method: "POST", body: form });
      const json = await upRes.json();
      if (!upRes.ok) throw new Error(json?.error?.message || "Upload failed");

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

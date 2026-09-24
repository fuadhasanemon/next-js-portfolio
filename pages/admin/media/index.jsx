/* eslint-disable @next/next/no-img-element */
import { useRef, useState } from "react";
import Link from "next/link";

import Spinner from "@/components/Spinner";
import AdminShell from "@/components/admin/AdminShell";
import MediaFilter from "@/components/admin/MediaFilter";
import SaveStatus from "@/components/admin/SaveStatus";
import Skeleton from "@/components/admin/Skeleton";
import useMediaLibrary, { itemFromUpload } from "@/hooks/useMediaLibrary";
import { formatBytes, thumbUrl, uploadImage } from "@/lib/upload";

const formatDate = (value) =>
  new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const MediaCard = ({ item, onDelete }) => {
  const [copied, setCopied] = useState(false);
  const inUse = item.usage.length > 0;
  const name = item.publicId.split("/").pop();

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(item.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard blocked; the Open link is still there.
    }
  };

  return (
    <li
      className="flex flex-col overflow-hidden rounded-2xl border"
      style={{ borderColor: "rgb(var(--line) / 0.12)" }}
    >
      <a href={item.url} target="_blank" rel="noreferrer" className="block">
        <img
          src={thumbUrl(item.url)}
          alt={`${name}, ${item.width}×${item.height}`}
          loading="lazy"
          className="aspect-[3/2] w-full object-cover"
        />
      </a>

      <div className="flex flex-1 flex-col p-4">
        <p className="truncate font-space text-xs text-ink" title={item.publicId}>
          {name}.{item.format}
        </p>
        <p className="mt-1 font-space text-[0.7rem] text-faint">
          {item.folder} · {item.width}×{item.height} · {formatBytes(item.bytes)} ·{" "}
          {formatDate(item.createdAt)}
        </p>

        <div className="mt-3 flex-1 text-xs">
          {inUse ? (
            <ul className="space-y-1">
              {item.usage.map((use) => (
                <li key={use.href + use.field} className="truncate text-muted">
                  <span className="text-faint">{use.kind}:</span>{" "}
                  <Link href={use.href} className="hover:text-ink">
                    {use.title}
                  </Link>{" "}
                  <span className="text-faint">({use.field})</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-faint">Not used anywhere</p>
          )}
        </div>

        <div className="mt-4 flex items-center gap-4">
          <button type="button" onClick={copy} className="text-xs text-muted hover:text-ink">
            {copied ? "Copied" : "Copy URL"}
          </button>
          <button
            type="button"
            onClick={() => onDelete(item)}
            disabled={inUse}
            title={inUse ? "Remove it from the posts/projects above before deleting" : undefined}
            className="ml-auto text-xs text-red-500 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Delete
          </button>
        </div>
      </div>
    </li>
  );
};

export default function AdminMedia() {
  const [folder, setFolder] = useState("all");
  const [uploadFolder, setUploadFolder] = useState("blog");
  const [uploading, setUploading] = useState(0);
  const [saveState, setSaveState] = useState("idle");
  const [notice, setNotice] = useState("");
  const fileRef = useRef(null);

  const { items, total, status, error, hasMore, loadMore, reload, prepend, removeLocal } =
    useMediaLibrary(folder);

  const flash = (state, message = "") => {
    setSaveState(state);
    setNotice(message);
    if (state === "saved") setTimeout(() => setSaveState("idle"), 2200);
  };

  const upload = async (files) => {
    const list = [...(files || [])];
    if (!list.length) return;
    setUploading(list.length);
    flash("saving");

    const failed = [];
    // One at a time: parallel uploads race each other for bandwidth and give
    // no faster result for the handful of images an upload usually is.
    for (const file of list) {
      try {
        const json = await uploadImage(file, uploadFolder);
        if (folder === "all" || folder === uploadFolder) prepend(itemFromUpload(json));
      } catch (err) {
        failed.push(`${file.name}: ${err.message}`);
      }
      setUploading((n) => n - 1);
    }

    if (fileRef.current) fileRef.current.value = "";
    if (failed.length) flash("error", failed.join(" · "));
    else flash("saved");
  };

  const remove = async (item) => {
    if (!confirm(`Delete ${item.publicId.split("/").pop()} from Cloudinary? This cannot be undone.`))
      return;

    flash("saving");
    const res = await fetch(`/api/admin/media?publicId=${encodeURIComponent(item.publicId)}`, {
      method: "DELETE",
    });
    if (res.ok) {
      removeLocal(item.publicId);
      flash("saved");
    } else {
      const payload = await res.json().catch(() => ({}));
      flash("error", payload.error || "Could not delete.");
    }
  };

  return (
    <AdminShell
      title="Media"
      actions={
        <>
          <SaveStatus state={saveState} />
          <label className="sr-only" htmlFor="upload-folder">
            Upload to folder
          </label>
          <select
            id="upload-folder"
            value={uploadFolder}
            onChange={(e) => setUploadFolder(e.target.value)}
            className="rounded-full border bg-transparent px-3 py-2 text-sm text-muted"
            style={{ borderColor: "rgb(var(--line) / 0.16)", backgroundColor: "rgb(var(--surface))" }}
          >
            <option value="blog">To: Blog</option>
            <option value="work">To: Work</option>
          </select>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading > 0}
            aria-busy={uploading > 0 || undefined}
            className="btn-primary disabled:opacity-60"
          >
            {uploading > 0 && <Spinner className="h-3.5 w-3.5" />}
            {uploading > 0 ? `Uploading ${uploading}…` : "Upload images"}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={(e) => upload(e.target.files)}
          />
        </>
      }
    >
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <MediaFilter value={folder} onChange={setFolder} total={status === "loading" ? null : total} />
        <p className="text-xs text-faint">
          Images in use can&apos;t be deleted. Pick existing images from the Library button in any
          editor.
        </p>
      </div>

      {notice && (
        <p role="alert" className="mb-6 text-sm text-red-500">
          {notice}
        </p>
      )}

      {status === "loading" ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }, (_, i) => (
            <Skeleton key={i} className="h-72 w-full" />
          ))}
        </div>
      ) : status === "error" && items.length === 0 ? (
        <p className="text-sm text-red-500">
          {error}{" "}
          <button type="button" onClick={reload} className="link-underline text-ink">
            Try again
          </button>
        </p>
      ) : items.length === 0 ? (
        <p className="text-sm text-muted">
          No images here yet. Upload one, or add a cover image from a post or project.
        </p>
      ) : (
        <>
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((item) => (
              <MediaCard key={item.publicId} item={item} onDelete={remove} />
            ))}
          </ul>

          {hasMore && (
            <div className="mt-10 flex flex-col items-center gap-2">
              <button
                type="button"
                onClick={loadMore}
                disabled={status === "more"}
                className="btn-ghost disabled:opacity-60"
              >
                {status === "more" && <Spinner className="h-3.5 w-3.5" />}
                Load more
              </button>
              <p className="font-space text-xs text-faint">
                Showing {items.length} of {total}
              </p>
            </div>
          )}
        </>
      )}
    </AdminShell>
  );
}

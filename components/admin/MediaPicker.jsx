/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, useState } from "react";
import { HiX } from "react-icons/hi";

import Spinner from "@/components/Spinner";
import MediaFilter from "@/components/admin/MediaFilter";
import Skeleton from "@/components/admin/Skeleton";
import useMediaLibrary from "@/hooks/useMediaLibrary";
import { thumbUrl } from "@/lib/upload";

/**
 * "Choose from library" dialog for ImageInput. Mount it only while open:
 * mounting is what triggers the first fetch, so a closed picker costs no
 * Cloudinary API calls. A native <dialog> opened with showModal() gives the
 * focus trap, Escape to close and inert background for free.
 */
const MediaPicker = ({ folder: initialFolder = "all", current, onSelect, onClose }) => {
  const dialogRef = useRef(null);
  const [folder, setFolder] = useState(initialFolder);
  const { items, total, status, error, hasMore, loadMore, reload } = useMediaLibrary(folder);

  useEffect(() => {
    const dialog = dialogRef.current;
    dialog?.showModal();
    return () => dialog?.open && dialog.close();
  }, []);

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      // A click on the backdrop lands on the <dialog> element itself.
      onClick={(e) => e.target === dialogRef.current && dialogRef.current.close()}
      aria-labelledby="media-picker-title"
      className="m-auto w-[min(56rem,calc(100vw-2rem))] max-h-[85vh] overflow-hidden rounded-2xl border p-0 text-ink backdrop:bg-black/50"
      style={{ borderColor: "rgb(var(--line) / 0.14)", background: "rgb(var(--surface))" }}
    >
      <div className="flex max-h-[85vh] flex-col">
        <header
          className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4"
          style={{ borderColor: "rgb(var(--line) / 0.12)" }}
        >
          <h2 id="media-picker-title" className="text-sm font-semibold">
            Choose from library
          </h2>
          <div className="flex items-center gap-3">
            <MediaFilter value={folder} onChange={setFolder} total={status === "loading" ? null : total} />
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              aria-label="Close"
              className="grid h-8 w-8 place-items-center rounded-lg text-muted transition-colors hover:text-ink"
            >
              <HiX className="h-5 w-5" />
            </button>
          </div>
        </header>

        <div className="overflow-y-auto p-5">
          {status === "loading" ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {Array.from({ length: 8 }, (_, i) => (
                <Skeleton key={i} className="aspect-[3/2] w-full" />
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
            <p className="text-sm text-muted">No images in this folder yet.</p>
          ) : (
            <>
              <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {items.map((item) => {
                  const selected = current && current === item.url;
                  return (
                    <li key={item.publicId}>
                      <button
                        type="button"
                        onClick={() => {
                          onSelect(item.url);
                          dialogRef.current?.close();
                        }}
                        aria-label={`Use ${item.publicId.split("/").pop()}, ${item.width}×${item.height}${
                          selected ? " (current)" : ""
                        }`}
                        className={`group relative block w-full overflow-hidden rounded-lg border-2 transition-colors ${
                          selected ? "border-accent" : "border-transparent hover:border-accent/60"
                        }`}
                      >
                        <img
                          src={thumbUrl(item.url, { w: 360, h: 240 })}
                          alt=""
                          loading="lazy"
                          className="aspect-[3/2] w-full object-cover"
                        />
                        <span className="absolute inset-x-0 bottom-0 bg-black/55 px-2 py-1 text-left font-space text-[0.65rem] text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                          {item.folder} · {item.width}×{item.height}
                          {item.usage.length > 0 && ` · used ${item.usage.length}×`}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>

              {hasMore && (
                <div className="mt-5 flex justify-center">
                  <button
                    type="button"
                    onClick={loadMore}
                    disabled={status === "more"}
                    className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm text-muted transition-colors hover:text-ink disabled:opacity-60"
                    style={{ borderColor: "rgb(var(--line) / 0.16)" }}
                  >
                    {status === "more" && <Spinner className="h-3 w-3" />}
                    Load more
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </dialog>
  );
};

export default MediaPicker;

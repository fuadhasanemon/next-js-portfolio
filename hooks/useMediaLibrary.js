import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Paged view of /api/admin/media for one folder ("all" | "blog" | "work").
 * Switching folder starts over; loadMore appends the next cursor's page.
 */
export default function useMediaLibrary(folder = "all") {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [cursor, setCursor] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | more | idle | error
  const [error, setError] = useState("");
  // Guards against a slow response for an old folder landing after a new one.
  const request = useRef(0);

  const fetchPage = useCallback(
    async (nextCursor) => {
      const id = ++request.current;
      setStatus(nextCursor ? "more" : "loading");
      setError("");

      try {
        const params = new URLSearchParams({ folder });
        if (nextCursor) params.set("cursor", nextCursor);
        const res = await fetch(`/api/admin/media?${params}`);
        const json = await res.json();
        if (id !== request.current) return;
        if (!res.ok) throw new Error(json.error || "Could not load images.");

        setItems((prev) => (nextCursor ? [...prev, ...json.items] : json.items));
        setTotal(json.total);
        setCursor(json.nextCursor);
        setStatus("idle");
      } catch (err) {
        if (id !== request.current) return;
        setError(err.message);
        setStatus("error");
      }
    },
    [folder]
  );

  useEffect(() => {
    setItems([]);
    setCursor(null);
    fetchPage(null);
  }, [fetchPage]);

  /** Adds a just-uploaded image to the top without refetching. */
  const prepend = useCallback((item) => {
    setItems((prev) => [item, ...prev.filter((i) => i.publicId !== item.publicId)]);
    setTotal((n) => n + 1);
  }, []);

  const removeLocal = useCallback((publicId) => {
    setItems((prev) => prev.filter((i) => i.publicId !== publicId));
    setTotal((n) => Math.max(0, n - 1));
  }, []);

  return {
    items,
    total,
    status,
    error,
    hasMore: Boolean(cursor),
    loadMore: () => cursor && fetchPage(cursor),
    reload: () => fetchPage(null),
    prepend,
    removeLocal,
  };
}

/** Shape a raw Cloudinary upload response like a library item. */
export const itemFromUpload = (json) => ({
  publicId: json.public_id,
  url: json.secure_url,
  folder: json.public_id.split("/")[1],
  format: json.format,
  width: json.width,
  height: json.height,
  bytes: json.bytes,
  createdAt: json.created_at,
  usage: [],
});

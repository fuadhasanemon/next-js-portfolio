import { useCallback, useEffect, useState } from "react";

// Storage can throw (private mode, blocked site data); the counters are a
// nicety, so any failure just means "not remembered".
const read = (store, key) => {
  try {
    return window[store].getItem(key);
  } catch {
    return null;
  }
};
const write = (store, key, value) => {
  try {
    if (value === null) window[store].removeItem(key);
    else window[store].setItem(key, value);
  } catch {
    // ignore
  }
};

/**
 * Views and likes for one post. Article pages are static, so the counts are
 * fetched after mount. A view is counted once per browser session; a like is
 * remembered in localStorage so the heart stays filled on return visits.
 */
export default function usePostStats(slug) {
  const [stats, setStats] = useState(null); // { views, likes } once loaded
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setStats(null);
    setLiked(read("localStorage", `liked:${slug}`) === "1");

    const viewedKey = `viewed:${slug}`;
    const alreadyViewed = read("sessionStorage", viewedKey) === "1";
    const url = `/api/posts/${encodeURIComponent(slug)}/stats`;

    fetch(url, alreadyViewed ? undefined : {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "view" }),
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled || !data) return;
        if (!alreadyViewed) write("sessionStorage", viewedKey, "1");
        setStats(data);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [slug]);

  const toggleLike = useCallback(async () => {
    const next = !liked;
    // Optimistic: flip now, reconcile with the server's count after.
    setLiked(next);
    write("localStorage", `liked:${slug}`, next ? "1" : null);
    setStats((s) => s && { ...s, likes: Math.max(0, s.likes + (next ? 1 : -1)) });

    try {
      const res = await fetch(`/api/posts/${encodeURIComponent(slug)}/stats`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: next ? "like" : "unlike" }),
      });
      if (!res.ok) throw new Error();
      setStats(await res.json());
    } catch {
      setLiked(!next);
      write("localStorage", `liked:${slug}`, next ? null : "1");
      setStats((s) => s && { ...s, likes: Math.max(0, s.likes + (next ? -1 : 1)) });
    }
  }, [liked, slug]);

  return { stats, liked, toggleLike };
}

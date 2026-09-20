import { useEffect, useState } from "react";
import Link from "next/link";

import Spinner from "@/components/Spinner";
import AdminShell from "@/components/admin/AdminShell";
import SaveStatus from "@/components/admin/SaveStatus";
import SortableList from "@/components/admin/SortableList";
import { prisma, serialize } from "@/lib/prisma";

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";

export default function AdminPosts({ initialPosts }) {
  const [posts, setPosts] = useState(initialPosts);
  const [saveState, setSaveState] = useState("idle");
  const [pendingOrder, setPendingOrder] = useState(null);

  const [busy, setBusy] = useState({});
  const mark = (id, state) =>
    setBusy((b) => {
      if (!state) {
        const { [id]: _drop, ...rest } = b;
        return rest;
      }
      return { ...b, [id]: state };
    });

  useEffect(() => {
    if (!pendingOrder) return;
    const timer = setTimeout(async () => {
      setSaveState("saving");
      const res = await fetch("/api/admin/posts/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: pendingOrder }),
      });
      setSaveState(res.ok ? "saved" : "error");
      setPendingOrder(null);
      if (res.ok) setTimeout(() => setSaveState("idle"), 2200);
    }, 600);
    return () => clearTimeout(timer);
  }, [pendingOrder]);

  const reorder = (next) => {
    setPosts(next);
    setSaveState("saving");
    setPendingOrder(next.map((p) => p.id));
  };

  const remove = async (post) => {
    if (!confirm(`Delete “${post.title}”? This cannot be undone.`)) return;
    mark(post.id, "deleting");
    const res = await fetch(`/api/admin/posts/${post.id}`, { method: "DELETE" });
    if (res.ok) setPosts((list) => list.filter((p) => p.id !== post.id));
    else mark(post.id, null);
  };

  const togglePublish = async (post) => {
    mark(post.id, "publishing");
    const res = await fetch(`/api/admin/posts/${post.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...post, published: !post.published }),
    });
    if (res.ok) {
      const updated = await res.json();
      setPosts((list) => list.map((p) => (p.id === updated.id ? updated : p)));
    }
    mark(post.id, null);
  };

  return (
    <AdminShell
      title="Blog"
      actions={
        <>
          <SaveStatus state={saveState} />
          <Link href="/admin/posts/new" className="btn-primary">
            New article
          </Link>
        </>
      }
    >
      {posts.length === 0 ? (
        <p className="text-sm text-muted">No articles yet. Write your first one.</p>
      ) : (
        <>
          <p className="mb-4 text-xs text-faint">
            Drag to reorder. Featured articles appear first on /blog in this order.
          </p>

          <SortableList
            items={posts}
            onReorder={reorder}
            busyIds={busy}
            renderItem={(post) => {
              const state = busy[post.id];
              return (
                <>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="truncate text-sm font-medium text-ink">
                        {post.title}
                      </span>
                      {post.featured && (
                        <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[0.65rem] text-amber-500">
                          featured
                        </span>
                      )}
                      <span
                        className={`rounded-full px-2 py-0.5 text-[0.65rem] transition-colors duration-300 ${
                          post.published
                            ? "bg-emerald-500/15 text-emerald-500"
                            : "bg-ink/10 text-muted"
                        }`}
                      >
                        {post.published ? "published" : "draft"}
                      </span>
                    </div>
                    <p className="truncate font-space text-xs text-faint">
                      /blog/{post.slug} · {formatDate(post.publishedAt)}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-3">
                    <button
                      type="button"
                      onClick={() => togglePublish(post)}
                      disabled={!!state}
                      aria-busy={state === "publishing" || undefined}
                      className="inline-flex items-center gap-1.5 text-xs text-muted transition-colors hover:text-ink disabled:opacity-60"
                    >
                      {state === "publishing" && <Spinner className="h-3 w-3" />}
                      {post.published ? "Unpublish" : "Publish"}
                    </button>
                    <Link
                      href={`/admin/posts/${post.id}`}
                      className="text-xs text-muted hover:text-ink"
                    >
                      Edit
                    </Link>
                    <button
                      type="button"
                      onClick={() => remove(post)}
                      disabled={!!state}
                      aria-busy={state === "deleting" || undefined}
                      className="inline-flex items-center gap-1.5 text-xs text-red-500/80 transition-colors hover:text-red-500 disabled:opacity-60"
                    >
                      {state === "deleting" && <Spinner className="h-3 w-3" />}
                      Delete
                    </button>
                  </div>
                </>
              );
            }}
          />
        </>
      )}
    </AdminShell>
  );
}

export async function getServerSideProps() {
  const posts = await prisma.post.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
  });
  return { props: { initialPosts: serialize(posts) } };
}

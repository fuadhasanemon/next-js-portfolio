import { useEffect, useState } from "react";
import Link from "next/link";

import Spinner from "@/components/Spinner";
import AdminShell from "@/components/admin/AdminShell";
import SaveStatus from "@/components/admin/SaveStatus";
import SortableList from "@/components/admin/SortableList";
import { prisma, serialize } from "@/lib/prisma";

export default function AdminProjects({ initialProjects }) {
  const [projects, setProjects] = useState(initialProjects);
  const [saveState, setSaveState] = useState("idle");

  // id -> "publishing" | "deleting", so each row shows its own state.
  const [busy, setBusy] = useState({});
  const mark = (id, state) =>
    setBusy((b) => {
      if (!state) {
        const { [id]: _drop, ...rest } = b;
        return rest;
      }
      return { ...b, [id]: state };
    });

  // Persist a new order shortly after the drag settles, not on every frame.
  const [pendingOrder, setPendingOrder] = useState(null);

  useEffect(() => {
    if (!pendingOrder) return;
    const timer = setTimeout(async () => {
      setSaveState("saving");
      const res = await fetch("/api/admin/projects/reorder", {
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
    setProjects(next);
    setSaveState("saving");
    setPendingOrder(next.map((p) => p.id));
  };

  const remove = async (project) => {
    if (!confirm(`Delete “${project.title}”? This cannot be undone.`)) return;
    mark(project.id, "deleting");
    const res = await fetch(`/api/admin/projects/${project.id}`, { method: "DELETE" });
    if (res.ok) setProjects((list) => list.filter((p) => p.id !== project.id));
    else mark(project.id, null);
  };

  const togglePublish = async (project) => {
    mark(project.id, "publishing");
    const res = await fetch(`/api/admin/projects/${project.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...project, published: !project.published }),
    });
    if (res.ok) {
      const updated = await res.json();
      setProjects((list) => list.map((p) => (p.id === updated.id ? updated : p)));
    }
    mark(project.id, null);
  };

  return (
    <AdminShell
      title="Projects"
      actions={
        <>
          <SaveStatus state={saveState} />
          <Link href="/admin/projects/new" className="btn-primary">
            New project
          </Link>
        </>
      }
    >
      {projects.length === 0 ? (
        <p className="text-sm text-muted">
          No projects yet. Create one to get started.
        </p>
      ) : (
        <>
          <p className="mb-4 text-xs text-faint">
            Drag the handle to reorder. This order is what the public /work page uses.
          </p>

          <SortableList
            items={projects}
            onReorder={reorder}
            busyIds={busy}
            renderItem={(project) => {
              const state = busy[project.id];
              return (
                <>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="truncate text-sm font-medium text-ink">
                        {project.title}
                      </span>
                      {project.featured && (
                        <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[0.65rem] text-amber-500">
                          featured
                        </span>
                      )}
                      <span
                        className={`rounded-full px-2 py-0.5 text-[0.65rem] transition-colors duration-300 ${
                          project.published
                            ? "bg-emerald-500/15 text-emerald-500"
                            : "bg-ink/10 text-muted"
                        }`}
                      >
                        {project.published ? "published" : "draft"}
                      </span>
                    </div>
                    <p className="truncate font-space text-xs text-faint">
                      /work/{project.slug}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-3">
                    <button
                      type="button"
                      onClick={() => togglePublish(project)}
                      disabled={!!state}
                      aria-busy={state === "publishing" || undefined}
                      className="inline-flex items-center gap-1.5 text-xs text-muted transition-colors hover:text-ink disabled:opacity-60"
                    >
                      {state === "publishing" && <Spinner className="h-3 w-3" />}
                      {project.published ? "Unpublish" : "Publish"}
                    </button>
                    <Link
                      href={`/admin/projects/${project.id}`}
                      className="text-xs text-muted hover:text-ink"
                    >
                      Edit
                    </Link>
                    <button
                      type="button"
                      onClick={() => remove(project)}
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
  const projects = await prisma.project.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
  });
  return { props: { initialProjects: serialize(projects) } };
}

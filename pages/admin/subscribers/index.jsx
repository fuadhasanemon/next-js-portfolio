import { useState } from "react";

import AdminShell from "@/components/admin/AdminShell";
import SaveStatus from "@/components/admin/SaveStatus";
import { prisma, serialize } from "@/lib/prisma";

const TONE = {
  ACTIVE: "bg-emerald-500/15 text-emerald-500",
  UNSUBSCRIBED: "bg-ink/10 text-faint",
};

const FILTERS = [
  { label: "Active", value: "ACTIVE" },
  { label: "Unsubscribed", value: "UNSUBSCRIBED" },
  { label: "All", value: "ALL" },
];

const formatDate = (value) =>
  new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

/** Active readers only — the list you'd paste into a mailing tool. */
const exportCsv = (subscribers) => {
  const rows = subscribers
    .filter((s) => s.status === "ACTIVE")
    .map((s) => [s.email, s.source, s.createdAt]);
  // Quote every cell; emails can't contain a double quote in practice, but
  // escaping costs nothing and keeps the file valid if one ever does.
  const csv = [["email", "source", "subscribed_at"], ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");

  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
};

export default function AdminSubscribers({ initialSubscribers }) {
  const [subscribers, setSubscribers] = useState(initialSubscribers);
  const [filter, setFilter] = useState("ACTIVE");
  const [saveState, setSaveState] = useState("idle");

  const visible = subscribers.filter(
    (s) => filter === "ALL" || s.status === filter
  );
  const activeCount = subscribers.filter((s) => s.status === "ACTIVE").length;

  const settle = (ok, rollback) => {
    if (ok) {
      setSaveState("saved");
      setTimeout(() => setSaveState("idle"), 2200);
    } else {
      rollback();
      setSaveState("error");
    }
  };

  const setStatus = async (id, status) => {
    const previous = subscribers;
    setSubscribers((list) => list.map((s) => (s.id === id ? { ...s, status } : s)));
    setSaveState("saving");

    const res = await fetch(`/api/admin/subscribers/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    settle(res.ok, () => setSubscribers(previous));
  };

  const remove = async (subscriber) => {
    if (
      !confirm(
        `Delete ${subscriber.email}? This cannot be undone. To stop emailing them but keep the record, mark them unsubscribed instead.`
      )
    )
      return;

    const previous = subscribers;
    setSubscribers((list) => list.filter((s) => s.id !== subscriber.id));
    setSaveState("saving");

    const res = await fetch(`/api/admin/subscribers/${subscriber.id}`, {
      method: "DELETE",
    });
    settle(res.ok, () => setSubscribers(previous));
  };

  return (
    <AdminShell
      title="Subscribers"
      actions={
        <div className="flex items-center gap-3">
          <SaveStatus state={saveState} />
          <button
            type="button"
            onClick={() => exportCsv(subscribers)}
            disabled={activeCount === 0}
            className="btn-ghost disabled:opacity-50"
          >
            Export CSV
          </button>
        </div>
      }
    >
      <div className="mb-6 flex flex-wrap items-center gap-1">
        {FILTERS.map((tab) => {
          const count =
            tab.value === "ALL"
              ? subscribers.length
              : subscribers.filter((s) => s.status === tab.value).length;

          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => setFilter(tab.value)}
              aria-pressed={filter === tab.value}
              className={`rounded-full px-3 py-1.5 text-sm transition-colors ${
                filter === tab.value ? "text-ink" : "text-muted hover:text-ink"
              }`}
              style={
                filter === tab.value
                  ? { background: "rgb(var(--accent) / 0.12)" }
                  : undefined
              }
            >
              {tab.label}
              <span className="ml-1.5 text-xs text-faint">{count}</span>
            </button>
          );
        })}
      </div>

      {visible.length === 0 ? (
        <p className="text-sm text-muted">
          {subscribers.length === 0
            ? "No subscribers yet. They'll appear here when readers sign up at the end of a blog post."
            : "Nothing in this view."}
        </p>
      ) : (
        <ul className="space-y-3">
          {visible.map((subscriber) => (
            <li
              key={subscriber.id}
              className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-2xl border p-4"
              style={{ borderColor: "rgb(var(--line) / 0.12)" }}
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="truncate text-sm font-medium text-ink">
                    {subscriber.email}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[0.65rem] ${
                      TONE[subscriber.status]
                    }`}
                  >
                    {subscriber.status.toLowerCase()}
                  </span>
                </div>
                <p className="truncate font-space text-xs text-faint">
                  Joined {formatDate(subscriber.createdAt)}
                  {subscriber.source ? ` · from /blog/${subscriber.source}` : ""}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setStatus(
                      subscriber.id,
                      subscriber.status === "ACTIVE" ? "UNSUBSCRIBED" : "ACTIVE"
                    )
                  }
                  className="text-xs text-muted hover:text-ink"
                >
                  {subscriber.status === "ACTIVE" ? "Unsubscribe" : "Reactivate"}
                </button>
                <button
                  type="button"
                  onClick={() => remove(subscriber)}
                  className="text-xs text-red-500 hover:text-red-400"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </AdminShell>
  );
}

export async function getServerSideProps() {
  const subscribers = await prisma.subscriber.findMany({
    orderBy: { createdAt: "desc" },
    // The unsubscribe token is a credential for the reader; the admin UI
    // never needs it, so it never leaves the server.
    select: { id: true, email: true, status: true, source: true, createdAt: true },
  });
  return { props: { initialSubscribers: serialize(subscribers) } };
}

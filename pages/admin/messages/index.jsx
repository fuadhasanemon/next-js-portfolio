import { useState } from "react";

import AdminShell from "@/components/admin/AdminShell";
import { Select } from "@/components/admin/Fields";
import SaveStatus from "@/components/admin/SaveStatus";
import { prisma, serialize } from "@/lib/prisma";

const STATUSES = ["NEW", "READ", "ARCHIVED"];

const TONE = {
  NEW: "bg-emerald-500/15 text-emerald-500",
  READ: "bg-ink/10 text-muted",
  ARCHIVED: "bg-ink/10 text-faint",
};

const formatDate = (value) =>
  new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const FILTERS = [
  { label: "Inbox", value: "INBOX" },
  { label: "New", value: "NEW" },
  { label: "Read", value: "READ" },
  { label: "Archived", value: "ARCHIVED" },
];

export default function AdminMessages({ initialMessages }) {
  const [messages, setMessages] = useState(initialMessages);
  const [filter, setFilter] = useState("INBOX");
  const [openId, setOpenId] = useState(null);
  const [saveState, setSaveState] = useState("idle");

  const visible = messages.filter((m) =>
    filter === "INBOX" ? m.status !== "ARCHIVED" : m.status === filter
  );

  const setStatus = async (id, status) => {
    const previous = messages;
    // Optimistic: the list is the only place this value is shown.
    setMessages((list) =>
      list.map((m) => (m.id === id ? { ...m, status } : m))
    );
    setSaveState("saving");

    const res = await fetch(`/api/admin/messages/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    if (res.ok) {
      setSaveState("saved");
      setTimeout(() => setSaveState("idle"), 2200);
    } else {
      setMessages(previous);
      setSaveState("error");
    }
  };

  /** Opening an unread message marks it read, the way an inbox would. */
  const toggle = (message) => {
    const next = openId === message.id ? null : message.id;
    setOpenId(next);
    if (next && message.status === "NEW") setStatus(message.id, "READ");
  };

  return (
    <AdminShell
      title="Messages"
      actions={<SaveStatus state={saveState} />}
    >
      <div className="mb-6 flex flex-wrap items-center gap-1">
        {FILTERS.map((tab) => {
          const count =
            tab.value === "INBOX"
              ? messages.filter((m) => m.status !== "ARCHIVED").length
              : messages.filter((m) => m.status === tab.value).length;

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
          {messages.length === 0
            ? "No messages yet. They'll appear here when someone uses the contact form."
            : "Nothing in this view."}
        </p>
      ) : (
        <ul className="space-y-3">
          {visible.map((message) => {
            const open = openId === message.id;

            return (
              <li
                key={message.id}
                className="rounded-2xl border transition-colors"
                style={{ borderColor: "rgb(var(--line) / 0.12)" }}
              >
                <button
                  type="button"
                  onClick={() => toggle(message)}
                  aria-expanded={open}
                  className="flex w-full flex-wrap items-center gap-x-4 gap-y-2 p-4 text-left"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="truncate text-sm font-medium text-ink">
                        {message.name}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[0.65rem] ${
                          TONE[message.status]
                        }`}
                      >
                        {message.status.toLowerCase()}
                      </span>
                    </div>
                    <p className="truncate font-space text-xs text-faint">
                      {message.email} · {message.needs}
                      {message.budget ? ` · ${message.budget}` : ""}
                    </p>
                  </div>

                  <span className="shrink-0 text-xs text-faint">
                    {formatDate(message.createdAt)}
                  </span>
                </button>

                {open && (
                  <div
                    className="border-t px-4 py-4"
                    style={{ borderColor: "rgb(var(--line) / 0.1)" }}
                  >
                    <dl className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <dt className="text-xs text-faint">Email</dt>
                        <dd className="mt-0.5 text-sm text-ink">
                          <a
                            href={`mailto:${message.email}`}
                            className="link-underline"
                          >
                            {message.email}
                          </a>
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs text-faint">Budget</dt>
                        <dd className="mt-0.5 text-sm text-ink">
                          {message.budget || "—"}
                        </dd>
                      </div>
                      <div className="sm:col-span-2">
                        <dt className="text-xs text-faint">Needs</dt>
                        <dd className="mt-0.5 text-sm text-ink">{message.needs}</dd>
                      </div>
                    </dl>

                    <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-muted">
                      {message.message}
                    </p>

                    <div className="mt-5 flex flex-wrap items-center gap-3">
                      <label
                        htmlFor={`status-${message.id}`}
                        className="text-xs text-faint"
                      >
                        Status
                      </label>
                      {/* Select renders w-full, so the width is set here. */}
                      <div className="w-40">
                        <Select
                          id={`status-${message.id}`}
                          value={message.status}
                          onChange={(e) => setStatus(message.id, e.target.value)}
                        >
                          {STATUSES.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </Select>
                      </div>
                      <a
                        href={`mailto:${message.email}?subject=${encodeURIComponent(
                          `Re: ${message.needs}`
                        )}`}
                        className="text-xs text-muted hover:text-ink"
                      >
                        Reply by email ↗
                      </a>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </AdminShell>
  );
}

export async function getServerSideProps() {
  const messages = await prisma.contactMessage.findMany({
    orderBy: { createdAt: "desc" },
  });
  return { props: { initialMessages: serialize(messages) } };
}

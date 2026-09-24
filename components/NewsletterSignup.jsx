import { useState } from "react";

import Spinner from "@/components/Spinner";
import { LIMITS } from "@/lib/newsletter";

const FIELD =
  "min-w-0 flex-1 rounded-lg border bg-transparent px-3.5 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-faint focus:border-accent";
const LINE = { borderColor: "rgb(var(--line) / 0.16)" };
const INVALID = { borderColor: "rgb(239 68 68 / 0.6)" };

/**
 * End-of-article signup. One field, so errors are a single line under it
 * rather than the per-field map the contact form keeps.
 */
const NewsletterSignup = ({ source }) => {
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [state, setState] = useState("idle"); // idle | sending | sent | error
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    if (state === "sending") return;

    setState("sending");
    setError("");

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source, website }),
      });

      if (res.ok) {
        setEmail("");
        setState("sent");
        return;
      }

      const payload = await res.json().catch(() => ({}));
      setError(payload.error || "Something went wrong. Please try again.");
      setState("error");
    } catch {
      setError("Could not reach the server. Check your connection and try again.");
      setState("error");
    }
  };

  const sending = state === "sending";

  return (
    <section
      aria-labelledby="newsletter-heading"
      className="article-rail mt-16 rounded-2xl border p-6 sm:p-8"
      style={{
        borderColor: "rgb(var(--line) / 0.12)",
        background: "rgb(var(--surface) / 0.6)",
      }}
    >
      <p className="eyebrow">Newsletter</p>
      <h2
        id="newsletter-heading"
        className="mt-3 text-fluid-h3 font-semibold text-ink"
      >
        Get the next article in your inbox
      </h2>
      <p className="mt-3 text-fluid-sm text-muted">
        Practical notes on building full-stack products and AI automation. No
        spam, and you can leave any time.
      </p>

      {state === "sent" ? (
        <p role="status" className="mt-6 text-sm font-medium text-ink">
          You&apos;re on the list — thanks for reading.
        </p>
      ) : (
        <form onSubmit={submit} noValidate className="mt-6">
          <label htmlFor="newsletter-email" className="sr-only">
            Email address
          </label>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              id="newsletter-email"
              type="email"
              name="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              maxLength={LIMITS.email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError("");
              }}
              className={FIELD}
              style={error ? { ...LINE, ...INVALID } : LINE}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? "newsletter-error" : undefined}
            />
            <button
              type="submit"
              disabled={sending}
              aria-busy={sending || undefined}
              className="btn-primary justify-center"
            >
              {sending && <Spinner className="h-3.5 w-3.5" />}
              {sending ? "Subscribing…" : "Subscribe"}
            </button>
          </div>

          {/* Honeypot, off-screen like the contact form's. */}
          <div
            aria-hidden="true"
            className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden"
          >
            <label htmlFor="newsletter-website">Website</label>
            <input
              id="newsletter-website"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
            />
          </div>

          {error && (
            <p id="newsletter-error" role="alert" className="mt-2 text-xs text-red-500">
              {error}
            </p>
          )}
        </form>
      )}
    </section>
  );
};

export default NewsletterSignup;

import { useState } from "react";

import Spinner from "@/components/Spinner";
import { LIMITS } from "@/lib/contact";

const FIELD =
  "w-full rounded-lg border bg-transparent px-3.5 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-faint focus:border-accent";
const LINE = { borderColor: "rgb(var(--line) / 0.16)" };
const INVALID = { borderColor: "rgb(239 68 68 / 0.6)" };

const EMPTY = { name: "", email: "", needs: "", budget: "", message: "" };

const Row = ({ id, label, error, optional, children }) => (
  <div>
    <label htmlFor={id} className="mb-1.5 block text-xs font-medium text-muted">
      {label}
      {optional && <span className="ml-1.5 text-faint">(optional)</span>}
    </label>
    {children}
    {error && (
      <p id={`${id}-error`} className="mt-1.5 text-xs text-red-500">
        {error}
      </p>
    )}
  </div>
);

const ContactForm = () => {
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [state, setState] = useState("idle"); // idle | sending | sent | error
  const [formError, setFormError] = useState("");

  const set = (key) => (e) => {
    setValues((v) => ({ ...v, [key]: e.target.value }));
    // Clear the field's error as soon as the visitor starts fixing it.
    setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev));
  };

  const props = (key) => ({
    id: key,
    name: key,
    value: values[key],
    onChange: set(key),
    maxLength: LIMITS[key],
    className: FIELD,
    style: errors[key] ? { ...LINE, ...INVALID } : LINE,
    "aria-invalid": errors[key] ? true : undefined,
    "aria-describedby": errors[key] ? `${key}-error` : undefined,
  });

  const submit = async (e) => {
    e.preventDefault();
    if (state === "sending") return;

    setState("sending");
    setErrors({});
    setFormError("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (res.ok) {
        setValues(EMPTY);
        setState("sent");
        return;
      }

      const payload = await res.json().catch(() => ({}));
      setErrors(payload.errors || {});
      setFormError(payload.error || "Something went wrong. Please try again.");
      setState("error");
    } catch {
      setFormError(
        "Could not reach the server. Check your connection, or email me directly."
      );
      setState("error");
    }
  };

  if (state === "sent") {
    return (
      <div
        role="status"
        className="rounded-2xl border p-6 text-center"
        style={{ borderColor: "rgb(var(--line) / 0.16)" }}
      >
        <p className="text-sm font-medium text-ink">Message sent — thank you.</p>
        <p className="mt-2 text-sm text-muted">
          It landed in my inbox. I reply within a day or two.
        </p>
        <button
          type="button"
          onClick={() => setState("idle")}
          className="link-underline mt-4 text-sm text-muted"
        >
          Send another
        </button>
      </div>
    );
  }

  const sending = state === "sending";

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Row id="name" label="Name" error={errors.name}>
          <input
            type="text"
            autoComplete="name"
            placeholder="Your name"
            {...props("name")}
          />
        </Row>

        <Row id="email" label="Email" error={errors.email}>
          <input
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            {...props("email")}
          />
        </Row>
      </div>

      <Row id="needs" label="What do you need?" error={errors.needs}>
        <input
          type="text"
          placeholder="A website, a web app, automation…"
          {...props("needs")}
        />
      </Row>

      <Row id="budget" label="Rough budget" error={errors.budget} optional>
        <input type="text" placeholder="Even a range helps" {...props("budget")} />
      </Row>

      <Row id="message" label="Message" error={errors.message}>
        <textarea
          rows={5}
          placeholder="What are you trying to build, and by when?"
          {...props("message")}
        />
      </Row>

      {/* Honeypot: off-screen rather than display:none, which some bots skip. */}
      <div aria-hidden="true" className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden">
        <label htmlFor="website">Website</label>
        <input
          id="website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={values.website || ""}
          onChange={set("website")}
        />
      </div>

      {formError && (
        <p role="alert" className="text-sm text-red-500">
          {formError}
        </p>
      )}

      <button
        type="submit"
        disabled={sending}
        aria-busy={sending || undefined}
        className="btn-primary w-full justify-center sm:w-auto"
      >
        {sending && <Spinner className="h-3.5 w-3.5" />}
        {sending ? "Sending…" : "Send message"}
      </button>
    </form>
  );
};

export default ContactForm;

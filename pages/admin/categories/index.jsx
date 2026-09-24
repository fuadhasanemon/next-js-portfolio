import { useState } from "react";
import Link from "next/link";

import AdminShell from "@/components/admin/AdminShell";
import { Button, Field, Input, Panel, Textarea } from "@/components/admin/Fields";
import SaveStatus from "@/components/admin/SaveStatus";
import { LIMITS, listCategories } from "@/lib/categories";
import { serialize } from "@/lib/prisma";
import { slugify } from "@/lib/site";

const EMPTY = { name: "", description: "" };

const byName = (a, b) => a.name.localeCompare(b.name);

/** Shared by the create form and each row's inline editor. */
const CategoryForm = ({ initial = EMPTY, submitLabel, onSubmit, onCancel }) => {
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState({});
  const [pending, setPending] = useState(false);

  const set = (key) => (e) => {
    setValues((v) => ({ ...v, [key]: e.target.value }));
    setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev));
  };

  const submit = async (e) => {
    e.preventDefault();
    if (pending) return;
    setPending(true);
    const result = await onSubmit(values);
    setPending(false);
    if (result?.errors) setErrors(result.errors);
    else if (!onCancel) setValues(EMPTY); // the create form clears for the next one
  };

  const slug = slugify(values.name);

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <Field
        label="Name"
        hint={slug ? `Link: /blog?category=${slug}` : "Shown on articles and as a tab on the blog."}
      >
        <Input
          value={values.name}
          onChange={set("name")}
          maxLength={LIMITS.name}
          placeholder="e.g. AI Agents"
          aria-invalid={errors.name ? true : undefined}
        />
      </Field>
      {errors.name && <p className="-mt-2 text-xs text-red-500">{errors.name}</p>}

      <Field label="Description" hint="Optional. A line about what this topic covers.">
        <Textarea
          rows={2}
          value={values.description}
          onChange={set("description")}
          maxLength={LIMITS.description}
        />
      </Field>
      {errors.description && (
        <p className="-mt-2 text-xs text-red-500">{errors.description}</p>
      )}
      {errors.form && (
        <p role="alert" className="text-xs text-red-500">
          {errors.form}
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <Button type="submit" loading={pending}>
          {submitLabel}
        </Button>
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
};

export default function AdminCategories({ initialCategories }) {
  const [categories, setCategories] = useState(initialCategories);
  const [editingId, setEditingId] = useState(null);
  const [saveState, setSaveState] = useState("idle");
  const [rowError, setRowError] = useState({});

  const flash = (state) => {
    setSaveState(state);
    if (state === "saved") setTimeout(() => setSaveState("idle"), 2200);
  };

  /** Posts to the API; returns { errors } for the form to show, or null. */
  const send = async (url, method, values) => {
    flash("saving");
    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        flash("error");
        return { errors: payload.errors || { form: payload.error || "Could not save." } };
      }
      flash("saved");
      return { category: payload };
    } catch {
      flash("error");
      return { errors: { form: "Could not reach the server." } };
    }
  };

  const create = async (values) => {
    const { category, errors } = await send("/api/admin/categories", "POST", values);
    if (errors) return { errors };
    setCategories((list) => [...list, category].sort(byName));
    return null;
  };

  const update = (id) => async (values) => {
    const { category, errors } = await send(`/api/admin/categories/${id}`, "PATCH", values);
    if (errors) return { errors };
    setCategories((list) => list.map((c) => (c.id === id ? category : c)).sort(byName));
    setEditingId(null);
    return null;
  };

  const remove = async (category) => {
    if (!confirm(`Delete "${category.name}"? This cannot be undone.`)) return;

    setRowError({});
    flash("saving");
    const res = await fetch(`/api/admin/categories/${category.id}`, { method: "DELETE" });
    if (res.ok) {
      setCategories((list) => list.filter((c) => c.id !== category.id));
      flash("saved");
    } else {
      const payload = await res.json().catch(() => ({}));
      setRowError({ [category.id]: payload.error || "Could not delete." });
      flash("error");
    }
  };

  const used = categories.filter((c) => c.postCount > 0).length;

  return (
    <AdminShell title="Categories" actions={<SaveStatus state={saveState} />}>
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
        <section>
          <p className="mb-4 text-sm text-muted">
            {categories.length} {categories.length === 1 ? "category" : "categories"} · {used} in
            use
          </p>

          {categories.length === 0 ? (
            <p className="text-sm text-muted">
              No categories yet. Add the first one on the right.
            </p>
          ) : (
            <ul className="space-y-3">
              {categories.map((category) => (
                <li
                  key={category.id}
                  className="rounded-2xl border p-4"
                  style={{ borderColor: "rgb(var(--line) / 0.12)" }}
                >
                  {editingId === category.id ? (
                    <CategoryForm
                      initial={{ name: category.name, description: category.description }}
                      submitLabel="Save changes"
                      onSubmit={update(category.id)}
                      onCancel={() => setEditingId(null)}
                    />
                  ) : (
                    <div className="flex flex-wrap items-start gap-x-4 gap-y-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-ink">{category.name}</p>
                        <p className="font-space text-xs text-faint">
                          /{category.slug} ·{" "}
                          {category.postCount === 0 ? (
                            "no posts"
                          ) : (
                            <Link
                              href={`/blog?category=${category.slug}`}
                              target="_blank"
                              className="hover:text-ink"
                            >
                              {category.postCount}{" "}
                              {category.postCount === 1 ? "post" : "posts"} ↗
                            </Link>
                          )}
                        </p>
                        {category.description && (
                          <p className="mt-2 text-sm text-muted">{category.description}</p>
                        )}
                        {rowError[category.id] && (
                          <p role="alert" className="mt-2 text-xs text-red-500">
                            {rowError[category.id]}
                          </p>
                        )}
                      </div>

                      <div className="flex shrink-0 items-center gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            setRowError({});
                            setEditingId(category.id);
                          }}
                          className="text-xs text-muted hover:text-ink"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => remove(category)}
                          disabled={category.postCount > 0}
                          title={
                            category.postCount > 0
                              ? "Move its posts to another category before deleting"
                              : undefined
                          }
                          className="text-xs text-red-500 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="lg:sticky lg:top-8">
          <Panel
            title="New category"
            description="Renaming a category later updates every post that uses it."
          >
            <CategoryForm submitLabel="Add category" onSubmit={create} />
          </Panel>
        </div>
      </div>
    </AdminShell>
  );
}

export async function getServerSideProps() {
  return { props: { initialCategories: serialize(await listCategories()) } };
}

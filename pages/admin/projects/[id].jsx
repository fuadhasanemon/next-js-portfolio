import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";

import AdminShell from "@/components/admin/AdminShell";
import { Button, Field, Input, Panel, Textarea, Toggle } from "@/components/admin/Fields";
import ImageInput from "@/components/admin/ImageInput";
import useUnsavedChanges from "@/hooks/useUnsavedChanges";
import { prisma, serialize } from "@/lib/prisma";
import { slugify } from "@/lib/site";

const EMPTY = {
  title: "",
  slug: "",
  shortDescription: "",
  description: "",
  role: "",
  technologies: [],
  coverImage: "",
  coverAlt: "",
  liveUrl: "",
  githubUrl: "",
  featured: false,
  published: false,
  seoTitle: "",
  seoDescription: "",
  canonicalUrl: "",
  ogImage: "",
  noIndex: false,
};

/** The live form and the saved baseline must share a shape to be comparable. */
const fromProject = (project) => ({ ...EMPTY, ...(project || {}) });

export default function ProjectEditor({ project, isNew }) {
  const router = useRouter();
  const [form, setForm] = useState(() => fromProject(project));
  // Snapshot of what is on the server; anything else means unsaved edits.
  const [saved, setSaved] = useState(() => JSON.stringify(fromProject(project)));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const dirty = JSON.stringify(form) !== saved;
  const release = useUnsavedChanges(dirty);

  /** Adopt server data as both the form contents and the clean baseline. */
  const adopt = (project) => {
    const next = fromProject(project);
    setForm(next);
    setSaved(JSON.stringify(next));
  };

  // `/admin/projects/new` and `/admin/projects/[id]` are the same route, so a
  // create swaps the props on the mounted component instead of remounting it.
  useEffect(() => {
    adopt(project);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project?.id]);

  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));
  const onField = (key) => (e) => set(key)(e.target.value);

  const save = async (e) => {
    e.preventDefault();
    if (busy) return; // guards against a double submit
    setBusy(true);
    setError("");

    try {
      const res = await fetch(
        isNew ? "/api/admin/projects" : `/api/admin/projects/${project.id}`,
        {
          method: isNew ? "POST" : "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );

      if (!res.ok) {
        setError((await res.json().catch(() => ({}))).error || "Save failed");
        return;
      }

      const result = await res.json();

      if (isNew) {
        // The redirect is ours, and the project is already stored — the guard
        // must not question it. Awaiting the navigation is also what lets the
        // button stop spinning once the saved project is on screen.
        release();
        await router.replace(`/admin/projects/${result.id}`);
      } else {
        adopt(result);
      }
    } catch {
      setError("Save failed — check your connection and try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AdminShell
      title={isNew ? "New project" : "Edit project"}
      actions={
        <>
          {!isNew && form.published && (
            <Link
              href={`/work/${form.slug}`}
              target="_blank"
              className="text-sm text-muted hover:text-ink"
            >
              View ↗
            </Link>
          )}
          <Link href="/admin/projects" className="text-sm text-muted hover:text-ink">
            Back
          </Link>
        </>
      }
    >
      <form onSubmit={save} className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-6">
          <Panel title="Content">
            <Field label="Title">
              <Input required value={form.title} onChange={onField("title")} />
            </Field>

            <Field label="Slug" hint={`/work/${slugify(form.slug || form.title) || "…"}`}>
              <Input
                value={form.slug}
                onChange={onField("slug")}
                placeholder="Leave blank to generate from the title"
              />
            </Field>

            <Field label="Short description" hint="Shown on the work grid and in search results.">
              <Textarea rows={2} value={form.shortDescription} onChange={onField("shortDescription")} />
            </Field>

            <Field label="Description" hint="Markdown supported. Shown on the project page.">
              <Textarea rows={10} value={form.description} onChange={onField("description")} />
            </Field>

            <Field label="Role">
              <Input value={form.role} onChange={onField("role")} placeholder="Frontend engineer" />
            </Field>

            <Field label="Technologies" hint="Comma separated.">
              <Input
                value={Array.isArray(form.technologies) ? form.technologies.join(", ") : form.technologies}
                onChange={(e) => set("technologies")(e.target.value.split(","))}
                placeholder="Next.js, TypeScript, Tailwind"
              />
            </Field>
          </Panel>

          <Panel title="Links">
            <Field label="Live URL">
              <Input value={form.liveUrl || ""} onChange={onField("liveUrl")} placeholder="https://" />
            </Field>
            <Field label="GitHub URL">
              <Input value={form.githubUrl || ""} onChange={onField("githubUrl")} placeholder="https://github.com/" />
            </Field>
          </Panel>

          <Panel title="SEO" description="Leave blank to derive sensible defaults from the content.">
            <Field label="SEO title">
              <Input value={form.seoTitle || ""} onChange={onField("seoTitle")} />
            </Field>
            <Field label="Meta description">
              <Textarea rows={2} value={form.seoDescription || ""} onChange={onField("seoDescription")} />
            </Field>
            <Field label="Canonical URL">
              <Input value={form.canonicalUrl || ""} onChange={onField("canonicalUrl")} />
            </Field>
            <ImageInput
              label="OG image"
              folder="work"
              value={form.ogImage}
              onChange={set("ogImage")}
            />
            <Toggle
              label="No-index this project"
              checked={form.noIndex}
              onChange={set("noIndex")}
            />
          </Panel>
        </div>

        <aside className="space-y-6">
          <Panel title="Status">
            <Toggle
              label="Published"
              hint="Unpublished projects are hidden from the site and the sitemap."
              checked={form.published}
              onChange={set("published")}
            />
            <Toggle label="Featured" checked={form.featured} onChange={set("featured")} />

            {error && <p className="text-sm text-red-500">{error}</p>}
            {dirty && !error && (
              <p className="text-xs text-faint">Unsaved changes</p>
            )}

            <Button type="submit" loading={busy} className="w-full justify-center">
              {busy ? "Saving…" : isNew ? "Create project" : "Save changes"}
            </Button>
          </Panel>

          <Panel title="Cover image">
            <ImageInput
              label="Image URL"
              folder="work"
              value={form.coverImage}
              alt={form.coverAlt}
              onChange={set("coverImage")}
              onAltChange={set("coverAlt")}
            />
          </Panel>
        </aside>
      </form>
    </AdminShell>
  );
}

export async function getServerSideProps({ params }) {
  if (params.id === "new") return { props: { project: null, isNew: true } };

  const project = await prisma.project.findUnique({ where: { id: params.id } });
  if (!project) return { notFound: true };

  return { props: { project: serialize(project), isNew: false } };
}

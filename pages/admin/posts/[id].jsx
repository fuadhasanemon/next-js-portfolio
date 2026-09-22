import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";

import AdminShell from "@/components/admin/AdminShell";
import { Button, Field, Input, Panel, Select, Textarea, Toggle } from "@/components/admin/Fields";
import ImageInput from "@/components/admin/ImageInput";
import MarkdownEditor from "@/components/admin/MarkdownEditor";
import useUnsavedChanges from "@/hooks/useUnsavedChanges";
import { prisma, serialize } from "@/lib/prisma";
import { CATEGORIES, readingTime, slugify } from "@/lib/site";

const EMPTY = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  coverImage: "",
  coverAlt: "",
  category: "",
  tags: [],
  author: "Fuad Hasan Emon",
  featured: false,
  published: false,
  publishedAt: "",
  seoTitle: "",
  seoDescription: "",
  canonicalUrl: "",
  ogTitle: "",
  ogDescription: "",
  ogImage: "",
  noIndex: false,
};

/** <input type="datetime-local"> needs `YYYY-MM-DDTHH:mm` in local time. */
const toLocalInput = (value) => {
  if (!value) return "";
  const d = new Date(value);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
};

/** The live form and the saved baseline must share a shape to be comparable. */
const fromPost = (post) => ({
  ...EMPTY,
  ...(post || {}),
  publishedAt: toLocalInput(post?.publishedAt),
});

export default function PostEditor({ post, isNew }) {
  const router = useRouter();
  const [form, setForm] = useState(() => fromPost(post));
  // Snapshot of what is on the server; anything else means unsaved edits.
  const [saved, setSaved] = useState(() => JSON.stringify(fromPost(post)));
  // "save" | "toggle" | null — so only the clicked button shows a spinner.
  const [pending, setPending] = useState(null);
  const busy = pending !== null;
  const [error, setError] = useState("");

  const dirty = JSON.stringify(form) !== saved;
  const release = useUnsavedChanges(dirty);

  /** Adopt server data as both the form contents and the clean baseline. */
  const adopt = (post) => {
    const next = fromPost(post);
    setForm(next);
    setSaved(JSON.stringify(next));
  };

  // `/admin/posts/new` and `/admin/posts/[id]` are the same route, so creating
  // an article swaps the props on the mounted component instead of remounting
  // it. Without this the editor would keep showing the blank `new` state.
  useEffect(() => {
    adopt(post);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [post?.id]);

  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));
  const onField = (key) => (e) => set(key)(e.target.value);

  const submit = async (e, publishedOverride) => {
    e.preventDefault();
    if (busy) return; // guards against a double submit
    setPending(typeof publishedOverride === "boolean" ? "toggle" : "save");
    setError("");

    const payload = {
      ...form,
      published:
        typeof publishedOverride === "boolean" ? publishedOverride : form.published,
      publishedAt: form.publishedAt ? new Date(form.publishedAt).toISOString() : null,
    };

    try {
      const res = await fetch(
        isNew ? "/api/admin/posts" : `/api/admin/posts/${post.id}`,
        {
          method: isNew ? "POST" : "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        setError((await res.json().catch(() => ({}))).error || "Save failed");
        return;
      }

      const result = await res.json();

      if (isNew) {
        // The redirect is ours, and the article is already stored — the guard
        // must not question it. Awaiting the navigation is also what lets the
        // button stop spinning once the saved article is on screen.
        release();
        await router.replace(`/admin/posts/${result.id}`);
      } else {
        adopt(result);
      }
    } catch {
      setError("Save failed — check your connection and try again.");
    } finally {
      setPending(null);
    }
  };

  return (
    <AdminShell
      title={isNew ? "New article" : "Edit article"}
      actions={
        <>
          {!isNew && form.published && (
            <Link href={`/blog/${form.slug}`} target="_blank" className="text-sm text-muted hover:text-ink">
              View ↗
            </Link>
          )}
          <Link href="/admin/posts" className="text-sm text-muted hover:text-ink">
            Back
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-6">
          <Panel title="Article">
            <Field label="Title">
              <Input required value={form.title} onChange={onField("title")} />
            </Field>

            <Field label="Slug" hint={`/blog/${slugify(form.slug || form.title) || "…"}`}>
              <Input
                value={form.slug}
                onChange={onField("slug")}
                placeholder="Leave blank to generate from the title"
              />
            </Field>

            <Field label="Excerpt" hint="Used on the blog index and as the fallback meta description.">
              <Textarea rows={2} value={form.excerpt} onChange={onField("excerpt")} />
            </Field>

            <Field label={`Content · ~${readingTime(form.content)} min read`}>
              <MarkdownEditor value={form.content} onChange={set("content")} />
            </Field>
          </Panel>

          <Panel title="SEO" description="Leave blank to derive sensible defaults from the article.">
            <Field label="SEO title">
              <Input value={form.seoTitle || ""} onChange={onField("seoTitle")} />
            </Field>
            <Field label="Meta description">
              <Textarea rows={2} value={form.seoDescription || ""} onChange={onField("seoDescription")} />
            </Field>
            <Field label="Canonical URL">
              <Input value={form.canonicalUrl || ""} onChange={onField("canonicalUrl")} />
            </Field>
            <Field label="OG title">
              <Input value={form.ogTitle || ""} onChange={onField("ogTitle")} />
            </Field>
            <Field label="OG description">
              <Textarea rows={2} value={form.ogDescription || ""} onChange={onField("ogDescription")} />
            </Field>
            <ImageInput
              label="OG image"
              folder="blog"
              value={form.ogImage}
              onChange={set("ogImage")}
            />
            <Toggle label="No-index this article" checked={form.noIndex} onChange={set("noIndex")} />
          </Panel>
        </div>

        <aside className="space-y-6">
          <Panel title="Status">
            <Toggle
              label="Published"
              hint="Drafts stay off the site and out of the sitemap."
              checked={form.published}
              onChange={set("published")}
            />
            <Toggle label="Featured" checked={form.featured} onChange={set("featured")} />

            <Field label="Publish date" hint="Set automatically on first publish.">
              <Input
                type="datetime-local"
                value={form.publishedAt}
                onChange={onField("publishedAt")}
              />
            </Field>

            {error && <p className="text-sm text-red-500">{error}</p>}
            {dirty && !error && (
              <p className="text-xs text-faint">Unsaved changes</p>
            )}

            <div className="flex flex-col gap-2">
              <Button
                type="submit"
                loading={pending === "save"}
                disabled={busy}
                className="w-full justify-center"
              >
                {pending === "save" ? "Saving…" : isNew ? "Create article" : "Save changes"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                loading={pending === "toggle"}
                disabled={busy}
                onClick={(e) => submit(e, !form.published)}
                className="w-full justify-center"
              >
                {pending === "toggle"
                  ? "Saving…"
                  : form.published
                  ? "Save as draft"
                  : "Save & publish"}
              </Button>
            </div>
          </Panel>

          <Panel title="Organise">
            <Field label="Category">
              <Select value={form.category} onChange={onField("category")}>
                <option value="">None</option>
                {/* An older article may hold a category the preset list no
                    longer carries — keep it selectable rather than blank. */}
                {(form.category && !CATEGORIES.includes(form.category)
                  ? [form.category, ...CATEGORIES]
                  : CATEGORIES
                ).map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Tags" hint="Comma separated.">
              <Input
                value={Array.isArray(form.tags) ? form.tags.join(", ") : form.tags}
                onChange={(e) => set("tags")(e.target.value.split(","))}
                placeholder="nextjs, ai agents, automation"
              />
            </Field>

            <Field label="Author">
              <Input value={form.author} onChange={onField("author")} />
            </Field>
          </Panel>

          <Panel title="Cover image">
            <ImageInput
              label="Image URL"
              folder="blog"
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
  if (params.id === "new") return { props: { post: null, isNew: true } };

  const post = await prisma.post.findUnique({ where: { id: params.id } });
  if (!post) return { notFound: true };

  return { props: { post: serialize(post), isNew: false } };
}

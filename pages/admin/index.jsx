import Link from "next/link";

import AdminShell from "@/components/admin/AdminShell";
import { prisma } from "@/lib/prisma";

const Stat = ({ label, value, href }) => {
  const body = (
    <div
      className="rounded-2xl border p-5 transition-colors hover:border-accent/40"
      style={{ borderColor: "rgb(var(--line) / 0.12)" }}
    >
      <p className="text-3xl font-semibold text-ink">{value}</p>
      <p className="mt-1 text-xs text-muted">{label}</p>
    </div>
  );
  return href ? <Link href={href}>{body}</Link> : body;
};

export default function AdminDashboard({ stats }) {
  return (
    <AdminShell title="Dashboard">
      <section className="mb-10">
        <h2 className="eyebrow mb-4">Projects</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Stat label="Total projects" value={stats.projects} href="/admin/projects" />
          <Stat label="Published" value={stats.projectsPublished} />
          <Stat label="Drafts" value={stats.projectsDraft} />
        </div>
      </section>

      <section className="mb-10">
        <h2 className="eyebrow mb-4">Blog</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Stat label="Total posts" value={stats.posts} href="/admin/posts" />
          <Stat label="Published" value={stats.postsPublished} />
          <Stat label="Drafts" value={stats.postsDraft} />
        </div>
      </section>

      <section className="mb-10">
        <h2 className="eyebrow mb-4">Messages</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Stat label="Total messages" value={stats.messages} href="/admin/messages" />
          <Stat label="New" value={stats.messagesNew} href="/admin/messages" />
          <Stat label="Archived" value={stats.messagesArchived} />
        </div>
      </section>

      <section className="mb-10">
        <h2 className="eyebrow mb-4">Newsletter</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Stat label="Active subscribers" value={stats.subscribersActive} href="/admin/subscribers" />
          <Stat label="Joined in the last 30 days" value={stats.subscribersRecent} href="/admin/subscribers" />
          <Stat label="Unsubscribed" value={stats.subscribersGone} />
        </div>
      </section>

      <div className="flex flex-wrap gap-3">
        <Link href="/admin/projects/new" className="btn-primary">
          New project
        </Link>
        <Link href="/admin/posts/new" className="btn-ghost">
          New article
        </Link>
      </div>
    </AdminShell>
  );
}

export async function getServerSideProps() {
  const [
    projects,
    projectsPublished,
    posts,
    postsPublished,
    messages,
    messagesNew,
    messagesArchived,
    subscribersActive,
    subscribersRecent,
    subscribersGone,
  ] = await Promise.all([
    prisma.project.count(),
    prisma.project.count({ where: { published: true } }),
    prisma.post.count(),
    prisma.post.count({ where: { published: true } }),
    prisma.contactMessage.count(),
    prisma.contactMessage.count({ where: { status: "NEW" } }),
    prisma.contactMessage.count({ where: { status: "ARCHIVED" } }),
    prisma.subscriber.count({ where: { status: "ACTIVE" } }),
    prisma.subscriber.count({
      where: {
        status: "ACTIVE",
        createdAt: { gte: new Date(Date.now() - 30 * 24 * 3600 * 1000) },
      },
    }),
    prisma.subscriber.count({ where: { status: "UNSUBSCRIBED" } }),
  ]);

  return {
    props: {
      stats: {
        projects,
        projectsPublished,
        projectsDraft: projects - projectsPublished,
        posts,
        postsPublished,
        postsDraft: posts - postsPublished,
        messages,
        messagesNew,
        messagesArchived,
        subscribersActive,
        subscribersRecent,
        subscribersGone,
      },
    },
  };
}

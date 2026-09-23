import { useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

import Spinner from "@/components/Spinner";

const NAV = [
  { label: "Dashboard", href: "/admin" },
  { label: "Projects", href: "/admin/projects" },
  { label: "Blog", href: "/admin/posts" },
  { label: "Messages", href: "/admin/messages" },
  { label: "Settings", href: "/admin/settings" },
];

const AdminShell = ({ title, actions, children }) => {
  const router = useRouter();

  const [loggingOut, setLoggingOut] = useState(false);

  const logout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/admin/login");
  };

  return (
    <>
      <Head>
        <title>{title ? `${title} · Admin` : "Admin"}</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className="min-h-screen bg-bg">
        <header
          className="sticky top-0 z-40 border-b backdrop-blur-xl"
          style={{
            borderColor: "rgb(var(--line) / 0.12)",
            background: "rgb(var(--surface) / 0.85)",
          }}
        >
          <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-3 px-5 py-3">
            <Link href="/admin" className="font-space text-sm text-ink">
              admin
            </Link>

            <nav className="flex flex-wrap items-center gap-1">
              {NAV.map((item) => {
                const active =
                  item.href === "/admin"
                    ? router.pathname === "/admin"
                    : router.pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`rounded-full px-3 py-1.5 text-sm transition-colors ${
                      active ? "text-ink" : "text-muted hover:text-ink"
                    }`}
                    style={
                      active ? { background: "rgb(var(--accent) / 0.12)" } : undefined
                    }
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="ml-auto flex items-center gap-3">
              <Link
                href="/"
                target="_blank"
                className="text-sm text-muted hover:text-ink"
              >
                View site ↗
              </Link>
              <button
                type="button"
                onClick={logout}
                disabled={loggingOut}
                aria-busy={loggingOut || undefined}
                className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-ink disabled:opacity-60"
              >
                {loggingOut && <Spinner className="h-3 w-3" />}
                {loggingOut ? "Signing out…" : "Log out"}
              </button>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-5 py-10">
          {(title || actions) && (
            <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
              <h1 className="text-fluid-h2 font-semibold text-ink">{title}</h1>
              {actions && <div className="flex items-center gap-3">{actions}</div>}
            </div>
          )}
          {children}
        </main>
      </div>
    </>
  );
};

export default AdminShell;

import { useEffect, useRef, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  HiOutlineBriefcase,
  HiOutlineCog,
  HiOutlineDocumentText,
  HiOutlineExternalLink,
  HiOutlineInbox,
  HiOutlineLogout,
  HiOutlineMenu,
  HiOutlinePhotograph,
  HiOutlineTag,
  HiOutlineUserGroup,
  HiOutlineViewGrid,
  HiX,
} from "react-icons/hi";

import Spinner from "@/components/Spinner";

const NAV = [
  { items: [{ label: "Dashboard", href: "/admin", Icon: HiOutlineViewGrid }] },
  {
    heading: "Content",
    items: [
      { label: "Projects", href: "/admin/projects", Icon: HiOutlineBriefcase },
      { label: "Blog", href: "/admin/posts", Icon: HiOutlineDocumentText },
      { label: "Categories", href: "/admin/categories", Icon: HiOutlineTag },
      { label: "Media", href: "/admin/media", Icon: HiOutlinePhotograph },
    ],
  },
  {
    heading: "Audience",
    items: [
      { label: "Messages", href: "/admin/messages", Icon: HiOutlineInbox },
      { label: "Subscribers", href: "/admin/subscribers", Icon: HiOutlineUserGroup },
    ],
  },
  { items: [{ label: "Settings", href: "/admin/settings", Icon: HiOutlineCog }] },
];

const isActive = (pathname, href) =>
  href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

const itemClass = (active) =>
  `flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
    active ? "bg-accent/[0.12] text-ink" : "text-muted hover:bg-line/[0.06] hover:text-ink"
  }`;

/**
 * Admin chrome. A fixed sidebar from lg up; below that the same sidebar is
 * an off-canvas drawer opened from a slim top bar. Closed, the drawer is
 * visibility:hidden as well as translated away, so its links are out of the
 * tab order and the accessibility tree rather than merely off-screen.
 */
const AdminShell = ({ title, actions, children }) => {
  const router = useRouter();

  const [loggingOut, setLoggingOut] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef(null);
  const closeButtonRef = useRef(null);
  const wasOpen = useRef(false);

  const logout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/admin/login");
  };

  // Navigating from the drawer should land on the page, not the open menu.
  useEffect(() => {
    const close = () => setMenuOpen(false);
    router.events.on("routeChangeStart", close);
    return () => router.events.off("routeChangeStart", close);
  }, [router.events]);

  // Focus into the drawer on open and back to the menu button on close;
  // Escape closes it.
  useEffect(() => {
    if (menuOpen) {
      closeButtonRef.current?.focus();
      const onKey = (e) => e.key === "Escape" && setMenuOpen(false);
      window.addEventListener("keydown", onKey);
      wasOpen.current = true;
      return () => window.removeEventListener("keydown", onKey);
    }
    if (wasOpen.current) {
      menuButtonRef.current?.focus();
      wasOpen.current = false;
    }
    return undefined;
  }, [menuOpen]);

  return (
    <>
      <Head>
        <title>{title ? `${title} · Admin` : "Admin"}</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className="min-h-screen bg-bg">
        {/* Top bar, small screens only. */}
        <header
          className="sticky top-0 z-30 flex items-center gap-3 border-b px-4 py-3 backdrop-blur-xl lg:hidden"
          style={{
            borderColor: "rgb(var(--line) / 0.12)",
            background: "rgb(var(--surface) / 0.85)",
          }}
        >
          <button
            ref={menuButtonRef}
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            aria-expanded={menuOpen}
            aria-controls="admin-sidebar"
            className="grid h-9 w-9 place-items-center rounded-lg text-muted transition-colors hover:text-ink"
          >
            <HiOutlineMenu className="h-5 w-5" />
          </button>
          <Link href="/admin" className="font-space text-sm text-ink">
            admin
          </Link>
        </header>

        {/* Backdrop behind the open drawer. */}
        <div
          aria-hidden="true"
          onClick={() => setMenuOpen(false)}
          className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 lg:hidden ${
            menuOpen ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        />

        <aside
          id="admin-sidebar"
          aria-label="Admin"
          className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r transition-[transform,visibility] duration-300 ease-out motion-reduce:transition-none lg:visible lg:z-30 lg:w-60 lg:translate-x-0 ${
            menuOpen ? "visible translate-x-0" : "invisible -translate-x-full"
          }`}
          style={{
            borderColor: "rgb(var(--line) / 0.12)",
            background: "rgb(var(--surface))",
          }}
        >
          <div className="flex items-center justify-between px-5 pb-4 pt-5">
            <Link href="/admin" className="font-space text-sm text-ink">
              admin
            </Link>
            <button
              ref={closeButtonRef}
              type="button"
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
              className="grid h-8 w-8 place-items-center rounded-lg text-muted transition-colors hover:text-ink lg:hidden"
            >
              <HiX className="h-5 w-5" />
            </button>
          </div>

          <nav aria-label="Admin sections" className="flex-1 overflow-y-auto px-3 pb-4">
            {NAV.map((group, i) => (
              <div key={group.heading || i} className={i > 0 ? "mt-5" : ""}>
                {group.heading && (
                  <p className="mb-1.5 px-3 font-space text-[0.65rem] uppercase tracking-[0.16em] text-faint">
                    {group.heading}
                  </p>
                )}
                <ul className="space-y-0.5">
                  {group.items.map(({ label, href, Icon }) => {
                    const active = isActive(router.pathname, href);
                    return (
                      <li key={href}>
                        <Link
                          href={href}
                          aria-current={active ? "page" : undefined}
                          className={itemClass(active)}
                        >
                          <Icon
                            aria-hidden="true"
                            className={`h-[1.1rem] w-[1.1rem] shrink-0 ${
                              active ? "text-accent" : ""
                            }`}
                          />
                          {label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>

          <div
            className="space-y-0.5 border-t px-3 py-3"
            style={{ borderColor: "rgb(var(--line) / 0.12)" }}
          >
            <Link href="/" target="_blank" className={itemClass(false)}>
              <HiOutlineExternalLink aria-hidden="true" className="h-[1.1rem] w-[1.1rem] shrink-0" />
              View site
            </Link>
            <button
              type="button"
              onClick={logout}
              disabled={loggingOut}
              aria-busy={loggingOut || undefined}
              className={`${itemClass(false)} w-full disabled:opacity-60`}
            >
              {loggingOut ? (
                <Spinner className="h-3.5 w-3.5" />
              ) : (
                <HiOutlineLogout aria-hidden="true" className="h-[1.1rem] w-[1.1rem] shrink-0" />
              )}
              {loggingOut ? "Signing out…" : "Log out"}
            </button>
          </div>
        </aside>

        <main className="lg:pl-60">
          <div className="mx-auto max-w-6xl px-5 py-10">
            {(title || actions) && (
              <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
                <h1 className="text-fluid-h2 font-semibold text-ink">{title}</h1>
                {actions && <div className="flex items-center gap-3">{actions}</div>}
              </div>
            )}
            {children}
          </div>
        </main>
      </div>
    </>
  );
};

export default AdminShell;

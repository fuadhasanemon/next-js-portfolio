import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useTheme } from "next-themes";

import { MdOutlineDarkMode, MdOutlineLightMode } from "react-icons/md";

const LINKS = [
  { label: "Work", href: "/work" },
  { label: "Blog", href: "/blog" },
  { label: "About", href: "/about" },
  { label: "Timeline", href: "/timeline" },
  { label: "Tech", href: "/tech" },
  { label: "Contact", href: "/#contact" },
];

/**
 * The name is the mark. Weight and tracking carry it rather than an icon:
 * the surname stays collapsed on a phone and reveals at sm+, so the bar keeps
 * its proportions without falling back to initials.
 */
const Wordmark = () => (
  <Link
    href="/"
    aria-label="Fuad Hasan Emon — home"
    className="wordmark group inline-flex items-baseline text-ink"
  >
    <span className="wordmark-first">Fuad</span>
    <span className="wordmark-rest">Hasan Emon</span>
    <span aria-hidden="true" className="wordmark-dot" />
  </Link>
);

/**
 * The icon buttons read as 36px circles, which is the proportion the bar is
 * drawn around, but 36px is under the 44x44 minimum for a reliable tap. A
 * centred, transparent pseudo-element carries the extra 8px so the target is
 * compliant without the visible circle — or its hover fill — changing size.
 */
const HIT_AREA =
  "relative before:absolute before:left-1/2 before:top-1/2 before:h-11 before:w-11 " +
  "before:-translate-x-1/2 before:-translate-y-1/2 before:content-['']";

const Header = () => {
  const { resolvedTheme, setTheme } = useTheme();
  const router = useRouter();
  const path = router.asPath;

  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const navRef = useRef(null);

  useEffect(() => setMounted(true), []);

  // rAF-throttled: the listener only ever schedules one read per frame.
  useEffect(() => {
    let frame = 0;
    const read = () => {
      frame = 0;
      setScrolled(window.scrollY > 24);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(read);
    };
    read();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => setOpen(false), [path]);

  // Lock the page while the sheet is open, and close on Escape / outside click.
  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  const toggleTheme = useCallback(
    () => setTheme(resolvedTheme === "dark" ? "light" : "dark"),
    [resolvedTheme, setTheme]
  );

  const isDark = mounted && resolvedTheme === "dark";
  const isActive = (href) =>
    href.startsWith("/#") ? false : path === href || path.startsWith(`${href}/`);

  return (
    <header
      ref={navRef}
      data-scrolled={scrolled || open ? "true" : "false"}
      className="site-header fixed inset-x-0 top-0 z-50"
    >
      <div className="site-header__inner shell flex items-center justify-between gap-6">
        <Wordmark />

        <nav aria-label="Main" className="hidden md:block">
          <ul className="flex items-center gap-7 lg:gap-9">
            {LINKS.map((link) => {
              const active = isActive(link.href);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    data-active={active ? "true" : undefined}
                    className="nav-link text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
            className={`${HIT_AREA} grid h-9 w-9 place-items-center rounded-full text-muted transition-colors duration-300 hover:bg-ink/5 hover:text-ink`}
          >
            {mounted &&
              (isDark ? (
                <MdOutlineLightMode className="h-4 w-4" />
              ) : (
                <MdOutlineDarkMode className="h-4 w-4" />
              ))}
          </button>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-nav"
            className={`${HIT_AREA} grid h-9 w-9 place-items-center rounded-full text-ink transition-colors duration-300 hover:bg-ink/5 md:hidden`}
          >
            <span className="flex h-3 w-[18px] flex-col justify-between">
              <span
                className={`block h-[1.5px] w-full origin-center rounded bg-current transition-transform duration-300 ease-out ${
                  open ? "translate-y-[5.25px] rotate-45" : ""
                }`}
              />
              <span
                className={`block h-[1.5px] w-full rounded bg-current transition-all duration-200 ${
                  open ? "scale-x-0 opacity-0" : ""
                }`}
              />
              <span
                className={`block h-[1.5px] w-full origin-center rounded bg-current transition-transform duration-300 ease-out ${
                  open ? "-translate-y-[5.25px] -rotate-45" : ""
                }`}
              />
            </span>
          </button>
        </div>
      </div>

      {/* Hairline that draws itself in as the page leaves the top. */}
      <span aria-hidden="true" className="site-header__rule" />

      {/* Mobile sheet — grid-rows animates height without a magic number. */}
      <div
        id="mobile-nav"
        className="mobile-nav md:hidden"
        data-open={open ? "true" : "false"}
      >
        <div className="min-h-0 overflow-hidden">
          <ul className="shell flex flex-col pb-8 pt-2">
            {LINKS.map((link, i) => {
              const active = isActive(link.href);
              return (
                <li key={link.href} className="mobile-nav__item" style={{ "--i": i }}>
                  <Link
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    tabIndex={open ? 0 : -1}
                    className={`flex items-baseline gap-4 border-b py-4 text-2xl transition-colors duration-300 ${
                      active ? "text-ink" : "text-muted"
                    }`}
                    style={{ borderColor: "rgb(var(--line) / 0.08)" }}
                  >
                    <span className="font-space text-[0.65rem] text-faint">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {link.label}
                    {active && (
                      <span
                        aria-hidden="true"
                        className="ml-auto h-1.5 w-1.5 self-center rounded-full"
                        style={{ background: "rgb(var(--accent))" }}
                      />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </header>
  );
};

export default Header;

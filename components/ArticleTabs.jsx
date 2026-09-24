import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/router";
import { HiOutlineSearch, HiX } from "react-icons/hi";

import PostCard from "@/components/PostCard";
import { slugify } from "@/lib/site";

const ALL = "all";
// Three full rows at the widest layout.
const PAGE = 9;

// Case- and accent-insensitive, so "cafe" still finds "café".
const normalize = (text = "") =>
  text.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "");

/** Every word of the query must appear somewhere in the post. */
const matches = (post, terms) => {
  if (!terms.length) return true;
  const haystack = normalize(`${post.title} ${post.excerpt} ${post.category}`);
  return terms.every((term) => haystack.includes(term));
};

/**
 * Search, category tabs and paging over the non-featured posts.
 *
 * - The search narrows every tab at once; tab counts show matches, so an
 *   empty topic is visible before it's clicked.
 * - The active tab is mirrored to ?category=<slug> so a filtered view can be
 *   linked to. The search text is not: rewriting the URL per keystroke
 *   would be noise for a box that's cleared in a second.
 * - Tabs follow the WAI-ARIA pattern: one tab stop, arrows/Home/End to move.
 */
const ArticleTabs = ({ posts }) => {
  const router = useRouter();
  const [active, setActive] = useState(ALL);
  const [query, setQuery] = useState("");
  const [limit, setLimit] = useState(PAGE);
  const tabRefs = useRef({});
  const panelRef = useRef(null);
  const focusFrom = useRef(null);

  const [searchOpen, setSearchOpen] = useState(false);
  const searchInputRef = useRef(null);
  const searchToggleRef = useRef(null);
  const refocusToggle = useRef(false);

  // Opening hands focus to the field; closing with Escape hands it back to
  // the icon button, so keyboard focus never falls to <body>.
  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
    else if (refocusToggle.current) {
      searchToggleRef.current?.focus();
      refocusToggle.current = false;
    }
  }, [searchOpen]);

  const terms = useMemo(() => normalize(query).split(/\s+/).filter(Boolean), [query]);
  const found = useMemo(() => posts.filter((p) => matches(p, terms)), [posts, terms]);

  // The tab list comes from all posts so it doesn't jump around while
  // typing; only the counts follow the search. Busiest topics first.
  const tabs = useMemo(() => {
    const totals = new Map();
    posts.forEach((p) => {
      if (p.category) totals.set(p.category, (totals.get(p.category) || 0) + 1);
    });
    const hits = new Map();
    found.forEach((p) => {
      if (p.category) hits.set(p.category, (hits.get(p.category) || 0) + 1);
    });
    const categories = [...totals]
      .sort((a, b) => b[1] - a[1])
      .map(([label]) => ({ id: slugify(label), label, count: hits.get(label) || 0 }));
    return [{ id: ALL, label: "All", count: found.length }, ...categories];
  }, [posts, found]);

  // The page is static, so the query only exists once the router is ready.
  // Only a URL change should re-run this — not every keystroke, which
  // changes `tabs` (its counts) but never which tab ids exist.
  useEffect(() => {
    if (!router.isReady) return;
    const wanted = String(router.query.category || "");
    setActive(tabs.some((t) => t.id === wanted) ? wanted : ALL);
    setLimit(PAGE);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady, router.query.category]);

  // After "Load more", move focus to the first new card so keyboard and
  // screen-reader users continue from where the list grew.
  useEffect(() => {
    if (focusFrom.current === null) return;
    const links = panelRef.current?.querySelectorAll(":scope > article > a");
    links?.[focusFrom.current]?.focus();
    focusFrom.current = null;
  }, [limit]);

  const select = (id, { focus = false } = {}) => {
    setActive(id);
    setLimit(PAGE);
    if (focus) tabRefs.current[id]?.focus();
    // replace, not push: flicking through tabs shouldn't fill the history.
    router.replace(
      { pathname: router.pathname, query: id === ALL ? {} : { category: id } },
      undefined,
      { shallow: true, scroll: false }
    );
  };

  const onKeyDown = (event) => {
    const index = tabs.findIndex((t) => t.id === active);
    const target = {
      ArrowRight: tabs[(index + 1) % tabs.length],
      ArrowLeft: tabs[(index - 1 + tabs.length) % tabs.length],
      Home: tabs[0],
      End: tabs[tabs.length - 1],
    }[event.key];
    if (!target) return;
    event.preventDefault();
    select(target.id, { focus: true });
  };

  const search = (value) => {
    setQuery(value);
    setLimit(PAGE);
  };

  const showTabs = tabs.length > 2;
  const current = tabs.find((t) => t.id === active) || tabs[0];
  const inTab =
    current.id === ALL ? found : found.filter((p) => p.category === current.label);
  const shown = inTab.slice(0, limit);
  const remaining = inTab.length - shown.length;

  const loadMore = () => {
    focusFrom.current = shown.length;
    setLimit((n) => n + PAGE);
  };

  // With no tablist on screen (a single topic), the grid is just a grid.
  const panelProps = showTabs
    ? { role: "tabpanel", "aria-labelledby": `tab-${current.id}`, tabIndex: 0 }
    : {};

  return (
    <section className="mt-20" aria-labelledby="articles-heading">
      <div className="flex items-center gap-6">
        <h2 id="articles-heading" className="eyebrow shrink-0">
          Browse by topic
        </h2>

        {/* Collapsed to a round icon button; opening widens it into the
            field. The border lives on the wrapper so the circle and the
            pill are one element animating its width. */}
        <div className="flex min-w-0 flex-1 justify-end">
          <div
            role="search"
            onBlur={(e) => {
              // Fold back up once focus leaves the whole control, unless
              // there's a search in progress to keep on screen.
              if (!query && !e.currentTarget.contains(e.relatedTarget)) {
                setSearchOpen(false);
              }
            }}
            className={`relative h-10 overflow-hidden rounded-full border transition-[width,border-color] duration-300 ease-out focus-within:border-accent motion-reduce:transition-none ${
              searchOpen ? "w-full border-line/[0.16] sm:w-72" : "w-10 border-line/[0.14] hover:border-accent"
            }`}
          >
            <label htmlFor="article-search" className="sr-only">
              Search articles
            </label>
            {searchOpen ? (
              <HiOutlineSearch
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-faint"
              />
            ) : (
              <button
                ref={searchToggleRef}
                type="button"
                onClick={() => setSearchOpen(true)}
                aria-label="Search articles"
                aria-expanded={false}
                aria-controls="article-search"
                className="group absolute inset-0 grid place-items-center"
              >
                <HiOutlineSearch className="h-4 w-4 text-muted transition-colors duration-300 group-hover:text-accent" />
              </button>
            )}
            {/* Hidden with visibility, not just opacity, so a folded field
                is out of the tab order and the accessibility tree. */}
            <input
              ref={searchInputRef}
              id="article-search"
              type="search"
              autoComplete="off"
              placeholder="Search articles…"
              value={query}
              onChange={(e) => search(e.target.value)}
              onKeyDown={(e) => {
                if (e.key !== "Escape") return;
                e.preventDefault();
                if (query) search("");
                else {
                  refocusToggle.current = true;
                  setSearchOpen(false);
                }
              }}
              className={`article-search h-full w-full bg-transparent pl-9 pr-9 text-sm text-ink outline-none transition-[opacity,visibility] duration-200 placeholder:text-faint ${
                searchOpen ? "visible opacity-100 delay-100" : "invisible opacity-0"
              }`}
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  search("");
                  searchInputRef.current?.focus();
                }}
                aria-label="Clear search"
                className="absolute right-1.5 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full text-faint transition-colors hover:text-ink"
              >
                <HiX className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Only worth showing once there is more than one topic to pick. */}
      {showTabs && (
        <div
          role="tablist"
          aria-label="Article topics"
          onKeyDown={onKeyDown}
          className="mt-6 flex flex-wrap gap-2"
        >
          {tabs.map((tab) => {
            const selected = tab.id === current.id;
            return (
              <button
                key={tab.id}
                ref={(el) => {
                  tabRefs.current[tab.id] = el;
                }}
                id={`tab-${tab.id}`}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-controls="articles-panel"
                tabIndex={selected ? 0 : -1}
                onClick={() => select(tab.id)}
                className={`rounded-full border px-4 py-2 text-sm transition-colors duration-300 ${
                  selected
                    ? "border-accent/50 bg-accent/[0.12] text-ink"
                    : "border-line/[0.14] text-muted hover:border-accent hover:text-ink"
                }`}
              >
                {tab.label}
                <span className="ml-2 font-space text-xs text-faint">{tab.count}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Result count for screen readers while typing. */}
      <p role="status" aria-live="polite" className="sr-only">
        {terms.length
          ? `${inTab.length} ${inTab.length === 1 ? "article" : "articles"} found`
          : ""}
      </p>

      {/* Keyed by tab so switching replays the entrance; the page's reveal
          group picks up cards as they're added. */}
      <div
        key={current.id}
        ref={panelRef}
        id="articles-panel"
        {...panelProps}
        className="mt-10 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3"
      >
        {shown.map((post, i) => (
          <PostCard key={post.slug} post={post} delay={(i % 3) * 110} />
        ))}

        {shown.length === 0 && (
          <div className="sm:col-span-2 lg:col-span-3">
            <p className="text-fluid-base text-muted">
              {terms.length ? (
                <>
                  No articles match &ldquo;{query.trim()}&rdquo;
                  {current.id !== ALL && ` in ${current.label}`}.
                </>
              ) : (
                "No articles here yet."
              )}
            </p>
            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
              {terms.length > 0 && (
                <button
                  type="button"
                  onClick={() => search("")}
                  className="link-underline text-sm text-ink"
                >
                  Clear search
                </button>
              )}
              {current.id !== ALL && found.length > 0 && (
                <button
                  type="button"
                  onClick={() => select(ALL)}
                  className="link-underline text-sm text-ink"
                >
                  Show matches in all topics
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {remaining > 0 && (
        <div className="mt-14 flex flex-col items-center gap-3">
          <button type="button" onClick={loadMore} className="btn-ghost">
            Load more articles
          </button>
          <p className="font-space text-xs text-faint">
            Showing {shown.length} of {inTab.length}
          </p>
        </div>
      )}
    </section>
  );
};

export default ArticleTabs;

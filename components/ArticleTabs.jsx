import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/router";

import PostCard from "@/components/PostCard";
import { useRevealGroup } from "@/hooks/useReveal";
import { slugify } from "@/lib/site";

const ALL = "all";

/**
 * The grid for one tab. Keyed by the tab in the parent, so switching tabs
 * mounts a fresh panel — and a fresh reveal group. The page-level group only
 * observes cards that existed on first load, so without this, cards brought
 * in by a tab switch would stay at their hidden starting state.
 */
const Panel = ({ posts, labelledBy }) => {
  const ref = useRevealGroup();
  // With no tablist on screen (a single topic), it's just a grid.
  const tabProps = labelledBy
    ? { role: "tabpanel", "aria-labelledby": labelledBy, tabIndex: 0 }
    : {};
  return (
    <div
      ref={ref}
      id="articles-panel"
      {...tabProps}
      className="mt-10 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3"
    >
      {posts.map((post, i) => (
        <PostCard key={post.slug} post={post} delay={(i % 3) * 110} />
      ))}
    </div>
  );
};

/**
 * Category tabs over the non-featured posts. The active tab is mirrored to
 * ?category=<slug> so a filtered view can be linked to and survives reload.
 * Follows the WAI-ARIA tabs pattern: one tab stop, arrows/Home/End to move.
 */
const ArticleTabs = ({ posts }) => {
  const router = useRouter();
  const [active, setActive] = useState(ALL);
  const tabRefs = useRef({});

  // Busiest topics first; ties keep the posts' own order (newest-ish first).
  const tabs = useMemo(() => {
    const counts = new Map();
    posts.forEach((p) => {
      if (p.category) counts.set(p.category, (counts.get(p.category) || 0) + 1);
    });
    const categories = [...counts]
      .sort((a, b) => b[1] - a[1])
      .map(([label, count]) => ({ id: slugify(label), label, count }));
    return [{ id: ALL, label: "All", count: posts.length }, ...categories];
  }, [posts]);

  // The page is static, so the query only exists once the router is ready.
  useEffect(() => {
    if (!router.isReady) return;
    const wanted = String(router.query.category || "");
    setActive(tabs.some((t) => t.id === wanted) ? wanted : ALL);
  }, [router.isReady, router.query.category, tabs]);

  const select = (id, { focus = false } = {}) => {
    setActive(id);
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

  const showTabs = tabs.length > 2;
  const current = tabs.find((t) => t.id === active) || tabs[0];
  const visible =
    current.id === ALL ? posts : posts.filter((p) => p.category === current.label);

  return (
    <section className="mt-20" aria-labelledby="articles-heading">
      <h2 id="articles-heading" className="eyebrow mb-6">
        Browse by topic
      </h2>

      {/* Only worth showing once there is more than one topic to pick. */}
      {showTabs && (
        <div
          role="tablist"
          aria-label="Article topics"
          onKeyDown={onKeyDown}
          className="flex flex-wrap gap-2"
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

      <Panel
        key={current.id}
        posts={visible}
        labelledBy={showTabs ? `tab-${current.id}` : undefined}
      />
    </section>
  );
};

export default ArticleTabs;

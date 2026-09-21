/**
 * On-demand ISR. Public pages are statically generated, so every admin write
 * refreshes exactly the paths that could have changed.
 */
const TIMEOUT_MS = 5000;

/** Resolves either way — a slow rebuild must never hold up the admin save. */
const withTimeout = (promise) =>
  Promise.race([
    promise.catch(() => {
      // A path that was never generated yet cannot be revalidated; the next
      // request will build it anyway, so this is not an error worth failing on.
    }),
    new Promise((resolve) => setTimeout(resolve, TIMEOUT_MS)),
  ]);

export async function revalidatePaths(res, paths = []) {
  const unique = [...new Set(paths.filter(Boolean))];
  await Promise.all(unique.map((path) => withTimeout(res.revalidate(path))));
}

export const projectPaths = (slug, previousSlug) => [
  "/",
  "/work",
  slug && `/work/${slug}`,
  previousSlug && previousSlug !== slug && `/work/${previousSlug}`,
];

export const postPaths = (slug, previousSlug) => [
  "/blog",
  slug && `/blog/${slug}`,
  previousSlug && previousSlug !== slug && `/blog/${previousSlug}`,
];

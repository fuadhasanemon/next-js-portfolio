/**
 * Server-only Cloudinary Admin/Search API access, over REST like lib/email.js
 * does for Resend. Everything is scoped to the portfolio/ prefix the upload
 * route writes into, so the library can never list or delete anything else
 * in the account.
 */
const ROOT = "portfolio";
export const FOLDERS = ["blog", "work"];

const config = () => {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Cloudinary env vars are not set");
  }
  return {
    base: `https://api.cloudinary.com/v1_1/${cloudName}`,
    auth: `Basic ${Buffer.from(`${apiKey}:${apiSecret}`).toString("base64")}`,
  };
};

/** True for ids this app owns; anything else is refused. */
export const isOwnedId = (publicId) =>
  typeof publicId === "string" &&
  FOLDERS.some((f) => publicId.startsWith(`${ROOT}/${f}/`)) &&
  !publicId.includes("..");

const call = async (path, init = {}) => {
  const { base, auth } = config();
  const res = await fetch(`${base}${path}`, {
    ...init,
    headers: { Authorization: auth, "Content-Type": "application/json", ...init.headers },
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json?.error?.message || `Cloudinary responded ${res.status}`);
  }
  return json;
};

/**
 * Newest-first page of images. The Search API rather than the resources
 * listing, because only search can sort by upload date.
 */
export async function searchImages({ folder, cursor, max = 30 } = {}) {
  const scope = FOLDERS.includes(folder) ? `${ROOT}/${folder}/*` : `${ROOT}/*`;
  const json = await call("/resources/search", {
    method: "POST",
    body: JSON.stringify({
      expression: `resource_type:image AND public_id:${scope}`,
      sort_by: [{ created_at: "desc" }],
      max_results: max,
      ...(cursor ? { next_cursor: cursor } : {}),
    }),
  });

  return {
    total: json.total_count ?? 0,
    nextCursor: json.next_cursor || null,
    items: (json.resources || []).map((r) => ({
      publicId: r.public_id,
      url: r.secure_url,
      folder: r.public_id.split("/")[1],
      format: r.format,
      width: r.width,
      height: r.height,
      bytes: r.bytes,
      createdAt: r.created_at,
    })),
  };
}

/** Deletes one image and purges it from the CDN. */
export async function deleteImage(publicId) {
  const params = new URLSearchParams({ "public_ids[]": publicId, invalidate: "true" });
  const json = await call(`/resources/image/upload?${params}`, { method: "DELETE" });
  return json.deleted?.[publicId] === "deleted";
}

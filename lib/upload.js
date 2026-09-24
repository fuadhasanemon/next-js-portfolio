/**
 * Client-side helpers for the admin's Cloudinary images.
 */

/**
 * Uploads straight to Cloudinary using a signature minted by
 * /api/admin/upload, so no image bytes pass through our own API routes.
 * Resolves to Cloudinary's upload response (secure_url, public_id, …).
 */
export async function uploadImage(file, folder = "work") {
  const sigRes = await fetch("/api/admin/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ folder }),
  });
  if (!sigRes.ok) {
    throw new Error((await sigRes.json().catch(() => ({}))).error || "Signing failed");
  }

  const sig = await sigRes.json();
  const form = new FormData();
  form.append("file", file);
  form.append("api_key", sig.apiKey);
  form.append("timestamp", sig.timestamp);
  form.append("signature", sig.signature);
  form.append("folder", sig.folder);

  const upRes = await fetch(sig.uploadUrl, { method: "POST", body: form });
  const json = await upRes.json();
  if (!upRes.ok) throw new Error(json?.error?.message || "Upload failed");
  return json;
}

/**
 * A small, cropped, auto-format version of a Cloudinary image for grids, so
 * the library never downloads full-size originals just to show a tile.
 * Non-Cloudinary URLs are returned unchanged.
 */
export function thumbUrl(url, { w = 480, h = 320 } = {}) {
  if (!url || !url.includes("/image/upload/")) return url;
  return url.replace(
    "/image/upload/",
    `/image/upload/c_fill,g_auto,w_${w},h_${h},f_auto,q_auto/`
  );
}

export const formatBytes = (bytes = 0) =>
  bytes >= 1024 * 1024
    ? `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`;

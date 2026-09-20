import crypto from "crypto";

import { requireAdmin } from "@/lib/auth";

/**
 * Returns a short-lived Cloudinary signature so the browser can upload
 * directly. The API secret never leaves the server and no binary passes
 * through this function, which keeps us inside Vercel's payload limits.
 */
export default async function handler(req, res) {
  if (!(await requireAdmin(req, res))) return;

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    return res.status(500).json({ error: "Cloudinary env vars are not set" });
  }

  const folder = req.body?.folder === "blog" ? "portfolio/blog" : "portfolio/work";
  const timestamp = Math.round(Date.now() / 1000);

  // Cloudinary signs the alphabetically sorted params that are sent with it.
  const toSign = `folder=${folder}&timestamp=${timestamp}`;
  const signature = crypto
    .createHash("sha1")
    .update(toSign + apiSecret)
    .digest("hex");

  return res.status(200).json({
    cloudName,
    apiKey,
    folder,
    timestamp,
    signature,
    uploadUrl: `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
  });
}

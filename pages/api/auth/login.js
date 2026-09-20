import bcrypt from "bcryptjs";

import { createToken, sessionCookie } from "@/lib/auth";

// Constant-ish delay so a wrong password can't be timed against a missing one.
const FAIL_DELAY = 400;

// A bcrypt hash is always 60 chars: $2<a|b|y>$<cost>$<22 salt + 31 digest>.
const BCRYPT = /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { password } = req.body || {};
  const hash = process.env.ADMIN_PASSWORD_HASH;

  if (!hash) {
    console.error(
      "[auth] ADMIN_PASSWORD_HASH is not set. Generate one with: npm run hash:password \"your-password\""
    );
    return res.status(500).json({ error: "Admin password is not configured" });
  }

  /**
   * Next.js runs .env through dotenv-expand, which eats the `$` segments of a
   * bcrypt hash unless they are escaped as `\$`. That silently shortens the
   * hash and every login fails with "Incorrect password", so name the real
   * cause here instead of letting it look like a bad password.
   */
  if (!BCRYPT.test(hash)) {
    console.error(
      `[auth] ADMIN_PASSWORD_HASH is malformed (length ${hash.length}, expected 60). ` +
        "In .env the value must be double-quoted with every $ escaped as \\$, e.g. " +
        'ADMIN_PASSWORD_HASH="\\$2b\\$12\\$...". Run: npm run hash:password "your-password"'
    );
    return res.status(500).json({ error: "Admin password is misconfigured" });
  }

  if (!process.env.AUTH_SECRET || process.env.AUTH_SECRET.length < 32) {
    console.error("[auth] AUTH_SECRET is missing or shorter than 32 characters.");
    return res.status(500).json({ error: "Auth secret is misconfigured" });
  }

  const ok =
    typeof password === "string" &&
    password.length > 0 &&
    (await bcrypt.compare(password, hash));

  if (!ok) {
    await new Promise((r) => setTimeout(r, FAIL_DELAY));
    return res.status(401).json({ error: "Incorrect password" });
  }

  const token = await createToken();
  res.setHeader("Set-Cookie", sessionCookie(token));
  return res.status(200).json({ ok: true });
}

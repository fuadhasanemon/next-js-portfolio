import { SignJWT, jwtVerify } from "jose";

export const COOKIE = "fh_admin";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

const secretKey = () => {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("AUTH_SECRET must be set to at least 32 characters");
  }
  return new TextEncoder().encode(secret);
};

export async function createToken() {
  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(secretKey());
}

/** Edge- and Node-safe: used by both middleware and API routes. */
export async function verifyToken(token) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey());
    return payload?.role === "admin" ? payload : null;
  } catch {
    return null;
  }
}

export function sessionCookie(token) {
  const parts = [
    `${COOKIE}=${token}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${token ? MAX_AGE : 0}`,
  ];
  if (process.env.NODE_ENV === "production") parts.push("Secure");
  return parts.join("; ");
}

/** Guard for API route handlers. Returns true when the request may proceed. */
export async function requireAdmin(req, res) {
  const session = await verifyToken(req.cookies?.[COOKIE]);
  if (!session) {
    res.status(401).json({ error: "Unauthorized" });
    return false;
  }
  return true;
}

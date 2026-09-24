/**
 * Validation for the public newsletter signup. Same stance as lib/contact.js:
 * untrusted input is rejected rather than coerced, and the only normalising is
 * trimming and lowercasing — which is also what makes the unique index on
 * Subscriber.email catch "Me@x.com" and "me@x.com" as one reader.
 */

export const LIMITS = { email: 200, source: 200 };

// Deliberately loose, matching the contact form.
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const str = (v) => (typeof v === "string" ? v.trim() : "");

export function validateSubscribe(body = {}) {
  const email = str(body.email).toLowerCase();
  // Informational only, so an odd value is dropped rather than rejected.
  const source = /^[a-z0-9-]{1,200}$/.test(str(body.source)) ? str(body.source) : "";

  const errors = {};
  if (!email) errors.email = "An email address is required.";
  else if (email.length > LIMITS.email)
    errors.email = `Keep this under ${LIMITS.email} characters.`;
  else if (!EMAIL.test(email)) errors.email = "That email doesn't look right.";

  return { data: { email, source }, errors };
}

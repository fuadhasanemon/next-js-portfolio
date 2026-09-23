/**
 * Validation for the public contact form. This runs on untrusted input, so it
 * rejects rather than coerces — the only normalising done here is trimming and
 * lowercasing the email.
 */

export const LIMITS = {
  name: 100,
  email: 200,
  needs: 120,
  budget: 60,
  message: 4000,
};

const MESSAGE_MIN = 20;

// Deliberately loose: the goal is to catch typos and obvious junk, not to
// re-implement RFC 5322. Anything stricter starts rejecting real addresses.
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const str = (v) => (typeof v === "string" ? v.trim() : "");

/**
 * Returns { data, errors }. `errors` is keyed by field name so the form can
 * show each message inline; it is empty when the submission is valid.
 */
export function validateContact(body = {}) {
  const name = str(body.name);
  const email = str(body.email).toLowerCase();
  const needs = str(body.needs);
  const budget = str(body.budget);
  const message = str(body.message);

  const errors = {};

  if (!name) errors.name = "Please tell me your name.";
  else if (name.length > LIMITS.name)
    errors.name = `Keep this under ${LIMITS.name} characters.`;

  if (!email) errors.email = "An email address is required.";
  else if (email.length > LIMITS.email)
    errors.email = `Keep this under ${LIMITS.email} characters.`;
  else if (!EMAIL.test(email)) errors.email = "That email doesn't look right.";

  if (!needs) errors.needs = "A one-line summary helps me reply usefully.";
  else if (needs.length > LIMITS.needs)
    errors.needs = `Keep this under ${LIMITS.needs} characters.`;

  if (budget.length > LIMITS.budget)
    errors.budget = `Keep this under ${LIMITS.budget} characters.`;

  if (!message) errors.message = "Please add a message.";
  else if (message.length < MESSAGE_MIN)
    errors.message = `A little more detail, please — at least ${MESSAGE_MIN} characters.`;
  else if (message.length > LIMITS.message)
    errors.message = `Keep this under ${LIMITS.message} characters.`;

  return { data: { name, email, needs, budget, message }, errors };
}

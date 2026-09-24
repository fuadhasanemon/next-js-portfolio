import { validateSubscribe } from "@/lib/newsletter";
import { prisma } from "@/lib/prisma";
import { checkLimit, clientIp, recordHit } from "@/lib/rateLimit";

const WINDOW_MS = 10 * 60 * 1000;
const LIMIT = 5;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const body = req.body || {};

  // Honeypot, as on the contact form: a bot gets a success and moves on.
  if (typeof body.website === "string" && body.website.trim() !== "") {
    return res.status(200).json({ ok: true });
  }

  const key = `subscribe:${clientIp(req)}`;
  const { allowed, retryAfter } = checkLimit(key, {
    limit: LIMIT,
    windowMs: WINDOW_MS,
  });

  if (!allowed) {
    res.setHeader("Retry-After", retryAfter);
    return res.status(429).json({
      error: "Too many attempts in a short time. Please try again shortly.",
    });
  }

  const { data, errors } = validateSubscribe(body);
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ error: errors.email, errors });
  }

  // Signing up again is a no-op for an active reader and a re-subscribe for
  // one who left. The response is identical either way, so the form can't be
  // used to find out whether an address is already on the list.
  try {
    await prisma.subscriber.upsert({
      where: { email: data.email },
      create: data,
      update: { status: "ACTIVE" },
    });
  } catch (error) {
    console.error(`[subscribe] could not save subscriber: ${error.message}`);
    return res.status(500).json({
      error: "Something went wrong. Please try again in a moment.",
    });
  }

  recordHit(key, { windowMs: WINDOW_MS });

  return res.status(200).json({ ok: true });
}

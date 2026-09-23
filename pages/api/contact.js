import { validateContact } from "@/lib/contact";
import { sendContactNotification } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { checkLimit, clientIp, recordHit } from "@/lib/rateLimit";

const WINDOW_MS = 10 * 60 * 1000;
const LIMIT = 3;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const body = req.body || {};

  // Honeypot: hidden from real users, so anything in it is a bot. Answer 200
  // so the bot records a success and doesn't come back to retry.
  if (typeof body.website === "string" && body.website.trim() !== "") {
    return res.status(200).json({ ok: true });
  }

  const key = `contact:${clientIp(req)}`;
  const { allowed, retryAfter } = checkLimit(key, {
    limit: LIMIT,
    windowMs: WINDOW_MS,
  });

  if (!allowed) {
    res.setHeader("Retry-After", retryAfter);
    return res.status(429).json({
      error: "That's a few messages in a short time. Please try again shortly.",
    });
  }

  const { data, errors } = validateContact(body);
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ error: "Please check the form.", errors });
  }

  // The lead is the thing worth keeping, so it lands in the database before
  // anything that can fail over the network.
  let saved;
  try {
    saved = await prisma.contactMessage.create({ data });
  } catch (error) {
    console.error(`[contact] could not save message: ${error.message}`);
    return res.status(500).json({
      error: "Something went wrong saving your message. Please email me instead.",
    });
  }

  // Only a message that actually landed spends the visitor's quota.
  recordHit(key, { windowMs: WINDOW_MS });

  // Best effort. A failed notification still leaves the message in /admin.
  await sendContactNotification(saved);

  return res.status(201).json({ ok: true });
}

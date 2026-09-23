/**
 * Resend notifications over their REST API. Deliberately no SDK — one fetch
 * call does not justify another dependency.
 *
 * Nothing here ever throws: a contact message is already saved by the time we
 * get called, and a failed notification must not turn a captured lead into a
 * 500 for the visitor.
 */
const ENDPOINT = "https://api.resend.com/emails";
const TIMEOUT_MS = 8000;

const escapeHtml = (value) =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const row = (label, value) =>
  `<p style="margin:0 0 12px"><strong>${escapeHtml(label)}:</strong> ${escapeHtml(
    value
  )}</p>`;

export async function sendContactNotification(msg) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.CONTACT_FROM_EMAIL;
  const to = process.env.CONTACT_TO_EMAIL;

  if (!apiKey || !from || !to) {
    console.warn(
      "[email] RESEND_API_KEY / CONTACT_FROM_EMAIL / CONTACT_TO_EMAIL not set — " +
        "message saved to the database but no notification sent."
    );
    return { ok: false, error: "not configured" };
  }

  const body = {
    from,
    to: [to],
    // Replying in the mail client goes straight back to the visitor.
    reply_to: msg.email,
    subject: `New enquiry — ${msg.name}: ${msg.needs}`,
    html: [
      row("Name", msg.name),
      row("Email", msg.email),
      row("Needs", msg.needs),
      row("Budget", msg.budget || "Not given"),
      `<p style="margin:20px 0 8px"><strong>Message</strong></p>`,
      `<p style="margin:0;white-space:pre-wrap">${escapeHtml(msg.message)}</p>`,
    ].join(""),
  };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    if (!res.ok) {
      console.error(`[email] Resend responded ${res.status}: ${await res.text()}`);
      return { ok: false, error: `resend ${res.status}` };
    }

    return { ok: true };
  } catch (error) {
    console.error(`[email] notification failed: ${error.message}`);
    return { ok: false, error: error.message };
  } finally {
    clearTimeout(timer);
  }
}

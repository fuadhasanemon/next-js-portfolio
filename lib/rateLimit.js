/**
 * In-memory sliding-window limiter.
 *
 * Checking and recording are separate on purpose: a visitor who mistypes their
 * email three times must not burn the quota and lock themselves out. Only a
 * message that actually got saved counts against it.
 *
 * Scope caveat, deliberately accepted: on Vercel this state lives per lambda
 * instance, so a distributed flood could get more through than the quota
 * suggests. It still stops the realistic case — one bot hammering the form —
 * and costs nothing. Swap in Upstash/Redis only if spam actually shows up.
 */
const hits = new Map();

/** Stops the Map growing without bound on a long-lived instance. */
const sweep = (now) => {
  for (const [key, times] of hits) {
    const live = times.filter((t) => now - t < 3600_000);
    if (live.length) hits.set(key, live);
    else hits.delete(key);
  }
};

let lastSweep = 0;

const recent = (key, now, windowMs) =>
  (hits.get(key) || []).filter((t) => now - t < windowMs);

export function checkLimit(key, { limit, windowMs }) {
  const now = Date.now();

  if (now - lastSweep > 600_000) {
    sweep(now);
    lastSweep = now;
  }

  const times = recent(key, now, windowMs);

  if (times.length >= limit) {
    hits.set(key, times);
    return {
      allowed: false,
      retryAfter: Math.ceil((windowMs - (now - times[0])) / 1000),
    };
  }

  return { allowed: true };
}

export function recordHit(key, { windowMs }) {
  const now = Date.now();
  const times = recent(key, now, windowMs);
  times.push(now);
  hits.set(key, times);
}

/** Vercel sets x-forwarded-for; the left-most entry is the real client. */
export function clientIp(req) {
  const header = req.headers["x-forwarded-for"];
  const raw = Array.isArray(header) ? header[0] : header;
  return raw?.split(",")[0].trim() || req.socket?.remoteAddress || "unknown";
}

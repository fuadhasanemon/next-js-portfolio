import { PrismaClient } from "@prisma/client";

// Reuse the client across hot reloads / lambda invocations.
const globalForPrisma = globalThis;

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

/** Prisma returns Date objects; getStaticProps needs plain JSON. */
export function serialize(value) {
  return JSON.parse(JSON.stringify(value));
}

/**
 * Public pages are statically generated, so an unreachable database at build
 * time would otherwise fail the whole deploy. Fall back to empty content and
 * let ISR retry shortly instead.
 */
export async function safeQuery(run, fallback) {
  try {
    return { data: await run(), ok: true };
  } catch (error) {
    console.warn(`[db] query failed, serving fallback: ${error.message}`);
    return { data: fallback, ok: false };
  }
}

/** Retry quickly after a failed read; otherwise refresh hourly. */
export const revalidateFor = (ok) => (ok ? 3600 : 60);

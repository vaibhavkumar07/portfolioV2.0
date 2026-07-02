import "server-only";
import { Redis } from "@upstash/redis";
import { env } from "@/lib/server/env";

/**
 * Site analytics counters. Durable via Upstash Redis (single hash) when
 * UPSTASH_* env vars are set; otherwise a best-effort in-memory fallback
 * (per serverless instance, resets on restart) so everything still works
 * in local dev. Counters only — no PII, no per-user data.
 */

export const METRICS = [
  "visits",
  "chats",
  "tokens",
  "mode_home",
  "mode_dashboard",
  "mode_playground",
] as const;

export type Metric = (typeof METRICS)[number];

const KEY = "portfolio:stats";

// ── In-memory fallback ──
const mem = new Map<Metric, number>();

// ── Upstash (lazy singleton) ──
let redis: Redis | null | undefined;
function getRedis(): Redis | null {
  if (redis !== undefined) return redis;
  redis =
    env.upstashUrl && env.upstashToken
      ? new Redis({ url: env.upstashUrl, token: env.upstashToken })
      : null;
  return redis;
}

/** Increment a counter. Never throws. */
export async function bump(metric: Metric, by = 1): Promise<void> {
  const r = getRedis();
  if (r) {
    try {
      await r.hincrby(KEY, metric, by);
      return;
    } catch {
      // Redis unreachable → fall through to memory so the count isn't lost.
    }
  }
  mem.set(metric, (mem.get(metric) ?? 0) + by);
}

/** Read all counters (zeros for anything unset). Never throws. */
export async function readAll(): Promise<Record<Metric, number>> {
  const out = Object.fromEntries(METRICS.map((m) => [m, 0])) as Record<Metric, number>;
  const r = getRedis();
  if (r) {
    try {
      const h = await r.hgetall<Record<string, string | number>>(KEY);
      for (const m of METRICS) out[m] = Number(h?.[m] ?? 0) || 0;
      return out;
    } catch {
      // fall through to memory
    }
  }
  for (const m of METRICS) out[m] = mem.get(m) ?? 0;
  return out;
}

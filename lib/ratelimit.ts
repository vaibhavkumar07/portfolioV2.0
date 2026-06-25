import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

/**
 * Durable rate limiting via Upstash Redis (sliding window, global across
 * serverless instances) when UPSTASH_REDIS_REST_URL + _TOKEN are set.
 * Falls back to a best-effort in-memory limiter otherwise (local dev / no
 * Upstash) so the routes always work.
 */

// ── In-memory fallback ──
const buckets = new Map<string, { n: number; t: number }>();
function memLimited(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  if (buckets.size > 5000) {
    for (const [k, v] of buckets) if (now - v.t > windowMs) buckets.delete(k);
  }
  const rec = buckets.get(key);
  if (!rec || now - rec.t > windowMs) {
    buckets.set(key, { n: 1, t: now });
    return false;
  }
  rec.n += 1;
  return rec.n > limit;
}

// ── Upstash (cached per limit/window config) ──
const limiters = new Map<string, Ratelimit>();
function getUpstash(limit: number, windowSec: number): Ratelimit | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  const cfg = `${limit}:${windowSec}`;
  let rl = limiters.get(cfg);
  if (!rl) {
    rl = new Ratelimit({
      redis: new Redis({ url, token }),
      limiter: Ratelimit.slidingWindow(limit, `${windowSec} s`),
      prefix: "rl",
      analytics: false,
    });
    limiters.set(cfg, rl);
  }
  return rl;
}

/** Returns true if the key is OVER the limit (should be blocked). */
export async function limited(key: string, limit: number, windowMs: number): Promise<boolean> {
  const rl = getUpstash(limit, Math.ceil(windowMs / 1000));
  if (rl) {
    try {
      const r = await rl.limit(key);
      return !r.success;
    } catch {
      // Upstash unreachable → don't fail open silently; use memory fallback.
    }
  }
  return memLimited(key, limit, windowMs);
}

export function clientKey(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "local"
  );
}

/** Reject cross-site POSTs (CSRF / off-site abuse). Allows same-origin and
 *  direct tools with no Origin header. */
export function sameOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return true;
  try {
    return new URL(origin).host === req.headers.get("host");
  } catch {
    return false;
  }
}

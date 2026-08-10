import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { env } from "@/lib/server/env";

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
  const url = env.upstashUrl;
  const token = env.upstashToken;
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

/**
 * True when a durable, cross-instance limiter is available.
 *
 * The in-memory fallback is per serverless instance, so under scale-out the
 * real ceiling is `limit × instance count` — unbounded in practice. Routes
 * that spend money upstream check this and fail closed in production rather
 * than pretending they are rate limited.
 */
export const durableLimiting = Boolean(env.upstashUrl && env.upstashToken);

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

/**
 * Identify the caller for rate-limiting purposes.
 *
 * Order matters: `x-forwarded-for` is client-supplied and only meaningful
 * after a trusted proxy rewrites it, so it comes last. Leading with it let a
 * caller rotate the header per request and mint an unlimited quota — the
 * limiter counts distinct strings, not distinct clients.
 */
export function clientKey(req: Request): string {
  return (
    req.headers.get("x-vercel-forwarded-for") ||
    req.headers.get("x-real-ip") ||
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "local"
  );
}

/**
 * Reject cross-site and non-browser POSTs (CSRF / off-site abuse).
 *
 * Fails closed on a missing Origin. Per the Fetch spec browsers set Origin on
 * every non-GET/HEAD request — including same-origin `fetch()` and
 * `navigator.sendBeacon` — so nothing legitimate is turned away, while
 * `curl` with no Origin (the cheapest way to burn the upstream key) is.
 */
export function sameOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return false;
  try {
    return new URL(origin).host === req.headers.get("host");
  } catch {
    return false;
  }
}

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { env } from "@/lib/server/env";

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

/** True when Upstash env is configured (cross-instance limiter available). */
export const durableLimiting = Boolean(env.upstashUrl && env.upstashToken);

/** Returns true if the key is OVER the limit (should be blocked). */
export async function limited(key: string, limit: number, windowMs: number): Promise<boolean> {
  const rl = getUpstash(limit, Math.ceil(windowMs / 1000));
  if (rl) {
    try {
      const r = await rl.limit(key);
      return !r.success;
    } catch {
      // Redis down in production → fail closed (treat as limited).
      if (env.isProduction) return true;
    }
  }
  return memLimited(key, limit, windowMs);
}

/**
 * Prefer platform-set client IP. x-forwarded-for is last (spoofable).
 * On Vercel, x-vercel-forwarded-for is authoritative.
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
 * Reject cross-site and non-browser POSTs.
 * Fails closed on missing Origin. When Sec-Fetch-Site is present, require
 * same-origin (or none) so a forged Origin alone is not enough.
 */
export function sameOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return false;
  try {
    if (new URL(origin).host !== req.headers.get("host")) return false;
  } catch {
    return false;
  }
  const site = req.headers.get("sec-fetch-site");
  if (site && site !== "same-origin" && site !== "none") return false;
  return true;
}

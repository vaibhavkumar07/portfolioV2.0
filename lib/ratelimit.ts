/**
 * Best-effort in-memory rate limiter + request guards for the public API
 * routes. On serverless this is per-instance (not global), so it's a speed
 * bump against casual abuse of the free model quota, not a hard guarantee.
 */
const buckets = new Map<string, { n: number; t: number }>();

export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  // Bound memory: evict expired entries if the map grows large.
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
  if (!origin) return true; // curl / server-to-server, no browser origin
  try {
    return new URL(origin).host === req.headers.get("host");
  } catch {
    return false;
  }
}

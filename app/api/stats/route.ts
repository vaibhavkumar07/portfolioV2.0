import { readAll } from "@/lib/server/stats";
import { limited, clientKey } from "@/lib/server/ratelimit";

export const runtime = "nodejs";

/**
 * Public read of site counters (no PII — aggregate numbers only).
 *
 * Rate limited despite the CDN cache in front of it: a cache-busting query
 * loop bypasses `s-maxage` entirely and turns every request into a Redis
 * HGETALL. No same-origin guard — this is deliberately readable by anything,
 * it just isn't free to hammer.
 */
export async function GET(req: Request) {
  if (await limited(`s:${clientKey(req)}`, 60, 60_000))
    return new Response("Too many requests", { status: 429 });

  const stats = await readAll();
  return Response.json(stats, {
    headers: {
      "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
    },
  });
}

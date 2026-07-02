import { readAll } from "@/lib/server/stats";

export const runtime = "nodejs";

/** Public read of site counters (no PII — aggregate numbers only). */
export async function GET() {
  const stats = await readAll();
  return Response.json(stats, {
    headers: {
      "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
    },
  });
}

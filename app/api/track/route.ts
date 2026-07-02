import { limited, clientKey, sameOrigin } from "@/lib/server/ratelimit";
import { bump, type Metric } from "@/lib/server/stats";

export const runtime = "nodejs";

/**
 * Client-side event beacon. Only presence counters are client-writable —
 * chats/tokens are counted server-side in /api/chat and can't be spoofed here.
 */
const CLIENT_EVENTS: Record<string, Metric> = {
  visit: "visits",
  mode_home: "mode_home",
  mode_dashboard: "mode_dashboard",
  mode_playground: "mode_playground",
};

export async function POST(req: Request) {
  if (!sameOrigin(req)) return new Response("Forbidden", { status: 403 });
  if (await limited(`t:${clientKey(req)}`, 30, 60_000))
    return new Response(null, { status: 429 });

  let event = "";
  try {
    // req.text() + parse: sendBeacon posts a Blob without a JSON content type.
    event = String(JSON.parse(await req.text())?.event ?? "");
  } catch {
    return new Response("Bad request", { status: 400 });
  }

  // Object.hasOwn: a plain lookup would resolve prototype members
  // ("constructor", "toString", …) and write junk fields to the stats hash.
  const metric = Object.hasOwn(CLIENT_EVENTS, event) ? CLIENT_EVENTS[event] : undefined;
  if (!metric) return new Response("Bad request", { status: 400 });

  await bump(metric);
  return new Response(null, { status: 204 });
}

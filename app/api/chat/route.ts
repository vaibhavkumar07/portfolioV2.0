import { buildSystemPrompt } from "@/lib/data/kb";
import { limited, clientKey, sameOrigin, durableLimiting } from "@/lib/server/ratelimit";
import { env } from "@/lib/server/env";
import { bump } from "@/lib/server/stats";

export const runtime = "nodejs";
export const maxDuration = 30;

const NIM_URL = "https://integrate.api.nvidia.com/v1/chat/completions";
const MODEL = "meta/llama-3.1-8b-instruct";

const MAX_TURNS = 10;        // history turns sent upstream
const MAX_CONTENT = 1500;    // chars per message
const RL_LIMIT = 20;         // requests
const RL_WINDOW = 60_000;    // per minute
const UPSTREAM_TIMEOUT = 20_000; // ms — must stay under maxDuration

type Msg = { role: "user" | "assistant"; content: string };

export async function POST(req: Request) {
  const key = env.nvidiaChatKey;
  if (!key) return new Response("Agent unavailable", { status: 503 });

  // This is the one route that spends real money upstream. The in-memory
  // limiter is per-instance and therefore no limit at all under scale-out, so
  // in production an unmetered agent is refused rather than served.
  if (env.isProduction && !durableLimiting)
    return new Response("Agent unavailable", { status: 503 });

  if (!sameOrigin(req)) return new Response("Forbidden", { status: 403 });
  if (await limited(clientKey(req), RL_LIMIT, RL_WINDOW))
    return new Response("Too many requests — give it a moment.", { status: 429 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return new Response("Bad request", { status: 400 });
  }

  const rawList = (body as { messages?: unknown })?.messages;
  // Cap BEFORE iterating so a giant array can't burn CPU/memory.
  const raw = Array.isArray(rawList) ? rawList.slice(-MAX_TURNS - 4) : [];
  const parsed: Msg[] = raw
    .filter(
      (m): m is Msg =>
        !!m &&
        ((m as Msg).role === "user" || (m as Msg).role === "assistant") &&
        typeof (m as Msg).content === "string" &&
        (m as Msg).content.trim().length > 0,
    )
    .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_CONTENT) }));

  // Rebuild alternating user/assistant ending in user — drops forged runs
  // of consecutive assistant turns used for few-shot prompt injection.
  const history: Msg[] = [];
  for (const m of parsed) {
    if (!history.length) {
      if (m.role === "user") history.push(m);
      continue;
    }
    if (m.role === history[history.length - 1].role) continue;
    history.push(m);
  }
  while (history.length && history[history.length - 1].role !== "user") history.pop();
  const trimmed = history.slice(-MAX_TURNS);

  if (!trimmed.length || trimmed[trimmed.length - 1].role !== "user")
    return new Response("Ask a question first.", { status: 400 });

  bump("chats").catch(() => {});
  // Last user message steers KB retrieval only — never embedded in system prompt.
  const systemPrompt = buildSystemPrompt(trimmed[trimmed.length - 1].content);
  const promptChars =
    systemPrompt.length + trimmed.reduce((n, m) => n + m.content.length, 0);

  let upstream: Response;
  try {
    upstream = await fetch(NIM_URL, {
      method: "POST",
      // Without this a hung upstream pins the function for the full
      // maxDuration, which is cheap amplification for whoever hangs it.
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT),
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        Accept: "text/event-stream",
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: "system", content: systemPrompt }, ...trimmed],
        max_tokens: 320,
        temperature: 0.3,
        top_p: 0.95,
        stream: true,
      }),
    });
  } catch {
    return new Response("The agent is unreachable right now.", { status: 502 });
  }

  if (!upstream.ok || !upstream.body) {
    // Don't leak upstream/provider details to the client.
    return new Response("The agent is busy — please try again.", { status: 502 });
  }

  const reader = upstream.body.getReader();
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buf = "";

  // Token accounting (~4 chars/token estimate). The stream has three
  // termination paths (reader done, [DONE] frame, client cancel) — the
  // `counted` guard makes sure we record exactly once.
  let completionChars = 0;
  let counted = false;
  const finish = async () => {
    if (counted) return;
    counted = true;
    await bump("tokens", Math.ceil((promptChars + completionChars) / 4)).catch(() => {});
  };

  const stream = new ReadableStream({
    async pull(controller) {
      const { done, value } = await reader.read();
      if (done) {
        await finish();
        controller.close();
        return;
      }
      buf += decoder.decode(value, { stream: true });
      const lines = buf.split("\n");
      buf = lines.pop() ?? "";
      for (const line of lines) {
        const t = line.trim();
        if (!t.startsWith("data:")) continue;
        const data = t.slice(5).trim();
        if (data === "[DONE]") {
          await finish();
          controller.close();
          return;
        }
        try {
          const json = JSON.parse(data);
          const delta = json.choices?.[0]?.delta?.content;
          if (delta) {
            completionChars += delta.length;
            controller.enqueue(encoder.encode(delta));
          }
        } catch {
          /* keep-alives / partial frames */
        }
      }
    },
    cancel() {
      void finish();
      reader.cancel().catch(() => {});
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

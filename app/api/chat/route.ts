import { buildSystemPrompt } from "@/lib/data/kb";
import { limited, clientKey, sameOrigin } from "@/lib/server/ratelimit";
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

type Msg = { role: "user" | "assistant"; content: string };

export async function POST(req: Request) {
  const key = env.nvidiaChatKey;
  if (!key) return new Response("Agent unavailable", { status: 503 });

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
  const history: Msg[] = raw
    .filter(
      (m): m is Msg =>
        !!m &&
        ((m as Msg).role === "user" || (m as Msg).role === "assistant") &&
        typeof (m as Msg).content === "string" &&
        (m as Msg).content.trim().length > 0,
    )
    .slice(-MAX_TURNS)
    .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_CONTENT) }));

  if (!history.length || history[history.length - 1].role !== "user")
    return new Response("Ask a question first.", { status: 400 });

  // Analytics: one conversation turn per accepted request (server-side only,
  // never client-writable). Fire-and-forget — must not delay the stream.
  bump("chats").catch(() => {});
  // Retrieval: the last user message steers which KB sections get stuffed.
  // Only used for scoring — user text never lands inside the system prompt.
  const systemPrompt = buildSystemPrompt(history[history.length - 1].content);
  const promptChars =
    systemPrompt.length + history.reduce((n, m) => n + m.content.length, 0);

  let upstream: Response;
  try {
    upstream = await fetch(NIM_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        Accept: "text/event-stream",
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: "system", content: systemPrompt }, ...history],
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

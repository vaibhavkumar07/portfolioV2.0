import { buildSystemPrompt } from "@/lib/kb";

export const runtime = "nodejs";
export const maxDuration = 30;

const NIM_URL = "https://integrate.api.nvidia.com/v1/chat/completions";
const MODEL = "minimaxai/minimax-m3";

// Tiny in-memory per-IP rate limit (best-effort on serverless).
const hits = new Map<string, { n: number; t: number }>();
const LIMIT = 20; // requests
const WINDOW = 60_000; // per minute

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const rec = hits.get(ip);
  if (!rec || now - rec.t > WINDOW) {
    hits.set(ip, { n: 1, t: now });
    return false;
  }
  rec.n += 1;
  return rec.n > LIMIT;
}

type Msg = { role: "user" | "assistant"; content: string };

export async function POST(req: Request) {
  const key = process.env.NVIDIA_CHAT_API_KEY;
  if (!key) {
    return new Response("Agent not configured", { status: 503 });
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (rateLimited(ip)) {
    return new Response("Slow down a moment.", { status: 429 });
  }

  let body: { messages?: Msg[] };
  try {
    body = await req.json();
  } catch {
    return new Response("Bad request", { status: 400 });
  }

  const history = (body.messages ?? [])
    .filter((m) => m && (m.role === "user" || m.role === "assistant") && m.content)
    .slice(-10)
    .map((m) => ({ role: m.role, content: String(m.content).slice(0, 2000) }));

  const messages = [
    { role: "system", content: buildSystemPrompt() },
    ...history,
  ];

  const upstream = await fetch(NIM_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Accept: "text/event-stream",
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      max_tokens: 600,
      temperature: 0.6,
      top_p: 0.95,
      stream: true,
    }),
  });

  if (!upstream.ok || !upstream.body) {
    const detail = await upstream.text().catch(() => "");
    return new Response(`Upstream error: ${detail.slice(0, 200)}`, {
      status: 502,
    });
  }

  // Parse upstream SSE, emit plain text token chunks to the client.
  const reader = upstream.body.getReader();
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buf = "";

  const stream = new ReadableStream({
    async pull(controller) {
      const { done, value } = await reader.read();
      if (done) {
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
          controller.close();
          return;
        }
        try {
          const json = JSON.parse(data);
          const delta = json.choices?.[0]?.delta?.content;
          if (delta) controller.enqueue(encoder.encode(delta));
        } catch {
          /* ignore keep-alives / partial frames */
        }
      }
    },
    cancel() {
      reader.cancel().catch(() => {});
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

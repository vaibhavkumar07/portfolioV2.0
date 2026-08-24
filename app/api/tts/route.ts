import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts";
import { pronounce } from "@/lib/pronounce";
import { limited, clientKey, sameOrigin, durableLimiting } from "@/lib/server/ratelimit";
import { env } from "@/lib/server/env";

export const runtime = "nodejs";
export const maxDuration = 20;

const TTS_TIMEOUT = 15_000;
const VOICE_RE = /^[a-zA-Z]{2}-[a-zA-Z]{2}-[A-Za-z0-9]+Neural$/;
const VOICE = VOICE_RE.test(env.ttsVoice) ? env.ttsVoice : "en-US-GuyNeural";

/** Escape so user text cannot inject SSML into msedge-tts templates. */
function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function POST(req: Request) {
  if (env.isProduction && !durableLimiting)
    return new Response("TTS unavailable", { status: 503 });

  if (!sameOrigin(req)) return new Response("Forbidden", { status: 403 });
  if (await limited(`tts:${clientKey(req)}`, 60, 60_000))
    return new Response("Too many requests", { status: 429 });

  let text = "";
  let wantMarks = false;
  try {
    const body = await req.json();
    text = body?.text;
    wantMarks = body?.marks === true;
  } catch {
    return new Response("Bad request", { status: 400 });
  }
  text = String(text || "").slice(0, 800).trim();
  if (!text) return new Response("Empty", { status: 400 });

  const safeText = escapeXml(pronounce(text));

  const work = (async () => {
    const tts = new MsEdgeTTS();
    await tts.setMetadata(
      VOICE,
      OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3,
      wantMarks ? { wordBoundaryEnabled: true, sentenceBoundaryEnabled: false } : undefined,
    );
    const { audioStream, metadataStream } = tts.toStream(safeText);

    const chunks: Buffer[] = [];
    const marks: { t: number; word: string }[] = [];

    const audioDone = new Promise<void>((resolve, reject) => {
      audioStream.on("data", (c: Buffer) => chunks.push(c));
      audioStream.on("end", resolve);
      audioStream.on("close", resolve);
      audioStream.on("error", reject);
    });

    const marksDone =
      wantMarks && metadataStream
        ? new Promise<void>((resolve) => {
            metadataStream.on("data", (c: Buffer) => {
              try {
                const parsed = JSON.parse(c.toString());
                for (const m of parsed?.Metadata ?? []) {
                  if (m?.Type !== "WordBoundary") continue;
                  marks.push({
                    t: (m.Data?.Offset ?? 0) / 10_000_000,
                    word: String(m.Data?.text?.Text ?? ""),
                  });
                }
              } catch {
                /* ignore malformed envelopes */
              }
            });
            metadataStream.on("end", resolve);
            metadataStream.on("close", resolve);
            metadataStream.on("error", () => resolve());
          })
        : Promise.resolve();

    await Promise.all([audioDone, marksDone]);
    return { audio: Buffer.concat(chunks), marks };
  })();

  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const { audio, marks } = await Promise.race([
      work,
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error("TTS timeout")), TTS_TIMEOUT);
      }),
    ]);

    if (wantMarks) {
      return Response.json(
        { audio: audio.toString("base64"), marks },
        { headers: { "Cache-Control": "no-store" } },
      );
    }

    return new Response(new Uint8Array(audio), {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-store",
        "Content-Length": String(audio.length),
      },
    });
  } catch {
    // Timeout won: swallow a later `work` rejection so it isn't unhandled.
    void work.catch(() => {});
    return new Response("TTS failed", { status: 502 });
  } finally {
    if (timer !== undefined) clearTimeout(timer);
  }
}

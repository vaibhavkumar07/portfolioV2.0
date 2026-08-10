import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts";
import { pronounce } from "@/lib/pronounce";
import { limited, clientKey, sameOrigin } from "@/lib/server/ratelimit";
import { env } from "@/lib/server/env";

export const runtime = "nodejs";
export const maxDuration = 20;

// Free Microsoft Edge neural voice (no key). Natural male US voice.
const VOICE = env.ttsVoice;

export async function POST(req: Request) {
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

  try {
    const tts = new MsEdgeTTS();
    await tts.setMetadata(
      VOICE,
      OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3,
      // Word boundaries are what let a caption highlight the word actually
      // being spoken. Requested only when the caller will use them, since
      // enabling them makes the service emit a second stream.
      wantMarks ? { wordBoundaryEnabled: true, sentenceBoundaryEnabled: false } : undefined,
    );
    const { audioStream, metadataStream } = tts.toStream(pronounce(text));

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
              // Each chunk is a JSON envelope of boundary events. Offsets are
              // in 100-nanosecond ticks; the client wants seconds.
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
                /* a malformed envelope costs sync, never the audio */
              }
            });
            metadataStream.on("end", resolve);
            metadataStream.on("close", resolve);
            metadataStream.on("error", () => resolve());
          })
        : Promise.resolve();

    await Promise.all([audioDone, marksDone]);
    const audio = Buffer.concat(chunks);

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
    return new Response("TTS failed", { status: 502 });
  }
}

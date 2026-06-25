import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts";
import { pronounce } from "@/lib/pronounce";

export const runtime = "nodejs";
export const maxDuration = 20;

// Free Microsoft Edge neural voice (no key). Natural male US voice.
const VOICE = process.env.TTS_VOICE || "en-US-GuyNeural";

export async function POST(req: Request) {
  let text = "";
  try {
    ({ text } = await req.json());
  } catch {
    return new Response("Bad request", { status: 400 });
  }
  text = String(text || "").slice(0, 800).trim();
  if (!text) return new Response("Empty", { status: 400 });

  try {
    const tts = new MsEdgeTTS();
    await tts.setMetadata(VOICE, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
    const { audioStream } = tts.toStream(pronounce(text));

    const chunks: Buffer[] = [];
    await new Promise<void>((resolve, reject) => {
      audioStream.on("data", (c: Buffer) => chunks.push(c));
      audioStream.on("end", resolve);
      audioStream.on("close", resolve);
      audioStream.on("error", reject);
    });

    const audio = Buffer.concat(chunks);
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

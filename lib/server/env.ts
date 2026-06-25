import "server-only";

/**
 * Single, typed source for server-side environment variables. Importing this
 * from a Client Component throws at build time (`server-only`), so keys can
 * never leak into the browser bundle. Set these in `.env.local` (dev) and in
 * Vercel project settings (prod).
 */
export const env = {
  /** NVIDIA NIM key for the chat agent. Empty → the agent returns a fallback. */
  nvidiaChatKey: process.env.NVIDIA_CHAT_API_KEY ?? "",

  /** Microsoft Edge neural TTS voice (free, no key). */
  ttsVoice: process.env.TTS_VOICE || "en-US-GuyNeural",

  /** Upstash Redis — optional durable rate limiting (falls back to in-memory). */
  upstashUrl: process.env.UPSTASH_REDIS_REST_URL ?? "",
  upstashToken: process.env.UPSTASH_REDIS_REST_TOKEN ?? "",
} as const;

export const hasUpstash = Boolean(env.upstashUrl && env.upstashToken);

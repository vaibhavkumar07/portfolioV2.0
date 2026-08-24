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

  /**
   * Upstash Redis — durable rate limiting and counters. Optional in dev; in
   * production its absence makes /api/chat refuse to serve, because the
   * in-memory fallback is per-instance and so no real limit at all.
   */
  upstashUrl: process.env.UPSTASH_REDIS_REST_URL ?? "",
  upstashToken: process.env.UPSTASH_REDIS_REST_TOKEN ?? "",

  /** Kept here so no other module has to reach for process.env. */
  isProduction: process.env.NODE_ENV === "production",
} as const;

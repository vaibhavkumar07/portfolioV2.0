import type { MetadataRoute } from "next";

/**
 * Everyone welcome — including AI/answer-engine crawlers, listed explicitly so
 * the site is eligible for ChatGPT, Claude, Perplexity, and Google AI Overview
 * citations (AEO). API routes are excluded: nothing indexable there.
 */
const AI_CRAWLERS = [
  "GPTBot",          // OpenAI training
  "OAI-SearchBot",   // ChatGPT search
  "ChatGPT-User",    // ChatGPT browsing
  "ClaudeBot",       // Anthropic
  "Claude-User",     // Claude browsing
  "PerplexityBot",   // Perplexity
  "Google-Extended", // Gemini training
  "Applebot-Extended",
  "CCBot",           // Common Crawl (feeds many models)
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: "/api/" },
      ...AI_CRAWLERS.map((userAgent) => ({ userAgent, allow: "/" as const, disallow: "/api/" })),
    ],
    sitemap: "https://vaibhavkumarcx.dev/sitemap.xml",
  };
}

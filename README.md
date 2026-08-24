# Vaibhavkumar Yadav — Portfolio

A portfolio that **is** the thing it's about: a live, talking voice agent built on
the same conversational-AI stack I ship for enterprise contact centers. Ask it
anything — by voice or text — and it answers in character, in a natural neural
voice.

> **Genesys Cloud IVR Developer & Contact-Center Voice-AI Engineer** — 8+ years
> building enterprise IVR, bot flows, and AI-assisted CX on Genesys Cloud.

## Highlights

- **Talk to my portfolio** — the agent is a permanent rail, not a widget: browser
  Web Speech mic → streamed, KB-grounded LLM answer → neural TTS, with a WebGL
  portrait that reacts to the live audio.
- **Answer-engine first** — SSG case studies, JSON-LD (Person / WebSite /
  ProfilePage / FAQPage / Article), `sitemap.xml`, `robots.txt`, and a
  hand-written `/llms.txt` for AI crawlers.
- **Toggle modes** — `Home`, `Dashboard` (CX command-center charts), `Playground`
  (drag-and-run IVR flow builder).
- **"Operator Console" design language** — Clash Display + General Sans +
  JetBrains Mono, navy / cyan / amber, alternating navy–paper–void surfaces,
  aurora backdrop, Lenis smooth scroll. Every animation respects
  `prefers-reduced-motion`.
- **Hardened** — server-only secrets, CSP + security headers, same-origin guard,
  durable rate limiting, input validation, graceful AI fallbacks.

## Stack

Next.js 16 (App Router, Turbopack) · React 19 · TypeScript (strict) ·
Tailwind CSS 4 · framer-motion · recharts ·
@xyflow/react · lenis.

**Agent** — `meta/llama-3.1-8b-instruct` via NVIDIA NIM (chat) · free Microsoft
Edge neural voice via `msedge-tts` (TTS) · browser Web Speech API (mic) ·
Upstash Redis for rate limiting and counters (optional; in-memory fallback).

## Project structure

```
app/
  layout.tsx              root layout: fonts, metadata, backdrop, smooth scroll
  page.tsx                home — hero, work rail, experience, about, stack, FAQ, contact
  globals.css             design tokens (OKLCH), utilities, animations
  not-found.tsx           404
  robots.ts  sitemap.ts   crawler surface
  llms.txt/route.ts       plain-text KB dump for AI crawlers
  work/[slug]/page.tsx    SSG case studies (JSON-LD Article)
  api/chat/route.ts       streamed LLM proxy — validated, rate-limited
  api/tts/route.ts        neural TTS proxy — rate-limited
  api/track/route.ts      counter increments (no PII)
  api/stats/route.ts      counter read-back for the Dashboard

components/
  agent/       AgentRail (desktop rail + mobile), VoiceAgent
  sections/    SiteNav, HeroCopy, TrustPanel, Experience, WorkRail, …
  modes/       ModeProvider, ModeSwitch, Dashboard, Playground
  fx/          Backdrop, Reveal, SplitText, CountUp, Magnetic, SmoothScroll, TrackVisit, …

lib/
  data/        kb (agent knowledge base), projects, skills, work, faq, types
  server/      env (the only reader of process.env), ratelimit, stats
  slug.ts  theme.ts  track.ts  pronounce.ts
```

Rules that hold the structure together:

- `lib/server/*` is `import "server-only"` — secrets can never reach the browser
  bundle. `lib/server/env.ts` is the single place that reads `process.env`.
- `lib/data/kb.ts` is the one source of truth for facts. The page, the JSON-LD,
  `/llms.txt`, and what the agent *says* all derive from it, so they cannot drift.
- Raw hex lives only in `lib/theme.ts` (recharts and React Flow can't read CSS
  custom properties). Everything else uses the OKLCH tokens in `app/globals.css`.

## Local development

```bash
npm install
cp .env.local.example .env.local   # then fill in the keys below
npm run dev                         # http://localhost:3000
```

### Environment variables (`.env.local`, never committed)

| Var | Purpose | Required |
|-----|---------|----------|
| `NVIDIA_CHAT_API_KEY` | LLM (agent brain) via NVIDIA NIM | yes (agent) |
| `TTS_VOICE` | Edge neural voice, e.g. `en-US-GuyNeural` | no |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | durable rate limiting + counters | **yes in production** |

The agent degrades gracefully if a key is missing (clear fallback message).
Voice (TTS) and the rest of the site work with no keys at all.

**Upstash is required in production.** Without it, rate limiting falls back to
an in-memory limiter that is per serverless instance — under scale-out that is
no limit at all, in front of a metered LLM key. `/api/chat` therefore returns
503 in production when the Upstash vars are unset, rather than serving an
unmetered agent. In development the in-memory fallback is used as before.

## Scripts

| Command | Does |
|---------|------|
| `npm run dev` | dev server |
| `npm run lint` | eslint (`next/core-web-vitals` + typescript) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run build` | production build |
| `npm run verify` | lint + typecheck + build — the pre-commit gate |

There is no test suite; `npm run verify` is the verification gate.

## Build & deploy

```bash
npm run build && npm start
```

Deploy on **Vercel**: connect the repo, add the env vars above, ship. The API
routes run as serverless functions and keep all keys server-side. Security
headers and the CSP are defined in `next.config.ts` — review them after changing
any script, style, font, image, or fetch source.

## License

© Vaibhavkumar Yadav. All rights reserved.

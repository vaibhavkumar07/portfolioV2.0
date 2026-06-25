# Vaibhavkumar Yadav — Portfolio

A portfolio that **is** the thing it's about: a live, talking voice agent built on
the same conversational-AI stack I ship for enterprise contact centers. Ask it
anything — by voice or text — and it answers in character, in a natural neural
voice. Backed by SEO case studies and two interactive "modes."

> **Genesys Cloud IVR Developer & Contact-Center Voice-AI Engineer** — 7+ years
> building enterprise IVR, bot flows, and AI-assisted CX on Genesys Cloud.

## Highlights

- **Talk to my portfolio** — live voice agent: Web Speech mic → streamed LLM
  answer (grounded on a real knowledge base, in character) → natural neural TTS,
  with a reactive waveform.
- **SEO-first** — SSG case studies, JSON-LD (Person + Article), sitemap, robots,
  per-page metadata.
- **Toggle modes** — `Home`, `Dashboard` (CX command-center charts), `Playground`
  (drag-and-run IVR flow builder).
- **Distinctive "Operator Console" design** — Clash Display + General Sans +
  JetBrains Mono, navy / Genesys-orange / sky, animated aurora backdrop, scroll
  reveals.
- **Hardened** — server-side keys, CSP + security headers, same-origin guard,
  durable rate limiting, input validation, graceful AI fallbacks.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · shadcn/ui ·
framer-motion · recharts · @xyflow/react · GSAP.

**Agent**: `meta/llama-3.1-8b-instruct` via NVIDIA NIM (chat) · free Microsoft
Edge neural voice via `msedge-tts` · browser Web Speech (mic) · Upstash Redis
rate limiting (optional, in-memory fallback).

## Project structure

```
app/
  api/chat/route.ts        streamed LLM proxy (grounded, rate-limited)
  api/tts/route.ts         neural text-to-speech proxy
  work/[slug]/page.tsx     SSG case studies
  layout.tsx page.tsx globals.css sitemap.ts robots.ts
components/
  agent/        VoiceAgent
  fx/           Backdrop, Reveal
  sections/     TrustPanel
  modes/        ModeSwitch, Dashboard, Playground
  ui/           shadcn primitives
lib/
  data/         kb, projects, skills, work, types
  server/       ratelimit
  utils.ts slug.ts pronounce.ts
```

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
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | durable rate limiting | no |

The agent degrades gracefully if a key is missing (clear fallback message).
Voice (TTS) and the rest of the site work with no keys at all.

## Build & deploy

```bash
npm run build && npm start
```

Deploy on **Vercel**: connect the repo, add the env vars above, ship. The API
routes run as serverless functions and keep all keys server-side.

## License

© Vaibhavkumar Yadav. All rights reserved.

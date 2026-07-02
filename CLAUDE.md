# CLAUDE.md — Project Guide

Portfolio of Vaibhavkumar Yadav — Genesys Cloud IVR / contact-center voice-AI engineer. A live, talking voice agent built on Next.js 16 (App Router), React 19, TypeScript (strict), and Tailwind CSS 4.

## Commands

```bash
npm run dev     # dev server at http://localhost:3000
npm run build   # production build (must stay green before commits)
npm run lint    # eslint (next/core-web-vitals + typescript)
```

There is no test suite; `npm run build` + `npm run lint` are the verification gate.

## Architecture

```
app/
  page.tsx               home: hero + voice agent, work, about, stack, contact
  layout.tsx             root layout, fonts (Clash Display / General Sans / JetBrains Mono)
  globals.css            design tokens (OKLCH), animations, utilities
  api/chat/route.ts      streamed LLM proxy (NVIDIA NIM) — validated, rate-limited
  api/tts/route.ts       neural TTS proxy (msedge-tts) — rate-limited
  work/[slug]/page.tsx   SSG case studies (JSON-LD Article)
components/
  agent/                 VoiceAgent (mic → streamed chat → TTS + waveform)
  fx/                    Backdrop, Reveal, and other animation primitives
  modes/                 ModeSwitch, Dashboard (recharts), Playground (@xyflow/react)
  sections/              page sections (TrustPanel, nav, hero)
  ui/                    shadcn-style primitives (@base-ui/react + CVA)
lib/
  server/env.ts          typed server-only env access — the ONLY place reading process.env
  server/ratelimit.ts    Upstash Redis or in-memory rate limiting, same-origin guard
  data/                  kb (agent knowledge base), projects, work, skills, types
```

## Conventions

- TypeScript strict; no `any`.
- Keep files under 500 lines; prefer editing existing files over creating new ones.
- Design tokens live in `app/globals.css`; keep the "Operator Console" language (navy / Genesys-orange / sky).
- All new animations must respect `prefers-reduced-motion` (CSS block in globals.css; `useReducedMotion()` in framer-motion components).
- Security headers and CSP are defined in `next.config.ts` — review after any script/style source change.
- Server secrets go through `lib/server/env.ts` (`import "server-only"`). Never introduce `NEXT_PUBLIC_` secrets.
- Never commit `.env*` files. `.env.local.example` documents required vars (see README).
- API routes must keep: input validation, rate limiting (`lib/server/ratelimit.ts`), and the same-origin guard.

## Verification before commit

1. `npm run lint` and `npm run build` pass.
2. For UI changes: check desktop (1440px) and mobile (390px) rendering.
3. No secrets, credentials, or `.env` files staged.

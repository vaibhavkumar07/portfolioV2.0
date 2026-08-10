# CLAUDE.md — Project Guide

Portfolio of Vaibhavkumar Yadav — Genesys Cloud IVR / contact-center voice-AI engineer. A live, talking voice agent built on Next.js 16 (App Router, Turbopack), React 19, TypeScript (strict), and Tailwind CSS 4.

## Commands

```bash
npm run dev        # dev server at http://localhost:3000
npm run lint       # eslint (next/core-web-vitals + typescript)
npm run typecheck  # tsc --noEmit
npm run build      # production build (must stay green before commits)
npm run verify     # lint + typecheck + build — the gate
```

There is no test suite; `npm run verify` is the verification gate.

## Architecture

```
app/
  layout.tsx             root layout, fonts (Clash Display / General Sans / JetBrains Mono)
  page.tsx               home: hero, work rail, experience, about, stack, FAQ, contact
  globals.css            design tokens (OKLCH), utilities, animations
  not-found.tsx          404
  robots.ts sitemap.ts   crawler surface
  llms.txt/route.ts      plain-text KB dump for AI crawlers
  work/[slug]/page.tsx   SSG case studies (JSON-LD Article)
  api/chat/route.ts      streamed LLM proxy (NVIDIA NIM) — validated, rate-limited
  api/tts/route.ts       neural TTS proxy (msedge-tts) — rate-limited
  api/track/route.ts     counter increments (no PII)
  api/stats/route.ts     counter read-back for the Dashboard
components/
  agent/                 AgentRail (desktop rail + mobile takeover), VoiceAgent, HeroGreeting
  three/                 VoiceField (audio-reactive WebGL portrait), shaders
  sections/              SiteNav, HeroCopy, TrustPanel, Experience
  modes/                 ModeProvider, ModeSwitch, Dashboard (recharts), Playground (@xyflow/react)
  fx/                    Backdrop, Reveal, SplitText, CountUp, Magnetic, SmoothScroll, TrackVisit
lib/
  server/env.ts          typed server-only env access — the ONLY place reading process.env
  server/ratelimit.ts    Upstash Redis or in-memory rate limiting, same-origin guard
  server/stats.ts        durable counters (Upstash) with in-memory fallback
  data/                  kb (agent knowledge base), projects, skills, work, faq, types
  slug.ts theme.ts track.ts pronounce.ts
```

## Conventions

- TypeScript strict; no `any`.
- Keep files under 500 lines; prefer editing existing files over creating new ones.
- Components are PascalCase `.tsx`, one default export per file; `lib/` modules are camelCase with named exports.
- No dead code: an export with no consumer either gets a consumer or gets deleted. Same for unused deps and CSS utilities.
- `lib/data/kb.ts` is the single source of truth for facts — page copy, JSON-LD, `/llms.txt`, and the agent's answers all derive from it. Add facts there, not in a component.
- Design tokens live in `app/globals.css`; keep the "Operator Console" language (navy / cyan / amber, navy–paper–void surfaces). Raw hex is allowed only in `lib/theme.ts` (recharts + React Flow can't read CSS custom properties).
- All new animations must respect `prefers-reduced-motion` (CSS block in globals.css; `useReducedMotion()` in framer-motion components).
- Security headers and CSP are defined in `next.config.ts` — review after any script/style/font/image/fetch source change.
- Server secrets go through `lib/server/env.ts` (`import "server-only"`). Never introduce `NEXT_PUBLIC_` secrets.
- Never commit `.env*` files. `.env.local.example` documents required vars (see README).
- API routes must keep: input validation, rate limiting (`lib/server/ratelimit.ts`), and the same-origin guard.
- Security invariants added 2026-08-09, do not regress them:
  - `sameOrigin()` fails **closed** on a missing `Origin` header. Browsers always send it on non-GET/HEAD, so only non-browser clients are refused. Do not "relax it for testing".
  - `clientKey()` reads platform-set headers first; raw `x-forwarded-for` is last because a caller can rotate it to mint unlimited quota.
  - `/api/chat` returns 503 in production when Upstash is unset (`durableLimiting`) — the in-memory limiter is per-instance and so no limit at all under scale-out, in front of a metered key.
  - Every outbound `fetch` to a third party carries an `AbortSignal.timeout` below the route's `maxDuration`.
  - `script-src 'unsafe-inline'` is an accepted, documented risk in `next.config.ts` — read the note there before changing it.

## Verification before commit

1. `npm run verify` passes.
2. For UI changes: check desktop (1440px) and mobile (390px) rendering.
3. No secrets, credentials, or `.env` files staged.

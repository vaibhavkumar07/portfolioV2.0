# Portfolio ranking (name + role)

**Date:** 2026-08-24  
**Branch:** `ranking`  
**Goal:** Rank for “Vaibhavkumar Yadav” and for Genesys Cloud IVR / voice-AI / DFW queries on existing URLs only.

## Approach

Strengthen home + case studies. No keyword landing pages.

## On-site

- Home title: `Vaibhavkumar Yadav | Genesys Cloud IVR & Voice-AI Engineer | Dallas–Fort Worth`
- Case-study titles: `{project} | Genesys Cloud IVR | Vaibhavkumar Yadav`
- Visible hero line: name + Genesys Cloud IVR + Richardson / DFW
- Home canonical; OG/Twitter image `/profile1.jpeg`
- Person JSON-LD: `image`, `sameAs` LinkedIn
- Article JSON-LD: `image`, canonical `url`
- Optional `GOOGLE_SITE_VERIFICATION` via `lib/server/env.ts`

## Out of scope (operator)

Google Search Console verify + sitemap submit after deploy.

## Self-review

No invented metrics, no thin pages, facts stay in `lib/data/kb.ts`.

"use client";

import {
  Award,
  Briefcase,
  Download,
  ExternalLink,
  FileBadge,
  Layers,
  Mail,
  MapPin,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import SplitText from "@/components/fx/SplitText";
import CountUp from "@/components/fx/CountUp";
import GradientText from "@/components/fx/GradientText";
import Magnetic from "@/components/fx/Magnetic";
import { PROFILE } from "@/lib/data/kb";

/**
 * Hero rebuilt to match the approved mock composition.
 * Copy/stats use real PROFILE + verified facts only.
 */
export default function HeroCopy({ resumeHref }: { resumeHref?: string }) {
  return (
    <section className="relative px-5 pb-14 pt-10 sm:px-8 sm:pt-12 lg:px-10 lg:pb-16 lg:pt-14">
      {/* Ambient orbs — mock nebula. Clip here, not on the section:
          overflow-hidden + filter (gradient-text drop-shadow) hides “call.” */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <span className="absolute -right-20 top-10 h-72 w-72 rounded-full bg-[var(--violet)]/25 blur-[100px]" />
        <span className="absolute bottom-10 right-1/4 h-56 w-56 rounded-full bg-[var(--cyan)]/20 blur-[90px]" />
        <span className="absolute left-10 top-1/3 h-40 w-40 rounded-full bg-[var(--amber)]/10 blur-[80px]" />
      </div>

      <p className="relative mb-7 inline-flex items-center gap-2 rounded-full border border-[var(--live)]/50 bg-[var(--live)]/10 px-3.5 py-1.5 text-[0.65rem] font-[family-name:var(--font-mono)] uppercase tracking-[0.14em] text-[var(--live)]">
        <span className="h-1.5 w-1.5 rounded-full bg-[var(--live)]" style={{ boxShadow: "0 0 8px var(--live)" }} />
        <span className="hidden sm:inline">Open to Genesys Cloud / voice-AI roles</span>
        <span className="inline sm:hidden">Live · Available</span>
        <Sparkles className="h-3 w-3 opacity-70" aria-hidden="true" />
      </p>

      <p className="relative mb-4 max-w-full font-[family-name:var(--font-mono)] text-[0.62rem] uppercase leading-relaxed tracking-[0.1em] text-white/55 sm:text-[0.7rem] sm:tracking-[0.16em]">
        {PROFILE.name} · Genesys Cloud IVR · Richardson, TX (DFW)
      </p>

      <h1 className="relative max-w-[22ch] pl-[0.12em] -ml-[0.12em] font-[family-name:var(--font-heading)] text-[clamp(2.05rem,7.6vw,5.5rem)] font-semibold leading-[1.02] tracking-[-0.02em] text-white sm:max-w-[18ch] sm:leading-[0.92] sm:tracking-[-0.04em]">
        <SplitText text="I build the voice" />
        <br />
        <SplitText text="behind the " delay={0.12} />
        {/* Gradient + per-letter split do not mix: background-clip:text
            cannot paint through the split's inline-block children. */}
        <GradientText className="inline-block whitespace-nowrap">call.</GradientText>
      </h1>

      <p className="relative mt-7 max-w-xl text-[1.05rem] leading-relaxed text-white/65 sm:text-[1.125rem]">
        {PROFILE.experienceYears} years designing and scaling enterprise IVR, bot flows and AI-assisted CX
        on Genesys Cloud — for healthcare, automotive and e-commerce.
      </p>

      <div className="relative mt-9 flex flex-wrap items-center gap-3">
        {resumeHref && (
          <Magnetic>
            <a
              href={resumeHref}
              download
              className="btn-shimmer focus-ring inline-flex min-h-12 items-center gap-2.5 rounded-full bg-gradient-to-br from-[oklch(0.88_0.14_84)] to-[oklch(0.7_0.17_55)] px-7 text-[0.9rem] font-semibold text-[oklch(0.16_0.03_84)]"
              style={{ boxShadow: "0 8px 32px oklch(0.837 0.164 84 / 0.4)" }}
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              Download résumé
            </a>
          </Magnetic>
        )}
        <a
          href={`mailto:${PROFILE.email}`}
          className="focus-ring inline-flex min-h-12 items-center gap-2 rounded-full border border-[var(--cyan)]/40 bg-white/[0.03] px-6 text-[0.9rem] text-white/90 transition hover:border-[var(--cyan)] hover:bg-white/[0.06]"
        >
          <Mail className="h-4 w-4 text-[var(--cyan)]" aria-hidden="true" />
          Email me
        </a>
        <a
          href={PROFILE.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="focus-ring inline-flex min-h-12 items-center gap-2 rounded-full border border-[var(--cyan)]/40 bg-white/[0.03] px-6 text-[0.9rem] text-white/90 transition hover:border-[var(--cyan)] hover:bg-white/[0.06]"
        >
          <ExternalLink className="h-4 w-4 text-[var(--cyan)]" aria-hidden="true" />
          LinkedIn
        </a>
      </div>

      {/* Meta cards — mock 3-up */}
      <div className="relative mt-12 grid gap-3 sm:grid-cols-3">
        {[
          { Icon: MapPin, k: "Based in", v: "Richardson, Texas, USA", s: "Dallas–Fort Worth metro" },
          { Icon: Briefcase, k: "Current", v: "Package Consultant 2", s: "Infosys · Genesys Cloud SME" },
          { Icon: ShieldCheck, k: "Certified", v: "Genesys Cloud CX", s: "Professional + Developer" },
        ].map(({ Icon, k, v, s }) => (
          <div
            key={k}
            className="rounded-2xl border border-[var(--cyan)]/25 bg-white/[0.03] p-5 backdrop-blur-sm"
          >
            <div className="mb-3 flex items-center gap-2 text-[0.65rem] font-[family-name:var(--font-mono)] uppercase tracking-[0.16em] text-[var(--cyan)]">
              <Icon className="h-3.5 w-3.5" aria-hidden="true" />
              {k}
            </div>
            <p className="text-[0.95rem] font-medium text-white">{v}</p>
            <p className="mt-1 text-[0.75rem] text-white/45">{s}</p>
          </div>
        ))}
      </div>

      {/* Stats — 2×2 on phones (includes patent), 4-up from lg */}
      <div className="relative mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { n: "8+", l: "Years experience", d: "Voice & contact-center technology", Icon: Sparkles, c: "var(--cyan)" },
          { n: "12", l: "Certifications", d: "Genesys, Infosys CX suite & AI", Icon: Award, c: "var(--violet)" },
          { n: "5", l: "Platforms built", d: "Enterprise voice platforms delivered", Icon: Layers, c: "oklch(0.72 0.16 330)" },
          { n: "1", l: "Patent granted", d: "IN 405313 — intelligent systems", Icon: FileBadge, c: "var(--amber)" },
        ].map(({ n, l, d, Icon, c }) => (
          <div
            key={l}
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5"
            style={{ boxShadow: `inset 0 0 0 1px color-mix(in oklch, ${c} 18%, transparent)` }}
          >
            <Icon className="mb-3 h-4 w-4" style={{ color: c }} aria-hidden="true" />
            <div style={{ color: c }}>
              <CountUp value={n} className="block font-[family-name:var(--font-heading)] text-[1.85rem] font-semibold leading-none tracking-tight sm:text-[2.4rem]" />
            </div>
            <p className="mt-2 text-[0.58rem] font-[family-name:var(--font-mono)] uppercase tracking-[0.12em] text-white/80 sm:text-[0.65rem] sm:tracking-[0.14em]">
              {l}
            </p>
            <p className="mt-1 text-[0.65rem] leading-snug text-white/40 sm:text-[0.7rem]">{d}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

"use client";

import SplitText from "@/components/fx/SplitText";
import CountUp from "@/components/fx/CountUp";
import { PROFILE } from "@/lib/data/kb";

const STATS: [string, string][] = [
  ["8+", "years"],
  ["12", "certs"],
  ["5", "flagship builds"],
  ["1", "patent"],
];

/**
 * The opener, written for someone deciding whether to book a call.
 *
 * With the agent living permanently in the rail, the hero no longer has to
 * advertise it — so this screen spends itself on the three things a recruiter
 * checks first: what he does, whether he is available, and how to verify it.
 */
export default function HeroCopy({ resumeHref }: { resumeHref?: string }) {
  return (
    <section className="scroll-mt-24 px-5 pb-16 pt-12 sm:px-8 sm:pt-16 lg:pb-24 lg:pt-24">
      <p className="label-xs mb-7 inline-flex items-center gap-2 rounded-full border border-[var(--live)]/35 px-3 py-1.5 text-[var(--live)]">
        <span className="h-1.5 w-1.5 rounded-full bg-[var(--live)]" />
        Open to Genesys Cloud / voice-AI roles
      </p>

      <h1 className="t-display max-w-[15ch]">
        <SplitText text="I build the voice" />
        <br />
        <SplitText text="behind the " delay={0.14} />
        <span className="text-cyan">
          <SplitText text="call." delay={0.28} />
        </span>
      </h1>

      <p className="t-lead mt-7 max-w-xl text-muted-foreground">
        {PROFILE.experienceYears} years designing enterprise IVR, bot flows and AI-assisted CX on
        Genesys Cloud — for healthcare, automotive and e-commerce.
      </p>

      {/* Recruiter row: the two things they need before anything else. */}
      <div className="mt-9 flex flex-wrap items-center gap-3">
        {resumeHref && (
          <a
            href={resumeHref}
            download
            className="focus-ring inline-flex min-h-12 items-center gap-2 rounded-full bg-[var(--amber)] px-6 text-[0.95rem] font-semibold text-[oklch(0.16_0.03_84)] transition hover:brightness-110"
            style={{ boxShadow: "0 8px 30px oklch(0.837 0.164 84 / 0.3)" }}
          >
            ↓ Download résumé
          </a>
        )}
        <a
          href={`mailto:${PROFILE.email}`}
          className={`focus-ring inline-flex min-h-12 items-center rounded-full px-6 text-[0.95rem] transition ${
            resumeHref
              ? "border border-border hover:border-[var(--cyan)]"
              : "bg-[var(--amber)] font-semibold text-[oklch(0.16_0.03_84)] hover:brightness-110"
          }`}
        >
          Email me
        </a>
        <a
          href={PROFILE.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="focus-ring inline-flex min-h-12 items-center rounded-full border border-border px-5 text-[0.95rem] transition hover:border-[var(--cyan)]"
        >
          LinkedIn ↗
        </a>
      </div>

      {/* Facts a recruiter screens on, stated rather than buried in prose. */}
      <dl className="mt-10 grid max-w-2xl gap-x-8 gap-y-4 sm:grid-cols-3">
        <div>
          <dt className="label-xs text-muted-foreground">Based in</dt>
          <dd className="mt-1 text-sm text-foreground/90">{PROFILE.location}</dd>
        </div>
        <div>
          <dt className="label-xs text-muted-foreground">Current</dt>
          <dd className="mt-1 text-sm text-foreground/90">Package Consultant 2, Infosys</dd>
        </div>
        <div>
          <dt className="label-xs text-muted-foreground">Certified</dt>
          <dd className="mt-1 text-sm text-foreground/90">
            Genesys Cloud CX — Professional + Developer
          </dd>
        </div>
      </dl>

      <div className="mt-10 grid max-w-2xl grid-cols-2 gap-x-8 gap-y-5 sm:grid-cols-4">
        {STATS.map(([n, l]) => (
          <div key={l}>
            <CountUp value={n} className="t-title block" />
            <span className="label-xs text-muted-foreground">{l}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

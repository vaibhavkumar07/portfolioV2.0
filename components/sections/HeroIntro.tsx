"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import CountUp from "@/components/fx/CountUp";

const EASE = [0.22, 1, 0.36, 1] as const;

const STATS: [string, string][] = [
  ["8+", "years"],
  ["5", "flagship builds"],
  ["11", "certs"],
  ["1", "IoT patent"],
];

/** Hero left column: staggered entrance, then the primary action. */
export default function HeroIntro({
  title,
  experienceYears,
  onTalk,
}: {
  title: string;
  experienceYears: string;
  onTalk?: () => void;
}) {
  const reduce = useReducedMotion();

  const container: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: reduce ? 0 : 0.09 } },
  };
  const item: Variants = {
    hidden: reduce ? { opacity: 0 } : { opacity: 0, y: 22 },
    show: { opacity: 1, y: 0, transition: { duration: reduce ? 0.2 : 0.6, ease: EASE } },
  };
  const line: Variants = {
    hidden: reduce ? { opacity: 0 } : { y: "110%" },
    show: { opacity: 1, y: 0, transition: { duration: reduce ? 0.2 : 0.7, ease: EASE } },
  };

  return (
    <motion.div className="min-w-0" variants={container} initial="hidden" animate="show">
      <motion.p
        variants={item}
        className="glass-subtle label-xs inline-flex max-w-full items-center gap-2 rounded-full px-3 py-1.5 text-muted-foreground"
      >
        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--live)]" />
        Available for voice-AI / CX roles
      </motion.p>

      <h1 className="mt-6 text-[clamp(2.3rem,7vw,4rem)] font-bold leading-[1.02] tracking-tight">
        <span className="block overflow-hidden">
          <motion.span variants={line} className="block">
            I build the voice
          </motion.span>
        </span>
        <span className="block overflow-hidden">
          <motion.span variants={line} className="block">
            behind the <span className="text-cyan">call.</span>
          </motion.span>
        </span>
      </h1>

      <motion.p variants={item} className="mt-5 max-w-md text-base leading-relaxed text-muted-foreground">
        {experienceYears} years designing enterprise IVR, bot flows, and AI-assisted CX on
        Genesys Cloud — for healthcare, automotive, and e-commerce.
      </motion.p>
      <motion.p variants={item} className="mono mt-3 text-[0.8rem] leading-relaxed text-muted-foreground/75">
        {title}
      </motion.p>

      {/* Primary action — one obvious thing to do */}
      <motion.div variants={item} className="mt-8 flex flex-wrap items-center gap-3">
        <button
          type="button"
          data-agent-entry
          onClick={onTalk}
          className="focus-ring inline-flex min-h-12 items-center gap-2 rounded-2xl bg-[var(--amber)] px-6 text-[0.95rem] font-semibold text-[oklch(0.16_0.03_84)] transition hover:brightness-110"
          style={{ boxShadow: "0 8px 28px oklch(0.837 0.164 84 / 0.32)" }}
        >
          ◉ Talk to my portfolio
        </button>
        <a
          href="#work"
          className="focus-ring glass inline-flex min-h-12 items-center rounded-2xl px-5 text-[0.95rem] transition hover:brightness-125"
        >
          Explore work
        </a>
      </motion.div>

      <motion.div variants={item} className="mt-9 grid max-w-md grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
        {STATS.map(([n, l]) => (
          <div key={l}>
            <CountUp value={n} className="block text-2xl font-bold text-foreground" />
            <span className="label-xs text-muted-foreground">{l}</span>
          </div>
        ))}
      </motion.div>
    </motion.div>
  );
}

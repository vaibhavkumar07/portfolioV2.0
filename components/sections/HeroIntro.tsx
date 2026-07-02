"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import CountUp from "@/components/fx/CountUp";

const EASE = [0.22, 1, 0.36, 1] as const;

const STATS: [string, string][] = [
  ["8+", "years"],
  ["5", "flagship builds"],
  ["10", "certs"],
  ["1", "IoT patent"],
];

/** Hero left column: staggered entrance (badge → headline lines → copy → stats). */
export default function HeroIntro({
  title,
  experienceYears,
}: {
  title: string;
  experienceYears: string;
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
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: reduce ? 0.2 : 0.7, ease: EASE },
    },
  };

  return (
    <motion.div className="min-w-0" variants={container} initial="hidden" animate="show">
      <motion.p
        variants={item}
        className="mono mb-5 inline-flex max-w-full items-center gap-2 rounded-full border border-border px-3 py-1 text-[0.62rem] tracking-[0.16em] text-muted-foreground sm:text-[0.68rem]"
      >
        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--brand-green)]" /> AVAILABLE
        FOR VOICE-AI / CX ROLES
      </motion.p>

      <h1 className="text-[clamp(2.2rem,8vw,3.75rem)] font-bold leading-[1.02] tracking-tight">
        <span className="block overflow-hidden">
          <motion.span variants={line} className="block">
            I build the voice
          </motion.span>
        </span>
        <span className="block overflow-hidden">
          <motion.span variants={line} className="block">
            behind the <span className="text-orange">call.</span>
          </motion.span>
        </span>
      </h1>

      <motion.p
        variants={item}
        className="mt-6 max-w-md text-base leading-relaxed text-muted-foreground"
      >
        {title}. {experienceYears} years designing enterprise IVR, bot flows, and AI-assisted CX
        on Genesys Cloud for healthcare, automotive, and e-commerce.
      </motion.p>

      <motion.div
        variants={item}
        className="mono mt-8 flex flex-wrap gap-x-8 gap-y-3 text-sm"
      >
        {STATS.map(([n, l]) => (
          <div key={l}>
            <CountUp value={n} className="text-2xl font-bold text-foreground" />{" "}
            <span className="text-muted-foreground">{l}</span>
          </div>
        ))}
      </motion.div>
    </motion.div>
  );
}

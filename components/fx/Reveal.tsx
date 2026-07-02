"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1] as const;

type RevealVariant = "rise" | "fade" | "scale";

const HIDDEN: Record<RevealVariant, Record<string, number>> = {
  rise: { opacity: 0, y: 26 },
  fade: { opacity: 0 },
  scale: { opacity: 0, scale: 0.96 },
};

/** Scroll-triggered reveal (GitHub-style). Honors prefers-reduced-motion. */
export default function Reveal({
  children,
  delay = 0,
  className,
  variant = "rise",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  variant?: RevealVariant;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? { opacity: 0 } : HIDDEN[variant]}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: reduce ? 0.2 : 0.7, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Staggered list/grid reveal: wrap the container with RevealStagger and each
 * entry with RevealItem. 30-50ms per-item stagger per Material motion guidance.
 */
export function RevealStagger({
  children,
  className,
  stagger = 0.05,
}: {
  children: React.ReactNode;
  className?: string;
  stagger?: number;
}) {
  const reduce = useReducedMotion();
  const container: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: reduce ? 0 : stagger } },
  };
  return (
    <motion.div
      className={className}
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-60px" }}
    >
      {children}
    </motion.div>
  );
}

export function RevealItem({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const item: Variants = {
    hidden: reduce ? { opacity: 0 } : { opacity: 0, y: 18 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: reduce ? 0.2 : 0.55, ease: EASE },
    },
  };
  return (
    <motion.div className={className} variants={item}>
      {children}
    </motion.div>
  );
}

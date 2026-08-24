"use client";

import { motion, useReducedMotion } from "framer-motion";

/** Skill proficiency bar that grows into view on scroll. */
export default function AnimatedBar({
  level,
  label,
}: {
  level: number;
  label: string;
}) {
  const reduce = useReducedMotion();

  return (
    <div
      className="mt-1.5 h-1 overflow-hidden rounded-full bg-secondary"
      role="img"
      aria-label={`${label}: ${level} out of 100`}
    >
      <motion.div
        className="bar-shine h-full rounded-full"
        style={{
          background: "linear-gradient(90deg, var(--cyan), var(--violet))",
        }}
        initial={{ width: reduce ? `${level}%` : "0%" }}
        whileInView={{ width: `${level}%` }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: reduce ? 0 : 1.1, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
      />
    </div>
  );
}

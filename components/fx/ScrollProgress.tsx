"use client";

import { motion, useReducedMotion, useScroll, useSpring } from "framer-motion";

/** Thin scroll progress bar at the top of the viewport. */
export default function ScrollProgress() {
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 28, restDelta: 0.001 });

  if (reduce) return null;

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[2px] origin-left"
      style={{
        scaleX,
        background: "linear-gradient(90deg, var(--cyan), var(--violet), var(--amber))",
        boxShadow: "0 0 12px oklch(0.789 0.134 205 / 0.55)",
      }}
    />
  );
}

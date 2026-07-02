"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useReducedMotion } from "framer-motion";

/**
 * Counts a stat from 0 to its value on mount. Accepts values like "8+" or
 * "10" — the numeric prefix animates, the suffix is preserved. Renders the
 * final value immediately under reduced motion.
 *
 * Deliberately not gated on an IntersectionObserver: it is used for
 * above-the-fold hero stats, and observer timing proved flaky across
 * viewports (the count could get stuck at 0).
 */
export default function CountUp({
  value,
  className,
}: {
  value: string;
  className?: string;
}) {
  const match = value.match(/^(\d+)(.*)$/);
  const target = match ? parseInt(match[1], 10) : 0;
  const suffix = match ? match[2] : value;

  const ref = useRef<HTMLSpanElement>(null);
  const reduce = useReducedMotion();
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (reduce) return;
    const controls = animate(0, target, {
      duration: 1.2,
      delay: 0.3,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [reduce, target]);

  return (
    <span ref={ref} className={className}>
      {reduce ? target : display}
      {suffix}
    </span>
  );
}

"use client";

import Lenis from "lenis";
import { useEffect } from "react";
import { useReducedMotion } from "framer-motion";

/**
 * Momentum scrolling. Lenis 1.x drives the real window scroll position (it does
 * not transform a wrapper), so `useScroll`, `position: sticky`, hash links and
 * scroll-margin all keep working — that is why it is worth 3KB over a bespoke
 * lerp, which would break every one of them.
 *
 * Disabled outright under prefers-reduced-motion: smoothing is exactly the kind
 * of vestibular motion that setting exists to stop.
 */
export default function SmoothScroll() {
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce) return;

    const lenis = new Lenis({
      duration: 1.05,
      easing: (t) => 1 - Math.pow(1 - t, 3),
      // Touch devices already have native momentum; hijacking it makes phones
      // feel laggy, so only the wheel is smoothed.
      syncTouch: false,
    });

    let raf = 0;
    const loop = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
    };
  }, [reduce]);

  return null;
}

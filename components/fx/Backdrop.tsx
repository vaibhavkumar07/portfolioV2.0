"use client";

import { useEffect } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";

/**
 * GitHub-homepage-style atmosphere: deep base, drifting aurora glows, a grid
 * that fades toward the edges, and subtle mouse parallax for depth. Fixed
 * behind all content, non-interactive.
 */
export default function Backdrop() {
  const reduce = useReducedMotion();
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 40, damping: 20 });
  const sy = useSpring(my, { stiffness: 40, damping: 20 });

  const a1x = useTransform(sx, [-1, 1], [-26, 26]);
  const a1y = useTransform(sy, [-1, 1], [-18, 18]);
  const a2x = useTransform(sx, [-1, 1], [22, -22]);
  const a2y = useTransform(sy, [-1, 1], [16, -16]);

  useEffect(() => {
    // Parallax is pointless on touch devices and unwanted under reduced motion.
    if (reduce || window.matchMedia("(pointer: coarse)").matches) return;
    const onMove = (e: MouseEvent) => {
      mx.set((e.clientX / window.innerWidth) * 2 - 1);
      my.set((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [mx, my, reduce]);

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-background">
      {/* fading grid */}
      <div className="bg-grid absolute inset-0 backdrop-fade" />

      {/* drifting aurora glows */}
      <motion.div
        style={{ x: a1x, y: a1y }}
        className="absolute -top-40 right-[-10%] h-[42rem] w-[42rem] rounded-full blur-[120px] aurora-1"
      />
      <motion.div
        style={{ x: a2x, y: a2y }}
        className="absolute bottom-[-20%] left-[-10%] h-[40rem] w-[40rem] rounded-full blur-[120px] aurora-2"
      />
      <div className="absolute left-1/2 top-1/3 h-[34rem] w-[34rem] -translate-x-1/2 rounded-full blur-[140px] aurora-3" />

      {/* grain + vignette */}
      <div className="noise absolute inset-0" />
      <div className="absolute inset-0 backdrop-vignette" />
    </div>
  );
}

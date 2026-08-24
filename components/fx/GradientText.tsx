"use client";

import { useReducedMotion } from "framer-motion";

/** Animated cyan→violet→amber gradient on display type. */
export default function GradientText({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <span className={`${reduce ? "text-cyan" : "gradient-text-animated"} ${className}`}>
      {children}
    </span>
  );
}

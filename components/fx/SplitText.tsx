"use client";

import { useSyncExternalStore } from "react";
import { motion, useReducedMotion } from "framer-motion";

function subscribeNarrow(onStoreChange: () => void) {
  const mq = window.matchMedia("(max-width: 767px)");
  mq.addEventListener("change", onStoreChange);
  return () => mq.removeEventListener("change", onStoreChange);
}
const getNarrow = () => window.matchMedia("(max-width: 767px)").matches;
const getServerNarrow = () => true;

/**
 * Per-character reveal for display type. Characters rise on a stagger, which
 * reads as typography being set rather than a block being faded in.
 *
 * Each glyph is clipped in its own box so a wrapping line cannot hide the
 * first letter (the old single overflow-hidden wrapper + whileInView margin
 * ate the “b” in “behind” on phones). Below 768px we skip the split entirely —
 * faster paint, no clip risk, full sentence stays readable.
 *
 * The phrase is carried by aria-label on the wrapper, with the split characters
 * aria-hidden beneath it.
 */
export default function SplitText({
  text,
  className,
  delay = 0,
  stagger = 0.024,
}: {
  text: string;
  className?: string;
  delay?: number;
  stagger?: number;
}) {
  const reduce = useReducedMotion();
  const narrow = useSyncExternalStore(subscribeNarrow, getNarrow, getServerNarrow);

  if (reduce || narrow) return <span className={className}>{text}</span>;

  return (
    <span className={className} aria-label={text}>
      <span aria-hidden="true" className="whitespace-pre-wrap">
        {text.split("").map((ch, i) =>
          ch === " " ? (
            <span key={`sp-${i}`}> </span>
          ) : (
            <span
              key={`${ch}-${i}`}
              className="inline-block overflow-hidden pb-[0.14em] align-bottom"
            >
              <motion.span
                className="inline-block"
                initial={{ y: "108%" }}
                animate={{ y: 0 }}
                transition={{
                  duration: 0.75,
                  delay: delay + i * stagger,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                {ch}
              </motion.span>
            </span>
          ),
        )}
      </span>
    </span>
  );
}

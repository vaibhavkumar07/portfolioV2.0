"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * Per-character reveal for display type. Characters rise on a stagger, which
 * reads as typography being set rather than a block being faded in.
 *
 * The phrase is carried by aria-label on the wrapper, with the split characters
 * aria-hidden beneath it. An earlier version added a visually-hidden duplicate
 * instead, which put the headline in the DOM twice — bad for copy/paste, and
 * worse for the answer engines this site is built to be parsed by.
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

  if (reduce) return <span className={className}>{text}</span>;

  return (
    <span className={className} aria-label={text}>
      <span aria-hidden="true" className="inline-block overflow-hidden pb-[0.12em] align-bottom">
        {text.split("").map((ch, i) => (
          <motion.span
            key={`${ch}-${i}`}
            className="inline-block will-change-transform"
            initial={{ y: "108%" }}
            whileInView={{ y: 0 }}
            viewport={{ once: true, margin: "-12%" }}
            transition={{
              duration: 0.75,
              delay: delay + i * stagger,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            {ch === " " ? " " : ch}
          </motion.span>
        ))}
      </span>
    </span>
  );
}

"use client";

import { motion, useReducedMotion } from "framer-motion";

type Faq = { q: string; a: string };

export default function FaqList({ items }: { items: Faq[] }) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className="space-y-2"
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-60px" }}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: reduce ? 0 : 0.06 } },
      }}
    >
      {items.map((f) => (
        <motion.details
          key={f.q}
          className="glass group rounded-2xl px-5 py-4 open:border-[var(--cyan)]/35"
          variants={{
            hidden: reduce ? { opacity: 0 } : { opacity: 0, y: 14 },
            show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
          }}
        >
          <summary className="focus-ring cursor-pointer list-none rounded-lg text-sm font-medium text-foreground/90 transition hover:text-foreground [&::-webkit-details-marker]:hidden">
            <span className="mr-2 inline-block text-[var(--cyan)] transition-transform duration-300 group-open:rotate-90">
              ›
            </span>
            {f.q}
          </summary>
          <p className="faq-answer mt-3 pl-5 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
        </motion.details>
      ))}
    </motion.div>
  );
}

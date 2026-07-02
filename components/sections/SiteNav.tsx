"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Magnetic from "@/components/fx/Magnetic";

const NAV = [
  { id: "work", label: "WORK", key: "1" },
  { id: "about", label: "ABOUT", key: "2" },
  { id: "stack", label: "STACK", key: "3" },
  { id: "contact", label: "CONTACT", key: "4" },
];

export default function SiteNav({ email }: { email: string }) {
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/70 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
        <Link href="/" className="focus-ring flex items-center gap-2.5 rounded-md">
          <span className="grid h-7 w-7 place-items-center rounded-md border border-[var(--brand-orange)]/40">
            <span
              className="h-2 w-2 rounded-full bg-[var(--brand-orange)]"
              style={{ boxShadow: "0 0 8px var(--brand-orange)" }}
            />
          </span>
          <span className="mono text-xs tracking-[0.16em] text-foreground">V. YADAV</span>
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-6 md:flex">
          {NAV.map((n) => (
            <a
              key={n.id}
              href={`#${n.id}`}
              className="focus-ring mono rounded-md text-[0.72rem] tracking-[0.14em] text-muted-foreground transition hover:text-foreground"
            >
              <span className="text-[var(--brand-sky)]">{n.key}</span> {n.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Magnetic>
            <a
              href={`mailto:${email}`}
              className="focus-ring mono rounded-md border border-[var(--brand-sky)]/40 bg-[var(--brand-sky)]/10 px-3 py-1.5 text-[0.7rem] tracking-[0.12em] text-[var(--brand-sky)] transition hover:bg-[var(--brand-sky)]/20"
            >
              HIRE ME
            </a>
          </Magnetic>

          {/* Hamburger — mobile only */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            className="focus-ring grid h-11 w-11 place-items-center rounded-md border border-border md:hidden"
          >
            <span className="relative block h-3 w-5" aria-hidden="true">
              <span
                className={`absolute left-0 top-0 h-[1.5px] w-full bg-foreground transition-transform duration-200 ${
                  open ? "translate-y-[5.25px] rotate-45" : ""
                }`}
              />
              <span
                className={`absolute bottom-0 left-0 h-[1.5px] w-full bg-foreground transition-transform duration-200 ${
                  open ? "-translate-y-[5.25px] -rotate-45" : ""
                }`}
              />
            </span>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            id="mobile-nav"
            aria-label="Mobile"
            className="border-t border-border bg-background/95 backdrop-blur-md md:hidden"
            initial={reduce ? { opacity: 0 } : { opacity: 0, height: 0 }}
            animate={reduce ? { opacity: 1 } : { opacity: 1, height: "auto" }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, height: 0 }}
            transition={{ duration: reduce ? 0.1 : 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            <ul className="mx-auto max-w-6xl px-5 py-2">
              {NAV.map((n, i) => (
                <motion.li
                  key={n.id}
                  initial={reduce ? undefined : { opacity: 0, x: -10 }}
                  animate={reduce ? undefined : { opacity: 1, x: 0 }}
                  transition={{ delay: 0.04 * i, duration: 0.2 }}
                >
                  <a
                    href={`#${n.id}`}
                    onClick={() => setOpen(false)}
                    className="focus-ring mono flex min-h-11 items-center gap-3 rounded-md py-2 text-[0.8rem] tracking-[0.14em] text-muted-foreground transition hover:text-foreground"
                  >
                    <span className="text-[var(--brand-sky)]">{n.key}</span> {n.label}
                  </a>
                </motion.li>
              ))}
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}

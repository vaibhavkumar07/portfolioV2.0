"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Magnetic from "@/components/fx/Magnetic";
import { MODES, useMode } from "@/components/modes/ModeProvider";

const SECTIONS = [
  { id: "work", label: "Work" },
  { id: "experience", label: "Experience" },
  { id: "about", label: "About" },
  { id: "stack", label: "Stack" },
  { id: "contact", label: "Contact" },
];

/**
 * The single wayfinding surface. Page sections AND the Dashboard/Playground
 * views both live here — views used to sit behind a separate sticky bar below
 * the hero that most visitors never scrolled to.
 */
export default function SiteNav({ email }: { email: string }) {
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();
  const { mode, select, goToSection } = useMode();

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

  const onSection = (id: string) => {
    setOpen(false);
    goToSection(id);
  };
  const onView = (m: (typeof MODES)[number]["id"]) => {
    setOpen(false);
    select(m);
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <header className="sticky top-0 z-40 px-3 pt-3 sm:px-5">
      <div className="glass-strong mx-auto flex max-w-6xl items-center justify-between rounded-2xl px-4 py-2.5">
        <Link
          href="/"
          className="focus-ring flex shrink-0 items-center gap-2.5 rounded-xl"
          onClick={() => select("home")}
        >
          <span className="grid h-7 w-7 place-items-center rounded-lg border border-[var(--cyan)]/40">
            <span
              className="h-2 w-2 rounded-full bg-[var(--cyan)]"
              style={{ boxShadow: "0 0 10px var(--cyan)" }}
            />
          </span>
          <span className="label-sm text-foreground">V. Yadav</span>
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => onSection(s.id)}
              className="focus-ring label-xs min-h-9 rounded-lg px-2.5 text-muted-foreground transition hover:text-foreground"
            >
              {s.label}
            </button>
          ))}
          <span aria-hidden="true" className="mx-2 h-4 w-px bg-border" />
          {MODES.filter((m) => m.id !== "home").map((m) => (
            <button
              key={m.id}
              onClick={() => onView(m.id)}
              aria-pressed={mode === m.id}
              className={`focus-ring label-xs min-h-9 rounded-lg px-2.5 transition ${
                mode === m.id
                  ? "bg-[var(--cyan)]/18 text-[var(--cyan)]"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {m.label}
            </button>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <Magnetic>
            <a
              href={`mailto:${email}`}
              className="focus-ring label-xs inline-flex min-h-9 items-center rounded-xl bg-[var(--amber)] px-3.5 font-medium text-[oklch(0.16_0.03_84)] transition hover:brightness-110"
            >
              Hire me
            </a>
          </Magnetic>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            className="focus-ring grid h-11 w-11 place-items-center rounded-xl border border-border lg:hidden"
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
            className="glass-strong mx-auto mt-2 max-w-6xl overflow-hidden rounded-2xl lg:hidden"
            initial={reduce ? { opacity: 0 } : { opacity: 0, height: 0 }}
            animate={reduce ? { opacity: 1 } : { opacity: 1, height: "auto" }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, height: 0 }}
            transition={{ duration: reduce ? 0.1 : 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            <ul className="px-3 py-2">
              {SECTIONS.map((s) => (
                <li key={s.id}>
                  <button
                    onClick={() => onSection(s.id)}
                    className="focus-ring label-sm flex min-h-12 w-full items-center rounded-xl px-3 text-muted-foreground transition hover:text-foreground"
                  >
                    {s.label}
                  </button>
                </li>
              ))}
              <li aria-hidden="true" className="my-1 h-px bg-border" />
              {MODES.map((m) => (
                <li key={m.id}>
                  <button
                    onClick={() => onView(m.id)}
                    aria-pressed={mode === m.id}
                    className={`focus-ring label-sm flex min-h-12 w-full items-center rounded-xl px-3 transition ${
                      mode === m.id ? "text-[var(--cyan)]" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {m.label}
                  </button>
                </li>
              ))}
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}

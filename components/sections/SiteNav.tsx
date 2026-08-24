"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, ChevronDown } from "lucide-react";
import { MODES, useMode } from "@/components/modes/ModeProvider";

const SECTIONS = [
  { id: "stack", label: "Expertise" },
  { id: "work", label: "Work" },
  { id: "experience", label: "Experience" },
  { id: "about", label: "About" },
  { id: "faq", label: "Insights" },
];

/** Mock-exact top bar inside the main content frame. */
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

  return (
    <header className="sticky top-0 z-50">
      {/* Gradient top rule — mock */}
      <div
        aria-hidden="true"
        className="h-[2px] w-full"
        style={{
          background: "linear-gradient(90deg, var(--cyan), var(--violet), var(--amber))",
          boxShadow: "0 0 12px oklch(0.789 0.134 205 / 0.45)",
        }}
      />
      <div className="flex items-center justify-between gap-3 border-b border-white/[0.06] bg-[#080b12]/85 px-5 py-3 backdrop-blur-xl sm:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            href="/"
            onClick={() => select("home")}
            className="focus-ring hidden font-[family-name:var(--font-heading)] text-[0.95rem] font-semibold tracking-tight text-white sm:block"
          >
            V. Yadav
          </Link>
          {/* Mobile: OPERATOR CONSOLE branding */}
          <span className="flex items-center gap-2 sm:hidden">
            <span
              aria-hidden="true"
              className="grid h-7 w-7 place-items-center rounded-full border border-[var(--cyan)]/35"
              style={{ boxShadow: "inset 0 0 10px oklch(0.789 0.134 205 / 0.35)" }}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--cyan)]" />
            </span>
            <span className="hidden min-[380px]:inline text-[0.6rem] font-[family-name:var(--font-mono)] uppercase tracking-[0.18em] text-white/50">
              Operator console
            </span>
          </span>
        </div>

        <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => goToSection(s.id)}
              className="focus-ring rounded-md px-2.5 py-1.5 text-[0.7rem] text-white/50 transition hover:text-white"
            >
              {s.label}
            </button>
          ))}
          <span aria-hidden="true" className="mx-2 h-3.5 w-px bg-white/10" />
          {MODES.filter((m) => m.id !== "home").map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => {
                select(m.id);
                window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
              }}
              aria-pressed={mode === m.id}
              className={`focus-ring rounded-md px-2.5 py-1.5 text-[0.7rem] transition ${
                mode === m.id ? "text-[var(--cyan)]" : "text-white/50 hover:text-white"
              }`}
            >
              {m.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="focus-ring hidden items-center gap-1 rounded-lg px-2 py-1.5 text-[0.75rem] text-white/70 md:inline-flex"
            aria-hidden="true"
            tabIndex={-1}
          >
            V. Yadav
            <ChevronDown className="h-3.5 w-3.5 opacity-50" />
          </button>
          <a
            href={`mailto:${email}`}
            className="focus-ring relative inline-flex min-h-9 shrink-0 items-center gap-1 rounded-xl border border-[var(--amber)]/60 bg-[var(--amber)]/10 px-2.5 text-[0.65rem] font-medium text-[var(--amber)] transition hover:bg-[var(--amber)]/20 sm:gap-1.5 sm:px-3.5 sm:text-[0.7rem]"
            style={{ boxShadow: "0 0 20px oklch(0.837 0.164 84 / 0.22)" }}
          >
            Hire me
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
            <span
              aria-hidden="true"
              className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-[var(--amber)]"
              style={{ boxShadow: "0 0 8px var(--amber)" }}
            />
          </a>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            className="focus-ring grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/10 lg:hidden"
          >
            <span className="relative block h-3 w-4" aria-hidden="true">
              <span className={`absolute inset-x-0 top-0 h-px bg-white transition ${open ? "translate-y-[5px] rotate-45" : ""}`} />
              <span className={`absolute inset-x-0 bottom-0 h-px bg-white transition ${open ? "-translate-y-[5px] -rotate-45" : ""}`} />
            </span>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            id="mobile-nav"
            aria-label="Mobile"
            className="overflow-hidden border-b border-white/10 bg-[#080b12] lg:hidden"
            initial={reduce ? { opacity: 0 } : { opacity: 0, height: 0 }}
            animate={reduce ? { opacity: 1 } : { opacity: 1, height: "auto" }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, height: 0 }}
          >
            <ul className="max-h-[min(70vh,28rem)] overflow-y-auto px-3 py-2">
              {SECTIONS.map((s) => (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      goToSection(s.id);
                    }}
                    className="focus-ring flex min-h-11 w-full items-center rounded-lg px-3 text-sm text-white/60"
                  >
                    {s.label}
                  </button>
                </li>
              ))}
              <li aria-hidden="true" className="mx-3 my-2 h-px bg-white/10" />
              {mode !== "home" && (
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      select("home");
                      window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
                    }}
                    className="focus-ring flex min-h-11 w-full items-center rounded-lg px-3 text-sm text-white/60"
                  >
                    Home
                  </button>
                </li>
              )}
              {MODES.filter((m) => m.id !== "home").map((m) => (
                <li key={m.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      select(m.id);
                      window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
                    }}
                    aria-pressed={mode === m.id}
                    className={`focus-ring flex min-h-11 w-full items-center rounded-lg px-3 text-sm ${
                      mode === m.id ? "text-[var(--cyan)]" : "text-white/60"
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

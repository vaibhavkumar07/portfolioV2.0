"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import VoiceAgent from "@/components/agent/VoiceAgent";
import HeroGreeting from "@/components/agent/HeroGreeting";

const VoiceField = dynamic(() => import("@/components/three/VoiceField"), { ssr: false });

/* Same probe as before: the scene is worth it on a desktop rail, never on a
   phone where the rail collapses to a 56px bar. */
let webglCapable: boolean | null = null;

function detectWebgl() {
  if (webglCapable !== null) return webglCapable;
  try {
    const c = document.createElement("canvas");
    const ok = !!(c.getContext("webgl2") || c.getContext("webgl"));
    const saveData =
      (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData === true;
    const small = window.matchMedia("(max-width: 1023px)").matches;
    webglCapable = ok && !saveData && !small;
  } catch {
    webglCapable = false;
  }
  return webglCapable;
}

const noopSubscribe = () => () => {};

/** Session timer. A call that has been open for 2 minutes reads as a call. */
function CallTimer() {
  const [secs, setSecs] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setSecs((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, []);
  const mm = String(Math.floor(secs / 60)).padStart(2, "0");
  const ss = String(secs % 60).padStart(2, "0");
  return (
    <span className="tabular-nums" suppressHydrationWarning>
      {mm}:{ss}
    </span>
  );
}

/**
 * The agent as a permanent fixture rather than a destination.
 *
 * On desktop this is a full-height column: live portrait on top, line status
 * and running timer, transcript and mic below. It never scrolls away, so the
 * one thing no other portfolio has is on screen for the whole visit.
 *
 * Below lg the column would eat the viewport, so it collapses to a sticky bar
 * that opens the same conversation full-screen.
 */
export default function AgentRail() {
  const analyserRef = useRef<AnalyserNode | null>(null);
  /* createMediaElementSource is one-shot per <audio>, so the greeting cannot
     share the conversation's node. */
  const greetAnalyserRef = useRef<AnalyserNode | null>(null);
  const reduce = useReducedMotion();
  const webgl = useSyncExternalStore(noopSubscribe, detectWebgl, () => false);

  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  const analysers = [analyserRef, greetAnalyserRef];

  return (
    <>
      {/* ── Desktop rail ─────────────────────────────────────────── */}
      <div className="hidden h-screen flex-col border-r border-border bg-[var(--background-deep)] lg:flex">
        <div className="relative h-[46%] shrink-0 overflow-hidden">
          {webgl && !reduce ? (
            <VoiceField analysers={analysers} className="h-full w-full" />
          ) : (
            <Image
              src="/avatar-hero.jpg"
              alt="Vaibhavkumar Yadav"
              fill
              priority
              sizes="420px"
              className="object-cover object-[50%_20%]"
            />
          )}

          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-24"
            style={{ background: "linear-gradient(to top, var(--background-deep), transparent)" }}
          />

          {/* Line status — the call metaphor, stated once and left running. */}
          <div className="absolute inset-x-3 top-3 flex items-center gap-2 rounded-xl border border-[var(--live)]/30 bg-[var(--background-deep)]/70 px-3 py-2 backdrop-blur">
            <span
              className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--live)]"
              style={{ boxShadow: "0 0 8px var(--live)" }}
            />
            <span className="label-xs text-[var(--live)]">Line open</span>
            <span className="label-xs ml-auto text-muted-foreground">
              <CallTimer />
            </span>
          </div>

          <HeroGreeting
            analyserRef={greetAnalyserRef}
            suppressed={false}
            className="absolute inset-x-3 bottom-3 z-10"
          />
        </div>

        {/* Transcript + mic fill the rest of the column. */}
        <div className="min-h-0 flex-1">
          <VoiceAgent variant="rail" analyserRef={analyserRef} />
        </div>
      </div>

      {/* ── Mobile bar ───────────────────────────────────────────────
          Fixed, not sticky: the rail is the first element in document flow, so
          a sticky bar would scroll away with it instead of holding the bottom
          of the viewport. The content column reserves space with pb-20. */}
      <div className="glass-strong fixed inset-x-0 bottom-0 z-40 flex items-center gap-3 border-t border-border px-3 py-2.5 lg:hidden">
        <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl border border-border">
          <Image src="/profile.jpeg" alt="" fill sizes="40px" className="object-cover" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="label-xs flex items-center gap-1.5 text-[var(--live)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--live)]" /> Line open
          </span>
          <span className="block truncate text-sm text-muted-foreground">
            Ask about my work or availability
          </span>
        </span>
        <button
          type="button"
          data-agent-entry
          onClick={() => setOpen(true)}
          className="focus-ring label-xs min-h-11 shrink-0 rounded-xl bg-[var(--amber)] px-4 font-medium text-[oklch(0.16_0.03_84)]"
        >
          ◉ Talk
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Talk to my portfolio"
            className="fixed inset-0 z-50 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0.1 : 0.24 }}
          >
            <div className="absolute inset-0 bg-[var(--background-deep)]/[0.97] backdrop-blur-2xl" />
            <button
              ref={closeRef}
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close the voice agent"
              className="focus-ring glass absolute right-4 top-4 z-10 grid h-11 w-11 place-items-center rounded-2xl text-lg text-muted-foreground"
            >
              ✕
            </button>
            <div className="relative h-full p-4 pt-20">
              <VoiceAgent variant="takeover" analyserRef={analyserRef} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

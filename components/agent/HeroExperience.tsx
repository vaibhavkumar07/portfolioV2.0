"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import HeroIntro from "@/components/sections/HeroIntro";
import VoiceAgent from "@/components/agent/VoiceAgent";

const AvatarScene = dynamic(() => import("./AvatarScene"), { ssr: false });

const EASE = [0.22, 1, 0.36, 1] as const;

/** The avatar, or a photo where WebGL isn't available. */
function Stage({
  webgl,
  framing,
  analyserRef,
  reduce,
}: {
  webgl: boolean;
  framing: "bust" | "chest";
  analyserRef?: React.RefObject<AnalyserNode | null>;
  reduce: boolean;
}) {
  if (!webgl) {
    return (
      <Image
        src="/profile.jpeg"
        alt="Vaibhavkumar Yadav"
        fill
        priority
        className="object-cover"
        sizes="(max-width: 1024px) 100vw, 560px"
      />
    );
  }
  return (
    <AvatarScene
      framing={framing}
      analyserRef={analyserRef}
      reduce={reduce}
      rimA="#22d3ee"
      rimB="#a78bfa"
    />
  );
}

/**
 * The hero: statement + primary action on the left, the live avatar as a lit
 * stage on the right. "Talk to my portfolio" opens a full-screen takeover
 * where the avatar lip-syncs to the agent's real voice.
 *
 * WebGL is probed (not assumed) and gated to >=768px; everything else gets a
 * photo composition rather than an empty layer.
 */
export default function HeroExperience({
  title,
  experienceYears,
}: {
  title: string;
  experienceYears: string;
}) {
  const [open, setOpen] = useState(false);
  const [webgl, setWebgl] = useState(false);
  const reduce = useReducedMotion();
  const analyserRef = useRef<AnalyserNode | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // Probe for a real context — headless browsers and old GPUs report a
    // canvas but fail to create one, which would throw inside the scene.
    let supported = false;
    try {
      const probe = document.createElement("canvas");
      supported = !!(probe.getContext("webgl2") || probe.getContext("webgl"));
    } catch {
      supported = false;
    }
    if (!supported) return;
    const mq = window.matchMedia("(min-width: 768px)");
    const update = () => setWebgl(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

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

  return (
    <>
      <HeroIntro title={title} experienceYears={experienceYears} onTalk={() => setOpen(true)} />

      {/* Avatar stage — click anywhere to start talking */}
      <div className="rise relative h-[26rem] min-w-0 sm:h-[32rem]" style={{ animationDelay: "0.15s" }}>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Talk to my portfolio — open the live voice agent"
          className="focus-ring lift glass group relative block h-full w-full overflow-hidden rounded-3xl"
        >
          <span className="absolute inset-0" aria-hidden="true">
            <Stage webgl={webgl} framing="bust" reduce={!!reduce} />
          </span>

          {/* Depth layer: chips floating in front of the avatar */}
          <span className="glass-subtle absolute left-4 top-4 rounded-2xl px-3 py-2 text-left" aria-hidden="true">
            <span className="label-xs flex items-center gap-1.5 text-[var(--cyan)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--live)]" /> Live
            </span>
            <span className="mono mt-0.5 block text-[0.75rem] text-muted-foreground">ask me anything</span>
          </span>

          <span
            className="glass-strong absolute inset-x-4 bottom-4 flex items-center justify-between gap-3 rounded-2xl px-4 py-3"
            aria-hidden="true"
          >
            <span className="text-left text-sm text-foreground/90">
              Ask about my work, stack, or availability
            </span>
            <span className="label-xs shrink-0 rounded-xl bg-[var(--amber)] px-3 py-2 font-medium text-[oklch(0.16_0.03_84)] transition group-hover:brightness-110">
              ▶ Start
            </span>
          </span>
        </button>
      </div>

      {/* Full-screen takeover */}
      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Talk to my portfolio"
            className="fixed inset-0 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0.1 : 0.28 }}
          >
            <div className="absolute inset-0 bg-[var(--background-deep)]/92 backdrop-blur-2xl" />

            <button
              ref={closeRef}
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close the voice agent"
              className="focus-ring glass absolute right-4 top-4 z-10 grid h-11 w-11 place-items-center rounded-2xl text-lg text-muted-foreground transition hover:text-foreground"
            >
              ✕
            </button>

            <div className="relative mx-auto grid h-full max-w-6xl grid-rows-[minmax(0,36vh)_minmax(0,1fr)] gap-3 p-4 sm:p-5 lg:grid-cols-[1fr_440px] lg:grid-rows-1 lg:gap-6 lg:py-8">
              <motion.div
                initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: reduce ? 0.1 : 0.45, ease: EASE }}
                className="glass relative min-h-0 overflow-hidden rounded-3xl"
              >
                <Stage webgl={webgl} framing="chest" analyserRef={analyserRef} reduce={!!reduce} />
                <span className="glass-subtle label-xs absolute left-4 top-4 rounded-xl px-3 py-2 text-muted-foreground">
                  ◉ Live · ask me anything about my work
                </span>
              </motion.div>

              <motion.div
                initial={reduce ? { opacity: 0 } : { opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: reduce ? 0.1 : 0.4, delay: 0.08, ease: EASE }}
                className="min-h-0"
              >
                <VoiceAgent variant="takeover" analyserRef={analyserRef} />
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

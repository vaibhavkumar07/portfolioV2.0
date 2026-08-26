"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  AudioLines,
  Blocks,
  Box,
  CircleHelp,
  LayoutDashboard,
  Network,
  Phone,
  Shield,
  Terminal,
  User,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { useMode } from "@/components/modes/ModeProvider";

const VoiceAgent = dynamic(() => import("@/components/agent/VoiceAgent"), {
  ssr: false,
  loading: () => <ChatSkeleton />,
});

function ChatSkeleton() {
  return (
    <div className="flex h-full flex-col" aria-busy="true" aria-label="Opening chat">
      <div className="border-b border-white/10 px-4 py-3">
        <span className="text-[0.65rem] font-[family-name:var(--font-mono)] uppercase tracking-[0.14em] text-white/45">
          Opening the line…
        </span>
      </div>
      <div className="flex-1 space-y-3 p-4">
        <div className="h-16 animate-pulse rounded-lg bg-white/5 motion-reduce:animate-none" />
        <div className="h-10 w-2/3 animate-pulse rounded-lg bg-white/5 motion-reduce:animate-none" />
      </div>
    </div>
  );
}

const SECTIONS = [
  { Icon: AudioLines, label: "Voice", id: "main" },
  { Icon: User, label: "About", id: "about" },
  { Icon: Network, label: "Experience", id: "experience" },
  { Icon: Box, label: "Work", id: "work" },
  { Icon: Shield, label: "Stack", id: "stack" },
  { Icon: CircleHelp, label: "Insights", id: "faq" },
  { Icon: Terminal, label: "Contact", id: "contact" },
] as const;

const MODE_ITEMS = [
  { Icon: LayoutDashboard, id: "dashboard" as const, label: "Dashboard" },
  { Icon: Blocks, id: "playground" as const, label: "Playground" },
];

const emptySubscribe = () => () => {};

function CallTimer() {
  const [secs, setSecs] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setSecs((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <span className="tabular-nums" suppressHydrationWarning>
      {String(Math.floor(secs / 60)).padStart(2, "0")}:{String(secs % 60).padStart(2, "0")}
    </span>
  );
}

/**
 * Desktop = mock 2-panel console. Chat portals to document.body so fixed
 * overlay is not trapped inside the sticky aside.
 */
export default function AgentRail() {
  const reduce = useReducedMotion();
  const pathname = usePathname();
  const { mode, select, goToSection } = useMode();
  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const isClient = useSyncExternalStore(emptySubscribe, () => true, () => false);

  useEffect(() => {
    void import("@/components/agent/VoiceAgent");
  }, []);

  const openChat = () => setOpen(true);

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
      <div className="hidden h-screen lg:flex">
        <nav aria-label="Site" className="z-30 w-44 shrink-0 self-stretch">
          <div className="flex h-full flex-col overflow-y-auto border-r border-white/[0.06] bg-[#03050c] py-4">
            <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto px-2.5 pt-1">
              {SECTIONS.map(({ Icon, label, id }) => {
                const active =
                  id === "work"
                    ? pathname.startsWith("/work")
                    : pathname === "/" && mode === "home" && id === "main";
                return (
                  <a
                    key={id}
                    href={pathname === "/" ? `#${id}` : `/#${id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      goToSection(id);
                    }}
                    aria-current={active ? "page" : undefined}
                    className={`focus-ring flex h-9 min-w-0 items-center gap-3 rounded-xl px-2 transition ${
                      active
                        ? "bg-[var(--cyan)]/20 text-[var(--cyan)] shadow-[0_0_16px_oklch(0.789_0.134_205_/_0.35)]"
                        : "text-white/55 hover:bg-white/5 hover:text-[var(--cyan)]"
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" strokeWidth={1.5} aria-hidden="true" />
                    <span className="truncate text-xs">{label}</span>
                  </a>
                );
              })}
            </div>
            <div className="mt-2 flex flex-col gap-2 border-t border-white/[0.08] px-2.5 pt-3">
              {MODE_ITEMS.map(({ Icon, id, label }) => {
                const active = pathname === "/" && mode === id;
                return (
                  <button
                    key={id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => {
                      select(id);
                      if (pathname === "/") {
                        window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
                      }
                    }}
                    className={`focus-ring flex h-9 min-w-0 items-center gap-3 rounded-xl px-2 transition ${
                      active
                        ? "bg-[var(--amber)]/20 text-[var(--amber)]"
                        : "text-white/55 hover:bg-white/5 hover:text-[var(--amber)]"
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" strokeWidth={1.5} aria-hidden="true" />
                    <span className="truncate text-xs">{label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </nav>

        <div className="relative flex w-[22rem] shrink-0 flex-col overflow-hidden border-r border-white/[0.08] bg-[#05070f] xl:w-[24rem]">
          <div className="relative z-20 shrink-0 border-b border-white/[0.06] bg-[#05070f] px-5 pb-3 pt-5">
            <p className="label-xs text-white/55">
              Voice console
            </p>
            <span className="mt-2.5 flex h-4 items-end gap-[2px]" aria-hidden="true">
              {[3, 7, 4, 11, 6, 13, 5, 10, 4, 12, 7, 9, 5].map((h, i) => (
                <span
                  key={i}
                  className="agent-wave-bar w-[2px] rounded-full bg-[var(--cyan)]"
                  style={{ height: h, animationDelay: `${i * 0.06}s` }}
                />
              ))}
            </span>
          </div>

          <div className="relative min-h-0 flex-1">
            <Image
              src="/profile1.jpeg"
              alt="Vaibhavkumar Yadav"
              fill
              sizes="384px"
              className="object-cover object-[50%_18%]"
            />
            {/* Navy/cyan wash so outdoor photo matches console tokens */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "linear-gradient(to bottom, oklch(0.14 0.03 250 / 0.35) 0%, transparent 28%), linear-gradient(to top, #05070f 6%, oklch(0.14 0.03 250 / 0.55) 38%, transparent 72%), radial-gradient(ellipse 90% 55% at 50% 100%, oklch(0.55 0.14 205 / 0.28), transparent 60%)",
              }}
            />

            <div
              className="absolute inset-x-4 top-3 z-20 flex items-center gap-2 rounded-full border border-[var(--live)]/55 bg-black/70 px-3.5 py-2 backdrop-blur-md"
              style={{ boxShadow: "0 0 24px oklch(0.78 0.17 152 / 0.2)" }}
            >
              <span className="h-2 w-2 shrink-0 rounded-full bg-[var(--live)]" style={{ boxShadow: "0 0 10px var(--live)" }} />
              <span className="text-[0.65rem] font-[family-name:var(--font-mono)] uppercase tracking-[0.14em] text-[var(--live)]">
                Line open
              </span>
              <span className="ml-auto text-[0.65rem] font-[family-name:var(--font-mono)] text-[var(--live)]/85">
                <CallTimer />
              </span>
            </div>
          </div>

          <div className="relative z-20 shrink-0 border-t border-white/[0.06] bg-[#05070f] px-5 pb-5 pt-4">
            <dl className="space-y-2.5">
              {[
                ["Agent", "V. Yadav"],
                ["Role", "Voice Architect"],
                ["Specialty", "Genesys Cloud / Voice AI"],
                ["Status", "Open to Genesys Cloud / voice-AI roles"],
              ].map(([k, v]) => (
                <div key={k} className="grid grid-cols-[5.75rem_minmax(0,1fr)] gap-x-2 text-sm leading-snug">
                  <dt className="font-[family-name:var(--font-mono)] uppercase tracking-[0.12em] text-white/35">
                    {k}
                  </dt>
                  <dd className="text-white/90">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>

      <div className="fixed inset-x-3 z-40 flex items-center gap-3 rounded-[1.25rem] border border-white/10 bg-[#080b12]/95 px-3 py-2.5 shadow-[0_16px_48px_oklch(0_0_0_/_0.55)] backdrop-blur-xl lg:hidden bottom-[max(0.75rem,env(safe-area-inset-bottom))]">
        <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full border border-white/15">
          <Image src="/profile1.jpeg" alt="" fill sizes="44px" className="object-cover object-[50%_18%]" />
          <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-[#080b12] bg-[var(--live)]" />
        </span>
        <span className="hidden min-w-0 flex-1 min-[360px]:block">
          <span className="block text-[0.6rem] uppercase tracking-[0.14em] text-white/40">Agent status</span>
          <span className="mt-0.5 flex items-center gap-1.5 text-[0.7rem] font-medium text-[var(--live)]">
            <AudioLines className="h-3 w-3" aria-hidden="true" />
            Line open
          </span>
        </span>
        <button
          type="button"
          data-agent-entry
          onPointerDown={() => {
            void import("@/components/agent/VoiceAgent");
          }}
          onClick={openChat}
          className="focus-ring inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-xl bg-gradient-to-br from-[oklch(0.86_0.14_84)] to-[oklch(0.72_0.16_55)] px-3 text-[0.65rem] font-semibold uppercase tracking-[0.08em] text-[oklch(0.16_0.03_84)] min-[400px]:px-4 min-[400px]:text-[0.7rem] min-[400px]:tracking-[0.1em]"
          style={{ boxShadow: "0 0 24px oklch(0.837 0.164 84 / 0.35)" }}
        >
          <Phone className="h-3.5 w-3.5" aria-hidden="true" />
          Talk to me
        </button>
      </div>

      {isClient &&
        createPortal(
          <AnimatePresence>
            {open ? (
              <motion.div
                key="talk"
                role="dialog"
                aria-modal="true"
                aria-label="Talk to my portfolio"
                className="fixed inset-0 z-[200] flex flex-col"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: reduce ? 0.08 : 0.12 }}
              >
                <div className="absolute inset-0 bg-[#05070f]" />
                <button
                  ref={closeRef}
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close"
                  className="focus-ring absolute right-4 top-4 z-10 grid h-11 w-11 place-items-center rounded-2xl border border-white/15 bg-white/10 text-lg text-white"
                >
                  ✕
                </button>
                <div className="relative z-[1] mx-auto h-full w-full max-w-2xl p-4 pt-20">
                  <div className="h-full overflow-hidden rounded-2xl border border-white/10 bg-[#0a0d18]">
                    <VoiceAgent variant="takeover" />
                  </div>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>,
          document.body,
        )}
    </>
  );
}

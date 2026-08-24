"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { track } from "@/lib/track";

export type Mode = "home" | "dashboard" | "playground";

export const MODES: { id: Mode; label: string }[] = [
  { id: "home", label: "Home" },
  { id: "dashboard", label: "Dashboard" },
  { id: "playground", label: "Playground" },
];

const SECTIONS = ["work", "about", "stack", "faq", "contact"];

type Ctx = {
  mode: Mode;
  select: (m: Mode) => void;
  /** Go to a page section, returning to HOME first if a mode is open. */
  goToSection: (id: string) => void;
};

const ModeCtx = createContext<Ctx | null>(null);

/** Falls back to router navigation when used outside ModeProvider (case studies). */
export function useMode(): Ctx {
  const ctx = useContext(ModeCtx);
  const router = useRouter();
  if (ctx) return ctx;
  return {
    mode: "home",
    select: (m) => {
      router.push(m === "home" ? "/" : `/?view=${m}`);
    },
    goToSection: (id) => {
      router.push(`/#${id}`);
    },
  };
}

/**
 * Owns which view is showing so the site nav and mode bar share one source of
 * truth. State lives in `?view=` (no localStorage) so a fresh visit lands on HOME.
 */
export default function ModeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<Mode>("home");
  const modeRef = useRef(mode);
  const pendingScroll = useRef<string | null>(null);
  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  // Deep-link read must happen post-hydration (SSR always renders HOME).
  useEffect(() => {
    const url = new URLSearchParams(window.location.search).get("view");
    if (url === "dashboard" || url === "playground") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMode(url);
      track(`mode_${url}`);
    }
  }, []);

  const select = useCallback((m: Mode) => {
    setMode(m);
    track(`mode_${m}`);
    const u = new URL(window.location.href);
    if (m === "home") u.searchParams.delete("view");
    else u.searchParams.set("view", m);
    window.history.replaceState(null, "", u);
  }, []);

  // Section links must work from inside a mode. Driving this directly (rather
  // than relying on `hashchange`) also fixes the silent dead link you hit when
  // the URL hash already matched the section you clicked.
  const goToSection = useCallback(
    (id: string) => {
      const scroll = () =>
        requestAnimationFrame(() =>
          document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" }),
        );
      if (modeRef.current !== "home") {
        pendingScroll.current = id;
        select("home");
      } else {
        scroll();
      }
    },
    [select],
  );

  // Browser back/forward and manual hash edits.
  useEffect(() => {
    const onHash = () => {
      const id = decodeURIComponent(window.location.hash.slice(1));
      if (SECTIONS.includes(id) && modeRef.current !== "home") {
        pendingScroll.current = id;
        select("home");
      }
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, [select]);

  // After returning to HOME, scroll to whatever was requested.
  useEffect(() => {
    if (mode === "home" && pendingScroll.current) {
      const id = pendingScroll.current;
      pendingScroll.current = null;
      requestAnimationFrame(() =>
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" }),
      );
    }
  }, [mode]);

  return <ModeCtx.Provider value={{ mode, select, goToSection }}>{children}</ModeCtx.Provider>;
}

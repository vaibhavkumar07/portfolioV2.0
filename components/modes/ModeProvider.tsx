"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { track } from "@/lib/track";

export type Mode = "home" | "dashboard" | "playground";

export const MODES: { id: Mode; label: string }[] = [
  { id: "home", label: "Home" },
  { id: "dashboard", label: "Dashboard" },
  { id: "playground", label: "Playground" },
];

const SECTIONS = ["main", "work", "experience", "about", "stack", "faq", "contact"];

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
  const pathname = usePathname();
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("home");
  const modeRef = useRef(mode);
  const pendingScroll = useRef<string | null>(null);
  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  // Deep-link + leave-home: SSR always renders HOME; work/404 are not modes.
  useEffect(() => {
    if (pathname !== "/") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMode("home");
      return;
    }
    const url = new URLSearchParams(window.location.search).get("view");
    if (url === "dashboard" || url === "playground") {
      setMode(url);
      track(`mode_${url}`);
    } else {
      setMode("home");
    }
  }, [pathname]);

  const select = useCallback((m: Mode) => {
    if (pathname !== "/") {
      router.push(m === "home" ? "/" : `/?view=${m}`);
      return;
    }
    setMode(m);
    track(`mode_${m}`);
    const u = new URL(window.location.href);
    if (m === "home") u.searchParams.delete("view");
    else u.searchParams.set("view", m);
    window.history.replaceState(null, "", u);
  }, [pathname, router]);

  const openSection = useCallback(
    (id: string) => {
      if (!SECTIONS.includes(id)) return;
      if (modeRef.current !== "home") {
        pendingScroll.current = id;
        select("home");
        return;
      }
      requestAnimationFrame(() =>
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" }),
      );
    },
    [select],
  );

  // Section links must work from inside a mode. Driving this directly (rather
  // than relying on `hashchange`) also fixes the silent dead link you hit when
  // the URL hash already matched the section you clicked.
  const goToSection = useCallback(
    (id: string) => {
      if (pathname !== "/") {
        router.push(`/#${id}`);
        return;
      }
      const next = `#${id}`;
      if (window.location.hash !== next) {
        const u = new URL(window.location.href);
        u.hash = id;
        window.history.pushState(null, "", u);
      }
      openSection(id);
    },
    [openSection, pathname, router],
  );

  // Browser back/forward, rail <a href="#…">, and manual hash edits.
  useEffect(() => {
    const onHash = () => {
      const id = decodeURIComponent(window.location.hash.slice(1));
      openSection(id);
    };
    window.addEventListener("hashchange", onHash);
    window.addEventListener("popstate", onHash);
    return () => {
      window.removeEventListener("hashchange", onHash);
      window.removeEventListener("popstate", onHash);
    };
  }, [openSection]);

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

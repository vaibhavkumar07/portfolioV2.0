"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const Dashboard = dynamic(() => import("./Dashboard"), { ssr: false, loading: () => <Loading label="command center" /> });
const Playground = dynamic(() => import("./Playground"), { ssr: false, loading: () => <Loading label="flow builder" /> });

type Mode = "home" | "dashboard" | "playground";
const MODES: { id: Mode; label: string }[] = [
  { id: "home", label: "HOME" },
  { id: "dashboard", label: "DASHBOARD" },
  { id: "playground", label: "PLAYGROUND" },
];

export default function ModeSwitch({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<Mode>("home");

  // Restore from URL (?view=) or localStorage.
  useEffect(() => {
    const url = new URLSearchParams(window.location.search).get("view") as Mode | null;
    const saved = (url || (localStorage.getItem("view") as Mode | null)) ?? "home";
    if (saved === "dashboard" || saved === "playground") setMode(saved);
  }, []);

  const select = (m: Mode) => {
    setMode(m);
    localStorage.setItem("view", m);
    const u = new URL(window.location.href);
    if (m === "home") u.searchParams.delete("view");
    else u.searchParams.set("view", m);
    window.history.replaceState(null, "", u);
  };

  return (
    <>
      <div className="sticky top-[3.25rem] z-30 border-y border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center gap-2 px-5 py-2">
          <span className="mono mr-2 text-[0.6rem] tracking-[0.18em] text-muted-foreground">MODE</span>
          <div className="flex gap-1 rounded-lg border border-border p-1">
            {MODES.map((m) => (
              <button
                key={m.id}
                onClick={() => select(m.id)}
                className={`mono rounded-md px-3 py-1 text-[0.66rem] tracking-[0.12em] transition ${
                  mode === m.id
                    ? "bg-[var(--brand-sky)]/15 text-[var(--brand-sky)]"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {mode === "home" && children}
      {mode === "dashboard" && <Dashboard />}
      {mode === "playground" && <Playground />}
    </>
  );
}

function Loading({ label }: { label: string }) {
  return (
    <div className="mx-auto max-w-6xl px-5 py-20 text-center">
      <span className="mono text-[0.72rem] tracking-[0.18em] text-muted-foreground">LOADING {label.toUpperCase()}…</span>
    </div>
  );
}

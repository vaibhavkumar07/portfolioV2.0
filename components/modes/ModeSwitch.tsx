"use client";

import dynamic from "next/dynamic";
import { useMode } from "./ModeProvider";

const Dashboard = dynamic(() => import("./Dashboard"), {
  ssr: false,
  loading: () => <Skeleton label="command center" />,
});
const Playground = dynamic(() => import("./Playground"), {
  ssr: false,
  loading: () => <Skeleton label="flow builder" />,
});

/**
 * Renders whichever view is active. Dashboard / Playground live in the left
 * rail (and the mobile menu) so this file only switches the main pane.
 */
export default function ModeSwitch({ children }: { children: React.ReactNode }) {
  const { mode } = useMode();

  return (
    <>
      {mode === "home" && children}
      {mode === "dashboard" && <Dashboard />}
      {mode === "playground" && <Playground />}
    </>
  );
}

/** Reserves the real layout instead of collapsing to a line of text. */
function Skeleton({ label }: { label: string }) {
  return (
    <div className="mx-auto max-w-6xl px-5 py-10" aria-busy="true" aria-live="polite">
      <span className="label-xs text-muted-foreground">Loading {label}…</span>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="glass h-24 animate-pulse rounded-3xl motion-reduce:animate-none" />
        ))}
      </div>
      <div className="mt-3 grid gap-3 lg:grid-cols-[1.4fr_1fr]">
        <div className="glass h-72 animate-pulse rounded-3xl motion-reduce:animate-none" />
        <div className="glass h-72 animate-pulse rounded-3xl motion-reduce:animate-none" />
      </div>
    </div>
  );
}

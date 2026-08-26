"use client";

import ModeProvider from "@/components/modes/ModeProvider";
import AgentRail from "@/components/agent/AgentRail";
import SiteNav from "@/components/sections/SiteNav";
import { PROFILE } from "@/lib/data/kb";

/** Console chrome — icon rail + top bar — shared by every route. */
export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <ModeProvider>
      <div className="relative lg:flex">
        <aside className="lg:sticky lg:top-0 lg:h-screen lg:self-start">
          <AgentRail />
        </aside>
        <div className="min-w-0 flex-1 border-white/[0.04] pb-[calc(6.75rem+env(safe-area-inset-bottom,0px))] lg:border-l lg:pb-0">
          <SiteNav email={PROFILE.email} />
          {children}
        </div>
      </div>
    </ModeProvider>
  );
}

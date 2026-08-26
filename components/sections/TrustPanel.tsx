"use client";

import {
  Bot,
  Cloud,
  Cpu,
  Headset,
  MessageSquare,
  PhoneCall,
  Sparkles,
  Workflow,
} from "lucide-react";

const STACK = [
  { name: "Genesys Cloud", icon: Cloud, blurb: "IVR · Architect · CX" },
  { name: "Azure Speech", icon: Headset, blurb: "TTS · STT" },
  { name: "OpenAI", icon: Sparkles, blurb: "Agent assist · summaries" },
  { name: "Dialogflow", icon: Bot, blurb: "Conversational NLU" },
  { name: "Cisco PCCE", icon: PhoneCall, blurb: "Contact center" },
  { name: "Power Automate", icon: Workflow, blurb: "Orchestration" },
  { name: "Observe.AI", icon: MessageSquare, blurb: "QA · coaching" },
  { name: "AI Studio", icon: Cpu, blurb: "Genesys bots" },
];

/** Platforms band — static grid (no marquee), matches console aesthetic. */
export default function TrustPanel() {
  return (
    <section className="mx-auto max-w-6xl px-5 pb-0 pt-8 sm:px-8 sm:pt-10">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="font-[family-name:var(--font-mono)] text-xs text-[var(--cyan)]">&gt; Platforms &amp; AI I ship with</p>
          <h2 className="mt-1 font-[family-name:var(--font-heading)] text-xl font-semibold tracking-tight text-white sm:text-2xl">
            Production stack
          </h2>
        </div>
      </div>

      <ul className="grid grid-cols-2 items-stretch gap-3 sm:grid-cols-4">
        {STACK.map((s) => (
          <li
            key={s.name}
            className="group flex min-h-[7.25rem] flex-col rounded-2xl border border-[var(--cyan)]/20 bg-white/[0.03] p-4 transition hover:border-[var(--cyan)]/45 hover:bg-white/[0.05]"
          >
            <s.icon
              className="h-5 w-5 shrink-0 text-[var(--cyan)] transition group-hover:scale-110"
              aria-hidden="true"
            />
            <p className="mt-3 text-sm font-medium text-white">{s.name}</p>
            <p className="mt-auto pt-1 text-xs text-white/50">{s.blurb}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

import {
  Headset, Cloud, Bot, MessageSquare, PhoneCall, Cpu, Workflow, Sparkles,
} from "lucide-react";

// Platforms actually shipped on — the trust band's single job. Stats live in
// the hero; duplicating them here made the second copy read as a bug.
const STACK = [
  { name: "Genesys Cloud", icon: Cloud },
  { name: "Azure Speech", icon: Headset },
  { name: "OpenAI", icon: Sparkles },
  { name: "Dialogflow", icon: Bot },
  { name: "Cisco PCCE", icon: PhoneCall },
  { name: "Power Automate", icon: Workflow },
  { name: "Observe.AI", icon: MessageSquare },
  { name: "AI Studio", icon: Cpu },
];

export default function TrustPanel() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-10">
      <style>{`
        @keyframes tp-marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .tp-marquee { animation: tp-marquee 42s linear infinite; }
        .tp-marquee:hover, .tp-marquee:focus-within { animation-play-state: paused; }
        @media (prefers-reduced-motion: reduce) { .tp-marquee { animation: none; } }
      `}</style>

      <div className="glass overflow-hidden rounded-3xl py-7">
        <h2 className="label-xs mb-5 px-7 text-muted-foreground">
          &gt; Platforms &amp; AI I ship with
        </h2>

        {/* The scrolling row is decoration; the real list is exposed to
            assistive tech below so the content isn't motion-dependent. */}
        <div
          aria-hidden="true"
          className="relative flex overflow-hidden"
          style={{
            maskImage: "linear-gradient(to right, transparent, black 14%, black 86%, transparent)",
            WebkitMaskImage: "linear-gradient(to right, transparent, black 14%, black 86%, transparent)",
          }}
        >
          <div className="tp-marquee flex shrink-0 gap-10 whitespace-nowrap px-5">
            {[...STACK, ...STACK].map((s, i) => (
              <div key={i} className="flex items-center gap-2.5 text-foreground/60">
                <s.icon className="h-5 w-5 text-[var(--cyan)]" />
                <span className="text-base font-medium tracking-tight">{s.name}</span>
              </div>
            ))}
          </div>
        </div>

        <ul className="sr-only">
          {STACK.map((s) => (
            <li key={s.name}>{s.name}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}

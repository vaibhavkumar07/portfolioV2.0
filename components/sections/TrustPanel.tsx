import {
  Headset, Cloud, Bot, MessageSquare, PhoneCall, Cpu, Workflow, Sparkles, Crown,
} from "lucide-react";

// His real stack / "works with" — for the trust marquee.
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

const Stat = ({ value, label }: { value: string; label: string }) => (
  <div className="flex flex-col items-center justify-center transition-transform hover:-translate-y-0.5 cursor-default">
    <span className="text-xl font-bold text-foreground sm:text-2xl">{value}</span>
    <span className="mono text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
  </div>
);

/** Brand-adapted glassmorphism trust panel (from the 21st.dev hero, reskinned
 *  to navy/orange with real numbers + his actual stack). */
export default function TrustPanel() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-12">
      <style>{`
        @keyframes tp-marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .tp-marquee { animation: tp-marquee 40s linear infinite; }
        .tp-marquee:hover { animation-play-state: paused; }
        @media (prefers-reduced-motion: reduce) { .tp-marquee { animation: none; } }
      `}</style>

      <div className="grid gap-5 lg:grid-cols-[1fr_1.1fr] lg:items-stretch">
        {/* Stats card */}
        <div className="relative overflow-hidden rounded-3xl border border-border bg-white/[0.03] p-7 backdrop-blur-xl">
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[var(--brand-orange)]/10 blur-3xl" />
          <div className="relative z-10">
            <div className="mb-7 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[var(--brand-sky)]/25 bg-[var(--brand-sky)]/10">
                <Headset className="h-6 w-6 text-[var(--brand-sky)]" />
              </div>
              <div>
                <div className="text-3xl font-bold tracking-tight">8+ years</div>
                <div className="text-sm text-muted-foreground">on Genesys Cloud CX</div>
              </div>
            </div>

            <div className="mb-7 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Genesys Cloud CX</span>
                <span className="font-medium text-foreground">95%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                <div className="h-full w-[95%] rounded-full bg-gradient-to-r from-[var(--brand-sky)] to-[var(--brand-orange)]" />
              </div>
            </div>

            <div className="mb-6 h-px w-full bg-border" />

            <div className="grid grid-cols-3 gap-4 text-center">
              <Stat value="10" label="Certs" />
              <div className="mx-auto h-full w-px bg-border" />
              <Stat value="7" label="Awards" />
              <div className="mx-auto h-full w-px bg-border" />
              <Stat value="1" label="IoT Patent" />
            </div>

            <div className="mt-7 flex flex-wrap gap-2">
              <span className="mono inline-flex items-center gap-1.5 rounded-full border border-border bg-white/[0.03] px-3 py-1 text-[10px] tracking-wide text-foreground/80">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--brand-green)] opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--brand-green)]" />
                </span>
                AVAILABLE
              </span>
              <span className="mono inline-flex items-center gap-1.5 rounded-full border border-border bg-white/[0.03] px-3 py-1 text-[10px] tracking-wide text-foreground/80">
                <Crown className="h-3 w-3 text-[var(--brand-orange)]" />
                GENESYS SME
              </span>
            </div>
          </div>
        </div>

        {/* Works-with marquee */}
        <div className="relative flex flex-col justify-center overflow-hidden rounded-3xl border border-border bg-white/[0.03] py-8 backdrop-blur-xl">
          <h3 className="mono mb-6 px-8 text-[0.7rem] tracking-[0.18em] text-muted-foreground">
            &gt; PLATFORMS &amp; AI I SHIP WITH
          </h3>
          <div
            className="relative flex overflow-hidden"
            style={{
              maskImage: "linear-gradient(to right, transparent, black 18%, black 82%, transparent)",
              WebkitMaskImage: "linear-gradient(to right, transparent, black 18%, black 82%, transparent)",
            }}
          >
            <div className="tp-marquee flex gap-10 whitespace-nowrap px-4">
              {[...STACK, ...STACK].map((s, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 text-foreground/55 transition-all hover:text-foreground"
                >
                  <s.icon className="h-5 w-5 text-[var(--brand-sky)]" />
                  <span className="text-base font-semibold tracking-tight">{s.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

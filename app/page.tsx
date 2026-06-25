import Link from "next/link";
import ModeSwitch from "@/components/ModeSwitch";
import VoiceAgent from "@/components/VoiceAgent";
import { PROFILE, HIGHLIGHTS } from "@/lib/kb";
import { projects } from "@/lib/projects";
import { skills } from "@/lib/skills";
import { slug } from "@/lib/slug";

const NAV = [
  { id: "work", label: "WORK", key: "1" },
  { id: "about", label: "ABOUT", key: "2" },
  { id: "stack", label: "STACK", key: "3" },
  { id: "contact", label: "CONTACT", key: "4" },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: PROFILE.name,
  jobTitle: PROFILE.title,
  email: `mailto:${PROFILE.email}`,
  url: "https://vaibhav.cx",
  sameAs: [PROFILE.linkedin],
  address: { "@type": "PostalAddress", addressLocality: "Richardson", addressRegion: "TX", addressCountry: "US" },
  knowsAbout: ["Genesys Cloud CX", "IVR", "Conversational AI", "Contact Center", "Voice AI"],
  worksFor: { "@type": "Organization", name: "Infosys Limited" },
};

export default function Home() {
  return (
    <div className="relative">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/70 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="grid h-7 w-7 place-items-center rounded-md border border-[var(--brand-orange)]/40">
              <span className="h-2 w-2 rounded-full bg-[var(--brand-orange)]" style={{ boxShadow: "0 0 8px var(--brand-orange)" }} />
            </span>
            <span className="mono text-xs tracking-[0.16em] text-foreground">V. YADAV</span>
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            {NAV.map((n) => (
              <a key={n.id} href={`#${n.id}`} className="mono text-[0.72rem] tracking-[0.14em] text-muted-foreground transition hover:text-foreground">
                <span className="text-[var(--brand-sky)]">{n.key}</span> {n.label}
              </a>
            ))}
          </nav>
          <a href={`mailto:${PROFILE.email}`} className="mono rounded-md border border-[var(--brand-sky)]/40 bg-[var(--brand-sky)]/10 px-3 py-1.5 text-[0.7rem] tracking-[0.12em] text-[var(--brand-sky)] transition hover:bg-[var(--brand-sky)]/20">
            HIRE ME
          </a>
        </div>
      </header>

      {/* Hero — statement + live agent */}
      <section className="relative overflow-hidden">
        <div className="bg-grid pointer-events-none absolute inset-0 opacity-60" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-5 py-16 md:py-24 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rise">
            <p className="mono mb-5 inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-[0.68rem] tracking-[0.16em] text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--brand-green)]" /> AVAILABLE FOR VOICE-AI / CX ROLES
            </p>
            <h1 className="text-[2.6rem] font-bold leading-[1.02] tracking-tight sm:text-6xl">
              I build the voice
              <br />
              behind the <span className="text-orange">call.</span>
            </h1>
            <p className="mt-6 max-w-md text-base leading-relaxed text-muted-foreground">
              {PROFILE.title}. {PROFILE.experienceYears} years designing enterprise IVR,
              bot flows, and AI-assisted CX on Genesys Cloud for healthcare, automotive,
              and e-commerce.
            </p>
            <div className="mono mt-8 flex flex-wrap gap-x-8 gap-y-3 text-sm">
              {[["7+", "years"], ["5", "flagship builds"], ["10", "certs"], ["1", "IoT patent"]].map(([n, l]) => (
                <div key={l}>
                  <span className="text-2xl font-bold text-foreground">{n}</span>{" "}
                  <span className="text-muted-foreground">{l}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Live agent */}
          <div className="rise h-[30rem]" style={{ animationDelay: "0.15s" }}>
            <div className="mono mb-2 flex items-center justify-between text-[0.66rem] tracking-[0.16em] text-muted-foreground">
              <span>◉ TALK TO MY PORTFOLIO</span>
              <span className="text-[var(--brand-sky)]">LIVE</span>
            </div>
            <div className="h-[calc(100%-1.5rem)]">
              <VoiceAgent />
            </div>
          </div>
        </div>
      </section>

      <ModeSwitch>
      {/* Work */}
      <Section id="work" num="01" title="Selected work" hint="case studies">
        <div className="grid gap-4 sm:grid-cols-2">
          {projects.map((p) => (
            <Link
              key={p.id}
              href={`/work/${slug(p.title)}`}
              className="group relative overflow-hidden rounded-xl border border-border bg-card/40 p-5 transition hover:border-[var(--brand-sky)]/50"
            >
              <div className="mono mb-3 flex items-center justify-between text-[0.64rem] tracking-[0.16em] text-muted-foreground">
                <span>RESULT-{p.id}</span>
                <span className="text-[var(--brand-sky)] opacity-0 transition group-hover:opacity-100">OPEN →</span>
              </div>
              <h3 className="text-lg font-semibold leading-snug">{p.title}</h3>
              <p className="mono mt-1.5 text-[0.7rem] tracking-wide text-[var(--brand-orange)]/90">{p.category}</p>
              <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{p.description}</p>
            </Link>
          ))}
        </div>
      </Section>

      {/* About */}
      <Section id="about" num="02" title="About" hint="caller profile">
        <div className="grid gap-8 md:grid-cols-[1fr_0.8fr]">
          <ul className="space-y-3">
            {HIGHLIGHTS.map((h) => (
              <li key={h} className="flex gap-3 text-sm leading-relaxed text-foreground/90">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--brand-orange)]" />
                {h}
              </li>
            ))}
          </ul>
          <div className="rounded-xl border border-border bg-card/40 p-5">
            <div className="mono mb-3 text-[0.64rem] tracking-[0.18em] text-muted-foreground">CALLER DETAILS</div>
            {[["NAME", PROFILE.name], ["ROLE", PROFILE.role], ["LOCATION", PROFILE.location], ["EMAIL", PROFILE.email]].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 border-b border-border py-2 last:border-0">
                <span className="mono text-[0.66rem] tracking-[0.14em] text-muted-foreground">{k}</span>
                <span className="text-right text-sm text-foreground/90">{v}</span>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Stack */}
      <Section id="stack" num="03" title="Stack" hint="capabilities">
        <div className="flex flex-wrap gap-2">
          {skills.map((s) => (
            <span key={s.name} className="mono rounded-full border border-border bg-card/40 px-3 py-1.5 text-[0.74rem] text-foreground/85">
              {s.name} <span className="text-[var(--brand-sky)]">{s.level}</span>
            </span>
          ))}
        </div>
      </Section>

      {/* Contact */}
      <Section id="contact" num="04" title="Transfer the call" hint="press 9 to connect">
        <div className="rounded-xl border border-border bg-card/40 p-8 text-center">
          <p className="mx-auto max-w-md text-base text-muted-foreground">
            Building something in CX or voice AI? Ask the agent above, or reach me directly.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <a href={`mailto:${PROFILE.email}`} className="mono rounded-lg border border-[var(--brand-orange)]/40 bg-[var(--brand-orange)]/10 px-5 py-2.5 text-sm tracking-[0.1em] text-[var(--brand-orange)] transition hover:bg-[var(--brand-orange)]/20">
              {PROFILE.email}
            </a>
            <a href={PROFILE.linkedin} target="_blank" rel="noopener noreferrer" className="mono rounded-lg border border-border px-5 py-2.5 text-sm tracking-[0.1em] text-foreground/85 transition hover:border-[var(--brand-sky)]/50">
              LINKEDIN ↗
            </a>
          </div>
        </div>
      </Section>
      </ModeSwitch>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-5 py-6 text-center sm:flex-row sm:text-left">
          <span className="mono text-[0.66rem] tracking-[0.14em] text-muted-foreground">© {new Date().getFullYear()} VAIBHAVKUMAR YADAV · RICHARDSON, TX</span>
          <span className="mono text-[0.66rem] tracking-[0.14em] text-muted-foreground">BUILT WITH THE STACK I SHIP</span>
        </div>
      </footer>
    </div>
  );
}

function Section({
  id, num, title, hint, children,
}: {
  id: string; num: string; title: string; hint: string; children: React.ReactNode;
}) {
  return (
    <section id={id} className="mx-auto max-w-6xl scroll-mt-20 px-5 py-16">
      <div className="mb-8 flex items-end gap-4">
        <span className="mono text-5xl font-bold leading-none text-[var(--brand-sky)]/15">{num}</span>
        <div>
          <span className="mono block text-[0.66rem] tracking-[0.2em] text-muted-foreground">&gt; {hint.toUpperCase()}</span>
          <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
        </div>
      </div>
      {children}
    </section>
  );
}

import Link from "next/link";
import ModeSwitch from "@/components/modes/ModeSwitch";
import Reveal, { RevealItem, RevealStagger } from "@/components/fx/Reveal";
import Hero3D from "@/components/fx/Hero3D";
import Magnetic from "@/components/fx/Magnetic";
import TiltCard from "@/components/fx/TiltCard";
import HeroIntro from "@/components/sections/HeroIntro";
import SiteNav from "@/components/sections/SiteNav";
import TrustPanel from "@/components/sections/TrustPanel";
import VoiceAgent from "@/components/agent/VoiceAgent";
import { PROFILE, HIGHLIGHTS } from "@/lib/data/kb";
import { projects } from "@/lib/data/projects";
import { skills } from "@/lib/data/skills";
import { slug } from "@/lib/slug";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: PROFILE.name,
  jobTitle: PROFILE.title,
  email: `mailto:${PROFILE.email}`,
  url: "https://vaibhavkumarcx.dev",
  sameAs: [PROFILE.linkedin],
  address: { "@type": "PostalAddress", addressLocality: "Richardson", addressRegion: "TX", addressCountry: "US" },
  knowsAbout: ["Genesys Cloud CX", "IVR", "Conversational AI", "Contact Center", "Voice AI"],
  worksFor: { "@type": "Organization", name: "Infosys Limited" },
};

export default function Home() {
  return (
    <div className="relative">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <SiteNav email={PROFILE.email} />

      <main id="main">
      {/* Hero — statement + live agent */}
      <section className="relative overflow-hidden">
        {/* 3D flow-node constellation (WebGL on desktop, CSS fallback elsewhere) */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <Hero3D />
        </div>
        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-5 py-16 md:py-24 lg:grid-cols-[1.05fr_0.95fr] xl:py-28">
          <HeroIntro title={PROFILE.title} experienceYears={PROFILE.experienceYears} />

          {/* Live agent */}
          <div className="rise h-[26rem] min-w-0 sm:h-[30rem]" style={{ animationDelay: "0.15s" }}>
            <div className="mono mb-2 flex items-center justify-between text-[0.66rem] tracking-[0.16em] text-muted-foreground">
              <span>◉ TALK TO MY PORTFOLIO</span>
              <span className="text-[var(--brand-sky)]">LIVE</span>
            </div>
            <TiltCard maxTilt={3} className="h-[calc(100%-1.5rem)]">
              <VoiceAgent />
            </TiltCard>
          </div>
        </div>
      </section>

      <ModeSwitch>
      <Reveal><TrustPanel /></Reveal>

      {/* Work */}
      <Section id="work" num="01" title="Selected work" hint="case studies">
        <RevealStagger className="grid gap-4 sm:grid-cols-2 lg:gap-6">
          {projects.map((p) => (
            <RevealItem key={p.id}>
              <TiltCard className="h-full rounded-xl">
                <Link
                  href={`/work/${slug(p.title)}`}
                  className="focus-ring group relative flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card/40 p-5 transition hover:border-[var(--brand-sky)]/50"
                >
                  <div className="mono mb-3 flex items-center justify-between text-[0.64rem] tracking-[0.16em] text-muted-foreground">
                    <span>RESULT-{p.id}</span>
                    <span className="text-[var(--brand-sky)] opacity-0 transition group-hover:opacity-100">OPEN →</span>
                  </div>
                  <h3 className="text-lg font-semibold leading-snug">{p.title}</h3>
                  <p className="mono mt-1.5 text-[0.7rem] tracking-wide text-[var(--brand-orange)]/90">{p.category}</p>
                  <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{p.description}</p>
                </Link>
              </TiltCard>
            </RevealItem>
          ))}
        </RevealStagger>
      </Section>

      {/* About */}
      <Section id="about" num="02" title="About" hint="caller profile">
        <div className="grid gap-6 md:grid-cols-[1fr_0.8fr] md:gap-8">
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
        <RevealStagger className="flex flex-wrap gap-2" stagger={0.02}>
          {skills.map((s) => (
            <RevealItem key={s.name}>
              <span className="mono rounded-full border border-border bg-card/40 px-3 py-1.5 text-[0.74rem] text-foreground/85">
                {s.name} <span className="text-[var(--brand-sky)]">{s.level}</span>
              </span>
            </RevealItem>
          ))}
        </RevealStagger>
      </Section>

      {/* Contact */}
      <Section id="contact" num="04" title="Transfer the call" hint="press 9 to connect">
        <div className="rounded-xl border border-border bg-card/40 p-8 text-center">
          <p className="mx-auto max-w-md text-base text-muted-foreground">
            Building something in CX or voice AI? Ask the agent above, or reach me directly.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Magnetic>
              <a href={`mailto:${PROFILE.email}`} className="focus-ring mono inline-block rounded-lg border border-[var(--brand-orange)]/40 bg-[var(--brand-orange)]/10 px-5 py-2.5 text-sm tracking-[0.1em] text-[var(--brand-orange)] transition hover:bg-[var(--brand-orange)]/20">
                {PROFILE.email}
              </a>
            </Magnetic>
            <Magnetic>
              <a href={PROFILE.linkedin} target="_blank" rel="noopener noreferrer" className="focus-ring mono inline-block rounded-lg border border-border px-5 py-2.5 text-sm tracking-[0.1em] text-foreground/85 transition hover:border-[var(--brand-sky)]/50">
                LINKEDIN ↗
              </a>
            </Magnetic>
          </div>
        </div>
      </Section>
      </ModeSwitch>
      </main>

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
      <Reveal>
        <div className="mb-8 flex items-end gap-4">
          <span aria-hidden="true" className="mono text-5xl font-bold leading-none text-[var(--brand-sky)]/15">{num}</span>
          <div>
            <span className="mono block text-[0.66rem] tracking-[0.2em] text-muted-foreground">&gt; {hint.toUpperCase()}</span>
            <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
          </div>
        </div>
        {children}
      </Reveal>
    </section>
  );
}

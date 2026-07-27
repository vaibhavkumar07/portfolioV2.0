import Link from "next/link";
import ModeSwitch from "@/components/modes/ModeSwitch";
import ModeProvider from "@/components/modes/ModeProvider";
import Reveal, { RevealItem, RevealStagger } from "@/components/fx/Reveal";
import Magnetic from "@/components/fx/Magnetic";
import SiteNav from "@/components/sections/SiteNav";
import TrustPanel from "@/components/sections/TrustPanel";
import HeroExperience from "@/components/agent/HeroExperience";
import { PROFILE, HIGHLIGHTS } from "@/lib/data/kb";
import { FAQ } from "@/lib/data/faq";
import { projects } from "@/lib/data/projects";
import { skills } from "@/lib/data/skills";
import { slug } from "@/lib/slug";

const SITE = "https://vaibhavkumarcx.dev";

// Entity graph for search + answer engines (Google AI Overviews, ChatGPT,
// Perplexity): Person with geo anchoring, WebSite, ProfilePage with speakable
// hints for voice assistants, and an FAQPage mirroring the visible FAQ section.
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": `${SITE}/#person`,
      name: PROFILE.name,
      jobTitle: PROFILE.title,
      email: `mailto:${PROFILE.email}`,
      url: SITE,
      sameAs: [PROFILE.linkedin],
      address: { "@type": "PostalAddress", addressLocality: "Richardson", addressRegion: "TX", addressCountry: "US" },
      homeLocation: {
        "@type": "Place",
        name: "Richardson, Texas, USA",
        geo: { "@type": "GeoCoordinates", latitude: 32.9483, longitude: -96.7299 },
      },
      workLocation: { "@type": "Place", name: "Dallas–Fort Worth metro, Texas, USA" },
      knowsAbout: [
        "Genesys Cloud CX", "Genesys Architect", "IVR", "Conversational AI",
        "Contact Center", "Voice AI", "Azure TTS/STT", "OpenAI", "Google Dialogflow",
        "CX as Code", "Terraform",
      ],
      worksFor: { "@type": "Organization", name: "Infosys Limited" },
      description: `${PROFILE.title} with ${PROFILE.experienceYears} years of experience. ${PROFILE.availability}`,
    },
    {
      "@type": "WebSite",
      "@id": `${SITE}/#website`,
      url: SITE,
      name: "Vaibhavkumar Yadav — Portfolio",
      publisher: { "@id": `${SITE}/#person` },
      inLanguage: "en-US",
    },
    {
      "@type": "ProfilePage",
      "@id": `${SITE}/#profilepage`,
      url: SITE,
      mainEntity: { "@id": `${SITE}/#person` },
      isPartOf: { "@id": `${SITE}/#website` },
      speakable: { "@type": "SpeakableSpecification", cssSelector: ["h1", "#about"] },
    },
    {
      "@type": "FAQPage",
      "@id": `${SITE}/#faq`,
      mainEntity: FAQ.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ],
};

export default function Home() {
  return (
    <div className="relative">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <ModeProvider>
      <SiteNav email={PROFILE.email} />

      <main id="main">
      {/* The hero lives inside ModeSwitch so choosing Dashboard or Playground
          actually replaces the view, rather than leaving the home hero on top
          of it. */}
      <ModeSwitch>
      <section className="relative overflow-hidden">
        {/* The avatar is the hero's 3D element now — the old flow-node
            constellation competed with it for attention and was removed.
            Asymmetric split: the avatar stage leads, the statement supports. */}
        <div className="relative mx-auto grid max-w-6xl items-center gap-8 px-5 py-12 md:py-16 lg:grid-cols-[0.9fr_1.1fr] lg:gap-10">
          <HeroExperience title={PROFILE.title} experienceYears={PROFILE.experienceYears} />
        </div>
      </section>

      <Reveal><TrustPanel /></Reveal>

      {/* Work */}
      <Section id="work" num="01" title="Selected work" hint="case studies">
        {/* Bento: the flagship leads at full width, the rest pair off — which
            also removes the orphaned 5th card the old 2-col grid left. */}
        <RevealStagger className="grid gap-4 sm:grid-cols-2 lg:gap-5">
          {projects.map((p, i) => (
            <RevealItem key={p.id} className={i === 0 ? "sm:col-span-2" : ""}>
              <Link
                href={`/work/${slug(p.title)}`}
                className="focus-ring lift glass group relative flex h-full flex-col overflow-hidden rounded-3xl p-5 sm:p-6"
              >
                <div className="label-xs mb-3 flex items-center justify-between text-muted-foreground">
                  <span>Result-{p.id}</span>
                  {/* Arrow is always present on touch — hover-only affordance
                      left mobile users with no signal these were links. */}
                  <span className="text-[var(--cyan)] opacity-60 transition group-hover:opacity-100">Open →</span>
                </div>
                <h3 className={i === 0 ? "text-2xl font-semibold leading-snug" : "text-lg font-semibold leading-snug"}>
                  {p.title}
                </h3>
                <p className="label-xs mt-2 text-[var(--violet)]">{p.category}</p>
                <p className={`mt-3 text-sm leading-relaxed text-muted-foreground ${i === 0 ? "max-w-2xl" : "line-clamp-3"}`}>
                  {p.description}
                </p>
              </Link>
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
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--amber)]" />
                {h}
              </li>
            ))}
          </ul>
          <div className="glass h-fit rounded-3xl p-6">
            <div className="label-xs mb-3 text-muted-foreground">Caller details</div>
            {[["Role", PROFILE.role], ["Location", PROFILE.location], ["Email", PROFILE.email]].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 border-b border-border py-2.5 last:border-0">
                <span className="label-xs text-muted-foreground">{k}</span>
                <span className="text-right text-sm text-foreground/90">{v}</span>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Stack — grouped by the category field the flat pill cloud never used,
          with proficiency encoded visually instead of printed as a raw number */}
      <Section id="stack" num="03" title="Stack" hint="capabilities">
        <RevealStagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" stagger={0.05}>
          {["Platform", "AI/ML", "Dev", "Integration"].map((cat) => (
            <RevealItem key={cat}>
              <div className="glass h-full rounded-3xl p-5">
                <div className="label-xs mb-4 text-[var(--cyan)]">{cat}</div>
                <ul className="space-y-3">
                  {skills
                    .filter((s) => s.category === cat)
                    .map((s) => (
                      <li key={s.name}>
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="text-sm text-foreground/90">{s.name}</span>
                        </div>
                        <div
                          className="mt-1.5 h-1 overflow-hidden rounded-full bg-secondary"
                          role="img"
                          aria-label={`${s.name}: ${s.level} out of 100`}
                        >
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${s.level}%`,
                              background: "linear-gradient(90deg, var(--cyan), var(--violet))",
                            }}
                          />
                        </div>
                      </li>
                    ))}
                </ul>
              </div>
            </RevealItem>
          ))}
        </RevealStagger>
      </Section>

      {/* FAQ — visible twin of the FAQPage JSON-LD (answer engines quote this) */}
      <Section id="faq" num="04" title="Quick answers" hint="frequently asked">
        <div className="space-y-2">
          {FAQ.map((f) => (
            <details key={f.q} className="glass group rounded-2xl px-5 py-4">
              <summary className="focus-ring cursor-pointer list-none rounded-lg text-sm font-medium text-foreground/90 transition hover:text-foreground [&::-webkit-details-marker]:hidden">
                <span className="mr-2 inline-block text-[var(--cyan)] transition-transform group-open:rotate-90">›</span>
                {f.q}
              </summary>
              <p className="mt-3 pl-5 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
            </details>
          ))}
        </div>
      </Section>

      {/* Contact */}
      <Section id="contact" num="05" title="Transfer the call" hint="press 9 to connect">
        <div className="glass rounded-3xl p-8 text-center sm:p-10">
          <p className="mx-auto max-w-md text-base text-muted-foreground">
            Building something in CX or voice AI? Ask the agent, or reach me directly.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Magnetic>
              <a
                href={`mailto:${PROFILE.email}`}
                className="focus-ring inline-flex min-h-12 items-center rounded-2xl bg-[var(--amber)] px-6 text-[0.95rem] font-semibold text-[oklch(0.16_0.03_84)] transition hover:brightness-110"
              >
                {PROFILE.email}
              </a>
            </Magnetic>
            <Magnetic>
              <a
                href={PROFILE.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="focus-ring glass inline-flex min-h-12 items-center rounded-2xl px-5 text-[0.95rem] transition hover:brightness-125"
              >
                LinkedIn ↗
              </a>
            </Magnetic>
          </div>
        </div>
      </Section>
      </ModeSwitch>
      </main>
      </ModeProvider>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-5 py-7 text-center sm:flex-row sm:text-left">
          <span className="label-xs text-muted-foreground">
            © {new Date().getFullYear()} Vaibhavkumar Yadav · Richardson, TX
          </span>
          <a href={`mailto:${PROFILE.email}`} className="focus-ring label-xs rounded-lg text-muted-foreground transition hover:text-foreground">
            {PROFILE.email}
          </a>
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
    /* scroll-mt clears both sticky bars (header + mode bar ≈ 6.75rem) */
    <section id={id} className="section-y mx-auto max-w-6xl scroll-mt-28 px-5">
      <Reveal>
        <div className="mb-8 flex items-end gap-4">
          <span aria-hidden="true" className="mono text-5xl font-bold leading-none text-[var(--cyan)]/15">{num}</span>
          <div>
            <span className="label-xs block text-muted-foreground">&gt; {hint}</span>
            <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
          </div>
        </div>
        {children}
      </Reveal>
    </section>
  );
}

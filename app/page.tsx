import { existsSync } from "node:fs";
import { join } from "node:path";
import Link from "next/link";
import Image from "next/image";
import ModeSwitch from "@/components/modes/ModeSwitch";
import ModeProvider from "@/components/modes/ModeProvider";
import Reveal, { RevealItem, RevealStagger } from "@/components/fx/Reveal";
import Magnetic from "@/components/fx/Magnetic";
import SiteNav from "@/components/sections/SiteNav";
import TrustPanel from "@/components/sections/TrustPanel";
import Experience from "@/components/sections/Experience";
import AgentRail from "@/components/agent/AgentRail";
import HeroCopy from "@/components/sections/HeroCopy";
import { PROFILE, HIGHLIGHTS, VENDOR_CREDENTIALS } from "@/lib/data/kb";
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
      hasCredential: VENDOR_CREDENTIALS.map((c) => ({
        "@type": "EducationalOccupationalCredential",
        name: c.name,
        credentialCategory: "certification",
        recognizedBy: { "@type": "Organization", name: c.issuer },
        // Omitted rather than guessed when the earn date is unconfirmed —
        // a wrong date in structured data is a wrong fact about him.
        ...(c.issuedISO ? { dateCreated: c.issuedISO } : {}),
        ...(c.expiresISO ? { expires: c.expiresISO } : {}),
      })),
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

/**
 * The résumé button is the single highest-value thing on this page for a
 * recruiter, and a download that 404s is worse than none — so it renders only
 * when the file is actually there. Checked at build time; this is a server
 * component, and public/ is fixed once the build runs.
 *
 * The descriptive filename is deliberate: it is what lands in the recruiter's
 * downloads folder, where "resume.pdf" is indistinguishable from forty others.
 */
const RESUME_FILE = "Vaibhavkumar_Yadav_Genesys_Cloud.pdf";
const hasResume = existsSync(join(process.cwd(), "public", RESUME_FILE));

export default function Home() {
  return (
    <div className="relative lg:grid lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] xl:lg:grid-cols-[minmax(0,24rem)_minmax(0,1fr)]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />

      {/* The agent is a fixture, not a destination: it holds the left column for
          the whole visit and never scrolls away. Below lg it becomes the sticky
          bar at the bottom of the viewport. */}
      <aside className="lg:sticky lg:top-0 lg:h-screen lg:self-start">
        <AgentRail />
      </aside>

      {/* pb-20 clears the fixed mobile agent bar so the footer stays reachable. */}
      <div className="min-w-0 pb-20 lg:pb-0">
      <ModeProvider>
      <SiteNav email={PROFILE.email} />

      <main id="main">
      {/* The hero lives inside ModeSwitch so choosing Dashboard or Playground
          actually replaces the view, rather than leaving the home hero on top
          of it. */}
      <ModeSwitch>
      <HeroCopy resumeHref={hasResume ? `/${RESUME_FILE}` : undefined} />

      <Reveal><TrustPanel /></Reveal>

      {/* Work */}
      {/* Work — a rail you drag through, not a grid you scan. Cards are tall
          and near-full-height so each project gets the screen to itself on
          mobile, and the row runs past the right edge to signal more. */}
      <Section id="work" num="01" title="Selected work" hint="case studies" bleed>
        {/* Padding matches the max-w-6xl container's gutter so the first card
            lines up with the section heading, while the row still runs to the
            true viewport edge on the right.

            scroll-padding has to repeat the value: scroll-snap-align aligns to
            the scrollport edge, not the padding edge, so without it the snap
            engine scrolls the gutter away and the first card sits flush left. */}
        <div
          className="rail gap-4 pb-4 sm:gap-5"
          style={{
            paddingInline: "max(1.25rem, calc((100vw - 72rem) / 2 + 2rem))",
            scrollPaddingInline: "max(1.25rem, calc((100vw - 72rem) / 2 + 2rem))",
          }}
        >
          {projects.map((p, i) => (
            <Link
              key={p.id}
              href={`/work/${slug(p.title)}`}
              className="focus-ring group relative flex h-[24rem] w-[min(85vw,26rem)] flex-col justify-between overflow-hidden rounded-[1.75rem] border border-border p-6 transition-colors duration-300 hover:border-[var(--cyan)]/60 sm:h-[27rem] sm:p-7"
              style={{
                background:
                  "linear-gradient(160deg, color-mix(in oklch, var(--card) 62%, transparent), color-mix(in oklch, var(--void) 88%, transparent))",
              }}
            >
              {/* Oversized index — the second type voice, and the thing that
                  makes the rail read as a sequence. */}
              <span
                aria-hidden="true"
                className="t-mega t-outline pointer-events-none absolute -right-2 -top-6 leading-none opacity-25 transition-opacity duration-500 group-hover:opacity-60"
              >
                {String(i + 1).padStart(2, "0")}
              </span>

              <span className="label-xs relative text-[var(--violet)]">{p.category}</span>

              <span className="relative">
                <h3 className="t-title max-w-[14ch]">{p.title}</h3>
                <p className="mt-4 line-clamp-4 max-w-[42ch] text-sm leading-relaxed text-muted-foreground">
                  {p.description}
                </p>
                <span className="label-xs mt-6 inline-flex items-center gap-2 text-[var(--cyan)]">
                  Open case study
                  <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                </span>
              </span>
            </Link>
          ))}

          {/* Trailing spacer so the last card can snap clear of the edge. */}
          <span aria-hidden="true" className="w-1 shrink-0" />
        </div>
        <p
          className="label-xs mt-5 text-muted-foreground"
          style={{ paddingInline: "max(1.25rem, calc((100vw - 72rem) / 2 + 2rem))" }}
        >
          Drag or scroll sideways — {projects.length} case studies
        </p>
      </Section>

      {/* Experience — the career history the page never showed; the agent knew
          it (kb.ts EXPERIENCE) but a recruiter scanning the page did not. */}
      <Section id="experience" num="02" title="Experience" hint="call history" surface="paper">
        <Experience />
      </Section>

      {/* About */}
      <Section id="about" num="03" title="About" hint="caller profile">
        <div className="grid gap-6 md:grid-cols-[1fr_0.8fr] md:gap-8">
          <ul className="space-y-3">
            {HIGHLIGHTS.map((h) => (
              <li key={h} className="flex gap-3 text-sm leading-relaxed text-foreground/90">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--amber)]" />
                {h}
              </li>
            ))}
          </ul>
          <div className="space-y-4">
            <div className="glass h-fit rounded-3xl p-6">
              <div className="label-xs mb-3 text-muted-foreground">Caller details</div>
              {[["Role", PROFILE.role], ["Location", PROFILE.location], ["Email", PROFILE.email]].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 border-b border-border py-2.5 last:border-0">
                  <span className="label-xs text-muted-foreground">{k}</span>
                  <span className="text-right text-sm text-foreground/90">{v}</span>
                </div>
              ))}
            </div>

            {/* Vendor credentials — the badges a Genesys hiring manager scans
                for. Their own card so they read as credentials, not bullets. */}
            <div className="glass h-fit rounded-3xl p-5">
              <div className="label-xs mb-4 text-[var(--cyan)]">Genesys certified</div>
              <ul className="space-y-4">
                {VENDOR_CREDENTIALS.map((c) => (
                  <li key={c.name} className="flex items-center gap-4">
                    {c.badge && (
                      <Image
                        src={c.badge}
                        alt={`${c.name} badge`}
                        width={64}
                        height={64}
                        className="h-16 w-16 shrink-0 object-contain"
                      />
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-semibold leading-snug">{c.name}</p>
                      <p className="label-xs mt-1 text-muted-foreground">
                        {c.issuer}
                        {c.issued ? ` · ${c.issued}${c.expires ? ` – ${c.expires}` : ""}` : ""}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </Section>

      {/* Stack — grouped by the category field the flat pill cloud never used,
          with proficiency encoded visually instead of printed as a raw number */}
      <Section id="stack" num="04" title="Stack" hint="capabilities">
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
      <Section id="faq" num="05" title="Quick answers" hint="frequently asked">
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
      {/* Contact on the void surface — the page ends darker than it started,
          and the address is set at display scale instead of hiding in a pill. */}
      <Section id="contact" num="06" title="Transfer the call" hint="press 9 to connect" surface="void">
        <Reveal>
          <p className="t-lead max-w-lg text-muted-foreground">
            Building something in CX or voice AI? Ask the agent, or reach me directly.
          </p>

          <Magnetic>
            <a
              href={`mailto:${PROFILE.email}`}
              className="focus-ring group mt-10 block w-fit max-w-full"
            >
              {/* Sized to its own length rather than the shared display step:
                  a 29-character address at --text-display runs off the page. */}
              <span
                className="block break-words font-[family-name:var(--font-heading)] font-semibold leading-[0.95] tracking-[-0.03em] text-foreground transition-colors duration-300 group-hover:text-[var(--amber)]"
                style={{ fontSize: "clamp(1.35rem, 5vw, 4rem)" }}
              >
                {PROFILE.email}
              </span>
              <span className="mt-3 block h-px w-full origin-left scale-x-0 bg-[var(--amber)] transition-transform duration-500 group-hover:scale-x-100 motion-reduce:transition-none" />
            </a>
          </Magnetic>

          <div className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-3">
            <a
              href={PROFILE.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="focus-ring label-md text-muted-foreground transition hover:text-foreground"
            >
              LinkedIn ↗
            </a>
            <a
              href={`tel:${PROFILE.phone.replace(/\s/g, "")}`}
              className="focus-ring label-md text-muted-foreground transition hover:text-foreground"
            >
              {PROFILE.phone}
            </a>
            <span className="label-md text-muted-foreground">{PROFILE.location}</span>
          </div>
        </Reveal>
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
    </div>
  );
}

/**
 * Section shell. `surface` is the point: the page alternates navy, paper and
 * void so the eye gets a boundary between ideas instead of six identical
 * panels. The numeral is set at display scale and outlined, which gives each
 * section a second, quieter voice.
 */
function Section({
  id, num, title, hint, children, surface = "base", bleed = false,
}: {
  id: string;
  num: string;
  title: string;
  hint: string;
  children: React.ReactNode;
  surface?: "base" | "paper" | "void";
  /** Let children escape the max-width container (used by the work rail). */
  bleed?: boolean;
}) {
  const skin =
    surface === "paper" ? "surface-paper" : surface === "void" ? "surface-void" : "";

  return (
    /* scroll-mt clears the sticky header */
    <section id={id} className={`section-y scroll-mt-28 ${skin}`}>
      <div className={bleed ? "" : "mx-auto max-w-6xl px-5 sm:px-8"}>
        <div className={bleed ? "mx-auto mb-12 max-w-6xl px-5 sm:px-8" : "mb-12"}>
          <Reveal>
            {/* The numeral sits behind the title and overlaps it, rather than
                aligning beside it — inline, a 13rem glyph drags the heading to
                its own baseline and reads like a layout accident. */}
            <div className="relative isolate pt-[0.42em]">
              <span
                aria-hidden="true"
                className="t-mega t-outline pointer-events-none absolute -top-[0.12em] left-[-0.06em] -z-10 select-none leading-none opacity-45"
              >
                {num}
              </span>
              <span className="label-xs block text-muted-foreground">&gt; {hint}</span>
              <h2 className="t-title mt-1">{title}</h2>
            </div>
          </Reveal>
        </div>
        {children}
      </div>
    </section>
  );
}

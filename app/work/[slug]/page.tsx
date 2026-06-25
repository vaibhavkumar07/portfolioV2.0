import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { caseStudies, getCaseStudy } from "@/lib/data/work";
import { PROFILE } from "@/lib/data/kb";

export function generateStaticParams() {
  return caseStudies.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const c = getCaseStudy(slug);
  if (!c) return {};
  return {
    title: c.title,
    description: c.summary,
    openGraph: { title: c.title, description: c.summary, type: "article" },
    alternates: { canonical: `/work/${c.slug}` },
  };
}

export default async function CaseStudyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const c = getCaseStudy(slug);
  if (!c) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: c.title,
    about: c.category,
    author: { "@type": "Person", name: PROFILE.name, jobTitle: PROFILE.title },
    description: c.summary,
    keywords: c.stack.join(", "),
  };

  return (
    <article className="mx-auto max-w-3xl px-5 py-14">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />

      <Link href="/#work" className="mono text-[0.72rem] tracking-[0.14em] text-muted-foreground transition hover:text-foreground">
        ← BACK TO WORK
      </Link>

      <div className="mono mt-8 flex items-center gap-3 text-[0.66rem] tracking-[0.16em] text-muted-foreground">
        <span>RESULT-{c.id}</span>
        <span className="text-[var(--brand-orange)]">{c.category}</span>
      </div>
      <h1 className="mt-3 text-4xl font-bold leading-tight tracking-tight sm:text-5xl">{c.title}</h1>
      <p className="mt-5 text-lg leading-relaxed text-muted-foreground">{c.summary}</p>

      <div className="mt-6 flex flex-wrap gap-2">
        {c.stack.map((t) => (
          <span key={t} className="mono rounded-full border border-border bg-card/40 px-2.5 py-1 text-[0.7rem] text-foreground/80">
            {t}
          </span>
        ))}
      </div>

      <Block label="THE PROBLEM">
        <p className="text-base leading-relaxed text-foreground/90">{c.problem}</p>
      </Block>

      {c.approach.length > 0 && (
        <Block label="WHAT I BUILT">
          <ul className="space-y-3">
            {c.approach.map((a) => (
              <li key={a} className="flex gap-3 text-base leading-relaxed text-foreground/90">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--brand-sky)]" />
                {a}
              </li>
            ))}
          </ul>
        </Block>
      )}

      {c.impact.length > 0 && (
        <Block label="IMPACT">
          <ul className="space-y-3">
            {c.impact.map((a) => (
              <li key={a} className="flex gap-3 text-base leading-relaxed text-foreground/90">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--brand-orange)]" />
                {a}
              </li>
            ))}
          </ul>
        </Block>
      )}

      <div className="mt-14 rounded-xl border border-border bg-card/40 p-6 text-center">
        <p className="text-muted-foreground">Want the deeper story? Ask the agent on the home page, or reach me directly.</p>
        <a href={`mailto:${PROFILE.email}`} className="mono mt-4 inline-block rounded-lg border border-[var(--brand-orange)]/40 bg-[var(--brand-orange)]/10 px-5 py-2.5 text-sm tracking-[0.1em] text-[var(--brand-orange)] transition hover:bg-[var(--brand-orange)]/20">
          {PROFILE.email}
        </a>
      </div>
    </article>
  );
}

function Block({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className="mt-12">
      <h2 className="mono mb-4 text-[0.7rem] tracking-[0.2em] text-[var(--brand-sky)]">&gt; {label}</h2>
      {children}
    </section>
  );
}

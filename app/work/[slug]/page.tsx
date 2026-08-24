import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { caseStudies, getCaseStudy } from "@/lib/data/work";
import { PROFILE } from "@/lib/data/kb";
import SiteNav from "@/components/sections/SiteNav";
import { OG_IMAGE, SITE } from "@/lib/site";

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
  const title = `${c.title} | Genesys Cloud IVR | ${PROFILE.name}`;
  return {
    title: { absolute: title },
    description: c.summary,
    openGraph: {
      title,
      description: c.summary,
      type: "article",
      url: `${SITE}/work/${c.slug}`,
      images: [{ url: OG_IMAGE, alt: PROFILE.name }],
    },
    twitter: { card: "summary_large_image", title, description: c.summary, images: [OG_IMAGE] },
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
    "@graph": [
      {
        "@type": "Article",
        headline: c.title,
        about: c.category,
        author: { "@type": "Person", name: PROFILE.name, jobTitle: PROFILE.title, url: SITE, "@id": `${SITE}/#person` },
        description: c.summary,
        keywords: c.stack.join(", "),
        image: `${SITE}${OG_IMAGE}`,
        url: `${SITE}/work/${c.slug}`,
        mainEntityOfPage: `${SITE}/work/${c.slug}`,
        inLanguage: "en-US",
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE },
          { "@type": "ListItem", position: 2, name: "Work", item: `${SITE}/#work` },
          { "@type": "ListItem", position: 3, name: c.title, item: `${SITE}/work/${c.slug}` },
        ],
      },
    ],
  };

  return (
    <>
      {/* These are the SEO landing pages — a visitor arriving from Google used
          to get a bare article with one small back-link and no other route. */}
      <SiteNav email={PROFILE.email} />
      <article className="mx-auto max-w-3xl px-5 py-14">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />

      <Link href="/#work" className="focus-ring label-xs rounded-lg text-muted-foreground transition hover:text-foreground">
        ← Back to work
      </Link>

      <div className="label-xs mt-8 flex items-center gap-3 text-muted-foreground">
        <span>Result-{c.id}</span>
        <span className="text-[var(--violet)]">{c.category}</span>
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
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--cyan)]" />
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
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--amber)]" />
                {a}
              </li>
            ))}
          </ul>
        </Block>
      )}

      <div className="glass mt-14 rounded-3xl p-8 text-center">
        <p className="text-muted-foreground">
          Want the deeper story? Ask the agent on the home page, or reach me directly.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <a
            href={`mailto:${PROFILE.email}`}
            className="focus-ring inline-flex min-h-12 items-center rounded-2xl bg-[var(--amber)] px-6 text-[0.95rem] font-semibold text-[oklch(0.16_0.03_84)] transition hover:brightness-110"
          >
            {PROFILE.email}
          </a>
          <Link
            href="/"
            className="focus-ring glass inline-flex min-h-12 items-center rounded-2xl px-5 text-[0.95rem] transition hover:brightness-125"
          >
            ◉ Talk to the agent
          </Link>
        </div>
      </div>
      </article>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-5 py-7 text-center sm:flex-row sm:text-left">
          <span className="label-xs text-muted-foreground">
            © {new Date().getFullYear()} Vaibhavkumar Yadav · Richardson, TX
          </span>
          <Link href="/#work" className="focus-ring label-xs rounded-lg text-muted-foreground transition hover:text-foreground">
            More work →
          </Link>
        </div>
      </footer>
    </>
  );
}

function Block({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className="mt-12">
      <h2 className="label-xs mb-4 text-[var(--cyan)]">&gt; {label}</h2>
      {children}
    </section>
  );
}

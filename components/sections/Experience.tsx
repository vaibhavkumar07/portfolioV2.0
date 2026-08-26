import Image from "next/image";
import { EXPERIENCE, type Award, type Credential } from "@/lib/data/kb";
import { RevealItem, RevealStagger } from "@/components/fx/Reveal";

/**
 * Career history as a stacked rail of rows — adapted from 21st.dev's "Impact
 * Experience" (uilayout.contact) onto the Spatial Console tokens.
 *
 * Two deliberate departures from the upstream component:
 *  - its per-row hover-reveal used remote Unsplash photos; our CSP blocks
 *    third-party images and stock office shots say nothing about the work, so
 *    the reveal is a cyan→violet wash driven by tokens instead.
 *  - it hardcoded neutral-900/zinc-50 (a light palette). Every colour here
 *    resolves through the OKLCH tokens in globals.css.
 */
export default function Experience() {
  return (
    /* No glass wrapper: this section flips to the paper surface, where a
       translucent navy panel would fight the background. Rows carry their own
       dividers, so the rail works on any surface. */
    <RevealStagger className="border-t border-border" stagger={0.06}>
      {EXPERIENCE.map((e, i) => (
        <RevealItem key={e.period}>
          <Row {...e} index={EXPERIENCE.length - i} current={i === 0} />
        </RevealItem>
      ))}
    </RevealStagger>
  );
}

function Row({
  index, period, role, org, location, focus, credentials, awards, current,
}: {
  index: number;
  period: string;
  role: string;
  org: string;
  location: string;
  focus: string;
  credentials?: Credential[];
  awards?: Award[];
  current: boolean;
}) {
  return (
    <div className="group relative border-b border-border py-7 md:py-8">
      {/* Hover wash — decorative, sits under the content. Opacity-only so it
          costs nothing on reduced-motion. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 motion-reduce:transition-none"
        style={{
          background:
            "linear-gradient(90deg, oklch(0.789 0.134 205 / 0.10), oklch(0.714 0.143 294 / 0.07) 55%, transparent)",
        }}
      />
      {/* Accent bar grows from the left edge on hover */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-0 h-full w-0.5 origin-top scale-y-0 bg-[var(--cyan)] transition-transform duration-300 group-hover:scale-y-100 motion-reduce:transition-none"
      />

      {/* Role, employer, dates, location, focus — one cluster so the eye
          doesn't jump a full grid column to find when/where. */}
      <div className="relative z-10 max-w-3xl">
        <div className="label-xs mb-2 flex items-center gap-2 text-muted-foreground">
          {/* Plain muted rather than a cyan opacity variant: at 40% alpha the
              index vanished against the paper surface. */}
          <span aria-hidden="true" className="text-muted-foreground">
            {String(index).padStart(2, "0")}
          </span>
          {current && (
            <span className="inline-flex items-center gap-1.5 text-[var(--live)]">
              <span
                className="h-1.5 w-1.5 rounded-full bg-[var(--live)]"
                style={{ boxShadow: "0 0 8px var(--live)" }}
              />
              Current
            </span>
          )}
        </div>
        <h3 className="t-role">{role}</h3>
        <p className="mt-2 text-sm text-muted-foreground">{org}</p>
        <p className="mt-1 text-sm text-foreground/80">
          {period}
          <span className="text-muted-foreground"> · {location}</span>
        </p>
        <div className="mt-3">
          <span className="label-xs mb-2 block text-muted-foreground">Focus</span>
          <span className="inline-block rounded-xl border border-[var(--violet)]/30 bg-[var(--violet)]/10 px-3 py-1.5 text-sm text-foreground/90">
            {focus}
          </span>
        </div>
      </div>

      {/* Credentials earned in this role — spans the full row so they read as
          events on the timeline rather than a fourth column of metadata. */}
      {credentials && credentials.length > 0 && (
        <div className="band-cert relative z-10 mt-5 rounded-2xl px-3 py-2.5">
          <span className="mb-2 block font-[family-name:var(--font-mono)] text-xs text-[var(--cyan)]">
            Certified in this role
          </span>
          <ul className="space-y-2">
            {credentials.map((c) => (
              <li key={c.name} className="flex items-center gap-3">
                {c.badge ? (
                  <Image
                    src={c.badge}
                    alt=""
                    width={40}
                    height={40}
                    className="h-10 w-10 shrink-0 object-contain"
                  />
                ) : (
                  /* No artwork for the Infosys/eCornell certs — a token-styled
                     marker keeps the list aligned without faking a badge. */
                  <span
                    aria-hidden="true"
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-[var(--cyan)]/30 text-[var(--cyan)]"
                  >
                    ✓
                  </span>
                )}
                <span className="min-w-0 text-sm text-foreground/90">
                  {c.name}
                  <span className="text-muted-foreground">
                    {" · "}
                    {c.issuer}
                    {c.issued ? ` · ${c.issued}` : ""}
                    {c.expires ? ` — valid to ${c.expires}` : ""}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recognition — amber, so certifications (cyan) and awards stay legible
          as two different kinds of thing at a glance. */}
      {awards && awards.length > 0 && (
        <div className="relative z-10 mt-5">
          <span className="label-xs mb-2 block text-[var(--amber)]">Recognition</span>
          <ul className="flex flex-wrap gap-2">
            {awards.map((a) => (
              <li
                key={`${a.name}-${a.date}`}
                className="band-award rounded-xl px-3 py-1.5 text-sm text-foreground/90"
              >
                {a.name}
                <span className="text-muted-foreground"> · {a.date}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

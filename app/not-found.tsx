import Link from "next/link";

export const metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <main id="main" className="mx-auto flex max-w-3xl flex-col items-center px-5 py-24 text-center">
      <span className="font-[family-name:var(--font-mono)] text-xs text-[var(--cyan)]">&gt; Error 404</span>
      <h1 className="mt-4 text-[clamp(2rem,6vw,3.25rem)] font-bold leading-tight tracking-tight">
        This line is disconnected.
      </h1>
      <p className="mt-4 max-w-md text-base leading-relaxed text-muted-foreground">
        That page doesn&apos;t exist. Head back to the home page and ask the agent — it can
        point you at the right case study.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="focus-ring inline-flex min-h-12 items-center rounded-xl bg-[var(--amber)] px-6 text-[0.95rem] font-semibold text-[oklch(0.16_0.03_84)] transition hover:brightness-110"
        >
          Back to home
        </Link>
        <Link
          href="/#work"
          className="focus-ring glass inline-flex min-h-12 items-center rounded-xl px-5 text-[0.95rem] transition hover:brightness-125"
        >
          See the work
        </Link>
      </div>
    </main>
  );
}

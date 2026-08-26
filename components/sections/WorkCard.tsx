"use client";

import Link from "next/link";

export default function WorkCard({
  href,
  index,
  category,
  title,
  description,
  featured = false,
}: {
  href: string;
  index: number;
  category: string;
  title: string;
  description: string;
  featured?: boolean;
}) {
  const num = String(index + 1).padStart(2, "0");
  return (
    <div className="group relative h-[22rem] w-[min(calc(100vw-2.5rem),22rem)] shrink-0 sm:h-[24rem] sm:w-[24rem]">
      <Link
        href={href}
        className="focus-ring relative flex h-full w-full flex-col overflow-hidden rounded-2xl border p-6 sm:p-7"
        style={{
          borderColor: featured
            ? "color-mix(in oklch, var(--cyan) 70%, transparent)"
            : "color-mix(in oklch, var(--cyan) 22%, transparent)",
          background:
            "linear-gradient(165deg, oklch(0.18 0.03 267 / 0.95), oklch(0.08 0.02 267 / 0.98))",
          boxShadow: featured
            ? "0 0 0 1px color-mix(in oklch, var(--cyan) 40%, transparent), 0 0 48px oklch(0.789 0.134 205 / 0.3), 0 24px 48px oklch(0 0 0 / 0.5)"
            : "0 12px 32px oklch(0 0 0 / 0.4)",
        }}
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "linear-gradient(oklch(0.789 0.134 205 / 0.06) 1px, transparent 1px), linear-gradient(90deg, oklch(0.789 0.134 205 / 0.06) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        {featured && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-[var(--cyan)] to-transparent"
            style={{ boxShadow: "0 0 20px var(--cyan)" }}
          />
        )}

        <div className="relative">
          <p className="text-xs font-[family-name:var(--font-mono)] tracking-wide text-[var(--violet)]">
            <span className="mr-2 tabular-nums text-white/45">{num}</span>
            {category}
          </p>
          <h3 className="mt-4 max-w-[16ch] font-[family-name:var(--font-heading)] text-[1.55rem] font-semibold leading-[1.1] tracking-tight text-white sm:text-[1.7rem]">
            {title}
          </h3>
          <p className="mt-3 line-clamp-3 max-w-[36ch] text-sm leading-relaxed text-white/55">
            {description}
          </p>
        </div>
        <span className="relative mt-auto pt-6 inline-flex items-center gap-2 text-xs font-[family-name:var(--font-mono)] text-[var(--cyan)]">
          Open case study
          <span aria-hidden="true">→</span>
        </span>
      </Link>
    </div>
  );
}

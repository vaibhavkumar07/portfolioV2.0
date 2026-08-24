"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import TiltCard from "@/components/fx/TiltCard";

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
    <TiltCard className="group relative h-[26rem] w-[min(82vw,22rem)] shrink-0 sm:h-[28rem] sm:w-[24rem]">
      <Link
        href={href}
        className="focus-ring relative flex h-full w-full flex-col justify-between overflow-hidden rounded-2xl border p-6 sm:p-7"
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
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -right-8 top-16 h-40 w-40 rounded-full opacity-50 blur-2xl"
          style={{ background: "radial-gradient(circle, var(--violet), transparent 70%)" }}
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute bottom-24 right-8 h-28 w-28 rounded-full border border-[var(--cyan)]/25 opacity-50"
          style={{ boxShadow: "inset 0 0 30px oklch(0.789 0.134 205 / 0.2)" }}
        />

        <div className="relative">
          <p className="text-[0.65rem] font-[family-name:var(--font-mono)] uppercase tracking-[0.16em] text-[var(--violet)]">
            {category}
          </p>
          <h3 className="mt-4 max-w-[14ch] font-[family-name:var(--font-heading)] text-[1.65rem] font-semibold leading-[1.05] tracking-tight text-white sm:text-[1.85rem]">
            {title}
          </h3>
          <p className="mt-4 line-clamp-4 max-w-[36ch] text-[0.85rem] leading-relaxed text-white/50">
            {description}
          </p>
          <span className="mt-6 inline-flex items-center gap-2 text-[0.7rem] font-[family-name:var(--font-mono)] uppercase tracking-[0.12em] text-[var(--cyan)]">
            Open case study
            <span aria-hidden="true">→</span>
          </span>
        </div>

        <div className="relative flex items-end justify-between">
          <span
            aria-hidden="true"
            className="font-[family-name:var(--font-heading)] text-5xl font-semibold leading-none tracking-tight"
            style={{
              color: "transparent",
              WebkitTextStroke: "1px color-mix(in oklch, var(--cyan) 55%, transparent)",
            }}
          >
            {num}
          </span>
          <span
            aria-hidden="true"
            className="grid h-9 w-9 place-items-center rounded-full border border-[var(--cyan)]/35 text-[var(--cyan)]"
          >
            <ArrowUpRight className="h-4 w-4" />
          </span>
        </div>
      </Link>
    </TiltCard>
  );
}

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import WorkCard from "@/components/sections/WorkCard";
import { slug } from "@/lib/slug";

type Project = {
  id: string;
  title: string;
  category: string;
  description: string;
};

/** Selected-work carousel — scrollIntoView so the last card can fully focus. */
export default function WorkRail({ projects }: { projects: Project[] }) {
  const railRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [active, setActive] = useState(0);
  const total = projects.length;
  const pad = "max(1.25rem, calc((100vw - 72rem) / 2 + 2rem))";

  const goTo = useCallback((index: number) => {
    const i = Math.max(0, Math.min(total - 1, index));
    setActive(i);
    cardRefs.current[i]?.scrollIntoView({
      behavior: "smooth",
      inline: "start",
      block: "nearest",
    });
  }, [total]);

  const sync = useCallback(() => {
    const rail = railRef.current;
    if (!rail) return;
    const mid = rail.scrollLeft + rail.clientWidth / 2;
    let best = 0;
    let bestDist = Infinity;
    cardRefs.current.forEach((el, i) => {
      if (!el) return;
      const center = el.offsetLeft + el.offsetWidth / 2;
      const dist = Math.abs(center - mid);
      if (dist < bestDist) {
        bestDist = dist;
        best = i;
      }
    });
    setActive(best);
  }, []);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    const onScroll = () => sync();
    rail.addEventListener("scroll", onScroll, { passive: true });
    sync();
    return () => rail.removeEventListener("scroll", onScroll);
  }, [sync, total]);

  return (
    <div className="relative">
      <div
        ref={railRef}
        className="rail gap-5 pb-8 pt-2"
        style={{ paddingInline: pad, scrollPaddingInline: pad }}
      >
        {projects.map((p, i) => (
          <div
            key={p.id}
            ref={(el) => {
              cardRefs.current[i] = el;
            }}
            className={`relative shrink-0 transition-all duration-500 motion-reduce:transition-none motion-reduce:lg:scale-100 ${
              i === active
                ? "z-[2] opacity-100 lg:scale-[1.04]"
                : "z-[1] opacity-100 lg:scale-[0.92] lg:opacity-45"
            }`}
          >
            <WorkCard
              href={`/work/${slug(p.title)}`}
              index={i}
              category={p.category}
              title={p.title}
              description={p.description}
              featured={i === active}
            />
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3 sm:gap-4" style={{ paddingInline: pad }}>
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Previous"
            onClick={() => goTo(active - 1)}
            className="focus-ring grid h-11 w-11 place-items-center rounded-md border border-white/25 bg-[#080b12]/80 text-white/80 hover:border-[var(--cyan)] hover:text-[var(--cyan)]"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Next"
            onClick={() => goTo(active + 1)}
            className="focus-ring grid h-11 w-11 place-items-center rounded-md border border-white/25 bg-[#080b12]/80 text-white/80 hover:border-[var(--cyan)] hover:text-[var(--cyan)]"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        <span className="min-w-[3.5rem] text-[0.75rem] font-[family-name:var(--font-mono)] tabular-nums text-[var(--cyan)]">
          {String(active + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </span>
        <div className="hidden items-center gap-2 text-xs font-[family-name:var(--font-mono)] uppercase tracking-[0.16em] text-white/70 sm:flex">
          <span>Scroll</span>
          <span className="h-px w-6 bg-white/40" />
          <span>Drag</span>
        </div>
        <div className="h-1.5 min-w-[6rem] flex-1 overflow-hidden rounded-full bg-white/20">
          <div
            className="h-full rounded-full transition-[width] duration-300"
            style={{
              width: `${((active + 1) / total) * 100}%`,
              background: "linear-gradient(90deg, var(--cyan), var(--violet))",
              boxShadow: "0 0 12px oklch(0.789 0.134 205 / 0.55)",
            }}
          />
        </div>
      </div>
    </div>
  );
}

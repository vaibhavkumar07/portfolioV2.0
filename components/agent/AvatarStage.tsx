"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

const AVATAR_SRC = "/avatar-hero.jpg";

/**
 * The portrait, reacting to the agent's real voice.
 *
 * A still image has no mouth to move, so this deliberately does NOT fake
 * lip-sync — faking it reads as uncanny. Instead the live TTS amplitude
 * (sampled from the same AnalyserNode the console owns) drives a rim glow,
 * a speaking ring and a tiny scale, so the portrait visibly responds while
 * the agent talks.
 *
 * Values are written to CSS custom properties inside rAF rather than React
 * state — per-frame setState would re-render the tree 60×/second.
 */
export default function AvatarStage({
  analysers,
  reduce = false,
  priority = false,
  className = "",
  sizes = "(max-width: 1024px) 100vw, 620px",
}: {
  /**
   * Every audio source that can make him "speak" — the conversation agent and
   * the arrival greeting each own their own AnalyserNode (a MediaElementSource
   * can only be created once per <audio>, so they cannot share one). The loudest
   * wins, which is correct: only one of them is ever playing.
   */
  analysers?: React.RefObject<AnalyserNode | null>[];
  reduce?: boolean;
  priority?: boolean;
  className?: string;
  sizes?: string;
}) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;

    const buf = new Uint8Array(128);
    let level = 0;
    let raf = 0;
    let last = performance.now();
    const coarse =
      typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;

    const pointer = { x: 0, y: 0 };
    const onMove = (e: MouseEvent) => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    if (!reduce && !coarse) window.addEventListener("mousemove", onMove);

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      // Live speech amplitude → 0..1, loudest source wins
      let target = 0;
      for (const ref of analysers ?? []) {
        const an = ref.current;
        if (!an) continue;
        an.getByteTimeDomainData(buf);
        let sum = 0;
        for (let i = 0; i < buf.length; i++) {
          const d = (buf[i] - 128) / 128;
          sum += d * d;
        }
        target = Math.max(target, Math.min(1, Math.sqrt(sum / buf.length) * 4.5));
      }
      level += (target - level) * Math.min(1, dt * 12);

      el.style.setProperty("--speak", level.toFixed(3));

      if (!reduce) {
        const t = now / 1000;
        const floatY = Math.sin(t * 0.7) * 4;
        const px = coarse ? 0 : pointer.x * 6;
        const py = coarse ? 0 : pointer.y * 4;
        el.style.setProperty("--shift-x", `${px.toFixed(2)}px`);
        el.style.setProperty("--shift-y", `${(floatY + py).toFixed(2)}px`);
      }
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
    };
  }, [analysers, reduce]);

  return (
    <div
      ref={root}
      className={`relative h-full w-full overflow-hidden ${className}`}
      style={{ ["--speak" as string]: 0, ["--shift-x" as string]: "0px", ["--shift-y" as string]: "0px" }}
    >
      <div
        className="absolute inset-0"
        style={{
          transform: "translate3d(var(--shift-x), var(--shift-y), 0) scale(calc(1.04 + var(--speak) * 0.012))",
        }}
      >
        <Image
          src={AVATAR_SRC}
          alt="Vaibhavkumar Yadav at his workstation"
          fill
          priority={priority}
          sizes={sizes}
          /* Focal point sits on his face — object-top framed the bookshelf
             and pushed him under the bottom gradient. */
          className="object-cover object-[50%_22%]"
        />
      </div>

      {/* Warm key light that swells while he speaks */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 mix-blend-screen"
        style={{
          background:
            "radial-gradient(70% 50% at 50% 38%, color-mix(in srgb, var(--cyan) calc(var(--speak) * 26%), transparent), transparent 70%)",
        }}
      />
      {/* Speaking ring — the visual stand-in for a moving mouth */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-[inherit]"
        style={{
          boxShadow:
            "inset 0 0 0 1px color-mix(in srgb, var(--cyan) calc(18% + var(--speak) * 55%), transparent), inset 0 0 calc(20px + var(--speak) * 60px) color-mix(in srgb, var(--cyan) calc(var(--speak) * 35%), transparent)",
        }}
      />
      {/* Grounds the portrait into the panel so overlaid chips stay readable */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3"
        style={{
          background: "linear-gradient(to top, var(--background) 6%, transparent 100%)",
          opacity: 0.72,
        }}
      />
    </div>
  );
}

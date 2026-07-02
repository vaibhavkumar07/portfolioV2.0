"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";

const HeroScene = dynamic(() => import("./HeroScene"), { ssr: false });

const CHIPS: { label: string; className: string; style: React.CSSProperties }[] = [
  {
    label: "IVR",
    className: "left-[6%] top-[16%] border-[var(--brand-orange)]/40 text-[var(--brand-orange)]",
    style: { transform: "rotateX(14deg) translateZ(70px)" },
  },
  {
    label: "NLU",
    className: "right-[8%] top-[32%] border-[var(--brand-sky)]/40 text-[var(--brand-sky)]",
    style: { transform: "rotateX(14deg) translateZ(110px)" },
  },
  {
    label: "TTS",
    className: "bottom-[20%] left-[12%] border-[var(--brand-sky)]/40 text-[var(--brand-sky)]",
    style: { transform: "rotateX(14deg) translateZ(90px)" },
  },
];

/**
 * Gates the WebGL constellation to fine-pointer viewports ≥768px without
 * reduced motion; everything else gets a lightweight CSS-3D fallback of
 * flow-node chips on staggered translateZ planes.
 */
export default function Hero3D() {
  const reduce = useReducedMotion();
  const [webgl, setWebgl] = useState(false);

  useEffect(() => {
    // WebGL probe: headless browsers and old GPUs can't create a context —
    // without this check the R3F canvas throws instead of falling back.
    let supported = false;
    try {
      const probe = document.createElement("canvas");
      supported = !!(probe.getContext("webgl2") || probe.getContext("webgl"));
    } catch {
      supported = false;
    }
    if (!supported) return;

    const mq = window.matchMedia("(min-width: 768px) and (pointer: fine)");
    const update = () => setWebgl(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  if (!reduce && webgl) {
    return <HeroScene />;
  }

  return (
    // Chips clutter the stacked mobile layout — decorative fallback is md+ only.
    <div className="relative hidden h-full w-full md:block" style={{ perspective: "1000px" }}>
      {CHIPS.map((c) => (
        <span
          key={c.label}
          className={`mono absolute rounded-md border bg-card/40 px-2 py-1 text-[0.6rem] tracking-[0.18em] ${c.className}`}
          style={c.style}
        >
          {c.label}
        </span>
      ))}
    </div>
  );
}

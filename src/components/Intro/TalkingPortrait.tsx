import { useEffect, useRef } from 'react';

/**
 * Makes a still portrait "speak" in-browser — no video, no heavy ML.
 * Each frame it redraws the photo with the lower-face band (below the upper lip)
 * stretched vertically by a speech envelope, so the jaw/mouth opens and closes
 * as the narration plays. Because it warps the real face pixels (not a drawn
 * fake mouth), it reads as talking without the uncanny overlay look. Adds a
 * subtle head bob via CSS. Falls back to a static draw for reduced-motion.
 */
export default function TalkingPortrait({
  src,
  active,
  reduce,
  onError,
}: {
  src: string;
  active: boolean;
  reduce: boolean;
  onError?: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const PIVOT = 0.55; // fraction of height where the jaw warp begins (at the upper lip)
  const AMP = 0.2;    // max jaw drop (fraction of the lower band)

  function drawFrame(level: number) {
    const c = canvasRef.current;
    const img = imgRef.current;
    if (!c || !img) return;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    const { width: W, height: H } = c;
    const { width: iw, height: ih } = img;
    const pivotI = ih * PIVOT;
    const pivotC = H * PIVOT;
    ctx.clearRect(0, 0, W, H);
    // Static top (forehead, eyes, nose)
    ctx.drawImage(img, 0, 0, iw, pivotI, 0, 0, W, pivotC);
    // Stretched bottom (mouth, jaw, chin) — taller = jaw drops, mouth opens
    const destH = (H - pivotC) * (1 + level * AMP);
    ctx.drawImage(img, 0, pivotI, iw, ih - pivotI, 0, pivotC, W, destH);
  }

  // Load the portrait once.
  useEffect(() => {
    const img = new Image();
    img.onload = () => { imgRef.current = img; drawFrame(0); };
    img.onerror = () => onError?.();
    img.src = src;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  // Animate the mouth while speaking.
  useEffect(() => {
    if (reduce || !active) { drawFrame(0); return; }
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const s = (t - t0) / 1000;
      const v = Math.abs(
        Math.sin(s * 11) * 0.5 + Math.sin(s * 7 + 1) * 0.3 + Math.sin(s * 17 + 2) * 0.2,
      );
      const level = v > 0.28 ? Math.min(1, v) : v * 0.18;
      drawFrame(level);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, reduce]);

  return (
    <canvas
      ref={canvasRef}
      width={512}
      height={512}
      className={`talk-portrait${active && !reduce ? ' talk-portrait--live' : ''}`}
    />
  );
}

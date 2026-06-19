import { useEffect, type RefObject } from 'react';

/**
 * Procedural lip-sync. While `active`, animates an SVG mouth element's vertical
 * radius with a syllable-like envelope (mix of sines, rectified + gated) so the
 * presenter looks like it's talking. Writes straight to the DOM via rAF — no
 * React re-renders per frame, and no Web Audio plumbing to break under
 * autoplay/StrictMode.
 *
 * @param mouthRef  ref to an SVG <ellipse> (the mouth)
 * @param active    true while audio is playing and motion is allowed
 * @param closedRy  resting vertical radius (mouth nearly closed)
 * @param openRy    max vertical radius (mouth wide open)
 */
export function useLipSync(
  mouthRef: RefObject<SVGEllipseElement>,
  active: boolean,
  closedRy = 1.5,
  openRy = 9,
) {
  useEffect(() => {
    const mouth = mouthRef.current;
    if (!mouth) return;

    if (!active) {
      mouth.setAttribute('ry', String(closedRy));
      return;
    }

    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const s = (t - t0) / 1000;
      // Layered sines approximate speech cadence; abs + gate carves syllables.
      const v = Math.abs(
        Math.sin(s * 11) * 0.5 + Math.sin(s * 7 + 1) * 0.3 + Math.sin(s * 17 + 2) * 0.2,
      );
      const gated = v > 0.28 ? v : v * 0.18;
      const ry = closedRy + Math.min(1, gated) * (openRy - closedRy);
      mouth.setAttribute('ry', ry.toFixed(2));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [mouthRef, active, closedRy, openRy]);
}

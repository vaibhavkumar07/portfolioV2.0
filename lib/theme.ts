/**
 * Palette values for contexts that can't read CSS custom properties —
 * recharts SVG props and React Flow node/edge styles. Keep in sync with the
 * tokens in app/globals.css; this is the only place raw hex is allowed.
 */
export const THEME = {
  cyan: "#22d3ee",
  violet: "#a78bfa",
  amber: "#fbbf24",
  live: "#4ade80",
  /** Panel fill behind tooltips and edge labels. */
  surface: "#131a2b",
  surfaceDeep: "#0a0e18",
  /** Chart grid lines and inactive edges. */
  grid: "#1c3348",
  /** Axis ticks and secondary label text. */
  axis: "#8794ae",
  foreground: "#e9edf7",
} as const;

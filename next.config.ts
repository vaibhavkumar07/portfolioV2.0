import type { NextConfig } from "next";

// Content-Security-Policy. 'unsafe-inline' is needed for Next's inline runtime,
// framer-motion inline styles, and the JSON-LD script; 'unsafe-eval' only in dev
// (Next dev runtime needs it — never ship it to production).
//
// ACCEPTED RISK — script-src 'unsafe-inline' (reviewed 2026-08-09).
// Dropping it requires a per-request nonce, which in the App Router means
// reading headers() and so opts every page into dynamic rendering: the home
// page and all five case studies would lose static generation. That trade was
// declined deliberately. It is defensible here because the blast radius of an
// injection is close to nil — the site has no auth, no cookies, no session, no
// tokens in browser storage, and renders no user-generated content. There is
// nothing for injected script to exfiltrate. Revisit this decision the moment
// any of those five facts stops being true.
const isDev = process.env.NODE_ENV === "development";
// Vercel Analytics/Speed Insights load debug scripts from va.vercel-scripts.com
// in dev only; in production they are served same-origin under /_vercel/*.
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval' https://va.vercel-scripts.com" : ""}`,
  "style-src 'self' 'unsafe-inline' https://api.fontshare.com",
  "font-src 'self' https://cdn.fontshare.com data:",
  "img-src 'self' data: blob:",
  "media-src 'self' blob: data:",
  // blob: is required by three.js — ImageBitmapLoader fetch()es page-created
  // blob: URLs when decoding textures. Same-origin data the page already
  // holds; no external destination is opened. Shaders are inline GLSL strings
  // compiled by the GPU driver, not JS eval, so script-src is unaffected.
  "connect-src 'self' blob:",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "microphone=(self), camera=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  // Severs the window.opener / cross-origin popup channel and stops other
  // origins embedding this site's subresources. Nothing here is meant to be
  // consumed cross-origin, so same-origin is the correct floor for both.
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;

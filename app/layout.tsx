import type { Metadata, Viewport } from "next";
import { JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Backdrop from "@/components/fx/Backdrop";
import ScrollProgress from "@/components/fx/ScrollProgress";
import TrackVisit from "@/components/fx/TrackVisit";
import SmoothScroll from "@/components/fx/SmoothScroll";
import AppShell from "@/components/shell/AppShell";
import { env } from "@/lib/server/env";
import { HOME_DESCRIPTION, HOME_TITLE, OG_IMAGE, SITE } from "@/lib/site";
import "./globals.css";

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#080b12",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: HOME_TITLE,
    template: "%s · Vaibhavkumar Yadav",
  },
  description: HOME_DESCRIPTION,
  keywords: [
    "Vaibhavkumar Yadav",
    "Genesys Cloud", "IVR developer", "contact center", "voice AI",
    "Genesys Architect", "AI Studio", "Dialogflow", "conversational AI",
    "CX engineer",
    "Genesys developer Dallas", "IVR developer Texas", "Genesys Cloud consultant USA",
    "contact center engineer Richardson TX", "voice AI engineer Dallas Fort Worth",
    "remote Genesys Cloud developer",
  ],
  authors: [{ name: "Vaibhavkumar Yadav", url: SITE }],
  alternates: { canonical: "/" },
  // Classic geo meta tags — still read by local/AI crawlers.
  other: {
    "geo.region": "US-TX",
    "geo.placename": "Richardson, Texas",
    "geo.position": "32.9483;-96.7299",
    ICBM: "32.9483, -96.7299",
  },
  openGraph: {
    type: "website",
    url: SITE,
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    siteName: "Vaibhavkumar Yadav",
    locale: "en_US",
    images: [{ url: OG_IMAGE, alt: "Vaibhavkumar Yadav" }],
  },
  twitter: {
    card: "summary_large_image",
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    images: [OG_IMAGE],
  },
  robots: { index: true, follow: true },
  ...(env.googleSiteVerification
    ? { verification: { google: env.googleSiteVerification } }
    : {}),
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${mono.variable} h-full antialiased`}>
      <head>
        {/* Fontshare: distinctive display + body (not Inter/system) */}
        <link
          href="https://api.fontshare.com/v2/css?f[]=clash-display@600,700&f[]=general-sans@400,500,600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <a
          href="#main"
          className="focus-ring sr-only rounded-md border border-border bg-background px-3 py-2 text-sm focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50"
        >
          Skip to content
        </a>
        <Backdrop />
        <ScrollProgress />
        <TrackVisit />
        <SmoothScroll />
        <AppShell>{children}</AppShell>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}

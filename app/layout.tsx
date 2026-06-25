import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import Backdrop from "@/components/fx/Backdrop";
import "./globals.css";

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const SITE = "https://vaibhav.cx";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: "Vaibhavkumar Yadav — Genesys IVR & Voice-AI Developer",
    template: "%s · Vaibhavkumar Yadav",
  },
  description:
    "Genesys Cloud IVR developer and contact-center voice-AI engineer. 7+ years building enterprise IVR, bot flows, and AI-assisted CX for healthcare, automotive, and e-commerce. Talk to my portfolio.",
  keywords: [
    "Genesys Cloud", "IVR developer", "contact center", "voice AI",
    "Genesys Architect", "AI Studio", "Dialogflow", "conversational AI",
    "Vaibhavkumar Yadav", "CX engineer",
  ],
  authors: [{ name: "Vaibhavkumar Yadav" }],
  openGraph: {
    type: "website",
    url: SITE,
    title: "Vaibhavkumar Yadav — Genesys IVR & Voice-AI Developer",
    description:
      "Talk to my portfolio — a live voice agent built on the same stack I ship for enterprise contact centers.",
    siteName: "Vaibhavkumar Yadav",
  },
  twitter: {
    card: "summary_large_image",
    title: "Vaibhavkumar Yadav — Genesys IVR & Voice-AI Developer",
    description: "Talk to my portfolio — a live contact-center voice agent.",
  },
  robots: { index: true, follow: true },
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
        <Backdrop />
        {children}
      </body>
    </html>
  );
}

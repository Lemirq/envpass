import type { Metadata } from "next";
import { Instrument_Serif } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const instrumentSerif = Instrument_Serif({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-instrument-serif",
});

export const metadata: Metadata = {
  title: "envpass — stop pasting secrets in Discord",
  description:
    "The secure way to share secrets at hackathons. Create a room, invite your team, and share encrypted environment variables in real-time. Zero plaintext at rest.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://envpass.dev",
  ),
  openGraph: {
    title: "envpass — stop pasting secrets in Discord",
    description:
      "Fast, ephemeral, encrypted secret sharing for hackathon teams. WorkOS Vault encryption, real-time sync, and copy-to-clipboard with auto-clear.",
    url: "/",
    siteName: "envpass",
    images: [
      {
        url: "/og.jpg",
        width: 1200,
        height: 630,
        alt: "envpass — Secure secret sharing for hackathon teams",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "envpass — stop pasting secrets in Discord",
    description:
      "Fast, ephemeral, encrypted secret sharing for hackathon teams. Zero plaintext at rest.",
    images: ["/og.jpg"],
  },
  keywords: [
    "secret sharing",
    "environment variables",
    "hackathon",
    "encrypted",
    "env file",
    "API keys",
    "team secrets",
    "WorkOS Vault",
  ],
  authors: [{ name: "envpass" }],
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <script
          id="datafast-queue"
          dangerouslySetInnerHTML={{
            __html: `window.datafast = window.datafast || function() {
              window.datafast.q = window.datafast.q || [];
              window.datafast.q.push(arguments);
            };`,
          }}
        />
        <Script
          src="https://datafa.st/js/script.js"
          data-website-id="dfid_oeifXKR9iuHOvEDcvcGOc"
          data-domain="envpass.vhaan.me"
          strategy="afterInteractive"
        />
      </head>
      <body className={`antialiased ${instrumentSerif.variable}`}>
        {children}
      </body>
    </html>
  );
}

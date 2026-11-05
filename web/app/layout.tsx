import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, Inter } from "next/font/google";
import { SiteHeader } from "../components/SiteHeader";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  fallback: ["system-ui", "Segoe UI", "sans-serif"]
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
  display: "swap",
  fallback: ["ui-monospace", "Consolas", "monospace"]
});

export const metadata: Metadata = {
  title: {
    default: "TerraCascade — Explore radar data",
    template: "%s — TerraCascade"
  },
  applicationName: "TerraCascade",
  description:
    "Explore a documented NISAR sample product, see how it was processed, and understand what the current evidence can and cannot show.",
  keywords: [
    "NISAR",
    "NASA Space Apps",
    "SAR",
    "Earth observation",
    "interferometry",
    "GUNW"
  ],
  authors: [{ name: "TerraCascade" }],
  creator: "TerraCascade",
  robots: {
    index: true,
    follow: true
  },
  openGraph: {
    type: "website",
    title: "TerraCascade — Explore radar data",
    description:
      "Explore a documented NISAR sample product, see how it was processed, and understand what the current evidence can and cannot show.",
    siteName: "TerraCascade"
  },
  icons: {
    icon: "/mark.svg"
  }
};

export const viewport: Viewport = {
  themeColor: "#0b0e12",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1
};

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${plexMono.variable}`}>
      <body suppressHydrationWarning>
        <a className="skip-link" href="#main-content">Skip to main content</a>
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}

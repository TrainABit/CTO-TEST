import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { ThemeProvider } from "@/components/providers/theme-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

const siteUrl = "https://atlas.finance.example";
const siteName = "Atlas Finance";
const siteDescription =
  "All-in-one platform for monitoring plans, investments, and financial tools.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteName,
    template: "%s | " + siteName,
  },
  description: siteDescription,
  keywords: [
    "finance",
    "investment dashboard",
    "financial planning",
    "portfolio tracking",
    "atlas finance",
  ],
  authors: [{ name: siteName }],
  openGraph: {
    title: siteName,
    description: siteDescription,
    url: siteUrl,
    siteName,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: `${siteName} Open Graph Image`,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: siteName,
    description: siteDescription,
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#1b4dff" },
    { media: "(prefers-color-scheme: dark)", color: "#0b1a3f" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-background font-sans text-foreground`}
      >
        <ThemeProvider>
          <div className="flex min-h-screen flex-col">
            <SiteHeader />
            <main className="flex-1 bg-background">
              <div className="container py-8">{children}</div>
            </main>
            <SiteFooter />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}

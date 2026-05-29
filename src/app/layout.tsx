import type { Metadata } from "next";
import localFont from "next/font/local";
import Script from "next/script";
import { SavedExhibitionsProvider } from "@/components/SavedExhibitions";
import "./globals.css";

// Google Analytics 4 — the same Measurement ID for every page.
// Loading via next/script with strategy "afterInteractive" is the
// pattern the Next.js docs recommend for analytics tags: it inlines
// the snippet once in the root layout so it ships with every route,
// without blocking the initial render.
const GA_MEASUREMENT_ID = "G-258Q2XJMXP";

const sfPro = localFont({
  src: [
    {
      path: "../assets/fonts/sf-pro/SF-Pro-Text-Regular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../assets/fonts/sf-pro/SF-Pro-Text-Medium.otf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../assets/fonts/sf-pro/SF-Pro-Text-Semibold.otf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../assets/fonts/sf-pro/SF-Pro-Text-Bold.otf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-sf-pro",
  display: "swap",
  fallback: ["-apple-system", "BlinkMacSystemFont", "Segoe UI", "Arial", "sans-serif"],
});

export const metadata: Metadata = {
  title: {
    default: "FindArt Platform",
    template: "%s | FindArt Platform",
  },
  description: "International exhibition archive and open submission platform.",
};

export default function RootLayout({
  children,
  modal,
}: Readonly<{
  children: React.ReactNode;
  modal: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={sfPro.variable}>
        <SavedExhibitionsProvider>
          {children}
          {modal}
        </SavedExhibitionsProvider>
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script id="ga-init" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_MEASUREMENT_ID}');`}
        </Script>
      </body>
    </html>
  );
}

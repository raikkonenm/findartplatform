import type { Metadata } from "next";
import localFont from "next/font/local";
import { GoogleAnalytics } from "@next/third-parties/google";
import { SavedExhibitionsProvider } from "@/components/SavedExhibitions";
import "./globals.css";

// Google Analytics 4. Using @next/third-parties is the canonical
// Next.js App Router pattern: the GoogleAnalytics component injects
// the gtag.js script with strategy "afterInteractive" AND wires up
// automatic `page_view` events on client-side route changes, which
// the raw next/script approach does not do on its own.
const GA_MEASUREMENT_ID = "G-258Q2XJMXP";

const sfPro = localFont({
  src: [
    {
      path: "../assets/fonts/sf-pro/SF-Pro-Text-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../assets/fonts/sf-pro/SF-Pro-Text-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../assets/fonts/sf-pro/SF-Pro-Text-Semibold.woff2",
      weight: "600",
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
      </body>
      <GoogleAnalytics gaId={GA_MEASUREMENT_ID} />
    </html>
  );
}

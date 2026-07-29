import type { Metadata } from "next";
import localFont from "next/font/local";
import Script from "next/script";
import { SavedExhibitionsProvider } from "@/components/SavedExhibitions";
import "./globals.css";

// Google Analytics 4. We inject gtag.js manually via next/script with
// strategy="lazyOnload" instead of @next/third-parties/GoogleAnalytics
// (which is hard-coded to strategy="afterInteractive"). Loading GA
// after window.onload frees ~90 KB of bandwidth during the LCP window
// on mobile, at the cost of dropping analytics events for users who
// leave before onload fires.
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
      <Script
        id="_ga-init"
        strategy="lazyOnload"
        dangerouslySetInnerHTML={{
          __html: `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_MEASUREMENT_ID}');`,
        }}
      />
      <Script
        id="_ga-src"
        strategy="lazyOnload"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
      />
    </html>
  );
}

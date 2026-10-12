import type { Metadata } from "next";
import localFont from "next/font/local";
import Script from "next/script";
import { Footer } from "@/components/Footer";
import { GlobalSearchOverlay } from "@/components/GlobalSearchOverlay";
import { SavedExhibitionsProvider } from "@/components/SavedExhibitions";
import { SearchPanelProvider } from "@/components/SearchPanelContext";
import "./globals.css";

// Google Analytics 4 + Google Tag Manager. Loaded via next/script
// with strategy="afterInteractive" — runs right after hydration, so
// pageview events fire reliably but the ~90 KB gtm.js payload no
// longer competes with the LCP image fetch during initial parse.
const GA_MEASUREMENT_ID = "G-258Q2XJMXP";
const GTM_CONTAINER_ID = "GTM-TXNSKZMT";

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

const SITE_URL = "https://www.findartplatform.com";
const SITE_NAME = "FindArt Platform";
const HOME_TITLE =
  "FindArt Platform — Contemporary Art Exhibitions Archive";
const HOME_DESCRIPTION =
  "Discover contemporary art exhibitions from galleries worldwide. Installation views, artist statements and curatorial texts from ongoing and recent shows.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  // Root canonical points at the homepage; child pages (static and
  // detail alike) already set their own `alternates.canonical` which
  // overrides this. Pages without their own metadata (/_not-found)
  // inherit "/", which is fine because those routes are not indexed.
  alternates: { canonical: "/" },
  title: {
    // `default` is what the root URL "/" gets. Child pages either
    // provide `title: "..."` (interpolated via `template`) or
    // `title: { absolute: "..." }` when they want to opt out.
    default: HOME_TITLE,
    template: "%s | FindArt Platform",
  },
  description: HOME_DESCRIPTION,
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "en_US",
    url: SITE_URL,
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
  },
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
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var theme=localStorage.getItem('findart-theme');document.documentElement.dataset.theme=theme==='dark'?'dark':'light';}catch(e){document.documentElement.dataset.theme='light';}})();`,
          }}
        />
        {/* GTM dataLayer bootstrap — tiny inline so events pushed by
            React before the GTM script lands don't get dropped. The
            actual gtm.js load now happens via <Script
            strategy="afterInteractive"> below, which lets the LCP
            image win the bandwidth race on mobile but still runs
            analytics within the first ~500 ms after hydration. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer=window.dataLayer||[];window.dataLayer.push({'gtm.start':new Date().getTime(),event:'gtm.js'});`,
          }}
        />
      </head>
      <body className={sfPro.variable}>
        {/* Google Tag Manager (noscript) — placed immediately after the
            opening <body> tag per Google's install instructions. */}
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${GTM_CONTAINER_ID}`}
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        {/* End Google Tag Manager (noscript) */}
        <SavedExhibitionsProvider>
          <SearchPanelProvider>
            {children}
            <Footer />
            {modal}
            <GlobalSearchOverlay />
          </SearchPanelProvider>
        </SavedExhibitionsProvider>
      </body>
      {/* GTM container — loaded after hydration so the LCP image
          window isn't competing with ~90 KB of analytics bytes. */}
      <Script
        id="_gtm-src"
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtm.js?id=${GTM_CONTAINER_ID}`}
      />
      <Script
        id="_ga-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_MEASUREMENT_ID}');`,
        }}
      />
      <Script
        id="_ga-src"
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
      />
    </html>
  );
}

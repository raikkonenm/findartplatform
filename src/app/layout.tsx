import type { Metadata } from "next";
import localFont from "next/font/local";
import Script from "next/script";
import { Footer } from "@/components/Footer";
import { GlobalSearchOverlay } from "@/components/GlobalSearchOverlay";
import { SavedExhibitionsProvider } from "@/components/SavedExhibitions";
import { SearchPanelProvider } from "@/components/SearchPanelContext";
import "./globals.css";

// Google Analytics 4. We inject gtag.js manually via next/script with
// strategy="lazyOnload" instead of @next/third-parties/GoogleAnalytics
// (which is hard-coded to strategy="afterInteractive"). Loading GA
// after window.onload frees ~90 KB of bandwidth during the LCP window
// on mobile, at the cost of dropping analytics events for users who
// leave before onload fires.
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
            __html: `(function(){try{var theme=localStorage.getItem('findart-theme');document.documentElement.dataset.theme=theme==='light'?'light':'dark';}catch(e){document.documentElement.dataset.theme='dark';}})();`,
          }}
        />
        {/* Google Tag Manager — head snippet, per Google's official
            install instructions. Emitted as a raw inline <script> in
            the SSR HTML (not next/script) so it fires during initial
            parse instead of waiting for React hydration. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_CONTAINER_ID}');`,
          }}
        />
        {/* End Google Tag Manager */}
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

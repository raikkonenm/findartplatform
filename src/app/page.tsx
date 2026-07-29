import { headers } from "next/headers";
import HomePageClient from "./HomePageClient";

// Coarse UA-based viewport hint. Used only to seed the initial
// masonry column count so SSR and hydration agree — after hydration,
// matchMedia takes over for real viewport changes. False positives
// are harmless (one-off matchMedia correction, same as before).
// Reading headers() opts this page out of static generation; that is
// intentional and scoped to just the homepage — detail pages under
// /exhibitions/[slug] and other routes remain SSG.
function isMobileUserAgent(ua: string): boolean {
  return /Mobi|Android|iP(hone|od)|BlackBerry|IEMobile|Opera Mini|Kindle|Silk/i.test(ua);
}

export default async function HomePage() {
  const userAgent = (await headers()).get("user-agent") ?? "";
  const initialIsMobile = isMobileUserAgent(userAgent);
  return <HomePageClient initialIsMobile={initialIsMobile} />;
}

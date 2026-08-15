import type { Metadata } from "next";
import { headers } from "next/headers";
import HomePageClient from "../HomePageClient";

const EXHIBITIONS_TITLE = "All Exhibitions — Contemporary Art Archive";
const EXHIBITIONS_DESCRIPTION =
  "Browse all exhibitions in the FindArt Platform archive — installation views, artist profiles and curatorial texts from galleries around the world.";
const EXHIBITIONS_URL = "https://www.findartplatform.com/exhibitions";

export const metadata: Metadata = {
  title: { absolute: EXHIBITIONS_TITLE },
  description: EXHIBITIONS_DESCRIPTION,
  alternates: { canonical: EXHIBITIONS_URL },
  openGraph: {
    type: "website",
    url: EXHIBITIONS_URL,
    title: EXHIBITIONS_TITLE,
    description: EXHIBITIONS_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: EXHIBITIONS_TITLE,
    description: EXHIBITIONS_DESCRIPTION,
  },
};

function isMobileUserAgent(ua: string): boolean {
  return /Mobi|Android|iP(hone|od)|BlackBerry|IEMobile|Opera Mini|Kindle|Silk/i.test(ua);
}

export default async function ExhibitionsPage() {
  const userAgent = (await headers()).get("user-agent") ?? "";
  return (
    <HomePageClient
      initialIsMobile={isMobileUserAgent(userAgent)}
      showFeaturedBanners={false}
      showEditorialPromo={false}
    />
  );
}

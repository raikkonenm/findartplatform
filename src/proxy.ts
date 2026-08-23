import { NextResponse, type NextRequest } from "next/server";
import {
  opportunityRegionNameBySlug,
  opportunityRegionUrl,
} from "@/lib/opportunityTaxonomy";

function slugifyTag(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function proxy(request: NextRequest) {
  // 1) Legacy ?tag=X filter params → canonical /topics/[slug].
  //    Google indexed some /?tag=TRANSFORMATION URLs before we had
  //    /topics pages; consolidate ranking signals with a 301.
  const tag = request.nextUrl.searchParams.get("tag");
  if (tag) {
    const slug = slugifyTag(tag);
    if (slug) {
      const url = request.nextUrl.clone();
      url.pathname = `/topics/${slug}`;
      url.search = "";
      return NextResponse.redirect(url, 301);
    }
  }

  // 2) Opportunity region canonicalization (existing behavior).
  const prefix = "/opportunities/countries/";
  const pathname = request.nextUrl.pathname;
  const slug = pathname.startsWith(prefix) ? pathname.slice(prefix.length) : "";
  const region = slug && !slug.includes("/") ? opportunityRegionNameBySlug(slug) : undefined;

  if (region) {
    return NextResponse.redirect(
      new URL(opportunityRegionUrl(region), request.url),
      301,
    );
  }

  return NextResponse.next();
}

export const config = {
  // Fire the proxy on the homepage, the exhibitions archive, and the
  // opportunities/countries paths. Static assets, /api and /_next are
  // excluded by default.
  matcher: [
    "/",
    "/exhibitions",
    "/exhibitions/:path*",
    "/opportunities/countries/:path*",
  ],
};

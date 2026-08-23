import { NextResponse, type NextRequest } from "next/server";
import {
  opportunityRegionNameBySlug,
  opportunityRegionUrl,
} from "@/lib/opportunityTaxonomy";

export function proxy(request: NextRequest) {
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
  matcher: "/opportunities/countries/:path*",
};

import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { OpportunitiesArchiveView } from "@/components/OpportunitiesArchiveView";
import { OPPORTUNITIES } from "@/data/opportunities";
import { opportunityUrl } from "@/lib/opportunityTaxonomy";

export const metadata: Metadata = {
  title: { absolute: "Art Opportunities, Open Calls & Residencies | FindArt Platform" },
  description:
    "Browse open calls, residencies, grants, awards and other opportunities for artists, curators and cultural practitioners on FindArt Platform.",
  alternates: { canonical: "https://www.findartplatform.com/opportunities" },
};

// Server-rendered index rendered inside the layout but visually hidden.
// Ensures Google / Bingbot receive the full opportunity list in the
// initial HTML — the interactive client shell renders on top after
// hydration. Without this, the client Suspense boundary meant the page
// shipped ~30KB of empty markup for crawlers.
function OpportunitiesSSRIndex() {
  return (
    <div className="sr-only" aria-hidden="true">
      <h1>Art Opportunities, Open Calls & Residencies</h1>
      <p>
        Browse open calls, residencies, grants, awards and other opportunities
        for artists, curators and cultural practitioners.
      </p>
      <ul>
        {OPPORTUNITIES.map((opp) => (
          <li key={opp.slug}>
            <Link href={opportunityUrl(opp)}>
              {opp.title} — {opp.organizer}
              {opp.location ? `, ${opp.location}` : ""}
              {opp.deadline ? ` (deadline ${opp.deadline})` : ""}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function OpportunitiesPage() {
  return (
    <>
      <OpportunitiesSSRIndex />
      <Suspense fallback={null}>
        <OpportunitiesArchiveView />
      </Suspense>
    </>
  );
}

import type { Metadata } from "next";
import { Suspense } from "react";
import { OpportunitiesArchiveView } from "@/components/OpportunitiesArchiveView";

export const metadata: Metadata = {
  title: { absolute: "Opportunities — FindArt Platform" },
  description: "Art opportunities for artists, curators and cultural practitioners.",
  alternates: { canonical: "https://www.findartplatform.com/opportunities" },
};

export default function OpportunitiesPage() {
  return (
    <Suspense fallback={null}>
      <OpportunitiesArchiveView />
    </Suspense>
  );
}

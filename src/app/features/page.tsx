import type { Metadata } from "next";
import { EditorialArchiveView } from "@/components/EditorialArchiveView";
import { editorialArtists } from "@/data/editorial";

const PAGE_URL = "https://www.findartplatform.com/features";

export const metadata: Metadata = {
  title: { absolute: "Featured Contemporary Artists & Curatorial Selections | FindArt" },
  description:
    "In-depth editorial profiles of contemporary artists, grouped by curatorial theme — body, mutation, technology, myth, ritual and more — on FindArt Platform.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    type: "website",
    url: PAGE_URL,
    title: "Featured Contemporary Artists & Curatorial Selections | FindArt",
    description:
      "In-depth editorial profiles of contemporary artists, grouped by curatorial theme.",
  },
  twitter: { card: "summary_large_image" },
};

export default function EditorialPage() {
  return <EditorialArchiveView artists={editorialArtists} />;
}

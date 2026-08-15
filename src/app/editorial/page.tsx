import type { Metadata } from "next";
import { EditorialArchiveView } from "@/components/EditorialArchiveView";
import { editorialArtists } from "@/data/editorial";

const PAGE_URL = "https://www.findartplatform.com/editorial";

export const metadata: Metadata = {
  title: { absolute: "Editorial — FindArt Platform" },
  description: "Editorial profiles of contemporary artists selected by FindArt Platform.",
  alternates: { canonical: PAGE_URL },
};

export default function EditorialPage() {
  return <EditorialArchiveView artists={editorialArtists} />;
}

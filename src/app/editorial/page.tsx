import type { Metadata } from "next";
import { EditorialCard } from "@/components/EditorialCard";
import { Header } from "@/components/Header";
import { editorialArtists } from "@/data/editorial";

const PAGE_URL = "https://www.findartplatform.com/editorial";

export const metadata: Metadata = {
  title: { absolute: "Editorial — FindArt Platform" },
  description: "Editorial profiles of contemporary artists selected by FindArt Platform.",
  alternates: { canonical: PAGE_URL },
};

export default function EditorialPage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-white pt-[65px]">
      <Header />
      <section className="px-5 py-10 md:px-8 md:py-16 lg:px-12 lg:py-20">
        <div className="grid grid-cols-1 gap-x-12 gap-y-14 md:grid-cols-2 md:gap-y-16 lg:grid-cols-3">
          {editorialArtists.map((artist, index) => (
            <EditorialCard key={artist.slug} artist={artist} eager={index === 0} />
          ))}
        </div>
      </section>
    </main>
  );
}

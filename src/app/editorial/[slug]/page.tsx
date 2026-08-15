import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EditorialDetail } from "@/components/EditorialDetail";
import { Header } from "@/components/Header";
import { editorialArtists, getEditorialArtist } from "@/data/editorial";

const SITE_URL = "https://www.findartplatform.com";

type EditorialDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return editorialArtists.map((artist) => ({ slug: artist.slug }));
}

export async function generateMetadata({
  params,
}: EditorialDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const artist = getEditorialArtist(slug);
  if (!artist) return { title: "Editorial" };

  const canonical = `${SITE_URL}/editorial/${artist.slug}`;
  return {
    title: { absolute: `${artist.artistName} — FindArt Editorial` },
    description: artist.excerpt,
    alternates: { canonical },
    openGraph: {
      type: "article",
      url: canonical,
      title: artist.artistName,
      description: artist.excerpt,
      images: [{ url: artist.coverImage.src, alt: artist.artistName }],
    },
  };
}

export default async function EditorialDetailPage({ params }: EditorialDetailPageProps) {
  const { slug } = await params;
  const artist = getEditorialArtist(slug);
  if (!artist) notFound();

  return (
    <main className="min-h-screen overflow-x-hidden bg-white pt-[65px]">
      <Header savedHref="/editorial?saved=1" />
      <EditorialDetail artist={artist} />
    </main>
  );
}

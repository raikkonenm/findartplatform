import type { Metadata } from "next";
import { notFound } from "next/navigation";
import HomePageClient from "../../HomePageClient";
import { SlideOver } from "@/components/SlideOver";
import { ExhibitionDetail } from "@/components/ExhibitionDetail";
import { exhibitions, getExhibition } from "@/data/exhibitions";
import { displayExhibitionTitle } from "@/lib/displayExhibitionTitle";

type DetailPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return exhibitions.map((exhibition) => ({ slug: exhibition.slug }));
}

export async function generateMetadata({ params }: DetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const exhibition = getExhibition(slug);

  return {
    title: exhibition ? displayExhibitionTitle(exhibition.title) : "Exhibition",
    description: exhibition?.description,
  };
}

export default async function ExhibitionDetailPage({ params }: DetailPageProps) {
  const { slug } = await params;
  const exhibition = getExhibition(slug);

  if (!exhibition) {
    notFound();
  }

  return (
    <>
      <HomePageClient initialIsMobile={false} />
      <SlideOver
        label={displayExhibitionTitle(exhibition.title)}
        closeHref="/"
        contentKey={exhibition.slug}
      >
        <ExhibitionDetail exhibition={exhibition} />
      </SlideOver>
    </>
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import HomePage from "../../page";
import { SlideOver } from "@/components/SlideOver";
import { ExhibitionDetail } from "@/components/ExhibitionDetail";
import { exhibitions, getExhibition } from "@/data/exhibitions";

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
    title: exhibition?.title ?? "Exhibition",
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
      <HomePage />
      <SlideOver
        label={exhibition.title}
        closeHref="/"
        contentKey={exhibition.slug}
      >
        <ExhibitionDetail exhibition={exhibition} />
      </SlideOver>
    </>
  );
}

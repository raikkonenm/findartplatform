import { notFound } from "next/navigation";
import { EditorialDetail } from "@/components/EditorialDetail";
import { SlideOver } from "@/components/SlideOver";
import { getEditorialArtist } from "@/data/editorial";

type InterceptedEditorialDetailProps = {
  params: Promise<{ slug: string }>;
};

export default async function InterceptedEditorialDetail({
  params,
}: InterceptedEditorialDetailProps) {
  const { slug } = await params;
  const artist = getEditorialArtist(slug);

  if (!artist) {
    notFound();
  }

  return (
    <SlideOver label={artist.artistName} contentKey={artist.slug}>
      <EditorialDetail artist={artist} />
    </SlideOver>
  );
}

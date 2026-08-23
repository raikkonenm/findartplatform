import type { Metadata } from "next";
import {
  entityMetadata,
  entityStaticParams,
  renderEntityPage,
} from "@/components/EntityPage";

export function generateStaticParams() {
  return entityStaticParams("artist");
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  return entityMetadata({ kind: "artist", slug }) as Metadata;
}

export default async function ArtistPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return renderEntityPage({ kind: "artist", slug });
}

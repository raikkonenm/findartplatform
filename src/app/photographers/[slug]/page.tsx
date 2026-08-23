import type { Metadata } from "next";
import {
  entityMetadata,
  entityStaticParams,
  renderEntityPage,
} from "@/components/EntityPage";

export function generateStaticParams() {
  return entityStaticParams("photographer");
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  return entityMetadata({ kind: "photographer", slug }) as Metadata;
}

export default async function PhotographerPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return renderEntityPage({ kind: "photographer", slug });
}

import type { Metadata } from "next";
import {
  entityMetadata,
  entityStaticParams,
  renderEntityPage,
} from "@/components/EntityPage";

export function generateStaticParams() {
  return entityStaticParams("curator");
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  return entityMetadata({ kind: "curator", slug }) as Metadata;
}

export default async function CuratorPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return renderEntityPage({ kind: "curator", slug });
}

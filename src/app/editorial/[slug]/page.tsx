import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { EditorialSelectionArticle } from "@/components/EditorialSelectionArticle";
import {
  editorialSelections,
  getEditorialSelection,
} from "@/data/editorialSelections";
import { getExhibition } from "@/data/exhibitions";

const SITE_URL = "https://www.findartplatform.com";

export function generateStaticParams() {
  return editorialSelections.map((selection) => ({ slug: selection.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const selection = getEditorialSelection(slug);
  if (!selection) return { title: "Editorial" };

  const canonical = `${SITE_URL}/editorial/${slug}`;
  const cover = getExhibition(selection.coverExhibitionSlug);
  const image =
    cover?.images[selection.coverImageIndex ?? 0]?.src ??
    cover?.coverImage ??
    cover?.previewImage;
  const absoluteImage = image?.startsWith("http") ? image : image ? `${SITE_URL}${image}` : undefined;

  const seoTitle = `${selection.title} | FindArt Platform`;
  const description = selection.subtitle;

  return {
    title: { absolute: seoTitle },
    description,
    alternates: { canonical },
    openGraph: {
      type: "article",
      url: canonical,
      title: seoTitle,
      description,
      images: absoluteImage
        ? [{ url: absoluteImage, alt: `${selection.title} — cover` }]
        : undefined,
      publishedTime: selection.publishedAt,
    },
    twitter: {
      card: "summary_large_image",
      title: seoTitle,
      description,
      images: absoluteImage ? [absoluteImage] : undefined,
    },
  };
}

// Article + BreadcrumbList JSON-LD so Google can render rich results.
function jsonLd(slug: string) {
  const selection = getEditorialSelection(slug)!;
  const canonical = `${SITE_URL}/editorial/${slug}`;
  const cover = getExhibition(selection.coverExhibitionSlug);
  const image =
    cover?.images[selection.coverImageIndex ?? 0]?.src ??
    cover?.coverImage ??
    cover?.previewImage;
  const absoluteImage = image?.startsWith("http") ? image : image ? `${SITE_URL}${image}` : undefined;

  const article = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: selection.title,
    description: selection.subtitle,
    url: canonical,
    datePublished: selection.publishedAt,
    author: { "@type": "Organization", name: "FindArt Platform" },
    publisher: {
      "@type": "Organization",
      name: "FindArt Platform",
      url: SITE_URL,
    },
    image: absoluteImage ? [absoluteImage] : undefined,
    mainEntityOfPage: canonical,
  };

  const breadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: "Editorial", item: `${SITE_URL}/editorial` },
      { "@type": "ListItem", position: 3, name: selection.title, item: canonical },
    ],
  };

  return [article, breadcrumbs];
}

export default async function EditorialArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const selection = getEditorialSelection(slug);
  if (!selection) return notFound();
  const structured = jsonLd(slug);
  return (
    <main className="min-h-screen bg-white pt-[65px] text-neutral-900">
      <Header />
      {structured.map((data, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
        />
      ))}
      <EditorialSelectionArticle selection={selection} />
    </main>
  );
}

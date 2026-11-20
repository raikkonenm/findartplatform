import { notFound } from "next/navigation";
import { SlideOver } from "@/components/SlideOver";
import { EditorialArticleContent } from "@/components/EditorialArticleContent";
import { getEditorialSelection } from "@/data/editorialSelections";

export default async function InterceptedEditorialArticle({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const selection = getEditorialSelection(slug);
  if (!selection) return notFound();
  return <SlideOver label={selection.title} contentKey={selection.slug}>
    <EditorialArticleContent selection={selection} />
  </SlideOver>;
}

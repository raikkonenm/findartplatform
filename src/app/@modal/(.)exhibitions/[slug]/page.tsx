import { notFound } from "next/navigation";
import { SlideOver } from "@/components/SlideOver";
import { ExhibitionDetail } from "@/components/ExhibitionDetail";
import { getExhibition } from "@/data/exhibitions";
import { displayExhibitionTitle } from "@/lib/displayExhibitionTitle";

type InterceptedDetailProps = {
  params: Promise<{ slug: string }>;
};

/**
 * Intercepting route: when the user clicks an exhibition card on the homepage
 * (a client-side navigation to `/exhibitions/[slug]`), Next.js renders THIS
 * file into the root layout's `@modal` slot instead of navigating away. The
 * archive page stays mounted as `children`, so it remains visible behind the
 * slide-over.
 *
 * Direct visits, refreshes, or external links to `/exhibitions/[slug]` bypass
 * the intercept entirely and render the regular page at
 * `src/app/exhibitions/[slug]/page.tsx`.
 */
export default async function InterceptedExhibitionDetail({
  params,
}: InterceptedDetailProps) {
  const { slug } = await params;
  const exhibition = getExhibition(slug);

  if (!exhibition) {
    notFound();
  }

  return (
    <SlideOver label={displayExhibitionTitle(exhibition.title)} contentKey={exhibition.slug}>
      <ExhibitionDetail exhibition={exhibition} preservePanelNavigation />
    </SlideOver>
  );
}

import { editorialSelections, type EditorialSelection } from "@/data/editorialSelections";
import { editorialEssayCredits, type EditorialContributorKind } from "@/data/editorialCredits";
import { getExhibition, type Exhibition } from "@/data/exhibitions";
import { slugifyEntity, splitCuratorString } from "./entitySlugs";

function exhibitionNames(exhibition: Exhibition, kind: EditorialContributorKind): string[] {
  if (kind === "author") return exhibition.exhibitionText ? [exhibition.exhibitionText] : [];
  if (kind === "artist") return exhibition.artists ?? [];
  if (kind === "gallery") return [exhibition.gallery ?? exhibition.venue ?? ""];
  const names = kind === "curator" ? exhibition.curator : exhibition.photographer;
  return names ? splitCuratorString(names) : [];
}

// Derive both directions from documented credits and existing structured
// exhibition references; never infer people from prose or manufacture bios.
export function editorialSelectionsForContributor(kind: EditorialContributorKind, slug: string): EditorialSelection[] {
  return editorialSelections.filter(selection => {
    const matches = (name: string) => slugifyEntity(name) === slug;
    if (selection.kind === "essay" && kind === "author" && matches(selection.author)) return true;
    if (selection.kind === "essay" && kind === "artist" && selection.artistName && matches(selection.artistName)) return true;
    if ((editorialEssayCredits[selection.slug] ?? []).some(credit => credit.entities?.some(entity => entity.kind === kind && matches(entity.name)))) return true;
    if (selection.kind === "artists" && kind === "artist" && selection.selectedArtists.some(artist => matches(artist.artistName))) return true;
    const slugs = selection.kind === "exhibitions" ? selection.exhibitionSlugs
      : selection.kind === "artists" ? selection.selectedArtists.flatMap(artist => artist.featuredExhibitionSlug ? [artist.featuredExhibitionSlug] : [])
      : selection.coverExhibitionSlug ? [selection.coverExhibitionSlug] : [];
    return slugs.some(exhibitionSlug => {
      const exhibition = getExhibition(exhibitionSlug);
      return exhibition && exhibitionNames(exhibition, kind).some(matches);
    });
  }).sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

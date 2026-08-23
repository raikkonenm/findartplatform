import { getExhibition } from "@/data/exhibitions";

// A curated Editorial article that groups existing exhibitions from the
// FindArt database under a shared theme. Everything except the intro
// (title, subtitle, cover image and per-exhibition data) is derived from
// the exhibition entries at render time, so publishing another article
// only requires adding an entry to `editorialSelections` below.
export type EditorialSelection = {
  slug: string;
  // The article H1. Kept editorial rather than SEO-title flavored.
  title: string;
  // Short subtitle displayed under the H1.
  subtitle: string;
  // 100–150 word editorial introduction. Handwritten so we can speak
  // to real cross-cutting ideas rather than glue tags together.
  intro: string;
  // Cover image: pull the visual straight from one of the article's
  // exhibitions so we don't duplicate assets. imageIndex defaults to 0
  // (== the exhibition's previewImage).
  coverExhibitionSlug: string;
  coverImageIndex?: number;
  // Ordered list of exhibition slugs. Every slug must exist in the
  // exhibitions dataset — a missing slug throws at build time (see the
  // validator below) rather than silently rendering an empty section.
  exhibitionSlugs: string[];
  publishedAt: string;         // ISO date, used in Article JSON-LD
  publishedAtDisplay: string;  // Human date shown in the byline row
};

export const editorialSelections: EditorialSelection[] = [
  {
    slug: "contemporary-art-exhibitions-seoul-2026",
    title: "Contemporary Art Exhibitions in Seoul: 2026 Selection",
    subtitle:
      "A selection of exhibitions shaping Seoul's contemporary art landscape in 2026.",
    intro: `Seoul in 2026 reads less like a single scene and more like a set of overlapping currents. A short walk moves you from an institutional post-human survey at Aod Museum to a tight artist-run show at Bangdo, from Adrián Villar Rojas' months-long installation at Art Sonje Center to a duo of sculptors turning a small gallery into a resonance chamber. What links these exhibitions is not a shared aesthetic but a common set of pressures — ecological, digital, historical, embodied — and the sense that the objects and images being made in the city are trying to think through them rather than illustrate them. This selection follows four exhibitions where those pressures surface most clearly: as sound, as decay, as ritual, as bodies made and unmade in space.`,
    coverExhibitionSlug: "tangerine-reverie",
    coverImageIndex: 0,
    exhibitionSlugs: [
      "tangerine-reverie",
      "the-language-of-the-enemy",
      "the-collapse-manual-the-post-human-field",
      "24-preludes-op-34-no-22-in-g-minor-adagio",
    ],
    publishedAt: "2026-08-23",
    publishedAtDisplay: "23 August 2026",
  },
];

export function getEditorialSelection(slug: string): EditorialSelection | undefined {
  return editorialSelections.find((selection) => selection.slug === slug);
}

// Validate at build time — a missing exhibition slug should fail loudly
// rather than render a broken article.
for (const selection of editorialSelections) {
  const missing = selection.exhibitionSlugs.filter((slug) => !getExhibition(slug));
  if (missing.length > 0) {
    throw new Error(
      `Editorial selection "${selection.slug}" references missing exhibitions: ${missing.join(", ")}`,
    );
  }
  if (!getExhibition(selection.coverExhibitionSlug)) {
    throw new Error(
      `Editorial selection "${selection.slug}" has cover exhibition "${selection.coverExhibitionSlug}" which does not exist.`,
    );
  }
}

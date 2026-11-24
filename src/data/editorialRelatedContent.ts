export type EditorialRelatedContentEntry = {
  kind: "editorial" | "exhibition";
  slug: string;
  context: string;
};

// Connections are curated from the existing articles and exhibition texts.
// Keep each selection focused on a few concrete links rather than matching
// every item that shares a broad tag or country.
export const editorialRelatedContent: Record<string, readonly EditorialRelatedContentEntry[]> = {
  "8-funding-calls-international-residencies-for-artists": [
    { kind: "editorial", slug: "6-funded-art-opportunities-november-2026", context: "Further art-and-science, ecological and residency opportunities." },
    { kind: "exhibition", slug: "apis-mellifera-concerto", context: "Residency-based research into bees, sound and artificial intelligence." },
    { kind: "exhibition", slug: "tar-star", context: "Photography, energy and cultural memory through light and material." },
  ],
  "6-funded-open-calls-november-2026": [
    { kind: "editorial", slug: "contemporary-art-exhibitions-paris-2026", context: "Curatorial perspectives on independent galleries and spaces in Paris." },
    { kind: "exhibition", slug: "ethereal-robes-of-vulnerability", context: "Six artists exploring the image through post-photographic practices." },
    { kind: "exhibition", slug: "you-got-what-you-deserved-lena-brudieux-bordeaux-2026", context: "Lena Brudieux brings photography into dialogue with sculptural objects." },
  ],
  "grants-up-to-50000-november-2026": [
    { kind: "editorial", slug: "a-woman-held-josephine-may-bailey", context: "Painting, portraiture and the representation of women in Lucy Cade’s work." },
    { kind: "editorial", slug: "critical-essay-on-kenji-sakai", context: "Abstraction, painting and the development of a studio practice." },
    { kind: "exhibition", slug: "powernap-manor-grunewald", context: "Painted portraits and the pressures of productivity." },
  ],
  "6-funded-art-opportunities-november-2026": [
    { kind: "editorial", slug: "8-funding-calls-international-residencies-for-artists", context: "More support for artistic research, production and international mobility." },
    { kind: "exhibition", slug: "infinite-energy-hack-jung-shirken-malt-house-nyc-2026", context: "Speculative systems linking energy, technology and ecology." },
    { kind: "exhibition", slug: "apis-mellifera-concerto", context: "An artistic residency connecting living systems and artificial intelligence." },
  ],
};

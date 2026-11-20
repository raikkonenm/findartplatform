export type EditorialContributorKind = "author" | "artist" | "curator" | "photographer" | "gallery";

export type EditorialCreditEntity = {
  kind: EditorialContributorKind;
  name: string;
  label?: string;
};

export type EditorialCredit = {
  label: string;
  value: string;
  entities?: EditorialCreditEntity[];
};

// Keep identities separate from article bodies so navigation does not ship
// full essays to the homepage's client-side feed.
export const editorialEssayCredits: Record<string, EditorialCredit[]> = {
  "alpha-omega-and-dandelions-dayneris-brito": [
    { label: "Text", value: "Dayneris Brito", entities: [{ kind: "author", name: "Dayneris Brito" }] },
    { label: "Photography", value: "Anna Iwanczuk", entities: [{ kind: "photographer", name: "Anna Iwanczuk" }] },
    { label: "Courtesy", value: "LAC Collection Jean-Michel Attal", entities: [{ kind: "gallery", name: "LAC Collection Jean-Michel Attal" }] },
    { label: "Exhibition curator", value: "Serge Le Borgne", entities: [{ kind: "curator", name: "Serge Le Borgne" }] },
  ],
  "a-woman-held-josephine-may-bailey": [
    { label: "Text", value: "Joséphine May Bailey", entities: [{ kind: "author", name: "Joséphine May Bailey" }] },
    { label: "Artist", value: "Lucy Cade", entities: [{ kind: "artist", name: "Lucy Cade" }] },
    { label: "Exhibition", value: "CAMEO, Fitzrovia Gallery", entities: [{ kind: "gallery", name: "Fitzrovia Gallery" }] },
    { label: "Curator", value: "Alinda Kring", entities: [{ kind: "curator", name: "Alinda Kring" }] },
    { label: "Photography", value: "Pete Tainsh and Lucy Cade, as credited with each image", entities: [{ kind: "photographer", name: "Pete Tainsh" }, { kind: "photographer", name: "Lucy Cade" }] },
    { label: "Courtesy", value: "The artist and Fitzrovia Gallery", entities: [{ kind: "artist", name: "Lucy Cade", label: "The artist" }, { kind: "gallery", name: "Fitzrovia Gallery" }] },
  ],
  "critical-essay-on-kenji-sakai": [
    { label: "Text", value: "Anna Moss", entities: [{ kind: "author", name: "Anna Moss" }] },
  ],
};

export function allEditorialCreditEntities(): EditorialCreditEntity[] {
  return Object.values(editorialEssayCredits).flatMap(credits => credits.flatMap(credit => credit.entities ?? []));
}

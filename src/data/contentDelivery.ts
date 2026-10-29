// Public editorial metadata only. Bot credentials belong exclusively in the runner environment.
export type DeliveryPerson = {
  name: string;
  latinName?: string;
  instagram?: { handle: string; verified: boolean; source?: string };
};

export type ContentPublication = {
  status: "draft" | "published";
  revision: number;
  language: string;
  artists?: DeliveryPerson[];
  gallery?: DeliveryPerson;
  credits?: Array<{ role: string; people: DeliveryPerson[] }>;
  requiredCredits?: string[];
  excerpt?: string;
  // For a non-English source, an editor must supply and verify the translation.
  translatedExcerpt?: { text: string; sourceText: string; language: "en"; verified: boolean };
  coverOriginalSrc?: string;
  publicUrl?: string;
};

export type Artwork = {
  slug: string;
  title: string;
  artists: DeliveryPerson[];
  description?: string;
  year?: string;
  medium?: string;
  dimensions?: string;
  coverImage: string;
  images: Array<{ src: string; originalSrc?: string }>;
  social: ContentPublication;
};

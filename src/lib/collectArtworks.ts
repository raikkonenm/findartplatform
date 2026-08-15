export type CollectCategory =
  | "Surreal"
  | "Abstract"
  | "Illustration"
  | "Photography"
  | "Painting"
  | "Portrait";

export type CollectArtwork = {
  src: string;
  index: number;
  category: CollectCategory;
  price: number;
};

const ARTWORK_DETAILS: Array<{ category: CollectCategory; price: number }> = [
  { category: "Painting", price: 75 },
  { category: "Abstract", price: 450 },
  { category: "Illustration", price: 1400 },
  { category: "Photography", price: 90 },
  { category: "Portrait", price: 800 },
  { category: "Surreal", price: 1800 },
];

export function buildCollectArtworks(images: string[]): CollectArtwork[] {
  return images.map((src, index) => ({
    src,
    index,
    ...ARTWORK_DETAILS[index % ARTWORK_DETAILS.length],
  }));
}

export function artworkSavedKey(src: string): string {
  return `artwork:${src}`;
}

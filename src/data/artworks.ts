import type { Artwork } from "./contentDelivery";

// Collect currently scans public/example without artwork metadata. Opt in actual
// catalogued works here; do not infer artists/titles from example filenames.
// Each published artwork must specify its actual existing social.publicUrl.
export const artworks: Artwork[] = [];

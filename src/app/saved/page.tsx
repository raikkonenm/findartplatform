import type { Metadata } from "next";
import { readdirSync } from "node:fs";
import path from "node:path";
import { SavedArchiveView } from "@/components/SavedArchiveView";
import { editorialArtists } from "@/data/editorial";
import { exhibitions } from "@/data/exhibitions";

const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp"]);

export const metadata: Metadata = {
  title: { absolute: "Saved — FindArt Platform" },
  description: "Your saved exhibitions, editorial profiles and artworks.",
  robots: { index: false, follow: false },
};

function collectArtworkImages() {
  const directory = path.join(process.cwd(), "public", "example");
  return readdirSync(directory)
    .filter((filename) => IMAGE_EXTENSIONS.has(path.extname(filename).toLowerCase()))
    .sort((left, right) => left.localeCompare(right, undefined, { numeric: true }))
    .map((filename) => `/example/${encodeURIComponent(filename)}`);
}

export default function SavedPage() {
  return (
    <SavedArchiveView
      exhibitions={exhibitions}
      artists={editorialArtists}
      artworkImages={collectArtworkImages()}
    />
  );
}

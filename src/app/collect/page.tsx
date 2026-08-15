import type { Metadata } from "next";
import { readdirSync } from "node:fs";
import path from "node:path";
import { CollectArchiveView } from "@/components/CollectArchiveView";

const COLLECT_URL = "https://www.findartplatform.com/collect";
const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp"]);

export const metadata: Metadata = {
  title: { absolute: "Collect — FindArt Platform" },
  description: "Selected artworks available through FindArt Platform.",
  alternates: { canonical: COLLECT_URL },
};

function collectImages() {
  const directory = path.join(process.cwd(), "public", "example");
  return readdirSync(directory)
    .filter((filename) => IMAGE_EXTENSIONS.has(path.extname(filename).toLowerCase()))
    .sort((left, right) => left.localeCompare(right, undefined, { numeric: true }))
    .map((filename) => `/example/${encodeURIComponent(filename)}`);
}

export default function CollectPage() {
  const images = collectImages();
  return <CollectArchiveView images={images} />;
}

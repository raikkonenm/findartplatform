import type { Metadata } from "next";
import { DirectoryArchiveView } from "@/components/DirectoryArchiveView";

export const metadata: Metadata = {
  title: "Index — FindArt Platform",
  description:
    "Discover how artists, galleries and institutions present their work online.",
};

export default function DirectoryPage() {
  return <DirectoryArchiveView />;
}

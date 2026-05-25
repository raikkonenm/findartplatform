import type { Metadata } from "next";
import { ExhibitionsArchiveView } from "@/components/ExhibitionsArchiveView";
import { exhibitions } from "@/data/exhibitions";

export const metadata: Metadata = {
  title: "Exhibitions",
};

export default function ExhibitionsPage() {
  return <ExhibitionsArchiveView exhibitions={exhibitions} />;
}

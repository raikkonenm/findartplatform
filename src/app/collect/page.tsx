import type { Metadata } from "next";
import Image from "next/image";
import { readdirSync } from "node:fs";
import path from "node:path";
import { Header } from "@/components/Header";

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

  return (
    <main className="min-h-screen overflow-x-hidden bg-white pt-[65px]">
      <Header />
      <section
        aria-label="Collect artworks"
        className="mx-auto max-w-[1560px] columns-1 gap-3 px-5 pb-20 pt-6 sm:columns-2 md:px-8 md:pt-8 lg:columns-4"
      >
        {images.map((src, index) => (
          <article
            key={src}
            tabIndex={0}
            aria-label={`Name by Chungkook Lee, artwork ${index + 1}`}
            className="group relative mb-3 break-inside-avoid overflow-hidden bg-neutral-100 outline-none"
          >
            <Image
              src={src}
              alt={`Name by Chungkook Lee, artwork ${index + 1}`}
              width={1080}
              height={1350}
              unoptimized
              sizes="(min-width: 1024px) 24vw, (min-width: 640px) 47vw, 100vw"
              className="block h-auto w-full"
            />
            <div className="absolute inset-x-0 bottom-0 translate-y-3 bg-black/90 px-4 py-4 text-white opacity-0 transition-[opacity,transform] duration-300 ease-out group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100 md:px-5 md:py-5">
              <p className="text-[18px] leading-tight md:text-[20px]">Name</p>
              <p className="mt-3 text-[11px] font-medium uppercase tracking-[0.18em]">
                CHUNKOOK LEE
              </p>
              <p className="mt-1 text-[12px] tracking-[0.05em] text-white/80">
                Price by request
              </p>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}

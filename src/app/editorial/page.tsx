import type { Metadata } from "next";
import Image from "next/image";
import { Header } from "@/components/Header";

const PAGE_URL = "https://www.findartplatform.com/editorial";
const PAGE_TITLE = "Editorial — Contemporary Art Writing, Criticism & Curatorial Perspectives";
const PAGE_DESCRIPTION =
  "Independent writing, criticism, research and curatorial perspectives on contemporary art. Contribute proposals for essays, interviews, exhibition texts and other editorial formats.";

export const metadata: Metadata = {
  title: { absolute: PAGE_TITLE },
  description: PAGE_DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    type: "website",
    url: PAGE_URL,
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
  },
};

export default function EditorialPage() {
  return (
    <main className="min-h-screen bg-white pt-[65px] text-neutral-900">
      <Header />
      <section className="px-5 pb-24 pt-14 md:px-8 md:pb-32 md:pt-20 lg:px-12">
        <div className="grid grid-cols-1 items-start gap-12 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] md:gap-16 lg:gap-24">
          <div>
            <h1 className="editorial-serif break-words text-[clamp(1.6rem,4.5vw,3rem)] leading-[1.05] tracking-[-0.02em]">
              Independent writing, criticism, research and curatorial perspectives on contemporary art.
            </h1>

            <div className="mt-10 border-t border-neutral-200 pt-8 md:mt-14 md:pt-10">
              <a
                href="/contribute"
                className="inline-flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.22em] text-neutral-900 transition-opacity hover:opacity-60"
              >
                Contribute to FindArt <span aria-hidden="true">↗</span>
              </a>
              <p className="mt-4 max-w-2xl text-[15px] leading-[1.6] text-neutral-700 md:text-[16px]">
                We welcome proposals for essays, interviews, exhibition texts, research and other editorial formats.
              </p>
            </div>
          </div>

          <div className="relative aspect-[4/5] w-full overflow-hidden bg-neutral-100">
            <Image
              src="/editorial1/1.webp"
              alt="Editorial"
              fill
              sizes="(min-width: 768px) 40vw, 100vw"
              className="object-cover"
              priority
            />
          </div>
        </div>
      </section>
    </main>
  );
}

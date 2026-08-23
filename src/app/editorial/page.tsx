import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/Header";
import { editorialSelections, getEditorialSelectionCoverImage } from "@/data/editorialSelections";

const PAGE_URL = "https://www.findartplatform.com/editorial";
const PAGE_TITLE = "Editorial — Contemporary Art Writing, Criticism & Curatorial Perspectives";
const PAGE_DESCRIPTION =
  "Curated selections, criticism and research on contemporary art from FindArt Platform. Independent writing built from real exhibitions in the FindArt archive.";

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
  const selections = editorialSelections.slice().sort((a, b) =>
    b.publishedAt.localeCompare(a.publishedAt),
  );

  return (
    <main className="min-h-screen bg-white pt-[65px] text-neutral-900">
      <Header />
      <section className="px-5 pb-24 pt-14 md:px-8 md:pb-32 md:pt-20 lg:px-12">
        <div className="mx-auto max-w-[1400px]">
          <h1 className="editorial-serif break-words text-[clamp(1.6rem,4.5vw,3rem)] leading-[1.05] tracking-[-0.02em]">
            Independent writing, criticism, research and curatorial perspectives on contemporary art.
          </h1>

          <div className="mt-10 max-w-3xl border-t border-neutral-200 pt-8 md:mt-14 md:pt-10">
            <a
              href="/contribute"
              className="inline-flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.22em] text-neutral-900 transition-opacity hover:opacity-60"
            >
              Contribute to FindArt <span aria-hidden="true">↗</span>
            </a>
            <p className="mt-4 text-[15px] leading-[1.6] text-neutral-700 md:text-[16px]">
              We welcome proposals for essays, interviews, exhibition texts, research and other editorial formats.
            </p>
          </div>

          {selections.length > 0 && (
            <div className="mt-16 md:mt-24">
              <p className="text-[10px] uppercase tracking-[0.28em] text-neutral-500">
                Curated selections
              </p>
              <ul className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 sm:gap-x-6 md:gap-x-8 md:gap-y-14 lg:grid-cols-4">
                {selections.map((selection) => {
                  const image = getEditorialSelectionCoverImage(selection);
                  if (!image) return null;
                  return (
                    <li key={selection.slug} className="min-w-0">
                      <Link
                        href={`/editorial/${selection.slug}`}
                        className="group block"
                      >
                        <div className="relative aspect-[4/5] w-full overflow-hidden bg-neutral-100">
                          <Image
                            src={image}
                            alt={`${selection.title} — cover image`}
                            fill
                            sizes="(min-width: 1024px) 22vw, (min-width: 640px) 30vw, 48vw"
                            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02]"
                          />
                        </div>
                        <p className="mt-3 text-[10px] uppercase tracking-[0.22em] text-neutral-500">
                          Editorial
                        </p>
                        <h2 className="editorial-serif mt-2 break-words text-[clamp(0.95rem,1.7vw,1.2rem)] leading-[1.15] tracking-[-0.02em]">
                          {selection.title}
                        </h2>
                        <p className="mt-2 text-[12.5px] leading-[1.5] text-neutral-600">
                          {selection.subtitle}
                        </p>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

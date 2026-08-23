import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/Header";
import { editorialSelections } from "@/data/editorialSelections";
import { getExhibition } from "@/data/exhibitions";

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
              <ul className="mt-8 grid grid-cols-1 gap-x-10 gap-y-16 md:grid-cols-2 md:gap-x-16">
                {selections.map((selection) => {
                  const cover = getExhibition(selection.coverExhibitionSlug);
                  const image =
                    cover?.images[selection.coverImageIndex ?? 0]?.src ??
                    cover?.coverImage ??
                    cover?.previewImage;
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
                            sizes="(min-width: 1024px) 40vw, (min-width: 768px) 50vw, 100vw"
                            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02]"
                          />
                        </div>
                        <p className="mt-5 text-[10px] uppercase tracking-[0.24em] text-neutral-500">
                          Selection · {selection.publishedAtDisplay}
                        </p>
                        <h2 className="editorial-serif mt-3 break-words text-[clamp(1.3rem,3vw,2rem)] leading-[1.05] tracking-[-0.02em]">
                          {selection.title}
                        </h2>
                        <p className="mt-3 text-[14px] leading-[1.6] text-neutral-700 md:text-[15px]">
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

import type { Metadata } from "next";
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
        <div className="mx-auto max-w-3xl">
          <h1 className="editorial-serif break-words text-[clamp(1.6rem,4.5vw,3rem)] leading-[1.05] tracking-[-0.02em]">
            Independent writing, criticism, research and curatorial perspectives on contemporary art.
          </h1>

          <div className="mt-10 border-t border-neutral-200 pt-8 md:mt-14 md:pt-10">
            <a
              href="mailto:hello@findartplatform.com?subject=Editorial%20proposal"
              className="inline-flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.22em] text-neutral-900 transition-opacity hover:opacity-60"
            >
              Contribute to FindArt <span aria-hidden="true">↗</span>
            </a>
            <p className="mt-4 max-w-2xl text-[15px] leading-[1.6] text-neutral-700 md:text-[16px]">
              We welcome proposals for essays, interviews, exhibition texts, research and other editorial formats.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-6 md:mt-24 md:grid-cols-2 md:gap-8">
            {[0, 1].map((placeholder) => (
              <article
                key={placeholder}
                className="flex aspect-[4/5] flex-col justify-end border border-neutral-200 bg-neutral-50 p-6 text-neutral-500 md:p-8"
              >
                <span className="text-[10px] font-semibold uppercase tracking-[0.28em] text-neutral-400">
                  Coming soon
                </span>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";

export const metadata: Metadata = {
  title: "About",
};

// Renders the About page. Layout mirrors the left-hand text block on the
// Submit page so the typography and white-background aesthetic stay
// consistent with the rest of the site.
export default function AboutPage() {
  return (
    <main className="relative min-h-screen overflow-x-hidden bg-white pt-[95px] md:pt-[105px]">
      <Header />

      <section className="px-5 pb-24 md:px-8 lg:px-12">
        <div className="lg:max-w-[52%] xl:max-w-[46rem]">
          <p className="text-[10px] uppercase tracking-[0.3em] text-neutral-500">
            FindArt Platform
          </p>
          <h1 className="editorial-serif mt-6 break-words text-[clamp(2.75rem,13vw,5.3rem)] leading-[0.94] tracking-[-0.055em] md:text-[clamp(3.1rem,5vw,5.3rem)]">
            About
          </h1>

          <div className="mt-8 space-y-6 max-w-md text-[1.05rem] leading-8 text-neutral-600">
            <p>
              FindArt Platform is a contemporary art exhibition archive founded by Maria
              Raikkonen and developed as part of Art Curatorial Nomads &mdash; a curatorial
              initiative exploring contemporary art practices across borders.
            </p>
            <p>
              FindArt documents exhibitions from galleries, institutions, and independent
              spaces worldwide, creating an evolving and searchable archive of contemporary
              artistic and curatorial practices used by curators, collectors, artists,
              galleries, and art professionals internationally.
            </p>
            <p>
              Through open submissions and ongoing editorial research, the archive maps both
              emerging and established art scenes beyond geographic and institutional
              centers.
            </p>
            <p>
              FindArt is part of the broader Art Curatorial Nomads ecosystem, which also
              includes Practice &mdash; a curatorial support initiative for artists and
              cultural practitioners.
            </p>
          </div>

          <div className="mt-10 space-y-2 text-[15px] leading-8 text-neutral-700">
            <p>
              For submissions, visit{" "}
              <Link
                href="/submit"
                className="text-neutral-900 underline decoration-neutral-300 underline-offset-4 transition-opacity hover:opacity-55"
              >
                Submit
              </Link>
              .
            </p>
            <p>
              For inquiries, contact{" "}
              <a
                href="mailto:artnomads@gmail.com"
                className="text-neutral-900 underline decoration-neutral-300 underline-offset-4 transition-opacity hover:opacity-55"
              >
                artnomads@gmail.com
              </a>
            </p>
          </div>

          <div className="mt-14 border-t border-neutral-200 pt-8">
            <p className="text-[10px] uppercase tracking-[0.28em] text-neutral-500">
              Follow
            </p>
            <ul className="mt-5 space-y-3 text-[15px] leading-7 text-neutral-800">
              <li>
                <a
                  href="https://www.instagram.com/findart.platform/"
                  target="_blank"
                  rel="noreferrer"
                  className="transition-opacity hover:opacity-55"
                >
                  FindArt Instagram &#8599;
                </a>
              </li>
              <li>
                <a
                  href="https://www.instagram.com/artnomads/"
                  target="_blank"
                  rel="noreferrer"
                  className="transition-opacity hover:opacity-55"
                >
                  Art Curatorial Nomads Instagram &#8599;
                </a>
              </li>
              <li>
                <a
                  href="https://www.artcnomad.com/"
                  target="_blank"
                  rel="noreferrer"
                  className="transition-opacity hover:opacity-55"
                >
                  Art Curatorial Nomads website &#8599;
                </a>
              </li>
              <li>
                <a
                  href="https://www.artcnomad.com/practice"
                  target="_blank"
                  rel="noreferrer"
                  className="transition-opacity hover:opacity-55"
                >
                  Practice &#8599;
                </a>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}

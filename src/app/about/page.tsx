import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";

const ABOUT_TITLE = "About — FindArt Platform";
const ABOUT_DESCRIPTION =
  "FindArt Platform is an independent contemporary art platform founded by Maria Raikkonen and developed as part of Art Curatorial Nomads — exhibitions, opportunities, editorial features, and an expanding index of contemporary art.";
const ABOUT_URL = "https://www.findartplatform.com/about";

export const metadata: Metadata = {
  title: { absolute: ABOUT_TITLE },
  description: ABOUT_DESCRIPTION,
  alternates: { canonical: ABOUT_URL },
  openGraph: {
    type: "website",
    url: ABOUT_URL,
    title: ABOUT_TITLE,
    description: ABOUT_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: ABOUT_TITLE,
    description: ABOUT_DESCRIPTION,
  },
};

// Renders the About page. Layout mirrors the left-hand text block on the
// Submit page so the typography and white-background aesthetic stay
// consistent with the rest of the site.
export default function AboutPage() {
  return (
    <main className="relative min-h-screen overflow-x-hidden bg-white pt-[95px] md:pt-[105px]">
      <Header />

      <section className="px-5 pb-24 md:px-8 lg:px-12">
        {/* Main text block — centered, ~640px reading column. The heading and
            body paragraphs share one centered container; contact + social
            links stay in their own left-aligned column below. */}
        <div className="mx-auto max-w-[640px]">
          <p className="text-[10px] uppercase tracking-[0.3em] text-neutral-500">
            FindArt Platform
          </p>
          <h1 className="editorial-serif mt-6 break-words text-[clamp(2.75rem,13vw,5.3rem)] leading-[0.94] tracking-[-0.055em] md:text-[clamp(3.1rem,5vw,5.3rem)]">
            About
          </h1>

          <div className="mt-8 space-y-6 text-[1.05rem] leading-8 text-neutral-600">
            <p>
              FindArt Platform is an independent contemporary art platform founded by{" "}
              <a
                href="https://www.instagram.com/raikkonen_maria/"
                target="_blank"
                rel="noreferrer"
                className="underline decoration-1 decoration-neutral-400 underline-offset-4 transition-opacity hover:opacity-55"
              >
                Maria Raikkonen
              </a>{" "}
              and developed as part of{" "}
              <a
                href="https://www.artcnomad.com/"
                target="_blank"
                rel="noreferrer"
                className="underline decoration-1 decoration-neutral-400 underline-offset-4 transition-opacity hover:opacity-55"
              >
                Art Curatorial Nomads
              </a>{" "}
              &mdash; a curatorial initiative exploring contemporary art practices across
              borders.
            </p>
            <p>
              Bringing together exhibitions, opportunities, editorial features, and an
              expanding index, FindArt operates as both a living archive and a tool for
              discovering contemporary art. The platform connects artistic and curatorial
              practices across galleries, institutions, independent spaces, and emerging
              contexts worldwide.
            </p>
            <p>
              Rather than focusing on a single geography or institutional network, FindArt
              traces connections across different art scenes, making practices, projects,
              and resources easier to find, navigate, and revisit.
            </p>
            <p>
              Content is developed through ongoing editorial research and open submissions,
              allowing the platform to document what has happened, follow what is happening
              now, and make visible what is emerging next.
            </p>
            <p>
              For submissions, visit{" "}
              <Link
                href="/submit"
                className="font-semibold text-neutral-900 underline decoration-neutral-300 underline-offset-4 transition-opacity hover:opacity-55"
              >
                Submit
              </Link>
              .
            </p>
          </div>
        </div>

        {/* Follow — kept left-aligned per spec. Width mirrors the previous
            About-page column so the rhythm stays consistent. */}
        <div className="mt-12 lg:max-w-[52%] xl:max-w-[46rem]">

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
                  href="https://www.instagram.com/artcnomads/"
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

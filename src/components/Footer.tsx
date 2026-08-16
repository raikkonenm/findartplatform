import Link from "next/link";

const footerLinkClass =
  "text-[10px] uppercase tracking-[0.18em] transition-opacity hover:opacity-55";

export function Footer() {
  return (
    <footer className="border-t border-neutral-200 bg-white px-5 py-10 text-neutral-900 md:px-8 md:py-12 lg:px-12">
      <div className="grid grid-cols-1 gap-x-12 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="mb-5 text-[11px] font-semibold uppercase tracking-[0.2em]">
            FindArt Platform
          </p>
          <nav
            aria-label="Footer navigation"
            className="flex flex-col items-start gap-3"
          >
            <a
              href="https://www.artcnomad.com/"
              className={footerLinkClass}
            >
              By ArtNomad Curators &#8599;
            </a>
            <Link href="/about" className={footerLinkClass}>
              About
            </Link>
            <Link href="/" className={footerLinkClass}>
              Explore
            </Link>
            <Link href="/collect" className={footerLinkClass}>
              Collect
            </Link>
            <Link href="/exhibitions" className={footerLinkClass}>
              Exhibitions
            </Link>
            <Link href="/opportunities" className={footerLinkClass}>
              Opportunities
            </Link>
            <Link href="/editorial" className={footerLinkClass}>
              Editorial
            </Link>
            <button type="button" className={footerLinkClass}>
              Media
            </button>
          </nav>
        </div>

        <div>
          <p className="mb-5 text-[11px] font-semibold uppercase tracking-[0.2em]">
            Submit
          </p>
          <div className="flex flex-col items-start gap-3">
            <button type="button" className={footerLinkClass}>
              Submit exhibition
            </button>
            <button type="button" className={footerLinkClass}>
              Submit as an Artist
            </button>
            <button type="button" className={footerLinkClass}>
              Submit article
            </button>
            <button type="button" className={footerLinkClass}>
              Submit Opportunities
            </button>
          </div>
        </div>

        <div>
          <p className="mb-5 text-[11px] font-semibold uppercase tracking-[0.2em]">
            Sell
          </p>
          <button type="button" className={footerLinkClass}>
            Sell your art
          </button>
        </div>

        <div>
          <p className="mb-5 text-[11px] font-semibold uppercase tracking-[0.2em]">
            Collectors
          </p>
          <a
            href="https://findartplatform-j31a400t3-maria-raikkonen-s-projects.vercel.app/collect"
            className={footerLinkClass}
          >
            Start collect art
          </a>
        </div>
      </div>
    </footer>
  );
}

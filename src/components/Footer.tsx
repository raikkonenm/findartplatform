import Link from "next/link";
import { SHOW_COLLECT_NAV } from "@/lib/navFlags";

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
            {SHOW_COLLECT_NAV && (
              <Link href="/collect" className={footerLinkClass}>
                Collect
              </Link>
            )}
            <Link href="/exhibitions" className={footerLinkClass}>
              Exhibitions
            </Link>
            <Link href="/opportunities" className={footerLinkClass}>
              Opportunities
            </Link>
            <Link href="/editorial" className={footerLinkClass}>
              Editorial
            </Link>
          </nav>
        </div>

        <div>
          <p className="mb-5 text-[11px] font-semibold uppercase tracking-[0.2em]">
            Submit
          </p>
          <div className="flex flex-col items-start gap-3">
            <Link href="/submit?type=exhibition" className={footerLinkClass}>
              Submit exhibition
            </Link>
            <Link href="/submit?type=artist" className={footerLinkClass}>
              Submit as an Artist
            </Link>
            <Link href="/contribute" className={footerLinkClass}>
              Submit article
            </Link>
            <Link href="/submit-opportunities" className={footerLinkClass}>
              Submit Opportunities
            </Link>
            <Link href="/submit?type=index" className={footerLinkClass}>
              Submit a Website
            </Link>
          </div>
        </div>

        <div>
          <p className="mb-5 text-[11px] font-semibold uppercase tracking-[0.2em]">
            Digital Products
          </p>
          <a
            href="https://www.artcnomad.com/workflow-art"
            className={footerLinkClass}
          >
            Workflow.Art &#8599;
          </a>
        </div>

        <div>
          <p className="mb-5 text-[11px] font-semibold uppercase tracking-[0.2em]">
            Follow us
          </p>
          <div className="flex flex-col items-start gap-3">
            <a
              href="https://www.instagram.com/findart.platform/"
              className={footerLinkClass}
            >
              FindArt Platform Instagram &#8599;
            </a>
            <a
              href="https://www.instagram.com/artcnomads/"
              className={footerLinkClass}
            >
              Artcnomads Instagram &#8599;
            </a>
          </div>
        </div>

        <div>
          <p className="mb-5 text-[11px] font-semibold uppercase tracking-[0.2em]">
            Advertising
          </p>
          <Link href="/contact?topic=advertising" className={footerLinkClass}>
            Advertise with us
          </Link>
        </div>

        <div>
          <p className="mb-5 text-[11px] font-semibold uppercase tracking-[0.2em]">
            Inquiries
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-neutral-900 transition-opacity hover:opacity-55"
          >
            Contact us <span aria-hidden="true">&#8599;</span>
          </Link>
        </div>
      </div>
    </footer>
  );
}

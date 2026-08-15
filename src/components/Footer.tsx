import Link from "next/link";

const SUBMIT_URL =
  "https://findartplatform-py12krbc6-maria-raikkonen-s-projects.vercel.app/submit";

export function Footer() {
  return (
    <footer className="border-t border-neutral-200 bg-white px-5 py-10 text-neutral-900 md:px-8 md:py-12 lg:px-12">
      <div className="grid grid-cols-1 gap-x-10 gap-y-9 sm:grid-cols-2 lg:grid-cols-4">
        <nav
          aria-label="Footer navigation"
          className="flex flex-col items-start gap-3 text-[11px] uppercase tracking-[0.22em]"
        >
          <Link href="/about" className="transition-opacity hover:opacity-55">
            About
          </Link>
          <a
            href="https://www.artcnomad.com/workflow-art"
            className="transition-opacity hover:opacity-55"
          >
            Workflow.Art &#8599;
          </a>
          <a
            href="https://www.artcnomad.com/"
            className="transition-opacity hover:opacity-55"
          >
            By ArtNomad Curators &#8599;
          </a>
        </nav>

        <div>
          <p className="text-[9px] uppercase tracking-[0.24em] text-neutral-400">
            Follow us
          </p>
          <a
            href="https://www.instagram.com/findart.platform/"
            className="mt-3 inline-block text-[11px] uppercase tracking-[0.22em] transition-opacity hover:opacity-55"
          >
            Instagram &#8599;
          </a>
        </div>

        <p className="text-[13px] leading-6 text-neutral-600">
          Inquires: {" "}
          <a
            href="mailto:raikkonenmaria7@gmail.com"
            className="text-neutral-900 transition-opacity hover:opacity-55"
          >
            raikkonenmaria7@gmail.com
          </a>
        </p>

        <p className="text-[13px] leading-6 text-neutral-600 lg:text-right">
          For submissions {" "}
          <a
            href={SUBMIT_URL}
            className="font-semibold text-neutral-900 transition-opacity hover:opacity-55"
          >
            visit here
          </a>
          .
        </p>
      </div>
    </footer>
  );
}

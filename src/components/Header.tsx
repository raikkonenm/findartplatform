import Image from "next/image";
import Link from "next/link";
import { SHOW_PRACTICE_NAV } from "@/lib/navFlags";
import { HeartIcon } from "./SavedExhibitions";
import { MobileNavigationMenu } from "./MobileNavigationMenu";

type HeaderProps = {
  overlay?: boolean;
  savedOnly?: boolean;
  onToggleSavedOnly?: () => void;
};

export function Header({ overlay = false, savedOnly = false, onToggleSavedOnly }: HeaderProps) {
  return (
    <header
      className={`${overlay ? "absolute z-20" : "fixed z-50"} inset-x-0 top-0 h-[65px] px-4 md:px-8 lg:px-12 ${
        overlay
          ? "text-[8px] uppercase tracking-[0.14em] text-white md:text-[11px] md:tracking-[0.28em]"
          : "border-b border-neutral-200 bg-white"
      }`}
    >
      <nav
        className="relative flex h-full items-center justify-between md:grid md:grid-cols-[1fr_auto_1fr] md:gap-8"
        aria-label="Primary navigation"
      >
        <MobileNavigationMenu inverted={overlay} />
        <div
          className={`hidden max-w-[5.3rem] flex-col items-start gap-1 leading-[1.35] md:flex md:max-w-none md:flex-row md:items-center md:gap-7 ${
            overlay ? "" : "text-[8px] uppercase tracking-[0.14em] text-neutral-900 md:text-[11px] md:tracking-[0.28em]"
          }`}
        >
          <a href="https://www.artcnomad.com/">By ArtNomad Curators &#8599;</a>
          <a href="https://www.artcnomad.com/workflow-art">Workflow.Art &#8599;</a>
          {SHOW_PRACTICE_NAV && (
            <a href="https://www.artcnomad.com/practice">Practice &#8599;</a>
          )}
        </div>

        {overlay ? (
          <Link
            href="/"
            className="justify-self-center transition-opacity hover:opacity-55"
            aria-label="FindArt Platform home"
          >
            <Image
              src="/exhibitions/logo.png"
              alt="FindArt Platform logo"
              width={72}
              height={72}
              className="h-10 w-10 object-contain md:h-16 md:w-16"
              priority
            />
          </Link>
        ) : (
          <Link
            href="/"
            className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap text-[13px] font-medium tracking-tight text-neutral-900 transition-opacity hover:opacity-55 md:static md:translate-x-0 md:justify-self-center md:text-2xl"
            aria-label="FindArt Platform home"
          >
            FindArt Platform
          </Link>
        )}

        <div className="flex items-center gap-3 justify-self-end md:gap-5">
          <Link
            href="/editorial"
            className={`hidden transition-opacity hover:opacity-55 md:inline ${
              overlay ? "font-normal" : "text-[9px] font-normal uppercase tracking-[0.16em] text-neutral-900 md:text-[11px] md:tracking-[0.28em]"
            }`}
          >
            Editorial
          </Link>
          <Link
            href="/about"
            className={`hidden transition-opacity hover:opacity-55 md:inline ${
              overlay ? "font-normal" : "text-[9px] font-normal uppercase tracking-[0.16em] text-neutral-900 md:text-[11px] md:tracking-[0.28em]"
            }`}
          >
            About
          </Link>
          <a
            href="https://www.instagram.com/findart.platform/"
            className={`hidden transition-opacity hover:opacity-55 md:inline ${
              overlay ? "font-normal" : "text-[9px] font-normal uppercase tracking-[0.16em] text-neutral-900 md:text-[11px] md:tracking-[0.28em]"
            }`}
          >
            Instagram
          </a>
          <Link
            href="/submit"
            className={`transition-opacity hover:opacity-55 ${
              overlay ? "font-semibold" : "text-[9px] font-semibold uppercase tracking-[0.16em] text-neutral-900 md:text-[11px] md:tracking-[0.28em]"
            }`}
          >
            Submit
          </Link>
          {onToggleSavedOnly && !overlay && (
            <button
              type="button"
              aria-label={savedOnly ? "Show all exhibitions" : "Show saved exhibitions only"}
              aria-pressed={savedOnly}
              onClick={onToggleSavedOnly}
              className="text-neutral-900 transition-opacity hover:opacity-55 focus-visible:outline-none"
            >
              <HeartIcon filled={savedOnly} className="h-4 w-4" />
            </button>
          )}
        </div>
      </nav>
    </header>
  );
}

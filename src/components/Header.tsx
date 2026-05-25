import Image from "next/image";
import Link from "next/link";
import { HeartIcon } from "./SavedExhibitions";

type HeaderProps = {
  overlay?: boolean;
  savedOnly?: boolean;
  onToggleSavedOnly?: () => void;
};

export function Header({ overlay = false, savedOnly = false, onToggleSavedOnly }: HeaderProps) {
  return (
    <header
      className={`${overlay ? "absolute z-20" : "fixed z-50"} inset-x-0 top-0 px-5 sm:px-8 lg:px-12 ${
        overlay
          ? "py-7 text-[9px] uppercase tracking-[0.18em] text-white sm:text-[11px] sm:tracking-[0.28em]"
          : "border-b border-neutral-200 bg-white py-4"
      }`}
    >
      <nav
        className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-8"
        aria-label="Primary navigation"
      >
        <div
          className={`flex items-center gap-7 justify-self-start ${
            overlay ? "" : "text-[11px] uppercase tracking-[0.28em] text-neutral-900"
          }`}
        >
          <span>By ArtNomad Curators &#8599;</span>
          <span>Practice &#8599;</span>
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
              className="h-12 w-12 object-contain sm:h-16 sm:w-16"
              priority
            />
          </Link>
        ) : (
          <Link
            href="/"
            className="justify-self-center text-2xl font-medium tracking-tight text-neutral-900 transition-opacity hover:opacity-55"
            aria-label="FindArt Platform home"
          >
            FindArt Platform
          </Link>
        )}

        <div className="flex items-center gap-5 justify-self-end">
          <Link
            href="/submit"
            className={`transition-opacity hover:opacity-55 ${
              overlay ? "" : "text-[11px] uppercase tracking-[0.28em] text-neutral-900"
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

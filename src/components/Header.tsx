import Link from "next/link";
import { HeartIcon } from "./SavedExhibitions";
import { MobileNavigationMenu } from "./MobileNavigationMenu";
import { ThemeToggleButton } from "./ThemeToggleButton";

type HeaderProps = {
  overlay?: boolean;
  savedOnly?: boolean;
  onToggleSavedOnly?: () => void;
  savedHref?: string;
};

export function Header({
  overlay = false,
  savedOnly = false,
  onToggleSavedOnly,
  savedHref = "/?saved=1",
}: HeaderProps) {
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
        <Link
          href="/"
          className={`absolute left-1/2 -translate-x-1/2 whitespace-nowrap text-[13px] font-medium tracking-tight transition-opacity hover:opacity-55 md:static md:translate-x-0 md:justify-self-start md:text-xl ${
            overlay ? "text-white" : "text-neutral-900"
          }`}
          aria-label="FindArt Platform home"
        >
          FindArt Platform
        </Link>

        <div
          className={`hidden items-center gap-5 uppercase md:flex md:justify-self-center ${
            overlay
              ? "font-normal"
              : "text-[11px] font-normal tracking-[0.28em] text-neutral-900"
          }`}
        >
          <Link href="/" className="transition-opacity hover:opacity-55">
            Exhibitions
          </Link>
          <Link href="/editorial" className="transition-opacity hover:opacity-55">
            Editorial
          </Link>
          <Link href="/submit" className="font-semibold transition-opacity hover:opacity-55">
            Submit
          </Link>
        </div>

        <div className="flex items-center gap-3 justify-self-end md:gap-5">
          <a
            href="https://www.instagram.com/findart.platform/"
            className={`hidden uppercase transition-opacity hover:opacity-55 md:inline ${
              overlay
                ? "font-normal"
                : "text-[11px] font-normal tracking-[0.28em] text-neutral-900"
            }`}
          >
            Instagram
          </a>
          <Link
            href="/submit"
            className={`transition-opacity hover:opacity-55 md:hidden ${
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
          {!onToggleSavedOnly && !overlay && (
            <Link
              href={savedHref}
              aria-label="View saved items"
              className="text-neutral-900 transition-opacity hover:opacity-55 focus-visible:outline-none"
            >
              <HeartIcon filled={false} className="h-4 w-4" />
            </Link>
          )}
          {!overlay && <ThemeToggleButton className="hidden md:flex" />}
        </div>
      </nav>
    </header>
  );
}

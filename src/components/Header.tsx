"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HeartIcon } from "./SavedExhibitions";
import { MobileNavigationMenu } from "./MobileNavigationMenu";
import { NavigationProgress } from "./NavigationProgress";
import { ThemeToggleButton } from "./ThemeToggleButton";

type HeaderProps = {
  overlay?: boolean;
  savedOnly?: boolean;
  onToggleSavedOnly?: () => void;
  savedHref?: string;
};

export function Header({ overlay = false }: HeaderProps) {
  const pathname = usePathname();
  const navLinkClass = (href: string, emphasized = false) => {
    const active = href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
    return `transition-opacity hover:opacity-55 ${active ? "font-semibold" : ""} ${
      emphasized ? "font-semibold" : ""
    }`;
  };

  return (
    <header
      className={`${overlay ? "absolute z-20" : "fixed z-50"} inset-x-0 top-0 h-[65px] px-4 md:px-8 lg:px-12 ${
        overlay
          ? "text-[8px] uppercase tracking-[0.14em] text-white md:text-[11px] md:tracking-[0.28em]"
          : "bg-white"
      }`}
    >
      <nav
        className="relative flex h-full items-center justify-between md:grid md:grid-cols-[1fr_auto_1fr] md:gap-8"
        aria-label="Primary navigation"
      >
        <MobileNavigationMenu inverted={overlay} />
        <Link
          href="/"
          className={`absolute left-1/2 -translate-x-1/2 whitespace-nowrap text-[12px] font-medium tracking-tight transition-opacity hover:opacity-55 md:static md:translate-x-0 md:justify-self-start md:text-[16px] ${
            overlay ? "text-white" : "text-neutral-900"
          }`}
          aria-label="FindArt Platform home"
        >
          FindArt Platform
        </Link>

        <div
          className={`editorial-serif hidden items-center gap-5 uppercase md:flex md:justify-self-center ${
            overlay
              ? "font-normal"
              : "text-[11px] font-normal tracking-[0.08em] text-neutral-900"
          }`}
        >
          <Link href="/" className={navLinkClass("/")}>
            Explore
          </Link>
          <Link href="/collect" className={navLinkClass("/collect")}>
            COLLECT
          </Link>
          <Link href="/exhibitions" className={navLinkClass("/exhibitions")}>
            Exhibitions
          </Link>
          <Link href="/opportunities" className={navLinkClass("/opportunities")}>
            OPPORTUNITIES
          </Link>
          <Link href="/editorial" className={navLinkClass("/editorial")}>
            Features
          </Link>
          <button type="button" className="transition-opacity hover:opacity-55">
            EDITORIAL
          </button>
          <Link href="/directory" className={navLinkClass("/directory")}>
            INDEX
          </Link>
          <Link href="/submit" className={navLinkClass("/submit", true)}>
            Submit
          </Link>
        </div>

        <div className="flex items-center gap-3 justify-self-end md:gap-5">
          <Link
            href="/submit"
            className={`transition-opacity hover:opacity-55 md:hidden ${
              overlay ? "font-semibold" : "editorial-serif text-[9px] font-semibold uppercase tracking-[0.24em] text-neutral-900 md:text-[11px] md:tracking-[0.32em]"
            }`}
          >
            Submit
          </Link>
          {!overlay && (
            <Link
              href="/saved"
              aria-label="View saved items"
              className="text-neutral-900 transition-opacity hover:opacity-55 focus-visible:outline-none"
            >
              <HeartIcon filled={pathname === "/saved"} className="h-4 w-4" />
            </Link>
          )}
          {!overlay && <ThemeToggleButton className="hidden md:flex" />}
        </div>
      </nav>
      <NavigationProgress />
    </header>
  );
}

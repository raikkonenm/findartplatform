"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HeartIcon } from "./SavedExhibitions";
import { MobileNavigationMenu } from "./MobileNavigationMenu";
import { NavigationProgress } from "./NavigationProgress";
import { useSearchPanel } from "./SearchPanelContext";
import { ThemeToggleButton } from "./ThemeToggleButton";

type HeaderProps = {
  overlay?: boolean;
  savedOnly?: boolean;
  onToggleSavedOnly?: () => void;
  savedHref?: string;
};

export function Header({ overlay = false }: HeaderProps) {
  const pathname = usePathname();
  const { setOpen: setSearchOpen } = useSearchPanel();
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
        {/* Mobile: hamburger left, logo absolute-centered.
            Desktop: hamburger hidden, logo shifts back into the left cluster
            (justify-self-start) alongside the (hidden on mobile) hamburger slot. */}
        <div className="flex items-center gap-3 md:gap-4 md:justify-self-start">
          <MobileNavigationMenu inverted={overlay} />
          <Link
            href="/"
            className={`absolute left-1/2 -translate-x-1/2 whitespace-nowrap text-[16px] font-medium normal-case tracking-tight transition-opacity hover:opacity-55 md:static md:translate-x-0 md:text-[16px] ${
              overlay ? "text-white" : "text-neutral-900"
            }`}
            aria-label="FindArt Platform home"
          >
            FindArt Platform
          </Link>
        </div>

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
          <Link href="/features" className={navLinkClass("/features")}>
            Features
          </Link>
          <button type="button" className="transition-opacity hover:opacity-55">
            EDITORIAL
          </button>
          <Link href="/directory" className={navLinkClass("/directory")}>
            INDEX
          </Link>
          <Link
            href="/submit"
            className={navLinkClass("/submit", true)}
            style={{ textDecorationLine: "underline", textDecorationThickness: "1px", textUnderlineOffset: "6px" }}
          >
            Submit
          </Link>
        </div>

        <div className="flex items-center gap-3 justify-self-end md:gap-4">
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            aria-label="Open search"
            className={`flex h-8 w-8 items-center justify-center transition-opacity hover:opacity-55 focus-visible:outline-none ${
              overlay ? "text-white" : "text-neutral-900"
            }`}
          >
            <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" aria-hidden="true">
              <circle cx="8.5" cy="8.5" r="5.5" stroke="currentColor" strokeWidth="1.35" />
              <path d="m12.5 12.5 4 4" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" />
            </svg>
          </button>
          <Link
            href="/saved"
            aria-label="View saved items"
            className={`transition-opacity hover:opacity-55 focus-visible:outline-none ${
              overlay ? "text-white" : "text-neutral-900"
            }`}
          >
            <HeartIcon filled={pathname === "/saved"} className="h-4 w-4" />
          </Link>
          <ThemeToggleButton className={`hidden md:flex ${overlay ? "text-white" : ""}`} />

        </div>
      </nav>
      <NavigationProgress />
    </header>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { SHOW_COLLECT_NAV, SHOW_PRACTICE_NAV } from "@/lib/navFlags";
import { ThemeToggleButton } from "./ThemeToggleButton";

export function MobileNavigationMenu({ inverted = false }: { inverted?: boolean }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Two-phase mount so the slide-in animation actually plays on first
  // open: we render with -translate-x-full for one frame, then flip
  // to translate-x-0 in the next paint, and on close we swap back and
  // unmount only after the 300ms transform transition finishes. The
  // eslint pragma below is intentional: this is genuinely event-
  // driven state we want to defer to after the render, and the rule
  // has no notion of animation timing.
  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMounted(true);
      return;
    }
    if (mounted) {
      const t = setTimeout(() => setMounted(false), 480);
      return () => clearTimeout(t);
    }
  }, [open, mounted]);

  // Body scroll lock while the drawer is open.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  // Escape closes the drawer; focus the close button on open for a
  // sane keyboard entry point.
  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    const focusTimer = setTimeout(() => closeButtonRef.current?.focus(), 20);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      clearTimeout(focusTimer);
    };
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-label={open ? "Close navigation menu" : "Open navigation menu"}
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => setOpen((isOpen) => !isOpen)}
        className={`flex h-10 w-10 items-center justify-start transition-opacity duration-200 ease-out hover:opacity-55 ${
          inverted ? "text-white" : "text-neutral-900"
        }`}
      >
        <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" aria-hidden="true">
          <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="1.25" />
        </svg>
      </button>

      {mounted && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Navigation"
          className="fixed inset-0 z-[70]"
        >
          {/* Overlay — click closes. Fades in/out with the drawer. */}
          <button
            type="button"
            aria-label="Close navigation menu"
            onClick={() => setOpen(false)}
            className={`absolute inset-0 h-full w-full cursor-default bg-black/40 transition-opacity duration-500 ease-out ${
              open ? "opacity-100" : "opacity-0"
            }`}
          />

          {/* Off-canvas panel, slides in from the left. */}
          <aside
            className={`absolute inset-x-0 top-0 flex max-h-[92vh] w-full flex-col bg-white shadow-[0_12px_28px_rgba(0,0,0,0.08)] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              open ? "translate-y-0" : "-translate-y-full"
            }`}
          >
            <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4">
              <ThemeToggleButton />
              <button
                ref={closeButtonRef}
                type="button"
                aria-label="Close navigation menu"
                onClick={() => setOpen(false)}
                className="flex h-8 w-8 items-center justify-center text-neutral-900 transition-opacity duration-200 ease-out hover:opacity-55"
              >
                <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" aria-hidden="true">
                  <path d="M4 4l12 12M16 4L4 16" stroke="currentColor" strokeWidth="1.25" />
                </svg>
              </button>
            </div>
            <nav className="editorial-serif flex flex-1 flex-col items-start px-5 py-6 text-[11px] uppercase tracking-[0.28em] text-neutral-900">
              <div className="flex flex-col items-start gap-5">
                <Link
                  href="/"
                  onClick={() => setOpen(false)}
                  className={pathname === "/" ? "font-semibold" : ""}
                >
                  Explore
                </Link>
                {SHOW_COLLECT_NAV && (
                  <Link
                    href="/collect"
                    onClick={() => setOpen(false)}
                    className={pathname.startsWith("/collect") ? "font-semibold" : ""}
                  >
                    COLLECT
                  </Link>
                )}
                <Link
                  href="/exhibitions"
                  onClick={() => setOpen(false)}
                  className={pathname.startsWith("/exhibitions") ? "font-semibold" : ""}
                >
                  Exhibitions
                </Link>
                <Link
                  href="/features"
                  onClick={() => setOpen(false)}
                  className={pathname.startsWith("/features") ? "font-semibold" : ""}
                >
                  Features
                </Link>
                <Link
                  href="/opportunities"
                  onClick={() => setOpen(false)}
                  className={pathname.startsWith("/opportunities") ? "font-semibold" : ""}
                >
                  Opportunities
                </Link>
                <Link
                  href="/editorial"
                  onClick={() => setOpen(false)}
                  className={pathname === "/editorial" ? "font-semibold" : ""}
                >
                  Editorial
                </Link>
                <Link
                  href="/directory"
                  onClick={() => setOpen(false)}
                  className={pathname.startsWith("/directory") ? "font-semibold" : ""}
                >
                  Index
                </Link>
              </div>

              <div className="mt-12 flex flex-col items-start gap-5">
                <a href="https://www.artcnomad.com/" onClick={() => setOpen(false)}>
                  By Artnomad Curators &#8599;
                </a>
                {SHOW_PRACTICE_NAV && (
                  <a
                    href="https://www.artcnomad.com/practice"
                    onClick={() => setOpen(false)}
                  >
                    Practice &#8599;
                  </a>
                )}
              </div>

              <div className="mt-10">
                <Link
                  href="/submit"
                  onClick={() => setOpen(false)}
                  className="font-semibold"
                  style={{ textDecorationLine: "underline", textDecorationThickness: "1px", textUnderlineOffset: "6px" }}
                >
                  Submit
                </Link>
              </div>

              <div className="mt-auto flex justify-end pt-8">
                <a
                  href="https://www.instagram.com/findart.platform/"
                  onClick={() => setOpen(false)}
                  aria-label="FindArt on Instagram"
                  className="inline-flex h-9 w-9 items-center justify-center text-neutral-900 transition-opacity hover:opacity-55"
                >
                  <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
                    <rect x="3" y="3" width="18" height="18" rx="4.5" />
                    <circle cx="12" cy="12" r="4" />
                    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                  </svg>
                </a>
              </div>
            </nav>
          </aside>
        </div>
      )}
    </div>
  );
}

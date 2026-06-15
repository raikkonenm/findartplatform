"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { SHOW_PRACTICE_NAV } from "@/lib/navFlags";

export function MobileNavigationMenu({ inverted = false }: { inverted?: boolean }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function onMouseDown(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={ref} className="md:hidden">
      <button
        type="button"
        aria-label={open ? "Close navigation menu" : "Open navigation menu"}
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((isOpen) => !isOpen)}
        className={`flex h-10 w-10 items-center justify-start transition-opacity hover:opacity-55 ${
          inverted ? "text-white" : "text-neutral-900"
        }`}
      >
        <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" aria-hidden="true">
          <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="1.25" />
        </svg>
      </button>
      {open && (
        <div
          role="menu"
          className="fixed inset-x-0 top-[65px] z-[60] border-b border-neutral-200 bg-white px-5 py-6 text-[10px] uppercase tracking-[0.22em] text-neutral-900 shadow-[0_5px_12px_rgba(0,0,0,0.04)]"
        >
          <div className="flex flex-col items-start gap-5">
            <Link href="/about" role="menuitem" onClick={() => setOpen(false)}>
              About
            </Link>
            <a
              href="https://www.instagram.com/findart.platform/"
              role="menuitem"
              onClick={() => setOpen(false)}
            >
              Instagram
            </a>
            <a href="https://www.artcnomad.com/" role="menuitem" onClick={() => setOpen(false)}>
              By Artnomad Curators &#8599;
            </a>
            {SHOW_PRACTICE_NAV && (
              <a href="https://www.artcnomad.com/practice" role="menuitem" onClick={() => setOpen(false)}>
                Practice &#8599;
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type SlideOverProps = {
  children: React.ReactNode;
  label?: string;
  closeHref?: string;
  contentKey?: string;
};

export function SlideOver({
  children,
  label = "Exhibition details",
  closeHref,
  contentKey,
}: SlideOverProps) {
  const router = useRouter();
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const closingRef = useRef(false);
  const [entered, setEntered] = useState(false);
  const [closing, setClosing] = useState(false);

  const close = useCallback(() => {
    if (closingRef.current) {
      return;
    }

    closingRef.current = true;
    setClosing(true);
    setEntered(false);
    window.setTimeout(() => {
      if (closeHref) {
        router.push(closeHref);
      } else {
        router.back();
      }
    }, 300);
  }, [closeHref, router]);

  useEffect(() => {
    const animationFrame = window.requestAnimationFrame(() => setEntered(true));

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.stopPropagation();
        close();
      }
    }

    const previousOverflow = document.body.style.overflow;
    const previousWidth = document.body.style.width;
    if (window.innerWidth >= 768) {
      document.body.style.width = `${document.body.getBoundingClientRect().width}px`;
    }
    document.body.style.overflow = "hidden";

    document.addEventListener("keydown", onKey);
    const focusTimer = window.setTimeout(() => closeBtnRef.current?.focus(), 350);

    return () => {
      document.removeEventListener("keydown", onKey);
      window.cancelAnimationFrame(animationFrame);
      window.clearTimeout(focusTimer);
      document.body.style.overflow = previousOverflow;
      document.body.style.width = previousWidth;
    };
  }, [close]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [contentKey]);

  return (
    <div className="pointer-events-none fixed inset-0 z-[60] max-w-full overflow-x-hidden md:z-40 md:max-w-none">
      <button
        type="button"
        aria-label="Close exhibition"
        onClick={close}
        className={`pointer-events-auto absolute inset-x-0 bottom-0 top-[65px] hidden cursor-default bg-neutral-950 transition-opacity duration-300 md:block ${
          entered && !closing ? "opacity-[0.2]" : "opacity-0"
        }`}
      />

      <div
        className={`pointer-events-auto absolute inset-0 flex h-[100dvh] w-screen min-w-0 flex-col overflow-hidden bg-white transition-transform duration-300 ease-out md:inset-y-auto md:bottom-0 md:left-auto md:right-0 md:top-[65px] md:h-auto md:w-[72vw] md:shadow-[0_12px_42px_rgba(0,0,0,0.16)] lg:w-[clamp(47.5rem,60vw,68.75rem)] ${
          entered ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label={label}
      >
        <button
          ref={closeBtnRef}
          type="button"
          onClick={close}
          aria-label="Close"
          className="absolute right-3 top-3 z-20 flex h-11 w-11 items-center justify-center border-0 bg-transparent p-0 text-neutral-900 transition-opacity hover:opacity-55 focus:outline-none md:right-8 md:top-7 md:bg-white md:focus-visible:ring-2 md:focus-visible:ring-neutral-900 md:focus-visible:ring-offset-2"
        >
          <svg viewBox="0 0 16 16" className="h-5 w-5 md:h-4 md:w-4" fill="none" aria-hidden="true">
            <path
              d="M2 2l12 12M14 2L2 14"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
          </svg>
        </button>

        <div ref={scrollRef} className="h-full overflow-y-auto overscroll-contain">
          {children}
        </div>
      </div>
    </div>
  );
}

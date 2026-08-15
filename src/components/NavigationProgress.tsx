"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const LOADING_CLASS = "route-progress-loading";
const COMPLETE_CLASS = "route-progress-complete";

export function NavigationProgress() {
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;
    if (!root.classList.contains(LOADING_CLASS)) return;

    root.classList.add(COMPLETE_CLASS);
    const timer = window.setTimeout(() => {
      root.classList.remove(LOADING_CLASS, COMPLETE_CLASS);
    }, 360);
    return () => window.clearTimeout(timer);
  }, [pathname]);

  useEffect(() => {
    const startProgress = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }

      if (!(event.target instanceof Element)) return;
      const anchor = event.target.closest("header a[href]") as HTMLAnchorElement | null;
      if (!anchor || anchor.target === "_blank") return;

      const destination = new URL(anchor.href, window.location.href);
      if (destination.origin !== window.location.origin) return;
      if (destination.pathname === window.location.pathname && destination.search === window.location.search) return;

      const root = document.documentElement;
      root.classList.remove(LOADING_CLASS, COMPLETE_CLASS);
      void root.offsetWidth;
      root.classList.add(LOADING_CLASS);
    };

    document.addEventListener("click", startProgress, true);
    return () => document.removeEventListener("click", startProgress, true);
  }, []);

  return null;
}

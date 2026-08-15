"use client";

import { useSyncExternalStore } from "react";

type Theme = "light" | "dark";

const THEME_EVENT = "findart-theme-change";

function currentTheme(): Theme {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

function subscribe(onStoreChange: () => void) {
  window.addEventListener(THEME_EVENT, onStoreChange);
  return () => window.removeEventListener(THEME_EVENT, onStoreChange);
}

export function ThemeToggleButton({ className = "" }: { className?: string }) {
  const theme = useSyncExternalStore(subscribe, currentTheme, () => "light");
  const dark = theme === "dark";

  function toggleTheme() {
    const nextTheme: Theme = dark ? "light" : "dark";
    const applyTheme = () => {
      document.documentElement.dataset.theme = nextTheme;
      localStorage.setItem("findart-theme", nextTheme);
      window.dispatchEvent(new Event(THEME_EVENT));
    };
    const transitionDocument = document as Document & {
      startViewTransition?: (update: () => void) => void;
    };

    if (transitionDocument.startViewTransition) {
      transitionDocument.startViewTransition(applyTheme);
    } else {
      applyTheme();
    }
  }

  return (
    <button
      type="button"
      aria-label={dark ? "Use light theme" : "Use dark theme"}
      aria-pressed={dark}
      onClick={toggleTheme}
      className={`flex h-8 w-8 items-center justify-center transition-opacity hover:opacity-60 focus-visible:outline-none ${className}`}
    >
      <span
        aria-hidden="true"
        className={`block h-[17px] w-[17px] rounded-full border border-current transition-transform duration-500 ease-out ${
          dark ? "rotate-90" : "rotate-0"
        }`}
        style={{
          background: "linear-gradient(90deg, #111 0 50%, #fff 50% 100%)",
        }}
      />
    </button>
  );
}

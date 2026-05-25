"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react";

const STORAGE_KEY = "findart-platform:saved-exhibitions";
const serverSnapshot = "[]";
const listeners = new Set<() => void>();

type SavedExhibitionsValue = {
  savedSlugs: Set<string>;
  isSaved: (slug: string) => boolean;
  toggleSaved: (slug: string) => void;
};

const SavedExhibitionsContext = createContext<SavedExhibitionsValue | null>(null);

function readSnapshot() {
  if (typeof window === "undefined") {
    return serverSnapshot;
  }

  return window.localStorage.getItem(STORAGE_KEY) ?? serverSnapshot;
}

function parseSnapshot(snapshot: string) {
  try {
    const value: unknown = JSON.parse(snapshot);
    return new Set(
      Array.isArray(value)
        ? value.filter((slug): slug is string => typeof slug === "string")
        : [],
    );
  } catch {
    return new Set<string>();
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);

  function onStorage(event: StorageEvent) {
    if (event.key === STORAGE_KEY) {
      listener();
    }
  }

  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function notifyListeners() {
  listeners.forEach((listener) => listener());
}

export function SavedExhibitionsProvider({ children }: { children: React.ReactNode }) {
  const snapshot = useSyncExternalStore(subscribe, readSnapshot, () => serverSnapshot);
  const savedSlugs = useMemo(() => parseSnapshot(snapshot), [snapshot]);

  const toggleSaved = useCallback((slug: string) => {
    const next = parseSnapshot(readSnapshot());

    if (next.has(slug)) {
      next.delete(slug);
    } else {
      next.add(slug);
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(next)));
    notifyListeners();
  }, []);

  const value = useMemo<SavedExhibitionsValue>(
    () => ({
      savedSlugs,
      isSaved: (slug) => savedSlugs.has(slug),
      toggleSaved,
    }),
    [savedSlugs, toggleSaved],
  );

  return (
    <SavedExhibitionsContext.Provider value={value}>
      {children}
    </SavedExhibitionsContext.Provider>
  );
}

export function useSavedExhibitions() {
  const value = useContext(SavedExhibitionsContext);

  if (!value) {
    throw new Error("useSavedExhibitions must be used within SavedExhibitionsProvider.");
  }

  return value;
}

export function HeartIcon({
  filled,
  className = "h-4 w-4",
}: {
  filled: boolean;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.6"
      aria-hidden="true"
    >
      <path d="M20.8 8.8c0 5.5-8.8 10.7-8.8 10.7S3.2 14.3 3.2 8.8c0-2.6 2-4.4 4.5-4.4 1.7 0 3.3.9 4.3 2.3 1-1.4 2.6-2.3 4.3-2.3 2.5 0 4.5 1.8 4.5 4.4Z" />
    </svg>
  );
}

export function SaveExhibitionButton({
  slug,
  title,
}: {
  slug: string;
  title: string;
}) {
  const { isSaved, toggleSaved } = useSavedExhibitions();
  const saved = isSaved(slug);

  return (
    <button
      type="button"
      aria-label={saved ? `Remove ${title} from saved exhibitions` : `Save ${title}`}
      aria-pressed={saved}
      onClick={() => toggleSaved(slug)}
      className="flex items-center gap-2 border border-neutral-900 bg-white px-3 py-2 text-[10px] uppercase tracking-[0.2em] text-neutral-900 transition-opacity hover:opacity-55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2"
    >
      <HeartIcon filled={saved} className="h-3.5 w-3.5" />
      <span>Save</span>
    </button>
  );
}

"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";
import { SearchBar } from "./SearchBar";

type MobileFilterSheetProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  onClearAll?: () => void;
  clearAllDisabled?: boolean;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  resultCount?: number;
  actionLabel?: string;
  children: ReactNode;
};

export function MobileFilterSheet({
  open,
  onClose,
  title = "Filter & Sort",
  onClearAll,
  clearAllDisabled,
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search",
  resultCount,
  actionLabel,
  children,
}: MobileFilterSheetProps) {
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  const primaryLabel =
    actionLabel ??
    (typeof resultCount === "number"
      ? `Show ${resultCount} ${resultCount === 1 ? "result" : "results"}`
      : "Done");

  return (
    <div className="fixed inset-0 z-[80] md:hidden" role="dialog" aria-modal="true" aria-label={title}>
      <button
        type="button"
        aria-label="Close filters"
        onClick={onClose}
        className="absolute inset-0 bg-black/40"
      />
      <aside className="absolute inset-y-0 right-0 flex w-[92%] max-w-[420px] flex-col bg-white shadow-[-12px_0_35px_rgba(0,0,0,0.15)]">
        <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4">
          <h2 className="text-[15px] font-medium text-neutral-900">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close filters"
            className="flex h-9 w-9 items-center justify-center rounded-md border border-neutral-200 text-neutral-700 transition-colors hover:border-neutral-400"
          >
            <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" aria-hidden="true">
              <path d="M4 4l12 12M16 4L4 16" stroke="currentColor" strokeWidth="1.35" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 pt-4">
          {onClearAll && (
            <div className="mb-4 flex justify-end">
              <button
                type="button"
                onClick={onClearAll}
                disabled={clearAllDisabled}
                className={`text-[13px] underline-offset-4 ${clearAllDisabled ? "text-neutral-400" : "text-neutral-700 hover:underline"}`}
              >
                Clear all
              </button>
            </div>
          )}
          {onSearchChange && (
            <SearchBar
              value={searchValue ?? ""}
              onChange={onSearchChange}
              placeholder={searchPlaceholder}
            />
          )}
          <div className="mt-6 space-y-6 pb-6">{children}</div>
        </div>

        <div className="border-t border-neutral-200 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-lg bg-neutral-900 py-3 text-[13px] font-medium text-white transition-opacity hover:opacity-90"
          >
            {primaryLabel}
          </button>
        </div>
      </aside>
    </div>
  );
}

type LayoutOption<V extends string | number> = {
  id: V;
  label: string;
  glyph: ReactNode;
};

export function LayoutSection<V extends string | number>({
  value,
  onChange,
  options,
}: {
  value: V;
  onChange: (value: V) => void;
  options: Array<LayoutOption<V>>;
}) {
  return (
    <section className="border-t border-neutral-200 pt-6">
      <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-neutral-500">
        Layout
      </p>
      <div className="flex gap-3">
        {options.map((option) => {
          const active = value === option.id;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onChange(option.id)}
              aria-pressed={active}
              aria-label={option.label}
              className={`flex h-10 w-10 items-center justify-center rounded-full border transition-colors ${active ? "border-neutral-900 bg-neutral-100 text-neutral-900" : "border-neutral-200 text-neutral-500 hover:border-neutral-300"}`}
            >
              {option.glyph}
            </button>
          );
        })}
      </div>
    </section>
  );
}

export const LayoutGlyphs = {
  gridNormal: (
    <svg viewBox="0 0 18 18" className="h-4 w-4" fill="none" aria-hidden="true">
      <rect x="2" y="2" width="6" height="6" stroke="currentColor" strokeWidth="1.35" />
      <rect x="10" y="2" width="6" height="6" stroke="currentColor" strokeWidth="1.35" />
      <rect x="2" y="10" width="6" height="6" stroke="currentColor" strokeWidth="1.35" />
      <rect x="10" y="10" width="6" height="6" stroke="currentColor" strokeWidth="1.35" />
    </svg>
  ),
  gridDense: (
    <svg viewBox="0 0 18 18" className="h-4 w-4" fill="none" aria-hidden="true">
      <rect x="1.5" y="1.5" width="4" height="4" stroke="currentColor" strokeWidth="1.35" />
      <rect x="7" y="1.5" width="4" height="4" stroke="currentColor" strokeWidth="1.35" />
      <rect x="12.5" y="1.5" width="4" height="4" stroke="currentColor" strokeWidth="1.35" />
      <rect x="1.5" y="7" width="4" height="4" stroke="currentColor" strokeWidth="1.35" />
      <rect x="7" y="7" width="4" height="4" stroke="currentColor" strokeWidth="1.35" />
      <rect x="12.5" y="7" width="4" height="4" stroke="currentColor" strokeWidth="1.35" />
      <rect x="1.5" y="12.5" width="4" height="4" stroke="currentColor" strokeWidth="1.35" />
      <rect x="7" y="12.5" width="4" height="4" stroke="currentColor" strokeWidth="1.35" />
      <rect x="12.5" y="12.5" width="4" height="4" stroke="currentColor" strokeWidth="1.35" />
    </svg>
  ),
  list: (
    <svg viewBox="0 0 18 18" className="h-4 w-4" fill="none" aria-hidden="true">
      <path d="M3 5h12M3 9h12M3 13h12" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" />
    </svg>
  ),
};

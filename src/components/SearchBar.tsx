"use client";

import type { ReactNode } from "react";

function SearchGlyph({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className} fill="none" aria-hidden="true">
      <circle cx="8.5" cy="8.5" r="5.5" stroke="currentColor" strokeWidth="1.35" />
      <path d="m12.5 12.5 4 4" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" />
    </svg>
  );
}

function FilterGlyph({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className} fill="none" aria-hidden="true">
      <path d="M3.5 5.5h9" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" />
      <path d="M16 5.5h1" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" />
      <circle cx="14" cy="5.5" r="1.6" stroke="currentColor" strokeWidth="1.35" />
      <path d="M3.5 14.5h1" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" />
      <path d="M8 14.5h8.5" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" />
      <circle cx="6" cy="14.5" r="1.6" stroke="currentColor" strokeWidth="1.35" />
    </svg>
  );
}

type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  onFilterClick?: () => void;
  filterBadge?: number;
  trailing?: ReactNode;
};

export function SearchBar({
  value,
  onChange,
  placeholder = "Search",
  className = "",
  onFilterClick,
  filterBadge,
  trailing,
}: SearchBarProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <label className="flex h-11 flex-1 items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 text-neutral-500 focus-within:border-neutral-400">
        <SearchGlyph className="h-4 w-4 text-neutral-400" />
        <input
          type="search"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          aria-label={placeholder}
          className="flex-1 bg-transparent text-[14px] text-neutral-900 placeholder:text-neutral-400 focus:outline-none"
        />
      </label>
      {onFilterClick && (
        <button
          type="button"
          onClick={onFilterClick}
          aria-label="Open filters"
          className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-700 transition-colors hover:border-neutral-400"
        >
          <FilterGlyph className="h-[18px] w-[18px]" />
          {filterBadge && filterBadge > 0 ? (
            <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-neutral-900 px-1 text-[10px] font-medium text-white">
              {filterBadge}
            </span>
          ) : null}
        </button>
      )}
      {trailing}
    </div>
  );
}

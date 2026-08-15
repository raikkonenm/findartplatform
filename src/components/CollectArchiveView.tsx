"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { Header } from "./Header";

type CollectColumns = 2 | 4;
type Category = "All" | "Surreal" | "Abstract" | "Illustration" | "Photography" | "Painting" | "Portrait";
type PriceRange = "All" | "Up to $100" | "$100-$1,000" | "$1,000+";
type SortOrder = "Newest" | "Price: low to high" | "Price: high to low";

const ASPECT_CLASSES = ["aspect-[3/4]", "aspect-[4/5]", "aspect-square"];
const CATEGORY_OPTIONS: Category[] = [
  "All",
  "Surreal",
  "Abstract",
  "Illustration",
  "Photography",
  "Painting",
  "Portrait",
];
const PRICE_OPTIONS: PriceRange[] = ["All", "Up to $100", "$100-$1,000", "$1,000+"];
const SORT_OPTIONS: SortOrder[] = ["Newest", "Price: low to high", "Price: high to low"];
const ARTWORK_DETAILS: Array<{ category: Exclude<Category, "All">; price: number }> = [
  { category: "Painting", price: 75 },
  { category: "Abstract", price: 450 },
  { category: "Illustration", price: 1400 },
  { category: "Photography", price: 90 },
  { category: "Portrait", price: 800 },
  { category: "Surreal", price: 1800 },
];

function useCollectDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const supportsHover = (pointerType: string) =>
    pointerType === "mouse" && window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  const clearCloseTimer = () => {
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  useEffect(() => {
    if (!open) return;
    const closeOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", closeOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  useEffect(
    () => () => {
      if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);
    },
    [],
  );

  return {
    open,
    setOpen,
    ref,
    onPointerEnter: (pointerType: string) => {
      if (!supportsHover(pointerType)) return;
      clearCloseTimer();
      setOpen(true);
    },
    onPointerLeave: (pointerType: string) => {
      if (!supportsHover(pointerType)) return;
      clearCloseTimer();
      closeTimerRef.current = setTimeout(() => setOpen(false), 180);
    },
  };
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      className={`h-2 w-2.5 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
      viewBox="0 0 10 6"
      fill="none"
      aria-hidden="true"
    >
      <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function Checkmark() {
  return (
    <svg className="h-2.5 w-3 shrink-0" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M2 6l3 3 5-6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SelectFilter<T extends string>({
  label,
  value,
  options,
  allValue,
  onChange,
  showSelection = true,
}: {
  label: string;
  value: T;
  options: readonly T[];
  allValue?: T;
  onChange: (value: T) => void;
  showSelection?: boolean;
}) {
  const { open, setOpen, ref, onPointerEnter, onPointerLeave } = useCollectDropdown();
  const active = allValue !== undefined && value !== allValue;
  const displayLabel = showSelection && active ? value : label;

  return (
    <div
      ref={ref}
      className="relative"
      onPointerEnter={(event) => onPointerEnter(event.pointerType)}
      onPointerLeave={(event) => onPointerLeave(event.pointerType)}
    >
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-haspopup="listbox"
        className={`flex items-center justify-between gap-2 whitespace-nowrap border px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] transition-colors ${
          active ? "border-neutral-900 text-neutral-900" : "border-neutral-200 text-neutral-700 hover:border-neutral-400"
        }`}
      >
        <span>{displayLabel}</span>
        <Chevron open={open} />
      </button>
      {open && (
        <ul
          role="listbox"
          aria-label={label}
          className="absolute left-0 top-full z-30 mt-1 min-w-[13rem] border border-neutral-200 bg-white"
        >
          {options.map((option) => (
            <li key={option} role="option" aria-selected={value === option}>
              <button
                type="button"
                onClick={() => {
                  onChange(option);
                  setOpen(false);
                }}
                className={`flex w-full items-center justify-between px-3 py-2 text-left text-[10px] uppercase tracking-[0.18em] transition-colors hover:bg-neutral-50 ${
                  value === option ? "text-neutral-900" : "text-neutral-500"
                }`}
              >
                <span>{option === allValue ? `All ${label.toLowerCase()}` : option}</span>
                {value === option && <Checkmark />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function PriceFilter({
  value,
  minimum,
  maximum,
  onChange,
  onMinimumChange,
  onMaximumChange,
}: {
  value: PriceRange;
  minimum: string;
  maximum: string;
  onChange: (value: PriceRange) => void;
  onMinimumChange: (value: string) => void;
  onMaximumChange: (value: string) => void;
}) {
  const { open, setOpen, ref, onPointerEnter, onPointerLeave } = useCollectDropdown();
  const custom = minimum !== "" || maximum !== "";
  const active = value !== "All" || custom;

  return (
    <div
      ref={ref}
      className="relative"
      onPointerEnter={(event) => onPointerEnter(event.pointerType)}
      onPointerLeave={(event) => onPointerLeave(event.pointerType)}
    >
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-haspopup="dialog"
        className={`flex items-center justify-between gap-2 whitespace-nowrap border px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] transition-colors ${
          active ? "border-neutral-900 text-neutral-900" : "border-neutral-200 text-neutral-700 hover:border-neutral-400"
        }`}
      >
        <span>{custom ? "Custom price" : value === "All" ? "Price" : value}</span>
        <Chevron open={open} />
      </button>
      {open && (
        <div className="absolute left-0 top-full z-30 mt-1 w-64 border border-neutral-200 bg-white">
          {PRICE_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => {
                onChange(option);
                onMinimumChange("");
                onMaximumChange("");
                setOpen(false);
              }}
              className={`flex w-full items-center justify-between px-3 py-2 text-left text-[10px] uppercase tracking-[0.18em] transition-colors hover:bg-neutral-50 ${
                value === option && !custom ? "text-neutral-900" : "text-neutral-500"
              }`}
            >
              <span>{option === "All" ? "All prices" : option.replace("-", "\u2013")}</span>
              {value === option && !custom && <Checkmark />}
            </button>
          ))}
          <div className="grid grid-cols-2 gap-2 border-t border-neutral-200 p-3">
            <input
              type="number"
              min="0"
              inputMode="decimal"
              value={minimum}
              onChange={(event) => {
                onChange("All");
                onMinimumChange(event.target.value);
              }}
              placeholder="Minimum"
              aria-label="Minimum price"
              className="min-w-0 border border-neutral-200 bg-transparent px-2 py-2 text-[10px] uppercase tracking-[0.1em] text-neutral-900 outline-none focus:border-neutral-900"
            />
            <input
              type="number"
              min="0"
              inputMode="decimal"
              value={maximum}
              onChange={(event) => {
                onChange("All");
                onMaximumChange(event.target.value);
              }}
              placeholder="Maximum"
              aria-label="Maximum price"
              className="min-w-0 border border-neutral-200 bg-transparent px-2 py-2 text-[10px] uppercase tracking-[0.1em] text-neutral-900 outline-none focus:border-neutral-900"
            />
          </div>
        </div>
      )}
    </div>
  );
}

function SearchControl({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const expanded = value.length > 0;

  return (
    <label className="group/search flex h-9 cursor-text items-center justify-end text-neutral-500">
      <span className="sr-only">Search artworks</span>
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search"
        className={`h-9 border-0 border-b border-neutral-300 bg-transparent text-[12px] uppercase tracking-[0.08em] text-neutral-900 transition-[width,opacity] duration-300 ease-out placeholder:text-neutral-400 focus:border-neutral-900 focus:outline-none ${
          expanded
            ? "mr-2 w-56 opacity-100"
            : "w-0 opacity-0 group-hover/search:mr-2 group-hover/search:w-56 group-hover/search:opacity-100 group-focus-within/search:mr-2 group-focus-within/search:w-56 group-focus-within/search:opacity-100"
        }`}
      />
      <svg viewBox="0 0 20 20" className="h-4 w-4 shrink-0" fill="none" aria-hidden="true">
        <circle cx="8.5" cy="8.5" r="5.5" stroke="currentColor" strokeWidth="1.25" />
        <path d="m12.5 12.5 4 4" stroke="currentColor" strokeWidth="1.25" />
      </svg>
    </label>
  );
}

function ColumnsToggle({ columns, onClick }: { columns: CollectColumns; onClick: () => void }) {
  const dense = columns === 4;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Show ${columns === 4 ? 2 : 4} columns`}
      className={`shrink-0 border p-2 transition duration-200 ease-out ${
        dense
          ? "border-neutral-900 text-neutral-900"
          : "border-neutral-200 text-neutral-500 hover:border-neutral-400 hover:text-neutral-700"
      }`}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="square"
        aria-hidden="true"
        className={`transition-transform duration-300 ease-out ${dense ? "rotate-90" : "rotate-0"}`}
      >
        <line x1="3" y1="3" x2="3" y2="13" />
        <line x1="8" y1="3" x2="8" y2="13" />
        <line x1="13" y1="3" x2="13" y2="13" />
      </svg>
    </button>
  );
}

export function CollectArchiveView({ images }: { images: string[] }) {
  const [search, setSearch] = useState("");
  const [columns, setColumns] = useState<CollectColumns>(4);
  const [category, setCategory] = useState<Category>("All");
  const [priceRange, setPriceRange] = useState<PriceRange>("All");
  const [minimumPrice, setMinimumPrice] = useState("");
  const [maximumPrice, setMaximumPrice] = useState("");
  const [sortOrder, setSortOrder] = useState<SortOrder>("Newest");
  const artworks = useMemo(
    () => {
      const filtered = images
        .map((src, index) => ({
          src,
          index,
          ...ARTWORK_DETAILS[index % ARTWORK_DETAILS.length],
        }))
        .filter(({ index }) => {
          const query = search.trim().toLowerCase();
          if (!query) return true;
          const details = ARTWORK_DETAILS[index % ARTWORK_DETAILS.length];
          return `name ${index + 1} chungkook lee price by request ${details.category}`
            .toLowerCase()
            .includes(query);
        })
        .filter((artwork) => category === "All" || artwork.category === category)
        .filter((artwork) => {
          const minimum = minimumPrice === "" ? undefined : Number(minimumPrice);
          const maximum = maximumPrice === "" ? undefined : Number(maximumPrice);
          if (minimum !== undefined || maximum !== undefined) {
            return (
              (minimum === undefined || artwork.price >= minimum) &&
              (maximum === undefined || artwork.price <= maximum)
            );
          }
          if (priceRange === "Up to $100") return artwork.price <= 100;
          if (priceRange === "$100-$1,000") return artwork.price >= 100 && artwork.price <= 1000;
          if (priceRange === "$1,000+") return artwork.price >= 1000;
          return true;
        });

      if (sortOrder === "Price: low to high") {
        return filtered.sort((first, second) => first.price - second.price);
      }
      if (sortOrder === "Price: high to low") {
        return filtered.sort((first, second) => second.price - first.price);
      }
      return filtered;
    },
    [images, search, category, priceRange, minimumPrice, maximumPrice, sortOrder],
  );

  return (
    <main className="min-h-screen overflow-x-hidden bg-white pt-[65px]">
      <Header />

      <div className="flex flex-wrap items-center gap-2 px-5 pb-3 pt-4 md:gap-3 md:px-8 lg:px-12">
        <SelectFilter
          label="Category"
          value={category}
          options={CATEGORY_OPTIONS}
          allValue="All"
          onChange={setCategory}
        />
        <PriceFilter
          value={priceRange}
          minimum={minimumPrice}
          maximum={maximumPrice}
          onChange={setPriceRange}
          onMinimumChange={setMinimumPrice}
          onMaximumChange={setMaximumPrice}
        />
        <SelectFilter
          label="Sort"
          value={sortOrder}
          options={SORT_OPTIONS}
          onChange={setSortOrder}
          showSelection={false}
        />
        <div className="ml-auto flex items-center gap-3">
          <SearchControl value={search} onChange={setSearch} />
          <ColumnsToggle columns={columns} onClick={() => setColumns((current) => (current === 4 ? 2 : 4))} />
        </div>
      </div>

      {artworks.length === 0 ? (
        <p className="px-5 py-16 text-center text-[11px] uppercase tracking-[0.25em] text-neutral-400 md:px-8 lg:px-12">
          No artworks match your search.
        </p>
      ) : (
        <section
          aria-label="Collect artworks"
          className={`columns-1 gap-5 px-5 pb-20 pt-3 sm:columns-2 md:gap-12 md:px-8 md:pt-4 lg:px-12 ${
            columns === 4 ? "lg:columns-4" : "lg:columns-2"
          }`}
        >
          {artworks.map(({ src, index }) => (
            <article
              key={src}
              tabIndex={0}
              aria-label={`Name by Chungkook Lee, artwork ${index + 1}`}
              className="group relative mb-5 break-inside-avoid overflow-hidden bg-neutral-100 outline-none md:mb-16"
            >
              <div className={`relative ${ASPECT_CLASSES[index % ASPECT_CLASSES.length]}`}>
                <Image
                  src={src}
                  alt={`Name by Chungkook Lee, artwork ${index + 1}`}
                  fill
                  unoptimized
                  loading="lazy"
                  sizes={columns === 4 ? "(min-width: 1024px) 23vw, (min-width: 640px) 47vw, 100vw" : "(min-width: 1024px) 47vw, (min-width: 640px) 47vw, 100vw"}
                  className="object-cover"
                />
              </div>
              <div className="absolute inset-x-0 bottom-0 translate-y-3 bg-black/90 px-4 py-4 text-white opacity-0 transition-[opacity,transform] duration-300 ease-out group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100 md:px-5 md:py-5">
                <p className="text-[18px] leading-tight md:text-[20px]">Name</p>
                <p className="mt-3 text-[11px] font-medium uppercase tracking-[0.18em]">
                  CHUNKOOK LEE
                </p>
                <p className="mt-1 text-[12px] tracking-[0.05em] text-white/80">
                  Price by request
                </p>
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}

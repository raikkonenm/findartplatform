"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { buildCollectArtworks, type CollectCategory } from "@/lib/collectArtworks";
import { CollectArtworkCard } from "./CollectArtworkCard";
import { Header } from "./Header";
import { LayoutGlyphs, LayoutSection, MobileFilterSheet } from "./MobileFilterSheet";
import { SearchBar } from "./SearchBar";

type CollectColumns = 2 | 4;
type Category = "All" | CollectCategory;
type PriceRange = "All" | "Up to $100" | "$100-$1,000" | "$1,000+";
type SortOrder = "Newest" | "Price: low to high" | "Price: high to low";

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

type Availability = "buy" | "reserve" | "auction";
const AVAILABILITY_OPTIONS: Array<{ id: Availability; label: string }> = [
  { id: "buy", label: "Buy Now" },
  { id: "reserve", label: "Reserve" },
  { id: "auction", label: "On Auction" },
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
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  // Availability is a display-only filter for now — buildCollectArtworks doesn't
  // carry an availability field yet. Kept in state so the sidebar controls stay
  // responsive; hooking it into the filter pipeline can happen once the source
  // data has that column.
  const [availability, setAvailability] = useState<Set<Availability>>(new Set());
  const artworks = useMemo(
    () => {
      const filtered = buildCollectArtworks(images)
        .filter(({ index, category: artworkCategory }) => {
          const query = search.trim().toLowerCase();
          if (!query) return true;
          return `name ${index + 1} chungkook lee price by request ${artworkCategory}`
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

      <div className="px-5 pb-3 pt-4 md:hidden">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search artworks"
          onFilterClick={() => setMobileFiltersOpen(true)}
        />
      </div>

      <div className="md:grid md:grid-cols-[280px_minmax(0,1fr)] md:gap-8 md:px-8 md:pb-20 md:pt-6 lg:grid-cols-[300px_minmax(0,1fr)] lg:gap-10 lg:px-12">
        <aside className="hidden md:block" aria-label="Collect filters">
          <div className="sticky top-[89px] max-h-[calc(100vh-110px)] overflow-y-auto pb-8 pr-2">

            <section className="mt-8">
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-neutral-500">Category</p>
              <div className="flex flex-wrap gap-2">
                {CATEGORY_OPTIONS.map((option) => {
                  const active = category === option;
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setCategory(option)}
                      className={`rounded-full border px-3.5 py-1.5 text-[12px] transition-colors ${active ? "border-neutral-900 bg-neutral-900 text-white" : "border-neutral-200 bg-neutral-50 text-neutral-700 hover:border-neutral-300"}`}
                    >
                      {option === "All" ? "All Categories" : option}
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="mt-8 border-t border-neutral-200 pt-6">
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-neutral-500">Price</p>
              <div className="flex flex-wrap gap-2">
                {PRICE_OPTIONS.map((option) => {
                  const active = priceRange === option && minimumPrice === "" && maximumPrice === "";
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => {
                        setPriceRange(option);
                        setMinimumPrice("");
                        setMaximumPrice("");
                      }}
                      className={`rounded-full border px-3.5 py-1.5 text-[12px] transition-colors ${active ? "border-neutral-900 bg-neutral-900 text-white" : "border-neutral-200 bg-neutral-50 text-neutral-700 hover:border-neutral-300"}`}
                    >
                      {option === "All" ? "All Prices" : option.replace("-", "\u2013")}
                    </button>
                  );
                })}
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <label className="flex h-10 items-center rounded-lg border border-neutral-200 bg-white px-2.5 focus-within:border-neutral-400">
                  <input
                    type="number"
                    min="0"
                    inputMode="decimal"
                    value={minimumPrice}
                    onChange={(event) => {
                      setPriceRange("All");
                      setMinimumPrice(event.target.value);
                    }}
                    placeholder="Min price"
                    aria-label="Minimum price"
                    className="min-w-0 flex-1 bg-transparent text-[12px] text-neutral-900 placeholder:text-neutral-400 focus:outline-none"
                  />
                  <span className="ml-1 text-[10px] uppercase tracking-[0.15em] text-neutral-400">USD</span>
                </label>
                <label className="flex h-10 items-center rounded-lg border border-neutral-200 bg-white px-2.5 focus-within:border-neutral-400">
                  <input
                    type="number"
                    min="0"
                    inputMode="decimal"
                    value={maximumPrice}
                    onChange={(event) => {
                      setPriceRange("All");
                      setMaximumPrice(event.target.value);
                    }}
                    placeholder="Max price"
                    aria-label="Maximum price"
                    className="min-w-0 flex-1 bg-transparent text-[12px] text-neutral-900 placeholder:text-neutral-400 focus:outline-none"
                  />
                  <span className="ml-1 text-[10px] uppercase tracking-[0.15em] text-neutral-400">USD</span>
                </label>
              </div>
            </section>

            <section className="mt-8 border-t border-neutral-200 pt-6">
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-neutral-500">Availability</p>
              <ul className="space-y-2.5">
                {AVAILABILITY_OPTIONS.map((option) => {
                  const active = availability.has(option.id);
                  return (
                    <li key={option.id}>
                      <label className="flex cursor-pointer items-center justify-between gap-3 text-[13px] text-neutral-700">
                        <span className="flex items-center gap-3">
                          <span className={`flex h-4 w-4 items-center justify-center rounded border transition-colors ${active ? "border-neutral-900 bg-neutral-900 text-white" : "border-neutral-300 bg-white"}`}>
                            {active && (
                              <svg viewBox="0 0 12 12" className="h-2.5 w-2.5" fill="none" aria-hidden="true">
                                <path d="M2.5 6.2l2.4 2.4L9.5 3.9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            )}
                          </span>
                          <input
                            type="checkbox"
                            className="sr-only"
                            checked={active}
                            onChange={() =>
                              setAvailability((current) => {
                                const next = new Set(current);
                                if (next.has(option.id)) next.delete(option.id); else next.add(option.id);
                                return next;
                              })
                            }
                          />
                          {option.label}
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            </section>

            <section className="mt-8 border-t border-neutral-200 pt-6">
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-neutral-500">Sort By</p>
              <div className="relative">
                <select
                  value={sortOrder}
                  onChange={(event) => setSortOrder(event.target.value as SortOrder)}
                  className="h-10 w-full appearance-none rounded-lg border border-neutral-200 bg-white px-3 pr-8 text-[13px] text-neutral-900 focus:border-neutral-400 focus:outline-none"
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option === "Newest" ? "Recently Added" : option}
                    </option>
                  ))}
                </select>
                <span aria-hidden="true" className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400">\u25be</span>
              </div>
            </section>

            <div className="mt-8 flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  /* Filters apply live; button provided for parity with the reference layout. */
                }}
                className="flex-1 rounded-lg bg-neutral-900 py-3 text-[13px] font-medium text-white transition-opacity hover:opacity-90"
              >
                Apply Filters
              </button>
              <button
                type="button"
                onClick={() => {
                  setCategory("All");
                  setPriceRange("All");
                  setMinimumPrice("");
                  setMaximumPrice("");
                  setSortOrder("Newest");
                  setColumns(4);
                  setAvailability(new Set());
                  setSearch("");
                }}
                className="text-[13px] text-neutral-700 underline-offset-4 transition-opacity hover:underline"
              >
                Clear All
              </button>
            </div>
          </div>
        </aside>

        <div className="min-w-0 md:w-full md:max-w-[1480px]">
          <div className="mb-4 hidden items-center justify-between md:flex">
            <p className="text-[13px] text-neutral-500">{artworks.length} artworks</p>
            <div className="flex items-center gap-3">
              <ColumnsToggle columns={columns} onClick={() => setColumns((current) => (current === 4 ? 2 : 4))} />
            </div>
          </div>
          {artworks.length === 0 ? (
            <p className="px-5 py-16 text-center text-[11px] uppercase tracking-[0.25em] text-neutral-400 md:px-0">
              No artworks match your search.
            </p>
          ) : (
            <section
              aria-label="Collect artworks"
              className={`grid grid-cols-2 gap-3 px-5 pb-20 pt-3 md:px-0 md:pb-0 md:pt-0 md:gap-6 lg:gap-8 ${
                columns === 4 ? "md:grid-cols-3 lg:grid-cols-4" : "md:grid-cols-2 lg:grid-cols-2"
              }`}
            >
              {artworks.map((artwork) => (
                <CollectArtworkCard
                  key={artwork.src}
                  artwork={artwork}
                  columns={columns}
                />
              ))}
            </section>
          )}
        </div>
      </div>
      <MobileFilterSheet
        open={mobileFiltersOpen}
        onClose={() => setMobileFiltersOpen(false)}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search artworks"
        onClearAll={() => {
          setCategory("All");
          setPriceRange("All");
          setMinimumPrice("");
          setMaximumPrice("");
          setSortOrder("Newest");
          setColumns(4);
        }}
        resultCount={artworks.length}
      >
        <LayoutSection<CollectColumns>
          value={columns}
          onChange={setColumns}
          options={[
            { id: 2, label: "Comfortable grid", glyph: LayoutGlyphs.gridNormal },
            { id: 4, label: "Dense grid", glyph: LayoutGlyphs.gridDense },
          ]}
        />
      </MobileFilterSheet>
    </main>
  );
}

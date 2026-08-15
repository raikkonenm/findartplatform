"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { Header } from "./Header";

type CollectColumns = 2 | 4;

const ASPECT_CLASSES = ["aspect-[3/4]", "aspect-[4/5]", "aspect-square"];

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
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Show ${columns === 4 ? 2 : 4} columns`}
      className="flex h-9 w-10 items-center justify-center border border-neutral-200 text-neutral-500 transition-colors hover:border-neutral-400 hover:text-neutral-900"
    >
      <span className="grid grid-cols-2 gap-[3px]" aria-hidden="true">
        {Array.from({ length: columns }).map((_, index) => (
          <span key={index} className="h-[5px] w-[5px] bg-current" />
        ))}
      </span>
    </button>
  );
}

export function CollectArchiveView({ images }: { images: string[] }) {
  const [search, setSearch] = useState("");
  const [columns, setColumns] = useState<CollectColumns>(4);
  const artworks = useMemo(
    () =>
      images
        .map((src, index) => ({ src, index }))
        .filter(({ index }) => {
          const query = search.trim().toLowerCase();
          if (!query) return true;
          return `name ${index + 1} chungkook lee price by request`.includes(query);
        }),
    [images, search],
  );

  return (
    <main className="min-h-screen overflow-x-hidden bg-white pt-[65px]">
      <Header />

      <div className="flex items-center justify-end gap-3 px-5 pb-3 pt-4 md:px-8 lg:px-12">
        <SearchControl value={search} onChange={setSearch} />
        <ColumnsToggle columns={columns} onClick={() => setColumns((current) => (current === 4 ? 2 : 4))} />
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

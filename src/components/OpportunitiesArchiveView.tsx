"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { OpportunityDetailContent } from "@/components/OpportunityDetailContent";
import { ChevronIcon, CloseIcon, ExternalArrowIcon } from "@/components/OpportunityIcons";
import {
  opportunityDisplayTitle,
  opportunityLocationParts,
  opportunityPrimaryType,
  opportunityTypeUrl,
  opportunityUrl,
} from "@/lib/opportunityTaxonomy";
import {
  OPPORTUNITIES,
  type Opportunity,
  opportunitySavedKey,
} from "@/data/opportunities";
import { Header } from "./Header";
import { HeartIcon, useSavedExhibitions } from "./SavedExhibitions";
import { SearchBar } from "./SearchBar";

function renderLocationLinks(opportunity: Opportunity, stopRowClick = false) {
  const parts = opportunityLocationParts(opportunity);
  if (parts.length === 0) return opportunity.location;
  return parts.reduce<React.ReactNode[]>((acc, part, index) => {
    if (index > 0) acc.push(", ");
    acc.push(
      <Link
        key={`${part.kind}-${part.name}`}
        href={part.href}
        onClick={stopRowClick ? (event) => event.stopPropagation() : undefined}
        className="transition-opacity hover:opacity-55"
      >
        {part.name}
      </Link>,
    );
    return acc;
  }, []);
}

const FILTERS = {
  type: ["Types", "Residencies", "Awards & Prizes", "Calls for Curators", "Collaborations", "Commissions", "Education", "Grants & Stipends", "Jobs", "Open Calls"],
  field: ["All fields", "Applied Arts", "Architecture", "Curating", "Dance", "Design", "Digital", "Drawing", "Education", "Fashion", "Film", "Installation", "Interdisciplinary", "Painting", "Performance", "Photography", "Printmaking", "Public Art", "Research", "Sculpture", "Social Practice", "Sound Art", "Textiles", "Video", "Visual Arts", "Writing"],
  reward: ["All rewards", "Accommodation", "Cash Prize", "Exhibition", "Funding", "Production", "Publication", "Travel", "Studio Space", "Equipment", "Meals", "Education", "Other"],
} as const;

type FilterMode = keyof typeof FILTERS;
type ViewMode = "grid" | "list";
type FeeFilter = "all" | "free" | "paid";
type SortDirection = "asc" | "desc";

const AUDIENCE_OPTIONS = [
  "Individual artists",
  "Collectives / groups",
  "Curators",
  "Organizations & non-profits",
  "Emerging / young artists",
  "Sound artists",
  "Photographers",
  "Performing artists",
  "Food practitioners",
  "Interdisciplinary practitioners",
] as const;

const FILTER_LABELS: Record<FilterMode, string> = { type: "Type", field: "Artistic field", reward: "Reward" };


const SHORT_MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function shortDeadline(isoDate: string): string {
  const [, month, day] = isoDate.split("-").map(Number);
  return `${String(day).padStart(2, "0")} ${SHORT_MONTHS[month - 1]}`;
}

function longDeadline(isoDate: string): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  return `${day} ${MONTH_NAMES[month - 1]} ${year}`;
}

function daysRemainingLabel(isoDate: string, today: Date | null): string {
  if (!today) return "";
  const target = new Date(`${isoDate}T23:59:59`);
  const msPerDay = 86_400_000;
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const startOfTarget = new Date(target.getFullYear(), target.getMonth(), target.getDate());
  const diffDays = Math.round((startOfTarget.getTime() - startOfToday.getTime()) / msPerDay);
  if (diffDays < 0) return "CLOSED";
  if (diffDays === 0) return "TODAY";
  if (diffDays === 1) return "1 DAY LEFT";
  return `${diffDays} DAYS LEFT`;
}

function OpportunitiesInlineSearch({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const expanded = value.length > 0;
  return (
    <label className="group/search flex h-9 cursor-text items-center justify-end text-neutral-500">
      <span className="sr-only">Search opportunities</span>
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search opportunities"
        className={`h-9 border-0 border-b border-neutral-300 bg-transparent text-[12px] uppercase tracking-[0.18em] text-neutral-900 transition-[width,opacity] duration-300 ease-out placeholder:text-neutral-400 focus:border-neutral-900 focus:outline-none ${
          expanded
            ? "mr-2 w-56 opacity-100"
            : "w-0 opacity-0 group-hover/search:mr-2 group-hover/search:w-56 group-hover/search:opacity-100 group-focus-within/search:mr-2 group-focus-within/search:w-56 group-focus-within/search:opacity-100"
        }`}
      />
      <svg
        viewBox="0 0 20 20"
        className="h-4 w-4 shrink-0 transition-colors duration-200 group-hover/search:text-neutral-900 group-focus-within/search:text-neutral-900"
        fill="none"
        aria-hidden="true"
      >
        <circle cx="8.5" cy="8.5" r="5.5" stroke="currentColor" strokeWidth="1.25" />
        <path d="m12.5 12.5 4 4" stroke="currentColor" strokeWidth="1.25" />
      </svg>
    </label>
  );
}

function OpportunitiesViewToggle({ viewMode, onChange }: { viewMode: ViewMode; onChange: (value: ViewMode) => void }) {
  return (
    <div className="inline-flex items-center border border-neutral-200 text-neutral-700">
      <button
        type="button"
        onClick={() => onChange("grid")}
        aria-label="Grid view"
        aria-pressed={viewMode === "grid"}
        className={`flex h-9 w-9 items-center justify-center transition-colors ${viewMode === "grid" ? "bg-neutral-900 text-white" : "hover:text-neutral-900"}`}
      >
        <svg viewBox="0 0 18 18" className="h-[14px] w-[14px]" fill="none" aria-hidden="true">
          <rect x="2" y="2" width="6" height="6" stroke="currentColor" strokeWidth="1.35" />
          <rect x="10" y="2" width="6" height="6" stroke="currentColor" strokeWidth="1.35" />
          <rect x="2" y="10" width="6" height="6" stroke="currentColor" strokeWidth="1.35" />
          <rect x="10" y="10" width="6" height="6" stroke="currentColor" strokeWidth="1.35" />
        </svg>
      </button>
      <button
        type="button"
        onClick={() => onChange("list")}
        aria-label="List view"
        aria-pressed={viewMode === "list"}
        className={`flex h-9 w-9 items-center justify-center border-l border-neutral-200 transition-colors ${viewMode === "list" ? "bg-neutral-900 text-white" : "hover:text-neutral-900"}`}
      >
        <svg viewBox="0 0 18 18" className="h-[14px] w-[14px]" fill="none" aria-hidden="true">
          <path d="M3 5h12M3 9h12M3 13h12" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}

function FeeTag({ fee, compact = false }: { fee: string; compact?: boolean }) {
  const isFree = fee.toUpperCase() === "FREE";
  const sizing = compact ? "px-2.5 py-1 text-[10px]" : "px-3 py-1.5 text-[11px]";
  return (
    <span
      className={`inline-flex items-center rounded-md border border-[var(--foreground)] font-medium uppercase tracking-[0.14em] text-[var(--foreground)] ${sizing} ${
        isFree ? "free-tag-blink" : ""
      }`}
    >
      {isFree ? "Free to apply" : compact ? fee : `Application fee ${fee}`}
    </span>
  );
}

function OpportunityCard({ opportunity, onOpen, isSaved, onToggleSaved }: { opportunity: Opportunity; onOpen: () => void; isSaved: boolean; onToggleSaved: () => void }) {
  return (
    <article className="group/card relative flex min-h-[260px] flex-col border border-[var(--border)] p-3 transition-colors duration-300 hover:border-neutral-500 md:min-h-[340px] md:p-5">
      <button
        type="button"
        aria-label={isSaved ? `Remove ${opportunity.title} from saved` : `Save ${opportunity.title}`}
        aria-pressed={isSaved}
        onClick={(event) => {
          event.stopPropagation();
          onToggleSaved();
        }}
        className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-md border border-neutral-300 bg-white/85 text-neutral-900 shadow-sm backdrop-blur-sm transition-opacity duration-200 hover:opacity-70 focus-visible:opacity-100 focus-visible:outline-none"
      >
        <HeartIcon filled={isSaved} className="h-4 w-4" />
      </button>
      <div className="mb-4 flex items-start justify-between gap-2 pr-12 md:mb-8 md:gap-3">
        <p className="text-[9px] uppercase tracking-[0.2em] text-neutral-500 md:text-[10px]">{opportunity.organizer}</p>
        <FeeTag fee={opportunity.applicationFee} />
      </div>
      <Link
        href={opportunityUrl(opportunity)}
        onClick={(event) => {
          event.preventDefault();
          onOpen();
        }}
        className="editorial-serif mb-6 block text-left text-[clamp(1.15rem,4.5vw,1.6rem)] leading-[1.05] tracking-[-0.035em] transition-opacity group-hover/card:opacity-75 md:mb-8 md:text-[clamp(1.35rem,2.2vw,2rem)] md:leading-[1.02]"
      >
        {opportunityDisplayTitle(opportunity.title)}
      </Link>
      <dl className="space-y-2 border-t border-[var(--border)] pt-3 text-[11px] leading-relaxed md:space-y-4 md:pt-5 md:text-[12px]">
        <div className="grid grid-cols-[70px_1fr] gap-2 md:grid-cols-[88px_1fr] md:gap-3"><dt className="text-[8px] uppercase tracking-[0.2em] text-neutral-500 md:text-[9px]">Deadline</dt><dd>{opportunity.deadline}</dd></div>
        <div className="grid grid-cols-[70px_1fr] gap-2 md:grid-cols-[88px_1fr] md:gap-3"><dt className="text-[8px] uppercase tracking-[0.2em] text-neutral-500 md:text-[9px]">Location</dt><dd>{opportunity.location}</dd></div>
        <div className="hidden md:grid md:grid-cols-[88px_1fr] md:gap-3"><dt className="text-[9px] uppercase tracking-[0.2em] text-neutral-500">For</dt><dd>{opportunity.audience}</dd></div>
      </dl>
      <div className="mt-auto pt-5 md:pt-8">
        <div className="hidden flex-wrap gap-2 md:flex">
          {opportunity.tags.map((tag) => <span key={tag} className="border border-[var(--border)] px-2.5 py-1.5 text-[8px] uppercase tracking-[0.18em]">{tag}</span>)}
        </div>
      </div>
    </article>
  );
}

// Desktop table grid: OPPORTUNITY (+ organizer under) · TYPE · DEADLINE · LOCATION · FOR · FEE
// (TAGS column is hidden per design; tag filter still active in the filter row above.)
const LIST_ROW_COLS =
  "md:grid-cols-[minmax(0,2.4fr)_110px_110px_minmax(0,1.1fr)_minmax(0,1.3fr)_120px]";

function OpportunityRow({ opportunity, onOpen, isSaved, onToggleSaved, today }: { opportunity: Opportunity; onOpen: () => void; isSaved: boolean; onToggleSaved: () => void; today: Date | null }) {
  const daysLeft = daysRemainingLabel(opportunity.deadlineDate, today);
  const primaryType = opportunityPrimaryType(opportunity);

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.target !== event.currentTarget) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onOpen();
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={onKeyDown}
      className={`group relative grid cursor-pointer grid-cols-[1fr_auto_auto] items-start gap-x-3 gap-y-2 border-b border-neutral-200 px-2 py-6 transition-colors duration-200 hover:bg-neutral-50 ${LIST_ROW_COLS} md:items-center md:gap-x-6 md:px-4 md:py-6 md:pr-14`}
    >
      {/* Desktop: floating heart at right-inside of the row */}
      <button
        type="button"
        aria-label={isSaved ? "Unsave opportunity" : "Save opportunity"}
        aria-pressed={isSaved}
        onClick={(event) => {
          event.stopPropagation();
          onToggleSaved();
        }}
        className="absolute right-3 top-1/2 z-10 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md border border-neutral-300 bg-white/85 text-neutral-900 shadow-sm transition-opacity hover:opacity-70 md:flex"
      >
        <HeartIcon filled={isSaved} className="h-4 w-4" />
      </button>

      {/* TYPE eyebrow — mobile only */}
      {primaryType ? (
        <Link
          href={opportunityTypeUrl(primaryType.slug)}
          onClick={(event) => event.stopPropagation()}
          className="order-1 col-span-3 text-[10px] uppercase tracking-[0.22em] text-neutral-500 md:hidden"
        >
          {primaryType.label}
        </Link>
      ) : null}

      {/* OPPORTUNITY — headline + organizer underneath on desktop */}
      <div className="order-2 col-span-2 md:order-none md:col-span-1">
        <Link
          href={opportunityUrl(opportunity)}
          onClick={(event) => {
            event.stopPropagation();
            event.preventDefault();
            onOpen();
          }}
          className="editorial-serif break-words text-[clamp(1.05rem,4vw,1.4rem)] leading-[1.08] tracking-[-0.035em] text-neutral-900 transition-opacity group-hover:opacity-70 md:text-[clamp(1.15rem,1.9vw,1.75rem)] md:leading-[1.02]"
        >
          {opportunityDisplayTitle(opportunity.title)}
        </Link>
        <p className="mt-1 hidden text-[10px] uppercase tracking-[0.16em] text-neutral-500 md:block">
          {opportunity.organizer}
        </p>
      </div>

      {/* Mobile: heart as its own grid column at the right — outside the card content */}
      <button
        type="button"
        aria-label={isSaved ? "Unsave opportunity" : "Save opportunity"}
        aria-pressed={isSaved}
        onClick={(event) => {
          event.stopPropagation();
          onToggleSaved();
        }}
        className="order-3 flex h-9 w-9 shrink-0 items-center justify-center self-start rounded-md border border-neutral-300 bg-white text-neutral-900 shadow-sm transition-opacity hover:opacity-70 md:hidden"
      >
        <HeartIcon filled={isSaved} className="h-4 w-4" />
      </button>

      {/* TYPE — desktop */}
      {primaryType ? (
        <Link
          href={opportunityTypeUrl(primaryType.slug)}
          onClick={(event) => event.stopPropagation()}
          className="hidden text-[13px] text-neutral-700 transition-opacity hover:opacity-55 md:block"
        >
          {primaryType.label}
        </Link>
      ) : null}

      {/* DEADLINE */}
      <div className="order-5 justify-self-end text-right md:order-none md:justify-self-start md:text-left">
        <div className="text-[13px] text-neutral-900 md:text-neutral-800">{longDeadline(opportunity.deadlineDate)}</div>
        {daysLeft && (
          <div className="mt-0.5 text-[9px] uppercase tracking-[0.2em] text-neutral-400 md:hidden">{daysLeft}</div>
        )}
      </div>

      {/* LOCATION */}
      <span className="hidden text-[13px] leading-snug text-neutral-700 md:block">
        {renderLocationLinks(opportunity, true)}
      </span>

      {/* FOR (audience) */}
      <span className="hidden text-[13px] leading-snug text-neutral-500 md:block">
        {opportunity.audience}
      </span>

      {/* APPLICATION FEE — desktop */}
      <span className="hidden md:block">
        <FeeTag fee={opportunity.applicationFee} compact />
      </span>

      {/* TAGS column intentionally omitted (filter still available above). */}

      {/* FEE — mobile bottom-left */}
      <span className="order-4 text-[11px] uppercase tracking-[0.18em] text-neutral-700 md:hidden">
        <FeeTag fee={opportunity.applicationFee} compact />
      </span>

    </div>
  );
}

function OpportunitiesListView({ opportunities, onOpen, isSaved, onToggleSaved, sortDirection, onToggleSort, today }: { opportunities: Opportunity[]; onOpen: (opp: Opportunity) => void; isSaved: (slug: string) => boolean; onToggleSaved: (slug: string) => void; sortDirection: SortDirection; onToggleSort: () => void; today: Date | null }) {
  return (
    <div className="mt-8">
      {/* Column header — desktop only, matches OpportunityRow grid template. */}
      <div className={`hidden border-y border-neutral-200 bg-neutral-100 px-4 py-3.5 text-[10px] uppercase tracking-[0.18em] text-neutral-500 md:grid ${LIST_ROW_COLS} md:items-center md:gap-x-6`}>
        <span className="flex items-center gap-1">Opportunity <ChevronIcon direction="down" className="h-2.5 w-2.5" /></span>
        <span>Type</span>
        <button
          type="button"
          onClick={onToggleSort}
          className="flex items-center gap-1 text-left uppercase tracking-[0.18em] text-neutral-500 transition-opacity hover:opacity-70"
          aria-label={`Sort by deadline ${sortDirection === "asc" ? "descending" : "ascending"}`}
        >
          Deadline <ChevronIcon direction={sortDirection === "asc" ? "down" : "up"} className="h-2.5 w-2.5" />
        </button>
        <span>Location</span>
        <span>For</span>
        <span>Application Fee</span>
      </div>

      <div>
        {opportunities.map((opp) => (
          <OpportunityRow
            key={opp.slug}
            opportunity={opp}
            onOpen={() => onOpen(opp)}
            isSaved={isSaved(opp.slug)}
            onToggleSaved={() => onToggleSaved(opp.slug)}
            today={today}
          />
        ))}
      </div>
    </div>
  );
}

function OpportunityDetail({ opportunity, onClose }: { opportunity: Opportunity; onClose: () => void }) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-x-0 bottom-0 top-[65px] z-[70]" role="dialog" aria-modal="true">
      <button type="button" aria-label="Close opportunity" onClick={onClose} className="absolute inset-0 bg-black/25" />
      <aside className="absolute inset-x-0 top-0 max-h-[92vh] w-full overflow-y-auto bg-[var(--background)] shadow-[0_16px_35px_rgba(0,0,0,0.15)] md:inset-y-0 md:right-0 md:left-auto md:top-0 md:max-h-none md:w-[72vw] md:shadow-[-12px_0_35px_rgba(0,0,0,0.12)] lg:w-[62vw] lg:max-w-[1050px]">
        <OpportunityDetailContent
          opportunity={opportunity}
          closeButton={
            <button type="button" onClick={onClose} aria-label="Close opportunity" className="flex h-10 w-10 shrink-0 items-center justify-center font-light leading-none transition-opacity hover:opacity-50"><CloseIcon className="h-5 w-5" /></button>
          }
        />
      </aside>
    </div>
  );
}

const FEE_FILTERS: Array<{ id: FeeFilter; label: string }> = [
  { id: "all", label: "All" },
  { id: "free", label: "Free to apply" },
  { id: "paid", label: "Paid application" },
];

function MobileFiltersDrawer({ open, onClose, selectedFilters, setSelectedFilters, feeFilter, setFeeFilter, resultCount, onReset, viewMode, setViewMode, sortDirection, setSortDirection }: { open: boolean; onClose: () => void; selectedFilters: Record<FilterMode, string>; setSelectedFilters: (fn: (current: Record<FilterMode, string>) => Record<FilterMode, string>) => void; feeFilter: FeeFilter; setFeeFilter: (value: FeeFilter) => void; resultCount: number; onReset: () => void; viewMode: ViewMode; setViewMode: (value: ViewMode) => void; sortDirection: SortDirection; setSortDirection: (value: SortDirection) => void; }) {
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  // Chips row for a filter dimension. Horizontal scroll on overflow.
  const chipRow = (mode: FilterMode) => (
    <section key={mode} className="border-t border-neutral-200 pt-6">
      <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-neutral-500">
        {FILTER_LABELS[mode]}
      </p>
      <div className="scrollbar-none -mx-1 flex gap-2 overflow-x-auto pb-1 px-1">
        {FILTERS[mode].map((option) => {
          const active = selectedFilters[mode] === option;
          return (
            <button
              key={option}
              type="button"
              onClick={() => setSelectedFilters((current) => ({ ...current, [mode]: option }))}
              className={`whitespace-nowrap rounded-full border px-3.5 py-1.5 text-[12px] transition-colors ${active ? "border-neutral-900 bg-neutral-900 text-white" : "border-neutral-200 bg-neutral-50 text-neutral-700 hover:border-neutral-300"}`}
            >
              {option}
            </button>
          );
        })}
      </div>
    </section>
  );

  const layoutButton = (mode: ViewMode, label: string, glyph: React.ReactNode) => {
    const active = viewMode === mode;
    return (
      <button
        key={mode}
        type="button"
        onClick={() => setViewMode(mode)}
        aria-pressed={active}
        aria-label={label}
        className={`flex h-10 w-10 items-center justify-center rounded-full border transition-colors ${active ? "border-neutral-900 bg-neutral-100 text-neutral-900" : "border-neutral-200 text-neutral-500 hover:border-neutral-300"}`}
      >
        {glyph}
      </button>
    );
  };

  const viewOptions: Array<{ id: FeeFilter; label: string }> = FEE_FILTERS;

  return (
    <div className="fixed inset-0 z-[80] md:hidden" role="dialog" aria-modal="true" aria-label="Filter & Sort">
      <button type="button" aria-label="Close filters" onClick={onClose} className="absolute inset-0 bg-black/40" />
      <aside className="absolute inset-x-0 top-0 flex max-h-[92vh] w-full flex-col bg-white shadow-[0_16px_35px_rgba(0,0,0,0.15)]">
        <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4">
          <h2 className="text-[15px] font-medium text-neutral-900">Filter &amp; Sort</h2>
          <button type="button" onClick={onClose} aria-label="Close filters" className="flex h-9 w-9 items-center justify-center rounded-md border border-neutral-200 text-neutral-700 transition-colors hover:border-neutral-400">
            <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" aria-hidden="true">
              <path d="M4 4l12 12M16 4L4 16" stroke="currentColor" strokeWidth="1.35" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 pt-4">
          <div className="mb-4 flex justify-end">
            <button
              type="button"
              onClick={onReset}
              className="text-[13px] text-neutral-700 underline-offset-4 hover:underline"
            >
              Clear all
            </button>
          </div>

          <div className="mt-2 space-y-6 pb-6">
            {chipRow("type")}
            {chipRow("field")}
            {chipRow("reward")}

            {/* LAYOUT — icons for grid/list */}
            <section className="border-t border-neutral-200 pt-6">
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-neutral-500">
                Layout
              </p>
              <div className="flex gap-3">
                {layoutButton(
                  "grid",
                  "Grid layout",
                  <svg viewBox="0 0 18 18" className="h-4 w-4" fill="none" aria-hidden="true">
                    <rect x="2" y="2" width="6" height="6" stroke="currentColor" strokeWidth="1.35" />
                    <rect x="10" y="2" width="6" height="6" stroke="currentColor" strokeWidth="1.35" />
                    <rect x="2" y="10" width="6" height="6" stroke="currentColor" strokeWidth="1.35" />
                    <rect x="10" y="10" width="6" height="6" stroke="currentColor" strokeWidth="1.35" />
                  </svg>
                )}
                {layoutButton(
                  "list",
                  "List layout",
                  <svg viewBox="0 0 18 18" className="h-4 w-4" fill="none" aria-hidden="true">
                    <path d="M3 5h12M3 9h12M3 13h12" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" />
                  </svg>
                )}
              </div>
            </section>

            {/* VIEW — application fee list */}
            <section className="border-t border-neutral-200 pt-6">
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-neutral-500">
                Application fee
              </p>
              <ul>
                {viewOptions.map((option) => {
                  const active = feeFilter === option.id;
                  return (
                    <li key={option.id}>
                      <button
                        type="button"
                        onClick={() => setFeeFilter(option.id)}
                        className={`flex w-full items-center justify-between px-3 py-3 text-[14px] transition-colors ${active ? "rounded-md bg-neutral-100 text-neutral-900" : "text-neutral-600 hover:text-neutral-900"}`}
                      >
                        <span>{option.label}</span>
                        {active && <span className="h-2 w-2 rounded-full bg-neutral-900" aria-hidden="true" />}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>

            {/* SORT */}
            <section className="border-t border-neutral-200 pt-6">
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-neutral-500">
                Sort
              </p>
              <ul>
                {[
                  { id: "asc" as SortDirection, label: "Deadline · Soonest first" },
                  { id: "desc" as SortDirection, label: "Deadline · Latest first" },
                ].map((option) => {
                  const active = sortDirection === option.id;
                  return (
                    <li key={option.id}>
                      <button
                        type="button"
                        onClick={() => setSortDirection(option.id)}
                        className={`flex w-full items-center justify-between px-3 py-3 text-[14px] transition-colors ${active ? "rounded-md bg-neutral-100 text-neutral-900" : "text-neutral-600 hover:text-neutral-900"}`}
                      >
                        <span>{option.label}</span>
                        {active && <span className="h-2 w-2 rounded-full bg-neutral-900" aria-hidden="true" />}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          </div>
        </div>

        <div className="border-t border-neutral-200 px-5 py-4">
          <button type="button" onClick={onClose} className="w-full rounded-lg bg-neutral-900 py-3 text-[13px] font-medium text-white transition-opacity hover:opacity-90">
            Show {resultCount} {resultCount === 1 ? "result" : "results"}
          </button>
        </div>
      </aside>
    </div>
  );
}

type DesktopMode = "type" | "fee" | "location" | "audience" | "tags";

export function OpportunitiesArchiveView() {
  const [selectedFilters, setSelectedFilters] = useState<Record<FilterMode, string>>({ type: FILTERS.type[0], field: FILTERS.field[0], reward: FILTERS.reward[0] });
  const [feeFilter, setFeeFilter] = useState<FeeFilter>("all");
  const [selectedLocation, setSelectedLocation] = useState("All");
  const [selectedAudience, setSelectedAudience] = useState("All");
  const [selectedTag, setSelectedTag] = useState("All");
  const [desktopMode, setDesktopMode] = useState<DesktopMode>("tags");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const { isSaved: isSavedGlobal, toggleSaved: toggleSavedGlobal } = useSavedExhibitions();
  const [today, setToday] = useState<Date | null>(null);
  const [selectedOpportunity, setSelectedOpportunityState] = useState<Opportunity | null>(null);
  const [query, setQuery] = useState("");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Bidirectional URL sync: opening a card pushes ?opp=slug so the URL
  // is shareable and bookmarkable; landing on such a URL opens the
  // corresponding drawer on first paint. Closing the drawer clears the
  // param.
  const openOpportunity = useCallback(
    (opp: Opportunity | null) => {
      setSelectedOpportunityState(opp);
      if (typeof window === "undefined") return;
      const params = new URLSearchParams(window.location.search);
      if (opp) params.set("opp", opp.slug);
      else params.delete("opp");
      const query = params.toString();
      router.replace(query ? `/opportunities?${query}` : "/opportunities", { scroll: false });
    },
    [router],
  );

  useEffect(() => {
    const slug = searchParams.get("opp");
    if (!slug) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (selectedOpportunity) setSelectedOpportunityState(null);
      return;
    }
    if (selectedOpportunity?.slug === slug) return;
    const match = OPPORTUNITIES.find((o) => o.slug === slug);
    if (match) setSelectedOpportunityState(match);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);
  const optionsRailRef = useRef<HTMLDivElement>(null);
  const railPausedRef = useRef(false);
  const railManualScrollRef = useRef<number | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setToday(new Date());
  }, []);

  const updateRailArrows = useCallback(() => {
    const rail = optionsRailRef.current;
    if (!rail) return;
    setCanScrollLeft(rail.scrollLeft > 2);
    setCanScrollRight(rail.scrollLeft + rail.clientWidth < rail.scrollWidth - 2);
  }, []);

  // Reset scroll + arrows whenever the active filter mode changes.
  useEffect(() => {
    const rail = optionsRailRef.current;
    if (!rail) return;
    rail.scrollLeft = 0;
    updateRailArrows();
    const observer = new ResizeObserver(updateRailArrows);
    observer.observe(rail);
    return () => observer.disconnect();
  }, [desktopMode, updateRailArrows]);

  // Auto-scroll the options rail for the active mode (mirrors /exhibitions).
  // Pauses on hover, respects prefers-reduced-motion.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const rail = optionsRailRef.current;
    if (!rail) return;
    const timer = window.setInterval(() => {
      if (railPausedRef.current) return;
      if (rail.scrollWidth <= rail.clientWidth) return;
      const end = rail.scrollWidth - rail.clientWidth;
      rail.scrollLeft = rail.scrollLeft >= end - 1 ? 0 : rail.scrollLeft + 1;
    }, 30);
    return () => window.clearInterval(timer);
  }, [desktopMode]);

  const stopManualScroll = useCallback(() => {
    if (railManualScrollRef.current !== null) {
      window.clearInterval(railManualScrollRef.current);
      railManualScrollRef.current = null;
    }
  }, []);

  const startManualScroll = useCallback((direction: -1 | 1) => {
    stopManualScroll();
    railManualScrollRef.current = window.setInterval(() => {
      optionsRailRef.current?.scrollBy({ left: direction * 12 });
    }, 20);
  }, [stopManualScroll]);

  useEffect(() => stopManualScroll, [stopManualScroll]);

  // Structured country → cities tree, derived from opportunity.location
  // strings which use "City, Country" (or a single token like "Global" /
  // "Remote").
  const locationTree = useMemo(() => {
    const byCountry = new Map<string, Set<string>>();
    for (const opp of OPPORTUNITIES) {
      const raw = opp.location.trim();
      const commaIndex = raw.lastIndexOf(",");
      const country = commaIndex >= 0 ? raw.slice(commaIndex + 1).trim() : raw;
      const city = commaIndex >= 0 ? raw.slice(0, commaIndex).trim() : "";
      if (!byCountry.has(country)) byCountry.set(country, new Set());
      if (city) byCountry.get(country)!.add(city);
    }
    return Array.from(byCountry.entries())
      .map(([country, cities]) => ({ country, cities: Array.from(cities).sort() }))
      .sort((a, b) => a.country.localeCompare(b.country));
  }, []);
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const audienceOptions = useMemo(
    () => ["All", ...AUDIENCE_OPTIONS],
    [],
  );
  const tagOptions = useMemo(
    () => ["All", ...Array.from(new Set(OPPORTUNITIES.flatMap((o) => o.tags))).sort()],
    [],
  );

  const visibleOpportunities = useMemo(() => {
    const q = query.trim().toLowerCase();
    // Drop opportunities whose deadline has already passed. During SSR
    // and the first render `today` is null so nothing is dropped —
    // filtering kicks in after mount, avoiding a hydration mismatch.
    const todayISO = today
      ? `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`
      : null;
    const filtered = OPPORTUNITIES.filter((opportunity) => {
      const notExpired = !todayISO || opportunity.deadlineDate >= todayISO;
      if (!notExpired) return false;
      const typeMatches = selectedFilters.type === FILTERS.type[0] || opportunity.type.includes(selectedFilters.type);
      const fieldMatches = selectedFilters.field === FILTERS.field[0] || opportunity.fields.includes(selectedFilters.field);
      const rewardMatches = selectedFilters.reward === FILTERS.reward[0] || opportunity.rewards.includes(selectedFilters.reward);
      const isFree = opportunity.applicationFee.toUpperCase() === "FREE";
      const feeMatches = feeFilter === "all" || (feeFilter === "free" && isFree) || (feeFilter === "paid" && !isFree);
      const locationMatches = (() => {
        if (selectedLocation === "All") return true;
        if (opportunity.location === selectedLocation) return true;
        // Country-only selection: match any opportunity in that country.
        return opportunity.location.endsWith(`, ${selectedLocation}`) || opportunity.location === selectedLocation;
      })();
      const audienceMatches = selectedAudience === "All" || opportunity.audiences.includes(selectedAudience);
      const tagMatches = selectedTag === "All" || opportunity.tags.includes(selectedTag);
      const queryMatches = !q || opportunity.title.toLowerCase().includes(q) || opportunity.organizer.toLowerCase().includes(q) || opportunity.location.toLowerCase().includes(q) || opportunity.tags.some((tag) => tag.toLowerCase().includes(q));
      return typeMatches && fieldMatches && rewardMatches && feeMatches && locationMatches && audienceMatches && tagMatches && queryMatches;
    });
    if (viewMode === "list") {
      return [...filtered].sort((a, b) => {
        const cmp = a.deadlineDate.localeCompare(b.deadlineDate);
        return sortDirection === "asc" ? cmp : -cmp;
      });
    }
    return filtered;
  }, [selectedFilters, feeFilter, selectedLocation, selectedAudience, selectedTag, viewMode, sortDirection, query, today]);

  const activeFilterCount = (selectedFilters.type !== FILTERS.type[0] ? 1 : 0) + (selectedFilters.field !== FILTERS.field[0] ? 1 : 0) + (selectedFilters.reward !== FILTERS.reward[0] ? 1 : 0) + (feeFilter !== "all" ? 1 : 0) + (selectedLocation !== "All" ? 1 : 0) + (selectedAudience !== "All" ? 1 : 0) + (selectedTag !== "All" ? 1 : 0);
  const resetMobileFilters = () => {
    setSelectedFilters({ type: FILTERS.type[0], field: FILTERS.field[0], reward: FILTERS.reward[0] });
    setFeeFilter("all");
  };

  const toggleSaved = (slug: string) => {
    toggleSavedGlobal(opportunitySavedKey(slug));
  };
  const isOpportunitySaved = (slug: string) => isSavedGlobal(opportunitySavedKey(slug));

  return (
    <main className="min-h-screen overflow-x-hidden bg-[var(--background)] pt-[65px] text-[var(--foreground)]">
      <Header />
      <section className="px-5 pb-24 pt-8 md:px-8 md:pt-6 lg:px-12">
        {/* H1 is present but sr-only on every viewport — the page title is
            handled by the mobile FILTERS row and by the filter chips on desktop. */}
        <h1 className="sr-only">Opportunities</h1>
        <div className="hidden md:flex md:justify-end">
          <Link
            href="/submit-opportunities"
            className="whitespace-nowrap text-[13px] font-semibold uppercase tracking-[0.2em] text-neutral-900 underline decoration-1 underline-offset-[6px] transition-opacity hover:opacity-55"
          >
            Submit Opportunities <ExternalArrowIcon />
          </Link>
        </div>

        {/* Mobile-only header row: Submit Opportunities link left, FILTERS text right. */}
        <div className="flex items-center justify-between md:hidden">
          <Link
            href="/submit-opportunities"
            className="text-[11px] font-medium uppercase tracking-[0.18em] text-neutral-900 transition-opacity hover:opacity-60"
          >
            SUBMIT OPPORTUNITIES <ExternalArrowIcon />
          </Link>
          <button
            type="button"
            onClick={() => setMobileFiltersOpen(true)}
            className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.18em] text-neutral-700 transition-opacity hover:opacity-60"
          >
            FILTERS
            {activeFilterCount > 0 && (
              <span className="inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-neutral-900 px-1 text-[9px] font-semibold text-white">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Desktop: one row of filter categories (label + current value),
            hovering swaps the rail below to that category's options.
            Matches the /exhibitions filter pattern. */}
        {(() => {
          const feeLabel =
            feeFilter === "all" ? "Fees" : feeFilter === "free" ? "Free to apply" : "Paid application";
          const modes: Array<{ id: DesktopMode; label: string }> = [
            {
              id: "tags",
              label: selectedTag === "All" ? "TAGS" : selectedTag.toUpperCase(),
            },
            {
              id: "type",
              label:
                selectedFilters.type === FILTERS.type[0]
                  ? "TYPES"
                  : selectedFilters.type.toUpperCase(),
            },
            {
              id: "fee",
              label: feeFilter === "all" ? "APPLICATION FEE" : feeLabel.toUpperCase(),
            },
            {
              id: "location",
              label:
                selectedLocation === "All"
                  ? "LOCATIONS"
                  : selectedLocation.toUpperCase(),
            },
            {
              id: "audience",
              label: selectedAudience === "All" ? "FOR" : selectedAudience.toUpperCase(),
            },
          ];
          return (
            <div className="mt-3 hidden items-baseline gap-8 md:flex">
              {modes.map((m) => {
                const active = desktopMode === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setDesktopMode(m.id)}
                    onMouseEnter={() => setDesktopMode(m.id)}
                    className={`shrink-0 whitespace-nowrap text-[11px] uppercase tracking-[0.18em] transition-colors ${active ? "font-semibold text-neutral-900" : "text-neutral-500 hover:text-neutral-800"}`}
                  >
                    {m.label}
                  </button>
                );
              })}
            </div>
          );
        })()}

        {/* Divider under the filter category row (desktop only). */}
        <hr className="mt-4 hidden border-neutral-200 md:block" />

        {/* Options rail for the current desktop mode — horizontal scroll, click to filter. */}
        <div className="mt-4 hidden md:block">
          {(() => {
            const config: Record<
              DesktopMode,
              { options: string[]; current: string; onSelect: (option: string) => void; labelFor: (option: string) => string }
            > = {
              type: {
                options: [...FILTERS.type],
                current: selectedFilters.type,
                onSelect: (option) =>
                  setSelectedFilters((current) => ({ ...current, type: option })),
                labelFor: (option) => (option === FILTERS.type[0] ? "Types" : option),
              },
              fee: {
                options: ["all", "free", "paid"],
                current: feeFilter,
                onSelect: (option) => setFeeFilter(option as FeeFilter),
                labelFor: (option) =>
                  option === "all" ? "Fees" : option === "free" ? "Free to apply" : "Paid application",
              },
              location: {
                options: ["All", ...locationTree.map((entry) => entry.country)],
                current:
                  selectedLocation === "All"
                    ? "All"
                    : (locationTree.find((e) => e.country === selectedLocation) ? selectedLocation
                        : locationTree.find((e) => selectedLocation.endsWith(`, ${e.country}`))?.country ?? "All"),
                onSelect: (option) => setSelectedLocation(option === "All" ? "All" : option),
                labelFor: (option) => (option === "All" ? "Locations" : option),
              },
              audience: {
                options: audienceOptions,
                current: selectedAudience,
                onSelect: setSelectedAudience,
                labelFor: (option) => (option === "All" ? "Anyone" : option),
              },
              tags: {
                options: tagOptions,
                current: selectedTag,
                onSelect: setSelectedTag,
                labelFor: (option) => (option === "All" ? "Tags" : option),
              },
            };
            const active = config[desktopMode];
            const hasOverflow = canScrollLeft || canScrollRight;
            const highlightedCountry =
              desktopMode === "location"
                ? hoveredCountry ?? (typeof active.current === "string" && active.current !== "All" ? active.current : null)
                : null;
            const highlightedCities =
              highlightedCountry
                ? locationTree.find((e) => e.country === highlightedCountry)?.cities ?? []
                : [];
            return (
              <div>
                <div className="flex items-center gap-2">
                  {hasOverflow && (
                    <button
                      type="button"
                      aria-label="Scroll filters left"
                      disabled={!canScrollLeft}
                      onPointerEnter={() => startManualScroll(-1)}
                      onPointerLeave={stopManualScroll}
                      onClick={() => optionsRailRef.current?.scrollBy({ left: -240, behavior: "smooth" })}
                      className="shrink-0 px-1.5 py-1 text-[15px] text-neutral-500 transition-colors hover:text-neutral-900 disabled:opacity-25"
                    >
                      &#8592;
                    </button>
                  )}
                  <div
                    ref={optionsRailRef}
                    onScroll={updateRailArrows}
                    onPointerEnter={(event) => {
                      if (event.pointerType !== "mouse") return;
                      railPausedRef.current = true;
                    }}
                    onPointerLeave={(event) => {
                      if (event.pointerType !== "mouse") return;
                      railPausedRef.current = false;
                      if (desktopMode === "location") setHoveredCountry(null);
                    }}
                    className="scrollbar-none min-w-0 flex-1 overflow-x-auto pb-2"
                  >
                    <div className="flex min-w-max items-baseline gap-6">
                      {active.options.map((option) => {
                        const isActive = active.current === option;
                        return (
                          <button
                            key={option}
                            type="button"
                            onClick={() => active.onSelect(option)}
                            onMouseEnter={
                              desktopMode === "location" && option !== "All"
                                ? () => setHoveredCountry(option)
                                : undefined
                            }
                            className={`shrink-0 whitespace-nowrap text-[11px] uppercase tracking-[0.18em] transition-colors ${isActive ? "font-semibold text-neutral-900" : "text-neutral-500 hover:text-neutral-800"}`}
                          >
                            {active.labelFor(option)}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  {hasOverflow && (
                    <button
                      type="button"
                      aria-label="Scroll filters right"
                      disabled={!canScrollRight}
                      onPointerEnter={() => startManualScroll(1)}
                      onPointerLeave={stopManualScroll}
                      onClick={() => optionsRailRef.current?.scrollBy({ left: 240, behavior: "smooth" })}
                      className="shrink-0 px-1.5 py-1 text-[15px] text-neutral-500 transition-colors hover:text-neutral-900 disabled:opacity-25"
                    >
                      &#8594;
                    </button>
                  )}
                </div>
                {desktopMode === "location" && highlightedCountry && highlightedCities.length > 0 && (
                  <div className="mt-2 flex flex-wrap items-baseline gap-x-6 gap-y-2 pl-8 pr-8">
                    {highlightedCities.map((city) => {
                      const fullValue = `${city}, ${highlightedCountry}`;
                      const isActive = selectedLocation === fullValue;
                      return (
                        <button
                          key={fullValue}
                          type="button"
                          onClick={() => setSelectedLocation(fullValue)}
                          className={`text-[10px] uppercase tracking-[0.18em] transition-colors ${isActive ? "font-semibold text-neutral-900" : "text-neutral-400 hover:text-neutral-800"}`}
                        >
                          {city}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })()}
        </div>

        {visibleOpportunities.length > 0 ? (
          viewMode === "grid" ? (
            <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-2 md:gap-5 lg:grid-cols-3">
              {visibleOpportunities.map((opportunity) => (
                <OpportunityCard
                  key={opportunity.slug}
                  opportunity={opportunity}
                  onOpen={() => openOpportunity(opportunity)}
                  isSaved={isOpportunitySaved(opportunity.slug)}
                  onToggleSaved={() => toggleSaved(opportunity.slug)}
                />
              ))}
            </div>
          ) : (
            <OpportunitiesListView
              opportunities={visibleOpportunities}
              onOpen={(opp) => openOpportunity(opp)}
              isSaved={isOpportunitySaved}
              onToggleSaved={toggleSaved}
              sortDirection={sortDirection}
              onToggleSort={() => setSortDirection((current) => (current === "asc" ? "desc" : "asc"))}
              today={today}
            />
          )
        ) : (
          <p className="py-24 text-center text-[12px] uppercase tracking-[0.18em] text-neutral-500">No opportunities match these filters</p>
        )}
      </section>
      {selectedOpportunity ? <OpportunityDetail opportunity={selectedOpportunity} onClose={() => openOpportunity(null)} /> : null}
      <MobileFiltersDrawer
        open={mobileFiltersOpen}
        onClose={() => setMobileFiltersOpen(false)}
        selectedFilters={selectedFilters}
        setSelectedFilters={setSelectedFilters}
        feeFilter={feeFilter}
        setFeeFilter={setFeeFilter}
        resultCount={visibleOpportunities.length}
        onReset={resetMobileFilters}
        viewMode={viewMode}
        setViewMode={setViewMode}
        sortDirection={sortDirection}
        setSortDirection={setSortDirection}
      />
    </main>
  );
}

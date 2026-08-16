"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Header } from "./Header";

const FILTERS = {
  type: ["All types", "Residencies", "Awards & Prizes", "Calls for Curators", "Collaborations", "Commissions", "Education", "Grants & Stipends", "Jobs", "Open Calls"],
  field: ["All fields", "Applied Arts", "Architecture", "Curating", "Dance", "Design", "Digital", "Drawing", "Education", "Fashion", "Film", "Installation", "Interdisciplinary", "Painting", "Performance", "Photography", "Printmaking", "Public Art", "Research", "Sculpture", "Social Practice", "Sound Art", "Textiles", "Video", "Visual Arts", "Writing"],
  reward: ["All rewards", "Accommodation", "Cash Prize", "Exhibition", "Funding", "Production", "Publication", "Travel", "Studio Space", "Equipment", "Meals", "Education", "Other"],
} as const;

type FilterMode = keyof typeof FILTERS;
type Opportunity = {
  slug: string;
  organizer: string;
  title: string;
  deadline: string;
  location: string;
  audience: string;
  type: string[];
  fields: string[];
  rewards: string[];
  tags: string[];
  intro: string[];
  sections: Array<{ title: string; items: string[] }>;
  applyUrl: string;
};

const OPPORTUNITIES: Opportunity[] = [
  {
    slug: "das-minsk-culinary-residency",
    organizer: "DAS MINSK Kunsthaus",
    title: "Open Call: Culinary Residency",
    deadline: "5 September 2026, 11:59 PM",
    location: "Potsdam, Germany",
    audience: "Chefs, artists, food designers and interdisciplinary practitioners",
    type: ["Residencies", "Open Calls"],
    fields: ["Applied Arts", "Interdisciplinary", "Research", "Social Practice"],
    rewards: ["Accommodation", "Funding", "Production", "Travel"],
    tags: ["RESIDENCY", "CULINARY ARTS", "SOCIAL PRACTICE", "FUNDED"],
    intro: [
      "Originally opened as a terrace restaurant in 1977, DAS MINSK now operates as a museum of modern and contemporary art. Its history as a place of hospitality, exchange, and social life continues to shape the building. The culinary residency situates it as a place where art, food, memory, and the public intersect.",
      "The residency invites proposals that treat cooking as a cultural and artistic practice, engaging with community, memory, hospitality, nutrition, regional tradition, agricultural science, ecology, and the future of food. The selected resident will develop a project and present it as part of the museum's public program.",
    ],
    sections: [
      { title: "Residency period", items: ["April through July 2027"] },
      { title: "Possible formats", items: ["Seasonal menus or a signature dish for CafeBar HEDWIG", "Public cooking evenings, supper clubs, workshops, or classes", "Communal dining, participatory formats, and performative dinners", "Projects on regional, historical, or sustainable food cultures", "Interdisciplinary collaborations with artists, researchers, or local initiatives"] },
      { title: "Support", items: ["A stipend of €1,000 per month", "Travel reimbursement at the start of the residency", "A furnished apartment and Deutschlandticket", "Possible coverage of production costs", "Museum access and support from the DAS MINSK team"] },
      { title: "Application", items: ["Short biography", "Portfolio or work samples", "Project idea, maximum 2 pages", "Project cost estimate, maximum 1 page", "Submit one PDF, maximum 10 pages / 5 MB, by the deadline"] },
    ],
    applyUrl: "https://dasminsk.de/en/residency",
  },
  {
    slug: "industra-art-open-call-2027",
    organizer: "INDUSTRA ART Gallery",
    title: "INDUSTRA ART OPEN CALL 2027",
    deadline: "31 August 2026",
    location: "Brno, Czech Republic",
    audience: "Czech and international artists, art collectives and curators",
    type: ["Open Calls", "Residencies"],
    fields: ["Curating", "Installation", "Interdisciplinary", "Visual Arts"],
    rewards: ["Accommodation", "Exhibition", "Funding", "Production", "Travel"],
    tags: ["OPEN CALL", "EXHIBITION", "VISUAL ARTS", "ART & TECH"],
    intro: [
      "INDUSTRA ART Gallery invites exhibition projects for 2027 from art school students, graduates, established artists, collectives, and curators. The gallery values compelling site-specific projects able to engage the full industrial gallery space and develop current discourses in contemporary art.",
      "Applicants may propose an exhibition project, an individual Art & Tech Residency, or both. The residency supports the development of artistic work through technological possibilities, skills, equipment, and the industrial spaces of INDUSTRA LABS.",
    ],
    sections: [
      { title: "Who can apply", items: ["Czech and international artists", "Art collectives", "Curators working in visual arts"] },
      { title: "Support", items: ["Gallery facilities, exhibition PR, and production", "Artist and curator honoraria within awarded grants", "Artwork transport", "Travel and accommodation during installation", "Option of an Art & Tech Residency of up to one month for individual applicants"] },
      { title: "Application", items: ["Complete the official 2027 application form and required attachments", "Submit electronically as a PDF by 31 August 2026", "Selected applicants will be contacted after the call closes", "Results are expected by the end of September 2026"] },
    ],
    applyUrl: "https://industra.space/en/events/2026/07/27/artopencall27/",
  },
  {
    slug: "in-listening-2027",
    organizer: "CTM Festival / Deutschlandfunk Kultur / ORF",
    title: "In Listening 2027",
    deadline: "6 September 2026, 23:59 CEST",
    location: "Berlin, Germany",
    audience: "Artists working with experimental sound practices and audio art",
    type: ["Commissions", "Open Calls"],
    fields: ["Digital", "Interdisciplinary", "Performance", "Sound Art"],
    rewards: ["Accommodation", "Funding", "Production", "Travel"],
    tags: ["SOUND ART", "RADIO", "PERFORMANCE", "COMMISSION"],
    intro: [
      "In Listening is a call for works grounded in experimental sound practices and audio art, driven by conceptual approaches or sonic narratives. It supports exploration between sound, noise, music, storytelling, poetry, documentation, and active listening.",
      "Proposals should respond to CTM 2027's theme Process…ing and be developed for two complementary formats: a live event at CTM Festival and a radio work for Deutschlandfunk Kultur and ORF. Sound must be the principal medium.",
    ],
    sections: [
      { title: "Presentation", items: ["Premiere at CTM 2027 in Berlin, 22–31 January 2027", "A 40–55 minute Deutschlandfunk Kultur radio work in spring 2027", "Presentation through ORF and/or musikprotokoll in autumn 2027", "Live work designed for an intimate 6.1-channel listening setup at silent green Kuppelhalle"] },
      { title: "Support", items: ["Two commissions of €6,000 each", "Technical and staging costs covered upon discussion", "Travel to Berlin and accommodation during production and festival periods", "Production guidance from CTM, Deutschlandfunk Kultur, and ORF"] },
      { title: "Application", items: ["Project description and rough budget, maximum 4 pages", "Technical requirements and staging outline", "CV, with group CVs combined into one PDF", "Applications must be submitted in English", "Deadline: 6 September 2026 at 23:59 Berlin time (UTC+2)"] },
    ],
    applyUrl: "https://www.ctm-festival.de/festival-2027/open-calls/in-listening-2027",
  },
];

const FILTER_LABELS: Record<FilterMode, string> = { type: "Type", field: "Artistic field", reward: "Reward" };

function FilterRail({ mode, selected, onSelect }: { mode: FilterMode; selected: string; onSelect: (value: string) => void }) {
  const railRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (mode !== "type") return;
    const rail = railRef.current;
    if (!rail) return;
    const interval = window.setInterval(() => {
      const maxScroll = rail.scrollWidth - rail.clientWidth;
      rail.scrollLeft = rail.scrollLeft >= maxScroll - 2 ? 0 : rail.scrollLeft + 1;
    }, 34);
    return () => window.clearInterval(interval);
  }, [mode]);

  return (
    <div ref={railRef} className="scrollbar-none overflow-x-auto scroll-smooth py-5" aria-label={`${FILTER_LABELS[mode]} options`}>
      <div className="flex min-w-max items-center gap-8 pr-12">
        {FILTERS[mode].map((option) => (
          <button key={option} type="button" onClick={() => onSelect(option)} className={`shrink-0 text-[11px] uppercase tracking-[0.2em] transition-opacity hover:opacity-55 ${selected === option ? "font-semibold text-[var(--foreground)]" : "text-neutral-500"}`}>
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

function OpportunityCard({ opportunity, onOpen }: { opportunity: Opportunity; onOpen: () => void }) {
  return (
    <article className="flex min-h-[430px] flex-col border border-[var(--border)] p-5 transition-colors duration-300 hover:bg-neutral-50 dark:hover:bg-neutral-900 md:p-6">
      <p className="mb-8 text-[10px] uppercase tracking-[0.2em] text-neutral-500">{opportunity.organizer}</p>
      <h2 className="editorial-serif mb-10 text-[clamp(1.65rem,2.4vw,2.5rem)] uppercase leading-[0.98] tracking-[-0.035em]">{opportunity.title}</h2>
      <dl className="space-y-4 border-t border-[var(--border)] pt-5 text-[12px] leading-relaxed">
        <div className="grid grid-cols-[88px_1fr] gap-3"><dt className="text-[9px] uppercase tracking-[0.2em] text-neutral-500">Deadline</dt><dd>{opportunity.deadline}</dd></div>
        <div className="grid grid-cols-[88px_1fr] gap-3"><dt className="text-[9px] uppercase tracking-[0.2em] text-neutral-500">Location</dt><dd>{opportunity.location}</dd></div>
        <div className="grid grid-cols-[88px_1fr] gap-3"><dt className="text-[9px] uppercase tracking-[0.2em] text-neutral-500">For</dt><dd>{opportunity.audience}</dd></div>
      </dl>
      <div className="mt-auto pt-8">
        <div className="mb-6 flex flex-wrap gap-2">
          {opportunity.tags.map((tag) => <span key={tag} className="border border-[var(--border)] px-2.5 py-1.5 text-[8px] uppercase tracking-[0.18em]">{tag}</span>)}
        </div>
        <button type="button" onClick={onOpen} className="text-[10px] font-semibold uppercase tracking-[0.2em] underline-offset-4 transition-opacity hover:opacity-55 hover:underline">View details ↗</button>
      </div>
    </article>
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
      <aside className="absolute inset-y-0 right-0 w-full overflow-y-auto bg-[var(--background)] shadow-[-12px_0_35px_rgba(0,0,0,0.12)] md:w-[72vw] lg:w-[62vw] lg:max-w-[1050px]">
        <div className="mx-auto max-w-[880px] px-5 pb-20 pt-6 md:px-10 md:pt-10 lg:px-14">
          <div className="mb-12 flex items-start justify-between gap-6 border-b border-[var(--border)] pb-6">
            <p className="pt-2 text-[10px] uppercase tracking-[0.2em] text-neutral-500">{opportunity.organizer}</p>
            <button type="button" onClick={onClose} aria-label="Close opportunity" className="flex h-10 w-10 shrink-0 items-center justify-center text-3xl font-light leading-none transition-opacity hover:opacity-50">×</button>
          </div>
          <h2 className="editorial-serif max-w-[760px] text-[clamp(2.2rem,5vw,4.8rem)] uppercase leading-[0.93] tracking-[-0.045em]">{opportunity.title}</h2>
          <dl className="my-10 grid gap-5 border-y border-[var(--border)] py-6 text-[13px] md:grid-cols-3">
            <div><dt className="mb-2 text-[9px] uppercase tracking-[0.2em] text-neutral-500">Deadline</dt><dd>{opportunity.deadline}</dd></div>
            <div><dt className="mb-2 text-[9px] uppercase tracking-[0.2em] text-neutral-500">Location</dt><dd>{opportunity.location}</dd></div>
            <div><dt className="mb-2 text-[9px] uppercase tracking-[0.2em] text-neutral-500">For</dt><dd>{opportunity.audience}</dd></div>
          </dl>
          <div className="max-w-[720px] space-y-5 text-[15px] leading-[1.7]">
            {opportunity.intro.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </div>
          <div className="mt-12 grid gap-x-10 gap-y-10 md:grid-cols-2">
            {opportunity.sections.map((section) => (
              <section key={section.title} className="border-t border-[var(--border)] pt-5">
                <h3 className="mb-5 text-[10px] font-semibold uppercase tracking-[0.2em]">{section.title}</h3>
                <ul className="space-y-3 text-[13px] leading-[1.55]">
                  {section.items.map((item) => <li key={item} className="flex gap-3"><span aria-hidden="true">→</span><span>{item}</span></li>)}
                </ul>
              </section>
            ))}
          </div>
          <div className="mt-14 flex flex-wrap items-center justify-between gap-5 border-t border-[var(--border)] pt-7">
            <div className="flex flex-wrap gap-2">
              {opportunity.tags.map((tag) => <span key={tag} className="border border-[var(--border)] px-2.5 py-1.5 text-[8px] uppercase tracking-[0.18em]">{tag}</span>)}
            </div>
            <a href={opportunity.applyUrl} target="_blank" rel="noopener noreferrer" className="border border-[var(--foreground)] bg-[var(--foreground)] px-8 py-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--background)] transition-opacity hover:opacity-70">Apply ↗</a>
          </div>
        </div>
      </aside>
    </div>
  );
}

export function OpportunitiesArchiveView() {
  const [mode, setMode] = useState<FilterMode>("type");
  const [selectedFilters, setSelectedFilters] = useState<Record<FilterMode, string>>({ type: FILTERS.type[0], field: FILTERS.field[0], reward: FILTERS.reward[0] });
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const visibleOpportunities = useMemo(() => OPPORTUNITIES.filter((opportunity) => {
    const typeMatches = selectedFilters.type === FILTERS.type[0] || opportunity.type.includes(selectedFilters.type);
    const fieldMatches = selectedFilters.field === FILTERS.field[0] || opportunity.fields.includes(selectedFilters.field);
    const rewardMatches = selectedFilters.reward === FILTERS.reward[0] || opportunity.rewards.includes(selectedFilters.reward);
    return typeMatches && fieldMatches && rewardMatches;
  }), [selectedFilters]);

  return (
    <main className="min-h-screen overflow-x-hidden bg-[var(--background)] pt-[65px] text-[var(--foreground)]">
      <Header />
      <section className="px-5 pb-24 pt-8 md:px-8 md:pt-12 lg:px-12">
        <h1 className="editorial-serif mb-8 text-[clamp(1.5rem,3vw,2.8rem)] uppercase leading-none tracking-[-0.025em] md:mb-10">No Fees Opportunities</h1>
        <div className="flex flex-wrap items-center gap-3">
          {(Object.keys(FILTER_LABELS) as FilterMode[]).map((filterMode) => (
            <button key={filterMode} type="button" onClick={() => setMode(filterMode)} onMouseEnter={() => setMode(filterMode)} className={`border px-3 py-2 text-[10px] uppercase tracking-[0.18em] transition-colors duration-200 ${mode === filterMode ? "border-[var(--foreground)] text-[var(--foreground)]" : "border-neutral-400 text-neutral-500 hover:border-neutral-500"}`}>{FILTER_LABELS[filterMode]}</button>
          ))}
        </div>
        <FilterRail mode={mode} selected={selectedFilters[mode]} onSelect={(value) => setSelectedFilters((current) => ({ ...current, [mode]: value }))} />
        {visibleOpportunities.length > 0 ? (
          <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {visibleOpportunities.map((opportunity) => <OpportunityCard key={opportunity.slug} opportunity={opportunity} onOpen={() => setSelectedOpportunity(opportunity)} />)}
          </div>
        ) : (
          <p className="py-24 text-center text-[12px] uppercase tracking-[0.18em] text-neutral-500">No opportunities match these filters</p>
        )}
      </section>
      {selectedOpportunity ? <OpportunityDetail opportunity={selectedOpportunity} onClose={() => setSelectedOpportunity(null)} /> : null}
    </main>
  );
}

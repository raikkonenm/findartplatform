"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Header } from "./Header";
import { HeartIcon } from "./SavedExhibitions";
import { SearchBar } from "./SearchBar";

const FILTERS = {
  type: ["All types", "Residencies", "Awards & Prizes", "Calls for Curators", "Collaborations", "Commissions", "Education", "Grants & Stipends", "Jobs", "Open Calls"],
  field: ["All fields", "Applied Arts", "Architecture", "Curating", "Dance", "Design", "Digital", "Drawing", "Education", "Fashion", "Film", "Installation", "Interdisciplinary", "Painting", "Performance", "Photography", "Printmaking", "Public Art", "Research", "Sculpture", "Social Practice", "Sound Art", "Textiles", "Video", "Visual Arts", "Writing"],
  reward: ["All rewards", "Accommodation", "Cash Prize", "Exhibition", "Funding", "Production", "Publication", "Travel", "Studio Space", "Equipment", "Meals", "Education", "Other"],
} as const;

type FilterMode = keyof typeof FILTERS;
type ViewMode = "grid" | "list";
type FeeFilter = "all" | "free" | "paid";
type SortDirection = "asc" | "desc";

type Opportunity = {
  slug: string;
  organizer: string;
  title: string;
  deadline: string;
  deadlineDate: string;
  location: string;
  audience: string;
  audiences: string[];
  type: string[];
  fields: string[];
  rewards: string[];
  rewardSummary: string;
  applicationFee: string;
  tags: string[];
  intro: string[];
  sections: Array<{ title: string; items: string[] }>;
  applyUrl: string;
};

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

const OPPORTUNITIES: Opportunity[] = [
  {
    slug: "das-minsk-culinary-residency",
    organizer: "DAS MINSK Kunsthaus",
    title: "Open Call: Culinary Residency",
    deadline: "5 September 2026, 11:59 PM",
    deadlineDate: "2026-09-05",
    location: "Potsdam, Germany",
    audience: "Chefs, artists, food designers and interdisciplinary practitioners",
    audiences: ["Individual artists", "Food practitioners", "Interdisciplinary practitioners"],
    type: ["Residencies", "Open Calls"],
    fields: ["Applied Arts", "Interdisciplinary", "Research", "Social Practice"],
    rewards: ["Accommodation", "Funding", "Production", "Travel"],
    rewardSummary: "Funded",
    applicationFee: "FREE",
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
    deadlineDate: "2026-08-31",
    location: "Brno, Czech Republic",
    audience: "Czech and international artists, art collectives and curators",
    audiences: ["Individual artists", "Collectives / groups", "Curators"],
    type: ["Open Calls", "Residencies"],
    fields: ["Curating", "Installation", "Interdisciplinary", "Visual Arts"],
    rewards: ["Accommodation", "Exhibition", "Funding", "Production", "Travel"],
    rewardSummary: "Exhibition",
    applicationFee: "€15",
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
    deadlineDate: "2026-09-06",
    location: "Berlin, Germany",
    audience: "Artists working with experimental sound practices and audio art",
    audiences: ["Individual artists", "Sound artists"],
    type: ["Commissions", "Open Calls"],
    fields: ["Digital", "Interdisciplinary", "Performance", "Sound Art"],
    rewards: ["Accommodation", "Funding", "Production", "Travel"],
    rewardSummary: "€6,000",
    applicationFee: "FREE",
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
  {
    slug: "atmospheric-waves",
    organizer: "ASTE (Art, Science, Technology, Education)",
    title: "Atmospheric Waves",
    deadline: "4 September 2026",
    deadlineDate: "2026-09-04",
    location: "Liepāja, Latvia",
    audience: "Sound artists, media artists, listening / sensory researchers and interdisciplinary practitioners",
    audiences: ["Individual artists", "Sound artists", "Interdisciplinary practitioners"],
    type: ["Open Calls", "Residencies"],
    fields: ["Sound Art", "Installation", "Digital", "Interdisciplinary", "Public Art", "Research"],
    rewards: ["Accommodation", "Funding", "Production", "Travel"],
    rewardSummary: "€1,500 fee + €3,500 production",
    applicationFee: "FREE",
    tags: ["SOUND ART", "INSTALLATION", "PUBLIC ART", "CLIMATE", "LISTENING"],
    intro: [
      "Atmospheric Waves is an art festival of wind, climate and listening held in Liepāja, Latvia, as part of Liepāja — European Capital of Culture 2027. The open call invites original concepts for sound-art works that respond to the wind and climate conditions of the western Latvian coast.",
      "The exhibition takes the form of five selected installations and/or interactive digital artworks, on view from 15 May — 30 November 2027 at the former KURSA factory grounds and the newly reopened club house.",
    ],
    sections: [
      { title: "Support", items: ["Production budget up to €3,500 per project (including technical set-up and transportation)", "Artist fee of €1,500 per project", "Production residency with accommodation at Laidi Palace, 5 April — 12 May 2027"] },
      { title: "Timeline", items: ["Festival: 12 – 16 May 2027", "Exhibition: 15 May — 30 November 2027", "Application deadline: 4 September 2026"] },
      { title: "Application", items: ["Site-responsive proposals engaging wind, climate, and listening as core themes", "Robust installations resilient to coastal weather", "Application form: forms.gle/UqXDvy61LLSqZYbb9"] },
    ],
    applyUrl: "https://atmosphericwaves.aste.gallery/index.php/en/open-call/",
  },
  {
    slug: "oasis-2026-le-garage-moderne",
    organizer: "Le Garage Moderne (OASIs)",
    title: "OASIs 2026 — International Residency",
    deadline: "1 September 2026",
    deadlineDate: "2026-09-01",
    location: "Bordeaux, France",
    audience: "International artists working across design, visual arts, performance, film, sound, craft and interdisciplinary practices",
    audiences: ["Individual artists", "Interdisciplinary practitioners", "Performing artists", "Sound artists"],
    type: ["Residencies", "Open Calls"],
    fields: ["Design", "Visual Arts", "Performance", "Film", "Sound Art", "Interdisciplinary", "Social Practice"],
    rewards: ["Accommodation", "Funding", "Production", "Travel"],
    rewardSummary: "€1,300 fee + €600 production",
    applicationFee: "FREE",
    tags: ["RESIDENCY", "COMMUNITY", "INTERDISCIPLINARY", "SITE-SPECIFIC"],
    intro: [
      "Le Garage Moderne opens the second edition of its OASIs international residency cycle. Five grants are available to international artists for a two-week stay in Bordeaux between October and December 2026.",
      "Le Garage Moderne is a non-profit car garage and bicycle workshop, a solidarity canteen, and a cultural venue hosting 11 permanent artists in the Bacalan district. The 19th-century building has just reopened after a two-and-a-half-year renovation.",
    ],
    sections: [
      { title: "Support", items: ["Artist fee of €1,300 (gross, tax status dependent)", "Production budget up to €600 (materials, technical services, tools)", "Travel grant (lump sum, distance-based, with top-ups for green travel)", "€45 per diem", "Accommodation in a self-catering hotel"] },
      { title: "Residency periods", items: ["Residency 1: 9 – 22 November", "Residency 2: 16 – 29 November", "Residency 3: 23 November — 6 December", "Residency 4: 30 November — 13 December", "Residency 5: 7 – 20 December"] },
      { title: "Application", items: ["Application deadline: 1 September 2026", "Pre-selection interviews: 15 September", "Final selection announced: 1 October", "Site-specific proposals engaging with the space, the community and Le Garage Moderne's tools"] },
    ],
    applyUrl: "https://legaragemoderne.org/oasis2026",
  },
  {
    slug: "artists-in-the-library-toronto",
    organizer: "Toronto Arts Council & Toronto Public Library",
    title: "Artists in the Library",
    deadline: "6 October 2026",
    deadlineDate: "2026-10-06",
    location: "Toronto, Canada",
    audience: "Toronto-based professional artists, not-for-profit arts organisations and collectives (Etobicoke, York, North York, East York, Scarborough)",
    audiences: ["Individual artists", "Collectives / groups", "Organizations & non-profits"],
    type: ["Grants & Stipends", "Open Calls"],
    fields: ["Interdisciplinary", "Performance", "Visual Arts", "Education", "Social Practice", "Public Art"],
    rewards: ["Funding", "Studio Space"],
    rewardSummary: "Up to CA$20,000",
    applicationFee: "FREE",
    tags: ["GRANT", "COMMUNITY-ENGAGED", "PUBLIC PROGRAM", "LIBRARY"],
    intro: [
      "Artists in the Library is a partnership between Toronto Arts Council and Toronto Public Library that provides paid opportunities and space for Toronto artists while increasing access to the arts across Etobicoke, York, North York, East York and Scarborough.",
      "Grants support professional artists, arts organisations and collectives working in any artistic discipline to create and deliver free community-engaged arts programming at one of the branches of the Toronto Public Library.",
    ],
    sections: [
      { title: "Support", items: ["Grants up to CA$20,000 (may cover 100% of project costs)", "Space and facilities at a Toronto Public Library branch", "Support from the branch team throughout the project"] },
      { title: "Timing", items: ["Programming must take place at the assigned branch between September and December 2027", "Application deadline: 6 October 2026"] },
      { title: "Eligibility", items: ["Canadian citizens / permanent residents / protected persons who have been City of Toronto residents for at least one year", "Not-for-profit incorporated arts organisations or collectives based in Toronto", "For collectives of 2, both members must be Toronto residents; for larger collectives, the majority"] },
    ],
    applyUrl: "https://torontoartscouncil.org/grants/artists-in-the-library/",
  },
  {
    slug: "cica-photography-now-2027",
    organizer: "CICA Museum",
    title: "Photography Now 2027",
    deadline: "20 August 2026",
    deadlineDate: "2026-08-20",
    location: "Gimpo, South Korea",
    audience: "International photographers working across traditional, digital, experimental and AI-generated photography",
    audiences: ["Individual artists", "Photographers"],
    type: ["Open Calls"],
    fields: ["Photography", "Digital"],
    rewards: ["Exhibition"],
    rewardSummary: "Exhibition",
    applicationFee: "$78",
    tags: ["PHOTOGRAPHY", "DIGITAL", "AI ART", "EXHIBITION"],
    intro: [
      "CICA Museum invites artists worldwide to participate in Photography Now 2027, its International Exhibition of Photography, exploring the medium's role as representation, expression and communication.",
      "Works may range from traditional and digital photography to experimental practices, including image manipulation and AI-generated photography.",
    ],
    sections: [
      { title: "Exhibition", items: ["Exhibition dates: 7 – 25 April 2027 (subject to change)", "Digital works printed on A3 (297 × 420 mm) foam board and installed by CICA curators", "Physical prints / installations: artists cover shipping to and from CICA; 2D works ≤ 1 m longest side, installations ≤ 1 × 1 × 2 m, wall-mounted ≤ 10 kg"] },
      { title: "How to submit", items: ["Send up to 3 direct video links and/or up to 5 JPG images (100–500 KB recommended) with a short bio to submission@cicamuseum.com", "Subject line: 'Submission: Photography Now 2027 – Artist's Name'", "Submission deadline: 20 August 2026"] },
      { title: "Fee", items: ["Selected artists contribute $78 USD (or 110,000 KRW) per work toward show processing and maintenance"] },
    ],
    applyUrl: "https://cicamuseum.com/call-for-artists-photography-now/",
  },
  {
    slug: "arrival-gallery-paris-september-2026",
    organizer: "Arrival Gallery",
    title: "Bring Your Art to Paris — September 2026",
    deadline: "20 August 2026",
    deadlineDate: "2026-08-20",
    location: "Paris, France",
    audience: "International artists across any discipline seeking a Paris exhibition slot",
    audiences: ["Individual artists", "Interdisciplinary practitioners"],
    type: ["Open Calls"],
    fields: ["Visual Arts", "Painting", "Sculpture", "Photography", "Digital", "Installation", "Interdisciplinary"],
    rewards: ["Exhibition"],
    rewardSummary: "Exhibition",
    applicationFee: "$40",
    tags: ["OPEN CALL", "EXHIBITION", "GROUP SHOW", "PARIS"],
    intro: [
      "Arrival Gallery is running an open call for a group exhibition in Paris in September 2026. Selected artists show their work in the gallery's Paris programme.",
      "The call is open across disciplines — from painting and sculpture to photography, digital, installation and interdisciplinary practices.",
    ],
    sections: [
      { title: "Support", items: ["Group exhibition in Paris, September 2026", "Selected artists shown in Arrival Gallery's Paris programme"] },
      { title: "Fees", items: ["No application fee", "Participation fee: $40 for selected artists"] },
      { title: "Application", items: ["Application deadline: 20 August 2026, 22:00 UTC", "Submit via the Arrival Gallery application form (application forms + artwork / portfolio required)"] },
    ],
    applyUrl: "https://arrivalgallery.myflodesk.com/pariseptember2026",
  },
  {
    slug: "za-koenji-pack-2026",
    organizer: "ZA-KOENJI Public Theatre",
    title: "Performing Arts Camp in Koenji 2026",
    deadline: "24 August 2026",
    deadlineDate: "2026-08-24",
    location: "Tokyo, Japan",
    audience: "Young performing artists based in Asia, aged 35 or younger",
    audiences: ["Individual artists", "Performing artists", "Emerging / young artists"],
    type: ["Open Calls", "Residencies", "Education"],
    fields: ["Performance", "Interdisciplinary", "Research"],
    rewards: ["Accommodation", "Travel", "Funding"],
    rewardSummary: "Accommodation + per diem + travel",
    applicationFee: "FREE",
    tags: ["RESIDENCY", "PERFORMANCE", "ASIA", "MENTORSHIP"],
    intro: [
      "Performing Arts Camp in Koenji (PACK) is a two-week art camp for young artists based in Asia, held at ZA-KOENJI Public Theatre in Tokyo from 6 – 20 December 2026.",
      "Participants bring their own artistic practices and research questions while engaging in collective learning, discussion and experimentation. This year's programme, facilitated by Mizuho Watanabe and Kyle Yamada, runs under the theme 'Specters of _____.'",
    ],
    sections: [
      { title: "Support", items: ["Accommodation at ZA-KOENJI Public Theatre for ~2 weeks", "Per diem for on-site camp period (2,400 JPY × 15 days)", "Event insurance", "Party and research fees up to 15,000 JPY", "For participants outside Japan: round-trip flights + airport shuttle", "For participants outside the Kantō region: round-trip transportation from residence to Tokyo"] },
      { title: "Programme", items: ["Two weeks in Tokyo, 6 – 20 December 2026", "Lectures, discussions and research using the theatre and the Koenji neighbourhood as fields of exploration", "Collective 'party' presenting findings at the end"] },
      { title: "Eligibility", items: ["Applicants must be based in Asia", "Applicants must be aged 35 or younger", "Application deadline: 24 August 2026"] },
    ],
    applyUrl: "https://on-the-move.org/news/za-koenji-public-theatre-za-party-performing-arts-camp-2026-young-artists-asia-japan",
  },
  {
    slug: "hypha-studios-sevenoaks",
    organizer: "Hypha Studios",
    title: "Sevenoaks Open Call — Studio & Project Spaces",
    deadline: "6 September 2026",
    deadlineDate: "2026-09-06",
    location: "Sevenoaks, United Kingdom",
    audience: "Groups and organisations seeking free studio or project space; priority to creatives who cannot afford exhibition or studio space",
    audiences: ["Collectives / groups", "Organizations & non-profits"],
    type: ["Open Calls"],
    fields: ["Visual Arts", "Interdisciplinary", "Social Practice", "Public Art"],
    rewards: ["Studio Space"],
    rewardSummary: "Free studio / project space",
    applicationFee: "FREE",
    tags: ["STUDIO SPACE", "COMMUNITY", "PROJECT SPACE", "UK"],
    intro: [
      "Hypha Studios opens a call for multiple large groups looking for free studio or project spaces at 160 London Road, Sevenoaks TN13 2JA. Several spaces across 3 floors, plus car-parking, in a building located next to Sevenoaks station (26 minutes from London Bridge).",
      "The site will be awarded free of charge. In return, awarded groups organise some public-facing events alongside their use — workshops, talks or anything that supports their creative practice.",
    ],
    sections: [
      { title: "Terms", items: ["Free studio or project space, initial 6-month term with the potential to extend long-term (subject to review)", "Minimum three days of use per week during the awarded period", "Awarded groups host public-facing events (workshops, talks, etc.) alongside their use", "Priority to creatives and communities most in need"] },
      { title: "Location", items: ["160 London Road, Sevenoaks TN13 2JA", "Next to Sevenoaks station, 26 minutes from London Bridge", "Several spaces across 3 floors plus car-parking"] },
      { title: "Application", items: ["Application deadline: 6 September 2026, 18:00", "Apply online via the Hypha Studios 'Apply Now' link"] },
    ],
    applyUrl: "https://hyphastudios.com/sevenoaks-open-call/",
  },
];

const FILTER_LABELS: Record<FilterMode, string> = { type: "Type", field: "Artistic field", reward: "Reward" };


const PRIMARY_TYPE_MAP: Record<string, string> = {
  "Residencies": "RESIDENCY",
  "Open Calls": "OPEN CALL",
  "Awards & Prizes": "AWARD",
  "Calls for Curators": "OPEN CALL",
  "Collaborations": "COLLABORATION",
  "Commissions": "COMMISSION",
  "Education": "EDUCATION",
  "Grants & Stipends": "GRANT",
  "Jobs": "JOB",
};

function primaryTypeLabel(types: string[]): string {
  return PRIMARY_TYPE_MAP[types[0]] ?? types[0].toUpperCase();
}

const TITLE_SMALL_WORDS = new Set([
  "a", "an", "and", "as", "at", "but", "by", "for", "in", "nor", "of", "on", "or", "the", "to", "vs",
]);

function toTitleCase(input: string): string {
  const words = input.trim().split(/\s+/);
  return words
    .map((word, index) => {
      // Preserve mixed-case tokens the author wrote intentionally
      // (e.g. 'CTM', 'iPhone') — only normalise all-caps or all-lower.
      const upper = word.toUpperCase();
      const lower = word.toLowerCase();
      if (word !== upper && word !== lower) return word;
      const isSmall = TITLE_SMALL_WORDS.has(lower);
      // Keep short connectors lowercase mid-sentence.
      if (index !== 0 && index !== words.length - 1 && isSmall) return lower;
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join(" ");
}

function shortTitle(title: string): string {
  const trimmed = title.replace(/^open call:\s*/i, "");
  return toTitleCase(trimmed);
}

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

function OpportunityCard({ opportunity, onOpen }: { opportunity: Opportunity; onOpen: () => void }) {
  return (
    <article className="group/card flex min-h-[260px] flex-col border border-[var(--border)] p-3 transition-colors duration-300 hover:border-neutral-500 md:min-h-[340px] md:p-5">
      <div className="mb-4 flex items-start justify-between gap-2 md:mb-8 md:gap-3">
        <p className="text-[9px] uppercase tracking-[0.2em] text-neutral-500 md:text-[10px]">{opportunity.organizer}</p>
        <FeeTag fee={opportunity.applicationFee} />
      </div>
      <button
        type="button"
        onClick={onOpen}
        className="editorial-serif mb-6 block text-left text-[clamp(1.15rem,4.5vw,1.6rem)] leading-[1.05] tracking-[-0.035em] transition-opacity group-hover/card:opacity-75 md:mb-8 md:text-[clamp(1.35rem,2.2vw,2rem)] md:leading-[1.02]"
      >
        {shortTitle(opportunity.title)}
      </button>
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

// Desktop table grid: OPPORTUNITY (+ organizer under) · TYPE · DEADLINE · LOCATION · FOR · FEE · TAGS
const LIST_ROW_COLS =
  "md:grid-cols-[minmax(0,2.4fr)_110px_110px_minmax(0,1.1fr)_minmax(0,1.3fr)_120px_minmax(0,1.6fr)]";

function OpportunityRow({ opportunity, onOpen, isSaved, onToggleSaved, today }: { opportunity: Opportunity; onOpen: () => void; isSaved: boolean; onToggleSaved: () => void; today: Date | null }) {
  const daysLeft = daysRemainingLabel(opportunity.deadlineDate, today);

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
      className={`group grid cursor-pointer grid-cols-[1fr_auto_28px] items-start gap-x-5 gap-y-2 border-b border-neutral-200 px-2 py-6 transition-colors duration-200 hover:bg-neutral-50 ${LIST_ROW_COLS} md:items-center md:gap-x-6 md:px-4 md:py-6`}
    >
      {/* TYPE eyebrow — mobile only */}
      <span className="order-1 col-span-2 text-[10px] uppercase tracking-[0.22em] text-neutral-500 md:hidden">
        {primaryTypeLabel(opportunity.type)}
      </span>

      {/* OPPORTUNITY — headline + organizer underneath on desktop */}
      <div className="order-2 col-span-2 md:order-none md:col-span-1">
        <h3
          onClick={(event) => {
            event.stopPropagation();
            onOpen();
          }}
          className="editorial-serif break-words text-[clamp(1.05rem,4vw,1.4rem)] leading-[1.08] tracking-[-0.035em] text-neutral-900 transition-opacity group-hover:opacity-70 md:text-[clamp(1.15rem,1.9vw,1.75rem)] md:leading-[1.02]"
        >
          {shortTitle(opportunity.title)}
        </h3>
        <p className="mt-1 hidden text-[10px] uppercase tracking-[0.16em] text-neutral-500 md:block">
          {opportunity.organizer}
        </p>
      </div>

      {/* TYPE — desktop */}
      <span className="hidden text-[13px] text-neutral-700 md:block">
        {primaryTypeCapitalised(opportunity.type)}
      </span>

      {/* DEADLINE */}
      <div className="order-5 justify-self-end text-right md:order-none md:justify-self-start md:text-left">
        <div className="text-[13px] text-neutral-900 md:text-neutral-800">{longDeadline(opportunity.deadlineDate)}</div>
        {daysLeft && (
          <div className="mt-0.5 text-[9px] uppercase tracking-[0.2em] text-neutral-400 md:hidden">{daysLeft}</div>
        )}
      </div>

      {/* LOCATION */}
      <span className="hidden text-[13px] leading-snug text-neutral-700 md:block">
        {opportunity.location}
      </span>

      {/* FOR (audience) */}
      <span className="hidden text-[13px] leading-snug text-neutral-500 md:block">
        {opportunity.audience}
      </span>

      {/* APPLICATION FEE — desktop */}
      <span className="hidden md:block">
        <FeeTag fee={opportunity.applicationFee} compact />
      </span>

      {/* TAGS row — plain uppercase text, no chip boxes */}
      <div className="hidden flex-wrap items-center gap-x-3 gap-y-1 md:flex">
        {opportunity.tags.slice(0, 3).map((tag) => (
          <span key={tag} className="whitespace-nowrap text-[11px] uppercase tracking-[0.14em] text-neutral-700">
            {tag}
          </span>
        ))}
        {opportunity.tags.length > 3 && (
          <span className="whitespace-nowrap text-[11px] uppercase tracking-[0.14em] text-neutral-400">
            +{opportunity.tags.length - 3}
          </span>
        )}
      </div>

      {/* FEE — mobile bottom-left */}
      <span className="order-4 text-[11px] uppercase tracking-[0.18em] text-neutral-700 md:hidden">
        <FeeTag fee={opportunity.applicationFee} compact />
      </span>

      {/* SAVE — mobile only, desktop VIEW replaces it */}
      <button
        type="button"
        aria-label={isSaved ? "Unsave opportunity" : "Save opportunity"}
        aria-pressed={isSaved}
        onClick={(event) => {
          event.stopPropagation();
          onToggleSaved();
        }}
        className={`order-3 justify-self-end self-start text-neutral-900 transition-opacity duration-200 hover:opacity-60 focus-visible:opacity-100 focus-visible:outline-none md:hidden ${isSaved ? "opacity-100" : "opacity-40 group-hover:opacity-100"}`}
      >
        <HeartIcon filled={isSaved} className="h-4 w-4" />
      </button>
    </div>
  );
}

function primaryTypeCapitalised(types: string[]): string {
  const primary = types[0] ?? "";
  // "Residencies" -> "Residency", "Open Calls" -> "Open Call", "Commissions" -> "Commission"
  return primary
    .replace(/Residencies/i, "Residency")
    .replace(/Open Calls/i, "Open Call")
    .replace(/Commissions/i, "Commission")
    .replace(/Collaborations/i, "Collaboration")
    .replace(/Grants & Stipends/i, "Grant")
    .replace(/Awards & Prizes/i, "Award")
    .replace(/Jobs/i, "Job")
    .replace(/Calls for Curators/i, "Open Call");
}

function OpportunitiesListView({ opportunities, onOpen, savedSet, onToggleSaved, sortDirection, onToggleSort, today }: { opportunities: Opportunity[]; onOpen: (opp: Opportunity) => void; savedSet: Set<string>; onToggleSaved: (slug: string) => void; sortDirection: SortDirection; onToggleSort: () => void; today: Date | null }) {
  return (
    <div className="mt-8">
      {/* Column header — desktop only, matches OpportunityRow grid template. */}
      <div className={`hidden border-y border-neutral-200 bg-neutral-100 px-4 py-3.5 text-[10px] uppercase tracking-[0.18em] text-neutral-500 md:grid ${LIST_ROW_COLS} md:items-center md:gap-x-6`}>
        <span className="flex items-center gap-1">Opportunity <span aria-hidden="true" className="text-[10px]">▾</span></span>
        <span>Type</span>
        <button
          type="button"
          onClick={onToggleSort}
          className="flex items-center gap-1 text-left uppercase tracking-[0.18em] text-neutral-500 transition-opacity hover:opacity-70"
          aria-label={`Sort by deadline ${sortDirection === "asc" ? "descending" : "ascending"}`}
        >
          Deadline <span aria-hidden="true" className="text-[10px]">{sortDirection === "asc" ? "▾" : "▴"}</span>
        </button>
        <span>Location</span>
        <span>For</span>
        <span>Application Fee</span>
        <span>Tags</span>
      </div>

      <div>
        {opportunities.map((opp) => (
          <OpportunityRow
            key={opp.slug}
            opportunity={opp}
            onOpen={() => onOpen(opp)}
            isSaved={savedSet.has(opp.slug)}
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
      <aside className="absolute inset-y-0 right-0 w-full overflow-y-auto bg-[var(--background)] shadow-[-12px_0_35px_rgba(0,0,0,0.12)] md:w-[72vw] lg:w-[62vw] lg:max-w-[1050px]">
        <div className="mx-auto max-w-[880px] px-5 pb-20 pt-6 md:px-10 md:pt-10 lg:px-14">
          <div className="mb-6 flex items-start justify-between gap-6">
            <p className="pt-2 text-[10px] uppercase tracking-[0.2em] text-neutral-500">{opportunity.organizer}</p>
            <button type="button" onClick={onClose} aria-label="Close opportunity" className="flex h-10 w-10 shrink-0 items-center justify-center text-3xl font-light leading-none transition-opacity hover:opacity-50">×</button>
          </div>
          <h2 className="editorial-serif max-w-[760px] break-words text-[clamp(1.6rem,5vw,2.2rem)] leading-[1.02] tracking-[-0.035em] md:text-[clamp(2rem,3vw,3rem)] md:leading-[1.02]">{shortTitle(opportunity.title)}</h2>
          <dl className="my-10 grid gap-5 border-y border-[var(--border)] py-6 text-[13px] md:grid-cols-4">
            <div><dt className="mb-2 text-[9px] uppercase tracking-[0.2em] text-neutral-500">Deadline</dt><dd>{opportunity.deadline}</dd></div>
            <div><dt className="mb-2 text-[9px] uppercase tracking-[0.2em] text-neutral-500">Location</dt><dd>{opportunity.location}</dd></div>
            <div><dt className="mb-2 text-[9px] uppercase tracking-[0.2em] text-neutral-500">Application fee</dt><dd>{opportunity.applicationFee}</dd></div>
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
            <a href={opportunity.applyUrl} target="_blank" rel="noopener noreferrer" className="border border-[var(--foreground)] bg-transparent px-8 py-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--foreground)] transition-opacity hover:opacity-55">Apply ↗</a>
          </div>
        </div>
      </aside>
    </div>
  );
}

const FEE_FILTERS: Array<{ id: FeeFilter; label: string }> = [
  { id: "all", label: "All" },
  { id: "free", label: "Free to apply" },
  { id: "paid", label: "Paid application" },
];

function MobileFiltersDrawer({ open, onClose, selectedFilters, setSelectedFilters, feeFilter, setFeeFilter, resultCount, onReset, viewMode, setViewMode, sortDirection, setSortDirection, drawerQuery, setDrawerQuery }: { open: boolean; onClose: () => void; selectedFilters: Record<FilterMode, string>; setSelectedFilters: (fn: (current: Record<FilterMode, string>) => Record<FilterMode, string>) => void; feeFilter: FeeFilter; setFeeFilter: (value: FeeFilter) => void; resultCount: number; onReset: () => void; viewMode: ViewMode; setViewMode: (value: ViewMode) => void; sortDirection: SortDirection; setSortDirection: (value: SortDirection) => void; drawerQuery: string; setDrawerQuery: (value: string) => void; }) {
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
      <aside className="absolute inset-y-0 right-0 flex w-[92%] max-w-[420px] flex-col bg-white shadow-[-12px_0_35px_rgba(0,0,0,0.15)]">
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

          <SearchBar
            value={drawerQuery}
            onChange={setDrawerQuery}
            placeholder="Search opportunities"
          />

          <div className="mt-6 space-y-6 pb-6">
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
  const [savedSet, setSavedSet] = useState<Set<string>>(new Set());
  const [today, setToday] = useState<Date | null>(null);
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [query, setQuery] = useState("");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const optionsRailRef = useRef<HTMLDivElement>(null);
  const railPausedRef = useRef(false);
  const railManualScrollRef = useRef<number | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
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
    const filtered = OPPORTUNITIES.filter((opportunity) => {
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
  }, [selectedFilters, feeFilter, selectedLocation, selectedAudience, selectedTag, viewMode, sortDirection, query]);

  const activeFilterCount = (selectedFilters.type !== FILTERS.type[0] ? 1 : 0) + (selectedFilters.field !== FILTERS.field[0] ? 1 : 0) + (selectedFilters.reward !== FILTERS.reward[0] ? 1 : 0) + (feeFilter !== "all" ? 1 : 0) + (selectedLocation !== "All" ? 1 : 0) + (selectedAudience !== "All" ? 1 : 0) + (selectedTag !== "All" ? 1 : 0);
  const resetMobileFilters = () => {
    setSelectedFilters({ type: FILTERS.type[0], field: FILTERS.field[0], reward: FILTERS.reward[0] });
    setFeeFilter("all");
  };

  const toggleSaved = (slug: string) => {
    setSavedSet((current) => {
      const next = new Set(current);
      if (next.has(slug)) next.delete(slug); else next.add(slug);
      return next;
    });
  };

  return (
    <main className="min-h-screen overflow-x-hidden bg-[var(--background)] pt-[65px] text-[var(--foreground)]">
      <Header />
      <section className="px-5 pb-24 pt-8 md:px-8 md:pt-6 lg:px-12">
        {/* On desktop the filter row is what leads the page; the H1 lives on
            mobile only so screen readers still get a page title. */}
        <h1 className="editorial-serif mb-6 text-[clamp(1.2rem,4vw,1.6rem)] uppercase leading-none tracking-[-0.02em] md:sr-only">
          Opportunities
        </h1>
        <div className="hidden md:flex md:justify-end">
          <Link
            href="/submit"
            className="whitespace-nowrap text-[11px] uppercase tracking-[0.2em] text-neutral-700 transition-opacity hover:opacity-55"
          >
            Submit Opportunities <span aria-hidden="true">↗</span>
          </Link>
        </div>

        {/* Mobile-only search + filter button. Desktop toolbar sits with the filter chips below. */}
        <div className="md:hidden">
          <SearchBar
            value={query}
            onChange={setQuery}
            placeholder="Search opportunities"
            onFilterClick={() => setMobileFiltersOpen(true)}
            filterBadge={activeFilterCount}
          />
        </div>

        {/* Desktop: one row of filter categories (label + current value),
            hovering swaps the rail below to that category's options.
            Matches the /exhibitions filter pattern. */}
        {(() => {
          const feeLabel =
            feeFilter === "all" ? "All Fees" : feeFilter === "free" ? "Free to apply" : "Paid application";
          const modes: Array<{ id: DesktopMode; label: string }> = [
            {
              id: "tags",
              label: selectedTag === "All" ? "ALL TAGS" : selectedTag.toUpperCase(),
            },
            {
              id: "type",
              label:
                selectedFilters.type === FILTERS.type[0]
                  ? "ALL TYPES"
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
                  ? "ALL LOCATIONS"
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
                labelFor: (option) => (option === FILTERS.type[0] ? "All types" : option),
              },
              fee: {
                options: ["all", "free", "paid"],
                current: feeFilter,
                onSelect: (option) => setFeeFilter(option as FeeFilter),
                labelFor: (option) =>
                  option === "all" ? "All fees" : option === "free" ? "Free to apply" : "Paid application",
              },
              location: {
                options: ["All", ...locationTree.map((entry) => entry.country)],
                current:
                  selectedLocation === "All"
                    ? "All"
                    : (locationTree.find((e) => e.country === selectedLocation) ? selectedLocation
                        : locationTree.find((e) => selectedLocation.endsWith(`, ${e.country}`))?.country ?? "All"),
                onSelect: (option) => setSelectedLocation(option === "All" ? "All" : option),
                labelFor: (option) => (option === "All" ? "All locations" : option),
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
                labelFor: (option) => (option === "All" ? "All tags" : option),
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
              {visibleOpportunities.map((opportunity) => <OpportunityCard key={opportunity.slug} opportunity={opportunity} onOpen={() => setSelectedOpportunity(opportunity)} />)}
            </div>
          ) : (
            <OpportunitiesListView
              opportunities={visibleOpportunities}
              onOpen={(opp) => setSelectedOpportunity(opp)}
              savedSet={savedSet}
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
      {selectedOpportunity ? <OpportunityDetail opportunity={selectedOpportunity} onClose={() => setSelectedOpportunity(null)} /> : null}
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
        drawerQuery={query}
        setDrawerQuery={setQuery}
      />
    </main>
  );
}

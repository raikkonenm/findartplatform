"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Header } from "./Header";
import { SearchBar } from "./SearchBar";

const FILTERS = {
  type: ["Types", "Residencies", "Awards & Prizes", "Calls for Curators", "Collaborations", "Commissions", "Education", "Grants & Stipends", "Jobs", "Open Calls"],
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

export const OPPORTUNITIES: Opportunity[] = [
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
  {
    slug: "unlimited-partner-awards-2026-27",
    organizer: "Unlimited",
    title: "Partner Awards 2026/27",
    deadline: "28 September 2026",
    deadlineDate: "2026-09-28",
    location: "United Kingdom",
    audience: "Disabled artists based in England, Scotland or Wales (or leading a disabled-led company), aged 18+, not in full-time education",
    audiences: ["Individual artists", "Collectives / groups"],
    type: ["Awards & Prizes", "Grants & Stipends"],
    fields: ["Interdisciplinary", "Performance", "Visual Arts", "Sound Art", "Digital"],
    rewards: ["Funding", "Production"],
    rewardSummary: "£15,000 – £40,000",
    applicationFee: "FREE",
    tags: ["AWARD", "DISABILITY", "COMMISSION", "UK"],
    intro: [
      "Unlimited's Partner Awards help disabled artists bring ambitious new work to life. This year 11 awards totalling £280,000 are offered across England, Scotland and Wales, funded by Arts Council England, Arts Council of Wales and the National Lottery through Creative Scotland.",
      "Awards range from £15,000 to £40,000. Full details, criteria and application guidance are available on each partner award's individual page, in audio, BSL, Easy Read, large print, Scottish Gaelic and Welsh where applicable.",
    ],
    sections: [
      { title: "Awards", items: ["England: Apples and Snakes, Creative Folkestone, Norfolk & Norwich Festival, Plymouth Culture, Sainsbury Centre, Storyhouse, Turner Sims, Without Walls", "Scotland: Cryptic and Scottish Sculpture Workshop", "Wales: Sherman Theatre"] },
      { title: "Eligibility", items: ["Disabled artist, or disabled artist leading the creation of work within a disabled-led company", "Based in England, Scotland or Wales", "Aged 18+", "Not in full-time education"] },
      { title: "Application", items: ["Deadline: Monday 28 September 2026, midday", "Apply via each individual award page on the Unlimited website", "Information sessions and FAQs available on the Unlimited site"] },
    ],
    applyUrl: "https://weareunlimited.org.uk/opportunities/apply/partner-awards-2026-27/",
  },
  {
    slug: "espace-brownstone-art-in-latin-america-2027",
    organizer: "Espace Brownstone × Art in Latin America",
    title: "Espace Brownstone Residency 2027",
    deadline: "15 October 2026",
    deadlineDate: "2026-10-15",
    location: "Paris, France",
    audience: "Artists from Latin America and the Caribbean working in any medium or discipline, at any stage of their career",
    audiences: ["Individual artists", "Interdisciplinary practitioners"],
    type: ["Residencies", "Open Calls"],
    fields: ["Visual Arts", "Interdisciplinary", "Research"],
    rewards: ["Accommodation", "Studio Space", "Other"],
    rewardSummary: "2.5-month residency + studio",
    applicationFee: "FREE",
    tags: ["RESIDENCY", "LATIN AMERICA", "PARIS", "CURATORIAL SUPPORT"],
    intro: [
      "Association Noemi — Espace Brownstone (formerly Fondation Brownstone) and Art in Latin America open a call for artists from Latin America and the Caribbean to spend two and a half months at Espace Brownstone in Paris (15 January — 31 March 2027).",
      "The residency offers dedicated time and studio space, curatorial support, and connections to the Parisian art ecosystem. It pairs Espace Brownstone's more than two decades as a leading Paris space for art from Latin America and the Caribbean with Art in Latin America's mission to amplify practices from the region.",
    ],
    sections: [
      { title: "Support", items: ["Accommodation in an apartment inside Espace Brownstone for the full 2.5 months", "Dedicated private studio at Espace Brownstone", "Curatorial support developing the project and connecting to Parisian institutions", "Visa assistance — invitation letters and supporting documentation where possible"] },
      { title: "Not covered", items: ["International or domestic flights", "Personal expenses (meals, local transport, travel insurance)", "Visa application fees and associated costs"] },
      { title: "Application", items: ["Deadline: 15 October 2026, 23:59 Paris time (CEST)", "Submit via the official form only; incomplete or late applications are not considered", "Selected artist notified by email on 15 November 2026"] },
    ],
    applyUrl: "https://www.artinlatam.com/p/open-call-espace-brownstone-art-in",
  },
  {
    slug: "tagli-2026-mentorship-rosewood-london",
    organizer: "THE TAGLI × Rosewood London",
    title: "TAGLI 2026 Mentorship Award",
    deadline: "6 September 2026",
    deadlineDate: "2026-09-06",
    location: "London, United Kingdom",
    audience: "Emerging artists based in the UK or EU working in painting, photography, drawing or sculpture, with no full gallery representation",
    audiences: ["Individual artists", "Emerging / young artists"],
    type: ["Awards & Prizes", "Open Calls"],
    fields: ["Painting", "Photography", "Drawing", "Sculpture", "Visual Arts"],
    rewards: ["Cash Prize", "Exhibition", "Education"],
    rewardSummary: "£2,000 + year-long mentorship",
    applicationFee: "FREE",
    tags: ["AWARD", "MENTORSHIP", "EXHIBITION", "EMERGING"],
    intro: [
      "THE TAGLI's 2026 Mentorship Award, in partnership with Rosewood London, is for emerging painters, photographers, illustrators and sculptors based in the UK or EU. The winner gets a year-long mentorship with THE TAGLI team and an exhibition at Rosewood London tied to Frieze Week 2026.",
      "The exhibition is part of Rosewood London's Living Gallery — a rotating residency programme spotlighting emerging contemporary artists connected to London — and shows alongside two shortlisted nominees.",
    ],
    sections: [
      { title: "Winner receives", items: ["Year-long mentorship with THE TAGLI team (regular meetings, career coaching, market guidance)", "Inclusion in the Living Gallery group residency exhibition at Rosewood London", "£2,000 bursary provided by Rosewood"] },
      { title: "Shortlisted nominees", items: ["Two shortlisted nominees have their work included alongside the winner in the same exhibition", "Each shortlisted nominee receives a £500 bursary from Rosewood"] },
      { title: "Eligibility & application", items: ["Based in the UK or EU", "No full gallery representation (group shows and consignment fine)", "Works submitted must be available for sale (gallery takes 50% commission)", "Deadline: Sunday 6 September 2026, 18:00 BST"] },
    ],
    applyUrl: "https://docs.google.com/forms/d/e/1FAIpQLSeF94G_7iR7p2iQfZcFxBxS1LeYTShwLIEsJtpZr3IvDUWYtw/viewform",
  },
  {
    slug: "shelter-bermondsey-2026",
    organizer: "Monica Mardare (independent curator)",
    title: "Shelter — Group Exhibition",
    deadline: "30 September 2026",
    deadlineDate: "2026-09-30",
    location: "London, United Kingdom",
    audience: "Artists at any career stage working in any medium responding to the theme of shelter",
    audiences: ["Individual artists", "Interdisciplinary practitioners"],
    type: ["Open Calls"],
    fields: ["Visual Arts", "Painting", "Sculpture", "Photography", "Digital", "Installation"],
    rewards: ["Exhibition"],
    rewardSummary: "Exhibition + private view",
    applicationFee: "£150 / piece",
    tags: ["OPEN CALL", "GROUP SHOW", "LONDON", "EXHIBITION"],
    intro: [
      "Shelter is a group exhibition at 15 Bermondsey Square, Central London (31 October — 4 November 2026), curated by Monica Mardare. It asks artists to locate their own shelter — the person, place, body, boundary, ritual, memory or community that protects them — and what that protection costs.",
      "Works can respond directly, obliquely or unexpectedly. The exhibition supports meaningful encounters with collectors, curators and art-interested visitors, with viewings by appointment and a public opening night with drinks and music.",
    ],
    sections: [
      { title: "Support", items: ["Full curatorial and installation support", "Professional photographs and video of your work and the exhibition", "Certificate of participation and collaboration agreement", "Promotion through printed materials, curator's Instagram (13K followers), and targeted collector-facing campaigns", "Private view with drinks and a live art component"] },
      { title: "Fees & sales", items: ["Participation fee: £150 per piece (physical, digital, 3D). Plinth on request, additional cost", "Larger / installation-based works: fee adjusted on discussion", "All submitted artworks should be for sale; 20% commission, 80% to the artist", "Payment due within 7 days of acceptance; non-refundable"] },
      { title: "Key dates", items: ["Application deadline: 30 September 2026, 23:59 BST", "Selection announced by 22 September 2026 (by email)", "Delivery: 29 October 2026", "Opening night: 31 October 2026", "Collection: 4 November 2026"] },
    ],
    applyUrl: "https://docs.google.com/forms/d/e/1FAIpQLSfSorFyo4vfhukiYAyOziEDB7Lx4_8AVWdJBq-fz5tp4Oc6bw/viewform",
  },
  {
    slug: "arteles-neo-future-2026",
    organizer: "Arteles Creative Center",
    title: "Neo Future — Shifting into New Realities",
    deadline: "3 September 2026",
    deadlineDate: "2026-09-03",
    location: "Hämeenkyrö, Finland",
    audience: "Artists, designers, writers, researchers, technologists, philosophers, scientists, innovators and visionary thinkers engaging with emerging futures",
    audiences: ["Individual artists", "Interdisciplinary practitioners"],
    type: ["Residencies", "Open Calls"],
    fields: ["Interdisciplinary", "Research", "Digital", "Design", "Writing"],
    rewards: ["Accommodation", "Studio Space", "Other"],
    rewardSummary: "2-week residency + studio",
    applicationFee: "FREE",
    tags: ["RESIDENCY", "FUTURE STUDIES", "AI", "SPECULATIVE", "TRANSDISCIPLINARY"],
    intro: [
      "Neo Future is a two-week thematic residency at Arteles Creative Center (3 – 18 December 2026) for people reaching beyond the familiar and investigating what may emerge next — AI, expanded consciousness, human transformation, singularity, future societies and realities not yet named.",
      "The programme brings imagination, inquiry and experimentation together across art, science, design, technology, philosophy and unconventional forms of knowledge. It is process-focused rather than outcome-driven, with an open supportive structure, private studios and voluntary group meetings.",
    ],
    sections: [
      { title: "Included", items: ["Private bedroom + studio spaces, 24/7 access", "Fully equipped kitchen and laundry", "Wi-fi in all spaces, traditional wood-burning sauna", "Two residency cars for regional trips", "Pick-up service, orientation, staff on site", "Daily voluntary meditation sessions and group events"] },
      { title: "Programme fees (no application fee)", items: ["Financially supported fee: €1,050 (limited numbers)", "Regular fee: €1,450", "Contributor fee: €1,850 (voluntary contribution)", "Supporter fee: €2,250 (larger voluntary contribution)", "Registration fee €120 (non-refundable, only paid if selected)"] },
      { title: "Eligibility", items: ["Minimum age 23", "University degree (min. BA); exceptions for relevant experience", "Applications are individual (duos apply separately, mentioning each other)", "Deadline: 3 September 2026, 23:59 UTC-10"] },
    ],
    applyUrl: "https://www.arteles.org/future_residency.html",
  },
  {
    slug: "aspex-communal-autumn-winter-2026",
    organizer: "Aspex Portsmouth",
    title: "Communal Autumn/Winter — 'Form'",
    deadline: "6 September 2026",
    deadlineDate: "2026-09-06",
    location: "Portsmouth, United Kingdom",
    audience: "Artists, creatives and collectives looking for a space to develop ideas, explore connections and experiment with new ways of working",
    audiences: ["Individual artists", "Collectives / groups", "Interdisciplinary practitioners"],
    type: ["Open Calls"],
    fields: ["Visual Arts", "Interdisciplinary", "Social Practice", "Research"],
    rewards: ["Studio Space"],
    rewardSummary: "Free use of the Communal Space",
    applicationFee: "FREE",
    tags: ["OPEN CALL", "COMMUNITY", "COMMUNAL SPACE", "UK"],
    intro: [
      "Aspex Portsmouth invites proposals to use its Communal Space free of charge during the Autumn/Winter 2026 season, as part of the ongoing Communal programme. This season's theme is 'Form' — what it means to begin to exist as artists or communities, to form impressions, to make or become something, and how separate elements come together to create a whole.",
      "The call is for creative workshops, participatory events, collaborative projects, research, discussions or other community-focused activity that brings people together through creativity. Exhibition proposals are not considered.",
    ],
    sections: [
      { title: "What's on offer", items: ["Free use of Aspex's Communal Space in October and November 2026", "Support from the Aspex team and connection to their public programmes"] },
      { title: "Application", items: ["Apply via the linked Google Form only", "Deadline: Sunday 6 September 2026"] },
    ],
    applyUrl: "https://aspex.org.uk/about/opportunities/",
  },
  {
    slug: "teatri-riflessi-2027",
    organizer: "IterCulture APS (Teatri Riflessi)",
    title: "Teatri Riflessi 2027 — Short Performance Competition",
    deadline: "15 October 2026",
    deadlineDate: "2026-10-15",
    location: "Zafferana Etnea, Italy",
    audience: "Companies and individual artists working in short live performance formats (max 15 minutes)",
    audiences: ["Individual artists", "Collectives / groups", "Performing artists"],
    type: ["Awards & Prizes", "Open Calls"],
    fields: ["Performance", "Dance", "Interdisciplinary"],
    rewards: ["Cash Prize", "Travel", "Other"],
    rewardSummary: "€500 – €1,200 prizes + fees",
    applicationFee: "FREE",
    tags: ["AWARD", "PERFORMANCE", "FESTIVAL", "SICILY"],
    intro: [
      "Teatri Riflessi is an international competition for short live performances (max 15 minutes) held in Zafferana Etnea, Sicily, from 16 – 19 July 2027. Now in its 12th edition, the festival promotes discussion on dramaturgy and contemporary performing languages, connecting the stage to the representation of the territory and back again.",
      "The 2027 theme, Constellations, evokes a living web of invisible bonds — a network of relationships that precedes us and connects us to others and the landscapes we inhabit. Around 10 short performances will be selected via open call.",
    ],
    sections: [
      { title: "Fees and awards", items: ["Selected performances receive €500 – €1,100 (VAT included) depending on cast size", "Possible travel contribution up to €250 (subject to funding, origin, cast size)", "Main awards include Best Performance €1,200; Best Dramaturgy €500; Best Direction €500; Best Performer €500; Scholars' & Critics' €500; Youth Jury €300; plus special partner awards"] },
      { title: "Application", items: ["Free to apply; €50 refundable deposit only if selected", "Complete dramaturgy or research doc + full performance video (excerpts insufficient)", "Foreign-language works accepted (Italian + English surtitles provided)", "Deadline: 15 October 2026, 17:00 CET"] },
      { title: "Presentation", items: ["Rehearsals 13 – 14 July 2027; semi-finals 15 – 16 July; final 18 July", "Attendance required through 23:30 on Sunday 18 July 2027"] },
    ],
    applyUrl: "https://www.iterculture.eu/en/teatri-riflessi/tr2027/tr12/",
  },
  {
    slug: "hessische-kulturstiftung-travel-residency-2027-2028",
    organizer: "Hessische Kulturstiftung",
    title: "Travel & Residency Grants 2027/2028",
    deadline: "15 October 2026",
    deadlineDate: "2026-10-15",
    location: "Wiesbaden, Germany",
    audience: "Visual artists born in Hesse, or resident there since ≤ 1 Jan 2025, or having completed a degree at a Hesse art academy or comparable programme",
    audiences: ["Individual artists"],
    type: ["Grants & Stipends", "Residencies"],
    fields: ["Visual Arts", "Interdisciplinary", "Digital", "Photography", "Sculpture", "Painting"],
    rewards: ["Funding", "Accommodation", "Travel"],
    rewardSummary: "€12,500 – €25,000 grants",
    applicationFee: "FREE",
    tags: ["GRANT", "RESIDENCY", "HESSE", "INTERNATIONAL"],
    intro: [
      "The Hessische Kulturstiftung awards 5 travel grants (3 – 12 months) and 9 residency / combined grants for 2027/2028: New York City, London and Paris (12 months), Istanbul (6 months), and Kyoto (3 months residency at Villa Kamogawa + 3 months travel). Artist duos may submit a joint application, with no age limit.",
      "For the production of works developed within the grant or their presentation in exhibitions or publications, an additional €7,700 is available for up to three years after the grant period.",
    ],
    sections: [
      { title: "Grants offered", items: ["5 travel grants (€25,000 each) 2027/2028", "2027: 1 NYC, 1 Paris, 2 Istanbul, 1 Kyoto + Japan travel", "2028: 1 NYC, 1 Paris, 1 London, 1 Kyoto + Japan travel", "Additional up to €7,700 for production / presentation"] },
      { title: "Eligibility", items: ["Born in Hesse, or primary Hesse residence since ≤ 1 Jan 2025, or completed studies at a Hesse art academy", "No age limit; duos may apply jointly", "Previous Hessische Kulturstiftung travel / residency grantees not eligible", "Not currently in a degree or vocational programme"] },
      { title: "Application", items: ["Submit via bewerberportal.hkst.de", "Documents: CV, project proposal (max 3 pages / 6,000 keystrokes), digital / video material (max 10 MB), 2 professional referees, ID + proof of prerequisites", "Deadline: 15 October 2026, 23:59 CET", "Shortlist + random-selection final round; funding decisions announced December 2026"] },
    ],
    applyUrl: "https://www.hkst.de/en/scholarships_/applications-2/",
  },
  {
    slug: "the-perch-yale-the-mix-2027",
    organizer: "Yale Program for Recovery and Community Health",
    title: "The Perch — 'The Mix' Open Call",
    deadline: "31 October 2026",
    deadlineDate: "2026-10-31",
    location: "New Haven, United States",
    audience: "Writers, artists, scholars and psychiatric survivors submitting to a peer-reviewed creative arts journal with mental health themes",
    audiences: ["Individual artists", "Interdisciplinary practitioners"],
    type: ["Open Calls"],
    fields: ["Writing", "Visual Arts", "Photography", "Interdisciplinary"],
    rewards: ["Publication"],
    rewardSummary: "Journal publication",
    applicationFee: "FREE",
    tags: ["PUBLICATION", "MENTAL HEALTH", "PEER-REVIEWED", "JOURNAL"],
    intro: [
      "The Perch, a peer-reviewed creative arts journal produced by the Yale Program for Recovery and Community Health, opens submissions for its next issue — The Mix — launching October 2027. The theme refers to the double-sided nature of mental illness and mental health: the highs and lows, the joys and sorrows, and the brilliant things that can derive from the experience.",
      "The issue seeks poetry, creative nonfiction, fiction, artwork, visual art and scholarly pieces that illustrate the profound melange of mental illness. The editors are most interested in personal stories.",
    ],
    sections: [
      { title: "What to submit", items: ["Poetry, creative nonfiction, fiction, artwork, visual art or scholarly pieces", "Personal stories especially welcomed", "Peer-reviewed open call — all are welcome to submit"] },
      { title: "Application", items: ["Submit via https://theperch.submittable.com/submit", "Deadline: 31 October 2026", "Questions: graziela.reis@yale.edu or jcriscola@ccsu.edu"] },
    ],
    applyUrl: "https://medicine.yale.edu/psychiatry/consulting-and-evaluation-services/program-for-recovery-and-community-health/news-and-events/the-perch/",
  },
  {
    slug: "photographers-gallery-cite-past-sight-stars",
    organizer: "The Photographers' Gallery × The Ampersand Foundation",
    title: "Cite the Past, Sight the Stars — Residency",
    deadline: "6 September 2026",
    deadlineDate: "2026-09-06",
    location: "Derbyshire, United Kingdom",
    audience: "Individual artists over 18 with the legal right to work in the UK, working with expanded photography and digital practices",
    audiences: ["Individual artists"],
    type: ["Residencies", "Open Calls"],
    fields: ["Photography", "Digital", "Research", "Interdisciplinary"],
    rewards: ["Accommodation", "Studio Space", "Funding", "Production", "Travel"],
    rewardSummary: "£3,500 + accommodation + studio",
    applicationFee: "FREE",
    tags: ["RESIDENCY", "PHOTOGRAPHY", "DIGITAL", "RESEARCH"],
    intro: [
      "A two-month residency at Wigwell Lodge, Derbyshire, for one artist working with expanded photography and digital practices, in partnership with The Ampersand Foundation. The residency takes place in the context of photography's 200th anniversary, with prompts including the Mnemosyne Atlas, the Voyager Golden Record, StarDisk, computational culture and image-making across time and networks.",
      "It is an opportunity to research, experiment and expand thinking around photography, technology and innovative approaches to image-making and visual culture, with the potential to develop into a project or commission for 2027/2028.",
    ],
    sections: [
      { title: "What the residency offers", items: ["Two months' accommodation and studio space at Wigwell Lodge, Derbyshire", "£1,000 stipend per month", "£1,000 production budget", "Up to £500 towards travel", "Curatorial and administrative support from The Photographers' Gallery", "Public presentation or showcase at The Photographers' Gallery or a partner venue"] },
      { title: "Eligibility", items: ["Individual artists over 18 with the legal right to work in the UK", "No fee to apply"] },
      { title: "Application", items: ["Application deadline: Sunday 6 September 2026, 23:59", "Selection panel includes Sam Mercer (TPG), Michelle Henning, Milia Xin Bi, Sarah Cook and The Ampersand Foundation", "Selected artist confirmed in September 2026"] },
    ],
    applyUrl: "https://thephotographersgallery.org.uk/whats-on/open-call-cite-past-sight-stars",
  },
  {
    slug: "wrg-digital-callout-generation-xi",
    organizer: "White Rabbit Gallery",
    title: "WRG Digital Call-Out — Generation Xi",
    deadline: "14 September 2026",
    deadlineDate: "2026-09-14",
    location: "Sydney, Australia",
    audience: "Emerging artists or designers aged 18+, within the first 10 years of practice, not represented by a commercial gallery or design agency",
    audiences: ["Individual artists", "Collectives / groups", "Emerging / young artists"],
    type: ["Awards & Prizes", "Commissions"],
    fields: ["Digital", "Design", "Visual Arts", "Video"],
    rewards: ["Cash Prize", "Publication", "Other"],
    rewardSummary: "A$2,000 + 5-month landing-page feature",
    applicationFee: "FREE",
    tags: ["AWARD", "DIGITAL", "MOTION", "AUSTRALIA"],
    intro: [
      "The White Rabbit Gallery Digital Call-Out invites emerging artists and designers to respond to the current gallery exhibition theme — Generation Xi — with an animation / artwork for the WRG website landing page. The winning artwork is showcased on the landing page 24/7 for 5 months, promoted across WRG social channels, and permanently archived in the WRG Digital Archive.",
      "For this round, applicants are invited to work in the aesthetic of New Ugly: a design movement that discards traditional composition rules and embraces chaos, imperfection and visual excess. Full technical specs are provided in the info pack.",
    ],
    sections: [
      { title: "Winner receives", items: ["A$2,000 artist fee (split evenly for collaborative groups)", "5 months of landing-page promotion", "Promotion across WRG social media", "Professional support from Spring in Alaska during a development period", "Permanent placement in the WRG Digital Archive"] },
      { title: "Eligibility", items: ["Age 18+", "Emerging artist / designer within the first 10 years of practice", "No commercial gallery representation, not employed by a design agency"] },
      { title: "Key dates", items: ["Applications open: 27 July 2026", "Briefing sessions: 10 August & 24 August 2026, 11:00 AEST", "Applications close: Monday 14 September 2026, 17:00 AEST", "Winner notified: 21 September 2026", "Development period: 28 September – 2 November 2026", "Launch: Monday 9 November 2026, 09:00 AEST"] },
    ],
    applyUrl: "https://whiterabbitcollection.org/wrg-digital-call-out/",
  },
  {
    slug: "ceramics-now-annual-2026",
    organizer: "Ceramics Now",
    title: "Ceramics Now Annual 2026 — Featured Artist",
    deadline: "15 September 2026",
    deadlineDate: "2026-09-15",
    location: "International",
    audience: "Ceramic artists worldwide at any career stage; works made 2023 – 2026 and at least 60% ceramic material",
    audiences: ["Individual artists"],
    type: ["Open Calls", "Awards & Prizes"],
    fields: ["Sculpture", "Design", "Applied Arts", "Visual Arts"],
    rewards: ["Publication"],
    rewardSummary: "Print + digital feature",
    applicationFee: "$15",
    tags: ["PUBLICATION", "CERAMICS", "MAGAZINE", "INTERNATIONAL"],
    intro: [
      "Ceramics Now is inaugurating its flagship Annual publication: an editorial project spotlighting new artists, ideas and perspectives shaping contemporary ceramics. At least 20 artists will be selected through this international open call and featured in the print + digital edition released in December 2026.",
      "There is no fixed theme. Applications welcome from all stages of career and from every area of ceramic practice. Ceramics Now is read by over 70,000 people each month.",
    ],
    sections: [
      { title: "Selected artists receive", items: ["A dedicated artist profile in Ceramics Now Annual 2026 (print + digital)", "Publication on the Ceramics Now web platform, newsletter and social media, with continued promotion through 2027", "Free annual subscription to Ceramics Now Magazine", "Chance to be featured on the Annual's cover", "Permanent archival visibility on the website"] },
      { title: "Application", items: ["Non-refundable submission fee: $15 (supports the selection process and Annual production)", "Works must have been made between 2023 – 2026 and be at least 60% ceramic material", "Deadline: 15 September 2026", "Selected artists announced 10 October 2026"] },
    ],
    applyUrl: "https://www.ceramicsnow.org/opencall/",
  },
  {
    slug: "roi-annual-exhibition-2026",
    organizer: "Royal Institute of Oil Painters",
    title: "ROI Annual Exhibition 2026 — Open Submission",
    deadline: "9 October 2026",
    deadlineDate: "2026-10-09",
    location: "London, United Kingdom",
    audience: "Oil painters submitting original work in oil paint; open to all subjects and approaches, including plein-air, portrait, still life, landscape and abstract",
    audiences: ["Individual artists"],
    type: ["Open Calls", "Awards & Prizes"],
    fields: ["Painting"],
    rewards: ["Cash Prize", "Exhibition"],
    rewardSummary: "Prizes over £10,000",
    applicationFee: "See website",
    tags: ["OPEN CALL", "PAINTING", "OIL PAINTING", "LONDON"],
    intro: [
      "The Royal Institute of Oil Painters (founded 1882) invites artists to submit work for the ROI Annual Exhibition 2026 at Mall Galleries, London. The 2026 optional theme is 'Winter Rituals' — the traditions, gestures and rhythms that shape our experience of winter.",
      "Successful applicants have work shown in the gallery and online, become eligible for prizes and awards worth over £10,000, are invited to the Private View, and become part of a network of exhibiting artists dating back to 1882.",
    ],
    sections: [
      { title: "Selected prizes", items: ["The Roger Remington Award — £4,000", "Winsor & Newton Young Artist Award (age ≤ 30) — £1,000 / £600 / £400 in fine art materials", "The Peter Wileman Award — £500 for an imaginative work", "The ROI Themed Painting Prize — £500 for the standout 'Winter Rituals' work", "Numerous additional prizes, medals and certificates of commendation"] },
      { title: "Key dates", items: ["Submissions open: Monday 8 June 2026, 12:00", "Submissions close: Friday 9 October 2026, 12:00", "Notification of selection: Friday 23 October 2026, 12:00", "Receiving Day (if selected): Saturday 14 November 2026", "Private View: Wednesday 25 November 2026", "Exhibition: Thursday 26 November – Saturday 12 December 2026"] },
      { title: "How to submit", items: ["Register / log in to the Open Exhibition Submission System (OESS)", "Upload primary image (JPEG / PNG, <5MB) + optional 2 detail images per work", "Include title, medium, size (cm), year and price", "See the ROI website for the current submission fee and full details"] },
    ],
    applyUrl: "https://www.mallgalleries.org.uk/open-calls/royal-institute-oil-painters",
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

function OpportunityCard({ opportunity, onOpen, isSaved, onToggleSaved }: { opportunity: Opportunity; onOpen: () => void; isSaved: boolean; onToggleSaved: () => void }) {
  return (
    <article className="group/card relative flex min-h-[260px] flex-col border border-[var(--border)] p-3 transition-colors duration-300 hover:border-neutral-500 md:min-h-[340px] md:p-5">
      <div className="mb-4 flex items-start justify-between gap-2 pr-6 md:mb-8 md:gap-3">
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

// Desktop table grid: OPPORTUNITY (+ organizer under) · TYPE · DEADLINE · LOCATION · FOR · FEE
// (TAGS column is hidden per design; tag filter still active in the filter row above.)
const LIST_ROW_COLS =
  "md:grid-cols-[minmax(0,2.4fr)_110px_110px_minmax(0,1.1fr)_minmax(0,1.3fr)_120px]";

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
      className={`group grid cursor-pointer grid-cols-[1fr_auto] items-start gap-x-5 gap-y-2 border-b border-neutral-200 px-2 py-6 transition-colors duration-200 hover:bg-neutral-50 ${LIST_ROW_COLS} md:items-center md:gap-x-6 md:px-4 md:py-6`}
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

      {/* TAGS column intentionally omitted (filter still available above). */}

      {/* FEE — mobile bottom-left */}
      <span className="order-4 text-[11px] uppercase tracking-[0.18em] text-neutral-700 md:hidden">
        <FeeTag fee={opportunity.applicationFee} compact />
      </span>

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
      <aside className="absolute inset-x-0 top-0 max-h-[92vh] w-full overflow-y-auto bg-[var(--background)] shadow-[0_16px_35px_rgba(0,0,0,0.15)] md:inset-y-0 md:right-0 md:left-auto md:top-0 md:max-h-none md:w-[72vw] md:shadow-[-12px_0_35px_rgba(0,0,0,0.12)] lg:w-[62vw] lg:max-w-[1050px]">
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
        {/* H1 is present but sr-only on every viewport — the page title is
            handled by the mobile FILTERS row and by the filter chips on desktop. */}
        <h1 className="sr-only">Opportunities</h1>
        <div className="hidden md:flex md:justify-end">
          <Link
            href="/submit"
            className="whitespace-nowrap text-[11px] uppercase tracking-[0.2em] text-neutral-700 transition-opacity hover:opacity-55"
          >
            Submit Opportunities <span aria-hidden="true">↗</span>
          </Link>
        </div>

        {/* Mobile-only FILTERS text button — opens the same drawer the icon used to. */}
        <div className="flex justify-end md:hidden">
          <button
            type="button"
            onClick={() => setMobileFiltersOpen(true)}
            className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.22em] text-neutral-700 transition-opacity hover:opacity-60"
          >
            Filters
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
                  isSaved={savedSet.has(opportunity.slug)}
                  onToggleSaved={() => toggleSaved(opportunity.slug)}
                />
              ))}
            </div>
          ) : (
            <OpportunitiesListView
              opportunities={visibleOpportunities}
              onOpen={(opp) => openOpportunity(opp)}
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
        drawerQuery={query}
        setDrawerQuery={setQuery}
      />
    </main>
  );
}

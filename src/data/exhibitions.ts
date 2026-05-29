import { salivaImport13Seeds } from "./salivaImport13";
import { coverImageForTitle } from "./coverImages";

export const semanticTags = [
  "INSTALLATION",
  "POSTHUMAN",
  "ECOLOGY",
  "RITUAL",
  "IDENTITY",
  "DIGITAL MYTH",
  "DECAY",
  "SOUND",
  "GROUP SHOW",
  "LIMINALITY",
  "SPECULATIVE FICTION",
  "HYBRID BODIES",
  "SURVEILLANCE",
  "MATERIALITY",
  "TRANSFORMATION",
  "MYTH",
  "DREAM LOGIC",
  "ORGANIC SYSTEMS",
  "NON-HUMAN",
  "SIMULATION",
  "MUTATION",
  "BODY",
  "MACHINE",
  "TEXTILE",
  "RUINS",
  "ARCHIVE",
  "FRAGMENT",
  "MEMORY",
  "POST-INDUSTRIAL",
  "OBJECTHOOD",
  "SPIRITUALITY",
  "FEMININITY",
  "LABOR",
  "TECHNOLOGY",
  "SPECULATIVE BODY",
  "ARCHAEOLOGY",
  "ABSENCE",
  "MATERIAL MEMORY",
  "DOMESTICITY",
  "ANIMALITY",
  "EROSION",
] as const;

export type SemanticTag = (typeof semanticTags)[number];

export type Exhibition = {
  slug: string;
  title: string;
  subtitle?: string;
  venue?: string;
  gallery?: string;
  city?: string;
  country?: string;
  year?: string;
  dates?: string;
  startDate?: string;
  endDate?: string;
  postDate?: string;
  sortDate?: string;
  dateSource?: "exhibition" | "instagram-post";
  artists?: string[];
  curator?: string;
  photographer?: string;
  exhibitionText?: string;
  description: string;
  summary?: string;
  tags: SemanticTag[];
  coverImage?: string;
  previewImage: string;
  heroImage: string;
  images: {
    src: string;
    orientation?: "horizontal" | "vertical";
    caption?: string;
  }[];
  instagramUrl?: string;
  source?: string;
  sourceUrl?: string;
};

type ExhibitionSeed = Omit<Exhibition, "year" | "tags" | "previewImage" | "heroImage" | "images"> & {
  location?: string;
  year?: string | number;
  previewImage: string;
  heroImage?: string;
  images: Exhibition["images"];
};

function localExhibitionImage(folder: string, filename: string) {
  return `/exhibitions/${encodeURIComponent(folder)}/${encodeURIComponent(filename)}`;
}

function localExhibitionGallery(
  folder: string,
  filenames: string[],
  orientation: "horizontal" | "vertical" = "vertical",
  photographer?: string,
): Exhibition["images"] {
  return filenames.map((filename) => ({
    src: localExhibitionImage(folder, filename),
    orientation,
    caption: photographer ? `Installation view. Photo: ${photographer}` : "Installation view.",
  }));
}

function numberedLocalExhibitionGallery(
  folder: string,
  timestamp: string,
  count: number,
  orientation: "horizontal" | "vertical" = "vertical",
  photographer?: string,
): Exhibition["images"] {
  return localExhibitionGallery(
    folder,
    Array.from({ length: count }, (_, index) => `photo_${index + 1}_${timestamp}.jpg`),
    orientation,
    photographer,
  );
}

const exhibitionMonths: Record<string, number> = {
  january: 0,
  february: 1,
  march: 2,
  april: 3,
  may: 4,
  june: 5,
  july: 6,
  august: 7,
  september: 8,
  october: 9,
  november: 10,
  december: 11,
};

type ExhibitionDateParts = {
  day: number;
  month: number;
  year?: number;
};

function displayYear(exhibition: Pick<Exhibition, "year">) {
  const years = exhibition.year?.match(/\d{4}/g)?.map(Number) ?? [];
  return years.length > 0 ? Math.max(...years) : 0;
}

function parseExhibitionDate(value?: string): ExhibitionDateParts | undefined {
  if (!value) return undefined;

  const monthNames = Object.keys(exhibitionMonths).join("|");
  const dayFirst = value.match(
    new RegExp(`\\b(\\d{1,2})\\s+(${monthNames})(?:,?\\s+(\\d{4}))?`, "i"),
  );
  if (dayFirst) {
    return {
      day: Number(dayFirst[1]),
      month: exhibitionMonths[dayFirst[2].toLowerCase()],
      year: dayFirst[3] ? Number(dayFirst[3]) : undefined,
    };
  }

  const monthDay = value.match(
    new RegExp(`\\b(${monthNames})\\s+(\\d{1,2})(?:,?\\s+(\\d{4}))?\\b`, "i"),
  );
  if (monthDay) {
    return {
      day: Number(monthDay[2]),
      month: exhibitionMonths[monthDay[1].toLowerCase()],
      year: monthDay[3] ? Number(monthDay[3]) : undefined,
    };
  }

  const monthOnly = value.match(new RegExp(`\\b(${monthNames})\\s+(\\d{4})\\b`, "i"));
  if (!monthOnly) return undefined;

  return {
    day: 1,
    month: exhibitionMonths[monthOnly[1].toLowerCase()],
    year: Number(monthOnly[2]),
  };
}

function openingDateValue(
  exhibition: Pick<Exhibition, "year" | "dates" | "startDate" | "postDate">,
) {
  const year = displayYear(exhibition);
  const statedOpening = exhibition.startDate ?? (
    exhibition.dates && !/^\s*(until|through)\b/i.test(exhibition.dates)
      ? exhibition.dates
      : undefined
  );
  const opening = parseExhibitionDate(statedOpening) ?? parseExhibitionDate(exhibition.postDate);

  if (!opening) return Date.UTC(year, 0, 1);

  let openingYear = opening.year ?? year;
  if (!opening.year && exhibition.dates) {
    const monthNames = Object.keys(exhibitionMonths).join("|");
    const rangeMonths = Array.from(
      exhibition.dates.matchAll(new RegExp(`\\b(${monthNames})\\b`, "gi")),
      (match) => exhibitionMonths[match[1].toLowerCase()],
    );

    if (rangeMonths.length > 1 && rangeMonths[0] > rangeMonths[1]) {
      openingYear -= 1;
    }
  }

  return Date.UTC(openingYear, opening.month, opening.day);
}

const semanticTagAssignments: Record<string, SemanticTag[]> = {
  "parachute-group-exhibition": ["TRANSFORMATION"],
  "chewing-gum-in-the-motherboard-group-exhibition": ["DIGITAL MYTH", "SURVEILLANCE"],
  "call-me-we-by-lom-of-lama": ["IDENTITY"],
  "coagvla": ["INSTALLATION", "RITUAL", "MATERIALITY", "TRANSFORMATION"],
  "call-someone-group-exhibition": ["LIMINALITY"],
  "soft-sighs-synthesis": ["TRANSFORMATION"],
  "liminality": ["LIMINALITY", "TRANSFORMATION"],
  "ausserkoerperliche-erfahrung-wandering-spirit": ["ECOLOGY", "RITUAL"],
  "moonlit-botanical-colour-theories": ["ECOLOGY", "ORGANIC SYSTEMS"],
  "blue-blooded": ["NON-HUMAN"],
  "the-collapse-manual-the-post-human-field": ["POSTHUMAN", "DECAY", "SPECULATIVE FICTION"],
  "motions-to-unfurl": ["TRANSFORMATION"],
  "bucolica": ["ECOLOGY", "RITUAL", "MYTH", "MACHINE", "LABOR", "ANIMALITY"],
  "myths-from-smoldering-skies": ["MYTH", "DECAY", "SPECULATIVE FICTION"],
  "thresholds": ["LIMINALITY"],
  "tissu-expanse": ["MATERIALITY", "TRANSFORMATION", "TEXTILE", "OBJECTHOOD"],
  "pulses-within": ["INSTALLATION", "ORGANIC SYSTEMS"],
  "parade": ["HYBRID BODIES", "LIMINALITY"],
  "crash-paendemonia": ["DECAY", "BODY"],
  "fantasy-vanishes-in-flesh": ["POSTHUMAN", "TRANSFORMATION", "BODY"],
  "third-skin": ["MATERIALITY"],
  "desiring-machines": ["DIGITAL MYTH"],
  "paradise-rot": ["INSTALLATION", "ECOLOGY", "MYTH"],
  "the-language-of-the-enemy": ["ECOLOGY", "SIMULATION"],
  "with-feathers-and-flesh": ["NON-HUMAN", "HYBRID BODIES", "TRANSFORMATION"],
  "afterlifes": ["ECOLOGY", "SOUND", "SPECULATIVE FICTION"],
  "the-signal-the-noice": ["DIGITAL MYTH", "SIMULATION"],
  "begone-estrone": ["IDENTITY", "RITUAL", "SOUND", "BODY", "FEMININITY", "DOMESTICITY"],
  "the-last-drawer-on-the-left": ["MATERIALITY"],
  "the-room-i": ["SPECULATIVE FICTION"],
  "encuentro": ["INSTALLATION", "LIMINALITY"],
  "vitals-vapors": ["INSTALLATION", "ORGANIC SYSTEMS", "TRANSFORMATION"],
  "luca": ["INSTALLATION", "ORGANIC SYSTEMS", "SOUND"],
  "distant-endless-hum": ["SPECULATIVE FICTION"],
  "metal-memory": ["MATERIALITY", "POSTHUMAN", "BODY", "TECHNOLOGY", "SPECULATIVE BODY"],
  "green-growth": ["INSTALLATION", "ECOLOGY", "ORGANIC SYSTEMS", "DECAY"],
  "sweet-garden-of-vanished-pleasures": ["ECOLOGY"],
  "falene": ["NON-HUMAN", "TRANSFORMATION"],
  "tar-star": ["INSTALLATION", "MATERIALITY", "ECOLOGY"],
  "farm": ["NON-HUMAN", "TRANSFORMATION"],
  "deep-sea-fish": ["NON-HUMAN", "DIGITAL MYTH"],
  "tipping-point-phantoms": ["ECOLOGY"],
  "dialects-of-the-deep": ["INSTALLATION", "NON-HUMAN", "ECOLOGY", "SOUND"],
  "limo": ["IDENTITY", "DIGITAL MYTH"],
  "petrichor": ["ECOLOGY"],
  "eutrophy": ["ECOLOGY", "DECAY", "ORGANIC SYSTEMS"],
  "human-is": ["POSTHUMAN", "SPECULATIVE FICTION"],
  "lunar-ensemble-for-uprising-seas": ["ECOLOGY", "NON-HUMAN", "HYBRID BODIES", "ANIMALITY", "SPECULATIVE BODY"],
  "total-internal-reflection": ["IDENTITY", "RITUAL", "LIMINALITY", "DIGITAL MYTH", "SPIRITUALITY"],
  "enter-woodland-spirits": ["MYTH"],
  "metempsychosis-the-passion-of-pneumatics": ["RITUAL"],
  "external-cryogenics": ["MATERIALITY", "ANIMALITY"],
  "transparency-report": ["MATERIALITY"],
  "bidim-blo": ["INSTALLATION", "RITUAL"],
  "kassandra": ["MYTH"],
  "main-de-fer-gant-de-velours": ["MATERIALITY", "TRANSFORMATION", "ECOLOGY", "FRAGMENT"],
  "the-shape-of-a-scar": ["TRANSFORMATION", "MATERIALITY", "BODY", "MEMORY"],
  "47-24-35-n-9-44-20-e": ["INSTALLATION", "SOUND", "LIMINALITY", "SPECULATIVE FICTION", "SIMULATION"],
  "even-spectres-can-tire": ["POSTHUMAN", "HYBRID BODIES", "TRANSFORMATION", "SPECULATIVE FICTION"],
  "massage-platz": ["MATERIALITY", "TRANSFORMATION", "LIMINALITY"],
  "the-stages-of-grief": ["ECOLOGY", "MATERIALITY", "ORGANIC SYSTEMS", "DECAY", "MATERIAL MEMORY", "LABOR"],
  "incommunicability-is-itself-a-source-of-pleasures": ["POSTHUMAN", "DIGITAL MYTH", "IDENTITY", "LIMINALITY", "BODY", "TECHNOLOGY"],
  "tomorrows-forecast-white-clouds-grey-dogs": ["DREAM LOGIC", "TRANSFORMATION"],
  "a-blade-unheld": ["MATERIALITY", "TRANSFORMATION"],
  "love": ["IDENTITY", "SOUND"],
  "choice-dirt": ["MATERIALITY", "LIMINALITY", "TRANSFORMATION", "EROSION", "ARCHAEOLOGY", "DOMESTICITY"],
  "exuviae": ["POSTHUMAN", "ECOLOGY", "SIMULATION", "SPECULATIVE FICTION", "BODY", "TECHNOLOGY"],
  "edges-that-blur-bodies-that-fold-into-something-other": ["TRANSFORMATION"],
  "metempsychosis": ["HYBRID BODIES", "TRANSFORMATION", "RITUAL", "POSTHUMAN"],
  "grass-on-roadside-4": ["ECOLOGY"],
  "the-beautiful-remains": ["MEMORY", "MATERIALITY", "FRAGMENT", "BODY", "ABSENCE", "OBJECTHOOD"],
  "profusion-antagonist-wishlist": ["MEMORY", "ARCHAEOLOGY", "TECHNOLOGY", "FRAGMENT", "OBJECTHOOD"],
};

function tagsForExhibition(exhibition: Pick<ExhibitionSeed, "slug" | "title" | "subtitle">): SemanticTag[] {
  const tags = new Set<SemanticTag>(semanticTagAssignments[exhibition.slug] ?? []);

  if (/\bGROUP (?:SHOW|EXHIBITION)\b/i.test(`${exhibition.title} ${exhibition.subtitle ?? ""}`)) {
    tags.add("GROUP SHOW");
  }

  return Array.from(tags);
}

const exhibitionSeeds: ExhibitionSeed[] = [
  ...salivaImport13Seeds,
  {
    slug: "profusion-antagonist-wishlist",
    title: "PROFUSION ANTAGONIST WISHLIST",
    subtitle: "Rebekka Benzenberg, Marc Botschen, Iris Helena Hamers, Alissa Ritter, Emil Walde, Milena Wojhan",
    venue: "PAW",
    gallery: "PAW",
    city: "Düsseldorf",
    country: "Germany",
    year: "2026",
    dates: "1 March - 24 April 2026",
    startDate: "1 March 2026",
    endDate: "24 April 2026",
    dateSource: "exhibition",
    artists: [
      "Rebekka Benzenberg",
      "Marc Botschen",
      "Iris Helena Hamers",
      "Alissa Ritter",
      "Emil Walde",
      "Milena Wojhan",
    ],
    photographer: "Simon Vogel",
    exhibitionText: "Jennifer Braun",
    description: `POV: You’re reading one of those “The first word you see is what your 2026 is gonna be like” word grids. Your gaze brushes over PROFUSION, ANTAGONIST, and WISHLIST. Gahdamn, the TikTok witches were right again. It’s just way too fucking much right now. The lie looks like truth, satire like history, and the nightmare like just another day. You long to go outside to touch some grass again. What a shame that your phone is still charging.

Maybe it’s not all that bad. This is just one person’s point of view. But you’ll have to agree that our present, which was promised to be increasingly rational and calm, looks pretty trippy overall. And instead of being there for us, the sitter is now doing some other bullshit. We’re trapped in Alice in Wonderland. But not the classy, old version – it’s the Tim Burton film adaptation. And unfortunately, there is no predetermined hero arc to follow through our adventure to find a light at the end of the tunnel, fall into each other’s arms, and say that the treasure is the friends we made along the way. No predetermined plot and no hero arc will get us out of this timeline.

Who is the hero of our story? Milena Wojhans’ Hero Series (2025) would be a candidate. Milena’s character is trapped in her own bubble and falls out of her world into another cartoon dimension. However, this hero does not seem adventurous, but rather horrified by this rabbit hole. Well, we didn’t choose it either, after all. Emil Walde has torn some glass panels out of the Hall of Doors to move forward. Those must have spent a long time underground, rusting away. These are old panels from Duisburg Central Station, which now look like archaeological finds. Alissa Ritter just barely managed to get her skewered glass fiber grapes back from the white rabbit’s house. The little party snack morphed into a giant weapon. Maybe we’ll need it somewhere later down the way. And there, the Cheshire Cat is already waiting for us. Iris Helena Hamers’ bright green neon fur lights our way through the dark forest. Is her grin real or an AI hallucination? What is real and what is fake, anyway, she asks, climbing up the tree upside down. We can guess as much as we want. Generated, copied, manipulated, constructed, and prompted — what’s the difference anyway? I can already hear the hysterical laughter of the tea party from afar. The clock stopped working ages ago, and so no one wants to go home. Rebekka Benzenberg’s You Think Think This May Stay Forever (2025) has already compressed schizophrenic party mood with absolute exhaustion onto a mattress. In the Queen of Hearts’ garden, Marc Botschen paints the white roses red. He does not allow himself to be completely drawn into rewriting history. Marc shows the truth where he etches it into metal, overlays it, and distorts it. Miss Queen of Hearts, what exactly did your grandparents do for a living from 1933 to 1945?

We’re probably going to be stuck here for quite a while, so we might as well make ourselves comfortable. Would you excuse me now – it looks like I’ve lost my hat somewhere down the rabbit hole.`,
    previewImage: localExhibitionImage("PROFUSION ANTAGONIST WISHLIST", "1.jpeg"),
    heroImage: localExhibitionImage("PROFUSION ANTAGONIST WISHLIST", "1.jpeg"),
    images: [
      ...localExhibitionGallery("PROFUSION ANTAGONIST WISHLIST", ["1.jpeg"], "vertical", "Simon Vogel"),
      ...localExhibitionGallery("PROFUSION ANTAGONIST WISHLIST", ["2.jpeg", "3.jpeg", "4.jpeg"], "horizontal", "Simon Vogel"),
      ...localExhibitionGallery("PROFUSION ANTAGONIST WISHLIST", ["5.jpeg"], "vertical", "Simon Vogel"),
      ...localExhibitionGallery("PROFUSION ANTAGONIST WISHLIST", ["6.jpeg"], "horizontal", "Simon Vogel"),
      ...localExhibitionGallery("PROFUSION ANTAGONIST WISHLIST", ["7.jpeg", "8.jpeg", "9.jpeg"], "vertical", "Simon Vogel"),
      ...localExhibitionGallery("PROFUSION ANTAGONIST WISHLIST", ["10.jpeg"], "horizontal", "Simon Vogel"),
      ...localExhibitionGallery("PROFUSION ANTAGONIST WISHLIST", ["11.jpeg", "12.jpeg", "13.jpeg", "14.jpeg"], "vertical", "Simon Vogel"),
    ],
  },
  {
    slug: "the-beautiful-remains",
    title: "THE BEAUTIFUL REMAINS",
    subtitle: "KENJI SAKAI",
    venue: "Kohtoh",
    gallery: "Kohtoh",
    city: "Tokyo",
    country: "Japan",
    year: "2026",
    dates: "28 May - 14 June 2026",
    startDate: "28 May 2026",
    endDate: "14 June 2026",
    dateSource: "exhibition",
    artists: ["Kenji Sakai"],
    photographer: "Aya Ogasawara",
    description: `The exhibition centers on a series developed during the artist's time living in London, exploring how individuals gradually internalize emotional weight, anxiety, and invisible pressure in order to adapt to society and urban life. Sakai became aware of a gap between structure and emotion — how experiences are first understood as systems and patterns before slowly emerging as feeling.

Within society, many things remain unspoken yet continue to accumulate quietly beneath the surface — imagined as a lake where the calmer the water appears, the more sediment rests at the bottom. The works do not depict explosive collapse, but rather a subtle state in which suppressed energies and invisible violence begin to quietly leak through the surface.

Stainless steel frames resembling cremation furnaces, fragmented paintings, sediment-like forms, text on transparent surfaces, and traces collected while wandering through London all function as fragments of this internal structure — an attempt to visualize the invisible load carried inside individuals for society to maintain its stillness.`,
    previewImage: localExhibitionImage("THE BEAUTIFUL REMAINS BY KENJI SAKAI", "1.jpeg"),
    heroImage: localExhibitionImage("THE BEAUTIFUL REMAINS BY KENJI SAKAI", "1.jpeg"),
    images: localExhibitionGallery(
      "THE BEAUTIFUL REMAINS BY KENJI SAKAI",
      ["1.jpeg", "2.jpeg", "3.jpeg", "4.jpeg", "5.jpeg", "6.jpeg", "7.jpeg", "8.jpeg", "9.jpeg", "10.jpeg"],
      "vertical",
      "Aya Ogasawara",
    ),
    instagramUrl: "https://www.instagram.com/findart.platform/",
  },
  {
    slug: "the-shape-of-a-scar",
    title: "The Shape of a Scar",
    subtitle: "Aleksandra Olszar, Olivia Rosa, Kornel Leśniak, Michał Iwański and Michał Maliński",
    venue: "Bonifraterska 3/1",
    gallery: "Bonifraterska 3/1",
    city: "Kraków",
    country: "Poland",
    year: "2026",
    dates: "25 Apr - 29 May 2026",
    startDate: "25 April 2026",
    endDate: "29 May 2026",
    dateSource: "exhibition",
    artists: ["Aleksandra Olszar", "Olivia Rosa", "Kornel Leśniak", "Michał Iwański", "Michał Maliński"],
    curator: "Tomek Nowak",
    photographer: "Michał Maliński",
    exhibitionText: "Tomek Nowak",
    description: `Some wounds do not disappear.
They only change form.
Sometimes they harden.
Sometimes they spread slowly, like something searching for a place in the body and in the world.

What hurts us does not always fade with time or with a change of place. It moves with us.
It settles in gestures, in relationships, in the way we look at others and at ourselves. Over time, it stops being an event and becomes a structure.

In these works, the body is not closed.
It is porous, open to touch and to rupture.
The boundary between what is inside and what is outside remains unstable. Emotions, memories, and tensions pass into matter, into form, into objects.

A wound is not only a trace of pain.
It is a place where something begins to shift.
What has been wounded does not return to its previous shape. It grows differently. It hardens. It searches for new ways to exist.

Not everything heals.
Not everything has to.`,
    previewImage: "/exhibitions/the-shape-of-a-scar/01.jpg",
    heroImage: "/exhibitions/the-shape-of-a-scar/01.jpg",
    images: [
      ...localExhibitionGallery("the-shape-of-a-scar", ["01.jpg", "02.jpg", "03.jpg", "04.jpg"], "horizontal", "Michał Maliński"),
      ...localExhibitionGallery("the-shape-of-a-scar", ["05.jpg"], "vertical", "Michał Maliński"),
      ...localExhibitionGallery("the-shape-of-a-scar", ["06.jpg"], "horizontal", "Michał Maliński"),
      ...localExhibitionGallery(
        "the-shape-of-a-scar",
        ["07.jpg", "08.jpg", "09.jpg", "10.jpg", "11.jpg", "12.jpg", "13.jpg", "14.jpg", "15.jpg", "16.jpg", "17.jpg"],
        "vertical",
        "Michał Maliński",
      ),
      ...localExhibitionGallery("the-shape-of-a-scar", ["18.jpg", "19.jpg"], "horizontal", "Michał Maliński"),
      ...localExhibitionGallery("the-shape-of-a-scar", ["20.jpg"], "vertical", "Michał Maliński"),
    ],
    source: "Saliva",
    sourceUrl: "https://saliva.live/exhibitions/4314e47a",
  },
  {
    slug: "47-24-35-n-9-44-20-e",
    title: "47°24’35’’N / 9°44’20’’E",
    subtitle: "Davide Allieri",
    venue: "Kunstraum Dornbirn",
    gallery: "Kunstraum Dornbirn",
    city: "Dornbirn",
    country: "Austria",
    year: "2026",
    dates: "13 Mar - 21 Jun 2026",
    startDate: "13 March 2026",
    endDate: "21 June 2026",
    dateSource: "exhibition",
    artists: ["Davide Allieri"],
    curator: "Thomas Häusle",
    photographer: "Günter Richard Wett",
    description: `47°24’35’’N / 9°44’20’’E - coordinates that mark a real location while at the same time resembling an encrypted message. Whoever follows them arrives at Kunstraum Dornbirn. Yet what unfolds here is not a clearly mappable site, but rather a liminal state. Davide Allieri transforms the historic industrial hall into the point of departure for an enigmatic environment: in the pale haze of a hostile landscape, a luminous portal appears in the form of a large circular sculpture - a possible passage, a technological relic, or a metaphysical sign. Nearby rises a figure approximately four metres long, reminiscent of a drone or a mech. Countless cables run through the space, stretching across floor and architecture to form a network of technical infrastructures whose function remains unclear. Loose ends suggest energy and connection, yet nothing appears to be activated. Emanating from the portal, a pervasive sound settles over the scene like an invisible layer. Sound, light and darkness intensify the feeling of a permanent in-between - a condition in which possibilities remain open yet undetermined. Are we at the beginning of a new epoch - or at the end of a former one?

The immersive installation evokes the atmosphere of an apocalyptic science-fiction narrative, but without narrative clarity. Reality and fiction, past and future, collapse and possibility do not exist as opposites but as overlapping layers. Allieri does not present a conventional dystopian space; he is not interested in romantic ruins or familiar end-of-the-world clichés. What stands at the centre is not catastrophe itself, but what remains afterwards: a present in suspension. Forms persist, yet their original function appears suspended. The bodies are absent. Movement is halted - and yet physically perceptible: Francesco Peccolo develops a specially composed sound design, a low-frequency, vibrating drone interrupted by metallic resonances and fragmented impulses that recall distant signals or the echo of an autonomous machine. The sound oscillates between mechanical precision and atmospheric vastness. It creates an acoustic suspension in which time stretches, orientation dissolves, and space becomes perceptible as a resonating body of potential that evokes uncertain expectation. Installation, sculpture, architecture and sound intertwine into a dense, bodily experience.

What manifests within this environment can be read as the trace of a broken promise. The grand narratives of modern progress have lost their binding force - and with them the memory of the origins of those visions of the future that once provided orientation. A present unfolds that lacks any clear direction. The future loses its function as a projection surface for hope or action; it remains indeterminate. For Allieri, this constellation resonates with Marc Augé’s concept of the non-place, which he shifts into a speculative dimension. His spaces are precisely located and yet neither temporally fixed nor narratively conclusive. Time does not appear cyclical but linearly extended - an elongation of the present without clearly defined origin and without discernible goal. Within this non-time and non-place, a peculiar tension emerges: one finds oneself on a threshold, neither completely inside nor outside the event. It is precisely here that Allieri positions his work - not as dystopia, but as a simulacrum of a possible reality, subtly displaced and decoupled.

The entire environment is conceived specifically for the architecture of Kunstraum Dornbirn, which is shaped by the history of the Vorarlberg metal industry. It forms a resonant framework for Allieri’s narrative, in which the past remains present as a material trace. The monumental sculptures are fabricated from fibreglass - the artist’s preferred material. What is decisive is not only their aesthetic appearance but their inner condition. Allieri conceives his sculptures as shells, as containers. They are not solid but hollow. Within this emptiness lies their conceptual core. A solid sculpture remains an object; an empty one contains space. It preserves enclosure and protection while carrying both memory and potential. Fibreglass allows for extremely thin yet resilient surfaces. The bodies appear technically precise and almost ghostlike - present and yet dematerialised. Form endures, while the interior appears as an indeterminate field of possibility.

Formally, the works oscillate between machine, organism and architectural fragment. They are at once alluring and uncanny, beautiful and threatening, dead and yet charged with latent energy. Their aesthetic draws on references to animated, human-operated drones as well as fragments of contemporary motorcycle and car body parts. Through spatial collage, dysfunctional structures emerge that resemble autonomous creatures. They point to an invisible human presence - a subject that is absent and only reimagined in the act of observation.

By shielding the space from daylight and installing an artificial atmosphere of light and sound, Allieri fundamentally transforms the hall. From the springlike municipal garden, one steps into another sphere - perhaps into an “afterwards” whose meaning remains open. The precise coordinates of the exhibition title anchor this environment firmly in reality, while simultaneously withdrawing it from any clear temporal determination. Whether the portal marks the beginning of a new narrative or the echo of a fallen civilisation remains undecided. The exhibition deliberately leaves this question to its visitors - confronting them with perhaps the most fundamental one of all: What does the future mean when it has lost its direction and the memory of its own promise?`,
    previewImage: "/exhibitions/47-24-35-n-9-44-20-e/01.jpg",
    heroImage: "/exhibitions/47-24-35-n-9-44-20-e/01.jpg",
    images: [
      ...localExhibitionGallery("47-24-35-n-9-44-20-e", ["01.jpg"], "horizontal", "Günter Richard Wett"),
      ...localExhibitionGallery("47-24-35-n-9-44-20-e", ["02.jpg"], "vertical", "Günter Richard Wett"),
      ...localExhibitionGallery("47-24-35-n-9-44-20-e", ["03.jpg", "04.jpg", "05.jpg"], "horizontal", "Günter Richard Wett"),
      ...localExhibitionGallery("47-24-35-n-9-44-20-e", ["06.jpg"], "vertical", "Günter Richard Wett"),
      ...localExhibitionGallery("47-24-35-n-9-44-20-e", ["07.jpg", "08.jpg", "09.jpg", "10.jpg"], "horizontal", "Günter Richard Wett"),
      ...localExhibitionGallery("47-24-35-n-9-44-20-e", ["11.jpg"], "vertical", "Günter Richard Wett"),
    ],
    source: "Saliva",
    sourceUrl: "https://saliva.live/exhibitions/64734697",
  },
  {
    slug: "even-spectres-can-tire",
    title: "Even spectres can tire",
    subtitle: "Floryan Varennes",
    venue: "Xxijra Hii",
    gallery: "Xxijra Hii",
    city: "London",
    country: "United Kingdom",
    year: "2026",
    dates: "14 Mar - 11 Apr 2026",
    startDate: "14 March 2026",
    endDate: "11 April 2026",
    dateSource: "exhibition",
    artists: ["Floryan Varennes"],
    photographer: "Corey Bartle Sanderson",
    exhibitionText: "Francesco Pasquini",
    description: `To be cared for is also to be watched. To be healed is to be handled. Where does protection end and control begin? And what remains of us when care becomes an architecture that surrounds the body?

Stepping into Even Spectres Can Tire, we find ourselves within a landscape both natural and surgical. With clinical control and profound sensitivity, Varennes renders his world visible through the transparent skin of materials such as PVC and glass. The porous surface of the works open onto a layered universe; veins branching like fragile maps or complex steel formations. Here, we encounter what the artist describes as spectres: protective casings, enhanced structures that suggest a body without fully restoring it, fragments of armor. Everything is measured, everything held in tension, creating a geometry of care that sustains and confines. Within this anatomy, the materials are mechanical yet tender, artificial yet alive. In this silent parade, life persists without complaint; alongside what disturbs it, alive within its own wounds.

The Pixies in the show embody this condition. Orthoses and apparatus that appear as possible alternatives to the body; poised between what has been and what is yet to arrive. Similar ambiguity is also conveyed in the form of the cocoon evoked in Ark. What appears as protection also suggests isolation; a body sealed off from the world. The cocoon shelters through enclosure; a membrane that holds the body in suspension and where longevity is not redemption but endurance. It becomes both refuge and confinement in a protective and porous skin that preserves life.

Echoing Ursula K. Le Guin’s speculative worlds where fragility, transformation and survival coexist beyond binary oppositions; Varennes constructs a suspended ecosystem of becoming. Rather than staging conquest or resolution, the works inhabit a threshold. Bodies are altered but not erased and endurance becomes a subtle form of resistance.

When looking at Varennes’ work, we peer into the fantasy worlds and landscapes that the artist experiences digitally in video games. A trace of these imagined realms lingers in the branches of Millefleurs resting on the floor. Here, we find ourselves hovering between nature and fantasy, present and future. The strong scent invites the viewer to reconnect with the organic world after moving through the sterile domain of artificial structures.

The fantasy experience is carried forward in Spikes, fragments that emphasise enhancement through metamorphosis. In fantasy lore, elves are often portrayed as possessing sharpened hearing. The ears interrogate historical and contemporary economies of violence; they allude to wartime rituals in which a severed ear becomes a trophy. Presenting a mute testament to domination, cut from the body and reclassified as evidence yet here they are activated, pushing us into a peripheral world. In this merging of the real and the fictional, an organ once attuned to sound and perception is estranged from its function, transformed into an object relic - an artifact of power.

Even Spectres Can Tire unfolds as an artificial medical garden where meanings remain unsettled. A speculative world inhabited by spectres, where past and future overlap and unresolved histories continue to shape the present. Resonating with the concept of hauntology as theorised by Jacques Derrida, the exhibition suggests a condition in which the now is permeated by the ghosts of unfinished pasts and unrealised futures. These layered temporalities persist materially: suspended in glass, sealed in PVC and held within protective shells where endurance replaces resolution. Here, life remains poised between survival and transformation.`,
    previewImage: "/exhibitions/even-spectres-can-tire/01.jpg",
    heroImage: "/exhibitions/even-spectres-can-tire/01.jpg",
    images: [
      ...localExhibitionGallery("even-spectres-can-tire", ["01.jpg"], "horizontal", "Corey Bartle Sanderson"),
      ...localExhibitionGallery("even-spectres-can-tire", ["02.jpg"], "vertical", "Corey Bartle Sanderson"),
      ...localExhibitionGallery("even-spectres-can-tire", ["03.jpg"], "horizontal", "Corey Bartle Sanderson"),
      ...localExhibitionGallery("even-spectres-can-tire", ["04.jpg"], "vertical", "Corey Bartle Sanderson"),
      ...localExhibitionGallery("even-spectres-can-tire", ["05.jpg", "06.jpg"], "horizontal", "Corey Bartle Sanderson"),
      ...localExhibitionGallery("even-spectres-can-tire", ["07.jpg", "08.jpg", "09.jpg", "10.jpg"], "vertical", "Corey Bartle Sanderson"),
    ],
    source: "Saliva",
    sourceUrl: "https://saliva.live/exhibitions/0d5738fb",
  },
  {
    slug: "massage-platz",
    title: "Massage Platz",
    subtitle: "Sojung park and Yorgos Agrotes",
    venue: "Shower",
    gallery: "Shower",
    city: "Seoul",
    country: "South Korea",
    year: "2025",
    dates: "29 Nov - 21 Dec 2025",
    startDate: "29 November 2025",
    endDate: "21 December 2025",
    dateSource: "exhibition",
    artists: ["Sojung park", "Yorgos Agrotes"],
    curator: "Haram Kang",
    photographer: "Joseph lee",
    exhibitionText: "Haram Kang",
    description: `Relaxation is difficult to pin down. Even in those rare moments when we believe ourselves to have experienced it, it remains merely fleeting. At those times when we sense ourselves relaxing briefly amid profound tension, there is a different layer of tension that pervades. The relaxation that once seemed granted to us as naturally as breathing now feels strange and unfamiliar. No longer something that visits us on its own, it is a state that can just barely be achieved through conscious training and repeated practice - drifting off toward a horizon of complete unattainability.

Today’s massage industry bills that receded sensation as a product available for immediate consumption. Expensive massage chairs and various other massage devices confidently promise us relaxation, but even that pledge remains trapped in a cyclical equation of “tension > resolution > returning.” The underlying assumption is that there is a predetermined “original” state that we should return to, where relaxation operates not as liberation but as a returning mechanism. The origin in question is a body capable of working, and “relaxation” is standardized amid the demands of the capitalist timetable and productivity.

The exhibition Massage Platz aspires to the deconstruction of this narrow pathway. The “Platz” is a place where the individual can briefly set themselves down, as well as a provisional place for people to gather and scatter without purpose. Stripped of function and goals, this empty space harbors a sense of indeterminacy and pure potential, seeking a way of sliding outside the familiar order and stripping away the surfaces of schematized relaxation.

Rather than sidestepping the layers of tension and oppression that inhibit relaxation, Yorgos Agrotes confronts them directly. He looks at discomfort and pain not as things to be removed but as signs whose weight the living being is obliged to shoulder. His canvases are psychological landscapes formed through the layers left behind by the clashing of emotions, memories, and materials. Rejecting an immediate resolution of the tension here, he lingers instead in an indeterminate moment where choice, regret, bitterness, hesitation, and irony all intersect. This represents an act of observing the possibilities for change that are in the loose spaces formed by disorder. As Agrotes searches through the unfamiliar world pervading those spaces, he seeks out the new sense of relaxation that only emerges on the structure’s edges.

Park Sojeong experiences relaxation as an event amid flows that are revealed by materials themselves. She hangs her materials and then spends a long time observing the process as they flow, twist, and swell, perceiving the alternation between balance and imbalance. Materiality manifests here not through simple objects but through unpredictable events that unfold across time and space. In her encounters with these materials, the artist yields the place of the subject and summons inner memories and images based on sensory strata that cannot be captured in language. In this exhibition, she makes active use of machine devices and pressure-generating mechanisms. Instruments designed to pressure the body at regular intervals are decontextualized and transformed into media where the materials define their own rhythms. Through this approach, she experiments with relaxation as an event that expands through repeated connections and changes.

Agrotes and Park share similarities in that they do not strip away tension or instability but instead trace the trembling and flows that emerge through them. One of them explores the signs of relaxation that appear with trembling under the weight of pressure; the other welcomes relaxation as an event as she yields herself to matter’s indeterminate flows. Their work rejects restoration to a better functional existence, as it inquires into the meaning of life that only arises amid tension and transformation. This shakes our trust in fixed forms and defined subjects, revealing the conditions of a world that is constantly forming and disappearing.

As a result, relaxation is no longer simply a moment of rest or recovery. As familiar orders are upended, fixed boundaries are loosened, and unfamiliar rhythms permeate us, we find ourselves at the threshold to a different way of being. What Massage Platz ultimately seeks to show is not a frozen moment of relaxation but relaxation as a liberating and transformative experience. These are the foundations for a new life that blossoms amid indeterminacy - the possibility of encountering the truest self while straying the farthest.`,
    previewImage: "/exhibitions/massage-platz/01.jpg",
    heroImage: "/exhibitions/massage-platz/01.jpg",
    images: [
      ...localExhibitionGallery("massage-platz", ["01.jpg", "02.jpg"], "horizontal", "Joseph lee"),
      ...localExhibitionGallery("massage-platz", ["03.jpg"], "vertical", "Joseph lee"),
      ...localExhibitionGallery("massage-platz", ["04.jpg"], "horizontal", "Joseph lee"),
      ...localExhibitionGallery("massage-platz", ["05.jpg", "06.jpg", "07.jpg"], "vertical", "Joseph lee"),
      ...localExhibitionGallery("massage-platz", ["08.jpg"], "horizontal", "Joseph lee"),
      ...localExhibitionGallery("massage-platz", ["09.jpg", "10.jpg"], "vertical", "Joseph lee"),
      ...localExhibitionGallery("massage-platz", ["11.jpg"], "horizontal", "Joseph lee"),
      ...localExhibitionGallery("massage-platz", ["12.jpg", "13.jpg"], "vertical", "Joseph lee"),
    ],
    source: "Saliva",
    sourceUrl: "https://saliva.live/exhibitions/32a48a9b",
  },
  {
    slug: "main-de-fer-gant-de-velours",
    title: "Main de fer, gant de velours",
    subtitle: "Katherinne Fiedler and Marinés Agurto",
    venue: "Association NOEMI- Espace Brownstone",
    gallery: "Association NOEMI- Espace Brownstone",
    city: "Paris",
    country: "France",
    year: "2026",
    dates: "08 May - 16 May 2026",
    startDate: "08 May 2026",
    endDate: "16 May 2026",
    dateSource: "exhibition",
    artists: ["Katherinne Fiedler", "Marinés Agurto"],
    curator: "Dayneris Brito",
    photographer: "Katherinne Fiedler",
    exhibitionText: "Dayneris Brito",
    description:
      "The body of work by Marinés Agurto and Katherinne Fiedler continues the research process developed during their residencies in Paris, with the support of the Cité internationale des arts and the Culture Moves Europe programme of the Goethe-Institut.\n\nThe project is structured around the relationship between local materials - natural, urban, and reclaimed in Paris - and industrial materials, generating a space of friction, translation, and continuity. Under the title Main de fer, gant de velours, taken from the French expression une main de fer dans un gant de velours, the proposal explores the tension between what sustains and what overflows as a system of forces that runs through matter.\n\nIn Marinés' work, the pieces investigate the construction materials of the Paris basin and their processes of transformation. Using reclaimed plaster blocks and pigments obtained from recovered tomettes, the works explore how matter can be fragmented, displaced, and reorganised beyond its original function. The elements are configured through visible assemblages - metal brackets, threaded rods, hinges, and screws - that make explicit the structural logic and the tensions that hold them together. Some pieces are anchored to the wall, while others balance or traverse the space, activating it as a field of relations.\n\nThe works made with tomette pigment introduce another temporality of the material, as deposits of origin and forms of permanence. They dialogue with Suelo Suspendido, an installation presented in parallel at the Petit Galerie of the Cité internationale des arts, where the tomettes become a suspended structure. In both cases, matter undergoes processes of change and reconfiguration.\n\nKatherinne's work approaches water as a material, symbolic, and political element, taking as its starting point the Bièvre River in Paris, historically linked to tanneries, the textile manufacture of the Gobelins, and the city's hydraulic systems. Her works employ materials associated with this history, such as leather, together with elements that refer to the materiality of water itself. Held through punctual anchoring systems, they propose a reflection on the ways territory, water, and bodies have been channelled and controlled, as well as on the possibility of imagining more open relationships with the environment.\n\nIn Caudal, a metal mesh generates translucent volumes through folds and tensions sustained in an unstable equilibrium. In Garúa, suspended chains evoke both stretched threads and falling water, oscillating between rigidity and fluidity. In Fer, Velours compact structures coexist with flexible elements, where metal refers to containment while velvet introduces a subtle dimension. The project situates itself within this tension between precision and vulnerability.",
    previewImage: "/exhibitions/main-de-fer-gant-de-velours/01.jpg",
    heroImage: "/exhibitions/main-de-fer-gant-de-velours/01.jpg",
    images: [
      ...localExhibitionGallery(
        "main-de-fer-gant-de-velours",
        ["01.jpg", "02.jpg"],
        "horizontal",
        "Katherinne Fiedler",
      ),
      ...localExhibitionGallery(
        "main-de-fer-gant-de-velours",
        ["03.jpg", "04.jpg", "05.jpg", "06.jpg", "07.jpg", "08.jpg"],
        "vertical",
        "Katherinne Fiedler",
      ),
      ...localExhibitionGallery(
        "main-de-fer-gant-de-velours",
        ["09.jpg"],
        "horizontal",
        "Katherinne Fiedler",
      ),
      ...localExhibitionGallery(
        "main-de-fer-gant-de-velours",
        ["10.jpg", "11.jpg", "12.jpg", "13.jpg", "14.jpg"],
        "vertical",
        "Katherinne Fiedler",
      ),
      ...localExhibitionGallery(
        "main-de-fer-gant-de-velours",
        ["15.jpg"],
        "horizontal",
        "Katherinne Fiedler",
      ),
      ...localExhibitionGallery(
        "main-de-fer-gant-de-velours",
        ["16.jpg", "17.jpg", "18.jpg", "19.jpg", "20.jpg", "21.jpg"],
        "vertical",
        "Katherinne Fiedler",
      ),
    ],
    source: "Saliva",
    sourceUrl: "https://saliva.live/exhibitions/45088bbb",
  },
  // INSTAGRAM_IMPORT_START: call-me-we-by-lom-of-lama
  {
    slug: "call-me-we-by-lom-of-lama",
    title: "CALL ME WE",
    subtitle: "LOM-OF-LAMA",
    venue: "SUPERRAUM",
    gallery: "SUPERRAUM",
    city: "Dortmund",
    country: "Germany",
    year: "2026",
    dates: "27 February - 27 March 2026",
    startDate: "27 February 2026",
    endDate: "27 March 2026",
    artists: ["LOM-OF-LAMA"],
    photographer: "LOM-OF-LAMA",
    summary:
      "An exhibition exploring the productive space between the self, the other, and the world.",
    description:
      "At the heart of their artistic process lies a tension between the self, the other, and the world. The \"in-between\" constitutes a productive substance - a material from which resonance evolves as a process of empathy, mutual affection, and shared sense. Identity becomes a variable; decisions are not made but negotiated; actions and forms of expression enter into symbiosis.\n\nDrawing on dialogues about equality, corporeality, and communication, they engage with the social meaning of objects and signs as carriers of values, roles, and hierarchies. Through a dialogical approach, they combine analog and digital techniques of photography, photogrammetry, and 3D processing with sculptural and performative methods - using everyday objects, the body, and modified camera systems that only operate when two people trigger the shutter simultaneously.",
    previewImage: "/exhibitions/call-me-we-by-lom-of-lama/01.jpg",
    heroImage: "/exhibitions/call-me-we-by-lom-of-lama/01.jpg",
    images: [
          {
                "src": "/exhibitions/call-me-we-by-lom-of-lama/01.jpg",
                "orientation": "vertical",
                "caption": "Installation view. Photo: LOM-OF-LAMA"
          },
          {
                "src": "/exhibitions/call-me-we-by-lom-of-lama/02.jpg",
                "orientation": "vertical",
                "caption": "Installation view. Photo: LOM-OF-LAMA"
          },
          {
                "src": "/exhibitions/call-me-we-by-lom-of-lama/03.jpg",
                "orientation": "vertical",
                "caption": "Installation view. Photo: LOM-OF-LAMA"
          },
          {
                "src": "/exhibitions/call-me-we-by-lom-of-lama/04.jpg",
                "orientation": "vertical",
                "caption": "Installation view. Photo: LOM-OF-LAMA"
          },
          {
                "src": "/exhibitions/call-me-we-by-lom-of-lama/05.jpg",
                "orientation": "vertical",
                "caption": "Installation view. Photo: LOM-OF-LAMA"
          },
          {
                "src": "/exhibitions/call-me-we-by-lom-of-lama/06.jpg",
                "orientation": "vertical",
                "caption": "Installation view. Photo: LOM-OF-LAMA"
          },
          {
                "src": "/exhibitions/call-me-we-by-lom-of-lama/07.jpg",
                "orientation": "vertical",
                "caption": "Installation view. Photo: LOM-OF-LAMA"
          },
          {
                "src": "/exhibitions/call-me-we-by-lom-of-lama/08.jpg",
                "orientation": "vertical",
                "caption": "Installation view. Photo: LOM-OF-LAMA"
          },
          {
                "src": "/exhibitions/call-me-we-by-lom-of-lama/09.jpg",
                "orientation": "vertical",
                "caption": "Installation view. Photo: LOM-OF-LAMA"
          },
          {
                "src": "/exhibitions/call-me-we-by-lom-of-lama/10.jpg",
                "orientation": "vertical",
                "caption": "Installation view. Photo: LOM-OF-LAMA"
          },
          {
                "src": "/exhibitions/call-me-we-by-lom-of-lama/11.jpg",
                "orientation": "vertical",
                "caption": "Installation view. Photo: LOM-OF-LAMA"
          },
          {
                "src": "/exhibitions/call-me-we-by-lom-of-lama/12.jpg",
                "orientation": "vertical",
                "caption": "Installation view. Photo: LOM-OF-LAMA"
          },
          {
                "src": "/exhibitions/call-me-we-by-lom-of-lama/13.jpg",
                "orientation": "vertical",
                "caption": "Installation view. Photo: LOM-OF-LAMA"
          },
          {
                "src": "/exhibitions/call-me-we-by-lom-of-lama/14.jpg",
                "orientation": "vertical",
                "caption": "Installation view. Photo: LOM-OF-LAMA"
          }
    ],
    instagramUrl: "https://www.instagram.com/p/DYkL7iRCpHt/?img_index=1",
  },
  // INSTAGRAM_IMPORT_END: call-me-we-by-lom-of-lama
  // INSTAGRAM_BATCH_IMPORT_START
  {
    "slug": "parachute-group-exhibition",
    "title": "PARACHUTE (GROUP EXHIBITION)",
    "venue": "@przeciag_galeria",
    "gallery": "@przeciag_galeria",
    "city": "Warsaw",
    "country": "Poland",
    "year": "2026",
    "dates": "17 April - 17 May 2026",
    "startDate": "17 April",
    "endDate": "17 May 2026",
    "photographer": "#ZuzannaWudarska",
    "description": "As a counterpoint to a world driven by the pursuit of progress, the artists ensure we do not forget what troubles, gnaws at and weakens us - what makes us human. «parachute» is an exhibition about the means of survival: a collection of peculiar stories about how the body and mind react to change, to the unexpected, to external and internal stimuli.\n\nThe moment of the jump is a time of bodily reorganisation - a somatic surprise, a suspension between the past and the present. The artists tread a fine line between a lack of control and a regime of repetition, using wood, metal, glass, sweat, and traditional painting on canvas. Their methodologies are bound by work with embodied matter - a record of repeated approaches to deformation, rescaling, dismemberment, and the stripping away of senses.\n\nTheir work points both to posthumanist narratives and to a discipline-based life founded on the illusion of freedom. Ultimately, the title’s parachute jump is not a foreshadowing of collapse - on the contrary, it encourages a shift away from the dystopian narrative of the end.",
    "summary": "As a counterpoint to a world driven by the pursuit of progress, the artists ensure we do not forget what troubles, gnaws at and weakens us - what makes us human. «parachute» is an exhibition about the means of survival: a collection of peculiar stories about how the body and mind react to change, to the unexpected, to external and internal stimuli.",
    "previewImage": "/exhibitions/DYokPy-iB83/01.jpg",
    "heroImage": "/exhibitions/DYokPy-iB83/01.jpg",
    "images": [
      {
        "src": "/exhibitions/DYokPy-iB83/01.jpg",
        "orientation": "vertical",
        "caption": "Installation view. Photo: #ZuzannaWudarska"
      },
      {
        "src": "/exhibitions/DYokPy-iB83/02.jpg",
        "orientation": "vertical",
        "caption": "Installation view. Photo: #ZuzannaWudarska"
      },
      {
        "src": "/exhibitions/DYokPy-iB83/03.jpg",
        "orientation": "vertical",
        "caption": "Installation view. Photo: #ZuzannaWudarska"
      },
      {
        "src": "/exhibitions/DYokPy-iB83/04.jpg",
        "orientation": "vertical",
        "caption": "Installation view. Photo: #ZuzannaWudarska"
      },
      {
        "src": "/exhibitions/DYokPy-iB83/05.jpg",
        "orientation": "vertical",
        "caption": "Installation view. Photo: #ZuzannaWudarska"
      },
      {
        "src": "/exhibitions/DYokPy-iB83/06.jpg",
        "orientation": "vertical",
        "caption": "Installation view. Photo: #ZuzannaWudarska"
      },
      {
        "src": "/exhibitions/DYokPy-iB83/07.jpg",
        "orientation": "vertical",
        "caption": "Installation view. Photo: #ZuzannaWudarska"
      },
      {
        "src": "/exhibitions/DYokPy-iB83/08.jpg",
        "orientation": "vertical",
        "caption": "Installation view. Photo: #ZuzannaWudarska"
      },
      {
        "src": "/exhibitions/DYokPy-iB83/09.jpg",
        "orientation": "vertical",
        "caption": "Installation view. Photo: #ZuzannaWudarska"
      }
    ],
    "instagramUrl": "https://www.instagram.com/p/DYokPy-iB83/"
  },
  {
    "slug": "coagvla",
    "title": "COAGVLA",
    "subtitle": "Lena Becerra",
    "artists": [
      "Lena Becerra"
    ],
    "venue": "Acéfala Galería",
    "gallery": "Acéfala Galería",
    "city": "Buenos Aires",
    "country": "Argentina",
    "year": "2026",
    "dates": "26 February - 17 April 2026",
    "startDate": "26 February",
    "endDate": "17 April 2026",
    "photographer": "#TadeoBourbon",
    "description": "Drawing from the alchemical principle solve et coagula, the installation treats dissolution not as loss but as a necessary passage toward reconfiguration. Encapsulated in glass, matter is held in a liminal state between the living and the non-living - where organic and inorganic merge into unstable hybrids. Glass, stainless steel, silicone, thread, and pigmented water generate a sensorial field where boundaries blur between body and machine, containment and leakage, stasis and movement.",
    "summary": "Drawing from the alchemical principle solve et coagula, the installation treats dissolution not as loss but as a necessary passage toward reconfiguration. Encapsulated in glass, matter is held in a liminal state between the living and the non-living - where organic and inorganic merge into unstable hybrids. Glass, stainless steel, silicone, thread, and pigmented water generate a sensorial field where boundaries blur between body and machine, containment and leakage, stasis and movement.",
    "previewImage": "/exhibitions/DYcY68Din1k/01.jpg",
    "heroImage": "/exhibitions/DYcY68Din1k/01.jpg",
    "images": [
      {
        "src": "/exhibitions/DYcY68Din1k/01.jpg",
        "orientation": "vertical",
        "caption": "Installation view. Photo: #TadeoBourbon"
      },
      {
        "src": "/exhibitions/DYcY68Din1k/02.jpg",
        "orientation": "vertical",
        "caption": "Installation view. Photo: #TadeoBourbon"
      },
      {
        "src": "/exhibitions/DYcY68Din1k/03.jpg",
        "orientation": "vertical",
        "caption": "Installation view. Photo: #TadeoBourbon"
      },
      {
        "src": "/exhibitions/DYcY68Din1k/04.jpg",
        "orientation": "vertical",
        "caption": "Installation view. Photo: #TadeoBourbon"
      },
      {
        "src": "/exhibitions/DYcY68Din1k/05.jpg",
        "orientation": "vertical",
        "caption": "Installation view. Photo: #TadeoBourbon"
      },
      {
        "src": "/exhibitions/DYcY68Din1k/06.jpg",
        "orientation": "vertical",
        "caption": "Installation view. Photo: #TadeoBourbon"
      },
      {
        "src": "/exhibitions/DYcY68Din1k/07.jpg",
        "orientation": "vertical",
        "caption": "Installation view. Photo: #TadeoBourbon"
      },
      {
        "src": "/exhibitions/DYcY68Din1k/08.jpg",
        "orientation": "vertical",
        "caption": "Installation view. Photo: #TadeoBourbon"
      },
      {
        "src": "/exhibitions/DYcY68Din1k/09.jpg",
        "orientation": "vertical",
        "caption": "Installation view. Photo: #TadeoBourbon"
      },
      {
        "src": "/exhibitions/DYcY68Din1k/10.jpg",
        "orientation": "vertical",
        "caption": "Installation view. Photo: #TadeoBourbon"
      },
      {
        "src": "/exhibitions/DYcY68Din1k/11.jpg",
        "orientation": "vertical",
        "caption": "Installation view. Photo: #TadeoBourbon"
      }
    ],
    "instagramUrl": "https://www.instagram.com/p/DYcY68Din1k/"
  },
  {
    "slug": "supported-files",
    "title": "SUPPORTED FILES",
    "subtitle": "Oliver Laric",
    "artists": [
      "Oliver Laric"
    ],
    "venue": "Galerie Brugger",
    "gallery": "Galerie Brugger",
    "city": "Vorarlberg",
    "country": "Austria",
    "year": "2026",
    "dates": "20 March - 23 May 2026",
    "startDate": "20 March",
    "endDate": "23 May 2026",
    "description": "“If If you’re going to make a tree, for instance, you have to copy a real tree. No one can „make up“ a tree because every tree has an inherent logic in the way it branches. And I’ve discovered that no one can make up a rock. I found that out in Paths of Glory. We had to copy rocks, but every rock also has an inherent logic you’re not aware of until you see a fake rock. Every detail looks right, but something’s wrong.”",
    "summary": "“If If you’re going to make a tree, for instance, you have to copy a real tree. No one can „make up“ a tree because every tree has an inherent logic in the way it branches. And I’ve discovered that no one can make up a rock. I found that out in Paths of Glory. We had to copy rocks, but every rock also has an inherent logic you’re not aware of until you see a fake rock. Every detail looks right, but something’s wrong.”",
    "previewImage": "/exhibitions/DYJeySBikny/01.jpg",
    "heroImage": "/exhibitions/DYJeySBikny/01.jpg",
    "images": [
      {
        "src": "/exhibitions/DYJeySBikny/01.jpg",
        "orientation": "vertical",
        "caption": "Installation view."
      },
      {
        "src": "/exhibitions/DYJeySBikny/02.jpg",
        "orientation": "vertical",
        "caption": "Installation view."
      },
      {
        "src": "/exhibitions/DYJeySBikny/03.jpg",
        "orientation": "vertical",
        "caption": "Installation view."
      },
      {
        "src": "/exhibitions/DYJeySBikny/04.jpg",
        "orientation": "vertical",
        "caption": "Installation view."
      },
      {
        "src": "/exhibitions/DYJeySBikny/05.jpg",
        "orientation": "vertical",
        "caption": "Installation view."
      },
      {
        "src": "/exhibitions/DYJeySBikny/06.jpg",
        "orientation": "vertical",
        "caption": "Installation view."
      }
    ],
    "instagramUrl": "https://www.instagram.com/p/DYJeySBikny/"
  },
  {
    "slug": "lullaby-blossoms",
    "title": "LULLABY BLOSSOMS",
    "subtitle": "AMELIE LOLIE AND INÊS FARÁH",
    "artists": [
      "AMELIE LOLIE AND INÊS FARÁH"
    ],
    "venue": "@cosmos.cac",
    "gallery": "@cosmos.cac",
    "city": "Lisbon",
    "country": "Portugal",
    "year": "2026",
    "dates": "14 April - 12 May 2026",
    "startDate": "14 April",
    "endDate": "12 May 2026",
    "photographer": "#ElizaAzevedo",
    "exhibitionText": "Ana Grebler",
    "description": "Amulets aren’t always objects; sometimes they involve other senses, like sounds, scents, memories. Different times blend together, creating another dimension. among discoveries, desires, and delusions dwell angels and ghosts...",
    "summary": "Amulets aren’t always objects; sometimes they involve other senses, like sounds, scents, memories. Different times blend together, creating another dimension. among discoveries, desires, and delusions dwell angels and ghosts...",
    "previewImage": "/exhibitions/DX_mklDCuI5/01.jpg",
    "heroImage": "/exhibitions/DX_mklDCuI5/01.jpg",
    "images": [
      {
        "src": "/exhibitions/DX_mklDCuI5/01.jpg",
        "orientation": "vertical",
        "caption": "Installation view. Photo: #ElizaAzevedo"
      },
      {
        "src": "/exhibitions/DX_mklDCuI5/02.jpg",
        "orientation": "vertical",
        "caption": "Installation view. Photo: #ElizaAzevedo"
      },
      {
        "src": "/exhibitions/DX_mklDCuI5/03.jpg",
        "orientation": "vertical",
        "caption": "Installation view. Photo: #ElizaAzevedo"
      },
      {
        "src": "/exhibitions/DX_mklDCuI5/04.jpg",
        "orientation": "vertical",
        "caption": "Installation view. Photo: #ElizaAzevedo"
      },
      {
        "src": "/exhibitions/DX_mklDCuI5/05.jpg",
        "orientation": "vertical",
        "caption": "Installation view. Photo: #ElizaAzevedo"
      },
      {
        "src": "/exhibitions/DX_mklDCuI5/06.jpg",
        "orientation": "vertical",
        "caption": "Installation view. Photo: #ElizaAzevedo"
      },
      {
        "src": "/exhibitions/DX_mklDCuI5/07.jpg",
        "orientation": "vertical",
        "caption": "Installation view. Photo: #ElizaAzevedo"
      },
      {
        "src": "/exhibitions/DX_mklDCuI5/08.jpg",
        "orientation": "vertical",
        "caption": "Installation view. Photo: #ElizaAzevedo"
      },
      {
        "src": "/exhibitions/DX_mklDCuI5/09.jpg",
        "orientation": "vertical",
        "caption": "Installation view. Photo: #ElizaAzevedo"
      }
    ],
    "instagramUrl": "https://www.instagram.com/p/DX_mklDCuI5/"
  },
  {
    "slug": "liminality",
    "title": "LIMINALITY",
    "subtitle": "Vivienne Sun",
    "artists": [
      "Vivienne Sun"
    ],
    "venue": "@adbk_nuernberg",
    "gallery": "@adbk_nuernberg",
    "city": "Nurnberg",
    "country": "Germany",
    "year": "2026",
    "dates": "February 2026",
    "photographer": "Vivienne Sun",
    "description": "Liminality explores the in-between state - suspended between origin and transformation - through the lens of institutional spaces such as hospitals and laboratories, where care and control share the same language. Structures borrowed from medical and experimental vocabularies are lifted, tilted, and fixed in place: stripped of function yet heavy with its implication. The viewer is left without a definitive point of belonging, held within the threshold rather than guided beyond it.",
    "summary": "Liminality explores the in-between state - suspended between origin and transformation - through the lens of institutional spaces such as hospitals and laboratories, where care and control share the same language. Structures borrowed from medical and experimental vocabularies are lifted, tilted, and fixed in place: stripped of function yet heavy with its implication. The viewer is left without a definitive point of belonging, held within the threshold rather than guided beyond it.",
    "previewImage": "/exhibitions/DX9_tOSiiwO/01.jpg",
    "heroImage": "/exhibitions/DX9_tOSiiwO/01.jpg",
    "images": [
      {
        "src": "/exhibitions/DX9_tOSiiwO/01.jpg",
        "orientation": "vertical",
        "caption": "Installation view. Photo: sun_meng_ppppp"
      },
      {
        "src": "/exhibitions/DX9_tOSiiwO/02.jpg",
        "orientation": "vertical",
        "caption": "Installation view. Photo: sun_meng_ppppp"
      },
      {
        "src": "/exhibitions/DX9_tOSiiwO/03.jpg",
        "orientation": "vertical",
        "caption": "Installation view. Photo: sun_meng_ppppp"
      },
      {
        "src": "/exhibitions/DX9_tOSiiwO/04.jpg",
        "orientation": "vertical",
        "caption": "Installation view. Photo: sun_meng_ppppp"
      },
      {
        "src": "/exhibitions/DX9_tOSiiwO/05.jpg",
        "orientation": "vertical",
        "caption": "Installation view. Photo: sun_meng_ppppp"
      },
      {
        "src": "/exhibitions/DX9_tOSiiwO/06.jpg",
        "orientation": "vertical",
        "caption": "Installation view. Photo: sun_meng_ppppp"
      },
      {
        "src": "/exhibitions/DX9_tOSiiwO/07.jpg",
        "orientation": "vertical",
        "caption": "Installation view. Photo: sun_meng_ppppp"
      }
    ],
    "instagramUrl": "https://www.instagram.com/p/DX9_tOSiiwO/"
  },
  {
    "slug": "mimicking-eternity",
    "title": "MIMICKING ETERNITY",
    "subtitle": "Yeju Lee",
    "artists": [
      "Yeju Lee"
    ],
    "venue": "@studiya.gallery",
    "gallery": "@studiya.gallery",
    "city": "Seoul",
    "country": "South Korea",
    "year": "2026",
    "dates": "14 - 27 March 2026",
    "startDate": "14 March 2026",
    "endDate": "27 March 2026",
    "photographer": "Chevvon",
    "description": "«Lee Ye-ju seeks to respond to this demand of the mind. She aims to achieve solace for the mind, which dwells briefly in the world, through the warmth of eternity and a connection with imagined causality that does not exclude the irrational. Just as we might once again accept our ancestors, scattered like water, as part of ourselves, or interpret the movements of nature as a revelation that traces causality back to its origins, here we connect with this imagined eternity...»",
    "summary": "«Lee Ye-ju seeks to respond to this demand of the mind. She aims to achieve solace for the mind, which dwells briefly in the world, through the warmth of eternity and a connection with imagined causality that does not exclude the irrational. Just as we might once again accept our ancestors, scattered like water, as part of ourselves, or interpret the movements of nature as a revelation that traces causality back to its origins, here we connect with this imagined eternity...»",
    "previewImage": "/exhibitions/DXrfEnqAjeh/01.jpg",
    "heroImage": "/exhibitions/DXrfEnqAjeh/01.jpg",
    "images": [
      {
        "src": "/exhibitions/DXrfEnqAjeh/01.jpg",
        "orientation": "vertical",
        "caption": "Installation view. Photo: chevv0n"
      },
      {
        "src": "/exhibitions/DXrfEnqAjeh/02.jpg",
        "orientation": "vertical",
        "caption": "Installation view. Photo: chevv0n"
      },
      {
        "src": "/exhibitions/DXrfEnqAjeh/03.jpg",
        "orientation": "vertical",
        "caption": "Installation view. Photo: chevv0n"
      },
      {
        "src": "/exhibitions/DXrfEnqAjeh/04.jpg",
        "orientation": "vertical",
        "caption": "Installation view. Photo: chevv0n"
      },
      {
        "src": "/exhibitions/DXrfEnqAjeh/05.jpg",
        "orientation": "vertical",
        "caption": "Installation view. Photo: chevv0n"
      },
      {
        "src": "/exhibitions/DXrfEnqAjeh/06.jpg",
        "orientation": "vertical",
        "caption": "Installation view. Photo: chevv0n"
      },
      {
        "src": "/exhibitions/DXrfEnqAjeh/07.jpg",
        "orientation": "vertical",
        "caption": "Installation view. Photo: chevv0n"
      }
    ],
    "instagramUrl": "https://www.instagram.com/p/DXrfEnqAjeh/"
  },
  {
    "slug": "blue-blooded",
    "title": "BLUE BLOODED",
    "subtitle": "Hannah Levy",
    "artists": [
      "Hannah Levy"
    ],
    "venue": "@museo_nivola",
    "gallery": "@museo_nivola",
    "city": "Sardinia",
    "country": "Italy",
    "year": "2026",
    "dates": "Through July 12",
    "curator": "Giuliana Altea, Antonella Camarda, Luca Cheri",
    "photographer": "Andrea Mignogna",
    "description": "«Museo Nivola presents Blue Blooded – Sangue blu, the first solo exhibition in Italy by Hannah Levy… the exhibition brings together a group of new sculptures inspired by the horseshoe crab… an uncanny-looking marine arthropod that has survived for hundreds of millions of years… whose blue blood is now widely used to ensure the safety of vaccines and medical devices.\n\nLevy’s sculptures combine polished metal with translucent silicone and glass… recalling animals, insects, and organic morphologies… evoking presences that are both seductive and unsettling…»",
    "summary": "«Museo Nivola presents Blue Blooded – Sangue blu, the first solo exhibition in Italy by Hannah Levy… the exhibition brings together a group of new sculptures inspired by the horseshoe crab… an uncanny-looking marine arthropod that has survived for hundreds of millions of years… whose blue blood is now widely used to ensure the safety of vaccines and medical devices.",
    "previewImage": "/exhibitions/DXhIaS3AjBb/01.jpg",
    "heroImage": "/exhibitions/DXhIaS3AjBb/01.jpg",
    "images": [
      {
        "src": "/exhibitions/DXhIaS3AjBb/01.jpg",
        "orientation": "horizontal",
        "caption": "Installation view. Photo: frankshouter"
      },
      {
        "src": "/exhibitions/DXhIaS3AjBb/02.jpg",
        "orientation": "horizontal",
        "caption": "Installation view. Photo: frankshouter"
      },
      {
        "src": "/exhibitions/DXhIaS3AjBb/03.jpg",
        "orientation": "horizontal",
        "caption": "Installation view. Photo: frankshouter"
      },
      {
        "src": "/exhibitions/DXhIaS3AjBb/04.jpg",
        "orientation": "horizontal",
        "caption": "Installation view. Photo: frankshouter"
      },
      {
        "src": "/exhibitions/DXhIaS3AjBb/05.jpg",
        "orientation": "horizontal",
        "caption": "Installation view. Photo: frankshouter"
      },
      {
        "src": "/exhibitions/DXhIaS3AjBb/06.jpg",
        "orientation": "horizontal",
        "caption": "Installation view. Photo: frankshouter"
      },
      {
        "src": "/exhibitions/DXhIaS3AjBb/07.jpg",
        "orientation": "horizontal",
        "caption": "Installation view. Photo: frankshouter"
      },
      {
        "src": "/exhibitions/DXhIaS3AjBb/08.jpg",
        "orientation": "horizontal",
        "caption": "Installation view. Photo: frankshouter"
      },
      {
        "src": "/exhibitions/DXhIaS3AjBb/09.jpg",
        "orientation": "horizontal",
        "caption": "Installation view. Photo: frankshouter"
      },
      {
        "src": "/exhibitions/DXhIaS3AjBb/10.jpg",
        "orientation": "horizontal",
        "caption": "Installation view. Photo: frankshouter"
      },
      {
        "src": "/exhibitions/DXhIaS3AjBb/11.jpg",
        "orientation": "horizontal",
        "caption": "Installation view. Photo: frankshouter"
      },
      {
        "src": "/exhibitions/DXhIaS3AjBb/12.jpg",
        "orientation": "horizontal",
        "caption": "Installation view. Photo: frankshouter"
      },
      {
        "src": "/exhibitions/DXhIaS3AjBb/13.jpg",
        "orientation": "horizontal",
        "caption": "Installation view. Photo: frankshouter"
      },
      {
        "src": "/exhibitions/DXhIaS3AjBb/14.jpg",
        "orientation": "horizontal",
        "caption": "Installation view. Photo: frankshouter"
      },
      {
        "src": "/exhibitions/DXhIaS3AjBb/15.jpg",
        "orientation": "horizontal",
        "caption": "Installation view. Photo: frankshouter"
      },
      {
        "src": "/exhibitions/DXhIaS3AjBb/16.jpg",
        "orientation": "horizontal",
        "caption": "Installation view. Photo: frankshouter"
      },
      {
        "src": "/exhibitions/DXhIaS3AjBb/17.jpg",
        "orientation": "horizontal",
        "caption": "Installation view. Photo: frankshouter"
      },
      {
        "src": "/exhibitions/DXhIaS3AjBb/18.jpg",
        "orientation": "horizontal",
        "caption": "Installation view. Photo: frankshouter"
      }
    ],
    "instagramUrl": "https://www.instagram.com/p/DXhIaS3AjBb/"
  },
  {
    "slug": "chewing-gum-in-the-motherboard-group-exhibition",
    "title": "CHEWING GUM IN THE MOTHERBOARD (GROUP EXHIBITION)",
    "venue": "La Volonte 93",
    "gallery": "La Volonte 93",
    "city": "Paris",
    "country": "France",
    "year": "2026",
    "dates": "29 March - 19 April 2026",
    "startDate": "29 March",
    "endDate": "19 April 2026",
    "photographer": "Misha Gudwin",
    "description": "«The artists in this exhibition respond to the fragmentation of contemporary life through glitched aesthetics, speculative environments, and a fusion of nostalgia with invention. Within the space, these dynamics unfold through systems under tension: a piece of chewing gum placed under surveillance becomes the subject of continuous observation, while another is slowly altered through a controlled process of degradation.\n\nBiometric data drawn from an intimate encounter is captured and replayed in loops, translating the body into signal. Elsewhere, a lost hard drive drifts between landfill and digital myth, while generated images, fragments of dreams, and video game aesthetics construct unstable environments populated by residual presences.»",
    "summary": "«The artists in this exhibition respond to the fragmentation of contemporary life through glitched aesthetics, speculative environments, and a fusion of nostalgia with invention. Within the space, these dynamics unfold through systems under tension: a piece of chewing gum placed under surveillance becomes the subject of continuous observation, while another is slowly altered through a controlled process of degradation.",
    "previewImage": "/exhibitions/DW_hBzACN4S/01.jpg",
    "heroImage": "/exhibitions/DW_hBzACN4S/01.jpg",
    "images": [
      {
        "src": "/exhibitions/DW_hBzACN4S/01.jpg",
        "orientation": "vertical",
        "caption": "Installation view. Photo: misha_gudwin"
      },
      {
        "src": "/exhibitions/DW_hBzACN4S/02.jpg",
        "orientation": "vertical",
        "caption": "Installation view. Photo: misha_gudwin"
      },
      {
        "src": "/exhibitions/DW_hBzACN4S/03.jpg",
        "orientation": "vertical",
        "caption": "Installation view. Photo: misha_gudwin"
      },
      {
        "src": "/exhibitions/DW_hBzACN4S/04.jpg",
        "orientation": "vertical",
        "caption": "Installation view. Photo: misha_gudwin"
      },
      {
        "src": "/exhibitions/DW_hBzACN4S/05.jpg",
        "orientation": "vertical",
        "caption": "Installation view. Photo: misha_gudwin"
      },
      {
        "src": "/exhibitions/DW_hBzACN4S/06.jpg",
        "orientation": "vertical",
        "caption": "Installation view. Photo: misha_gudwin"
      },
      {
        "src": "/exhibitions/DW_hBzACN4S/07.jpg",
        "orientation": "vertical",
        "caption": "Installation view. Photo: misha_gudwin"
      },
      {
        "src": "/exhibitions/DW_hBzACN4S/08.jpg",
        "orientation": "vertical",
        "caption": "Installation view. Photo: misha_gudwin"
      },
      {
        "src": "/exhibitions/DW_hBzACN4S/09.jpg",
        "orientation": "vertical",
        "caption": "Installation view. Photo: misha_gudwin"
      },
      {
        "src": "/exhibitions/DW_hBzACN4S/10.jpg",
        "orientation": "vertical",
        "caption": "Installation view. Photo: misha_gudwin"
      },
      {
        "src": "/exhibitions/DW_hBzACN4S/11.jpg",
        "orientation": "vertical",
        "caption": "Installation view. Photo: misha_gudwin"
      },
      {
        "src": "/exhibitions/DW_hBzACN4S/12.jpg",
        "orientation": "vertical",
        "caption": "Installation view. Photo: misha_gudwin"
      },
      {
        "src": "/exhibitions/DW_hBzACN4S/13.jpg",
        "orientation": "vertical",
        "caption": "Installation view. Photo: misha_gudwin"
      },
      {
        "src": "/exhibitions/DW_hBzACN4S/14.jpg",
        "orientation": "vertical",
        "caption": "Installation view. Photo: misha_gudwin"
      },
      {
        "src": "/exhibitions/DW_hBzACN4S/15.jpg",
        "orientation": "vertical",
        "caption": "Installation view. Photo: misha_gudwin"
      }
    ],
    "instagramUrl": "https://www.instagram.com/p/DW_hBzACN4S/"
  },
  {
    "slug": "ausserkoerperliche-erfahrung-wandering-spirit",
    "title": "AUSSERKÖRPERLICHE ERFAHRUNG: WANDERING SPIRIT",
    "subtitle": "Jura Shust",
    "artists": [
      "Jura Shust"
    ],
    "venue": "@management.nyc",
    "gallery": "@management.nyc",
    "city": "New York City",
    "country": "United States",
    "year": "2026",
    "dates": "January 17 - March 01, 2026",
    "startDate": "January 17, 2026",
    "endDate": "March 01, 2026",
    "photographer": "#InnaSvyatsky",
    "description": "«Drawing on principles of ancient animism, Außerkörperliche Erfahrung reflects on the convergence of ecology, technology, and spirituality. The exhibition points toward a condition in which technology no longer functions as a tool but emerges as an autonomous agent integrated with natural systems…»",
    "summary": "«Drawing on principles of ancient animism, Außerkörperliche Erfahrung reflects on the convergence of ecology, technology, and spirituality. The exhibition points toward a condition in which technology no longer functions as a tool but emerges as an autonomous agent integrated with natural systems…»",
    "previewImage": "/exhibitions/DWQlGITiKUt/01.jpg",
    "heroImage": "/exhibitions/DWQlGITiKUt/01.jpg",
    "images": [
      {
        "src": "/exhibitions/DWQlGITiKUt/01.jpg",
        "orientation": "vertical",
        "caption": "Installation view. Photo: #InnaSvyatsky"
      },
      {
        "src": "/exhibitions/DWQlGITiKUt/02.jpg",
        "orientation": "vertical",
        "caption": "Installation view. Photo: #InnaSvyatsky"
      },
      {
        "src": "/exhibitions/DWQlGITiKUt/03.jpg",
        "orientation": "vertical",
        "caption": "Installation view. Photo: #InnaSvyatsky"
      },
      {
        "src": "/exhibitions/DWQlGITiKUt/04.jpg",
        "orientation": "vertical",
        "caption": "Installation view. Photo: #InnaSvyatsky"
      },
      {
        "src": "/exhibitions/DWQlGITiKUt/05.jpg",
        "orientation": "vertical",
        "caption": "Installation view. Photo: #InnaSvyatsky"
      },
      {
        "src": "/exhibitions/DWQlGITiKUt/06.jpg",
        "orientation": "vertical",
        "caption": "Installation view. Photo: #InnaSvyatsky"
      },
      {
        "src": "/exhibitions/DWQlGITiKUt/07.jpg",
        "orientation": "vertical",
        "caption": "Installation view. Photo: #InnaSvyatsky"
      },
      {
        "src": "/exhibitions/DWQlGITiKUt/08.jpg",
        "orientation": "vertical",
        "caption": "Installation view. Photo: #InnaSvyatsky"
      },
      {
        "src": "/exhibitions/DWQlGITiKUt/09.jpg",
        "orientation": "vertical",
        "caption": "Installation view. Photo: #InnaSvyatsky"
      },
      {
        "src": "/exhibitions/DWQlGITiKUt/10.jpg",
        "orientation": "vertical",
        "caption": "Installation view. Photo: #InnaSvyatsky"
      },
      {
        "src": "/exhibitions/DWQlGITiKUt/11.jpg",
        "orientation": "vertical",
        "caption": "Installation view. Photo: #InnaSvyatsky"
      },
      {
        "src": "/exhibitions/DWQlGITiKUt/12.jpg",
        "orientation": "vertical",
        "caption": "Installation view. Photo: #InnaSvyatsky"
      },
      {
        "src": "/exhibitions/DWQlGITiKUt/13.jpg",
        "orientation": "vertical",
        "caption": "Installation view. Photo: #InnaSvyatsky"
      },
      {
        "src": "/exhibitions/DWQlGITiKUt/14.jpg",
        "orientation": "vertical",
        "caption": "Installation view. Photo: #InnaSvyatsky"
      }
    ],
    "instagramUrl": "https://www.instagram.com/p/DWQlGITiKUt/"
  },
  {
    "slug": "call-someone-group-exhibition",
    "title": "CALL SOMEONE (GROUP EXHIBITION)",
    "venue": "@ayayay_________",
    "gallery": "@ayayay_________",
    "city": "Offenbach am Main",
    "country": "Germany",
    "year": "2026",
    "dates": "20 February - 15 March 2026",
    "startDate": "20 February",
    "endDate": "15 March 2026",
    "photographer": "#AntonAndrienko, #StasiaGrishina",
    "description": "«There are moments when an object stops doing what it seems to promise. This gap between expectation and reality is where this exhibition begins. It brings together works that appear functional yet remain out of reach. \n\nThey are connected by a condition of brokenness — a minor shift that moves them from one register to another. Witnesses of such disruptions often experience a sense of awkwardness, a subtle unease that arises when something goes wrong. \n\nWe feel the dissonance of seeing the order violated. This sensation generates a dual response: a desire to look away and pretend nothing happened, and at the same time a need to call someone who can restore order, to return the object to what it seemed to promise by its image.»",
    "summary": "«There are moments when an object stops doing what it seems to promise. This gap between expectation and reality is where this exhibition begins. It brings together works that appear functional yet remain out of reach. ",
    "previewImage": "/exhibitions/DWMpraJFCUD/01.jpg",
    "heroImage": "/exhibitions/DWMpraJFCUD/01.jpg",
    "images": [
      {
        "src": "/exhibitions/DWMpraJFCUD/01.jpg",
        "orientation": "vertical",
        "caption": "Installation view. Photo: #AntonAndrienko, #StasiaGrishina"
      },
      {
        "src": "/exhibitions/DWMpraJFCUD/02.jpg",
        "orientation": "vertical",
        "caption": "Installation view. Photo: #AntonAndrienko, #StasiaGrishina"
      },
      {
        "src": "/exhibitions/DWMpraJFCUD/03.jpg",
        "orientation": "vertical",
        "caption": "Installation view. Photo: #AntonAndrienko, #StasiaGrishina"
      },
      {
        "src": "/exhibitions/DWMpraJFCUD/04.jpg",
        "orientation": "vertical",
        "caption": "Installation view. Photo: #AntonAndrienko, #StasiaGrishina"
      },
      {
        "src": "/exhibitions/DWMpraJFCUD/05.jpg",
        "orientation": "vertical",
        "caption": "Installation view. Photo: #AntonAndrienko, #StasiaGrishina"
      },
      {
        "src": "/exhibitions/DWMpraJFCUD/06.jpg",
        "orientation": "vertical",
        "caption": "Installation view. Photo: #AntonAndrienko, #StasiaGrishina"
      },
      {
        "src": "/exhibitions/DWMpraJFCUD/07.jpg",
        "orientation": "vertical",
        "caption": "Installation view. Photo: #AntonAndrienko, #StasiaGrishina"
      },
      {
        "src": "/exhibitions/DWMpraJFCUD/08.jpg",
        "orientation": "vertical",
        "caption": "Installation view. Photo: #AntonAndrienko, #StasiaGrishina"
      },
      {
        "src": "/exhibitions/DWMpraJFCUD/09.jpg",
        "orientation": "vertical",
        "caption": "Installation view. Photo: #AntonAndrienko, #StasiaGrishina"
      },
      {
        "src": "/exhibitions/DWMpraJFCUD/10.jpg",
        "orientation": "vertical",
        "caption": "Installation view. Photo: #AntonAndrienko, #StasiaGrishina"
      },
      {
        "src": "/exhibitions/DWMpraJFCUD/11.jpg",
        "orientation": "vertical",
        "caption": "Installation view. Photo: #AntonAndrienko, #StasiaGrishina"
      },
      {
        "src": "/exhibitions/DWMpraJFCUD/12.jpg",
        "orientation": "vertical",
        "caption": "Installation view. Photo: #AntonAndrienko, #StasiaGrishina"
      },
      {
        "src": "/exhibitions/DWMpraJFCUD/13.jpg",
        "orientation": "vertical",
        "caption": "Installation view. Photo: #AntonAndrienko, #StasiaGrishina"
      },
      {
        "src": "/exhibitions/DWMpraJFCUD/14.jpg",
        "orientation": "vertical",
        "caption": "Installation view. Photo: #AntonAndrienko, #StasiaGrishina"
      },
      {
        "src": "/exhibitions/DWMpraJFCUD/15.jpg",
        "orientation": "vertical",
        "caption": "Installation view. Photo: #AntonAndrienko, #StasiaGrishina"
      },
      {
        "src": "/exhibitions/DWMpraJFCUD/16.jpg",
        "orientation": "vertical",
        "caption": "Installation view. Photo: #AntonAndrienko, #StasiaGrishina"
      },
      {
        "src": "/exhibitions/DWMpraJFCUD/17.jpg",
        "orientation": "vertical",
        "caption": "Installation view. Photo: #AntonAndrienko, #StasiaGrishina"
      }
    ],
    "instagramUrl": "https://www.instagram.com/p/DWMpraJFCUD/"
  },
  // INSTAGRAM_BATCH_IMPORT_END
  // LOCAL_IMAGE_CAPTION_IMPORT_START
  {
    slug: "moonlit-botanical-colour-theories",
    title: "MOONLIT BOTANICAL COLOUR THEORIES",
    subtitle: "ELSA SALONEN",
    artists: ["ELSA SALONEN"],
    venue: "Jochen Hempel",
    gallery: "Jochen Hempel",
    city: "Leipzig",
    country: "Germany",
    year: "2026",
    dates: "10 January - 28 February 2026",
    startDate: "10 January 2026",
    endDate: "28 February 2026",
    photographer: "#JoeClark, #BjörnSiebert",
    description:
      "The exhibition explores flowers and plants from a broad cultural, scientific, and esoteric perspective - bringing together alchemy, Finnish nature worship, still-life painting, medicinal plants, and spagyrics. At its core is a technique Salonen developed a decade ago: distilling colours from flowers, leaving them pale and colourless, then conserving the extracted pigments in laboratory glass vessels displayed alongside the white plants. As if the life itself were hidden in the colours.",
    summary:
      "An exhibition of botanical pigments, pale plants, and laboratory vessels developed through Elsa Salonen's colour-distillation practice.",
    previewImage: localExhibitionImage(
      "MOONLIT BOTANICAL COLOUR THEORIES BY ELSA SALONEN",
      "photo_1_2026-05-23_19-16-00.jpg",
    ),
    heroImage: localExhibitionImage(
      "MOONLIT BOTANICAL COLOUR THEORIES BY ELSA SALONEN",
      "photo_1_2026-05-23_19-16-00.jpg",
    ),
    images: localExhibitionGallery(
      "MOONLIT BOTANICAL COLOUR THEORIES BY ELSA SALONEN",
      [
        "photo_1_2026-05-23_19-16-00.jpg",
        "photo_2_2026-05-23_19-16-00.jpg",
        "photo_3_2026-05-23_19-16-00.jpg",
        "photo_4_2026-05-23_19-16-00.jpg",
        "photo_5_2026-05-23_19-16-00.jpg",
        "photo_6_2026-05-23_19-16-00.jpg",
        "photo_7_2026-05-23_19-16-00.jpg",
        "photo_8_2026-05-23_19-16-00.jpg",
        "photo_9_2026-05-23_19-16-00.jpg",
        "photo_10_2026-05-23_19-16-00.jpg",
        "photo_11_2026-05-23_19-16-00.jpg",
        "photo_12_2026-05-23_19-16-00.jpg",
        "photo_13_2026-05-23_19-16-00.jpg",
        "photo_14_2026-05-23_19-16-00.jpg",
      ],
      "vertical",
      "#JoeClark, #BjörnSiebert",
    ),
    instagramUrl: "https://www.instagram.com/p/DWI7B60CIS0/",
  },
  {
    slug: "soft-sighs-synthesis",
    title: "SOFT_SIGHS SYNTHESIS",
    subtitle: "PAULA GOGOLA",
    artists: ["PAULA GOGOLA"],
    venue: "@clauda.cz",
    gallery: "@clauda.cz",
    city: "Prague",
    country: "Czech Republic",
    year: "2026",
    dates: "20 February - 21 March 2026",
    startDate: "20 February 2026",
    endDate: "21 March 2026",
    curator: "@scivia.exe",
    photographer: "#EvaRybářová",
    description:
      "In the solo show soft_sighs synthesis, Paula Gogola presents a new series of works that, while departing from her usual medium of paint on canvas, rearticulate and metamorphose her motifs with a balance of strength and sensitivity. These intricately layered reliefs project Gogola's brooding figures onto a three dimensional plane: dense muscularity unfurls into shrouded repose, razor edges of steel curve into soft, yawning angles.\n\nCold rigidity bonds with openness, pulsating strength with discretion, temerity with fugitivity. Tensed between such polarities, the opaque vitality that marks Gogola's expanding oeuvre is here intensified, where survival hinges on secrecy, consistency on transmutation.",
    summary:
      "Paula Gogola's layered reliefs translate brooding painted figures into muscular, steel-edged, three-dimensional forms.",
    previewImage: localExhibitionImage(
      "SOFT_SIGHS SYNTHESIS BY PAULA GOGOLA",
      "photo_1_2026-05-23_19-16-50.jpg",
    ),
    heroImage: localExhibitionImage(
      "SOFT_SIGHS SYNTHESIS BY PAULA GOGOLA",
      "photo_1_2026-05-23_19-16-50.jpg",
    ),
    images: localExhibitionGallery(
      "SOFT_SIGHS SYNTHESIS BY PAULA GOGOLA",
      [
        "photo_1_2026-05-23_19-16-50.jpg",
        "photo_2_2026-05-23_19-16-50.jpg",
        "photo_3_2026-05-23_19-16-50.jpg",
        "photo_4_2026-05-23_19-16-50.jpg",
        "photo_5_2026-05-23_19-16-50.jpg",
        "photo_6_2026-05-23_19-16-50.jpg",
        "photo_7_2026-05-23_19-16-50.jpg",
        "photo_8_2026-05-23_19-16-50.jpg",
        "photo_9_2026-05-23_19-16-50.jpg",
        "photo_10_2026-05-23_19-16-50.jpg",
      ],
      "vertical",
      "#EvaRybářová",
    ),
    instagramUrl: "https://www.instagram.com/p/DWGmEXciJnn/",
  },
  {
    slug: "growing-body",
    title: "GROWING BODY",
    subtitle: "SUNGWOOK HA",
    artists: ["SUNGWOOK HA"],
    venue: "@studiya.gallery",
    gallery: "@studiya.gallery",
    city: "Seoul",
    year: "2025-2026",
    dates: "2025-2026",
    photographer: "Sungwook Ha",
    description: "The work was exhibited as part of the exhibition SAVANNA at @studiya.gallery, Seoul, 2025-2026.",
    summary: "A work exhibited as part of SAVANNA at @studiya.gallery in Seoul.",
    previewImage: localExhibitionImage(
      "GROWING BODY BY SUNGWOOK HA",
      "photo_1_2026-05-23_19-17-53.jpg",
    ),
    heroImage: localExhibitionImage(
      "GROWING BODY BY SUNGWOOK HA",
      "photo_1_2026-05-23_19-17-53.jpg",
    ),
    images: localExhibitionGallery(
      "GROWING BODY BY SUNGWOOK HA",
      [
        "photo_1_2026-05-23_19-17-53.jpg",
        "photo_2_2026-05-23_19-17-53.jpg",
        "photo_3_2026-05-23_19-17-53.jpg",
        "photo_3_2026-05-23_19-16-50.jpg",
      ],
      "vertical",
      "@ha_sung_wook_ official Instagram",
    ),
    instagramUrl: "https://www.instagram.com/p/DUq15JMiDiW/",
  },
  {
    slug: "common-landscapes",
    title: "COMMON LANDSCAPE(S) (GROUP SHOW)",
    artists: [
      "@onur.abaci_",
      "@madsdonnelly",
      "@visceralwarmth",
      "@virtio.djvu",
      "@lukanaujoks",
      "@paula_oltmann",
      "@noneinani",
      "@hyejeongyun_",
    ],
    venue: "ACUD Galerie",
    gallery: "ACUD Galerie",
    city: "Berlin",
    year: "2026",
    dates: "16 January - 15 February 2026",
    startDate: "16 January 2026",
    endDate: "15 February 2026",
    curator: "Moritz Simon",
    photographer: "Luka Naujoks",
    description:
      "Departing from thoughts by Franco 'Bifo' Berardi, this exhibition starts, continues, repeats, initiates and tests possibilities of exchange, dialogue, transfer and translation in both literal and metaphorical forms. The basic acts of translation between languages, contexts, cultures or media act as an opening up of dialogue, creating sustaining bonds of kinship and traversing the desert of meaninglessness.",
    summary:
      "An exhibition exploring exchange, dialogue, transfer and translation across languages, contexts, cultures and media.",
    previewImage: localExhibitionImage(
      "COMMON LANDSCAPE(S) (GROUP SHOW)",
      "photo_1_2026-05-23_19-19-22.jpg",
    ),
    heroImage: localExhibitionImage(
      "COMMON LANDSCAPE(S) (GROUP SHOW)",
      "photo_1_2026-05-23_19-19-22.jpg",
    ),
    images: localExhibitionGallery(
      "COMMON LANDSCAPE(S) (GROUP SHOW)",
      [
        "photo_1_2026-05-23_19-19-22.jpg",
        "photo_2_2026-05-23_19-19-22.jpg",
        "photo_3_2026-05-23_19-19-22.jpg",
        "photo_4_2026-05-23_19-19-22.jpg",
        "photo_5_2026-05-23_19-19-22.jpg",
        "photo_6_2026-05-23_19-19-22.jpg",
        "photo_7_2026-05-23_19-19-22.jpg",
        "photo_8_2026-05-23_19-19-22.jpg",
      ],
      "horizontal",
      "@lukanaujoks",
    ),
    instagramUrl: "https://www.instagram.com/p/DUnFfyeAhk7/",
  },
  {
    slug: "the-collapse-manual-the-post-human-field",
    title: "THE COLLAPSE MANUAL_THE POST-HUMAN FIELD (GROUP SHOW)",
    artists: [
      "@_dae_uk_kim_",
      "@j._ahn",
      "@omyocho",
      "#YoonMiryu",
      "@leeyongbin_",
      "#ParkWunggyu",
      "#ShinMeekyoung",
    ],
    venue: "Aod Museum",
    gallery: "Aod Museum",
    city: "Seoul",
    country: "Republic of Korea",
    year: "2026",
    dates: "Until March 17, 2026",
    photographer: "#LeeJungwoo",
    exhibitionText: "@future_less_",
    description:
      "This exhibition unfolds in two parts and explores the conditions and sensibilities of a world completely reset after the collapse of civilization. What matters here is not reconstruction or recovery. Rather, the exhibition fundamentally questions the assumptions of the existing order - human-centeredness, production-oriented ecologies, linear conceptions of time, and Enlightenment rationality - and seeks to imagine new ontological configurations.\n\nThe participating artists probe beyond the boundaries of the category of the human, presenting their own perspectives on reconfigured environments, the coexistence of machines and nature, ethics after collapse, and fugitive, embodied modes of perception and cognition.",
    summary:
      "A two-part exhibition imagining new ontological configurations after civilizational collapse.",
    previewImage: localExhibitionImage(
      "THE COLLAPSE MANUAL_THE POST-HUMAN FIELD (GROUP SHOW)",
      "photo_1_2026-05-23_19-20-38.jpg",
    ),
    heroImage: localExhibitionImage(
      "THE COLLAPSE MANUAL_THE POST-HUMAN FIELD (GROUP SHOW)",
      "photo_1_2026-05-23_19-20-38.jpg",
    ),
    images: localExhibitionGallery(
      "THE COLLAPSE MANUAL_THE POST-HUMAN FIELD (GROUP SHOW)",
      [
        "photo_1_2026-05-23_19-20-38.jpg",
        "photo_2_2026-05-23_19-20-38.jpg",
        "photo_3_2026-05-23_19-20-38.jpg",
        "photo_4_2026-05-23_19-20-38.jpg",
        "photo_5_2026-05-23_19-20-38.jpg",
        "photo_6_2026-05-23_19-20-38.jpg",
        "photo_7_2026-05-23_19-20-38.jpg",
        "photo_8_2026-05-23_19-20-38.jpg",
        "photo_9_2026-05-23_19-20-39.jpg",
      ],
      "vertical",
      "#LeeJungwoo",
    ),
    instagramUrl: "https://www.instagram.com/p/DUdHRa4gjGe/",
  },
  {
    slug: "doubled-presence-in-a-disembodied-space",
    title: "DOUBLED PRESENCE IN A DISEMBODIED SPACE",
    subtitle: "ANZHELIKA PALYVODA, CÉLINE STRUGER AND SOFIIA YESAKOVA",
    artists: ["ANZHELIKA PALYVODA", "CÉLINE STRUGER", "SOFIIA YESAKOVA"],
    venue: "@trost.spc",
    gallery: "@trost.spc",
    city: "Graz",
    country: "Austria",
    year: "2026",
    dates: "11 December 2025 - 23 January 2026",
    startDate: "11 December 2025",
    endDate: "23 January 2026",
    curator: "@markus.sworcik, @rene_stiegler",
    photographer: "@atelier_biela",
    description:
      "The exhibition explores a state in which objects and materials no longer serve as stable carriers of meaning. Presence and absence intertwine, and the body is preserved only as a trace, suspended between the physical and the symbolic. Drawing on ideas of difference and repetition, the works oscillate between appearance and disappearance, where material behaves like memory and form remains in constant tension.\n\nMotifs of erosion, decay, and fragmentation recall religious and iconographic traditions, in which remnants hold meaning beyond the body itself. Through restrained forms and subtle shifts of light, the exhibition frames vulnerability and transformation as ongoing processes rather than final states.",
    summary:
      "An exhibition where objects, material traces and shifting light frame vulnerability and transformation.",
    previewImage: localExhibitionImage(
      "DOUBLED PRESENCE IN A DISEMBODIED SPACE BY ANZHELIKA PALYVODA, CÉLINE STRUGER AND SOFIIA YESAKOVA",
      "photo_1_2026-05-23_19-21-20.jpg",
    ),
    heroImage: localExhibitionImage(
      "DOUBLED PRESENCE IN A DISEMBODIED SPACE BY ANZHELIKA PALYVODA, CÉLINE STRUGER AND SOFIIA YESAKOVA",
      "photo_1_2026-05-23_19-21-20.jpg",
    ),
    images: localExhibitionGallery(
      "DOUBLED PRESENCE IN A DISEMBODIED SPACE BY ANZHELIKA PALYVODA, CÉLINE STRUGER AND SOFIIA YESAKOVA",
      [
        "photo_1_2026-05-23_19-21-20.jpg",
        "photo_2_2026-05-23_19-21-20.jpg",
        "photo_3_2026-05-23_19-21-20.jpg",
        "photo_4_2026-05-23_19-21-20.jpg",
        "photo_5_2026-05-23_19-21-20.jpg",
        "photo_6_2026-05-23_19-21-20.jpg",
        "photo_7_2026-05-23_19-21-20.jpg",
        "photo_8_2026-05-23_19-21-20.jpg",
      ],
      "vertical",
      "@atelier_biela",
    ),
    instagramUrl: "https://www.instagram.com/p/DUItvrviMaW/",
  },
  {
    slug: "bucolica",
    title: "BUCOLICA",
    subtitle: "ANNA HULAČOVÁ",
    artists: ["ANNA HULAČOVÁ"],
    venue: "@kunstraumdornbirn",
    gallery: "@kunstraumdornbirn",
    city: "Dornbirn",
    country: "Austria",
    year: "2026",
    dates: "14 November 2025 - 1 March 2026",
    startDate: "14 November 2025",
    endDate: "1 March 2026",
    curator: "#ThomasHäusle",
    photographer: "@guenterrichardwett",
    description:
      "The exhibition Bucolica unfolds a sculptural world where ancient myth, agrarian ritual, and industrial aesthetics collide. Hulačová constructs hybrid figures and machines that oscillate between human, animal, and tool, drawing on materials such as concrete, ceramics, wood, and honeycombs. Rural labor appears both idealized and destabilized: bodies are monumental yet unfinished, functional yet impaired, caught between harmony with nature and the violence of productivity.\n\nA key symbolic layer is the use of honeycombs, produced through direct collaboration with bees, invoking the ancient myth of bugonia - cyclical renewal and life emerging from death. These motifs connect ecological processes, spiritual belief, and material transformation. References to Socialist Realism, medieval agrarian imagery, and modernist architecture place the works within a long visual history of labor and ideology. Rather than nostalgia, Bucolica stages a tense continuum from pastoral myth to dystopian present.\n\nDomestic objects, religious gestures, and absurd figures introduce irony and fragility. The exhibition ultimately reflects on the relationship between past, present, and future, questioning how humanity negotiates survival between nature, machine, and collective systems.",
    summary:
      "A sculptural world where ancient myth, agrarian ritual and industrial aesthetics collide.",
    previewImage: localExhibitionImage(
      "BUCOLICA BY ANNA HULAČOVÁ",
      "photo_1_2026-05-23_19-22-19.jpg",
    ),
    heroImage: localExhibitionImage(
      "BUCOLICA BY ANNA HULAČOVÁ",
      "photo_1_2026-05-23_19-22-19.jpg",
    ),
    images: localExhibitionGallery(
      "BUCOLICA BY ANNA HULAČOVÁ",
      [
        "photo_1_2026-05-23_19-22-19.jpg",
        "photo_2_2026-05-23_19-22-19.jpg",
        "photo_3_2026-05-23_19-22-19.jpg",
        "photo_4_2026-05-23_19-22-19.jpg",
        "photo_5_2026-05-23_19-22-19.jpg",
        "photo_6_2026-05-23_19-22-19.jpg",
        "photo_7_2026-05-23_19-22-19.jpg",
        "photo_8_2026-05-23_19-22-19.jpg",
        "photo_9_2026-05-23_19-22-19.jpg",
        "photo_10_2026-05-23_19-22-19.jpg",
        "photo_11_2026-05-23_19-22-19.jpg",
        "photo_12_2026-05-23_19-22-19.jpg",
        "photo_13_2026-05-23_19-22-19.jpg",
      ],
      "vertical",
      "@guenterrichardwett",
    ),
    instagramUrl: "https://www.instagram.com/p/DTLCd-ZCDW_/",
  },
  {
    slug: "motions-to-unfurl",
    title: "MOTIONS TO UNFURL (GROUP EXHIBITION)",
    artists: ["Eunju Hong", "Jiwon Song", "Ye Cheng"],
    venue: "@gallery_thetigerroom",
    gallery: "@gallery_thetigerroom",
    city: "Munich",
    country: "Germany",
    year: "2026",
    dates: "22 November 2025 - 17 January 2026",
    startDate: "22 November 2025",
    endDate: "17 January 2026",
    curator: "#HeikeDempster",
    photographer: "#LuZhang",
    description:
      "The exhibition brings together Ye Cheng, Eunju Hong, and Jiwon Song to explore how hybrid forms of life and perception emerge from entanglements of technology, mythology, and material culture. Through painterly, sculptural, and performative practices, the artists examine bodies - human and more-than-human - as sites where memory, loss, and transformation are inscribed.\n\nAcross the exhibition, landscapes, objects, and figures operate as unstable thresholds between past and future, visibility and disappearance. The works unfold as a dialogue that extends beyond the gallery space into the porous terrain of imagination, diasporic memory, and posthuman becoming.",
    summary:
      "Works by Ye Cheng, Eunju Hong and Jiwon Song explore bodies transformed through technology, mythology and material culture.",
    previewImage: localExhibitionImage(
      "MOTIONS TO UNFURL (GROUP EXHIBITION)",
      "photo_1_2026-05-23_19-23-24.jpg",
    ),
    heroImage: localExhibitionImage(
      "MOTIONS TO UNFURL (GROUP EXHIBITION)",
      "photo_1_2026-05-23_19-23-24.jpg",
    ),
    images: localExhibitionGallery(
      "MOTIONS TO UNFURL (GROUP EXHIBITION)",
      [
        "photo_1_2026-05-23_19-23-24.jpg",
        "photo_2_2026-05-23_19-23-24.jpg",
        "photo_3_2026-05-23_19-23-25.jpg",
        "photo_4_2026-05-23_19-23-25.jpg",
        "photo_5_2026-05-23_19-23-25.jpg",
        "photo_6_2026-05-23_19-23-25.jpg",
        "photo_7_2026-05-23_19-23-25.jpg",
        "photo_8_2026-05-23_19-23-25.jpg",
        "photo_9_2026-05-23_19-23-25.jpg",
        "photo_10_2026-05-23_19-23-25.jpg",
        "photo_11_2026-05-23_19-23-25.jpg",
        "photo_12_2026-05-23_19-23-25.jpg",
      ],
      "vertical",
      "#LuZhang",
    ),
    instagramUrl: "https://www.instagram.com/p/DS3DpFgiM5G/",
  },
  {
    slug: "the-signal-the-noice",
    title: "THE SIGNAL. THE NOICE (GROUP EXHIBITION)",
    venue: "Greatorex Street E1",
    gallery: "Greatorex Street E1",
    city: "London",
    year: "2025",
    dates: "07 August - 11 August 2025",
    startDate: "07 August 2025",
    endDate: "11 August 2025",
    artists: [
      "@Hudson.Cooke",
      "@anaionscu",
      "@nyzuz_",
      "@ma.yi.wen",
      "@yurithepasta",
      "@brightoff",
      "@kyykyay",
      "@yibo.wn",
      "@giacomolayet",
      "@ze_puli",
      "@pppppphhhh6759",
      "@m.h.toscano",
      "@anya_mokhova_",
      "@11xiao.z",
      "@janmioduchowski",
    ],
    curator: "@pai_32_",
    photographer: "@plus1ap",
    description:
      "The Signal. The Noise. examines communication in the digital age, where clarity collapses under waves of data, distortion and simulation. Drawing on Nate Silver's notion of the blurred boundary between truth and distraction, and Jean Baudrillard's idea that information proliferates as meaning evaporates, the exhibition situates viewers inside a landscape where messages glitch and perception fractures.\n\nThe show proposes distortion not as an obstacle but as a new emotional interface - a way of sensing amid hyper-connectivity and disembodied exchange. Echoing Byung-Chul Han's \"digital swarm,\" information circulates virally rather than dialogically, dissolving stable meaning. Through diverse media, the participating artists explore this turbulent terrain, where interference becomes narrative and noise becomes the condition of contemporary subjectivity.",
    summary:
      "Communication, distortion, and simulation converge in an exhibition where interference becomes narrative and noise becomes contemporary subjectivity.",
    previewImage: localExhibitionImage(
      "THE SIGNAL. THE NOICE (GROUP EXHIBITION)",
      "photo_1_2026-05-23_19-24-35.jpg",
    ),
    heroImage: localExhibitionImage(
      "THE SIGNAL. THE NOICE (GROUP EXHIBITION)",
      "photo_1_2026-05-23_19-24-35.jpg",
    ),
    images: localExhibitionGallery("THE SIGNAL. THE NOICE (GROUP EXHIBITION)", [
      "photo_1_2026-05-23_19-24-35.jpg",
      "photo_2_2026-05-23_19-24-35.jpg",
      "photo_3_2026-05-23_19-24-35.jpg",
      "photo_4_2026-05-23_19-24-35.jpg",
      "photo_5_2026-05-23_19-24-35.jpg",
      "photo_6_2026-05-23_19-24-35.jpg",
      "photo_7_2026-05-23_19-24-35.jpg",
      "photo_8_2026-05-23_19-24-35.jpg",
      "photo_9_2026-05-23_19-24-35.jpg",
      "photo_10_2026-05-23_19-24-35.jpg",
      "photo_11_2026-05-23_19-24-35.jpg",
      "photo_12_2026-05-23_19-24-35.jpg",
      "photo_13_2026-05-23_19-24-35.jpg",
      "photo_14_2026-05-23_19-24-35.jpg",
    ]),
    instagramUrl: "https://www.instagram.com/p/DSfA5cDCPzc/",
  },
  {
    slug: "thresholds",
    title: "THRESHOLDS",
    subtitle: "PAKUI HARDWARE",
    artists: ["PAKUI HARDWARE"],
    venue: "Carlier | Gebauer",
    gallery: "Carlier | Gebauer",
    city: "Berlin",
    country: "Germany",
    year: "2025",
    dates: "01 November - 20 December 2025",
    startDate: "01 November 2025",
    endDate: "20 December 2025",
    photographer: "#RomanMarz and PH",
    description:
      "The exhibition presents new kinetic sculptures made of steel, glass, silicone and elastic fabric, moving with a steady, autonomous rhythm. Initially shown at Zachęta - National Gallery of Art, it centers on the metaphor of the filtering membrane and biological immunity, exploring how organisms distinguish between self and foreign matter.\n\nBy drawing on medical imaging, biology and bodily materiality, Pakui Hardware examine the limits and vulnerabilities of the body within broader social and ecological systems. Their ongoing research into genetics, the nervous system and immunity frames these structures as metaphors for governance, revealing tensions between individual and collective management.",
    summary:
      "Kinetic sculptures examine filtering membranes, immunity and the body's relation to social and ecological systems.",
    previewImage: localExhibitionImage(
      "THRESHOLDS BY PAKUI HARDWARE",
      "photo_1_2026-05-23_19-25-33.jpg",
    ),
    heroImage: localExhibitionImage(
      "THRESHOLDS BY PAKUI HARDWARE",
      "photo_1_2026-05-23_19-25-33.jpg",
    ),
    images: localExhibitionGallery(
      "THRESHOLDS BY PAKUI HARDWARE",
      [
        "photo_1_2026-05-23_19-25-33.jpg",
        "photo_2_2026-05-23_19-25-33.jpg",
        "photo_3_2026-05-23_19-25-33.jpg",
        "photo_4_2026-05-23_19-25-33.jpg",
        "photo_5_2026-05-23_19-25-33.jpg",
        "photo_6_2026-05-23_19-25-33.jpg",
        "photo_7_2026-05-23_19-25-33.jpg",
        "photo_8_2026-05-23_19-25-33.jpg",
        "photo_9_2026-05-23_19-25-33.jpg",
        "photo_10_2026-05-23_19-25-33.jpg",
        "photo_11_2026-05-23_19-25-33.jpg",
      ],
      "vertical",
      "#RomanMarz and PH",
    ),
    instagramUrl: "https://www.instagram.com/p/DSA0kGkgqXh/",
  },
  {
    slug: "myths-from-smoldering-skies",
    title: "MYTHS FROM SMOLDERING SKIES (GROUP EXHIBITION)",
    artists: ["@elwll", "@min_minline", "@mattia_ragni", "#SirTaki"],
    venue: "@limbo.contemporary",
    gallery: "@limbo.contemporary",
    city: "Milan",
    country: "Italy",
    year: "2025",
    dates: "06 November - 20 December 2025",
    startDate: "06 November 2025",
    endDate: "20 December 2025",
    photographer: "#OscarGiacomini",
    description:
      "Myths from Smoldering Skies explores an imaginary world suspended between destruction and rebirth, where symbolic combustion opens pathways to transformation. The practices of the four artists converge around the idea of reality as an archive of residual visions, merging ruin-time with myth-time to reveal the regenerative potential hidden within states of decline.\n\nAcross painting, digital sculpture, collage and post-apocalyptic narratives, the exhibition traces speculative ecologies, hybrid beings, archaeological futures and unstable image-worlds. Each artist reconfigures fragments of contemporary iconography - from war-scarred landscapes to translucent techno-relics - generating new mythological constellations that inhabit the threshold between documentation and fiction.\n\nThrough this shared terrain, image-making becomes a gesture of survival and reinvention, reclaiming meaning from the smoldering debris of the present.",
    summary:
      "Four artistic practices merge ruin-time and myth-time in an imagined world suspended between destruction and rebirth.",
    previewImage: localExhibitionImage(
      "MYTHS FROM SMOLDERING SKIES (GROUP EXHIBITION)",
      "photo_1_2026-05-23_19-26-42.jpg",
    ),
    heroImage: localExhibitionImage(
      "MYTHS FROM SMOLDERING SKIES (GROUP EXHIBITION)",
      "photo_1_2026-05-23_19-26-42.jpg",
    ),
    images: localExhibitionGallery(
      "MYTHS FROM SMOLDERING SKIES (GROUP EXHIBITION)",
      [
        "photo_1_2026-05-23_19-26-42.jpg",
        "photo_2_2026-05-23_19-26-42.jpg",
        "photo_3_2026-05-23_19-26-42.jpg",
        "photo_4_2026-05-23_19-26-42.jpg",
        "photo_5_2026-05-23_19-26-42.jpg",
        "photo_6_2026-05-23_19-26-42.jpg",
        "photo_7_2026-05-23_19-26-42.jpg",
        "photo_8_2026-05-23_19-26-42.jpg",
        "photo_9_2026-05-23_19-26-42.jpg",
      ],
      "vertical",
      "#OscarGiacomini",
    ),
    instagramUrl: "https://www.instagram.com/p/DR-KmSLCBbJ/",
  },
  {
    slug: "weaving-back-to-common-grounds",
    title: "WEAVING BACK TO COMMON GROUNDS (GROUP EXHIBITION)",
    artists: ["@o_t_c_", "@alexander.klaubert", "@rahelgrotelambers", "#FrancisKussatz", "@uli.ecke"],
    venue: "ACUD Galerie",
    gallery: "ACUD Galerie",
    city: "Berlin",
    country: "Germany",
    year: "2025",
    dates: "07 November - 07 December 2025",
    startDate: "07 November 2025",
    endDate: "07 December 2025",
    curator: "@o_t_c_",
    photographer: "Luka Naujoks",
    description:
      "The exhibition explores the processes of finding - and losing - common ground. It examines closeness and distance, change and transformation, acknowledging that what once connected can later become a site of rupture.\n\nThe works on view - both collaborative and individual - approach these questions through overlaps, exchanges, and shifting boundaries. They trace how spatial and emotional distance shapes artistic practice and collective experience.",
    summary:
      "Collaborative and individual works examine finding and losing common ground through shifting spatial and emotional distance.",
    previewImage: localExhibitionImage(
      "WEAVING BACK TO COMMON GROUNDS (GROUP EXHIBITION)",
      "photo_1_2026-05-23_19-28-57.jpg",
    ),
    heroImage: localExhibitionImage(
      "WEAVING BACK TO COMMON GROUNDS (GROUP EXHIBITION)",
      "photo_1_2026-05-23_19-28-57.jpg",
    ),
    images: localExhibitionGallery(
      "WEAVING BACK TO COMMON GROUNDS (GROUP EXHIBITION)",
      [
        "photo_1_2026-05-23_19-28-57.jpg",
        "photo_2_2026-05-23_19-28-57.jpg",
        "photo_3_2026-05-23_19-28-57.jpg",
        "photo_4_2026-05-23_19-28-57.jpg",
        "photo_5_2026-05-23_19-28-57.jpg",
        "photo_6_2026-05-23_19-28-57.jpg",
        "photo_7_2026-05-23_19-28-57.jpg",
        "photo_8_2026-05-23_19-28-57.jpg",
        "photo_9_2026-05-23_19-28-57.jpg",
        "photo_10_2026-05-23_19-28-57.jpg",
      ],
      "vertical",
      "@lukanaujoks",
    ),
    instagramUrl: "https://www.instagram.com/p/DRc354aCChD/",
  },
  // LOCAL_IMAGE_CAPTION_IMPORT_END
  // INSTAGRAM_ADDITIONAL_IMPORT_START
  {
    "slug": "presence-by-proxy",
    "title": "PRESENCE BY PROXY",
    "artists": [
      "Anja Rausch",
      "ioo0.oio.00oi"
    ],
    "subtitle": "Anja Rausch and ioo0.oio.00oi",
    "venue": "Schutzenverein",
    "gallery": "Schutzenverein",
    "city": "Berlin-Schöneberg",
    "year": "2025",
    "dates": "November 2025",
    "startDate": "November 2025",
    "photographer": "Anja Rausch",
    "description": "",
    "summary": "",
    "previewImage": "/exhibitions/DRB9ITtiIlT/01.jpg",
    "heroImage": "/exhibitions/DRB9ITtiIlT/01.jpg",
    "images": [
      {
        "src": "/exhibitions/DRB9ITtiIlT/01.jpg",
        "orientation": "vertical",
        "caption": "Installation view. Photo: @a.b.rausch official Instagram"
      },
      {
        "src": "/exhibitions/DRB9ITtiIlT/02.jpg",
        "orientation": "vertical",
        "caption": "Installation view. Photo: @a.b.rausch official Instagram"
      },
      {
        "src": "/exhibitions/DRB9ITtiIlT/03.jpg",
        "orientation": "vertical",
        "caption": "Installation view. Photo: @a.b.rausch official Instagram"
      },
      {
        "src": "/exhibitions/DRB9ITtiIlT/04.jpg",
        "orientation": "vertical",
        "caption": "Installation view. Photo: @a.b.rausch official Instagram"
      },
      {
        "src": "/exhibitions/DRB9ITtiIlT/05.jpg",
        "orientation": "vertical",
        "caption": "Installation view. Photo: @a.b.rausch official Instagram"
      },
      {
        "src": "/exhibitions/DRB9ITtiIlT/06.jpg",
        "orientation": "vertical",
        "caption": "Installation view. Photo: @a.b.rausch official Instagram"
      },
      {
        "src": "/exhibitions/DRB9ITtiIlT/07.jpg",
        "orientation": "vertical",
        "caption": "Installation view. Photo: @a.b.rausch official Instagram"
      },
      {
        "src": "/exhibitions/DRB9ITtiIlT/08.jpg",
        "orientation": "vertical",
        "caption": "Installation view. Photo: @a.b.rausch official Instagram"
      },
      {
        "src": "/exhibitions/DRB9ITtiIlT/09.jpg",
        "orientation": "vertical",
        "caption": "Installation view. Photo: @a.b.rausch official Instagram"
      }
    ],
    "instagramUrl": "https://www.instagram.com/p/DRB9ITtiIlT/"
  },
  {
    "slug": "lost-encounters-they-cling",
    "title": "LOST ENCOUNTERS, THEY CLING",
    "artists": [
      "@valentino.skarwan"
    ],
    "subtitle": "VALENTINO SKARWAN",
    "venue": "PARALLEL VIENNA",
    "gallery": "PARALLEL VIENNA",
    "year": "2025",
    "dates": "2025",
    "curator": "Silke Eggl",
    "photographer": "Valentino Skarwan",
    "description": "",
    "summary": "",
    "previewImage": "/exhibitions/DQqzkpRiKKT/01.jpg",
    "heroImage": "/exhibitions/DQqzkpRiKKT/01.jpg",
    "images": [
      {
        "src": "/exhibitions/DQqzkpRiKKT/01.jpg",
        "orientation": "vertical",
        "caption": "Installation view. Photo: @valentino.skarwan official Instagram"
      },
      {
        "src": "/exhibitions/DQqzkpRiKKT/02.jpg",
        "orientation": "vertical",
        "caption": "Installation view. Photo: @valentino.skarwan official Instagram"
      },
      {
        "src": "/exhibitions/DQqzkpRiKKT/03.jpg",
        "orientation": "vertical",
        "caption": "Installation view. Photo: @valentino.skarwan official Instagram"
      },
      {
        "src": "/exhibitions/DQqzkpRiKKT/04.jpg",
        "orientation": "vertical",
        "caption": "Installation view. Photo: @valentino.skarwan official Instagram"
      }
    ],
    "instagramUrl": "https://www.instagram.com/p/DQqzkpRiKKT/"
  },
  {
    "slug": "pulses-within",
    "title": "PULSES WITHIN",
    "artists": [
      "@xolo_cuintle (@romytexier & @valentinviebinet)"
    ],
    "subtitle": "XOLO CUINTLE",
    "venue": "@ds_galerie",
    "gallery": "@ds_galerie",
    "city": "Paris",
    "country": "France",
    "year": "2025",
    "dates": "October 18 — November 29, 2025",
    "startDate": "October 18",
    "endDate": "November 29, 2025",
    "photographer": "#NicolasLafon",
    "description": "«The artist duo Xolo Cuintle, founded in 2020 by Romy Texier and Valentin Vie Binet, live in Paris and work in Aubervilliers. Through the use of concrete, they create petrified scenes where hybrid organisms flourish. Their installations explore the history of soils and the life forms that compose them.\n\nIn their solo exhibition «Pulses Within», Xolo Cuintle transforms the gallery into a living membrane. A series of concrete sculptures and bas-reliefs unfolds hybrid, breathing forms — entomological ventilation systems, organo-industrial growths, and porous interfaces between bodies, species, and machines».",
    "summary": "«The artist duo Xolo Cuintle, founded in 2020 by Romy Texier and Valentin Vie Binet, live in Paris and work in Aubervilliers. Through the use of concrete, they create petrified scenes where hybrid organisms flourish. Their installations explore the history of soils and the life forms that compose them.",
    "previewImage": "/exhibitions/DQe86m2CAQU/01.jpg",
    "heroImage": "/exhibitions/DQe86m2CAQU/01.jpg",
    "images": [
      {
        "src": "/exhibitions/DQe86m2CAQU/01.jpg",
        "orientation": "vertical",
        "caption": "Installation view. Photo: #NicolasLafon"
      },
      {
        "src": "/exhibitions/DQe86m2CAQU/02.jpg",
        "orientation": "vertical",
        "caption": "Installation view. Photo: #NicolasLafon"
      },
      {
        "src": "/exhibitions/DQe86m2CAQU/03.jpg",
        "orientation": "vertical",
        "caption": "Installation view. Photo: #NicolasLafon"
      },
      {
        "src": "/exhibitions/DQe86m2CAQU/04.jpg",
        "orientation": "vertical",
        "caption": "Installation view. Photo: #NicolasLafon"
      },
      {
        "src": "/exhibitions/DQe86m2CAQU/05.jpg",
        "orientation": "vertical",
        "caption": "Installation view. Photo: #NicolasLafon"
      },
      {
        "src": "/exhibitions/DQe86m2CAQU/06.jpg",
        "orientation": "vertical",
        "caption": "Installation view. Photo: #NicolasLafon"
      },
      {
        "src": "/exhibitions/DQe86m2CAQU/07.jpg",
        "orientation": "vertical",
        "caption": "Installation view. Photo: #NicolasLafon"
      }
    ],
    "instagramUrl": "https://www.instagram.com/p/DQe86m2CAQU/"
  },
  {
    "slug": "sweet-world-1",
    "title": "SWEET WORLD 1",
    "artists": [
      "@jeffkoons",
      "@roman.charity"
    ],
    "subtitle": "JEFF KOONS AND TRAVIS JOHN FICARRA",
    "venue": "@sweet.world.gallery",
    "gallery": "@sweet.world.gallery",
    "year": "2025",
    "dates": "August 1 - December 20, 2025",
    "startDate": "August 1, 2025",
    "endDate": "December 20, 2025",
    "photographer": "Sweet World Gallery",
    "description": "",
    "summary": "",
    "previewImage": "/exhibitions/DPyr9CYCE2o/01.jpg",
    "heroImage": "/exhibitions/DPyr9CYCE2o/01.jpg",
    "images": [
      {
        "src": "/exhibitions/DPyr9CYCE2o/01.jpg",
        "orientation": "horizontal",
        "caption": "Installation view. Photo: courtesy of the gallery."
      },
      {
        "src": "/exhibitions/DPyr9CYCE2o/02.jpg",
        "orientation": "horizontal",
        "caption": "Installation view. Photo: courtesy of the gallery."
      },
      {
        "src": "/exhibitions/DPyr9CYCE2o/03.jpg",
        "orientation": "horizontal",
        "caption": "Installation view. Photo: courtesy of the gallery."
      },
      {
        "src": "/exhibitions/DPyr9CYCE2o/04.jpg",
        "orientation": "horizontal",
        "caption": "Installation view. Photo: courtesy of the gallery."
      },
      {
        "src": "/exhibitions/DPyr9CYCE2o/05.jpg",
        "orientation": "horizontal",
        "caption": "Installation view. Photo: courtesy of the gallery."
      },
      {
        "src": "/exhibitions/DPyr9CYCE2o/06.jpg",
        "orientation": "horizontal",
        "caption": "Installation view. Photo: courtesy of the gallery."
      },
      {
        "src": "/exhibitions/DPyr9CYCE2o/07.jpg",
        "orientation": "horizontal",
        "caption": "Installation view. Photo: courtesy of the gallery."
      },
      {
        "src": "/exhibitions/DPyr9CYCE2o/08.jpg",
        "orientation": "horizontal",
        "caption": "Installation view. Photo: courtesy of the gallery."
      }
    ],
    "instagramUrl": "https://www.instagram.com/p/DPyr9CYCE2o/"
  },
  {
    "slug": "paradise-rot",
    "title": "PARADISE ROT",
    "artists": [
      "Ula Lucinska",
      "Michal Knychaus"
    ],
    "subtitle": "INSIDE JOB",
    "venue": "@galeria_arsenal",
    "gallery": "@galeria_arsenal",
    "city": "Białystok",
    "country": "Poland",
    "year": "2025",
    "dates": "5 September – 9 November 2025",
    "startDate": "5 September",
    "endDate": "9 November 2025",
    "curator": "Katarzyna Różniak-Szabelska",
    "photographer": "Tytus Szabelski-Różniak",
    "description": "«Paradise Rot» alongside the new series «Wind Sailors», as part of the exhibition Cockaigne.\n\n«The installations by the Inside Job duo refer, among other things, to Slavic legends about will-o’-the-wisps, which were said to show some people the way, while deliberately leading others to their doom. Also known as marsh lights, they took the form of small glowing balls and floated above swamps and peat bogs. The site-specific installation filling the space of the former power plant combines these stories with forms inspired by human infrastructure».",
    "summary": "«Paradise Rot» alongside the new series «Wind Sailors», as part of the exhibition Cockaigne.",
    "previewImage": "/exhibitions/DPw9Au5CD6x/01.jpg",
    "heroImage": "/exhibitions/DPw9Au5CD6x/01.jpg",
    "images": [
      {
        "src": "/exhibitions/DPw9Au5CD6x/01.jpg",
        "orientation": "vertical",
        "caption": "Installation view. Photo: @tszabelski"
      },
      {
        "src": "/exhibitions/DPw9Au5CD6x/02.jpg",
        "orientation": "vertical",
        "caption": "Installation view. Photo: @tszabelski"
      },
      {
        "src": "/exhibitions/DPw9Au5CD6x/03.jpg",
        "orientation": "vertical",
        "caption": "Installation view. Photo: @tszabelski"
      },
      {
        "src": "/exhibitions/DPw9Au5CD6x/04.jpg",
        "orientation": "vertical",
        "caption": "Installation view. Photo: @tszabelski"
      },
      {
        "src": "/exhibitions/DPw9Au5CD6x/05.jpg",
        "orientation": "vertical",
        "caption": "Installation view. Photo: @tszabelski"
      }
    ],
    "instagramUrl": "https://www.instagram.com/p/DPw9Au5CD6x/"
  },
  {
    "slug": "tactics-for-an-era-group-show",
    "title": "TACTICS FOR AN ERA (GROUP SHOW)",
    "artists": [
      "@kim.myungchan",
      "#NamDahoon"
    ],
    "subtitle": "@kim.myungchan, #NamDahoon",
    "venue": "K&L Museum",
    "gallery": "K&L Museum",
    "city": "Seoul",
    "country": "South Korea",
    "year": "2025",
    "dates": "28 August - 28 December, 2025",
    "startDate": "28 August, 2025",
    "endDate": "28 December, 2025",
    "photographer": "#Eeun",
    "description": "«The exhibition explores the shadows cast by our contemporary moment. It presents the ways in which each artist perceives and interprets the radically transformed world —the “Umgebung”, or physical and objective environment—reimagined through their unique perception into their own “Umwelt”, which refers to the subjective world each individual constructs through sensory and cognitive experience.\n\nFeaturing five artists, the exhibition sheds light on the human essence—rich sensory experiences and layered emotions—expressed through diverse and immersive artistic languages. It highlights how contemporary art seeks to reclaim the value and meaning of “human-ness,” and invites viewers to engage with the messages it conveys».",
    "summary": "«The exhibition explores the shadows cast by our contemporary moment. It presents the ways in which each artist perceives and interprets the radically transformed world —the “Umgebung”, or physical and objective environment—reimagined through their unique perception into their own “Umwelt”, which refers to the subjective world each individual constructs through sensory and cognitive experience.",
    "previewImage": "/exhibitions/DPq-5SKCMVC/01.jpg",
    "heroImage": "/exhibitions/DPq-5SKCMVC/01.jpg",
    "images": [
      {
        "src": "/exhibitions/DPq-5SKCMVC/01.jpg",
        "orientation": "horizontal",
        "caption": "Installation view. Photo: #Eeun"
      },
      {
        "src": "/exhibitions/DPq-5SKCMVC/02.jpg",
        "orientation": "horizontal",
        "caption": "Installation view. Photo: #Eeun"
      },
      {
        "src": "/exhibitions/DPq-5SKCMVC/03.jpg",
        "orientation": "horizontal",
        "caption": "Installation view. Photo: #Eeun"
      },
      {
        "src": "/exhibitions/DPq-5SKCMVC/04.jpg",
        "orientation": "horizontal",
        "caption": "Installation view. Photo: #Eeun"
      },
      {
        "src": "/exhibitions/DPq-5SKCMVC/05.jpg",
        "orientation": "horizontal",
        "caption": "Installation view. Photo: #Eeun"
      },
      {
        "src": "/exhibitions/DPq-5SKCMVC/06.jpg",
        "orientation": "horizontal",
        "caption": "Installation view. Photo: #Eeun"
      },
      {
        "src": "/exhibitions/DPq-5SKCMVC/07.jpg",
        "orientation": "horizontal",
        "caption": "Installation view. Photo: #Eeun"
      },
      {
        "src": "/exhibitions/DPq-5SKCMVC/08.jpg",
        "orientation": "horizontal",
        "caption": "Installation view. Photo: #Eeun"
      },
      {
        "src": "/exhibitions/DPq-5SKCMVC/09.jpg",
        "orientation": "horizontal",
        "caption": "Installation view. Photo: #Eeun"
      },
      {
        "src": "/exhibitions/DPq-5SKCMVC/10.jpg",
        "orientation": "horizontal",
        "caption": "Installation view. Photo: #Eeun"
      }
    ],
    "instagramUrl": "https://www.instagram.com/p/DPq-5SKCMVC/"
  },
  {
    "slug": "third-skin",
    "title": "THIRD SKIN",
    "artists": [
      "@ha_sung_wook_"
    ],
    "subtitle": "HA SUNG-WOOK",
    "venue": "@dive.seoul.art",
    "gallery": "@dive.seoul.art",
    "city": "Seoul",
    "year": "2025",
    "dates": "September 12 - October 4, 2025",
    "startDate": "September 12, 2025",
    "endDate": "October 4, 2025",
    "photographer": "@choi_chul_lim",
    "description": "«The work began with unfolding what was closest to my hands — things that touched my daily life. My engagement with leather as a material started from this same point. While working with leather in industrial settings to earn a living, its surface was nothing more than a raw material. Later, however, I began to see through it — toward the entangled structures of animals and products, distribution and culture, production and disposal. What emerged was no longer a “material,” but a trace that faithfully preserves the marks of human activity.\n\nThe leather I focus on transcends its physical properties and becomes a substance situated within multilayered networks of industry, capital, and culture — all revolving around the shared question of “sustainability.” If the living skin of an animal can be considered the first skin, then the surface consumed as an industrial and capitalist product becomes the second skin. Between these two surfaces, society conducts countless discussions on sustainability — both environmental and ethical...»",
    "summary": "«The work began with unfolding what was closest to my hands — things that touched my daily life. My engagement with leather as a material started from this same point. While working with leather in industrial settings to earn a living, its surface was nothing more than a raw material. Later, however, I began to see through it — toward the entangled structures of animals and products, distribution and culture, production and disposal. What emerged was no longer a “material,” but a trace that faithfully preserves the marks of human activity.",
    "previewImage": "/exhibitions/DPoGE3aiKfn/01.jpg",
    "heroImage": "/exhibitions/DPoGE3aiKfn/01.jpg",
    "images": [
      {
        "src": "/exhibitions/DPoGE3aiKfn/01.jpg",
        "orientation": "vertical",
        "caption": "Installation view. Photo: @choi_chul_lim"
      },
      {
        "src": "/exhibitions/DPoGE3aiKfn/02.jpg",
        "orientation": "vertical",
        "caption": "Installation view. Photo: @choi_chul_lim"
      },
      {
        "src": "/exhibitions/DPoGE3aiKfn/03.jpg",
        "orientation": "vertical",
        "caption": "Installation view. Photo: @choi_chul_lim"
      },
      {
        "src": "/exhibitions/DPoGE3aiKfn/04.jpg",
        "orientation": "vertical",
        "caption": "Installation view. Photo: @choi_chul_lim"
      },
      {
        "src": "/exhibitions/DPoGE3aiKfn/05.jpg",
        "orientation": "vertical",
        "caption": "Installation view. Photo: @choi_chul_lim"
      },
      {
        "src": "/exhibitions/DPoGE3aiKfn/06.jpg",
        "orientation": "vertical",
        "caption": "Installation view. Photo: @choi_chul_lim"
      }
    ],
    "instagramUrl": "https://www.instagram.com/p/DPoGE3aiKfn/"
  },
  {
    "slug": "desiring-machines",
    "title": "DESIRING MACHINES",
    "artists": [
      "Irene Molina"
    ],
    "subtitle": "Irene Molina",
    "venue": "RÍO & MEÑAKA",
    "gallery": "RÍO & MEÑAKA",
    "city": "Madrid",
    "country": "Spain",
    "year": "2025",
    "dates": "11 September ― 08 October, 2025",
    "startDate": "11 September, 2025",
    "endDate": "08 October, 2025",
    "curator": "RÍO & MEÑAKA",
    "photographer": "Irene Molina",
    "description": "«At some point we stopped imagining the cloud as a white, weightless vapor. We learned it is made of vast industrial warehouses, endless corridors of metal racks, cold lights flickering, fans humming like a constant breath.\n\nThousands of square meters occupied by servers that store our photos, conversations, 3D models, desires, and errors. Everything we believe to be intangible has a mailing address, a temperature, a weight. The cloud takes up space…»",
    "summary": "«At some point we stopped imagining the cloud as a white, weightless vapor. We learned it is made of vast industrial warehouses, endless corridors of metal racks, cold lights flickering, fans humming like a constant breath.",
    "previewImage": "/exhibitions/DPlWxuJiMrb/01.jpg",
    "heroImage": "/exhibitions/DPlWxuJiMrb/01.jpg",
    "images": [
      {
        "src": "/exhibitions/DPlWxuJiMrb/01.jpg",
        "orientation": "vertical",
        "caption": "Installation view. Photo: @irenemolina_ official Instagram"
      },
      {
        "src": "/exhibitions/DPlWxuJiMrb/02.jpg",
        "orientation": "vertical",
        "caption": "Installation view. Photo: @irenemolina_ official Instagram"
      },
      {
        "src": "/exhibitions/DPlWxuJiMrb/03.jpg",
        "orientation": "vertical",
        "caption": "Installation view. Photo: @irenemolina_ official Instagram"
      },
      {
        "src": "/exhibitions/DPlWxuJiMrb/04.jpg",
        "orientation": "vertical",
        "caption": "Installation view. Photo: @irenemolina_ official Instagram"
      },
      {
        "src": "/exhibitions/DPlWxuJiMrb/05.jpg",
        "orientation": "vertical",
        "caption": "Installation view. Photo: @irenemolina_ official Instagram"
      },
      {
        "src": "/exhibitions/DPlWxuJiMrb/06.jpg",
        "orientation": "vertical",
        "caption": "Installation view. Photo: @irenemolina_ official Instagram"
      },
      {
        "src": "/exhibitions/DPlWxuJiMrb/07.jpg",
        "orientation": "vertical",
        "caption": "Installation view. Photo: @irenemolina_ official Instagram"
      },
      {
        "src": "/exhibitions/DPlWxuJiMrb/08.jpg",
        "orientation": "vertical",
        "caption": "Installation view. Photo: @irenemolina_ official Instagram"
      },
      {
        "src": "/exhibitions/DPlWxuJiMrb/09.jpg",
        "orientation": "vertical",
        "caption": "Installation view. Photo: @irenemolina_ official Instagram"
      }
    ],
    "instagramUrl": "https://www.instagram.com/p/DPlWxuJiMrb/"
  },
  // INSTAGRAM_ADDITIONAL_IMPORT_END
  // LOCAL_IMAGE_METADATA_IMPORT_2_START
  {
    slug: "the-language-of-the-enemy",
    title: "THE LANGUAGE OF THE ENEMY",
    subtitle: "ADRIÁN VILLAR ROJAS",
    venue: "@artsonje_center",
    gallery: "@artsonje_center",
    city: "Seoul",
    country: "South Korea",
    year: "2026",
    dates: "03 September - 01 February 2026",
    artists: ["ADRIÁN VILLAR ROJAS"],
    photographer: "#SeowonNam",
    summary:
      "Art Sonje Center becomes an unstable ecosystem where architecture, soil, fire, plant life, and speculative sculptural forms converge.",
    description:
      "Villar Rojas transforms Art Sonje Center into a changing ecosystem that challenges the museum's role as a site of preservation. Corridors, stairwells, restrooms, and the cinema form a single environment shaped by organic and synthetic forces.\n\nThe exhibition centers on sculptures from The End of Imagination, developed through the artist's digital simulation process and brought into physical space as forms reflecting on extinction, inheritance, and emerging intelligences.",
    previewImage: localExhibitionImage(
      "THE LANGUAGE OF THE ENEMY BY ADRIÁN VILLAR ROJAS",
      "photo_1_2026-05-23_20-29-42.jpg",
    ),
    heroImage: localExhibitionImage(
      "THE LANGUAGE OF THE ENEMY BY ADRIÁN VILLAR ROJAS",
      "photo_1_2026-05-23_20-29-42.jpg",
    ),
    images: numberedLocalExhibitionGallery(
      "THE LANGUAGE OF THE ENEMY BY ADRIÁN VILLAR ROJAS",
      "2026-05-23_20-29-42",
      14,
      "horizontal",
      "#SeowonNam",
    ),
    instagramUrl: "https://www.instagram.com/p/DRaQ7buCFUf/",
  },
  {
    slug: "parade",
    title: "PARADE",
    subtitle: "PAOLA SIRI RENARD",
    venue: "@romeropaprocki",
    gallery: "@romeropaprocki",
    city: "Paris",
    year: "2025",
    dates: "18 October - 28 November 2025",
    artists: ["PAOLA SIRI RENARD"],
    curator: "@sorana_munsya",
    photographer: "#SalimSantaLucia",
    summary:
      "Sculptural fragments explore visibility as both protection and exposure, moving between monument, body, and ornament.",
    description:
      "The exhibition considers visibility as protection and exposure. Fragments of equestrian monuments become hybrid bodies suspended between stability and movement, power and camouflage.\n\nStainless-steel structures evoke support systems behind public spectacle, constructing a transitional landscape in which bodies, architecture, and display remain unsettled.",
    previewImage: localExhibitionImage(
      "PARADE BY PAOLA SIRI RENARD",
      "photo_1_2026-05-23_20-47-42.jpg",
    ),
    heroImage: localExhibitionImage(
      "PARADE BY PAOLA SIRI RENARD",
      "photo_1_2026-05-23_20-47-42.jpg",
    ),
    images: numberedLocalExhibitionGallery(
      "PARADE BY PAOLA SIRI RENARD",
      "2026-05-23_20-47-42",
      10,
      "vertical",
      "#SalimSantaLucia",
    ),
    instagramUrl: "https://www.instagram.com/p/DRMuan1iAI_/",
  },
  {
    slug: "crash-paendemonia",
    title: "CRASH PÆNDEMONIA",
    subtitle: "MILAN ZIENTARA",
    venue: "@_jak_zapomniec_",
    gallery: "@_jak_zapomniec_",
    city: "Kraków",
    country: "Poland",
    year: "2025",
    dates: "10 October - 28 November 2025",
    artists: ["MILAN ZIENTARA"],
    curator: "Kuba Brzegowy",
    photographer: "Michał Maliński",
    summary:
      "A nocturnal environment of polished metal, impact, and bodily vulnerability places desire alongside destruction.",
    description:
      "CRASH PÆNDEMONIA moves through a nighttime terrain of black machines, polished chrome, fractured glass, and physical impact. The exhibition links bodily vulnerability with the visual language of collision and fetish.\n\nThe works stage a passage through abandoned urban space in which damaged surfaces, worn leather, headlights, and drifting dust become traces of desire and destruction.",
    previewImage: localExhibitionImage(
      "CRASH PÆNDEMONIA BY MILAN ZIENTARA",
      "photo_1_2026-05-23_20-48-52.jpg",
    ),
    heroImage: localExhibitionImage(
      "CRASH PÆNDEMONIA BY MILAN ZIENTARA",
      "photo_1_2026-05-23_20-48-52.jpg",
    ),
    images: numberedLocalExhibitionGallery(
      "CRASH PÆNDEMONIA BY MILAN ZIENTARA",
      "2026-05-23_20-48-52",
      11,
      "vertical",
      "@mlekoyo",
    ),
    instagramUrl: "https://www.instagram.com/p/DRC_43xiDfD/",
  },
  {
    slug: "fantasy-vanishes-in-flesh",
    title: "FANTASY VANISHES IN FLESH",
    subtitle: "IVANA BAŠIĆ",
    venue: "@francesca_minini",
    gallery: "@francesca_minini",
    city: "Milan",
    country: "Italy",
    year: "2025",
    dates: "24 September - 29 November 2025",
    artists: ["IVANA BAŠIĆ"],
    photographer: "#AndreaRossetti",
    exhibitionText: "Francesca Minini",
    summary:
      "Bašić examines bodily transformation and subjectivity through a posthuman material language shaped by pressure and violence.",
    description:
      "Ivana Bašić examines the material and metaphysical boundaries of humanity through a posthuman perspective informed by experiences of war and violence during the collapse of Yugoslavia.\n\nHer material vocabulary links physical substances with conceptual states across a broader sculptural cosmology, asking how pressure and destruction transform both body and subjectivity.",
    previewImage: localExhibitionImage(
      "FANTASY VANISHES IN FLESH BY IVANA BAŠIĆ",
      "photo_1_2026-05-23_20-51-26.jpg",
    ),
    heroImage: localExhibitionImage(
      "FANTASY VANISHES IN FLESH BY IVANA BAŠIĆ",
      "photo_1_2026-05-23_20-51-26.jpg",
    ),
    images: numberedLocalExhibitionGallery(
      "FANTASY VANISHES IN FLESH BY IVANA BAŠIĆ",
      "2026-05-23_20-51-26",
      6,
      "vertical",
      "#AndreaRossetti",
    ),
    instagramUrl: "https://www.instagram.com/p/DPeQm6nApTX/",
  },
  {
    slug: "afterlifes",
    title: "AFTERLIFES",
    subtitle: "FLORYAN VARENNES",
    venue: "Hongti Artcenter",
    gallery: "Hongti Artcenter",
    city: "Busan",
    country: "South Korea",
    year: "2025",
    dates: "11 August - 24 August 2025",
    artists: ["FLORYAN VARENNES"],
    curator: "#VillaBusan",
    photographer: "#VillaBusan",
    exhibitionText: "Floryan Varennes",
    summary:
      "A speculative sanctuary responds to disappearing haenyeo traditions and an ocean transformed by ecological loss.",
    description:
      "Afterlifes begins with the imagined disappearance of the final generation of haenyeo, whose practice survives as a fragile memory amid rising water and depleted reefs.\n\nFloryan Varennes constructs a speculative sanctuary of floating sculpture, organic tapestry, sound, and silent performance, suspending the viewer between irretrievable loss and attempts at renewed connection.",
    previewImage: localExhibitionImage(
      "AFTERLIFES BY FLORYAN VARENNES",
      "photo_1_2026-05-23_20-54-59.jpg",
    ),
    heroImage: localExhibitionImage(
      "AFTERLIFES BY FLORYAN VARENNES",
      "photo_1_2026-05-23_20-54-59.jpg",
    ),
    images: numberedLocalExhibitionGallery(
      "AFTERLIFES BY FLORYAN VARENNES",
      "2026-05-23_20-54-59",
      13,
      "vertical",
      "#VillaBusan",
    ),
    instagramUrl: "https://www.instagram.com/p/DOyJtSDiC2z/",
  },
  {
    slug: "with-feathers-and-flesh",
    title: "WITH FEATHERS AND FLESH",
    subtitle: "PAULA GOGOLA AND HANNA ANTONSSON",
    venue: "Holešovická Šachta",
    gallery: "Holešovická Šachta",
    city: "Prague",
    country: "Czech Republic",
    year: "2025",
    dates: "03 September - 08 October 2025",
    artists: ["PAULA GOGOLA", "HANNA ANTONSSON"],
    curator: "Eva Slabá",
    photographer: "Jan Kolsky",
    summary:
      "Two practices meet through altered organic bodies, technological landscapes, and the transforming figure of the angel.",
    description:
      "The duo exhibition explores transformed organic bodies and the relationship between nature and technology. Hanna Antonsson's kinetic sculptures combine seagull wings and car parts, while Paula Gogola's paintings consider transfeminine identity through bodily modification and queer experience.\n\nThe figure of the angel connects the two practices: mechanical wing and transhuman figure become forms of resistance, transformation, and healing.",
    previewImage: localExhibitionImage(
      "WITH FEATHERS AND FLESH",
      "photo_1_2026-05-23_20-55-46.jpg",
    ),
    heroImage: localExhibitionImage(
      "WITH FEATHERS AND FLESH",
      "photo_1_2026-05-23_20-55-46.jpg",
    ),
    images: localExhibitionGallery(
      "WITH FEATHERS AND FLESH",
      [
        "photo_1_2026-05-23_20-55-46.jpg",
        "photo_2_2026-05-23_20-55-46.jpg",
        "photo_3_2026-05-23_20-55-46.jpg",
        "photo_4_2026-05-23_20-55-46.jpg",
        "photo_5_2026-05-23_20-55-46.jpg",
        "photo_6_2026-05-23_20-55-46.jpg",
        "photo_7_2026-05-23_20-55-46.jpg",
        "photo_8_2026-05-23_20-55-46.jpg",
        "photo_9_2026-05-23_20-55-46.jpg",
        "photo_10_2026-05-23_20-55-46.jpg",
        "photo_11_2026-05-23_20-55-46.jpg",
        "photo_12_2026-05-23_20-55-47.jpg",
      ],
      "vertical",
      "@jankolsky",
    ),
    instagramUrl: "https://www.instagram.com/p/DOqS56hiPv_/",
  },
  {
    slug: "just-about-and-never",
    title: "JUST ABOUT AND NEVER",
    subtitle: "CARL OTTO LINDE",
    venue: "SpLab",
    gallery: "SpLab",
    city: "Århus",
    country: "Denmark",
    year: "2025",
    dates: "30 May - 22 June 2025",
    artists: ["CARL OTTO LINDE"],
    photographer: "Carl Otto Linde",
    summary: "",
    description: "",
    previewImage: localExhibitionImage(
      "JUST ABOUT AND NEVER BY CARL OTTO LINDE",
      "photo_1_2026-05-23_20-56-19.jpg",
    ),
    heroImage: localExhibitionImage(
      "JUST ABOUT AND NEVER BY CARL OTTO LINDE",
      "photo_1_2026-05-23_20-56-19.jpg",
    ),
    images: numberedLocalExhibitionGallery(
      "JUST ABOUT AND NEVER BY CARL OTTO LINDE",
      "2026-05-23_20-56-19",
      9,
      "vertical",
      "@carlottolinde official Instagram",
    ),
    instagramUrl: "https://www.instagram.com/p/DOOEo6tiE68/",
  },
  {
    slug: "begone-estrone",
    title: "BEGONE ESTRONE",
    subtitle: "PAULA GOGOLA AND NATÁLIA SÝKOROVÁ",
    venue: "@medium_gallery",
    gallery: "@medium_gallery",
    city: "Bratislava",
    year: "2025",
    dates: "23 July - 31 August 2025",
    artists: ["PAULA GOGOLA", "NATÁLIA SÝKOROVÁ"],
    curator: "Zuzana Jakalová",
    photographer: "Isonative",
    exhibitionText: "Zuzana Jakalová",
    summary:
      "A collaborative environment considers female health, care, identity, and the bathroom as a contested private-public space.",
    description:
      "Begone Estrone brings together Paula Gogola and Natália Sýkorová through questions of personal identity, technological landscapes of female bodies, health, and care. Exhibition design and sound extend their practices into a shared environment.\n\nThe bathroom is approached as a space where public and private, ritual and everyday life, purity and contamination intersect, becoming a complex setting for power, identity, and survival.",
    previewImage: localExhibitionImage(
      "BEGONE ESTRONE BY PAULA GOGOLA AND NATÁLIA SÝKOROVÁ",
      "photo_1_2026-05-23_20-57-06.jpg",
    ),
    heroImage: localExhibitionImage(
      "BEGONE ESTRONE BY PAULA GOGOLA AND NATÁLIA SÝKOROVÁ",
      "photo_1_2026-05-23_20-57-06.jpg",
    ),
    images: numberedLocalExhibitionGallery(
      "BEGONE ESTRONE BY PAULA GOGOLA AND NATÁLIA SÝKOROVÁ",
      "2026-05-23_20-57-06",
      14,
      "vertical",
      "@_isonative",
    ),
    instagramUrl: "https://www.instagram.com/p/DOLM-4gCLE0/",
  },
  {
    slug: "the-last-drawer-on-the-left",
    title: "THE LAST DRAWER ON THE LEFT",
    subtitle: "PATRYCJA PŁÓCIENNIK",
    venue: "@przeciag_galeria",
    gallery: "@przeciag_galeria",
    city: "Warsaw",
    country: "Poland",
    year: "2025",
    dates: "06 June - 20 June 2025",
    artists: ["PATRYCJA PŁÓCIENNIK"],
    curator: "@przeciag_galeria",
    photographer: "Bartosz Górka",
    exhibitionText: "Tomasz Paszkowicz",
    summary:
      "An exhibition about home and memory in which fragile material presence reveals the labor of remembering.",
    description:
      "The exhibition turns toward home, time, and objects that carry memories of people no longer present. Its sculptural gestures remain subdued and fragile, gradually disclosing the care required to sustain what is fading.\n\nMemory becomes material and laborious: like an object repaired at the edge of endurance, it requires attention before it can be replaced by other things, people, or places.",
    previewImage: localExhibitionImage(
      "THE LAST DRAWER ON THE LEFT BY PATRYCJA PŁÓCIENNIK",
      "photo_1_2026-05-23_20-58-07.jpg",
    ),
    heroImage: localExhibitionImage(
      "THE LAST DRAWER ON THE LEFT BY PATRYCJA PŁÓCIENNIK",
      "photo_1_2026-05-23_20-58-07.jpg",
    ),
    images: numberedLocalExhibitionGallery(
      "THE LAST DRAWER ON THE LEFT BY PATRYCJA PŁÓCIENNIK",
      "2026-05-23_20-58-07",
      15,
      "vertical",
      "@bartos2gorka",
    ),
    instagramUrl: "https://www.instagram.com/p/DMYKwVxoZpk/",
  },
  {
    slug: "die-sprache-der-voegel",
    title: "DIE SPRACHE DER VÖGEL",
    subtitle: "ANNA BOCHKOVA AND ELIZA WAGENER",
    venue: "@westwerk_hamburg",
    gallery: "@westwerk_hamburg",
    city: "Hamburg",
    year: "2025",
    dates: "03 July - 13 July 2025",
    artists: ["ANNA BOCHKOVA", "ELIZA WAGENER"],
    photographer: "Florent Jalon Photographie",
    summary: "",
    description: "",
    previewImage: localExhibitionImage(
      "DIE SPRACHE DER VÖGEL BY ANNA BOCHKOVA AND ELIZA WAGENER",
      "photo_1_2026-05-23_20-58-39.jpg",
    ),
    heroImage: localExhibitionImage(
      "DIE SPRACHE DER VÖGEL BY ANNA BOCHKOVA AND ELIZA WAGENER",
      "photo_1_2026-05-23_20-58-39.jpg",
    ),
    images: numberedLocalExhibitionGallery(
      "DIE SPRACHE DER VÖGEL BY ANNA BOCHKOVA AND ELIZA WAGENER",
      "2026-05-23_20-58-39",
      12,
      "vertical",
      "@florentjalon",
    ),
    instagramUrl: "https://www.instagram.com/p/DMSyOB-oyQA/",
  },
  // LOCAL_IMAGE_METADATA_IMPORT_2_END
  // LOCAL_IMAGE_METADATA_IMPORT_3_START
  {
    slug: "green-growth",
    title: "GREEN GROWTH",
    subtitle: "STEINUNN ÖNNUDÓTTIR",
    venue: "@kuenstlerhaus.bethanien",
    gallery: "@kuenstlerhaus.bethanien",
    city: "Berlin",
    country: "Germany",
    year: "2025",
    dates: "10 April - 15 June 2025",
    startDate: "10 April 2025",
    endDate: "15 June 2025",
    postDate: "12 July 2025",
    dateSource: "exhibition",
    artists: ["STEINUNN ÖNNUDÓTTIR"],
    photographer: "@joanna__wilk",
    summary:
      "A site-specific installation explores the fragile balance between decay and growth through urban space, organic forms, and greenwashed expansion.",
    description:
      "In her exhibition at Künstlerhaus Bethanien, marking the end of her residency, Steinunn Önnudóttir creates a site-specific installation exploring the fragile balance between decay and growth. Engaging with the visual and material language of these processes, she reveals the subtle, often overlooked dynamics that shape urban space.\n\nAt the center of the installation stands a massive arch, scorched and imposing - its form evoking both industrial production and a romanticized natural landscape. Yet the illusion collapses: a large, uprooted tree-like sculpture lies on the ground, symbolizing the tension between organic growth and human interference.\n\nAlgae seem to rise along the walls like a painterly gesture, hovering between chance and control. The windows are veiled with a greenish film, blurring the outside view and merging architecture into the work - softening the division between interior and exterior space.\n\nÖnnudóttir treats the cycles of growth and decay as metaphors for confronting capitalist logic, which seeks to exploit nature while simultaneously taming it. Her installation critically reflects on Green Growth and Degrowth, revealing how the term green is increasingly used to mask expansionist agendas.",
    previewImage: localExhibitionImage(
      "GREEN GROWTH BY STEINUNN ÖNNUDÓTTIR",
      "photo_1_2026-05-24_00-05-20.jpg",
    ),
    heroImage: localExhibitionImage(
      "GREEN GROWTH BY STEINUNN ÖNNUDÓTTIR",
      "photo_1_2026-05-24_00-05-20.jpg",
    ),
    images: numberedLocalExhibitionGallery(
      "GREEN GROWTH BY STEINUNN ÖNNUDÓTTIR",
      "2026-05-24_00-05-20",
      10,
      "vertical",
      "@joanna__wilk",
    ),
    instagramUrl: "https://www.instagram.com/p/DMBHImeIQcM/",
  },
  {
    slug: "the-room-i",
    title: "THE ROOM I",
    subtitle: "HELENA PERMINGER",
    venue: "Ifö Center",
    gallery: "Ifö Center",
    country: "Sweden",
    year: "2025",
    dates: "17 May - 10 July 2025",
    startDate: "17 May 2025",
    endDate: "10 July 2025",
    postDate: "5 June 2025",
    dateSource: "exhibition",
    artists: ["HELENA PERMINGER"],
    photographer: "Helena Perminger",
    summary:
      "Hybrid objects form a fragmented world of dystopian narratives, fascination with the unexplored, and human vulnerability.",
    description:
      "Helena Hanna Perminger builds a fragmented world where hybrid objects speak of dystopian narratives, fascination with the unexplored, phobias of the natural and human vulnerability.\n\nWe humans are creatures of habit who are often drawn to what is familiar. When we encounter something we experience as new and perhaps incomprehensible, it takes courage and curiosity to engage with what we do not understand.\n\nObjects become archives of physical touching points in an exploration of the human need to control our environment. In the exhibition, the artist explores the human relationship to the natural world and emotional responses to the uncontrollable.",
    previewImage: localExhibitionImage(
      "THE ROOM I BY HELENA PERMINGER",
      "photo_1_2026-05-24_00-06-27.jpg",
    ),
    heroImage: localExhibitionImage(
      "THE ROOM I BY HELENA PERMINGER",
      "photo_1_2026-05-24_00-06-27.jpg",
    ),
    images: numberedLocalExhibitionGallery(
      "THE ROOM I BY HELENA PERMINGER",
      "2026-05-24_00-06-27",
      10,
      "vertical",
      "Helena Perminger",
    ),
    instagramUrl: "https://www.instagram.com/p/DKhHBujIBrg/",
  },
  {
    slug: "encuentro",
    title: "ENCUENTRO",
    subtitle: "ÁNGELA JIMÉNEZ DURÁN",
    venue: "@sagradamercancia",
    gallery: "@sagradamercancia",
    city: "Santiago",
    country: "Chile",
    year: "2025",
    dates: "2 May - 30 May 2025",
    startDate: "2 May 2025",
    endDate: "30 May 2025",
    postDate: "26 May 2025",
    dateSource: "exhibition",
    artists: ["ÁNGELA JIMÉNEZ DURÁN"],
    curator: "Sagrada Mercancía",
    photographer: "Felipe Ugalde",
    summary:
      "A gestational installation stages an uncanny serpentine presence and an encounter beyond anthropocentric recognition.",
    description:
      "Ángela's installation transforms the space into a gestational zone for an uncanny, serpentine presence seeking a threshold of encounter. This being resists categorization, remaining powerful precisely through its estrangement and ambiguity.\n\nThe process prioritizes listening and spatial attunement over rational control, rejecting the pursuit of recognition in favor of raw sensitivity. It embodies a sculptural attitude rooted in imagination, where creation emerges from a deep engagement with space and material.\n\nThe clay creature took shape through communal labor yet remains deeply tied to the artist's intimate, affective gestures. Through this, Ángela introduces the concept of geological fiction, merging matter's temporality with poetic speculation.\n\nThe installation stages a living encounter where humans become intruders, facing an invisible divide between the known and the otherworldly. What arises is a vibrational field that unsettles our systems of order, revealing the limitations of anthropocentric perception.",
    previewImage: localExhibitionImage(
      "ENCUENTRO BY ÁNGELA JIMÉNEZ DURÁN",
      "photo_1_2026-05-24_00-07-07.jpg",
    ),
    heroImage: localExhibitionImage(
      "ENCUENTRO BY ÁNGELA JIMÉNEZ DURÁN",
      "photo_1_2026-05-24_00-07-07.jpg",
    ),
    images: numberedLocalExhibitionGallery(
      "ENCUENTRO BY ÁNGELA JIMÉNEZ DURÁN",
      "2026-05-24_00-07-07",
      8,
      "vertical",
      "Felipe Ugalde",
    ),
    instagramUrl: "https://www.instagram.com/p/DKHOqsJoJRX/",
  },
  {
    slug: "luca",
    title: "LUCA",
    subtitle: "ANASTASIA KOMAR",
    venue: "@management.nyc",
    gallery: "@management.nyc",
    city: "New York",
    year: "2025",
    dates: "23 April - 1 June 2025",
    startDate: "23 April 2025",
    endDate: "1 June 2025",
    postDate: "4 May 2025",
    dateSource: "exhibition",
    artists: ["ANASTASIA KOMAR"],
    photographer: "#InnaSvyatsky",
    exhibitionText: "Maya Kotomori",
    summary:
      "An installation invokes the Last Universal Common Ancestor through biological memory, scent, sound, and energetic pulses.",
    description:
      "The exhibition explores the future of humanity through the archetype of its most ancient ancestor - the Last Universal Common Ancestor. The artist creates an installation that merges the organic and the non-organic, engaging sight, scent, and sound.\n\nAt the center is LUCA - a pre-linguistic entity, primordial yet not first, speaking in the voice of biological memory and energetic pulses. The space is filled with visual and sonic allusions to the emergence of life - not as a reconstruction, but as a visceral premonition.\n\nThe work is accompanied by a soundtrack composed by Kamron Saniee and a text by Maya Kotomori, deepening the meditative experience. LUCA appears not as a relic of the past, but as an eternal formula of becoming, embedded in our very being.",
    previewImage: localExhibitionImage(
      "LUCA BY ANASTASIA KOMAR",
      "photo_1_2026-05-24_00-08-13.jpg",
    ),
    heroImage: localExhibitionImage(
      "LUCA BY ANASTASIA KOMAR",
      "photo_1_2026-05-24_00-08-13.jpg",
    ),
    images: numberedLocalExhibitionGallery(
      "LUCA BY ANASTASIA KOMAR",
      "2026-05-24_00-08-13",
      11,
      "vertical",
      "#InnaSvyatsky",
    ),
    instagramUrl: "https://www.instagram.com/p/DJPGTVEo2SI/",
  },
  {
    slug: "vitals-vapors",
    title: "VITALS VAPORS",
    subtitle: "ADRIANO AMARAL",
    venue: "@kunstverein_arnsberg",
    gallery: "@kunstverein_arnsberg",
    city: "Arnsberg",
    country: "Germany",
    year: "2025",
    dates: "Until 8 June 2025",
    endDate: "8 June 2025",
    postDate: "29 April 2025",
    sortDate: "29 April 2025",
    dateSource: "instagram-post",
    artists: ["ADRIANO AMARAL"],
    curator: "Pauline Doutreluingne",
    photographer: "#MichelPtasinski",
    summary:
      "A sensory installation draws earth, fire, water, air, and synthetic materials into unstable hybrid forms.",
    description:
      "Part of SWAMPING program.\n\nAdriano Amaral's exhibition at Kunstverein Arnsberg explores the boundaries between the natural and artificial, the material and immaterial. The space is transformed into a sensory installation where the elements of earth, fire, water, and air interact with synthetic materials to create new hybrid forms.\n\nThe exhibition addresses symbolic transformation and the instability of meaning, inviting viewers into a shifting landscape where conventional perception dissolves. In the darkened room, with lava sand covering the floor and the outside world obscured, the artist constructs a layered metaphor for the complexities of the contemporary condition.",
    previewImage: localExhibitionImage(
      "VITALS VAPORS BY ADRIANO AMARAL",
      "photo_1_2026-05-24_00-09-19.jpg",
    ),
    heroImage: localExhibitionImage(
      "VITALS VAPORS BY ADRIANO AMARAL",
      "photo_1_2026-05-24_00-09-19.jpg",
    ),
    images: numberedLocalExhibitionGallery(
      "VITALS VAPORS BY ADRIANO AMARAL",
      "2026-05-24_00-09-19",
      6,
      "vertical",
      "#MichelPtasinski",
    ),
    instagramUrl: "https://www.instagram.com/p/DJCXAGEIZP1/",
  },
  {
    slug: "metal-memory",
    title: "METAL MEMORY",
    subtitle: "SOPHIA GATZKAN AND ALIONA CIOBANU",
    venue: "@limbo.contemporary",
    gallery: "@limbo.contemporary",
    city: "Milan",
    country: "Italy",
    year: "2025",
    dates: "16 April - 31 May 2025",
    startDate: "16 April 2025",
    endDate: "31 May 2025",
    postDate: "2 May 2025",
    dateSource: "exhibition",
    artists: ["SOPHIA GATZKAN", "ALIONA CIOBANU"],
    curator: "@eternaltadpole",
    photographer: "#OscarGiacomini",
    summary:
      "Non-normative bodies and technology become vessels for trauma, adaptation, healing, and transformation.",
    description:
      "The exhibition Metal Memory explores the physicality of non-normative bodies and their interaction with technology as a means of expressing trauma, adaptation, and healing. Aliona Ciobanu and Sophia Gatzkan treat the body as a vessel for meaning, vulnerability, and transformation.\n\nMaterial serves as a point of entry into questions of identity and social frameworks. Through metal, plastic, and digital forms, the artists expose the political and cultural codes that shape our perception of reality.",
    previewImage: localExhibitionImage(
      "METAL MEMORY BY SOPHIA GATZKAN AND ALIONA CIOBANU",
      "photo_1_2026-05-24_00-09-59.jpg",
    ),
    heroImage: localExhibitionImage(
      "METAL MEMORY BY SOPHIA GATZKAN AND ALIONA CIOBANU",
      "photo_1_2026-05-24_00-09-59.jpg",
    ),
    images: numberedLocalExhibitionGallery(
      "METAL MEMORY BY SOPHIA GATZKAN AND ALIONA CIOBANU",
      "2026-05-24_00-09-59",
      7,
      "vertical",
      "#OscarGiacomini",
    ),
    instagramUrl: "https://www.instagram.com/p/DJJp9FrIu9W/",
  },
  {
    slug: "distant-endless-hum",
    title: "DISTANT, ENDLESS HUM",
    subtitle: "NATÁLIA SÝKOROVÁ AND MILAN VAGAČ",
    venue: "@vunugallery",
    gallery: "@vunugallery",
    city: "Bratislava",
    year: "2025",
    dates: "23 April - 24 May 2025",
    startDate: "23 April 2025",
    endDate: "24 May 2025",
    postDate: "25 April 2025",
    dateSource: "exhibition",
    artists: ["NATÁLIA SÝKOROVÁ", "MILAN VAGAČ"],
    curator: "@michalstolarik",
    photographer: "@_isonative",
    summary:
      "Two distinct practices meet in hybrid situations and speculative environments with uncertain functions.",
    description:
      "The project brings together the works of Natalia Sýkorová and Milan Vagač for the first time in a shared dialogue. Their distinct artistic approaches converge in the creation of hybrid situations, where viewers encounter unfamiliar forms with uncertain functions.\n\nBoth artists construct imaginative environments and speculative narratives that challenge established perceptions of reality. Their works - comprising objects and paintings infused with abstract and geometric elements - reveal autonomous mechanisms unfolding between surface and space.",
    previewImage: localExhibitionImage(
      "DISTANT, ENDLESS HUM BY NATÁLIA SÝKOROVÁ AND MILAN VAGAČ",
      "photo_1_2026-05-24_00-11-11.jpg",
    ),
    heroImage: localExhibitionImage(
      "DISTANT, ENDLESS HUM BY NATÁLIA SÝKOROVÁ AND MILAN VAGAČ",
      "photo_1_2026-05-24_00-11-11.jpg",
    ),
    images: numberedLocalExhibitionGallery(
      "DISTANT, ENDLESS HUM BY NATÁLIA SÝKOROVÁ AND MILAN VAGAČ",
      "2026-05-24_00-11-11",
      5,
      "vertical",
      "@_isonative",
    ),
    instagramUrl: "https://www.instagram.com/p/DI3vMMgIPS2/",
  },
  // LOCAL_IMAGE_METADATA_IMPORT_3_END
  // LOCAL_IMAGE_METADATA_IMPORT_4_START
  {
    slug: "tissu-expanse",
    title: "TISSU EXPANSÉ",
    subtitle: "BRANDON MORRIS",
    venue: "@europa.nyc",
    gallery: "@europa.nyc",
    city: "Paris",
    country: "France",
    year: "2025",
    dates: "19 October - 30 October 2025",
    startDate: "19 October 2025",
    endDate: "30 October 2025",
    postDate: "23 October 2025",
    dateSource: "exhibition",
    artists: ["BRANDON MORRIS"],
    photographer: "@europa.nyc official Instagram",
    summary:
      "Five new Ghost Dresses use inflated resin-coated garments to move between fashion, sculpture, elegance, and unease.",
    description:
      "Tissu Expansé features five new Ghost Dresses produced while the artist was in residence in Paris. It marks his first solo exhibition in France. This new group of sculptures extends his ongoing material investigations: instead of shaping the garments around mannequins, he uses air as a structuring force.\n\nEach sewn form is coated in resin, then inflated. Through this process, Morris continues his exploration of the boundary between fashion and sculpture, transforming familiar materials into spectral forms that suggest both elegance and unease.\n\nMorris explores the transformative potential of everyday materials, inviting contemplation on the boundaries between art, fashion, and identity. His practice focuses on what he calls the object of the clothing itself, treating the dress as autonomous.",
    previewImage: localExhibitionImage(
      "TISSU EXPANSÉ BY BRANDON MORRIS",
      "photo_1_2026-05-24_00-36-15.jpg",
    ),
    heroImage: localExhibitionImage(
      "TISSU EXPANSÉ BY BRANDON MORRIS",
      "photo_1_2026-05-24_00-36-15.jpg",
    ),
    images: numberedLocalExhibitionGallery(
      "TISSU EXPANSÉ BY BRANDON MORRIS",
      "2026-05-24_00-36-15",
      9,
      "vertical",
      "@europa.nyc official Instagram",
    ),
    instagramUrl: "https://www.instagram.com/p/DQJr4rGAr3d/",
  },
  {
    slug: "sweet-garden-of-vanished-pleasures",
    title: "SWEET GARDEN OF VANISHED PLEASURES",
    subtitle: "LORENZO ZERBINI",
    venue: "dieAngewandte",
    gallery: "dieAngewandte",
    city: "Vienna",
    country: "Austria",
    year: "2025",
    dates: "18 March - 20 March 2025",
    startDate: "18 March 2025",
    endDate: "20 March 2025",
    postDate: "27 March 2025",
    dateSource: "exhibition",
    artists: ["LORENZO ZERBINI"],
    photographer: "Courtesy of the artist",
    summary:
      "The garden becomes a system of control in which the snail exposes the exclusions and violence hidden inside cultivated beauty.",
    description:
      "The exhibition explores the garden not as an idyllic space, but as a system of control and power. It reveals how gardens operate through boundaries, rules, and exclusions, determining who belongs and who is cast out.\n\nAt the center is the figure of the snail - a creature labeled as a pest following the rise of synthetic pesticides. Its marginalized position reflects the garden's aesthetic logic and its intolerance of otherness.\n\nGardening materials - pesticides, salt, slug rings - serve as metaphors for the hidden violence embedded in cultivation. They expose the contradiction between care and cruelty that sustains the garden's order.\n\nInstallations turn the garden's fence into a site of tension and poetic intervention. The exhibition invites us to reconsider who we label as pests, and what it costs to maintain beauty.",
    previewImage: localExhibitionImage(
      "SWEET GARDEN OF VANISHED PLEASURES BY LORENZO ZERBINI",
      "photo_1_2026-05-24_00-37-06.jpg",
    ),
    heroImage: localExhibitionImage(
      "SWEET GARDEN OF VANISHED PLEASURES BY LORENZO ZERBINI",
      "photo_1_2026-05-24_00-37-06.jpg",
    ),
    images: numberedLocalExhibitionGallery(
      "SWEET GARDEN OF VANISHED PLEASURES BY LORENZO ZERBINI",
      "2026-05-24_00-37-06",
      10,
      "vertical",
      "Courtesy of the artist",
    ),
    instagramUrl: "https://www.instagram.com/p/DHszg6foL8U/",
  },
  {
    slug: "lunar-ensemble-for-uprising-seas",
    title: "LUNAR ENSEMBLE FOR UPRISING SEAS",
    subtitle: "PETRIT HALILAJ AND ÁLVARO URBANO",
    venue: "@macba_barcelona",
    gallery: "@macba_barcelona",
    city: "Barcelona",
    country: "Spain",
    year: "2024-2025",
    dates: "11 October 2024 - 12 January 2025",
    startDate: "11 October 2024",
    endDate: "12 January 2025",
    postDate: "12 April 2025",
    dateSource: "exhibition",
    artists: ["PETRIT HALILAJ", "ÁLVARO URBANO"],
    photographer: "Dani Pujalte",
    summary:
      "Over forty hybrid beings become instruments in an intentionally dissonant ensemble about interspecies survival and belonging.",
    description:
      "The exhibition, inspired by the Spanish song Ay mi pescadito, explores themes of survival and belonging among diverse species navigating harmony and discord. It features over forty large-scale sculptures of fantastical hybrid beings that merge aquatic, terrestrial, and aerial traits.\n\nInstalled across the expansive three-floor atrium of MACBA, the sculptures vary in scale and offer imaginative visions of future evolutionary forms. Suspended above them, an egg-shaped sculpture symbolizes the cyclical nature of life and invites visitors to rethink possible futures.\n\nEach creature doubles as a musical instrument, producing sounds through music boxes and DIY mechanisms. Together, they attempt to form a melody inspired by Ay mi pescadito and underwater acoustics, creating an intentional dissonance that reflects the complexity of interspecies coexistence.",
    previewImage: localExhibitionImage(
      "LUNAR ENSEMBLE FOR UPRISING SEAS BY PETRIT HALILAJ AND ÁLVARO URBANO",
      "photo_1_2026-05-24_00-37-57.jpg",
    ),
    heroImage: localExhibitionImage(
      "LUNAR ENSEMBLE FOR UPRISING SEAS BY PETRIT HALILAJ AND ÁLVARO URBANO",
      "photo_1_2026-05-24_00-37-57.jpg",
    ),
    images: numberedLocalExhibitionGallery(
      "LUNAR ENSEMBLE FOR UPRISING SEAS BY PETRIT HALILAJ AND ÁLVARO URBANO",
      "2026-05-24_00-37-57",
      5,
      "vertical",
      "@danipujalte",
    ),
    instagramUrl: "https://www.instagram.com/p/DIWeUsDogFx/",
  },
  {
    slug: "tar-star",
    title: "TAR STAR",
    subtitle: "ALEKSANDRA VAJD AND ANETTA MONA CHIŞA",
    venue: "@cukrarna.art",
    gallery: "@cukrarna.art",
    city: "Ljubljana",
    country: "Slovenia",
    year: "2025",
    dates: "6 February - 6 April 2025",
    startDate: "6 February 2025",
    endDate: "6 April 2025",
    postDate: "3 April 2025",
    dateSource: "exhibition",
    artists: ["ALEKSANDRA VAJD", "ANETTA MONA CHIŞA"],
    curator: "Tjaša Pogačar",
    photographer: "Blaž Gutman / MGML",
    exhibitionText: "Tjaša Pogačar",
    summary:
      "Photography is recast as an ecological and technological relation among sunlight, bitumen, cables, matter, and time.",
    description:
      "The exhibition explores photography as a medium deeply embedded in ecological and technological processes. It is presented not just as an artistic practice, but as an interaction between light, matter, and time.\n\nAt its core is the Sun, both as an energy source and a force of transformation, with cables serving as a metaphor for global networks powering image culture. One of the main installation nodes features screens coated in bitumen, referencing heliography and reframing photography as a sun drawing.\n\nThe ceiling installation echoes solar maps and the history of computation, connecting weaving, programming, and cultural memory. Through metaphors of cables and snakes, the exhibition challenges the boundaries between nature and technology, human and non-human, offering an unfinished narrative for a post-human future.",
    previewImage: localExhibitionImage(
      "TAR STAR BY ALEKSANDRA VAJD AND ANETTA MONA CHIŞA",
      "photo_1_2026-05-24_00-38-43.jpg",
    ),
    heroImage: localExhibitionImage(
      "TAR STAR BY ALEKSANDRA VAJD AND ANETTA MONA CHIŞA",
      "photo_1_2026-05-24_00-38-43.jpg",
    ),
    images: numberedLocalExhibitionGallery(
      "TAR STAR BY ALEKSANDRA VAJD AND ANETTA MONA CHIŞA",
      "2026-05-24_00-38-43",
      11,
      "vertical",
      "Blaž Gutman / MGML",
    ),
    instagramUrl: "https://www.instagram.com/p/DH_x11Io4cj/",
  },
  {
    slug: "down-the-rabbit-hole-2024",
    title: "DOWN THE RABBIT HOLE, 2024",
    venue: "@halle_nord_geneve",
    gallery: "@halle_nord_geneve",
    city: "Geneva",
    country: "Switzerland",
    year: "2024",
    dates: "17 October - 9 November 2024",
    startDate: "17 October 2024",
    endDate: "9 November 2024",
    postDate: "17 March 2025",
    dateSource: "exhibition",
    artists: ["MARLÈNE CHARPENTIÉ", "@thesoftnesss"],
    photographer: "@thomas_maisonnasse",
    exhibitionText: "Cassiane C. Pfund",
    summary: "",
    description:
      "Artists: Marlène Charpentié and @thesoftnesss.\n\nExhibition documentation from Halle Nord, Geneva, Switzerland, 17 October - 9 November 2024.",
    previewImage: localExhibitionImage(
      "DOWN THE RABBIT HOLE, 2024",
      "photo_1_2026-05-24_00-40-02.jpg",
    ),
    heroImage: localExhibitionImage(
      "DOWN THE RABBIT HOLE, 2024",
      "photo_1_2026-05-24_00-40-02.jpg",
    ),
    images: numberedLocalExhibitionGallery(
      "DOWN THE RABBIT HOLE, 2024",
      "2026-05-24_00-40-02",
      5,
      "vertical",
      "@thomas_maisonnasse",
    ),
    instagramUrl: "https://www.instagram.com/p/DHSqprQIgpU/",
  },
  {
    slug: "tipping-point-phantoms",
    title: "TIPPING POINT PHANTOMS",
    subtitle: "VIK BAYER AND KAJA CLARA JOO",
    venue: "Künstlerinnenvereinigung Tirol",
    gallery: "Künstlerinnenvereinigung Tirol",
    city: "Innsbruck",
    country: "Austria",
    year: "2025",
    dates: "10 January - 31 January 2025",
    startDate: "10 January 2025",
    endDate: "31 January 2025",
    postDate: "24 March 2025",
    dateSource: "exhibition",
    artists: ["VIK BAYER", "KAJA CLARA JOO"],
    curator: "@bettina.siegele",
    photographer: "Daniel Grabosch, Kaja Clara Joo, WEST. Fotostudio",
    summary:
      "A dialogue on capitalism, sustainability, technology, nature, and society at ecological tipping points.",
    description:
      "The exhibition is a dialogue between artists Vik Bayer and Kaja Clara Joo, exploring capitalism, sustainability, and the limits of resource use. Through contrasting aesthetics and methods, the artists reflect on the interdependence of technology, nature, and society in times of ecological tipping points.\n\nVik Bayer investigates agriculture as a form of resistance to extractivist economies, drawing from experiences with Sicilian farmers and transforming these into video and text-based installations. Their work questions how climate crises reshape storytelling and collective action.\n\nKaja Clara Joo creates spatial sculptures that explore the boundaries between the physical, social, and political. Her projects highlight cultural patterns and human intervention in ecosystems, turning the exhibition space into a stage for ecological and ethical reflection.",
    previewImage: localExhibitionImage(
      "TIPPINT POINT PHANTOMS BY VIK BAYER AND KAJA CLARA JOO",
      "photo_1_2026-05-24_00-40-56.jpg",
    ),
    heroImage: localExhibitionImage(
      "TIPPINT POINT PHANTOMS BY VIK BAYER AND KAJA CLARA JOO",
      "photo_1_2026-05-24_00-40-56.jpg",
    ),
    images: numberedLocalExhibitionGallery(
      "TIPPINT POINT PHANTOMS BY VIK BAYER AND KAJA CLARA JOO",
      "2026-05-24_00-40-56",
      8,
      "vertical",
      "Daniel Grabosch, Kaja Clara Joo, WEST. Fotostudio",
    ),
    instagramUrl: "https://www.instagram.com/p/DHld-mVIS2r/",
  },
  {
    slug: "the-neoliberal-urge-to-curate-a-friendsgroup",
    title: "THE NEOLIBERAL URGE TO CURATE A FRIENDSGROUP",
    subtitle: "GROUP SHOW",
    venue: "ACUD Galerie",
    gallery: "ACUD Galerie",
    city: "Berlin",
    country: "Germany",
    year: "2025",
    dates: "28 February - 23 March 2025",
    startDate: "28 February 2025",
    endDate: "23 March 2025",
    postDate: "13 March 2025",
    dateSource: "exhibition",
    artists: [
      "Sarah Rosemarie Albrecht",
      "Oliver Bleckmann",
      "Manuel Cornelius",
      "Sophia Gatzkan",
      "Jill Kiddon",
      "Luka Naujoks",
      "Johannes Thiel",
    ],
    curator: "@johannesthl, @lukanaujoks",
    photographer: "Luka Naujoks",
    summary:
      "Social relationships are examined as curated, strategic structures shaped by self-promotion and calculated personal value.",
    description:
      "The exhibition examines the strategic nature of social relationships, where friendships are increasingly shaped by self-interest and calculated value. It reflects a culture of self-promotion and social optimization, where connections are curated based on personal gain.",
    previewImage: localExhibitionImage(
      "THE NEOLIBERAL URGE TO CURATE A FRIENDSGROUP (GROUP SHOW)",
      "photo_1_2026-05-24_00-41-28.jpg",
    ),
    heroImage: localExhibitionImage(
      "THE NEOLIBERAL URGE TO CURATE A FRIENDSGROUP (GROUP SHOW)",
      "photo_1_2026-05-24_00-41-28.jpg",
    ),
    images: numberedLocalExhibitionGallery(
      "THE NEOLIBERAL URGE TO CURATE A FRIENDSGROUP (GROUP SHOW)",
      "2026-05-24_00-41-28",
      7,
      "vertical",
      "@lukanaujoks",
    ),
    instagramUrl: "https://www.instagram.com/p/DHJlyFCI1oX/",
  },
  {
    slug: "falene",
    title: "FALENE",
    subtitle: "GROUP SHOW",
    venue: "@limbo.contemporary",
    gallery: "@limbo.contemporary",
    city: "Milan",
    year: "2025",
    dates: "Until 5 April 2025",
    endDate: "5 April 2025",
    postDate: "12 March 2025",
    sortDate: "12 March 2025",
    dateSource: "instagram-post",
    artists: ["LUDOVICA ANVERSA", "FEDERICO ARANI", "LEILEI WU"],
    curator: "@eternaltadpole",
    photographer: "#OscarGiacomini",
    summary:
      "A group show explores a liminal creature shaped by metamorphosis and poised between day and night.",
    description:
      "The exhibition explores the enigmatic nature of this liminal creature - born through metamorphosis and existing between day and night - unveiling its evolving identity and spirit of experimentation through the works of Ludovica Anversa, Federico Arani, and Leilei Wu.",
    previewImage: localExhibitionImage(
      "FALENE (GROUP SHOW)",
      "photo_1_2026-05-24_00-42-04.jpg",
    ),
    heroImage: localExhibitionImage(
      "FALENE (GROUP SHOW)",
      "photo_1_2026-05-24_00-42-04.jpg",
    ),
    images: numberedLocalExhibitionGallery(
      "FALENE (GROUP SHOW)",
      "2026-05-24_00-42-04",
      7,
      "vertical",
      "#OscarGiacomini",
    ),
    instagramUrl: "https://www.instagram.com/p/DHGLxzToxGe/",
  },
  {
    slug: "farm",
    title: "FARM",
    subtitle: "LEE CHUNKOOK",
    venue: "Bio Gallery",
    gallery: "Bio Gallery",
    city: "Jung-gu, Seoul",
    country: "South Korea",
    year: "2025",
    dates: "31 January - 8 March 2025",
    startDate: "31 January 2025",
    endDate: "8 March 2025",
    postDate: "4 March 2025",
    dateSource: "exhibition",
    artists: ["LEE CHUNKOOK"],
    photographer: "Bio Gallery",
    exhibitionText: "Jihee Yun",
    summary:
      "Cicada exuviae, natural motifs, and sculptural imagery become mediators for time, transformation, and absent pasts.",
    description:
      "The cicada's exuviae, through the biological event of molting, encapsulates traces of time and change while symbolizing an absent past - the cicada nymph. Sculptures that prominently feature such imagery function as mediators that evoke the viewer's imagination, going beyond mere representation of reality.\n\nBy incorporating patterns and motifs derived from nature as decorative elements, these works evoke a sense of magical imagination while remaining closely tied to everyday life. This approach transcends mere physical resemblance, anchoring the polysemous chain of meanings that float within the image. In the fusion of sculpture and imagery, new meanings are created.",
    previewImage: localExhibitionImage(
      "FARM BY LEE CHUNKOOK",
      "photo_1_2026-05-24_00-43-01.jpg",
    ),
    heroImage: localExhibitionImage(
      "FARM BY LEE CHUNKOOK",
      "photo_1_2026-05-24_00-43-01.jpg",
    ),
    images: numberedLocalExhibitionGallery(
      "FARM BY LEE CHUNKOOK",
      "2026-05-24_00-43-01",
      14,
      "vertical",
      "@biogalleryseoul Official Instagram",
    ),
    instagramUrl: "https://www.instagram.com/p/DGztRAwIswG/",
  },
  {
    slug: "dialects-of-the-deep",
    title: "DIALECTS OF THE DEEP",
    subtitle: "ANASTASIA SAVINOVA",
    venue: "Bonniers Konsthall",
    gallery: "Bonniers Konsthall",
    city: "Stockholm",
    year: "2024-2025",
    dates: "11 December 2024 - 19 January 2025",
    startDate: "11 December 2024",
    endDate: "19 January 2025",
    postDate: "16 February 2025",
    dateSource: "exhibition",
    artists: ["ANASTASIA SAVINOVA"],
    curator: "@yuvinka",
    photographer: "#JeanBaptisteBéranger and the artist",
    summary:
      "Found maritime materials and underwater sound disclose the beauty and vulnerability of an endangered cod ecosystem.",
    description:
      "As part of Maria Bonnier Dahlin Foundation Grant.\n\nAnastasia Savinova explores humanity's deep connection with nature by combining natural and industrial materials to create a dialogue between the organic and the constructed. Her art highlights the delicate balance of ecosystems in a time of ecological crisis and focuses on co-existence, where different life forms and materials intertwine to express both fragility and beauty.\n\nIn Dialects of the Deep, Savinova explores the relationship between humans and the sea, focusing on the endangered cod ecosystem. Using found materials such as old fishing boats and glass floats, she creates sculptures that resemble fish bodies and fish eggs. The installation combines sculpture and sound to provide an immersive experience, highlighting the otherwise invisible sounds of the underwater world.\n\nThe work is made in collaboration with sound artist John Andrew Wilhite and marine biologist Rebekah Oomen.",
    previewImage: localExhibitionImage(
      "DIALECTS OF THE DEEP BY ANASTASIA SAVINOVA",
      "photo_1_2026-05-24_00-43-40.jpg",
    ),
    heroImage: localExhibitionImage(
      "DIALECTS OF THE DEEP BY ANASTASIA SAVINOVA",
      "photo_1_2026-05-24_00-43-40.jpg",
    ),
    images: numberedLocalExhibitionGallery(
      "DIALECTS OF THE DEEP BY ANASTASIA SAVINOVA",
      "2026-05-24_00-43-40",
      7,
      "vertical",
      "#JeanBaptisteBéranger and the artist",
    ),
    instagramUrl: "https://www.instagram.com/p/DGIVlkho-B8/",
  },
  {
    slug: "deep-sea-fish",
    title: "DEEP SEA FISH",
    subtitle: "AHN TAEWON",
    venue: "Diesel Art Gallery",
    gallery: "Diesel Art Gallery",
    country: "Japan",
    year: "2025",
    dates: "25 January - 16 April 2025",
    startDate: "25 January 2025",
    endDate: "16 April 2025",
    postDate: "2 February 2025",
    dateSource: "exhibition",
    artists: ["AHN TAEWON"],
    curator: "@con_tokyo_",
    photographer: "Diesel Japan",
    summary:
      "Flat and dimensional figures link deep-sea adaptation to human perception distorted by prolonged screen exposure.",
    description:
      "Seoul-based artist Ahn Taewon presents his solo debut in Japan with Deep Sea Fish at Diesel Art Gallery in Tokyo. Curated by CON_, the exhibition explores shifts in perception, drawing a parallel between the deteriorating vision of deep-sea fish living in extreme conditions and humans who spend hours staring at screens.\n\nAhn's figures appear both flat and dimensional, blurring the boundaries between the virtual and the real. The gallery notes that only by turning off the screen can we regain our senses: the face that emerges from the pitch-black screen may reveal what reality truly is.",
    previewImage: localExhibitionImage(
      "DEEP SEA FISH BY AHN TAEWON",
      "photo_1_2026-05-24_00-44-15.jpg",
    ),
    heroImage: localExhibitionImage(
      "DEEP SEA FISH BY AHN TAEWON",
      "photo_1_2026-05-24_00-44-15.jpg",
    ),
    images: localExhibitionGallery(
      "DEEP SEA FISH BY AHN TAEWON",
      [
        "photo_1_2026-05-24_00-44-15.jpg",
        "photo_2_2026-05-24_00-43-40.jpg",
        "photo_2_2026-05-24_00-44-15.jpg",
        "photo_3_2026-05-24_00-43-40.jpg",
        "photo_3_2026-05-24_00-44-15.jpg",
        "photo_4_2026-05-24_00-43-40.jpg",
        "photo_4_2026-05-24_00-44-15.jpg",
        "photo_5_2026-05-24_00-43-40.jpg",
        "photo_5_2026-05-24_00-44-15.jpg",
        "photo_6_2026-05-24_00-43-40.jpg",
        "photo_6_2026-05-24_00-44-15.jpg",
        "photo_7_2026-05-24_00-43-40.jpg",
        "photo_7_2026-05-24_00-44-16.jpg",
        "photo_8_2026-05-24_00-44-16.jpg",
        "photo_9_2026-05-24_00-44-16.jpg",
        "photo_10_2026-05-24_00-44-16.jpg",
        "photo_11_2026-05-24_00-44-16.jpg",
        "photo_12_2026-05-24_00-44-16.jpg",
        "photo_13_2026-05-24_00-44-16.jpg",
      ],
      "vertical",
      "Diesel Japan",
    ),
    instagramUrl: "https://www.instagram.com/p/DFkvl8QI7Gm/",
  },
  {
    slug: "limo",
    title: "LIMO",
    subtitle: "ÁNGELA LEYVA",
    venue: "The Split Gallery",
    gallery: "The Split Gallery",
    city: "London",
    country: "United Kingdom",
    year: "2024",
    dates: "21 November - 1 December 2024",
    startDate: "21 November 2024",
    endDate: "1 December 2024",
    postDate: "5 December 2024",
    dateSource: "exhibition",
    artists: ["ÁNGELA LEYVA"],
    curator: "Alí Cotero",
    photographer: "Courtesy of the artist",
    summary:
      "Painting and machine learning generate distorted faces that question identity, memory, and human-artificial boundaries.",
    description:
      "Ángela Leyva's current work is a profound exploration of identity and memory, notably illustrated through her emotional portrayals of distorted faces belonging to patients with congenital disorders. By integrating artificial intelligence technologies, she challenges viewers to reflect on the nature of existence and the blurred lines between human and artificial constructs.\n\nUtilizing a mixed technique that combines painting and machine learning, Leyva creates characters that provoke critical inquiry into the complexity of human experiences. This hybrid approach facilitates a dialogue on identity, revealing how the real and virtual realms intertwine in a perpetually evolving context.",
    previewImage: localExhibitionImage(
      "LIMO BY ÁNGELA LEYVA",
      "photo_1_2026-05-24_00-45-08.jpg",
    ),
    heroImage: localExhibitionImage(
      "LIMO BY ÁNGELA LEYVA",
      "photo_1_2026-05-24_00-45-08.jpg",
    ),
    images: numberedLocalExhibitionGallery(
      "LIMO BY ÁNGELA LEYVA",
      "2026-05-24_00-45-08",
      6,
      "vertical",
      "Courtesy of the artist",
    ),
    instagramUrl: "https://www.instagram.com/p/DDNexWmoyYI/",
  },
  {
    slug: "petrichor",
    title: "PETRICHOR",
    subtitle: "ŠÁRKA KOUDELOVÁ",
    venue: "Prám",
    gallery: "Prám",
    city: "Prague",
    year: "2024",
    dates: "5 November - 26 November 2024",
    startDate: "5 November 2024",
    endDate: "26 November 2024",
    postDate: "19 November 2024",
    dateSource: "exhibition",
    artists: ["ŠÁRKA KOUDELOVÁ"],
    curator: "edita.malina, @_svetlana_malina_",
    photographer: "@annapleslovaphotography",
    summary:
      "Stone, salt, rain, and scent become a living memory of geological processes shared with the human body.",
    description:
      "A scent that is layered, sedimented, and timeless serves as a reminder of long-buried processes, of imprints that reside within stones and continue to breathe. The earth's skeleton, a solid space wrapped in a mineral shell, cradles all that is fragile, while also allowing for release, escape, and entry through a delicate osmosis between stone and the elements that seep in and out.\n\nThis activation reveals a living memory of salt, as minerals remain still and prepared until awakened by the initial touch of rain. With each drop, a familiar scent emerges, faint yet powerful enough to activate our primal senses, resonating with the very minerals and salts that compose our own bodies.\n\nPetrichor embodies the earth's silent confession of existence, an ancient scent that speaks without words. It communicates that earth, stone, and salt are perpetually alive and present.",
    previewImage: localExhibitionImage(
      "PETRICHOR BY ŠÁRKA KOUDELOVÁ",
      "photo_1_2026-05-24_00-45-45.jpg",
    ),
    heroImage: localExhibitionImage(
      "PETRICHOR BY ŠÁRKA KOUDELOVÁ",
      "photo_1_2026-05-24_00-45-45.jpg",
    ),
    images: numberedLocalExhibitionGallery(
      "PETRICHOR BY ŠÁRKA KOUDELOVÁ",
      "2026-05-24_00-45-45",
      10,
      "vertical",
      "@annapleslovaphotography",
    ),
    instagramUrl: "https://www.instagram.com/p/DCj6r7KIYvX/",
  },
  {
    slug: "eutrophy",
    title: "EUTROPHY",
    subtitle: "ADAM MARTYNIAK",
    venue: "Bulvary",
    gallery: "Bulvary",
    city: "Wroclaw",
    country: "Poland",
    year: "2024",
    dates: "25 October - 28 October 2024",
    startDate: "25 October 2024",
    endDate: "28 October 2024",
    postDate: "14 November 2024",
    dateSource: "exhibition",
    artists: ["ADAM MARTYNIAK"],
    summary:
      "Paintings and tire-based objects consider eutrophic overgrowth, abject matter, and non-human material movement.",
    description:
      "Eutrophy represents a transition to a state of high fertility within a lake, marked by an increase in biomass productivity. As oxygen levels deplete, aquatic life faces mortality, contributing to the eventual overgrowth of the lake's ecosystem.\n\nWithin this context, the artist's cycle of paintings and tire-based objects delves into the enigmatic concepts of non-place, non-presence, and timelessness that lie beneath the metaphorical sludge. His work illustrates the movement of matter as it shifts in and out of human-centric perspectives.\n\nThe exhibition intertwines various themes, particularly through discarded tires, which epitomize the dynamics of abject matter. Drawing from Julia Kristeva's concept of the abject, Martyniak engages with the linguistic limitations that shape our comprehension of non-human phenomena.",
    previewImage: localExhibitionImage(
      "EUTROPHY BY ADAM MARTYNIAK",
      "photo_1_2026-05-24_00-46-31.jpg",
    ),
    heroImage: localExhibitionImage(
      "EUTROPHY BY ADAM MARTYNIAK",
      "photo_1_2026-05-24_00-46-31.jpg",
    ),
    images: numberedLocalExhibitionGallery(
      "EUTROPHY BY ADAM MARTYNIAK",
      "2026-05-24_00-46-31",
      14,
    ),
    instagramUrl: "https://www.instagram.com/p/DCWe8gmoOV-/",
  },
  {
    slug: "total-internal-reflection",
    title: "TOTAL INTERNAL REFLECTION",
    subtitle: "KIM FARKAS",
    venue: "@zerui.g",
    gallery: "@zerui.g",
    city: "London",
    country: "United Kingdom",
    year: "2024",
    dates: "10 October - 9 November 2024",
    startDate: "10 October 2024",
    endDate: "9 November 2024",
    postDate: "12 November 2024",
    dateSource: "exhibition",
    artists: ["KIM FARKAS"],
    photographer: "Zerui G and ZÉRUÌ",
    summary:
      "Cultural transmission, diasporic identity, ritual, and joss paper unfold through reflective digital photomontage.",
    description:
      "Farkas' works delve into the complexities of cultural identity, particularly for those straddling multiple heritages. The philosopher Byung-Chul Han's perspective on rituals - describing them as techniques for inhabiting time - resonates in Farkas' exploration of how diasporic identities navigate cultural transmission through embodied practices.\n\nThe theme of liminality continues in photomontages incorporating joss papers, representing exchanges between the living and the dead. By transforming these symbols into a dialogue on modernity and ritual through digital collage, Farkas captures cultural artifacts that embody both spiritual significance and material desire.",
    previewImage: localExhibitionImage(
      "«Total Internal Reflection»",
      "photo_1_2026-05-24_00-47-11.jpg",
    ),
    heroImage: localExhibitionImage(
      "«Total Internal Reflection»",
      "photo_1_2026-05-24_00-47-11.jpg",
    ),
    images: numberedLocalExhibitionGallery(
      "«Total Internal Reflection»",
      "2026-05-24_00-47-11",
      10,
      "vertical",
      "The artist and ZÉRUÌ, London",
    ),
    instagramUrl: "https://www.instagram.com/p/DCRK1-FI0u7/",
  },
  {
    slug: "human-is",
    title: "HUMAN IS",
    subtitle: "GROUP EXHIBITION",
    venue: "Schinkel Pavillion",
    gallery: "Schinkel Pavillion",
    city: "Berlin",
    country: "Germany",
    year: "2023",
    dates: "2023",
    postDate: "13 October 2024",
    sortDate: "13 October 2024",
    dateSource: "instagram-post",
    artists: [
      "JOACHIM BANDAU",
      "IVANA BAŠIĆ",
      "EYEC HENG",
      "DAVID CRONENBERG",
      "MATTHEW ANGELO HARRISON",
      "TISHAN HSU",
      "LAIKA",
      "FRITZ LANG",
      "MIKE KELLEY",
      "ALEXANDER KLUGE",
      "TETSUMI KUDO",
      "SUZANNE TREISTER",
      "WANGSHUI",
    ],
    curator: "Nina Pohl, Franziska Sophie Wilde Foerster",
    photographer: "Frank Sperling",
    summary:
      "Science fiction frames the collapsing boundary between dystopia and reality amid technological and ecological upheavals.",
    description:
      "The distinctions between dystopia and reality are collapsing amidst technological and ecological upheavals. Human Is delves into science fiction as a vehicle for exploring alternative future horizons and challenging the notion of being human.\n\nSince the 19th century, science fiction has served as a mirror to the contemporary human condition, reflecting fears and constraints in the face of supposed external threats. This challenges the traditional centrality of the human protagonist, offering a vision of interdependence with non-human forces.\n\nThe exhibition portrays a polyphonic view of the interplay between human and non-human forces, addressing violent interdependence and transcending binary oppositions. It seeks to transgress the humanistic unity of the subject and uncover power hierarchies that have historically dehumanized others.",
    previewImage: localExhibitionImage(
      "HUMAN IS (GROUP EXHIBITION)",
      "photo_1_2026-05-24_00-47-49.jpg",
    ),
    heroImage: localExhibitionImage(
      "HUMAN IS (GROUP EXHIBITION)",
      "photo_1_2026-05-24_00-47-49.jpg",
    ),
    images: numberedLocalExhibitionGallery(
      "HUMAN IS (GROUP EXHIBITION)",
      "2026-05-24_00-47-49",
      10,
      "vertical",
      "Frank Sperling",
    ),
    instagramUrl: "https://www.instagram.com/p/DBEjKjxIKee/",
  },
  {
    slug: "skeletal-scenes",
    title: "SKELETAL SCENES",
    venue: "Ani Molnár Gallery",
    gallery: "Ani Molnár Gallery",
    city: "Budapest",
    country: "Hungary",
    year: "2024",
    dates: "12 July - 4 August 2024",
    startDate: "12 July 2024",
    endDate: "4 August 2024",
    postDate: "7 September 2024",
    dateSource: "exhibition",
    artists: ["Mónika Üveges"],
    curator: "Fülöp Tímea",
    photographer: "@drap_korp",
    summary: "",
    description:
      "By @monikauveges. Curated by @fuloptimi_. Exhibition documentation from @amprojects_byanimolnar, Budapest, Hungary, 12 July - 4 August 2024.",
    previewImage: localExhibitionImage(
      "«Skeletal Scenes»",
      "photo_1_2026-05-24_00-48-21.jpg",
    ),
    heroImage: localExhibitionImage(
      "«Skeletal Scenes»",
      "photo_1_2026-05-24_00-48-21.jpg",
    ),
    images: numberedLocalExhibitionGallery(
      "«Skeletal Scenes»",
      "2026-05-24_00-48-21",
      8,
      "vertical",
      "@drap_korp",
    ),
    instagramUrl: "https://www.instagram.com/p/C_nH6R4IcYn/",
  },
  {
    slug: "keteros",
    title: "KETEROS",
    venue: "@meduza.fyi",
    gallery: "@meduza.fyi",
    city: "Vilnius",
    country: "Lithuania",
    year: "2024",
    dates: "23 May - 29 June 2024",
    startDate: "23 May 2024",
    endDate: "29 June 2024",
    postDate: "4 September 2024",
    dateSource: "exhibition",
    artists: ["@emmabang", "@electaordinaaria", "@monika_januleviciute", "@u_herself"],
    photographer: "@laurynas.skeisgiela",
    summary: "",
    description:
      "By @emmabang, @electaordinaaria, @monika_januleviciute and @u_herself. Exhibition documentation from @meduza.fyi, Vilnius, Lithuania, 23 May - 29 June 2024.",
    previewImage: localExhibitionImage(
      "«Keteros»",
      "photo_1_2026-05-24_00-49-07.jpg",
    ),
    heroImage: localExhibitionImage(
      "«Keteros»",
      "photo_1_2026-05-24_00-49-07.jpg",
    ),
    images: numberedLocalExhibitionGallery(
      "«Keteros»",
      "2026-05-24_00-49-07",
      10,
      "vertical",
      "@laurynas.skeisgiela",
    ),
    instagramUrl: "https://www.instagram.com/p/C_fiwuvIMoT/",
  },
  {
    slug: "enter-woodland-spirits",
    title: "ENTER WOODLAND SPIRITS",
    venue: "Estonian Literary Museum and the University of Tartu Natural History Museum",
    gallery: "Estonian Literary Museum and the University of Tartu Natural History Museum",
    city: "Tartu",
    country: "Estonia",
    year: "2024",
    dates: "August 2024",
    postDate: "2 September 2024",
    dateSource: "exhibition",
    artists: [
      "@di_official_sa",
      "@overload_fail_system",
      "@oskarkoliander",
      "@closest_relatives",
      "@ingrid_torvund",
      "@jonasmailand",
      "@hans.rosenstrom",
    ],
    curator: "Henri Hütt and Evelyn Raudsepp",
    photographer: "Taavi Piibemann",
    summary: "",
    description:
      "Exhibition documentation from the Estonian Literary Museum and the University of Tartu Natural History Museum, Tartu, August 2024. Curated by @henrihytt and @evelynraudsepp.",
    previewImage: localExhibitionImage(
      "«Enter Woodland Spirits»",
      "photo_1_2026-05-24_00-49-31.jpg",
    ),
    heroImage: localExhibitionImage(
      "«Enter Woodland Spirits»",
      "photo_1_2026-05-24_00-49-31.jpg",
    ),
    images: numberedLocalExhibitionGallery(
      "«Enter Woodland Spirits»",
      "2026-05-24_00-49-31",
      8,
      "vertical",
      "Taavi Piibemann",
    ),
    instagramUrl: "https://www.instagram.com/p/C_asrg0osOS/",
  },
  {
    slug: "contempt",
    title: "CONTEMPT",
    venue: "Capsule Shanghai",
    gallery: "Capsule Shanghai",
    city: "Shanghai",
    country: "China",
    year: "2024",
    dates: "14 August - 26 October 2024",
    startDate: "14 August 2024",
    endDate: "26 October 2024",
    postDate: "25 August 2024",
    dateSource: "exhibition",
    artists: ["Elizabeth Jaeger"],
    summary: "",
    description:
      "By @elizabethjaeger. Exhibition documentation from @capsuleshanghai, Shanghai, China, 14 August - 26 October 2024.",
    previewImage: localExhibitionImage(
      "«Contempt»",
      "photo_1_2026-05-24_00-50-26.jpg",
    ),
    heroImage: localExhibitionImage(
      "«Contempt»",
      "photo_1_2026-05-24_00-50-26.jpg",
    ),
    images: numberedLocalExhibitionGallery(
      "«Contempt»",
      "2026-05-24_00-50-26",
      10,
    ),
    instagramUrl: "https://www.instagram.com/p/C_H1QriI720/",
  },
  {
    slug: "the-worm-at-the-core",
    title: "THE WORM AT THE CORE",
    subtitle: "GROUP SHOW",
    venue: "SET",
    gallery: "SET",
    year: "2023",
    dates: "22 October - 13 November 2023",
    startDate: "22 October 2023",
    endDate: "13 November 2023",
    postDate: "31 July 2024",
    dateSource: "exhibition",
    artists: [
      "Conor Ackhurst",
      "Laura Benson",
      "Asclegg",
      "James Davison",
      "Marc-Aurèle Debut",
      "Cristiano Di Martino",
      "Ali Glover",
    ],
    curator: "Cristiano Di Martino, Conor Ackhurst",
    summary: "",
    description:
      "Group exhibition documentation from @setsetsetsetsetset, featuring works by @conor_ackhurst, @laurarbenson, @asclegg, @jamesdavisonstudio, @marcaureledebut, @cristianodmartino, @aliglover_ and additional participating artists.",
    previewImage: localExhibitionImage(
      "«The Worm at the Core» (group show)",
      "photo_1_2026-05-24_00-50-58.jpg",
    ),
    heroImage: localExhibitionImage(
      "«The Worm at the Core» (group show)",
      "photo_1_2026-05-24_00-50-58.jpg",
    ),
    images: numberedLocalExhibitionGallery(
      "«The Worm at the Core» (group show)",
      "2026-05-24_00-50-58",
      10,
    ),
    instagramUrl: "https://www.instagram.com/p/C-GKCououUJ/",
  },
  {
    slug: "a-certain-instance-of-verrition",
    title: "A CERTAIN INSTANCE OF VERRITION",
    venue: "Leal Rios Foundation",
    gallery: "Leal Rios Foundation",
    city: "Lisboa",
    country: "Portugal",
    year: "2023",
    dates: "19 May - 28 October 2023",
    startDate: "19 May 2023",
    endDate: "28 October 2023",
    postDate: "23 July 2024",
    dateSource: "exhibition",
    artists: [
      "Manuela Sedmach",
      "Marcelo Moscheta",
      "Paulo Arraiano",
      "Pedro Vaz",
      "Collective Of Two",
    ],
    curator: "@camila_maissune",
    summary: "",
    description:
      "Exhibition documentation from Leal Rios Foundation, Lisboa, Portugal, with works by @manuelasedmach, @marcelomoscheta, @pauloarraiano, @pedro__vaz and @collective_of_two.",
    previewImage: localExhibitionImage(
      "«A certain instance of verrition»",
      "photo_1_2026-05-24_00-51-30.jpg",
    ),
    heroImage: localExhibitionImage(
      "«A certain instance of verrition»",
      "photo_1_2026-05-24_00-51-30.jpg",
    ),
    images: numberedLocalExhibitionGallery(
      "«A certain instance of verrition»",
      "2026-05-24_00-51-30",
      6,
    ),
    instagramUrl: "https://www.instagram.com/p/C9xaqxyotqK/",
  },
  {
    slug: "metempsychosis-the-passion-of-pneumatics",
    title: "METEMPSYCHOSIS: THE PASSION OF PNEUMATICS",
    subtitle: "IVANA BAŠIĆ",
    venue: "Schinkel Pavillon",
    gallery: "Schinkel Pavillon",
    year: "2024",
    dates: "6 June - 1 September 2024",
    startDate: "6 June 2024",
    endDate: "1 September 2024",
    postDate: "8 July 2024",
    dateSource: "exhibition",
    artists: ["IVANA BAŠIĆ"],
    summary: "",
    description:
      "Exhibition documentation of Metempsychosis: The Passion of Pneumatics by Ivana Bašić at @schinkelpavillon, 6 June - 1 September 2024.",
    previewImage: localExhibitionImage(
      "«Metempsychosis The Passion of Pneumatics»",
      "photo_1_2026-05-24_00-52-07.jpg",
    ),
    heroImage: localExhibitionImage(
      "«Metempsychosis The Passion of Pneumatics»",
      "photo_1_2026-05-24_00-52-07.jpg",
    ),
    images: numberedLocalExhibitionGallery(
      "«Metempsychosis The Passion of Pneumatics»",
      "2026-05-24_00-52-07",
      10,
    ),
    instagramUrl: "https://www.instagram.com/p/C9K_GpMoNPw/",
  },
  {
    slug: "external-cryogenics",
    title: "EXTERNAL CRYOGENICS",
    subtitle: "@solitude.solitude_",
    venue: "@hyperlink_athens",
    gallery: "@hyperlink_athens",
    year: "2024",
    postDate: "10 May 2024",
    sortDate: "10 May 2024",
    dateSource: "instagram-post",
    artists: ["@solitude.solitude_"],
    photographer: "Solitude Solitude",
    summary:
      "A work from the solo show Tapeworm Love assembles scavenged materials, tubes, acetone, styrofoam, metal, plastic, polyurethane, and insects.",
    description:
      "External Cryogenics by @solitude.solitude_. Scavenged materials, table, tubes, acetone, styrofoam, metal, plastic, polyurethane and insects. Part of the solo show Tapeworm Love at @hyperlink_athens.",
    previewImage: localExhibitionImage(
      "External Cryogenics by @solitude.solitude_",
      "photo_1_2026-05-24_00-52-36.jpg",
    ),
    heroImage: localExhibitionImage(
      "External Cryogenics by @solitude.solitude_",
      "photo_1_2026-05-24_00-52-36.jpg",
    ),
    images: numberedLocalExhibitionGallery(
      "External Cryogenics by @solitude.solitude_",
      "2026-05-24_00-52-36",
      4,
    ),
    instagramUrl: "https://www.instagram.com/p/C60MK50IXbU/",
  },
  {
    slug: "transparency-report",
    title: "TRANSPARENCY REPORT",
    subtitle: "DAVID SPRIGGS",
    year: "2024",
    postDate: "1 April 2024",
    sortDate: "1 April 2024",
    dateSource: "instagram-post",
    artists: ["DAVID SPRIGGS"],
    summary:
      "Transparency becomes both subject and medium in a work examining the relationship between vision and power.",
    description:
      "Everything we see is viewed through a series of transparencies, beginning with the lens of the eye. For David Spriggs, transparency, whether optical or metaphorical, is the key to understanding the intricate relationship between vision and power. In Transparency Report, Spriggs uses transparency both as the subject and as the medium for his art.",
    previewImage: localExhibitionImage(
      "Transparency Report by David Spriggs",
      "photo_1_2026-05-24_00-53-14.jpg",
    ),
    heroImage: localExhibitionImage(
      "Transparency Report by David Spriggs",
      "photo_1_2026-05-24_00-53-14.jpg",
    ),
    images: numberedLocalExhibitionGallery(
      "Transparency Report by David Spriggs",
      "2026-05-24_00-53-14",
      10,
    ),
    instagramUrl: "https://www.instagram.com/p/C5N_VvttLNq/",
  },
  {
    slug: "bidim-blo",
    title: "BIDIM BLO!",
    subtitle: "Kenny Dunkan",
    venue: "Basisfrankfurt",
    gallery: "Basisfrankfurt",
    year: "2024",
    dates: "9 February - 14 April 2024",
    startDate: "9 February 2024",
    endDate: "14 April 2024",
    postDate: "8 April 2024",
    dateSource: "exhibition",
    artists: ["Kenny Dunkan"],
    summary:
      "Kenny Dunkan's first institutional solo exhibition in Germany develops an emancipatory language through sculpture, photography, video, and spatial installation.",
    description:
      "BIDIM BLO! is the first institutional solo exhibition by Kenny Dunkan in Germany. Through sculpture, photography, video, and entire spatial installations, the artist creates a diverse and visually striking world. Dunkan's works are characterised by dichotomies: between craft and design, pop and high culture, fetish and playfulness, detail and totality, minimalism and overloaded execution.\n\nThrough these elements, Kenny Dunkan develops an emancipatory formal language and conveys critical themes with ease and sensitivity. By combining site-specific conditions with the visual culture of the Caribbean and the aesthetics of carnival in particular, he addresses French colonial heritage and its lasting influence on perceptions and representation.",
    previewImage: localExhibitionImage(
      "‘BIDIM BLO!’ by @kennydunkan at @basisfrankfurt",
      "photo_1_2026-05-24_00-54-21.jpg",
    ),
    heroImage: localExhibitionImage(
      "‘BIDIM BLO!’ by @kennydunkan at @basisfrankfurt",
      "photo_1_2026-05-24_00-54-21.jpg",
    ),
    images: numberedLocalExhibitionGallery(
      "‘BIDIM BLO!’ by @kennydunkan at @basisfrankfurt",
      "2026-05-24_00-54-21",
      10,
    ),
    instagramUrl: "https://www.instagram.com/p/C5ftrbHNc7X/",
  },
  {
    slug: "kassandra",
    title: "KASSANDRA",
    subtitle: "@susanne_hopmann",
    venue: "@kunsthalle.ost",
    gallery: "@kunsthalle.ost",
    year: "2023",
    dates: "19 November - 15 December 2023",
    startDate: "19 November 2023",
    endDate: "15 December 2023",
    postDate: "28 March 2024",
    dateSource: "exhibition",
    artists: ["@susanne_hopmann"],
    photographer: "Gustav Franz",
    exhibitionText: "ralibenkova",
    summary:
      "The myth of Cassandra returns as a contemporary account of truthful warning voices ignored in the face of catastrophe.",
    description:
      "Truthful, and unable to be otherwise, the prophetess Cassandra tries to warn her people against the war with the Greeks and the conquest of Troy. In vain. No one listens to her. She is cursed to speak the truth for the rest of her life, but for no one to believe her prophecies. The myth of Cassandra and Christa Wolf's narrative are more relevant today than ever: a tragic tale of our time, where warning voices are ignored and people turn away from the inevitable.",
    previewImage: localExhibitionImage(
      "‘Kassandra’ by @susanne_hopmann at @kunsthalle.ost",
      "photo_1_2026-05-24_00-54-56.jpg",
    ),
    heroImage: localExhibitionImage(
      "‘Kassandra’ by @susanne_hopmann at @kunsthalle.ost",
      "photo_1_2026-05-24_00-54-56.jpg",
    ),
    images: numberedLocalExhibitionGallery(
      "‘Kassandra’ by @susanne_hopmann at @kunsthalle.ost",
      "2026-05-24_00-54-56",
      10,
      "vertical",
      "reprofoto1",
    ),
    instagramUrl: "https://www.instagram.com/p/C5Fq8flqOh_/",
  },
  // LOCAL_IMAGE_METADATA_IMPORT_4_END
];

export const exhibitions: Exhibition[] = exhibitionSeeds
  .map(({ location, year, previewImage, heroImage, images, ...exhibition }) => ({
    ...exhibition,
    city: exhibition.city ?? location,
    year: year?.toString(),
    tags: tagsForExhibition(exhibition),
    coverImage: coverImageForTitle(exhibition.title),
    previewImage,
    heroImage: heroImage ?? previewImage,
    images,
  }))
  .sort((first, second) => {
    const dateDifference = openingDateValue(second) - openingDateValue(first);
    if (dateDifference !== 0) return dateDifference;

    return 0;
  });

export function getExhibition(slug: string) {
  return exhibitions.find((exhibition) => exhibition.slug === slug);
}

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
  "PHOTOGRAPHY",
  "DISPLACEMENT",
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
  // Opt-out from Next.js Image optimization (/_next/image). Set true
  // when Vercel's per-project transformation quota is unavailable for
  // an exhibition and its files are already reasonably compressed WebP
  // that can be served as-is from public/. Consumers (ExhibitionCard,
  // ExhibitionDetail) pass this through as the Image `unoptimized`
  // prop.
  unoptimized?: boolean;
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

function localExhibitionGalleryWithOrientations(
  folder: string,
  files: Array<{ filename: string; orientation: "horizontal" | "vertical" }>,
  photographer?: string,
): Exhibition["images"] {
  return files.map(({ filename, orientation }) => ({
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

const semanticTagAssignments: Record<string, SemanticTag[]> = {
  "techno-worlds-final-sampling": ["INSTALLATION", "SOUND", "TECHNOLOGY", "DIGITAL MYTH", "MACHINE"],
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
  "dont-trust-the-rabbit": ["INSTALLATION", "TECHNOLOGY", "BODY", "SOUND"],
  "accomplice": ["INSTALLATION", "MATERIALITY", "TRANSFORMATION", "ECOLOGY", "TECHNOLOGY", "SOUND"],
  "dislocation": ["PHOTOGRAPHY", "MEMORY", "IDENTITY", "BODY", "DISPLACEMENT", "ARCHIVE"],
  "haus-der-luge": ["RITUAL", "SPIRITUALITY", "BODY", "MATERIALITY", "DECAY"],
  "actualization-machine": ["TECHNOLOGY", "SURVEILLANCE", "ARCHIVE", "SPIRITUALITY"],
  "rootkit": ["TECHNOLOGY"],
  "double-star": ["INSTALLATION", "BODY", "MATERIALITY", "ARCHIVE", "MEMORY", "MUTATION"],
  "tangled-in-shadows-from-an-old-drawer": ["MEMORY", "DECAY", "DOMESTICITY", "ABSENCE"],
  "stian-eide-kluge-at-rothaus-kunstnernes-hus-oslo": ["MATERIALITY", "OBJECTHOOD"],
  "nike-ta-mere-will-fall-on-you": ["INSTALLATION", "DOMESTICITY", "TECHNOLOGY", "BODY"],
  "caged-movements": ["BODY", "SURVEILLANCE"],
  "who-composes-the-song-of-the-crickets": ["SOUND", "ECOLOGY", "MEMORY"],
  "passenger": ["MEMORY", "MATERIALITY", "ARCHIVE", "TRANSFORMATION"],
  "old-snag": ["INSTALLATION", "MATERIALITY", "ECOLOGY", "MEMORY", "TRANSFORMATION"],
  "axes": ["INSTALLATION"],
  "first-date": ["MATERIALITY", "TRANSFORMATION", "ARCHAEOLOGY"],
  "everything-comes-together-while-pushing-all-apart": ["INSTALLATION", "MATERIALITY"],
  "you-cant-stop-the-world-from-being-bad": ["INSTALLATION", "MEMORY", "SURVEILLANCE"],
  "make-me-yours": ["RITUAL", "POSTHUMAN", "IDENTITY"],
  "fault-lines": ["ECOLOGY", "MATERIALITY", "EROSION", "MATERIAL MEMORY", "DECAY", "ARCHAEOLOGY"],
  "joy-ride": ["INSTALLATION", "ARCHIVE", "RITUAL", "POST-INDUSTRIAL", "LABOR", "DECAY"],
  "triangle-reshapes-the-o-of-my-mouth": ["INSTALLATION", "SOUND", "RITUAL", "TRANSFORMATION", "DOMESTICITY", "FEMININITY"],
  "we-are-deeply-alarmed-and-express-our-grave-concern": ["INSTALLATION", "IDENTITY", "DISPLACEMENT", "FRAGMENT", "MATERIALITY"],
  "24-preludes-op-34-no-22-in-g-minor-adagio": ["SOUND", "INSTALLATION", "MATERIALITY", "LIMINALITY", "ABSENCE"],
  "the-stasis-garden-or-pixies-memories": ["INSTALLATION", "POSTHUMAN", "IDENTITY"],
  "der-kopf-ist-rund": ["MYTH", "FEMININITY", "IDENTITY", "MATERIAL MEMORY", "ARCHAEOLOGY", "RITUAL"],
  "impotenza": ["INSTALLATION", "POSTHUMAN", "IDENTITY", "BODY", "HYBRID BODIES"],
  "a-gentle-kiss-on-a-double-forehead": ["INSTALLATION", "RITUAL", "ANIMALITY", "MATERIALITY", "HYBRID BODIES", "MEMORY"],
  "nymphenbrunnen": ["INSTALLATION", "IDENTITY", "DIGITAL MYTH", "MYTH", "HYBRID BODIES", "BODY"],
  "tantalo": ["INSTALLATION", "MYTH", "LIMINALITY", "MATERIALITY", "ABSENCE", "SPECULATIVE FICTION"],
  "what-we-see-what-looks-back-at-us": ["INSTALLATION", "IDENTITY", "POSTHUMAN", "OBJECTHOOD", "SURVEILLANCE"],
  "ethereal-robes-of-vulnerability": ["INSTALLATION", "POSTHUMAN", "ECOLOGY", "PHOTOGRAPHY", "MATERIALITY", "BODY"],
  "tangerine-reverie": ["INSTALLATION", "ECOLOGY", "RITUAL", "POST-INDUSTRIAL", "LIMINALITY", "MATERIALITY"],
  "after-the-offerings": ["INSTALLATION", "SURVEILLANCE", "RITUAL", "IDENTITY", "DIGITAL MYTH", "BODY"],
  "axial-core": ["INSTALLATION", "SOUND", "POSTHUMAN", "MACHINE", "TECHNOLOGY"],
};

function tagsForExhibition(exhibition: Pick<ExhibitionSeed, "slug" | "title" | "subtitle">): SemanticTag[] {
  const tags = new Set<SemanticTag>(semanticTagAssignments[exhibition.slug] ?? []);

  if (/\bGROUP (?:SHOW|EXHIBITION)\b/i.test(`${exhibition.title} ${exhibition.subtitle ?? ""}`)) {
    tags.add("GROUP SHOW");
  }

  return Array.from(tags);
}

const exhibitionSeeds: ExhibitionSeed[] = [
  {
    slug: "techno-worlds-final-sampling",
    title: "Techno Worlds — Final Sampling",
    subtitle: "Group show",
    venue: "Power Station of Art",
    gallery: "Power Station of Art",
    city: "Shanghai",
    country: "China",
    year: "2026",
    dates: "25 April — 28 June 2026",
    startDate: "25 April 2026",
    endDate: "28 June 2026",
    dateSource: "exhibition",
    artists: [
      "Aleksandra Domanović",
      "ayrtbh",
      "Benjamin Bacon & Vivian Xu",
      "Carsten Nicolai",
      "Chicks on Speed",
      "Daniel Pflumm",
      "DeForrest Brown Jr. & AbuQadim Haqq",
      "Henrike Naumann & Bastian Hagedorn",
      "Jeremy Shaw",
      "Kerstin Greiner",
      "Mamba Negra",
      "Maryam Jafri",
      "Rangoato Hlasane",
      "Robert Lippok",
      "Ryōji Ikeda",
      "Sarah Schönfeld",
      "The Otolith Group",
      "Tobias Zielony",
      "Tony Cokes",
      "UFO Media Lab",
      "Adel-Jing Wang",
      "Zhang Ding",
      "Zuzanna Czebatul",
    ],
    curator: "Mathilde Weh, Justin Hoffmann, Creamcake, Sensend",
    // Redundant under the current global images.unoptimized flag,
    // but kept so the exhibition keeps working if that flag is
    // flipped back off (Vercel Hobby quota is still exhausted).
    unoptimized: true,
    description: `The exhibition explores the relationships between technology, subjectivity, and social structures. It examines resistant practices that emerge against increasingly smooth, efficient, and predictable technological systems.`,
    previewImage: localExhibitionImage("techno-worlds-final-sampling", "1.webp"),
    heroImage: localExhibitionImage("techno-worlds-final-sampling", "1.webp"),
    images: localExhibitionGalleryWithOrientations(
      "techno-worlds-final-sampling",
      [
        { filename: "1.webp", orientation: "vertical" },
        { filename: "2.webp", orientation: "vertical" },
        { filename: "3.webp", orientation: "vertical" },
        { filename: "4.webp", orientation: "vertical" },
        { filename: "5.webp", orientation: "vertical" },
        { filename: "6.webp", orientation: "vertical" },
        { filename: "7.webp", orientation: "vertical" },
        { filename: "8.webp", orientation: "vertical" },
        { filename: "9.webp", orientation: "vertical" },
      ],
    ),
  },
  ...salivaImport13Seeds,
  {
    slug: "axial-core",
    title: "AXIAL-CORE",
    subtitle: "Leo Pum",
    venue: "La Térmica (KRVCE festival)",
    gallery: "La Térmica (KRVCE festival)",
    city: "Málaga",
    country: "Spain",
    year: "2026",
    dates: "22 May — 1 June 2026",
    startDate: "22 May 2026",
    endDate: "1 June 2026",
    dateSource: "exhibition",
    artists: ["Leo Pum"],
    curator: "Doble Erre",
    exhibitionText: "Leandro Mora",
    photographer: "Leandro Mora",
    sourceUrl: "https://leopum.com/",
    // Redundant under the current global images.unoptimized flag,
    // but kept so the exhibition keeps working if that flag is
    // flipped back off (Vercel Hobby quota is still exhausted).
    unoptimized: true,
    description: `AXIAL-CORE is an immersive audiovisual installation by LEO PUM operating between orbital infrastructure, ballistic systems, and synthetic organisms. Through truss structures, motorized lighting, LED panels, exposed cabling, fog, and multichannel audio, the piece transforms space into an active transmission system where light, sound, and architecture synchronize as a single entity.

Its radial structure evokes mechanical wings or chimeric prosthetics, suggesting a biomechanical device suspended between a machine, aerospace infrastructure, and a dreamlike robotic beast. Inspired by sound system culture, rave aesthetics, and video game soundtracks such as Shadow of the Colossus, AXIAL-CORE constructs a sensory environment based on sonic pressure, atmospheric density, and luminous control.

The project's technical direction was developed alongside Marco Ferreira, while the sonic atmosphere, "Ballistic Angel", created by Diego V. Navarro, brings an epic and contemplative dimension to the installation.

— Leandro Mora`,
    previewImage: localExhibitionImage("axial-core", "1.webp"),
    heroImage: localExhibitionImage("axial-core", "1.webp"),
    images: localExhibitionGalleryWithOrientations(
      "axial-core",
      [
        { filename: "1.webp", orientation: "horizontal" },
        { filename: "2.webp", orientation: "horizontal" },
        { filename: "3.webp", orientation: "horizontal" },
        { filename: "4.webp", orientation: "horizontal" },
        { filename: "5.webp", orientation: "horizontal" },
        { filename: "6.webp", orientation: "vertical" },
        { filename: "7.webp", orientation: "horizontal" },
        { filename: "8.webp", orientation: "horizontal" },
        { filename: "9.webp", orientation: "vertical" },
        { filename: "10.webp", orientation: "horizontal" },
      ],
      "Leandro Mora",
    ),
  },
  {
    slug: "after-the-offerings",
    title: "After the Offerings",
    subtitle: "Margaret Abeshu Leversby",
    venue: "inter.pblc",
    gallery: "inter.pblc",
    city: "Copenhagen",
    country: "Denmark",
    year: "2026",
    dates: "1 July — 11 July 2026",
    startDate: "1 July 2026",
    endDate: "11 July 2026",
    dateSource: "exhibition",
    artists: ["Margaret Abeshu Leversby"],
    curator: "2curators1collapse (Joachim Aagaard Friis & Elia-Rosa Guirous-Amasse)",
    photographer: "Luis Maria Sulzmann",
    // Redundant under the current global images.unoptimized flag,
    // but kept so the exhibition keeps working if that flag is
    // flipped back off (Vercel Hobby quota is still exhausted).
    unoptimized: true,
    description: `AFTER THE OFFERINGS is Leversby's first solo show outside of Norway. The exhibition invites viewers into a speculative temporality where medieval sculptural references (a sabaton, a chandelier) are interwoven with fragments of contemporary accelerationism, artificiality and competition (repurposed motorcycle mirrors, deer antlers). At the heart of the show is the question: how do we see, and how are we being seen?

Leversby approaches surveillance as both a contemporary and historical condition, identifying similar underlying mechanisms in medieval Christianity's practice of confession, where believers were encouraged to voluntarily produce knowledge about themselves to atone for their sins. It further asks how the figure of the prey and the hunter becomes indistinguishable, for example in social media circuits where gazes are exchanged incessantly without clear distinctions as to who's watching and being watched at any given moment. The works explore this ambivalent contemporary condition where exposure, pursuit and self-monitoring become mutually reinforcing.

Leversby points to what remains after the digital promise – its rituals and sacrifices – tracing processes of circulation and repetition that continue to shape our perception and behavior to this day. As such, the exhibition unveils surveillance's mechanisms not as an invention of the modern world but as a structure that is ancient, recurring, and intimately inscribed into the ways bodies become visible to each other across time – from the logic of the hunt to the ritual of confession, from the weight of the gaze to the quiet refusal of exposure.`,
    previewImage: localExhibitionImage("after-the-offerings", "1.webp"),
    heroImage: localExhibitionImage("after-the-offerings", "1.webp"),
    images: localExhibitionGalleryWithOrientations(
      "after-the-offerings",
      [
        { filename: "1.webp", orientation: "horizontal" },
        { filename: "2.webp", orientation: "horizontal" },
        { filename: "3.webp", orientation: "vertical" },
        { filename: "4.webp", orientation: "horizontal" },
        { filename: "5.webp", orientation: "horizontal" },
        { filename: "6.webp", orientation: "horizontal" },
        { filename: "7.webp", orientation: "horizontal" },
        { filename: "8.webp", orientation: "horizontal" },
        { filename: "9.webp", orientation: "horizontal" },
        { filename: "10.webp", orientation: "horizontal" },
        { filename: "11.webp", orientation: "horizontal" },
        { filename: "12.webp", orientation: "horizontal" },
        { filename: "13.webp", orientation: "horizontal" },
      ],
      "Luis Maria Sulzmann",
    ),
  },
  {
    slug: "tangerine-reverie",
    title: "Tangerine Reverie",
    subtitle: "Group show",
    venue: "Bangdo",
    gallery: "Bangdo",
    city: "Seoul",
    country: "South Korea",
    year: "2026",
    dates: "4 August — 13 August 2026",
    startDate: "4 August 2026",
    endDate: "13 August 2026",
    dateSource: "exhibition",
    artists: ["Jina Shin", "Hyeran Jang", "Bang Seonu"],
    curator: "Song Hyojin",
    exhibitionText: "Song Hyojin",
    photographer: "Dongwoong Lee, Jeongkyun Goh, Shin Seongmin",
    sourceUrl: "https://saliva.live/",
    // Redundant under the current global images.unoptimized flag,
    // but kept so the exhibition keeps working if that flag is
    // flipped back off (Vercel Hobby quota is still exhausted).
    unoptimized: true,
    description: `Tangerine Reverie brings together works by Jina Shin, Hyeran Jang, and Bang Seonu at Bangdo, an art space housed in a converted residence in Yeongdeungpo, Seoul.

Tangerine Reverie begins with a question arising from an image of a slash-and-burn landscape, where fire, ash, and haze intersect beneath a tangerine fog. Is the breath we take in drawing the flesh of another into our lungs? Are we ingesting one another as breath, recycling each other as air?

Once a traditional agricultural practice, swidden farming has been transformed in the rapidly urbanized present into a practice that causes severe ecological damage and hardship. The romantic tangerine dusk encountered in a resort landscape arrives, paradoxically, both as a medium that conjures the others concealed within histories of industrialization and extraction and as an unsettling echo of those same histories.

Taking tangerine-hued fog and breath as its central motifs, the exhibition examines the religious, historical, and ecological narratives that emerge as social structures and desires become entangled. Air and breath shape how movement unfolds through time and space, disclosing our sense of place and the limits of our presence. To bring these ideas into material form, a haze machine and tangerine lighting inhabit the exhibition space like specters.`,
    previewImage: localExhibitionImage("tangerine-reverie", "1.webp"),
    heroImage: localExhibitionImage("tangerine-reverie", "1.webp"),
    images: localExhibitionGalleryWithOrientations(
      "tangerine-reverie",
      [
        { filename: "1.webp", orientation: "vertical" },
        { filename: "2.webp", orientation: "horizontal" },
        { filename: "3.webp", orientation: "vertical" },
        { filename: "4.webp", orientation: "horizontal" },
        { filename: "5.webp", orientation: "horizontal" },
        { filename: "6.webp", orientation: "horizontal" },
        { filename: "7.webp", orientation: "horizontal" },
        { filename: "8.webp", orientation: "horizontal" },
        { filename: "9.webp", orientation: "horizontal" },
        { filename: "10.webp", orientation: "vertical" },
        { filename: "11.webp", orientation: "vertical" },
        { filename: "12.webp", orientation: "horizontal" },
        { filename: "13.webp", orientation: "vertical" },
        { filename: "14.webp", orientation: "vertical" },
        { filename: "15.webp", orientation: "vertical" },
        { filename: "16.webp", orientation: "vertical" },
        { filename: "17.webp", orientation: "vertical" },
      ],
      "Dongwoong Lee, Jeongkyun Goh, Shin Seongmin",
    ),
  },
  {
    slug: "ethereal-robes-of-vulnerability",
    title: "Ethereal Robes of Vulnerability",
    subtitle: "Group show",
    venue: "Aikas Žado Laboratory (Žeimiai Manor House)",
    gallery: "Aikas Žado Laboratory (Žeimiai Manor House)",
    city: "Vilnius District Municipality",
    country: "Lithuania",
    year: "2026",
    dates: "11 July — 30 August 2026",
    startDate: "11 July 2026",
    endDate: "30 August 2026",
    dateSource: "exhibition",
    artists: [
      "Agate Tūna",
      "Emilija Povilanskaitė",
      "Gedvilė Tamošiūnaitė",
      "Geistė Marija Kinčinaitytė",
      "Inside Job (Ula Lucińska and Michał Knychaus)",
      "Mónika Üveges",
    ],
    curator: "Eglė Ambrasaitė",
    exhibitionText: "Eglė Ambrasaitė",
    photographer: "Lukas Mykolaitis",
    sourceUrl: "https://saliva.live/",
    // Redundant under the current global images.unoptimized flag,
    // but kept so the exhibition keeps working if that flag is
    // flipped back off (Vercel Hobby quota is still exhausted).
    unoptimized: true,
    description: `"Ethereal Robes of Vulnerability" is a group exhibition that engages the shifting ontology of the image through the post-photographic practices of six emerging Eastern European artists working within new materialist and post-human frameworks. At a moment when images proliferate and circulate incessantly, the exhibition reimagines them as a site of encounter, agency, and becoming. Across photography and video, sculpture, and installation, the artists' praxes merge into a fluid conversation between image and matter, tracing entanglements between the natural and the synthetic, technology and spirituality, the dead and the living. Skin-like material image-objects unfold as oracular and ethereal robes of vulnerability, revealing states that are simultaneously beautiful and horrific, hopeful and trepidatious, serene and violent. This approach draws upon both a poetic and a scientific analogy between the image and the skin. Like skin, photography is a light-sensitive surface capable of registering contact, traces, wounds, and transformation. Building on philosopher Jean-Luc Nancy's notion of expeausition - a fusion of exposition (to expose, to show) and peau (skin) - the image is understood here as a surface through which relations unfold. For Nancy, skin is "the most political" because it mediates not only between body and world, but also in one's relation to oneself, marking the threshold between lived experience and possibilities yet to emerge.

This understanding materialises in Mónika Üveges' (HU) "Membrane I". Replacing stretched canvas with flesh-coloured resin held within a curved chrome frame, the work resembles a preserved specimen suspended between display and decay. Evoking both flower petals and human skin, its glowing LED-lit surface and opalescent layered texture bring beauty and deterioration into an uneasy coexistence. A similar attention to material transformation appears in "Thistle Study I" by the artist duo Inside Job (Ula Lucińska and Michał Knychaus, PL). Turning towards resilient non-human forms of life thriving within post-industrial ruins, the thistle emerges as a figure of ecological survival and speculative futures, intertwining forgotten histories, contemporary extraction, and alternative modes of coexistence. In Agate Tūna's (LV) project "Familiar", photography becomes a relational form through which delicate stories of care are transmitted. Drawing on healing practices, herbal knowledge, and spoken charms preserved by generations of women in her family, the artist explores the unstable boundary between threat and protection, belief and superstition. Traces accumulated on the surface of analogue negatives become carriers of memory, intimacy, and shared existence, transforming photography into a companioning presence rather than a representational device. Gedvilė Tamošiūnaitė's (LT) "Vase" offers a contemporary scrying experience. Printed onto tinted glass, the ghostly image of a Soviet-era Murano vase resists stable perception. Its reflective surface constantly shifts according to light conditions and the viewer's position, turning every attempt to capture the image into a form of self-portraiture. Behind the apparition of the vase emerges the viewer's own reflection, quietly evoking fractured intimacies and lingering absences. From these intimate surfaces of memory and care, the exhibition expands towards larger atmospheric and planetary scales. Emilija Povilanskaitė's (LT) "Static" focuses on atmospheric processes unfolding immediately before electrical discharge. Working with real-time decoded NOAA satellite data, the artist reveals invisible streams of signals and information through which our relationship with the environment is increasingly mediated. Likewise, in "Sunless Seas of Ice," Geistė Marija Kinčinaitytė (LT) examines techno-utopian desires to transcend the limits of Earth. Through the aesthetics of the eerie, she exposes how fantasies of expansion, escape, and survival become entangled with ecological crises and collective anxieties about the future.`,
    coverImage: localExhibitionImage("ethereal-robes-of-vulnerability", "cover.webp"),
    previewImage: localExhibitionImage("ethereal-robes-of-vulnerability", "1.webp"),
    heroImage: localExhibitionImage("ethereal-robes-of-vulnerability", "1.webp"),
    images: localExhibitionGalleryWithOrientations(
      "ethereal-robes-of-vulnerability",
      [
        { filename: "1.webp", orientation: "horizontal" },
        { filename: "2.webp", orientation: "horizontal" },
        { filename: "3.webp", orientation: "horizontal" },
        { filename: "4.webp", orientation: "horizontal" },
        { filename: "5.webp", orientation: "horizontal" },
        { filename: "6.webp", orientation: "horizontal" },
        { filename: "7.webp", orientation: "horizontal" },
        { filename: "8.webp", orientation: "horizontal" },
        { filename: "9.webp", orientation: "horizontal" },
        { filename: "10.webp", orientation: "vertical" },
        { filename: "11.webp", orientation: "vertical" },
        { filename: "12.webp", orientation: "vertical" },
        { filename: "13.webp", orientation: "horizontal" },
        { filename: "14.webp", orientation: "vertical" },
      ],
      "Lukas Mykolaitis",
    ),
  },
  {
    slug: "what-we-see-what-looks-back-at-us",
    title: "What We See, What Looks Back at Us",
    subtitle: "Group show",
    venue: "Emergency Space",
    gallery: "Emergency Space",
    city: "Paris",
    country: "France",
    year: "2026",
    dates: "4 July — 10 August 2026",
    startDate: "4 July 2026",
    endDate: "10 August 2026",
    dateSource: "exhibition",
    artists: [
      "Robert Brambora",
      "Emily Dietrich",
      "Jana Köhle",
      "Dominik Münch",
      "Emilio Marroquin",
      "Romain Sarrot",
      "Jan van Hal",
    ],
    curator: "Egor Miroshnichenko",
    exhibitionText: "Egor Miroshnichenko",
    photographer: "Misha Gudwin",
    // Redundant under the current global images.unoptimized flag,
    // but kept so the exhibition keeps working if that flag is
    // flipped back off (Vercel Hobby quota is still exhausted).
    unoptimized: true,
    description: `An exhibition usually assumes a simple contract: the visitor looks, the object submits to being seen. The gaze passively travels from point A to point B, recognizes familiar contours, draws its conclusions. But in fact any gaze mirrors the viewer. The works gathered here operate in this register. They are more interested in watching the visitors than in how they appear to them. The objects return the gaze, delay it, and distort it.

The title refers to Georges Didi-Huberman's «Ce que nous voyons, ce qui nous regarde» (1992; What We See, What Looks Back at Us), one of the first books to problematize this relation. Didi-Huberman writes against "What you see is what you see," the credo of Minimalism that reduces the object to pure visibility — and proposes the opposite optic: precisely the mute, self-evident object is the one that opens up, holds the gaze, and returns it. In this gaze the viewer finds their own reflection: the height of their body, its temperature, its position in space. The object is scaled to the viewer, faces them at their volume and measures them as much as they measure it.

— Egor Miroshnichenko`,
    previewImage: localExhibitionImage("what-we-see-what-looks-back-at-us", "1.webp"),
    heroImage: localExhibitionImage("what-we-see-what-looks-back-at-us", "1.webp"),
    images: localExhibitionGalleryWithOrientations(
      "what-we-see-what-looks-back-at-us",
      Array.from({ length: 13 }, (_, i) => ({
        filename: `${i + 1}.webp`,
        orientation: "vertical" as const,
      })),
      "Misha Gudwin",
    ),
  },
  {
    slug: "tantalo",
    title: "Tántalo",
    subtitle: "Louis Jacquot",
    venue: "Biblioteca Vasconcelos",
    gallery: "Biblioteca Vasconcelos",
    city: "Ciudad de México",
    country: "Mexico",
    year: "2026",
    dates: "31 January — 1 March 2026",
    startDate: "31 January 2026",
    endDate: "1 March 2026",
    dateSource: "exhibition",
    artists: ["Louis Jacquot"],
    curator: "Cy Schnabel",
    exhibitionText: "Cy Schnabel",
    photographer: "Gerardo Landa Rojano",
    sourceUrl: "https://saliva.live/",
    // Redundant under the current global images.unoptimized flag,
    // but kept so the exhibition keeps working if that flag is
    // flipped back off (Vercel Hobby quota is still exhausted).
    unoptimized: true,
    description: `Tántalo refers both to tantalum -a metal- and to the Greek myth of Tantalus, king of Frigia and son of Zeus; condemned to stand in a pool of clear water that recedes each time he tries to drink from it. Above him, branches laden with fruit withdraw whenever he tries to reach for them. This story evokes an experience that is pertinent throughout all of Jacquot's work: a constant tension between appearance and withdrawal, between matter and its disappearance, the promise of an image and the impossibility of fixing it. A fading reflection, a slipping glimmer, a surface that never fully gives itself. In a place like the Biblioteca Vasconcelos -suspended, transparent, layered- this idea finds a natural resonance. The space itself seems to offer forms that appear and retreat, as if the building shared this "tantalizing" condition.

The project presents 20 floating paintings that engage in dialogue with the library's building. One of the most emblematic sites of modern Mexican architecture designed by Alberto Kalach, partially inspired by the surrealist infrastructure depicted by Jorge Luis Borges in his short story The Library of Babel, through the impression of an infinite and ultimately unattainable body of knowledge. Distributed like a map suspended in the air, the works function simultaneously as paintings, objects, and a unified installation.

Conceived as an immersive experience that encourages the public to wander throughout the labyrinth-like structure and appreciate the countless interior views and angles within the building, the project explores reflection and perception, fostering a sensitive dialogue between art, public space, and knowledge.

The imagery in the paintings comes from the artist's wanderings through the library's collection as well as views of the garden and the structure's exterior. Initially the books that Jacquot selected matched subjects of interests: art history, political and social history of Mexico, philosophy, Mexican cinema etc. but eventually the books were chosen in a somewhat arbitrary manner determined by the appeal of the particular view from within the library.

Made with blue cotton canvases of domestic origin and industrial pigments that disperse light, the works never appear as fixed images, remaining responsive to the gravity of the space itself and becoming activated by the various sources of light reflecting off the pigments on the surface of the paintings.`,
    coverImage: localExhibitionImage("tantalo", "cover.webp"),
    previewImage: localExhibitionImage("tantalo", "1.webp"),
    heroImage: localExhibitionImage("tantalo", "1.webp"),
    images: localExhibitionGalleryWithOrientations(
      "tantalo",
      [
        { filename: "1.webp", orientation: "vertical" },
        { filename: "2.webp", orientation: "horizontal" },
        { filename: "3.webp", orientation: "horizontal" },
        { filename: "4.webp", orientation: "vertical" },
        { filename: "5.webp", orientation: "vertical" },
        { filename: "6.webp", orientation: "vertical" },
        { filename: "7.webp", orientation: "vertical" },
        { filename: "8.webp", orientation: "horizontal" },
        { filename: "9.webp", orientation: "horizontal" },
        { filename: "10.webp", orientation: "horizontal" },
        { filename: "11.webp", orientation: "vertical" },
      ],
      "Gerardo Landa Rojano",
    ),
  },
  {
    slug: "nymphenbrunnen",
    title: "Nymphenbrunnen",
    subtitle: "Adele Vivet",
    venue: "Espace Nonono",
    gallery: "Espace Nonono",
    city: "Paris",
    country: "France",
    year: "2026",
    dates: "2026",
    artists: ["Adele Vivet"],
    curator: "Mathilda Portoghese",
    photographer: "Lucia y los demás",
    // Redundant under the current global images.unoptimized flag,
    // but kept so the exhibition keeps working if that flag is
    // flipped back off (Vercel Hobby quota is still exhausted).
    unoptimized: true,
    description: `The Chimerea series consists of five totemic sculptures that combine the architectural language of caryatids with the layered narrative structure of bas-relief. These hydro-chimeras become confessional portraits, exploring the contradictions of a young woman caught between desire and guilt, profound disappointment and moments of joy.

Oscillating between the technological precision of 3D printing and the tactile qualities of ceramics, the sculptures merge mythology, fantasy, and contemporary visual culture. Through this hybrid vocabulary, the work reflects on identity, vulnerability, and the fragmented narratives we construct around ourselves.

Sound design: Laze LF.`,
    previewImage: localExhibitionImage("nymphenbrunnen", "1.webp"),
    heroImage: localExhibitionImage("nymphenbrunnen", "1.webp"),
    images: localExhibitionGalleryWithOrientations(
      "nymphenbrunnen",
      Array.from({ length: 8 }, (_, i) => ({
        filename: `${i + 1}.webp`,
        orientation: "vertical" as const,
      })),
      "Lucia y los demás",
    ),
  },
  {
    slug: "a-gentle-kiss-on-a-double-forehead",
    title: "A Gentle Kiss on a Double Forehead",
    subtitle: "Jan Baszak",
    venue: "BGSW / Baszta",
    gallery: "BGSW / Baszta",
    city: "Słupsk",
    country: "Poland",
    year: "2026",
    dates: "20 June — 5 September 2026",
    startDate: "20 June 2026",
    endDate: "5 September 2026",
    dateSource: "exhibition",
    artists: ["Jan Baszak"],
    curator: "Kamil Mizgała",
    photographer: "Bartosz Zalewski",
    // Redundant under the current global images.unoptimized flag,
    // but kept so the exhibition keeps working if that flag is
    // flipped back off (Vercel Hobby quota is still exhausted).
    unoptimized: true,
    description: `Attention is the rarest and purest form of generosity. It does not entail working out a subtext or categorising things to your liking, but persistence in being with what is there. Its significance grows whenever it encounters what has been harmed or deprived of a voice of its own, allowing us to take a pause and survey the traces of a vanished whole. In the exhibition of Jan Baszak's work, such role seems to be performed by leather. It operates as a piece stripped of its subjectivity, while remaining at the same time in disturbing proximity. It stops you in your tracks by not being completely reducible to the status of a material and, in this way, amplifies attention.

This peculiar practice applies not only to exhibits but is embedded in the very architecture of the show. Upholstery sculpts the space to provide favourable conditions for the works on display. This allows all the components of the exhibition to be treated as a carefully orchestrated setting for arranged situations. The designed circumstances are reminiscent of anthropological descriptions of ritual spaces in which materials organise the experience of transition between orders. At the same time, it is faux and not real leather that has been used to line the old tower. Artificial though it is, the fabric imitates leather and is thus able to evoke the visual and cultural implications the real thing carries, while remaining distinct from them. It is an embellishing substitute, complementing the space with its fakeness and a suggestion of memory, creating an inseparable whole.

The artist creates links by uniting the floors in the building, animal sculptures, props and materials. Padded with brown leather, the pieces make a formal reference to catafalques and bring to mind as much exhibition furniture as funerary equipment. Still, they continue to be what they were before – a suggestion of a resting place, a mock-up home. Their complete integration with the surroundings becomes crucial. The brown leather restores the objects, replacing their original whiteness. They become an integral part of the environment of the exhibition. In this way, they acquire a ceremonial character, further enhanced by the architecture of the site. A sculpture of a cowering dog has been inscribed into the furniture arrangement. Made of black socks, it is not easily perceptible. The fabric retains the memory of its contact with the body, meaning that the sculpture is more a collection of surfaces than a representation of an animal. The shape appears both organic and textile as if the dog had been reduced to its own coating or soft shadow. It emerges as a former partner of the gaze, gradually separated from human experience and transposed into the image.

The works displayed on the first floor can be described as operations conducted on the status of representation in which visibility arrangement becomes crucial. In livestock farming, a little two-headed calf is an unwanted body doomed to early death. Particularly significant in this context is the potential cleft – a two-headed calf challenges the fundamental principle of the oneness of a body as a condition for its visual legibility. As a result, there is a shift from identification to interpretive uncertainty that forces the viewer to constantly revise the language of description. The object is simultaneously a figure of life and an element of objectification systems. The idea of attention as a cognitive practice free from appropriation reappears here. Attention directed at the calf cannot be fully separated from the knowledge of its status as a breeding animal and, therefore, already caught in the logic of exploitation. This enables the victim's perspective to emerge as one of the positions proposed by the exhibition.

This kind of shifting focus onto a fragment brings the logic of fetish into the picture. Fetish renders absence tangible, retargeting desire from a person to an object and investing the latter with surplus meanings. In this arrangement, the fragment does not lead to a whole but begins to function autonomously, as the relationship with the object intensifies. Jan Baszak's object-masks generate this type of contact through their materiality, capturing attention with their own surface as part of the experience. Here, leather produces the effect of continually shifting references, with the fetish differentiating them, preventing the gaze from concluding its relationship with the object.

The second floor of the exhibition, which centres on masks, resembles a dressing room, a rehearsal space or the wings of a carnival show. Animal heads in Baszak's work allow for masquerade-like hiding and scare-giving and, simultaneously, for experiencing a unifying metamorphosis. As a result, it is unclear if we are dealing with a body, a part of it, or a costume. The possibility of becoming another entity for a moment, or rather taking an intermediate position between oneself and the figure of a mask, is crucial. While retaining their utility, masks are what can be put on, what operates in time and in relation with the body. They are similar to the artist's furniture objects in that they are both utilitarian and sculptural, shaping the body's relationship with space rather than merely representing it.

The question of the relationship between body and costume can be linked with the framing of the puppet as an unreflective form and, in this way, paradoxically more 'pure' in its expression. In the case of the masks displayed at the exhibition, this purity is not restored; what does happen is a suspension of the distinction between the body and its surface. They seem to be theatrical and dead at the same time – eyeless heads tied behind like theatrical props. Animals emerge here as partners of former closeness. A gaze directed at masks results in the contemplation of the remains of a relationship, and consequently they end up among the most melancholic objects, exposing the fetish as a story of a lost connection.

When viewing Jan Baszak's sculptural situations, it is easy to return to the observation that attention means being with a thing that is not readily translatable into meaning. This could be interpreted as a state in which an object is not appropriated by thought but is present within it in its opacity. The scenery of the exhibition can be viewed as a way of quietly fostering the relationship between the viewer and the object in which contact leads to prolongation of the act of looking, activating the almost ritual nature of being within a space. Inscribed in it, the sculptures have been constructed upon fragmentary incompatibility whose elements attract attention only to reject it after a while. They are the archives of the processes that have shaped them, remaining close to them and preventing the gaze from settling on one final meaning. They do not regain a lost wholeness, nor do they return to their original functions. They continue as fragments which keep regulating the distance and this may be why any contact with them does not lead to interpretation but maintains a relation with what remains partially opaque.

— Kamil Mizgała`,
    previewImage: localExhibitionImage("a-gentle-kiss-on-a-double-forehead", "1.webp"),
    heroImage: localExhibitionImage("a-gentle-kiss-on-a-double-forehead", "1.webp"),
    images: localExhibitionGalleryWithOrientations(
      "a-gentle-kiss-on-a-double-forehead",
      [
        { filename: "1.webp", orientation: "vertical" },
        { filename: "2.webp", orientation: "horizontal" },
        { filename: "3.webp", orientation: "vertical" },
        { filename: "4.webp", orientation: "vertical" },
        { filename: "5.webp", orientation: "vertical" },
        { filename: "6.webp", orientation: "vertical" },
        { filename: "7.webp", orientation: "vertical" },
        { filename: "8.webp", orientation: "horizontal" },
        { filename: "9.webp", orientation: "vertical" },
        { filename: "10.webp", orientation: "horizontal" },
        { filename: "11.webp", orientation: "vertical" },
        { filename: "12.webp", orientation: "vertical" },
        { filename: "13.webp", orientation: "horizontal" },
        { filename: "14.webp", orientation: "vertical" },
      ],
      "Bartosz Zalewski",
    ),
  },
  {
    slug: "impotenza",
    title: "Impotenza",
    subtitle: "Uffe Isolotto",
    venue: "Palazzo Monti",
    gallery: "Palazzo Monti",
    city: "Brescia",
    country: "Italy",
    year: "2026",
    dates: "13 June — 18 December 2026",
    startDate: "13 June 2026",
    endDate: "18 December 2026",
    dateSource: "exhibition",
    artists: ["Uffe Isolotto"],
    curator: "Edoardo Monti",
    photographer: "All images copyright and courtesy of their respective authors, photographers and, where applicable, the gallery",
    // Redundant under the current global images.unoptimized flag,
    // but kept so the exhibition keeps working if that flag is
    // flipped back off (Vercel Hobby quota is still exhausted).
    unoptimized: true,
    description: `Four years after representing Denmark at the Venice Biennale with We Walked the Earth—an ambitious and technically complex installation that transformed the Danish Pavilion into a speculative ecosystem inhabited by hyperreal hybrid beings—Uffe Isolotto returns with what might initially appear as its opposite.

If the Biennale project embodied a condition of overwhelming capability, a demonstration of what artistic production can achieve through the coordinated expertise of fabricators, artisans, technicians and specialists, Impotenza begins from a radically different premise. The title suggests not only the absence of power, but a state of insufficiency, vulnerability and frustrated aspiration. It names a condition familiar to every artist: the distance between imagination and execution, between what one hopes to create and what one's hands are actually capable of producing.

In many ways, Impotenza emerges from a conscious reversal of artistic progression. Contemporary art often measures success through expansion: larger productions, broader collaborations, increasingly sophisticated technologies and ever more specialised forms of labour. Isolotto himself has been deeply associated with this trajectory. His celebrated installations have relied on extraordinary networks of expertise to achieve their uncanny realism and emotional intensity. Yet here, rather than moving further toward mastery, he deliberately retreats from it.

At Palazzo Monti, the artist reclaims direct physical authorship over the works. Third-party intervention is reduced to a minimum. The sculptures bear the marks of a slower, less mediated process, one in which uncertainty and approximation are not hidden but exposed. The exhibition becomes a return—not to origins exactly, but to a more fragile relationship between artist and object, where making is once again entangled with limitation.

This condition of incompleteness extends beyond the artist's process and into the status of the works themselves. Several sculptures derive from earlier works by Isolotto or function as models for future realisations in bronze or marble. Rather than presenting finished objects, Impotenza inhabits a space between what has been and what might yet become. The works remain open, provisional and unresolved, suggesting that impotence is not only a condition of limitation, but also one of potentiality.

The contrast becomes particularly striking when considered alongside We Walked the Earth. There, potency appeared as an active force: generative, expansive, capable of transforming desire into form. Impotenza, by contrast, inhabits the moment when such confidence begins to falter. Yet rather than presenting impotence as mere failure, Isolotto approaches it as a productive state—a condition from which new forms of artistic sincerity might emerge.

If potency concerns the capacity to act, impotence concerns the awareness of one's inability to fully realise that capacity. The two conditions are less opposites than interdependent forces, each revealing the limits and possibilities of the other.

Throughout the exhibition, bodies appear caught between aspiration and inadequacy. A headless centaur-like figure carries two human heads in a sling across its torso, as if burdened by multiple identities, histories or consciousnesses. These soft silicone appendages hang where virility, authority or mythological power might traditionally be asserted, transforming heroic symbolism into something vulnerable, ambiguous and faintly absurd. Nearby, a young boy balances precariously on his toes, his body traversed by a crude wooden rod that enters through his jaw, passes through his skull, and continues upward toward the frescoed ceilings above. The same rod anchors him to the floor, functioning simultaneously as support, spine and conduit. The gesture oscillates between aspiration and dependence: the child reaches toward centuries of artistic achievement only by means of the very structure that holds him upright. The work stages ambition as an inherently unstable condition, suggesting that elevation is inseparable from vulnerability. Yet the figure is not defeated.

Suspended between effort and collapse, it remains animated by the stubborn persistence of desire itself.

Installed within the historic interiors of Palazzo Monti, these figures enter into dialogue with a building shaped by generations of patronage, cultivation and artistic inheritance. Frescoes, marble surfaces and architectural grandeur become active participants in the exhibition, embodying standards of excellence accumulated across centuries. Against this backdrop, Isolotto's sculptures appear intentionally precarious. Bronze, marble and fresco encounter silicone, readymades and provisional interventions. Mastery meets hesitation. Permanence confronts experimentation.

The works unfold less as stable allegories than as uncertain propositions. Meaning emerges through proximity, association and emotional resonance rather than through symbolic clarity. Their language is bodily, theatrical and archaic, yet somehow unable—or unwilling—to fully stabilise into narrative. They seem to speak from a place just beyond certainty, where symbols continue to function despite the erosion of their authority.

What emerges is not a rejection of ambition but a reconsideration of its conditions. The exhibition suggests that artistic maturity may not consist in expanding one's means indefinitely, but in confronting the limits that remain regardless of success.

The artist who once mobilised an entire ecosystem of expertise now returns to the vulnerability of direct making, exposing the gap between intention and execution rather than attempting to erase it.

In Impotenza, gestures of mastery persist precisely where mastery appears impossible. Ambition survives beyond certainty. Desire continues after authority has begun to dissolve. Impotence is not romanticised as innocence, nor celebrated as failure. Instead, it is presented as a risky and profoundly human condition: the recognition that one may never fully achieve what one imagines, and the decision to continue nonetheless.`,
    previewImage: localExhibitionImage("impotenza", "1.webp"),
    heroImage: localExhibitionImage("impotenza", "1.webp"),
    images: localExhibitionGalleryWithOrientations(
      "impotenza",
      Array.from({ length: 15 }, (_, i) => ({
        filename: `${i + 1}.webp`,
        orientation: "vertical" as const,
      })),
      "Palazzo Monti",
    ),
  },
  {
    slug: "der-kopf-ist-rund",
    title: "Der Kopf ist rund, damit das Denken die Richtung wechseln kann",
    subtitle: "Peles Duo (Barbara Wolff & Katharina Stöver)",
    venue: "Galerie Brugger",
    gallery: "Galerie Brugger",
    city: "Klaus in Vorarlberg",
    country: "Austria",
    year: "2026",
    dates: "31 May — 10 July 2026",
    startDate: "31 May 2026",
    endDate: "10 July 2026",
    dateSource: "exhibition",
    artists: ["Barbara Wolff", "Katharina Stöver"],
    photographer: "Markus Tretter",
    exhibitionText: "Lucia Zelenáková",
    // Vercel Hobby image-optimization quota is exhausted for this
    // billing cycle; served straight from public/ as static WebP
    // instead of routing through /_next/image (which returns 402).
    unoptimized: true,
    description: `When our eyes grasp the past through residual images, history may, at first glance, appear as a linear, steady accumulation of forms, images, and ideas over time. Yet history often reveals itself through deferred actions (Nachträglichkeit), retroactive interpretations of virtual potentialities folded within the physical sediments of the past. Aside from preserving what has been, history (woven into the fabric of matter) invites us to construct meanings from what is embedded within its structure. However, it is the semantic opacity of matter, together with the differences among individual acts of reception – shaped by changing collective worldviews – that leads to the continual re-creation of the meanings associated with forms and ideas. Meaning is never fully present; concepts have no existence separate from the process that brings them into being: that is, the act of engaging with the image.

Peles Duo's exhibition engages with a chain of visual representations of myths, symbols, and ideas as they appeared on their shifting trajectories throughout history. Take, for instance, the echoes of the goddess Cybele, woven throughout several works here. Heavy sculptures resting on metal pallets make various references to her shifting appropriations across cultural spaces. Residual images of the past – from the story of her mythical hermaphroditic origin to divergent interpretations of her iconographical features – are repeatedly revisited by the artists, guided by the Deleuzian principle of "unlimited finitude." As for the meanings of these motifs, they came to be interpreted as deferred actions referring to the ritual sacrifices of Cybele's eunuch priests, eclipsing earlier associations of the pomegranate with femininity in the ancient world. Overall, one finds oneself immersed in a semantic density, a surreal collision of symbols and myths that have been expressed through the images. This is precisely how the artists question our perception of history (or herstory, to be more precise), gently demonstrating how female power and trans communities already occupied an important place in the imagination of past societies.

The interplay of quoted iconography recurs in the present paintings. The echo of the sculptural form of our mother goddess is embedded within a network of visual references to other historical figures. Here, you may catch the eyes of Saint Ottilia; a motif commonly read as a reference to Ottilia's miraculous recovery of sight. Or maybe you will engage with Ciamberlano's engraving depicting human emotions, while wondering if the signifier (e.g., the image of a scream) is truly a fingerprint of a particular emotion. As we already know, the connection between the two sides of the sign (signifier and signified) is always somewhat arbitrary. Moreover, as Lisa Feldman Barrett suggests, emotions are merely constructed perceptions created by the brain of the viewer; with face-reading being just the brain's best guess, conditioned by context and culturally situated knowledge. One may need a miraculous recovery of sight to grasp the meaning that facial expressions held in the past.

From one work to another, several visual references are layered upon one another. But just as important as what is being referenced is the question of how and why these references are made. Techniques such as sampling or remixing are used to transform Peles Duo's artworks into a network of entangled anticipations and reconstructions. Thus, the process of reproduction and remediation serves as a strategy for recognizing material objects as temporal unities and time itself as something material. The site-specific wallpaper exemplifies this well. It is constructed by means of continual remediation: surrealist photographs of ceramic pit fire (baptism by fire, so to speak) are assembled next to the eyes of Saint Ottilia, dancing around reproductions of Peles Duo's former installation, and so on. Collected elements are remixed and assembled, and then printed on sheets of paper. The wallpaper thus serves as an archaeological field of sedimented traces of elements' former existence. Moreover, the chain of continual reproduction sometimes culminates in situations where certain parts of the print no longer point to anything beyond their own materiality. A coherent yet phantasmagoric composition of layered, remediated images often hits the limits of matter's capacity to mediate, document, and hold memory.

According to an old theory, art arises from a deep human need to impose meaning on the world, a need that goes hand in hand with the effort to capture and preserve revealed truth for eternity. An exhibition by artistic duo Barbara Wolff and Katharina Stöver offers a different perspective on this theory. By means of reproduction and remediation, artists merge historical references and their own previous works. Through their surreal portrayal of past images, they demonstrate how ideas change direction as they travel across time and space. They show how images constantly shift in meaning from the very moment they encounter a different gaze, or are reproduced in a different context. After all, that is how images and ideas endure across historical contexts.

"Our heads are round so our thoughts can change direction." So as the image aiming at eternity, constantly changes direction of its significance.`,
    previewImage: localExhibitionImage("der-kopf-ist-rund", "1.webp"),
    heroImage: localExhibitionImage("der-kopf-ist-rund", "1.webp"),
    images: localExhibitionGalleryWithOrientations(
      "der-kopf-ist-rund",
      [
        { filename: "1.webp", orientation: "vertical" },
        { filename: "2.webp", orientation: "horizontal" },
        { filename: "3.webp", orientation: "horizontal" },
        { filename: "4.webp", orientation: "vertical" },
        { filename: "5.webp", orientation: "vertical" },
        { filename: "6.webp", orientation: "horizontal" },
        { filename: "7.webp", orientation: "horizontal" },
        { filename: "8.webp", orientation: "horizontal" },
        { filename: "9.webp", orientation: "horizontal" },
        { filename: "10.webp", orientation: "vertical" },
      ],
      "Markus Tretter",
    ),
  },
  {
    slug: "the-stasis-garden-or-pixies-memories",
    title: "The Stasis Garden (or Pixies Memories)",
    subtitle: "Floryan Varennes",
    venue: "Ville d'Angers (Château d'Angers)",
    gallery: "Ville d'Angers (Château d'Angers)",
    city: "Angers",
    country: "France",
    year: "2026",
    dates: "4 July 2026 — 3 January 2027",
    startDate: "4 July 2026",
    endDate: "3 January 2027",
    dateSource: "exhibition",
    artists: ["Floryan Varennes"],
    curator: "Château d'Angers",
    photographer: "Antoine Denoual",
    // Vercel Hobby image-optimization quota is exhausted for this
    // billing cycle; served straight from public/ as static WebP
    // instead of routing through /_next/image (which returns 402).
    unoptimized: true,
    description: `The installation is presented as part of a group exhibition "Respawn in Heroic".

Made up of a series of suspended modular elements, The Stasis Garden unfolds across the space as a collection of 7 hybrid forms reminiscent of armour, medical braces and floral corollas. Crafted from opalescent PVC, stainless steel and flexible tubing, these structures appear to derive from a single original model that repeats itself without ever being an exact duplicate.

Each element appears as a variation on a prototype, an attempt to adapt to changing conditions. Somewhere between organism and apparatus, they evoke absent bodies of which only the supporting structures or adaptive envelopes remain.`,
    previewImage: localExhibitionImage("the-stasis-garden-or-pixies-memories", "1.webp"),
    heroImage: localExhibitionImage("the-stasis-garden-or-pixies-memories", "1.webp"),
    images: localExhibitionGalleryWithOrientations(
      "the-stasis-garden-or-pixies-memories",
      [
        { filename: "1.webp", orientation: "vertical" },
        { filename: "2.webp", orientation: "vertical" },
        { filename: "3.webp", orientation: "vertical" },
        { filename: "4.webp", orientation: "vertical" },
        { filename: "5.webp", orientation: "vertical" },
        { filename: "6.webp", orientation: "vertical" },
      ],
      "Antoine Denoual",
    ),
  },
  {
    slug: "24-preludes-op-34-no-22-in-g-minor-adagio",
    title: "24 Preludes, Op. 34: No. 22 in G minor (Adagio)",
    subtitle: "Francesco Muggetti & Yongbin Lee",
    venue: "Studiya Gallery",
    gallery: "Studiya Gallery",
    city: "Seoul",
    country: "South Korea",
    year: "2026",
    dates: "10 July — 28 July 2026",
    startDate: "10 July 2026",
    endDate: "28 July 2026",
    dateSource: "exhibition",
    artists: ["Francesco Muggetti", "Yongbin Lee"],
    curator: "Chaewon Yoon",
    photographer: "Studiya Gallery",
    // Vercel Hobby image-optimization quota is exhausted for this
    // billing cycle; served straight from public/ as static WebP
    // instead of routing through /_next/image (which returns 402).
    unoptimized: true,
    description: `The two practices do not translate one another. Muggetti's sound does not explain Lee's sculpture, and Lee's sculpture does not reduce Muggetti's sound to image. What matters is not combination, but the interval between them, where each materiality becomes more distinct.

What is heard remains unresolved, and what is seen never fully gives itself away. What lingers between them is not a single meaning, but a condition still left open. There, silence becomes the longest lingering note.`,
    previewImage: localExhibitionImage("24-preludes-op-34-no-22-in-g-minor-adagio", "1.webp"),
    heroImage: localExhibitionImage("24-preludes-op-34-no-22-in-g-minor-adagio", "1.webp"),
    images: localExhibitionGalleryWithOrientations(
      "24-preludes-op-34-no-22-in-g-minor-adagio",
      [
        { filename: "1.webp", orientation: "vertical" },
        { filename: "2.webp", orientation: "horizontal" },
        { filename: "3.webp", orientation: "vertical" },
        { filename: "4.webp", orientation: "vertical" },
        { filename: "5.webp", orientation: "horizontal" },
        { filename: "6.webp", orientation: "vertical" },
        { filename: "7.webp", orientation: "horizontal" },
        { filename: "8.webp", orientation: "horizontal" },
        { filename: "9.webp", orientation: "vertical" },
        { filename: "10.webp", orientation: "vertical" },
        { filename: "11.webp", orientation: "vertical" },
        { filename: "12.webp", orientation: "horizontal" },
        { filename: "13.webp", orientation: "vertical" },
        { filename: "14.webp", orientation: "vertical" },
        { filename: "15.webp", orientation: "vertical" },
        { filename: "16.webp", orientation: "horizontal" },
        { filename: "17.webp", orientation: "vertical" },
      ],
      "Studiya Gallery",
    ),
  },
  {
    slug: "we-are-deeply-alarmed-and-express-our-grave-concern",
    title: "We are deeply alarmed and express our grave concern",
    subtitle: "Vitalii Shupliak",
    venue: "DOMIE",
    gallery: "DOMIE",
    city: "Poznań",
    country: "Poland",
    year: "2026",
    dates: "11 July — 28 July 2026",
    startDate: "11 July 2026",
    endDate: "28 July 2026",
    dateSource: "exhibition",
    artists: ["Vitalii Shupliak"],
    curator: "Liso Stec",
    photographer: "Mikołaj Wojnar",
    sourceUrl: "https://saliva.live/",
    description: `The exhibition emerges from the tension between the idealization of a European community and the experience of its erosion. A space that promises security and solidarity increasingly reveals its own fractures: in its responses to wars, migration, social crises, and the consequences of political decisions. In this context, questions of agency and responsibility acquire an increasingly sharp dimension.

The exhibition space unfolds like an organism: a situational construction, changeable and open to reconfiguration, similar to the self-organizing ocean in Stanisław Lem's novel Solaris. Mirrored, fiery forms reflect the viewer and the surroundings, drawing them into an encounter with a projection and with their own reaction to it. In the context of growing political tensions and radicalization, this figure of "otherness" increasingly becomes the foundation of counter-narratives and a tool for producing fear, borders, and exclusion. Shupliak asks where, in whom, and why we begin to see the stranger.

The exhibition resembles a provisional playground that may turn into a barrier. The artist offers the possibility of play, arrangement, and observation, yet this is not an innocent situation. Every movement takes place among reflections, sharp edges, and mutual acts of watching. This play is marked by an awareness of one's own position.

Another part of the exhibition is a drawing created with a lead toy soldier, which the artist uses to rub imprints of coins. One of its strongest connotations is the price of European security. It is no longer only about how much we are ready to pay for it. What becomes more important is who ultimately becomes the payer.

Above the space looms the artist's hand holding an object composed of two different euro coins. Shupliak appears to offer a gift, but through the artistic gesture the coins lose their functionality and fall out of economic circulation. The fleshy, corporeal image of the hand can be read in multiple ways: as a suggestion that the fate of Europe is in our hands, or, conversely, that it remains in the hands of selected, privileged, essentially male subjects. The gesture of reconstructing the symbol of the EU leads to a question of resource distribution. Is the European community, living in relative security, ready to reach out and share its capital with those it perceives as strangers?

The exhibition touches upon fragility, the weight of decisions, and the price of European security, but it does not lead reflection solely toward dystopian scenarios. Its modular structure activates the possibility of creating new arrangements, constructions, and meanings. What has been cut, separated, or deprived of its original function holds the potential for reconfiguration. Places of rupture may become places of contact, and cracks may indicate where a more stable and lasting form can be created. This is not an easy task. It remains possible.`,
    previewImage: localExhibitionImage("We are deeply alarmed and express our grave concern", "1.webp"),
    heroImage: localExhibitionImage("We are deeply alarmed and express our grave concern", "1.webp"),
    images: localExhibitionGalleryWithOrientations(
      "We are deeply alarmed and express our grave concern",
      [
        { filename: "1.webp", orientation: "vertical" },
        { filename: "2.webp", orientation: "horizontal" },
        { filename: "3.webp", orientation: "horizontal" },
        { filename: "4.webp", orientation: "horizontal" },
        { filename: "5.webp", orientation: "vertical" },
        { filename: "6.webp", orientation: "vertical" },
        { filename: "7.webp", orientation: "vertical" },
        { filename: "8.webp", orientation: "vertical" },
        { filename: "9.webp", orientation: "horizontal" },
        { filename: "10.webp", orientation: "horizontal" },
        { filename: "11.webp", orientation: "vertical" },
      ],
      "Mikołaj Wojnar",
    ),
  },
  {
    slug: "triangle-reshapes-the-o-of-my-mouth",
    title: "Triangle reshapes the O of my mouth",
    subtitle: "Anousha Payne",
    venue: "Sperling",
    gallery: "Sperling",
    city: "Munich",
    country: "Germany",
    year: "2026",
    dates: "16 May — 4 July 2026",
    startDate: "16 May 2026",
    endDate: "4 July 2026",
    dateSource: "exhibition",
    artists: ["Anousha Payne"],
    photographer: "Sebastian Kissel, Pablo Lauf",
    sourceUrl: "https://sperling-munich.com/",
    description: `Sperling is pleased to present the second exhibition by Anousha Payne in Munich, developed in close collaboration with Ushara (sound and opening performance). Building on her first presentation at Sperling's old gallery location – where paper-pulp casts of her own body and ceramic animal heads formed a playful narrative supported by a four channel sound piece – Payne continues to expand her practice through challenging processes. Her work lives between sculpture, storytelling, and embodied experience, tracing the shifts between the human and the non-human, the domestic and the mythological.

At the centre of the exhibition is the figure of the moth. For Payne, the moth is not simply a symbol of attraction or fragility, but a creature that moves across thresholds – between interior and exterior, private and public, constraint and escape. It becomes a speculative figure of transformation: a body that passes through walls, that inhabits and exceeds the architecture of the home. The house itself appears here not merely as a physical structure, but as a psychological and political one – an extension of patriarchal limits, a site in which domestic labour, memory, and identity are inscribed and contested.

This ecology of the home is rendered through an interplay of sculptural elements, text, and sound. Wax circles punctuate the space like traces or imprints – marks that evoke the repeated impact of wings against a surface, preserving movement. The use of batik, with its etymological root in "writing in wax," further layers the exhibition with questions of inscription, inheritance, and material memory. Associated with domestic clothing and intergenerational intimacy, batik here also carries the weight of its colonial trajectories, embedding the work within broader histories of exchange and displacement.

Payne's narrative follows a protagonist increasingly enclosed within the walls of her home, accompanied and gradually transformed – by the presence of the moth. This transformation is not framed as disappearance, but as an expansion of the body: a leaking, multiplying form that extends beyond itself. The figure of the moth/woman resonates with what Virginia Woolf once described in The Death of the Moth as the intensity of life condensed in a small, flickering being – an energy that persists even at the threshold of dissolution. In Payne's work, this fragile vitality is reimagined as a force of resistance: the capacity to move, to mark, to transform within and against enclosing structures.

At the same time, Silvia Federici's Caliban and the Witch sharpens this perspective by tracing how mechanisms of control and persecution have historically disciplined and enclosed female bodies. Within this context, transformation does not appear as a passive dissolution but as a potential refusal: a way of exceeding the structures that seek to contain it. The moth, then, emerges not only as a figure of fragility, but as a quiet strategy of escape – a being that inhabits confinement while simultaneously eroding its limits.

These concerns are extended through Ushara's sound work and live performance, which activate the exhibition as a temporal and affective environment. Composed of field recordings, organ, cello, and voice, the sound piece inhabits the house as a shifting presence, embodying the psychological states of its protagonist. During the opening weekend, Ushara will present an expanded one-woman opera in four acts, combining reinterpretations of Johann Sebastian Bach and Hildegard von Bingen with original compositions. The performance unfolds as a movement through solitude, fragmentation, and renewal, echoing the exhibition's exploration of interiority and transformation.`,
    previewImage: localExhibitionImage("Triangle reshapes the O of my mouth", "1.webp"),
    heroImage: localExhibitionImage("Triangle reshapes the O of my mouth", "1.webp"),
    images: localExhibitionGalleryWithOrientations(
      "Triangle reshapes the O of my mouth",
      [
        { filename: "1.webp", orientation: "vertical" },
        { filename: "2.webp", orientation: "horizontal" },
        { filename: "3.webp", orientation: "vertical" },
        { filename: "4.webp", orientation: "vertical" },
        { filename: "5.webp", orientation: "horizontal" },
        { filename: "6.webp", orientation: "vertical" },
        { filename: "7.webp", orientation: "vertical" },
        { filename: "8.webp", orientation: "horizontal" },
        { filename: "9.webp", orientation: "vertical" },
        { filename: "10.webp", orientation: "horizontal" },
        { filename: "11.webp", orientation: "horizontal" },
        { filename: "12.webp", orientation: "horizontal" },
        { filename: "13.webp", orientation: "horizontal" },
        { filename: "14.webp", orientation: "vertical" },
        { filename: "15.webp", orientation: "vertical" },
        { filename: "16.webp", orientation: "horizontal" },
        { filename: "17.webp", orientation: "vertical" },
        { filename: "18.webp", orientation: "horizontal" },
      ],
      "Sebastian Kissel, Pablo Lauf",
    ),
  },
  {
    slug: "joy-ride",
    title: "JOY RIDE",
    subtitle: "Alessandro Cugola",
    venue: "Jester",
    gallery: "Jester",
    city: "Genk",
    country: "Belgium",
    year: "2026",
    dates: "20 June — 23 August 2026",
    startDate: "20 June 2026",
    endDate: "23 August 2026",
    dateSource: "exhibition",
    artists: ["Alessandro Cugola"],
    curator: "Karel Op 't Eynde",
    photographer: "Silvia Cappellari",
    description: `Joy Ride by Alessandro Cugola is an exhibition developed at Jester in dialogue with the institution's archive, containing a vast amount of artworks, editions, and documentation. Through site-specific installations and a durational performance, Cugola reactivates fifty years of artistic production. The exhibition triggers a chain reaction in which the archive is moved, exposed, contaminated, conserved and eventually packed away again. The archive enters a temporary traffic system, a joy ride.

With this exhibition, Jester celebrates its fifth anniversary, alongside the fortieth anniversary of FLACC and fiftieth anniversary of CIAP, the organisations that merged to form Jester.

FLACC and CIAP shaped this vast collection of works, both with different approaches to archiving. As a result, it brings together objects and artworks that were not necessarily intended to form one coherent collection. Some works were produced in close relation to the institution, others remained as traces of projects or decisions made along the way.

During the opening, Cugola initiates the process of archiving himself through a performance. Working with the codes and protocols of art handling, he activates Ventilation Organ (2026) and sets the archive in motion, beginning a process in which works are handled and gradually archived. Over the following weeks, this action is continued by volunteers connected to the organisation.

An archive traditionally makes promises of order as it gathers and classifies. It attempts to hold its contents together, to prevent them from dissolving into dissociation. Joy Ride accumulates and overflows. It contaminates itself. Where do we begin? How long should it be kept? It questions if movement itself can become a temporary answer.

The first space of the exhibition titled Analchon, turns the archive toward the body. The word is deliberately unstable and carries the archive and the arkheion, but it also twists them through anality, digestion and exhaustion. Drawing on Georges Bataille's The Solar Anus (1931), the anal dimension of the archive can be read as a distorted circulation—matter moves, turns, and returns, refusing a clean linearity of historical order. Cugola shifts the archive from a legal or institutional structure to a body that absorbs, processes, retains and eventually expels. For how long does matter remain inside? How is it digested? In Analchon, the archive becomes an exhausted digestive system, one that takes everything in while things continue to slip from its hands.

The second space, titled Anarchive, brings together archive and anarchy or anachronism. The materials Cugola responds to have passed through a series of imperfect locations; former casino buildings, storage spaces, cellars, and attics. They were kept in conditions that were too humid, too provisional, too close to neglect. Following the exhibition, the archive will be permanently stored in the Jester building, entering a more controlled environment that is centralized, perhaps even ideal.

But Cugola asks whether solving its location solves all issues. It may now be housed, but it has not settled. What remains unclear is how the archive will be used, who will speak through it, and what role it can play within Jester's future activities. Is it a collection, a resource, a responsibility, a burden, or a working tool? The installation Anarchive Cabinets I–III (2026) speaks to an unfinished order as it suggests an authority that is present but unable to fully act, suspended at the point of beginning, unsure where to start. The archive is not chaotic because of its lack of structure, it is chaotic because structure does not resolve the pressure to make decisions. Cabinets become figures of an authority that stores without necessarily interpreting, one that protects without necessarily knowing what kind of value it holds.

Ventilation Organ (2026) introduces another kind of authority, one of the building itself. The work hacks the existing climate control system of Jester's Kunsthal, making the conditions that intend to safeguard or stabilize the works on display audible. The building speaks and sings. It has its own presence, its own capacity to dictate or infiltrate. In Anarchive, the building becomes part of its own condition. The archive may have found a place, but that place also acts upon it.

In the third space of the exhibition, titled Joy Ride, visitors can consult the archive. Cugola focuses on the substrate, the actual support that makes looking and handling possible. In archival logic, this is often imagined as a technical condition, something that holds contents or facilitates access. In this space, a transparent table-shaped installation, supported by Ford-branded wheels, subverts this logic, turns the handler upside down and changes the conditions of seeing.

As the viewer looks through the transparent support, the work continues into the ceiling, into the body behind it, into the surrounding architecture. Because the support is placed on wheels, it also remains mobile. The archive appears, but not as something finally fixed. Even at the moment of access, it is still contingent.

In Joy Ride, Alessandro Cugola describes the archive that "speaks about archiving". At Jester, it is stored, but not quite claimed. It is protected, but not fully interpreted. Responsibility passes from the institution to the artist, from the artist to volunteers, from volunteers to visitors, as if the exhibition itself might reveal what the archive is, or what its value might be. Authority is not absent but it is displaced. It acts through delegation, hesitation, postponement. Or, as Cugola notes, "the authority is still there, but it acts through non-decision."

The title Joy Ride refers to a sort of movement without destination, acceleration without resolution, circulation without decision. It is not a heroic journey and not a clean route from origin to endpoint. It is a loop, a temporary activation, a taking-out-for-a-ride. The archive is brought out, shown, handled, looked at, and then returned. Its status is not solved by any movement. Its value is not secured once and for all. Instead, movement exposes the conditions that make the archive uncertain in the first place.

In Genk, the image of a car and its tires call back to the now closed Ford factories with their industrial production, labour infrastructure and eventual abandonment. Joy Ride inevitably touches the city's histories of repetitions of the assembly line, the loading and unloading of material. Cugola treats these as labour organised through linear motion, repeated gestures and exhaustion.

For Cugola, the archive is what remains when responsibility is passed on, when authority acts through non-decision, and when movement itself becomes the only available form of temporary care. Joy Ride does not solve the issue. It takes it out for a ride.`,
    previewImage: localExhibitionImage("JOY RIDE", "1.webp"),
    heroImage: localExhibitionImage("JOY RIDE", "1.webp"),
    images: localExhibitionGalleryWithOrientations(
      "JOY RIDE",
      [
        { filename: "1.webp", orientation: "vertical" },
        { filename: "2.webp", orientation: "horizontal" },
        { filename: "3.webp", orientation: "horizontal" },
        { filename: "4.webp", orientation: "horizontal" },
        { filename: "5.webp", orientation: "vertical" },
        { filename: "6.webp", orientation: "vertical" },
        { filename: "7.webp", orientation: "horizontal" },
        { filename: "8.webp", orientation: "horizontal" },
        { filename: "9.webp", orientation: "horizontal" },
        { filename: "10.webp", orientation: "horizontal" },
        { filename: "11.webp", orientation: "vertical" },
        { filename: "12.webp", orientation: "horizontal" },
      ],
      "Silvia Cappellari",
    ),
  },
  {
    slug: "fault-lines",
    title: "Fault lines",
    subtitle: "Gabriel Mills & Hannah Morgan",
    venue: "Public Gallery",
    gallery: "Public Gallery",
    city: "London",
    country: "United Kingdom",
    year: "2026",
    dates: "18 June — 25 July 2026",
    startDate: "18 June 2026",
    endDate: "25 July 2026",
    dateSource: "exhibition",
    artists: ["Gabriel Mills", "Hannah Morgan"],
    photographer: "all images copyright and courtesy of the artist and Public Gallery, London",
    sourceUrl: "https://public.gallery/",
    description: `Public Gallery is pleased to present Fault lines, a duo exhibition of painting and sculpture by Gabriel Mills and Hannah Morgan, each of whom approach their work as a form of geological thinking. Resisting empirical certainty in favour of embodied, latent forms of knowledge, the exhibition situates both practices in relation to the agency of material, where the process of making functions as a form of excavation and discovery.

Mills' practice studies the material conditions and behavioural properties of oil and pigment. His paintings emerge through the accumulation of experimental mixtures with differing rates of oxidation, producing ridges, fissures, and sediment-like strata that parallel the density and atmospheric weight of natural topographies. The work is equally informed by broader questions surrounding consciousness, presence, and the conditions through which form comes into being. Each mark evidences the artist's presence rather than representing an illusion or 'other place', guided by cycles of creation that extend beyond immediate perception and toward an intuitive, subliminal understanding. At the same time, the work operates as a close study of colour as material: how it behaves under specific conditions, or how it is contained within improvised systems akin to mapping a physical terrain. Recent paintings extend this inquiry through a process that redistributes authorship between artist and material. In Auaienm (2026), two heavily worked panels are interrupted by a moment of discipline and restraint: across the central panel, Mills arranges and combs the paint across the surface in a single stroke, testing the threshold between artistic desire and material autonomy.

The veins, seams, and natural crevices of Morgan's English alabaster sculptures mirror the topographic mapping of Mills' densely layered surfaces, while also gesturing toward an interior, unseen world of geological and embodied memory. Formed from ancient saltwater deposits, alabaster sits between mineral and stone, carrying traces of erosion, compression, and environmental change across deep time. Morgan studies alabaster's responsiveness: its capacity to absorb, bruise, and register its surroundings, recording the physical memory of earth and articulating cycles of excavation and emergence. Through her practice, she explores themes of transformation, grief, and timescales beyond the anthropocentric, often drawing upon archaeological sites, coastal landscapes, and histories of extraction. Milky carved stone works such as Animula XV (2026) are presented alongside metal armatures that map anatomical pathways and cartographic systems, while suspended glass oculars operate as speculative or otherworldly portals. Her practice is grounded in concepts of "un-horizoning" and non-linear time, positioning each work as a fragment or footnote within broader enquiries into how grief and memory are materially expressed and temporally experienced.

Fault lines gestures toward geological time and physical landscapes, where the peaks and valleys within Mills' impasto fields resonate with the seams and cavities in Morgan's sculptural installations, framing both practices as parallel terrains of accumulation and erosion. Across the exhibition, the artists pursue long lines of inquiry that grapple with cycles of creation and seismic transformation. Together, they navigate the thresholds of the unknown, relying on alternative, often intuitive forms of knowledge that sit beyond our immediate understanding.`,
    previewImage: localExhibitionImage("Fault lines", "1.webp"),
    heroImage: localExhibitionImage("Fault lines", "1.webp"),
    images: localExhibitionGalleryWithOrientations(
      "Fault lines",
      [
        { filename: "1.webp", orientation: "horizontal" },
        { filename: "2.webp", orientation: "horizontal" },
        { filename: "3.webp", orientation: "horizontal" },
        { filename: "4.webp", orientation: "horizontal" },
        { filename: "5.webp", orientation: "horizontal" },
        { filename: "6.webp", orientation: "horizontal" },
        { filename: "7.webp", orientation: "horizontal" },
        { filename: "8.webp", orientation: "horizontal" },
        { filename: "9.webp", orientation: "horizontal" },
        { filename: "10.webp", orientation: "horizontal" },
        { filename: "11.webp", orientation: "horizontal" },
        { filename: "12.webp", orientation: "horizontal" },
        { filename: "13.webp", orientation: "horizontal" },
        { filename: "14.webp", orientation: "horizontal" },
        { filename: "15.webp", orientation: "horizontal" },
        { filename: "16.webp", orientation: "horizontal" },
        { filename: "17.webp", orientation: "horizontal" },
        { filename: "18.webp", orientation: "horizontal" },
        { filename: "19.webp", orientation: "horizontal" },
        { filename: "20.webp", orientation: "horizontal" },
      ],
      "all images copyright and courtesy of the artist and Public Gallery, London",
    ),
  },
  {
    slug: "make-me-yours",
    title: "MAKE ME YOURS",
    subtitle: "Ewa Dacko",
    venue: "Łęctwo",
    gallery: "Łęctwo",
    city: "Poznań",
    country: "Poland",
    year: "2026",
    dates: "14 November — 19 December 2026",
    startDate: "14 November 2026",
    endDate: "19 December 2026",
    dateSource: "exhibition",
    artists: ["Ewa Dacko"],
    photographer: "Mateusz Hadaś",
    exhibitionText: "Julian Baranowski",
    instagramUrl: "https://www.instagram.com/lectwo_gallery/",
    description: `We are standing together in front of a shop window in LA, or Paris, or Warsaw, looking at a Givenchy dress we both dream of. The air is warm and heavy today. We say goodbye to the boutique window and head toward the park. The stroller wheels squeak terribly, as if they don't want to go anywhere at all. I need to oil them again. Fortunately, I still have some silicone oil, the same kind I use to fix Evangeline.

We reach the park. These walks, they are like ceremonial, weekly celebrations of love to me. I have to go on them. Otherwise, I might forget how much she means to me. I want her to be able to look at her favorite flowers. I wish she could smell them, too. Or even taste them. I, of course, cannot eat them, but they wouldn't harm her at all. We always come here on Tuesdays at 6:00 PM.

Exactly at this time, five years ago, she appeared at my door. I still remember how excited I was. I immediately wanted to dress her, feed her, hug her; I asked her a bunch of silly questions.

Before she appeared in my life, I was alone. I talked to walls and furniture. I cried and whispered to pillows at night. Today is different. I no longer have time to talk to walls. I fill my days with our shared rituals.

Every morning, I brush her long, thick, pink hair. I have to be very careful not to pull it out. Once her hair is styled, I touch up her French manicure. During dinner, we usually watch Hotel Paradise. Or about handbags, stilettos, and economic crises.

This is how our days pass. E. remains silent, and I take care of her, losing myself in this overwhelming caregiving work.

— Julian Baranowski`,
    previewImage: localExhibitionImage("MAKE ME YOURS", "1.webp"),
    heroImage: localExhibitionImage("MAKE ME YOURS", "1.webp"),
    images: localExhibitionGalleryWithOrientations("MAKE ME YOURS", [
      { filename: "1.webp", orientation: "vertical" },
      { filename: "2.webp", orientation: "horizontal" },
      { filename: "3.webp", orientation: "vertical" },
      { filename: "4.webp", orientation: "vertical" },
      { filename: "5.webp", orientation: "vertical" },
      { filename: "6.webp", orientation: "horizontal" },
      { filename: "7.webp", orientation: "vertical" },
      { filename: "8.webp", orientation: "vertical" },
      { filename: "9.webp", orientation: "horizontal" },
      { filename: "10.webp", orientation: "horizontal" },
      { filename: "11.webp", orientation: "horizontal" },
      { filename: "12.webp", orientation: "horizontal" },
      { filename: "13.webp", orientation: "horizontal" },
    ], "Mateusz Hadaś"),
  },
  {
    slug: "you-cant-stop-the-world-from-being-bad",
    title: "You Can't Stop the World from Being Bad",
    subtitle: "Andrea Ferrero",
    venue: "Galería Gato",
    gallery: "Galería Gato",
    city: "Lima",
    country: "Peru",
    year: "2026",
    dates: "9 July - 22 August 2026",
    startDate: "9 July 2026",
    endDate: "22 August 2026",
    dateSource: "exhibition",
    artists: ["Andrea Ferrero"],
    photographer: "Héctor Delgado",
    sourceUrl: "https://galeriagato.com/",
    description: `Extending earlier investigations into fortresses, architectures of security, and imperial gardens, You Can’t Stop the World from Being Bad traces spatial logics of power back to an intimate terrain shaped by childhood imagination, personal memory, and acts of world-building, where systems of control are first encountered at a miniature scale. Castle towers, gates, ornamental details, and protective elements oscillate between the intimate and the architectural, recalling Little Tikes play castles, dollhouses and tiny Polly Pocket environments —contained worlds designed to be held, arranged and governed. Referencing these softened versions of defense architecture that reproduce the language of the fortress, Ferrero returns to an early encounter with space as something magical yet clinically staged.

Borrowing from the structure of fairy tales and early videogame logic, the exhibition unfolds as a sequence of thresholds, turning the gallery into a fragmented castle interior where each room reveals a new level, obstacle, or reward. Tracing architectures of power back to their earliest forms of rehearsal, Ferrero draws from nursery rhymes and early encounters with fiction to consider play as a formative site. Sheer curtains veil the gallery walls, partially revealing what’s hidden behind them and drawing us inward into a private, constructed world where power operates through pretend play. Drawing from narrative structures tied to conquest, weaponry, and “masculine”-coded forms of play so often encountered in children’s stories, protection here takes form through small prosthetics to fantasy: armour, collars, and love padlocks. Gestures of intimacy merge with mechanisms of restriction; while attachment and possession become difficult to detangle. Collapsing childhood fantasy with contemporary systems of surveillance and control, the work returns to a moment when our understanding of the world remains open, unstable, and deeply permeable.`,
    previewImage: localExhibitionImage("You Can't Stop the World from Being Bad", "1.webp"),
    heroImage: localExhibitionImage("You Can't Stop the World from Being Bad", "1.webp"),
    images: localExhibitionGalleryWithOrientations("You Can't Stop the World from Being Bad", [
      { filename: "1.webp", orientation: "vertical" },
      { filename: "2.webp", orientation: "vertical" },
      { filename: "3.webp", orientation: "horizontal" },
      { filename: "4.webp", orientation: "vertical" },
      { filename: "5.webp", orientation: "horizontal" },
      { filename: "6.webp", orientation: "vertical" },
      { filename: "7.webp", orientation: "vertical" },
      { filename: "8.webp", orientation: "vertical" },
      { filename: "9.webp", orientation: "vertical" },
      { filename: "10.webp", orientation: "horizontal" },
      { filename: "11.webp", orientation: "vertical" },
      { filename: "12.webp", orientation: "vertical" },
      { filename: "13.webp", orientation: "vertical" },
      { filename: "14.webp", orientation: "vertical" },
      { filename: "15.webp", orientation: "vertical" },
      { filename: "16.webp", orientation: "vertical" },
      { filename: "17.webp", orientation: "vertical" },
      { filename: "18.webp", orientation: "horizontal" },
      { filename: "19.webp", orientation: "horizontal" },
      { filename: "20.webp", orientation: "vertical" },
      { filename: "21.webp", orientation: "vertical" },
      { filename: "22.webp", orientation: "vertical" },
    ], "Héctor Delgado"),
  },
  {
    slug: "old-snag",
    title: "OLD SNAG",
    subtitle: "Ingeborg Tysse",
    venue: "Société Interludio",
    gallery: "Société Interludio",
    city: "Turin",
    country: "Italy",
    year: "2026",
    dates: "24 May - 26 July 2026",
    startDate: "24 May 2026",
    endDate: "26 July 2026",
    dateSource: "exhibition",
    artists: ["Ingeborg Tysse"],
    photographer: "Stefano Mattea",
    exhibitionText: "Caterina Avataneo",
    sourceUrl: "https://societeinterludio.com/",
    description: `I usually disdain texts beginning with a definition, but Old Snag definitely demands one. Personally, I could imagine a “hey you!” just preceding it — the kind of expression muttered at the edge of a counter, directed toward some drunk man: a body gone crooked, inexplicably still standing. As it turns out, the term is not typically used for human beings. And yet, if it were, my intuition would not feel entirely misapplied. A snag, in forestry, is a standing dead tree: no longer alive in the biological sense but not yet absorbed back into the ground. A walking dead, in other words! No wonder every existing image of a haunted house includes somewhere in the background a lightning-struck trunk, twisted like a witch’s finger. Wait, hear this before you roll your eyes in disapproval of my fixation with the topic. What is important, and increasingly documented in ecological research, is that these dead standing trees are far from inert remnants. They function as active ecosystems, hosting nesting cavities for birds, shelter for insects, bats, microbial life, fungi, lichens, mosses, and a dense array of organisms that depend precisely on decomposition for vitality.

In Ingeborg Tysse’s exhibition, an old snag appears within an analogous suspended ontology. Sourced from the area surrounding the gallery, the trunk is ceremonially positioned upright. With a pair of owl-looking wings that unfurl at its sides, it assumes a totemic presence. The effect is rather absurd and deliberately unsettling: the trunk is grounded, heavy with its own past, while the wings animate something expected to be devoid of life. The owl too carries a symbolic history, appearing across multiple folk traditions as a creature associated with death omens, obscure knowledge and the threshold between worlds. Other three monumental cherry trunks lie horizontally across the floor, dressed with Elizabethan and clerical collars, as well as belts. The arthritic dark-brown bark and the fleshy fungi bulging from it reveal that, when sourced, these trunks had already been reclaimed by the forest floor. Ecologically, they belong to another category altogether: deadwood, or downed logs. Typically, as moisture infiltrates deadwood from the soil below, moss spreads across its bark and fungi proliferate, while larvae and microbial colonies gradually convert wood into nutrient-rich organic matter, contributing to the slow release of carbon into the soil. A fundamental regenerative process indeed, one that makes the log uncomfortably close to a putrefying corpse. What disgusts us about the cadaver, writes Julia Kristeva in Powers of Horror, is its collapsing of categories we obsess on keeping separate: life and death, self and non-self, body and waste. The corpse is that which exceeds purity and containment — the most disturbing of residues in which life persists as something no longer recognisable as “self.” Think about how we see our dead ones for the last time. It is usually at the funeral parlour: dressed, composed, cosmetically restored, the smell temporarily subdued, the body carefully adjusted into a final image of coherence before the coffin is sealed, and decomposition is removed from sight. What follows — the slow, irreversible transformation of the body into other forms of matter — is systematically withdrawn from the sphere of the living imagination. It is precisely within this logic that the Elizabethan ruffs and belts placed on her trunks resonate. Historically, ruffs functioned as devices of posture and class distinction, producing an image of elegance and aristocratic composure — while also, more implicitly, concealing the softening of the neck and the visible signs of bodily ageing in a pre-Botox era. Belts, too, operate through a similar logic of containment, framing another notoriously soft part of the body. In Tysse’s installation, these anthropic accessories, clumsily off-scale, resemble attempts to stabilise matter in the process of transformation, entering a rather intimate sphere of attachment, where decoration and maintenance become ways of staying with what is lost. The result is both tender and grotesque. As for the bird feathers in the standing trunk, they animate the logs, granting them personality. This is also evident in the pair of small bronze root-like sculptures, each adorned with a collar hat that gives them a lively appearance, as if caught dancing. Or are all these ruffs rather disclosing a whole bunch of beheaded creatures? The doubt can’t but hover in unresolved suspension…

And of course, no parade of the dead would be complete without a ghost. A haunting cylindrical metallic grid rises in the space, shimmering with silver leaves that instil a spectral presence, bearing witness to those forms of disappearance that can no longer be kept at a distance, and allowing for extended grief. Tysse addresses the deeply human desire to preserve and immortalise, while simultaneously placing the death of ecological systems directly in front of us. In doing so, she also quietly invites to ponder on what is deemed worthy of preservation, and what is allowed to disappear unnoticed. The snag, after all, is not simply a lesser-known poetic symbol of mortality, but an increasingly vulnerable element within managed forests, where deadwood is often removed in the name of productivity. Together with this piece, two digital jacquard weavings introduce a synthetic dimension to the whole. Among dense branching tangles disclosing subterranean rib cages or ears popping out of wooden pockets, archaic trippy visions unfold. It’s the effect of the hallucinatory realisation that organic life has always communicated through hidden infrastructures exceeding individual bodies… and that the forest is very much alive (and dying) inside and outside us.

— Caterina Avataneo

Ingeborg Tysse (1992, Stavanger, Norway) lives and works in Oslo. She works across sculpture, installation, weaving, video, and costume, engaging with personal narratives, contemporary and historical myths, craft traditions and environmentalism. Central to her practice is an exploration of prosthetics as extensions of body, space, and time — material encounters between the organic and synthetic, the old and the new, the lost and the re-imagined. Within her work, prosthetics become metaphors for mental, physical, and metaphysical adaptation, addressing how bodies and environments adjust to loss, change, and synthetic intervention. Tysse holds an MFA from Bergen Art Academy from 2024 and a BFA from Oslo National Academy of the Arts, Textile Department, and from Iceland University of the Arts.

Recent solo exhibitions include: Neckwreath, Kiosken Studio, Bergen, Norway (2025); Wild Watch, Norwegian Sculptors Society, Oslo, Norway (2025); Chimed, Ditroit Dream, Milan, Italy (2025), Phantom Gut, L21 Gallery, Palma de Mallorca, Spain (2024); SKRØMT, Hordaland Kunstsenter, Bergen, Norway (2023). Her work has been exhibited in group exhibitions such as Hesten og Plysen, Gamle Innvik Ullvarefabrikk, Stryn, Norway (2025); fantom\\kopi\\klem\\print, She Will Art Space, Oslo, Norway (2025); This is personal, Bergen Kunsthall, Norway (2024); I arrived, I laid an egg, I left, L21 Gallery, Palma de Mallorca, Spain (2024); BACC Bangkok Art and Culture Centre, Thailand (2023); Shared Imaginations, KUNO Biennial, Vilnius, Lithuania (2023); Aeaea, Podium, Oslo, Norway (2023).`,
    previewImage: localExhibitionImage("OLD SNAG", "1.webp"),
    heroImage: localExhibitionImage("OLD SNAG", "1.webp"),
    images: localExhibitionGalleryWithOrientations("OLD SNAG", [
      { filename: "1.webp", orientation: "vertical" },
      { filename: "2.webp", orientation: "vertical" },
      { filename: "3.webp", orientation: "vertical" },
      { filename: "4.webp", orientation: "vertical" },
      { filename: "5.webp", orientation: "horizontal" },
      { filename: "6.webp", orientation: "horizontal" },
      { filename: "7.webp", orientation: "horizontal" },
      { filename: "8.webp", orientation: "vertical" },
      { filename: "9.webp", orientation: "vertical" },
      { filename: "10.webp", orientation: "vertical" },
      { filename: "11.webp", orientation: "vertical" },
      { filename: "12.webp", orientation: "vertical" },
      { filename: "13.webp", orientation: "vertical" },
      { filename: "14.webp", orientation: "vertical" },
      { filename: "15.webp", orientation: "vertical" },
      { filename: "16.webp", orientation: "vertical" },
      { filename: "17.webp", orientation: "vertical" },
    ], "Stefano Mattea"),
  },
  {
    slug: "passenger",
    title: "PASSENGER",
    subtitle: "Milan Zientara",
    venue: "Szaber Gallery, Kraków, Poland",
    gallery: "Szaber Gallery",
    city: "Kraków",
    country: "Poland",
    year: "2026",
    dates: "26 June 2026 — 26 July 2026",
    startDate: "26 June 2026",
    endDate: "26 July 2026",
    dateSource: "exhibition",
    artists: ["Milan Zientara"],
    photographer: "Michał Maliński @mlekoyo",
    description: `Is it possible to encounter one's own future? Is it possible to experience a life that has not yet happened, yet remains strangely familiar? PASSENGER begins with just such an encounter. In a train compartment, a young man encounters an older passenger – a storyteller, a storyteller, a figure both seductive and unsettling. With each successive story, another's biography reveals itself as a possible version of one's own life. The encounter with the stranger appears as an inevitable catastrophe.

The oil paintings, sculptures, and objects and reliefs made of leather, which comprise the thesis, create a narrative spanning six years of artistic work.

They are not illustrations of individual chapters of the thesis text, but material traces of psychic, affective, and existential processes. The exhibition functions as a passageway in which autobiographical experience is symbolized.

Leather, metal, and the dense paint substance retain traces of gesture, material folds, deformations, and rust. Organic and industrial materials create a psychic archive of experiences, and objects become carriers of memory. The aesthetics of beauty and damage present in these works reveal the complexity of survival mechanisms, compulsive repetition, and attempts to perfect creativity.

PASSENGER is a story about the beginner's mind, blind survival strategies, the destructive desire for closeness, violence disguised as care, and the process of detoxifying one's own biography. It is also an attempt to achieve "escape velocity"—the moment when it becomes possible to abandon old trajectories and develop new ways of being. It leaves the viewer wondering whether it is possible to learn to live as if one had received one's life a second time.`,
    previewImage: localExhibitionImage("PASSENGER", "0.webp"),
    heroImage: localExhibitionImage("PASSENGER", "0.webp"),
    images: localExhibitionGalleryWithOrientations(
      "PASSENGER",
      Array.from({ length: 14 }, (_, index) => ({
        filename: `${index}.webp`,
        orientation: [0, 5, 7, 8, 9, 10, 13].includes(index) ? "vertical" : "horizontal",
      })),
      "Michał Maliński @mlekoyo",
    ),
    instagramUrl: "https://www.instagram.com/milanzientara/",
  },
  {
    slug: "everything-comes-together-while-pushing-all-apart",
    title: "Everything comes together while pushing all apart",
    subtitle: "GROUP SHOW",
    venue: "Reaktor Wien",
    gallery: "Reaktor Wien",
    city: "Vienna",
    country: "Austria",
    year: "2026",
    dates: "3 June - 10 June 2026",
    startDate: "3 June 2026",
    endDate: "10 June 2026",
    dateSource: "exhibition",
    artists: [
      "Andrei Arion",
      "Claudiu Lazăr",
      "Albert Kaan",
      "Ana Ionescu",
      "Ana Petrovici",
    ],
    curator: "Roxana Morar",
    description: `Everything comes together while pushing all apart brings together the practices of Andrei Arion, Claudiu Lazăr, Ana Ionescu, Albert Kaan and Ana Petrovici in a shared environment shaped by material tensions, industrial traces, and individual systems of meaning.

Curator Roxana Morar assembled the show to explore how familiar materials, objects, and references can be reconfigured into alternative forms of presence. Each work possesses its own individuality; however, they now learn to coexist, creating new ways of reading through an act of translation.

All involved artists share an educational background in visual arts, transforming personal sensibilities into physical matter through sculpture and installation.`,
    previewImage: localExhibitionImage("EVERYTHING COMES TOGETHER WHILE PUSHING ALL APART", "cover.webp.webp"),
    heroImage: localExhibitionImage("EVERYTHING COMES TOGETHER WHILE PUSHING ALL APART", "cover.webp.webp"),
    images: localExhibitionGalleryWithOrientations("EVERYTHING COMES TOGETHER WHILE PUSHING ALL APART", [
      { filename: "cover.webp.webp", orientation: "vertical" },
      { filename: "photo_2026-06-30_11-41-00 (2).webp", orientation: "vertical" },
      { filename: "photo_2026-06-30_11-41-00 (3).webp", orientation: "vertical" },
      { filename: "photo_2026-06-30_11-41-00 (4).webp", orientation: "vertical" },
      { filename: "photo_2026-06-30_11-41-00 (5).webp", orientation: "vertical" },
      { filename: "photo_2026-06-30_11-41-00 (6).webp", orientation: "vertical" },
      { filename: "photo_2026-06-30_11-41-00 (7).webp", orientation: "vertical" },
      { filename: "photo_2026-06-30_11-41-00 (8).webp", orientation: "vertical" },
      { filename: "photo_2026-06-30_11-41-00 (9).webp", orientation: "vertical" },
    ]),
  },
  {
    slug: "first-date",
    title: "First Date",
    subtitle: "GROUP SHOW",
    venue: "Lodovico Corsini",
    gallery: "Lodovico Corsini",
    city: "Brussels",
    country: "Belgium",
    year: "2026",
    dates: "4 June - 25 July 2026",
    startDate: "4 June 2026",
    endDate: "25 July 2026",
    dateSource: "exhibition",
    artists: [
      "Alassan Diawara",
      "Antoine Espinasseau",
      "Bruno Zhu",
      "Calvin Marcus",
      "Camille Blatrix",
      "Chadwick Rantanen",
      "Clémentine Adou",
      "Emmanuel Beguinot",
      "Francesca Facciola",
      "Julien Meert",
      "Karl Wirsum",
      "Leqi Shi",
      "Lili Reynaud-Dewar",
      "Maggie Lee",
      "Matt Copson",
      "Meriem Bennani",
      "Oscar Kargruber",
      "René Heyvaert",
    ],
    description: `Lodovico Corsini is pleased to announce the inauguration of a new, permanent location in Brussels. Ahead of significant renovation works to come, the gallery presents First Date, an introductory exhibition that unfolds within the building as is: a former paint factory, later a hybrid office-cum-skatepark, now the gallery’s fixed address. Gathering works by represented artists alongside those of longstanding collaborators, affinities, and admired peers, the exhibition is animated by the excitement of a beginning. Like a first encounter, it is driven by curiosity, generosity, risk, and the possibility of unexpected connections.

Ideas of layering, sedimentation, and transformation weave throughout the exhibition, from which a strong sense of place emerges. Traces of successive lives and uses remain visible: fragments of previous occupiers coexist with more recent interventions, while stripped-back walls reveal earlier layers of construction, the building’s bare bones. The same logic of partial disclosure continues through a peephole in a door, offering visitors a glimpse behind the scenes of the ongoing renovation. First Date thus operates as both a preview of the gallery’s future and a peek through the strata of the past. The building’s initial life was as the home of Maison Linckx, founded in 1934. Known for its casein-based powdered paints, prized for their chalk-like finish and rich pigments, the factory was closely tied to Brussels’ artistic landscape, supplying materials to both artists and artisans. The gallery’s implantation marks a new phase in the life of the building, yet one that remains attuned to its genius loci: a place shaped by the making, circulation, and encounter of artistic ideas and materials.`,
    previewImage: localExhibitionImage("FIRST DATE", "1.jpeg"),
    heroImage: localExhibitionImage("FIRST DATE", "1.jpeg"),
    images: localExhibitionGalleryWithOrientations("FIRST DATE", [
      { filename: "1.jpeg", orientation: "vertical" },
      { filename: "2.jpeg", orientation: "horizontal" },
      { filename: "3.jpeg", orientation: "horizontal" },
      { filename: "4.jpeg", orientation: "vertical" },
      { filename: "5.jpeg", orientation: "horizontal" },
      { filename: "6.jpeg", orientation: "horizontal" },
      { filename: "7.jpeg", orientation: "vertical" },
      { filename: "8.jpeg", orientation: "horizontal" },
      { filename: "9.jpeg", orientation: "vertical" },
      { filename: "10.jpeg", orientation: "horizontal" },
      { filename: "11.jpeg", orientation: "horizontal" },
      { filename: "12.jpeg", orientation: "horizontal" },
      { filename: "13.jpeg", orientation: "vertical" },
      { filename: "14.jpeg", orientation: "vertical" },
    ]),
  },
  {
    slug: "axes",
    title: "AXES",
    subtitle: "KiefferWoodtli (Sara Kieffer & Lucien Woodtli)",
    venue: "Alvarez Chida",
    gallery: "Alvarez Chida",
    city: "Mexico City",
    country: "Mexico",
    year: "2026",
    dates: "23 May - 27 June 2026",
    startDate: "23 May 2026",
    endDate: "27 June 2026",
    dateSource: "exhibition",
    artists: ["KiefferWoodtli"],
    curator: "Arantza Hernandez",
    description: `AXES continues the duo’s long-term research into what it means to be part of natural forces that exceed us while simultaneously remaining separate from them. At the center of the exhibition stands Cave, an immersive elliptical installation wrapped in a crystallized textile skin, animated by a moving light and soundscape programmed to follow the site-specific solar path using NASA data. Inside, visitors encounter a shifting environment in which light, darkness, and time unfold as physical experience.

“Inside a cave, there is disorientation — an absence of center. You cannot fully locate yourself,” say KiefferWoodtli. “But gradually, another kind of orientation emerges: not from a single point, but from relation.”

The exhibition unfolds through interdependent conditions of light and darkness, order and chaos, and time and perception. The ellipse becomes a central figure in this thinking, describing a form of stability based on two foci rather than a single center. Across multiple works, AXES translates natural processes into tactile encounters. It ultimately proposes orientation not as certainty, but as a continuous and fragile act of positioning oneself within what cannot be fully measured.`,
    previewImage: localExhibitionImage("AXES", "1.jpeg"),
    heroImage: localExhibitionImage("AXES", "1.jpeg"),
    images: localExhibitionGalleryWithOrientations("AXES", [
      { filename: "1.jpeg", orientation: "vertical" },
      { filename: "2.jpeg", orientation: "horizontal" },
      { filename: "3.jpeg", orientation: "vertical" },
      { filename: "4.jpeg", orientation: "horizontal" },
      { filename: "5.jpeg", orientation: "horizontal" },
      { filename: "6.jpeg", orientation: "vertical" },
      { filename: "7.jpeg", orientation: "horizontal" },
      { filename: "8.jpeg", orientation: "vertical" },
      { filename: "9.jpeg", orientation: "horizontal" },
      { filename: "10.jpeg", orientation: "horizontal" },
      { filename: "11.jpeg", orientation: "horizontal" },
      { filename: "12.jpeg", orientation: "horizontal" },
      { filename: "13.jpeg", orientation: "vertical" },
      { filename: "14.jpeg", orientation: "vertical" },
      { filename: "15.jpeg", orientation: "horizontal" },
      { filename: "16.jpeg", orientation: "horizontal" },
      { filename: "17.jpeg", orientation: "horizontal" },
      { filename: "18.jpeg", orientation: "vertical" },
      { filename: "19.jpeg", orientation: "vertical" },
    ]),
  },
  {
    slug: "territories-of-extraction",
    title: "Territories of Extraction",
    subtitle: "Lorenzo Zerbini, Ester Gašparová, So Young Park",
    venue: "Arka Arka",
    gallery: "Arka Arka",
    city: "Vienna",
    country: "Austria",
    year: "2026",
    dates: "29 May — 11 June 2026",
    startDate: "29 May 2026",
    endDate: "11 June 2026",
    dateSource: "exhibition",
    artists: ["Lorenzo Zerbini", "Ester Gašparová", "So Young Park"],
    description: `Territories of Extraction examines how natural environments and bodies are structured through architectural, political, and symbolic systems. The exhibition brings together three artistic positions that, despite their different cultural backgrounds, share a common formal precision and conceptual consistency.

Ester Gašparová reflects on territorial interventions and the segmentation of landscapes that reorganize ecological systems. Lorenzo Zerbini transforms organic materials into technologically charged relics, questioning processes of archiving and the monumentalization of nature. So Young Park expands sculptural space through performative activation: her works negotiate transitional states between life and decay, turning the body itself into a site of regulation and vulnerability.

The exhibition approaches extraction not only in economic terms, but also as a spatial, epistemic, and affective condition. It asks how territories — both geographical and bodily — are measured, controlled, and recoded.`,
    previewImage: localExhibitionImage("Territories of Extraction", "1.jpeg"),
    heroImage: localExhibitionImage("Territories of Extraction", "1.jpeg"),
    images: localExhibitionGalleryWithOrientations(
      "Territories of Extraction",
      Array.from({ length: 22 }, (_, index) => ({
        filename: `${index + 1}.jpeg`,
        orientation: "horizontal",
      })),
    ),
  },
  {
    slug: "who-composes-the-song-of-the-crickets",
    title: "WHO COMPOSES THE SONG OF THE CRICKETS?",
    subtitle: "@yugoguerin",
    venue: "Galerie Suzanne Tarasieve, Paris, France",
    gallery: "Galerie Suzanne Tarasieve, Paris, France",
    city: "Paris",
    country: "France",
    year: "2026",
    dates: "Until 25 July 2026",
    endDate: "25 July 2026",
    dateSource: "exhibition",
    artists: ["@yugoguerin"],
    photographer: "@rebeccafanuelephoto",
    exhibitionText: "@manon_canto",
    description: `“We think we know what the song of the crickets is. No sooner do we hear it than nature seems to be right there. This sound carries a memory: that of a summer’s night, of an imagined countryside, of a landscape we recognise even before we have looked at it.

Who composes the song of the crickets arises from this confusion, at the moment when the obvious begins to crack, when the natural reveals the forms that have made it familiar.”`,
    previewImage: localExhibitionImage("WHO COMPOSES THE SONG OF THE CRICKETS", "1.jpg"),
    heroImage: localExhibitionImage("WHO COMPOSES THE SONG OF THE CRICKETS", "1.jpg"),
    images: localExhibitionGalleryWithOrientations(
      "WHO COMPOSES THE SONG OF THE CRICKETS",
      Array.from({ length: 8 }, (_, index) => {
        const imageNumber = index + 1;
        return {
          filename: `${imageNumber}.jpg`,
          orientation: imageNumber === 2 || imageNumber === 4 ? "horizontal" : "vertical",
        };
      }),
      "@rebeccafanuelephoto",
    ),
    instagramUrl: "https://www.instagram.com/HugoGuerin/",
  },
  {
    slug: "caged-movements",
    title: "Caged movements",
    subtitle: "Alex Bartsch, Hannah Hallermann, Manuel Goetz, Seongwon Park, Won Park, Lisa Sifkovits",
    venue: "NADAN Berlin",
    gallery: "NADAN Berlin",
    city: "Berlin",
    country: "Germany",
    year: "2026",
    dates: "19 June — 18 July 2026",
    startDate: "19 June 2026",
    endDate: "18 July 2026",
    dateSource: "exhibition",
    artists: [
      "Alex Bartsch",
      "Hannah Hallermann",
      "Manuel Goetz",
      "Seongwon Park",
      "Won Park",
      "Lisa Sifkovits",
    ],
    curator: "Nari Sarmini",
    photographer: "Hebo",
    description: `As Rosa Luxemburg stated, “Those who do not move do not feel their chains.” Following this premise, the idea of the cage in this exhibition concept entails a lived reality where movement is always tied to intersectional attributes and spatial constraints. Social norms, psychological barriers, political systems, controlled landscapes, and digital infrastructures continuously shape how bodies stretch, crumble, withdraw, and disappear in space. In this light, the exhibition understands movement as a condition for awareness and the possibility of change. Rather than understanding constraint solely as suppression, Caged Movements asks how restricted conditions define the ontology of beings and how they are re-negotiated and translated into artistic form.

Seongwon Park’s artistic practice entails wandering through Berlin’s neighborhoods, capturing visual fragments photographically, and rebuilding them in her studio using her own body as a primary measuring rule.

Lisa Sifkovits’ works Disturbia (2007) and Peeping Tom cover architectural surfaces and obstruct transparency, redirecting attention to opacity.

Hannah Hallermann ADJUSTER series function as interventions into politics of attention.

Alex Bartsch examines disciplinary systems through video installation Imitation Machines, tracing links between slavery and contemporary carceral systems.

Manuel Goetz works with industrial materials and sculptural forms oscillating between fetish and function.

Won Park explores restraint and geological time in Schwindel, Gefühle: The Altitude of Recollection (2025).`,
    previewImage: localExhibitionImage("Caged movements", "1.jpeg"),
    heroImage: localExhibitionImage("Caged movements", "1.jpeg"),
    images: localExhibitionGalleryWithOrientations(
      "Caged movements",
      Array.from({ length: 8 }, (_, index) => ({
        filename: `${index + 1}.jpeg`,
        orientation: "horizontal",
      })),
      "Hebo",
    ),
    instagramUrl: "https://www.instagram.com/saliva.live/",
  },
  {
    slug: "nike-ta-mere-will-fall-on-you",
    title: "NIKE, TA MÈRE (WILL FALL ON YOU)",
    subtitle: "Hyewon Mia Lee",
    venue: "ENSAPC / CROUS Paris",
    gallery: "ENSAPC / CROUS Paris",
    city: "Cergy / Paris",
    country: "France",
    year: "2026",
    dates: "04 April – 20 May 2026",
    startDate: "04 April 2026",
    endDate: "20 May 2026",
    dateSource: "exhibition",
    artists: ["Hyewon Mia Lee"],
    curator: "—",
    photographer: "Felix Szpirglas, Clémence Purkat, Cassandre Mretout",
    description: `This scenography is inspired by an accident that occurred in 1998 in a house in Yeonsu, Korea, where a Nike missile, fired by mistake, pierced through the roof and injured a housewife who was working in her kitchen. The tragedy of the housewife in her house comes simultaneously from inside and outside, as much through the role imposed on her within the home as through the violence of military forces.

The word "Nike," whose pronunciation resembles the French swear word "nique," thus gives the title the meaning of "Fuck, your mom."
Looking at the room upside down, the ceiling becomes the floor on which the bust of this anonymous woman lets out a scream in the face of a debris of missile that came from nowhere, as we say in Korean: "like a bolt of thunder in a dry sky".`,
    previewImage: localExhibitionImage("NIKE", "1.jpg"),
    heroImage: localExhibitionImage("NIKE", "1.jpg"),
    images: localExhibitionGalleryWithOrientations(
      "NIKE",
      Array.from({ length: 9 }, (_, index) => ({
        filename: `${index + 1}.jpg`,
        orientation: "vertical",
      })),
      "Felix Szpirglas, Clémence Purkat, Cassandre Mretout",
    ),
  },
  {
    slug: "stian-eide-kluge-at-rothaus-kunstnernes-hus-oslo",
    title: "STIAN EIDE KLUGE AT ROTHHAUS, KUNSTNERNES HUS, OSLO",
    subtitle: "Stian Eide Kluge",
    venue: "Kunstnernes Hus (Rothaus)",
    gallery: "Kunstnernes Hus (Rothaus)",
    city: "Oslo",
    country: "Norway",
    year: "2026",
    dates: "5 June — 21 June 2026",
    startDate: "5 June 2026",
    endDate: "21 June 2026",
    dateSource: "exhibition",
    artists: ["Stian Eide Kluge"],
    curator: "Aljoša Eraković, Matias Kiil",
    photographer: "Courtesy of the artist and Rothaus",
    description: `Candle wax lamps: steel and curved automotive glass and bolts and adhesive. A number of white candles. 90% paraffin, 10% stearin. Wick. Melting point: approx. 70˚C. Burns with a calm flame. The less steady, the more lifelike.

Candles: this includes tallow candles. Tallow: the fat found around the internal organs of ruminants. The combustion of tallow releases enough energy to sustain a (calm) flame. A flame is the light emitted by glowing gas.

Power supply: 230 V / 50 Hz. Light source: two incandescent bulbs: clear, classic, E27, 25W. Light output: approx. 2 watts. The remainder is released as heat (over 90%). Lamp holder, cord, plug, etc.

Represented by still life with light.

Untitled drawing (2026)
Colored pencil on paper, water-based stain on oak frame, glass
33 x 41 x 3 cm

Candle wax lamp (three-facet) (2026)
Laminated automotive glass, steel, bolts, silicone sealant, mounting adhesive, drum bung, incandescent light bulb, lamp socket, power cord, plug, candles
24 x 30 x 17 cm

Candle wax lamp (two-facet) (2026)
Same materials as above
40 x 39 x 21 cm

Hull (2026)
Wood batten, screws, polyurethane, print transfer on birch plywood, two-component polyurethane, water-based stain, UV-wax
42 x 40 x 64 cm`,
    previewImage: localExhibitionImage(
      "STIAN EIDE KLUGE AT ROTHAUS, KUNSTNERNES HUS, OSLO",
      "1.jpeg",
    ),
    heroImage: localExhibitionImage(
      "STIAN EIDE KLUGE AT ROTHAUS, KUNSTNERNES HUS, OSLO",
      "1.jpeg",
    ),
    images: localExhibitionGalleryWithOrientations(
      "STIAN EIDE KLUGE AT ROTHAUS, KUNSTNERNES HUS, OSLO",
      Array.from({ length: 10 }, (_, index) => {
        const imageNumber = index + 1;
        return {
          filename: `${imageNumber}.jpeg`,
          orientation: imageNumber === 7 ? "vertical" : "horizontal",
        };
      }),
      "Courtesy of the artist and Rothaus",
    ),
    instagramUrl: "https://kunstnerneshus.no/",
    sourceUrl: "https://kunstnerneshus.no/",
  },
  {
    slug: "tangled-in-shadows-from-an-old-drawer",
    title: "TANGLED IN SHADOWS FROM AN OLD DRAWER",
    subtitle: "Klaudia Figura",
    venue: "Łęctwo",
    gallery: "Łęctwo",
    city: "Poznań",
    country: "Poland",
    year: "2026",
    dates: "10 April — 26 May 2026",
    startDate: "10 April 2026",
    endDate: "26 May 2026",
    dateSource: "exhibition",
    artists: ["Klaudia Figura"],
    curator: "Przemek Sowiński",
    photographer: "Przemek Sowiński",
    exhibitionText: "Przemek Sowiński",
    description: `Klaudia Figura’s exhibition Tangled in Shadows from an Old Drawer creatively and critically explores the notion of a “romantic utopia” — a particular state of longing in which life might be more intense, more meaningful, and more complete than it appears within the conditions of contemporary reality. At its core, romanticism is driven less by fulfillment than by desire: the hope that another way of being is possible, beyond a world that, in its current form, feels insufficient, fragmented, and overly rationalized. The romanticization of glamour and luxury becomes a more comfortable strategy than a genuine attempt to confront the emptiness that surrounds us. In her latest works, Klaudia Figura investigates a state of uncertainty, creating images that resemble blurred layers and deposits of memory, where one is compelled to make a final decision or confront the consequences of previous choices. It is a feeling of losing one’s footing — where what is familiar, comforting, and seemingly predictable, marked by nostalgia, begins to disintegrate when confronted with our expectations. The space is populated by images of contemplative figures enclosed and trapped within comfortable forms, or within harsher environments that evoke the simplicity of distant times. Depictions of abandoned or decaying houses, as well as objects representing a particular symbolic capital, become vehicles for exploring the fragility and transience of our existence. It is a sensation akin to a childhood game with siblings that suddenly ends with someone getting hurt.

— Przemek Sowiński`,
    previewImage: localExhibitionImage("TANGLED_IN_SHADOWS_FROM_AN_OLD_DRAWER", "1.jpeg"),
    heroImage: localExhibitionImage("TANGLED_IN_SHADOWS_FROM_AN_OLD_DRAWER", "1.jpeg"),
    images: localExhibitionGalleryWithOrientations(
      "TANGLED_IN_SHADOWS_FROM_AN_OLD_DRAWER",
      Array.from({ length: 18 }, (_, index) => {
        const imageNumber = index + 1;
        const verticalImages = [1, 4, 7, 8, 10, 18];
        return {
          filename: `${imageNumber}.jpeg`,
          orientation: verticalImages.includes(imageNumber) ? "vertical" : "horizontal",
        };
      }),
      "Przemek Sowiński",
    ),
  },
  {
    slug: "double-star",
    title: "DOUBLE STAR",
    subtitle: "Paola Siri Renard",
    venue: "nouveaux deuxdeux",
    gallery: "nouveaux deuxdeux",
    city: "Munich",
    country: "Germany",
    year: "2026",
    dates: "15 May — 4 July 2026",
    startDate: "15 May 2026",
    endDate: "4 July 2026",
    dateSource: "exhibition",
    artists: ["Paola Siri Renard"],
    curator: "Luisa Seipp",
    photographer: "Dirk Tacke",
    description: `Paola Siri Renard's sculptures emerge from fragments, from architectural ornaments, equestrian monuments, industrial display systems, membranes, and skeletal forms that are extracted from historical structures and reassembled into unstable constellations. Her practice begins with research into architectural languages, from Gothic and Greco-Roman forms to Art Nouveau, not in order to reconstruct them, but to isolate details that reveal how histories of power become embedded within material surfaces. Ornament, in her work, is never merely decorative but rather evidence.

For her exhibition, Renard continues her investigation into monuments and the political symbolism of the horse. Public equestrian monuments have historically functioned as instruments of domination. They monumentalize military authority, colonial conquest, and heroic masculinity while naturalizing these narratives within urban space. Yet the horse itself occupies an ambiguous role within these structures, being both an emblem of power and suppressed body, vehicle of control and living instrument of labour, war, and extraction.

Rather than representing the whole monumental figure, the artist removes the rider and fragments the horse, dismantling the monument from below and isolating its legs - exposing their internal anatomies. Bones, membranes, and organic structures emerge beneath metallic skins, as though the sculptures were caught in a state of mutation. Seven aluminum cast sculptures derived from preparatory maquettes oscillate between archive and specimen. Dispersed individually, these entities form a fictive constellation. Each leg is divided into two distinct faces - one exaggerated and muscular, the other architectural and ornamental - generating a specular image. The cut creates a mirrored interstice from which a second identity emerges. The works suggest that something continues to grow underneath the surface, a latent violence embedded within architecture, monuments, and historical memory itself.

The artist's engagement with Art Nouveau and colonial history is informed in part by the writings of art historian Debora Silverman, whose research traces how vegetal and ornamental motifs in fin-de-siècle architecture were entangled with colonial expansion and the circulation of exoticized forms. Renard extends this reading into the present, approaching architecture as a living political body that absorbs systems of domination into its decorative skin. In her sculptures, architectural forms become porous, unstable, and bodily.

A central installation culminates this research. Conceived as a recomposed body that merges details drawn from the seven preceding models, the sculpture is fragmented into twelve elements arranged in a circular formation, evoking cyclical time and orbital motion. Suspended from modular stainless-steel structures reminiscent of slaughterhouse hangings, the fragments can either be assembled into a recognizable figure or dispersed throughout the space, oscillating between figuration and abstraction. Echoing the motif of the zipper, the structures present each configuration as a provisional and transitional state.

The title Double Star refers to the astronomical phenomenon in which two celestial bodies orbit around a shared centre. Renard uses this idea as a metaphor for history and perception - meanings change depending on perspective, distance, and position. What appears stable or coherent from one viewpoint may crumble from another.`,
    previewImage: localExhibitionImage("Double_Star", "2.webp"),
    heroImage: localExhibitionImage("Double_Star", "2.webp"),
    images: localExhibitionGalleryWithOrientations(
      "Double_Star",
      [
        { filename: "2.webp", orientation: "vertical" },
        { filename: "5.webp", orientation: "horizontal" },
        { filename: "6.webp", orientation: "vertical" },
        { filename: "7.webp", orientation: "vertical" },
        { filename: "8.webp", orientation: "vertical" },
        { filename: "9.webp", orientation: "vertical" },
        { filename: "10.webp", orientation: "vertical" },
        { filename: "12.webp", orientation: "vertical" },
        { filename: "14.webp", orientation: "vertical" },
        { filename: "15.webp", orientation: "vertical" },
        { filename: "17.webp", orientation: "vertical" },
        { filename: "18.webp", orientation: "vertical" },
        { filename: "19.webp", orientation: "horizontal" },
        { filename: "20.webp", orientation: "vertical" },
        { filename: "21.webp", orientation: "vertical" },
        { filename: "22.webp", orientation: "vertical" },
        { filename: "23.webp", orientation: "vertical" },
        { filename: "24.webp", orientation: "vertical" },
        { filename: "25.webp", orientation: "vertical" },
        { filename: "26.webp", orientation: "vertical" },
        { filename: "27.webp", orientation: "vertical" },
        { filename: "28.webp", orientation: "vertical" },
        { filename: "29.webp", orientation: "vertical" },
        { filename: "30.webp", orientation: "vertical" },
      ],
      "Dirk Tacke",
    ),
    instagramUrl: "https://nouveauxdeuxdeux.com/",
    sourceUrl: "https://nouveauxdeuxdeux.com/",
    source: "@paolasirirenard",
  },
  {
    slug: "rootkit",
    title: "ROOTKIT",
    subtitle: "S.A Mayer",
    venue: "BENTA",
    gallery: "BENTA",
    city: "Istanbul",
    country: "Turkey",
    year: "2026",
    dates: "5 June — 18 July 2026",
    startDate: "5 June 2026",
    endDate: "18 July 2026",
    dateSource: "exhibition",
    artists: ["S.A Mayer"],
    curator: "Barış Çavuşoğlu",
    photographer: "Barış Özçetin",
    exhibitionText: "S.A Mayer",
    description: `Responding to:

Nokia phones shipped freight, paid via an endless chain of wire transfers.

An Italian fertilizer company under the umbrella of an American agricultural conglomerate, packages adorned with quaint farmer archetypes silhouetted against a skyline.

WhatsApp chats of crudely photographed, crudely made munitions overlaid with dated primetime TV references.

Endless shell companies on either side of an opaque transaction.

— S.A Mayer`,
    previewImage: localExhibitionImage("ROOTKIT", "1.webp"),
    heroImage: localExhibitionImage("ROOTKIT", "1.webp"),
    images: localExhibitionGalleryWithOrientations(
      "ROOTKIT",
      [
        { filename: "1.webp", orientation: "vertical" },
        { filename: "2.webp", orientation: "vertical" },
        { filename: "3.webp", orientation: "vertical" },
        { filename: "4.webp", orientation: "vertical" },
        { filename: "5.webp", orientation: "vertical" },
        { filename: "6.webp", orientation: "vertical" },
        { filename: "7.webp", orientation: "horizontal" },
        { filename: "8.webp", orientation: "vertical" },
        { filename: "9.webp", orientation: "vertical" },
        { filename: "10.webp", orientation: "vertical" },
        { filename: "11.webp", orientation: "vertical" },
        { filename: "12.webp", orientation: "horizontal" },
        { filename: "13.webp", orientation: "vertical" },
        { filename: "14.webp", orientation: "vertical" },
        { filename: "15.webp", orientation: "vertical" },
        { filename: "16.webp", orientation: "vertical" },
        { filename: "17.webp", orientation: "vertical" },
        { filename: "18.webp", orientation: "horizontal" },
      ],
      "Barış Özçetin",
    ),
    instagramUrl: "https://www.ofluxo.net/rootkit-s-a-mayer-benta-istanbul/",
    sourceUrl: "https://www.ofluxo.net/rootkit-s-a-mayer-benta-istanbul/",
  },
  {
    slug: "actualization-machine",
    title: "ACTUALIZATION MACHINE",
    subtitle: "Nina Hartmann",
    venue: "Silke Lindner",
    gallery: "Silke Lindner",
    city: "New York",
    country: "United States",
    year: "2026",
    dates: "24 April — 30 May 2026",
    startDate: "24 April 2026",
    endDate: "30 May 2026",
    dateSource: "exhibition",
    artists: ["Nina Hartmann"],
    photographer: "Chris Herity",
    description: `Silke Lindner is pleased to announce Actualization Machine, the second solo exhibition with New York-based artist Nina Hartmann.

Hartmann's new body of work, comprised of shaped pieces of encaustic panels, resin sculptures, and lightboxes, carry images collected during her research into the U.S. government's attempts to understand and develop methods of mind control, telepathy, and other mysterious phenomena during the Cold War.

In 1979 former State Department officer turned journalist John Marks published The Search for the "Manchurian Candidate". This explosive book laid out evidence of the controversial U.S. government efforts to develop methods of behavioral control under the umbrella of MKUltra and its subprojects in the 1950's and 1960's.

In an era of existential panic and paranoia, when the future was uncertain and anything seemed possible, U.S. agencies investigated intelligence suggesting that the Soviet Union was researching parapsychological tools and individuals with paranormal abilities. This instigated the Stargate Project and related operations.

The body of work endeavors to connect related Cold War timelines through the shared theme of attempts to gain control over the unknown. In Hartmann's works, these reality-bending events exist at the intersection of mysticism, magic, and the power of belief, linked through diagrammatic compositions that operate within and across individual pieces.

Understanding the historical origins of attempted psychological control serves as a focused study within a larger inquiry of Hartmann's practice, which highlights and examines the ways in which humans are influenced by information on a daily basis through aesthetics, symbolism, and context.`,
    previewImage: localExhibitionImage("ACTUALIZATION_MACHINE", "1.jpeg"),
    heroImage: localExhibitionImage("ACTUALIZATION_MACHINE", "1.jpeg"),
    images: localExhibitionGalleryWithOrientations(
      "ACTUALIZATION_MACHINE",
      [
        { filename: "1.jpeg", orientation: "horizontal" },
        { filename: "2.jpeg", orientation: "horizontal" },
        { filename: "3.jpeg", orientation: "vertical" },
        { filename: "4.jpeg", orientation: "horizontal" },
        { filename: "5.jpeg", orientation: "horizontal" },
        { filename: "6.jpeg", orientation: "vertical" },
        { filename: "7.jpeg", orientation: "horizontal" },
        { filename: "8.jpeg", orientation: "vertical" },
        { filename: "9.jpeg", orientation: "horizontal" },
      ],
      "Chris Herity",
    ),
    instagramUrl: "https://artviewer.org/nina-hartmann-at-silke-lindner-new-york/",
    sourceUrl: "https://artviewer.org/nina-hartmann-at-silke-lindner-new-york/",
  },
  {
    slug: "haus-der-luge",
    title: "HAUS DER LÜGE",
    subtitle: "Radosław Chorab, Czaro Malinkiewicz, Mikołaj Sobotka, Milan Zientara",
    venue: "Przeciąg Gallery",
    gallery: "Przeciąg Gallery",
    city: "Warsaw",
    country: "Poland",
    year: "2026",
    dates: "30 May — 5 July 2026",
    startDate: "30 May 2026",
    endDate: "5 July 2026",
    dateSource: "exhibition",
    artists: [
      "Radosław Chorab",
      "Czaro Malinkiewicz",
      "Mikołaj Sobotka",
      "Milan Zientara",
    ],
    curator: "Kuba Brzegowy",
    photographer: "Zuzanna Wudarska",
    description: `The exhibition "Haus Der Lüge" addresses questions that reach into the deepest layers of human existence. Here, the sacred is not separated from the profane; the two constantly permeate one another. The exhibition's concept brings together a search for mystical value with an aesthetic of horror.

Both visually and conceptually, the exhibition draws significant inspiration from Pier Paolo Pasolini's "Teorema" and Elias Merhige's experimental film "Begotten". This atmosphere of dark spirituality is reinforced by the recurring motif of mud, which acquires a multifaceted significance within the exhibition. It appears as an ambivalent, liminal material, situated between form and formlessness. Mud not only evokes primordial creation myths but also metaphorically points to existence as a continuous process of becoming and, simultaneously, of disintegration.

Mud embodies what is lowly and corporeal, while also penetrating the darker recesses of the soul — spaces that are not entirely devoid of hope. The exhibition further explores the theme of spiritual exaltation, which may assume mystical forms that verge on madness.

"Haus Der Lüge" reflects on experiences of spiritual transcendence that can take extreme forms and are often intertwined with suffering. The works brought together in the exhibition create a kind of membrane of fears and images that shape our sense of belonging, value, and mysticism.`,
    previewImage: localExhibitionImage("Haus_Der_Lüge", "1.jpg"),
    heroImage: localExhibitionImage("Haus_Der_Lüge", "1.jpg"),
    images: localExhibitionGalleryWithOrientations(
      "Haus_Der_Lüge",
      [
        { filename: "1.jpg", orientation: "vertical" },
        { filename: "2.jpg", orientation: "vertical" },
        { filename: "3.jpg", orientation: "vertical" },
        { filename: "4.jpg", orientation: "vertical" },
        { filename: "5.jpg", orientation: "vertical" },
        { filename: "5.1.jpg", orientation: "horizontal" },
        { filename: "6.jpg", orientation: "horizontal" },
        { filename: "7.jpg", orientation: "vertical" },
        { filename: "8.jpg", orientation: "horizontal" },
        { filename: "9.jpg", orientation: "vertical" },
        { filename: "10.jpg", orientation: "vertical" },
        { filename: "11.jpg", orientation: "horizontal" },
        { filename: "12.jpg", orientation: "vertical" },
        { filename: "13.jpg", orientation: "horizontal" },
        { filename: "14.jpg", orientation: "horizontal" },
        { filename: "15.jpg", orientation: "horizontal" },
        { filename: "16.jpg", orientation: "horizontal" },
        { filename: "17.jpg", orientation: "vertical" },
        { filename: "18.jpg", orientation: "vertical" },
        { filename: "19.jpg", orientation: "vertical" },
        { filename: "20.jpg", orientation: "horizontal" },
      ],
      "Zuzanna Wudarska",
    ),
  },
  {
    slug: "dislocation",
    title: "DISLOCATION",
    subtitle: "Eva Chapkin",
    venue: "Arsmonitor",
    gallery: "Arsmonitor",
    city: "Bucharest",
    country: "Romania",
    year: "2026",
    dates: "21 May — 3 July 2026",
    startDate: "21 May 2026",
    endDate: "3 July 2026",
    dateSource: "exhibition",
    artists: ["Eva Chapkin"],
    curator: "Lina Țărmure",
    photographer: "Ionuț Dobre",
    description: `Eva Chapkin (b. 2003) was born in Chișinău, grew up in Tiraspol, Transnistria, received Bulgarian citizenship through her maternal line, and subsequently moved to Romania — first to Constanța, then to Bucharest, where she completed her undergraduate studies at the National University of Arts. The artist's biographical trajectory, marked by successive transitions between geographies, languages, and identities, constitutes not merely the context but the very raw material of her artistic practice.

Working with photography, Eva Chapkin obsessively returns to the image of her own body as a space of negotiation between belonging and estrangement. The frontal approach to her own representation is part of a continuous reconstruction of the self, creating subjects out of backgrounds — more precisely, out of the places she passes through. In this sense, the image, for Eva Chapkin, is a personal mnemosyne: a Warburgian montage of an obscure and intimate micro-history, a mnemonic journal of permanent displacements. This transitive condition and this way of being in the world are simultaneously a means of expression and of inquiry. Photography thus acquires the function of a witness to emotional geographies, inverting the trauma of dislocation by imprinting the spaces that temporarily shelter her with her own image.

Under the auspices of an identity constituted through a series of processes opposed to the fixing of a personal and social self — through destabilization, transition, and affective contamination — the exhibition Dislocation proposes a reading of photography as a practice of permanent presence: a way of remaining in contact with oneself and with one's own experience, precisely in those moments when that experience becomes most difficult to hold in place. The exhibition functions as a montage — an accumulation of obsessions, recurrences, and fragments — that describes Eva Chapkin's practice over recent years.

For Eva Chapkin, the image of the body exceeds the social stakes. The body becomes both presence and trace, and photography is a space in which identity is continuously negotiated. The self-portrait here plays a role of self-recovery — a gesture of mastery over one's own body, but also a fragile attempt to fix something that is in continuous motion.

Perhaps in this continuous exchange of roles — between body and objects, between image and text, between presence and disappearance, between the familiar and the foreign — the title Dislocation simultaneously illuminates both the condition of leaving a place and the visceral need for fixity and anchorage.`,
    previewImage: localExhibitionImage("DISLOCATION", "1.jpeg"),
    heroImage: localExhibitionImage("DISLOCATION", "1.jpeg"),
    images: localExhibitionGalleryWithOrientations(
      "DISLOCATION",
      [
        { filename: "1.jpeg", orientation: "vertical" },
        { filename: "2.jpeg", orientation: "horizontal" },
        { filename: "3.jpeg", orientation: "vertical" },
        { filename: "4.jpeg", orientation: "horizontal" },
        { filename: "5.jpeg", orientation: "horizontal" },
        { filename: "6.jpeg", orientation: "horizontal" },
        { filename: "7.jpeg", orientation: "horizontal" },
        { filename: "8.jpeg", orientation: "horizontal" },
        { filename: "9.jpeg", orientation: "horizontal" },
        { filename: "10.jpeg", orientation: "horizontal" },
        { filename: "11.jpeg", orientation: "horizontal" },
        { filename: "12.jpeg", orientation: "horizontal" },
        { filename: "13.jpeg", orientation: "horizontal" },
        { filename: "14.jpeg", orientation: "vertical" },
        { filename: "15.jpeg", orientation: "vertical" },
        { filename: "16.jpeg", orientation: "vertical" },
        { filename: "17.jpeg", orientation: "vertical" },
        { filename: "18.jpeg", orientation: "horizontal" },
        { filename: "19.jpeg", orientation: "horizontal" },
        { filename: "20.jpeg", orientation: "horizontal" },
        { filename: "21.jpeg", orientation: "horizontal" },
        { filename: "22.jpeg", orientation: "horizontal" },
        { filename: "23.jpeg", orientation: "vertical" },
        { filename: "24.jpeg", orientation: "horizontal" },
      ],
      "Ionuț Dobre",
    ),
    instagramUrl: "https://artviewer.org/eva-chapkin-at-arsmonitor-bucharest/",
    sourceUrl: "https://artviewer.org/eva-chapkin-at-arsmonitor-bucharest/",
  },
  {
    slug: "accomplice",
    title: "ACCOMPLICE",
    subtitle: "Yein Lee",
    venue: "Cukrarna",
    gallery: "Cukrarna",
    city: "Ljubljana",
    country: "Slovenia",
    year: "2026",
    dates: "30 August 2026",
    startDate: "30 August 2026",
    endDate: "30 August 2026",
    dateSource: "exhibition",
    artists: ["Yein Lee"],
    curator: "Ema Ograjenšek",
    photographer: "Blaž Gutman, Domen Pal",
    description: `Accomplice brings together a new series of sculptural works by Vienna-based South Korean artist Yein Lee. Developed specifically for the Parterre Gallery, the exhibition consists of five sculptures and a ground-based pool installation. Extending into the architecture of the gallery, the works form a landscape of precarious relations that explores conditions of material instability and spatial uncertainty.

At the centre of Yein Lee's sculptures and installations lies a condition of material becoming. The artist approaches form and matter not as fixed entities but as sites of continual negotiation, shaped by forces that exceed stable control. Within Lee's practice, processes that transform, deform, and adapt resonate with broader conditions of ecological stress and geopolitical volatility, in which environments, infrastructures, and bodies are increasingly exposed to pressure and fatigue, causing instability. Rather than presenting matter as passive or inert, the works foreground its capacity to respond, shift, and reorganise under strain. Material thus appears as active and relational - continuously transforming in response to the tensions and uncertainties that structure contemporary environmental and political realities.

Within this framework, Lee's works emerge through processes of abrasion, accumulation, and provisional balance. Surfaces appear fractured, material elements lean or suspend themselves in precarious alliances, and the sculptural field unfolds as a landscape of tensions.

The five sculptures are distributed across the Parterre Gallery without forming a fixed pattern or centralised arrangement. Varying in scale, some works stand independently while others gather into loose clusters, creating shifting points of attention throughout the space. A larger sculptural element descends from the ceiling, its form mirrored in the reflective surface of the pool below. The reflection establishes a vertical axis that connects the suspended sculpture to the mirrored geometries of the surrounding space.

Each sculpture is characterised by biomorphic forms that evoke structural features found in foliage and twigs, such as veins and vascular systems that transport nutrients through plant bodies. At the same time, these forms recall elements of industrial infrastructure - cables, wires, and steel pipes that channel energy, information, or fluids through technological networks. By deliberately bringing these visual and structural references into proximity, Lee foregrounds formal correspondences between botanical and industrial bodies, tracing the shared structural logics that traverse natural and manufactured systems.

The artist works with polymer gypsum, epoxy putty, and found steel. Gypsum casts are taken from materials and surfaces in unstable or transitional states, carrying their instability and transience as imprints. The casts register moments of pressure, erosion, or displacement, allowing processes of transformation to remain visible within the sculptural form. As such, they can be understood as trace bodies: forms that retain the marks of their making and emerge less as pure authorial expressions than as the result of ongoing exchanges between artist and material.

As the artist notes: "The works protrude out of my own form and into their own. There is an inversion, a turning over, or an exposing of their underbelly. I am drawn to the tension that holds them; the quiet strength and ambivalence between what is fragile and what is rigid, between what yields softly and what resists."

These roles extend into the exhibition space, as the viewer does not simply observe but navigates a field of tensions. Movement and shifting vantage points continually recompose the constellation of the works, drawing the viewer into the same dynamic relations that shape their formation. In this way, the sculptures appear to expand beyond their physical boundaries, reflecting both the material processes from which they emerged and the broader conditions that shape the environments they inhabit.`,
    previewImage: localExhibitionImage("ACCOMPLICE BY YEIN LEE", "1.jpeg"),
    heroImage: localExhibitionImage("ACCOMPLICE BY YEIN LEE", "1.jpeg"),
    images: [
      ...localExhibitionGallery(
        "ACCOMPLICE BY YEIN LEE",
        ["1.jpeg", "2.jpeg", "3.jpeg", "4.jpeg", "5.jpeg"],
        "horizontal",
        "Blaž Gutman, Domen Pal",
      ),
      ...localExhibitionGallery(
        "ACCOMPLICE BY YEIN LEE",
        ["6.jpg", "7.jpg", "8.jpg", "9.jpg"],
        "vertical",
        "Blaž Gutman, Domen Pal",
      ),
    ],
    instagramUrl: "https://www.instagram.com/cukrarna.art/",
  },
  {
    slug: "dont-trust-the-rabbit",
    title: "DON'T TRUST THE RABBIT",
    subtitle: "Group Exhibition",
    venue: "SSK Düsseldorf",
    gallery: "SSK Düsseldorf",
    city: "Düsseldorf",
    country: "Germany",
    year: "2026",
    dates: "24 April — 30 May 2026",
    startDate: "24 April 2026",
    endDate: "30 May 2026",
    dateSource: "exhibition",
    artists: [
      "Sophie Schweighart",
      "Carmen Schaich",
      "Catherine Lorent",
      "Birgit Holmer",
      "Iris Helena Hamers",
      "Alexander Follez",
      "Till Bodeker",
    ],
    curator: "Jeannine Burch",
    photographer: "Till Bodeker",
    description: `A small hole in a counter, crudely drilled, of unknown origin, possibly left behind from when the space was still a stamp factory. The show takes the flaw as its starting point. Fog rises from the opening. Above it, a scanned and 3D-printed body bent over the hole, its joints articulated, its surface white. Across the room, an old cucumber variety grows inside sealed glass pill capsules, real but pre-shaped by the container. A quadruped robot moves through the space with a thermal camera on its back; visitors appear on monitors as accumulating heat silhouettes. Nearby, a series of server-rack frames in raw aluminium hold large-format image fragments, photographic and generated. Upstairs, a walk-in architecture run by an AI that responds to movement with light and sound, its answers dripping from a tap in morse code. Further along, an e-guitar in a wig holds a single distorted note, triggered by a motion sensor and slowly fading as one leaves the show.`,
    previewImage: localExhibitionImage("DON’T TRUST THE RABBIT", "1.webp"),
    heroImage: localExhibitionImage("DON’T TRUST THE RABBIT", "1.webp"),
    images: localExhibitionGallery(
      "DON’T TRUST THE RABBIT",
      [
        "1.webp",
        "2.webp",
        "3.webp",
        "4.webp",
        "5.webp",
        "6.webp",
        "7.webp",
        "8.webp",
        "9.webp",
        "10.webp",
        "11.webp",
        "12.webp",
        "13.webp",
        "14.webp",
        "15.webp",
        "16.webp",
      ],
      "vertical",
      "Till Bodeker",
    ),
    instagramUrl: "https://www.instagram.com/sskduesseldorf/",
  },
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

const mappedExhibitions: Exhibition[] = exhibitionSeeds.map(
  ({ location, year, previewImage, heroImage, images, ...exhibition }) => ({
    ...exhibition,
    city: exhibition.city ?? location,
    year: year?.toString(),
    tags: tagsForExhibition(exhibition),
    // Prefer the seed's own coverImage (e.g. a bespoke shot dropped
    // into the exhibition's own folder); fall back to the title-based
    // lookup in coverImages.ts so all pre-existing exhibitions keep
    // their /cover/*.webp thumbnails.
    coverImage: exhibition.coverImage ?? coverImageForTitle(exhibition.title),
    previewImage,
    heroImage: heroImage ?? previewImage,
    images,
  }),
);

const HOMEPAGE_ORDER = [
  "techno-worlds-final-sampling",
  "axial-core",
  "after-the-offerings",
  "tangerine-reverie",
  "ethereal-robes-of-vulnerability",
  "what-we-see-what-looks-back-at-us",
  "tantalo",
  "nymphenbrunnen",
  "a-gentle-kiss-on-a-double-forehead",
  "impotenza",
  "der-kopf-ist-rund",
  "the-stasis-garden-or-pixies-memories",
  "24-preludes-op-34-no-22-in-g-minor-adagio",
  "we-are-deeply-alarmed-and-express-our-grave-concern",
  "triangle-reshapes-the-o-of-my-mouth",
  "joy-ride",
  "fault-lines",
  "make-me-yours",
  "you-cant-stop-the-world-from-being-bad",
  "old-snag",
  "passenger",
  "everything-comes-together-while-pushing-all-apart",
  "first-date",
  "axes",
  "territories-of-extraction",
  "who-composes-the-song-of-the-crickets",
  "caged-movements",
  "nike-ta-mere-will-fall-on-you",
  "stian-eide-kluge-at-rothaus-kunstnernes-hus-oslo",
  "tangled-in-shadows-from-an-old-drawer",
  "double-star",
  "rootkit",
  "actualization-machine",
  "haus-der-luge",
  "dislocation",
  "accomplice",
  "dont-trust-the-rabbit",
  "profusion-antagonist-wishlist",
  "the-beautiful-remains",
  "grass-on-roadside-4",
  "metempsychosis",
  "when-doors-close-walls-rise",
  "edges-that-blur-bodies-that-fold-into-something-other",
  "exuviae",
  "choice-dirt",
  "love",
  "a-blade-unheld",
  "tomorrows-forecast-white-clouds-grey-dogs",
  "incommunicability-is-itself-a-source-of-pleasures",
  "the-stages-of-grief",
  "work-of-proof",
  "kassandra",
  "bidim-blo",
  "transparency-report",
  "external-cryogenics",
  "metempsychosis-the-passion-of-pneumatics",
  "a-certain-instance-of-verrition",
  "the-worm-at-the-core",
  "contempt",
  "enter-woodland-spirits",
  "keteros",
  "skeletal-scenes",
  "human-is",
  "total-internal-reflection",
  "eutrophy",
  "petrichor",
  "limo",
  "deep-sea-fish",
  "dialects-of-the-deep",
  "farm",
  "falene",
  "the-neoliberal-urge-to-curate-a-friendsgroup",
  "tipping-point-phantoms",
  "down-the-rabbit-hole-2024",
  "tar-star",
  "lunar-ensemble-for-uprising-seas",
  "sweet-garden-of-vanished-pleasures",
  "tissu-expanse",
  "distant-endless-hum",
  "metal-memory",
  "vitals-vapors",
  "luca",
  "encuentro",
  "the-room-i",
  "green-growth",
  "die-sprache-der-voegel",
  "the-last-drawer-on-the-left",
  "begone-estrone",
  "just-about-and-never",
  "with-feathers-and-flesh",
  "afterlifes",
  "fantasy-vanishes-in-flesh",
  "crash-paendemonia",
  "parade",
  "the-language-of-the-enemy",
  "weaving-back-to-common-grounds",
  "myths-from-smoldering-skies",
  "thresholds",
  "the-signal-the-noice",
  "motions-to-unfurl",
  "bucolica",
  "doubled-presence-in-a-disembodied-space",
  "the-collapse-manual-the-post-human-field",
  "common-landscapes",
  "growing-body",
  "soft-sighs-synthesis",
  "moonlit-botanical-colour-theories",
  "call-me-we-by-lom-of-lama",
  "main-de-fer-gant-de-velours",
  "massage-platz",
  "even-spectres-can-tire",
  "47-24-35-n-9-44-20-e",
  "the-shape-of-a-scar",
  "parachute-group-exhibition",
  "coagvla",
  "supported-files",
  "lullaby-blossoms",
  "liminality",
  "mimicking-eternity",
  "blue-blooded",
  "chewing-gum-in-the-motherboard-group-exhibition",
  "ausserkoerperliche-erfahrung-wandering-spirit",
  "call-someone-group-exhibition",
  "presence-by-proxy",
  "lost-encounters-they-cling",
  "pulses-within",
  "sweet-world-1",
  "paradise-rot",
  "tactics-for-an-era-group-show",
  "third-skin",
  "desiring-machines",
] as const;

const homepageOrderIndex = new Map<string, number>(HOMEPAGE_ORDER.map((slug, index) => [slug, index]));

export const exhibitions: Exhibition[] = [...mappedExhibitions].sort((first, second) => {
  const firstIndex = homepageOrderIndex.get(first.slug);
  const secondIndex = homepageOrderIndex.get(second.slug);

  if (firstIndex !== undefined && secondIndex !== undefined) {
    return firstIndex - secondIndex;
  }
  // New exhibitions whose slug is not yet listed in HOMEPAGE_ORDER float to the
  // top of the feed automatically. Slugs that ARE in HOMEPAGE_ORDER always stay
  // in their fixed positions — adding a new exhibition never moves them.
  // Convention: new seeds go at the top of exhibitionSeeds; among two "unlisted"
  // seeds, the earlier position in exhibitionSeeds wins (Array.prototype.sort is
  // stable), so the most recently added seed appears first.
  if (firstIndex !== undefined) return 1;
  if (secondIndex !== undefined) return -1;

  return 0;
});

export function getExhibition(slug: string) {
  return exhibitions.find((exhibition) => exhibition.slug === slug);
}

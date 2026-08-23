import { getExhibition } from "@/data/exhibitions";
import { getEditorialArtist } from "@/data/editorial";

// A curated Editorial article that groups existing exhibitions from the
// FindArt database under a shared theme. Everything except the intro
// (title, subtitle, cover image and per-exhibition data) is derived from
// the exhibition entries at render time, so publishing another article
// only requires adding an entry to `editorialSelections` below.
type EditorialSelectionBase = {
  slug: string;
  // The article H1. Kept editorial rather than SEO-title flavored.
  title: string;
  // Short subtitle displayed under the H1.
  subtitle: string;
  // Optional overrides for the browser tab / meta description when the
  // editorial-facing title reads differently from the SEO title Google
  // should rank against.
  seoTitle?: string;
  seoDescription?: string;
  // 100–150 word editorial introduction. Handwritten so we can speak
  // to real cross-cutting ideas rather than glue tags together.
  intro: string;
  publishedAt: string;         // ISO date, used in Article JSON-LD
  publishedAtDisplay: string;  // Human date shown in the byline row
};

export type ExhibitionEditorialSelection = EditorialSelectionBase & {
  kind: "exhibitions";
  // Cover image: pull the visual straight from one of the article's
  // exhibitions so we don't duplicate assets. imageIndex defaults to 0
  // (== the exhibition's previewImage).
  coverExhibitionSlug: string;
  coverImageIndex?: number;
  // Ordered list of exhibition slugs. Every slug must exist in the
  // exhibitions dataset — a missing slug throws at build time (see the
  // validator below) rather than silently rendering an empty section.
  exhibitionSlugs: string[];
  // Optional handwritten 70–120 word paragraph per exhibition slug.
  // When present it replaces the auto-excerpt so the article can carry
  // unique editorial text rather than reprinting the source description.
  perExhibitionText?: Record<string, string>;
};

export type ArtistEditorialSelection = EditorialSelectionBase & {
  kind: "artists";
  // The cover and the section visuals remain existing FindArt assets.
  coverArtistSlug: string;
  selectedArtists: Array<{
    artistName: string;
    editorialArtistSlug?: string;
    featuredExhibitionSlug?: string;
  }>;
  perArtistText: Record<string, string>;
};

export type EditorialSelection = ExhibitionEditorialSelection | ArtistEditorialSelection;

export const editorialSelections: EditorialSelection[] = [
  {
    kind: "exhibitions",
    slug: "contemporary-art-exhibitions-paris-2026",
    title: "Paris, 2026: Selected Exhibitions",
    subtitle:
      "A curated selection of contemporary art exhibitions presented across Paris in 2026.",
    seoTitle: "Contemporary Art Exhibitions in Paris 2026 | FindArt Platform",
    seoDescription:
      "Explore a curated selection of contemporary art exhibitions presented across Paris in 2026, featuring artists, galleries and independent spaces documented by FindArt Platform.",
    intro: `Paris in 2026 spreads across a wider set of rooms than the ones that usually get named. This selection deliberately looks past the biggest institutional openings and follows six exhibitions across smaller galleries, artist-run spaces and residency workshops — La Volonte 93, Espace Nonono, Association NOEMI, Emergency Space, the Cité internationale des arts and Galerie Suzanne Tarasieve. The work being shown moves between glitched digital environments, hydraulic and mineral materials drawn from Paris itself, sculptures that watch back, chimeric bodies, and sound-adjacent objects in states of active transformation. Digital myth, materiality, ecology, surveillance and mythological bodies recur without becoming a single argument. Read together, the exhibitions register a Paris that is at once historical and post-digital, and paying attention to both at once.`,
    coverExhibitionSlug: "nymphenbrunnen",
    coverImageIndex: 0,
    exhibitionSlugs: [
      "nymphenbrunnen",
      "chewing-gum-in-the-motherboard-group-exhibition",
      "who-composes-the-song-of-the-crickets",
      "what-we-see-what-looks-back-at-us",
      "main-de-fer-gant-de-velours",
      "nexus-open-studio-anais-gauthier",
    ],
    perExhibitionText: {
      "nymphenbrunnen": `Adele Vivet's Nymphenbrunnen at Espace Nonono presents the Chimerea series — five totemic sculptures that fuse the architectural language of caryatids with the layered narrative logic of bas-relief. Read as hydro-chimeras and self-portraits at once, the figures stage a young woman caught between desire and guilt, joy and disappointment. The material register is dense: mineral surfaces, water motifs, decorative fragments that pull between sacred sculpture and ornament. Espace Nonono, one of the smaller independent rooms in Paris' current landscape, gives the work the intimate scale it needs. In the arc of this selection, Nymphenbrunnen is the entry into mythology and the body: the figures are the ones you meet first.`,

      "chewing-gum-in-the-motherboard-group-exhibition": `A group show at La Volonte 93 that treats the contemporary tech-mediated everyday as its subject and its material. Artists respond to fragmentation through glitched aesthetics, speculative environments and a mixture of nostalgia and invention: a piece of chewing gum placed under continuous surveillance; biometric data captured from an intimate encounter and looped as signal; a lost hard drive drifting between landfill and digital myth; generated images populated by residual presences. The overall effect is a room in which the border between object and data has already dissolved. In this selection, Chewing Gum is the anchor for the surveillance / digital-myth thread — the strand the other Paris shows keep brushing against.`,

      "who-composes-the-song-of-the-crickets": `Yugo Guerin's solo exhibition at Galerie Suzanne Tarasieve begins from a sound almost everyone recognises before they can locate it: the song of the crickets. Guerin treats that near-universal acoustic memory as raw material, unpacking how landscape, summer nights and an imagined countryside get compressed into a single audio fragment. The show works with sculpture and installation that behave almost sonically — objects that hold, transmit or interrupt the atmosphere of a remembered place. In this selection it opens the ecological / sound-and-memory register: an argument that even Paris' most familiar image of "nature" is a composed, mediated thing, closer to a recording than to a landscape.`,

      "what-we-see-what-looks-back-at-us": `A group show at Emergency Space that flips the standard exhibition contract: instead of the visitor doing the looking, the works do. The pieces gathered here are more interested in watching those who move around them than in being seen, returning the gaze in ways that range from optical to almost surveilling. The result reads as a room full of subjects, not objects. It sits inside this selection as the counterweight to Chewing Gum — where that show lets surveillance feel ambient and cool, What We See makes the same asymmetry deliberate and physical. Emergency Space, a Paris independent room, gives it the tight, close-quarters format the work needs to actually feel returned.`,

      "main-de-fer-gant-de-velours": `Katherinne Fiedler and Marinés Agurto's duo show at Association NOEMI — Espace Brownstone extends research developed during their residencies at the Cité internationale des arts. The title borrows a French idiom ("iron fist in a velvet glove") and applies it to material: Agurto works with reclaimed plaster blocks and pigments made from Paris tomettes, exposing assemblages of metal brackets, threaded rods, hinges, screws; Fiedler treats water — specifically the Bièvre River and its history of tanneries and hydraulics — as material, symbol and political condition. Leather, mesh, chain, velvet. In this selection, it is the show that most explicitly reads Paris as a material archive.`,

      "nexus-open-studio-anais-gauthier": `Anais Gauthier's open studio at the Cité internationale des arts is the shortest exhibition in the selection — three days in June — and one of the most stripped-down. The sculptures exist in a state of induced rotation: movement is not performance but a mechanism that gradually transforms the forms and their relationships. Breath, displacement, vibration; a shifting equilibrium between the mechanical and the organic. It fits into the arc as the technical / kinetic register — a room where the work is doing the process of change out loud. And, appropriately, it comes from the same residency programme that runs through several other exhibitions in this list.`,
    },
    publishedAt: "2026-08-23",
    publishedAtDisplay: "23 August 2026",
  },
  {
    kind: "exhibitions",
    slug: "contemporary-art-exhibitions-seoul-2026",
    title: "Contemporary Art Exhibitions in Seoul: 2026 Selection",
    subtitle:
      "A selection of exhibitions shaping Seoul's contemporary art landscape in 2026.",
    intro: `Seoul in 2026 reads less like a single scene and more like a set of overlapping currents. A short walk moves you from an institutional post-human survey at Aod Museum to a tight artist-run show at Bangdo, from Adrián Villar Rojas' months-long installation at Art Sonje Center to a duo of sculptors turning a small gallery into a resonance chamber. What links these exhibitions is not a shared aesthetic but a common set of pressures — ecological, digital, historical, embodied — and the sense that the objects and images being made in the city are trying to think through them rather than illustrate them. This selection follows five exhibitions where those pressures surface most clearly: as sound, as decay, as ritual, as inheritance, as bodies made and unmade in space.`,
    coverExhibitionSlug: "tangerine-reverie",
    coverImageIndex: 0,
    exhibitionSlugs: [
      "tangerine-reverie",
      "the-language-of-the-enemy",
      "the-collapse-manual-the-post-human-field",
      "24-preludes-op-34-no-22-in-g-minor-adagio",
      "mimicking-eternity",
    ],
    perExhibitionText: {
      "tangerine-reverie": `A tight, atmospheric group show at Bangdo, tucked into a former industrial pocket of Seoul. The exhibition treats the tangerine — a fruit tied to Jeju's post-war agricultural economy and to a warmer, softer register of Korean domestic memory — as an entry point into ecology and ritual. Across ten days the space fills with installation, sound and low-lit sculptural work that stages a slow, almost drowsy attention to material. Post-industrial residues, water, textiles and organic surfaces recur. What makes Tangerine Reverie characteristic of this selection is how it holds ecological anxiety without polemic: the room feels closer to a shrine than an argument.`,

      "the-language-of-the-enemy": `Adrián Villar Rojas' months-long installation at Art Sonje Center turns the institution into a slowly decaying set. Working with clay, organic matter, found objects and the specific dust and light of the building, the Argentine artist stages an environment that acts less like an exhibition and more like an ecosystem in the process of forgetting itself. His familiar concerns — deep time, extinction, the residue of civilizations — meet Seoul's own layered post-war architecture. Because the piece unfolds over six months, it also asks the visitor a durational question: what does it mean to return to the same room and find it different, sagging, softening, giving in to its own materials.`,

      "the-collapse-manual-the-post-human-field": `Aod Museum's group show is the closest thing in the selection to a survey. A large field of Korean and international artists — Dae Uk Kim, Youjin Ahn, Om Yocho, Yoon Miryu and others — approach the "post-human" not as sci-fi aesthetic but as an ordinary condition: prosthetic bodies, ambient surveillance, mediated intimacy, hybrid organisms. Media range from video installation and sculpture to speculative-fiction diagrams and small-format objects. The scale of the show turns Aod's institutional space into something closer to a research site, and its inclusion here anchors the selection: it maps the wider vocabulary the other, smaller shows are drawing from.`,

      "24-preludes-op-34-no-22-in-g-minor-adagio": `A duo show by Francesco Muggetti and Yongbin Lee at Studiya Gallery that turns a modest room into a resonance chamber. Named after a Shostakovich prelude, the exhibition works with sound, sculpture and light as if scoring a single held breath: metal, glass, small mechanical elements and vibrating surfaces set up a physical acoustics of absence. Lee's material vocabulary meets Muggetti's compositional patience, and the results feel closer to a listening room than a gallery. The show sits inside the selection as its quietest register — evidence that Seoul's independent spaces are hosting some of the most disciplined material-and-sound practices of the year.`,

      "mimicking-eternity": `Yeju Lee's solo show at Studiya Gallery gathers a body of work built around consolation — the way the mind reaches for continuity in the face of what won't last. Materials do a lot of the work: porous surfaces, mineral pigments and objects that read as ancestral before they read as sculpture. Lee treats causality and inheritance as an atmosphere rather than a subject, borrowing from ritual and from the Korean pictorial tradition without ever quoting them directly. In the arc of this selection, Mimicking Eternity is the counterweight to Villar Rojas' entropic staging: both are working with time, but Lee is trying to hold it, not watch it come apart.`,
    },
    publishedAt: "2026-08-23",
    publishedAtDisplay: "23 August 2026",
  },
  {
    kind: "artists",
    slug: "artists-to-watch-2026",
    title: "Artists to Watch: 2026",
    subtitle: "Ten contemporary practices selected from the FindArt archive.",
    seoTitle: "Emerging Artists & Artists to Watch in 2026 | FindArt Platform",
    seoDescription:
      "Discover ten emerging and rising contemporary artists to watch in 2026, selected from exhibitions and features documented by FindArt Platform.",
    intro: `This selection draws together ten artists appearing across FindArt Features and the exhibition archive. Rather than mapping a single generation or tendency, it follows practices that make their concerns legible through materials, images and exhibition situations: painted bodies that slip out of fixed identity, sculptural forms shaped by disability discourse and industrial residue, virtual worlds that enter physical space, and installations where mythology, memory and ecological unease meet. Several of these artists work across sculpture and installation; others use painting, animation, video or performance to test how images circulate between the body and its surroundings. What connects the selection is not a promise of arrival, but the particular clarity with which each practice opens a field of questions. The exhibitions and Features below offer an entry point into work worth returning to in 2026.`,
    coverArtistSlug: "00-zhang",
    selectedArtists: [
      { artistName: "00 Zhang", editorialArtistSlug: "00-zhang" },
      { artistName: "Yukino Yamanaka", editorialArtistSlug: "yukino-yamanaka" },
      {
        artistName: "Sophia Gatzkan",
        editorialArtistSlug: "sophia-gatzkan",
        featuredExhibitionSlug: "metal-memory",
      },
      { artistName: "Emma Beatrez", editorialArtistSlug: "emma-beatrez" },
      {
        artistName: "Taewon Ahn",
        editorialArtistSlug: "taewon-ahn",
        featuredExhibitionSlug: "deep-sea-fish",
      },
      {
        artistName: "Xolo Cuintle",
        editorialArtistSlug: "xolo-cuintle",
        featuredExhibitionSlug: "pulses-within",
      },
      {
        artistName: "Koesy",
        editorialArtistSlug: "koesy",
        featuredExhibitionSlug: "koesy-between-reality-and-virtual",
      },
      {
        artistName: "Jan Baszak",
        featuredExhibitionSlug: "a-gentle-kiss-on-a-double-forehead",
      },
      { artistName: "Ad\u00e8le Vivet", featuredExhibitionSlug: "nymphenbrunnen" },
      {
        artistName: "Nils Alix-Tabeling",
        featuredExhibitionSlug: "a-flower-is-growing-inside-me-nils-alix-tabeling",
      },
    ],
    perArtistText: {
      "00 Zhang": `00 Zhang works across sculpture, installation, CGI animation and interactive digital environments. The Feature documents a practice where embodiment meets cybernetic ideas: imagined worlds are not kept behind a screen, but are staged as spaces in which physical presence and virtual reality keep exchanging roles. Collaboration and layered narrative structures give the work a sense of systems in motion rather than a fixed image. In this selection, Zhang offers one route into the question of how contemporary artists make digital culture spatial and bodily. The result is not an illustration of technology, but a proposition about the environments, agents and narratives through which a body now moves.`,
      "Yukino Yamanaka": `Yukino Yamanaka approaches painting and video through the unstable boundary between the body and identity. In the FindArt Feature, figurative forms move toward abstraction through fluid marks, empty spaces and distorted gestures. The canvas becomes less a place for describing a person than a site where form is continually remade. Bodies, emotions and perception remain in a condition of becoming, at once recognizable and estranged. This makes Yamanaka's work a focused point in the selection's attention to hybrid and uncertain embodiment. The practice does not settle identity into an image; it lets the image register the pressure of a self that will not stay fixed.`,
      "Sophia Gatzkan": `Sophia Gatzkan's sculptural practice addresses the body through disability discourse, treating non-normative morphology as an alternative mode of being rather than a deviation to be corrected. The works documented by FindArt destabilize bodily integrity through forms that remain corporeal but refuse a single, stable outline. In Metal Memory, this concern enters a larger field of technology, adaptation and material transformation, where metal, plastic and digital forms expose the codes that shape contemporary bodies. Gatzkan's work is distinctive for the way it holds ethics, power and physical ambiguity together without reducing one to the other. It brings the selection's questions about posthuman form into a sharply material register.`,
      "Emma Beatrez": `Emma Beatrez uses painting to examine the visual and ritual dimensions of American mass culture. Cheerleaders, pep-rally bonfires and athletic gestures appear in the FindArt Feature as scenes charged with threat as much as celebration. Synthetic fabrics, fire and frozen poses turn familiar social choreography into an unsettled spectacle, where collective enthusiasm can resemble trance. The work does not treat these images as nostalgic documentation; it recodes them as strange cultural symbols, close to myth while remaining attached to everyday American ritual. Within this selection, Beatrez shows how painting can make identity visible through the tensions already held inside a public image: celebration and violence, belonging and performance, body and spectacle.`,
      "Taewon Ahn": `Taewon Ahn moves between painting and sculpture while testing the overlap of digital culture and physical reality. The FindArt Feature describes an intuitive process shaped by chance, improvisation and material experimentation, with recurring figures such as the artist's cat Hiro becoming prompts for thinking about image, memory and perception. Deep Sea Fish extends this inquiry through the figure of an animal adapted to a world beyond ordinary sight, asking viewers to move between the real and the virtual without treating either as stable ground. Ahn's work gives the selection a wry, tactile approach to simulation: screens and imagined worlds are not separate from matter, but are experienced through objects, stories and perceptual drift.`,
      "Xolo Cuintle": `Xolo Cuintle treat matter as a form of memory and as a meeting point between human and non-human systems. Their Feature traces a practice in which the artificial and the natural become a shared body, while ornament, surface and structure hold traces of time, tension and loss. In Pulses Within, concrete and petrified forms develop into hybrid organisms that bring soil, entomological systems and organo-industrial relations into the exhibition space. The resulting sculptural language is at once mythological and technological, organic and industrial. For this selection, Xolo Cuintle make material transformation feel less like a metaphor than a condition: an environment where construction and decay remain inseparable.`,
      Koesy: `Koesy works across animation, sculpture and character design, building fictional worlds that move between reality and the virtual. The FindArt Feature describes recurring characters and image systems shaped by inner anxiety and the process of overcoming it. Between Reality and the Virtual carries that language into an exhibition context, where the distinction between an imagined character and a physical object is deliberately loosened. Koesy's work gives digital myth a particular emotional scale: virtuality is not presented as abstract technology, but as a space where personal anxieties can be staged, transformed and shared. The practice belongs here for the directness with which it connects character, narrative and contemporary image culture.`,
      "Jan Baszak": `Jan Baszak's exhibition at BGSW / Baszta builds sculptural situations around attention, opacity and the material traces of a vanished whole. Leather, upholstery, animal forms, masks and furniture-like structures shape a setting that feels both domestic and ceremonial. The exhibition text describes objects that resist being fully translated into meaning, keeping the viewer in relation to surfaces, fragments and the architecture that holds them. Artificial leather and textile coverings carry associations of touch, animality and memory while remaining visibly constructed. Baszak's work gives this selection a concentrated study of materiality: sculpture becomes a way to organise looking, bodily proximity and uncertainty rather than a route toward a final reading.`,
      "Ad\u00e8le Vivet": `In Nymphenbrunnen, Ad\u00e8le Vivet develops the Chimerea series through sculpture, 3D printing and ceramics. The exhibition at Espace Nonono brings caryatids, bas-relief, mythology and contemporary visual culture into a set of hydro-chimeric forms that also operate as self-portraits. Mineral and water-bound surfaces move between ornament and figure, giving the work an unstable relationship to identity. Vivet's contribution to this selection lies in that layered use of image and material: the sculptures look back to historical forms without reconstructing them, using hybrid bodies to hold desire, guilt, joy and disappointment in the same space. Myth here is not a distant reference, but an active structure for thinking through the present.`,
      "Nils Alix-Tabeling": `Nils Alix-Tabeling works across sculpture, performance and painting, drawing on ancient myth, pagan ritual and science fiction while addressing queer and ecological concerns. A Flower Is Growing Inside Me unfolds an imaginary world populated by monsters, marvellous creatures and marginal historical figures, where reality and fiction are deliberately entangled. The exhibition moves through melancholy, loss and rebirth, culminating in an installation of video, sculpture, song and performance. Alix-Tabeling's work closes this selection with a symbolic, hybrid language that does not separate spiritual imagery from contemporary experience. Its creatures and ceremonies offer another way to approach transformation: not as a resolved state, but as an unfolding relation between body, fiction, ritual and time.`,
    },
    publishedAt: "2026-08-23",
    publishedAtDisplay: "23 August 2026",
  },
];

export function getEditorialSelection(slug: string): EditorialSelection | undefined {
  return editorialSelections.find((selection) => selection.slug === slug);
}

export function getEditorialSelectionCoverImage(selection: EditorialSelection): string | undefined {
  if (selection.kind === "artists") {
    return getEditorialArtist(selection.coverArtistSlug)?.coverImage.src;
  }
  const cover = getExhibition(selection.coverExhibitionSlug);
  return (
    cover?.images[selection.coverImageIndex ?? 0]?.src ??
    cover?.coverImage ??
    cover?.previewImage
  );
}

// Validate at build time — a missing exhibition slug should fail loudly
// rather than render a broken article.
for (const selection of editorialSelections) {
  if (selection.kind === "exhibitions") {
    const missing = selection.exhibitionSlugs.filter((slug) => !getExhibition(slug));
    if (missing.length > 0) {
      throw new Error(
        `Editorial selection "${selection.slug}" references missing exhibitions: ${missing.join(", ")}`,
      );
    }
    if (!getExhibition(selection.coverExhibitionSlug)) {
      throw new Error(
        `Editorial selection "${selection.slug}" has cover exhibition "${selection.coverExhibitionSlug}" which does not exist.`,
      );
    }
    continue;
  }

  if (!getEditorialArtist(selection.coverArtistSlug)) {
    throw new Error(
      `Artist editorial selection "${selection.slug}" has cover artist "${selection.coverArtistSlug}" which does not exist.`,
    );
  }
  for (const artist of selection.selectedArtists) {
    if (artist.editorialArtistSlug && !getEditorialArtist(artist.editorialArtistSlug)) {
      throw new Error(
        `Artist editorial selection "${selection.slug}" references missing artist "${artist.editorialArtistSlug}".`,
      );
    }
    if (artist.featuredExhibitionSlug && !getExhibition(artist.featuredExhibitionSlug)) {
      throw new Error(
        `Artist editorial selection "${selection.slug}" references missing exhibition "${artist.featuredExhibitionSlug}".`,
      );
    }
  }
}

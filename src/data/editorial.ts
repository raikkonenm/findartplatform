export type EditorialImage = {
  src: string;
  width: number;
  height: number;
};

export type EditorialArtist = {
  slug: string;
  artistName: string;
  instagramHandle: string;
  instagramUrl: string;
  excerpt: string;
  body: string;
  coverImage: EditorialImage;
  images: EditorialImage[];
};

function imageSequence(
  folder: string,
  files: number[],
  width = 1440,
  height = 1800,
): EditorialImage[] {
  const encodedFolder = encodeURIComponent(folder);
  return files.map((file) => ({
    src: `/editorial/${encodedFolder}/${file}.webp`,
    width,
    height,
  }));
}

function artist(
  data: Omit<EditorialArtist, "coverImage"> & { images: EditorialImage[] },
): EditorialArtist {
  return { ...data, coverImage: data.images[0] };
}

const xoloCuintleImages: EditorialImage[] = [
  { src: "/editorial/XOLO%20CUINTLE/1.webp", width: 1434, height: 1794 },
  { src: "/editorial/XOLO%20CUINTLE/2.webp", width: 1440, height: 1800 },
  { src: "/editorial/XOLO%20CUINTLE/3.webp", width: 1424, height: 1781 },
  { src: "/editorial/XOLO%20CUINTLE/4.webp", width: 1440, height: 1800 },
  { src: "/editorial/XOLO%20CUINTLE/5.webp", width: 1440, height: 1800 },
  { src: "/editorial/XOLO%20CUINTLE/6.webp", width: 1440, height: 1800 },
  { src: "/editorial/XOLO%20CUINTLE/7.webp", width: 1440, height: 1800 },
  { src: "/editorial/XOLO%20CUINTLE/8.webp", width: 1440, height: 1800 },
  { src: "/editorial/XOLO%20CUINTLE/9.webp", width: 1440, height: 1800 },
];

export const editorialArtists: EditorialArtist[] = [
  artist({
    slug: "xolo-cuintle",
    artistName: "Xolo Cuintle",
    instagramHandle: "@xolo_cuintle",
    instagramUrl: "https://www.instagram.com/xolo_cuintle/",
    excerpt:
      "Xolo Cuintle explore matter as a form of memory and as an environment where the human and the non-human intersect.",
    body: `Xolo Cuintle explore matter as a form of memory and as an environment where the human and the non-human intersect. Their practice views contemporaneity as a landscape in which the artificial and the natural are no longer opposed but form a shared body. The artists approach matter as a living organism capable of retaining traces of time, tension, and loss - transforming the inert into the animate.

Central to their approach is the idea of time as a porous and cyclical phenomenon. Ornament, structure, and surface all become markers of a continuous sedimentation of meanings. Instead of a linear history, they construct a fluid archaeology of the present, where the past, present, and potential future mirror one another.

The aesthetic of Xolo Cuintle intertwines the mythological and the technological, the organic and the industrial. Their art exists in the space between construction and decay, between body and machine, inviting us to perceive the material world as a living system of breath, memory, and metamorphosis.`,
    images: xoloCuintleImages,
  }),
  artist({
    slug: "dew-kim",
    artistName: "Dew Kim",
    instagramHandle: "@dew_needs_you",
    instagramUrl: "https://www.instagram.com/dew_needs_you/",
    excerpt:
      "Through a multidisciplinary practice spanning sculpture, installation, and video, Dew Kim interweaves the aesthetics of popular culture with spiritual symbolism.",
    body: `Through a multidisciplinary practice spanning sculpture, installation, and video, Dew Kim interweaves the aesthetics of popular culture with spiritual symbolism, creating theatrical environments where questions of faith, the body, power, and queerness converge.

Reimagining notions of eroticism and sensuality, his works explore the fragile tension between pleasure and vulnerability. Through enigmatic imagery and carefully constructed narratives, Kim examines how desire, devotion, and identity are shaped through both personal and collective experience. Blurring the boundaries between the sacred and the everyday, the artist creates immersive worlds that invite viewers to reflect on the intersections of intimacy, ritual, and cultural representation.`,
    images: imageSequence("DEW KIM", [1, 2, 3, 4, 5, 6, 7, 8, 9]),
  }),
  artist({
    slug: "isabelle-albuquerque",
    artistName: "Isabelle Albuquerque",
    instagramHandle: "@isabellealbuquerque",
    instagramUrl: "https://www.instagram.com/isabellealbuquerque/",
    excerpt:
      "Isabelle Albuquerque’s practice centers on the body as a shifting site of desire, vulnerability, power, and transformation.",
    body: `Isabelle Albuquerque’s practice centers on the body as a shifting site of desire, vulnerability, power, and transformation. Working across sculpture and performance, she explores the instability of identity through forms that move between the human, animal, and organic. Her works resist fixed categories, instead approaching the body as fluid, relational, and continuously becoming.

Material plays a central role in this language. Wood, bronze, steel, and hair are treated not only as physical matter, but as carriers of memory, time, and embodied history.

Through these tactile and psychologically charged forms, Albuquerque reflects on intimacy, autonomy, and the changing relationship between the body and the natural world.`,
    images: imageSequence("ISABELLE ALBUQUERQUE", [1, 2, 3, 4, 5, 6, 7, 8, 9]),
  }),
  artist({
    slug: "koesy",
    artistName: "Koesy",
    instagramHandle: "@koesysaga",
    instagramUrl: "https://www.instagram.com/koesysaga/",
    excerpt:
      "Seoul-based artist Koesy works across animation, sculpture, and character design, building a distinctive universe between reality and the virtual.",
    body: `Seoul-based artist Koesy works across animation, sculpture, and character design, building a distinctive universe between reality and the virtual. Through fictional worlds and recurring characters, his practice explores inner anxiety and the process of overcoming it.`,
    images: [
      { src: "/editorial/KOESY/banner.webp", width: 1440, height: 1800 },
      ...imageSequence("KOESY", [2, 3, 4, 5, 6, 7, 8]),
    ],
  }),
  artist({
    slug: "kim-myungchan",
    artistName: "Kim Myungchan",
    instagramHandle: "@kim.myungchan",
    instagramUrl: "https://www.instagram.com/kim.myungchan/",
    excerpt:
      "Myungchan Kim examines how digital technologies reshape our relationship with the body, memory, and physical presence.",
    body: `Myungchan Kim examines how digital technologies reshape our relationship with the body, memory, and physical presence. Working primarily through painting, he contrasts tactile, gestural surfaces with ghostly human silhouettes and industrial structures, creating spaces where the organic and the artificial coexist in uneasy balance.

Rather than rejecting technology, Kim explores the “offline body” as a fragile anchor-a reminder of touch, materiality, and embodied experience in an increasingly virtual world.`,
    images: [
      {
        src: "/editorial/KIM%20MYUNGCHAN/banner.webp",
        width: 1440,
        height: 1800,
      },
      ...imageSequence("KIM MYUNGCHAN", [2, 3, 4, 5, 6, 7, 8, 9, 10]),
    ],
  }),
  artist({
    slug: "yukino-yamanaka",
    artistName: "Yukino Yamanaka",
    instagramHandle: "@yukino_yamanaka",
    instagramUrl: "https://www.instagram.com/yukino_yamanaka/",
    excerpt:
      "Yukino Yamanaka explores the unstable boundary between the human body and the shifting states of identity that exist beyond fixed definitions.",
    body: `Yukino Yamanaka explores the unstable boundary between the human body and the shifting states of identity that exist beyond fixed definitions. Moving from figurative painting toward abstraction, she fragments the human form through fluid marks, empty spaces, and distorted gestures, treating the canvas as a site of transformation rather than representation.

Her works depict the gradual dissolution of the self into an ambiguous, inhuman presence, where bodies, emotions, and perception remain in a constant state of becoming.`,
    images: imageSequence("YUKINO YAMANAKA", [1, 2, 3, 4, 5, 6, 7, 8, 9]),
  }),
  artist({
    slug: "anna-uddenberg",
    artistName: "Anna Uddenberg",
    instagramHandle: "@filet_minion_thong",
    instagramUrl: "https://www.instagram.com/filet_minion_thong/",
    excerpt:
      "Anna Uddenberg explores how the body is shaped within contemporary consumer culture.",
    body: `Anna Uddenberg explores how the body is shaped within contemporary consumer culture. Her sculptures merge elements of furniture, infrastructure, and the human figure, transforming familiar objects into instruments of desire, control, and self-presentation.

Through these hybrid constructions, she investigates the relationship between comfort, power, and contemporary models of identity.`,
    images: imageSequence("ANNA UDDENBERG", [1, 2, 3, 4, 5, 6, 7, 8, 9], 1080, 1350),
  }),
  artist({
    slug: "00-zhang",
    artistName: "00 Zhang",
    instagramHandle: "@aio0o0o0",
    instagramUrl: "https://www.instagram.com/aio0o0o0/",
    excerpt:
      "Zhang’s multifaceted practice, often developed through collaboration, spans sculpture, installation, CGI animation, and interactive digital game environments.",
    body: `Zhang’s multifaceted practice, often developed through collaboration, spans sculpture, installation, CGI animation, and interactive digital game environments. The artist combines embodiment with complex cybernetic concepts, exploring the integration of agents and their surroundings through layered narrative structures.

Investigating the convergence of the real and the virtual, Zhang creates imagined worlds that occupy physical space-immersive environments that engage viewers and move them between corporeal experience and virtual reality.`,
    images: imageSequence("00 ZHANG", [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]),
  }),
  artist({
    slug: "yihan-pan",
    artistName: "Yihan Pan",
    instagramHandle: "@pyhii",
    instagramUrl: "https://www.instagram.com/pyhii/",
    excerpt:
      "Yihan explores how fleeting forms carry traces of transformation.",
    body: `Yihan explores how fleeting forms carry traces of transformation. A drop of water, a ray of light, a particle of dust - these are not background for her, but subjects worthy of close attention. She is drawn to the boundary between the visible and the vanishing, between presence and withdrawal, between the attempt to measure the world and the moment when measurement falls apart.

Yihan Pan works with microscopes and telescopes, moving between scales - from a speck of dust to a landscape. At the core of her practice are water, light, and dust, materials that seem almost weightless yet carry the quiet gravity of time.`,
    images: [
      { src: "/editorial/YIHAN%20PAN/banner.webp", width: 1440, height: 1800 },
      ...imageSequence("YIHAN PAN", [2, 3, 4, 5, 6, 7, 8, 9]),
    ],
  }),
  artist({
    slug: "emma-beatrez",
    artistName: "Emma Beatrez",
    instagramHandle: "@emma.beatrez",
    instagramUrl: "https://www.instagram.com/emma.beatrez/",
    excerpt:
      "Emma Beatrez examines the visual and ritual dimensions of American mass culture, focusing on cheerleaders and small-town pep-rally bonfires.",
    body: `In her painting practice, Emma Beatrez examines the visual and ritual dimensions of American mass culture, focusing on the imagery of cheerleaders and the spectacle of small-town pep-rally bonfires.

These scenes are not presented as nostalgic or documentary, but as charged, almost occult situations in which collective enthusiasm borders on threat and violence. Ordinary American rituals are displaced into the realm of an unsettling spectacle.

Her works are infused with a dark energy: synthetic fabrics, fire, sharp gestures, and frozen poses transform athletic and celebratory actions into states resembling trance. Beatrez's painting recodes familiar cultural symbols into surreal, nearly mythological scenes. Through them, she exposes the contradictions of American identity, revealing how secular traditions can mutate into ominous rituals that reflect hidden tensions and social hierarchies.

Photo: @emma.beatrez official Instagram.`,
    images: imageSequence("EMMA BEATREZ", [1, 2, 3, 4, 5, 6, 7, 8, 9]),
  }),
  artist({
    slug: "sophia-gatzkan",
    artistName: "Sophia Gatzkan",
    instagramHandle: "@s_gatzkan",
    instagramUrl: "https://www.instagram.com/s_gatzkan/",
    excerpt:
      "Sophia Gatzkan's practice explores the human body through the discourse of disability, approaching non-normative morphology as an alternative mode of being.",
    body: `AND THE BACKDROP WAS CHAOS BY SOPHIA GATZKAN, 2025.

Sophia Gatzkan's practice explores the human body through the discourse of disability, approaching non-normative morphology as an alternative mode of being. Through sculpture, she destabilizes bodily integrity, creating forms of corporeal ambiguity and fluidity that invite reflection on ethics, power structures, and dominant conceptions of the human.

Installation on view at «Machinic Metabolism» exhibition, Lothringer 13, Munich, September 18 — December 28, 2025.

Curators: #KalasLiebfried, #ZakirahRabaney, #JakobBraito. Special thanks to @j2mel002 for artistic support. Photo: #ChristianKain.`,
    images: imageSequence("SOPHIA GATZKAN", [1, 2, 3]),
  }),
  artist({
    slug: "jacopo-pagin",
    artistName: "Jacopo Pagin",
    instagramHandle: "@pax_aliena",
    instagramUrl: "https://www.instagram.com/pax_aliena/",
    excerpt:
      "Jacopo Pagin approaches art as a space of freedom and disorientation — an experience that moves beyond utilitarian logic and predictable narratives.",
    body: `Jacopo Pagin approaches art as a space of freedom and disorientation — an experience that moves beyond utilitarian logic and predictable narratives. His practice brings together painting, drawing, and installation, where historical artistic techniques intersect with a contemporary visual language. Everyday scenes in Pagin's work are imbued with a sense of displacement and uncertainty, transforming into meditative spaces in which the viewer loses familiar points of reference.

Time, nostalgia, and collective memory are central themes in his work, alongside the tense relationship between past and present. Through mirrored compositions, reflections, and repetition, Pagin explores dualities such as control and chaos, memory and perception, the organic and the artificial. These strategies produce a layered sense of reality in which images simultaneously emerge and dissolve.

Photo: @pax_aliena official Instagram.`,
    images: imageSequence("JACOPO PAGIN", [1, 2, 3, 4, 5, 6, 7, 8, 9]),
  }),
  artist({
    slug: "doris-salcedo",
    artistName: "Doris Salcedo",
    instagramHandle: "#DorisSalcedo",
    instagramUrl: "https://www.instagram.com/explore/tags/dorissalcedo/",
    excerpt:
      "Atrabiliarios, 1996 — drywall, shoes, cow bladder, surgical thread.",
    body: `ATRABILIARIOS BY DORIS SALCEDO, 1996.

Drywall, shoes, cow bladder, surgical thread.

Text: #EvanMoffitt.`,
    images: imageSequence("DORIS SALCEDO", [1, 2, 3, 4, 5, 6, 7]),
  }),
  artist({
    slug: "yeon-gyeong-seok",
    artistName: "Yeon Gyeong-seok",
    instagramHandle: "@camelostrich",
    instagramUrl: "https://www.instagram.com/camelostrich/",
    excerpt:
      "Yeon Gyeong-seok works with 3D graphics, turning personal memory into sculptural form.",
    body: `SONGHAK OF JAN., 2026 BY YEON GYEONG-SEOK.

3D printed, magnet, acrylic, urethane, 520 × 1500 × 1180 mm.

Yeon Gyeong-seok works with 3D graphics, turning personal memory into sculptural form. The starting point was the pandemic lockdown: cut off from Shanghai, where he spent his childhood, he began reconstructing places that exist only in memory — without archives, without reference, relying solely on internal images.

The practice moves from screen to object. Graphics born from memory are transformed into sculptural forms — deliberately distorted, removed from any real prototype. Not documentation, but deformation: how memory shifts when it is extracted and translated into physical space.`,
    images: imageSequence("YEON GYEONG-SEOK", [1, 2, 3, 4, 5, 6]),
  }),
  artist({
    slug: "nathan-careme",
    artistName: "Nathan Carême",
    instagramHandle: "@nadaecc",
    instagramUrl: "https://www.instagram.com/nadaecc/",
    excerpt:
      "L'HALETEMENT — presented at Manoir Mouthier, Mouthier-Haute-Pierre, France, 18 April — 23 May 2026.",
    body: `L'HALETEMENT BY NATHAN CARÊME.

On display during the «Microwave exhibition» with @joriscreuze and @tindarasparta.

Courtesy of Galery Pietro Spartà.

@manoir_mouthier, Mouthier-Haute-Pierre, France, 18 April — 23 May 2026.`,
    images: imageSequence("NATHAN CAREME", [1, 2, 3, 4, 5, 6, 7]),
  }),
  artist({
    slug: "arghavan-khosravi",
    artistName: "Arghavan Khosravi",
    instagramHandle: "@arghavan_khosravi",
    instagramUrl: "https://www.instagram.com/arghavan_khosravi/",
    excerpt:
      "\"What Remains\" reimagines the structure of devotional altarpieces through fragmented compositions balancing tension, restriction, and resistance.",
    body: `WHAT REMAINS BY ARGHAVAN KHOSRAVI.

"What Remains" at @uffnerliu reimagines the structure of devotional altarpieces through fragmented compositions balancing tension, restriction, and resistance. The exhibition brings together shaped panels, mirrored surfaces, and layered imagery that refuse stable resolution.

Drawing from Persian miniature painting and medieval European iconography, Arghavan Khosravi's practice explores the social, political, and religious systems that shape women's bodies and autonomy.

@uffnerliu, New York, USA, 15 May — 2 July 2026.`,
    images: imageSequence("ARGHAVAN KHOSRAVI", [1, 2, 3, 4, 5, 6]),
  }),
  artist({
    slug: "que-fresca",
    artistName: "que.fresca",
    instagramHandle: "@que.fresca",
    instagramUrl: "https://www.instagram.com/que.fresca/",
    excerpt:
      "que.fresca constructs hybrid sculptural forms from silicone, animal remains, circuit boards, textiles, and found industrial materials.",
    body: `IN THE GARDEN OF EARTHLY DELIGHTS: I BEND TO PARADISE BY QUE.FRESCA.

Presented as part of "In the Garden of Earthly Delights: I Bend to Paradise" at @icasandiego, que.fresca constructs hybrid sculptural forms from silicone, animal remains, circuit boards, textiles, and found industrial materials. Balancing grotesque humor with bodily tension, the works move between pop-cultural references, decay, fetish aesthetics, and fragmented memory.

Curator: #ICASanDiego. Photo: #BarnabásNeográdyKiss.

@icasandiego, San Diego, USA. Until 25 May 2026.`,
    images: imageSequence("QUE.FRESCA", [1, 2, 3, 4, 5, 6, 7, 8, 9]),
  }),
  artist({
    slug: "taewon-ahn",
    artistName: "Taewon Ahn",
    instagramHandle: "@ppuri_",
    instagramUrl: "https://www.instagram.com/ppuri_/",
    excerpt:
      "Taewon Ahn explores the overlap between digital culture and physical reality through painting and sculpture.",
    body: `Taewon Ahn explores the overlap between digital culture and physical reality through painting and sculpture. Working intuitively across two- and three-dimensional formats, Ahn embraces chance, improvisation, and material experimentation.

Recurring figures — especially his cat Hiro — become vehicles for examining the gap between image, memory, and perception, where the familiar often appears strange, humorous, and slightly uncanny.

The work is part of the exhibition «Balance in Motion», @p21.kr, May 14 — July 4, 2026.

1, 2, 3: Mishmash, 2026. 4, 5: Watchtower, 2026.

Powered by Minjin Chae (@minjin.chae) & P21. Photo: @leeeuirock.`,
    images: imageSequence("TAEWON AHN", [1, 2, 3, 4, 5, 6]),
  }),
];

export function getEditorialArtist(slug: string): EditorialArtist | undefined {
  return editorialArtists.find((entry) => entry.slug === slug);
}

export function editorialSavedKey(slug: string): string {
  return `editorial:${slug}`;
}

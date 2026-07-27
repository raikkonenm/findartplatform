const coverImagePaths = [
  "/cover/47°24’35’’N  9°44’20’’E.webp",
  "/cover/A BLADE UNHELD.webp",
  "/cover/AFTERLIFES.webp",
  "/cover/Begone Estrone.webp",
  "/cover/BLUE BLOODED.webp",
  "/cover/BUCOLICA.webp",
  "/cover/Choice Dirt.webp",
  "/cover/COMMON LANDSCAPE(S) (GROUP SHOW).webp",
  "/cover/Caged movements.webp",
  "/cover/DISTANT, ENDLESS HUM.webp",
  "/cover/DOUBLED PRESENCE IN A DISEMBODIED SPACE.webp",
  "/cover/Edges that blur, bodies that fold into something other.webp",
  "/cover/EVEN SPECTRES CAN TIRE.webp",
  "/cover/exuviae.webp",
  "/cover/GRASS ON ROADSIDE 4.webp",
  "/cover/GREEN GROWTH.webp",
  "/cover/GROWING BODY.webp",
  "/cover/KETEROS.webp",
  "/cover/Love.webp",
  "/cover/LUCA.jpg",
  "/cover/MAIN DE FER, GANT DE VELOURS.webp",
  "/cover/Massage Platz.webp",
  "/cover/METEMPSYCHOSIS.webp",
  "/cover/MOONLIT BOTANICAL COLOUR THEORIES.webp",
  "/cover/NIKE, TA MÈRE (WILL FALL ON YOU).webp",
  "/cover/PARACHUTE (GROUP EXHIBITION).webp",
  "/cover/PETRICHOR.webp",
  "/cover/PULSES WITHIN.webp",
  "/cover/SOFT_SIGHS SYNTHESIS.webp",
  "/cover/STIAN EIDE KLUGE AT ROTHHAUS, KUNSTNERNES HUS, OSLO.webp",
  "/cover/SWEET WORLD 1.webp",
  "/cover/TACTICS FOR AN ERA (GROUP SHOW).webp",
  "/cover/TANGLED IN SHADOWS FROM AN OLD DRAWER.webp",
  "/cover/THE LANGUAGE OF THE ENEMY.webp",
  "/cover/THE SHAPE OF A SCAR.webp",
  "/cover/The Stages of Grief.webp",
  "/cover/THRESHOLDS.webp",
  "/cover/TISSU EXPANSÉ.webp",
  "/cover/TOMORROW'S FORECAST, WHITE CLOUDS GREY DOGS.webp",
  "/cover/TOTAL INTERNAL REFLECTION.webp",
  "/cover/VITALS VAPORS.webp",
  "/cover/WHEN DOORS CLOSE, WALLS RISE.webp",
  "/cover/WHO COMPOSES THE SONG OF THE CRICKETS.webp",
] as const;

function normalizeTitle(value: string) {
  return value
    .replace(/\.[^.]+$/, "")
    .toLocaleLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const coverImagesByTitle = new Map(
  coverImagePaths.map((coverImage) => {
    const filename = coverImage.split("/").at(-1) ?? coverImage;
    return [normalizeTitle(filename), coverImage];
  }),
);

export function coverImageForTitle(title: string) {
  return coverImagesByTitle.get(normalizeTitle(title));
}

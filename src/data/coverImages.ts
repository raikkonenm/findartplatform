const coverImagePaths = [
  "/cover/47°24’35’’N  9°44’20’’E.png",
  "/cover/A BLADE UNHELD.png",
  "/cover/AFTERLIFES.png",
  "/cover/Begone Estrone.png",
  "/cover/BLUE BLOODED.png",
  "/cover/BUCOLICA.png",
  "/cover/Choice Dirt.png",
  "/cover/COMMON LANDSCAPE(S) (GROUP SHOW).png",
  "/cover/DISTANT, ENDLESS HUM.png",
  "/cover/DOUBLED PRESENCE IN A DISEMBODIED SPACE.png",
  "/cover/Edges that blur, bodies that fold into something other.png",
  "/cover/EVEN SPECTRES CAN TIRE.png",
  "/cover/exuviae.png",
  "/cover/GRASS ON ROADSIDE 4.png",
  "/cover/GREEN GROWTH.png",
  "/cover/GROWING BODY.png",
  "/cover/KETEROS.png",
  "/cover/Love.png",
  "/cover/LUCA.jpg",
  "/cover/MAIN DE FER, GANT DE VELOURS.png",
  "/cover/Massage Platz.png",
  "/cover/METEMPSYCHOSIS.png",
  "/cover/MOONLIT BOTANICAL COLOUR THEORIES.png",
  "/cover/PARACHUTE (GROUP EXHIBITION).png",
  "/cover/PETRICHOR.png",
  "/cover/PULSES WITHIN.png",
  "/cover/SOFT_SIGHS SYNTHESIS.png",
  "/cover/SWEET WORLD 1.png",
  "/cover/TACTICS FOR AN ERA (GROUP SHOW).png",
  "/cover/THE LANGUAGE OF THE ENEMY.png",
  "/cover/THE SHAPE OF A SCAR.png",
  "/cover/The Stages of Grief.png",
  "/cover/THRESHOLDS.png",
  "/cover/TISSU EXPANSÉ.png",
  "/cover/TOMORROW'S FORECAST, WHITE CLOUDS GREY DOGS.png",
  "/cover/TOTAL INTERNAL REFLECTION.png",
  "/cover/VITALS VAPORS.png",
  "/cover/WHEN DOORS CLOSE, WALLS RISE.png",
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

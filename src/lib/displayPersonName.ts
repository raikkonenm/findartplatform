// Turn Instagram handles / all-caps names into a clean display form.
// Extracted from ExhibitionDetail so editorial and card renderers can
// share the same normalization.
//
// Examples:
//   "@artsonje_center" → "Art Sonje Center"
//   "@_dae_uk_kim_"    → "Dae Uk Kim"
//   "SUNGWOOK HA"      → "Sungwook Ha"
//   "Adrián Villar Rojas" → "Adrián Villar Rojas" (unchanged)

const ACRONYMS = new Set(["cac", "acud", "moco", "nyc"]);

function formatWord(word: string): string {
  const normalized = word.toLowerCase();
  if (ACRONYMS.has(normalized)) return normalized.toUpperCase();
  const spaced = word.replace(/([a-z])([A-Z])/g, "$1 $2");
  return spaced
    .split(" ")
    .map((part) => {
      const lower = part.toLowerCase();
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join(" ");
}

// Strip @/# handle prefixes and title-case the token segments.
export function displayMetadataText(value?: string): string | undefined {
  return value?.replace(/[@#]([\p{L}\p{N}_.-]+)/gu, (_match, token: string) =>
    token
      .split(/[._-]+/)
      .filter(Boolean)
      .map(formatWord)
      .join(" "),
  );
}

// As above, plus lower/title-case fix for ALL-CAPS names.
export function displayPersonText(value?: string): string | undefined {
  const displayed = displayMetadataText(value);
  if (!displayed) return displayed;
  const lettersOnly = displayed.replace(/[^\p{L}]/gu, "");
  if (lettersOnly !== lettersOnly.toLocaleUpperCase()) return displayed;
  return displayed
    .toLocaleLowerCase()
    .replace(/(^|[\s,/&-]+)(\p{L})/gu, (_match, prefix: string, letter: string) => {
      return `${prefix}${letter.toLocaleUpperCase()}`;
    })
    .replace(/\bAnd\b/g, "and");
}

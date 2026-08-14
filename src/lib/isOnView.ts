import type { Exhibition } from "@/data/exhibitions";

/**
 * Parse a human-readable date such as "18 June 2026" into a UTC
 * timestamp anchored at noon so the server's timezone can't shift
 * the calendar day. Returns null if the string doesn't parse
 * cleanly (missing year, partial date, etc.) — callers treat null
 * as "unknown", which means "not on view".
 */
function parseAsUtcNoon(humanDate: string | undefined): number | null {
  if (!humanDate) return null;
  const ts = Date.parse(`${humanDate} 12:00:00 UTC`);
  return Number.isNaN(ts) ? null : ts;
}

/**
 * Returns true when the exhibition is currently on view, i.e. the
 * caller's `now` timestamp falls between the seed's startDate and
 * endDate (inclusive of both endpoints). Any exhibition with an
 * unparseable or missing startDate/endDate is treated as "not on
 * view" so the caller never gets a false positive.
 *
 * Call this from a client-side `useEffect` with `now = Date.now()`
 * so the flag reflects the visitor's actual today rather than the
 * SSG build day.
 */
export function isExhibitionOnView(
  exhibition: Pick<Exhibition, "startDate" | "endDate">,
  now: number,
): boolean {
  const start = parseAsUtcNoon(exhibition.startDate);
  const end = parseAsUtcNoon(exhibition.endDate);
  if (start === null || end === null) return false;
  // Extend `end` by 24 hours so an exhibition closing on 2026-07-25
  // still reads as "on view" throughout the closing day itself,
  // regardless of the visitor's timezone.
  return now >= start && now <= end + 24 * 60 * 60 * 1000;
}

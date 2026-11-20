import type { EditorialSelectionCardData } from "@/data/editorialSelections";

export type EditorialFeedItem = {
  kind: "editorial-selection";
  selection: EditorialSelectionCardData;
  flatIdx: number;
};

// Features and ads do not count towards the three-exhibition interval.
// Insert each Editorial card once, preserving the existing feed order.
export function interleaveEditorialItems<T extends { kind: string; flatIdx: number }>(
  items: T[], selections: EditorialSelectionCardData[],
): Array<T | EditorialFeedItem> {
  const result: Array<T | EditorialFeedItem> = [];
  let exhibitionCount = 0;
  let selectionIndex = 0;
  for (const item of items) {
    result.push(item);
    if (item.kind !== "exhibition") continue;
    exhibitionCount++;
    if (exhibitionCount % 3 === 0 && selectionIndex < selections.length) {
      result.push({ kind: "editorial-selection", selection: selections[selectionIndex++], flatIdx: result.length });
    }
  }
  return result;
}

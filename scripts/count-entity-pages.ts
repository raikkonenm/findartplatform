import { collectEntitySlugs, type EntityKind } from "../src/lib/entitySlugs";

const kinds: EntityKind[] = ["gallery", "artist", "curator", "photographer"];
let total = 0;
for (const kind of kinds) {
  const m = collectEntitySlugs(kind);
  console.log(`${kind.padEnd(14)} ${m.size} unique slugs`);
  total += m.size;
}
console.log("---");
console.log(`TOTAL entity pages: ${total}`);

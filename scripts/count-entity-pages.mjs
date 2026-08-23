import { register } from "node:module";
register("ts-node/esm", import.meta.url);

const mod = await import("../src/lib/entitySlugs.ts");
for (const kind of ["gallery", "artist", "curator", "photographer"]) {
  const m = mod.collectEntitySlugs(kind);
  console.log(`${kind.padEnd(14)} ${m.size} unique slugs`);
}

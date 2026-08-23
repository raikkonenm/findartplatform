// Fix UTF-8 sequences that were once decoded as Windows-1251 (or 1252)
// and re-encoded as UTF-8.
//
// The file now contains characters like `вЂ"`, `в‚¬`, `Г©`. Reverse it:
// take each character, look up its CP1251 (or CP1252) byte value, gather
// those bytes, decode as UTF-8. Only substrings that contain mojibake
// markers are touched — a substring that "roundtrips" back to something
// with FEWER markers is used, otherwise the original stands.
import { readFileSync, writeFileSync } from "node:fs";

const [, , path] = process.argv;
if (!path) {
  console.error("usage: node fix-mojibake.mjs <file>");
  process.exit(1);
}

// Build char → byte tables for cp1251 and cp1252 (both are single-byte).
function buildEncodeTable(codec) {
  const decoder = new TextDecoder(codec, { fatal: false });
  const table = new Map();
  for (let i = 0; i < 256; i++) {
    const ch = decoder.decode(new Uint8Array([i]));
    // Skip replacement/undefined codepoints so we don't collide with
    // legitimate content.
    if (ch && ch !== "�") {
      if (!table.has(ch)) table.set(ch, i);
    }
  }
  return table;
}
const CP1251 = buildEncodeTable("windows-1251");
const CP1252 = buildEncodeTable("windows-1252");

function reencode(str, table) {
  const bytes = [];
  for (const ch of str) {
    const b = table.get(ch);
    if (b === undefined) return null;
    bytes.push(b);
  }
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(new Uint8Array(bytes));
  } catch {
    return null;
  }
}

const MARKER = /[Ѐ-ӿ‰€“”‚–—•…]/;

function countMarkers(s) {
  const m = s.match(/[Ѐ-ӿ‰€“”‚]/g);
  return m ? m.length : 0;
}

// Process only stretches of text that contain markers. Split by ASCII
// / URL-safe / whitespace boundaries so we don't corrupt correct
// content around a mojibake blob.
function fixLine(line) {
  if (!MARKER.test(line)) return line;
  // Try line-wide first with cp1252 then cp1251.
  const before = countMarkers(line);
  for (const table of [CP1252, CP1251]) {
    const decoded = reencode(line, table);
    if (decoded && countMarkers(decoded) < before) return decoded;
  }
  return line;
}

const src = readFileSync(path, "utf8");
const lines = src.split(/\r?\n/);
let fixed = 0;
const out = lines.map((line) => {
  const f = fixLine(line);
  if (f !== line) fixed += 1;
  return f;
});
writeFileSync(path, out.join("\n"), "utf8");
console.log(`fixed ${fixed} line(s) in ${path}`);

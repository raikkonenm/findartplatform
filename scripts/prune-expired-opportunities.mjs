#!/usr/bin/env node
// One-off: delete opportunity entries whose deadlineDate is strictly before
// TODAY from src/data/opportunities.ts. Preserves comments and formatting.
//
// Handles two block styles:
//   1) CURATED multiline entries — `  {\n ... deadlineDate: "YYYY-MM-DD" ... \n  },`
//   2) ART_RABBIT one-line entries — `  artRabbitOpportunity({ ... deadlineDate: "YYYY-MM-DD" ... }),`

import fs from "node:fs";

const TODAY = process.env.PRUNE_TODAY || "2026-11-01";
const FILE = "src/data/opportunities.ts";
const src = fs.readFileSync(FILE, "utf8");
const lines = src.split("\n");

/**
 * Walk the file top-to-bottom. For CURATED-style blocks we track brace depth
 * starting at a `  {` opener; the closing `  },` ends the block. We record
 * (startLine, endLine, deadlineDate) tuples, then drop expired ranges.
 */
const expiredRanges = [];
let i = 0;
while (i < lines.length) {
  const line = lines[i];
  // Case 1: multiline block opener (two leading spaces + `{` and nothing else)
  if (/^  \{\s*$/.test(line)) {
    let depth = 1;
    let deadlineDate = null;
    let j = i + 1;
    while (j < lines.length && depth > 0) {
      const inner = lines[j];
      if (!deadlineDate) {
        const m = inner.match(/deadlineDate:\s*"(\d{4}-\d{2}-\d{2})"/);
        if (m) deadlineDate = m[1];
      }
      // Track depth with simple heuristics; good enough since values use quotes
      // and don't contain unbalanced braces in this file.
      for (const ch of inner) {
        if (ch === "{") depth++;
        else if (ch === "}") depth--;
      }
      j++;
    }
    // j is now line AFTER the closing `  },`
    if (deadlineDate && deadlineDate < TODAY) {
      expiredRanges.push({ start: i, end: j, deadline: deadlineDate, kind: "curated" });
    }
    i = j;
    continue;
  }
  // Case 2: artRabbit one-liner with deadlineDate inline
  const m = line.match(/^  artRabbitOpportunity\(\{.*deadlineDate:\s*"(\d{4}-\d{2}-\d{2})"/);
  if (m) {
    const deadlineDate = m[1];
    if (deadlineDate < TODAY) {
      expiredRanges.push({ start: i, end: i + 1, deadline: deadlineDate, kind: "artrabbit" });
    }
  }
  i++;
}

if (expiredRanges.length === 0) {
  console.log("Nothing to prune.");
  process.exit(0);
}

// Build the pruned output.
const keep = new Array(lines.length).fill(true);
for (const r of expiredRanges) {
  for (let k = r.start; k < r.end; k++) keep[k] = false;
}
const out = lines.filter((_, idx) => keep[idx]).join("\n");

fs.writeFileSync(FILE, out);
console.log(`Pruned ${expiredRanges.length} expired entries (deadline < ${TODAY}):`);
for (const r of expiredRanges) {
  console.log(`  ${r.deadline}  ${r.kind}  lines ${r.start + 1}..${r.end}`);
}

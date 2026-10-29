const segmenter = new Intl.Segmenter('en', { granularity: 'sentence' });

function sentences(text) {
  return [...segmenter.segment(text)].filter(part => part.segment.trim()).map(part => ({
    start: part.index + part.segment.search(/\S/),
    end: part.index + part.segment.trimEnd().length,
  }));
}

export const sentenceCount = text => sentences(text).length;

// Keep offsets into the author's actual text. Credits, bibliography and isolated
// verse are not curatorial prose, and cannot join two otherwise separate quotes.
function proseBlocks(text) {
  const blocks = [];
  let current;
  for (const match of text.matchAll(/\S[\s\S]*?(?=\n\s*\n|$)/g)) {
    const paragraph = match[0].trimEnd();
    const metadata = /^(?:[—–-]\s*)?(?:text|photo(?:graphy)?|curat(?:or|ion)|architecture|light design|credits?)\s*:/i.test(paragraph)
      || /^\(?\d+\)[ \t]|^\d+\.[ \t]/.test(paragraph)
      || !/[.!?]["”’']?\s*$/.test(paragraph);
    if (metadata) { current = undefined; continue; }
    if (!current) { current = { start: match.index, end: match.index + paragraph.length }; blocks.push(current); }
    else current.end = match.index + paragraph.length;
  }
  return blocks.map(block => text.slice(block.start, block.end));
}

function interest(text, count) {
  // Prefer passages about artistic practice, materials and ideas over generic
  // introductions or biographical/administrative endings. No text is rewritten.
  const practice = text.match(/\b(?:artist\w*|work\w*|sculptur\w*|install\w*|material\w*|paint\w*|photograph\w*|practice|exhibition)\b/gi) || [];
  const ideas = text.match(/\b(?:explor\w*|transform\w*|percept\w*|meaning\w*|symbol\w*|reinterpret\w*|memory|imag\w*|relat\w*|reflect\w*|question\w*|concept\w*)\b/gi) || [];
  const admin = text.match(/\b(?:co-financed|funded|represented by|lives and works|opening hours)\b/gi) || [];
  return Math.min(practice.length, 12) + Math.min(ideas.length, 12) * 1.5 + count * 1.2 - admin.length * 6;
}

export function selectExcerpt(text, { budget, preferred = '', sourceLabel = 'Original curatorial prose' } = {}) {
  const warnings = [], errors = [];
  const preferredCount = sentenceCount(preferred);
  if (preferred && preferredCount >= 5 && preferredCount <= 10 && preferred.length <= budget && text.includes(preferred)) {
    return { excerpt: preferred, count: preferredCount, warnings, errors };
  }
  const blocks = proseBlocks(text);
  const passages = blocks.map(block => ({ block, spans: sentences(block) }));
  const maximum = Math.max(0, ...passages.map(entry => entry.spans.length));
  const candidates = [];
  const minimum = maximum < 5 ? maximum : 5;
  for (const { block, spans } of passages) {
    for (let start = 0; start < spans.length; start++) {
      for (let count = Math.min(10, spans.length - start); count >= Math.max(1, minimum); count--) {
        // When shortening an automatic selection, prefer 5–7 complete sentences
        // rather than squeezing eight or nine in at the character limit.
        if (maximum >= 10 && count > 7 && count < 10) continue;
        const excerpt = block.slice(spans[start].start, spans[start + count - 1].end);
        const paragraphStart = spans[start].start === 0 || /\n\s*\n\s*$/.test(block.slice(0, spans[start].start));
        const danglingStart = /^(?:In order to (?:perceive|understand) this|This|These|Those|Such|It|They|He|She|Through such)\b/i.test(excerpt);
        if (excerpt.length <= budget) candidates.push({ excerpt, count, score: interest(excerpt, count) + (paragraphStart ? 6 : 0) - (danglingStart ? 6 : 0) });
      }
    }
  }
  candidates.sort((a, b) => b.score - a.score || b.count - a.count || a.excerpt.length - b.excerpt.length);
  const chosen = candidates[0];
  if (!chosen) {
    errors.push(maximum >= 5
      ? 'Five complete source sentences cannot fit with all credits within 2,200 characters; editorial review is required.'
      : 'The available source excerpt cannot fit with all credits within 2,200 characters; editorial review is required.');
    return { excerpt: '', count: 0, warnings, errors };
  }
  if (maximum < 5) warnings.push(`${sourceLabel} has only ${maximum} sentence(s) in its longest continuous passage; using the maximum available excerpt below the 5–10 sentence target.`);
  if (preferred && preferredCount < 5 && maximum >= 5) warnings.push('Stored excerpt was shorter than five sentences; selected a continuous passage from the full original text.');
  return { excerpt: chosen.excerpt, count: chosen.count, warnings, errors };
}

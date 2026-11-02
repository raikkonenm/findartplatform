const segmenter = new Intl.Segmenter('en', { granularity: 'sentence' });
const abbreviation = /(?:\b(?:Dr|Mr|Mrs|Ms|Prof|St|Sr|Jr|No|Fig|vol|pp|vs|etc)\.|(?:^|\s)[A-Z]\.)$/u;

// Keep offsets into the original text: a quotation is always one exact slice,
// including its punctuation and paragraph breaks, never reassembled sentences.
export function sentenceSpans(text) {
  const spans = [];
  for (const part of segmenter.segment(text)) {
    const trimmed = part.segment.trim();
    if (!trimmed) continue;
    const start = part.index + part.segment.indexOf(trimmed);
    const end = start + trimmed.length;
    const previous = spans.at(-1);
    if (previous && abbreviation.test(text.slice(previous.start, previous.end))) previous.end = end;
    else spans.push({ start, end });
  }
  // Headings and trailing fragments do not satisfy the minimum sentence count.
  return spans.filter(span => /[.!?…]["'”’»)}\]¹²³⁴⁵⁶⁷⁸⁹⁰]*$/u.test(text.slice(span.start, span.end)));
}

function essayBody(source) {
  // Credits and appended biographies are not part of the curatorial quotation.
  const ending = source.search(/\n\s*(?:[—–-]\s*)?(?:(?:Text(?: authors?)?|Photo(?:graphy)?|Production|Graphic Design|Social media info)\s*:|Participant bios\b|Artist biography\b|Biography\s*\n)/iu);
  return (ending < 0 ? source : source.slice(0, ending)).trim();
}

function passageScore(text, paragraphStart) {
  const concepts = text.match(/\b(?:exhibition|practice|explor\w*|material\w*|sculptur\w*|installation\w*|perception|memory|history|politic\w*|body|bodies|landscape|transform\w*|relation\w*|meaning|form\w*)\b/gi) || [];
  const biography = text.match(/\b(?:born|graduated|bachelor|master's degree|solo exhibitions include|lives and works)\b/gi) || [];
  return Math.min(concepts.length, 20) * 2 - biography.length * 8 + (paragraphStart ? 3 : 0);
}

export function selectExhibitionExcerpt({ source, preferred = '', maxCharacters = Infinity }) {
  const errors = [], warnings = [];
  const body = essayBody(source || '');
  const spans = sentenceSpans(body);
  if (!spans.length) return { excerpt: '', sentences: 0, errors: ['An actual exhibition quotation source is required.'], warnings };
  const selected = preferred.trim();
  const anchor = selected ? body.indexOf(selected) : -1;
  if (selected && anchor < 0) return { excerpt: '', sentences: 0, errors: ['Selected quotation is not verbatim curatorial source text.'], warnings };

  if (spans.length < 5) {
    warnings.push(`The original quotation source contains only ${spans.length} sentence(s); using all available text instead of 5–10 sentences.`);
    if (body.length > maxCharacters) errors.push('The available short quotation cannot fit within 2,200 characters with all credits.');
    return { excerpt: body, sentences: spans.length, errors, warnings };
  }

  const selectedSpans = selected ? sentenceSpans(selected) : [];
  const wholeSelection = spans.some(s => s.start === anchor) && spans.some(s => s.end === anchor + selected.length);
  if (selectedSpans.length >= 5 && selectedSpans.length <= 10 && wholeSelection && selected.length <= maxCharacters) {
    return { excerpt: selected, sentences: selectedSpans.length, errors, warnings };
  }

  const anchorSentence = anchor < 0 ? -1 : spans.findIndex(s => s.start <= anchor && s.end > anchor);
  const anchorLast = anchor < 0 ? -1 : spans.findIndex(s => s.start < anchor + selected.length && s.end >= anchor + selected.length);
  // An oversized editor selection can be shortened at sentence boundaries.
  const anchorEnd = selectedSpans.length > 10 || selected.length > maxCharacters ? anchorSentence : anchorLast;
  for (let count = Math.min(10, spans.length); count >= 5; count--) {
    const candidates = [];
    for (let start = 0; start + count <= spans.length; start++) {
      if (anchorSentence >= 0 && (start > anchorSentence || start + count - 1 < anchorEnd)) continue;
      const first = spans[start].start, last = spans[start + count - 1].end;
      const text = body.slice(first, last);
      if (text.length > maxCharacters) continue;
      candidates.push({ text, score: passageScore(text, first === 0 || /\n\s*$/.test(body.slice(0, first))), start });
    }
    candidates.sort((a, b) => b.score - a.score || a.start - b.start);
    if (candidates.length) {
      if (selectedSpans.length > 10 || selected.length > maxCharacters) warnings.push(`The selected passage was shortened to ${count} complete sentences to preserve the caption limit and credits.`);
      return { excerpt: candidates[0].text, sentences: count, errors, warnings };
    }
  }
  return { excerpt: '', sentences: 0, errors: ['No connected passage of at least 5 complete sentences fits within 2,200 characters with all credits. Editorial review is required; the quote was not reduced to one sentence.'], warnings };
}

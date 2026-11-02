import test from 'node:test';
import assert from 'node:assert/strict';
import { sentenceSpans, selectExhibitionExcerpt } from './exhibition-excerpt.mjs';
import { contentCaption, loadCatalog } from './content.mjs';

const sentences = [
  'The exhibition explores how memory is carried through material forms.',
  'The artist builds sculptures from objects gathered during daily walks.',
  'Their familiar shapes become less certain when placed beside one another.',
  'Ceramic surfaces retain the marks left by pressure and repeated handling.',
  'Fragments of domestic architecture introduce another scale of bodily experience.',
  'The installation connects these encounters without fixing a single interpretation.',
  'Movement through the room changes which relationships come into view.',
  'Open spaces between the works become part of that changing arrangement.',
  'Light reveals the contrast between manufactured edges and irregular surfaces.',
  'The practice makes attentive looking an active part of the exhibition.',
  'A final sculpture returns to the material introduced at the entrance.',
  'Its altered shape leaves the encounter open to further associations.',
];
const makeItem = (description = sentences.join(' ')) => ({ type: 'exhibition', slug: 'quote-test', title: 'Actual Exhibition', artists: ['Documented Artist'], curator: 'Named Curator', photographer: 'Named Photographer', gallery: 'Real Gallery', city: 'Paris', country: 'France', startDate: '2026-10-01', endDate: '2026-11-01', description, publicUrl: 'https://www.findartplatform.com/exhibitions/quote-test', social: { status: 'published', revision: 1, language: 'en', excerpt: sentences[0] } });
const quotation = result => result.caption.match(/\n\n“([\s\S]+)”\n\n~ Full exhibition documentation/)?.[1];

test('legacy one-sentence metadata expands to ten connected original sentences', () => {
  const item = makeItem(), result = contentCaption(item);
  assert.deepEqual(result.errors, []);
  assert.equal(result.excerptSentences, 10);
  assert.ok(item.description.includes(quotation(result)));
  assert.ok(quotation(result).includes(item.social.excerpt));
});

test('an editor-selected six-sentence passage retains its paragraph breaks and wording', () => {
  const source = sentences.slice(0, 3).join(' ') + '\n\n' + sentences.slice(3).join(' ');
  const preferred = sentences.slice(0, 3).join(' ') + '\n\n' + sentences.slice(3, 6).join(' ');
  const item = makeItem(source); item.social.excerpt = preferred;
  const result = contentCaption(item);
  assert.equal(quotation(result), preferred);
  assert.equal(result.excerptSentences, 6);
  assert.deepEqual(result.errors, []);
});

test('an explicit oversized passage cannot bypass the ten-sentence maximum', () => {
  const source = sentences.join(' ');
  const result = selectExhibitionExcerpt({ source, preferred: source });
  assert.equal(result.sentences, 10);
  assert.ok(source.includes(result.excerpt));
  assert.ok(result.warnings.some(warning => warning.includes('shortened')));
});

test('a short preferred passage in the middle is expanded around the original anchor', () => {
  const result = selectExhibitionExcerpt({ source: sentences.join(' '), preferred: sentences[10] });
  assert.equal(result.sentences, 10);
  assert.ok(result.excerpt.includes(sentences[10]));
  assert.ok(sentences.join(' ').includes(result.excerpt));
});

test('the character budget shortens a passage at sentence boundaries and keeps every credit', () => {
  const expanded = sentences.map(sentence => sentence.slice(0, -1) + ', with careful attention to the material history of the objects and the relationships between the people, spaces and practices brought together within this particular setting.');
  const item = makeItem(expanded.join(' ')); item.social.excerpt = expanded.slice(0, 10).join(' ');
  item.social.credits = [{ role: 'Text', people: [{ name: 'Actual Author' }] }, { role: 'Production', people: [{ name: 'Production Person' }] }];
  const result = contentCaption(item);
  assert.deepEqual(result.errors, []);
  assert.ok(result.excerptSentences >= 5 && result.excerptSentences < 10);
  assert.ok(result.caption.length <= 2200);
  for (const credit of ['#DocumentedArtist', '#NamedCurator', '#NamedPhotographer', '#ActualAuthor', '#ProductionPerson', 'Real Gallery, Paris, France, 1 October - 1 November 2026']) assert.ok(result.caption.includes(credit));
  assert.ok(item.description.includes(quotation(result)));
});

test('an impossible five-sentence budget requires review instead of silently sending one sentence', () => {
  const source = sentences.slice(0, 6).map(sentence => sentence.slice(0, -1) + ' ' + 'material '.repeat(70).trim() + '.').join(' ');
  const item = makeItem(source); delete item.social.excerpt;
  const result = contentCaption(item);
  assert.ok(result.errors.some(error => error.includes('at least 5')));
  assert.equal(result.excerptSentences, 0);
  assert.ok(result.caption.includes('Photo: #NamedPhotographer'));
});

test('a genuinely short three-sentence source is preserved in full with an explicit warning', () => {
  const item = makeItem(sentences.slice(0, 3).join(' '));
  const result = contentCaption(item);
  assert.deepEqual(result.errors, []);
  assert.equal(quotation(result), item.description);
  assert.equal(result.excerptSentences, 3);
  assert.ok(result.warnings.some(warning => warning.includes('only 3 sentence')));
});

test('titles, initials, acronyms and decimal numbers do not inflate the sentence count', () => {
  const source = 'Dr. J. Smith examines the U.S. archive. Her sculpture measures 3.5 metres. Prof. Jones studies its material history. The exhibition connects sculpture and memory. Another installation explores bodily perception. The final work completes the encounter.';
  assert.equal(sentenceSpans(source).length, 6);
  const result = selectExhibitionExcerpt({ source });
  assert.equal(result.sentences, 6);
  assert.equal(result.excerpt, source);
});

test('headings and unfinished fragments do not count as complete source sentences', () => {
  const source = 'A PROJECT ABOUT MEMORY\n\n' + sentences.slice(0, 5).join(' ') + '\n\nAn unfinished fragment';
  const result = selectExhibitionExcerpt({ source });
  assert.equal(result.sentences, 5);
  assert.equal(result.excerpt, sentences.slice(0, 5).join(' '));
});

test('disconnected or invented excerpts cannot be presented as a contiguous quotation', () => {
  const result = selectExhibitionExcerpt({ source: sentences.join(' '), preferred: sentences[0] + ' ' + sentences[4] });
  assert.ok(result.errors.some(error => error.includes('verbatim')));
});

test('appended production credits and biographies are kept outside the curatorial quote', () => {
  const source = sentences.join(' ') + '\n\n— Text: An Actual Author\n\nParticipant bios\nBorn in 1980, the artist lives and works elsewhere.';
  const result = selectExhibitionExcerpt({ source });
  assert.equal(result.sentences, 10);
  assert.ok(!result.excerpt.includes('An Actual Author'));
  assert.ok(!result.excerpt.includes('Born in'));
});

test('a website overview needs a separate verified original source and is never quoted as the curator', () => {
  const item = makeItem('An editorial overview of the exhibition.');
  item.descriptionKind = 'overview'; item.social.excerpt = sentences[0];
  assert.ok(contentCaption(item).errors.some(error => error.includes('editorial overview')));
  item.social.quotationSource = { text: sentences.join(' '), language: 'en', verified: true, sourceUrl: 'https://example.com/exhibition' };
  const result = contentCaption(item);
  assert.deepEqual(result.errors, []);
  assert.equal(result.excerptSentences, 10);
  assert.ok(item.social.quotationSource.text.includes(quotation(result)));
  assert.equal(item.description, 'An editorial overview of the exhibition.');
  item.social.quotationSource.verified = false;
  assert.ok(contentCaption(item).errors.some(error => error.includes('editor-verified')));
});

test('verified translations use five to ten complete sentences without inventing additional translation', () => {
  const original = 'Первое предложение. Второе предложение. Третье предложение. Четвёртое предложение. Пятое предложение. Шестое предложение.';
  const item = makeItem(original); item.social.language = 'ru';
  item.social.translatedExcerpt = { text: sentences.slice(0, 6).join(' '), sourceText: original, language: 'en', verified: true };
  const result = contentCaption(item);
  assert.deepEqual(result.errors, []);
  assert.equal(result.excerptSentences, 6);
  item.social.translatedExcerpt.text = sentences[0];
  assert.ok(contentCaption(item).errors.some(error => error.includes('translation is too short')));
});

test('actual Ritual metadata no longer limits the caption to its old short excerpt', () => {
  const item = loadCatalog(process.cwd()).find(item => item.slug === 'ritual-for-happiness-gudwin');
  const result = contentCaption(item);
  assert.deepEqual(result.errors, []);
  assert.ok(result.excerptSentences >= 5 && result.excerptSentences <= 10);
  assert.ok(result.caption.length <= 2200);
  assert.ok(item.description.includes(quotation(result)));
  assert.ok(result.caption.includes('Text: #TimoPoeppel'));
});

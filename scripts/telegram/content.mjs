import { readFileSync, existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import ts from 'typescript';
import { selectExcerpt } from './excerpts.mjs';

export const SITE = 'https://www.findartplatform.com';
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// The existing data uses extensionless TypeScript imports. Load only trusted
// repository data, using the project's installed compiler, without rewriting it.
export function loadCatalog(root) {
  const cache = new Map();
  const dataRoot = path.join(root, 'src', 'data');
  function load(file) {
    file = path.resolve(file);
    if (!file.startsWith(dataRoot + path.sep)) throw new Error('Data import outside src/data');
    if (cache.has(file)) return cache.get(file).exports;
    const dataModule = { exports: {} };
    cache.set(file, dataModule);
    const code = ts.transpileModule(readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
    const native = createRequire(file);
    new Function('require', 'module', 'exports', code)(name => name.startsWith('.') ? load(path.resolve(path.dirname(file), name + (path.extname(name) ? '' : '.ts'))) : native(name), dataModule, dataModule.exports);
    return dataModule.exports;
  }
  const exhibitions = load(path.join(dataRoot, 'exhibitions.ts')).exhibitions;
  const features = load(path.join(dataRoot, 'editorial.ts')).editorialArtists;
  const artworksFile = path.join(dataRoot, 'artworks.ts');
  const artworks = existsSync(artworksFile) ? load(artworksFile).artworks : [];
  const records = [
    ...exhibitions.map(item => ({ ...item, type: 'exhibition', publicUrl: `${SITE}/exhibitions/${item.slug}` })),
    ...features.map(item => ({ ...item, type: 'feature', title: item.artistName, artists: [item.artistName], description: item.body, coverImage: item.coverImage.src, publicUrl: `${SITE}/features/${item.slug}` })),
    ...artworks.map(item => ({ ...item, type: 'artwork', publicUrl: item.social.publicUrl })),
  ];
  const ids = records.map(item => `${item.type}:${item.slug}`);
  if (new Set(ids).size !== ids.length) throw new Error('Duplicate content type/slug in catalog');
  return records;
}

const CYRILLIC = Object.fromEntries([...('абвгдеёжзийклмнопрстуфхцчшщъыьэюяіїєґ')].map((letter, index) => [letter, ['a','b','v','g','d','e','yo','zh','z','i','y','k','l','m','n','o','p','r','s','t','u','f','kh','ts','ch','sh','shch','','y','','e','yu','ya','i','yi','ye','g'][index]]));
export function nameHashtag(name) {
  const latin = [...name].map(letter => {
    const mapped = CYRILLIC[letter.toLowerCase()];
    return mapped === undefined ? letter : letter === letter.toUpperCase() ? mapped.charAt(0).toUpperCase() + mapped.slice(1) : mapped;
  }).join('').replace(/[ŁłØøÆæß]/g, letter => ({ Ł:'L', ł:'l', Ø:'O', ø:'o', Æ:'Ae', æ:'ae', ß:'ss' })[letter]).normalize('NFKD').replace(/\p{M}/gu, '');
  if (/[^\x00-\x7F]/.test(latin)) throw new Error(`A documented Latin spelling is required for ${name}`);
  const result = latin.replace(/[^a-z0-9]/gi, '');
  if (!result) throw new Error('A real credit name is required');
  return '#' + result;
}

export function creditName(person, warnings = []) {
  if (!person?.name || /^[@#]/.test(person.name) || /[\r\n]/.test(person.name)) throw new Error('Credit requires a real single-line full name; an unverified handle is insufficient');
  const handle = person.instagram;
  if (handle?.verified === true) {
    if (!/^@[a-zA-Z0-9._]{1,30}$/.test(handle.handle)) throw new Error('Invalid verified Instagram handle');
    return handle.handle;
  }
  warnings.push(`No verified Instagram handle for ${person.name}; using a name hashtag.`);
  return nameHashtag(person.latinName || person.name);
}

export function parseDate(text) {
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text || '');
  const english = /^(\d{1,2}) ([A-Za-z]+) (\d{4})$/.exec(text || '');
  const year = Number(iso?.[1] || english?.[3]);
  const month = iso ? Number(iso[2]) : MONTHS.findIndex(value => value.toLowerCase() === english?.[2]?.toLowerCase()) + 1;
  const day = Number(iso?.[3] || english?.[1]);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (!year || month < 1 || month > 12 || date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) throw new Error(`Invalid exhibition date: ${text || '(missing)'}`);
  return { year, month, day, value: date.getTime() };
}

export function dateRange(start, end) {
  const a = parseDate(start), b = parseDate(end);
  if (b.value < a.value) throw new Error('Exhibition end precedes start');
  const label = value => `${value.day} ${MONTHS[value.month - 1]}`;
  if (a.value === b.value) return `${label(a)} ${a.year}`;
  return `${label(a)}${a.year !== b.year ? ` ${a.year}` : ''} - ${label(b)} ${b.year}`;
}

export function contentCaption(item) {
  const errors = [], warnings = [];
  const social = item.social || {};
  if (social.status !== 'published') errors.push('Content is not explicitly marked published.');
  if (!Number.isInteger(social.revision) || social.revision < 1) errors.push('A positive publication revision is required.');
  if (!item.slug || !/^[a-z0-9][a-z0-9-]*$/.test(item.slug)) errors.push('Invalid unique slug.');
  if (!item.title?.trim() || /[\r\n]/.test(item.title)) errors.push('A single-line full title is required.');
  const people = social.artists || (item.artists || []).map(person => typeof person === 'string' ? { name: person } : person);
  const names = people.map(person => person.name).filter(Boolean);
  let headline = item.title?.trim() || '';
  if (item.type === 'exhibition' && names.length >= 4) { if (!/\(group exhibition\)$/i.test(headline)) headline += ' (GROUP EXHIBITION)'; }
  else if (names.length) {
    const joined = names.length < 3 ? names.join(' and ') : names.slice(0, -1).join(', ') + ' and ' + names.at(-1);
    if (!(item.type === 'feature' && headline.toLowerCase() === joined.toLowerCase()) && !headline.toLowerCase().endsWith(` by ${joined.toLowerCase()}`)) headline += ` by ${joined}`;
  }
  const description = (item.description || '').replace(/\r\n/g, '\n');
  let excerpt = '', excerptSource = '', preferred = '', excerptSentences = 0;
  if (social.translatedExcerpt) {
    const translation = social.translatedExcerpt;
    if (!translation.verified || translation.language !== 'en' || !translation.sourceText || !description.includes(translation.sourceText)) errors.push('Translation must be editor-verified and reference the actual source description.');
    else { excerptSource = translation.text; preferred = translation.text; }
  } else if (social.language === 'en') {
    excerptSource = description; preferred = social.excerpt || '';
    if (preferred && !description.includes(preferred)) errors.push('Selected quotation is not verbatim source text.');
  } else if (description) errors.push('An English source or verified English translation is required; no automatic invented quotation.');
  const roles = new Map();
  if (people.length) roles.set('Artist(s)', people);
  if (item.curator) roles.set('Curator', [{ name: item.curator }]);
  if (item.photographer) roles.set('Photo', [{ name: item.photographer }]);
  for (const credit of social.credits || []) {
    if (!/^[\p{L} ()/&'-]+$/u.test(credit.role)) errors.push('Invalid documented credit role.');
    else roles.set(credit.role, credit.people);
  }
  for (const role of new Set(['Artist(s)', ...(item.type === 'exhibition' ? ['Photo'] : []), ...(social.requiredCredits || [])])) {
    if (!roles.get(role)?.length) errors.push(`Missing required credit: ${role}`);
  }
  if (item.type === 'exhibition' && !roles.has('Curator')) warnings.push('Curator is not documented; omitted.');
  const creditLines = [];
  for (const [role, participants] of roles) {
    if (!participants?.length) continue;
    try { creditLines.push(`${role}: ${participants.map(person => creditName(person, warnings)).join(', ')}`); }
    catch (error) { errors.push(error.message); }
  }
  const blocks = [headline.toUpperCase()];
  if (creditLines.length) blocks.push(creditLines.join('\n'));
  if (item.type === 'exhibition') {
    try {
      const gallery = social.gallery?.instagram?.verified ? creditName(social.gallery) : social.gallery?.name || item.gallery || item.venue;
      if (!gallery || !item.city || !item.country) throw new Error('Gallery, city and country are required for an exhibition.');
      if ([gallery, item.city, item.country].some(value => /[\r\n]/.test(value))) throw new Error('Gallery and location fields must each be single-line.');
      if (!social.gallery?.instagram?.verified) warnings.push('No verified gallery Instagram handle; using its documented name.');
      blocks.push(`${gallery}, ${item.city}, ${item.country}, ${dateRange(item.startDate, item.endDate)}`);
    } catch (error) { errors.push(error.message); }
  }
  const url = social.publicUrl || item.publicUrl;
  try { const parsed = new URL(url); if (parsed.origin !== SITE || !parsed.pathname.startsWith('/')) throw new Error(); }
  catch { errors.push('An actual HTTPS FindArt public URL is required.'); }
  if (excerptSource) {
    // Reserve the entire headline, every credit and location/date first. Quotes
    // add two characters plus one additional blank-line separator.
    const selected = selectExcerpt(excerptSource, { budget: 2200 - blocks.join('\n\n').length - 4, preferred, ...(social.translatedExcerpt ? { sourceLabel: 'Verified English translation' } : {}) });
    excerpt = selected.excerpt; excerptSentences = selected.count;
    warnings.push(...selected.warnings); errors.push(...selected.errors);
  }
  if (!excerpt && item.type === 'exhibition') errors.push('An actual exhibition excerpt is required.');
  if (excerpt) blocks.splice(1, 0, `“${excerpt}”`);
  const caption = blocks.join('\n\n');
  if (/\p{Extended_Pictographic}/u.test(caption)) errors.push('Caption contains an emoji; editorial review is required.');
  if (caption.length > 2200) errors.push(`Caption is ${caption.length} UTF-16 units; exceeds 2,200. Review required; credits were not cut.`);
  return { caption, excerpt, excerptSentences, warnings: [...new Set(warnings)], errors: [...new Set(errors)], publicUrl: url };
}

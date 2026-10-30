import { contentHeadline, nameHashtag, dateRange } from '../telegram/content.mjs';
import { selectExcerpt } from '../telegram/excerpts.mjs';
import { providedLinks } from './downloads.mjs';

export const DRAFT = 'EDITORIAL DRAFT — NOT APPROVED';
const labels = { exhibition: 'EXHIBITION', artist: 'ARTIST', contribute: 'EDITORIAL / ARTICLE', opportunity: 'OPPORTUNITIES', index: 'WEBSITE / INDEX', unknown: 'UNCLASSIFIED' };
const present = value => value || 'Not provided';
const line = value => String(value || '').replace(/[\r\n]+/g, ' ').trim();
function personCredit(person, warnings) {
  if (person.instagram) return person.instagram;
  try { return nameHashtag(person.name); } catch { warnings.push('DOCUMENTED_LATIN_SPELLING_REQUIRED'); return line(person.name); }
}
export function renderDraft(payload, analysis, materials = {}) {
  const { facts, type, editorial } = analysis;
  if (type === 'exhibition' && (facts.eventRelationship === 'independent' || (facts.presentations?.length > 1 && facts.eventRelationship !== 'chapters'))) throw new Error('SEPARATE_EXHIBITIONS_REQUIRE_EDITORIAL_REVIEW');
  const warnings = [...analysis.warnings, ...(materials.warnings || []).map(item => `${item.code}: ${item.source}`)];
  const names = facts.artists.map(person => person.name);
  let heading = line(facts.title || (type === 'artist' ? names.join(' and ') : type === 'index' ? facts.organization : ''));
  if (!heading) { heading = '[TITLE NOT PROVIDED]'; warnings.push('TITLE_NOT_PROVIDED'); }
  const headline = ['exhibition','artist'].includes(type) ? contentHeadline({ title: heading, type: type === 'exhibition' ? 'exhibition' : 'feature' }, names) : heading.toUpperCase();
  const credits = [];
  const addPeople = (role, people) => { if (people.length) credits.push(`${role}: ${people.map(person => personCredit(person, warnings)).join(', ')}`); };
  addPeople(type === 'artist' ? 'Artist' : 'Artist(s)', facts.artists);
  addPeople('Curator', facts.curators); addPeople('Photo', facts.photographers);
  for (const credit of facts.additionalCredits) addPeople(credit.role, credit.people);
  if (['opportunity','index'].includes(type) && facts.organization) credits.push(`Organization: ${line(facts.organization)}`);
  const location = [facts.city, facts.country].filter(Boolean).map(line).join(', ');
  const exhibitionDates = (start, end) => {
    if (!start || !end) return [start, end].filter(Boolean).map(line).join(' - ');
    try { return dateRange(start, end); }
    catch { warnings.push('EXHIBITION_DATES_REQUIRE_REVIEW'); return [start, end].map(line).join(' - '); }
  };
  if (type === 'exhibition') {
    if (facts.presentations?.length > 1) {
      const venue = [facts.gallery, facts.country].filter(Boolean).map(line).join(', ');
      if (venue) credits.push(venue);
      for (const presentation of facts.presentations) credits.push([presentation.title, presentation.city, exhibitionDates(presentation.startDate, presentation.endDate)].filter(Boolean).map(line).join(', '));
    } else {
      const venue = [facts.gallery, location, exhibitionDates(facts.startDate, facts.endDate)].filter(Boolean).join(', ');
      if (venue) credits.push(venue);
    }
    if (!names.length) warnings.push('ARTISTS_NOT_PROVIDED');
    if (!facts.photographers.length) warnings.push('PHOTO_CREDIT_NOT_PROVIDED');
  } else {
    if (location) credits.push(`Location: ${location}`);
    if (type === 'opportunity' && facts.opportunityType) credits.push(`Type: ${line(facts.opportunityType)}`);
    if (type === 'opportunity' && facts.deadline) credits.push(`Deadline: ${line(facts.deadline)}`);
    const publicUrl = type === 'opportunity' ? facts.applicationUrl : facts.website;
    if (/^https:\/\//.test(publicUrl)) {
      try {
        const parsed = new URL(publicUrl);
        const privateLink = parsed.username || parsed.password || /(?:drive\.google\.com|dropbox\.com|we\.tl|wetransfer\.com)$/.test(parsed.hostname) || [...parsed.searchParams.keys()].some(key => /token|key|sign|auth|pass|credential/i.test(key));
        if (!privateLink) credits.push(`${type === 'opportunity' ? 'Apply' : 'Website'}: ${line(publicUrl)}`);
        else warnings.push('PRIVATE_DOWNLOAD_LINK_OMITTED_FROM_PUBLIC_COPY');
      } catch { warnings.push('WEBSITE_URL_REQUIRES_REVIEW'); }
    }
  }
  const base = [headline, credits.join('\n')].filter(Boolean);
  let text = '';
  if (editorial.text) {
    const quoted = editorial.mode === 'verbatim';
    const selected = selectExcerpt(editorial.source, { preferred: editorial.preferred, budget: 2200 - base.join('\n\n').length - (quoted ? 4 : 2), sourceLabel: quoted ? 'Original curatorial prose' : 'AI draft summary', maximumSentences: 10 });
    warnings.push(...selected.warnings, ...selected.errors);
    if (selected.excerpt) text = quoted ? `“${selected.excerpt}”` : selected.excerpt;
  }
  const caption = [headline, text, credits.join('\n')].filter(Boolean).join('\n\n');
  if (caption.length > 2200 || /[A-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(caption)) throw new Error('PUBLIC_DRAFT_VALIDATION_FAILED');
  if (!text) warnings.push('INSUFFICIENT_VERIFIED_EDITORIAL_TEXT');
  const email = payload.fields?.Email || facts.contactEmail;
  const card = [DRAFT, `NEW SUBMISSION — ${labels[type] || labels.unknown}`, '',
    `Submitted by: ${present(line(payload.fields?.Name || facts.submittedBy))}`,
    `Email: ${present(line(email))}`,
    `Artist(s) / Organization: ${present(line(names.join(', ') || facts.organization))}`,
    `Project / Exhibition: ${present(line(facts.title))}`,
    `Website: ${present(line(facts.website || payload.fields?.['Website URL'] || payload.fields?.['Website (optional)']))}`,
    `Instagram: ${present(line(facts.instagram || payload.fields?.Instagram || facts.artists.map(person => person.instagram).filter(Boolean).join(', ')))}`,
    `Location: ${present(facts.presentations?.length > 1 ? facts.presentations.map(presentation => line(presentation.city)).filter(Boolean).join(' / ') : location || line(payload.fields?.Location))}`,
    `Dates: ${present(facts.presentations?.length > 1 ? facts.presentations.map(presentation => [presentation.title, presentation.city, exhibitionDates(presentation.startDate, presentation.endDate)].filter(Boolean).map(line).join(', ')).join('; ') : [facts.startDate, facts.endDate].filter(Boolean).map(line).join(' — ') || line(facts.deadline))}`,
    `Original submission: ${payload.source === 'gmail' ? 'Gmail message ' + payload.gmailMessageId : 'Website form ' + (payload.submissionId || '')}; original-submission.txt`,
    `Download links: ${providedLinks(payload).join('\n') || 'Not provided'}`,
    `Payment status: ${payload.type === 'contribute' ? 'Not required — free editorial form' : 'Not verified'}`,
    `Images obtained: ${(materials.images || []).length}`,
    '', ...[...new Set(warnings)].map(warning => `REVIEW: ${warning}`),
  ].join('\n');
  return { status: 'editorial-draft', type, caption, card, warnings: [...new Set(warnings)], sourceEmail: email || '', approved: false };
}

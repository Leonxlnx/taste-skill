const STOP = new Set('a an the and or of for to in on at by with from your you our we it its is are be this that these those as into over under all any every each one two new more most very just about after before than then there their them they who what when where how why which not no yes will can do does did so up out off own per via plus also only near far'.split(' '));
const norm = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[þÞ]/g, 'th').replace(/[ðÐ]/g, 'd').replace(/æ/gi, 'ae').replace(/ø/gi, 'o').replace(/ß/g, 'ss').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const terms = (s) => String(s || '').split(/[,;|]/).map(norm).filter(Boolean);
const words = (s) => norm(s).split(' ').filter((w) => w.length >= 3 && !STOP.has(w));
// plurals only: "read" is not "reader", and a headline that says "read" does not name the reader it sells
const stem = (w) => w.replace(/ies$/, 'y').replace(/([^s])s$/, '$1').slice(0, Math.max(4, Math.min(w.length, 7)));
// does the text hold the term (a word or a phrase; plurals and joined compounds count)
function holds(text, term) {
  const t = norm(text); if (!term || !t) return false;
  if ((' ' + t + ' ').includes(' ' + term)) return true;
  if (t.replace(/ /g, '').includes(term.replace(/ /g, '')) && term.replace(/ /g, '').length >= 6) return true;
  const tw = term.split(' '); if (tw.length > 1) return false;
  const s = stem(term); return s.length >= 4 && t.split(' ').some((w) => w.length >= 4 && stem(w) === s);
}
const holdsAny = (text, list) => list.find((x) => holds(text, x)) || null;
// words of one trade that name the same goods (a category in one of them counts in any)
const KIN = [['ceramics', 'ceramic', 'pottery', 'potter', 'stoneware', 'porcelain', 'tableware'], ['coffee', 'espresso', 'roastery', 'roaster', 'cafe'], ['guesthouse', 'guest house', 'inn', 'b&b', 'bed and breakfast', 'lodge'], ['bakery', 'bakehouse', 'bread', 'sourdough'], ['bicycle', 'bike', 'bikes', 'cycle']];
const SECTION_NOUNS = terms('fee,fees,building,buildings,terms,conditions,privacy,legal,pricing,prices,price,plans,plan,faq,questions,contact,menu,seasons,season,rooms,room,getting here,directions,visit,hours,opening times,location,address,map,about,team,customers,integrations,works with,how it works,reviews,testimonials,booking,book,order,specs,specifications,download,security,support,help,docs,blog,news,changelog,careers,jobs,press,shop,store,delivery,shipping,returns,warranty,gallery,photos,events,history,process,steps,services,products,product,apps,api,partners,compare,comparison,examples,templates,resources');
export function headingSubjects(brief, notes) {
  const facts = String(notes || '').split(/^\s*(?:#{1,6}\s*)?Asks:/mi)[0];
  const supplied = facts.split(/\r?\n/).filter(l => /^(?:What it is|Category|Products?|Place|Location|Address|District|True difference|Offer|Odd true details):/i.test(l)).map(l => l.slice(l.indexOf(':')+1));
  const common = /^(?:add|build|give|good|make|comes?|start|keep|every|small|large|offers?|shows?|from|onto|there|takes?|each|main|goal|some|simple|page|landing|site|website|their|teams?)$/;
  return [...new Set(words([brief,...supplied].join(' ')).filter(w => !common.test(w)))].join(',');
}
function copyTerms(P, {category = '', audience = '', place = '', products = '', primary = ''} = {}) {
  const t = { category: terms(category), audience: terms(audience), place: terms(place), products: terms(products), primary: primary.trim(), from: 'flags' };
  // a category given as a phrase ("coffee roastery and bar") also counts word by word, as the title's does
  for (const k of ['category', 'place', 'products']) for (const c of [...t[k]]) if (c.includes(' ')) for (const w of words(c)) if (!t[k].includes(w)) t[k].push(w);
  // a trade's own words for one thing: "Ceramics studio" names pottery and tableware (a headline need not repeat the flag's noun)
  for (const c of [...t.category]) for (const g of KIN) if (g.includes(c) || g.includes(stem(c))) for (const w of g) if (!t.category.includes(w)) t.category.push(w);
  if (!t.category.length) {
    // "Larkmoor: electric kettles for small offices", "Osk, a ceramics studio in Porto", "Brindle | Shoe repair shop in Leeds"
    const m = String(P.title).match(/^\s*([^:|–—,-]{1,40})\s*[:|–—,-]\s*(.+)$/);
    if (m && !/^\[/.test(m[2])) {
      const brand = norm(m[1]);
      let what = m[2], who = '';
      const f = what.match(/^(.*?)\s+for\s+(.+)$/i); if (f) { what = f[1]; who = f[2]; }
      const inP = what.match(/^(.*?)\s+(?:in|on|at|near)\s+(.+)$/i); if (inP) { what = inP[1]; t.place.push(...terms(inP[2]).flatMap((x) => [x, ...x.split(' ').filter((w) => w.length >= 4)])); }
      t.category = words(what).filter((w) => !brand.split(' ').includes(w)); // each content word of "what it is" names the category
      if (who) t.audience.push(...words(who));
      if (t.category.length) t.from = 'the page title';
      // the trade's own words count from the title too ("rye and sourdough" names bread)
      for (const c of [...t.category]) for (const g of KIN) if (g.includes(c) || g.includes(stem(c))) for (const w of g) if (!t.category.includes(w)) t.category.push(w);
    }
  }
  t.brand = norm(P.brand || String(P.title).split(/[:|–—,-]/)[0]);
  // names written with a capital inside a sentence (a town, a river, a product): the page's own proper nouns
  t.names = [];
  for (const src of [P.title, P.description, P.after, P.heroText]) for (const sent of String(src || '').split(/[.!?:;|–—]\s+/)) {
    for (const w of sent.trim().split(/\s+/).slice(1)) {
      const c = w.replace(/^[^\p{L}]+|[^\p{L}]+$/gu, '');
      if (c.length >= 4 && /^\p{Lu}/u.test(c) && !/^\p{Lu}+$/u.test(c)) { const k = norm(c); if (k && !STOP.has(k) && !t.names.includes(k)) t.names.push(k); }
    }
  }
  return t;
}

// Section headings need to stand alone; item headings already have their set for context.
export function itemContext(tag, classes, role, marked, parentClasses, repeated) {
  if (['li', 'table', 'details'].includes(tag) || ['listitem', 'table', 'row'].includes(role) || marked) return true;
  if (classes.some(c => /^(?:case(?:-study(?:-card)?|-card|-row|__item)?|faq(?:__|-)(?:item|question)|question-answer)$/.test(c))) return true;
  if (!['article', 'div', 'figure', 'section', 'a', 'dl'].includes(tag)) return false;
  const inCollection = parentClasses.some(c => /^(?:cards|cases|case-rows|case-studies|faq|faqs|item-row)$/.test(c));
  if (inCollection && (repeated || tag === 'article' || tag === 'figure')) return true;
  return repeated && (tag === 'article' || tag === 'figure' || classes.some(c => /(?:^|[-_])(?:card|tile|plan|case|item)(?:$|[-_])/.test(c)));
}

// Test whole labels, so "Features of the canal house" stays specific.
const stockLabels = new Set([
  'overview', 'features', 'our services', 'solutions', 'why choose us',
  'welcome', 'learn more', 'about us', 'our mission', 'what we offer',
  'our overview', 'feature', 'key features', 'our features', 'service', 'services', 'our service',
  'solution', 'our solution', 'our solutions', 'why work with us', 'welcome here',
  'welcome to our site', 'welcome to our website', 'find out more', 'read more', 'mission', 'what we do',
]);
const abstractWords = new Set(('built made designed ready delivered reimagined redefined feel feels feeling future tomorrow next today better best more less confidence clarity simplicity possibility possibilities potential empowered effortless excellence inspire inspired inspiration beyond unlimited limitless different difference together starts begins here ahead always peace mind').split(' '));
function slogan(label) {
  if (/^(?:you(?: ll| will)|we (?:make|help) you) (?:always )?feel (?:more |less )?(?:confident|empowered|inspired|overwhelmed|anxious)\b/.test(label)) return true;
  const meaningful = label.split(' ').filter(word => !STOP.has(word) && word !== 's');
  return meaningful.length > 0 && meaningful.every(word => abstractWords.has(word));
}
export function headingFindings(headings, T) {
  const seen = new Map(), bare = [], findings = [];
  const glossary = [...T.category, ...T.products, ...T.place, ...T.audience, ...T.names, ...SECTION_NOUNS, T.brand].filter(Boolean);
  for (const h of headings) {
    const words = h.full.normalize('NFC').toLowerCase().match(/[\p{L}\p{M}\p{N}]+/gu) || [];
    if (!words.length) continue;
    const label = words.join(' '), opening = words.slice(0, 3).join(' ');
    const previous = seen.get(opening);
    if (previous) {
      previous.count++;
      const subject = previous.label === label && !previous.mixed
        ? 'The heading "' + h.full.slice(0, 60) + '"'
        : 'The opening "' + opening + '"';
      previous.mixed ||= previous.label !== label;
      const times = previous.count === 2 ? 'twice' : previous.count + ' times';
      findings.push({ h, sev: 'FAIL', msg: subject + ' appears ' + times + ' against a limit of once per page, so give this heading a distinct opening.' });
    } else {
      seen.set(opening, { label, count: 1, mixed: false });
    }
    if (h.item) continue;
    if (stockLabels.has(words.join(' ').replace(/^the /, ''))) {
      findings.push({h, sev:'FAIL', msg:'The heading "' + h.full + '" uses one stock label where none are allowed, so replace it with the subject of this section.'});
      continue;
    }
    if (h.foot || ![2, 3].includes(h.level) || /\d/.test(h.full) || !norm(h.full)) continue;
    // Unknown trade vocabulary is common. Warn only on identifiable abstract claims.
    if (slogan(label) && !glossary.some(term => norm(term) === label)) bare.push(h);
  }
  if (bare.length) findings.push({h:bare[0], sev:'WARN', msg:'Name the subject in '+bare.map(h => '"'+h.full+'"').join(', ')+'.'});
  return findings;
}
export { STOP, norm, words, stem, holds, holdsAny, copyTerms };

export function closingActionMatches(primary, close) {
  const destination = c => norm(c.label) + ' ' + (c.needs || '') + ' ' + (c.href || '');
  const stores = close.some(apple => /app store|iphone|apps\.apple\.com/i.test(destination(apple)) &&
    close.some(google => google.href && google.href !== apple.href && /google play|android|play\.google\.com/i.test(destination(google))));
  const booking = close.some(c => {
    let url;
    try { url = new URL(c.href); } catch { return false; }
    const provider = url.hostname.split('.').filter(v => !['www','app','book','booking'].includes(v))[0] || '';
    return /(^|\.)(calendly\.com|cal\.com|opentable\.[a-z.]+|resy\.com)$/.test(url.hostname) ||
      (provider.length > 2 && norm(c.label).includes(provider) && /\b(book|reserve|schedule)\b/i.test(c.label + ' ' + c.needs + ' ' + url.pathname));
  });
  return close.some(c => norm(c.label) === norm(primary)) ||
    (stores && /\b(download|get|install)\b/i.test(primary)) || (booking && /\b(book|reserve|schedule)\b/i.test(primary));
}

// A negative instruction also rules out the optional character deal.
export function mascotRequest(brief) {
  if (/\b(?:no|without|avoid|omit|exclude|skip|do not use|don't use)\s+(?:an? |any |the )?(?:\w+[ -]){0,2}mascots?\b/i.test(brief)) return false;
  return /\bmascots?\b/i.test(brief) ? true : null;
}

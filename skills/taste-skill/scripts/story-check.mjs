// story-check.mjs: the reads behind the story checks (references/story.md). No browser, no packages: the checker
// (consistency.mjs, its story block) gives it what it read on the page, copy-lint reads the notes with readStory.
//
//   readStory(text)            the ## Story block of the copy notes: { shape, thread, turn, bookend, spine: [{ kind, head, join, beat }] }
//   findBeside(file, name)     .taste-skill/<name> beside the page, one or two folders up, or the .taste-skill folder it sits in
//   storyFindings(P, { plan, notes })  the WARNs spine-drift, label-run, thread-lost, close-unanswered, stripe-grounds and the
//                              chapter-nav check (FAIL for a link that misses its id, WARN for labels, counts)
//     P: { h1, lead, heroText, sections: [{ id, sel, h2, text, ground, chapter, chapterHead }], close: { h2, text } | null,
//          navs: [{ kind: 'chapter-nav' | 'contents-row', sel, links: [{ href, text, ok }] }] }
import fs from 'node:fs';
import path from 'node:path';

const tidy = (s) => String(s || '').replace(/[‘’ʼ′]/g, "'").replace(/[“”„″]/g, '"').replace(/[   ]/g, ' ');
const key = (s) => tidy(s).replace(/<[^>]+>/g, ' ').toLowerCase().replace(/[*_`"']/g, '').replace(/[^\p{L}\p{N}%€$£ ]+/gu, ' ').replace(/\s+/g, ' ').trim();
const STOP = new Set('the a an and or of to in on for with from by at as is are be it its this that your our you we they their them his her more most what when where how why which who all any one two three four five six into than then so but not no only also each every per out up over under about after before just new now own very can will has have'.split(' '));
const stem = (w) => w.length > 4 ? w.replace(/(ies)$/, 'y').replace(/(es|s)$/, '') : w;
export const contentWords = (s) => key(s).split(' ').filter((w) => w.length >= 4 && !STOP.has(w) && !/^\d/.test(w)).map(stem);
export const numbersOf = (s) => (tidy(s).match(/\d[\d.,:]*\d|\d/g) || []).map((n) => n.replace(/[.,]$/, ''));

export function readStory(t) {
  const lines = tidy(t).split(/\r?\n/);
  const s = lines.findIndex((l) => /^#{1,3}\s*(the\s+)?story\s*$/i.test(l.trim()));
  if (s < 0) return null;
  const e = lines.slice(s + 1).findIndex((l) => /^#{1,3}\s/.test(l.trim()));
  const body = lines.slice(s + 1, e < 0 ? undefined : s + 1 + e);
  const field = (k) => { const l = body.find((x) => new RegExp(`^[-*]?\\s*(\\*\\*)?${k}(\\*\\*)?\\s*:`, 'i').test(x.trim())); return l ? l.trim().replace(/^[-*]\s*/, '').replace(/\*\*/g, '').replace(/^[^:]+:\s*/, '').trim() : ''; };
  const sp = body.findIndex((l) => /^[-*]?\s*(\*\*)?spine(\*\*)?\s*:/i.test(l.trim()));
  const spine = [];
  if (sp >= 0) for (const l of body.slice(sp + 1)) {
    const m = l.trim().match(/^[-*]\s+(.*)$/); if (!m) continue;
    const parts = m[1].split('|').map((x) => x.trim());
    let head = parts[0], kind = 'h2';
    const lab = head.match(/^(h1|close)\s*:\s*(.*)$/i);
    if (lab) { kind = lab[1].toLowerCase(); head = lab[2].trim(); }
    if (/^\.{2,}$|^…$/.test(head)) continue;
    const join = ((parts.find((x) => /^joins?\b/i.test(x)) || '').match(/:\s*(.*)$/) || [])[1] || '';
    const beat = ((parts.find((x) => /^beat\b/i.test(x)) || '').match(/:\s*(.*)$/) || [])[1] || '';
    const section = parts.map(x => /^(?:section:\s*)?#([\w:.-]+)$/i.exec(x)).find(Boolean)?.[1] || '';
    spine.push({ section, kind, head: head.replace(/^["“]|["”]$/g, ''), join: join.trim(), beat: beat.trim() });
  }
  return { short: field('short'), shape: field('shape'), thread: field('thread'), turn: field('turn'), bookend: field('bookend'), spine };
}

export function findBeside(file, name) {
  if (!file) return null;
  const abs = path.resolve(file), tries = [];
  let d = path.dirname(abs);
  for (let i = 0; i < 3; i++) {
    if (path.basename(d) === '.taste-skill') tries.push(path.join(d, name));
    tries.push(path.join(d, '.taste-skill', name));
    const up = path.dirname(d); if (up === d) break; d = up;
  }
  return tries.find((p) => { try { return fs.statSync(p).isFile(); } catch { return false; } }) || null;
}

// a heading that is only a label: three words or fewer, no figure, no verb, no full stop or question mark ("Devlog",
// "Press kit", "The trailer")
const VERBISH = /^(is|are|was|be|has|have|do|does|get|gets|go|goes|make|makes|take|takes|see|show|shows|plan|plans|book|start|starts|try|find|send|sends|keep|keeps|run|runs|work|works|stay|stays|pay|pays|cost|costs|open|opens|meet|meets|come|comes|ship|ships|break|breaks|fix|fixes|read|reads|warn|warns|move|moves|bring|brings|turn|turns|fly|flies|sort|sorts|count|counts|save|saves|let|lets|ask|asks|answer|answers|stop|stops|wait|waits|grow|grows|sleep|sell|sells|buy|buys|order|orders|choose|pick|wake|leave|leaves|arrive|arrives|use|uses|need|needs|know|knows|say|says|tell|tells|change|changes|close|closes)$/;
export function isLabel(h) {
  const t = tidy(h).trim();
  if (!t || /[.?!:]$/.test(t) || /\d/.test(t)) return false;
  const ws = key(t).split(' ').filter(Boolean);
  if (ws.length > 3) return false;
  return !ws.some((w) => VERBISH.test(w) || /(ed|ing)$/.test(w) && w.length > 4);
}
const same = (a, b) => {
  const x = key(a), y = key(b);
  if (!x || !y) return false;
  if (x === y) return true;
  const A = contentWords(a), B = contentWords(b);
  if (!A.length || !B.length) return false;
  const shared = A.filter((w) => B.includes(w)).length;
  return shared / Math.max(A.length, B.length) >= 0.6;
};
// Prefer one complete identifier or name over incidental years and quantities.
function threadName(thread, hero) {
  const t = tidy(thread || hero);
  const ids = t.match(/\b(?:[A-Z]{2,}[-#]\d[\w-]*|(?:call|order|incident|record|return|booking)\s+#?\d+)\b/gi) || [];
  const names = t.match(/\b\p{Lu}[\p{Ll}]{2,}(?:[ -]\p{Lu}[\p{Ll}]+)*/gu) || [];
  const explicit = t.match(/"([^"]+)"/)?.[1] || ids[0];
  if (explicit) return explicit;
  const proper = names.find(n => !STOP.has(key(n)));
  if (thread && proper) return proper;
  const subject = t.split(/[,;]|\s+(?:with|from|on|in|through|at)\s+/i)[0].replace(/^(?:the|a|an)\s+/i,'').trim();
  if (thread && subject && subject.split(/\s+/).length <= 4) return subject;
  return [...names, ...t.split(/\s+/)].find(n => n.length > 2 && !STOP.has(key(n)) && (' '+key(hero)+' ').includes(' '+key(n)+' '));
}
function stateFacts(text, name) {
  const facts = new Set();
  const escaped = name.replace(/[.*+?^(){}|[\]\\$]/g,'\\$&');
  const matches = tidy(text).matchAll(new RegExp('(?<![\\p{L}\\p{N}])'+escaped+'(?![\\p{L}\\p{N}])','giu'));
  for (const m of matches) {
    const near = text.slice(Math.max(0,m.index-45),m.index)+' '+text.slice(m.index+m[0].length,m.index+m[0].length+100);
    // “to the demo” and “for the reader” are destinations of a link or copy, not states of the record.
    const factsInText = /\b(?:\d+(?::\d+|[.,]\d+)?(?:\s*(?:%|kg|hours?|days?|seats?))?|(?:pending|ready|approved|cleared|late|due|delayed|open|closed|blank|paid|sent|done|empty|full|caught|found|held|lost|booked|assigned|requested|refunded|packed|shipped|arrived|released|dispatched|moved|signed|billed|waiting|confirmed|completed|rejected|cancelled|delivered|docked|draft|queued|running|failed|resolved)|(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)|(?:at|from|to|near|in|beside)\s+(?:Gate|Pier|Quay|Port|Room|Bay|Berth)\s+[\w-]+)\b/gi;
    for (const hit of near.matchAll(/\b(?:slack|teams|email|pagerduty)\b/gi)) facts.add('channel '+hit[0].toLowerCase());
    for (const hit of near.matchAll(factsInText)) facts.add(hit[0].toLowerCase());
    for (const hit of near.matchAll(/\b(?:at|from|to|near|in|beside)\s+([A-Z][\p{L}-]+(?:\s+[A-Z][\p{L}-]+)*)/gu)) facts.add(hit[1].toLowerCase());
  }
  return facts;
}
const roles = [/player|wishlist|steam|play the game/i,/press kit|journalist|press assets/i,/buy|order|checkout|shopper/i,/operator|director|demo/i,/guest|book a (?:room|stay|table)/i];
const actions = [/wishlist/i,/demo/i,/\b(order|buy|checkout)\b/i,/\b(book|reserve)\b/i,/contact|enquir/i,/download|press kit/i,/sign up|start a trial/i,/play the game|watch the trailer/i];

export function storyFindings(P, { plan = null, notes = null } = {}) {
  const F = [];
  const push = (check, sev, x, msg, fix) => F.push({ check, sev, id: 0, sel: x && x.sel || '(the page)', text: x && (x.h2 || x.text) ? String(x.h2 || x.text).slice(0, 48) : '', msg, ...(fix ? { fix } : {}) });
  const secs = (P.sections || []).filter((s) => s.h2);
  const story = notes ? readStory(notes) : null;
  const shape = (plan && plan.story) || (story && (story.shape.match(/[a-z]+(?:-[a-z]+)*/) || [])[0]) || '';

  // spine-drift: the planned spine (the notes' Spine lines) against the page's h2s in order
  if (story && story.spine.length) {
    const planned = story.spine.filter((x) => x.kind === 'h2').map((x) => x.head);
    const page = secs.map((s) => s.h2);
    const at = planned.map((h) => page.findIndex((p) => same(h, p)));
    const missing = planned.filter((h, i) => at[i] < 0);
    const found = at.filter((i) => i >= 0);
    const swapped = found.some((v, i) => i && v < found[i - 1]);
    if (missing.length || swapped) push('spine-drift', 'WARN', secs[found[0] || 0], `${swapped ? 'the page takes the spine\'s headings in another order' : ''}${swapped && missing.length ? '; ' : ''}${missing.length ? `${missing.length} heading${missing.length > 1 ? 's' : ''} of the spine ha${missing.length > 1 ? 've' : 's'} no section: ${missing.slice(0, 3).map((h) => `"${h.slice(0, 40)}"`).join(', ')}` : ''} (the copy notes' ## Story)`, 'build the sections in the spine\'s order, or change the spine and say why: the order is the story');
  }
  // label-run: three neighbouring h2s that are bare labels
  for (let i = 0; i + 2 < secs.length; i++) {
    if ([0, 1, 2].every((k) => isLabel(secs[i + k].h2))) {
      push('label-run', 'WARN', secs[i], `three headings in a row are bare labels: ${[0, 1, 2].map((k) => `"${secs[i + k].h2}"`).join(', ')}: read alone they are a list`, 'give each heading what happens there (a verb, a time, a number, the thing it changes); the h2s alone should read in order');
      break;
    }
  }
  const heroText = [P.h1,P.lead,P.heroText].filter(Boolean).join(' ');
  if (story?.thread || plan?.story) {
    const hero = P.sections?.find(s => s.hero);
    const records = [{id:hero?.id || 'hero', text:heroText}, ...(P.sections || []).filter(s => !s.hero)];
    if (P.close && !records.some(s => s.sel === P.close.sel || s.text === P.close.text)) records.push({id:'close', ...P.close});
    const name = threadName(story?.thread, heroText);
    const seen = new Set(), visited = new Set(), repeats = [], changed = [];
    if (name) for (const s of records) {
      const id = s.id || s.sel;
      if (visited.has(id) || !(' '+key(s.text)+' ').includes(' '+key(name)+' ')) continue;
      visited.add(id);
      const facts = stateFacts(tidy(s.text), name);
      if (facts.size && (!changed.length || [...facts].some(f => !seen.has(f)))) changed.push(id);
      else repeats.push(id);
      for (const f of facts) seen.add(f);
    }
    if (changed.length < 3 || repeats.length) push('thread-lost','WARN',null,
      (name || story?.thread || 'The record')+' changes in '+changed.length+' distinct sections' + (repeats.length ? '; repeated without a new state in '+repeats.join(', ') : ''),
      'Show the same named record in three sections, each with a changed state, time, amount or place.');
  }
  if (P.close?.h2 && P.h1 && !P.close.mainAction && !(P.heroAction && key(P.close.action) === key(P.heroAction))) {
    const start = P.heroAction || P.h1+' '+(P.lead || '');
    const end = P.close.action || P.close.h2+' '+(P.close.lead || '');
    const opening = roles.filter(r => r.test(start+' '+P.h1+' '+(P.lead || '')));
    const verbs = actions.filter(r => r.test(start));
    const drift = verbs.length && !verbs.some(r => r.test(end)) || opening.length && !opening.some(r => r.test(end+' '+P.close.h2+' '+(P.close.lead || '')));
    const shared = contentWords(heroText).filter(w => contentWords(P.close.h2+' '+(P.close.lead || '')).includes(w));
    if (drift || (!verbs.length && new Set(shared).size < 2)) push('close-unanswered','WARN',P.close,
      'The close "'+P.close.h2+'" does not return to the opening audience and action "'+start+'".', 'Bring the opening visitor back to their next step.');
  }
  // stripe-grounds: on a chapters or two-part-promise page, grounds change at chapter or half boundaries only
  const navs = P.navs || [];
  const chaptered = ['chapters', 'two-part-promise'].includes(shape) || navs.some((n) => n.kind === 'chapter-nav');
  const body = (P.sections || []).filter((s) => !s.hero);
  if (chaptered && body.length >= 3) {
    const unit = (s) => s.chapter || null;
    const inside = [];
    for (let i = 1; i < body.length; i++) if (unit(body[i]) && unit(body[i]) === unit(body[i - 1]) && body[i].ground !== body[i - 1].ground) inside.push(body[i]);
    let run = 1, best = 1;
    for (let i = 1; i < body.length; i++) { const own = body[i].chapterHead && body[i - 1].chapterHead && body[i].chapterHead !== body[i - 1].chapterHead; run = body[i].ground !== body[i - 1].ground && !own ? run + 1 : 1; best = Math.max(best, run); }
    if (inside.length) push('stripe-grounds', 'WARN', inside[0], `the ground changes inside the chapter "${inside[0].chapter}"`, 'keep one ground for each chapter or half; change it where the next one begins');
    else if (best >= 4) push('stripe-grounds', 'WARN', body[0], `on a ${shape || 'chaptered'} page the ground changes at every section, ${best} sections in a row: stripes, not chapters`, 'give each chapter run or half one ground (the plan\'s chapters grounds) and change it only where a chapter or half begins');
  }
  // chapter-nav: every link lands on its id (FAIL); the labels are the chapter names, four to six chapters (WARN)
  const heads = (P.sections || []).map((s) => s.chapterHead).filter(Boolean);
  for (const n of navs) {
    const bad = n.links.filter((l) => !l.ok);
    if (bad.length) push('chapter-nav', 'FAIL', { sel: n.sel }, `${bad.length} link${bad.length > 1 ? 's' : ''} of the ${n.kind} miss${bad.length > 1 ? '' : 'es'} ${bad.length > 1 ? 'their ids' : 'its id'}: ${bad.slice(0, 3).map((l) => `"${l.text}" -> ${l.href}`).join(', ')}`, 'point every link at the id of its chapter\'s section');
    if (n.kind === 'chapter-nav' && (n.links.length > 6 || n.links.length < 4)) push('chapter-nav', 'WARN', { sel: n.sel }, `the chapter bar lists ${n.links.length} chapters: it is for four to six`, n.links.length < 4 ? 'with two or three chapters use a contents-row or chapter heads alone, no bar' : 'merge chapters: more than six is a second site nav');
    const strip = (s) => key(String(s).replace(/^\s*\d+\s*/, ''));
    if (heads.length) { const odd = n.links.filter((l) => !heads.some((h) => strip(h) === strip(l.text))); if (odd.length) push('chapter-nav', 'WARN', { sel: n.sel }, `${odd.length} label${odd.length > 1 ? 's' : ''} of the ${n.kind} name${odd.length > 1 ? '' : 's'} no chapter head: ${odd.slice(0, 3).map((l) => `"${l.text}"`).join(', ')}`, 'one name per chapter: the link and the chapter-head above its h2 say the same words'); }
  }
  return F;
}

// the in-page read (serialised: nothing from module scope)
export function storyProbe() {
  const txt = (el) => (el ? (el.innerText || el.textContent || '') : '').replace(/\s+/g, ' ').trim();
  const sel = (el) => { const p = []; for (let e = el; e && e.nodeType === 1 && e !== document.body && p.length < 3; e = e.parentElement) p.unshift(e.tagName.toLowerCase() + (e.id ? '#' + e.id : '')); return p.join(' > '); };
  const main = document.querySelector('main') || document.body;
  const hero = main.querySelector(':scope > .hero, :scope > section.hero, :scope > .section--hero, :scope > header.hero') || main.querySelector('section');
  const h1 = document.querySelector('h1');
  const lead = hero ? hero.querySelector('h1 ~ p, .hero__lead, .t-lead, p') : null;
  const bg = (el) => { const c = getComputedStyle(el).backgroundColor; return /rgba\(.*,\s*0\)$|transparent/.test(c) ? 'page' : c; };
  const ground = (el) => { const m = (el.className || '').toString().match(/\bground-(surface|inverse|brand)\b/); return m ? m[0] : bg(el); };
  const sections = [...main.querySelectorAll(':scope > section, :scope > .section')].map((s) => {
    const h2 = s.querySelector('h2');
    const ch = s.querySelector('.chapter-head');
    return { id: s.id || '', sel: sel(s), hero: s === hero, action: txt(s.querySelector('.btn--primary, [type="submit"], a.btn')), h2: h2 ? txt(h2) : '', text: txt(s).slice(0, 6000), ground: ground(s), chapter: s.getAttribute('data-chapter') || (ch ? txt(ch).replace(/^\d+\s*/, '') : ''), chapterHead: ch ? txt(ch) : '' };
  });
  const action = el => txt(el?.querySelector('.btn--primary,[type="submit"],a.btn'));
  const last = main.querySelector(':scope > section:last-of-type');
  const ch2 = last?.querySelector('h2');
  const close = ch2 ? { action: txt(last.querySelector('.btn--primary,[type="submit"],a.btn')), sel: sel(ch2), h2: txt(ch2), lead: txt(ch2.parentElement?.querySelector('p')), text: txt(last) } : null;
  if (close) {
    const heroButton = hero?.querySelector('a.btn--primary,a.btn');
    const closeRoot = ch2?.closest('.closing__cta,section') || main.querySelector(':scope > section:last-of-type');
    const target = heroButton?.hash && document.getElementById(heroButton.hash.slice(1));
    close.mainAction = !!(target && closeRoot?.contains(target) && (target.matches('form') || target.querySelector('form')));
  }
  const navs = [...document.querySelectorAll('[data-chapter-nav], .chapter-nav, .contents-row')].map((n) => ({
    kind: n.matches('.contents-row') ? 'contents-row' : 'chapter-nav', sel: sel(n),
    links: [...n.querySelectorAll('a[href]')].filter((a) => a.getAttribute('href').startsWith('#')).map((a) => { const h = a.getAttribute('href'); let id = ''; try { id = decodeURIComponent(h.slice(1)); } catch { id = h.slice(1); } return { href: h, text: txt(a), ok: !!id && !!document.getElementById(id) }; }),
  }));
  const uniq = navs.filter((n, i) => navs.findIndex((m) => m.sel === n.sel) === i);
  return { heroAction: action(hero), h1: txt(h1), lead: txt(lead), heroText: hero ? txt(hero).slice(0, 2000) : '', sections, close, navs: uniq };
}

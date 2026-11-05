/*
  pick.js - deals effects at random for one page. One ES module, no dependencies; the same code runs
  in `node scripts/effects.mjs pick` and in the browser (gallery.html).

    import { pick } from './assets/effects/pick.js';
    const index = await fetch('./assets/effects/index.json').then(r => r.json());
    const { picks } = pick(index.effects, { palette: 'dark', slots: ['hero', 'card', 'band'], history: ['caustics'] });
    // picks: [{ slot: 'hero', id: '...' }, ...]

  One effect per slot (hero = the hero or a large split frame, card = a card group, band = a wide band
  or the closing call to action, footer). Only effects made for the palette kind (meta.palettes) and
  for that slot are dealt (without a palette kind the ground is unknown, so only effects made for all
  three kinds are dealt); never the same id twice on one page, nor the last id of the history first;
  an id used in the last 20 picks of the history is less likely, and so is a second effect of a family
  already dealt. Two effects that list each other in meta.avoidWith never share a page (ids passed in
  exclude count as already on it, as in a second pick after the lead).
  Effects that follow the pointer (motion "interactive") are left out unless interactive is true.
  quiet: true leaves out the focal grounds (meta "focal": true, a ground with its own subject such as a
  sphere, a beam or peaks) and the pattern and dither families (rules, grids, contours, dots, halftone, ASCII:
  cards.md bans a pattern behind UI), for a slot that carries a big UI window, a screenshot or text.

  Chosen on purpose: an effect with meta "random": false (a literal subject such as the dotted globe,
  or a grade for the client's own photograph) is never dealt. A page that needs one names it in its
  slot, 'hero:dotted-globe' (or { slot: 'hero', id: 'dotted-globe' }); it is still refused on a
  palette kind or a slot it is not made for, and the page rules hold for it too: never the same id
  named twice, never two named effects that list each other in avoidWith, never one that clashes with
  an id passed in exclude (or is one).
*/

export const SLOTS = ['hero', 'card', 'band', 'footer'];
export const KINDS = ['light', 'dark', 'colour'];
/** the families a quiet slot (UI, a screenshot or text on top) never gets */
const QUIET_OUT = ['pattern', 'dither'];

const kindOf = k => (k === 'color' ? 'colour' : k);
/** true when the effect may be dealt at random (meta "random": false marks one chosen on purpose) */
export const dealable = e => e.random !== false;
/** true when the effect is made for this palette kind (meta.palettes); no kind fits every effect */
export const fitsKind = (e, kind) => !kind || (Array.isArray(e.palettes) && e.palettes.includes(kindOf(kind)));
/** true when a and b must not share a page (either lists the other in meta.avoidWith) */
export const clashes = (a, b) => !!(a && b) && ((a.avoidWith || []).includes(b.id) || (b.avoidWith || []).includes(a.id));

/** the effects that match the filters (on, palette, motion, family, cost, exclude, noInteractive, dealable, quiet) */
export function filterEffects(list, a = {}) {
  let out = list;
  if (a.dealable) out = out.filter(dealable);
  if (a.noInteractive) out = out.filter(e => e.motion !== 'interactive');
  if (a.quiet) out = out.filter(e => !e.focal && !QUIET_OUT.includes(e.family));
  if (a.on) out = out.filter(e => (e.bestOn || []).includes(a.on));
  if (a.palette) out = out.filter(e => fitsKind(e, a.palette));
  if (a.motion) out = out.filter(e => e.motion === a.motion);
  if (a.family) out = out.filter(e => e.family === a.family);
  if (a.cost) out = out.filter(e => e.cost === a.cost);
  if (a.exclude) { const ex = Array.isArray(a.exclude) ? a.exclude : String(a.exclude).split(','); out = out.filter(e => !ex.includes(e.id)); }
  return out;
}

function strHash(s) {
  let h = 2166136261 >>> 0;
  for (const ch of String(s)) { h ^= ch.codePointAt(0); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
/** seeded random 0..1 (mulberry32 over a string hash of the seed) */
export function random(seed) {
  let a = strHash(seed) || 1;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// 'hero' | 'hero:dotted-globe' | { slot, id } -> { slot, id | null }
function parseSlot(s) {
  if (s && typeof s === 'object') return { slot: s.slot, id: s.id || null };
  const [slot, id] = String(s).split(':').map(x => x.trim());
  return { slot, id: id || null };
}

/**
  effects: index.json's effects. opts: { palette, slots: [...] | count + on, seed, history: [ids, oldest
  first], interactive, quiet, exclude, motion, family, cost }. A slot may name its effect ('hero:dotted-globe').
  Returns { seed, slots, picks: [{ slot, id, named? }], notes }. Throws an Error with a plain message
  when nothing fits.
*/
export function pick(effects, opts = {}) {
  const palette = kindOf(opts.palette);
  if (palette && !KINDS.includes(palette)) throw new Error(`pick: unknown palette "${opts.palette}" (light, dark, colour)`);
  const parsed = opts.slots && opts.slots.length ? opts.slots.map(parseSlot) : null;
  const slots = parsed ? parsed.map(s => s.slot) : null;
  if (slots) for (const s of slots) if (!SLOTS.includes(s)) throw new Error(`pick: slot "${s}" (use ${SLOTS.join(', ')})`);
  const byId = new Map(effects.map(e => [e.id, e]));
  // effects named on purpose: they must exist and be made for this palette kind and slot
  const named = parsed ? parsed.map(({ slot, id }) => {
    if (!id) return null;
    const e = byId.get(id);
    if (!e) throw new Error(`pick: no effect "${id}"`);
    if (!fitsKind(e, palette)) throw new Error(`pick: "${id}" is made for ${e.palettes.join(', ')} pages, not ${palette}`);
    if (!(e.bestOn || []).includes(slot)) throw new Error(`pick: "${id}" is made for ${e.bestOn.join(', ')}, not ${slot}`);
    return e;
  }) : null;
  const exIds = (opts.exclude ? (Array.isArray(opts.exclude) ? opts.exclude : String(opts.exclude).split(',')) : []).map(id => String(id).trim()).filter(Boolean);
  if (named) {
    // the page rules hold for named effects too: once per page, no avoidWith pair, none excluded
    const given = named.filter(Boolean);
    given.forEach((e, i) => {
      if (given.findIndex(o => o.id === e.id) !== i) throw new Error(`pick: "${e.id}" is named twice; a page shows each effect once`);
      if (exIds.includes(e.id)) throw new Error(`pick: "${e.id}" is named and also excluded`);
      for (const o of given.slice(i + 1)) if (clashes(e, o)) throw new Error(`pick: "${e.id}" and "${o.id}" never share a page (avoidWith)`);
      for (const id of exIds) { const o = byId.get(id); if (clashes(e, o)) throw new Error(`pick: "${e.id}" never shares a page with "${id}", which is already on it (avoidWith)`); }
    });
  }
  const count = slots ? slots.length : Math.max(1, parseInt(opts.count ?? 1, 10) || 1);
  const base = { ...opts, palette, on: undefined, noInteractive: !opts.interactive, dealable: true };
  let pool = filterEffects(effects, slots ? base : { ...base, on: opts.on });
  // no palette kind: the ground is unknown, so only an effect made for every kind may be dealt
  if (!palette) pool = pool.filter(e => KINDS.every(k => fitsKind(e, k)));
  const allNamed = named && named.every(Boolean);
  if (!pool.length && !allNamed) throw new Error('pick: no effects match these filters');
  const fitsSlot = n => e => !slots || e.bestOn.includes(slots[n]);
  const seed = opts.seed != null && opts.seed !== '' ? String(opts.seed) : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const rand = random(seed);
  const history = (opts.history || []).map(p => (typeof p === 'string' ? p : p && p.id)).filter(Boolean);
  const recent = history.slice(-20);
  const fixed = named ? named.filter(Boolean) : [];
  // excluded ids are the ones an earlier pick already put on the page (or banned): their avoidWith holds too
  const earlier = exIds.map(id => byId.get(id)).filter(Boolean);
  const out = [];
  const notes = [];
  // the effects already on the page: dealt so far plus every named one
  const onPage = () => [...out.map(id => byId.get(id)), ...fixed.filter(e => !out.includes(e.id))];
  for (let n = 0; n < count; n++) {
    if (named && named[n]) { out.push(named[n].id); continue; }
    const prev = out.length ? out[out.length - 1] : history[history.length - 1];
    const slotPool = pool.filter(fitsSlot(n));
    if (!slotPool.length) throw new Error(`pick: no effect fits slot "${slots[n]}"${palette ? ` on a ${palette} page` : ''}`);
    const page = onPage();
    const ok = e => !page.some(p => clashes(p, e)) && !earlier.some(p => clashes(p, e));
    const taken = new Set(page.map(e => e.id));
    const fits = slotPool.filter(ok);
    if (!fits.length) throw new Error(`pick: every effect for slot "${slots ? slots[n] : opts.on || n + 1}" clashes with one already on the page (avoidWith)`);
    let cands = fits.filter(e => e.id !== prev && !taken.has(e.id));
    if (!cands.length) {
      // every effect for this slot is on the page already: one repeats with its own seed, and says so
      cands = fits.filter(e => e.id !== prev);
      if (cands.length) notes.push(`pick: every effect for slot ${n + 1} (${slots ? slots[n] : opts.on || 'any'}) is on the page already, so one repeats`);
    }
    if (!cands.length) { notes.push(`pick: only "${fits[0].id}" fits slot ${n + 1}, so it repeats`); cands = fits; }
    const weights = cands.map(e => {
      const uses = recent.filter(id => id === e.id).length;
      let wt = Math.pow(0.35, uses);
      const at = recent.lastIndexOf(e.id);
      if (at >= 0 && at >= recent.length - 5) wt *= 0.5;
      const famUses = page.filter(p => p.family === e.family).length;
      wt *= Math.pow(0.3, famUses);
      return wt;
    });
    const total = weights.reduce((s, x) => s + x, 0);
    let r = rand() * total, i = 0;
    while (i < weights.length - 1 && (r -= weights[i]) > 0) i++;
    out.push(cands[i].id);
  }
  return {
    seed, slots,
    picks: out.map((id, i) => ({ slot: slots ? slots[i] : opts.on || null, id, ...(named && named[i] ? { named: true } : {}) })),
    notes,
  };
}

export default { pick, filterEffects, random, dealable, fitsKind, clashes, SLOTS, KINDS };

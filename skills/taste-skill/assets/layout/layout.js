/*
  taste-skill layout.js - the small moments of the layout v4 heroes (references/layout-v4.md, section 3).
  Load it once, after system.js:  <script type="module" src="assets/layout/layout.js"></script>
  Every loop runs through ui.loop (it rests off screen, carries the kit's pause button and restarts
  when the pointer enters its box); on a phone (under 640px), on kind other and on a place, and under
  reduced motion each shows its finished picture and holds.

  - [data-ly-word='["offices","pianos"]'] on a span.ly-word in the h1 (hero--word): one live word.
    The first word is in the markup; it changes every 2 s for two rounds, rests on the first, and
    plays a round again when the pointer enters the headline. The slot is as wide as the widest word
    (CSS grid, one cell), so a change never moves another word or breaks a line differently.
  - h1[data-ly-letters] (hero--word, hero--editorial): letters near the pointer take a heavier weight
    (+200), and a wider width (+10%) with data-ly-letters="wdth" on a face with a wdth axis (type.json
    "letters"). Fine pointers only; the h1 keeps one aria-label.
  - Lines locked: an h1 with a live word or letters keeps the lines it has at rest (a break where each
    line ends, then no wrapping), measured again on resize; a wider letter never re-breaks a line.
  - .ly-collage with two to four .ly-collage__set (hero--triptych): the sets crossfade every 2.8 s;
    nothing moves inside a set.
  - [data-ly-steps] on a box (a chat, a list, a status): it shows the finished picture first, holds
    it 1.8 s (data-ly-hold), then its [data-step] children arrive one by one 0.7 s apart
    (data-ly-steps="900" sets the step time) and it holds again; the pointer entering restarts it.
  - .ly-pic in an h1 (hero--editorial): a photograph set in the headline as a pill, whole on the first
    frame (layout.css), so nothing here; letters() leaves it whole.
  - .ly-spot (hero--product): the disc opens its spec card on a tap or Enter; hover and focus open it
    in CSS. Escape or a tap elsewhere closes it.
  - .ly-play[data-film="film.mp4"] (hero--film): plays the film in its frame with controls. Without
    data-film a <button> control is hidden; an <a class="ly-play" href> goes to the film's page.
*/
import ui from '../ui/ui.js';

const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const phone = () => innerWidth < 640;
// kind other (a cafe, a shop, a studio) and a place: nothing moves by itself (MO-07); the first word,
// the first set and the finished steps show, still
const other = () => { const m = document.querySelector('meta[name="site-kind"]'); return document.documentElement.dataset.type === 'place' || (!!m && m.content.trim().toLowerCase() === 'other'); };

/* ---------------------------------------------------------------- the live word */
function liveWord(slot) {
  let words;
  try { words = JSON.parse(slot.dataset.lyWord); } catch { return; }
  const first = slot.textContent.trim();
  words = [first, ...words.filter(w => w !== first)];
  if (words.length < 2) return;
  const h1 = slot.closest('h1');
  if (h1 && !h1.hasAttribute('aria-label')) h1.setAttribute('aria-label', h1.textContent.replace(/\s+/g, ' ').trim());
  slot.textContent = '';
  const spans = words.map((w, i) => {
    const s = document.createElement('span');
    s.textContent = w;
    if (i) s.className = 'is-next';
    s.setAttribute('aria-hidden', 'true');
    slot.append(s);
    return s;
  });
  let at = 0;
  const show = i => {
    spans.forEach((s, k) => { s.style.transition = 'none'; s.className = k === i ? '' : 'is-next'; void s.offsetWidth; s.style.transition = ''; });
    at = i;
  };
  if (reduced() || phone() || other()) { show(0); return; }
  const ctl = ui.loop(slot, async api => {
    for (let n = 1; n <= words.length; n++) {
      await api.wait(2000);
      const next = n % words.length, cur = at;
      spans[cur].className = 'is-out';
      spans[next].className = '';
      at = next;
      await api.wait(620);
      spans[cur].style.transition = 'none'; spans[cur].className = 'is-next'; void spans[cur].offsetWidth; spans[cur].style.transition = '';
    }
  }, { still: () => show(0), rest: 900, cycles: 2, pause: false });
  if (h1) h1.addEventListener('pointerenter', e => { if (e.pointerType !== 'touch') ctl.restart(); });
}

/* ---------------------------------------------------------------- letters that answer the pointer */
function letters(h1) {
  if (reduced() || !matchMedia('(pointer: fine)').matches) return;
  const axis = h1.dataset.lyLetters === 'wdth';
  const cs = getComputedStyle(h1);
  const base = parseFloat(cs.fontWeight) || 400;
  const heavy = Math.min(900, base + 200);
  const baseW = parseFloat(cs.fontStretch) || 100;
  const label = h1.getAttribute('aria-label') || h1.textContent.replace(/\s+/g, ' ').trim();
  const walk = node => {
    for (const n of [...node.childNodes]) {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        for (const part of n.textContent.split(/(\s+)/)) {
          if (!part) continue;
          if (/^\s+$/.test(part)) { frag.append(document.createTextNode(' ')); continue; }
          const wd = document.createElement('span');
          wd.style.whiteSpace = 'nowrap';
          for (const ch of part) { const l = document.createElement('span'); l.className = 'ly-l'; l.textContent = ch; wd.append(l); }
          frag.append(wd);
        }
        n.replaceWith(frag);
      } else if (n.nodeType === 1 && !n.matches('.ly-word, .ly-mark, .ly-pic')) walk(n);
    }
  };
  walk(h1);
  h1.classList.add('ly-letters');
  h1.setAttribute('aria-label', label);
  [...h1.childNodes].forEach(c => { if (c.nodeType === 1) c.setAttribute('aria-hidden', 'true'); });
  const ls = [...h1.querySelectorAll('.ly-l')];
  let px = 0, py = 0, raf = 0, on = false, boxes = null;
  const measure = () => { boxes = ls.map(l => { const r = l.getBoundingClientRect(); return [r.left + r.width / 2 + scrollX, r.top + r.height / 2 + scrollY]; }); };
  const draw = () => {
    raf = 0;
    if (!boxes) measure();
    const reach = parseFloat(getComputedStyle(h1).fontSize) * 2.4;
    ls.forEach((l, i) => {
      const d = on ? Math.hypot(px + scrollX - boxes[i][0], py + scrollY - boxes[i][1]) : Infinity;
      const k = Math.max(0, 1 - d / reach), e = k * k * (3 - 2 * k);
      l.style.setProperty('--w', Math.round(base + (heavy - base) * e));
      if (axis) l.style.setProperty('--wd', (baseW + 10 * e).toFixed(1) + '%');
    });
  };
  addEventListener('resize', () => { boxes = null; });
  document.fonts?.ready.then(() => { boxes = null; });
  const host = h1.closest('.hero') || h1;
  host.addEventListener('pointermove', e => { if (e.pointerType === 'touch') return; on = true; px = e.clientX; py = e.clientY; if (!raf) raf = requestAnimationFrame(draw); });
  host.addEventListener('pointerleave', () => { on = false; boxes = null; if (!raf) raf = requestAnimationFrame(draw); });
}

/* ---------------------------------------------------------------- lines locked */
// The h1's words as units: a text word becomes a nowrap span (letters() already made them); the live
// word, the mark and a pill are units of their own. At rest it reads where each line starts, puts a
// <br class="ly-br"> there and stops wrapping (h1.ly-locked); on resize it unlocks, waits a frame and
// reads again. Nothing moves when it locks: the breaks are where the browser had them.
function lockLines(h1) {
  const units = () => {
    const out = [];
    const walk = node => {
      for (const n of [...node.childNodes]) {
        if (n.nodeType === 3) {
          if (!n.textContent.trim()) continue;
          const frag = document.createDocumentFragment();
          for (const part of n.textContent.split(/(\s+)/)) {
            if (!part) continue;
            if (/^\s+$/.test(part)) { frag.append(document.createTextNode(' ')); continue; }
            const w = document.createElement('span'); w.className = 'ly-u'; w.style.whiteSpace = 'nowrap'; w.textContent = part; frag.append(w);
          }
          n.replaceWith(frag);
        } else if (n.nodeType === 1) {
          if (n.matches('.ly-word, .ly-mark, .ly-pic, .ly-u, br')) { if (!n.matches('br')) out.push(n); continue; }
          if (n.style.whiteSpace === 'nowrap' && n.querySelector('.ly-l')) { out.push(n); continue; }   // a word of letters()
          walk(n);
        }
      }
    };
    walk(h1);
    return out.length ? out : [...h1.querySelectorAll('.ly-u, .ly-word, .ly-mark, .ly-pic')];
  };
  let list = units();
  const unlock = () => { h1.querySelectorAll('br.ly-br').forEach(b => b.remove()); h1.classList.remove('ly-locked'); };
  const lock = () => {
    unlock();
    list = list.filter(u => u.isConnected);
    let top = null;
    const fs = parseFloat(getComputedStyle(h1).fontSize) || 16;
    for (const u of list) {
      const t = u.getBoundingClientRect().top;
      if (top !== null && t - top > fs * 0.5) { const br = document.createElement('br'); br.className = 'ly-br'; u.before(br); }
      top = t;
    }
    h1.classList.add('ly-locked');
    // a lock that no longer fits (read before the web font or the phone width arrived) is let go
    if (h1.scrollWidth > h1.clientWidth + 1) unlock();
  };
  // read the lines at rest: after the fonts, and after the pills in the line have opened to their width
  const opened = () => Promise.all([...h1.querySelectorAll('.ly-pic, .ly-pic > img')].flatMap(p => (p.getAnimations ? p.getAnimations() : []).map(a => a.finished.catch(() => {}))));
  const ready = document.fonts ? document.fonts.ready : Promise.resolve();
  ready.then(opened).then(() => requestAnimationFrame(lock));
  // the h1 changing width (a resize, the phone width arriving after the first paint) reads the lines again,
  // after the fonts; a phone's bars sliding (height only) changes nothing
  let t = 0, lastW = h1.clientWidth;
  const again = () => {
    if (h1.clientWidth === lastW) return;
    lastW = h1.clientWidth;
    clearTimeout(t); unlock();
    t = setTimeout(() => ready.then(() => requestAnimationFrame(lock)), 150);
  };
  if (typeof ResizeObserver === 'function') new ResizeObserver(again).observe(h1); else addEventListener('resize', again);
}

/* ---------------------------------------------------------------- the collage */
function collage(box) {
  const sets = [...box.querySelectorAll(':scope > .ly-collage__set')];
  if (!sets.length) return;
  const show = i => sets.forEach((s, k) => { s.classList.toggle('is-on', k === i); s.toggleAttribute('inert', k !== i); s.setAttribute('aria-hidden', String(k !== i)); });
  show(0);
  if (sets.length < 2 || phone() || other()) return;
  box.setAttribute('data-ui-pause-host', '');
  ui.loop(box, async api => {
    for (let n = 1; n <= sets.length; n++) { await api.wait(2800); show(n % sets.length); await api.wait(700); }
  }, { still: () => show(0), rest: 600 });
}

/* ---------------------------------------------------------------- steps inside a piece of UI */
function steps(box) {
  // data-step-at="n" puts a step at that place in the order (0 is first); the rest keep document order
  const items = [...box.querySelectorAll('[data-step]')]
    .map((el, i) => ({ el, at: el.dataset.stepAt != null ? parseFloat(el.dataset.stepAt) : i }))
    .sort((a, b) => a.at - b.at).map(o => o.el);
  if (!items.length) return;
  // house rule: the loops inside cards a little faster, and repeating. The first picture is the
  // finished one (a shot or a first look never meets an empty card); then it plays and holds again.
  const every = parseInt(box.dataset.lySteps, 10) || 700;
  const hold = parseInt(box.dataset.lyHold, 10) || 1800;
  const set = n => items.forEach((s, k) => s.classList.toggle('is-off', k >= n));
  const done = () => set(items.length);
  done();
  if (reduced() || phone() || other()) return;
  ui.loop(box, async api => {
    await api.wait(hold);
    set(0);
    for (let n = 1; n <= items.length; n++) { await api.wait(n === 1 ? 380 : every); set(n); }
  }, { still: done, rest: 1200 });
}

/* ---------------------------------------------------------------- hotspots */
function spot(el) {
  const btn = el.querySelector(':scope > button');
  if (!btn) return;
  const card = el.querySelector('.ly-spot__card');
  const stage = el.closest('.hero__stage') || el.parentElement;
  // the card opens on the side with room: a disc right of the middle opens it to its left (desktop);
  // on a phone it opens under the disc, nudged (--dx) to stay 16px inside the stage
  const place = () => {
    if (!card) return;
    const x = parseFloat(getComputedStyle(el).getPropertyValue('--x')) || 0;
    if (!el.dataset.lySide) el.classList.toggle('ly-spot--left', x > 50);
    el.style.setProperty('--dx', '0px');
    if (!phone()) return;
    const s = stage.getBoundingClientRect(), d = el.getBoundingClientRect();
    const w = card.offsetWidth, mid = d.left + d.width / 2, m = 16;
    const left = mid - w / 2, right = mid + w / 2;
    const dx = left < s.left + m ? s.left + m - left : right > s.right - m ? s.right - m - right : 0;
    el.style.setProperty('--dx', Math.round(dx) + 'px');
  };
  if (el.classList.contains('ly-spot--left')) el.dataset.lySide = 'left';
  place();
  addEventListener('resize', place);
  const set = on => { if (on) place(); el.classList.toggle('is-open', on); btn.setAttribute('aria-expanded', String(on)); };
  set(false);
  el.addEventListener('pointerenter', place);
  el.addEventListener('focusin', place);
  btn.addEventListener('click', () => set(!el.classList.contains('is-open')));
  document.addEventListener('pointerdown', e => { if (!el.contains(e.target)) set(false); });
  el.addEventListener('keydown', e => { if (e.key === 'Escape') { set(false); btn.focus(); } });
}

/* ---------------------------------------------------------------- the film */
function film(btn) {
  const src = btn.dataset.film;
  if (!src) { if (btn.tagName === 'BUTTON') btn.hidden = true; return; }
  btn.addEventListener('click', () => {
    const media = btn.closest('.hero__media');
    const v = document.createElement('video');
    Object.assign(v, { src, controls: true, autoplay: true, playsInline: true });
    const poster = media.querySelector('img');
    if (poster) v.poster = poster.currentSrc || poster.src;
    media.querySelectorAll('img, .ly-play').forEach(n => n.remove());
    media.append(v);
    v.focus();
  });
}

function init() {
  document.querySelectorAll('[data-ly-word]').forEach(liveWord);
  document.querySelectorAll('h1[data-ly-letters]').forEach(letters);
  document.querySelectorAll('h1[data-ly-letters], h1:has(.ly-word)').forEach(lockLines);
  document.querySelectorAll('.ly-collage').forEach(collage);
  document.querySelectorAll('[data-ly-steps]').forEach(steps);
  document.querySelectorAll('.ly-spot').forEach(spot);
  document.querySelectorAll('.ly-play').forEach(film);
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
else init();

export default { init };

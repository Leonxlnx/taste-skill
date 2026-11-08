// assets/scenes/type-flip-relayout/classic.js - the 2.4 scene file, kept as it was; scene.js loads it through classic/classic.js.
// tasteskill / scenes / type-flip-relayout.js — a list in giant capitals, re-set three times by the scroll.
//
// A short list (what a studio makes, a programme, a set of benefits) is set in capitals as large as the
// measure allows, on a held, picture-free stage. First its ragged lines spread into a justified slab,
// each line catching up a beat after the one above, and the short last item slides across to flush
// right. Then the hierarchy swaps: the heading shrinks into small letters that relay one by one to the
// opposite corner, the slab folds, line by line, into a small index in the corner the heading left, and
// the heading swells to display size over a paragraph at statement size. The scene opens on a giant
// list under a small title and ends on a giant title over a small index. Type, one flat ground and one
// ink colour; for editorial, type-led and minimalist pages.
//
// Why a list: the house rule keeps every headline to two lines, and a sentence set this large over five
// lines reads as a five-line headline. A list item set large is its own line of content, so the giant
// type is a <ul> of four to six short items and the section's heading is the one-word title above it.
//
// DOM (the script splits the words and letters, keeps the clean text for screen readers in .rl-sr, and
// appends a hidden measuring copy, div.rl-ghost):
//
//   <section class="scene" data-scene="type-flip-relayout" data-options='{}' aria-labelledby="rl-title">
//     <div class="scene-stage">
//       <h2 class="rl-label" id="rl-title">Work</h2>          one word, 4-7 letters: the section's heading
//       <ul class="rl-block">                                 3-6 items (up to 12 work, smaller), one line each
//         <li class="rl-line">Books and zines</li>            every item but the last: 2-4 words, 11-16 characters
//         <li class="rl-line">Labels for beer</li>
//         …
//         <li class="rl-line">Posters</li>                    the last: 1-2 words, 9 characters at most
//       </ul>
//       <p class="rl-body">About 25 words, at most three lines at statement size.</p>
//     </div>
//   </section>
//
// Fitting: the type is sized to the copy, not to the viewport. The slab's measure, in em, is chosen so
// the tightest line justifies with `gap` em between its words (the spread is a visible move) while the
// loosest line stays under 4.5em (no holes) and the widest item takes at most `fill` of it; when the
// lines differ so much that both cannot hold, the tightest gap closes toward 0.6em first. The type then
// grows until that measure fills the columns, up to `size` vw and the height the stage leaves under
// the heading; when the height or the cap holds it smaller, the measure narrows to fit the copy (any
// fraction of a column) instead of opening the gaps (12 items, a short window, a landscape phone, a
// 2560px screen). A short list (three items) that would sit low under an empty stage is lifted toward
// the middle. The finished composition does not spread, so it is set denser: the widest item fills
// `fill` of the measure, with the same cap and narrowing and no height limit. Lines never wrap.
//
// Content: when no measure can keep every gap under 4.5em (one item far shorter than another), or an
// item other than the last is a single word (it cannot justify), the script warns once in the console,
// naming the worst item, from the layout the visitor actually sees. The fix is the copy, not the code.
//
// Options (data-options JSON). Default, then range:
//   hold       3       screens the stage is held on desktop (2-4)
//   phone      'rest'  under 768px: 'rest' shows the finished composition (heading, justified slab,
//                      paragraph) as an ordinary section; 'same' holds a poster version: heading and
//                      paragraph at the top, the list in the bottom band, which spreads and slides (no
//                      relay, no fold) and ends on the justified slab
//   phoneHold  1.5     screens held under 768px when phone is 'same' (1-3)
//   scrub      auto    true when Lenis smooths the page, else 0.8 (seconds of catch-up); set to override
//   size       12      largest display size, in vw (6-16)
//   gap        1.2     the tightest justified gap, in em, the live type is sized for (0.6-3): smaller sets
//                      bigger type and a subtler spread
//   fill       0.94    share of the measure the widest ragged item may take (0.8-0.98); the finished
//                      composition is set to exactly this
//   cols       12      most columns of the 12-column grid the list may span from the left, desktop (4-12)
//   index      'auto'  index type size in px (14-32); 'auto' follows the width: 24px at 1440, 20-40px
//                      (the heading, 52px at 1440, and the paragraph, 36px at 1440 and never wider than
//                      22em, follow the width too, so a 1920 or 2560 screen keeps the 1440 composition)
//   relay      true    the heading's relay to the far corner; false keeps it still at the top left and
//                      lands the index under it (a quieter scene, no swell)
//   grow       true    after the relay, the heading swells to the width of the paragraph's columns
//   dot        0.3     scale of a letter while it travels (0.12-0.4)
//   stagger    0.016   delay between letters in the relay, as a share of the scene (0.010-0.025); a
//                      long heading staggers tighter, so the whole relay spreads over 0.064 at most
//
// Progress map (desktop, 1440x900, the demo's five items fitted to 125px, a 52px heading):
//   0      ragged list flush left in the bottom band (y 279-852), heading at the top left, paragraph hidden
//   0.05   line i spreads to the full measure from 0.05 + 0.04i over 0.18 (its first word never moves);
//          gaps open from 0.26em to 1.2-2.8em
//   0.30   the last item slides from flush left to flush right, 0.30-0.44
//   0.44   rest: a justified slab from 40 to 1400, last item flush right
//   0.52   the heading's letters shrink to 0.3 (16px), last letter first; they cross the top band and
//          regrow at the top right by 0.70
//   0.58   line i folds into index row i from 0.58 + 0.032i over 0.12: it rises, shrinks to the index
//          size and its words close up; each line trails the one above it, so lines never cross. The
//          fold waits (to 0.64 at most) until the heading's first letter is past the place where row 0
//          lands, so a long heading's last dot never sits on the first index row
//   0.75   the folding lines have cleared the top right: the heading swells from its corner to the
//          paragraph's width (52px to about 255px), to 0.86
//   0.77   the paragraph rises 24px and fades in at the bottom right, to 0.85
//   0.86   rest: index top left, giant heading top right, paragraph bottom right
// Phone ('same', 390x844, hold 1.5): heading and paragraph at the top, the list in the bottom band;
// spread 0.06 + 0.05i over 0.24, last item 0.42-0.66, rest on the justified slab to 1. Under 340px
// wide, or when the type would fit only under 30px, the phone shows the finished composition.
// Portrait over 767px (narrower than 10:11, a tablet held upright) also shows the finished composition,
// since the held stage would be more than half empty; turning the window rebuilds the scene.
// Eases: the spec's curves are quadratic where it says power2 and cubic where it says power3, which are
// GSAP's power1 and power2; the timeline uses those, so its frames match the studied progress map.
// Rendering: what moves is held on its own layer only while it moves (will-change: transform from the
// start of its tween to its end), so the compositor moves and scales one raster instead of the page
// repainting it every frame; at every rest the hold is dropped and the transform is 2D, so the index
// lands on whole pixels and re-rasterises sharp. The swelling heading is set at its final size and shown
// scaled down until it grows, so its large letters are never a stretched small raster. No 3D transform
// is ever written.
(() => {
  const ID = 'type-flip-relayout';
  const GAP = 0.26; // the base word gap in em, as in the CSS
  const HOLE = 4.4; // the loosest justified gap, in em: over 4.5em a gap reads as a hole (a little margin)
  const TIGHT = 0.6; // the tightest the live slab may justify when its lines differ a lot in length
  const WIDE = '(min-aspect-ratio: 10/11)'; // matches unless the window is clearly portrait
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const num = (v, d, a, b) => (typeof v === 'number' && isFinite(v) ? clamp(v, a, b) : d);
  const node = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; };
  const rects = (els) => els.map((e) => e.getBoundingClientRect());

  const settings = (o = {}) => ({
    hold: num(o.hold, 3, 2, 4),
    phoneHold: num(o.phoneHold, 1.5, 1, 3),
    phone: o.phone === 'same' ? 'same' : 'rest',
    scrub: typeof o.scrub === 'boolean' || typeof o.scrub === 'number' ? o.scrub : null,
    size: num(o.size, 12, 6, 16),
    gap: num(o.gap, 1.2, 0.6, 3),
    fill: num(o.fill, 0.94, 0.8, 0.98),
    cols: Math.round(num(o.cols, 12, 4, 12)),
    index: typeof o.index === 'number' ? num(o.index, 24, 14, 32) : null,
    relay: o.relay !== false,
    grow: o.grow !== false,
    dot: num(o.dot, 0.3, 0.12, 0.4),
    stagger: num(o.stagger, 0.016, 0.01, 0.025),
  });

  // Timings as fractions of the scene. Spreads and folds are staggered by whole lines only; with many
  // lines the stagger shrinks so the chain still ends where the plan says.
  const PLAN = {
    desk: { spreadAt: 0.05, spreadStep: 0.04, spreadSpan: 0.16, spreadDur: 0.18, lastAt: 0.30, lastDur: 0.14, relayAt: 0.52, foldAt: 0.58, foldStep: 0.032, foldSpan: 0.13, foldDur: 0.12, growLead: 0.35, growDur: 0.11, bodyLead: 0.5, bodyDur: 0.08 },
    phone: { spreadAt: 0.06, spreadStep: 0.05, spreadSpan: 0.2, spreadDur: 0.24, lastAt: 0.42, lastDur: 0.24 },
  };

  const make = (root, opts = {}) => {
    const o = settings(opts);
    const stage = root.querySelector(':scope > .scene-stage') || root.firstElementChild;
    const block = stage && stage.querySelector('.rl-block');
    if (!stage || !block) return null;
    const label = stage.querySelector('.rl-label');
    const body = stage.querySelector('.rl-body');

    if (!o.relay) root.dataset.relay = 'off';
    root.style.setProperty('--rl-cols-desk', o.cols);
    if (o.index) root.style.setProperty('--rl-index-set', o.index + 'px');

    // --- split: letters of the heading, words of every item; the clean text stays for screen readers
    let chars = [];
    if (label) {
      let row = label.querySelector('.rl-label-row');
      if (!row) {
        const text = label.textContent.trim().replace(/\s+/g, ' ');
        label.textContent = '';
        row = node('span', 'rl-label-row');
        row.setAttribute('aria-hidden', 'true');
        for (const ch of [...text]) row.append(node('span', 'rl-ch', ch === ' ' ? '\u00a0' : ch));
        label.append(node('span', 'rl-sr', text), row);
      }
      chars = [...row.querySelectorAll('.rl-ch')];
    }
    const lines = [...block.children].filter((n) => n.matches('li, .rl-line'));
    for (const [i, line] of lines.entries()) {
      line.classList.add('rl-line');
      // earlier lines paint on top, so the text box of a line never lies over the capitals above it
      line.style.zIndex = String(lines.length - i);
      if (line.querySelector('.rl-words')) continue;
      const text = line.textContent.trim().replace(/\s+/g, ' ');
      line.textContent = '';
      const row = node('span', 'rl-words');
      row.setAttribute('aria-hidden', 'true');
      for (const w of text.split(' ').filter(Boolean)) row.append(node('span', 'rl-word', w));
      line.append(node('span', 'rl-sr', text), row);
    }
    const items = lines
      .map((el) => ({ el, name: (el.querySelector('.rl-sr') || el).textContent.trim(), words: [...el.querySelectorAll('.rl-word')] }))
      .filter((it) => it.words.length);
    if (!items.length) return null;
    const lineWords = items.map((it) => it.words);
    const words = lineWords.flat();

    // --- the hidden measuring copy: the list and the heading's letters, without ids or hidden text
    const ghost = node('div', 'rl-ghost');
    ghost.setAttribute('aria-hidden', 'true');
    const gBlock = node('div', block.className);
    for (const it of items) {
      const gl = node('div', it.el.className);
      gl.append(it.el.querySelector('.rl-words').cloneNode(true));
      gBlock.append(gl);
    }
    const gLabel = label ? node('p', 'rl-label') : null;
    if (gLabel) { const row = label.querySelector('.rl-label-row'); if (row) gLabel.append(row.cloneNode(true)); }
    ghost.append(...[gLabel, gBlock].filter(Boolean));
    stage.append(ghost);
    const gLineWords = [...gBlock.children].map((l) => [...l.querySelectorAll('.rl-word')]);
    const gWords = gLineWords.flat();
    const gChars = gLabel ? [...gLabel.querySelectorAll('.rl-ch')] : [];
    const labelRow = label ? label.querySelector('.rl-label-row') : null;

    const S = { phone: false, fs: 0, sI: 0.17, dxL: 0, sL: 1, xL: 0, k: 1, at: new Map(), guard: null, place: null, note: '', warned: false };
    const isLive = () => root.classList.contains('is-live');
    const setClass = (el, cls) => { el.classList.remove('is-justified', 'is-index', 'is-right'); if (cls) el.classList.add(cls); };
    const px = (el, prop) => parseFloat(getComputedStyle(el)[prop]) || 0;
    const cssNum = (name, d) => { const v = parseFloat(getComputedStyle(root).getPropertyValue(name)); return isFinite(v) ? v : d; };

    // Size the type to the copy. Word widths do not depend on the justification and the line pitch is
    // 0.9em, so everything is read once, in em, and scaled. The measure M (em) is the smallest that lets
    // the tightest justifying line open `gapEm` between its words and keeps the widest item within
    // `fill` of it; it may not pass the largest that keeps the loosest line's gaps under HOLE. When the
    // two cross (uneven lines), the tightest gap gives way first, down to TIGHT. The type then fills the
    // columns with M, up to `size` vw and the free height; when one of those holds it smaller, the
    // measure narrows to M at that size (in fractions of a column) rather than opening the gaps.
    const fitType = (blk, lws, availH, gapEm) => {
      root.style.removeProperty('--rl-fs');
      root.style.removeProperty('--rl-fit-cols');
      const fs0 = px(blk, 'fontSize');
      const W = blk.clientWidth;
      if (!fs0 || !W) return 0;
      const wordsEm = (fs) => lws.map((ws) => ({ n: ws.length, w: ws.reduce((a, w) => a + w.getBoundingClientRect().width, 0) / fs }));
      const widestEm = (ls) => Math.max(...ls.map((l) => l.w + GAP * (l.n - 1)));
      const ls = wordsEm(fs0);
      const just = ls.slice(0, -1).filter((l) => l.n > 1);
      const base = widestEm(ls) / o.fill;
      const at = (g) => Math.max(base, ...just.map((l) => l.w + g * (l.n - 1)));
      const most = just.length ? Math.min(...just.map((l) => l.w + HOLE * (l.n - 1))) : Infinity;
      let M = at(gapEm);
      if (M > most) M = Math.max(at(Math.min(gapEm, TIGHT)), most);
      const vw = document.documentElement.clientWidth || window.innerWidth;
      const fsFit = W / M;
      const fsCap = (o.size * vw) / 100;
      const fsH = availH / (0.9 * lws.length + 0.1);
      let fs = Math.max(12, Math.floor(Math.min(fsFit, fsCap, fsH) * 100) / 100);
      root.style.setProperty('--rl-fs', fs + 'px');
      if (fs < fsFit * 0.995) {
        const cols = cssNum('--rl-cols', 12);
        const g = cssNum('--g', 24);
        const unit = (W + g) / cols;
        const n = clamp((M * fs + g) / unit, Math.min(4, cols), cols);
        if (n < cols - 0.001) root.style.setProperty('--rl-fit-cols', n.toFixed(3));
      }
      // type does not scale exactly linearly: check the widest item against the measure it now has
      const W2 = blk.clientWidth;
      const w2 = widestEm(wordsEm(fs)) * fs;
      if (w2 > o.fill * W2 + 1) {
        fs = Math.floor(((fs * o.fill * W2) / w2) * 100) / 100;
        root.style.setProperty('--rl-fs', fs + 'px');
      }
      return fs;
    };

    // Gaps over 4.5em read as holes, and a one-word item cannot justify. The fit avoids both when the
    // copy allows; when it does not, say so once, naming the worst item, from the layout that shows:
    // the note is kept until the fonts are in and the live scene has measured, then printed.
    const checkCopy = (rectLines, fs) => {
      if (!fs) return;
      const single = [];
      let worst = null;
      for (let li = 0; li < rectLines.length - 1; li++) {
        const rs = rectLines[li];
        if (rs.length < 2) { single.push(`"${items[li].name}"`); continue; }
        let gap = 0;
        for (let q = 1; q < rs.length; q++) gap = Math.max(gap, rs[q].left - rs[q - 1].right);
        if (!worst || gap / fs > worst.gap) worst = { li, gap: gap / fs };
      }
      const says = [];
      if (single.length) says.push(`${single.join(', ')} ${single.length > 1 ? 'are single words' : 'is a single word'}, so ${single.length > 1 ? 'they cannot justify and stay' : 'it cannot justify and stays'} flush left; give ${single.length > 1 ? 'each' : 'it'} a second word.`);
      if (worst && worst.gap > 4.5) says.push(`"${items[worst.li].name}" justifies with gaps of ${worst.gap.toFixed(1)}em, which read as holes; it is much shorter than the longest item, so give it another word or shorten the longest item.`);
      S.note = says.join(' ');
    };
    const flushNote = () => { if (S.note && !S.warned) { S.warned = true; console.warn(`${ID}: ${S.note}`); } };
    (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => setTimeout(flushNote, 1500));

    // Finished composition: nothing spreads, so the slab is set as dense as it goes (the widest item
    // fills `fill` of the measure), with the same cap and narrowing and no height limit.
    const fitStatic = () => {
      if (isLive()) return;
      S.place = null;
      root.style.removeProperty('--rl-lift');
      for (const e of [...words, ...chars, body, labelRow]) if (e) e.style.willChange = '';
      if (label && labelRow) { label.style.transform = ''; label.style.transformOrigin = ''; labelRow.style.fontSize = ''; }
      S.k = 1;
      const fs = fitType(block, lineWords, Infinity, GAP);
      if (fs) checkCopy(lineWords.map(rects), fs);
    };

    // Live: fit on the ghost, then read every word in the three settings and every heading letter in
    // both corners. Runs after fonts are in and on every refresh.
    const measureOn = () => {
      setClass(gBlock, null);
      if (gLabel) setClass(gLabel, null);
      root.style.removeProperty('--rl-lift');
      let availH;
      if (S.phone) {
        // the heading, the list and the paragraph share the stage
        const cs = getComputedStyle(stage);
        availH = stage.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom)
          - (label ? label.offsetHeight : 0)
          - (body ? body.offsetHeight + px(body, 'marginTop') : 0) - 28;
      } else {
        // the list keeps a band of 48px under the heading; its bottom edge does not move with the size
        const lb = gLabel ? gLabel.getBoundingClientRect() : null;
        availH = gBlock.getBoundingClientRect().bottom - (lb ? lb.bottom + 48 : stage.getBoundingClientRect().top + 24);
      }
      fitType(gBlock, gLineWords, availH, o.gap);
      S.fs = px(gBlock, 'fontSize');
      if (!S.fs) return;
      // a short list (three items) would sit low under an empty stage: lift it toward the middle of the
      // band it owns, fully when it fills under 42% of the band, not at all from 62%
      if (!S.phone) {
        const h = gBlock.getBoundingClientRect().height;
        const lift = Math.round((clamp((0.62 - h / availH) / 0.2, 0, 1) * Math.max(0, availH - h)) / 2);
        if (lift > 0) root.style.setProperty('--rl-lift', lift + 'px');
      }

      const s0 = stage.getBoundingClientRect();
      const R = rects(gWords);
      setClass(gBlock, 'is-justified');
      const J = rects(gWords);
      let I = null;
      if (!S.phone) { setClass(gBlock, 'is-index'); I = rects(gWords); S.sI = px(gBlock, 'fontSize') / S.fs; }
      setClass(gBlock, null);
      words.forEach((w, n) => {
        const r = R[n], j = J[n], i = I ? I[n] : r;
        if (!r) return;
        S.at.set(w, {
          dxJ: j.left - r.left,
          // the index lands on whole pixels so the small type re-rasterises sharp
          dxI: Math.round(i.left - s0.left) - (r.left - s0.left),
          dyI: Math.round(i.top - s0.top) - (r.top - s0.top),
        });
      });
      if (gLabel && gChars.length) {
        const a = gChars[0].getBoundingClientRect().left;
        setClass(gLabel, 'is-right');
        const b = gChars[0].getBoundingClientRect().left;
        setClass(gLabel, null);
        S.dxL = Math.round(b - a);
      }
      // what the fold's timing needs: where row 0 starts and lands, and where the heading's first
      // letter (the last to leave the corner) starts
      S.guard = null;
      if (!S.phone && gLabel && gChars.length && lineWords[0].length) {
        const row = lineWords[0];
        S.guard = {
          top: R[0].top - s0.top,
          band: gLabel.getBoundingClientRect().bottom - s0.top + 8,
          dy: S.at.get(row[0]).dyI,
          charLeft: gChars[0].getBoundingClientRect().left - s0.left,
          words: row.map((w, k) => ({ left: R[k].left - s0.left, width: R[k].width, ...S.at.get(w) })),
        };
      }
      // the heading's swell at the top right: as wide as the paragraph, and clear of it by 48px. It
      // scales about the row's top-left corner and shifts back left by what the scale adds, so its top
      // and right edges stay where the relay put them. Read on the ghost's row (the heading's own size)
      // and layout boxes (offset*), which transforms never change.
      S.sL = 1; S.xL = 0;
      const gRow = gLabel && gLabel.querySelector('.rl-label-row');
      if (!S.phone && o.relay && o.grow && labelRow && gRow && gRow.offsetWidth) {
        const w = gRow.offsetWidth, h = gRow.offsetHeight;
        const right = stage.clientWidth - cssNum('--m', 40);
        const top = label.offsetTop;
        const tw = body ? right - body.offsetLeft : stage.clientWidth * 0.5;
        const th = (body ? body.offsetTop - 48 : stage.clientHeight * 0.45) - top;
        S.sL = Math.max(1, Math.min(tw / w, th / h));
        S.xL = Math.round((1 - S.sL) * (S.dxL + w));
      }
      // The swell is set at its final size and shown smaller until it grows: the row's letters are
      // S.sL times the heading's size and the heading is scaled down by as much (2D, so painted sharp at
      // its own size). Held on a layer while it grows, the row is rastered once at its final size and
      // only ever shown at or under it, so its large letters are never a stretched small raster and
      // are not repainted every frame. Every x inside the heading is in the row's units (S.k per px).
      S.k = S.sL;
      if (label && labelRow) {
        label.style.transformOrigin = S.k > 1 ? '0 0' : '';
        label.style.transform = S.k > 1 ? `scale(${1 / S.k})` : '';
        labelRow.style.fontSize = S.k > 1 ? `${S.k}em` : '';
      }
      let n = 0;
      checkCopy(gLineWords.map((ws) => { const rs = J.slice(n, n + ws.length); n += ws.length; return rs; }), S.fs);
    };
    // the ghost is laid out only for the measuring (display: none the rest of the time)
    const measure = () => {
      if (!isLive()) return;
      ghost.classList.add('is-on');
      try { measureOn(); } finally { ghost.classList.remove('is-on'); }
    };

    const toStatic = () => {
      root.classList.remove('is-live');
      root.classList.add('is-rest');
      root.style.removeProperty('--hold');
      fitStatic();
    };

    const val = (key) => (i, el) => { const m = S.at.get(el); return m ? m[key] : 0; };
    // Rendering. What moves is held on its own layer (will-change: transform) only while it moves: the
    // layer is rastered once and the compositor moves and scales it, where a painted or a 3D-transformed
    // word would be repainted or re-rastered at each new subpixel offset and scale, every frame. At both
    // ends of its tween the hold is dropped and the transform is 2D, so every rest is painted sharp (the
    // index on whole pixels). No 3D transform is ever written.
    const hold = (els) => {
      const list = [].concat(els).filter(Boolean);
      const set = (v) => { if (list.length && list[0].style.willChange !== v) list.forEach((e) => { e.style.willChange = v; }); };
      return {
        onUpdate() { const p = this.progress(); set(p > 0 && p < 1 ? 'transform' : ''); },
        onComplete() { set(''); },
        onReverseComplete() { set(''); },
      };
    };
    const T = (els, vars) => Object.assign({ immediateRender: false, force3D: false }, hold(els), vars);
    // the inverse of power2.inOut (a cubic in-out): at what share of its time a tween reaches share f
    const inv = (f) => (f <= 0 ? 0 : f >= 1 ? 1 : f < 0.5 ? Math.cbrt(f / 4) : 1 - Math.cbrt(2 * (1 - f)) / 2);

    // A portrait window over 767px (a tablet held upright, a narrow desktop window) leaves the held
    // stage more than half empty, since the type is held by the width; it gets the finished composition.
    const upright = () => !!window.matchMedia && !window.matchMedia(WIDE).matches;

    const build = (tl, c) => {
      S.phone = !!c.phone;
      S.place = null;
      measure();
      if (S.phone ? (stage.clientWidth < 340 || S.fs < 30) : upright()) { toStatic(); return; }
      const P = S.phone ? PLAN.phone : PLAN.desk;
      const L = lineWords.length;

      // 1. spread: line i, all its words on one timing, to the justified setting
      const sStep = L > 2 ? Math.min(P.spreadStep, P.spreadSpan / (L - 2)) : 0;
      for (let i = 0; i < L - 1; i++) {
        tl.fromTo(lineWords[i], { x: 0 }, T(lineWords[i], { x: val('dxJ'), duration: P.spreadDur, ease: 'power1.out' }), P.spreadAt + sStep * i);
      }
      // 2. the last item slides flush right
      tl.fromTo(lineWords[L - 1], { x: 0 }, T(lineWords[L - 1], { x: val('dxJ'), duration: P.lastDur, ease: 'power1.inOut' }), P.lastAt);

      if (!S.phone) {
        // 3. the heading relays to the far corner, last letter leading; a long word staggers tighter
        const n = o.relay ? chars.length : 0;
        const st = n > 1 ? Math.min(o.stagger, 0.064 / (n - 1)) : 0;
        if (n) {
          const sh = st * 0.75;
          chars.forEach((ch, i) => {
            const k = n - 1 - i;
            const d = (st - sh) * k; // the travel and the regrow, after this letter's shrink
            // one letter's shrink, travel and regrow, held on its layer from the first to the last
            const lt = gsap.timeline(Object.assign({ defaults: { immediateRender: false, force3D: false } }, hold(ch)));
            lt.fromTo(ch, { scale: 1 }, { scale: o.dot, duration: 0.03, ease: 'power1.in' }, 0)
              .fromTo(ch, { x: 0 }, { x: () => S.dxL * S.k, duration: 0.09, ease: 'power2.inOut' }, 0.02 + d)
              .fromTo(ch, { scale: o.dot }, { scale: 1, duration: 0.03, ease: 'power1.out' }, 0.09 + d);
            tl.add(lt, P.relayAt + sh * k);
          });
        }

        // 4. fold: line i rises into index row i, shrinking about its top-left corner, words closing up
        const fStep = L > 1 ? Math.min(P.foldStep, P.foldSpan / (L - 1)) : 0;
        // (tweens made apart and added, so they can be placed again)
        const add = (tw) => { tl.add(tw, P.foldAt); return tw; };
        const folds = lineWords.map((ws) => add(gsap.fromTo(ws, { x: val('dxJ'), y: 0, scale: 1 },
          T(ws, { x: val('dxI'), y: val('dyI'), scale: () => S.sI, duration: P.foldDur, ease: 'power2.inOut' }))));

        // 5. the hierarchy swaps: once the folding lines have cleared the top right, the heading swells
        // from its corner to the paragraph's width (the row is already set at that size, see measure)
        const grow = n && o.grow && labelRow
          ? add(gsap.fromTo(labelRow, { x: 0, scale: 1 },
            T(labelRow, { x: () => S.xL * S.k, scale: () => S.sL, duration: P.growDur, ease: 'power2.inOut' })))
          : null;

        // 6. the paragraph, once the last item is halfway up and clear of its box
        const para = body ? add(gsap.fromTo(body, { autoAlpha: 0, y: 24 }, T(body, { autoAlpha: 1, y: 0, duration: P.bodyDur, ease: 'power1.out' }))) : null;

        // When the fold starts: at P.foldAt, or later (to 0.64 at most) if row 0 would reach the
        // heading's band before the heading's first letter, the last to leave, is past row 0's right
        // edge. Read from the measured geometry, and placed again on every refresh.
        S.place = () => {
          let at = P.foldAt;
          const g = S.guard;
          if (n && g && g.dy < 0 && S.dxL > 0) {
            const e = clamp((g.top - g.band) / -g.dy, 0, 1);
            const right = Math.max(...g.words.map((w) => w.left + w.dxJ + (w.dxI - w.dxJ) * e + w.width * (1 + (S.sI - 1) * e)));
            const clear = P.relayAt + 0.02 + st * (n - 1) + 0.09 * inv((right + 16 - g.charLeft) / S.dxL);
            at = clamp(clear + 0.012 - P.foldDur * inv(e), P.foldAt, 0.64);
          }
          folds.forEach((tw, i) => tw.startTime(at + fStep * i));
          const lastFold = at + fStep * (L - 1);
          if (grow) grow.startTime(lastFold + P.growLead * P.foldDur);
          if (para) para.startTime(lastFold + P.bodyLead * P.foldDur);
        };
        S.place();
      }

      // rest to the end; the timeline is exactly 1 long
      tl.to({}, { duration: Math.max(0, 1 - tl.duration()) }, tl.duration());
    };

    // Fonts that arrive late and size changes re-measure and place the fold again; ScrollTrigger re-reads
    // the function values (invalidateOnRefresh), and the scrub restores the same progress, so nothing jumps.
    let fontWait = 0, sizeWait = 0;
    if (window.ScrollTrigger) ScrollTrigger.addEventListener('refreshInit', () => { if (isLive()) { measure(); if (S.place) S.place(); } else fitStatic(); });
    if (document.fonts) {
      document.fonts.addEventListener('loadingdone', () => {
        clearTimeout(fontWait);
        fontWait = setTimeout(() => { if (isLive() && window.ScrollTrigger) ScrollTrigger.refresh(); else fitStatic(); }, 60);
      });
      document.fonts.ready.then(() => { if (!isLive()) fitStatic(); });
    }
    // the finished composition has no ScrollTrigger refresh to ride on, so it refits on resize itself
    window.addEventListener('resize', () => {
      clearTimeout(sizeWait);
      sizeWait = setTimeout(() => { if (!isLive()) fitStatic(); }, 200);
    });

    fitStatic();
    if (!window.Stage) return null;
    const scrub = o.scrub !== null ? o.scrub : (Stage.lenis ? true : 0.8);
    const start = () => Stage.scene(root, {
      hold: o.hold,
      scrub,
      build,
      phone: o.phone === 'same' ? { hold: o.phoneHold, build } : 'rest',
      rest: () => fitStatic(),
    });
    let mm = start();
    if (mm && window.matchMedia) {
      const motion = window.matchMedia('(prefers-reduced-motion: no-preference)');
      const small = window.matchMedia('(max-width: 767px)');
      const wide = window.matchMedia(WIDE);
      // Stage work-around: gsap.matchMedia calls back only when one of its conditions matches, and
      // reduced motion on a desktop matches neither, so the stage never marks the rest there. The CSS
      // default is already the finished composition; this only adds the class and fits the type.
      const orphan = () => {
        if (motion.matches || small.matches) return;
        root.classList.remove('is-live');
        root.classList.add('is-rest');
        root.style.removeProperty('--hold');
        fitStatic();
      };
      orphan();
      motion.addEventListener('change', () => setTimeout(orphan));
      small.addEventListener('change', () => setTimeout(orphan));
      // Stage work-around: the stage rebuilds only when its own conditions change, so a turn between
      // portrait and landscape over 767px starts the scene again here (after the stage's own handlers).
      let turnWait = 0;
      wide.addEventListener('change', () => {
        clearTimeout(turnWait);
        turnWait = setTimeout(() => {
          if (small.matches || !motion.matches || !mm) return;
          if (mm.kill) mm.kill(true); else mm.revert();
          mm = start();
          if (window.ScrollTrigger) ScrollTrigger.refresh();
        }, 120);
      });
    }
    return mm;
  };

  window.Scenes = window.Scenes || {};
  window.Scenes[ID] = make;
})();

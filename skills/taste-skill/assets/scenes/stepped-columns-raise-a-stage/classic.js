// assets/scenes/stepped-columns-raise-a-stage/classic.js - the 2.4 scene file, kept as it was; scene.js loads it through classic/classic.js.
// tasteskill / scenes / stepped-columns-raise-a-stage.js — Stepped columns raise a stage.
//
// A held stage on one flat page colour holds a row of 3-5 equal columns. Each column opens as an ink
// stub that already holds its step's copy, under its note (the date or stage, in ink on the page). The
// stubs rise together and finish at evenly spread points, so the row reads first as a falling bar chart
// and then levels into one block, late in the hold. An ink edge never stops in a line of copy: where it
// would cross one (the note at the top of a column), it jumps past it in one step, so no word is ever
// cut into two colours while it is read. Nothing is drawn on the ink and nothing travels along a track:
// the columns themselves show where the story is.
//
// Needs gsap + ScrollTrigger (no SplitText), stage.js, then this file. Read the CSS file's header too.
//
// Markup (the ghost copy is made by this file; do not write it):
//
//   <section class="scene" data-scene="stepped-columns-raise-a-stage" style="--n:4"
//            data-options='{"order":"descending"}' aria-labelledby="sr-title">
//     <div class="scene-stage">
//       <header class="sr-head">
//         <h2 class="sr-title" id="sr-title">Every table starts out rough</h2>     ≤ 8 words, ≤ 2 lines
//       </header>
//       <ol class="sr-cols">
//         <li class="sr-col">
//           <div class="sr-panel">
//             <p class="sr-note">Week one</p>               optional; plain words, never an index number
//             <h3 class="sr-col-title">Rough-sawn oak</h3>   ≤ 2 short lines (≤ 18 characters a line)
//             <p class="sr-col-text">We pick the boards at the yard ourselves.<span class="sr-more"> Then
//               they settle in the shop for a week before the first cut.</span></p>
//           </div>                                          16-28 words. The optional .sr-more part is
//         </li>                                             what a phone row drops: keep the rest ≤ 70
//         … one <li> per step                               characters (two lines on a 390px phone)
//       </ol>
//     </div>
//   </section>
//
// Step counts: 3-5 is the design; 1-6 run as columns; 7-12 run as rows (a horizontal bar chart, on
// desktop too); more than 12 show the finished composition.
//
// Colours (CSS): exactly two. --sr-page (defaults to the page's --ground, else white) is ONE flat colour
// under the whole stage. --sr-ink (defaults to --accent, else vermilion #d2232a) must reach 4.5:1
// against the page.
//
// Options (data-options JSON, or the second argument), with defaults and ranges:
//   hold       screens the stage is held on desktop       0.45 × N, clamped 1.4-2.2 (1.8 for four)
//   phoneHold  screens held on a phone (rows)              0.4 × N, clamped 1.4-2 (1.6 for four)
//   scrub      seconds of catch-up                         0.3 with Stage.smooth(), else 0.5   (0.2-0.8)
//   order      which column fills first                    "descending" (first column first, reads "done in
//                                                          order") | "ascending" (last column first: a rising
//                                                          chart for tiers) | "centre" (odd N, middle first)
//   ends       [first, last] ink end points, 0-1           [0.30, 0.92]; first 0.20-0.40, last 0.75-0.95
//   ghost      false: each column starts as an ink stub     false; true = the whole step's copy waits in
//              that already holds its copy, under its       ink on the page and the ink rises from the
//              note in ink on the page                      column's foot (it jumps past the copy at once)
// --n on the section (the step count) is only needed for the no-script layout; the script sets it.
//
// Timeline (fractions of the hold), one linear proxy 0 → 1 that renders every frame:
//   columns  every panel's clip-path runs from its stub (inset(100% 0 0 0) with the ghost) to inset(0)
//            from 0, ending at its end point (default 0.30 / 0.51 / 0.71 / 0.92 for four), skipping
//            every band that holds a line of copy: the edge reaches the line, then is past it on the
//            next frame. The last column lands near the end, so something moves until the stage lets go.
//   rows     each row turns to ink as one block, faded over 0.04 of the hold that ends at its end
//            point (a wipe would cut the row's words).
//   The header and the ghost copy never move.
//
// Layout modes, chosen on every refresh from the stage size and N:
//   cols   columns side by side (1-6 steps, ≥ 860px wide, ≥ 540px tall, ≥ 190px a column). Titles share
//          one top line, bodies another.
//   rows   below that, on a phone, or 7-12 steps: stacked rows, each with its note on its title's line,
//          that turn to ink one after another. When the copy does not fit, two compact levels are tried
//          before giving up: data-sr-dense="rows" (smaller row type and padding, and on a row ≥ 560px
//          wide title, body and note side by side) and data-sr-dense="all" (a short header too). That
//          keeps a 375x667 phone, landscape phones and 12 steps on a 1440x900 desktop moving.
//   still  the copy does not fit even then: the finished composition, unheld.
// Reduced motion, no script and a failed CDN show the finished composition (CSS): every column inked.
// Turning reduced motion on mid-session lands on the same composition.
(() => {
  if (!window.Stage) return;
  const ID = 'stepped-columns-raise-a-stage';
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const ROW_FADE = 0.04; // rows: how much of the hold one row takes to turn to ink
  const AIR = 6; // px of air the ink edge keeps from a line of copy it jumps past
  const MAX_COLS = 6, MAX_ROWS = 12;

  // The ink in a column, 0-1 of its height from the foot, for a share f (0-1) of its rise from k0. The
  // bands in `zones` hold copy: the edge never stops in one. It runs through what is left at an even
  // pace and crosses each band between two frames, so a line of copy is never shown cut in two colours.
  const allowed = (k0, zones) => {
    const segs = [];
    let x = k0;
    for (const [a, b] of zones) {
      if (b <= x) continue;
      if (a > x) segs.push([x, Math.min(a, 1)]);
      x = Math.max(x, b);
      if (x >= 1) break;
    }
    if (x < 1) segs.push([x, 1]);
    return segs;
  };
  const inkAt = (segs, f) => {
    if (f >= 1 || !segs.length) return f >= 1 ? 1 : segs.length ? segs[0][0] : 0;
    let d = f * segs.reduce((s, [a, b]) => s + b - a, 0);
    for (const [a, b] of segs) { if (d <= b - a) return a + d; d -= b - a; }
    return 1;
  };

  window.Scenes = window.Scenes || {};
  window.Scenes[ID] = (root, opts = {}) => {
    const stage = root.querySelector(':scope > .scene-stage') || root.firstElementChild;
    const colEls = [...root.querySelectorAll('.sr-col')];
    const N = colEls.length;
    if (!stage || !N) return null;

    // ---- options ----
    const ghostOn = opts.ghost === true || opts.ghost === 'on';
    const ends = Array.isArray(opts.ends) ? opts.ends : [0.3, 0.92];
    const e1 = clamp(+ends[0] || 0.3, 0.05, 0.85), eN = clamp(+ends[1] || 0.92, e1, 0.95);
    const order = opts.order || 'descending';
    const lin = (i) => (N === 1 ? eN : e1 + (i * (eN - e1)) / (N - 1));
    const E = colEls.map((_, i) => {
      if (order === 'ascending') return lin(N - 1 - i);
      if (order === 'centre' || order === 'center') { const m = (N - 1) / 2; return m ? e1 + ((eN - e1) * Math.abs(i - m)) / m : e1; }
      return lin(i);
    });
    const hold = opts.hold ?? clamp(0.45 * N, 1.4, 2.2);
    const phoneHold = opts.phoneHold ?? clamp(0.4 * N, 1.4, 2);
    const scrub = opts.scrub ?? (Stage.lenis ? 0.3 : 0.5);

    // ---- the parts this file makes ----
    root.classList.add('sr-js');
    root.style.setProperty('--n', N);
    const panels = colEls.map((c) => c.querySelector('.sr-panel'));
    if (!ghostOn) root.setAttribute('data-sr-ghost', 'off');
    colEls.forEach((c, i) => {
      if (!panels[i] || c.querySelector('.sr-ghost')) return;
      const g = panels[i].cloneNode(true);
      g.classList.replace('sr-panel', 'sr-ghost');
      g.removeAttribute('id');
      g.querySelectorAll('[id]').forEach((n) => n.removeAttribute('id'));
      g.setAttribute('aria-hidden', 'true');
      g.inert = true;
      c.insertBefore(g, panels[i]);
    });
    const probe = document.createElement('div');
    probe.className = 'sr-probe';
    probe.setAttribute('aria-hidden', 'true');
    stage.appendChild(probe);

    const S = { live: false, geo: null, lastP: 0, stub: 0, clip: [], segs: [] };

    // ---- measuring ----
    const relTo = (base) => (node) => {
      if (!node) return null;
      const r = node.getBoundingClientRect();
      if (!r.width && !r.height) return null;
      return { left: r.left - base.left, top: r.top - base.top, right: r.right - base.left, bottom: r.bottom - base.top, width: r.width, height: r.height };
    };
    const parts = (rel) => colEls.map((c, i) => {
      const p = panels[i] || c;
      return { col: rel(c), panel: rel(p), note: rel(p.querySelector('.sr-note')), title: rel(p.querySelector('.sr-col-title')), text: rel(p.querySelector('.sr-col-text')) };
    });
    // two boxes on one line, closer than `gap` side by side
    const overlaps = (a, b, gap) => a.left < b.right + gap && b.left < a.right + gap && a.top < b.bottom - 1 && b.top < a.bottom - 1;
    // Does every step's copy sit inside its panel, clear of its note?
    function fits() {
      const rel = relTo(stage.getBoundingClientRect());
      const cols = root.getAttribute('data-sr-mode') === 'cols';
      const dense = root.hasAttribute('data-sr-dense');
      return parts(rel).every((m) => {
        const P = m.col; // the cell, not the panel: a panel grows past its cell when the copy overflows
        const copy = [m.title, m.text].filter(Boolean);
        if (!P || !copy.length) return true;
        const all = m.note ? [m.note, ...copy] : copy;
        // a compact row has thin padding: ask for a little air above and below its copy as well
        const airTop = dense ? 8 : 4, airBottom = dense ? 6 : -1;
        if (all.some((b) => b.top < P.top + airTop || b.bottom > P.bottom - airBottom || b.right > P.right + 1)) return false;
        if (!m.note) return true;
        // columns keep the note above the copy; rows set it beside the title
        if (!cols) return copy.every((b) => !overlaps(m.note, b, 8));
        return copy[0].top >= m.note.bottom + 12;
      });
    }
    const setAttr = (k, v) => { if (v == null) { if (root.hasAttribute(k)) root.removeAttribute(k); } else if (root.getAttribute(k) !== v) root.setAttribute(k, v); };

    // Every copy block in one visual row of cards as tall as the tallest, so the titles share one top
    // line and the bodies another, whatever the body lengths.
    function equalize(on) {
      setAttr('data-sr-even', null);
      colEls.forEach((c) => { c.style.removeProperty('--sr-title-h'); c.style.removeProperty('--sr-text-h'); });
      if (!on) return;
      const h = (p, sel) => { const e = p && p.querySelector(sel); return e ? e.getBoundingClientRect().height : 0; };
      const rows = [];
      colEls.forEach((c, i) => {
        const top = c.getBoundingClientRect().top;
        let row = rows.find((r) => Math.abs(r.top - top) < 2);
        if (!row) rows.push((row = { top, cols: [], title: 0, text: 0 }));
        row.cols.push(c);
        row.title = Math.max(row.title, h(panels[i], '.sr-col-title'));
        row.text = Math.max(row.text, h(panels[i], '.sr-col-text'));
      });
      rows.forEach((r) => r.cols.forEach((c) => {
        c.style.setProperty('--sr-title-h', Math.ceil(r.title) + 'px');
        c.style.setProperty('--sr-text-h', Math.ceil(r.text) + 'px');
      }));
      setAttr('data-sr-even', '');
    }

    function pickMode() {
      const W = stage.clientWidth || window.innerWidth;
      const H = probe.offsetHeight || window.innerHeight;
      const G = clamp(W * 0.0167, 16, 24);
      setAttr('data-sr-dense', null);
      if (N <= MAX_COLS && W >= 860 && H >= 540 && (W - 2 * G - (N - 1) * 12) / N >= 190) {
        setAttr('data-sr-mode', 'cols');
        equalize(true);
        if (fits()) return 'cols';
      }
      equalize(false);
      if (N <= MAX_ROWS) {
        setAttr('data-sr-mode', 'rows');
        if (fits()) return 'rows';
        // compact rows first, then a compact header too
        for (const level of ['rows', 'all']) {
          setAttr('data-sr-dense', level);
          if (fits()) return 'rows';
        }
        setAttr('data-sr-dense', null);
      }
      return 'still';
    }

    // ---- the layout: mode and geometry ----
    function layout() {
      const live = S.live && root.classList.contains('is-live');
      const mode = live ? pickMode() : 'rest';
      setAttr('data-sr-mode', mode);
      if (mode !== 'rows') setAttr('data-sr-dense', null);
      // the finished composition: every panel fully inked (columns clip, rows fade)
      panels.forEach((p) => {
        if (!p) return;
        if (mode !== 'cols') p.style.removeProperty('clip-path');
        if (mode !== 'rows') p.style.removeProperty('opacity');
      });
      S.clip = [];
      let base = stage.getBoundingClientRect();
      let rel = relTo(base);
      let M = parts(rel);
      const oneRow = N > 1 && M.every((m) => Math.abs(m.col.top - M[0].col.top) < 2);
      setAttr('data-sr-wrap', oneRow || N === 1 ? 'no' : 'yes');
      if (mode !== 'cols') equalize(mode === 'rest' || mode === 'still');
      base = stage.getBoundingClientRect();
      rel = relTo(base);
      M = parts(rel);
      // ghost copy off (the default): each column starts as an ink stub just tall enough to hold its copy
      S.stub = 0;
      if (!ghostOn && mode === 'cols') {
        const colH = M[0].col.height;
        S.stub = clamp(Math.max(...M.map((m) => m.col.bottom - ((m.title || m.text || { top: m.col.bottom }).top - 22))) / colH, 0, 0.6);
      }
      // the bands of each column the ink edge may cross but never stop in: every block of copy, the
      // panel's and the ghost's (they share a place), with AIR above and below, from the column's foot
      S.segs = [];
      if (mode === 'cols') {
        M.forEach((m, i) => {
          const col = m.col;
          const z = [m.note, m.title, m.text].filter(Boolean)
            .map((b) => [(col.bottom - b.bottom - AIR) / col.height, (col.bottom - b.top + AIR) / col.height])
            .sort((a, b) => a[0] - b[0]);
          const merged = [];
          for (const [a, b] of z) { const l = merged[merged.length - 1]; if (l && a <= l[1]) l[1] = Math.max(l[1], b); else merged.push([a, b]); }
          S.segs[i] = allowed(S.stub, merged);
        });
      }
      const g = { mode };
      // when each panel starts filling: together in columns (a bar chart); in rows just before its end point
      g.start = E.map((e) => (mode === 'rows' ? Math.max(0, e - ROW_FADE) : 0));

      // ghost lines the ink has fully covered are hidden, so nothing reads as text lying under a panel
      g.ghosts = colEls.map((c, i) => {
        const gh = c.querySelector('.sr-ghost');
        if (!gh || (mode !== 'cols' && mode !== 'rows')) return [];
        const col = M[i].col;
        const range = document.createRange();
        return [...gh.children].map((e) => {
          e.style.removeProperty('visibility');
          // the text itself, not its box: a block title is as wide as the row but its words are not
          range.selectNodeContents(e);
          const rs = [...range.getClientRects()].filter((r) => r.width > 0 && r.height > 0);
          if (!rs.length) return null;
          const top = Math.min(...rs.map((r) => r.top)) - base.top, right = Math.max(...rs.map((r) => r.right)) - base.left;
          const at = mode === 'cols' ? (col.bottom - top + 1) / col.height : (right - col.left + 1) / col.width;
          return { e, at, off: false };
        }).filter(Boolean);
      });
      if (mode !== 'cols' && mode !== 'rows') root.querySelectorAll('.sr-ghost > *').forEach((e) => e.style.removeProperty('visibility'));
      S.geo = g;
      if (live) render(S.lastP);
    }

    // ---- one frame ----
    function render(p) {
      S.lastP = p;
      const g = S.geo;
      if (!g || (g.mode !== 'cols' && g.mode !== 'rows')) return;
      for (let i = 0; i < N; i++) {
        const el = panels[i];
        if (!el) continue;
        const f = clamp((p - g.start[i]) / (E[i] - g.start[i]), 0, 1);
        // columns: the edge rises, skipping every band of copy; rows: the whole row fades to ink at once
        const k = g.mode === 'cols' ? inkAt(S.segs[i] || [], f) : Math.round(f * 1000) / 1000;
        if (g.mode === 'cols') {
          const v = `inset(${(100 - k * 100).toFixed(2)}% 0% 0% 0%)`;
          if (S.clip[i] !== v) { el.style.clipPath = v; S.clip[i] = v; }
        } else if (S.clip[i] !== k) { el.style.opacity = String(k); S.clip[i] = k; }
        for (const part of g.ghosts[i]) {
          const off = g.mode === 'cols' ? k >= part.at : k >= 1;
          if (off !== part.off) { part.off = off; part.e.style.visibility = off ? 'hidden' : ''; }
        }
      }
    }

    // ---- staying right: refreshes while it runs, resizes and late fonts while it rests ----
    if (window.ScrollTrigger) {
      ScrollTrigger.addEventListener('refreshInit', () => { if (S.live) layout(); });
      ScrollTrigger.addEventListener('refresh', () => { if (S.live) render(S.lastP); });
    }
    let raf = 0;
    const later = () => { if (!S.live && !raf) raf = requestAnimationFrame(() => { raf = 0; if (!S.live) layout(); }); };
    if (window.ResizeObserver) new ResizeObserver(later).observe(stage);
    if (document.fonts) document.fonts.ready.then(later);
    // The stage drops .is-live without calling rest() when reduced motion is switched on mid-session on
    // a desktop (its matchMedia has no branch for it): land on the finished composition anyway.
    const settle = () => { if (S.live && !root.classList.contains('is-live')) { S.live = false; layout(); } };
    if (window.MutationObserver) new MutationObserver(settle).observe(root, { attributes: true, attributeFilter: ['class'] });
    const reduce = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
    if (reduce && reduce.addEventListener) reduce.addEventListener('change', () => requestAnimationFrame(settle));

    const build = (tl) => {
      S.live = true;
      layout();
      const proxy = { p: 0 };
      tl.fromTo(proxy, { p: 0 }, { p: 1, duration: 1, ease: 'none', onUpdate: () => render(proxy.p) }, 0);
    };

    return Stage.scene(root, {
      hold,
      scrub,
      build,
      phone: { hold: phoneHold, build },
      rest: () => { S.live = false; layout(); },
    });
  };
})();

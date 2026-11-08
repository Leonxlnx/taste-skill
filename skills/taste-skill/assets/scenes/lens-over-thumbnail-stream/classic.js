// assets/scenes/lens-over-thumbnail-stream/classic.js - the 2.4 scene file, kept as it was; scene.js loads it through classic/classic.js.
// tasteskill / scenes / lens-over-thumbnail-stream.js — a lens over a thumbnail stream (references/scenes.md).
//
// A held stage carries one thin strip of colour thumbnails grouped by project. Scrolling slides the strip
// left while an unseen lens sweeps right; every picture near the lens swells and heaps into a seeded
// collage of its project that fills the band from top to bottom, then sinks back into the strip once the
// lens has passed. Project one is already open under the lens on the first frame. A masthead caption
// relays letter by letter to name the project under the lens, with its year, category and link beside it,
// so a whole archive becomes one scrubbable index with the detail view built in. No line, chip, counter or
// greyscale strip: the lens is shown only by what it opens. For portfolios, archives and catalogues: 5-12
// projects of 5-10 pictures each (it works from 2 projects, it shines from 6).
//
// DOM (the finished composition, a contact-sheet index, is what shows without script or with reduced motion):
//
//   <section class="scene lens" data-scene="lens-over-thumbnail-stream" aria-labelledby="lens-title"
//            data-options='{"sweep":0.5}'>
//     <div class="scene-stage">
//       <header class="lens-head">
//         <h2 class="lens-title" id="lens-title">Selected work</h2>        the caption shows it while live
//         <p class="lens-range">Commissions from 2019 to 2026</p>
//         <p class="lens-count">8 projects</p>      static, shown as it is (an older data-now="{k} of {n}" is
//                                                   ignored: a live count is a counter)
//       </header>
//       <div class="lens-field">
//         <ol class="lens-track">
//           <li class="lens-cap" aria-hidden="true">Index</li>          optional label left of the strip (shown
//                                                                       only where it fits inside the margin)
//           <li class="lens-group" data-year="2019" data-cat="Editorial series">
//             <h3 class="lens-name"><a class="lens-link" href="/work/tidewater">Tidewater</a> <span class="lens-year">2019</span></h3>
//             <ul class="lens-thumbs">
//               <li class="lens-thumb" style="--r:1.5"><img src="…" alt="" width="600" height="400"></li>
//               <li class="lens-thumb lens-thumb--key" style="--r:1.5"><img …></li>   the hero, landscape
//               <li class="lens-thumb" data-phone="hide" style="--r:.8"><img …></li>   dropped on phones
//             </ul>
//           </li>
//           … one li.lens-group per project …
//         </ol>
//       </div>                     (an older .lens-playhead with its .lens-line and .lens-flag is kept hidden)
//       <div class="lens-foot" aria-hidden="true">   a div, not a <footer>: the page's footer must be the
//                                                    first footer element (tools and readers take it for it)
//         <p class="lens-caption"><span class="lens-caption-line"></span><span class="lens-caption-line"></span></p>
//         <p class="lens-meta"><span class="lens-meta-year"></span><span class="lens-meta-cat"></span><a class="lens-meta-link" href="#" tabindex="-1">View the project</a></p>
//       </div>                     (.lens-meta-year is created when missing; an older <footer class="lens-foot"> still works)
//     </div>
//   </section>
//
// There is no end label: at 100% the last collage fills the right side of the stage, where a label after
// the strip would sit under it. A .lens-cap placed after the groups is not drawn.
//
// Content: every project needs a landscape key picture (class lens-thumb--key, else the middle one) and
// at least 5 pictures. --r on each thumb is the file's own width / height (read from the img's width and
// height attributes when missing); nothing is cropped. At 1440x900 a key blooms to about 306x460px and a
// satellite to 130-250px tall: export keys about 960px wide, the rest 480-640px on the long side. Names fit themselves to the caption band (they shrink, and wrap to two lines past about
// 30 characters), but short names of 1-2 words read best. Give the first two groups eager pictures and the
// rest loading="lazy"; the scene loads them when it is 1.5 screens away. Each project's data-year shows
// in the meta row.
//
// Colour: every picture is in its own colour, in the strip as in the bloom (a greyscale strip is a banned
// device). Flat thumbnails are painted into the strip's own layer; only pictures that are blooming become
// layers.
//
// Options (data-options JSON; defaults in brackets):
//   hold       screens the desktop stage is held for [clamp(0.62 x projects, 4, 7.5)], 2-10
//   phoneHold  screens on a phone [clamp(0.55 x projects, 3.5, 6.5)], 2-10
//   phone      'same' (a fixed centre lens and the strip does the travel) | 'rest' (the contact sheet) ['same']
//   sweep      share of the width the line travels on desktop, 0-0.6 [0.5: from 0.25W to 0.75W]; 0 = fixed lens
//   bloom      key picture height in bloom units, 4-10 [10]. A unit is 3.78% of the screen height (34px at
//              1440x900), at most 4% of the width (5.2% on a screen taller than wide); satellites are
//              42-82% of the key. 10 fills more than half the width and the whole collage band at 1440x900
//   phoneBloom the same on a phone, in strip heights (28px), 4-10 [9]; the key never outgrows the screen
//   reach      lens radius as a share of the width, 0.15-0.8 [0.45; phone 0.7]
//   gate       0.15-1 [0.35]: at 0.15 one collage shows at a time, at 1 two always mix
//   push       horizontal spread of a bloom, -0.55 (pull in, dense) to 0.35 (push out, roomy) [0.35; phone -0.55]
//   dwell      0-0.9 [0.7]: how much the strip slows at each project (0 = a steady conveyor)
//   seed       any whole number [0]: reshuffles every collage
//   scrub      seconds of catch-up when Lenis is off [0.6]; with Lenis the scrub is locked (true)
(() => {
  const ID = 'lens-over-thumbnail-stream';
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const sm = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));
  const lerp = (a, b, t) => a + (b - a) * t;
  const num = (v, d, a, b) => { const n = Number(v); return v === undefined || v === null || v === '' || !Number.isFinite(n) ? d : clamp(n, a, b); };
  const rng = (seed) => () => { // mulberry32
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  // the inner share of the lens radius that blooms in full, so a centred project opens as one heap and
  // not as a bell where only the middle picture is big
  const CORE = 0.3;

  // Characters in word masks: each word clips its own letters, so a relay never shows ghost letters over a
  // second caption line or the meta row.
  const fill = (line, text) => {
    line.textContent = '';
    const chars = [];
    String(text).split(' ').forEach((word, wi) => {
      if (wi) line.appendChild(document.createTextNode(' '));
      const w = document.createElement('span');
      w.className = 'lens-w';
      for (const ch of word) { const c = document.createElement('span'); c.className = 'lens-c'; c.textContent = ch; w.appendChild(c); chars.push(c); }
      line.appendChild(w);
    });
    line.__chars = chars;
    return chars;
  };

  // Two stacked lines that take turns: the outgoing letters leave, and only once the last of them has gone
  // (and its line is emptied) do the incoming ones rise in, so two names never share a pixel or the DOM.
  // A change while letters are still leaving only replaces the name that will rise next, and changes less
  // than 120ms apart (a fling) only retarget the arriving line, so only the last name relays.
  // dress(line, text) sizes a line for its text (the caption fits long names to its band).
  const relay = (lines, t, dress) => {
    let cur = 0, last = -1e9, text = null, next = null;
    const put = (line, s) => { const chars = fill(line, s); line.__text = s; if (dress) dress(line, s); return chars; };
    // each line keeps a handle on its own tween: killing that handle stops every staggered letter, where
    // killTweensOf can leave letters whose stagger slot has not started yet to wake up later
    const kill = (l) => { if (l.__tw) { l.__tw.kill(); l.__tw = null; } };
    const arrive = (line, s, dir) => { line.__tw = gsap.fromTo(put(line, s), { yPercent: 110 * dir, opacity: 0 }, { yPercent: 0, opacity: 1, duration: t.inn, ease: 'expo.out', stagger: { each: t.inEach, from: dir > 0 ? 'start' : 'end' } }); };
    return {
      set(s) {
        text = s; last = -1e9; next = null;
        lines.forEach(kill);
        gsap.set(put(lines[cur], s), { yPercent: 0, opacity: 1 });
        put(lines[1 - cur], '');
      },
      go(s, dir) {
        if (s === text) return;
        text = s;
        const now = performance.now();
        const quick = now - last < 120;
        last = now;
        // letters still leaving: the newest name waits for them
        if (next) { next.s = s; next.dir = dir; return; }
        const out = lines[cur];
        kill(out); // a line still arriving leaves from wherever its letters are
        if (quick || !(out.__chars && out.__chars.length)) { arrive(out, s, dir); return; }
        next = { s, dir };
        out.__tw = gsap.to(out.__chars, {
          yPercent: -110 * dir, opacity: 0, duration: t.out, ease: 'power2.in', stagger: { each: t.outEach, from: dir > 0 ? 'start' : 'end' },
          onComplete: () => {
            out.__tw = null;
            put(out, ''); // at rest the caption holds exactly one name
            const n = next; next = null;
            cur = 1 - cur;
            if (n) arrive(lines[cur], n.s, n.dir);
          },
        });
      },
    };
  };

  // A short crossfade of a text swap (the flag and the meta row). A newer swap cancels an older one, so a
  // pending older text can never land after the newer one.
  const swap = (el, apply) => {
    if (el.__sw) el.__sw.kill();
    el.__sw = gsap.timeline().to(el, { opacity: 0, duration: 0.075, ease: 'power1.in' }).call(apply).to(el, { opacity: 1, duration: 0.075, ease: 'power1.out' });
  };

  window.Scenes = window.Scenes || {};
  window.Scenes[ID] = (root, opts = {}) => {
    const stage = root.querySelector(':scope > .scene-stage');
    const track = root.querySelector('.lens-track');
    const groupEls = track ? [...track.querySelectorAll(':scope > .lens-group')] : [];
    const N = groupEls.length;
    if (!stage || N < 2) return Stage.scene(root, {}); // nothing to scrub: the contact sheet

    const o = {
      hold: num(opts.hold, clamp(0.62 * N, 4, 7.5), 2, 10),
      phoneHold: num(opts.phoneHold, clamp(0.55 * N, 3.5, 6.5), 2, 10),
      sweep: num(opts.sweep, 0.5, 0, 0.6),
      bloom: num(opts.bloom, 10, 4, 10),
      phoneBloom: num(opts.phoneBloom, 9, 4, 10),
      reach: num(opts.reach, NaN, 0.15, 0.8),
      gate: num(opts.gate, 0.35, 0.15, 1),
      push: num(opts.push, NaN, -0.55, 0.35),
      dwell: num(opts.dwell, 0.7, 0, 0.9),
      seed: Math.round(num(opts.seed, 0, 0, 1e6)),
      scrub: opts.scrub === true ? true : num(opts.scrub, 0.6, 0, 3),
    };

    // ---- the model: groups, pictures and their seeds (computed once; places follow from the measure) ----
    const $ = (sel) => root.querySelector(sel);
    const groups = groupEls.map((el, g) => {
      const link = el.querySelector('.lens-link');
      const lis = [...el.querySelectorAll('.lens-thumb')].filter((li) => li.querySelector('img'));
      let k = lis.findIndex((li) => li.classList.contains('lens-thumb--key'));
      if (k < 0 && lis.length) { k = Math.floor(lis.length / 2); lis[k].classList.add('lens-thumb--key'); }
      const items = lis.map((li, i) => {
        const img = li.querySelector('img');
        if (!li.style.getPropertyValue('--r') && img) {
          const w = +img.getAttribute('width'), h = +img.getAttribute('height');
          if (w > 0 && h > 0) li.style.setProperty('--r', (w / h).toFixed(4));
        }
        const rand = rng(g * 31 + i + o.seed * 1009);
        return { li, img, g, key: i === k, r1: rand(), r2: rand(), r3: rand(), r4: rand(), vis: true, cx: 0, w0: 0, s: 1, v: 0, j: 0, flat: false, grey: -1, lit: false };
      });
      const nameEl = el.querySelector('.lens-name');
      const name = (link ? link.textContent : nameEl ? nameEl.textContent : '').trim() || `Project ${g + 1}`;
      return { el, items, name, year: el.dataset.year || '', cat: el.dataset.cat || '', href: link ? link.getAttribute('href') : null, C: 0, gate: 1, z: 0 };
    });
    const items = groups.flatMap((gr) => gr.items);

    const title = $('.lens-title');
    const head = $('.lens-head');
    const count = $('.lens-count');
    const foot = $('.lens-foot');
    const caption = $('.lens-caption');
    const metaRow = $('.lens-meta');
    const metaCat = $('.lens-meta-cat');
    const metaLink = $('.lens-meta-link');
    // only a label before the strip is drawn (see the note on end labels above)
    const caps = [...track.querySelectorAll(':scope > .lens-cap')].filter((c) => c.compareDocumentPosition(groupEls[0]) & Node.DOCUMENT_POSITION_FOLLOWING);
    // The playhead (a drawn line with a year chip on it) is no longer drawn: a line through every collage is
    // a drawn track standing for the scroll, and the chip a boxed label. A page that still has the markup
    // keeps it hidden (the CSS); the year now reads in the caption's meta row, beside the category.
    // the year in the meta row, created when missing (before the category)
    let metaYear = $('.lens-meta-year');
    if (!metaYear && metaRow) {
      metaYear = document.createElement('span');
      metaYear.className = 'lens-meta-year';
      metaRow.insertBefore(metaYear, metaRow.firstChild);
    }

    // the caption's two lines. The head shows the static count ("8 projects") at every moment: a live
    // "{k} of {n}" is a counter, so data-now is read no more
    let capLines = caption ? [...caption.querySelectorAll('.lens-caption-line')] : [];
    while (caption && capLines.length < 2) { const s = document.createElement('span'); s.className = 'lens-caption-line'; caption.appendChild(s); capLines = [...caption.querySelectorAll('.lens-caption-line')]; }
    const titleText = (title ? title.textContent : '').trim() || 'Selected work';

    // ---- caption fitting: every name is measured once per refresh against the room left of the meta row
    // (desktop) or the full width (phone, two lines at most); a name too long for one line at 55% of the
    // masthead size wraps to two lines instead of shrinking further ----
    const fits = new Map();
    const dress = (ln, text) => {
      const f = fits.get(text);
      ln.style.fontSize = f && f.k < 0.999 ? `${f.k.toFixed(3)}em` : '';
      ln.style.maxWidth = f && f.room ? `${Math.round(f.room)}px` : '';
      ln.classList.toggle('is-wrap', !!(f && f.wrap));
    };
    const fitCaption = () => {
      fits.clear();
      if (!caption || !foot || !foot.clientWidth) return;
      const cs = getComputedStyle(caption), fcs = getComputedStyle(foot);
      const base = parseFloat(cs.fontSize) || 100;
      const lh = (parseFloat(cs.lineHeight) || base * 0.88) / base;
      const column = fcs.flexDirection === 'column';
      const inner = foot.clientWidth - parseFloat(fcs.paddingLeft) - parseFloat(fcs.paddingRight);
      const gap = column ? 0 : parseFloat(fcs.columnGap) || 32;
      // each name gets the room its own meta row leaves (the title shares the first project's row, which is
      // held hidden beside it)
      const metaW = new Map();
      if (!column && metaRow) {
        const keep = metaCat ? metaCat.textContent : '', keepY = metaYear ? metaYear.textContent : '';
        for (const gr of groups) {
          if (metaCat) metaCat.textContent = gr.cat;
          if (metaYear) metaYear.textContent = gr.year;
          metaW.set(gr.name, Math.max(metaW.get(gr.name) || 0, metaRow.offsetWidth));
        }
        metaW.set(titleText, Math.max(metaW.get(titleText) || 0, metaW.get(groups[0].name) || 0));
        if (metaCat) metaCat.textContent = keep;
        if (metaYear) metaYear.textContent = keepY;
      }
      const tall = foot.clientHeight - parseFloat(fcs.paddingBottom) - (column && metaRow ? metaRow.offsetHeight + (parseFloat(fcs.rowGap) || 0) : 0);
      caption.style.maxWidth = '';
      let m = caption.querySelector(':scope > .lens-measure');
      if (!m) { m = document.createElement('span'); m.className = 'lens-measure'; m.setAttribute('aria-hidden', 'true'); caption.appendChild(m); }
      const width = (s) => { m.textContent = s; return m.getBoundingClientRect().width || 1; };
      for (const s of new Set([titleText, ...groups.map((gr) => gr.name)])) {
        const room = Math.max(120, inner - (metaW.get(s) || 0) - gap);
        const avail = room * 0.96; // letters set one by one lose their kerning: keep a margin
        const full = width(s);
        const longest = Math.max(...s.split(' ').map(width));
        let k = Math.min(1, avail / full), wrap = false;
        if (column) { wrap = true; k = Math.min(1, avail / longest, (1.8 * avail) / full); }
        else if (k < 0.55) { wrap = true; k = Math.min(1, avail / Math.max(longest, full * 0.64), tall / (2 * lh * base)); }
        fits.set(s, { k: Math.max(0.3, k), wrap, room: column ? 0 : room });
      }
      m.textContent = '';
      for (const l of capLines) if (l.__text != null) dress(l, l.__text);
    };

    // the outgoing name is quick to leave, since the incoming one waits for it
    // (0.18s out and about 0.7s in all, so a name has landed before a reader who stops can read it)
    const capRelay = caption ? relay(capLines, { out: 0.18, outEach: 0.006, inn: 0.5, inEach: 0.016 }, dress) : null;

    // keyboard: focusing a project's (visually hidden) link scrolls to the point where it blooms
    let live = null;
    root.addEventListener('focusin', (e) => {
      const a = e.target.closest && e.target.closest('.lens-link');
      if (!a || !live || !root.classList.contains('is-live')) return;
      const g = groupEls.indexOf(a.closest('.lens-group'));
      if (g < 0) return;
      root.classList.add('is-kb');
      const p = Math.max(0.1, 0.08 + g * live.D);
      requestAnimationFrame(() => {
        const t = live && live.tl.scrollTrigger;
        if (!t) return;
        const y = t.start + (t.end - t.start) * p;
        if (Stage.lenis) Stage.lenis.scrollTo(y, { immediate: true, force: true }); else window.scrollTo(0, y);
      });
    });
    root.addEventListener('focusout', () => root.classList.remove('is-kb'));

    // one picture loader per scene: a rebuild (a desktop/phone or motion flip) disconnects the last one
    let io = null;
    const drop = () => { if (io) { io.disconnect(); io = null; } };

    // ---- one live run (desktop or phone; matchMedia rebuilds it when either changes) ----
    const build = (tl, ctx) => {
      const phone = ctx.phone;
      const P = {
        a: phone ? 0.5 : 0.5 - o.sweep / 2,
        b: phone ? 0.5 : 0.5 + o.sweep / 2,
        key: phone ? o.phoneBloom : o.bloom,
        reach: Number.isFinite(o.reach) ? o.reach : phone ? 0.7 : 0.45,
        push: Number.isFinite(o.push) ? o.push : phone ? -0.55 : 0.35,
        // the gate's half width in pitches: wide enough that the handover valley between two projects
        // still holds two real collages (and on a phone one picture of 150px or more)
        gateW: phone ? 1 : 0.85,
        top: phone ? 0.14 : 0.13,
        bottom: phone ? 0.74 : 0.77,
        lane: phone ? 0.44 : 0.45,
        gutter: 16,
      };
      // colour: per-frame quantised filter on capable desktops; a class with a CSS transition elsewhere
      const classColour = phone || (navigator.hardwareConcurrency || 8) <= 4;
      root.classList.toggle('lens-classcolour', classColour);
      for (const it of items) { if (it.img) it.img.style.filter = ''; it.grey = 1; it.lit = false; it.li.classList.remove('is-lit'); it.flat = false; }

      // gain 1 from the first frame: project one is already open under the lens at 0, so the opening
      // steps are a collage, not a bare strip (the caption still shows the section's title until 0.03)
      const st = { gain: 1, u: 0 };
      const M = { W: 0, H: 0, h0: 0, laneY: 0, bandTop: 0, bandBot: 0, R: 1, gateW: 1, ready: false };
      let focus = -1, first = true, capOp = [];
      const D = 0.84 / (N - 1);
      live = { tl, D };

      const measure = () => {
        M.W = stage.clientWidth;
        M.H = stage.clientHeight;
        if (!M.W || !M.H) return;
        const { W, H } = M;
        // exact sub-pixel boxes (offsetLeft rounds, and a pixel of error puts a clamped picture on the
        // gutter); the track is only ever translated, so a box minus the track's box is its strip position
        const tr = track.getBoundingClientRect();
        let h0 = 0;
        for (const it of items) {
          it.vis = it.li.offsetParent !== null;
          if (!it.vis) continue;
          const r = it.li.getBoundingClientRect();
          it.w0 = r.width;
          it.cx = r.left - tr.left + r.width / 2;
          if (!h0) h0 = r.height;
        }
        M.h0 = h0 = h0 || 34;
        M.laneY = track.offsetTop + track.offsetHeight / 2 || H * P.lane;
        M.bandTop = H * P.top;
        M.bandBot = H * P.bottom;
        const band = M.bandBot - M.bandTop;
        const half = Math.min(M.laneY - M.bandTop, M.bandBot - M.laneY);
        const maxW = W - 2 * P.gutter - 4; // a few pixels of slack, so rounding never touches a gutter
        // the bloom unit follows the screen, not the strip: the strip stays a thin index line on tablets and
        // short laptops while the collage keeps its share of the band (34px at 1440x900)
        // (a portrait tablet has height to spare: there the unit may take 5.2% of the width, so the
        // collage fills the band instead of its upper half)
        const unit = phone ? h0 : Math.min(0.0378 * H, (H > W ? 0.052 : 0.04) * W, 50);
        const keyPx = P.key * unit;
        groups.forEach((gr, gi) => {
          const vis = gr.items.filter((it) => it.vis);
          for (const it of gr.items) it.flat = false; // force one write
          const keyIt = vis.find((it) => it.key) || vis[Math.floor(vis.length / 2)];
          gr.C = keyIt ? keyIt.cx : gr.el.offsetLeft + gr.el.offsetWidth / 2;
          if (!keyIt) return;
          // the key: as tall as the bloom asks, never wider than the screen or taller than the band
          keyIt.s = Math.min(keyPx / h0, maxW / keyIt.w0, band / h0);
          keyIt.v = 0; keyIt.j = 0;
          const kh = keyIt.s * h0, kw = keyIt.s * keyIt.w0;
          const sats = vis.filter((it) => it !== keyIt);
          for (const it of sats) {
            const rel = phone ? 0.31 + 0.3 * it.r1 : 0.42 + 0.4 * it.r1;
            it.s = Math.max(1, Math.min((rel * keyPx) / h0, maxW / it.w0, band / h0));
            it.j = (2 * it.r3 - 1) * (phone ? 1.6 : 2.5) * unit;
          }
          // satellites alternate above and below the lane; on each side they take evenly spaced levels from
          // the lane to the band's edge, dealt in a seeded order, so the heap fills the band. One that would
          // sit right over the key keeps most of itself above or below it, so the hero stays legible.
          const sides = [[], []];
          sats.forEach((it, i) => sides[(i + gi) % 2].push(it));
          sides.forEach((side, si) => {
            const sign = si ? 1 : -1;
            const ranks = side.map((_, i) => i).sort((x, y) => side[x].r2 - side[y].r2);
            ranks.forEach((idx, rank) => {
              const it = side[idx];
              const bh = it.s * h0, bw = it.s * it.w0;
              const xo = Math.abs((1 + Math.max(0, P.push)) * (it.cx - keyIt.cx) + it.j);
              const over = clamp((kw / 2 + bw / 2 - xo) / bw, 0, 1);
              const lo = over * (kh / 2 + 0.1 * bh) + (1 - over) * 0.1 * kh;
              const hi = Math.max(lo, half - 0.5 * bh);
              const t = clamp((rank + 0.5 + (it.r4 - 0.5) * 0.6) / side.length, 0, 1);
              it.v = sign * lerp(lo, hi, t);
            });
          });
          for (const it of vis) it.li.style.setProperty('--s', it.s.toFixed(3));
          // z order inside a group, set once: the key underneath, smaller satellites over larger ones
          vis.sort((x, y) => (x === keyIt ? -1 : y === keyIt ? 1 : y.s - x.s)).forEach((it, z) => { it.li.style.zIndex = String(z + 1); });
        });
        // a label before the strip shows only where its first frame leaves it whole inside the margin (on a
        // tablet the strip starts at the edge, and a label there would be cut)
        const margin = head ? parseFloat(getComputedStyle(head).paddingLeft) || P.gutter : P.gutter;
        const T0 = W * P.a - groups[0].C;
        M.capFit = caps.map((cap) => cap.getBoundingClientRect().left - tr.left + T0 >= margin);
        const pitch = (groups[N - 1].C - groups[0].C) / (N - 1) || M.W;
        M.gateW = P.gateW * pitch;
        M.R = P.reach * M.W;
        if (!classColour) for (const it of items) it.grey = -1;
        fitCaption();
        M.ready = true;
      };

      const setFocus = (nf, instant) => {
        const dir = nf > focus ? 1 : -1;
        focus = nf;
        const gr = nf >= 0 ? groups[nf] : null;
        groups.forEach((g2, i) => { const z = nf < 0 ? 1 : i === nf ? 3 : Math.abs(i - nf) === 1 ? 2 : 1; if (g2.z !== z) { g2.z = z; g2.el.style.zIndex = String(z); } });
        const capText = gr ? gr.name : titleText;
        // the meta row (year, category, link) keeps its height while hidden, so the caption never shifts
        // when it first appears
        const applyMeta = () => {
          const g2 = gr || groups[0];
          if (metaYear) metaYear.textContent = g2.year;
          if (metaCat) metaCat.textContent = g2.cat;
          if (metaLink) { if (g2.href) metaLink.setAttribute('href', g2.href); metaLink.style.visibility = g2.href ? '' : 'hidden'; }
          if (metaRow) metaRow.classList.toggle('is-empty', !gr);
        };
        if (instant) {
          if (capRelay) capRelay.set(capText);
          if (metaRow) { if (metaRow.__sw) metaRow.__sw.kill(); metaRow.style.opacity = ''; }
          applyMeta();
          return;
        }
        if (capRelay) capRelay.go(capText, dir);
        if (metaRow) swap(metaRow, applyMeta); else applyMeta();
      };

      const render = () => {
        if (!M.ready) return;
        const { W, h0, laneY, bandTop, bandBot, R, gateW } = M;
        const gain = st.gain;
        const u = clamp(st.u, 0, N - 1);

        // focus first: the project under the lens, with hysteresis so a jittering scrub never flickers; the
        // section's title holds the caption for the first 3% of the hold, then relays to project one
        let nf = focus;
        if (gain < 0.45 || tl.progress() < 0.03) nf = -1;
        else if (focus < 0) { if (gain > 0.55) nf = Math.round(u); }
        else if (Math.abs(u - focus) > 0.58) nf = Math.round(u);
        nf = clamp(nf, -1, N - 1);
        if (first) { first = false; setFocus(nf, true); } else if (nf !== focus) setFocus(nf, false);

        const X = W * (P.a + (P.b - P.a) * (u / (N - 1)));
        const i0 = Math.min(N - 2, Math.floor(u));
        const c = lerp(groups[i0].C, groups[i0 + 1].C, u - i0);
        const T = X - c;
        track.style.transform = `translate3d(${T.toFixed(2)}px,0,0)`;

        // the label before the strip steps aside as the first bloom opens
        caps.forEach((cap, i) => {
          const op = M.capFit && M.capFit[i] ? +(1 - sm(gain / 0.2)).toFixed(2) : 0;
          if (capOp[i] !== op) { capOp[i] = op; cap.style.opacity = String(op); }
        });

        const g1 = 1 - o.gate;
        for (const gr of groups) gr.gate = o.gate + g1 * sm(1 - Math.abs(gr.C + T - X) / gateW);

        for (const it of items) {
          if (!it.vis) continue;
          const sx = it.cx + T;
          const d = sx - X;
          const ad = d < 0 ? -d : d;
          let w = ad >= R ? 0 : gain * sm((1 - ad / R) / (1 - CORE)) * groups[it.g].gate;
          if (w < 0.002) w = 0;
          if (w === 0) {
            if (!it.flat) {
              it.flat = true;
              it.img.style.transform = ''; // the CSS rest: scale(1/s), 2D, painted into the strip's own layer
              if (classColour) { if (it.lit) { it.lit = false; it.li.classList.remove('is-lit'); } } else if (it.grey !== 1) { it.grey = 1; it.img.style.filter = ''; }
            }
            continue;
          }
          it.flat = false;
          const f = 1 + (it.s - 1) * w;
          const bw = it.w0 * f, bh = h0 * f;
          let x = sx + P.push * d * w + it.j * w;
          // the edge clamp takes hold well before the bloom (in full by a quarter of it), so a heap pressed
          // against a side never shows a swelling picture cut by the screen edge
          x += Math.min(1, 4 * w) * (clamp(x, P.gutter + bw / 2, W - P.gutter - bw / 2) - x);
          const y = clamp(laneY + it.v * w, bandTop + bh / 2, bandBot - bh / 2);
          it.img.style.transform = `translate3d(${(x - sx).toFixed(2)}px,${(y - laneY).toFixed(2)}px,0) scale(${(f / it.s).toFixed(5)})`;
          // the strip is in colour now (a greyscale picture is a banned device), so a bloom only swells: the
          // is-lit class still marks the pictures of the project under the lens, for a page that styles it
          const lit = w > 0.45 || (it.g === focus && w > 0.1);
          if (lit !== it.lit) { it.lit = lit; it.li.classList.toggle('is-lit', lit); }
        }
      };

      // ---- the timeline: positions are fractions of the hold ----
      // project one is open under the lens from the first frame (gain 1), with the section's title in the
      // caption; it relays to the first name at p 0.03 and the strip starts to travel at 0.08
      const dwell = o.dwell;
      const dwellEase = (t) => (1 - dwell) * t + (dwell * (1 - Math.cos(Math.PI * t))) / 2;
      for (let k = 0; k < N - 1; k++) tl.fromTo(st, { u: k }, { u: k + 1, duration: D, ease: dwellEase, immediateRender: false }, 0.08 + k * D);
      tl.set({}, {}, 1);
      tl.eventCallback('onUpdate', render);

      // re-measure on every refresh (resize, fonts, late pictures), then draw once
      ScrollTrigger.create({ trigger: root, start: 'top top', end: 'bottom bottom', onRefresh: () => { measure(); render(); } });

      // pictures: load the lazy ones when the scene is 1.5 screens away, and decode before they move
      const imgs = items.map((it) => it.img).filter(Boolean);
      const wake = () => imgs.forEach((img) => {
        if (img.loading === 'lazy') img.loading = 'eager';
        if (!img.__decoded) { img.__decoded = true; (img.complete ? img.decode() : new Promise((r) => img.addEventListener('load', r, { once: true })).then(() => img.decode())).catch(() => {}); }
      });
      drop();
      if ('IntersectionObserver' in window) {
        const obs = io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { obs.disconnect(); wake(); } }, { rootMargin: '150% 0px 150% 0px' });
        obs.observe(root);
        // this build runs inside the stage's matchMedia context: a nested context's cleanup runs when that
        // context reverts (a desktop/phone or motion flip), so the observer never outlives its build
        gsap.context(() => () => { obs.disconnect(); if (io === obs) io = null; });
      } else wake();

      measure();
      render();
    };

    return Stage.scene(root, {
      hold: o.hold,
      scrub: Stage.lenis ? true : o.scrub || true,
      build,
      phone: opts.phone === 'rest' ? 'rest' : { hold: o.phoneHold },
    });
  };
})();

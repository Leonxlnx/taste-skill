// assets/scenes/thumbnail-becomes-the-stage/classic.js - the 2.4 scene file, kept as it was; scene.js loads it through classic/classic.js.
// tasteskill / scenes / thumbnail-becomes-the-stage.js
//
// A statement of one or two lines at display size over a row of large thumbnails set on the layout's columns.
// The middle one is really a keyhole onto a full-stage chapter picture or loop. As the page scrolls, the keyhole
// grows over its neighbours while they slide in under it, rises and opens to full bleed; the statement passes
// through the keyhole's edge (ink outside, paper inside) and slides from centred to flush left, so the same words
// become the chapter's heading on the picture, with an optional note under it. Feature notes then rise on a flat
// band at the foot of the picture. Every frame of the hold is a whole composition: the statement and the row
// fill the first frame, and the picture covers more of the stage at every step after it. Use it to open a
// product, place or film chapter from one strong muted video loop or one strong picture.
//
// Requires stage.js (and stage.css), GSAP 3.15.0 + ScrollTrigger 3.15.0. Load thumbnail-becomes-the-stage.css.
// Call Stage.smooth() before Stage.init(), so the scene knows whether Lenis is running.
//
// DOM (one section; the paper copy may be left out, the script clones it from the ink statement, but include it
// so the finished composition without script has its heading too):
//
// <section class="scene" data-scene="thumbnail-becomes-the-stage" data-options='{"hold":2}'>
//   <div class="scene-stage">
//     <div class="kh-statement-box">
//       <h2 class="kh-statement">
//         <span class="kh-line kh-line--lead"><span class="kh-mask"><span class="kh-in">Swim after dark.</span></span></span>
//         <span class="kh-line"><span class="kh-mask"><span class="kh-in">Let the sea come in.</span></span></span>
//       </h2>
//     </div>
//     <div class="kh-row" aria-hidden="true">
//       <div class="kh-sat"><img src="neighbour-a.jpg" alt=""></div>          any number before the slot
//       <div class="kh-slot"><img class="kh-slot-poster" src="chapter-640.jpg" alt=""></div>
//       <div class="kh-sat"><img src="neighbour-b.jpg" alt=""></div>          and after it (0, 1 or 2 a side)
//     </div>
//     <div class="kh-window">
//       <div class="kh-media"><video muted loop playsinline preload="metadata" poster="chapter.jpg"><source src="chapter.mp4" type="video/mp4"></video></div>
//                                        or <img src="chapter.jpg" alt="…">, or a <picture>. No autoplay attribute:
//                                        the scene plays the loop while it is on screen and never under reduced motion,
//                                        nor while the video has data-paused (set by the page's pause control)
//       <div class="kh-shade" aria-hidden="true"></div>
//       <div class="kh-statement-box kh-statement-box--paper" aria-hidden="true">(the same h2 as a div, same spans)</div>
//       <div class="kh-chapter">
//         <p class="kh-note">Lamps on from nine until midnight</p>          optional, under the heading
//         <ul class="kh-features"><li><h3>Label</h3><p>Body</p></li> …</ul>  4 reads best
//       </div>
//     </div>
//   </div>
// </section>
//
// Content:
//   The statement is the chapter's heading, word for word, from the first frame to the last (a heading that
//   loses a line on the way reads as a second, shorter heading). Line 1 names the chapter; a second line is
//   optional (house rule: two lines at most). Keep lines to 20 characters or fewer. The type is one size in both
//   roles and is never scaled while it moves, but a line that would not fit is set smaller before the scene
//   starts: each line is held to 78% of the stage width on desktop and tablet and 88% on phones (the window
//   must grow past a line before it is wholly inside). The finished composition gets the same size when script
//   runs, so its heading is the live end frame's; without script a too-long line wraps instead, and the note
//   below it moves down with it.
//   The chapter picture keeps its subject in the centre: the keyhole opens on about the central half of its
//   width and three quarters of its height on desktop (that crop is the thumbnail). Its upper left stays calm
//   and dark (the heading sits there in white). The thumbnails are cropped to the row's shape (close
//   to square on desktop, 3:4 on portrait tablets, 3:5 on phones), so keep each still's subject in its centre.
//   No text burned into pictures.
//   Feature items: a 2-3 word label and a body of 16 words or fewer; give it 3 or 4. While the scene runs on
//   desktop and tablet the band shows the first 4 (one row on desktop, two by two on tablets and phones from
//   600px); below 600px wide, or under 540px tall, the list leaves the stage and follows the picture in the
//   page's flow, every item shown. Items past the fourth stay in the band's list for screen readers only, and
//   the inspector warns about a list cut short, so do not give it more than 4.
//
// Options (data-options JSON), defaults and ranges:
//   hold       2      screens the stage is held for on desktop and tablet (1.4-2.6)
//   phoneHold  1.6    screens held on phones under 768px (1.4-2.6)
//   phone      'same' 'same' runs the scene on phones with phone numbers; 'rest' shows the finished composition
//   scrub      auto   true (locked to the scrollbar) when Lenis smoothing runs, else 0.5 s of catch-up (0-0.8)
//   thumb      cols   thumbnail width as a share of the row on desktop and tablet (0.12-0.5). By default the
//                     thumbnails are set on the layout's columns: three (or as many as there are) share the width
//                     between the gutters; on a portrait screen the keyhole starts at half the width. A share
//                     smaller than that is lifted to it (small thumbnails leave the opening frames mostly empty
//                     ground); a larger one runs the neighbours off the edges. On phones the keyhole starts at
//                     64% of the width with its neighbours running off the edges (CSS --kh-thumb-phone: 64%)
//   radius     page   keyhole and thumbnail corner radius in px (0-16); defaults to the page's --radius, else 0.
//                     It always decays to exactly 0 as the window reaches full bleed.
//   shade      0.3    alpha of the flat scrim laid over the picture once the heading is on it (0-0.6). Lower it for a
//                     picture whose upper left is already dark (0.1-0.15), so the opened stage lands bright
//   band       1      alpha of the flat band the feature notes sit on, across the foot of the picture (0-1). Solid by
//                     default, so the notes are on the band and not on the picture; under 0.9 the inspector reads them
//                     as captions set on the picture (caption-on-media)
//   heading    0.15   where the heading settles, as a fraction of the stage height from the top (0.1-0.25). The
//                     statement starts at the same height, so it only slides across to become the heading
//   nav        ''     selector of a fixed nav; it gets the class is-on-dark while the opened picture lies under it,
//                     until the stage has scrolled past it (style .is-on-dark in the page)
//
// Page tokens it follows when they exist: --ground (or --bg), --ink, --paper, --font-display, --font-text,
// --margin (side gutter), --gutter (the gap between the thumbnails), --radius.
//
// Everything the scrubbed timeline moves is a plain proxy object turned into custom properties by render()
// (--kh-t transform, --kh-o opacity, --kh-clip, --kh-win-o, --kh-band, --kh-veil), each written on the element
// that uses it. The CSS gives every one its p = 0 value as the live default, so a fresh load or a ScrollTrigger
// refresh at any point of the scene shows the right frame.
//
// crosses words: `.kh-window` the keyhole opens behind the statement, never over it: the statement stays above
// the window, and each line carries its own paper copy (drawn by its .kh-in::after from data-paper, which the
// script sets), clipped to the window, so where the edge passes a line it recolours the letters it passes
// (ink outside, paper inside). The neighbours never rise above the window's top edge.
(() => {
  const ID = 'thumbnail-becomes-the-stage';
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const num = (v, d) => (typeof v === 'number' && isFinite(v) ? v : d);
  const px = (v) => Math.round(v * 100) / 100;
  // a line at most this share of the stage width, so it is wholly inside the opening window by about p 0.35
  const LEAD_SHARE = 0.78, LEAD_SHARE_PHONE = 0.88;
  // where the feature notes leave the stage and follow the picture in the page's flow
  const LIST_OUT = '(max-width: 599px), (max-height: 539px)';

  let measureCtx = null;
  const ctx2d = () => (measureCtx = measureCtx || document.createElement('canvas').getContext('2d'));
  const setFont = (c, cs) => {
    c.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
    if ('letterSpacing' in c) c.letterSpacing = cs.letterSpacing === 'normal' ? '0px' : cs.letterSpacing;
  };

  // Where a line's glyphs actually paint, relative to its line box: the font's own metrics place the
  // baseline (half-leading), the text's measured ink gives the rest. Falls back to the box with a margin.
  const inkBounds = (line) => {
    const box = { x: 0, y: 0, w: line.offsetWidth, h: line.offsetHeight };
    const cs = getComputedStyle(line), fs = parseFloat(cs.fontSize) || 16;
    const pad = { x: -0.04 * fs, y: -0.1 * fs, w: box.w + 0.08 * fs, h: box.h + 0.1 * fs };
    try {
      const c = ctx2d();
      setFont(c, cs);
      const t = c.measureText(textOf(line).trim());
      if (!t.fontBoundingBoxAscent) return pad;
      const lh = parseFloat(cs.lineHeight) || fs;
      const base = (lh - (t.fontBoundingBoxAscent + t.fontBoundingBoxDescent)) / 2 + t.fontBoundingBoxAscent;
      const top = base - t.actualBoundingBoxAscent, bottom = base + t.actualBoundingBoxDescent;
      return { x: -t.actualBoundingBoxLeft - 1, y: top - 1, w: t.actualBoundingBoxLeft + t.actualBoundingBoxRight + 2, h: bottom - top + 2 };
    } catch { return pad; }
  };

  // a style property written only when its string changes
  const writer = (el, prop) => { let last = ''; return (v) => { if (v !== last) { last = v; el.style.setProperty(prop, v); } }; };

  // a line's own words (its paper copy is generated content, so it is never in the text)
  const textOf = (el) => el.textContent || '';

  function make(root, opts = {}) {
    const o = {
      hold: clamp(num(opts.hold, 2), 1.4, 2.6),
      phoneHold: clamp(num(opts.phoneHold, 1.6), 1.4, 2.6),
      phone: opts.phone === 'rest' ? 'rest' : 'same',
      scrub: opts.scrub,
      heading: clamp(num(opts.heading, 0.15), 0.1, 0.25),
      nav: typeof opts.nav === 'string' ? opts.nav : '',
    };
    // a share under the columns is lifted to them by the CSS (max()), so old pages' 0.12-0.24 still work
    if (opts.thumb != null) root.style.setProperty('--kh-thumb', clamp(num(+opts.thumb, 0.3), 0.12, 0.5) * 100 + '%');
    if (opts.radius != null) root.style.setProperty('--kh-radius', clamp(num(+opts.radius, 0), 0, 16) + 'px');
    if (opts.shade != null) root.style.setProperty('--kh-shade', clamp(num(+opts.shade, 0.3), 0, 0.6));
    // the band is the scene's night, solid; a band option under 1 lets the picture show through it. The night is
    // written as rgb() with the band's alpha, which the inspector reads (it does not read color-mix())
    const band = opts.band != null ? clamp(num(+opts.band, 1), 0, 1) : 1;
    if (band < 1) {
      const t = document.createElement('i');
      t.style.color = 'var(--kh-night)';
      root.appendChild(t);
      const c = getComputedStyle(t).color;
      t.remove();
      const q = /^rgba?\(/.test(c) ? (c.match(/[\d.]+/g) || []).slice(0, 3) : [];
      const a = Math.round(band * 100) / 100;
      root.style.setProperty('--kh-band-ground', q.length === 3 ? `rgb(${q.join(' ')} / ${a})` : `color-mix(in srgb, var(--kh-night) ${Math.round(band * 100)}%, transparent)`);
    }
    if (opts.heading != null) root.style.setProperty('--kh-head', o.heading * 100 + 'svh'); // the finished composition puts it there too

    const stageEl = root.querySelector(':scope > .scene-stage');
    const inkBox = root.querySelector('.kh-statement-box:not(.kh-statement-box--paper)');
    const win = root.querySelector('.kh-window');
    const row = root.querySelector('.kh-row');
    const slot = root.querySelector('.kh-slot');
    if (!stageEl || !inkBox || !win || !row || !slot) { console.warn(ID + ': missing .kh-statement-box, .kh-row, .kh-slot or .kh-window'); return null; }

    // the paper copy of the statement lives inside the window; clone it when the page left it out
    let paperBox = win.querySelector('.kh-statement-box--paper');
    if (!paperBox) {
      paperBox = inkBox.cloneNode(true);
      paperBox.classList.add('kh-statement-box--paper');
      paperBox.setAttribute('aria-hidden', 'true');
      paperBox.querySelectorAll('[id]').forEach((n) => n.removeAttribute('id'));
      const chapter = win.querySelector('.kh-chapter');
      win.insertBefore(paperBox, chapter || null);
    }
    const thumbs = [...row.children].filter((n) => n.classList.contains('kh-sat') || n === slot);
    root.style.setProperty('--kh-n', thumbs.length);

    // Fit the statement: a line that would not fit is set smaller (one factor for every line, both copies,
    // live and finished). Natural widths come from the font itself, so wrapping in the finished composition
    // does not hide them. Returns the factor in use.
    const inkLines = [...inkBox.querySelectorAll('.kh-line')];
    const statementEl = inkBox.querySelector('.kh-statement') || inkBox;
    root.style.setProperty('--kh-lines', Math.max(1, inkLines.length));
    // each line's paper copy: the line's own words in data-paper, drawn by the CSS as .kh-in::after (generated
    // content, so the heading's text, find-in-page and screen readers have each line once). While the scene runs
    // it is clipped to the window (--kh-veil), so the line is recoloured in place
    const lines = inkLines.map((line) => {
      const inn = line.querySelector('.kh-in') || line;
      inn.dataset.paper = textOf(inn).replace(/\s+/g, ' ').trim();
      return { line, inn };
    });
    const fit = (phone) => {
      const W = stageEl.clientWidth || root.clientWidth;
      if (!W || !inkLines.length) return 1;
      const now = parseFloat(root.style.getPropertyValue('--kh-fit')) || 1;
      let f = 1;
      try {
        const cs = getComputedStyle(statementEl), c = ctx2d();
        setFont(c, cs);
        const gutter = parseFloat(getComputedStyle(paperBox).paddingLeft) || Math.round(W * 0.03);
        const room = W - 2 * gutter - 2; // a little under, so the finished composition never wraps on a rounding
        for (const l of inkLines) {
          const natural = c.measureText(textOf(l).replace(/\s+/g, ' ').trim()).width / now; // at the CSS size
          const cap = Math.min(room, (phone ? LEAD_SHARE_PHONE : LEAD_SHARE) * W);
          if (natural > 0) f = Math.min(f, cap / natural);
        }
      } catch { return now; }
      f = clamp(Math.floor(f * 1000) / 1000, 0.5, 1);
      if (Math.abs(f - now) > 0.002) { if (f >= 0.999) root.style.removeProperty('--kh-fit'); else root.style.setProperty('--kh-fit', String(f)); }
      return f;
    };

    // the finished composition (reduced motion, a phone set to 'rest', a failed CDN) gets the same size; it
    // re-fits on resize, when fonts arrive and when reduced motion is switched on. (Checked by class rather than
    // through the stage's rest() alone: the stage does not call rest() for reduced motion on a desktop.)
    const restFit = () => { if (!root.classList.contains('is-live')) fit(window.matchMedia('(max-width: 767px)').matches); };
    const later = () => setTimeout(restFit, 0); // after the stage has switched classes
    window.addEventListener('resize', later, { passive: true });
    try { window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', later); } catch {}
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(restFit);

    // ---- the feature notes on a narrow or short screen ----
    // While the scene runs below 600px wide (or under 540px tall) the notes leave the stage, where four would not
    // fit at the picture's foot, and follow the picture in the page's flow: the script moves the list into
    // .kh-after at the foot of the section, the section grows by its height (--kh-after) and the stage lets go
    // that much earlier, so the list comes up under the picture as the stage scrolls on. Nothing is cut off.
    const features = win.querySelector('.kh-features');
    const listOut = window.matchMedia(LIST_OUT);
    let after = null, home = null, homeNext = null, sizer = null, running = false, queued = false;
    const refresh = () => {
      if (queued || !window.ScrollTrigger) return;
      queued = true;
      requestAnimationFrame(() => { queued = false; ScrollTrigger.refresh(); });
    };
    // the list's own height and the box's padding, never the box itself: the box's min-height is this number, so
    // measuring the box would hold it at its last height when the list gets shorter
    const sizeAfter = () => {
      let h = 0;
      if (after && after.isConnected && features.parentNode === after) {
        const cs = getComputedStyle(after);
        h = Math.ceil(features.getBoundingClientRect().height + (parseFloat(cs.paddingTop) || 0) + (parseFloat(cs.paddingBottom) || 0));
      }
      const v = h ? h + 'px' : '';
      if (v !== root.style.getPropertyValue('--kh-after')) {
        if (v) root.style.setProperty('--kh-after', v); else root.style.removeProperty('--kh-after');
        refresh();
      }
    };
    const place = () => {
      if (!features) return;
      const out = running && root.classList.contains('is-live') && listOut.matches;
      if (out && features.parentNode !== after) {
        if (!after) { after = document.createElement('div'); after.className = 'kh-after'; }
        home = features.parentNode; homeNext = features.nextSibling;
        after.appendChild(features);
        root.appendChild(after);
        root.classList.add('kh-list-after');
        if (window.ResizeObserver) { sizer = sizer || new ResizeObserver(sizeAfter); sizer.observe(features); }
      } else if (!out && after && features.parentNode === after) {
        home.insertBefore(features, homeNext && homeNext.parentNode === home ? homeNext : null);
        after.remove();
        root.classList.remove('kh-list-after');
        if (sizer) sizer.disconnect();
      }
      sizeAfter();
    };
    try { listOut.addEventListener('change', place); } catch {}

    const Stage = window.Stage;
    if (window.ScrollTrigger) ScrollTrigger.config({ ignoreMobileResize: true });
    const scrub = o.scrub === true || typeof o.scrub === 'number' ? (o.scrub === true ? true : clamp(o.scrub, 0, 0.8)) : Stage.lenis ? true : 0.5;

    const build = (tl, ctx) => {
      const { stage } = ctx;
      if (!lines.length) return;
      running = true;
      place();
      const slotAt = thumbs.indexOf(slot);
      const sats = thumbs.filter((t) => t !== slot).map((el) => {
        const i = thumbs.indexOf(el);
        return { el, side: i < slotAt ? 1 : -1, k: Math.abs(i - slotAt), t: writer(el, '--kh-t'), o: writer(el, '--kh-o') };
      });
      const media = win.querySelector('.kh-media');
      const shade = win.querySelector('.kh-shade');
      const items = features ? [...features.children] : [];
      const note = win.querySelector('.kh-note');
      const video = media && media.querySelector('video');
      const hold = ctx.phone ? o.phoneHold : o.hold;

      const w = {
        clip: writer(win, '--kh-clip'), winO: writer(win, '--kh-win-o'), // its own name: --kh-o would be inherited by the notes
        media: media ? writer(media, '--kh-t') : () => {},
        row: writer(row, '--kh-t'),
        // each line of the statement: its place, its ink (clear once the line lies wholly on the picture) and
        // its paper copy's clip
        lines: lines.map((l) => ({ t: writer(l.line, '--kh-t'), ink: writer(l.inn, 'color'), veil: writer(l.inn, '--kh-veil') })),
        shade: shade ? writer(shade, '--kh-o') : () => {},
        band: features ? writer(features, '--kh-band') : () => {},
        items: items.map((li) => ({ t: writer(li, '--kh-t'), o: writer(li, '--kh-o') })),
        note: note ? { t: writer(note, '--kh-t'), o: writer(note, '--kh-o'), top: writer(note, '--kh-note-top') } : null,
      };

      // proxies: normalised values the timeline drives; render() turns them into geometry and styles
      const radius0 = () => parseFloat(getComputedStyle(win).getPropertyValue('--kh-radius')) || 0;
      const A = { v: 0 }, K = { v: 0 }, E = { v: 0 }, R = { v: radius0() }, M = { v: 0 }, F = { v: 1 }, S = { v: 0 }, B = { v: 0 }, N = { v: 0 };
      const I = items.map(() => ({ v: 0 }));
      const V = thumbs.map(() => ({ v: 0 })); // entry reveal, one per thumbnail
      const D = { v: 0 }; // the scroll's own progress; the scene's timeline is played from it (see render)

      // geometry, measured on every refresh (offsets ignore transforms)
      let g = null;
      const offset = (el) => { let x = 0, y = 0; for (let n = el; n && n !== stage; n = n.offsetParent) { x += n.offsetLeft; y += n.offsetTop; } return { x, y }; };
      const measure = () => {
        const W = stage.clientWidth, H = stage.clientHeight;
        if (!W || !H) return null;
        fit(ctx.phone); // before anything is read: it may change the statement's size
        const tw = slot.offsetWidth, th = slot.offsetHeight;
        const so = offset(slot);
        const next = thumbs[slotAt + 1] || thumbs[slotAt - 1];
        const gap = next ? Math.abs(next.offsetLeft - slot.offsetLeft) - tw : 12;
        const gutter = parseFloat(getComputedStyle(paperBox).paddingLeft) || Math.round(W * 0.03);
        // each line: where it is at rest and where it settles (flush left at the gutter, the statement's top at
        // the heading's height, so the centred lines only slide across into a heading set flush left)
        const top0 = offset(lines[0].line).y;
        const L = lines.map((l) => {
          const lo = offset(l.line), ib = inkBounds(l.line), vo = offset(l.inn);
          return {
            dx: gutter - lo.x, dy: o.heading * H - top0,
            // the inked box at rest (where its glyphs actually paint), in stage pixels
            lx: lo.x + ib.x, ly: lo.y + ib.y, lw: ib.w, lh: ib.h,
            // its paper copy's box at rest (the ::after fills .kh-in)
            vx: vo.x, vy: vo.y, vw: l.inn.offsetWidth, vh: l.inn.offsetHeight,
          };
        });
        const noteGap = parseFloat(getComputedStyle(root).getPropertyValue('--kh-note-gap')) || 24;
        // with the notes in the page's flow the section is longer than the hold by their height: the scene is
        // played out by the time the stage lets go (fin), its last beats (the notes) being in the flow instead
        const extra = after && features && features.parentNode === after ? parseFloat(root.style.getPropertyValue('--kh-after')) || 0 : 0;
        const fin = extra > 0 ? (hold * H) / (hold * H + extra) : 1;
        return {
          W, H, tw, th, gap, cx0: so.x + tw / 2, cy0: so.y + th / 2,
          s0: Math.min(1, 1.3 * Math.max(tw / W, th / H)),
          L,
          // the note sits under the settled heading, whatever its line height
          noteTop: o.heading * H + statementEl.offsetHeight + noteGap,
          sx: sats.map((n) => offset(n.el).x), // each neighbour's left edge at rest
          fin, span: extra > 0 ? 0.8 : 1,
          navY: nav ? navLine() : 0,
        };
      };

      const nav = o.nav ? document.querySelector(o.nav) : null;
      let navDark = false, pastNav = false;
      const navLine = () => { const r = nav.getBoundingClientRect(); return Math.max(0, r.top + r.height / 2); };
      const setNav = (d) => { if (nav && d !== navDark) { navDark = d; nav.classList.toggle('is-on-dark', d); } };

      // ---- the scene's timeline (positions and durations are fractions of the hold) ----
      // It is paused and played from the scroll's progress D in render(), so that with the notes in the page's
      // flow it can end as the stage lets go. Shaped curves inside the scrub (power1 = quadratic, power2 = cubic
      // in GSAP's names). Only proxies are tweened, never the page's elements, so a refresh cannot leave a
      // half-applied style behind.
      const scene = gsap.timeline({ paused: true, defaults: { ease: 'none' } });
      const ft = (target, from, to, at, dur, ease = 'none') => scene.fromTo(target, { v: from }, { v: to, duration: dur, ease, immediateRender: false }, at);
      // the close starts at once: the keyhole grows over its neighbours as they slide in under it, fast at first,
      // so the picture covers more of the stage at every step; it rises (the row rides on it) and reaches full
      // bleed at 0.66
      ft(A, 0, 1, 0.02, 0.4, 'power1.inOut');       // the neighbours slide in under the keyhole
      ft(E, 0, 1, 0.02, 0.64, 'power1.out');        // window growth and media scale
      ft(K, 0, 1, 0.02, 0.56, 'power1.inOut');      // window rise (the row rides on it)
      scene.fromTo(R, { v: () => radius0() }, { v: 0, duration: 0.16, ease: 'power1.in', immediateRender: false }, 0.5); // radius and inset reach 0 together at 0.66
      ft(M, 0, 1, 0.12, 0.54, 'power2.inOut');      // the statement slides across into the heading, flush left
      ft(F, 1, 0, 0.36, 0.06);                      // guard: the neighbours are already covered by the window
      ft(S, 0, 1, 0.05, 0.12);                      // flat scrim on before the statement reaches the picture
      ft(B, 0, 1, 0.74, 0.1, 'power2.out');         // the band rises from the foot of the picture
      // the notes that are shown (CSS keeps any past the fourth for screen readers) rise one after another by 0.94
      const shown = Math.max(1, items.filter((li) => li.offsetWidth > 2).length);
      const each = shown > 1 ? Math.min(0.025, 0.075 / (shown - 1)) : 0;
      I.forEach((P, i) => ft(P, 0, 1, 0.76 + Math.min(i, shown - 1) * each, 0.11, 'power2.out'));
      if (note) ft(N, 0, 1, 0.71, 0.08, 'power2.out');
      if (scene.duration() < 1) scene.to({}, { duration: 1 - scene.duration() }, scene.duration());

      let reveal = null;
      const render = () => {
        if (!g) g = measure();
        if (!g) return;
        scene.progress(clamp((D.v * g.span) / g.fin, 0, 1));
        if (reveal && reveal.progress() < 1 && D.v > 0) reveal.progress(1);
        const { W, H, tw, th, gap, cx0, cy0, s0 } = g;
        const k = K.v, e = E.v, m = M.v;
        const vSlot = V[slotAt].v;

        // the window: grows (e), rises (k), loses its radius last (R); the media is centred on it and zooms with it.
        // It grows faster than it rises, so for a while its foot runs past the bottom of the stage.
        const cy = cy0 + (H / 2 - cy0) * k + 16 * (1 - vSlot);
        const cx = cx0 + (W / 2 - cx0) * k;
        const ww = tw + (W - tw) * e, hh = th + (H - th) * e;
        const s = s0 + (1 - s0) * e;
        const top = Math.max(0, cy - hh / 2), bottom = Math.max(0, H - cy - hh / 2);
        const left = Math.max(0, cx - ww / 2), right = Math.max(0, W - cx - ww / 2);

        // neighbours slide in under the keyhole and shrink a little about their inner edge, while the growing
        // window covers them; the row rides up with the keyhole (same lift, same centre), so the window always
        // stays seated on it and the neighbours never rise above its top edge. The last strip of a neighbour the
        // window has nearly covered fades as it narrows, so no frame shows a sliver beside the window.
        const slide = A.v, sc = 1 - 0.12 * A.v;
        sats.forEach((n, j) => {
          const v = V[thumbs.indexOf(n.el)].v;
          const shift = n.side * n.k * (tw + gap) * slide;
          const inner = n.side > 0 ? g.sx[j] + tw + shift : g.sx[j] + shift; // the edge the scale keeps in place
          const lo = n.side > 0 ? inner - tw * sc : inner, hi = n.side > 0 ? inner : inner + tw * sc;
          const seen = n.side > 0 ? Math.min(hi, left) - Math.max(lo, 0) : Math.min(hi, W) - Math.max(lo, W - right);
          n.t(`translate3d(${px(shift)}px,${px(16 * (1 - v))}px,0) scale(${px(sc * 1000) / 1000})`);
          n.o(String(px(F.v * v * clamp((seen - 12) / 48, 0, 1))));
        });
        w.row(`translate3d(0,${px((H / 2 - cy0) * k)}px,0)`);
        const r = top + bottom + left + right < 0.5 ? 0 : R.v;
        w.clip(`inset(${px(top)}px ${px(right)}px ${px(bottom)}px ${px(left)}px round ${px(r)}px)`);
        w.winO(String(px(vSlot)));
        w.media(`translate3d(${px(cx - W / 2)}px,${px(cy - H / 2)}px,0) scale(${Math.round(s * 10000) / 10000})`);
        w.shade(String(px(S.v)));

        // the statement becomes the heading whole, word for word: each line slides from centred to flush left
        // at the gutter. Its paper copy shows exactly where the window lies behind it (the same rectangle and
        // corners, in its own coordinates), so the window's edge recolours the line instead of passing over it
        g.L.forEach((q, i) => {
          const lw_ = w.lines[i];
          lw_.t(`translate3d(${px(q.dx * m)}px,${px(q.dy * m)}px,0)`);
          const vx = q.vx + q.dx * m, vy = q.vy + q.dy * m;
          // a line wholly on the window is set in paper itself and its copy is put away, so no ink fringe lines
          // the paper letters; it goes back to ink and copy if the line ever leaves the window
          const gx = q.lx + q.dx * m, gy = q.ly + q.dy * m;
          const within = vSlot >= 1 && gx >= left && gx + q.lw <= W - right && gy >= top && gy + q.lh <= H - bottom;
          lw_.veil(vSlot > 0 && !within ? `inset(${px(top - vy)}px ${px(vx + q.vw - (W - right))}px ${px(vy + q.vh - (H - bottom))}px ${px(left - vx)}px round ${px(r)}px)` : 'inset(100%)');
          lw_.ink(within ? 'var(--kh-paper)' : '');
        });

        // the chapter: the band rises from the foot, the note and the feature notes rise into place
        w.band(String(px(B.v)));
        items.forEach((li, i) => { const v = I[i].v; w.items[i].o(String(px(v))); w.items[i].t(`translate3d(0,${px(24 * (1 - v))}px,0)`); });
        if (w.note) { w.note.top(px(g.noteTop) + 'px'); w.note.o(String(px(N.v))); w.note.t(`translate3d(0,${px(8 * (1 - N.v))}px,0)`); }
        if (nav) setNav(!pastNav && vSlot >= 1 && top <= g.navY);
      };

      // the scrubbed timeline itself only carries the scroll's progress
      tl.fromTo(D, { v: 0 }, { v: 1, duration: 1, ease: 'none', immediateRender: false }, 0);
      tl.eventCallback('onUpdate', render);

      // ---- entry reveal, time-based, before the hold: the statement rises out of its masks, the row settles ----
      const ins = inkBox.querySelectorAll('.kh-in');
      reveal = gsap.timeline({ paused: true, onUpdate: render });
      reveal.fromTo(ins, { yPercent: 100, skewY: 5 }, { yPercent: 0, skewY: 0, duration: 0.9, ease: 'expo.out', stagger: 0.1 }, 0);
      const order = [slot, ...sats.slice().sort((a, b) => a.k - b.k).map((s) => s.el)];
      order.forEach((el, i) => reveal.to(V[thumbs.indexOf(el)], { v: 1, duration: 0.6, ease: 'power2.out' }, 0.2 + i * 0.06));
      // it starts as the statement itself comes into view, so it is seen, and it is done long before the hold
      // (measured from the section top: the statement sits inside the sticky stage, which ScrollTrigger cannot offset)
      ScrollTrigger.create({ trigger: root, start: () => 'top+=' + Math.round(statementEl.offsetTop + inkBox.offsetTop) + ' 92%', once: true, onEnter: () => reveal.play() });

      // ---- side jobs: re-measure on every refresh, play the one video only while the scene is on screen ----
      let alive = true;
      ScrollTrigger.create({
        trigger: root, start: 'top bottom', end: 'bottom top',
        onRefresh: () => { g = null; scene.invalidate(); render(); },
        onToggle: (self) => {
          if (!video) return;
          // never rewound, and left alone once the visitor has paused it (the page's control sets data-paused)
          if (self.isActive && !video.hasAttribute('data-paused')) { const p = video.play(); if (p && p.catch) p.catch(() => {}); } else video.pause();
        },
      });
      // a fixed nav turns light while the window lies under it (and the notes' dark ground after it, when they
      // follow in the flow), and back once the section has gone past it
      if (nav) {
        ScrollTrigger.create({
          trigger: root, start: () => 'bottom top+=' + Math.round(navLine()),
          onEnter: () => { pastNav = true; setNav(false); },
          onLeaveBack: () => { pastNav = false; render(); },
        });
      }
      // what the timeline does not own is put back by hand when the scene stops (reduced motion turned on, a resize to 'rest')
      gsap.context(() => () => {
        alive = false; running = false; setNav(false); if (video) video.pause();
        scene.kill();
        // the finished composition shows the statement in ink again (the paper copies are not drawn there), and
        // the notes go back into the picture
        for (const l of lines) { l.inn.style.removeProperty('color'); l.inn.style.removeProperty('--kh-veil'); }
        place();
      });
      const again = () => { if (alive) { g = null; render(); } };
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(again);
      const pics = [...root.querySelectorAll('.kh-media img, .kh-sat img')].filter((i) => !i.complete);
      Promise.all(pics.map((i) => i.decode().catch(() => {}))).then(again);
      render();
    };

    const mm = Stage.scene(root, {
      hold: o.hold,
      scrub,
      build,
      phone: o.phone === 'rest' ? 'rest' : { hold: o.phoneHold, build },
      rest: restFit,
    });
    restFit();
    return mm;
  }

  window.Scenes = window.Scenes || {};
  window.Scenes[ID] = make;
})();

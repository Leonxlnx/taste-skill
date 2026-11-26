// assets/scenes/page-lifts-off-closing-picture/classic.js - the 2.4 scene file, kept as it was; scene.js loads it through classic/classic.js.
// tasteskill / scenes / page-lifts-off-closing-picture.js — "Page lifts off a closing picture".
//
// A closing scene. The last content section slides up like a sheet and uncovers a picture that was
// held underneath it the whole time; it leaves at its full width in its own ground colour (lift 1, dim
// 0 by default since round 10: a sheet that shrank and dimmed ended as a flat grey slab with gutters of
// sky either side). As the sheet clears the screen the picture settles from a close
// zoom (1.35x) to its natural framing, and it lands exactly as the scroll runs out. A solid band across
// the top of the screen (about 30%) carries the closing line, a headline at display size, and the
// contact block in the body face;
// its colour is the picture's own top-edge colour, so band and picture meet with no seam. The whole
// picture is the page's one action: a link with a plain centred label at its foot.
// The picture is a photograph, or a fragment of the product's interface built in HTML (data-ui) and
// shown the same way: full bleed, a close crop at the product's true size, its app bar in the band's
// colour.
//
// Needs gsap + ScrollTrigger (no SplitText), stage.js and page-lifts-off-closing-picture.css.
//
// ── DOM ───────────────────────────────────────────────────────────────────────────────────────────
// <section class="lifting-sheet">…the last content section, a screen tall or more…</section>
// <section class="scene" data-scene="page-lifts-off-closing-picture" data-options='{}'
//          aria-labelledby="close-title">
//   <div class="scene-stage">
//     <div class="lift">
//       <div class="lift-band">
//         <h2 class="lift-title" id="close-title">The closing line, 3-7 words</h2>
//         <div class="lift-contact">                            1-3 short paragraphs, body size
//           <p>Name<br>Street, town</p>
//           <p><a href="mailto:…">address@domain</a><br><a href="tel:…">phone</a></p>
//         </div>
//       </div>
//       <a class="lift-picture" href="…the one action…">
//         photo:  <img class="lift-media" src srcset sizes="130vw" width height alt loading="eager">
//                 2400px wide or more, an even top edge (sky, fog, a wall, a table top), the subject
//                 in its lower half
//         ui:     <div class="lift-media my-screen" data-ui role="img" aria-label="what the screen shows">
//                   …a close crop of the product, full bleed: an app bar in var(--lift-band-c), then two
//                   to four rows at true size (labels 14px or more at 1440), side padding
//                   var(--lift-ui-inset). Its words end in the top ~37% of the stage (about 330px at
//                   1440x900): the rest is the product's own empty surface, where the label sits, so no
//                   word ever passes under the label while the crop settles…</div>
//         <span class="lift-label">Action, 1-3 words</span>
//       </a>
//     </div>
//   </div>
// </section>
// <footer>…the page's designed footer, a section of its own: it follows the finished frame…</footer>
//
// ── Options (data-options JSON; a value that is not a number or not known falls back) ──────────────
//   mode         'photo' | 'ui'   default: 'ui' when .lift-media carries data-ui, else 'photo'
//   settle       1.35  (1.1-1.5)   the picture's scale while the sheet still covers it; 1 at the end
//   phoneSettle  1.18  (1.05-1.3)  the same below 768px (the same share of the move on a small screen)
//   lift         1     (0.9-1)     the sheet's scale as it leaves, about its lifting edge (1: none, the
//                                  default; under 1 its sides pull in and show gutters of the picture)
//   dim          0     (0-0.3)     how much the sheet darkens as it leaves (a brightness filter; 0, the
//                                  default: any dim turns the page's ground into a grey slab)
//   band         'auto' | 'token' | a CSS colour   (auto)
//                auto: the band takes the median colour of the photograph's top edge as it is cropped
//                at this screen (sampled from the picture: same-origin, or from a CDN that sends CORS
//                headers with crossorigin="anonymous" on the img), so the seam never shows. The CSS
//                token --lift-band is the colour before the picture has loaded, without script and when
//                the picture cannot be read: set it to the same sample at 1440x900.
//                token: always --lift-band (the default in ui mode, where it is also the stage's colour).
//                A dark band turns its words to --ground (data-band-tone="dark").
//   focus        CSS transform-origin of the settle, '50% 0%' (the top edge stays put, so the band
//                and the picture, or the interface's app bar, keep meeting on the same row of pixels)
//   label        'foot' | 'centre'   where the label sits on the picture (foot)
//   sheet        a selector for the section that lifts away (default: the element just before the scene)
//   foot         unset (the default): the scene ends at its own bottom and the page's designed footer
//                follows it. A selector pulls that element up over the picture's foot, so the last pixel of
//                scroll is the settle's last frame: only for a page that ends on the scene with one plain
//                line, which a page dealt a footer never does.
//   scrub        true (default: locked to the scrollbar, the sheet is native scroll) | seconds 0.1-1
//   phone        'same' (default) | 'rest'
//
// ── Timing ───────────────────────────────────────────────────────────────────────────────────────
// The hold is the lift: the scene is pulled up under the sheet by the sheet's height (a screen at most),
// so the stage is held for exactly the scroll that takes the sheet's bottom edge from the foot of the
// screen to its top (1 screen; less only when the sheet is shorter than a screen). Over that hold:
//   0 → 1      the picture settles, settle → 1 (power1.out: it slows into its framing); the sheet moves
//              with the scroll, its edge exactly where the scroll puts it (with lift under 1 or dim over
//              0 it also shrinks about its bottom edge and darkens, linear)
//   each word  the label, the contact block and the closing line each land whole on a clock (a 0.32s
//              fade) once the sheet's edge has cleared their top, and go (0.12s) when the edge comes back
//              over it, so no line is ever drawn half under the edge or caught half faded; the closing
//              line, highest on the band, lands last, at about 0.88-0.9 (the band's words sit low in it)
// The picture's settle follows the scroll; only the words' fades run on a clock, so a visitor who stops
// halfway sees a still frame with every visible line whole.
//
// Phone (below 768px): the same lift, the picture held under the page with a gentler 1.18x settle. The
// band grows with its words (it never squeezes the contact block) and the interface crop drops to the
// columns that fit, inset so its words stay on screen at the start scale. Reduced motion, no script and
// a failed CDN: the finished composition, an
// ordinary section a screen tall, the band over the picture at rest, nothing hidden, nothing overlapping.
(() => {
  const ID = 'page-lifts-off-closing-picture';
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const num = (v, d, a, b) => { const n = typeof v === 'string' && v.trim() !== '' ? +v : v; return typeof n === 'number' && Number.isFinite(n) ? clamp(n, a, b) : d; };
  const r3 = (v) => Math.round(v * 1000) / 1000;

  // the median of each channel over a strip of the picture's top edge, as it is cropped on screen
  let cvs = null;
  const topEdge = (img, box) => {
    const W = box.clientWidth, H = box.clientHeight, nw = img.naturalWidth, nh = img.naturalHeight;
    if (!W || !H || !nw || !nh) return null;
    const cs = getComputedStyle(img);
    const fit = cs.objectFit;
    const k = fit === 'contain' ? Math.min(W / nw, H / nh) : fit === 'none' ? 1 : Math.max(W / nw, H / nh);
    const pos = (cs.objectPosition || '50% 50%').split(/\s+/);
    const at = (s, free) => (/%$/.test(s) ? (free * parseFloat(s)) / 100 : parseFloat(s) || 0);
    const ox = at(pos[0] || '50%', W - nw * k), oy = at(pos[1] || '50%', H - nh * k);
    const u0 = clamp(-ox / k, 0, nw), u1 = clamp((W - ox) / k, 0, nw), v0 = clamp(-oy / k, 0, nh - 1);
    const rows = clamp(6 / k, 1, nh - v0);
    if (u1 - u0 < 2) return null;
    cvs = cvs || document.createElement('canvas');
    cvs.width = 64; cvs.height = 2;
    const g = cvs.getContext('2d', { willReadFrequently: true });
    g.clearRect(0, 0, 64, 2);
    g.drawImage(img, u0, v0, u1 - u0, rows, 0, 0, 64, 2);
    const d = g.getImageData(0, 0, 64, 2).data;   // throws on a cross-origin picture: the token stays
    const ch = [[], [], []];
    for (let i = 0; i < d.length; i += 4) { ch[0].push(d[i]); ch[1].push(d[i + 1]); ch[2].push(d[i + 2]); }
    return ch.map((a) => a.sort((p, q) => p - q)[a.length >> 1]);
  };
  const luminance = ([r, g, b]) => {
    const f = (c) => { c /= 255; return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  };
  const parseColour = (s) => {
    const m = String(s).match(/rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/);
    return m ? [+m[1], +m[2], +m[3]] : null;
  };

  window.Scenes = window.Scenes || {};
  window.Scenes[ID] = (root, opts = {}) => {
    const $ = (s) => root.querySelector(s);
    const stage = root.querySelector(':scope > .scene-stage') || root.firstElementChild;
    const band = $('.lift-band'), picture = $('.lift-picture'), media = $('.lift-media'), label = $('.lift-label');
    if (!stage || !band || !picture || !media) {
      console.warn(`${ID}: needs .scene-stage with .lift-band, and .lift-picture holding .lift-media`);
      return Stage.scene(root, { build: null });
    }
    const isUi = opts.mode === 'ui' || (opts.mode !== 'photo' && (media.matches('[data-ui]') || !!media.querySelector('[data-ui]')));
    const o = {
      mode: isUi ? 'ui' : 'photo',
      settle: num(opts.settle, 1.35, 1.1, 1.5),
      phoneSettle: num(opts.phoneSettle, 1.18, 1.05, 1.3),
      lift: num(opts.lift, 1, 0.9, 1),
      dim: num(opts.dim, 0, 0, 0.3),
      band: typeof opts.band === 'string' && opts.band.trim() ? opts.band.trim() : 'auto',
      focus: typeof opts.focus === 'string' && opts.focus.trim() ? opts.focus.trim() : '50% 0%',
      label: opts.label === 'centre' || opts.label === 'center' ? 'centre' : 'foot',
      sheet: typeof opts.sheet === 'string' ? opts.sheet.trim() : '',
      foot: typeof opts.foot === 'string' ? opts.foot.trim() : '',
      phone: opts.phone === 'rest' ? 'rest' : 'same',
    };
    const sv = num(opts.scrub, NaN, 0.1, 1);
    const scrub = Number.isFinite(sv) && opts.scrub !== true ? sv : true;
    root.dataset.lift = o.mode;
    root.dataset.liftLabel = o.label;
    root.style.setProperty('--lift-focus', o.focus);
    const img = o.mode === 'photo' ? (media.tagName === 'IMG' ? media : media.querySelector('img')) : null;

    // ── the band's colour: the picture's own top edge, or the page's token ─────────────────────────
    const paintBand = () => {
      let rgb = null;
      if (o.band === 'auto' && img && img.complete && img.naturalWidth) {
        try { rgb = topEdge(img, picture); } catch { rgb = null; }
      } else if (o.band !== 'auto' && o.band !== 'token') {
        const probe = document.createElement('i');
        probe.style.color = o.band;
        root.appendChild(probe);
        rgb = parseColour(getComputedStyle(probe).color);
        probe.remove();
      }
      if (rgb) root.style.setProperty('--lift-band-c', `rgb(${rgb[0]} ${rgb[1]} ${rgb[2]})`);
      else root.style.removeProperty('--lift-band-c');
      const now = parseColour(getComputedStyle(band).backgroundColor);
      root.dataset.bandTone = now && luminance(now) < 0.3 ? 'dark' : 'light';
    };
    if (img) {
      if (img.complete) paintBand(); else img.addEventListener('load', paintBand, { once: true });
      if (img.decode) img.decode().then(paintBand).catch(() => {});
    } else paintBand();
    let rt = 0;
    addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(paintBand, 120); });

    // ── the live layout: the sheet over the stage, the foot over its last pixels ──────────────────
    const S = { overlap: 0, H: 0, items: [], tl: null, sheet: null, foot: null, live: false };
    root.__lift = S;   // state, for inspection in devtools
    const sheetEl = () => {
      if (o.sheet) { try { return document.querySelector(o.sheet); } catch { return null; } }
      let e = root.previousElementSibling;
      while (e && /^(SCRIPT|STYLE|TEMPLATE|LINK)$/.test(e.tagName)) e = e.previousElementSibling;
      return e;
    };
    const footEl = () => { if (!o.foot) return null; try { return document.querySelector(o.foot); } catch { return null; } };
    const words = () => [label, ...band.querySelectorAll('.lift-title, .lift-contact > *')].filter(Boolean);

    const unhook = () => {
      if (S.sheet) { S.sheet.removeAttribute('data-lift-sheet'); S.sheet.classList.remove('lift-sheet-moving'); }
      if (S.foot) { S.foot.removeAttribute('data-lift-foot'); S.foot.style.removeProperty('--lift-tail'); }
      for (const el of words()) { el.style.opacity = ''; el.removeAttribute('data-lift-word'); }
      picture.style.clipPath = '';
      for (const p of ['--lift-overlap', '--lift-tail', '--lift-settle']) root.style.removeProperty(p);
      S.sheet = S.foot = null; S.items = []; S.live = false;
    };

    // Everything the scroll positions depend on: run before ScrollTrigger measures (refreshInit).
    const measure = () => {
      if (!S.live) return;
      const H = stage.clientHeight || innerHeight;
      S.H = H;
      const sheet = S.sheet;
      // the stage hides under the sheet's last screen; a sheet shorter than a screen gives a shorter
      // lift, and the hold shrinks with it so the settle still ends with the scroll
      let overlap = 0;
      if (sheet) {
        const mb = parseFloat(getComputedStyle(sheet).marginBottom) || 0;
        overlap = Math.min(H, sheet.offsetHeight);
        root.style.setProperty('--lift-overlap', Math.round(overlap + mb) + 'px');
      }
      S.overlap = overlap || H;
      root.style.setProperty('--hold', r3(clamp(S.overlap / H, 0.35, 1)));
      const tail = S.foot ? Math.min(Math.round(0.25 * H), S.foot.offsetHeight) : 0;
      root.style.setProperty('--lift-tail', tail + 'px');
      if (S.foot) S.foot.style.setProperty('--lift-tail', tail + 'px');
      // each word block shows once the sheet's edge has cleared its top (its state is kept across a
      // refresh, so re-measuring never replays a fade)
      const top0 = stage.getBoundingClientRect().top;
      S.items = words().map((el) => ({ el, top: el.getBoundingClientRect().top - top0, on: el.getAttribute('data-lift-word') || '' }));
      S.picTop = picture.getBoundingClientRect().top - top0;
      S.clip = NaN;
    };
    const map = (p) => {
      if (!S.live) return;
      const edge = S.overlap * (1 - p);              // the sheet's bottom edge on the stage, px from its top
      // a block is on once the edge has cleared its top; the fade itself is a CSS transition (a clock)
      for (const it of S.items) {
        const on = p >= 0.999 || it.top >= edge - 0.5 ? 'on' : 'off';
        if (on !== it.on) { it.on = on; it.el.setAttribute('data-lift-word', on); }
      }
      // ui: the shrinking sheet would show slivers of the interface's words in its side gutters; the
      // interface is drawn only below the sheet's edge, so the gutters show the band's flat colour
      if (o.mode === 'ui') {
        const c = Math.round(clamp(edge - S.picTop, 0, picture.offsetHeight));
        if (c !== S.clip) { S.clip = c; picture.style.clipPath = c > 0 ? `inset(${c}px 0 0 0)` : ''; }
      }
    };

    const build = (tl, ctx) => {
      const s0 = ctx.phone ? o.phoneSettle : o.settle;
      S.live = true;
      S.tl = tl;
      S.sheet = sheetEl();
      S.foot = footEl();
      if (S.sheet) S.sheet.setAttribute('data-lift-sheet', '');
      if (S.foot) S.foot.setAttribute('data-lift-foot', '');
      root.style.setProperty('--lift-settle', String(s0));
      measure();
      tl.fromTo(media, { scale: s0 }, { scale: 1, duration: 1, ease: 'power1.out' }, 0);
      // the sheet leaves: a little smaller about its lifting edge, a little darker
      if (S.sheet && (o.lift < 1 || o.dim > 0)) {
        tl.fromTo(S.sheet, { scale: 1, filter: 'brightness(1)', transformOrigin: '50% 100%' },
          { scale: o.lift, filter: `brightness(${r3(1 - o.dim)})`, duration: 1, ease: 'none' }, 0);
        const sheet = S.sheet;
        ScrollTrigger.create({ trigger: root, start: 'top top', end: 'bottom bottom', onToggle: (self) => sheet.classList.toggle('lift-sheet-moving', self.isActive) });
      }
      tl.eventCallback('onUpdate', () => map(tl.progress()));
      map(0);
      // when the stage's context reverts (a media change, reduced motion switched on), take this
      // scene's own writes with it
      if (window.gsap && gsap.context) gsap.context(() => () => unhook());
    };

    if (window.ScrollTrigger && !root.__liftWired) {
      root.__liftWired = true;
      ScrollTrigger.addEventListener('refreshInit', measure);
      ScrollTrigger.addEventListener('refresh', () => { if (S.live && S.tl) map(S.tl.progress()); paintBand(); });
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => ScrollTrigger.refresh()).catch(() => {});
      // the sheet's height decides the lift: a late picture or font in it moves every position
      if (window.ResizeObserver) {
        let seen = false, raf = 0;
        const ro = new ResizeObserver(() => {
          if (!seen) { seen = true; return; }
          cancelAnimationFrame(raf);
          raf = requestAnimationFrame(() => { if (S.live) ScrollTrigger.refresh(); });
        });
        const sh = sheetEl();
        if (sh) ro.observe(sh);
      }
    }

    return Stage.scene(root, {
      hold: 1,
      scrub,
      build,
      phone: o.phone === 'rest' ? 'rest' : 'same',
      rest: () => { unhook(); paintBand(); },
    });
  };
})();

// assets/scenes/one-figure-reforms/classic.js - the 2.4 scene file, kept as it was; scene.js loads it through classic/classic.js.
// tasteskill / scenes / one-figure-reforms.js — one window re-forms for every chapter.
// The stage holds still while one large window in the accent re-forms under the scroll and carries each
// chapter's content: a tall bar rounds into a disc, the disc rises into an arch, the arch draws in to a
// pill. The window's shapes are one family (rounded rectangles, clip-path inset() with round), so every
// frame between two of them is again a clean rounded rectangle: no lumps, no torn outlines, no free
// polygons. Each stop rests for about a third of its chapter's scroll. The window always carries a
// chapter's content (on a software page the product's own interface for that job, as an interface
// fragment; on a page with photographs, one photograph per chapter): as it sets off, that interface stays
// whole and rides the re-forming, and when the window is half re-formed it hands over to the next
// chapter's, whose small parts build in one by one while the window draws into its new shape, so it lands
// on a finished interface and rests on it whole. No frame shows an empty window or a half-built card at a
// rest. Beside it the chapter's name is set huge with one or two lines
// and one key figure; they change at the same moment, the old name and lines out, then the new ones in,
// never overlapping. One accent, never a colour per chapter; no counter, no index, no progress mark, no
// snap: the scrollbar tells the truth and slow wheel, keyboard and trackpad all work.
// Needs stage.css + stage.js, GSAP 3.15.0 and ScrollTrigger (see stage.js for the script tags).
//
// It is for three to five services, steps or product parts that should read as one thing changing
// identity. Two chapters make the hold pointless (the scene shows its finished composition); more than
// five make it long.
//
// DOM (the script adds nothing; it shapes .ofr-figure, places each pane, sizes each name, and measures the
// heading's foot and the tallest chapter into --ofr-head-b and --ofr-block-h):
//   <section class="scene" data-scene="one-figure-reforms" data-options='{"hold":2}' aria-labelledby="ofr-h">
//     <div class="scene-stage">
//       <h2 class="ofr-heading" id="ofr-h">Section heading, two lines at most</h2>
//       <div class="ofr-figure">                                     the one window
//         <div class="ofr-pane" data-shape="bar" data-ui role="img" aria-label="…">   one pane per chapter, in
//                                                                      order: the accent window is the
//                                                                      product's window (data-ui on the pane)
//           <div class="ui">…</div>                                    its interface for this job, straight on
//         </div>                                                       the accent, late parts marked data-build
//         <div class="ofr-pane" data-shape="disc"><img src="…" alt="…" width="…" height="…"></div>   or a photograph
//         …
//       </div>
//       <div class="ofr-chapters">
//         <article class="ofr-ch">                                   one per chapter, 3-5
//           <h3 class="ofr-word">Name</h3>                           one word of 3-7 letters, set huge
//           <p class="ofr-text">One or two lines, 10-20 words.</p>
//           <p class="ofr-aside"><b>25%</b> what it counts</p>       the one key figure of this stop
//         </article>
//         …
//       </div>
//     </div>
//   </section>
// data-shape (on the pane, or on the article when it has no pane): bar | disc | arch | pill | slab (a wide
// rounded slab, for a fifth chapter or wide content). Without it the chapters take bar, disc, arch, pill,
// slab in order. Give neighbours different outlines (bar beside disc, arch beside pill).
// Pane content: an interface fragment sits centred in the part of the shape a rectangle can fill
// without meeting a curve (the script sets --ofr-px, --ofr-py, --ofr-pw, --ofr-ph); size it for the
// narrowest shape it lands in (a pill leaves about 0.7 of its width), 14-16px text and labels, never
// under 14px (no initials in small discs), and let rows drop on phones. It sits straight on the accent:
// the pane carries data-ui (the window is the product's window), the fragment no card of its own (the CSS
// takes its surface off and sets it in --ofr-on-accent) and no filled rows, pills or bands, its parts set
// apart by space, size and weight (a card on the accent window, or boxes in it, is a box in a box: the
// inspector's framed-elements and boxed-list). Mark one or two of
// its parts data-build (or data-build="1", "2" to group them): they build in, in order, while the window
// draws into its shape, on room the fragment keeps free for them (a status line beside a status, a matched
// line under the total), never over its own words; the first chapter's are there from the start. Each
// pane is a different interface; never the same picture twice. A photograph (an <img> as the pane's only
// child) fills the whole window.
// Key figure: a real figure about the chapter (a rate, a time, a fee), never a restated line. It sits under
// the heading on wide screens, beside the name over its lines on a tablet held upright, above the name on a
// phone, and changes with the name.
//
// OPTIONS (data-options JSON) default, range
//   hold 2 (1.5-3)          screens the stage is held; 2 suits three or four chapters, 2.5 five
//                           (default 2, or 2.5 with five chapters)
//   phoneHold = hold        the same on phones
//   dwell 0.33 (0.2-0.5)    share of each chapter's scroll the window rests on its shape
//   swap 0.5 (0.35-0.65)    how far the window has re-formed when the names change
//   fit "each"              "each": every name as large as its column allows | "one": all at the size of
//                           the longest
//   scrub true with Lenis, else 0.5 (0-1)
//   phone "same"            "same" (one chapter at a time, the window smaller, above the words) | "rest"
// CSS custom properties: see one-figure-reforms.css.
//
// Before the pin: the stage scrolls in with the heading, the window and its first pane, the lines and the
// key figure; the names wait hidden (a giant name sliced by the bottom of the screen reads as broken) and
// rise in, timed, the moment the first name fits whole on the screen, so it is whole before the pin starts.
// Timeline (fractions of the hold): N rests and N-1 re-formings, each re-forming twice as long as a rest by
// default (dwell 0.33), so with four chapters the window rests 0-0.1, 0.3-0.4, 0.6-0.7, 0.9-1 and re-forms
// in between (sine.inOut). The chapter swaps when the window is half re-formed: the old name, lines and key
// figure fade out (0.12s), then the new ones rise in from the side the scroll is heading (0.5s), always to
// the chapter the scroll is in. At the same moment the panes hand over: the old pane, whole with its late
// parts, leaves (0.12s), then the new one rises in (0.45s), so an interface on the bare accent never lies
// on the words of the one before; two photographs overlap (the new from 0.04s), so a photographed window
// is never empty. Its data-build parts follow on a clock, one by one right behind it (0.05s after the
// pane starts in, then 0.07s apart, 0.28s each), while the window is still drawing into its shape;
// scrolling back, a pane returns whole. So the window lands on a finished composition and every rest
// holds it whole, from its first frame to its last, and a reader who stops mid re-form sees the
// interface whole about 0.5s after the swap; the first chapter is whole from the start.
// Phone: the same timeline, the window smaller above the words, each name fitted to the width.
// Reduced motion, no script, a failed CDN, or fewer than three chapters: the finished composition (every
// chapter as a row: its key figure, name and lines beside its own window, shape drawn with border-radius,
// content whole).
(() => {
  if (!window.Stage) return;
  const ID = 'one-figure-reforms';
  const ORDER = ['bar', 'disc', 'arch', 'pill', 'slab'];
  const OUT = 0.12, IN = 0.45;        // seconds: things leave, then arrive
  const OVERLAP = 0.04;               // seconds: a new photograph starts this soon after the old one sets off
                                      // (an interface waits until the old pane has gone: on the bare accent
                                      // two sets of words would lie on each other)
  const num = (v, d, lo, hi) => { const n = Number(v); return v === undefined || v === null || v === '' || !Number.isFinite(n) ? d : Math.min(hi, Math.max(lo, n)); };

  // ---- the family: rounded rectangles standing on the floor of the window's zone, centred across it.
  // Each gives its width, height and corner radii [tl, tr, br, bl] in px. No radius is more than half of
  // either side it touches, so the browser never rescales them, and any blend of two shapes is again a
  // clean rounded rectangle.
  const SHAPES = {
    bar(W, H) { const w = Math.min(W, Math.max(0.6 * H, W < H ? 0.66 * W : 0)); const r = Math.min(14, w / 2); return { w, h: H, r: [r, r, r, r] }; },
    pill(W, H) { const w = Math.min(W, H, Math.max(0.64 * H, W < H ? 0.7 * W : 0)); return { w, h: H, r: [w / 2, w / 2, w / 2, w / 2] }; },
    disc(W, H) { const d = Math.min(W, H); return { w: d, h: d, r: [d / 2, d / 2, d / 2, d / 2] }; },
    arch(W, H) { const w = Math.min(W, 0.82 * H); return { w, h: H, r: [w / 2, w / 2, 0, 0] }; },
    slab(W, H) { const h = Math.min(H, 0.62 * W); const r = Math.min(28, h / 2); return { w: W, h, r: [r, r, r, r] }; },
  };
  const shapeIn = (kind, W, H) => { const s = SHAPES[kind](W, H); return { ...s, x: (W - s.w) / 2, y: H - s.h }; };
  // the part of a shape a rectangle fills without meeting a curve: each side moves in by the pad, or by
  // (1 - 1/sqrt 2) of the larger radius at its two ends, whichever is more (a disc keeps its inscribed square)
  const safe = (s) => {
    const pad = Math.max(14, Math.min(32, 0.06 * Math.min(s.w, s.h)));
    const [tl, tr, br, bl] = s.r, k = 1 - Math.SQRT1_2;
    const t = Math.max(pad, k * Math.max(tl, tr)), b = Math.max(pad, k * Math.max(bl, br));
    const l = Math.max(pad, k * Math.max(tl, bl)), r = Math.max(pad, k * Math.max(tr, br));
    return { x: s.x + l, y: s.y + t, w: Math.max(0, s.w - l - r), h: Math.max(0, s.h - t - b) };
  };
  const lerp = (a, b, f) => a + (b - a) * f;
  const px = (v) => v.toFixed(1) + 'px';
  const inset = (s, W, H) => `inset(${px(s.y)} ${px(W - s.x - s.w)} ${px(H - s.y - s.h)} ${px(s.x)} round ${s.r.map(px).join(' ')})`;

  function build(tl, ctx, o) {
    const { root, stage, q } = ctx;
    const fig = root.querySelector('.ofr-figure');
    const wrap = root.querySelector('.ofr-chapters');
    const chapters = q('.ofr-ch');
    const N = chapters.length;
    if (!fig || !wrap || N < 2) return;
    const paneList = [...fig.querySelectorAll(':scope > .ofr-pane')];
    const panes = chapters.map((_, i) => paneList[i] || null);
    const words = chapters.map((c) => c.querySelector('.ofr-word'));
    const asides = chapters.map((c) => c.querySelector('.ofr-aside'));
    const photo = panes.map((p) => !!(p && p.querySelector(':scope > img, :scope > picture')));
    const kinds = chapters.map((c, i) => { const k = (panes[i] && panes[i].dataset.shape) || c.dataset.shape; return SHAPES[k] ? k : ORDER[i % ORDER.length]; });
    // the late parts of each pane, grouped by their data-build number (unnumbered: one step each, in order)
    const steps = panes.map((p, i) => {
      if (!p || photo[i]) return [];
      const groups = new Map();
      [...p.querySelectorAll('[data-build]')].forEach((el, i) => { const n = parseFloat(el.dataset.build); const key = Number.isFinite(n) ? n : 1000 + i; if (!groups.has(key)) groups.set(key, []); groups.get(key).push(el); });
      return [...groups.keys()].sort((a, b) => a - b).map((k) => groups.get(k));
    });

    // the plan: N rests and N-1 re-formings; a rest is o.dwell of its chapter's scroll
    const R = 1 / (N + ((N - 1) * (1 - o.dwell)) / o.dwell);
    const M = (R * (1 - o.dwell)) / o.dwell;
    const restAt = (k) => k * (R + M);
    const starts = Array.from({ length: N - 1 }, (_, k) => restAt(k) + R);
    // the moment each re-forming is o.swap of the way to its shape (the inverse of sine.inOut)
    const swaps = starts.map((s) => s + (M * Math.acos(1 - 2 * o.swap)) / Math.PI);
    // the late parts land on a clock right after their pane arrives at the swap, one by one, while the
    // window is still drawing into its shape: so the window lands on a finished interface and rests on it
    // whole, and wherever a reader stops (mid re-form too) the card is whole within a second. A rest that
    // opened on a half-built card was the frame a reader stops on. The first chapter's are there from the
    // start.
    // seconds: the first part after the pane starts in, then each next, and how long each takes (short, so
    // the card is whole about 0.3s after the swap, before a reader who stops there has looked)
    const BUILD0 = 0.05, BUILD_GAP = 0.07, BUILD_IN = 0.28;

    // geometry, measured from the layout once per refresh: each name fitted to its column, the room the
    // words take, then the shapes in the window's zone and each pane's place in its own shape
    let G = null;
    const heading = root.querySelector('.ofr-heading');
    const measure = () => {
      if (heading) root.style.setProperty('--ofr-head-b', heading.offsetTop + heading.offsetHeight + 'px');
      const col = wrap.clientWidth;
      const sizes = words.map((w, i) => {
        if (!w) return 0;
        w.style.removeProperty('--ofr-fit');
        const cap = parseFloat(getComputedStyle(w).fontSize) || 160;
        // when the lines stand beside the name (a tablet held upright), they keep their column
        const text = chapters[i].querySelector('.ofr-text');
        const beside = text && text.offsetLeft > w.offsetLeft + 4 ? (parseFloat(getComputedStyle(chapters[i]).getPropertyValue('--ofr-beside')) || 280) + 24 : 0;
        w.style.setProperty('--ofr-fit', '100px');
        const rg = document.createRange();
        rg.selectNodeContents(w);
        const nat = rg.getBoundingClientRect().width || w.scrollWidth || 1;
        return Math.max(28, Math.min(cap, (100 * (col - beside) * 0.98) / nat));
      });
      const one = Math.min(...sizes.filter(Boolean));
      words.forEach((w, i) => { if (w) w.style.setProperty('--ofr-fit', (o.fit === 'one' ? one : sizes[i]).toFixed(1) + 'px'); });
      // the tallest chapter, from its top line to the floor: a stacked window fills the height above it
      const block = Math.max(0, ...chapters.map((ch) => {
        const tops = [...ch.children].filter((e) => e.offsetParent).map((e) => e.offsetTop);
        return tops.length ? ch.clientHeight - Math.min(...tops) : 0;
      }));
      root.style.setProperty('--ofr-block-h', Math.ceil(block) + 'px');
      const W = fig.offsetWidth, H = fig.offsetHeight;
      const shapes = kinds.map((k) => shapeIn(k, W, H));
      panes.forEach((p, i) => {
        if (!p || photo[i]) return;
        const s = safe(shapes[i]);
        p.style.setProperty('--ofr-px', px(s.x));
        p.style.setProperty('--ofr-py', px(s.y));
        p.style.setProperty('--ofr-pw', px(s.w));
        p.style.setProperty('--ofr-ph', px(s.h));
      });
      return { W, H, shapes };
    };
    const geo = () => G || (G = measure());

    // the window: the current re-forming, every edge and radius blended
    const st = { m: 0 };
    const render = () => {
      const g = geo();
      const k = Math.max(0, Math.min(N - 2, Math.floor(st.m)));
      const f = Math.max(0, Math.min(1, st.m - k));
      const a = g.shapes[k], b = g.shapes[k + 1];
      const s = f <= 0 ? a : f >= 1 ? b : { x: lerp(a.x, b.x, f), y: lerp(a.y, b.y, f), w: lerp(a.w, b.w, f), h: lerp(a.h, b.h, f), r: a.r.map((v, j) => lerp(v, b.r[j], f)) };
      fig.style.clipPath = inset(s, g.W, g.H);
    };
    const forget = () => { G = null; };
    ScrollTrigger.addEventListener('refreshInit', forget);
    ScrollTrigger.addEventListener('refresh', render);

    for (let k = 0; k < N - 1; k++) {
      tl.fromTo(st, { m: k }, { m: k + 1, duration: M, ease: 'sine.inOut', immediateRender: false }, starts[k]);
    }

    const visible = (e) => e && +gsap.getProperty(e, 'opacity') > 0.02;
    const hide = (els) => { const list = els.filter(Boolean); if (list.length) gsap.set(list, { autoAlpha: 0 }); };

    // the late parts of a pane, all shown or all back, at once (any build on its way is stopped)
    const parts = (k, on) => { const list = steps[k].flat(); if (list.length) gsap.set(list, { autoAlpha: on ? 1 : 0, y: 0, overwrite: true }); };
    hide(steps.slice(1).flat(2));

    // one chapter at a time, swapped when the window is half re-formed. The name, lines and key figure go
    // out, then the new ones come in. The panes overlap instead: the old one stays whole until the new one
    // starts to arrive, so the window is never empty while it re-forms.
    let shown = 0;
    let swapTl = null;
    gsap.set(chapters, { autoAlpha: 0, y: 0 });
    gsap.set(chapters[0], { autoAlpha: 1 });
    hide(panes.slice(1));
    const swapTo = (c) => {
      const from = shown;
      shown = c;
      if (swapTl) swapTl.kill();
      chapters.forEach((ch, i) => { if (i !== from && i !== c) { hide([ch, panes[i]]); parts(i, false); } });
      const down = c > from;
      // the new pane comes in bare going on (its late parts land on a clock below), whole coming back
      parts(c, !down);
      const out = from !== c && visible(chapters[from]) ? chapters[from] : null;
      const paneOut = from !== c && visible(panes[from]) ? panes[from] : null;
      swapTl = gsap.timeline();
      if (out) swapTl.to(out, { autoAlpha: 0, y: down ? -10 : 10, duration: OUT, ease: 'power1.in' }, 0);
      const t = out ? OUT : 0;
      swapTl.fromTo(chapters[c], { autoAlpha: 0, y: 0 }, { autoAlpha: 1, duration: IN * 0.45, ease: 'power2.out', immediateRender: false }, t);
      // the name leads, its lines and key figure follow; each rises (or, scrolling back, drops) into place
      [...chapters[c].children].forEach((p, i) => swapTl.fromTo(p, { y: down ? 26 : -26 }, { y: 0, duration: 0.5, ease: 'power3.out', immediateRender: false }, t + i * 0.05));
      if (paneOut) {
        swapTl.to(paneOut, { autoAlpha: 0, duration: OUT, ease: 'power1.in' }, 0);
        swapTl.add(() => parts(from, false), OUT);
      }
      const p = panes[c];
      const pin = paneOut ? (photo[c] && photo[from] ? OVERLAP : OUT) : 0;
      if (p) swapTl.fromTo(p, { autoAlpha: 0, y: photo[c] ? 0 : 16 }, { autoAlpha: 1, y: 0, duration: photo[c] ? IN * 0.6 : IN, ease: photo[c] ? 'power1.out' : 'power3.out', immediateRender: false }, pin);
      // going on: its late parts land one by one just after it, on a clock, well before the window lands
      if (down) steps[c].forEach((group, j) => swapTl.fromTo(group, { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: BUILD_IN, ease: 'power3.out', immediateRender: false }, pin + BUILD0 + j * BUILD_GAP));
    };
    const H = 0.004;  // hysteresis around a swap point, so a scroll resting on it never flickers
    const current = (time) => { let c = 0; swaps.forEach((s, j) => { if (time >= s + (shown > j ? -H : H)) c = j + 1; }); return c; };

    tl.eventCallback('onUpdate', () => {
      render();
      const time = tl.time();
      const c = current(time);
      if (c !== shown) swapTo(c);
    });

    // before the pin: the names wait until the first one fits whole on the screen, then rise in (timed);
    // everything else scrolls in with the stage. yPercent, so it never fights the swaps' y
    const nameFoot = () => {
      geo();
      const w = words[0] || chapters[0];
      let y = w.offsetHeight;
      for (let e = w; e && e !== stage && e !== root; e = e.offsetParent) y += e.offsetTop;
      return y;
    };
    gsap.fromTo(words.filter(Boolean), { autoAlpha: 0, yPercent: 14 }, {
      autoAlpha: 1, yPercent: 0, duration: 0.6, ease: 'power3.out',
      scrollTrigger: { trigger: root, start: () => 'top ' + Math.round(innerHeight * 0.97 - nameFoot()) + 'px', toggleActions: 'play none none reverse', invalidateOnRefresh: true },
    });

    render();

    // whatever was written outside GSAP goes back when the stage reverts this build
    if (gsap.context) {
      gsap.context(() => () => {
        ScrollTrigger.removeEventListener('refreshInit', forget);
        ScrollTrigger.removeEventListener('refresh', render);
        if (swapTl) swapTl.kill();
        fig.style.removeProperty('clip-path');
        ['--ofr-head-b', '--ofr-block-h'].forEach((v) => root.style.removeProperty(v));
        panes.forEach((p) => p && ['--ofr-px', '--ofr-py', '--ofr-pw', '--ofr-ph'].forEach((v) => p.style.removeProperty(v)));
        words.forEach((w) => w && w.style.removeProperty('--ofr-fit'));
        const all = [...chapters, ...panes, ...asides, ...words, ...steps.flat(2), ...chapters.flatMap((ch) => [...ch.children])].filter(Boolean);
        gsap.killTweensOf(all);
        gsap.set(all, { clearProps: 'opacity,visibility,transform' });
      });
    }
  }

  window.Scenes = window.Scenes || {};
  window.Scenes[ID] = (root, opts = {}) => {
    const n = root.querySelectorAll('.ofr-ch').length;
    if (n < 3) return Stage.scene(root, { build: null, phone: 'rest' });
    const hold = num(opts.hold, n >= 5 ? 2.5 : 2, 1.5, 3);
    const o = {
      hold,
      phoneHold: num(opts.phoneHold, hold, 1.5, 3),
      dwell: num(opts.dwell, 1 / 3, 0.2, 0.5),
      swap: num(opts.swap, 0.5, 0.35, 0.65),
      fit: opts.fit === 'one' ? 'one' : 'each',
      scrub: opts.scrub === true ? true : opts.scrub !== undefined ? num(opts.scrub, 0.5, 0, 1) : Stage.lenis ? true : 0.5,
    };
    const run = (tl, ctx) => build(tl, ctx, o);
    return Stage.scene(root, {
      hold: o.hold,
      scrub: o.scrub,
      build: run,
      phone: opts.phone === 'rest' ? 'rest' : { hold: o.phoneHold, build: run },
    });
  };
})();

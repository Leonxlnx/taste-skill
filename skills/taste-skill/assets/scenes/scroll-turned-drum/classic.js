// assets/scenes/scroll-turned-drum/classic.js - the 2.4 scene file, kept as it was; scene.js loads it through classic/classic.js.
// tasteskill / scenes / scroll-turned-drum.js — a list of short names on the face of a horizontal drum.
//
// The scroll cranks the drum like a slot reel. The name on the front line turns to full ink while the
// others roll back into ghosted, foreshortened depth (CSS preserve-3d, no WebGL). Give every name a
// photograph and a second, larger drum of pictures takes the right of the screen, running off its edge, top
// and bottom. The two drums are geared: by default the pictures turn against the names (names roll up,
// pictures roll down), and each picture holds still while its name crosses the front line, then clicks over
// to the next one in a short turn (an intermittent, Geneva-style step), so every rest shows one whole picture.
// The journey has two ends: the first stop fills the right of the screen top to bottom and folds into the drum
// as the statement leaves, and once the last name is up its picture opens out of the drum to fill it again.
// With pictures, the front line carries the name and its picture and nothing else. Without them, the front
// name's detail rides beside it (and the count, only when count is asked for), never empty. Before the turn a
// two-line statement owns the empty upper half; after it, a closing line rises in with the scroll and its
// button arrives whole on its own (never half-faded, so it never reads as disabled where a scroll rests).
// Load after stage.js; the finished composition is the plain list below.
//
// DOM:
//   <section class="scene" data-scene="scroll-turned-drum" data-options='{"size":1}' aria-labelledby="drum-title">
//     <div class="scene-stage">
//       <header class="drum-head"><h2 class="drum-title" id="drum-title">Statement of two lines at most</h2></header>
//       <div class="drum-view">
//         <ol class="drum">
//           <li class="drum-item">
//             <span class="drum-name">Name</span>
//             <img src="..." srcset="... 900w, ... 1200w, ... 1600w" sizes="(max-width: 767px) 100vw, 50vw"
//                  width="900" height="600" alt="...">                          (landscape, of the named thing)
//           </li>
//           ...8-20 names read best (3 to 30 work); each 1-3 words, 22 characters at most. Either every name has
//           its own photograph (of that place, dish or room, the whole set in one grade) or every name has
//           <span class="drum-meta">a detail, five words at most</span> (a city, a year, a sector) and no picture.
//           Never a time or a date that steps with the names: beside the names it reads as a second readout.
//         </ol>
//       </div>
//       <div class="drum-close">                                   (optional; a lone <a class="drum-close"> works too)
//         <p class="drum-close-line">Closing line, seven words at most</p>
//         <a class="drum-button" href="#next">Button label</a>
//       </div>
//     </div>
//   </section>
// The script adds the detail (and the count, when asked; both aria-hidden) and, when every name has an <img>, the picture drum
// (aria-hidden copies; the pictures in the list keep their alt text). Each .drum-meta and <img> stays in the
// list, so a screen reader hears every name with its detail, in order. The copies keep the <img>'s srcset and
// sizes, so the browser picks the same file for both and downloads each picture once: give `sizes` for the
// picture drum's front picture, "(max-width: 767px) 100vw, 50vw". The two ends (first and last picture at
// full height, landscape screens) ask for a larger file of those two pictures, so give srcset a 1600w file.
//
// Options (data-options), defaults first:
//   hold         screens the stage is held for. Default 0.16 x names + 0.2, kept to 1.6-3.2   (1-4)
//   tempo        screens of scroll per name, used when hold is not given. 0.16                  (0.12-0.22)
//   scrub        true locks the drum to the scrollbar; a number is seconds of catch-up. Default true when
//                Stage.smooth() runs (Lenis already smooths), else 0.5. Read after the page's own script has
//                run, so Stage.smooth() and Stage.init() may come in either order.
//   size         multiplies the name size. 1 = about 10vw on a landscape screen, kept under 15.5% of
//                the height (139px at 1440x900), 15vw on a phone (58px at 390)                (0.7-1.4)
//   spacing      distance between neighbouring names, in name sizes. 1.03                       (0.9-1.3)
//   radius       drum radius as a share of the screen height. Default 0.5 (phone 0.34), smaller for
//                small names (3.6 name sizes, at least 0.3; 0.42 beside pictures) so it always curves (0.3-0.6)
//   depth        perspective as a multiple of the radius; lower bends the far names harder. 3  (2.5-8)
//   width        widest name allowed, in vw; long names come down in size. 56 (phone 82; beside pictures,
//                the column left of the picture drum, which gives up width to a long name first) (40-72)
//   ghost        opacity of the names beside the front. 0.32                                    (0.18-0.45)
//   ghostFar     opacity of the names near the top and bottom of the drum. 0.1                  (0.04-0.12)
//                (a name fades out before it is foreshortened to a fifth of its height, so the rim of the
//                drum never shows edge-on slivers)
//   highlight    'ink' (the front name in full ink) | 'accent' (the front name in --accent). 'ink'
//   count        show the count ("4 of 15"). false: a number that steps with every name reads as a progress
//                readout. true only where the position itself means something, never beside a picture drum
//   of           the word inside the count ("4 of 15"). "of"
//   pictures     true uses the pictures when every name has one; false ignores them. true
//   gear         'counter' (the pictures turn against the names, like meshed gears) | 'same'. 'counter'
//   pictureTurn  'step' (each picture holds while its name crosses the front line, then turns over in the
//                middle 40% of the step) | 'smooth' (the pictures turn with the names, all the time). 'step'
//   pictureStep  degrees between pictures on their drum; the drum turns that far per name.     36 (24-50)
//                (as a picture turns away it slides inside its face, so the strip of each neighbour beside the
//                front picture shows the photograph's middle, its horizon, not the plain sky along its edge)
//   ends         true: beside the names, the first picture starts filling the right of the screen and folds
//                into the drum (0-6% of the scene), and the last opens out of it (94-100%) | false. true
//   detent       settle on a name when the scroll comes to rest: on to the next name in the direction it was
//                moving once it has gone 30% of a name's step, else back. The first name rests only at the
//                scene's start and the last only at its end, never half-way through the statement leaving or
//                the closing line arriving. Default false; true for the picture drum under a wheel
//                (Stage.smooth). Without it the picture drum still finishes a half-made turn on its own once
//                the scroll rests, so a rest never shows two half pictures.
//   phone        'same' (the drum with phone numbers) | 'rest' (the finished list). 'same'
// Page tokens it takes: --ground, --ink, --accent (count number, accent highlight), --font-display.
// Layouts it picks on every refresh (root[data-layout]): 'side' the count and detail beside the front name,
// on its baseline, a fixed gap from the widest name; 'bottom' (phones, and screens where they do not fit
// beside it even at 20px) on a line at the foot of the screen; 'reel' the statement, names and closing in
// one centred column on the left, the picture drum on the right half (46vw, 62vh tall, off the right edge),
// the count and detail in a notch at the front picture's foot; 'stack' (phones, portrait screens) the
// picture drum turning behind a full-width window above the names, the count and detail at the foot.
// On a phone under 340px wide, or when the longest name cannot fit at 26px, the finished list shows.
(() => {
  const DEG = Math.PI / 180;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const num = (v, d) => (v === undefined || v === null || v === '' || Number.isNaN(+v) ? d : +v);
  const smoothstep = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  const make = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
  // A face's opacity at angle a from the front line, on a drum seen with perspective d x radius: near beside
  // the front, far at the rim. It follows the face's projected height against the front face's (its tilt,
  // its distance, and the perspective's squeeze away from the axis), so a face is gone before it shrinks to
  // a fifth of its height: no edge-on slivers at any depth.
  const ghost = (a, near, far, d) => {
    if (a >= 90 * DEG) return 0;
    const c = Math.cos(a), s = d / (d + 1 - c);
    const h = s * (c - (s * (1 - c * c)) / d);
    return (far + (near - far) * c * c) * smoothstep(0.2, 0.42, h);
  };
  // the picture drum's intermittent step: whole pictures for the outer 60% of each name step, the turn
  // over the middle 40% (eased in and out, like a Geneva drive)
  const PDEPTH = 2.4;   // the picture drum's perspective, in radii: a strong bend, so a turn reads as a drum
  const SLIDE = 0.4;    // how far a picture slides inside its face as it turns away, in face heights
  const geneva = (f) => { const k = Math.floor(f); return k + smoothstep(0.3, 0.7, f - k); };

  // Once per section: the captions on every face, the line at the foot, and a hidden ruler.
  function prepare(root, items, o) {
    const stage = root.querySelector(':scope > .scene-stage') || root.firstElementChild;
    const n = items.length;
    const of = ' ' + String(o.of ?? 'of') + ' ' + n;
    // off unless asked for: a number that steps with every name reads as a progress readout (house rule 7)
    const showCount = o.count === true && n > 1;
    // a name written straight into the <li> gets its .drum-name span (the layout uses it)
    for (const li of items) {
      if (li.querySelector('.drum-name')) continue;
      const span = make('span', 'drum-name');
      for (const node of [...li.childNodes]) if (!(node.nodeType === 1 && (node.classList.contains('drum-meta') || node.tagName === 'IMG' || node.tagName === 'PICTURE'))) span.appendChild(node);
      li.prepend(span, ' ');
    }
    const names = items.map((li) => li.querySelector('.drum-name').textContent.trim());
    const metas = items.map((li) => { const m = li.querySelector('.drum-meta'); return m ? m.textContent.trim() : ''; });
    const pics = items.map((li) => li.querySelector('img'));
    const withPics = o.pictures !== false && n > 1 && pics.every(Boolean);
    const countCap = (i, cls) => { const c = make('span', cls); c.append(make('span', 'drum-cap-now', String(i + 1)), make('span', 'drum-cap-of', of)); return c; };
    items.forEach((li, i) => {
      li.style.setProperty('--i', i);
      for (const old of li.querySelectorAll(':scope > .drum-cap')) old.remove();
      if (showCount) li.append(countCap(i, 'drum-cap drum-cap--count'));
      if (metas[i]) li.append(make('span', 'drum-cap drum-cap--detail', metas[i]));
      for (const c of li.querySelectorAll(':scope > .drum-cap')) c.setAttribute('aria-hidden', 'true');
      if (pics[i]) pics[i].classList.add('drum-pic');
    });
    // the line at the foot of the screen (phones, narrow screens): one count and one detail
    const slot = (cls) => {
      let el = stage.querySelector(':scope > .' + cls);
      if (!el) { el = make('p', cls); stage.appendChild(el); }
      el.setAttribute('aria-hidden', 'true');
      el.replaceChildren();
      return el;
    };
    const roller = (parent, cls) => { const mask = make('span', 'drum-roll'); const inner = make('span', cls); mask.appendChild(inner); parent.appendChild(mask); return inner; };
    let count = null, now = null, detail = null, text = null;
    if (showCount) { count = slot('drum-count'); now = roller(count, 'drum-count-now'); count.appendChild(make('span', 'drum-count-of', of)); }
    if (metas.some(Boolean)) { detail = slot('drum-detail'); text = roller(detail, 'drum-detail-text'); }
    let ruler = stage.querySelector(':scope > .drum-measure');
    if (!ruler) { ruler = make('div', 'drum-measure'); ruler.setAttribute('aria-hidden', 'true'); stage.appendChild(ruler); }
    ruler.replaceChildren(
      ...names.map((t) => make('span', 'drum-measure-name', t)),
      ...[showCount ? n + of : '', ...metas].filter(Boolean).map((t) => make('span', 'drum-measure-cap', t)),
    );
    const parts = {
      stage, names, metas, pics, count, now, detail, text, ruler, showCount, of,
      drum: root.querySelector('.drum'),
      head: root.querySelector('.drum-head'),
      close: root.querySelector('.drum-close'),
      reel: null, cards: [],
    };
    // The picture drum is built the first time the drum goes live (reduced motion never loads the copies).
    parts.ensureReel = () => {
      if (!withPics || parts.reel) return parts.reel;
      let view = stage.querySelector(':scope > .drum-pics');
      if (!view) { view = make('div', 'drum-pics'); stage.insertBefore(view, stage.querySelector(':scope > .drum-view')); }
      view.setAttribute('aria-hidden', 'true');
      const reel = make('div', 'drum-reel');
      view.replaceChildren(reel);
      parts.cards = pics.map((img, i) => {
        const card = make('figure', 'drum-card');
        card.style.setProperty('--i', i);
        // the copy keeps the original's src, srcset and sizes, so both pick the same file (one download)
        const copy = img.cloneNode(false);
        copy.removeAttribute('id'); copy.removeAttribute('class'); copy.removeAttribute('loading');
        copy.alt = '';
        copy.decoding = 'async';
        const cap = make('figcaption', 'drum-card-cap');
        if (showCount) cap.append(countCap(i, 'drum-card-count'));
        if (metas[i]) cap.append(make('span', 'drum-card-detail', metas[i]));
        card.append(copy);
        if (cap.childNodes.length) card.append(cap);
        reel.append(card);
        // a picture is shown once it is decoded, so it never pops in mid-turn; one that arrives while the
        // drum is on screen (a slow file, a reload mid-scene) eases in over the ground
        const ready = () => {
          card.classList.add('is-ready');
          if (copy.animate && parts.onScreen()) copy.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 400, easing: 'cubic-bezier(0.33, 1, 0.68, 1)' });
        };
        (copy.decode ? copy.decode() : Promise.resolve()).then(ready, ready);
        return card;
      });
      parts.reel = reel;
      return reel;
    };
    // The two ends (picture drum beside the names): the first and the last picture again, each laid out at the
    // size it has when it fills the right of the screen top to bottom. The first starts that way and folds into
    // the drum as the statement leaves; the last opens out of the drum once the last name is up. Built the
    // first time that layout shows; each asks for the larger file the full-height picture needs.
    parts.ensureEnds = () => {
      if (parts.ends || !parts.reel || o.ends === false) return parts.ends;
      parts.ends = [0, n - 1].map((i) => {
        let el = stage.querySelector(`:scope > .drum-end[data-end="${i}"]`);
        if (!el) { el = make('div', 'drum-end'); el.dataset.end = String(i); parts.reel.parentElement.after(el); }
        el.setAttribute('aria-hidden', 'true');
        const img = pics[i].cloneNode(false);
        img.removeAttribute('id'); img.removeAttribute('loading');
        img.className = 'drum-end-pic';
        img.alt = '';
        img.decoding = 'async';
        if (img.hasAttribute('srcset')) img.sizes = '100vw';
        const cap = parts.cards[i].querySelector('.drum-card-cap');
        const capCopy = cap ? cap.cloneNode(true) : null;
        if (capCopy) capCopy.removeAttribute('style');
        // the window clips the picture; the caption sits outside it, so its first letter is never shaved
        const win = make('div', 'drum-end-window');
        win.appendChild(img);
        el.replaceChildren(win, ...(capCopy ? [capCopy] : []));
        const end = { i, el, win, img, cap: capCopy, ready: false, failed: false };
        // (a file that fails leaves its end out: the drum shows that picture as it is)
        const ready = () => { end.ready = true; if (parts.onEndReady) parts.onEndReady(end); };
        const failed = () => { end.failed = true; if (parts.onEndReady) parts.onEndReady(end); };
        (img.decode ? img.decode() : Promise.resolve()).then(ready, failed);
        return end;
      });
      return parts.ends;
    };
    // whether the held stage is in view (only asked when a picture arrives, never per frame)
    parts.onScreen = () => {
      if (!root.classList.contains('is-live')) return false;
      const r = stage.getBoundingClientRect();
      return r.bottom > 0 && r.top < window.innerHeight;
    };
    return parts;
  }

  function build(tl, ctx, root, items, parts, o) {
    const { stage, phone } = ctx;
    const { drum, head, close, count, now, detail, text, ruler, metas } = parts;
    const reel = parts.ensureReel();
    const cards = parts.cards;
    const n = items.length;
    const near = clamp(num(o.ghost, 0.32), 0.18, 0.45);
    const far = clamp(num(o.ghostFar, 0.1), 0.04, 0.12);
    const depth = clamp(num(o.depth, 3), 2.5, 8);
    const gear = o.gear === 'same' ? 1 : -1;
    const stepTurn = o.pictureTurn !== 'smooth';
    const lit = items.map(() => ({ v: 0 }));
    // pk: the picture drum's position in pictures (from the scroll); off: the settle that finishes a half turn
    const off = { v: 0, parked: false, timer: 0 };
    // open: the phone's picture window opening up to the top of the screen as the statement leaves
    const open = { v: 0 };
    // the two ends (picture drum beside the names): how far each is open, 1 = filling the right of the screen
    // top to bottom; the first starts open and folds into the drum, the last opens out of it at the end
    const ends = [{ i: 0, v: 1, on: false, g: null, key: '', alpha: 1 }, { i: n - 1, v: 0, on: false, g: null, key: '', alpha: 1 }];
    // how far each end has eased in (1 = shown). An end whose file arrives while it is open on screen eases in
    // over the ground instead of popping over its picture at drum size.
    const show = [{ a: 1 }, { a: 1 }];
    const st = { t: 0, rot: 0, step: 0, spread: 0, pstep: 0, pk: 0, pv: 0, idx: -1, o: [], f: [], l: [], po: [], pc: [], pv2: [], ps: [], pg: null, hold: root.style.getPropertyValue('--hold'), fit: true, mode: '', clip: null };
    const accent = o.highlight === 'accent';
    root.dataset.highlight = accent ? 'accent' : 'ink';
    // Everything that changes per frame is a non-inherited registered property (see the .css) written on the
    // one element that uses it, so a frame restyles a handful of elements, not the whole drum.
    const nameEls = items.map((li) => li.querySelector('.drum-name'));
    const capEls = items.map((li) => [...li.querySelectorAll(':scope > .drum-cap')]);
    const capTexts = cards.map((card) => card.querySelector('.drum-card-cap'));
    const cardImgs = cards.map((card) => card.querySelector('img'));

    // a rebuild (desktop <-> phone) stops whatever the last build left running, and shows no end until asked
    if (root.__drum) root.__drum.kill();
    for (const E of parts.ends || []) { E.el.classList.remove('is-on'); E.el.style.opacity = ''; }
    root.__drum = { kill: () => { gsap.killTweensOf(lit); gsap.killTweensOf(off); gsap.killTweensOf(show); clearTimeout(off.timer); for (const el of [now, text]) if (el && el.__roll) el.__roll.cancel(); } };

    const isLive = () => root.classList.contains('is-live');
    const screenH = () => (isLive() ? stage.clientHeight : 0) || window.innerHeight;
    const nameRuler = [...ruler.querySelectorAll('.drum-measure-name')];
    const capRuler = [...ruler.querySelectorAll('.drum-measure-cap')];
    const px = (v) => v.toFixed(1) + 'px';

    // Geometry from the screen and the longest name; picks the layout.
    const layout = () => {
      const W = stage.clientWidth || window.innerWidth;
      const H = screenH();
      const size = clamp(num(o.size, 1), 0.7, 1.4);
      const portrait = W < 0.9 * H;
      const gutter = clamp(0.039 * W, 16, 56);
      let mode = reel ? (phone || portrait ? 'stack' : 'reel') : 'side';
      // landscape screens: about 10vw, kept under 15.5% of the height; portrait: the phone's share of the width
      let fs = (phone ? clamp(0.15 * W, 26, 64) : portrait ? clamp(0.1 * W, 28, 120) : clamp(Math.min(0.1 * W, 0.155 * H), 28, 180)) * size;
      let em = 0;
      for (const s of nameRuler) em = Math.max(em, s.offsetWidth / 100);   // the ruler sets names at 100px
      let cap = (clamp(num(o.width, phone ? 82 : 56), 40, phone ? 92 : 72) / 100) * W;
      let radius = clamp(num(o.radius, phone ? 0.34 : 0.5), 0.3, 0.6);
      let minR = 0.3;
      let y = 0.5 * H, ox = 0.5 * W;
      const pic = {};
      if (mode === 'reel') {
        // names centred in a column on the left, the drum seen from over its middle (so a name off the front
        // narrows evenly to both sides); the picture drum takes the right 46% of the screen and runs off its
        // right edge (and its neighbours off the top and bottom). A long name first comes down to 85% of its
        // size, then takes width from the pictures (down to 28% of the screen), and only then comes down more.
        const between = Math.max(48, 0.04 * W);
        const column = (pw) => W - gutter - between - pw;
        let pw = 0.46 * W;
        if (0.85 * em * fs > column(pw)) pw = Math.max(0.28 * W, column(0) - 0.85 * em * fs);
        // on a whole pixel, so the front picture, the ends' window and the notch share one crisp left edge
        pw = Math.round(pw);
        cap = column(pw);
        if (o.width != null) cap = Math.min(cap, (clamp(num(o.width, 56), 40, 72) / 100) * W);
        const cw = pw * 1.08, ch = 0.62 * H;
        Object.assign(pic, { w: cw, h: ch, x: W - pw + cw / 2, y, gap: 0.05 * H });
        ox = gutter + cap / 2;
        minR = 0.42;
        // the ends' window: the front picture's rectangle, open to the screen's full height and its right edge.
        // Each end's picture is laid out at its open size and scaled down onto the front picture when closed,
        // so it never shows enlarged past its file.
        (parts.ensureEnds() || []).forEach((E, k) => {
          const e = ends[k];
          const nw = E.img.naturalWidth || +E.img.getAttribute('width') || 3;
          const nh = E.img.naturalHeight || +E.img.getAttribute('height') || 2;
          const L0 = W - pw, s0 = Math.max(cw / nw, ch / nh), s1 = Math.max((W - L0) / nw, H / nh);
          const iw = nw * s1, ih = nh * s1, cx1 = (L0 + W) / 2, cy1 = H / 2;
          // the caption keeps a ground under its words at the foot of the screen: the notch reaches below the
          // window by that much (clipped) and lands with it on the screen's foot
          const pad = 0.75 * clamp(0.016 * W, 20, 26);
          e.g = { H, L0, T0: y - ch / 2, B0: y + ch / 2, dx: pic.x - cx1, dy: y - cy1, k0: s0 / s1, pad };
          Object.assign(E.img.style, { left: px(cx1 - iw / 2), top: px(cy1 - ih / 2), width: px(iw), height: px(ih) });
          if (E.cap) Object.assign(E.cap.style, { left: px(L0), top: 'auto', bottom: px(H - e.g.B0 - pad), paddingBottom: px(pad) });
          e.key = '';
        });
      } else if (mode === 'stack') {
        // a full-width picture window in the upper half: under the statement at the start, opened up to the
        // top of the screen as the statement leaves; the names between it and the line at the foot
        const top = 0.145 * H;
        const bottom = top + Math.min(W / 1.4, 0.36 * H);
        Object.assign(pic, { w: W, h: bottom, x: W / 2, y: bottom / 2, gap: 0.04 * H, top });
        const zoneTop = bottom + 16, zoneBottom = 0.88 * H;
        y = (zoneTop + zoneBottom) / 2;
        radius = Math.min(radius, (zoneBottom - zoneTop) / 1.9 / H);
      }
      if (em * fs > cap) fs = cap / em;
      const floor = phone ? 26 : 24;
      st.fit = fs >= floor - 0.01 && !(phone && W < 340);
      fs = Math.max(fs, floor);
      // the count and detail: beside the front name when they fit there (they come down to 20px first,
      // then the names by at most a fifth), else on a line at the foot of the screen
      let capFs = phone ? 15 : clamp(0.016 * W, 20, 26);
      let capEm = 0;
      for (const s of capRuler) capEm = Math.max(capEm, s.offsetWidth / 100);
      const gap = Math.max(28, 0.022 * W);
      const room = (f) => (W - Math.min(cap, em * f)) / 2 - gap - gutter;
      if (mode === 'side' && capEm) {
        if (phone) mode = 'bottom';
        else if (room(fs) < capEm * capFs) {
          capFs = Math.max(20, room(fs) / capEm);
          if (room(fs) < capEm * capFs) {
            const f2 = (W - 2 * (gutter + gap + capEm * capFs)) / em;
            if (f2 >= 0.8 * fs && f2 >= 40) fs = f2; else mode = 'bottom';
          }
        }
      } else if (mode === 'side' && phone) mode = 'bottom';
      // spacing first: a long list gets a larger drum, then smaller names, so names never crowd
      const spacing = clamp(num(o.spacing, 1.03), 0.9, 1.3);
      const capStep = n > 1 ? (250 * DEG) / (n - 1) : 0;
      // smaller names get a smaller drum (down to 0.3 of the screen), so the reel still visibly curves
      let R = o.radius == null ? Math.min(radius * H, Math.max(minR * H, 3.6 * fs)) : radius * H;
      if (n > 1 && (spacing * fs) / R > capStep) {
        R = Math.min((mode === 'stack' ? 0.26 : 0.62) * H, (spacing * fs) / capStep);
        if ((spacing * fs) / R > capStep) fs = Math.max(0.9 * floor, (capStep * R) / spacing);
      }
      st.step = n > 1 ? Math.min((spacing * fs) / R, capStep) : 0;
      st.spread = st.step * (n - 1);
      const band = Math.min(cap, em * fs);
      const set = (k, v) => root.style.setProperty(k, v);
      set('--drum-fs', px(fs));
      set('--drum-r', px(R));
      set('--drum-persp', px(depth * R));
      set('--drum-step', (st.step / DEG).toFixed(4) + 'deg');
      set('--drum-band', px(band));
      set('--drum-gap', px(gap));
      set('--drum-cap-fs', px(capFs));
      set('--drum-y', px(y));
      set('--drum-ox', px(ox));
      set('--drum-names-w', px(cap));
      if (reel) {
        // the picture drum has its own radius and step: neighbours sit a fixed gap apart along its face
        st.pstep = clamp(num(o.pictureStep, 36), 24, 50) * DEG;
        const pr = (pic.h + pic.gap) / (2 * Math.tan(st.pstep / 2));
        set('--pic-w', px(pic.w));
        set('--pic-h', px(pic.h));
        set('--pic-x', px(pic.x));
        set('--pic-y', px(pic.y));
        set('--pic-r', px(pr));
        set('--pic-persp', px(PDEPTH * pr));
        set('--pic-step', ((gear * st.pstep) / DEG).toFixed(4) + 'deg');
        st.clipT = mode === 'stack' ? pic.top : 0;
        st.clipB = mode === 'stack' ? Math.max(0, H - pic.y - pic.h / 2) : 0;
        // what the slide needs: the view's half-height around the drum's centre (the screen beside the names,
        // the window on a phone), the face's half-height, the radius and the perspective
        st.pg = { V: mode === 'stack' ? pic.h / 2 : Math.min(pic.y, H - pic.y), hh: pic.h / 2, h: pic.h, pr, d: PDEPTH * pr };
        st.ps = [];
      }
      if (mode !== st.mode) { st.mode = mode; root.dataset.layout = mode; st.l = []; syncSlots(); }
      if (reel) { clipPics(); showEnds(); }
    };
    // An end shows while it is open, and while its picture sits still at the front (where, closed, it covers
    // that picture exactly, so it is drawn before it moves). Opening, its window grows to the full height while
    // the picture inside eases up to its full size, like a camera moving in; closing runs the other way.
    function showEnds() {
      if (!parts.ends) return;
      parts.ends.forEach((E, k) => {
        const e = ends[k], g = e.g;
        const on = !!(g && E.ready && st.mode === 'reel' && (e.v > 0 || Math.abs(st.pv - e.i) < 0.002));
        if (on !== e.on) { E.el.classList.toggle('is-on', on); e.on = on; e.key = ''; }
        if (!on) return;
        const alpha = show[k].a;
        if (alpha !== e.alpha) { E.el.style.opacity = alpha >= 1 ? '' : alpha.toFixed(3); e.alpha = alpha; }
        const v = e.v, key = v.toFixed(4);
        if (key === e.key) return;
        e.key = key;
        const s = g.k0 + (1 - g.k0) * v, down = (g.H - g.B0) * v;
        E.win.style.clipPath = `inset(${(g.T0 * (1 - v)).toFixed(1)}px 0px ${(g.H - g.B0 - down).toFixed(1)}px ${g.L0.toFixed(1)}px)`;
        E.img.style.transform = `translate(${(g.dx * (1 - v)).toFixed(2)}px, ${(g.dy * (1 - v)).toFixed(2)}px) scale(${s.toFixed(4)})`;
        if (E.cap) E.cap.style.transform = `translateY(${(down - g.pad * v).toFixed(1)}px)`;
      });
    }
    // An end's file arrives: lay it out at its real size; if it is open on screen right now (the scene is the
    // first section, or the page was reloaded at an end), it eases in over the ground, where until now the
    // drum showed nothing, rather than popping over its picture at drum size.
    parts.onEndReady = (E) => {
      if (!isLive() || st.mode !== 'reel') return;
      const k = parts.ends.indexOf(E);
      if (k >= 0 && E.ready && ends[k].v > 0.001 && parts.onScreen()) {
        show[k].a = 0;
        gsap.to(show[k], { a: 1, duration: 0.45, ease: 'power2.out', overwrite: true, onUpdate: () => { showEnds(); paint(); } });
      }
      layout(); showEnds(); paint();
    };
    // stack: the picture window, one picture tall, starts under the statement and opens up to the top of the
    // screen as the statement leaves (a clip on the picture drum's view, written only when it changes)
    function clipPics() {
      const c = st.mode === 'stack' ? `inset(${(st.clipT * (1 - open.v)).toFixed(1)}px 0px ${st.clipB.toFixed(1)}px 0px)` : '';
      if (c !== st.clip) { reel.parentElement.style.clipPath = c; st.clip = c; }
    }

    // A list that cannot fit the phone shows the finished list instead (no pin, the timeline parked and
    // its inline styles cleared), and turns back into the drum when a resize lets it fit.
    const applyFit = () => {
      if (st.fit === isLive()) return;
      const trigger = tl.scrollTrigger;
      root.classList.toggle('is-live', st.fit);
      root.classList.toggle('is-rest', !st.fit);
      const B = parts.button;
      if (st.fit) {
        if (st.hold) root.style.setProperty('--hold', st.hold);
        // write the timeline's and the button's styles again (the finished list cleared them)
        const p = tl.progress();
        tl.progress(p > 0.5 ? 0 : 1).progress(p);
        if (B) B.tween.progress(B.gate.on ? 1 : 0).pause();
        if (trigger) trigger.enable();
      } else {
        root.style.removeProperty('--hold');
        if (trigger) trigger.disable(false);
        if (B) B.tween.pause();
        // everything the timeline styled goes back to the finished list's own look, the closing line too
        const line = close && close.querySelector('.drum-close-line');
        gsap.set([head, close, line, B && B.el, count, detail].filter(Boolean), { clearProps: 'transform,opacity,visibility' });
      }
      requestAnimationFrame(() => ScrollTrigger.refresh());
    };

    // Opacity of every name and picture: a ghost that fades with its projected height, raised to full while
    // lit. It sits on the face itself (a composited layer), so a fade never repaints the name. The count and
    // detail on each face (side layout) show only while it is lit; a picture carries its caption with it.
    const q = (v) => (v < 0.03 ? '0' : (Math.round(v * 100) / 100).toFixed(2));
    // The share of a picture face, turned a from the front, that lies past the edge of view (0 while it is all
    // in view). A point u along the face from its centre (towards its far edge) projects to
    // (R sin a + u cos a) d / (d + R (1 - cos a) + u sin a) from the drum's centre; it meets the edge V at u.
    const offEdge = (a) => {
      const { V, hh, pr, d } = st.pg;
      const c = Math.cos(a), s = Math.sin(a);
      const den = c * d - V * s;
      if (den <= 0) return 1;
      const u = (V * (d + pr * (1 - c)) - pr * s * d) / den;
      return clamp((hh - u) / (2 * hh), 0, 1);
    };
    const paint = () => {
      const side = st.mode === 'side';
      // While an end is open, the other pictures on the drum are gone. Its own picture stays under it once the
      // end shows; while the end's file is still on its way, or the end is easing in, that picture is gone too,
      // so the first stop never shows at drum size and then jumps to the full height.
      const endsLive = st.mode === 'reel' && !!parts.ends;
      const fadeFor = (i) => {
        let f = 1;
        if (endsLive) parts.ends.forEach((E, k) => {
          const e = ends[k];
          if (E.failed || !e.g || e.v <= 0) return;
          if (e.i !== i || !E.ready || show[k].a < 1) f *= 1 - e.v;
        });
        return f;
      };
      for (let i = 0; i < n; i++) {
        const l = lit[i].v;
        const g = ghost(Math.abs(i * st.step - st.rot), near, far, depth);
        const s = l > 0 && g > 0 ? (g + (1 - g) * l).toFixed(3) : q(g);
        if (s !== st.o[i]) {
          // A faint name (under 0.29) keeps that much on its own text and the rest on its face, so a page
          // checker reading the text's opacity sees it as faint; it only changes as a name crosses that line.
          const v = +s, faint = v < 0.29;
          items[i].style.setProperty('--drum-o', faint ? (v / 0.29).toFixed(3) : s);
          if (faint !== st.f[i]) { nameEls[i].style.setProperty('--drum-no', faint ? '0.29' : '1'); st.f[i] = faint; }
          st.o[i] = s;
        }
        const ls = l < 0.002 ? '0' : l.toFixed(3);
        if (ls !== st.l[i]) {
          st.l[i] = ls;
          if (side) for (const c of capEls[i]) c.style.setProperty('--drum-lit', ls);
          if (accent) nameEls[i].style.setProperty('--drum-lit', ls);
        }
        if (!reel) continue;
        const d = i - st.pv;
        const a = Math.abs(d) * st.pstep;
        const pg = ghost(a, 0.62, 0.12, PDEPTH);
        const pf = pg > 0 ? (pg + (1 - pg) * l) * fadeFor(i) : 0;
        const ps = pf > 0.002 ? pf.toFixed(3) : '0';
        if (ps !== st.po[i]) { cards[i].style.setProperty('--drum-o', ps); st.po[i] = ps; }
        // The slide: as a face turns away, its picture slides inside it (up on a face below the front, down on
        // one above), so the strip of a neighbour beside the front picture is the photograph's middle, its
        // horizon, and not the plain sky along its top edge. The slide is held to the part of the face that
        // lies past the edge of view, so the face's uncovered end is never on screen.
        if (a < 100 * DEG && st.pg) {
          const sh = Math.min(SLIDE, Math.max(0, offEdge(a) - 0.02)) * st.pg.h * (gear * d > 0 ? -1 : 1);
          const ss = Math.abs(sh) < 0.25 ? '0' : sh.toFixed(1);
          if (ss !== st.ps[i]) { cardImgs[i].style.transform = ss === '0' ? '' : `translate3d(0px, ${ss}px, 0px)`; st.ps[i] = ss; }
        }
        // a picture's caption (its notch) shows while the picture faces the front, and goes as it turns away
        if (capTexts[i]) {
          const cs = (1 - smoothstep(0.08, 0.3, Math.abs(i - st.pv))).toFixed(2);
          if (cs !== st.pc[i]) { capTexts[i].style.setProperty('--drum-cap', cs); st.pc[i] = cs; }
        }
        // a picture well past the rim is not drawn at all; the two either side of the front stay drawn
        const vis = a < 100 * DEG;
        if (vis !== st.pv2[i]) { cards[i].classList.toggle('is-away', !vis); st.pv2[i] = vis; }
      }
    };

    // The picture drum: its position from the scroll (pk), plus the settle offset.
    const showPics = () => {
      st.pv = st.pk + off.v;
      reel.style.setProperty('--drum-turn', ((gear * st.pv * st.pstep) / DEG).toFixed(3) + 'deg');
      showEnds();
    };
    // Once the scroll rests mid-turn, the picture drum finishes the turn to the lit name's picture on its own
    // (0.35s); when the scroll moves again it eases back onto the scroll, so it never jumps.
    const park = () => {
      // under a wheel with the detent on, the detent itself carries the scroll to a whole name
      if (!reel || !isLive() || st.idx < 0 || (detent && Stage.lenis)) return;
      const d = st.idx - st.pk;
      if (Math.abs(d - off.v) < 0.002) return;
      off.parked = true;
      gsap.to(off, { v: d, duration: 0.35, ease: 'power2.out', overwrite: true, onUpdate: () => { showPics(); paint(); } });
    };

    // The line at the foot: the new text goes in at once (never an empty count), then rolls in from the
    // side the drum turns; a roll already running is left to finish with the newest text. The roll is a Web
    // Animation (it runs on the compositor and never makes the browser restyle in the middle of a frame), and
    // only runs where the line is shown.
    const footShown = () => st.mode === 'bottom' || st.mode === 'stack';
    const swap = (el, value, dir, instant) => {
      if (!el) return;
      if (el.textContent !== value) el.textContent = value;
      if (instant || !footShown() || !el.animate) { if (el.__roll) el.__roll.cancel(); return; }
      if (el.__roll && el.__roll.playState === 'running') return;
      el.__roll = el.animate([{ transform: `translateY(${70 * dir}%)`, opacity: 0.35 }, { transform: 'none', opacity: 1 }], { duration: 280, easing: 'cubic-bezier(0.215, 0.61, 0.355, 1)' });
    };
    function syncSlots() {
      const i = Math.max(0, st.idx);
      swap(now, String(i + 1), 1, true);
      swap(text, metas[i] || '', 1, true);
    }

    const activate = (idx) => {
      const prev = st.idx;
      st.idx = idx;
      const dir = idx >= prev ? 1 : -1;
      const instant = prev < 0;
      if (instant) lit.forEach((l, i) => { l.v = i === idx ? 1 : 0; });
      else {
        gsap.to(lit[prev], { v: 0, duration: 0.24, ease: 'power2.out', overwrite: true, onUpdate: paint });
        gsap.to(lit[idx], { v: 1, duration: 0.16, ease: 'power2.out', overwrite: true, onUpdate: paint });
      }
      swap(now, String(idx + 1), dir, instant);
      swap(text, metas[idx] || '', dir, instant);
    };

    const render = () => {
      st.rot = st.t * st.spread;
      const f = st.step ? st.rot / st.step : 0;
      drum.style.setProperty('--drum-turn', (st.rot / DEG).toFixed(3) + 'deg');
      const idx = n > 1 ? clamp(Math.round(f), 0, n - 1) : 0;
      if (idx !== st.idx) activate(idx);
      if (reel) {
        st.pk = stepTurn ? geneva(f) : f;
        // the scroll moved again after a settle: hand the picture drum back to the scroll, eased
        if (off.parked) { off.parked = false; gsap.to(off, { v: 0, duration: 0.3, ease: 'power2.out', overwrite: true, onUpdate: () => { showPics(); paint(); } }); }
        showPics();
        clearTimeout(off.timer);
        off.timer = setTimeout(park, 140);
      }
      paint();
    };

    layout();

    // T1 the statement leaves before the first name rises into the upper half (on a phone, the picture window
    // opens up into the space it leaves)
    if (head) tl.to(head, { y: () => -0.08 * screenH(), autoAlpha: 0, duration: 0.08, ease: 'power1.in' }, 0);
    // (the window starts opening once the statement is half gone and reaches its lines only as they fade out,
    // so a picture never passes behind words that are still being read)
    if (reel) tl.fromTo(open, { v: 0 }, { v: 1, duration: 0.06, ease: 'power1.inOut', onUpdate: clipPics }, 0.04);
    // (picture drum beside the names) the first stop fills the right of the screen, then folds into the drum
    // before it starts to turn
    if (reel && o.ends !== false) tl.fromTo(ends[0], { v: 1 }, { v: 0, duration: 0.06, ease: 'power2.inOut', onUpdate: () => { showEnds(); paint(); } }, 0);
    // T2 the turn: linear, so the drum feels geared to the wheel; 0-0.06 and 0.94-1 hold the end names
    tl.fromTo(st, { t: 0 }, { t: 1, duration: 0.88, ease: 'none', onUpdate: render }, 0.06);
    // T5 the finale (picture drum beside the names): once the last name is up, its picture opens to the full
    // height of the screen, the other pictures go, and the last stop fills the right of the screen
    if (reel && o.ends !== false) tl.fromTo(ends[1], { v: 0 }, { v: 1, duration: 0.06, ease: 'power2.inOut', onUpdate: () => { showEnds(); paint(); } }, 0.94);
    // T4 the closing line and its button take the empty lower half once the last name is up. The line rises
    // with the scroll; the button is never shown half-faded (it would read as disabled wherever a scroll comes
    // to rest): once the scroll passes its point it comes in on its own, in 0.45s, and goes the same way back.
    if (close) {
      // the count and detail at the foot hand that space over first (they are hidden in the other layouts)
      const foot = [count, detail].filter(Boolean);
      if (foot.length) tl.to(foot, { autoAlpha: 0, duration: 0.03, ease: 'none' }, 0.9);
      const line = close.matches('a') ? null : close.querySelector('.drum-close-line');
      const button = close.matches('a') ? close : close.querySelector('a');
      if (!close.matches('a')) tl.fromTo(close, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.01, ease: 'none' }, 0.91);
      if (line) tl.fromTo(line, { autoAlpha: 0, y: () => 0.03 * screenH() }, { autoAlpha: 1, y: 0, duration: 0.07, ease: 'power2.out' }, 0.91);
      if (button) {
        // made here, paused, so the stage's matchMedia reverts it with the rest of the build
        const bt = gsap.fromTo(button, { autoAlpha: 0, yPercent: 45 }, { autoAlpha: 1, yPercent: 0, duration: 0.45, ease: 'power2.out', paused: true });
        const gate = { v: 0, on: false };
        const setButton = (on) => {
          if (on === gate.on) return;
          gate.on = on;
          if (on) bt.timeScale(1).play(); else bt.timeScale(1.6).reverse();
        };
        tl.fromTo(gate, { v: 0 }, { v: 1, duration: 0.004, ease: 'none', onUpdate: () => setButton(gate.v > 0.5) }, line ? 0.93 : 0.92);
        parts.button = { el: button, tween: bt, gate };
      }
    }

    // The detent's rests. The first name rests only at 0 (the statement up, the first picture at full height)
    // and the last only at 1 (the closing line and its button in): the half-made states between 0 and 0.06
    // and between 0.94 and 1 are never rests. Every other name rests on the front line.
    const snapPoints = n > 1 ? [0, ...items.slice(1, -1).map((_, k) => 0.06 + (0.88 * (k + 1)) / (n - 1)), 1] : [0, 1];
    // Where a scroll that comes to rest at v settles: on to the next rest in the direction it was moving once it
    // has gone 30% of a name's step from the rest it left, else back to that rest. One wheel notch always moves
    // on a name, also over the first and last steps (twice as long as the others, so "nearest" would pull a
    // notch back); a nudge never does.
    const nudge = n > 1 ? (0.3 * 0.88) / (n - 1) : 0.15;
    const settle = (v, dir) => {
      let k = 0;
      while (k < snapPoints.length - 2 && snapPoints[k + 1] <= v) k++;
      const a = snapPoints[k], b = snapPoints[k + 1];
      if (dir < 0) return b - v > nudge ? a : b;
      return v - a > nudge ? b : a;
    };
    // the picture drum settles on a name by default under a wheel (Lenis); touch keeps its own free
    // scrolling unless the page asks for the detent (the picture drum still finishes its turn by itself)
    const detent = o.detent ?? (!!reel && !!Stage.lenis);
    let timer = 0;
    // Re-measure on every refresh (resize, late fonts) and re-render at the current progress.
    const trig = ScrollTrigger.create({
      trigger: root, start: 'top top', end: 'bottom bottom',
      onRefresh: () => { layout(); render(); applyFit(); },
      // the finished list (a phone that cannot fit the names) never snaps
      snap: detent && !Stage.lenis ? { snapTo: (v) => (isLive() ? settle(v, trig.direction) : v), duration: { min: 0.15, max: 0.45 }, delay: 0.06, ease: 'power2.out' } : undefined,
      onUpdate: detent && Stage.lenis ? (self) => {
        clearTimeout(timer);
        const dir = self.direction;
        const L = Stage.lenis;
        const rest = () => {
          if (!self.isActive || !isLive()) return;
          // the wheel's glide is still on its way (one slow frame can outlast the wait): settle where it lands,
          // never half-way, or a notch that has only just started would be pulled back
          if (L.isScrolling) { timer = setTimeout(rest, 60); return; }
          const target = self.start + settle(self.progress, dir) * (self.end - self.start);
          if (Math.abs(target - self.scroll()) > 2) L.scrollTo(target, { duration: 0.4, easing: (x) => 1 - (1 - x) * (1 - x) });
        };
        timer = setTimeout(rest, 160);
      } : undefined,
    });

    render();
    applyFit();
  }

  window.Scenes = window.Scenes || {};
  window.Scenes['scroll-turned-drum'] = (root, opts = {}) => {
    const items = [...root.querySelectorAll('.drum-item')];
    if (!window.Stage || !items.length || !root.querySelector('.drum')) return null;
    const o = opts || {};
    const n = items.length;
    const hold = num(o.hold, 0) > 0 ? clamp(+o.hold, 1, 4) : clamp(clamp(num(o.tempo, 0.16), 0.12, 0.22) * n + 0.2, 1.6, 3.2);
    const parts = prepare(root, items, o);
    const run = (tl, ctx) => build(tl, ctx, root, items, parts, o);
    // a face that arrives after load changes every name's width: measure again
    if (document.fonts && Stage.live) document.fonts.addEventListener('loadingdone', () => { if (root.classList.contains('is-live')) ScrollTrigger.refresh(); });
    // Started after the page's own script has run, so the scrub default sees whether Stage.smooth() is on
    // (Lenis plus a numeric scrub would smooth twice) whichever order the page called it in.
    queueMicrotask(() => {
      const scrub = o.scrub ?? (Stage.lenis ? true : 0.5);
      Stage.scene(root, { hold, scrub, build: run, phone: o.phone === 'rest' ? 'rest' : { hold, build: run } });
    });
    return null;
  };
})();

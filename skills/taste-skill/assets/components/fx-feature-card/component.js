// fx-feature-card: every inset panel gets its own still ground (a painted landscape or a soft grain),
// drawn once and kept as a picture: the four grounds render one after another through one WebGL context
// that is freed straight after, so the cards hold no context and draw no frames at rest. The UI window on
// each ground is plain HTML, cut by the panel's bottom edge. Panels marked data-cx-loop run a short
// pointer demo (glide about 1 s, click, the state changes, rest about 3 s) while on screen, with a pause
// button in the panel's corner; the others show a settled still. Reduced motion shows every demo in its
// end state with no pointer.
import { fx, still, palette, color, bag, reduced, held, pauser, paramsOf } from '../shared.js';

// each ground: still (no drift), no calm patch (the window covers the middle)
const GROUNDS = {
  'painterly-landscape': { drift: 0, calm: 0, blur: 0.65, brush: 0.55, grain: 0.035 },
  'grain-gradient': { speed: 0, grainMotion: 0, grain: 0.45, tint: 0.7, contrast: 0.6, softness: 0.55, calm: 0.3, calmX: 0.5, calmY: 0.5 },
  'ruled-grounds': { speed: 0, focus: 0, ink: 0.5, grain: 0.4, calm: 0.4, calmX: 0.5, calmY: 0.6 },
};

/* ------------------------------------------------------------------ the light of each panel */

const ok = (l, c, h) => color.fromLch([l, Math.max(0, c), h]);
const lum = c => color.lab(c)[0];
const coolHue = h => Math.min(265, Math.max(205, h));

/* what the page gives the pictures: its kind, the accent's hue family, its darkest and palest tone */
function read(page) {
  const [La, Ca, ha] = color.lch(page.accent);
  const [Lb, Cb, hb] = color.lch(page.bg);
  const inkLight = lum(page.ink) > lum(page.bg);
  return {
    kind: fx.paletteKind(page), La, Ca, ha, Lb, Cb, hb,
    warm: Ca > 0.05 && (ha < 80 || ha >= 330),             // red, orange, amber
    cool: Ca > 0.04 && ha >= 190 && ha <= 285,             // blue, teal
    dark: inkLight ? page.bg : page.ink,
    pale: inkLight ? page.ink : page.bg,
  };
}

/*
  A painted landscape is a picture, so it takes a natural light, near the page but never one hue laid
  over everything:
  - day: a pale sky (the accent's hue at low chroma when the accent is cool, else almost grey) over
    hills that step down to the near slope: graphite under a warm accent (an orange hill reads as rust),
    a misty blue-grey under a cool one, the accent itself when it is green or neutral; on a colour page
    deeper shades of the page colour.
  - dusk: a deep blue sky that lights up in gold only along the horizon, dark hills with a lit crest
    (the gold leans toward a warm accent, between amber and gold); on a colour page a light shade of the
    page colour (never its complementary accent).
  - meadow: daylight as a photograph shows it, whatever the page: a clear blue sky that pales toward the
    horizon, a blue far ridge and a sunlit field of grass in front. On a blue colour page the sky is the
    page colour itself. The natural picture among the panels, as on x.ai's cards.
*/
const SCENES = {
  day(page, k) {
    let sky, hill;
    if (k.kind === 'colour') {
      sky = ok(0.87, Math.min(k.Cb * 0.3, 0.06), k.hb);
      hill = ok(0.46, Math.min(k.Cb * 0.8, 0.14), k.hb);
    } else {
      const h = k.cool ? coolHue(k.ha) : k.kind === 'light' && k.Cb > 0.012 ? k.hb : 235;
      const L = k.kind === 'light' ? Math.min(0.93, Math.max(0.8, k.Lb - 0.05)) : 0.84;
      sky = ok(L, k.cool ? 0.04 : k.kind === 'light' ? Math.min(k.Cb, 0.03) : 0.012, h);
      hill = k.warm ? ok(0.42, 0.008, k.ha)
        : k.cool ? ok(Math.min(k.La, 0.62), Math.min(k.Ca * 0.55, 0.07), coolHue(k.ha))
          : ok(Math.min(k.La, 0.6), Math.min(k.Ca, 0.1), k.ha);
    }
    return { bg: sky, surface: color.lighten(sky, -0.04), ink: k.dark, muted: color.mix(sky, k.dark, 0.4), accent: hill, accentInk: k.pale };
  },
  dusk(page, k) {
    // a natural evening: a deep blue sky with a band of gold low on the horizon, whatever the accent
    // (a blue glow under a blue accent read as the day panel again, only darker). The gold leans toward a
    // warm accent's hue but stays between amber and gold: a red-orange glow paints the lit crests rust.
    // A gold that mixes with the cool grey of the hills turns beige, never mauve or violet.
    const colourPage = k.kind === 'colour';
    const h = colourPage ? k.hb : k.cool ? coolHue(k.ha) : 248;
    const c = colourPage ? Math.min(k.Cb * 0.5, 0.065) : 0.04;
    const sky = ok(0.26, c, h);
    const glow = colourPage ? ok(0.78, Math.min(k.Cb * 0.4, 0.08), k.hb)
      : ok(0.8, 0.115, k.warm ? Math.min(80, Math.max(58, k.ha < 180 ? k.ha : 58)) : 74);
    return { bg: sky, surface: color.lighten(sky, 0.04), ink: k.pale, muted: ok(0.58, 0.012, h), accent: glow, accentInk: k.dark };
  },
  meadow(page, k) {
    // a sky with chroma above 0.07 is painted as a colour sky over a field of the accent: here a clear
    // blue (never toward violet) over sunlit grass
    const blue = k.kind === 'colour' && k.hb >= 220 && k.hb <= 270;
    const sky = blue ? ok(0.62, Math.min(Math.max(k.Cb * 0.6, 0.09), 0.12), k.hb) : ok(0.66, 0.1, 238);
    const grass = ok(0.74, 0.12, 112);
    return { bg: sky, surface: color.lighten(sky, -0.05), ink: ok(0.97, 0.01, 238), muted: ok(0.8, 0.03, 238), accent: grass, accentInk: k.dark };
  },
};

/* a soft grain: light grounds under a warm accent (a warm accent on a dark ground mixes to rust), deep
   ones under a cool accent, the page colour's own shades on a colour page */
function grainGround(page, k) {
  if (k.kind === 'colour') {
    return { ...page, bg: ok(0.5, Math.min(k.Cb * 0.8, 0.16), k.hb), surface: ok(0.42, Math.min(k.Cb * 0.9, 0.18), k.hb), accent: ok(0.8, Math.min(k.Cb * 0.4, 0.09), k.hb), muted: ok(0.66, 0.04, k.hb) };
  }
  if (k.kind === 'dark') {
    if (k.cool) return { ...page, bg: ok(0.34, Math.min(k.Ca * 0.4, 0.06), k.ha), surface: ok(0.42, Math.min(k.Ca * 0.5, 0.07), k.ha), muted: ok(0.6, 0.03, k.ha) };
    return { ...page, bg: ok(0.8, 0.025, k.ha), surface: ok(0.72, 0.04, k.ha), ink: k.dark, muted: ok(0.6, 0.02, k.ha) };
  }
  return { ...page, bg: color.mix(page.bg, page.accent, 0.16), surface: color.mix(page.bg, page.accent, 0.3), muted: color.mix(page.bg, page.ink, 0.5) };
}

function groundPalette(page, id, scene) {
  const k = read(page);
  if (id === 'painterly-landscape') return (SCENES[scene] || SCENES.day)(page, k);
  if (id === 'grain-gradient') return grainGround(page, k);
  return { ...page, bg: color.mix(page.bg, page.accent, 0.16), surface: color.mix(page.bg, page.accent, 0.3), muted: color.mix(page.bg, page.ink, 0.5) };
}

/* ------------------------------------------------------------------ the pointer demo */

const POINTER = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 2.8v13.4l3.5-3.3 2.3 5.1 2.5-1.1-2.3-5h5Z"/></svg>';

/* one demo: a pointer and a click ring in the panel; script(api) runs once per loop */
function demo(panel, script, end) {
  const ptr = document.createElement('span');
  ptr.className = 'cx-feat__ptr';
  ptr.innerHTML = POINTER;
  const ring = document.createElement('span');
  ring.className = 'cx-feat__ring';
  panel.append(ring, ptr);
  let alive = true, onScreen = false;
  const io = new IntersectionObserver(e => { onScreen = e[e.length - 1].isIntersecting; });
  io.observe(panel);
  const running = () => onScreen && !document.hidden && !held(panel);
  // wait ms of running time: off screen, in a hidden tab or paused, the clock stops
  const wait = ms => new Promise(res => {
    let acc = 0, last = performance.now();
    const step = () => {
      if (!alive) return;
      const now = performance.now();
      if (running()) acc += now - last;
      last = now;
      if (acc >= ms) res(); else setTimeout(step, running() ? Math.min(100, ms - acc) : 250);
    };
    step();
  });
  const move = (x, y, instant) => {
    if (instant) ptr.style.transition = 'none';
    ptr.style.transform = `translate(${(x - 4).toFixed(1)}px, ${(y - 3).toFixed(1)}px)`;
    if (instant) { ptr.getBoundingClientRect(); ptr.style.transition = ''; }
  };
  const spot = el => {
    const pr = panel.getBoundingClientRect(), r = el.getBoundingClientRect();
    return [r.left - pr.left + r.width * 0.56, r.top - pr.top + r.height * 0.62];
  };
  const show = on => { ptr.style.opacity = on ? '1' : '0'; };
  const click = async el => {
    const [x, y] = spot(el);
    // the ring is placed with the translate property and grows with scale: the two compose as
    // translate then scale, so the ring grows on the spot (a translate inside transform would be
    // scaled too and fly off across the window)
    ring.style.translate = `${x.toFixed(1)}px ${y.toFixed(1)}px`;
    ring.classList.remove('is-on'); void ring.offsetWidth; ring.classList.add('is-on');
    el.classList.add('is-down');
    await wait(140);
    el.classList.remove('is-down');
  };
  const api = { wait, move, spot, show, click, panel };
  if (reduced()) end();
  else {
    end();   // the finished picture first, so a panel that is off screen, paused or never seen is never empty
    (async () => { while (alive) { await wait(600); await script(api); } })();
  }
  return { destroy() { alive = false; io.disconnect(); ptr.remove(); ring.remove(); } };
}

const SCRIPTS = {
  invoice(panel) {
    const btn = panel.querySelector('[data-target]'), label = btn.querySelector('[data-label]');
    const state = panel.querySelector('[data-state]');
    const reset = () => { btn.classList.remove('is-done'); label.textContent = 'Send'; state.textContent = 'Draft'; state.classList.remove('is-on'); };
    const done = () => { btn.classList.add('is-done'); label.textContent = 'Sent'; state.textContent = 'Sent'; state.classList.add('is-on'); };
    return {
      still: done,
      async run({ wait, move, spot, show, click, panel: p }) {
        reset();
        const [x, y] = spot(btn);
        show(false);
        move(x - 150, y + 150, true);
        await wait(900);
        show(true);
        move(x, y);
        await wait(1300);
        await click(btn);
        label.textContent = 'Sending';
        await wait(700);
        done();
        await wait(500);
        move(x + 40, Math.min(p.clientHeight - 30, y + 110));
        show(false);
        await wait(3200);
      },
    };
  },
  invite(panel) {
    const btn = panel.querySelector('[data-target]'), label = btn.querySelector('[data-label]');
    const typed = panel.querySelector('[data-type]'), win = panel.querySelector('[data-demo]');
    const EMAIL = 'ana@northwind.co';
    const reset = () => { typed.textContent = ''; win.classList.remove('is-added'); btn.classList.remove('is-done'); label.textContent = 'Invite'; };
    const done = () => { typed.textContent = ''; win.classList.add('is-added'); btn.classList.add('is-done'); label.textContent = 'Invited'; };
    return {
      still: done,
      async run({ wait, move, spot, show, click, panel: p }) {
        reset();
        const [x, y] = spot(btn);
        show(false);
        move(x - 160, y + 140, true);
        await wait(700);
        for (const ch of EMAIL) { typed.textContent += ch; await wait(55); }
        await wait(300);
        show(true);
        move(x, y);
        await wait(1300);
        await click(btn);
        await wait(250);
        done();
        await wait(500);
        move(x + 30, Math.min(p.clientHeight - 30, y + 120));
        show(false);
        await wait(3400);
      },
    };
  },
};

export default function init(root) {
  const b = bag();
  const page = palette(root);
  root.querySelectorAll('.cx-feat__panel').forEach(panel => {
    const id = panel.dataset.cxEffect || 'painterly-landscape';
    const ground = groundPalette(page, id, panel.dataset.cxScene);
    const params = { ...(GROUNDS[id] || {}), ...(paramsOf(panel) || {}), speed: 0, drift: 0 };
    // the ground never moves: drawn once, kept as a picture, its context freed
    b.add(still(panel, id, { palette: ground, seed: panel.dataset.cxSeed, params }));
    const loop = SCRIPTS[panel.dataset.cxLoop];
    if (loop) {
      // the pause button holds the pointer demo (the ground is a picture and has nothing to pause)
      if (!reduced()) b.add(pauser(panel, { label: 'the demo', corner: 'tr' }));
      const s = loop(panel);
      b.add(demo(panel, s.run, s.still));
    }
  });
  return b;
}

export { groundPalette };

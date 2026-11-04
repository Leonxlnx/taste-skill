/*
  descend-through-weather - the first screen sinks through a cloud deck onto the place below. A held
  full-bleed photograph from above the weather stands behind a flat band of the page's ground across
  the foot, which carries the name, one line and the action; as the visitor scrolls, two layers of
  cloud rise at different speeds and the band leaves as the cloud reaches it; a wall of mist fills
  the frame for a breath while one short line rises through it; then the frame clears from the
  bottom, under a ceiling of cloud, onto the second photograph, where a two-line statement rises on
  a band at the foot. The cloud is drawn once in a canvas from layered noise (no files, no WebGL, no
  blur on text); the deck itself is a flat mist in the page's own tint. No word ever sits straight on
  a photograph.

  <section class="sc" data-big-scene="descend-through-weather" data-big-scene-opts='{"hold":1}' style="--h: 2" aria-labelledby="wx-h">
    <div class="sc__stage">
      <figure class="wx__above"><img src="above.jpg" alt="…" width height></figure>      the place from above the cloud
      <header class="wx__hero">
        <h2 class="wx__title" id="wx-h">Stratus</h2>                                   one word, 4-10 letters (this scene sits below the page's hero: restH 2)
        <p class="wx__tagline">One sentence of 8-14 words.</p>
        <div class="btn-row">…one or two buttons…</div>                                   optional
      </header>
      <p class="wx__note">Inside the cloud, 800 metres up</p>                             3-7 words, the line on the mist
      <figure class="wx__below"><img src="below.jpg" alt="…" width height></figure>      the place from below the cloud
      <h2 class="wx__statement"><span>Below the cloud,</span><span>the whole valley opens.</span></h2>
    </div>
  </section>
  Options: hold (whole screens, default 1: the section is then two screens; 2 makes three, which the page rhythm fails), mist (a CSS colour for the deck; default the page's ground mixed to white).
  Phones show the finished composition (the picture from above, the name, the line and the action, the
  statement, the picture from below).
*/
import { scene, seg, ease, lerp, token, hex } from '../lib.js';

// value noise with five octaves, drawn once into a cloud strip whose top edge billows and whose foot is solid
function cloudCanvas(w, h, seed, color, body = null) {
  const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
  const c = cv.getContext('2d'); if (!c) return cv;
  const img = c.createImageData(w, h), d = img.data;
  const perm = new Uint8Array(512); for (let i = 0; i < 256; i++) perm[i] = i;
  let s = seed * 1013 + 7; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let i = 255; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [perm[i], perm[j]] = [perm[j], perm[i]]; }
  for (let i = 0; i < 256; i++) perm[256 + i] = perm[i];
  const grad = new Float32Array(512); for (let i = 0; i < 512; i++) grad[i] = perm[i] / 255;
  const fade = t => t * t * (3 - 2 * t);
  const noise = (x, y) => {
    const X = Math.floor(x) & 255, Y = Math.floor(y) & 255, fx = x - Math.floor(x), fy = y - Math.floor(y);
    const a = grad[perm[X] + Y], b = grad[perm[X + 1] + Y], cc = grad[perm[X] + Y + 1], dd = grad[perm[X + 1] + Y + 1];
    const u = fade(fx), v = fade(fy);
    return lerp(lerp(a, b, u), lerp(cc, dd, u), v);
  };
  const [r, gg, bb] = color;
  for (let y = 0; y < h; y++) {
    const fy = y / h;
    for (let x = 0; x < w; x++) {
      const fx = x / w;
      let n = 0, amp = 0.5, f = 3;
      for (let o = 0; o < 5; o++) { n += amp * noise(fx * f + seed * 10, fy * f * 0.6 + seed * 3); amp *= 0.5; f *= 2.1; }
      const o = (y * w + x) * 4;
      if (body) {
        // the body of the cloud: solid, with soft wisps of the other tint drifting through it; plain at the top and
        // foot, where it meets the billows, so there is no seam
        const edge = Math.min(1, fy / 0.18, (1 - fy) / 0.18);
        const t0 = Math.min(1, Math.max(0, (n - 0.42) / 0.3)), wisp = t0 * t0 * (3 - 2 * t0) * edge * 0.85;
        d[o] = r + (body[0] - r) * wisp; d[o + 1] = gg + (body[1] - gg) * wisp; d[o + 2] = bb + (body[2] - bb) * wisp; d[o + 3] = 255;
        continue;
      }
      // billows: the cloud's height along x, the top edge soft, the foot solid
      const top = 0.22 + 0.5 * n;
      const a = Math.min(1, Math.max(0, (fy - top + 0.18) / 0.26));
      const alpha = a * a * (3 - 2 * a) * Math.min(1, 0.6 + fy * 0.6);
      d[o] = r; d[o + 1] = gg; d[o + 2] = bb; d[o + 3] = Math.round(alpha * 255);
    }
  }
  c.putImageData(img, 0, 0);
  return cv;
}

export default function mount(root, opts = {}) {
  const stage = root.querySelector('.sc__stage');
  const above = root.querySelector('.wx__above'), hero = root.querySelector('.wx__hero'), note = root.querySelector('.wx__note'), below = root.querySelector('.wx__below'), statement = root.querySelector('.wx__statement');
  if (!stage || !above || !below || !hero) { root.classList.add('sc', 'is-rest'); return { destroy() {} }; }
  const lines = statement ? [...statement.querySelectorAll('span')] : [];
  const layers = [];
  let g = null, built = false;
  const build = () => {
    if (built) return; built = true;
    // the mist: the page's ground mixed 35:65 with white (or opts.mist, a hex or rgb colour), one rgb for
    // the canvases and the flat fills alike, so the billows and the deck meet without a seam
    const base = hex(opts.mist || token(root, '--bg', '#ffffff'));
    const k = opts.mist ? 1 : 0.35;
    const rgb = base.map(v => Math.round((v * k + (1 - k)) * 255));
    root.style.setProperty('--wx-mist-c', `rgb(${rgb.join(' ')})`);
    // the far layer is the cloud's shaded underside, a tenth of the way to the ink, so the near layer's billows read against it
    const ink = hex(token(root, '--ink', '#111111'));
    const shade = rgb.map((v, j) => Math.round(v * 0.9 + ink[j] * 255 * 0.1));
    for (let i = 0; i < 2; i++) {
      const c = i === 0 ? shade : rgb;
      const layer = document.createElement('div'); layer.className = 'wx__cloud'; layer.setAttribute('aria-hidden', 'true');
      layer.style.setProperty('--wx-layer', `rgb(${c.join(' ')})`);
      const top = cloudCanvas(560, 220, i + 1, c); top.className = 'wx__billow wx__billow--top';
      const foot = cloudCanvas(560, 220, i + 3, c); foot.className = 'wx__billow wx__billow--foot';
      const fill = cloudCanvas(360, 420, i + 5, c, i === 0 ? rgb : shade); fill.className = 'wx__fill';   // drawn once, small, stretched: soft by nature
      layer.append(top, fill, foot);
      stage.insertBefore(layer, note);
      layers.push(layer);
    }
  };
  const ctrl = scene(root, {
    hold: opts.hold ?? 1,
    phone: 'rest',
    start() { build(); },
    measure(ctx) { g = { H: ctx.vh }; },
    update(p) {
      if (!g) return;
      const H = g.H;
      // the layers: the far one rises first and slower, the near one later and faster; both leave upward.
      // the full-mist beat is short: the near layer is already leaving while the note stands
      const y = (a, b, c0, c1, d0, d1) => lerp(lerp(a, b, seg(p, c0, c1, ease.inOut)), -2.6 * H, seg(p, d0, d1, ease.inOut));
      const yB = y(1.02 * H, -0.08 * H, 0.04, 0.48, 0.56, 0.94);
      const yA = y(1.28 * H, 0.3 * H, 0.14, 0.48, 0.52, 0.86);
      if (layers[0]) layers[0].style.transform = `translate3d(0, ${yB.toFixed(1)}px, 0)`;
      if (layers[1]) layers[1].style.transform = `translate3d(0, ${yA.toFixed(1)}px, 0)`;
      // the picture above zooms slowly and goes once the deck has closed
      const zoom = 1 + 0.1 * seg(p, 0, 0.5, ease.linear);
      above.style.transform = `scale(${zoom.toFixed(4)})`;
      above.style.visibility = p > 0.5 ? 'hidden' : '';
      // the band with the name leaves downward as the cloud reaches it
      const kh = 1 - seg(p, 0.28, 0.4, ease.inOut);
      hero.style.opacity = kh.toFixed(3); hero.style.visibility = kh <= 0 ? 'hidden' : '';
      hero.style.transform = `translate3d(0, ${((1 - kh) * H * 0.12).toFixed(1)}px, 0)`;
      // the line inside the cloud: it comes as soon as the band has gone and holds the mist until the frame starts to clear
      if (note) {
        const kn = seg(p, 0.4, 0.46, ease.out) * (1 - seg(p, 0.58, 0.64, ease.in2));
        note.style.opacity = kn.toFixed(3); note.style.visibility = kn <= 0 ? 'hidden' : '';
        note.style.transform = `translate3d(0, ${(lerp(30, -30, seg(p, 0.38, 0.66, ease.linear))).toFixed(1)}px, 0)`;
      }
      // the place below: a slow settle from a close crop
      below.style.transform = `scale(${(1.12 - 0.12 * seg(p, 0.56, 1, ease.out)).toFixed(4)})`;
      if (statement) { const ks = seg(p, 0.74, 0.86, ease.out); statement.style.opacity = ks.toFixed(3); statement.style.visibility = ks <= 0 ? 'hidden' : ''; }
      lines.forEach((l, i) => {
        const k = seg(p, 0.78 + i * 0.07, 0.92 + i * 0.07, ease.out);
        l.style.transform = `translate3d(0, ${((1 - k) * 110).toFixed(1)}%, 0)`;
        l.style.opacity = k > 0 ? '1' : '0';
      });
    },
    rest() {
      above.style.cssText = ''; hero.style.cssText = ''; below.style.cssText = ''; if (note) note.style.cssText = ''; if (statement) statement.style.cssText = '';
      lines.forEach(l => { l.style.cssText = ''; });
      layers.forEach(l => { l.style.transform = ''; });
    },
  });
  return { destroy() { ctrl && ctrl.destroy(); layers.forEach(l => l.remove()); } };
}

/*
  fly-into-the-shape - the brand's own mark turns to face you, then you fly into it. The mark is a
  clean clip of its true shape (never extruded or bevelled) with the next chapter's photograph
  already inside it and the chapter's title on its face. It rises to the centre of the held stage,
  turns to face you, then the camera flies at it at a steady rate: the mark grows about the centre of
  its largest inscribed circle until its edges rush past every side of the screen and the photograph
  fills the page; the face's title goes as a flat band rises across the foot with the chapter's title
  and its first sentence. The title on the face grows with the mark to its full size, never faster,
  so no edge of the mark ever crosses a word. The clip is a CSS clip-path path() in page pixels
  (the mark's path scaled by the script), never an SVG clipPath repainted each frame.

  <section class="sc ground-inverse" data-big-scene="fly-into-the-shape" data-big-scene-opts='{"hold":1,"path":"M50 3 L90.7 26.5 …Z"}' aria-labelledby="fis-h">
    <div class="sc__stage">
      <div class="fis__outside"><p class="fis__aside">3-6 words</p></div>          the outgoing ground (the page's), optional aside
      <div class="fis__world">
        <img class="fis__media" src="…" alt="…" width height>                     one photograph of the chapter's world, dark
      </div>
      <div class="fis__band">                                                      a flat band of the page's ground: the title and the sentence
        <h2 class="fis__title" id="fis-h"><span>Line one</span><span>line two</span></h2>   2-6 words on two lines, 12 characters a line
        <p class="fis__sub">The chapter's first sentence, 10-18 words.</p>
      </div>
      <svg class="fis__mark" viewBox="0 0 100 100" aria-hidden="true"><path d="…the same path…"/></svg>      the mark, shown small in the finished composition
    </div>
  </section>
  Options: hold (whole screens, default 1: the section is then two screens; 2 makes three, which the page rhythm fails), path (the mark as one closed SVG path in a 100 x 100 box; else the
  .fis__mark's path is read), centre ([x, y] of the mark's inscribed circle in the 100-box, default [50, 50]),
  rin (that circle's radius, default 40), turn (degrees the mark turns from, default 34).
  Phones show the finished composition (the mark, the picture, the title and the sentence under it).
*/
import { scene, seg, ease, lerp } from '../lib.js';

// the path's numbers scaled by k and moved by (tx, ty): absolute commands move and scale, relative ones scale;
// an arc's radii scale and its flags stay
function placePath(d, k, tx, ty) {
  let out = '';
  const re = /([MLHVCSQTAZmlhvcsqtaz])|(-?\d*\.?\d+(?:e-?\d+)?)/g;
  let cmd = '', i = 0, m;
  while ((m = re.exec(d))) {
    if (m[1]) { cmd = m[1]; i = 0; out += ' ' + cmd; continue; }
    const v = parseFloat(m[2]);
    const abs = cmd === cmd.toUpperCase();
    let r;
    if (cmd === 'A' || cmd === 'a') { const j = i % 7; r = j < 2 ? v * k : j === 2 || j === 3 || j === 4 ? v : j === 5 ? v * k + (abs ? tx : 0) : v * k + (abs ? ty : 0); }
    else if (cmd === 'H' || cmd === 'h') r = v * k + (abs ? tx : 0);
    else if (cmd === 'V' || cmd === 'v') r = v * k + (abs ? ty : 0);
    else r = v * k + (abs ? (i % 2 ? ty : tx) : 0);
    out += ' ' + r.toFixed(2);
    i++;
  }
  return out.trim();
}

export default function mount(root, opts = {}) {
  const stage = root.querySelector('.sc__stage');
  const world = root.querySelector('.fis__world'), outside = root.querySelector('.fis__outside'), aside = root.querySelector('.fis__aside');
  const band = root.querySelector('.fis__band'), title = root.querySelector('.fis__title'), mark = root.querySelector('.fis__mark path');
  const d = opts.path || (mark && mark.getAttribute('d'));
  if (!stage || !world || !band || !title || !d) { root.classList.add('sc', 'is-rest'); return { destroy() {} }; }
  const [ax, ay] = opts.centre || [50, 50];
  const rin = opts.rin ?? 40;
  const turn0 = opts.turn ?? 34;
  let face = null, g = null;
  const ctrl = scene(root, {
    hold: opts.hold ?? 1,
    phone: 'rest',
    start() { face = title.cloneNode(true); face.className = 'fis__face'; face.removeAttribute('id'); face.setAttribute('aria-hidden', 'true'); stage.append(face); },
    measure(ctx) {
      const W = ctx.vw, H = ctx.vh;
      const S0 = Math.min(W, H) * 0.5;                              // the mark's size at the start (its 100-box)
      const need = Math.hypot(W, H) / 2 / (rin / 100) * 1.02;        // the size at which the inscribed circle covers the screen
      g = { W, H, S0, S1: need, cx: W / 2, cy: H * 0.5 };
    },
    update(p) {
      if (!g) return;
      const { H, S0, S1, cx, cy } = g;
      // the mark rises a little and turns to face you, then the camera flies at it (log-steady growth)
      const rise = (1 - seg(p, 0, 0.18, ease.out)) * H * 0.06;
      const turn = turn0 * (1 - seg(p, 0, 0.32, ease.inOut));
      const grow = seg(p, 0.2, 0.84, ease.in2);
      const S = Math.exp(lerp(Math.log(S0), Math.log(S1), grow));
      const covered = S >= S1 * 0.995;
      const k = S / 100;
      world.style.clipPath = covered ? 'none' : `path("${placePath(d, k, cx - ax * k, cy + rise - ay * k)}")`;
      world.style.transform = `perspective(1400px) rotateY(${turn.toFixed(2)}deg) scale(${(1 + 0.08 * seg(p, 0.84, 1, ease.out)).toFixed(4)})`;
      // the title on the face: it grows with the mark to its full size and no further, and goes as the band rises
      const tScale = Math.min(1, (S / S0) * 0.42);
      const kf = 1 - seg(p, 0.84, 0.9, ease.inOut);
      face.style.transform = `translate(-50%, -50%) translate3d(0, ${rise.toFixed(1)}px, 0) scale(${tScale.toFixed(4)})`;
      face.style.opacity = kf.toFixed(3); face.style.visibility = kf <= 0 ? 'hidden' : '';
      const kb = seg(p, 0.86, 1, ease.out);
      band.style.opacity = kb.toFixed(3); band.style.visibility = kb <= 0 ? 'hidden' : ''; band.style.transform = `translate3d(0, ${((1 - kb) * 24).toFixed(1)}px, 0)`;
      if (aside) { const ka = 1 - seg(p, 0.2, 0.34, ease.inOut); aside.style.opacity = ka.toFixed(3); aside.style.visibility = ka <= 0 ? 'hidden' : ''; }
      if (outside) outside.style.visibility = covered ? 'hidden' : '';
    },
    rest() {
      world.style.cssText = ''; band.style.cssText = ''; if (aside) aside.style.cssText = ''; if (outside) outside.style.cssText = '';
      if (face) face.style.cssText = '';
    },
  });
  return { destroy() { ctrl && ctrl.destroy(); if (face) face.remove(); } };
}

/*
  dither-sequence - two to six real photographs that belong together (a device from several sides, the
  stages of what the software makes, a game's scenes) printed with an ordered dither in the page palette,
  one canvas pixel per dither cell, and played like a slow loop of film. Each cut develops through the
  dither: the next photograph's darkest ink comes up first, cell by cell, along a thin accent front.
  Pass the client's own photographs.

  At rest it plays on its own: each frame holds (nothing is drawn while it holds), then wipes to the
  next. Hover: the pointer scrubs the sequence (left is the first frame, right the last) and a small
  pill shows where you are. Touch: drag. A photograph that fails to load is left out of the loop.

  src: an array of 2 to 6 photographs (paths, URLs, photos.json or library entries; each may carry its
  own focus [x, y]). params: cell (CSS px per dither cell), hold (seconds a frame stays, default 2.2),
  captions (one per frame; else the pill counts 01 / 04), focus (an array of [x, y], one per frame),
  fit ('cover' or 'contain': the whole photograph on the page's paper), autoplay (0 holds the first
  frame until hovered), drift (1 lets each frame drift slowly), alt.
*/
import { stage, tones, setTones, GLSL_PRINT, photoURL, loadImage, levels, cover, fallbackImage, clamp, color, paletteOf, MONO } from '../_scenes/kit.js';

// test pictures that belong together (four buildings, looking up), never shipped as a client's
const UNSPLASH = 'https://unsplash.com/license';
export const DEFAULT_SEQUENCE = [
  { id: 315, ratio: 1.4, focus: [0.5, 0.45], alt: 'Looking straight up a dark lightwell to a square of bright sky', by: 'Liam Andrew', licence: 'Unsplash licence', licenceUrl: UNSPLASH, page: 'https://unsplash.com/photos/W7CopGaHkEM' },
  { id: 951, ratio: 1.6, focus: [0.5, 0.5], alt: 'A building facade of red, yellow and white panels', by: 'Sérgio Rola', licence: 'Unsplash licence', licenceUrl: UNSPLASH, page: 'https://unsplash.com/photos/4aQY2CrXsa8' },
  { id: 942, ratio: 1.5, focus: [0.5, 0.6], alt: 'A white angular concrete building against a black sky', by: 'Carl Nenzen Loven', licence: 'Unsplash licence', licenceUrl: UNSPLASH, page: 'https://unsplash.com/photos/busqfOj6i80' },
  { id: 1081, ratio: 1.49, focus: [0.62, 0.5], alt: 'A stepped white building corner rising into a pale blue sky', by: 'Julien Moreau', licence: 'Unsplash licence', licenceUrl: UNSPLASH, page: 'https://unsplash.com/photos/688Fna1pwOQ' },
];

const frag = /* glsl */ `
${GLSL_PRINT}
uniform sampler2D u_ta, u_tb;
uniform vec4 u_fa, u_fb, u_ka, u_kb;   // fit (scale, offset); drift (zoom, pan x, pan y, -)
uniform vec2 u_la, u_lb;               // levels
uniform vec2 u_ca, u_cb;               // contain: the share of the frame the photograph fills (1, 1 = cover)
uniform float u_p, u_dark, u_cellPx;

vec2 uvOf(vec2 fc, vec4 fit, vec4 k, vec2 cn) {
  vec2 uv = vec2(fc.x / u_res.x, 1.0 - fc.y / u_res.y);
  uv = (uv - 0.5) / cn + 0.5;
  uv = (uv - 0.5) / k.x + 0.5 + k.yz;
  return fit.zw + uv * fit.xy;
}
float lum(vec3 c, vec2 lv) { return clamp((dot(c, vec3(0.2126, 0.7152, 0.0722)) - lv.x) / max(lv.y - lv.x, 0.05), 0.0, 1.0); }
// ink amount of one photograph at this cell, with a little local contrast so the dither keeps edges
float inkOf(sampler2D t, vec2 fc, vec4 fit, vec4 k, vec2 lv, vec2 cn) {
  vec2 uv = vec2(fc.x / u_res.x, 1.0 - fc.y / u_res.y);
  vec2 q = abs((uv - 0.5) / cn);
  if (max(q.x, q.y) > 0.5) return 0.0;   // outside a contained photograph: the paper
  float b = u_cellPx > 2.5 ? 1.0 : 0.5;
  float c = lum(texture(t, uvOf(fc, fit, k, cn), b).rgb, lv);
  vec2 o = vec2(3.0, 0.0);
  float s = lum(texture(t, uvOf(fc + o.xy, fit, k, cn), b + 1.5).rgb, lv) + lum(texture(t, uvOf(fc - o.xy, fit, k, cn), b + 1.5).rgb, lv)
          + lum(texture(t, uvOf(fc + o.yx, fit, k, cn), b + 1.5).rgb, lv) + lum(texture(t, uvOf(fc - o.yx, fit, k, cn), b + 1.5).rgb, lv);
  float l = clamp(c + 0.45 * (c - s * 0.25), 0.0, 1.0);
  // on a light page the shadows take ink, down to solid; on a dark page the light takes it, but a
  // bright photograph never prints as a solid light slab: its highlights stop short of full ink
  if (u_dark > 0.5) return smoothstep(0.12, 1.0, l) * 0.8;
  // (a pale sky stays paper, not a sparse grid of stray cells)
  return smoothstep(0.15, 0.97, 1.0 - l);
}

void main() {
  vec2 fc = gl_FragCoord.xy;
  float ink = inkOf(u_ta, fc, u_fa, u_ka, u_la, u_ca);
  bool front = false;
  if (u_p > 0.0) {
    float b = inkOf(u_tb, fc, u_fb, u_kb, u_lb, u_cb);
    // the cut: an ordered-dither wipe that crosses the frame on a slight diagonal; the next
    // photograph's deepest ink comes through a little ahead of the band
    vec2 uv = fc / u_res;
    float sweep = uv.x * 0.82 + (1.0 - uv.y) * 0.18;
    float thr = 0.8 * sweep + 0.14 * fx_bayer(fc) + 0.06 * (1.0 - b);
    float pp = u_p * 1.02;
    if (pp > thr) ink = b;
    // a thin accent line rides the leading edge of the wipe, once it is clear of the corner
    front = abs(0.8 * sweep - pp) < 0.4 / u_res.x && u_p > 0.03 && u_p < 0.97;
  }
  vec3 col = front ? printAccent(0.5, fc) : printInk(ink, fc);
  fxColor = vec4(col, 1.0);
}
`;

export default {
  id: 'dither-sequence',
  name: 'Dither sequence',
  kind: 'scene',
  mount(el, { palette, src, params = {} } = {}) {
    const list = (Array.isArray(src) ? (src.length ? src : DEFAULT_SEQUENCE) : src ? [src] : DEFAULT_SEQUENCE).slice(0, 6);
    const autoplay = params.autoplay !== 0;
    let given = palette || null;
    let T = tones(paletteOf(el, given));
    let prog = null;
    const imgs = new Array(list.length).fill(null), lvs = new Array(list.length).fill([0, 1]);
    let texes = new Array(list.length).fill(null);
    // the frames that loaded, in order (a failed photograph is left out, with its caption)
    let order = [];
    let pos = 0, target = 0, clock = 0, scrubbing = false, last = '';
    const hold = params.hold ?? 2.2, move = 1.5;
    const captionOf = k => (params.captions ? params.captions[k] || '' : null);

    // a small player pill: the caption of the frame and a timeline with one segment per photograph
    const ctl = document.createElement('div');
    ctl.className = 'scene-label';
    ctl.setAttribute('aria-hidden', 'true');
    Object.assign(ctl.style, { position: 'absolute', left: '14px', bottom: '14px', zIndex: '2', height: '28px', padding: '0 12px', display: 'none', alignItems: 'center', gap: '12px',
      borderRadius: '999px', pointerEvents: 'none', font: `500 11px/1 ${MONO}`, letterSpacing: '0.06em', textTransform: 'uppercase' });
    const cap = document.createElement('span');
    const bar = document.createElement('span');
    Object.assign(bar.style, { display: 'flex', gap: '4px', height: '2px' });
    ctl.append(cap, bar);
    el.append(ctl);
    let segs = [];
    const layoutPill = () => {
      bar.innerHTML = '';
      bar.style.width = `${Math.min(140, 30 * order.length)}px`;
      segs = order.map(() => {
        const sg = document.createElement('span');
        Object.assign(sg.style, { flex: '1', position: 'relative', borderRadius: '2px', overflow: 'hidden' });
        const f = document.createElement('i');
        Object.assign(f.style, { position: 'absolute', inset: '0', transformOrigin: 'left', transform: 'scaleX(0)' });
        sg.append(f); bar.append(sg);
        return [sg, f];
      });
      ctl.style.display = order.length > 1 && !s?.fallen ? 'flex' : 'none';
      style();
    };
    const style = () => {
      for (const [sg, f] of segs) { sg.style.background = color.mix(T.hex.bg, T.hex.ink, 0.2); f.style.background = T.hex.ink; }
      Object.assign(ctl.style, { color: T.hex.ink, background: T.hex.bg, boxShadow: '0 0 0 1px ' + color.mix(T.hex.bg, T.hex.ink, 0.12) });
    };

    let resolveReady;
    const ready = new Promise(r => (resolveReady = r));
    let s;
    const urls = list.map(p => photoURL(p, 1280));
    let settled = 0;
    urls.forEach((u, i) => loadImage(u).then(im => {
      imgs[i] = im; lvs[i] = levels(im);
      if (s && s.gl) texes[i] = s.texture(im, { mipmap: true });
    }).catch(err => console.warn(err.message)).finally(() => {
      if (++settled < urls.length) return;
      order = imgs.map((im, k) => (im ? k : -1)).filter(k => k >= 0);
      if (!order.length) s?.fail();
      else {
        layoutPill(); s?.syncPause(); s?.redraw();
        if (!params.alt) { const al = order.map(k => list[k].alt).filter(Boolean).join('; '); if (al) el.setAttribute('aria-label', al); }
      }
      resolveReady();
    }));

    s = stage(el, {
      name: 'photographs',
      cell: st => params.cell || clamp(Math.min(st.cssW, st.cssH) / 320, 2, 3),
      loops: () => autoplay && order.length > 1,
      // a wipe needs no more than 30 frames a second; a hold needs none
      fps: () => 30,
      init(gl, st) {
        prog = st.program(frag);
        texes = imgs.map(im => (im ? st.texture(im, { mipmap: true }) : null));
        last = '';
      },
      loaded: () => order.length > 0,
      ready: () => order.length > 0 && !!texes[order[0]],
      pointer(kind, st) {
        const N = order.length;
        if (kind === 'enter' || kind === 'down') scrubbing = true;
        if (kind === 'leave') { scrubbing = false; clock = 0; target = Math.round(pos); }
        if (st.reduced && st.pointer.inside && N) { pos = target = Math.floor(st.pointer.u * N * 0.999); }
      },
      frame(gl, t, dt, st) {
        const N = order.length;
        if (!N) return;
        const P = st.pointer;
        if (!st.reduced && dt > 0 && N > 1) {
          if (scrubbing && P.inside) {
            // the pointer picks a place on the timeline; the picture follows at a steady pace.
            // Each frame holds for most of its stretch and wipes to the next near its end
            const at = P.u * N * 0.9999, seg = Math.floor(at), fr = at - seg;
            const snapped = seg + (seg < N - 1 ? Math.min(1, Math.max(0, (fr - 0.68) / 0.3)) : 0);
            const want = Math.floor((pos + 0.0001) / N) * N + snapped;
            const d = want - pos, sp = 2.4 * dt;
            pos += Math.sign(d) * Math.min(Math.abs(d), sp + Math.abs(d) * 4 * dt);
          } else if (autoplay) {
            clock += dt;
            if (clock > hold + move) { clock = 0; target = Math.floor(target + 0.001) + 1; }
            const d = target - pos;
            pos += Math.sign(d) * Math.min(Math.abs(d), dt / move);
          }
        }
        if (pos > N * 50) { pos -= N * 40; target -= N * 40; }
        const k = Math.floor(pos), f = pos - k;
        const ia = ((k % N) + N) % N, ib = (ia + 1) % N;
        const p = f < 1e-4 ? 0 : Math.min(1, Math.max(0, (f - 0.02) / 0.96));
        const pe = p * p * (3 - 2 * p);
        const drift = params.drift === 1 && !st.reduced;
        // a hold: nothing changes, nothing is drawn
        const key = `${ia}:${ib}:${pe.toFixed(4)}`;
        if (dt > 0 && !st.dirty && !drift && key === last) return;
        last = key;
        segs.forEach(([, fill], i) => { fill.style.transform = `scaleX(${i <= ia ? 1 : i === ib ? pe : 0})`; });
        const at = pe > 0.5 ? ib : ia;
        const c = captionOf(order[at]) ?? String(at + 1).padStart(2, '0') + ' / ' + String(N).padStart(2, '0');
        if (cap.textContent !== c) cap.textContent = c;
        const A = order[ia], B = order[ib];
        const ta = texes[A], tb = texes[B] || ta;
        if (!ta) return;
        const contain = params.fit === 'contain';
        const fitOf = j => {
          const im = imgs[j], ia_ = im.naturalWidth / im.naturalHeight;
          const fo = (params.focus && params.focus[j]) || (list[j] && list[j].focus) || [0.5, 0.5];
          if (contain) return { fit: [1, 1, 0, 0], cn: (st.w / st.h) > ia_ ? [ia_ / (st.w / st.h), 1] : [1, (st.w / st.h) / ia_] };
          return { fit: cover(st.w, st.h, ia_, fo[0], fo[1], 1), cn: [1, 1] };
        };
        const kOf = j => {
          if (!drift) return [1, 0, 0, 0];
          const a = t * 0.11 + j * 2.1;
          return [1.035 + 0.015 * Math.sin(a), 0.006 * Math.sin(a * 0.8 + 1), 0.005 * Math.cos(a * 0.7), 0];
        };
        const fa = fitOf(A), fb = fitOf(B);
        prog.use();
        setTones(gl, prog, T);
        ta.bind(0); tb.bind(1);
        prog.int('u_ta', 0).int('u_tb', 1);
        prog.set('u_res', [st.w, st.h]).set('u_time', t).set('u_seed', 5).set('u_cellPx', st.k)
          .set('u_fa', fa.fit).set('u_fb', fb.fit).set('u_ca', fa.cn).set('u_cb', fb.cn).set('u_ka', kOf(A)).set('u_kb', kOf(B))
          .set('u_la', lvs[A]).set('u_lb', lvs[B]).set('u_p', pe).set('u_dark', T.dark ? 1 : 0);
        st.fullscreen();
      },
      fallback: () => fallbackImage(urls[order[0] ?? 0], params.alt || list[0].alt || '', 'cover', list[order[0] ?? 0]?.focus || [0.5, 0.5]),
      failed() { ctl.style.display = 'none'; },
    });
    const alt = params.alt || list.map(p => p.alt).filter(Boolean).join('; ');
    if (alt) { el.setAttribute('role', 'img'); el.setAttribute('aria-label', alt); }
    el.style.touchAction = 'pan-y';
    return {
      ready,
      destroy() { s.destroy(); ctl.remove(); },
      pause: () => s.pause(),
      resume: () => s.resume(),
      setPalette(p) { if (p !== undefined) given = p; T = tones(paletteOf(el, given)); style(); s.redraw(); },
    };
  },
};

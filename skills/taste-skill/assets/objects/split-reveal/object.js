/*
  split-reveal - a real photograph split by a line: on one side it is printed as a halftone screen in
  the page ink, on the other it is the photograph. Dots near the line take the photograph's own colour,
  so the print turns back into the picture as it reaches the seam. Pass the client's own photograph.

  It is still at rest (the line at its rest position, nothing drawn again). Hover: the line follows
  the pointer. Touch: drag it. Keyboard: the handle is a slider (arrow keys, Home, End).

  src: a photograph (a path, a URL, a photos.json or library entry). params: cell (screen pitch in CSS
  px, default from the panel size, 5 to 8, a little coarser on a dark ground), angle (degrees, default 45), split (0..1 rest position,
  default the entry's split, else 0.5), side ('left' halftone on the left, 'right'), focusX / focusY (0..1, where the cover
  crop centres; default the entry's focus), labels (1 shows two small chips, never under 480 px; their
  text labelPrint / labelPhoto), alt.
*/
import { stage, tones, photoURL, loadImage, levels, cover, fallbackImage, softCopy, approach, clamp, smooth, color, paletteOf, MONO } from '../_scenes/kit.js';

// a test picture with a clear subject and an open sky (never shipped as a client's)
export const DEFAULT_PHOTO = {
  id: 1081, ratio: 1.49, focus: [0.62, 0.5], split: 0.5,
  alt: 'A stepped white building corner rising into a pale blue sky',
  by: 'Julien Moreau', licence: 'Unsplash licence', licenceUrl: 'https://unsplash.com/license',
  page: 'https://unsplash.com/photos/688Fna1pwOQ',
};

const frag = /* glsl */ `
uniform sampler2D u_img, u_soft;
uniform vec4 u_fit;
uniform vec2 u_lv;
uniform float u_split, u_cell, u_angle, u_dark, u_lineW, u_band, u_left, u_dpr;
uniform vec3 u_bg, u_ink, u_line;

vec2 rot(vec2 v, float a) { float c = cos(a), s = sin(a); return vec2(c * v.x - s * v.y, s * v.x + c * v.y); }
vec2 imgUV(vec2 fc) {
  vec2 uv = vec2(fc.x / u_res.x, 1.0 - fc.y / u_res.y);
  return u_fit.zw + uv * u_fit.xy;
}
float lum(vec3 c) { return clamp((dot(c, vec3(0.2126, 0.7152, 0.0722)) - u_lv.x) / max(u_lv.y - u_lv.x, 0.05), 0.0, 1.0); }

void main() {
  vec2 fc = gl_FragCoord.xy;
  vec3 photo = texture(u_img, imgUV(fc)).rgb;
  // the halftone: a rotated amplitude screen; its tone is read from a copy of the photograph
  // softened to about the pitch, so a dark area stays an even screen and never breaks into blocks
  vec2 q = rot(fc, u_angle) / u_cell;
  vec3 cellCol = texture(u_soft, imgUV(fc)).rgb;
  float l = lum(cellCol);
  // a print, not a stencil: the light tones open up, the deepest stay short of solid. On a dark page
  // light takes the ink, so a bright wall or sky stays an open screen of separate dots (under half
  // cover, where the screen would close into a checkerboard), never a light slab
  float ink = u_dark > 0.5 ? l : 1.0 - l;
  ink = u_dark > 0.5 ? pow(smoothstep(0.06, 1.0, ink), 1.5) * 0.36 : pow(smoothstep(0.06, 1.0, ink), 1.25) * 0.9;
  // round dots: the dot's area is the ink, so they stay separate circles up to 78% cover (a light
  // tone never closes into a checkerboard), then grow into the corners of their cell
  float d = length(fract(q) - 0.5);
  float rad = ink < 0.785 ? sqrt(ink / 3.14159265) : mix(0.5, 0.7072, (ink - 0.785) / 0.215);
  float aa = max(fwidth(d), 1e-4) * 0.75;
  float dotA = (1.0 - smoothstep(rad - aa, rad + aa, d)) * smoothstep(0.015, 0.07, ink);
  // dots near the seam take the photograph's colour
  float dist = u_left > 0.5 ? u_split - fc.x : fc.x - u_split;
  float tint = 1.0 - smoothstep(0.0, u_band, dist);
  tint = tint * tint;
  vec3 dotCol = mix(u_ink, cellCol, tint * 0.92);
  vec3 ht = mix(u_bg, dotCol, dotA);
  float isHT = u_left > 0.5 ? step(fc.x, u_split) : step(u_split, fc.x);
  vec3 col = mix(photo, ht, isHT);
  // the line: page colour with a soft shadow either side
  float dl = abs(fc.x - u_split);
  float w = u_lineW * 0.5;
  float sh = (1.0 - smoothstep(w, w + 7.0 * u_dpr, dl)) * 0.2;
  col = mix(col, vec3(0.0), sh * (1.0 - u_dark * 0.5));
  col = mix(col, u_line, 1.0 - smoothstep(w - 0.5, w + 0.5, dl));
  fxColor = vec4(fx_dither(col), 1.0);
}
`;

function chip(text) {
  const c = document.createElement('span');
  c.className = 'scene-label';
  c.textContent = text;
  Object.assign(c.style, {
    position: 'absolute', bottom: '16px', zIndex: '2', display: 'inline-flex', alignItems: 'center', height: '26px', padding: '0 10px',
    borderRadius: '999px', font: `500 11.5px/1 ${MONO}`, letterSpacing: '0.03em',
    pointerEvents: 'none', whiteSpace: 'nowrap', transition: 'opacity .3s ease',
  });
  return c;
}

export default {
  id: 'split-reveal',
  name: 'Split reveal',
  kind: 'scene',
  mount(el, { palette, src, params = {} } = {}) {
    const photo = src || DEFAULT_PHOTO;
    // a path or URL has no notes; an entry may carry alt, focus and a rest split
    const meta = typeof photo === 'object' ? photo : {};
    const alt = params.alt || meta.alt || '';
    const left = params.side !== 'right';
    let given = palette || null;
    let T = tones(paletteOf(el, given));
    let img = null, soft = null, lv = [0, 1], prog = null, tex = null, stex = null, softW = 0;
    const rest = clamp(params.split ?? meta.split ?? 0.5, 0.1, 0.9);
    let split = rest, dragging = false, keyed = false, drawn = -1;
    // the screen pitch: coarse enough that a dot is a dot at card size (under about 5 px it turns
    // into a pixel checkerboard), a little coarser on a dark ground, where light tones take the ink
    const cellOf = st => params.cell || clamp(Math.min(st.cssW, st.cssH) / 84, 5, 8) * (T.dark ? 1.15 : 1);
    const angle = ((params.angle ?? 45) * Math.PI) / 180;
    const focus = [params.focusX ?? meta.focus?.[0] ?? 0.5, params.focusY ?? meta.focus?.[1] ?? 0.5];

    // overlays: the handle (a slider) and, on request, two chips
    const handle = document.createElement('div');
    handle.setAttribute('role', 'slider');
    handle.setAttribute('tabindex', '0');
    handle.setAttribute('aria-label', params.handleLabel || 'Move the line between the print and the photograph');
    handle.setAttribute('aria-valuemin', '0');
    handle.setAttribute('aria-valuemax', '100');
    Object.assign(handle.style, {
      position: 'absolute', top: '50%', left: '0', width: '40px', height: '40px', marginLeft: '-20px', marginTop: '-20px', borderRadius: '50%',
      zIndex: '3', cursor: 'ew-resize', display: 'grid', placeItems: 'center', touchAction: 'none',
    });
    handle.innerHTML = '<span style="display:flex;gap:8px;align-items:center"><i style="width:0;height:0;border:4.5px solid transparent;border-right:5.5px solid currentColor;border-left:0"></i><i style="width:0;height:0;border:4.5px solid transparent;border-left:5.5px solid currentColor;border-right:0"></i></span>';
    const chips = params.labels === 1 ? [chip(params.labelPrint || 'Print'), chip(params.labelPhoto || 'Photograph')] : [];
    if (chips.length) { chips[0].style[left ? 'left' : 'right'] = '16px'; chips[1].style[left ? 'right' : 'left'] = '16px'; }
    el.append(handle, ...chips);
    const style = () => {
      Object.assign(handle.style, { background: T.hex.bg, color: T.hex.ink, boxShadow: `0 0 0 1px ${color.mix(T.hex.bg, T.hex.ink, 0.18)}, 0 6px 18px rgb(0 0 0 / 0.18)` });
      for (const c of chips) Object.assign(c.style, { color: T.hex.ink, background: T.hex.bg, boxShadow: `0 0 0 1px ${color.mix(T.hex.bg, T.hex.ink, 0.14)}` });
    };
    style();

    const place = st => {
      handle.style.transform = `translateX(${split * st.cssW}px)`;
      handle.setAttribute('aria-valuenow', String(Math.round(split * 100)));
      if (chips.length) {
        const room = st.cssW >= 480;
        const a = left ? split : 1 - split, b = 1 - a;
        chips[0].style.opacity = room ? String(smooth(0.14, 0.28, a)) : '0';
        chips[1].style.opacity = room ? String(smooth(0.14, 0.28, b)) : '0';
      }
    };

    let s;
    let resolveReady;
    const ready = new Promise(r => (resolveReady = r));
    const width = Math.min(1920, Math.max(960, Math.ceil(((el.clientWidth || 800) * Math.min(window.devicePixelRatio || 1, 1.5)) / 320) * 320));
    const url = photoURL(photo, width);
    // the softened copy for the tone, at about two texels per screen cell across the cover crop
    const softFor = st => {
      if (!img) return null;
      const fit = cover(st.w, st.h, img.naturalWidth / img.naturalHeight, focus[0], focus[1]);
      const want = Math.round(clamp(((st.cssW / cellOf(st)) * 2) / fit[0], 64, 1400));
      if (soft && Math.abs(want - softW) / want < 0.25) return soft;
      softW = want;
      soft = softCopy(img, want, 0.9);
      if (stex && st.gl) { st.gl.deleteTexture(stex.t); stex = null; }
      return soft;
    };
    loadImage(url).then(im => {
      img = im; lv = levels(im);
      if (s && s.gl && !tex) tex = s.texture(img, { mipmap: true });
      s?.redraw(); resolveReady();
    }).catch(err => { console.warn(err.message); s?.fail(); resolveReady(); });

    s = stage(el, {
      name: 'split',
      init(gl, st) {
        prog = st.program(frag);
        tex = img ? st.texture(img, { mipmap: true }) : null;
        stex = null; soft = null;
      },
      loaded: () => !!img,
      ready: () => !!tex,
      pointer(kind, st) {
        const P = st.pointer;
        if (kind === 'down') dragging = true;
        if (kind === 'up' || kind === 'leave') dragging = false;
        if (P.inside && (P.type === 'mouse' || dragging)) keyed = false;
        if (st.reduced && P.inside && (P.type === 'mouse' || dragging)) split = clamp(P.u, 0.02, 0.98);
      },
      frame(gl, t, dt, st) {
        const P = st.pointer;
        const follow = P.inside && (P.type === 'mouse' || dragging);
        const target = follow ? clamp(P.u, 0.02, 0.98) : keyed ? split : rest;
        if (st.reduced || dt === 0) { if (!follow && !keyed) split = rest; }
        else split = Math.abs(target - split) < 1e-4 ? target : approach(split, target, follow ? 11 : 4, dt);
        place(st);
        if (!tex) return;
        // nothing moved: the canvas keeps its picture
        if (dt > 0 && !st.dirty && Math.abs(split - drawn) < 1e-4) return;
        drawn = split;
        const sc = softFor(st);
        if (!stex && sc) stex = st.texture(sc);
        const fit = cover(st.w, st.h, img.naturalWidth / img.naturalHeight, focus[0], focus[1]);
        prog.use();
        tex.bind(0); prog.int('u_img', 0);
        (stex || tex).bind(1); prog.int('u_soft', 1);
        prog.set('u_res', [st.w, st.h]).set('u_time', t).set('u_seed', 3)
          .set('u_fit', fit).set('u_lv', lv)
          .set('u_split', split * st.w).set('u_cell', cellOf(st) * st.dpr).set('u_angle', angle).set('u_dark', T.dark ? 1 : 0)
          .set('u_lineW', 2 * st.dpr).set('u_band', 0.22 * st.w).set('u_left', left ? 1 : 0).set('u_dpr', st.dpr)
          .set('u_bg', T.r[0]).set('u_ink', T.r[3]).set('u_line', T.r[0]);
        st.fullscreen();
      },
      resize() { drawn = -1; },
      fallback: () => fallbackImage(url, alt, 'cover', focus),
      failed() { for (const n of [handle, ...chips]) n.style.display = 'none'; },
    });

    // keyboard on the handle
    handle.addEventListener('keydown', e => {
      const step = e.shiftKey ? 0.1 : 0.04;
      let v = split;
      if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') v -= step;
      else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') v += step;
      else if (e.key === 'Home') v = 0.02;
      else if (e.key === 'End') v = 0.98;
      else return;
      e.preventDefault();
      keyed = true;
      split = clamp(v, 0.02, 0.98);
      place(s);
      s.redraw();
    });
    if (alt) { el.setAttribute('role', 'group'); el.setAttribute('aria-label', alt); }
    el.style.touchAction = 'pan-y';

    return {
      ready,
      destroy() { s.destroy(); handle.remove(); chips.forEach(c => c.remove()); },
      pause: () => s.pause(),
      resume: () => s.resume(),
      setPalette(p) { if (p !== undefined) given = p; T = tones(paletteOf(el, given)); style(); s.redraw(); },
    };
  },
};

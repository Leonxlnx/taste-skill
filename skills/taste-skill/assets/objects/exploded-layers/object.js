/*
  exploded-layers - a real photograph taken apart into four printed sheets standing in perspective:
  the photograph on top, then a halftone screen in the accent, an ordered dither in the ink and a
  plate of tone contours at the bottom; the halftone and the dither are printed on clear sheets. One
  canvas for all four. For a page that explains layers or passes: print and photo work, imaging and
  design software, a product shown as what it is made of. Pass the client's own photograph, or up to
  four (one per sheet, top first), and name the sheets in the client's words.

  At rest the sheets lie in a neat stack a card's thickness apart, the photograph on top and the
  three below as plain card, large and drawn once. Hover: they open apart and their prints come up,
  the stack leans toward the pointer, and with `names` each sheet gets a label on a leader line from the middle
  of its right edge (where the panel is 560 px wide or more). Touch: tap opens, tap closes.

  src: a photograph (a path, a URL, a photos.json or library entry) or an array of up to four.
  params: names (four labels, top sheet first; no labels without them), labels (0 hides them),
  focusX / focusY (cover crop centre), aspect (sheet width / height, default the photograph's,
  clamped 1.2..1.6), alt.
*/
import { stage, tones, photoURL, loadImage, levels, cover, fallbackImage, approach, clamp, smooth, mat4, color, paletteOf, MONO } from '../_scenes/kit.js';

export const DEFAULT_PHOTO = { id: 304, ratio: 1.5, alt: 'A hand on the faders of a mixing desk', by: 'Drew Patrick Miller', licence: 'Unsplash licence', licenceUrl: 'https://unsplash.com/license', page: 'https://unsplash.com/photos/_o6AAx9dl_Y' };

const vert = /* glsl */ `
in vec2 a_pos;
uniform mat4 u_mvp;
out vec2 v_uv;
void main() {
  v_uv = a_pos * 0.5 + 0.5;
  gl_Position = u_mvp * vec4(a_pos, 0.0, 1.0);
}
`;

const frag = /* glsl */ `
uniform sampler2D u_img;
uniform vec4 u_fit;
uniform vec2 u_lv, u_plate;      // levels; sheet size in screen px (for line widths and the edge)
uniform float u_mode, u_dark, u_alpha, u_edge, u_reveal;
uniform vec3 u_bg, u_surface, u_ink, u_muted, u_acc;
in vec2 v_uv;

vec2 iuv(vec2 uv) { return u_fit.zw + vec2(uv.x, 1.0 - uv.y) * u_fit.xy; }
float lum(vec3 c) { return clamp((dot(c, vec3(0.2126, 0.7152, 0.0722)) - u_lv.x) / max(u_lv.y - u_lv.x, 0.05), 0.0, 1.0); }

void main() {
  vec2 uv = v_uv;
  vec4 col = vec4(0.0);
  float edgeD = min(min(uv.x, 1.0 - uv.x) * u_plate.x, min(uv.y, 1.0 - uv.y) * u_plate.y);
  float edge = 1.0 - smoothstep(0.6, 1.6, edgeD);
  if (u_mode < 0.5) {
    // contours of the photograph's tone on a solid plate
    float l = lum(texture(u_img, iuv(uv), 2.5).rgb);
    float v = l * 9.0 + 0.5;
    float fw = max(fwidth(v), 1e-4);
    float line = 1.0 - smoothstep(0.5, 1.4, abs(fract(v + 0.5) - 0.5) / fw);
    vec3 c = mix(u_surface, u_dark > 0.5 ? u_muted : u_ink, line * 0.75);
    col = vec4(c, 1.0);
  } else if (u_mode < 1.5) {
    // ordered dither in the ink, on a clear sheet
    vec2 cells = vec2(132.0, 132.0 * u_plate.y / u_plate.x);
    vec2 cid = floor(uv * cells);
    vec2 cuv = (cid + 0.5) / cells;
    float l = lum(texture(u_img, iuv(cuv), 1.0).rgb);
    float ink = u_dark > 0.5 ? l : 1.0 - l;
    float th = fx_bayer(cid);
    float v = ink * 2.0;
    float lvl = floor(v) + step(th + 1.0 / 128.0, fract(v));
    vec3 c = lvl > 1.5 ? u_ink : u_muted;
    float a = lvl > 0.5 ? 1.0 : 0.0;
    col = vec4(c * a, a);
    col += vec4(u_surface, 1.0) * 0.16 * (1.0 - col.a);
  } else if (u_mode < 2.5) {
    // a halftone screen in the accent, on a clear sheet
    vec2 px = uv * u_plate;
    float cell = max(7.0, u_plate.x / 74.0);
    float an = 0.785398;
    vec2 q = mat2(cos(an), -sin(an), sin(an), cos(an)) * px / cell;
    float l = lum(texture(u_img, iuv(uv), 1.8).rgb);
    // the halftone is the shadow plate on any page: dots where the photograph is dark
    float ink = smoothstep(0.08, 1.0, (1.0 - l) * 0.9);
    float f = 0.5 * (cos(6.2831853 * q.x) + cos(6.2831853 * q.y));
    float g = f - (1.0 - 2.0 * ink);
    float aa = max(fwidth(g), 1e-4) * 0.8;
    float a = smoothstep(-aa, aa, g) * smoothstep(0.02, 0.06, ink);
    col = vec4(u_acc * a, a);
    col += vec4(u_surface, 1.0) * 0.16 * (1.0 - col.a);
  } else {
    // the photograph
    col = vec4(texture(u_img, iuv(uv)).rgb, 1.0);
  }
  // closed, the sheets under the photograph are plain card, so the stack's edges read as paper; their
  // prints come up as they open
  if (u_mode < 2.5) col = mix(vec4(u_surface, 1.0), col, u_reveal);
  // a hairline round each sheet, and a soft outer pixel instead of multisampling
  vec3 ec = mix(u_bg, u_ink, 0.38);
  col = mix(col, vec4(ec, 1.0), edge * u_edge);
  fxColor = col * u_alpha * smoothstep(0.0, 1.0, edgeD);
}
`;

export default {
  id: 'exploded-layers',
  name: 'Exploded layers',
  kind: 'scene',
  mount(el, { palette, src, params = {} } = {}) {
    const list = (Array.isArray(src) ? src : [src || DEFAULT_PHOTO]).filter(Boolean).slice(0, 4);
    if (!list.length) list.push(DEFAULT_PHOTO);
    // sheet i (0 the bottom plate, 3 the photograph on top) prints photograph (3 - i) of the list, or the first
    const photoOf = i => Math.min(3 - i, list.length - 1);
    const first = list[0];
    const alt = params.alt || first.alt || '';
    let given = palette || null;
    let T = tones(paletteOf(el, given));
    const imgs = new Array(list.length).fill(null), lvs = new Array(list.length).fill([0, 1]);
    let texes = new Array(list.length).fill(null);
    let prog = null, quad = null;
    let open = 0, yaw = 0, pitch = 0, tapOpen = false, last = '';
    const urls = list.map(p => photoURL(p, 1280));
    const aspect = clamp(params.aspect || first.ratio || 1.5, 1.2, 1.6);
    const names = Array.isArray(params.names) ? params.names.slice(0, 4) : null;

    // labels on leader lines, only with the client's names for the sheets
    const labels = names ? names.map((n, k) => {
      const d = document.createElement('div');
      d.className = 'scene-label';
      d.setAttribute('aria-hidden', 'true');
      d.innerHTML = '<i></i><u></u><span></span>';
      d.querySelector('span').textContent = n;
      Object.assign(d.style, { position: 'absolute', left: '0', top: '0', zIndex: '2', display: 'flex', alignItems: 'center', pointerEvents: 'none',
        font: `500 12px/1 ${MONO}`, letterSpacing: '0.02em', whiteSpace: 'nowrap', opacity: '0', willChange: 'transform, opacity' });
      Object.assign(d.querySelector('i').style, { display: 'block', width: '5px', height: '5px', borderRadius: '50%', margin: '0 0 0 -2.5px', flex: 'none' });
      Object.assign(d.querySelector('u').style, { display: 'block', height: '1px', width: '40px', margin: '0 10px 0 0', flex: 'none' });
      el.append(d);
      return d;
    }) : [];
    const style = () => {
      labels.forEach(d => {
        d.style.color = T.hex.ink;
        d.querySelector('i').style.background = T.hex.ink;
        d.querySelector('u').style.background = color.mix(T.hex.bg, T.hex.ink, 0.45);
      });
    };
    style();

    let resolveReady;
    const ready = new Promise(r => (resolveReady = r));
    let s, settled = 0;
    urls.forEach((u, k) => loadImage(u).then(im => {
      imgs[k] = im; lvs[k] = levels(im);
      if (s && s.gl) texes[k] = s.texture(im, { mipmap: true });
      s?.redraw();
    }).catch(err => console.warn(err.message)).finally(() => {
      if (++settled < urls.length) return;
      // without the top photograph there is nothing to take apart
      if (!imgs[0]) s?.fail();
      resolveReady();
    }));

    // the stack in world units: sheets 2*aspect x 2 lying in XY, stacked along z
    const sheet = (st, i, gap, yawA, pitchA, fit) => {
      const z = (i - 1.5) * gap;
      const view = mat4.mul(mat4.translate(fit.cx, fit.cy, -fit.dist), mat4.mul(mat4.rx(-pitchA), mat4.rz(yawA)));
      const model = mat4.mul(mat4.translate(0, 0, z), mat4.scale(aspect, 1, 1));
      return mat4.mul(fit.proj, mat4.mul(view, model));
    };
    let fitCache = {};
    // three framings: the closed stack large in the middle, the open stack in the middle, and the open
    // stack moved left to make room for the labels; the frame slides between them as the sheets separate
    const showLabels = st => labels.length > 0 && params.labels !== 0 && st.cssW >= 560;
    const fitAt = (st, k) => {
      const a = fitFor(st, false, true), b = fitFor(st, showLabels(st), false);
      return { proj: a.proj, dist: a.dist + (b.dist - a.dist) * k, cx: a.cx + (b.cx - a.cx) * k, cy: a.cy + (b.cy - a.cy) * k };
    };
    // closed, the sheets lie a card's thickness apart: a neat stack, the photograph on top
    const BASE_YAW = -0.5, BASE_PITCH = 0.9, OPEN_GAP = 0.74, REST_GAP = 0.055;
    const fitFor = (st, withLabels, closed) => {
      const key = `${st.w}x${st.h}:${withLabels}:${closed}`;
      if (fitCache[key]) return fitCache[key];
      const ar = st.w / st.h;
      const proj = mat4.perspective((30 * Math.PI) / 180, ar, 0.1, 100);
      // fit the fully opened stack, leaning both ways, inside the frame
      const fit = { key, proj, dist: 10, cx: 0, cy: 0 };
      const box = () => {
        let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
        for (const yw of [BASE_YAW - 0.16, BASE_YAW + 0.16]) for (const pt of [BASE_PITCH - 0.05, BASE_PITCH + 0.05]) for (const i of [0, 3]) {
          const m = sheet(st, i, closed ? REST_GAP : OPEN_GAP, yw, pt, fit);
          for (const [x, y] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
            const p = mat4.apply(m, [x, y, 0]);
            x0 = Math.min(x0, p[0]); x1 = Math.max(x1, p[0]); y0 = Math.min(y0, p[1]); y1 = Math.max(y1, p[1]);
          }
        }
        return [x0, x1, y0, y1];
      };
      // the stack takes the left of the frame when labels show beside it, else the middle
      const ax = withLabels ? [-0.94, 0.4] : closed ? [-0.84, 0.84] : [-0.9, 0.9], ay = closed ? [-0.8, 0.8] : [-0.88, 0.88];
      let [x0, x1, y0, y1] = box();
      fit.dist = 10 / Math.min((ax[1] - ax[0]) / (x1 - x0), (ay[1] - ay[0]) / (y1 - y0));
      [x0, x1, y0, y1] = box();
      fit.dist = fit.dist / Math.min((ax[1] - ax[0]) / (x1 - x0), (ay[1] - ay[0]) / (y1 - y0));
      [x0, x1, y0, y1] = box();
      fit.cx = ((((ax[0] + ax[1]) / 2) - (x0 + x1) / 2) * fit.dist) / proj[0];
      fit.cy = ((0 - (y0 + y1) / 2) * fit.dist) / proj[5];
      fitCache[key] = fit;
      return fit;
    };

    s = stage(el, {
      name: 'layers',
      heavy: true,
      init(gl, st) {
        prog = st.program(frag, vert);
        quad = st.buffer(new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]));
        texes = imgs.map(im => (im ? st.texture(im, { mipmap: true }) : null));
        last = '';
      },
      loaded: () => !!imgs[0],
      ready: () => !!texes[0],
      resize() { fitCache = {}; last = ''; },
      pointer(kind, st) {
        if (kind === 'down' && st.pointer.type !== 'mouse') tapOpen = !tapOpen;
      },
      frame(gl, t, dt, st) {
        const P = st.pointer;
        const hov = (P.inside && P.type === 'mouse') || tapOpen;
        const want = hov ? 1 : 0;
        const still = st.reduced || dt === 0;
        open = st.reduced ? want : still ? open : approach(open, want, 4.2, dt);
        if (Math.abs(open - want) < 0.002) open = want;
        const lean = hov && P.type === 'mouse' ? P.u - 0.5 : 0, tilt = hov && P.type === 'mouse' ? P.v - 0.5 : 0;
        yaw = st.reduced ? lean * 0.3 : still ? yaw : approach(yaw, lean * 0.3, 3, dt);
        pitch = st.reduced ? tilt * 0.12 : still ? pitch : approach(pitch, tilt * 0.12, 3, dt);
        if (!texes[0]) return;
        // nothing moved: the canvas keeps its picture
        const key = [open, yaw, pitch].map(v => v.toFixed(4)).join();
        if (dt > 0 && !st.dirty && key === last) return;
        last = key;
        const gap = REST_GAP + (OPEN_GAP - REST_GAP) * smooth(0, 1, open);
        const bg = T.r[0];
        gl.clearColor(bg[0], bg[1], bg[2], 1);
        gl.clear(gl.COLOR_BUFFER_BIT);
        const fit = fitAt(st, smooth(0, 1, open));
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
        prog.use();
        prog.set('u_res', [st.w, st.h]).set('u_time', t).set('u_seed', 2).set('u_dark', T.dark ? 1 : 0).set('u_reveal', smooth(0.05, 0.6, open))
          .set('u_bg', T.r[0]).set('u_surface', color.vec3(T.hex.surface)).set('u_ink', T.r[3]).set('u_muted', T.r[2]).set('u_acc', T.a[1]);
        gl.bindBuffer(gl.ARRAY_BUFFER, quad);
        gl.enableVertexAttribArray(0);
        gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
        const lab = showLabels(st);
        for (let i = 0; i < 4; i++) {
          const k = texes[photoOf(i)] ? photoOf(i) : 0, im = imgs[k];
          texes[k].bind(0); prog.int('u_img', 0);
          const cov = cover(aspect * 100, 100, im.naturalWidth / im.naturalHeight, params.focusX ?? list[k].focus?.[0] ?? 0.5, params.focusY ?? list[k].focus?.[1] ?? 0.5);
          const m = sheet(st, i, gap, BASE_YAW + yaw, BASE_PITCH + pitch, fit);
          // sheet size on screen, for hairlines one device pixel wide
          const a = mat4.apply(m, [-1, 0, 0]), b = mat4.apply(m, [1, 0, 0]), c = mat4.apply(m, [0, -1, 0]), d = mat4.apply(m, [0, 1, 0]);
          const pw = Math.hypot((b[0] - a[0]) * st.w / 2, (b[1] - a[1]) * st.h / 2), ph = Math.hypot((d[0] - c[0]) * st.w / 2, (d[1] - c[1]) * st.h / 2);
          prog.set('u_mvp', m).set('u_mode', i).set('u_plate', [pw, ph]).set('u_alpha', 1).set('u_edge', i === 3 ? 0.0 : 0.9)
            .set('u_fit', cov).set('u_lv', lvs[k]);
          gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
          // the label of sheet i: a dot on the middle of the sheet's right-hand edge (the edge that
          // reaches furthest right on screen), a leader straight out to the label column
          const L = labels[3 - i];
          if (!L) continue;
          if (lab) {
            const toCss = p => [(p[0] * 0.5 + 0.5) * st.cssW, (1 - (p[1] * 0.5 + 0.5)) * st.cssH];
            const corners = [[1, -1], [1, 1], [-1, 1], [-1, -1]].map(q => toCss(mat4.apply(m, [q[0], q[1], 0])));
            let e = 0;
            for (let j = 1; j < 4; j++) {
              const cx = (corners[j][0] + corners[(j + 1) % 4][0]) / 2, bx = (corners[e][0] + corners[(e + 1) % 4][0]) / 2;
              if (cx > bx) e = j;
            }
            const p0 = corners[e], p1 = corners[(e + 1) % 4];
            // the edge's point 60% of the way toward its right-hand end, so it clears the sheet above
            const r0 = p0[0] > p1[0] ? p1 : p0, r1 = p0[0] > p1[0] ? p0 : p1;
            const x = r0[0] + (r1[0] - r0[0]) * 0.6, y = r0[1] + (r1[1] - r0[1]) * 0.6;
            const lx = Math.max(r1[0] + 24, st.cssW * 0.72);
            L.querySelector('u').style.width = `${Math.max(16, lx - x - 12)}px`;
            L.style.transform = `translate(${x}px, ${y - 6}px)`;
            L.style.opacity = String(clamp((open - 0.45) / 0.45, 0, 1));
          } else L.style.opacity = '0';
        }
        gl.disable(gl.BLEND);
      },
      fallback: () => fallbackImage(urls[0], alt, 'cover', first.focus || [0.5, 0.5]),
      failed() { labels.forEach(l => l.remove()); },
    });
    if (alt) { el.setAttribute('role', 'img'); el.setAttribute('aria-label', alt); }
    return {
      ready,
      destroy() { s.destroy(); labels.forEach(l => l.remove()); },
      pause: () => s.pause(),
      resume: () => s.resume(),
      setPalette(p) { if (p !== undefined) given = p; T = tones(paletteOf(el, given)); style(); s.redraw(); },
    };
  },
};

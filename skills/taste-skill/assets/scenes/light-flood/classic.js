// assets/scenes/light-flood/classic.js - the 2.4 scene file, kept as it was; scene.js loads it through classic/classic.js.
// tasteskill / scenes / light-flood.js — a pinned one-sentence statement plays out a day in one scroll.
//
// A soft dome of light rises from the bottom edge like a sun coming up behind the sentence, then swells
// past every edge until the whole screen is lit. Night falls from the top corners inward, so what is
// left of the light is a dome again; it shrinks and sinks below the edge and goes out, and the scene
// ends on the next section's dark ground with no seam. One shape tells the whole day. A rack focus runs
// alongside: the lead (the setup words) starts sharp and goes soft and away, while the key phrase starts
// as an unlit ghost (warm white on the pale day ground), is revealed by the light behind it, stays crisp
// to the end and lifts out of the last light to sit alone in the middle of the night.
//
// Nothing here is a CSS gradient: the dome and the night are flat shapes with a Gaussian edge, painted
// once (canvas textures in the live scene, blurred divs in the finished composition) and then only
// scaled, moved or faded. Each texture runs 3.5 sigma past its shape on every side, so the soft edge
// fades to nothing inside the canvas (a tail cut by the canvas edge shows as a straight lid on the
// dome). Their soft edges carry a 1/255 dither, painted in, so the dark falloffs never band; the solid
// night stays exactly the token. The ground changes by cross-fading flat colour layers.
// No filter is ever animated either, and none runs on the GPU per frame: the rack focus is a ladder of
// copies of each line painted once into canvases, blurred on the CPU to fixed radii (key 4, 2, 0.9px;
// lead 1.5, 3.4, 6px), and focus moves by cross-fading neighbours on the ladder (opacity only). Two
// neighbours differ by a pixel or two of blur, so every in-between frame reads as the line at an
// in-between focus, never as sharp letters with a glow or a dark fringe round them, and the first scroll
// through costs what every later one does (no blur shader to compile as the scene comes into view).
//
// No photographs. Use it for a brand chapter, a day-to-night turn in hospitality, wellness or finance,
// or one statement worth three screens; once per page. Not for anything that has to be read in detail:
// the stage holds the sentence and nothing else (no body copy, buttons, labels or logos).
//
// Needs gsap + ScrollTrigger (no SplitText), stage.js and light-flood.css.
//
// DOM (the CSS draws the finished composition from the same markup; the script adds any missing
// decorative layer, so the h2 alone also works; with focus "rack" it also adds three
// <div class="lf-soft" aria-hidden="true">, copies of the two lines laid out from generated content
// (no text of their own), each line holding a canvas the script paints blurred; live scene only):
//   <section class="scene" data-scene="light-flood" data-options='{}' aria-labelledby="lf-h">
//     <div class="scene-stage">
//       <div class="lf-ground" aria-hidden="true"></div>
//       <div class="lf-ground lf-ground--core" aria-hidden="true"></div>
//       <div class="lf-ground lf-ground--night" aria-hidden="true"></div>
//       <div class="lf-sun" aria-hidden="true"><div class="lf-halo"></div><div class="lf-core"></div></div>
//       <div class="lf-night" aria-hidden="true"><div class="lf-night__fill"></div></div>
//       <h2 class="lf-line" id="lf-h">
//         <span class="lf-lead">The sun goes down,</span>     2-4 words, one line, 18 characters or fewer
//         <span class="lf-key">the fire stays up.</span>      2-3 words, one line, 18 characters or fewer
//       </h2>
//     </div>
//   </section>
//   The section before sits on --lf-day; the section after on --lf-night (or --lf-core with
//   ending "flood"). The h2 always holds the whole sentence; nothing is split or hidden from readers.
//   The copy limit is hard: 18 characters a line (counting spaces and punctuation). Each line is sized
//   to stay one line (36px at the least, the key always 1.15x the lead or more), so the headline is two
//   lines down to a 390px phone. Longer copy wraps (a three- or four-line headline, which the house
//   rules do not allow) and the console says so: shorten the copy, do not ship the wrap.
//
// Colours (CSS custom properties on the section or :root; see light-flood.css): --lf-day, --lf-halo,
// --lf-core, --lf-night, --lf-ink, --lf-key. The core must have a relative luminance of 0.15-0.25 so the
// ink lead and the white key both clear 3:1 on it. Or pick a checked preset with the palette option.
//
// Options (data-options JSON; defaults, ranges):
//   palette     ""        "dusk" | "sky" | "sage" sets all six colours (dusk: #e6ebee / #f7b08a /
//                         #f0401c / #101820 / #121820 / #ffffff). Empty: the CSS tokens (dusk by default).
//   direction   "dusk"    "dusk": day, light, night | "dawn": night, light, day (lead in the key white,
//                         key phrase in ink; add class lf--dawn to the section too, so the no-script
//                         composition matches). In dawn the light is all core colour (the pale halo
//                         would pass behind the white lead at under 3:1 and turn brown over the night),
//                         and the page before is the night, so a fixed header's own style must be light
//                         on dark; the scene adds headerClass ("is-light") once the day reaches it
//   ending      "night"   "night": the light goes out and the scene ends on --lf-night | "flood": the
//                         sentence holds on the full flood and the scene ends on --lf-core (add class
//                         lf--flood to the section too, for the no-script composition)
//   focus       "rack"    "rack": key 4px -> sharp, lead sharp -> 6px and away, each a cross-fade along
//                         a ladder of copies blurred once (phone: 3px and 4px) | "flat": no blur, only
//                         opacity (always flat on devices with 4 cores or fewer)
//   hold        1.2       1-1.5 screens the stage is held: one short sentence is read in about one screen,
//                         and a longer hold is dead scroll; the section is hold + 1
//   phoneHold   1.2       1-1.5
//   flood       3         2.4-3.6 end scale of the dome (2.4 leaves halo in the corners, 3.6 pure fill)
//   phoneFlood  3.6       2.4-4.2
//   scrub       0.6       seconds of catch-up; true (locked) is used when Lenis is smoothing the page
//   header      ""        selector of a fixed header over the scene. It gets headerClass while the
//   headerClass "is-dark" night (dawn: the day) is under it ("is-light" with direction dawn), and loses it
//                         when scrolled back; style that class. With reduced motion it follows the
//                         finished panel's night band instead.
//   phone       "same"    "same": the same scene with phone numbers (broad 240% x 100% dome, scale 0.6 ->
//                         1.2 -> 3.6, blur 3 / 4px) | "rest": the phone gets the finished composition
//
// Timeline (fractions of the hold):
//   rise       dome 0.5 -> 1 (0-0.24, power1.out) and up from +0.12H to -0.12H (0-0.30); key 4px -> sharp
//              along the ladder, fast then slow (4 -> 2px 0.165-0.22, 2 -> 0.9px 0.225-0.28, 0.9px ->
//              sharp 0.285-0.335; about 1.6px at 0.25), with a lens breath on the blurred rungs, scale
//              1.05 -> 1 (0.16-0.285); with focus "flat" the light alone reveals the key
//   flood      dome 1 -> 3 (0.24-0.42, power2.in, past every edge); ground to core under it (0.30-0.42)
//   hold       0.42-0.52, the whole sentence sharp on the flood
//   nightfall  lead sharp -> 6px along the ladder (0.53-0.645; about 3.4px at 0.60), slightly smaller
//              and up (0.52-0.74), and gone (0.63-0.75); the night plate
//              falls from the top (0.54-0.84, power1.inOut), its front a wide arc whose sides lead, until
//              the light left is a dome whose top is at 58% of the height; halo fades (0.56-0.70); ground
//              to night under it all (0.62-0.80); the light shrinks to 1.15 (0.64-0.92) and sinks to
//              +0.25H (0.64-0.96); the key lifts to 48% of the height (0.74-0.90, sine.inOut)
//   lights out the dome fades (0.84-0.96); 0.96-1 solid night with the key alone
//
// Robust to: copy of up to 18 characters a line at any width (each line is measured and fitted to one
// line, never below 36px, the key 1.15x the lead or more; past that it wraps with a console warning);
// late fonts and resizes (fitted again when a font arrives and once the stage's width settles, before
// ScrollTrigger refreshes, and a fit that changes a size asks for a refresh; every px value is a
// function of the stage height; the textures are painted again when a refresh finds the stage 15% or
// more off the size they were painted for); the scene as the first section (the lead reads at progress
// 0) or in the middle; scrolling back (every state restores); reduced motion switched on or off while
// the page is open.
(() => {
  const ID = 'light-flood';
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const num = (v, d, a, b) => { const n = typeof v === 'string' && v.trim() !== '' ? +v : v; return typeof n === 'number' && isFinite(n) ? clamp(n, a, b) : d; };

  // Checked sets: core luminance 0.15-0.25; ink and key both 3.5:1 or better on the core (dusk 4.63 /
  // 3.85, sky 4.09 / 4.43, sage 3.56 / 4.62); the core-to-night midpoint keeps HSL saturation 0.25 or
  // more (no grey mud halfway). Sage's day-to-core midpoint is 0.22, acceptable because that change
  // happens under the dome. No violet or indigo nights; no cream and no terracotta: the dusk core is a
  // signal vermilion saturated past the terracotta band (HSL s 0.88), the day is a cool pale sky and the
  // key is plain white.
  const PALETTES = {
    dusk: { day: '#e6ebee', halo: '#f7b08a', core: '#f0401c', night: '#101820', ink: '#121820', key: '#ffffff' },
    sky: { day: '#f5f8fc', halo: '#a8d2f6', core: '#3f78c9', night: '#0a1830', ink: '#0d1626', key: '#ffffff' },
    sage: { day: '#eef1ec', halo: '#b9dca8', core: '#33804f', night: '#0a1f14', ink: '#0f1e17', key: '#ffffff' },
  };

  // night: the plate's front is the top of an ellipse rx (x W) by ry (x H) with a soft edge (sigma x H);
  // its middle ends at apexEnd (x H from the stage top) at 0.84, its sides drop lower, so the last
  // light is a dome.
  // keyBlur / leadBlur: the rack focus ladders, the blur radii (px) of each line's copies, most blurred
  // first; the sharp line is the last rung.
  const DESK = { s0: 0.5, s1: 1, s3: 1.15, y0: 0.12, y1: -0.12, sink: 0.25, keyBlur: [4, 2, 0.9], leadBlur: [6, 3.4, 1.5], keyRest: 0.48, night: { rx: 0.62, ry: 0.55, sigma: 0.1, apexEnd: 0.58 } };
  const PHONE = { s0: 0.6, s1: 1.2, s3: 1.3, y0: 0.08, y1: -0.17, sink: 0.25, keyBlur: [3, 1.5, 0.7], leadBlur: [4, 2.3, 1], keyRest: 0.48, night: { rx: 0.8, ry: 0.35, sigma: 0.09, apexEnd: 0.62 } };
  const RUNGS = 3; // blurred copies per line
  // the ladders' steps, [start, length] in fractions of the hold: the key's focus closes fast then slow
  // (about 1.6px left at 0.25, sharp by 0.335); the lead's opens slow, fast, slow (about 3.4px at 0.60)
  const KEY_STEPS = [[0.165, 0.055], [0.225, 0.055], [0.285, 0.05]];
  const LEAD_STEPS = [[0.53, 0.045], [0.565, 0.045], [0.6, 0.045]];
  const APEX = 1.2; // where the front's middle sits in the plate, which is two stage heights tall
  const WAIT = 0.02; // opacity of a rack-focus layer waiting its turn (see the rise)
  const STEP = 1.15; // the key is at least this many times the lead's size

  const layer = (stage, before, cls, inner = '') => {
    const el = document.createElement('div');
    el.className = cls;
    el.setAttribute('aria-hidden', 'true');
    el.innerHTML = inner;
    stage.insertBefore(el, before);
    return el;
  };
  const ensureLayers = (stage, line) => {
    const has = (sel) => stage.querySelector(':scope > ' + sel);
    if (!has('.lf-ground:not(.lf-ground--core):not(.lf-ground--night)')) layer(stage, line, 'lf-ground');
    if (!has('.lf-ground--core')) layer(stage, line, 'lf-ground lf-ground--core');
    if (!has('.lf-ground--night')) layer(stage, line, 'lf-ground lf-ground--night');
    const sun = has('.lf-sun') || layer(stage, line, 'lf-sun');
    if (!sun.querySelector('.lf-halo')) sun.insertAdjacentHTML('afterbegin', '<div class="lf-halo"></div>');
    if (!sun.querySelector('.lf-core')) sun.insertAdjacentHTML('beforeend', '<div class="lf-core"></div>');
    const night = has('.lf-night') || layer(stage, line, 'lf-night');
    if (!night.querySelector('.lf-night__fill')) night.innerHTML = '<div class="lf-night__fill"></div>';
  };

  // The rack focus's soft copies: the two lines again, RUNGS times, in the same grid cell as the h2 and
  // under it, laid out by the same rules (so they sit exactly under the real lines at every size) and
  // only shown in the live scene. Their letters are CSS generated content (data-lf-text, drawn by a
  // ::before), so a copy holds no text: the page's text, its headline and what readers and search see
  // stay the one sentence in the h2. Each copy gets one static blur; only its opacity moves. In the DOM
  // the most blurred comes first, so a sharper rung always sits over a softer one.
  const ensureSoft = (stage, line, lead, key) => {
    const have = [...stage.querySelectorAll(':scope > .lf-soft')];
    for (const extra of have.slice(RUNGS)) extra.remove();
    const copy = (el) => {
      const c = document.createElement('span');
      c.className = el.className;
      // innerText keeps a <br> as a line break (the ::before keeps it too); spaces as one
      c.dataset.lfText = (el.innerText || el.textContent).replace(/[ \t\r]+/g, ' ').replace(/ ?\n ?/g, '\n').trim();
      return c;
    };
    const softLeads = [], softKeys = [];
    for (let i = 0; i < RUNGS; i++) {
      let soft = have[i];
      if (!soft) {
        soft = document.createElement('div');
        soft.className = 'lf-soft';
        soft.setAttribute('aria-hidden', 'true');
      }
      stage.insertBefore(soft, line);
      soft.replaceChildren(copy(lead), copy(key));
      softLeads.push(soft.children[0]);
      softKeys.push(soft.children[1]);
    }
    return { softLeads, softKeys };
  };

  // The rungs' blur, painted once. A CSS blur on a moving layer costs the GPU a blur pass every frame,
  // and its shaders compile the first time the scene comes into view (a visible hitch on a first scroll,
  // worst on Windows). So each rung draws its line into a canvas instead: the same font, size, letter
  // spacing, colour and baseline as the real line (read from its computed style), blurred on the CPU by
  // the canvas's shadowBlur (the letters are drawn off the canvas and only their blurred copy lands), at
  // a resolution the blur allows. The canvas is then a plain picture, only faded and scaled. Where a browser
  // cannot set letter spacing on a canvas, or the line wraps, the rung keeps its CSS blur, applied to
  // its generated letters (paint time, never per frame).
  const canPaintText = (() => {
    try {
      const c = document.createElement('canvas').getContext('2d');
      return !!c && 'letterSpacing' in c && 'fontBoundingBoxAscent' in c.measureText('x');
    } catch { return false; }
  })();
  const paintRung = (copy, blur) => {
    let cv = copy.querySelector(':scope > canvas');
    copy.classList.remove('lf-drawn');
    copy.style.setProperty('--lf-blur', `blur(${blur}px)`);
    if (!canPaintText || copy.classList.contains('lf-wrap')) return false;
    const cs = getComputedStyle(copy);
    const fs = parseFloat(cs.fontSize), w = copy.offsetWidth, text = copy.dataset.lfText || '';
    if (!fs || !w || !text || text.includes('\n')) return false;
    if (!cv) { cv = document.createElement('canvas'); cv.setAttribute('aria-hidden', 'true'); copy.appendChild(cv); }
    const c = cv.getContext('2d', { willReadFrequently: true }); // a CPU canvas: the blur runs once, here
    if (!c) return false;
    // device pixels per CSS pixel: full resolution for a light blur, less where the blur hides it
    const k = blur >= 3 ? 0.75 : Math.min(2, window.devicePixelRatio || 1);
    const m = Math.ceil(3 * blur) + 4, W = w + 2 * m, Hh = copy.offsetHeight + 2 * m;
    cv.width = Math.ceil(W * k); cv.height = Math.ceil(Hh * k);
    cv.style.cssText = `left:${-m}px;top:${-m}px;width:${W}px;height:${Hh}px`;
    c.clearRect(0, 0, cv.width, cv.height);
    c.font = `${cs.fontStyle} ${cs.fontWeight} ${fs * k}px ${cs.fontFamily}`;
    c.letterSpacing = (cs.letterSpacing === 'normal' ? 0 : parseFloat(cs.letterSpacing) * k) + 'px';
    c.fontKerning = cs.fontKerning === 'none' ? 'none' : 'normal';
    c.textBaseline = 'alphabetic';
    c.textAlign = 'left';
    const t = c.measureText(text);
    // the line box's half-leading model, in CSS px, with the font's ascent and descent rounded and the
    // half-leading floored as the browser's line layout does: the baseline sits
    // floor((line height - ascent - descent) / 2) + ascent below the line's top; the line is centred in
    // the copy's box like the real one
    const A = Math.round(t.fontBoundingBoxAscent / k), D = Math.round(t.fontBoundingBoxDescent / k);
    const lh = cs.lineHeight === 'normal' ? A + D : parseFloat(cs.lineHeight);
    const x = (m * k) + (w * k - t.width) / 2;
    const y = (m + parseFloat(cs.paddingTop || 0) + Math.floor((lh - (A + D)) / 2) + A) * k;
    const off = cv.width + 64;
    c.fillStyle = cs.color;
    if (blur > 0) { c.shadowColor = cs.color; c.shadowBlur = 2 * blur * k; c.shadowOffsetX = off; }
    c.fillText(text, blur > 0 ? x - off : x, y);
    copy.classList.add('lf-drawn');
    return true;
  };

  // A 1/255 dither on the soft edge of a painted texture. A slow dark falloff composited in 8 bits shows
  // contour bands (each one-level step of the screen colour lines up along the shape). Every pixel that
  // is neither clear nor solid gets its colour nudged by -1, 0 or +1 level in premultiplied terms, which
  // is what lands on the screen (out = colour x alpha + ground x (1 - alpha)), and its alpha by the same
  // step; a fixed pseudo-random pattern, so a repaint looks the same. The steps stop lining up, nothing
  // reads as grain, and solid and clear pixels are left alone, so the night stays the exact token.
  const dither = (c, w, h) => {
    let img;
    try { img = c.getImageData(0, 0, w, h); } catch { return; }
    const d = img.data;
    let s = 0x2f6b1d3;
    for (let i = 0; i < d.length; i += 4) {
      const a = d[i + 3];
      if (a === 0 || a === 255) continue;
      s ^= s << 13; s ^= s >>> 17; s ^= s << 5;
      const r = ((s >>> 0) % 3) - 1;
      if (!r) continue;
      const a2 = a + r;
      if (a2 <= 0 || a2 >= 255) continue;
      for (let k = 0; k < 3; k++) {
        const p = Math.min(a2, Math.max(0, Math.round(d[i + k] * a / 255) + r));
        d[i + k] = Math.min(255, Math.round(p * 255 / a2));
      }
      d[i + 3] = a2;
    }
    c.putImageData(img, 0, 0);
  };

  // The moving dome is two textures painted once: the halo and the core, each a flat ellipse with a
  // Gaussian edge (a canvas shadow, sigma = shadowBlur / 2), measured from the CSS divs they replace so
  // the geometry stays in the stylesheet. Scaling a texture never re-runs a blur, in any browser; the
  // divs keep drawing the finished composition. Returns false (divs stay) if a canvas cannot be had.
  // Each canvas is the box grown by 3.5 sigma on every side (placed in percentages of the box, so a
  // small resize stretches it with the box as before): the Gaussian tail is under 0.03% there, so no
  // edge of the texture ever shows as a line in the soft field.
  const paintSun = (sun) => {
    sun.classList.remove('lf-sun--drawn');
    const box = { w: sun.offsetWidth, h: sun.offsetHeight };
    if (!box.w || !box.h) return false;
    const out = [];
    for (const name of ['halo', 'core']) {
      const div = sun.querySelector('.lf-' + name);
      let cv = sun.querySelector('canvas.lf-' + name + '-tex');
      if (!cv) { cv = document.createElement('canvas'); cv.className = 'lf-' + name + '-tex'; sun.appendChild(cv); }
      const c = cv.getContext && cv.getContext('2d');
      if (!c) return false;
      const cs = getComputedStyle(div);
      const sigma = parseFloat((cs.filter.match(/blur\(([\d.]+)px\)/) || [])[1] || 0);
      const pad = Math.ceil(3.5 * sigma), W = box.w + 2 * pad, Hh = box.h + 2 * pad;
      const k = Math.min(0.5, 1400 / W);
      const pc = (v, of) => (v / of * 100).toFixed(4) + '%';
      cv.style.cssText = `inset:auto;left:${pc(-pad, box.w)};top:${pc(-pad, box.h)};width:${pc(W, box.w)};height:${pc(Hh, box.h)}`;
      cv.width = Math.round(W * k); cv.height = Math.round(Hh * k);
      c.clearRect(0, 0, cv.width, cv.height);
      const off = cv.width * 4;
      c.shadowColor = cs.backgroundColor; c.shadowBlur = 2 * sigma * k; c.shadowOffsetX = off;
      c.fillStyle = cs.backgroundColor;
      c.beginPath();
      c.ellipse((pad + div.offsetLeft + div.offsetWidth / 2) * k - off, (pad + div.offsetTop + div.offsetHeight / 2) * k, div.offsetWidth / 2 * k, div.offsetHeight / 2 * k, 0, 0, Math.PI * 2);
      c.fill();
      c.shadowColor = 'transparent'; c.shadowBlur = 0; c.shadowOffsetX = 0;
      dither(c, cv.width, cv.height);
      out.push(cv);
    }
    sun.append(...out); // halo under core
    sun.classList.add('lf-sun--drawn');
    return true;
  };

  // The night plate, also one texture painted once: the night colour (read from the CSS fill, so dawn
  // gets the day) with the light cut out of it, the top half of an ellipse and everything below, with a
  // Gaussian edge. Returns false if no canvas: the CSS fill (a straight soft front at APEX) stays.
  const paintNight = (night, g) => {
    night.classList.remove('lf-night--drawn');
    const w = night.offsetWidth, h = night.offsetHeight, H = h / 2;
    const fill = night.querySelector('.lf-night__fill');
    if (!w || !h || !fill) return false;
    let cv = night.querySelector('canvas.lf-night-tex');
    if (!cv) { cv = document.createElement('canvas'); cv.className = 'lf-night-tex'; night.appendChild(cv); }
    const c = cv.getContext && cv.getContext('2d');
    if (!c) return false;
    const k = Math.min(0.5, 1000 / w);
    cv.width = Math.round(w * k); cv.height = Math.round(h * k);
    const rx = g.rx * w * k, ry = g.ry * H * k, cx = w / 2 * k, cy = (APEX * H) * k + ry, bottom = cv.height + 4 * g.sigma * H * k;
    c.globalCompositeOperation = 'source-over';
    c.clearRect(0, 0, cv.width, cv.height);
    c.fillStyle = getComputedStyle(fill).backgroundColor;
    c.fillRect(0, 0, cv.width, cv.height);
    c.globalCompositeOperation = 'destination-out';
    const off = cv.width * 4;
    c.shadowColor = '#000'; c.shadowBlur = 2 * g.sigma * H * k; c.shadowOffsetX = off;
    c.fillStyle = '#000';
    // The arc runs across the stage only; past both sides the front stays level with its height at the
    // stage's edge, and the cut runs far out, so no blurred edge reaches into the stage from the side.
    const a = Math.acos(Math.min(1, cx / rx)), ye = cy - ry * Math.sin(a), wide = cv.width + 8 * g.sigma * H * k;
    c.beginPath();
    c.moveTo(-wide - off, ye);
    c.lineTo(-off, ye);
    c.ellipse(cx - off, cy, rx, ry, 0, Math.PI + a, 2 * Math.PI - a);
    c.lineTo(cv.width + wide - off, ye);
    c.lineTo(cv.width + wide - off, bottom);
    c.lineTo(-wide - off, bottom);
    c.closePath();
    c.fill();
    c.globalCompositeOperation = 'source-over';
    c.shadowColor = 'transparent'; c.shadowBlur = 0; c.shadowOffsetX = 0;
    dither(c, cv.width, cv.height);
    night.classList.add('lf-night--drawn');
    return true;
  };

  window.Scenes = window.Scenes || {};
  window.Scenes[ID] = (root, opts = {}) => {
    if (!window.Stage) return null;
    const stage = root.querySelector(':scope > .scene-stage');
    const line = root.querySelector('.lf-line');
    const lead = line && line.querySelector('.lf-lead');
    const key = line && line.querySelector('.lf-key');
    if (!stage || !line || !lead || !key) { console.warn('light-flood: needs .scene-stage > h2.lf-line with .lf-lead and .lf-key'); return null; }
    ensureLayers(stage, line);

    const pal = PALETTES[opts.palette];
    if (pal) for (const k in pal) root.style.setProperty('--lf-' + k, pal[k]);
    const dawn = opts.direction === 'dawn';
    const flood = opts.ending === 'flood';
    root.classList.toggle('lf--dawn', dawn);
    root.classList.toggle('lf--flood', flood);

    const rack = opts.focus !== 'flat' && !((navigator.hardwareConcurrency || 8) <= 4);
    const { softLeads = [], softKeys = [] } = rack ? ensureSoft(stage, line, lead, key) : {};

    // Each line stays one line: measured at its design size, a line wider than the stage gets the size
    // at which it just fits (--lf-lead-fit / --lf-key-fit, set on the stage so the soft copies follow).
    // The key keeps a size step over the lead (STEP, 1.15x or more): when the key has to shrink, the
    // lead shrinks with it. Never below 36px: a line that would need less wraps instead, and the console
    // says the copy is too long for the scene (18 characters a line is a hard limit).
    // Runs now; when a web font arrives; once a resize has settled (a ResizeObserver on the stage, after
    // 100ms without a change; never on every resize event); and before ScrollTrigger measures (its
    // refreshInit). Outside a refresh, a fit that changes a size (or a late font that moves the scene on
    // the page) asks for one debounced ScrollTrigger.refresh, so the key's lift and the header's
    // measure are never left stale.
    stage.style.setProperty('--lf-lead-n', Math.max(1, lead.textContent.trim().length));
    stage.style.setProperty('--lf-key-n', Math.max(1, key.textContent.trim().length));
    let warned = false, fitW = -1, fitted = '';
    // the rungs follow the lines: painted again after every fit (a new size, a font that arrived)
    let ladder = null;
    const paintRungs = () => {
      if (!ladder || !root.classList.contains('is-live')) return;
      softKeys.forEach((el, i) => paintRung(el, ladder.key[i]));
      softLeads.forEach((el, i) => paintRung(el, ladder.lead[i]));
    };
    const px = (el) => parseFloat(getComputedStyle(el).fontSize);
    const fit = () => {
      fitW = stage.clientWidth;
      const lines = [[lead, softLeads, '--lf-lead-fit'], [key, softKeys, '--lf-key-fit']];
      // both at their design size (the script's measure replaces the CSS's rough cap), one layout
      for (const [el, , v] of lines) { el.classList.remove('lf-wrap'); stage.style.setProperty(v, '100vw'); }
      const [L0, K0] = lines.map(([el]) => {
        const size = px(el), room = el.clientWidth, need = el.scrollWidth;
        return { size, most: need > room + 1 ? size * (room / need) * 0.94 : size };
      });
      let L = Math.max(36, L0.most), K = Math.max(36, K0.most);
      if (K < STEP * L) L = Math.max(36, Math.min(L, K / STEP)); // the lead gives way first
      if (K < STEP * L) K = STEP * L; // both at the floor: the key keeps its step (and wraps)
      [[L0, L], [K0, K]].forEach(([d, s], i) => {
        const [el, twins, v] = lines[i];
        if (s < d.size - 0.01) stage.style.setProperty(v, s.toFixed(2) + 'px');
        const wrap = s > d.most + 0.01;
        el.classList.toggle('lf-wrap', wrap);
        for (const t of twins) t.classList.toggle('lf-wrap', wrap);
        if (wrap && !warned) { warned = true; console.warn('light-flood: "' + el.textContent.trim() + '" does not fit on one line at ' + Math.round(s) + 'px here, so the headline wraps past two lines; the limit is 18 characters a line.'); }
      });
      paintRungs();
      const was = fitted;
      fitted = L.toFixed(1) + '/' + K.toFixed(1);
      return was !== '' && was !== fitted;
    };
    fit();
    let fitT = 0, refT = 0, placedAt = NaN, refreshedW = innerWidth;
    const top = () => root.getBoundingClientRect().top + (window.scrollY || 0);
    const refreshSoon = () => {
      if (!window.ScrollTrigger || !root.classList.contains('is-live')) return;
      clearTimeout(refT);
      refT = setTimeout(() => ScrollTrigger.refresh(), 150);
    };
    // a window resize gets ScrollTrigger's own refresh; only a stage that changed width inside the same
    // window (a scrollbar, a container) asks for one here
    const fitIfMoved = () => { clearTimeout(fitT); if (stage.clientWidth !== fitW && fit() && innerWidth === refreshedW) refreshSoon(); };
    const fitSoon = () => { clearTimeout(fitT); fitT = setTimeout(fitIfMoved, 100); };
    const fontIn = () => { if (fit() || Math.abs(top() - placedAt) > 1) refreshSoon(); };
    if (document.fonts) {
      if (document.fonts.ready) document.fonts.ready.then(fontIn);
      if (document.fonts.addEventListener) document.fonts.addEventListener('loadingdone', fontIn);
    }
    if (window.ResizeObserver) new ResizeObserver(fitSoon).observe(stage);
    else addEventListener('resize', fitSoon);
    if (window.ScrollTrigger) {
      // a refresh is measuring anyway: fit first (its own measure), and drop any refresh still waiting
      ScrollTrigger.addEventListener('refreshInit', () => { clearTimeout(refT); clearTimeout(fitT); if (stage.clientWidth !== fitW) fit(); });
      ScrollTrigger.addEventListener('refresh', () => { placedAt = top(); refreshedW = innerWidth; });
    }

    const hold = num(opts.hold, 1.2, 1, 1.5);
    const phoneHold = num(opts.phoneHold, 1.2, 1, 1.5);
    const scrub = opts.scrub === true || opts.scrub === 'true' ? true
      : opts.scrub !== undefined ? num(opts.scrub, 0.6, 0, 2)
      : (Stage.lenis ? true : 0.6);
    const desk = { ...DESK, s2: num(opts.flood, 3, 2.4, 3.6) };
    const phone = { ...PHONE, s2: num(opts.phoneFlood, 3.6, 2.4, 4.2) };

    const header = typeof opts.header === 'string' && opts.header ? document.querySelector(opts.header) : null;
    const headerClass = typeof opts.headerClass === 'string' && opts.headerClass ? opts.headerClass : (dawn ? 'is-light' : 'is-dark');
    const setHeader = (on) => { if (header) header.classList.toggle(headerClass, !!on); };
    const stopRest = () => { if (root.__lfRestOff) { root.__lfRestOff(); root.__lfRestOff = null; } };

    if (window.ScrollTrigger) ScrollTrigger.config({ ignoreMobileResize: true });

    // Finished composition: the header follows the panel's night band (its bottom 16%).
    const rest = () => {
      stopRest();
      if (!header || flood) { setHeader(false); return; }
      let raf = 0;
      const check = () => {
        raf = 0;
        const r = stage.getBoundingClientRect(), h = header.getBoundingClientRect();
        setHeader(r.bottom - r.height * 0.16 <= h.top + h.height / 2);
      };
      const ask = () => { if (!raf) raf = requestAnimationFrame(check); };
      addEventListener('scroll', ask, { passive: true });
      addEventListener('resize', ask);
      check();
      root.__lfRestOff = () => { removeEventListener('scroll', ask); removeEventListener('resize', ask); cancelAnimationFrame(raf); };
    };

    const make = (n) => (tl, ctx) => {
      stopRest();
      setHeader(false);
      const st = ctx.stage;
      const sun = st.querySelector('.lf-sun');
      const halo = paintSun(sun) ? sun.querySelector('canvas.lf-halo-tex') : sun.querySelector('.lf-halo');
      const night = st.querySelector('.lf-night');
      const gCore = st.querySelector('.lf-ground--core');
      const gNight = st.querySelector('.lf-ground--night');
      // the plate's front, in stage heights: its middle at APEX in the plate, its sides `drop` lower
      const g = n.night;
      const drop = paintNight(night, g) ? g.ry * (1 - Math.sqrt(Math.max(0, 1 - (0.5 / g.rx) ** 2))) : 0;
      // The textures are painted for the stage's size; a window resized within this layout (desktop to a
      // smaller desktop, a tablet turned) only refreshes, which would stretch them (an uneven blur, too
      // few pixels when it grows). Paint them again when a refresh finds the stage 15% or more off.
      let painted = { w: st.clientWidth, h: st.clientHeight };
      ScrollTrigger.create({
        trigger: root, start: 'top top', end: 'bottom bottom',
        onRefreshInit: () => {
          const w = st.clientWidth, h = st.clientHeight;
          if (!w || !h || !painted.w || !painted.h) return;
          if (Math.abs(w / painted.w - 1) < 0.15 && Math.abs(h / painted.h - 1) < 0.15) return;
          paintSun(sun);
          paintNight(night, g);
          painted = { w, h };
        },
      });
      // sizes are read when a tween (re)initialises, never per frame
      const m = { H: 0, mid: -1 };
      const measure = () => {
        m.H = st.clientHeight;
        if (header) { const h = header.getBoundingClientRect(); m.mid = h.top + h.height / 2; }
        return m;
      };
      const H = () => measure().H;
      const keyShift = () => Math.round(H() * n.keyRest - (line.offsetTop + key.offsetTop + key.offsetHeight / 2));

      gsap.set(sun, { xPercent: -50, yPercent: -50, transformOrigin: '50% 50%' });

      // RISE: the dome comes up behind the sentence; the key phrase comes into focus as the light reaches it
      // (with a slight lens breath on its blurred rungs, 1.05 -> 1). The real lines sit on their own
      // layers from the start (light-flood.css), rastered once at scale 1, so their fades, the lead's
      // shrink and the key's lift never repaint text; the real key is never scaled. The rack
      // focus never animates a filter (a tweened blur costs a new blur pass, and on a first scroll a new
      // shader, every frame): each line's copies are painted blurred once, here, and only cross-faded.
      tl.fromTo(sun, { scale: n.s0 }, { scale: n.s1, duration: 0.24, ease: 'power1.out' }, 0);
      tl.fromTo(sun, { y: () => n.y0 * H() }, { y: () => n.y1 * H(), duration: 0.30, ease: 'power1.out' }, 0);
      // The rungs waiting their turn rest at 2% rather than 0: invisible (under a level of difference on
      // the grounds behind them, and under the lines themselves), but drawn, so the browser's one-time
      // work for text and blurred layers under opacity is done as the scene scrolls into view, not in the
      // middle of the rise on a visitor's first scroll.
      // One step along a ladder: the incoming rung comes up to full while the outgoing one is still
      // full, then the outgoing one goes, so the letters never dim; the two differ by a pixel or two of
      // blur, so the frame in between reads as an in-between focus.
      const rung = (inc, out, [at, d]) => {
        tl.fromTo(inc, { opacity: WAIT }, { opacity: 1, duration: d * 0.6, ease: 'sine.inOut', immediateRender: false }, at);
        tl.fromTo(out, { opacity: 1 }, { opacity: 0, duration: d * 0.6, ease: 'sine.inOut', immediateRender: false }, at + d * 0.4);
      };
      if (rack) {
        ladder = { key: n.keyBlur, lead: n.leadBlur };
        paintRungs();
        softKeys.forEach((el, i) => gsap.set(el, { opacity: i ? WAIT : 1 }));
        softLeads.forEach((el) => gsap.set(el, { opacity: WAIT }));
        gsap.set(key, { opacity: WAIT });
        // the lens breath rides on the blurred rungs and is over (scale 1) before the sharp key comes
        // up at 0.285, so the real line never scales: it keeps its one crisp raster at its real size
        tl.fromTo(softKeys, { scale: 1.05 }, { scale: 1, duration: 0.125, ease: 'sine.out', force3D: false }, 0.16);
        // most blurred to sharp: each sharper rung comes up over the softer one under it
        const keys = [...softKeys, key];
        KEY_STEPS.forEach((s, i) => rung(keys[i + 1], keys[i], s));
      }

      // FLOOD: past every edge, accelerating; the ground turns under it so the corners follow
      tl.fromTo(sun, { scale: n.s1 }, { scale: n.s2, duration: 0.18, ease: 'power2.in', immediateRender: false }, 0.24);
      tl.fromTo(gCore, { opacity: 0 }, { opacity: 1, duration: 0.12, immediateRender: false }, 0.30);
      if (flood) return; // ending "flood": the sentence holds on the core to the end

      // NIGHTFALL: the lead goes soft down its ladder (each softer rung comes up under the sharper one,
      // which then fades off it) and then away
      if (rack) {
        const leads = [lead, ...softLeads.slice().reverse()];
        LEAD_STEPS.forEach((s, i) => rung(leads[i + 1], leads[i], s));
        tl.fromTo(softLeads[0], { opacity: 1 }, { opacity: 0, duration: 0.12, ease: 'sine.in', immediateRender: false }, 0.63);
      } else {
        tl.fromTo(lead, { opacity: 1 }, { opacity: 0, duration: 0.14, ease: 'sine.in', immediateRender: false }, 0.60);
      }
      tl.fromTo([lead, ...softLeads], { scale: 1, y: 0 }, { scale: 0.95, y: () => -0.03 * H(), duration: 0.22, ease: 'sine.in', immediateRender: false, force3D: false }, 0.52);
      // hidden: even the sides' soft edge is 3.5 sigma above the stage (under 0.1% of night shows, so the
      // top edge meets the section before with no seam); at 0.84 the middle of the front is at apexEnd
      tl.fromTo(night, { y: () => -(APEX + drop + 3.5 * g.sigma) * H() }, { y: () => (g.apexEnd - APEX) * H(), duration: 0.30, ease: 'power1.inOut' }, 0.54);
      tl.fromTo(halo, { opacity: 1 }, { opacity: 0, duration: 0.14, immediateRender: false }, 0.56);
      tl.fromTo(gNight, { opacity: 0 }, { opacity: 1, duration: 0.18, ease: 'sine.inOut', immediateRender: false }, 0.62);
      tl.fromTo(sun, { scale: n.s2 }, { scale: n.s3, duration: 0.28, ease: 'power1.inOut', immediateRender: false }, 0.64);
      tl.fromTo(sun, { y: () => n.y1 * H() }, { y: () => n.sink * H(), duration: 0.32, ease: 'power1.in', immediateRender: false }, 0.64);
      tl.fromTo(key, { y: 0 }, { y: keyShift, duration: 0.16, ease: 'sine.inOut', immediateRender: false, force3D: false }, 0.74);

      // LIGHTS OUT
      tl.fromTo(sun, { opacity: 1 }, { opacity: 0, duration: 0.12, ease: 'sine.inOut', immediateRender: false }, 0.84);
      // once the light is out the plate is night over night; it goes, so the last frame is the night
      // ground alone, exactly the token (no dithered edge left in it) to meet the next section
      tl.set(night, { opacity: 0 }, 0.96);

      // The header turns as soon as the night's soft edge reaches it at the sides, where the night comes
      // in first (one sigma above the header's middle). It follows the plate itself, so it stays in step
      // with the scrub's catch-up, and it is checked again after every refresh (ScrollTrigger renders
      // the timeline silently while it measures).
      if (header) {
        const sync = () => {
          if (!m.H) measure();
          const edge = gsap.getProperty(night, 'y') + (APEX + drop) * m.H;
          setHeader(m.mid >= 0 && edge >= m.mid - g.sigma * m.H);
        };
        tl.eventCallback('onUpdate', sync);
        ScrollTrigger.create({ trigger: root, start: 'top top', end: 'bottom bottom', onRefresh: sync, onToggle: sync });
        sync();
      }
    };

    const scene = Stage.scene(root, {
      hold,
      scrub,
      build: make(desk),
      phone: opts.phone === 'rest' ? 'rest' : { hold: phoneHold, build: make(phone) },
      rest,
    });

    // Stage gap: gsap.matchMedia runs the stage's callback only while one of its conditions matches, so
    // on a desktop with reduced motion it never runs and rest() is never called. Call it here, and again
    // whenever reduced motion is switched on while the page is open.
    if (Stage.live && window.matchMedia) {
      const rmq = matchMedia('(prefers-reduced-motion: reduce)');
      const restIfStill = () => { if (rmq.matches && !root.classList.contains('is-live')) rest(); };
      restIfStill();
      if (rmq.addEventListener) rmq.addEventListener('change', () => setTimeout(restIfStill, 0));
    }
    return scene;
  };
})();

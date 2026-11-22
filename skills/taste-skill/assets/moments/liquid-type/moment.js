/*
  liquid-type - a very large headline that behaves like a liquid: one ripple passes through it from left
  to right each time it comes on screen (so every visitor sees it, with or without a mouse), the pointer
  ripples it wherever it moves across the letters, and a tap or a touch drag ripples it at the finger.
  The ripple settles within about a second, back to crisp type. It is one SVG filter (a turbulence map
  displacing the type) applied only while the ripple is alive and taken off again when it is spent, so the
  headline is plain text at rest and costs nothing then. No WebGL. It runs on phones too (the pass on
  entering, and touch). Reduced motion, no script: plain type.

    <h1 class="mo-lt__type" data-moment="liquid-type" data-moment-opts='{"strength": 1}'>Software that thinks ahead</h1>
    or a host holding one headline: <div data-moment="liquid-type"><h1>…</h1><p>…</p></div>

  opts: strength 0.3-1.6 (how far the letters are pushed, default 1), radius 0.1-0.6 (the reach of the
        ripple around the pointer, as a share of the headline's width; default 0.3), pass false (no ripple
        on entering: then it answers only a pointer or a touch, and counts as an extra, not a moment).
  Only the headline moves (the host's other children never take the filter): the text stays selectable
  and the layout never changes, because the filter paints and never reflows.
*/
export const phone = true;

let uid = 0;
export default function (root, opts, lib) {
  const type = root.matches('h1, h2, .mo-lt__type') ? root : root.querySelector('.mo-lt__type, h1, h2');
  if (!type) return {};
  root.classList.add('mo-lt');
  if (lib.reduced() || typeof SVGFEDisplacementMapElement === 'undefined') return {};
  const strength = lib.clamp(+opts.strength || 1, 0.3, 1.6), reach = lib.clamp(+opts.radius || 0.3, 0.1, 0.6);
  const ns = 'http://www.w3.org/2000/svg';
  const id = `mo-lt-${++uid}`;
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('width', '0'); svg.setAttribute('height', '0'); svg.setAttribute('aria-hidden', 'true');
  svg.style.cssText = 'position:absolute;pointer-events:none';
  svg.innerHTML = `<filter id="${id}" x="-5%" y="-20%" width="110%" height="140%" color-interpolation-filters="sRGB"><feTurbulence type="fractalNoise" baseFrequency="0.006 0.013" numOctaves="1" seed="7" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="0" xChannelSelector="R" yChannelSelector="G"/></filter>`;
  document.body.append(svg);
  const turb = svg.querySelector('feTurbulence'), disp = svg.querySelector('feDisplacementMap');
  let energy = 0, raf = 0, on = false, lastX = 0, lastY = 0, hasLast = false, t0 = 0, px = 0.5, w = 1, h = 1;
  // the pass: a wave of push that rises and falls once over PASS ms while its centre crosses the line
  const PASS = 1500;
  let passAt = -1;
  const apply = () => {
    const sc = Math.min(44, energy) * strength;
    if (sc < 0.6) { if (on) { type.style.filter = ''; on = false; } return false; }
    disp.setAttribute('scale', sc.toFixed(1));
    // the map drifts a little with the pointer's place and the clock, so the ripple flows rather than sits
    const dx = 0.006 + (px - 0.5) * 0.002, dy = 0.013 + Math.sin(t0 / 700) * 0.003;
    turb.setAttribute('baseFrequency', `${dx.toFixed(4)} ${dy.toFixed(4)}`);
    if (!on) { type.style.filter = `url(#${id})`; on = true; }
    return true;
  };
  const tick = now => {
    raf = 0;
    t0 = now;
    energy *= 0.93;
    let passing = false;
    if (passAt >= 0) {
      if (passAt === 0) passAt = now;
      const t = (now - passAt) / PASS;
      if (t >= 1) passAt = -1;
      else { passing = true; px = t; energy = Math.max(energy, 30 * Math.sin(Math.PI * t)); }
    }
    if (apply() || passing) raf = requestAnimationFrame(tick);
    else energy = 0;
  };
  const wake = () => { if (!raf) raf = requestAnimationFrame(tick); };
  const pass = () => { passAt = 0; wake(); };
  const move = e => {
    const r = type.getBoundingClientRect();
    w = r.width; h = r.height;
    const x = e.clientX - r.left, y = e.clientY - r.top;
    const inside = x > -w * 0.04 && x < w * 1.04 && y > -h * 0.2 && y < h * 1.2;
    if (!inside) { hasLast = false; return; }
    px = lib.clamp(x / w);
    if (hasLast) {
      const v = Math.hypot(e.clientX - lastX, e.clientY - lastY);
      // the nearer the pointer to the middle of the line's height, the stronger the push; a fast pass pushes more
      energy = Math.min(44, energy + Math.min(9, v * 0.3) * (0.5 + reach));
    }
    lastX = e.clientX; lastY = e.clientY; hasLast = true;
    wake();
  };
  // a tap or the start of a touch drag: a ripple at the finger (the page still scrolls: nothing is prevented)
  const down = e => {
    const r = type.getBoundingClientRect();
    if (e.clientY < r.top - r.height * 0.2 || e.clientY > r.bottom + r.height * 0.2) return;
    px = lib.clamp((e.clientX - r.left) / Math.max(1, r.width));
    energy = Math.min(44, energy + 24);
    wake();
  };
  const leave = () => { hasLast = false; };
  root.addEventListener('pointermove', move, { passive: true });
  root.addEventListener('pointerdown', down, { passive: true });
  root.addEventListener('pointerleave', leave);
  // the pass on entering: when half the headline is on screen, and again each time it comes back
  let io = null, first = 0;
  if (opts.pass !== false && 'IntersectionObserver' in window) {
    let out = true;
    io = new IntersectionObserver(es => {
      const e = es[es.length - 1];
      if (e.intersectionRatio >= 0.5 && out) {
        out = false;
        // (a headline on screen at load waits for the fonts and the hero's own entrance)
        clearTimeout(first);
        first = setTimeout(pass, performance.now() < 2500 ? 1100 : 120);
      } else if (!e.isIntersecting) out = true;
    }, { threshold: [0, 0.5] });
    io.observe(type);
  }
  return { destroy() { clearTimeout(first); io?.disconnect(); root.removeEventListener('pointermove', move); root.removeEventListener('pointerdown', down); root.removeEventListener('pointerleave', leave); if (raf) cancelAnimationFrame(raf); type.style.filter = ''; svg.remove(); } };
}

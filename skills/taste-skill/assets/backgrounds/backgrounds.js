/*
  taste-skill backgrounds.js - optional, about 2 KB of work. Load it plain (not deferred) at the end of <head>,
  right after the :root palette block, so a dark page never paints one frame with the light page's grain.
  It reads the page palette (--p-*) and sets, on <html>, what backgrounds.css cannot know in CSS:
    data-mode  light | dark    is the page ink lighter than the page bg?
    data-tint  away            (only when) the bg is a strong colour or a mid tone: tints move away from the
                               ink, which only ever adds contrast
    data-lowchroma             (only when) the accent is a grey or near-grey: .bg-stage then takes the lit
                               ground's colour instead of a hue that does not exist
    --g-k      0.08 to 1       how strongly the tints may show on this palette: the contrast headroom of the
                               ink (7:1) and muted (4.5:1) text, in lightness, over the depth the grounds are
                               drawn at. A palette whose ink is only just 7:1 on its bg gets almost flat grounds
                               (an away palette keeps 1: its tints only add contrast)
    --g-kl     the same headroom, kept for the grounds that draw in the ink's own direction (the rules, dots, rings)
    --g-kp     the same, counted on the raw muted text, for the two page grounds (paper, topglow), which set no tokens
    --g-kd     the same for the dark grounds (horizon, deep, photo)
  An attribute or variable the page (or start.mjs) already set is kept (--g-k, --g-kl, --g-kd each on its own: inline on
  <html> or in a stylesheet). It also pauses the .bg-liquid blobs while their section is off screen, and measures each
  .bg-photo's words to set how high its scrim stays deep (--scrim-h, or --scrim-w for .bg-photo--left on a wide screen).
  Every other ground is plain CSS.
*/
(() => {
  const root = document.documentElement;
  const get = n => getComputedStyle(root).getPropertyValue(n).trim();
  const hex = n => {
    let v = get(n).replace('#', '');
    if (v.length === 3) v = [...v].map(c => c + c).join('');
    return /^[0-9a-f]{6}$/i.test(v) ? [0, 2, 4].map(i => parseInt(v.slice(i, i + 2), 16) / 255) : null;
  };
  const lin = c => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  const Y = ([r, g, b]) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
  const oklab = rgb => {
    const [r, g, b] = rgb.map(lin);
    const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
    const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
    const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
    return [0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s, 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s, 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s];
  };
  const REF = 0.22;  // the deepest a tint is drawn at k = 1, in oklab lightness
  /* how far (oklab L) a ground of colour bg may move toward the ink and keep ink 7:1 and the muted
     text a ground uses (60% ink, 40% palette muted) 4.5:1 */
  const room = (ink, muted, bg, bgScale = 1, mixInk = 0.6) => {
    const Li = oklab(ink)[0], Lm = mixInk * Li + (1 - mixInk) * oklab(muted)[0], Lb = oklab(bg)[0] * bgScale, Yi = Y(ink), Ym = Lm ** 3;
    if (Li > Lb) {
      const max = Math.min((Yi + 0.05) / 7 - 0.05, (Ym + 0.05) / 4.5 - 0.05) * 0.8;
      return max > 0 ? Math.cbrt(max) - Lb : 0;
    }
    const min = Math.max(7 * (Yi + 0.05) - 0.05, 4.5 * (Ym + 0.05) - 0.05) * 1.15;
    return min < 1 ? Lb - Math.cbrt(min) : 0;
  };
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  const detect = force => {
    const bg = hex('--p-bg'), ink = hex('--p-ink'), muted = hex('--p-muted');
    if (!bg || !ink) return;
    const a = oklab(bg), b = oklab(ink);
    if (force || !root.dataset.mode) root.dataset.mode = b[0] > a[0] ? 'dark' : 'light';
    if (force) { root.removeAttribute('data-tint'); ['--g-k', '--g-kl', '--g-kd', '--g-kp'].forEach(p => root.style.removeProperty(p)); }
    const ac = hex('--p-accent');
    if (ac) root.toggleAttribute('data-lowchroma', Math.hypot(oklab(ac)[1], oklab(ac)[2]) < 0.045);
    const away = Math.hypot(a[1], a[2]) > 0.09 || (a[0] > 0.3 && a[0] < 0.84);
    if (away && !root.hasAttribute('data-tint')) root.setAttribute('data-tint', 'away');
    const m = muted || ink;
    /* a strength the page already set (inline on <html>, or in a stylesheet: anything but the CSS default of 1) is kept, each on its own */
    const mine = n => force || (!root.dataset.k && root.style.getPropertyValue(n).trim() === '' && ['', '1'].includes(get(n)));
    const kl = clamp(room(ink, m, bg) / REF, 0.08, 1);
    if (mine('--g-kl')) root.style.setProperty('--g-kl', kl.toFixed(3));
    if (mine('--g-k')) root.style.setProperty('--g-k', root.dataset.tint === 'away' ? '1' : kl.toFixed(3));
    /* the page grounds (paper, topglow) sit under the page's own muted text, which they do not re-mix: their headroom is counted on the palette's raw muted */
    if (mine('--g-kp')) root.style.setProperty('--g-kp', root.dataset.tint === 'away' ? '1' : clamp(room(ink, m, bg, 1, 0) / REF, 0.08, 1).toFixed(3));
    const db = hex('--g-dark-bg'), di = hex('--g-dark-ink'), dm = hex('--g-dark-muted');
    if (db && di && dm && mine('--g-kd')) root.style.setProperty('--g-kd', clamp(room(di, dm, db, 0.8) / REF, 0.08, 1).toFixed(3));
  };
  detect(false);
  window.tasteBackgrounds = { detect: () => detect(true) };

  /* the pause disc (WCAG 2.2.2: it moves for more than 5 s): the system's own .loop-pause, same icons, in the section's
     bottom-right corner; it holds the blobs with .is-held. Nothing under prefers-reduced-motion, where they hold still. */
  const ICON_PAUSE = '<svg viewBox="0 0 16 16" aria-hidden="true"><rect x="4.25" y="3.25" width="2.75" height="9.5" rx="0.9"/><rect x="9" y="3.25" width="2.75" height="9.5" rx="0.9"/></svg>';
  const ICON_PLAY = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M5.25 3.7v8.6c0 .62.68 1 1.2.66l6.5-4.3c.47-.31.47-1 0-1.32l-6.5-4.3c-.52-.34-1.2.04-1.2.66Z"/></svg>';
  const hold = el => {
    if (el.hasAttribute('data-no-pause') || matchMedia('(prefers-reduced-motion: reduce)').matches || el.querySelector(':scope > .loop-pause')) return;
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'loop-pause';
    const show = () => { const held = el.classList.contains('is-held'), label = (held ? 'Play' : 'Pause') + ' animation'; b.innerHTML = held ? ICON_PLAY : ICON_PAUSE; b.setAttribute('aria-label', label); b.title = label; };
    b.addEventListener('click', () => { el.classList.toggle('is-held'); show(); });
    show(); el.append(b);
  };
  const watch = () => {
    const live = document.querySelectorAll('.bg-liquid');
    live.forEach(hold);
    if (live.length && 'IntersectionObserver' in window) {
      const io = new IntersectionObserver(es => es.forEach(e => e.target.classList.toggle('is-off', !e.isIntersecting)), { rootMargin: '80px' });
      live.forEach(el => { el.classList.add('is-off'); io.observe(el); });
    }
  };
  /* the scrim of a photograph must stay deep under every word: measure where the words start (their top edge, as a share of the
     section's height, from the bottom; their right edge for .bg-photo--left on a wide screen) and keep the deep part of the
     scrim 8% past it. A value the section sets itself (inline) is kept. */
  const fit = el => {
    const r = el.getBoundingClientRect();
    if (!r.height || !r.width) return;
    const words = [...el.querySelectorAll('h1, h2, h3, h4, p, a, button, li, blockquote, figcaption, .btn-row')].filter(w => !w.closest('.bg-photo__img') && w.getClientRects().length);
    if (!words.length) return;
    const top = Math.min(...words.map(w => w.getBoundingClientRect().top)), right = Math.max(...words.map(w => w.getBoundingClientRect().right));
    if (!el.dataset.scrimHSet) {
      const h = Math.min(100, Math.max(40, ((r.bottom - top) / r.height) * 100 + 8));
      el.style.setProperty('--scrim-h', h.toFixed(1) + '%');
    }
    if (!el.dataset.scrimWSet) el.style.setProperty('--scrim-w', Math.min(100, Math.max(30, ((right - r.left) / r.width) * 100 + 8)).toFixed(1) + '%');
  };
  const photos = () => {
    document.querySelectorAll('.bg-photo').forEach(el => {
      /* a page-set inline value is kept: remember it before the first measure */
      if (el.dataset.scrimHSet == null) el.dataset.scrimHSet = el.style.getPropertyValue('--scrim-h') ? '1' : '';
      if (el.dataset.scrimWSet == null) el.dataset.scrimWSet = el.style.getPropertyValue('--scrim-w') ? '1' : '';
      fit(el);
      if ('ResizeObserver' in window && !el.__fit) { el.__fit = new ResizeObserver(() => fit(el)); el.__fit.observe(el); }
    });
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => { watch(); photos(); }, { once: true }); else { watch(); photos(); }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(photos);
})();

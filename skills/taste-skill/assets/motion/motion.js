/* Optional entrances, one section fade and feedback for interactive controls. */
const html = document.documentElement;
const reducedQ = matchMedia('(prefers-reduced-motion: reduce)');
const reduced = () => reducedQ.matches;
const shot = () => /HeadlessChrome/.test(navigator.userAgent) && html.dataset.motion !== 'live';
const jump = (el, on) => { el.classList.toggle('is-jump', on); };

/* ---------------------------------------------------------------- nav */
function nav() {
  const bar = document.querySelector('.nav');
  const links = bar?.querySelector('.nav__links');
  if (!links || bar.dataset.mNav) return;
  bar.dataset.mNav = '1';   // no pill under the words (ST-08, ST-11): system.css draws their underline

  const phone = matchMedia('(max-width: 1023px)');
  const syncSheet = () => { links.inert = phone.matches && !bar.classList.contains('is-open'); };
  syncSheet();
  new MutationObserver(syncSheet).observe(bar, { attributes: true, attributeFilter: ['class'] });
  phone.addEventListener('change', syncSheet);
  // one menu open: the next word swaps the panel at once (figma.com); leaving the bar closes softly
  let t = 0;
  bar.querySelectorAll('.nav__item').forEach(item => {
    const has = !!item.querySelector('.nav__menu');
    item.addEventListener('pointerenter', () => {
      clearTimeout(t);
      // 150ms: the panel has started to show (motion.css lets it finish its own fade)
      if (has) t = setTimeout(() => bar.classList.add('m-menu-open'), 150);
      else bar.classList.remove('m-menu-open');
    });
  });
  bar.addEventListener('pointerleave', () => { clearTimeout(t); bar.classList.remove('m-menu-open'); });
}

/* ---------------------------------------------------------------- tabs */
function tabs() {
  document.querySelectorAll('.tabs[role="tablist"], [role="tablist"].m-tabs').forEach(list => {
    if (!list.querySelector('[role="tab"]') || list.querySelector(':scope > .m-tab-ind')) return;
    const panels = [...list.querySelectorAll('[aria-controls]')].flatMap(tab =>
      tab.getAttribute('aria-controls').split(/\s+/).map(id => document.getElementById(id)).filter(Boolean));
    const panelParents = new Set(panels.map(panel => panel.parentElement));
    for (const parent of panelParents) {
      if ([...parent.children].every(el => panels.includes(el)) && getComputedStyle(parent).display === 'block') parent.classList.add('m-tab-stack');
    }
    const fades = new MutationObserver(records => {
      for (const { target } of records) {
        if (target.hidden) continue;
        for (const animation of target.getAnimations()) {
          if (animation.constructor.name !== 'Animation' || !animation.effect?.getKeyframes().every(k => 'opacity' in k)) continue;
          animation.effect.updateTiming({ duration: reduced() ? 120 : 180 });
        }
      }
    });
    panels.forEach(panel => fades.observe(panel, { attributes: true, attributeFilter: ['hidden'] }));
    const ind = document.createElement('span');
    ind.className = 'm-tab-ind';
    ind.setAttribute('aria-hidden', 'true');
    list.prepend(ind);
    list.classList.add('m-has-ind');
    let instant = true, at = null;
    const set = (b, sx = 1, sy = 1) => {
      ind.style.setProperty('--x', `${b.x}px`); ind.style.setProperty('--y', `${b.y}px`);
      ind.style.setProperty('--w', `${b.w}px`); ind.style.setProperty('--h', `${b.h}px`);
      ind.style.setProperty('--sx', String(sx)); ind.style.setProperty('--sy', String(sy));
    };
    // the pill travels by transform only: it takes the new tab's size at once, is drawn scaled to the
    // old tab's size at the old place, and settles to scale 1 at the new place (motion.css)
    const place = () => {
      const sel = list.querySelector('[role="tab"][aria-selected="true"]');
      if (!sel) { ind.style.opacity = '0'; return; }
      ind.style.opacity = '';
      const to = { x: sel.offsetLeft, y: sel.offsetTop, w: sel.offsetWidth, h: sel.offsetHeight };
      if (instant || reduced() || !at || !to.w || !to.h) { jump(ind, true); set(to); ind.getBoundingClientRect(); jump(ind, false); }
      else {
        jump(ind, true);
        set({ ...to, x: at.x, y: at.y }, at.w / to.w, at.h / to.h);
        ind.getBoundingClientRect();
        jump(ind, false);
        set(to);
      }
      at = to;
      instant = false;
    };
    place();
    new MutationObserver(place).observe(list, { subtree: true, attributes: true, attributeFilter: ['aria-selected'] });
    new ResizeObserver(() => { instant = true; place(); }).observe(list);
    document.fonts?.ready.then(() => { instant = true; place(); });
  });
}

/* ---------------------------------------------------------------- numbers */
// the first number in the element's text: "8,402", "4.2", "64%", "EUR 1.200", "12k"
// separators: . , and the no-break spaces (U+00A0, U+202F); a plain space ends the number ("12 4 h" is 12)
const NUM = /\d+(?:[.,\u00A0\u202F]\d+)*/;
function parse(text) {
  const m = text.match(NUM);
  if (!m) return null;
  const raw = m[0];
  const seps = raw.match(/[^\d]/g) || [];
  let dec = '', group = '', decimals = 0;
  const lastSep = raw.search(/[^\d](?=\d+$)/);
  if (lastSep >= 0) {
    const tail = raw.length - lastSep - 1;
    // a last separator before exactly three digits groups thousands; otherwise it is the decimal point
    if (tail === 3 && !(seps.length === 1 && raw[lastSep] === '.' && /^0/.test(raw))) group = raw[lastSep];
    else { dec = raw[lastSep]; decimals = tail; group = seps.length > 1 ? seps[0] : ''; }
  }
  const intPart = dec ? raw.slice(0, lastSep) : raw;
  const value = parseFloat(intPart.replace(/[^\d]/g, '') + (dec ? '.' + raw.slice(lastSep + 1) : ''));
  return { index: m.index, raw, value, dec, group, decimals };
}
function format(v, p) {
  let [i, d] = v.toFixed(p.decimals).split('.');
  if (p.group) i = i.replace(/\B(?=(\d{3})+(?!\d))/g, p.group);
  return d ? i + p.dec + d : i;
}
// the web fonts, or 3 s at most: a number measured in the fallback font comes out narrower
const fontsIn = () => Promise.race([document.fonts?.ready ?? Promise.resolve(), new Promise(r => setTimeout(r, 3000))]);
function counts(root) {
  const els = [...root.querySelectorAll('[data-m-count]')].filter(el => !el.__mCount);
  if (!els.length || reduced() || shot()) return;
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) e.target.__mCount?.hit(); }), { threshold: 0.6 });
  const ro = new ResizeObserver(es => es.forEach(e => e.target.__mCount?.arm()));
  const items = [];
  els.forEach(el => {
    const walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    let node, p;
    while ((node = walk.nextNode()) && !(p = parse(node.data))) { /* next */ }
    if (!node || !p) return;
    // the number gets its own span, as wide as the final number and right-aligned, so nothing beside it
    // moves. Until it is measured it shows its own text, never a 0
    const after = node.splitText(p.index);
    after.splitText(p.raw.length);
    const span = document.createElement('span');
    span.className = 'm-count__n';
    span.style.display = 'inline-block';
    span.style.textAlign = 'right';
    span.textContent = p.raw;
    after.replaceWith(span);
    const ms = +el.dataset.mCount || 400;
    let state = 'wait', timer = 0;          // wait (own text) -> armed (0, width held) -> run -> done
    const stop = () => { clearTimeout(timer); io.unobserve(el); ro.unobserve(el); };
    const onScreen = () => {
      const r = span.getBoundingClientRect();
      return r.width > 0 && r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth && document.visibilityState === 'visible';
    };
    // the safety net: a stat on screen for 6 s that the observer never reported shows its own text
    const watch = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        if (state !== 'armed') return;
        if (onScreen()) { state = 'done'; stop(); span.textContent = p.raw; } else watch();
      }, 6000);
    };
    const ctl = {
      /** measure the final number in the page's font and hold its width; false while it has none (hidden) */
      arm() {
        if (state === 'run' || state === 'done') return false;
        span.textContent = p.raw;
        span.style.minWidth = '';
        const w = span.getBoundingClientRect().width;
        if (!w) { state = 'wait'; clearTimeout(timer); return false; }
        span.style.minWidth = `${w}px`;

        if (state !== 'armed') { state = 'armed'; watch(); }
        return true;
      },
      /** print: stop waiting and show the written number */
      show() { if (state === 'done') return; state = 'done'; stop(); span.textContent = p.raw; },
      /** first seen: measure again (a font or a tab that changed since), then tick once */
      hit() {
        if (state === 'run' || state === 'done' || !ctl.arm()) return;
        state = 'run';
        stop();
        const t0 = performance.now();
        const step = now => {
          if (state !== 'run') return;
          const k = reduced() ? 1 : Math.min(1, (now - t0) / ms);
          span.textContent = k < 1 ? format(p.value * (1 - Math.pow(1 - k, 4)), p) : p.raw;
          if (k < 1) requestAnimationFrame(step); else state = 'done';
        };
        requestAnimationFrame(step);
      },
    };
    el.__mCount = ctl;
    items.push(el);
  });
  // measured only once the fonts are in; the resize observer measures again when a hidden stat shows
  fontsIn().then(() => items.forEach(el => { el.__mCount.arm(); ro.observe(el); io.observe(el); }));
  // a printed page never scrolls the stats into view: each prints its own number
  addEventListener('beforeprint', () => items.forEach(el => el.__mCount.show()));
}

/* ---------------------------------------------------------------- loops inside cards */
const ICON_PAUSE = '<svg viewBox="0 0 16 16" aria-hidden="true"><rect x="4.25" y="3.25" width="2.75" height="9.5" rx="0.9"/><rect x="9" y="3.25" width="2.75" height="9.5" rx="0.9"/></svg>';
const ICON_PLAY = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M5.25 3.7v8.6c0 .62.68 1 1.2.66l6.5-4.3c.47-.31.47-1 0-1.32l-6.5-4.3c-.52-.34-1.2.04-1.2.66Z"/></svg>';
const boxOf = el => el.closest('.panel__screen, .panel, .frame, .hero__window, [data-media-frame], figure');
const invalidLoop = el => !boxOf(el) || el.matches('.card, .tile, [data-fx]') || el.closest('h1,h2,h3,h4,h5,h6');
const hostOf = el => el.closest('.card, .tile, .menu-card, a') || boxOf(el);

function restart(loop) {
  if (reduced() || loop.classList.contains('is-m-paused')) return;
  // the page's keyframe loops only: a hover transition in the panel (the pause button's) is no cycle.
  // ui.js fragments in the card restart by themselves
  const anims = loop.getAnimations({ subtree: true }).filter(a => typeof CSSAnimation === 'function' && a instanceof CSSAnimation);
  if (!anims.length) return;
  const dur = a => Number(a.effect?.getComputedTiming().duration) || 0;
  const main = anims.reduce((m, a) => (dur(a) > dur(m) ? a : m));
  const d = dur(main), t = Number(main.currentTime) || 0;
  // restart only when the cycle is past its first quarter, so a quick in-and-out never stutters
  if (!d || (t % d) / d > 0.25) anims.forEach(a => { a.currentTime = 0; });
}
function setPaused(box, paused) {
  box.querySelectorAll('[data-m-loop]').forEach(l => l.classList.toggle('is-m-paused', paused));
  if (box.matches('[data-m-loop]')) box.classList.toggle('is-m-paused', paused);
}
function pauseButton(loop) {
  const box = boxOf(loop);
  if (box.querySelector(':scope > .loop-pause')) return;   // ui.js or the page put one there: it is shared
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'loop-pause m-own';
  const show = paused => {
    btn.innerHTML = paused ? ICON_PLAY : ICON_PAUSE;
    btn.setAttribute('aria-label', `${paused ? 'Play' : 'Pause'} animation`);
    btn.title = btn.getAttribute('aria-label');
    btn.classList.toggle('is-paused', paused);
  };
  show(false);
  if (getComputedStyle(box).position === 'static') box.style.position = 'relative';
  box.append(btn);
  btn.__show = show;
}
function loops() {
  const els = [...document.querySelectorAll('[data-m-loop]')].filter(el => !el.__mLoop);
  for (const el of els.filter(invalidLoop)) {
    el.__mLoop = true;
    el.classList.add('is-m-paused');
  }
  if (reduced() || matchMedia('(max-width: 639px)').matches) return;   // motion.css holds them on their finished picture
  const io = new IntersectionObserver(es => es.forEach(e => e.target.classList.toggle('is-m-off', !e.isIntersecting)), { rootMargin: '48px' });
  els.filter(el => !el.__mLoop).forEach(el => {
    el.__mLoop = true;
    io.observe(el);
    pauseButton(el);
    hostOf(el).addEventListener('pointerenter', e => { if (e.pointerType !== 'touch') restart(el); });   // a mouse or pen, never a tap
    hostOf(el).addEventListener('focusin', e => { if (!e.target.closest('.loop-pause')) restart(el); });
  });
}
// one listener for every pause button: its own (m-own) toggles; a ui.js one is mirrored after ui.js ran
document.addEventListener('click', e => {
  const btn = e.target.closest('.loop-pause');
  if (!btn) return;
  const box = btn.parentElement;
  if (btn.classList.contains('m-own')) {
    const paused = !btn.classList.contains('is-paused');
    btn.__show(paused);
    setPaused(box, paused);
    box.querySelectorAll('[data-ui]').forEach(r => { try { paused ? r.__ui?.pause() : r.__ui?.resume(); } catch { /* none */ } });
  } else setPaused(box, btn.classList.contains('is-paused'));
});

/* ---------------------------------------------------------------- switches */
document.addEventListener('click', e => {
  const sw = e.target.closest('.m-switch');
  if (!sw || e.defaultPrevented) return;
  sw.setAttribute('aria-checked', String(sw.getAttribute('aria-checked') !== 'true'));
});

/* Entrances use existing groups. Only an explicit loud entrance needs word masks. */
const ENTER_MEDIA = '[data-enter-media], .hero__bg, .hero__media, .hero__stage, .hero__art, .hero__window, .hero-visual, .ly-collage';
const ease = () => getComputedStyle(html).getPropertyValue('--m-ease').trim() || 'cubic-bezier(.4, 0, .2, 1)';
const time = name => parseFloat(getComputedStyle(html).getPropertyValue(name)) || 0;
function maskWords(h1) {
  // an h1 another script reworks (layout.js: a live word, letters, a picture in the line) rises whole
  if (h1.matches('[data-ly-letters], [data-enter-whole]') || h1.querySelector('.ly-word, .ly-pic, .ly-mark, svg, img')) return null;
  const own = document.createDocumentFragment();
  own.append(...h1.childNodes);
  const copy = own.cloneNode(true);
  const words = [];
  const walk = node => [...node.childNodes].forEach(n => {
    if (n.nodeType === 1) return walk(n);
    if (n.nodeType !== 3) return;
    const frag = document.createDocumentFragment();
    n.textContent.split(/(\s+)/).forEach(part => {
      if (!part) return;
      if (/^\s+$/.test(part)) { frag.append(part); return; }
      const w = document.createElement('span'), i = document.createElement('span');
      w.className = 'm-w'; i.className = 'm-w__in'; i.textContent = part;
      w.append(i); frag.append(w); words.push(w);
    });
    n.replaceWith(frag);
  });
  walk(copy);
  const label = h1.hasAttribute('aria-label');
  if (!label) h1.setAttribute('aria-label', own.textContent.replace(/\s+/g, ' ').trim());
  h1.append(copy);
  h1.querySelectorAll('.m-w').forEach(w => w.setAttribute('aria-hidden', 'true'));
  // words grouped into the lines the browser set them on
  const lines = [];
  let top = null;
  words.forEach(w => { const t = w.getBoundingClientRect().top; if (top === null || Math.abs(t - top) > 3) { lines.push([]); top = t; } lines[lines.length - 1].push(w.firstChild); });
  return { lines, restore() { h1.replaceChildren(own); if (!label) h1.removeAttribute('aria-label'); } };
}

function enter() {
  const hero = document.querySelector('.hero[data-enter]');
  if (!hero || hero.classList.contains('is-entered')) return;
  hero.classList.add('is-entered');
  if (!html.classList.contains('m-enter') || html.classList.contains('m-enter-done') || reduced() || shot()) return;
  const variant = hero.dataset.enter;
  const h1 = hero.querySelector('h1');
  if (!h1) return;
  if (variant === 'fade' || variant === 'rise') {
    const media = hero.querySelector(ENTER_MEDIA);
    // Animate the existing copy group, including its lead and actions. A flat custom layout
    // can opt in by marking its copy container; otherwise it keeps its finished state.
    const copy = h1.closest('[data-enter-copy]') ||
      h1.closest('.hero-copy, .hero__copy, .hero__head, .hero__text, .hero__c') || h1.parentElement;
    if (copy === hero || copy.contains(media)) return;
    const rise = variant === 'rise';
    const options = { id: 'kit-hero-entrance', duration: time(rise ? '--m-rise' : '--m-fade'), easing: ease() };
    const fade = [{ opacity: 0 }, { opacity: 1 }];
    copy.animate(rise ? [{ opacity: 0, translate: '0 10px' }, { opacity: 1, translate: '0 0' }] : fade, options);
    if (media && !media.contains(copy)) media.animate(fade, options);
    return;
  }
  if (html.dataset.temper !== 'loud' || !['set-type', 'line-blocks'].includes(variant)) return;
  const masks = maskWords(h1);
  if (!masks) return;
  const animations = [];
  for (const [i, words] of masks.lines.entries()) {
    const options = { duration: 300, delay: Math.min(i, 3) * 20, easing: ease(), fill: 'backwards' };
    if (variant === 'set-type') {
      for (const word of words) animations.push(word.animate([{ translate: '0 100%' }, { translate: '0 0' }], options));
    } else {
      const first = words[0].parentElement.getBoundingClientRect();
      const last = words.at(-1).parentElement.getBoundingClientRect();
      const box = h1.getBoundingClientRect();
      const block = document.createElement('span');
      block.className = 'm-block';
      block.setAttribute('aria-hidden', 'true');
      Object.assign(block.style, { left: first.left-box.left+'px', top: first.top-box.top+'px', width: last.right-first.left+'px', height: first.height+'px' });
      h1.append(block);
      animations.push(block.animate([{ scale: '1 1' }, { scale: '0 1' }], { ...options, fill: 'both' }));
    }
  }
  Promise.allSettled(animations.map(a => a.finished)).then(() => masks.restore());
}

function reveals() {
  const block = document.querySelector('main section[data-reveal="fade"], main section [data-reveal="fade"]');
  if (!block || block.dataset.mRvDone || reduced() || shot() || !window.IntersectionObserver) return;
  block.dataset.mRvDone = '1';
  if (block.closest('[data-still], .hero, [data-moment], [data-big-scene]') ||
      block.matches('h1,h2,h3,img,picture,video,figure,li,article.card,.card,.tile') ||
      block.getBoundingClientRect().top < innerHeight) return;
  const bounds = block.getBoundingClientRect();
  if (!bounds.height || bounds.height / 3 > innerHeight || block.matches(':target, :focus-within')) return;
  const observer = new IntersectionObserver(entries => {
    if (entries.some(e => e.isIntersecting && e.intersectionRatio >= 1/3)) finish(true);
  }, { threshold: 1/3 });
  // Only hide a reachable block below the fold after its observer is ready.
  function finish(animate = false) {
    observer.disconnect();
    block.classList.remove('m-reveal-wait');
    block.removeEventListener('focusin', show);
    removeEventListener('beforeprint', show);
    removeEventListener('resize', resize);
    removeEventListener('scroll', checkScroll);
    clearTimeout(fallback);
    reducedQ.removeEventListener('change', show);
    if (animate === true && !reduced() && !block.matches(':focus-within')) {
      block.animate([{ opacity: 0 }, { opacity: 1 }], { duration: time('--m-reveal'), easing: ease() });
    }
  }
  let fallback = 0;
  function checkScroll() {
    clearTimeout(fallback);
    fallback = setTimeout(() => {
      const r = block.getBoundingClientRect();
      if (Math.min(r.bottom, innerHeight) - Math.max(0, r.top) >= r.height / 3) show();
    }, 420);
  }
  function show() { finish(); }
  function resize() { if (block.getBoundingClientRect().height / 3 > innerHeight) show(); }
  addEventListener('scroll', checkScroll, { passive: true });
  block.addEventListener('focusin', show);
  addEventListener('beforeprint', show);
  addEventListener('resize', resize);
  reducedQ.addEventListener('change', show);
  observer.observe(block);
  block.classList.add('m-reveal-wait');
}

/* ---------------------------------------------------------------- swatches that change the photograph */
// [data-m-swatches="<selector of the img>"] holding buttons with data-src (and data-alt): a click or tap crossfades the
// photograph to that source in 180ms; the pressed swatch is aria-pressed="true"
function swatches() {
  document.querySelectorAll('[data-m-swatches]').forEach(group => {
    if (group.__mSw) return;
    group.__mSw = 1;
    group.addEventListener('click', e => {
      const b = e.target.closest('[data-src]');
      const img = document.querySelector(group.dataset.mSwatches || '') || group.closest('section, article, .card')?.querySelector('img');
      if (!b || !img || !group.contains(b)) return;
      group.querySelectorAll('[data-src]').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
      swapPhoto(img, b.dataset.src, b.dataset.alt);
    });
  });
}
function swapPhoto(img, src, alt) {
  if (!src || img.getAttribute('src') === src) return;
  const set = () => { img.removeAttribute('srcset'); img.src = src; if (alt) img.alt = alt; };
  const pre = new Image();
  pre.src = src;
  (pre.decode ? pre.decode() : Promise.resolve()).catch(() => {}).then(() => {
    const box = img.parentElement;
    if (reduced() || !box) return set();
    if (getComputedStyle(box).position === 'static') box.style.position = 'relative';
    const over = img.cloneNode();
    over.removeAttribute('id'); over.removeAttribute('srcset'); over.src = src; over.alt = ''; over.setAttribute('aria-hidden', 'true');
    Object.assign(over.style, { position: 'absolute', left: `${img.offsetLeft}px`, top: `${img.offsetTop}px`, width: `${img.offsetWidth}px`, height: `${img.offsetHeight}px`, margin: '0', pointerEvents: 'none' });
    box.append(over);
    over.animate([{ opacity: 0 }, { opacity: 1 }], { duration: time('--m-state'), easing: ease() }).finished
      .then(() => { set(); return img.decode ? img.decode().catch(() => {}) : null; }).then(() => over.remove(), () => over.remove());
  });
}

/* ---------------------------------------------------------------- open now */
// system.js writes the open-now line; while it says "Open now" the line wears a dot that sends out a soft ring twice
// the first time it is seen (motion.css)
function openNow() {
  document.querySelectorAll('[data-open-now]').forEach(el => {
    if (el.__mOpen) return;
    el.__mOpen = 1;
    const set = () => el.classList.toggle('m-open', /^open\b/i.test(el.textContent.trim()));
    set();
    new MutationObserver(set).observe(el, { childList: true, characterData: true, subtree: true });
    const io = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { el.classList.add('is-seen'); io.disconnect(); } }, { threshold: 1 });
    io.observe(el);
  });
}

/* ---------------------------------------------------------------- small content elements */
const progressItems = new Set();
const drawn = new WeakSet();
const drawing = new Map();
let progressFrame = 0;
function updateProgress() {
  progressFrame = 0;
  for (const el of progressItems) {
    if (!el.isConnected) { progressItems.delete(el); continue; }
    const rect = el.getBoundingClientRect();
    const progress = Math.min(1, Math.max(0, (innerHeight - rect.top) / (innerHeight + rect.height)));
    const value = progress.toFixed(4);
    if (el.style.getPropertyValue('--p') !== value) el.style.setProperty('--p', value);
  }
}
function queueProgress() {
  if (!progressFrame && progressItems.size) progressFrame = requestAnimationFrame(updateProgress);
}
const lineObserver = typeof IntersectionObserver === 'function' && new IntersectionObserver(entries => {
  for (const entry of entries) {
    if (!entry.isIntersecting) continue;
    const line = entry.target;
    lineObserver.unobserve(line); drawn.add(line);
    const length = line.pathLength.baseVal.value || line.getTotalLength();
    if (!length || reduced()) continue;
    const animation = line.animate([
      { strokeDasharray: String(length), strokeDashoffset: String(length) },
      { strokeDasharray: String(length), strokeDashoffset: '0' },
    ], { duration: time('--m-reveal'), easing: ease() });
    drawing.set(line, animation);
    animation.finished.then(() => drawing.delete(line), () => drawing.delete(line));
  }
});
function contentMotion() {
  const still = reduced() || shot() || html.dataset.motion === 'off';
  removeEventListener('scroll', queueProgress); removeEventListener('resize', queueProgress);
  if (progressFrame) cancelAnimationFrame(progressFrame);
  progressFrame = 0; progressItems.clear();
  for (const el of document.querySelectorAll('[data-m-progress]')) {
    if (el.getElementsByTagName('*').length > 20) { el.style.removeProperty('--p'); continue; }
    if (still) el.style.setProperty('--p', '1'); else progressItems.add(el);
  }
  if (progressItems.size) {
    addEventListener('scroll', queueProgress, { passive: true });
    addEventListener('resize', queueProgress); updateProgress();
  }
  if (!lineObserver) return;
  if (still) {
    lineObserver.disconnect();
    for (const animation of drawing.values()) animation.cancel();
  }
}
document.addEventListener('click', event => {
  const control = event.target.closest('button, input, select, summary, [role="tab"], [data-m-run]');
  const section = control?.closest('[data-own], [data-media-frame]');
  if (!section || reduced() || html.dataset.motion === 'off') return;
  counts(section);
  for (const line of section.querySelectorAll('path[data-m-draw], polyline[data-m-draw]')) {
    if (!drawn.has(line)) lineObserver?.observe(line);
  }
});
reducedQ.addEventListener('change', contentMotion);

/* ---------------------------------------------------------------- start */
export function init() {
  if (html.dataset.motion === 'off') { html.classList.add('m-enter-done'); return; }
  if (!html.hasAttribute('data-motion')) html.setAttribute('data-motion', '');
  try { enter(); } catch (e) { console.warn('motion.js: enter', e); document.querySelector('.hero[data-enter]')?.classList.add('is-entered'); }
  try { nav(); } catch (e) { console.warn('motion.js: nav', e); }
  try { tabs(); } catch (e) { console.warn('motion.js: tabs', e); }
  contentMotion();

  try { loops(); } catch (e) { console.warn('motion.js: loops', e); }
  try { reveals(); } catch (e) { console.warn('motion.js: reveals', e); document.querySelector('.m-reveal-wait')?.classList.remove('m-reveal-wait'); }
  try { swatches(); } catch (e) { console.warn('motion.js: swatches', e); }
  try { openNow(); } catch (e) { console.warn('motion.js: open now', e); }
}
/** call again after the page adds markup (a tab list, a stat, a loop) */
export const refresh = init;
export default { init, refresh };

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
else init();

// Installed before navigation by both browser checks. Record completed short animations too.
(() => {
  if (window.readMotionAudit) return;
  const entrance = new Map();
  const sections = new Map();
  const findings = new Map();
  const seen = new WeakSet();
  let loadedAt = Infinity;
  addEventListener('load', () => { loadedAt = performance.now(); }, { once:true });
  let scrolled = false, lastPointer = -Infinity, lastAction = -Infinity;
  addEventListener('scroll', () => { if (scrollY) scrolled = true; }, { passive: true });
  addEventListener('pointermove', () => { lastPointer = performance.now(); }, { passive: true });
  for (const type of ['pointerdown', 'keydown', 'click']) addEventListener(type, () => { lastAction = performance.now(); }, true);
  const name = el => el.id ? '#' + el.id : el.localName + (el.classList[0] ? '.' + el.classList[0] : '');
  function warn(rule, el, detail) {
    const where = name(el);
    findings.set(rule + ' ' + where, { rule, where, detail, sev: 'WARN' });
  }
  function sample(animation) {
    const effect = animation.effect, el = effect?.target;
    if (!(el instanceof Element) || seen.has(animation) || effect.getTiming().iterations === Infinity) return;
    seen.add(animation);
    const frames = effect.getKeyframes();
    const changes = key => frames.some(f => f[key] != null) && new Set(frames.map(f => f[key])).size > 1;
    const geometry = ['transform','translate','scale','rotate'].some(changes);
    const filter = changes('filter'), clip = changes('clipPath');
    const blur = filter && frames.some(frame => /blur\(/i.test(frame.filter || ''));
    if (!(geometry || filter || clip || changes('opacity'))) return;
    const rect = el.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0 || rect.bottom <= 0 || rect.top >= innerHeight || rect.right <= 0 || rect.left >= innerWidth) return;
    if (document.documentElement.dataset.temper === 'loud' &&
        el.closest('.hero[data-enter="set-type"], .hero[data-enter="line-blocks"], [data-moment="lines-rise"]')) return;
    const pseudo = effect.pseudoElement;
    if (pseudo) {
      const style = getComputedStyle(el, pseudo);
      // A text underline may grow from its edge without moving the link or a glyph.
      if (parseFloat(style.height) <= 3 && parseFloat(style.width) > 3) return;
    }
    const hovered = el.closest('a:hover, button:hover, summary:hover, [role="button"]:hover, .card:hover, .tile:hover');
    if (hovered && performance.now() - lastPointer < 500 && performance.now()-lastAction > 500) {
      if (geometry && !el.closest('[aria-expanded="true"], [aria-expanded="true"] + .nav__menu') &&
          !el.closest('.nav__menu, [role="tooltip"]')) warn('hover-shift', el, 'The control or its contents move on hover.');
      return;
    }
    if (performance.now()-lastAction < 500 || el.closest('[data-ui], [data-m-loop], [role="dialog"], dialog')) return;
    const xy = (value, span) => parseFloat(value || 0) * (String(value).endsWith('%') ? span/100 : 1);
    const points = frames.map(frame => {
      const move = (frame.translate || '').split(/\s+/);
      let x = xy(move[0], rect.width) || 0, y = xy(move[1], rect.height) || 0, scaled = false;
      if (frame.transform && frame.transform !== 'none') {
        // The matrix parser takes CSS pixels. Resolve percentage translates against this box first.
        const transform = frame.transform.replace(/translate(X|Y)?\(([^)]+)\)/gi, (_, axis, args) => {
          const coords = args.split(/,\s*|\s+/);
          const resolved = coords.map((v, i) => v.endsWith('%') ? xy(v, axis?.toLowerCase() === 'y' || i === 1 ? rect.height : rect.width)+'px' : v);
          return 'translate'+(axis || '')+'('+resolved.join(',')+')';
        });
        try {
          const m = new DOMMatrixReadOnly(transform);
          x += m.m41; y += m.m42;
          scaled = Math.abs(Math.hypot(m.m11,m.m12,m.m13)-1) > .001 || Math.abs(Math.hypot(m.m21,m.m22,m.m23)-1) > .001;
        } catch { scaled = /scale/i.test(transform); }
      }
      return { x,y,scaled };
    });
    const scaled = changes('scale') || points.some(p => p.scaled);
    const distance = Math.max(0,...points.flatMap(a => points.map(b => Math.hypot(a.x-b.x,a.y-b.y))));
    if (!scrolled && !scrollY) {
      if (performance.now() - loadedAt > 3000) return;
      entrance.set(el, [Math.max(0,rect.left),Math.min(innerWidth,rect.right),Math.max(0,rect.top),Math.min(innerHeight,rect.bottom)]);
      if (scaled || filter || clip) warn('entrance-heavy', el, 'Scale, filter or clipping changes on load.');
    } else {
      const section = el.closest('section, footer') || el.closest('main > *, article');
      if (!section) return;
      const group = sections.get(section) || new Set();
      group.add(el); sections.set(section, group);
      if (group.size > 2) warn('reveal-heavy', section, group.size+' elements animate in this section on scroll.');
      const heading = el.parentElement?.closest('h1,h2,h3,h4,h5,h6');
      const photo = el.matches('img,picture,video') || el.querySelector('img,picture,video');
      if (heading || distance > 16 || (photo && (scaled || clip || blur))) warn('reveal-heavy', el,
        heading ? 'A heading fragment animates on scroll.' : distance > 16 ? 'Scroll travel is '+Math.round(distance)+'px.' : 'A photograph changes scale, blur or clip on scroll.');
    }
  }
  for (const type of ['animationstart','transitionrun']) document.addEventListener(type, e => {
    for (const animation of e.target.getAnimations()) sample(animation);
  }, true);
  const animate = Element.prototype.animate;
  Element.prototype.animate = function(...args) {
    const animation = animate.apply(this,args);
    sample(animation);
    return animation;
  };
  window.readMotionAudit = () => {
    // Union of clipped rectangles. Nested and overlapping entrance boxes count only once.
    const boxes = [...entrance.values()];
    const xs = [...new Set(boxes.flatMap(b => b.slice(0,2)))].sort((a,b) => a-b);
    let area = 0;
    for (let i = 1; i < xs.length; i++) {
      const ranges = boxes.filter(b => b[0] < xs[i] && b[1] > xs[i-1]).sort((a,b) => a[2]-b[2]);
      let bottom = 0;
      for (const b of ranges) {
        area += (xs[i]-xs[i-1])*Math.max(0,b[3]-Math.max(bottom,b[2]));
        bottom = Math.max(bottom,b[3]);
      }
    }
    const share = area/(innerWidth*innerHeight);
    if (boxes.length > 2 || share > 1/3) warn('entrance-heavy', document.body, boxes.length+' entrance elements cover '+Math.round(share*100)+'% of the first screen.');
    return [...findings.values()];
  };
})();


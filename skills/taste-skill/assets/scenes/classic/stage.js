// tasteskill / scenes / classic / stage.js - the shared stage the restored classic scenes run on (references/scenes.md).
//
// A page never loads this file itself: assets/scenes/classic/classic.js loads it once, after GSAP and
// ScrollTrigger (and SplitText, Lenis when a scene asks), when the loader mounts a classic scene. It is
// the 2.4 stage, kept as it was, with three changes for the 2.5 loader: the held height is written as
// --sc-hold too (scenes.css sizes .sc.is-live from it), Stage.init() is not used (the loader mounts each
// [data-big-scene] itself), and nothing here looks for [data-scene], which the print objects own.
//
//   Stage.smooth()                         weighted wheel scrolling (Lenis), off for touch and reduced motion
//   Stage.scene(root, { hold, scrub, build, phone, rest })
//   Stage.split(el, 'lines' | 'words' | 'chars')   masked split text, SplitText when loaded
//   Stage.ready()                          resolves when fonts and the scenes' pictures are ready
(() => {
  const html = document.documentElement;
  const mq = (q) => window.matchMedia(q).matches;
  const live = !!(window.gsap && window.ScrollTrigger);
  if (live) gsap.registerPlugin(ScrollTrigger);
  if (live && window.SplitText) gsap.registerPlugin(SplitText);

  const Stage = {
    live,
    get reduced() { return mq('(prefers-reduced-motion: reduce)'); },
    get phone() { return mq('(max-width: 767px)'); },
    get touch() { return mq('(pointer: coarse)'); },
    lenis: null,
    scenes: [],
  };

  // Weighted wheel scrolling. lerp 0.1-0.14 feels heavy without lagging behind the hand; touch keeps the
  // phone's own scrolling, and reduced motion keeps the browser's.
  Stage.smooth = ({ lerp = 0.12 } = {}) => {
    if (!live || !window.Lenis || Stage.reduced || Stage.touch || Stage.lenis) return Stage.lenis;
    const lenis = new Lenis({ lerp, smoothWheel: true, anchors: true, autoRaf: false });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    html.classList.add('is-smooth');
    Stage.lenis = lenis;
    return lenis;
  };

  // One scroll scene.
  //   root   <section class="scene"> holding one <div class="scene-stage">
  //   hold   screens of scroll the stage is held for (1-4); the section is (hold + 1) screens tall
  //   scrub  true = locked to the scrollbar; a number = seconds of catch-up (0.3-0.8 reads as weight)
  //   build(tl, ctx)  add the tweens to tl; the timeline runs 0 → 1 over the hold. ctx: { root, stage, phone, q }
  //                   Return Stage.REST when this screen gets the finished composition instead (a tablet
  //                   the scene does not fit); the scene builds again when the screen crosses the phone
  //                   width or reduced motion changes, and a scene that decides by its own size starts
  //                   again on resize itself.
  //   phone  'same' (default) | 'rest' (the phone gets the finished composition) | { hold, build }
  //   rest(ctx)  optional: anything extra the finished composition needs (most scenes need nothing).
  //              Called whenever the scene shows its finished composition: reduced motion at any width,
  //              a phone set to 'rest', a build that returns Stage.REST, and no GSAP.
  // Sets --p (0-1) and data-beat on root, so CSS and captions can follow the scene too.
  Stage.REST = Object.freeze({ rest: true });
  Stage.scene = (root, opts = {}) => {
    if (!root) return null;
    const { hold = 2, scrub = true, build, phone = 'same', rest, beats = 0 } = opts;
    const stage = root.querySelector(':scope > .scene-stage') || root.firstElementChild;
    const q = (sel) => [...root.querySelectorAll(sel)];
    const toRest = (ctx) => { root.classList.remove('is-live'); root.classList.add('is-rest'); root.style.removeProperty('--hold'); root.style.removeProperty('--sc-hold'); if (rest) rest(ctx); };
    if (!live) { toRest({ root, stage, phone: Stage.phone, q }); return null; }
    const mm = gsap.matchMedia();
    // gsap.matchMedia runs the callback only while one of its conditions matches: `reduce` is there so
    // a wide screen with reduced motion (which matches neither of the others) still gets its rest().
    mm.add({ motion: '(prefers-reduced-motion: no-preference)', reduce: '(prefers-reduced-motion: reduce)', phone: '(max-width: 767px)' }, (c) => {
      const isPhone = c.conditions.phone;
      const ctx = { root, stage, phone: isPhone, q };
      const plan = isPhone ? (phone === 'rest' ? null : phone === 'same' ? { hold, build } : { hold: phone.hold ?? hold, build: phone.build ?? build }) : { hold, build };
      if (!c.conditions.motion || !plan || !plan.build) { toRest(ctx); return () => root.classList.remove('is-rest'); }
      root.classList.remove('is-rest');
      root.classList.add('is-live');
      root.style.setProperty('--hold', plan.hold);
      root.style.setProperty('--sc-hold', plan.hold);
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: root, start: 'top top', end: 'bottom bottom', scrub, invalidateOnRefresh: true,
          onUpdate: (self) => {
            root.style.setProperty('--p', self.progress.toFixed(4));
            if (beats) root.dataset.beat = String(Math.min(beats - 1, Math.floor(self.progress * beats)));
          },
        },
      });
      if (plan.build(tl, ctx) === Stage.REST) {
        if (tl.scrollTrigger) tl.scrollTrigger.kill();
        tl.kill();
        root.style.removeProperty('--p');
        toRest(ctx);
        return () => root.classList.remove('is-rest');
      }
      // pad the timeline to exactly 1 so positions in build() read as fractions of the hold
      if (tl.duration() < 1) tl.to({}, { duration: 1 - tl.duration() }, tl.duration());
      return () => { root.classList.remove('is-live'); root.style.removeProperty('--hold'); root.style.removeProperty('--sc-hold'); root.style.removeProperty('--p'); };
    });
    Stage.scenes.push(mm);
    return mm;
  };

  // Masked split text. Lines rise out of their own mask; words and characters are for short headings.
  Stage.split = (el, type = 'lines') => {
    if (!el) return [];
    if (window.SplitText && live) {
      const s = SplitText.create(el, { type: type === 'lines' ? 'lines' : type === 'words' ? 'lines,words' : 'lines,words,chars', mask: 'lines', aria: 'auto', autoSplit: false });
      return type === 'lines' ? s.lines : type === 'words' ? s.words : s.chars;
    }
    // fallback: words in inline-block spans, the full text kept for screen readers
    if (!el.dataset.split) {
      el.setAttribute('aria-label', el.textContent.trim());
      const words = el.textContent.trim().split(/\s+/).map((w) => { const span = document.createElement('span'); span.setAttribute('aria-hidden', 'true'); span.style.display = 'inline-block'; span.textContent = w; return span; });
      el.replaceChildren(...words.flatMap((span, i) => (i ? [' ', span] : [span])));
      el.dataset.split = 'words';
    }
    return [...el.children];
  };

  // Fonts and the scenes' pictures decide every height a trigger measures; refresh once they are in.
  Stage.ready = () => {
    const imgs = [...document.querySelectorAll('.sc.scene img')].map((i) => (i.complete ? null : i.decode().catch(() => {}))).filter(Boolean);
    return Promise.all([document.fonts ? document.fonts.ready : null, ...imgs]).then(() => { if (live) ScrollTrigger.refresh(); });
  };

  // A page written for 2.4 may still call Stage.init(): the loader mounts every scene, so it does nothing.
  Stage.init = () => {};

  // Each classic scene file (assets/scenes/<id>/classic.js) registers Scenes['<id>'] = (root, opts) => …
  window.Scenes = window.Scenes || {};
  window.Stage = Stage;
})();

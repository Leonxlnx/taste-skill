/*
  taste-skill layout-check.js - the layout v4 checks, run in the page (references/layout-v4.md, sections 1c and 2).
  A plain script with no imports, so a checker can evaluate its source in any page:
      const src = fs.readFileSync('<skill>/assets/layout/layout-check.js', 'utf8');
      await page.evaluate(src + '; window.lyCheck()')      // -> { vw, vh, L, R, nav, sections, findings }
  assets/layout/check.mjs runs it in one headless Chrome at 1440x900 and 390x844.

  Rules checked (each finding: { rule, where, detail }):
    edge-left / edge-right   a block of the page (text column, frame, card, grid, button row, the nav's
                             logo and actions, the footer) starts or ends off the page's lines: L, R
                             and the 12 column lines between them. A centred block is centred on the page
                             axis; a full-bleed one runs edge to edge.
    bleed-one-side           a block runs out to one viewport edge only (house rule: left and right edges
                             always the same): it stands on the lines or runs edge to edge.
    lines                    section-level text starts on more than two left lines (L and one split line).
    spill                    a block runs past L or R without reaching the viewport edge.
    one-sided                a section's visuals stop short of R (or of L) while the text holds the other
                             line, and the composition is not centred.
    section-height           a section is stretched past its content: the empty band beyond its own padding
                             (each side's padding counted as air up to 240px, 144 on a phone), or the largest
                             empty strip between two pieces of its content, is a third of its height or more. A
                             section is as tall as its content and its air (system.css pads it --padt and --padb).
                             The hero, a scene, a moment that holds its stage and a section its layer fills are
                             left out.
    section-air              neighbouring content closer than 72px (56 on a phone), scaled by density.
    hero-fold                the hero does not fill the first screen, runs past it (taller than one
                             screen), or the next section shows on it.
  Elements inside a visual (cards, frames, panels, stages, UI fragments, a collage) are not page edges.
  data-edge-free on an element skips it; data-screen="free" on a section skips the section rules.

  window.lyFinish({ reveal, wide }) (async: it scrolls) - the finish checks, the faults the 2.5.2 test builds
  shipped. Each finding: { rule, where, detail, fix, sev } (sev 'WARN' never blocks; no sev is a FAIL).
    empty-band       the empty strip above a section's first content and under its lowest (text, picture, control,
                     a box with its own ground) beyond its own padding (240px a side at most, 144 on a phone), or
                     a strip between two pieces of it, a third of the section's height or more (FAIL). A section that holds a pinned moment or a scene is left out: it
                     holds its stage on purpose.
    uneven-columns   a split (.grid columns side by side, at any width where they still stand side by side) whose
                     shorter column's lowest content ends above the taller one's by over 30% of the section's
                     height (FAIL), over 20% (WARN). Sticky columns, moments, scenes and the hero are left out.
    blank-screen    one screen of a section (its first, or a later one when it is taller than a screen) shows
                     nothing, after the check scrolled to it and waited for what reveals there.
    placeholder      a [data-placeholder] element, or an .example address or domain printed in the page's words.
    moment-target    a [data-moment] root that lacks what its moment needs (picture-develops: one <img> as its
                     direct child), so the moment does nothing or hides what it holds.
    moment-hidden    a dealt moment that shows nothing once it is scrolled into view.
    moment-idle      (WARN) a moment whose root the page left exactly as written after it came into view.
    motion-visible   at 1280 and wider: no dealt moment, scene or effect starts within the first three screens.
    reveal-none      the kit reveals sections (reveal: true) and this page has no revealed section.
    subject-repeat   (WARN) different photographs with one data-subject in two sections or more (the same file
                     twice is the checker's photo-repeat, which the gate holds as a FAIL).
    number-repeat    (WARN) one UI number ("2,412 ms", "$48") printed in three sections or more.
    heading-repeat   (WARN) two headings with the same words, or one holding the whole of the other.
*/
// Geometry and resting-state probes used by both browser checks.
window.lyRules = (() => {
  const own = 'section[data-own]';
  function peek(hero) {
    if (!hero?.matches('.hero--peek')) return null;
    const frame = hero.querySelector('.hero__window,.app-frame,.device') || hero.querySelector('.hero__collage,.hero__media,.hero__art,.hero-visual,.panel');
    if (!frame) return null;
    const r = frame.getBoundingClientRect(), top = r.top + scrollY;
    return top >= 0 && r.height <= 761 && Math.min(innerHeight - top, r.height) >= (innerWidth < 640 ? 300 : 420) - 1 ? frame : null;
  }
  function mirrored(el) {
    const grid=el?.closest('.grid.grid--mirror');
    if (!grid || grid.children.length!==2 || innerWidth<1024) return null;
    const first=[...document.querySelectorAll('main .grid.grid--mirror')].find(g=>!g.closest('section[data-own]'));
    if (grid !== first) return null;
    const [words,picture]=grid.children, wr=words.getBoundingClientRect(), pr=picture.getBoundingClientRect();
    return words.querySelector('h1,h2,h3') && (picture.matches('img,svg,canvas,video') || picture.querySelector('img,svg,canvas,video')) && wr.left>=pr.right-2 ? words : null;
  }
  function booking(hero) {
    const form=hero?.querySelector(':scope > .wrap > form.hero-book');
    if (!form || form.querySelectorAll('input:not([type=hidden]),select').length < 2 || !form.querySelector('button,input[type=submit]')) return null;
    const r=form.getBoundingClientRect(), h=hero.getBoundingClientRect();
    return r.height>0 && r.bottom <= h.bottom+1 ? form : null;
  }
  function holdsStage(section) {
    if (section.matches('.mo-cl__under') && section.parentElement?.matches('[data-moment="closing-lift"].is-live') &&
        section.previousElementSibling?.matches('.mo-cl__sheet') && getComputedStyle(section).position === 'sticky') return true;
    if (section.matches('[data-big-scene],[data-scene],.sc') || section.querySelector('[data-big-scene],[data-scene]')) return true;
    return [section,...section.querySelectorAll('[data-moment]')].filter(m=>m.matches('[data-moment]')).some(m=>
      [m,...m.querySelectorAll('*')].some(e=>getComputedStyle(e).position==='sticky' && e.getBoundingClientRect().height>0));
  }
  function colour(el) {
    for (let p = el; p; p = p.parentElement) {
      const c = getComputedStyle(p).backgroundColor;
      if (!/transparent|rgba\([^)]*,\s*0\)$/.test(c)) return c;
    }
    return 'rgb(255, 255, 255)';
  }
  function air() {
    const root = document.documentElement, phone = root.clientWidth < 640;
    const scale = parseFloat(getComputedStyle(root).getPropertyValue('--density')) || ({open:1.15,compact:.85}[root.dataset.density] || 1);
    return {min:(phone ? 56 : 72) * scale, max:(phone ? 200 : 280) * scale};
  }
  function emptyRun(above, below, inside, height, limit = air().max) {
    const edge = Math.max(above, below), longest = Math.max(edge, inside);
    return {edge, longest, fails: longest >= height / 3 || longest > limit};
  }
  function fullPicture(sec) {
    return /url\(|image-set\(/.test(getComputedStyle(sec).backgroundImage) || [...sec.querySelectorAll('img,video,canvas,svg,[role="img"]')].some(e => {
      const r = e.getBoundingClientRect();
      return r.width >= document.documentElement.clientWidth - 3 && r.height >= 120;
    });
  }
  function blankRun(sections, top, bottom) {
    const painted=[];
    for (const section of sections) {
      const layers=[...section.querySelectorAll('img,video,canvas,svg,.app-frame,[role=img],.layer,[data-scene],[data-big-scene],[data-moment]:not(section)')];
      if (/url\(|image-set\(/.test(getComputedStyle(section).backgroundImage)) layers.push(section);
      for (const el of layers) {
        const r=el.getBoundingClientRect();
        if (r.width<120 || r.height<48 || r.bottom<=top || r.top>=bottom) continue;
        const style=getComputedStyle(el);
        if (style.visibility!=='hidden' && +style.opacity>0) painted.push([Math.max(top,r.top),Math.min(bottom,r.bottom)]);
      }
    }
    let edge=top, longest=0;
    for (const [from,to] of painted.sort((a,b)=>a[0]-b[0])) { longest=Math.max(longest,from-edge); edge=Math.max(edge,to); }
    return Math.max(longest,bottom-edge);
  }
  const explaining = /\b(?:illustrative (?:image|picture|photo(?:graph)?|render(?:ing)?)|(?:drawing|illustration|picture|photo(?:graph)?|render(?:ing)?|image) of|(?:this|the) (?:picture|photo(?:graph)?|image|drawing|illustration) (?:is|shows|depicts|represents)|for (?:illustrative purposes|illustration only)|stock photo(?:graph)?|stand[- ]in|placeholder|shown (?:above|below|here)|made (?:in|with) code)\b/i;
  function factOwner(line) {
    const scope=line.closest('figure,article') || line.parentElement;
    if (!scope) return null;
    const nodes=[...scope.querySelectorAll('picture,img,video,svg,canvas,.app-frame,[data-chart],[data-diagram],[data-ui],[role="img"],[aria-hidden="true"],.fact-line')];
    const pictures=nodes.filter(n=>!n.matches('.fact-line') && !n.parentElement?.closest('picture,svg,.app-frame,[role="img"]'));
    const index=nodes.indexOf(line);
    return pictures.findLast(n=>nodes.indexOf(n)<index) || pictures[0] || null;
  }
  function fact(e) {
    const line = e.closest('.fact-line');
    if (!line) return null;
    const t = line.textContent.trim().replace(/\s+/g,' '), frame = line.closest('figure,article') || line.parentElement;
    const picture = factOwner(line);
    return Boolean(picture && [...frame.querySelectorAll('.fact-line')].filter(x=>factOwner(x)===picture).length===1 && t && [...t].length <= 60 && !explaining.test(t) && !/^(?:illustration|drawing|render|image|photograph)[.!]?$/i.test(t));
  }
  function page(kindOverride='') {
    const secs = [...document.querySelectorAll('main > section,main > .section,footer.closing')].filter(e => e.getBoundingClientRect().height);
    const out = [], ownSections = secs.filter(s => s.matches(own));
    const add = (rule, where, detail, sev = 'FAIL') => out.push({rule, where, detail, sev});
    if (secs.length && ownSections.length < (secs.length >= 6 ? 2 : 1)) add('own-count','page',secs.length + ' sections include ' + ownSections.length + ' own sections','WARN');
    if (secs.length >= 6 && new Set(secs.map(colour)).size === 1 && !secs.some(fullPicture)) add('ground-flat','page',secs.length + ' sections share one ground without a full-bleed picture');
    const kind = kindOverride || document.documentElement.dataset.type || document.querySelector('meta[name="page-type"],meta[name="page-kind"]')?.content;
    if (kind === 'place' && secs.length) {
      const visiblePicture=e=>{const r=e.getBoundingClientRect();return r.width>=120 && r.height>=80};
      const photos = new Set([...document.querySelectorAll('main img')].filter(visiblePicture).map(e=>e.currentSrc || e.src));
      const built = [...document.querySelectorAll('main svg,main canvas,main [data-ui],main [data-chart],main [data-diagram],main .chart,main .app-frame,main [role="img"]')].some(visiblePicture);
      const target = secs.length >= 6 ? 12 : 8;
      if (built && photos.size < target) add('photo-set','page',photos.size+' photographs and a built subject view. The photo-led reference for this length is '+target+'.','WARN');
    }
    for (const sec of ownSections) {
      const at = sec.id ? '#' + sec.id : 'section[data-own="' + sec.dataset.own + '"]';
      const sticky = [sec,...sec.querySelectorAll('*')].filter(e => getComputedStyle(e).position === 'sticky' && e.getClientRects().length);
      if (sticky.length && (sticky.length > 1 || sticky.includes(sec) || sec.getBoundingClientRect().height > innerHeight * 2.5)) add('pinned',at,sticky.length + ' sticky elements in a section ' + (sec.offsetHeight / innerHeight).toFixed(2) + ' screens tall');
      const auto = '[data-autoplay]:not([data-autoplay="false"]),[data-auto-advance]:not([data-auto-advance="false"]),[aria-roledescription="carousel"][data-interval],swiper-container[autoplay]';
      const timer = sec.matches(auto) || !!sec.querySelector(auto) || [...document.scripts].some(s => {
        const code=s.textContent;
        const local=sec.contains(s) || (sec.id && ["'#"+sec.id+"'",'"#'+sec.id+'"',"getElementById('"+sec.id+"')",'getElementById("'+sec.id+'")'].some(key=>code.includes(key)));
        return local && /\bsetInterval\s*\(/.test(code) && /\b(nextSlide|advance|selectedIndex|aria-selected|showSlide)\b/i.test(code);
      });
      const pause = [...sec.querySelectorAll('button,[role="button"]')].some(b =>
        !b.disabled && b.getAttribute('aria-disabled')!=='true' && b.getClientRects().length && (/pause|stop/i.test((b.getAttribute('aria-label') || '')+' '+b.textContent) || b.hasAttribute('data-pause')));
      if (timer && !pause) add('own-timer',at,'content advances on a timer without a pause control');
    }
    for (const el of document.querySelectorAll('svg,canvas,img,[role="img"]')) {
      const desc=[el.getAttribute('aria-label'),el.getAttribute('alt'),el.querySelector('title')?.textContent,el.getAttribute('data-lookalike')].filter(Boolean).join(' ');
      if (el.hasAttribute('data-lookalike') || /\b(?:redrawn|imitation|look[- ]?alike|replica)\b.{0,45}\b(?:logo|trademark)\b|\b(?:logo|trademark)\b.{0,45}\b(?:redrawn|imitation|look[- ]?alike|replica)\b/i.test(desc))
        add('brand-lookalike',el.id || el.localName,'The mark is identified as a reproduction. Use the supplied or licensed brand artwork.');
    }
    for (const line of document.querySelectorAll('.fact-line')) if (!fact(line)) add('visual-caption',line.id || '.fact-line','Use one factual line of up to 60 characters for this picture.');
    return out;
  }
  const countSelector='[data-count],[data-m-count],[data-count-to],[data-counter-end],[data-counter],.counter,.count-up,[data-count-up]';
  function counterKey(e) {
    if (e.id) return '#'+e.id;
    const parts=[];
    for (let p=e;p && p!==document.body;p=p.parentElement) {
      if (p.id) { parts.unshift('#'+p.id); break; }
      parts.unshift(p.localName+':'+([...p.parentElement.children].indexOf(p)+1));
    }
    return parts.join('/');
  }
  const numberLeaf = 'section[data-own] *,strong,b,output,[class*=stat],[class*=count]';
  const counterCandidates = () => [...document.querySelectorAll(countSelector+','+numberLeaf)].filter(e =>
    e.getClientRects().length && (e.matches(countSelector) || (!e.children.length && /^[-+]?\d[\d,.\s]*\s*(?:[%×x]|sec|ms)?$/i.test(e.textContent.trim()) && !e.closest('time,[role=timer],input,button,select,script,style'))));
  const targetValue = e => ['data-count-to','data-counter-end','data-final','data-target','data-to','data-count','data-m-count','data-counter','data-count-up'].map(a=>e.getAttribute(a)).find(v=>v && /^\s*[-+]?\d[\d.,\s]*%?\s*$/.test(v));
  const counters = (undeclaredOnly=false) => Object.fromEntries(counterCandidates().filter(e=>!undeclaredOnly || !targetValue(e)).map(e=>[counterKey(e),e.textContent.trim()]));
  const number = s => String(s).replace(/[,\s]/g,'').match(/[-+]?\d+(?:\.\d+)?/)?.[0];
  function changedCounters(resting, live) {
    const out=[];
    for (const [key, value] of Object.entries(resting)) if (key in live && number(value)!=null && number(live[key])!=null && Number(number(value)) !== Number(number(live[key])))
      out.push({rule:'still-wrong',sev:'FAIL',where:key,detail:'counter rests at "'+value+'", live value '+live[key]});
    return out;
  }
  function still(finals={}) {
    const out = [];
    const candidates = new Set(counterCandidates());
    for (const e of new Set([...document.querySelectorAll('section[data-own] *'),...candidates])) {
      if (e.closest('template,script,style,noscript,[hidden],details:not([open]) > :not(summary)') || !e.getBoundingClientRect().width) continue;
      let reason = '';
      const t = e.textContent.trim();
      if (candidates.has(e)) {
        const expected=targetValue(e) || finals[counterKey(e)];
        if (expected && number(expected)!=null && Number(number(t)) !== Number(number(expected))) reason = 'counter rests at "' + t + '", final value ' + expected;
      }
      if (!reason && e.closest(own) && (e.matches('img,svg,canvas,input,select,textarea') || [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim()))) {
        for (let p = e; p; p = p.parentElement) {
          const c = getComputedStyle(p);
          if (+c.opacity === 0 || c.visibility === 'hidden') { reason = 'content is hidden without script'; break; }
        }
      }
      if (reason) out.push({rule:'still-wrong',sev:'FAIL',where:e.id ? '#' + e.id : (e.closest(own)?.dataset.own || 'counter') + ' ' + e.localName,detail:reason});
    }
    return out;
  }
  return {peek,mirrored,booking,colour,air,holdsStage,fullPicture,emptyRun,blankRun,explaining,fact,page,still,counters,changedCounters};
})();

window.lyCheck = function lyCheck(opts = {}) {
  const tol = opts.tol ?? 1.5;
  const vw = document.documentElement.clientWidth, vh = innerHeight, sy = scrollY;
  const out = window.lyRules.page(), add = (rule, where, detail, fix) => out.push({ rule, where, detail, fix });
  const R1 = n => Math.round(n * 10) / 10;
  const name = el => {
    if (!el) return '?';
    const sec = el.closest('main > *, header, footer');
    const sid = sec ? (sec.id ? '#' + sec.id : sec.tagName.toLowerCase() + (sec.className ? '.' + String(sec.className).trim().split(/\s+/).slice(0, 2).join('.') : '')) : '';
    const own = el.tagName.toLowerCase() + (el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.') : '');
    const txt = (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 32);
    return `${sid} ${own}${txt ? ` "${txt}"` : ''}`.trim();
  };
  const shown = el => {
    const c = getComputedStyle(el);
    if (c.display === 'none' || c.visibility === 'hidden') return false;
    for (let e = el; e && e !== document.body; e = e.parentElement) if (parseFloat(getComputedStyle(e).opacity) === 0 || e.hasAttribute('inert')) return false;
    const r = el.getBoundingClientRect();
    return r.width > 1 && r.height > 1;
  };

  /* the lines */
  const box = document.querySelector('main :is(.wrap, .container)') || document.querySelector('.wrap, .container');
  if (!box) return { vw, vh, findings: [{ rule: 'container', where: 'page', detail: 'no .wrap' }] };
  const bc = getComputedStyle(box), br = box.getBoundingClientRect();
  const L = br.left + parseFloat(bc.paddingLeft), R = br.right - parseFloat(bc.paddingRight);
  const gut = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--gutter')) || 24;
  const cols = 12;   // system.css's .grid has 12 columns at every width (a phone spans them all, a footer column six)
  const col = (R - L - (cols - 1) * gut) / cols;
  const starts = [], ends = [];
  for (let k = 0; k < cols; k++) { starts.push(L + k * (col + gut)); ends.push(L + k * (col + gut) + col); }
  const onStart = x => starts.some(s => Math.abs(x - s) <= tol);
  const onEnd = x => ends.some(e => Math.abs(x - e) <= tol);
  const centred = r => Math.abs((r.left + r.right) / 2 - vw / 2) <= tol + 0.5;

  /* the blocks: page-level elements, never what sits inside a visual */
  const INSIDE = 'ul, ol, dl, [role="img"], [aria-hidden="true"], .card, .tile, .ui, [data-ui], [data-ui-load], .stage, .nav__menu, .menu-card, .frame, .panel, figure, .hero__media, .hero__art, .hero__stage, .hero__window, .ly-collage, .btn-row, svg, [data-edge-free], table, .photo-band__text .btn-row, details';
  const SEL = 'main section > :is(.wrap, .container) > *, main .hero-text > *, main .grid > *, main :is(h1, h2, h3, p, .btn-row, figure, .frame, .panel, .card, .tile, .hero__media, .hero__art, .hero__stage, .hero__window, .ly-collage, .hero__facts, table, ul, ol, dl), footer :is(.wrap, .container) > *, footer .grid > *';
  const TEXT = /^(H1|H2|H3|H4|P|UL|OL|DL|BLOCKQUOTE)$/;
  const VISUAL = 'img, video, canvas, picture, iframe, table, .card, .frame, .panel, .tile, .grid, .hero__media, .hero__art, .hero__stage, .hero__window, .ly-collage, .ly-piece';
  // words in a solid box (the photo hero's box, a photo band's box): the box stands on the line and its
  // words sit its padding in, so they are measured as the box, not as a page column
  const inBox = el => {
    for (let a = el.parentElement; a && !a.matches('main > *, body'); a = a.parentElement) {
      const cs = getComputedStyle(a), bg = cs.backgroundColor;
      if (parseFloat(cs.paddingLeft) > 0 && bg && bg !== 'transparent' && !/rgba\([^)]*,\s*0\)$/.test(bg)) return true;
    }
    return false;
  };
  const blocks = [...new Set([...document.querySelectorAll(SEL), ...document.querySelectorAll('section[data-own] > .wrap')])].filter(el => {
    if (el.closest('section[data-own]') && !el.matches('section[data-own] > .wrap')) return false;
    if (el.matches('[data-edge-free],button.loop-pause[aria-pressed], script, style, template')) return false;
    if (el.parentElement && el.parentElement.closest(INSIDE)) return false;
    if (inBox(el)) return false;
    const p = getComputedStyle(el).position;
    if (p === 'absolute' || p === 'fixed') return false;
    if (getComputedStyle(el).display.startsWith('inline') && !el.matches('.btn-row')) return false;
    return shown(el);
  });
  const bySection = new Map();
  for (const el of blocks) {
    const r = el.getBoundingClientRect();
    const full = r.left <= 0.5 && r.right >= vw - 0.5;
    const bleedR = !full && r.right >= vw - 0.5, bleedL = !full && r.left <= 0.5;
    // a text block (a heading, a paragraph, a list, a button row, or a wrapper holding only those) must start on a
    // line; only frames, cards, grids and pictures must also end on one
    const text = TEXT.test(el.tagName) || el.matches('.section-head, .hero__text, .btn-row, .hero__head > div') || ((el.textContent || '').trim().length > 0 && !el.querySelector(VISUAL));
    const cen = centred(r) && (getComputedStyle(el).textAlign === 'center' || el.parentElement && getComputedStyle(el.parentElement).textAlign === 'center' || getComputedStyle(el.parentElement || el).justifyItems === 'center' || Math.abs(r.width - (R - L)) > 2);
    const sec = el.closest('main > *');
    if (sec) { if (!bySection.has(sec)) bySection.set(sec, []); bySection.get(sec).push({ el, r, full, bleedR, bleedL, text, cen }); }
    if (full) continue;
    if (bleedR) { add('bleed-one-side', name(el), `runs from x ${R1(r.left)} out to the right viewport edge; the left side stays at ${R1(L)}`); continue; }
    if (bleedL) { add('bleed-one-side', name(el), `runs from the left viewport edge to x ${R1(r.right)}; the right side stays at ${R1(vw - R)} from the edge`); continue; }
    if (r.left < L - tol || r.right > R + tol) {
      if (!(cen && el.closest('[data-bleed], .bleed-r, .bleed-l'))) add('spill', name(el), `x ${R1(r.left)} to ${R1(r.right)}, the page runs ${R1(L)} to ${R1(R)}`);
      continue;
    }
    if (cen && !(Math.abs(r.left - L) <= tol)) continue;      // centred on the axis: fine both sides
    if (!onStart(r.left)) add('edge-left', name(el), `starts at x ${R1(r.left)}; the lines are ${R1(L)} and the column starts`);
    if (!text && !onEnd(r.right)) add('edge-right', name(el), `ends at x ${R1(r.right)}; the right line is ${R1(R)}`);
  }

  /* one-sided sections: visuals that stop short of the right line while text holds the left one */
  for (const [sec, list] of bySection) {
    const vis = list.filter(b => !b.text && !b.full && b.el.matches('figure, .frame, .panel, .card, .tile, .grid, .hero__media, .hero__art, .hero__stage, .ly-collage, .hero__window, .hero__facts, img, video, canvas, table'));
    if (!vis.length) continue;
    const uL = Math.min(...vis.map(b => b.r.left)), uR = Math.max(...vis.map(b => b.r.right));
    const all = list.filter(b => !b.full);
    const aL = Math.min(...all.map(b => b.r.left));
    const sym = Math.abs((uL - L) - (R - uR)) <= tol + 1;
    const mirror=vis.every(b=>window.lyRules.mirrored(b.el)) && Math.abs(uL-L)<=tol;
    // A working booking form can fill the right-hand column opposite a photograph.
    const rightForm = [...sec.querySelectorAll('form')].some(form => {
      const field = form.querySelector('input:not([type=hidden]), select, textarea');
      return field && shown(field) && Math.abs(form.getBoundingClientRect().right - R) <= tol;
    });
    if (!mirror && !rightForm && !sym && uR < R - tol && !vis.some(b => b.bleedR) && aL <= L + tol) add('one-sided', name(sec), `its visuals end at x ${R1(uR)}, short of the right line ${R1(R)}`);
  }

  /* left lines: every page heading and lead starts on L or on one split line (the same on every split) */
  const heads = [...document.querySelectorAll('main :is(h1, h2, .hero__lead, .section-head > p)')].filter(e => shown(e) && !e.closest(INSIDE.replace(', .btn-row', '')) || (e.matches('h1') && shown(e)));
  const lefts = [];
  for (const e of heads) {
    if (e.closest('section[data-own]')) continue;
    const r = e.getBoundingClientRect(), ta = getComputedStyle(e).textAlign;
    if (ta === 'center' || centred(r) && Math.abs(r.left - L) > tol) continue;
    if (e.closest('.hero__media, .hero__over') || inBox(e)) continue;   // words inside a picture (the film's frame) or a solid box are not a page line
    if (!lefts.some(x => Math.abs(x - r.left) <= 4)) lefts.push(r.left);
  }
  const extra = lefts.filter(x => Math.abs(x - L) > 4);
  if (extra.length > 1) add('lines', 'page', `headings and leads start on ${lefts.length} lines (x ${lefts.map(R1).join(', ')}); the page has ${R1(L)} and one split line`);

  /* nav and footer edges */
  const navEl = document.querySelector('header.nav, .nav');
  const logo = navEl && navEl.querySelector('.nav__logo');
  // nav-split puts the name on the page's centre line (sections-library.md); every other nav starts it on L
  const logoMid = logo && navEl.matches('.nav--split') && (r => Math.abs((r.left + r.right) / 2 - (L + R) / 2) <= tol + 0.5)(logo.getBoundingClientRect());
  if (logo && shown(logo) && !logoMid && Math.abs(logo.getBoundingClientRect().left - L) > tol) add('edge-left', 'nav logo', `at x ${R1(logo.getBoundingClientRect().left)}, the page's left line is ${R1(L)}${navEl.matches('.nav--split') ? ', or its centre on the centre line ' + R1((L + R) / 2) : ''}`);
  const acts = navEl && [...navEl.querySelectorAll('.nav__actions > *, .nav__toggle')].filter(shown);
  if (acts && acts.length) {
    const right = Math.max(...acts.map(a => a.getBoundingClientRect().right));
    if (Math.abs(right - R) > tol) add('edge-right', 'nav actions', `end at x ${R1(right)}, the page's right line is ${R1(R)}`);
  }

  /* screens */
  const navPos = navEl ? getComputedStyle(navEl).position : 'static';
  const navH = navEl && (navPos === 'sticky' || navPos === 'fixed') ? navEl.getBoundingClientRect().height : 0;
  // one screen is the whole viewport: the header is fixed over the top of every section (system.css)
  const screen = navPos === 'fixed' ? vh : Math.min(vh - navH, 1200);
  const secs = [...document.querySelectorAll('main > section, main > div.section')].filter(shown);
  // a picture's own frame (role=img, a figure) is content too, so a framed visual counts at its full size
  const INK = 'h1, h2, h3, h4, p, li, dt, dd, blockquote, img, video, canvas, svg, .btn, .card, .frame, .panel, .tile, .hero__media, .hero__art, .hero__stage, .hero__window, .ly-piece, hr, .ly-rule, table, figure, [role="img"]';
  const doc = r => ({ top: r.top + sy, bottom: r.bottom + sy, left: r.left, right: r.right });
  // ink: every visual, and every element that holds text of its own (a <strong> or <span> in a stat counts)
  const ownText = e => [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim());
  // a piece cut by a frame (overflow hidden or clip) counts only where it shows
  const clipped = (e, stop) => {
    const r = e.getBoundingClientRect(); let t = r.top, b = r.bottom, l = r.left, rr = r.right;
    for (let p = e.parentElement; p && p !== stop.parentElement; p = p.parentElement) {
      const o = getComputedStyle(p); if (o.overflow === 'visible' && o.overflowX === 'visible' && o.overflowY === 'visible') continue;
      const q = p.getBoundingClientRect(); t = Math.max(t, q.top); b = Math.min(b, q.bottom); l = Math.max(l, q.left); rr = Math.min(rr, q.right);
    }
    return { top: t, bottom: b, left: l, right: rr };
  };
  const inkOf = sec => [...sec.querySelectorAll('*')].filter(e => (e.matches(INK) || ownText(e)) && shown(e) && !e.closest('[data-edge-free]')).map(e => doc(clipped(e, sec))).filter(r => r.bottom - r.top > 1 && r.right > 0 && r.left < vw && r.right - r.left > 1);
  // a section that holds its stage at the height its own module sets (a scene, or a moment that pins while it plays),
  // and a section its own layer (a photograph or ground behind its words) fills
  const holds = window.lyRules.holdsStage;
  const layered = s => !!s.querySelector(':scope > :is(img, picture, video, canvas).layer') || getComputedStyle(s).backgroundImage !== 'none';
  const info = secs.map(s => {
    const r = doc(s.getBoundingClientRect());
    const ink = inkOf(s);
    const cTop = ink.length ? Math.min(...ink.map(i => i.top)) : r.top, cBot = ink.length ? Math.max(...ink.map(i => i.bottom)) : r.bottom;
    return { el: s, r, ink, cTop, cBot, free: s.matches('[data-screen="free"]'), held: holds(s), layer: layered(s) };
  });
  // a section is as tall as its content and its air (system.css pads it --padt and --padb): the empty band beyond its
  // padding (each side's padding counted as air up to 240px, 144 on a phone) or the largest empty strip between two
  // pieces of its content, a third of its height or more, is a section stretched past its content
  const cap = vw < 640 ? 144 : 240;
  info.forEach((s, i) => {
    const h = s.r.bottom - s.r.top;
    // the view a reviewer frames the section in (check.mjs --shots): its top at the top of the screen, the hero at 0;
    // with a header that is not fixed, its top under the nav
    const y0 = i === 0 ? 0 : (navPos === 'fixed' ? s.r.top : s.r.top - navH);
    s.frame = Math.max(0, Math.round(y0));
    if (s.el.matches('.hero') || s.free || s.held || s.layer) return;
    if (!s.ink.length) { add('section-height', name(s.el), `${Math.round(h)}px tall with no content in it`, 'give the section its content or take it out'); return; }
    const c = getComputedStyle(s.el), airT = Math.min(parseFloat(c.paddingTop) || 0, cap), airB = Math.min(parseFloat(c.paddingBottom) || 0, cap);
    const above = Math.max(0, s.cTop - s.r.top - airT), below = Math.max(0, s.r.bottom - airB - s.cBot);
    const iv = s.ink.map(k => [k.top, k.bottom]).sort((a, b) => a[0] - b[0]);
    let end = iv[0][1], hole = 0;
    for (const [a, z] of iv.slice(1)) { if (a - end > hole) hole = a - end; end = Math.max(end, z); }
    const {edge:band, longest:most, fails} = window.lyRules.emptyRun(above, below, hole, h);
    if (fails) add('section-height', name(s.el), hole > band
      ? `an empty strip of ${Math.round(hole)}px between two pieces of its content, ${Math.round(100 * most / h)}% of its ${Math.round(h)}px`
      : `stretched past its content: ${Math.round(band)}px of its ${Math.round(h)}px (${Math.round(100 * most / h)}%) empty beyond its ${Math.round(airT)}px and ${Math.round(airB)}px of air`,
    'let the section be as tall as its content and its air (no height, min-height or padding of its own) and close a hole between its parts; merge a short block into the section above, or give it the picture it lacks');
  });
  // Measure adjacent occupied edges, including the padding chosen for same-ground and thin sections.
  const {min: least, max} = window.lyRules.air();
  for (let i = 0; i + 1 < info.length; i++) {
    const a = info[i], b = info[i + 1];
    if (a.free || b.free || a.held || b.held || !a.ink.length || !b.ink.length) continue;
    const gap = b.cTop - a.cBot;
    if (gap < least - .5 && !(a.el.matches('.hero') && (a.layer || window.lyRules.fullPicture(a.el)))) add('section-air', name(a.el) + ' / ' + name(b.el), Math.round(gap) + 'px between sections, minimum ' + least + 'px');
    if (gap > max + .5 && window.lyRules.colour(a.el) === window.lyRules.colour(b.el)) {
      const blank = window.lyRules.blankRun([a.el,b.el],a.cBot,b.cTop);
      if (blank>max+.5) add('empty-band', name(a.el) + ' / ' + name(b.el), Math.round(blank) + 'px of continuous empty ground, limit ' + max + 'px');
    }
  }
  if (info.length && (info[0].el.matches('.hero,.section--hero') || info[0].el.querySelector('h1'))) {
    const hero = info[0];
    if (hero.r.top > navH + tol + (navPos === 'static' && navEl ? navEl.getBoundingClientRect().height : 0)) add('hero-fold', name(hero.el), `starts at y ${Math.round(hero.r.top)}, not under the nav`);
    if (hero.r.bottom < vh - tol) add('hero-fold', name(hero.el), `ends at y ${Math.round(hero.r.bottom)}, above the fold (${vh})`);
    // taller than one screen: a long h1 or lead pushed it past the fold (test heroes ran 1.2 to 1.38 screens)
    const frame = window.lyRules.peek(hero.el);
    if (hero.el.matches('.hero--peek') && !frame) add('hero-fold', name(hero.el), 'the window must show ' + (vw < 640 ? 300 : 420) + 'px on load and be at most 760px tall');
    if (hero.r.bottom > vh + tol && !frame && !(vw < 640 && window.lyRules.booking(hero.el))) add('hero-fold', name(hero.el), 'ends past the fold at ' + Math.round(hero.r.bottom) + 'px');
    const next = info[1];
    if (next && next.r.top < vh - tol) add('hero-fold',name(next.el),'the next section starts at ' + Math.round(next.r.top) + 'px, inside the first screen');
    if (next) {
      const hit = next.ink.filter(k => k.top < vh - 2);
      if (hit.length) add('hero-fold', name(next.el), `shows on the first screen from y ${Math.round(Math.min(...hit.map(k => k.top)))}`);
    }
  }
  /* the hero's numbers (heroes.json "at1440" / "at390"), measured, not read from the CSS */
  let hero = null;
  const hs = document.querySelector('main > section');
  if (hs) {
    const box = e => { if (!e) return null; const r = e.getBoundingClientRect(); return { x: Math.round(r.left), y: Math.round(r.top + sy), w: Math.round(r.width), h: Math.round(r.height) }; };
    const h1 = hs.querySelector('h1'), lead = hs.querySelector('.hero__lead');
    // the lines of text: every text node's boxes, less the live word's waiting words (stacked under the slot)
    const lineCount = e => {
      if (!e) return 0;
      const fs = parseFloat(getComputedStyle(e).fontSize), tops = [];
      const tw = document.createTreeWalker(e, NodeFilter.SHOW_TEXT);
      for (let n = tw.nextNode(); n; n = tw.nextNode()) {
        if (!n.textContent.trim() || n.parentElement.closest('.ly-word > .is-next, .ly-word > .is-out')) continue;
        const rg = document.createRange(); rg.selectNodeContents(n);
        for (const q of rg.getClientRects()) { if (q.width < 2) continue; if (!tops.some(t => Math.abs(t - q.top) < fs * 0.5)) tops.push(q.top); }
      }
      return tops.length;
    };
    const btns = [...hs.querySelectorAll('.btn')].filter(shown);
    hero = {
      height: Math.round(hs.getBoundingClientRect().height),
      h1: h1 && { size: parseFloat(getComputedStyle(h1).fontSize), leading: R1(parseFloat(getComputedStyle(h1).lineHeight) / parseFloat(getComputedStyle(h1).fontSize) * 100) / 100, lines: lineCount(h1), ...box(h1) },
      lead: lead && { size: parseFloat(getComputedStyle(lead).fontSize), lineHeight: parseFloat(getComputedStyle(lead).lineHeight), lines: lineCount(lead), ...box(lead) },
      buttons: btns.length ? { n: btns.length, h: Math.round(btns[0].getBoundingClientRect().height), first: box(btns[0]) } : null,
      visual: box(hs.querySelector('.hero__media, .hero__art, .hero__stage, .ly-collage, .hero__window') || hs.querySelector('.hero__bg, .ly-pic')),
    };
  }
  return {
    vw, vh, L: R1(L), R: R1(R), nav: Math.round(navH), screen: Math.round(screen), hero,
    sections: info.map(s => ({ where: name(s.el), top: Math.round(s.r.top), height: Math.round(s.r.bottom - s.r.top), content: Math.round(s.cBot - s.cTop), contentTop: s.cTop, contentBottom: s.cBot, frame: s.frame })),
    findings: out,
  };
};

window.lyFinish = async function lyFinish(opts = {}) {
  const vw = document.documentElement.clientWidth, vh = innerHeight, sy0 = scrollY;
  const out = [], add = (rule, where, detail, fix, sev) => out.push(sev ? { rule, where, detail, fix, sev } : { rule, where, detail, fix });
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const go = async (y, ms) => { scrollTo(0, Math.max(0, y)); await wait(ms); };
  const pct = x => Math.round(100 * x) + '%';
  const secs = [...document.querySelectorAll('main > section, main > div.section')].filter(s => { const c = getComputedStyle(s); return c.display !== 'none' && s.getBoundingClientRect().height > 40; });
  const secName = s => {
    if (!s) return 'page';
    if (s.id) return 'section#' + s.id;
    const cls = typeof s.className === 'string' && s.className.trim() ? '.' + s.className.trim().split(/\s+/).slice(0, 2).join('.') : '';
    return `section${cls} (section ${secs.indexOf(s) + 1})`;
  };
  const secOf = el => el.closest('main > section, main > div.section');
  const opaque = el => { for (let e = el; e && e !== document.documentElement; e = e.parentElement) if (parseFloat(getComputedStyle(e).opacity) < 0.05) return false; return true; };
  const ownText = e => [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim());
  const INK = 'h1, h2, h3, h4, h5, h6, p, li, dt, dd, blockquote, figcaption, img, video, canvas, svg, iframe, button, input, select, textarea, .btn, .card, .frame, .panel, .tile, table, hr, [role="img"]';
  const filled = c => c.backgroundImage !== 'none' || !/rgba\([^)]*,\s*0\)$|transparent/.test(c.backgroundColor);
  // the boxes that show in a section, clipped by every frame above them and by the section itself; seen: only what is
  // not faded out (opacity) at this moment, else what takes its place (a piece waiting for its reveal still counts)
  const inkOf = (sec, seen) => {
    const sr = sec.getBoundingClientRect(), sa = sr.width * sr.height, list = [];
    for (const e of sec.querySelectorAll('*')) {
      if (e.closest('script, style, template, noscript')) continue;   // data-edge-free frees edges, its content still counts
      const c = getComputedStyle(e);
      if (c.display === 'none' || c.visibility === 'hidden') continue;
      const r0 = e.getBoundingClientRect(); if (r0.width < 2 || r0.height < 2) continue;
      if (!(e.matches(INK) || ownText(e) || (filled(c) && r0.width * r0.height < 0.9 * sa))) continue;
      let t = r0.top, b = r0.bottom, l = r0.left, rr = r0.right;
      for (let p = e.parentElement; p && p !== sec.parentElement; p = p.parentElement) {
        const o = getComputedStyle(p); if (o.overflow === 'visible' && o.overflowX === 'visible' && o.overflowY === 'visible' && p !== sec) continue;
        const q = p.getBoundingClientRect(); t = Math.max(t, q.top); b = Math.min(b, q.bottom); l = Math.max(l, q.left); rr = Math.min(rr, q.right);
      }
      t = Math.max(t, sr.top); b = Math.min(b, sr.bottom);
      if (b - t < 2 || rr - l < 2 || rr <= 0 || l >= vw) continue;
      if (seen && !opaque(e)) continue;
      list.push({ e, top: t + scrollY, bottom: b + scrollY });
    }
    return list;
  };
  // a section that holds its screens on purpose: a scene, or a moment that pins (sticky) while it plays
  const pins = window.lyRules.holdsStage;
  const ground = s => getComputedStyle(s).backgroundImage !== 'none';

  /* empty-band and blank-screen, section by section */
  for (const s of secs) {
    const r = s.getBoundingClientRect(), top = r.top + scrollY, h = r.height, bot = top + h;
    if (ground(s)) continue;   // a photograph or a drawn ground fills the section
    const ink = inkOf(s, false), pinned = pins(s);
    // the hero is judged by its own fold and fill checks (hero-fill, hero-fold): its air is designed per form
    if (ink.length && !pinned && !s.matches('.hero')) {
      // the empty strips: above the first piece and under the lowest beyond the section's own padding (each side's
      // padding counted as air up to 240px, 144 on a phone: more is a stretched section), and between two pieces of it
      // (a split that space-between pulled apart: a 550px hole between the h2 and the cards on a phone)
      const sc = getComputedStyle(s), cap = vw < 640 ? 144 : 240;
      const airT = Math.min(parseFloat(sc.paddingTop) || 0, cap), airB = Math.min(parseFloat(sc.paddingBottom) || 0, cap);
      const iv = ink.map(i => [Math.max(top, i.top), Math.min(bot, i.bottom)]).sort((x, y) => x[0] - y[0]);
      let end = iv[0][1], gap = { px: 0 };
      for (const [a, z] of iv.slice(1)) { if (a - end > gap.px) gap = { px: a - end, from: end, to: a }; end = Math.max(end, z); }
      const above = Math.max(0, iv[0][0] - top - airT), below = Math.max(0, bot - airB - end);
      const {edge:band, longest:most, fails} = window.lyRules.emptyRun(above, below, gap.px, h);
      const f = most / h, inner = gap.px > band;
      if (fails) add('empty-band', secName(s), inner
        ? `a strip of ${Math.round(gap.px)}px (${pct(f)} of its ${Math.round(h)}px) between two pieces of its content is empty (y ${Math.round(gap.from - top)} to ${Math.round(gap.to - top)} in the section)`
        : `${Math.round(band)}px ${above >= below ? 'above its first content' : 'below its last content'} (${pct(f)} of its ${Math.round(h)}px) are empty beyond its ${Math.round(airT)}px and ${Math.round(airB)}px of air`,
      inner ? 'close the hole: keep the heading and what follows together (no justify-content: space-between, no height of its own)'
        : 'let the section be as tall as its content and air');
    }
    // uneven columns: in a split that still stands side by side, the shorter column's lowest content against the
    // taller's, relative to the section (empty-band measures the whole section, so a tall photograph hid a text
    // column that ended 200-400px earlier). A sticky column moves with the scroll and is left out.
    if (ink.length && !pinned && !s.matches('.hero')) {
      let worst = null;
      for (const g of s.querySelectorAll('.grid')) {
        if (g.closest('section[data-own], [data-moment], [data-big-scene], .card, .frame, .panel')) continue;
        const cols = [...g.children].filter(c => { const r0 = c.getBoundingClientRect(); return r0.width > 0.15 * r.width && r0.height > 40 && getComputedStyle(c).position !== 'sticky'; });
        if (cols.length < 2) continue;
        const rs = cols.map(c => c.getBoundingClientRect()), t0 = Math.min(...rs.map(q => q.top));
        const row = cols.filter((c, i) => rs[i].top - t0 < 48);   // the first row of the grid: the columns that start together
        if (row.length < 2) continue;
        const rr = row.map(c => c.getBoundingClientRect());
        if (rr.some((q, i) => rr.some((p, j) => j !== i && Math.min(q.right, p.right) - Math.max(q.left, p.left) > 4))) continue;   // stacked, not side by side
        const bots = row.map(c => Math.max(-Infinity, ...ink.filter(i => c.contains(i.e)).map(i => i.bottom))).filter(Number.isFinite);
        if (bots.length < 2) continue;
        const px = Math.max(...bots) - Math.min(...bots), f = px / h;
        if (!worst || f > worst.f) worst = { f, px, short: row[bots.indexOf(Math.min(...bots))] };
      }
      if (worst && worst.f > 0.2) {
        const c = worst.short, what = c.matches('figure, picture, img') || (c.querySelector('img') && !c.querySelector('h2, h3, p')) ? 'the picture column' : 'the text column';
        add('uneven-columns', secName(s), `${what} of a split ends ${Math.round(worst.px)}px (${pct(worst.f)} of the section's ${Math.round(h)}px) above the other column's lowest content: an empty area beside the taller column`,
          'stretch the shorter column (align-self: stretch, its picture or card grown to the foot with height: 100% and object-fit: cover) or move content into it (the hours, a fact list, the link row), or let the taller column lose a picture', worst.f > 0.3 ? undefined : 'WARN');
      }
    }
    // its screens, one by one (a short last piece under 40% of a screen is padding). A pinned moment or a scene moves
    // its content with the scroll, so its screens are read only on screen
    const n = Math.max(1, Math.floor(h / vh + 0.6));
    for (let k = 0; k < n && k < 4; k++) {
      const a = top + k * vh, z = Math.min(bot, a + vh), need = Math.min(40, (z - a) * 0.08), nth = ['first', 'second', 'third', 'fourth'][k];
      // what shows in that screen: the pieces in it, when together they cover need px of its height (a short section of
      // text lines, each under 40px, is not blank)
      const over = list => { const iv = list.map(i => [Math.max(a, i.top), Math.min(z, i.bottom)]).filter(([p, q]) => q > p).sort((x, y) => x[0] - y[0]);
        let n = 0, e = -Infinity; for (const [p, q] of iv) { if (q > e) { n += q - Math.max(p, e); e = q; } }
        return n >= need ? list.filter(i => Math.min(i.bottom, z) > Math.max(i.top, a)) : []; };
      if (!pinned && !over(ink).length) { add('blank-screen', secName(s), `its ${nth} screen (y ${Math.round(a)} to ${Math.round(z)}) holds nothing at all`, 'put the section\'s content back in that screen (a moment on the wrong element can hide it: see moment-target), or take out the height that makes it'); continue; }
      if (!pinned && over(inkOf(s, true)).length) continue;
      await go(a, 900);   // what reveals there gets its time, then it is read again
      const seen = inkOf(s, true).filter(i => i.bottom > scrollY + 2 && i.top < scrollY + vh - 2);
      if (!(pinned ? seen : over(seen)).length) add('blank-screen', secName(s), `its ${nth} screen (y ${Math.round(a)} to ${Math.round(z)}) shows nothing after 0.9 s on screen`, 'make what is in that screen show: a reveal or a moment that never ends hides it, or a moment sits on the wrong element (moment-target); data-still on the section keeps it standing');
    }
  }

  /* placeholders */
  for (const e of document.querySelectorAll('[data-placeholder]')) add('placeholder', `${secName(secOf(e))} ${e.tagName.toLowerCase()}[data-placeholder]`, 'a stand-in marked data-placeholder is on the page; every visitor sees its dashed outline', 'replace it with the real thing (the brief\'s address, the photograph), or take the element out; never ship data-placeholder');
  {
    const EX = /[\w.+-]+@[\w-]+(?:\.[\w-]+)*\.example\b|\b[\w-]+\.example(?:\.\w+)?\b|\bexample\.(?:com|org|net)\b/i;
    const tw = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); const seen = new Set();
    for (let t = tw.nextNode(); t; t = tw.nextNode()) {
      const m = t.textContent.match(EX), p = t.parentElement;
      if (!m || !p || p.closest('script, style, template, noscript, code, pre') || seen.has(m[0])) continue;
      const c = getComputedStyle(p); if (c.display === 'none' || c.visibility === 'hidden' || p.getBoundingClientRect().width < 2) continue;
      seen.add(m[0]);
      add('placeholder', `${secName(secOf(p)) === 'page' ? (p.closest('footer') ? 'footer' : 'page') : secName(secOf(p))} "${m[0]}"`, `a stand-in address is printed on the page ("${m[0]}"): no visitor can use it`, 'never print the address: a button that names the action ("Email an order") whose mailto: is on .example, which the report lists (copy.md)');
    }
  }

  /* the moments: what each needs on its root, and that each shows once it is on screen */
  const NEEDS = {
    'picture-develops': [el => !!el.querySelector(':scope > img') && el.querySelectorAll('img').length === 1, 'one <img> as its direct child, and no other picture', '<figure data-moment="picture-develops"><img src=... alt=...></figure> on the one photograph; three pictures want no moment, or each its own figure'],
    'window-parallax': [el => el.querySelectorAll('img').length === 1, 'exactly one <img>', '<figure data-moment="window-parallax"><img ...></figure> on one photograph'],
    'liquid-hover': [el => el.querySelectorAll('img').length === 1, 'exactly one <img>', '<figure data-moment="liquid-hover"><img ...></figure> on one photograph'],
    'photo-chapters': [el => !!el.querySelector('.mo-ph__list') && [...el.querySelectorAll('.mo-ph__ch')].length >= 2 && [...el.querySelectorAll('.mo-ph__ch')].every(c => c.querySelector('.mo-ph__pic')), '.mo-ph__list with two or more .mo-ph__ch, each holding a .mo-ph__pic', 'copy the markup of assets/moments/photo-chapters/demo.html'],
    'pinned-chapters': [el => !!el.querySelector('.mo-pc__visuals') && [...el.querySelectorAll('.mo-pc__step')].length >= 2 && [...el.querySelectorAll('.mo-pc__step')].every(st => st.querySelector('.mo-pc__visual')), '.mo-pc__visuals and two or more .mo-pc__step, each holding a .mo-pc__visual', 'copy the markup of assets/moments/pinned-chapters/demo.html'],
    'closing-lift': [el => ['.mo-cl__sheet', '.mo-cl__under', '.mo-cl__img', '.mo-cl__band'].every(q => el.querySelector(q)), '.mo-cl__sheet, .mo-cl__under, .mo-cl__img and .mo-cl__band', 'copy the markup of assets/moments/closing-lift/demo.html'],
    'counter-rolls': [el => el.matches('[data-count], .t-stat') || !!el.querySelector('[data-count], .t-stat'), 'a number marked data-count or .t-stat', 'mark each figure: <strong class="t-stat" data-count>48</strong>'],
    'marquee-row': [el => { const t = el.querySelector('.mo-mq__track') || el.firstElementChild; return !!t && t.children.length >= 2; }, 'a .mo-mq__track with two or more items', 'copy the markup of assets/moments/marquee-row/demo.html'],
    'word-highlight': [el => el.matches('p, h2, h3, blockquote') || !!el.querySelector('.mo-wh__text, p, h2, h3, blockquote'), 'a paragraph, h2, h3 or blockquote of words', 'use the heading or paragraph whose words it highlights'],
  };
  for (const m of opts.catalogue || []) {
    if (NEEDS[m.id] || !/\bh[12]\b/.test(m.text?.sel || '')) continue;
    NEEDS[m.id] = [el => el.matches('h1,h2') || !!el.querySelector(m.text.sel), 'the heading it moves', 'use the content or closing heading from its demo'];
  }
  const moms = [...document.querySelectorAll('[data-moment]')].filter(el => !el.parentElement?.closest('[data-moment]'));
  let srcDoc = null;
  try { srcDoc = new DOMParser().parseFromString(await (await fetch(location.href, { cache: 'force-cache' })).text(), 'text/html'); } catch { /* a dev server that will not serve it twice */ }
  const srcMoms = srcDoc ? [...srcDoc.querySelectorAll('[data-moment]')].filter(el => !el.parentElement?.closest('[data-moment]')) : [];
  const shape = el => { const c = el.cloneNode(true); for (const x of [c, ...c.querySelectorAll('*')]) { for (const a of ['data-moment-mounted', 'data-moment-still', 'data-moment-failed']) x.removeAttribute(a); } return c.outerHTML.replace(/\s+/g, ' '); };
  for (const [k, el] of moms.entries()) {
    const id = el.dataset.moment, where = `${secName(secOf(el) || el)} [data-moment="${id}"]`;
    // read as written (a mounted moment rebuilds its root: photo-chapters moves its list into a stage)
    const need = (!opts.catalogue || opts.catalogue.some(m=>m.id===id)) && NEEDS[id], as = srcMoms[k] && srcMoms[k].dataset.moment === id ? srcMoms[k] : el;
    if (need && !need[0](as)) { add('moment-target', where, `${id} needs ${need[1]}; this ${as.tagName.toLowerCase()} holds ${as.querySelectorAll('img').length} img in ${as.children.length} children`, need[2]); continue; }
    const r = el.getBoundingClientRect(), top = r.top + scrollY;
    await go(top - Math.max(0, (vh - Math.min(r.height, vh)) / 2), 1300);
    const vis = getComputedStyle(el).visibility !== 'hidden' && opaque(el) && r.width > 2 && r.height > 2;
    const now = inkOf(el, true).filter(i => i.bottom > scrollY && i.top < scrollY + vh);
    if (!vis || (!now.length && !el.matches(INK) && !ownText(el))) add('moment-hidden', where, `${id} shows nothing once it is on screen (1.3 s after it came in)`, `give it what assets/moments/${id}/demo.html gives it, or take data-moment off and deal another`);
    else if (vw >= 1024 && !el.dataset.momentStill && !el.dataset.momentFailed && srcMoms[k] && srcMoms[k].dataset.moment === id && shape(el) === shape(srcMoms[k]))
      add('moment-idle', where, `${id} left its root exactly as written once it was on screen: it found nothing to move`, `compare the markup with assets/moments/${id}/demo.html`, 'WARN');
  }

  /* motion in the first three screens, and the section reveals */
  if (vw >= 1280) {
    const MOVE = '[data-moment]:not([data-moment-failed]), [data-big-scene], [data-scene], [data-effect], [data-fx]';
    const early = [...document.querySelectorAll(MOVE)].filter(e => { const r = e.getBoundingClientRect(); return r.height > 2 && r.top + scrollY < 3 * vh; });
    // a page with no moment, scene or effect at all is moment-none's (a warning unless a required deal is missing); the
    // hero demos are heroes only. Here: the page has its motion, but all of it past the third screen
    const later = early.length ? [] : [...document.querySelectorAll(MOVE)].map(e => `${e.dataset.moment || e.dataset.bigScene || e.dataset.scene || e.dataset.effect || e.dataset.fx || '?'} at screen ${Math.floor((e.getBoundingClientRect().top + scrollY) / vh) + 1}`);
    if (later.length) add('motion-visible', 'page', `after the hero's entrance nothing moves in the first three screens (the page's motion: ${later.join(', ')})`, 'move the first dealt moment (start.mjs plan names it) into the second or third section, on the element its demo.html names');
  }
  if (opts.reveal && secs.length > 2) {
    const R = '[data-reveal], [data-revealed], [data-m-reveal], .m-reveal, .is-revealed';
    if (!document.querySelector(R) && !secs.every(s => s.matches('[data-still]'))) add('reveal-none', 'page', 'no section reveals: the kit reveals each section\'s h2 and its lead photograph once as it comes in, and this page has none', 'load assets/motion/motion.js as the starter does (<script type="module" src="assets/motion/motion.js"></script>) and keep data-still for the few sections that must stand');
  }

  /* repeats: one subject twice, one UI number in three sections, one heading twice */
  {
    const stem = u => String(u || '').split(/[?#]/)[0].split('/').pop().replace(/[-_@](\d{2,4}w?|\d+x\d+|\dx)(?=\.\w+$)/i, '').replace(/\.\w+$/, '');
    const by = new Map();
    for (const i of document.images) {
      const sub = (i.getAttribute('data-subject') || '').trim().toLowerCase(); if (!sub || /^(product|stand-in|detail|client|photo|picture|image|illustration|person|people)$/.test(sub)) continue;
      const r = i.getBoundingClientRect(); if (r.width < 120 || r.height < 80) continue;
      if (!by.has(sub)) by.set(sub, new Map());
      const m = by.get(sub), f = stem(i.currentSrc || i.getAttribute('src')); if (!m.has(f)) m.set(f, i);
    }
    // data-subject is often a broad word ("bar", "part"): two pictures of it may be two views, so this only WARNs
    for (const [sub, m] of by) if (m.size > 1 && new Set([...m.values()].map(secOf)).size > 1) add('subject-repeat', `data-subject "${sub}"`, `${m.size} different photographs show "${sub}" in ${new Set([...m.values()].map(secOf)).size} sections (${[...new Set([...m.values()].map(i => secName(secOf(i))))].join(', ')})`, 'one photograph per subject a page: when two show the same thing (the oven twice), give the second section a picture of what it says', 'WARN');
    const NUM = /(?:[$€£¥]\s?\d[\d.,]*|\b\d{1,3}(?:[,.]\d{3})+(?:[.,]\d+)?|\b\d+(?:[.,]\d+)?\s?(?:ms|µs|s|min|h|%|kb|mb|gb|tb|k|m|x|fps|rpm|kg|g|km|mm|cm)\b|\b\d{3,}\b)/gi;
    const nums = new Map();
    for (const s of secs) {
      const set = new Set((s.innerText || '').match(NUM) || []);
      for (const n of set) { const k = n.replace(/\s+/g, ' ').toLowerCase(); if (/^(19|20)\d\d$/.test(k)) continue; if (!nums.has(k)) nums.set(k, new Set()); nums.get(k).add(s); }
    }
    // one finding per set of sections: five figures of one mock shown three times are one repeat
    const groups = new Map();
    for (const [n, set] of nums) if (set.size >= 3) { const key = [...set].map(s => secs.indexOf(s)).join(','); if (!groups.has(key)) groups.set(key, { set, list: [] }); groups.get(key).list.push(n); }
    for (const { set, list } of groups.values()) add('number-repeat', list.slice(0, 3).map(n => `"${n}"`).join(', ') + (list.length > 3 ? ` +${list.length - 3}` : ''), `${list.length > 1 ? 'these figures are' : 'this figure is'} printed in ${set.size} sections (${[...set].map(secName).slice(0, 4).join(', ')})`, 'each section shows its own state or view: change the figures in the repeats, or let one section carry them', 'WARN');
    const norm = t => t.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, ' ').replace(/\s+/g, ' ').trim();
    const hs = [...document.querySelectorAll('main :is(h1, h2, h3)')].filter(h => h.getBoundingClientRect().width > 2 && !h.closest('[aria-hidden="true"], .card, .tile, li')).map(h => ({ h, t: norm(h.innerText || h.textContent) })).filter(x => x.t.split(' ').length >= 2);
    for (let a = 0; a < hs.length; a++) for (let b = a + 1; b < hs.length; b++) {
      const A = hs[a].t, B = hs[b].t, short = A.length <= B.length ? A : B, long = short === A ? B : A;
      if (A === B || (short.split(' ').length >= 3 && (' ' + long + ' ').includes(' ' + short + ' '))) add('heading-repeat', `${secName(secOf(hs[b].h))} ${hs[b].h.tagName.toLowerCase()}`, `"${hs[b].t.slice(0, 50)}" repeats the ${hs[a].h.tagName.toLowerCase()} "${hs[a].t.slice(0, 50)}"`, 'say the next thing in the second heading, not the first one again (references/copy.md)', 'WARN');
    }
  }
  scrollTo(0, sy0);
  return out;
};

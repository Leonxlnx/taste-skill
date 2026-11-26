export function lopsidedNav(left, right) {
  const near = Math.min(Math.abs(left), Math.abs(right));
  const far = Math.max(Math.abs(left), Math.abs(right));
  return near <= 2 && far > 24;
}

export function excessActionCopies(controls) {
  return controls.length >= 3 && controls.some(control => control.btn);
}

// Runs inside the inspected page after the checker's scroll pass.
export function measureFinish() {
  if (['loud', 'lively'].includes(document.documentElement.dataset.temper)) return null;
  const height = document.scrollingElement.scrollHeight;
  const occupied = Array(Math.ceil(height / innerHeight)).fill(false);
  const canvas = document.createElement('canvas').getContext('2d', {willReadFrequently: true});
  const rgba = value => {
    canvas.clearRect(0, 0, 1, 1);
    canvas.fillStyle = value;
    canvas.fillRect(0, 0, 1, 1);
    return Array.from(canvas.getImageData(0, 0, 1, 1).data);
  };
  const painted = e => e.checkVisibility({opacityProperty: true, visibilityProperty: true});
  const actionRects = [];
  let rules = 0, arrows = 0;
  for (const el of document.body.querySelectorAll('*')) {
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height || r.right <= 0 || r.left >= innerWidth || !painted(el)) continue;
    const style = getComputedStyle(el);
    if (el.matches('[data-ui],[data-example],.hero__window,.app-frame,.device,.ui-win,.ts-device,[data-part="demo-loop"] .part-frame,.d-win,.dw')) {
      actionRects.push({left:r.left,right:r.right,top:r.top+scrollY,bottom:r.bottom+scrollY});
    }
    if (el.matches('a.btn--primary[href],button.btn--primary,input.btn--primary[type=submit]') && r.height >= 36 && r.height <= 64) {
      actionRects.push({left:r.left, right:r.right, top:r.top+scrollY, bottom:r.bottom+scrollY});
    }
    if (['Top','Right','Bottom','Left'].some(side => {
      const width = parseFloat(style['border' + side + 'Width']);
      return width > 0 && width <= 1 && rgba(style['border' + side + 'Color'])[3] > 20;
    })) rules++;
    if (el.matches('a[href]:not(.btn)') && el.innerText?.trim()) {
      const glyph = getComputedStyle(el,'::after').content;
      if (/[→↗➜➝⟶]/u.test(el.innerText + glyph) ||
          el.querySelector('svg.m-arrow, [class*="arrow" i], use[href*="arrow" i]')) arrows++;
    }
    if (r.width < 48 || r.height < 40) continue;
    const image = el.matches('img') ? el.complete && el.naturalWidth > 0
      : el.matches('svg') ? !el.closest('defs,mask,symbol,button,a.btn') && !!el.querySelector('path,rect,circle,polygon,line,image,use')
      : el.matches('video,canvas,.app-frame,.hero__window,[data-ui],[data-chart],[data-diagram],[data-map],iframe[src*="map"],[role="img"]')
        || el.matches('figure[aria-label],[data-diagram],.frame[role="img"]') && !!el.querySelector('img,svg,dl,table,.ui')
        || el.matches('figure') && !!el.querySelector('table')
        || el.matches('[aria-label]') && !!el.querySelector('details > summary')
        || /url\(/.test(style.backgroundImage);
    if (!image) continue;
    let top = r.top, bottom = r.bottom, left = r.left, right = r.right;
    for (let parent = el.parentElement; parent && parent !== document.body; parent = parent.parentElement) {
      const cs = getComputedStyle(parent), bounds = parent.getBoundingClientRect();
      if (/clip|hidden|scroll|auto/.test(cs.overflowY)) { top = Math.max(top,bounds.top); bottom = Math.min(bottom,bounds.bottom); }
      if (/clip|hidden|scroll|auto/.test(cs.overflowX)) { left = Math.max(left,bounds.left); right = Math.min(right,bounds.right); }
    }
    if (bottom-top < 40 || Math.min(innerWidth,right)-Math.max(0,left) < 48) continue;
    const first = Math.max(0, Math.floor((top + scrollY) / innerHeight));
    const last = Math.min(occupied.length, Math.ceil((bottom + scrollY) / innerHeight));
    for (let screen = first; screen < last; screen++) {
      const visibleHeight = Math.min(bottom + scrollY, (screen + 1) * innerHeight) - Math.max(top + scrollY, screen * innerHeight);
      if (visibleHeight >= 40) occupied[screen] = true;
    }
  }
  const h1 = [...document.querySelectorAll('h1,[role="heading"][aria-level="1"]')].find(painted);
  let lines = 0, fraction = 1;
  if (h1) {
    const tops = [], walker = document.createTreeWalker(h1, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      if (!walker.currentNode.textContent.trim()) continue;
      const range = document.createRange(); range.selectNodeContents(walker.currentNode);
      for (const r of range.getClientRects()) if (r.width && r.height && !tops.some(y => Math.abs(y-r.top)<r.height*.5)) tops.push(r.top);
    }
    lines = tops.length;
    const column = h1.closest('.wrap,.container') || h1.closest('section, main') || document.body;
    fraction = h1.getBoundingClientRect().width / column.clientWidth;
  }
  const value = getComputedStyle(document.documentElement).getPropertyValue('--p-accent').trim();
  const accent = value && CSS.supports('color',value) ? rgba(value).slice(0,3) : null;
  return {height, empty:occupied.filter(v=>!v).length, screens:occupied.length, lines, fraction, rules, arrows, accent, actionRects};
}

export function finishWarnings(width, m, accentShare) {
  const out = [];
  const warn = (check, msg, fix) => out.push({check, sev:'WARN', id:0, sel:'(the page)', text:'', doc:null, msg, fix});
  if (width === 1440 && m.empty > .35*m.screens) warn('picture-sparse', m.empty+' of '+m.screens+' screens have no subject at least 48 × 40px.', 'Show the subject of a section with a different view of the actual work.');
  if (width === 1440 && m.lines >= 3 && m.fraction < .5) warn('headline-narrow', m.lines+' headline lines in '+Math.round(m.fraction*100)+'% of the content width.', 'Give the title seven columns or move the picture under it.');
  if (m.arrows > 3) warn('arrow-links', m.arrows+' text links carry arrows.', 'Keep arrows on at most two links whose destination needs one.');
  if (width === 1440 && m.rules > 34) warn('rule-heavy', m.rules+' visible elements have hairlines.', 'Separate repeated items with space.');
  if (accentShare > (width === 390 ? .012 : .006)) warn('accent-wide', (accentShare*100).toFixed(2)+'% of the page matches the accent outside its main buttons.', 'Keep the accent on actions, links, focus and one small mark.');
  return out;
}

// Runs inside Chrome. Text ranges measure the ink even in a full-width paragraph.
export function measurePresence() {
  const findings = [];
  const frames =
    '[data-ui],[data-ui-still],[data-example],.app-frame,.hero__window,.ui-win,.device,.ts-device,.d-win,.dw,[data-part="demo-loop"] .part-frame';
  const subjects = frames + ',[data-chart],[data-diagram],[data-visual],img,video,canvas,svg,figure';
  const sections = [...document.querySelectorAll('main section,main > div.section')].filter(
    (section) => !section.parentElement.closest('section')
  );
  const painted = (el) =>
    el.checkVisibility({ opacityProperty: true, visibilityProperty: true }) &&
    el.getBoundingClientRect().width > 0;
  const contentWidth = (el) => {
    const style = getComputedStyle(el);
    return el.getBoundingClientRect().width - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
  };
  const containerOf = (section) => section.querySelector(':scope > .wrap,:scope > .container') || section;
  const pageWidth = Math.max(
    0,
    ...sections.filter(painted).map((section) => contentWidth(containerOf(section)))
  );
  const fontPixels = (el) => {
    let scale = 1;
    if (el instanceof SVGTextContentElement) {
      const matrix = el.getScreenCTM();
      if (matrix) scale = Math.hypot(matrix.c, matrix.d);
    } else {
      for (let parent = el; parent; parent = parent.parentElement) {
        const style = getComputedStyle(parent);
        if (style.transform !== 'none') {
          const matrix = new DOMMatrixReadOnly(style.transform);
          scale *= Math.hypot(matrix.c, matrix.d);
        }
        scale *= parseFloat(style.zoom) || 1;
      }
    }
    return scale * parseFloat(getComputedStyle(el).fontSize);
  };

  // Clip evidence to the window and take its union so nested rows and text count once.
  function coverage(frame, rects) {
    const clips = rects.map(r => ({
      l: Math.max(frame.left, r.left), r: Math.min(frame.right, r.right),
      t: Math.max(frame.top, r.top), b: Math.min(frame.bottom, r.bottom)
    })).filter(c => c.r > c.l && c.b > c.t);
    const edges = [...new Set(clips.flatMap(c => [c.l, c.r]))].sort((a,b) => a-b);
    let area = 0;
    for (let i = 1; i < edges.length; i++) {
      const strips = clips.filter(c => c.l < edges[i] && c.r > edges[i-1]).sort((a,b) => a.t-b.t);
      let bottom = frame.top;
      for (const c of strips) {
        area += (edges[i]-edges[i-1]) * Math.max(0, c.b-Math.max(c.t,bottom));
        bottom = Math.max(bottom,c.b);
      }
    }
    return area / (frame.width * frame.height);
  }
  for (const section of sections.filter(painted)) {
    const container = containerOf(section);
    const width = contentWidth(container);
    const title = section.querySelector('h1');
    const boxes = [],
      words = [];
    const textBoxes = [];
    const walker = document.createTreeWalker(section, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const node = walker.currentNode,
        el = node.parentElement;
      if (
        !el ||
        !node.textContent.trim() ||
        el.closest('script,style,template,[hidden],svg title,svg desc,svg defs') ||
        !painted(el)
      )
        continue;
      const range = document.createRange();
      range.selectNodeContents(node);
      const rects = [...range.getClientRects()].filter((r) => r.width && r.height);
      if (rects.length) {
        words.push(el);
        textBoxes.push({el, rects});
        boxes.push(...rects);
      }
    }
    // Edge photographs may be siblings of the wrap. The wrap supplies the measure, the section supplies the subject.
    const media = [...section.querySelectorAll(subjects)].filter(
      (el) => painted(el) && el.getBoundingClientRect().width >= 48
    );
    boxes.push(...media.map((el) => el.getBoundingClientRect()));
    for (const el of section.querySelectorAll('pre,table,fieldset,button,a.btn,blockquote,details')) {
      if (!painted(el)) continue;
      const style = getComputedStyle(el);
      if (
        style.backgroundColor !== 'rgba(0, 0, 0, 0)' ||
        ['Top', 'Right', 'Bottom', 'Left'].some((side) => parseFloat(style['border' + side + 'Width']) > 0)
      )
        boxes.push(el.getBoundingClientRect());
    }
    // A side heading and its reading column, or a second occupied track, count even when their text is short.
    for (const group of section.querySelectorAll('*')) {
      if (
        group.children.length < 2 ||
        !['grid', 'flex', 'inline-grid', 'inline-flex'].includes(getComputedStyle(group).display)
      )
        continue;
      const tracks = [...group.children]
        .filter(
          (el) =>
            painted(el) && (el.innerText?.trim() || el.matches('img,svg') || el.querySelector('img,svg'))
        )
        .map((el) => el.getBoundingClientRect());
      for (const a of tracks) {
        const neighbour = tracks.some(
          (b) =>
            a !== b &&
            (a.right <= b.left + 1 || b.right <= a.left + 1) &&
            a.top < b.bottom &&
            b.top < a.bottom
        );
        if (neighbour) boxes.push(a);
      }
    }
    const emit = (check, sev, message, fix) =>
      findings.push({
        check,
        sev,
        id: 0,
        sel: section.id ? '#' + section.id : 'section',
        text: '',
        doc: null,
        msg: message,
        fix
      });
    if (innerWidth === 1440 && section.matches('[data-family="pricing"],[data-family="plans"],#pricing,#plans,.pricing')) {
      const selector = 'article,dl > div,.price-card,.pricing-card,.plan-card,[data-plan],:is(.plans,.pricing-grid,.price-options,[data-plans]) > :is(li,div)';
      const plans = [...section.querySelectorAll(selector)].filter(el => painted(el) && !el.parentElement.closest(selector));
      for (const plan of plans) {
        const inclusion = [...plan.querySelectorAll('li,p,dd')].some(el =>
          !el.children.length && !/[$€£]/.test(el.textContent) && el.textContent.trim().split(/\s+/).length >= 3);
        const price = /(?:[$€£¥]\s*\d|\d[\d.,]*\s*(?:€|USD|EUR|GBP)|\bfree\b|contact (?:us|sales))/i.test(plan.innerText);
        const missing = [];
        if (!price) missing.push('price');
        if (!inclusion) missing.push('included features');
        if (!plan.querySelector('a[href],button')) missing.push('action');
        if (missing.length) {
          const name = plan.querySelector('dt,h3,h4')?.textContent || plan.id || 'unnamed';
          emit('view-thin','WARN','Plan “' + name + '” lacks ' + missing.join(' and ') + '.',
            'Give each plan its supplied inclusions, price and action in a full column or card.');
        }
      }
    }
    const reading =
      !media.length &&
      !section.querySelector('table,form,pre,button') &&
      section.querySelector('p,blockquote,dl') &&
      [container, ...container.querySelectorAll('article,.reading-column,.measure,blockquote,div')].some(
        (el) => {
          const r = el.getBoundingClientRect();
          return (
            r.width <= 721 &&
            Math.abs((r.left + r.right) / 2 - innerWidth / 2) < 32 &&
            words.every((word) => el.contains(word))
          );
        }
      );
    const closing = section.matches('main > section:last-of-type');
    const form = closing && section.querySelector('form')?.getBoundingClientRect();
    const centredForm = form && form.width <= 721 && Math.abs((form.left + form.right - innerWidth) / 2) < 32;
    const closingZone = closing && section.matches('.ts-gradient[data-text-zone="left"]') &&
      section.querySelector('h2') && section.querySelector('a.btn,button');
    const typeClose = closing && section.querySelector('.close--type h2') && section.querySelector('.close--type .btn[href]');
    if (!typeClose && !title && innerWidth === 1440 && boxes.length && !reading && !centredForm && !closingZone) {
      const occupied =
        Math.max(...boxes.map((r) => Math.min(innerWidth, r.right))) -
        Math.min(...boxes.map((r) => Math.max(0, r.left)));
      const referenceWidth = width <= 720 ? pageWidth : width;
      if (occupied < referenceWidth * 0.6)
        emit(
          'half-empty',
          'FAIL',
          Math.round(occupied) + 'px occupied across ' + Math.round(referenceWidth) + 'px.',
          'Use the remaining columns for the subject or centre a reading column.'
        );
    }
    const windows = media.filter((el) => el.matches(frames) && !el.parentElement.closest(frames));
    const outer = media.filter((el) => !media.some((other) => other !== el && other.contains(el)));
    const views = windows.length ? windows : outer.length === 1 ? outer : [];
    for (const el of views) {
      const r = el.getBoundingClientRect();
      const items = words.filter((word) => el.contains(word));
      const screen = el.matches(frames) || (el.matches('[data-visual]') && items.length > 0);
      let gap = 0;
      for (let parent = el.parentElement; parent && section.contains(parent); parent = parent.parentElement) {
        const style = getComputedStyle(parent);
        if (style.display === 'grid' && style.gridTemplateColumns.split(' ').length > 1) {
          gap = parseFloat(style.columnGap) || 0;
          break;
        }
      }
      const sevenColumns = ((width + gap) * 7) / 12 - gap;
      const heroWindow = title && screen;
      const plate = el.closest('.ts-gradient,[data-visual],.hero__media') || el;
      const across =
        heroWindow &&
        title.getBoundingClientRect().bottom <= plate.getBoundingClientRect().top &&
        (plate.getBoundingClientRect().width + 2 < width || r.width + 2 < contentWidth(plate));
      const small =
        screen && innerWidth === 1440 &&
        (across ||
          r.width + 1 < (heroWindow ? Math.max(880, sevenColumns) : sevenColumns) ||
          r.height + 1 < (heroWindow ? 480 : 360));
      const phoneText = innerWidth === 390 && screen && items.some((word) => fontPixels(word) < 12.95);
      const phoneWidth = innerWidth === 390 && screen && r.width < width - 2;
      let share = null;
      const composedView = el.matches('[data-visual],[data-chart],[data-diagram]') && !el.matches('img,svg,canvas,video');
      if (innerWidth === 1440 && (screen || composedView)) {
        const evidence = textBoxes.filter(b => el.contains(b.el)).flatMap(b => b.rects);
        for (const node of el.querySelectorAll('*')) {
          if (!painted(node) || node.closest('template,defs,svg *')) continue;
          const box = node.getBoundingClientRect();
          const row = node.matches('tr,[role=row],dl > div:has(> dt):has(> dd),[data-row]') ||
            [...node.classList].some(token => /(?:^|[-_])row$/.test(token));
          const listRow = node.matches('li') && box.width >= node.parentElement.getBoundingClientRect().width * .8;
          // A coloured day, time bar or plotted point is visible even with no text.
          const style = getComputedStyle(node);
          const mark = !node.children.length && box.width * box.height < r.width * r.height * .2 &&
            (style.backgroundColor !== 'rgba(0, 0, 0, 0)' || parseFloat(style.borderTopWidth) > 0);
          if (row || listRow || mark || node.matches('img,svg,canvas,video,button,[data-mark]')) evidence.push(box);
        }
        share = coverage(r, evidence);
      }
      if ((share !== null && share < .35) || small || phoneWidth || phoneText || (screen && items.length < 6)) {
        const measured =
          Math.round(r.width) +
          ' × ' +
          Math.round(r.height) +
          'px, ' +
          items.length +
          ' text items' + (share === null ? '' : ', ' + Math.round(share * 100) + '% occupied') +
          (phoneText ? ', text under 13px' : '') +
          '.';
        emit(
          'view-thin',
          'WARN',
          measured,
          'Give the main view seven columns and a complete working state. Reflow its content at phone width.'
        );
      }
    }
  }
  return findings;
}

// Sample all document rows at a fixed scale; tall documents stay within Chrome's capture limits.
export async function checkFinish(tab, width, decodePng) {
  if (width !== 1440 && width !== 390) return [];
  const m = await tab.eval('(' + measureFinish.toString() + ')()');
  const presence = await tab.eval('(' + measurePresence.toString() + ')()');
  if (!m) return presence;
  let matches = 0, pixels = 0;
  if (m.accent && Math.max(...m.accent)-Math.min(...m.accent) >= 35) {
    for (let y=0; y<m.height; y+=7200) {
      const clip = {x:0, y, width, height:Math.min(7200,m.height-y), scale:144/width};
      const shot = await tab.send('Page.captureScreenshot',{format:'png', captureBeyondViewport:true, clip});
      const png = decodePng(Buffer.from(shot.data,'base64'));
      const [r,g,b] = m.accent;
      const rgb = png.ch >= 3;
      for (let i=0; i<png.data.length; i+=png.ch) {
        if ((r-png.data[i])**2+(g-png.data[i+(rgb?1:0)])**2+(b-png.data[i+(rgb?2:0)])**2 <= 576) {
          const pixel = i/png.ch, x = (pixel%png.w + .5)*width/png.w, pageY = y+(Math.floor(pixel/png.w)+.5)*clip.height/png.h;
          if (!m.actionRects.some(r => x>=r.left && x<r.right && pageY>=r.top && pageY<r.bottom)) matches++;
        }
        pixels++;
      }
    }
  }
  return presence.concat(finishWarnings(width,m,pixels ? matches/pixels : 0));
}

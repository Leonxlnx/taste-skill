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

// Sample all document rows at a fixed scale; tall documents stay within Chrome's capture limits.
export async function checkFinish(tab, width, decodePng) {
  if (width !== 1440 && width !== 390) return [];
  const m = await tab.eval('(' + measureFinish.toString() + ')()');
  if (!m) return [];
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
  return finishWarnings(width,m,pixels ? matches/pixels : 0);
}

// In-page measurements added in v2.5 for what reviewers kept finding and the first probe did not see:
// pictures inside headlines and sentences, giant footers and credit walls, upscaled pictures, colour
// sprawl, drag rails, pages built from boxes, label clutter, walls of text, rows empty on the left.
// Runs once at the top of the page after the walk, so every reveal has fired. Returns plain JSON.
// { scenes: true } (round 10, part B): on the reduced-motion page, where scenes show their finished compositions, the
// boxed-list check looks inside the scenes only (the caller keeps boxedLists).
export function extra(opts = {}) {
  const scenesOnly = !!(opts && opts.scenes);
  const W = innerWidth, H = innerHeight, D = document.documentElement, B = document.body || D;
  const sy = scrollY || 0;
  const r2 = Math.round;
  const visible = (el) => { const cs = getComputedStyle(el); if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity < 0.05) return false; const r = el.getBoundingClientRect(); return r.width > 2 && r.height > 2; };
  const inUI = (el) => !!el.closest('[data-ui], table, pre, code, form, dialog, [role=dialog], [role=table], [role=grid], svg');
  const rgb = (c) => { const m = c && c.match(/rgba?\(([^)]+)\)/); if (!m) return null; const p = m[1].split(/[ ,/]+/).filter(Boolean).map(Number); return p.length > 3 && p[3] < 0.5 ? null : p.slice(0, 3); };
  const hsl = ([r, g, b]) => { r /= 255; g /= 255; b /= 255; const mx = Math.max(r, g, b), mn = Math.min(r, g, b); const l = (mx + mn) / 2; let h = 0, s = 0; if (mx !== mn) { const d = mx - mn; s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn); h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h *= 60; } return { h, s, l }; };
  const chromatic = (c) => { if (!c) return null; const x = hsl(c); if (x.s < 0.3 || x.l < 0.12 || x.l > 0.94) return null; if (x.s * (1 - Math.abs(2 * x.l - 1)) < 0.14) return null; return x.h; };
  const groundOf = (el) => { for (let e = el; e && e !== D.parentNode; e = e.parentElement) { const c = rgb(getComputedStyle(e).backgroundColor); if (c) return c; } return [255, 255, 255]; };
  const words = (t) => (t.trim().match(/\S+/g) || []).length;
  const textOf = (el) => (el.innerText || '').trim().replace(/\s+/g, ' ');
  const out = {};

  // --- pictures inside headlines: a photograph or clip set into the words, or letters filled with a picture
  const media = 'img, picture, video, canvas, svg image, [style*="background-image"]';
  out.imageInHeadline = [];
  for (const h of document.querySelectorAll('h1, h2, h3, [role=heading]')) {
    if (!visible(h) || inUI(h)) continue;
    const pics = [...h.querySelectorAll(media)].filter((p) => { const r = p.getBoundingClientRect(); return r.width >= 24 && r.height >= 16 && visible(p); });
    const cs = getComputedStyle(h);
    const clipped = (cs.backgroundClip === 'text' || cs.webkitBackgroundClip === 'text') && /url\(/.test(cs.backgroundImage);
    if (pics.length || clipped) out.imageInHeadline.push({ text: textOf(h).slice(0, 60), how: clipped ? 'letters filled with a picture' : `${pics.length} picture(s) inside the heading` });
  }
  // a picture placed over a headline's line box (absolutely positioned into the words) counts too
  const heads = [...document.querySelectorAll('h1, h2')].filter((h) => visible(h) && !inUI(h)).map((h) => ({ h, r: h.getBoundingClientRect() })).filter((x) => x.r.height >= 40);
  for (const img of document.querySelectorAll('img, video')) {
    if (!visible(img) || inUI(img)) continue;
    const r = img.getBoundingClientRect();
    if (r.width * r.height > W * H * 0.2 || r.width < 40) continue; // a full picture behind a headline is the hero, not an inset
    for (const { h, r: hr } of heads) {
      if (h.contains(img)) continue;
      const ix = Math.min(r.right, hr.right) - Math.max(r.left, hr.left), iy = Math.min(r.bottom, hr.bottom) - Math.max(r.top, hr.top);
      if (ix > r.width * 0.6 && iy > r.height * 0.6 && r.height <= hr.height * 0.9) { out.imageInHeadline.push({ text: textOf(h).slice(0, 60), how: 'a small picture placed among the words' }); break; }
    }
  }

  // --- small pictures inside running text ("mini images in sentences")
  out.inlinePictures = [];
  for (const img of document.querySelectorAll('p img, p video, p picture, li img, span img, a img')) {
    if (!visible(img) || inUI(img) || img.closest('nav, header, footer, button, h1, h2, h3')) continue;
    const r = img.getBoundingClientRect(); const p = img.closest('p, li, span');
    if (!p || r.height > 120 || r.width < 18) continue;
    const t = textOf(p); if (words(t) < 4) continue; // a logo with a name is fine
    out.inlinePictures.push({ text: t.slice(0, 60), size: `${r2(r.width)}x${r2(r.height)}` });
  }

  // --- the footer: its largest type, and credits spread across it
  const foot = document.querySelector('footer') || [...B.children].filter(visible).at(-1);
  if (foot) {
    let big = { size: 0, text: '' };
    for (const el of foot.querySelectorAll('*')) { if (!el.childElementCount && textOf(el) && visible(el)) { const s = parseFloat(getComputedStyle(el).fontSize); if (s > big.size) big = { size: s, text: textOf(el).slice(0, 50) }; } }
    // a single text node can sit in an element with children (a wordmark with a span); check text nodes too
    const tw = document.createTreeWalker(foot, NodeFilter.SHOW_TEXT); let n;
    while ((n = tw.nextNode())) { const el = n.parentElement; if (!n.nodeValue.trim() || !el || !visible(el)) continue; const s = parseFloat(getComputedStyle(el).fontSize); if (s > big.size) big = { size: s, text: n.nodeValue.trim().slice(0, 50) }; }
    const creditRe = /wikimedia|openverse|flickr\.com|unsplash\.com\/@|pexels\.com\/@|creativecommons|\bCC[ -]BY|public domain|\bvia\b.*\b(commons|archive)|photo(graph)?s? by|licen[cs]ed under|\bcourtesy\b/i;
    const creditLinks = [...foot.querySelectorAll('a')].filter((a) => creditRe.test(a.href + ' ' + textOf(a)) && visible(a)).length;
    const creditText = (textOf(foot).match(new RegExp(creditRe.source, 'gi')) || []).length;
    out.footer = { size: r2(big.size), vw: +(big.size / W * 100).toFixed(1), text: big.text, creditLinks, creditMentions: creditText, words: words(textOf(foot)) };
  }

  // --- pictures shown larger than they were made (blurry upscales in big slots)
  out.upscaled = [];
  for (const img of document.querySelectorAll('img')) {
    if (!visible(img) || !img.naturalWidth || /\.svg(\?|$)/i.test(img.currentSrc || img.src)) continue;
    const r = img.getBoundingClientRect();
    if (r.width * r.height < W * H * 0.12) continue;
    const cs = getComputedStyle(img);
    // object-fit: cover shows the natural image scaled to cover the box
    const scale = cs.objectFit === 'cover' ? Math.max(r.width / img.naturalWidth, r.height / img.naturalHeight) : cs.objectFit === 'contain' ? Math.min(r.width / img.naturalWidth, r.height / img.naturalHeight) : r.width / img.naturalWidth;
    if (scale > 1.0) out.upscaled.push({ src: (img.currentSrc || img.src).split('/').pop().split('?')[0].slice(0, 50), shown: `${r2(r.width)}x${r2(r.height)}`, natural: `${img.naturalWidth}x${img.naturalHeight}`, scale: +scale.toFixed(2) });
  }
  for (const v of document.querySelectorAll('video')) {
    if (!visible(v) || !v.videoWidth) continue; const r = v.getBoundingClientRect();
    if (r.width * r.height < W * H * 0.2) continue;
    const scale = Math.max(r.width / v.videoWidth, r.height / v.videoHeight);
    if (scale > 1.25) out.upscaled.push({ src: (v.currentSrc || '').split('/').pop().split('?')[0].slice(0, 50), shown: `${r2(r.width)}x${r2(r.height)}`, natural: `${v.videoWidth}x${v.videoHeight}`, scale: +scale.toFixed(2), video: true });
  }

  // --- colour: the hues a visitor sees on grounds, headings and buttons, and how much page is on colour
  const bins = new Map(); let colouredArea = 0; const pageArea = W * Math.max(H, D.scrollHeight);
  const addHue = (h, why) => { if (h == null) return; const k = Math.floor(((h + 15) % 360) / 30); if (!bins.has(k)) bins.set(k, why); };
  let scanned = 0;
  for (const el of B.querySelectorAll('*')) {
    if (++scanned > 6000) break;
    if (inUI(el)) continue;
    const cs = getComputedStyle(el); const c = rgb(cs.backgroundColor); if (!c) continue;
    const r = el.getBoundingClientRect(); const a = r.width * r.height; if (a < 12000 || !visible(el)) continue;
    const h = chromatic(c);
    if (h != null) { const parent = el.parentElement ? chromatic(groundOf(el.parentElement)) : null; if (parent == null || Math.abs(parent - h) > 20) colouredArea += a; addHue(h, a > W * 200 ? 'a ground' : 'a box or button'); }
  }
  for (const el of document.querySelectorAll('h1, h2, h3, a, button')) { if (!visible(el) || inUI(el)) continue; addHue(chromatic(rgb(getComputedStyle(el).color)), 'type'); }
  out.colour = { hues: bins.size, how: [...bins.values()], colouredShare: +Math.min(1, colouredArea / pageArea).toFixed(2) };

  // --- drag rails: sideways scrollers and progress bars outside a working interface
  out.rails = [];
  scanned = 0;
  for (const el of B.querySelectorAll('div, section, ul, ol, figure, article')) {
    if (++scanned > 5000) break;
    if (inUI(el)) continue;
    const cs = getComputedStyle(el);
    if (!/(auto|scroll)/.test(cs.overflowX) || el.scrollWidth <= el.clientWidth + 40 || !visible(el)) continue;
    const r = el.getBoundingClientRect(); if (r.width < W * 0.5 || r.height < 120) continue;
    out.rails.push({ what: 'a sideways scroller', size: `${r2(r.width)}x${r2(r.height)}`, text: textOf(el).slice(0, 40) });
  }
  // (a range input is reported once, by range-slider below; scenes report their own tracks, scene-track)
  for (const el of document.querySelectorAll('progress, [role=progressbar], [class*=progress i], [class*=scrollbar i], [class*=drag i]')) {
    if (inUI(el) || !visible(el) || el.closest('.scene, [data-scene]')) continue; const r = el.getBoundingClientRect(); if (r.width < 120) continue;
    out.rails.push({ what: 'a progress or drag bar', size: `${r2(r.width)}x${r2(r.height)}`, text: (el.className && String(el.className).slice(0, 40)) || '' });
    if (out.rails.length > 8) break;
  }
  // a range slider used as a page control, forms included (only a product fragment may show one)
  out.ranges = [...document.querySelectorAll('input[type=range]')].filter((i) => visible(i) && !i.closest('[data-ui]')).map((i) => ({ label: ((i.labels && i.labels[0] && textOf(i.labels[0])) || i.getAttribute('aria-label') || i.name || i.id || 'unnamed').slice(0, 40) }));

  // --- boxes: share of running text that sits inside a filled or outlined box
  let inBox = 0, allText = 0;
  for (const p of document.querySelectorAll('p, li, h3')) {
    if (!visible(p) || inUI(p) || p.closest('nav, header, footer')) continue;
    const t = words(textOf(p)); if (t < 4) continue; allText += t;
    for (let e = p.parentElement, d = 0; e && e !== B && d < 5; e = e.parentElement, d++) {
      const cs = getComputedStyle(e); const r = e.getBoundingClientRect();
      if (r.width > W * 0.8) break; // a full-width band is a section ground, not a box
      const filled = rgb(cs.backgroundColor) && String(rgb(cs.backgroundColor)) !== String(groundOf(e.parentElement || B));
      const outlined = parseFloat(cs.borderTopWidth) >= 1 && parseFloat(cs.borderLeftWidth) >= 1 && cs.borderTopStyle !== 'none';
      if ((filled || outlined) && parseFloat(cs.paddingLeft) >= 8) { inBox += t; break; }
    }
  }
  out.boxed = { share: allText ? +(inBox / allText).toFixed(2) : 0, words: allText };

  // --- labels: little standalone texts (timestamps, chips, tags, captions of two words) outside nav, footer and controls
  out.labels = [];
  for (const el of B.querySelectorAll('span, p, div, small, time, figcaption, li, dt, dd')) {
    if (el.childElementCount || !visible(el) || inUI(el) || el.closest('nav, header, footer, button, a, label, h1, h2, h3, h4, [aria-hidden=true]')) continue;
    const t = textOf(el); const n = words(t); if (!t || n > 5) continue;
    const s = parseFloat(getComputedStyle(el).fontSize); if (s > 15.5) continue;
    const r = el.getBoundingClientRect();
    out.labels.push({ text: t.slice(0, 30), y: r2(r.top + sy) });
    if (out.labels.length > 120) break;
  }

  // --- walls of text: long paragraphs, and stretches of words with nothing else in them
  out.walls = [];
  for (const p of document.querySelectorAll('p')) { if (!visible(p) || inUI(p)) continue; const n = words(textOf(p)); if (n > 70) out.walls.push({ text: textOf(p).slice(0, 50), words: n }); }

  // --- rows empty on the left: content of a band huddled in its right part, nothing on the left
  out.rightHuddled = [];
  if (W >= 1100) {
    const bands = [...document.querySelectorAll('section, main > div, body > div > div, article')].filter((s) => { const r = s.getBoundingClientRect(); return r.width >= W * 0.9 && r.height >= 220 && r.height <= H * 2.5 && visible(s); }).slice(0, 40);
    for (const s of bands) {
      const r = s.getBoundingClientRect(); const top = r.top + sy;
      const boxes = [...s.querySelectorAll('h1, h2, h3, p, img, video, a, button, li, figure')].filter(visible).map((e) => e.getBoundingClientRect()).filter((b) => b.width > 20 && b.height > 8);
      if (boxes.length < 2) continue;
      const left = Math.min(...boxes.map((b) => b.left));
      if (left > W * 0.42) out.rightHuddled.push({ y: r2(top), h: r2(r.height), from: r2((left / W) * 100), text: textOf(s).slice(0, 50) });
    }
  }
  // --- words in interfaces: sentence-long titles, and mock-ups that talk too much
  out.longTitles = [];
  for (const h of document.querySelectorAll('h1, h2, h3, h4')) { if (!visible(h)) continue; const n = words(textOf(h)); if (n > 5) out.longTitles.push({ text: textOf(h).slice(0, 60), words: n, ui: !!h.closest('[data-ui]'), level: h.tagName }); }
  out.uiWords = [...document.querySelectorAll('[data-ui]')].filter((u) => !u.parentElement?.closest('[data-ui]') && visible(u)).map((u) => ({ words: words(textOf(u)), text: textOf(u).slice(0, 40) }));
  out.sentences = [...document.querySelectorAll('p, li, td, dd, figcaption')].filter((p) => visible(p) && words(textOf(p)) > 12).length;

  // --- text inside mock-ups too small to read, placeholder contacts, notes the builder left for the client
  // Placeholder contacts (round 9, r7-p36 shipped "Musterstraße 12" and "030 000 000 00"): a template street fails, and
  // so does a phone number whose digits end in seven zeros or more or that sits in the US fiction range 555-01xx; six
  // of one digit in a row is a warning. A run of digits counts as a phone when it starts with +, ( or 0, sits in a
  // tel: link, or has a phone word beside it, so a price or a count of ten million is not one.
  out.tinyUi = 0; out.placeholders = []; out.builderNotes = [];
  {
    const tw = document.createTreeWalker(B, NodeFilter.SHOW_TEXT); let n, k = 0;
    const noteRe = /\b(until|once)\b[^.]{0,40}\b(are|is|have been|has been|get|gets)\s+(photographed|shot|supplied)|\bplaceholder (image|photo|picture|text|copy)|\bstand-?in (picture|photo|image|drawing)|\bto be replaced\b|\breplace (this|these) (picture|photo|image)s?\b|\bsample (content|copy|text)\b|\blorem ipsum\b/i;
    const streetRe = /Musterstra(?:ss|ß)e|Beispielstra(?:ss|ß)e|\b1 Main Street\b|\bMain Street 1\b|\b123 Main St\b|\bExample (?:Road|Street)\b/i;
    const runRe = /(?:\+\s?)?(?:\(\d{1,5}\)\s?)?\d[\d\s().\/-]{5,}\d/g;
    const phoneWord = /\b(tel|tél|phone|telephone|telefon|téléphone|telefoon|telefono|call|ring|fon|mobile?|cell)\b/i;
    const unitAfter = /^\s*(€|\$|£|kr|eur|usd|chf|sek|nok|dkk|km|kg|m²|m2|m\b|mm|cm|%|words|pages|people|views|downloads|users)/i;
    const seen = new Set();
    const add = (text, level, why) => { const t = text.replace(/\s+/g, ' ').trim().slice(0, 50); if (seen.has(t) || out.placeholders.length >= 6) return; seen.add(t); out.placeholders.push({ text: t, level, why }); };
    // (a round number, a 1 and zeros, is a count or a price unless it is written as a phone: +1 (000) 000-0000 is one)
    const phoneCheck = (run, ctx, linked) => {
      const digits = run.replace(/\D/g, ''); if (digits.length < 7 || digits.length > 15) return;
      const strict = linked || /^\s*[+(0]/.test(run);
      if (!strict && /^[1-9]0+$/.test(digits)) return;
      if (!strict && !phoneWord.test(ctx)) return;
      if (/0{7,}$/.test(digits)) add(run, 'FAIL', 'its digits end in zeros');
      else if (/\b555[-\s.]?01\d\d\b/.test(run)) add(run, 'FAIL', 'the 555-01xx fiction range');
      else if (/(\d)\1{5,}/.test(digits)) add(run, 'WARN', 'one digit six times in a row');
    };
    while ((n = tw.nextNode()) && k < 6000) {
      const t = n.nodeValue.trim(); if (!t) continue; k++;
      const el = n.parentElement; if (!el || !visible(el)) continue;
      if (el.closest('[data-ui]') && parseFloat(getComputedStyle(el).fontSize) < 11.5) out.tinyUi++;
      if (noteRe.test(t) && out.builderNotes.length < 4) out.builderNotes.push(t.slice(0, 70));
      if (/[\w.-]+@[\w-]+\.example\b|\bexample\.(com|org)\b/i.test(t)) add(t, 'WARN', 'an example domain');
      if (el.closest('[data-ui], script, style')) continue;
      const sm = t.match(streetRe); if (sm) add(t.slice(Math.max(0, sm.index - 12), sm.index + sm[0].length + 8), 'FAIL', 'a template street');
      const ctx = textOf(el.closest('p, li, dd, address, td, div') || el).slice(0, 200);
      for (const m of t.matchAll(runRe)) { if (unitAfter.test(t.slice(m.index + m[0].length)) || /[€$£]\s*$/.test(t.slice(0, m.index))) continue; phoneCheck(m[0].trim(), ctx, !!el.closest('a[href^="tel:"]')); }
    }
    for (const a of document.querySelectorAll('a[href]')) {
      const h = a.getAttribute('href') || '';
      if (/\.example\b|example\.(com|org)/i.test(h)) add(h, 'WARN', 'an example domain');
      if (/^tel:/i.test(h)) phoneCheck(decodeURIComponent(h.slice(4)), '', true);
    }
  }

  // --- the same large picture twice, the same heading twice, boxes with nothing in them, switches as a feature list
  {
    // the same file twice (keyed by its whole path: /id/12/1600/1000 and /id/40/1600/1000 are two photographs),
    // and one series used again and again: its files' names without numbers, sizes and crop suffixes
    // (zettelarchiv3, zettelarchiv5, zettelarchiv-tll are one archive)
    const seenPics = new Map(), series = new Map();
    const CROP = new Set(['crop', 'wide', 'tall', 'square', 'portrait', 'landscape', 'small', 'large', 'thumb', 'detail', 'close', 'hero', 'full', 'half']);
    const stemOf = (file) => {
      const name = file.replace(/\.[a-z0-9]{2,5}$/i, '').toLowerCase();
      const kept = name.split(/[-_.\s]+/).filter((t, i) => t && !/^\d+$/.test(t) && !/^\d+x\d+$/.test(t) && !/^@?\d+[wx]$/.test(t) && !CROP.has(t) && (i === 0 || t.length >= 4));
      const stem = kept.join('-').replace(/\d+$/, '').replace(/-+$/, '');
      return /^[a-z]/.test(stem) && stem.length >= 4 && !/^(photo|image|img|picture|pic|shot|still|frame|cover|card|work|project|asset|slide|gallery|scene|bg|background)$/.test(stem) ? stem : null;
    };
    for (const img of document.querySelectorAll('img')) {
      if (!visible(img)) continue; const r = img.getBoundingClientRect(); if (r.width * r.height < W * H * 0.02) continue;
      let path = ''; try { path = new URL(img.currentSrc || img.src, location.href).pathname; } catch { path = (img.currentSrc || img.src).split('?')[0]; }
      const file = decodeURIComponent(path.split('/').pop() || '');
      if (path && r.width * r.height >= W * H * 0.08) seenPics.set(path, (seenPics.get(path) || 0) + 1);
      const stem = file && stemOf(file);
      if (stem) { const s = series.get(stem) || { n: 0, files: new Set() }; s.n++; s.files.add(path); series.set(stem, s); }
    }
    out.repeatedPictures = [...seenPics.entries()].filter(([, n]) => n > 1).map(([k, n]) => ({ src: k.split('/').slice(-2).join('/').slice(-40), n }));
    out.pictureSeries = [...series.entries()].filter(([, s]) => s.n >= 3 && s.files.size >= 2).map(([stem, s]) => ({ stem, n: s.n }));
    const heads = new Map();
    for (const h of document.querySelectorAll('h1, h2, h3')) { if (!visible(h) || inUI(h)) continue; const k = textOf(h).toLowerCase(); if (k.length > 3) heads.set(k, (heads.get(k) || 0) + 1); }
    out.repeatedHeadings = [...heads.entries()].filter(([, n]) => n > 1).map(([k]) => k.slice(0, 40));
    out.hollow = [];
    let n2 = 0;
    for (const el of B.querySelectorAll('div, li, article, section > div, a')) {
      if (++n2 > 5000 || out.hollow.length >= 6) break;
      if (inUI(el) || !visible(el)) continue;
      const r = el.getBoundingClientRect(); if (r.width < 180 || r.height < 220 || r.width > W * 0.9) continue;
      const cs = getComputedStyle(el); const filled = rgb(cs.backgroundColor) && String(rgb(cs.backgroundColor)) !== String(groundOf(el.parentElement || B)); const outlined = parseFloat(cs.borderTopWidth) >= 1 && cs.borderTopStyle !== 'none';
      if (!filled && !outlined) continue;
      const kids = [...el.querySelectorAll('*')].filter((k) => !k.childElementCount && visible(k)).map((k) => k.getBoundingClientRect()).filter((b) => b.width > 2 && b.height > 2);
      if (!kids.length) continue;
      const top = Math.min(...kids.map((b) => b.top)), bottom = Math.max(...kids.map((b) => b.bottom));
      const covered = kids.reduce((s, b) => s + b.height, 0);
      // the content's own height against the box: a tall card with a price at the top and two lines at the foot
      if (Math.min(covered, bottom - top) / r.height < 0.3 && (bottom - top) / r.height > 0.6) out.hollow.push({ text: textOf(el).slice(0, 40), h: Math.round(r.height) });
    }
    // round 11f (r14-p65: the product's frame a green box with its name at the top and three facts at the foot): the
    // frame marked for the product's photograph, filled or outlined, 240 by 200px or more, with no picture in it, whose
    // words cover under a sixth of it (the product statement sets its name and figures large on the ground). A row of
    // three marked cards or more is a shop's or a roaster's goods, each card holding its own name and facts
    out.productFrame = [];
    for (const el of document.querySelectorAll('[data-slot="product-photo"]')) {
      if (out.productFrame.length >= 3 || !visible(el) || (el.parentElement?.parentElement || B).querySelectorAll('[data-slot="product-photo"]').length >= 3) continue;
      const r = el.getBoundingClientRect(), a = r.width * r.height; if (r.width < 240 || r.height < 200) continue;
      const cs = getComputedStyle(el); const filled = rgb(cs.backgroundColor) && String(rgb(cs.backgroundColor)) !== String(groundOf(el.parentElement || B)); const outlined = parseFloat(cs.borderTopWidth) >= 1 && cs.borderTopStyle !== 'none';
      if ((!filled && !outlined) || /url\(/.test(cs.backgroundImage) || [...el.querySelectorAll('img, video, canvas, picture')].some((m) => { const q = m.getBoundingClientRect(); return visible(m) && q.width * q.height >= a * 0.1; })) continue;
      const tw = document.createTreeWalker(el, NodeFilter.SHOW_TEXT), rg = document.createRange(); let ink = 0;
      for (let n = tw.nextNode(); n; n = tw.nextNode()) { if (!n.nodeValue.trim() || !n.parentElement || !visible(n.parentElement)) continue; rg.selectNodeContents(n); for (const q of rg.getClientRects()) ink += q.width * q.height; }
      if (ink / a < 1 / 6) out.productFrame.push({ text: textOf(el).slice(0, 40), w: Math.round(r.width), h: Math.round(r.height), share: Math.round((ink / a) * 100) });
    }
    out.switchList = [...document.querySelectorAll('input[type=checkbox], [role=switch], input[type=radio]')].filter((i) => visible(i) && !i.closest('form, [data-ui], dialog, [role=dialog]')).length;
  }

  // --- drawn illustrations (inline SVG pictures of things), and words in the first screen and per section
  // Round 9 (r8-p37 explained its process with three drawn SVG diagrams of squares and bars, labels and all): outside a
  // scene, an inline SVG larger than an icon (more than 64px on a side) with three or more painted shapes is a drawing,
  // labelled or not: a process diagram, a chart, an illustration. A brand's logo is not: the Simple Icons files that
  // assets.mjs --logo saves (a 24 x 24 view box, one path), [data-mark], an element named logo or wordmark, and a row
  // of three or more marks of one height. A real map marked data-map or data-plan is left alone (r6-p30, a won page,
  // shows the Westfjords on a traced outline of Iceland so), but the fix never suggests one: the house bans drawn SVG.
  out.drawings = []; out.sceneDrawings = [];
  const sceneOf = (el) => el.closest('.scene, [data-scene]');
  const sceneId = (s) => (s && (s.dataset.scene || s.id)) || 'scene';
  const painted = (s) => { const cs = getComputedStyle(s); if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity < 0.05) return false; const on = (v) => v && v !== 'none' && !/rgba\([^)]*,\s*0\)/.test(v) && v !== 'transparent'; return on(cs.fill) || (on(cs.stroke) && parseFloat(cs.strokeWidth) > 0); };
  const logoLike = (svg) => {
    const vb = (svg.getAttribute('viewBox') || '').trim().split(/[\s,]+/).map(Number);
    if (vb.length === 4 && vb[2] === 24 && vb[3] === 24 && svg.querySelectorAll('path').length <= 2 && !svg.querySelector('rect, circle, ellipse, polygon, polyline, line, text')) return true;
    if (svg.closest('[data-mark], [data-logo], [class*=logo i], [class*=wordmark i], [aria-label*=logo i]')) return true;
    const r = svg.getBoundingClientRect(); const row = svg.parentElement?.parentElement;
    if (r.height <= 96 && row) { const kin = [...row.querySelectorAll('svg')].filter((o) => !o.parentElement?.closest('svg') && Math.abs(o.getBoundingClientRect().height - r.height) <= r.height * 0.25); if (kin.length >= 3) return true; }
    return false;
  };
  for (const svg of document.querySelectorAll('svg')) {
    if (svg.parentElement?.closest('svg') || !visible(svg) || svg.closest('[data-ui], header, nav, footer, button, a')) continue;
    const r = svg.getBoundingClientRect(); const share = (r.width * r.height) / (W * H);
    const all = [...svg.querySelectorAll('path, circle, ellipse, rect, polygon, polyline, line')];
    const shapes = all.length;
    const labels = [...svg.querySelectorAll('text')].filter((t) => t.textContent.trim()).length;
    const scene = sceneOf(svg);
    if (scene) {
      // inside a scene any drawing counts (wheels, waves, axles, morphing shapes); a labelled map or plan and the
      // brand's own mark do not
      if (share >= 0.02 && shapes >= 1 && labels < 3 && !svg.closest('.route-art, [data-map], .portal-src, .portal-mark, [data-plan], [data-mark]') && out.sceneDrawings.length < 6) out.sceneDrawings.push({ id: sceneId(scene), shapes, share: +share.toFixed(3) });
      continue;
    }
    if (Math.max(r.width, r.height) <= 64 || share < 0.004 || logoLike(svg) || svg.closest('[data-map], [data-plan]')) continue;
    const paintedShapes = all.slice(0, 400).filter(painted).length;
    if (paintedShapes < 3) continue;
    const kind = labels >= 2 ? 'a labelled diagram or chart' : 'a drawing';
    out.drawings.push({ share: +share.toFixed(3), shapes: paintedShapes, labels, kind, size: `${r2(r.width)}x${r2(r.height)}`, near: textOf(svg.closest('section, article, div') || svg).slice(0, 40) });
    if (out.drawings.length >= 12) break;
  }
  {
    // round 11 (Leon: "too much text, cut almost everything down"): the words a visitor reads, in the first screen, in
    // each section and on the whole page. The site's bar, the navigation, the product's window, dialogs and hidden text
    // are not counted (a hero set in a <header> is counted)
    // (a bar that holds the page's h1 is the hero's title strip, r8-p38's rail: its words are read as the hero's)
    const siteBar = (el) => { const b = el.closest('header'); return !!b && !b.parentElement?.closest('main, section, article, [data-scene]') && b.getBoundingClientRect().height < H * 0.3 && !b.querySelector('h1'); };
    const shownText = (el) => { for (let e = el; e && e !== D; e = e.parentElement) { const cs = getComputedStyle(e); if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity < 0.05) return false; } const r = el.getBoundingClientRect(); return r.width > 1 && r.height > 1 && !(r.width <= 2 && r.height <= 2); };
    const counted = (el) => !!el && !el.closest('script, style, noscript, template, nav, [data-ui], dialog, [role=dialog], [aria-hidden=true], [hidden], .sr-only, .visually-hidden') && !siteBar(el) && shownText(el);
    let first = 0, page = 0, foot = 0; const tw = document.createTreeWalker(B, NodeFilter.SHOW_TEXT); let n;
    const textNodes = [];
    while ((n = tw.nextNode())) { const el = n.parentElement; const k = words(n.nodeValue); if (!k || !counted(el)) continue; textNodes.push([n, el, k]); page += k; if (el.closest('footer')) foot += k; const r = el.getBoundingClientRect(); if (r.top + sy < H && r.bottom + sy > 0) first += k; }
    out.firstScreenWords = first;
    out.pageWords = { all: page, footer: foot };
    // each section's words outside lists and tables. A set of three items or more of one kind (cards, rooms, steps) is a
    // list too, but an item's words past 25 count: a card says its point in about 25 words. The hero (the first screen's
    // own budget) and the footer are left out
    const h1 = document.querySelector('h1');
    const secs = [...document.querySelectorAll('section, [data-scene], main > article, main > div')].filter((s) => visible(s) && !s.parentElement?.closest('section, [data-scene]') && !s.closest('footer') && !(s.matches('main > article, main > div') && s.querySelector('section, [data-scene]')) && !(h1 && s.contains(h1) && s.getBoundingClientRect().top + sy < H * 0.5));
    // (paragraphs and inline words in the flow are running text, never items: four paragraphs of one class are a wall of
    // text; a paragraph laid out as a row, r10-p47's schedule with the time beside each step, can be an item)
    const itemOf = (el, s) => { for (let e = el; e && e !== s; e = e.parentElement) { if (/^(P|H[1-6]|BLOCKQUOTE|SPAN|EM|STRONG|B|I|SMALL|SUP|SUB)$/.test(e.tagName) && !/flex|grid/.test(getComputedStyle(e).display)) continue; const p = e.parentElement; if (!p || p === s.parentElement) break; const sib = [...p.children].filter((c) => c.tagName === e.tagName && String(c.className) === String(e.className) && words(c.innerText || '') >= 3); if (sib.length >= 3) return e; } return null; };
    out.wordySections = secs.map((s) => {
      let loose = 0; const items = new Map();
      for (const [, el, k] of textNodes) {
        if (!s.contains(el) || el.closest('ul, ol, dl, table, [role=list], [role=table], form, footer')) continue;
        const it = itemOf(el, s); if (it) items.set(it, (items.get(it) || 0) + k); else loose += k;
      }
      const over = [...items.values()].reduce((a, k) => a + Math.max(0, k - 25), 0);
      return { words: loose + over, loose, items: items.size, over, head: textOf(s.querySelector('h1, h2, h3') || s).slice(0, 40) };
    }).filter((s) => s.words > 60).sort((a, b) => b.words - a.words).slice(0, 6);
  }

  // --- breakage at narrow widths (most of the reviewed pages' high-severity faults were phone or tablet only)
  // text cut by the screen edge or by a clipping box, mock-ups included: a 520px sheet in a 390px screen reads "Sub"
  out.cutText = [];
  {
    const tw = document.createTreeWalker(B, NodeFilter.SHOW_TEXT); let n, seen = 0;
    const clipOf = (el) => { for (let e = el.parentElement; e && e !== B; e = e.parentElement) { const cs = getComputedStyle(e); if (/(hidden|clip)/.test(cs.overflowX) || /(hidden|clip)/.test(cs.overflow)) return e; } return null; };
    while ((n = tw.nextNode()) && seen < 4000) {
      const t = n.nodeValue.trim(); if (t.length < 3) continue; seen++;
      const el = n.parentElement; if (!el || !visible(el) || el.closest('[aria-hidden=true], .marquee, [class*=marquee i], [class*=ticker i]')) continue;
      const range = document.createRange(); range.selectNodeContents(n);
      for (const r of range.getClientRects()) {
        if (r.width < 8 || r.bottom < 0 || r.top > H * 6) continue;
        let cut = null;
        if (r.right > W + 4 || r.left < -4) cut = 'the screen edge';
        else { const c = clipOf(el); if (c) { const cr = c.getBoundingClientRect(); if (r.right > cr.right + 4 || r.left < cr.left - 4) { const scroller = /(auto|scroll)/.test(getComputedStyle(c).overflowX); if (!scroller) cut = 'a clipping box'; } } }
        if (cut) { out.cutText.push({ text: t.slice(0, 40), by: cut, ui: !!el.closest('[data-ui]') }); break; }
      }
      if (out.cutText.length >= 12) break;
    }
  }
  // text shortened with an ellipsis: the number or name that matters, cut to "$1,..."
  out.truncated = [];
  for (const el of B.querySelectorAll('*')) {
    if (out.truncated.length >= 8) break;
    const cs = getComputedStyle(el); if (cs.textOverflow !== 'ellipsis' || !visible(el)) continue;
    if (el.scrollWidth > el.clientWidth + 1) out.truncated.push({ text: textOf(el).slice(0, 40), ui: !!el.closest('[data-ui]') });
  }
  // sticky or fixed bands that eat the screen on a phone or tablet (navigation and scroll scenes excepted)
  out.stickyBands = [];
  for (const el of B.querySelectorAll('*')) {
    const cs = getComputedStyle(el); if (cs.position !== 'sticky' && cs.position !== 'fixed') continue;
    // (a product replay's held stage holds on phones too, like a scene: replay.js)
    if (!visible(el) || el.closest('header, nav, [role=banner], .scene, [data-scene], dialog, [role=dialog], .replay-stage')) continue;
    const r = el.getBoundingClientRect();
    if (r.width >= W * 0.8 && r.height >= H * 0.33 && r.height < H * 0.97) out.stickyBands.push({ what: textOf(el).slice(0, 40) || el.tagName.toLowerCase(), h: Math.round((r.height / H) * 100) });
    if (out.stickyBands.length >= 4) break;
  }
  // a form field set inside a headline or sentence ("Send [you@work.dev] a free key")
  out.formInSentence = [];
  for (const i of document.querySelectorAll('h1 input, h2 input, h3 input, p input, h1 select, h2 select, p select')) { if (visible(i)) out.formInSentence.push({ text: textOf(i.closest('h1, h2, h3, p')).slice(0, 50) }); }
  // a navigation at the top: links to the page's parts or a menu button
  {
    const top = [...B.querySelectorAll('a[href], button')].filter((a) => { const r = a.getBoundingClientRect(); return r.top + sy < 160 && r.bottom > 0 && visible(a) && r.width > 8; });
    const menu = top.some((b) => /menu|navigation/i.test((b.getAttribute('aria-label') || '') + ' ' + textOf(b)) || b.getAttribute('aria-expanded') != null);
    // (round 11: a bar fixed to the foot of the screen, one of the dealt navigations, is the navigation too, at every width)
    const fixedAt = (el) => { for (let e = el, i = 0; e && e !== B && i < 6; e = e.parentElement, i++) if (getComputedStyle(e).position === 'fixed') return true; return false; };
    const foot = [...B.querySelectorAll('nav a[href], nav button')].filter((a) => { const r = a.getBoundingClientRect(); return r.top >= H * 0.8 && r.bottom <= H + 2 && visible(a) && r.width > 8 && fixedAt(a); }).length;
    out.nav = { links: top.length, menu, foot };
  }

  // ---------- round 4: what judges found on pages every check above passed ----------
  const opaqueBg = (el) => { const s = getComputedStyle(el).backgroundColor; const k = s.match(/color\(srgb\s+([-\d.e]+)\s+([-\d.e]+)\s+([-\d.e]+)(?:\s*\/\s*([-\d.e]+))?\s*\)/); if (k) return k[4] != null && +k[4] < 0.9 ? null : [k[1] * 255, k[2] * 255, k[3] * 255]; const m = s.match(/rgba?\(([^)]+)\)/); if (!m) return null; const p = m[1].split(/[ ,/]+/).filter(Boolean).map(Number); return p.length > 3 && p[3] < 0.9 ? null : p.slice(0, 3); };
  const differs = (a, b, d = 6) => !!a && !!b && a.some((v, i) => Math.abs(v - b[i]) >= d);
  const sides = (el) => { const cs = getComputedStyle(el); return ['Top', 'Right', 'Bottom', 'Left'].filter((s) => parseFloat(cs[`border${s}Width`]) >= 1 && cs[`border${s}Style`] !== 'none' && !/rgba\([^)]*,\s*0\)/.test(cs[`border${s}Color`])).length; };
  const filledOn = (el) => { const c = opaqueBg(el); return c && differs(c, groundOf(el.parentElement || B)) ? c : null; };
  const textRects = (root) => { const out = []; const tw = document.createTreeWalker(root, NodeFilter.SHOW_TEXT); const rg = document.createRange(); let n; while ((n = tw.nextNode())) { if (!n.nodeValue.trim() || !n.parentElement || !visible(n.parentElement)) continue; rg.selectNodeContents(n); for (const r of rg.getClientRects()) if (r.width > 1 && r.height > 1) out.push(r); } return out; };
  // The share of a box with nothing in it: an 8 x 8 grid of points inside it, a point filled when it falls on a line
  // of text, a picture, or a painted leaf element (a bar, a dot, a field), each grown by 8px.
  const emptyInside = (box) => {
    const b = box.getBoundingClientRect(); if (b.width < 8 || b.height < 8) return 0;
    const fill = textRects(box);
    for (const e of box.querySelectorAll('img, video, svg, canvas, picture, iframe, input, select, textarea')) { if (e.parentElement?.closest('svg') || !visible(e)) continue; fill.push(e.getBoundingClientRect()); }
    for (const e of box.querySelectorAll('*')) { if (e.childElementCount || !visible(e) || e.closest('svg')) continue; const cs = getComputedStyle(e); if (rgb(cs.backgroundColor) || cs.backgroundImage !== 'none' || sides(e)) fill.push(e.getBoundingClientRect()); }
    let empty = 0;
    for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) {
      const x = b.left + ((i + 0.5) * b.width) / 8, y = b.top + ((j + 0.5) * b.height) / 8;
      if (!fill.some((r) => x >= r.left - 8 && x <= r.right + 8 && y >= r.top - 8 && y <= r.bottom + 8)) empty++;
    }
    return empty / 64;
  };
  const emailRe = /[\w.+-]+@[\w-]+(?:\.[\w-]+)+/;

  // --- giant-contact: an email, a phone or the site's name set at display size anywhere on the page
  out.giantContact = [];
  {
    const sizeIn = (el) => { let s = 0; const tw = document.createTreeWalker(el, NodeFilter.SHOW_TEXT); let n; while ((n = tw.nextNode())) { if (!n.nodeValue.trim() || !n.parentElement || !visible(n.parentElement)) continue; s = Math.max(s, parseFloat(getComputedStyle(n.parentElement).fontSize)); } return s; };
    // a mailto or tel link counts by what it shows: an address or a number, not a closing line set as the link
    const phoneRe = /^\+?[\d\s().\-/]{7,}$/;
    const cands = new Set([...document.querySelectorAll('a[href^="mailto:"], a[href^="tel:"]')].filter((a) => { const t = textOf(a); return emailRe.test(t) || (phoneRe.test(t) && t.replace(/\D/g, '').length >= 6); }));
    // an address split across spans: the smallest element whose whole text holds it
    const tw = document.createTreeWalker(B, NodeFilter.SHOW_TEXT); let n, k = 0;
    while ((n = tw.nextNode()) && k < 8000) { k++; if (!n.nodeValue.includes('@') || !n.parentElement) continue; let e = n.parentElement; for (let d = 0; e && d < 4 && !emailRe.test(e.textContent); d++) e = e.parentElement; if (e && emailRe.test(e.textContent) && e.textContent.length < 120) cands.add(e); }
    const limit = W < 600 ? 28 : Math.max(32, W * 0.024);
    const seen = new Set();
    for (const c of cands) {
      if (!visible(c) || c.closest('[data-ui], dialog, [role=dialog]')) continue;
      const s = sizeIn(c); const t = textOf(c).slice(0, 40);
      if (s > limit && !seen.has(t)) { seen.add(t); out.giantContact.push({ text: t, size: r2(s), vw: +((s / W) * 100).toFixed(1), what: 'contact' }); }
    }
    // the name: the wordmark ([data-wordmark], or the header link that leads to the page itself), at 6vw or more
    // anywhere below the first screen. A header with neither has no name to check.
    const home = (a) => {
      const h = (a.getAttribute('href') || '').trim();
      if (['#', '#top', '/', './', 'index.html', './index.html'].includes(h)) return true;
      if (!h || /^(mailto|tel|javascript):/i.test(h)) return false;
      try { const u = new URL(h, location.href), strip = (p) => p.replace(/index\.html?$/, ''); return u.origin === location.origin && strip(u.pathname) === strip(location.pathname) && (!u.hash || u.hash === '#top'); } catch { return false; }
    };
    const mark = document.querySelector('[data-wordmark]') || [...document.querySelectorAll('header a, nav a, [role=banner] a')].find(home);
    const name = mark ? textOf(mark) : '';
    if (name && name.split(' ').length <= 4 && name.length >= 3) {
      let m = 0;
      for (const el of B.querySelectorAll('h1, h2, h3, p, div, span, a, strong, b, li')) {
        if (++m > 6000) break;
        if (el.closest('header, nav, [role=banner], [data-ui]') || (el.textContent || '').length > 80 || textOf(el).toLowerCase() !== name.toLowerCase() || !visible(el)) continue;
        const r = el.getBoundingClientRect(); if (r.top + sy <= H) continue;
        const s = sizeIn(el);
        if (s >= Math.max(W * 0.06, 40) && !seen.has(name)) { seen.add(name); out.giantContact.push({ text: name.slice(0, 40), size: r2(s), vw: +((s / W) * 100).toFixed(1), what: 'name' }); }
      }
    }
  }

  // --- hero-in-card: the first screen's headline set inside a card or panel
  out.heroCard = null;
  {
    const firsts = [...document.querySelectorAll('h1')].filter((h) => visible(h) && h.getBoundingClientRect().top + sy < H);
    let h = firsts[0];
    if (!h) { let best = 0; for (const el of B.querySelectorAll('h2, p, div, span')) { if (el.childElementCount || !visible(el) || !textOf(el)) continue; const r = el.getBoundingClientRect(); if (r.top + sy >= H) continue; const s = parseFloat(getComputedStyle(el).fontSize); if (s > best) { best = s; h = el; } } }
    if (h && !h.closest('[data-ui]')) {
      const hr = h.getBoundingClientRect();
      const wide = (() => { for (let e = h.parentElement; e && e !== B; e = e.parentElement) if (e.getBoundingClientRect().width >= W * 0.9) return e; return B; })();
      // a canvas is not a picture here: a scene's field (the dither opener) under a headline block filled in the ground colour is no card
      const pictures = [...wide.querySelectorAll('img, video, picture, [style*="background-image"]')].filter(visible);
      for (let a = h.parentElement; a && a !== wide && a !== B; a = a.parentElement) {
        const r = a.getBoundingClientRect(), cs = getComputedStyle(a);
        if (r.width >= W * 0.85 || r.height >= H * 0.95 || r.height < hr.height * 1.5 || /url\(/.test(cs.backgroundImage)) continue;
        const own = opaqueBg(a);
        // filled unlike its ground, or a filled panel lying on a picture
        const onPicture = !!own && pictures.some((p) => !a.contains(p) && !p.contains(a) && (() => { const pr = p.getBoundingClientRect(); const ix = Math.min(pr.right, r.right) - Math.max(pr.left, r.left), iy = Math.min(pr.bottom, r.bottom) - Math.max(pr.top, r.top); return ix > 0 && iy > 0 && ix * iy >= r.width * r.height * 0.8; })());
        const card = (own && (differs(own, groundOf(a.parentElement || B)) || onPicture)) || sides(a) >= 3;
        if (!card) continue;
        // a half of a split screen touches its band on three sides; a card floats inside it
        const wr = wide.getBoundingClientRect();
        const inset = [r.top - wr.top, wr.right - r.right, wr.bottom - r.bottom, r.left - wr.left].filter((d) => d >= 12).length;
        if (inset < 3) continue;
        out.heroCard = { text: textOf(h).slice(0, 50), w: r2(r.width), h: r2(r.height), bg: own ? `rgb(${own.join(', ')})` : 'outlined' };
        break;
      }
    }
  }

  // --- bento: a section built as a grid of boxed cards; its cells' empty share
  out.bento = [];
  {
    const secs = [...document.querySelectorAll('section, main > div, article')].filter((s) => !s.parentElement?.closest('section') && visible(s) && !s.closest('[data-ui], header, footer, nav, .scene, [data-scene]'));
    for (const s of secs.slice(0, 40)) {
      const sr = s.getBoundingClientRect(); if (sr.width < W * 0.6 || sr.height < 200) continue;
      const boxes = [];
      for (const e of s.querySelectorAll('div, li, article, figure, a, aside')) {
        if (boxes.some((b) => b.contains(e)) || e.parentElement?.closest('[data-ui]')) continue;
        const r = e.getBoundingClientRect(); if (r.width < 160 || r.height < 140 || r.width >= sr.width * 0.7 || !visible(e)) continue;
        // a picture tile (a photograph filling its frame) is a picture, not a card
        if ([...e.querySelectorAll('img, video, picture')].some((p) => { const q = p.getBoundingClientRect(); return q.width * q.height >= r.width * r.height * 0.6; })) continue;
        if (filledOn(e) || sides(e) >= 3) boxes.push(e);
        if (boxes.length > 24) break;
      }
      if (boxes.length < 4) continue;
      const rs = boxes.map((b) => b.getBoundingClientRect());
      const distinct = (vals) => vals.sort((a, b) => a - b).filter((v, i, a) => !i || v - a[i - 1] > 8).length;
      const area = rs.reduce((t, r) => t + r.width * r.height, 0);
      if (distinct(rs.map((r) => r.top)) < 2 || distinct(rs.map((r) => r.left)) < 2 || area < sr.width * sr.height * 0.35) continue;
      const voids = boxes.map((b, i) => ({ text: textOf(b).slice(0, 30), empty: emptyInside(b), h: r2(rs[i].height) })).filter((b) => b.empty >= 0.5);
      out.bento.push({ head: textOf(s.querySelector('h1, h2, h3') || s).slice(0, 50), n: boxes.length, voids });
      if (out.bento.length >= 4) break;
    }
  }

  // --- small-body: running, list and table text set small, and small text under a display heading. Round 9 (r7-p34,
  // r8-p39): under 14px is a FAIL on desktop and tablet and 14-15px a warning on desktop (14px on a tablet); on a phone
  // under 15px fails. Tables and lists of short rows count as one block each. Captions, photo credits, and the legal
  // lines of the footer (copyright, imprint, privacy, credits), are left out; the rest of the footer counts.
  out.smallBody = []; out.smallUnderHead = [];
  {
    const failUnder = W < 600 ? 15 : 14, warnUnder = W >= 1100 ? 16 : 15;
    const legal = /©|\(c\)\s*\d{4}|copyright|all rights|impressum|imprint|privacy|datenschutz|cookie|terms|credits?\b|licen[cs]e|\bvat\b|ust-?id|kvk|registered|company no/i;
    // (a photo credit is a caption wherever it stands: "Photographs of the icefield by …, on Unsplash")
    const credit = /\bphoto(graph)?s?\b[^.]{0,40}\b(by|from|via)\b|unsplash|pexels|wikimedia|picsum/i;
    const done = new Set();
    // paragraphs, and any span or div that carries a sentence of its own (a description set as a span); a table, and a
    // list whose rows are short, as one block
    const ownWords = (el) => { let t = ''; for (const c of el.childNodes) if (c.nodeType === 3) t += c.nodeValue + ' '; return words(t); };
    const shortRows = (l) => [...l.children].filter((c) => /^(LI|DT|DD|DIV)$/.test(c.tagName)).every((c) => words(textOf(c)) < 8);
    const blocks = [...document.querySelectorAll('table'), ...[...document.querySelectorAll('ul, ol, dl')].filter((l) => shortRows(l) && words(textOf(l)) >= 8), ...document.querySelectorAll('p, li, dd, blockquote'), ...[...B.querySelectorAll('span, div, small, a, em')].filter((e) => ownWords(e) >= 8 && !e.closest('p, li, dd, blockquote, table'))];
    for (const p of blocks) {
      if (done.size > 400) break;
      if (!visible(p) || [...done].some((d) => d.contains(p)) || p.closest('[data-ui], nav, header, figcaption, label, button, dialog, [role=dialog], [aria-hidden=true]')) continue;
      if (p.matches('ul, ol') && p.querySelectorAll('a[href]').length >= p.children.length && p.children.length) continue; // a list of links is navigation
      const t = textOf(p); if (words(t) < (p.matches('table') ? 6 : 8)) continue;
      if ((p.closest('footer, [role=contentinfo]') && (legal.test(t) || credit.test(t))) || (words(t) <= 40 && credit.test(t))) continue;
      // the size most of its words are set in (a name at 17px over a 13px description reads as 13px text)
      // (a list's or table's own labels, dt and the header row, are labels: its values and rows are what is read)
      const by = new Map(); { const tw = document.createTreeWalker(p, NodeFilter.SHOW_TEXT); let n; while ((n = tw.nextNode())) { if (!n.parentElement || !n.nodeValue.trim() || n.parentElement.closest('figcaption, caption, thead') || (p.matches('dl, table') && n.parentElement.closest('dt'))) continue; const z = parseFloat(getComputedStyle(n.parentElement).fontSize); by.set(z, (by.get(z) || 0) + n.nodeValue.trim().length); } }
      const s = [...by.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? parseFloat(getComputedStyle(p).fontSize);
      const what = p.matches('table') ? 'table' : p.matches('ul, ol, dl') ? 'list' : p.closest('footer, [role=contentinfo]') ? 'footer' : 'text';
      if (s < warnUnder - 0.25) { done.add(p); out.smallBody.push({ text: t.slice(0, 40), size: +s.toFixed(1), level: s < failUnder - 0.25 ? 'FAIL' : 'WARN', what }); continue; }
      // (round 10, part B: a list's own labels are data too, the spec names beside their figures; only captions and the
      // footer's legal line may be smaller)
      if (p.matches('dl, table')) {
        const labs = [...p.querySelectorAll('dt, th')].filter((e) => visible(e) && textOf(e));
        const ls = labs.length >= 3 ? Math.min(...labs.map((e) => parseFloat(getComputedStyle(e).fontSize))) : Infinity;
        if (ls < warnUnder - 0.25) { done.add(p); out.smallBody.push({ text: labs.slice(0, 3).map(textOf).join(', ').slice(0, 40), size: +ls.toFixed(1), level: ls < failUnder - 0.25 ? 'FAIL' : 'WARN', what: 'labels' }); continue; }
      }
      if (W >= 1100 && s < 17.75) {
        const prev = p.previousElementSibling || (p.parentElement && !p.previousElementSibling ? p.parentElement.previousElementSibling : null);
        const hs = prev && prev.matches('h1, h2, h3, h4') ? parseFloat(getComputedStyle(prev).fontSize) : 0;
        if (hs >= 48) out.smallUnderHead.push({ text: t.slice(0, 40), size: +s.toFixed(1), head: r2(hs) });
      }
    }
    out.smallBody = out.smallBody.slice(0, 12); out.smallUnderHead = out.smallUnderHead.slice(0, 6);
  }

  // --- broken-address: an email, a URL or a phone number broken over two lines
  out.brokenAddress = [];
  {
    const res = [/[\w.+-]+@[\w-]+(?:\.[\w-]+)+/g, /\b(?:https?:\/\/|www\.)[^\s<>"]+/g, /(?:\+|\(0|\b0)\d[\d ().-]{6,}\d/g];
    const tw = document.createTreeWalker(B, NodeFilter.SHOW_TEXT); const rg = document.createRange(); let n, k = 0;
    while ((n = tw.nextNode()) && k < 8000 && out.brokenAddress.length < 6) {
      k++; const v = n.nodeValue; if (!v || v.length < 6 || !n.parentElement || n.parentElement.closest('[data-ui], svg, script, style') || !visible(n.parentElement)) continue;
      for (const re of res) for (const m of v.matchAll(re)) {
        if (re === res[2] && (m[0].match(/\d/g) || []).length < 8) continue;
        rg.setStart(n, m.index); rg.setEnd(n, m.index + m[0].length);
        const tops = [...rg.getClientRects()].filter((r) => r.width > 1).map((r) => r.top);
        if (tops.length > 1 && Math.max(...tops) - Math.min(...tops) > 2) out.brokenAddress.push({ text: m[0].slice(0, 40) });
      }
    }
  }

  // --- result-first: a tool whose result stands above the controls that set it
  out.resultFirst = [];
  for (const tool of document.querySelectorAll('form, [data-tool]')) {
    if (!visible(tool) || tool.closest('[data-ui], dialog, [role=dialog]')) continue;
    // a control is drawn by its label when the input itself is hidden (a radio styled as a button)
    const controls = [...tool.querySelectorAll('input:not([type=hidden]), select, textarea, [role=radio], [role=slider]')].filter((c) => !c.closest('[aria-live], output')).map((e) => e.closest('label') || e).filter((e) => { const r = e.getBoundingClientRect(); return r.width > 2 && r.height > 2; });
    const results = [...tool.querySelectorAll('output, [aria-live]')].filter(visible);
    if (!controls.length || !results.length) continue;
    const c = controls.map((e) => e.getBoundingClientRect()).sort((a, b) => a.top - b.top)[0];
    for (const res of results) {
      const r = res.getBoundingClientRect();
      const ox = Math.min(r.right, c.right) - Math.max(r.left, c.left);
      if (r.bottom <= c.top + 8 && ox > Math.min(r.width, c.width) * 0.5) { out.resultFirst.push({ text: textOf(res).slice(0, 30), tool: (tool.getAttribute('aria-label') || textOf(tool.querySelector('legend, h2, h3, label') || tool)).slice(0, 30) }); break; }
    }
  }

  // (surface-count, the grounds a visitor sees, is measured once on desktop by grounds() in probe-page.mjs)

  // --- empty-box: a filled or outlined box with nothing at all in it (a leftover, or a picture that failed)
  out.emptyBoxes = [];
  {
    let m = 0;
    for (const el of B.querySelectorAll('div, li, article, aside, figure, span, a, section > div')) {
      if (++m > 6000 || out.emptyBoxes.length >= 6) break;
      if (el.closest('[data-ui], .scene, [data-scene], svg, dialog, [role=dialog], [aria-hidden=true]')) continue;
      const r = el.getBoundingClientRect(); if (r.width < 120 || r.height < 60 || r.width >= W * 0.9 || !visible(el)) continue;
      const cs = getComputedStyle(el); if (/url\(/.test(cs.backgroundImage) || (!filledOn(el) && sides(el) < 3)) continue;
      if (textOf(el) || [...el.querySelectorAll('*')].some((k) => visible(k) && (k.childElementCount === 0 || /^(IMG|VIDEO|CANVAS|svg|PICTURE|IFRAME)$/.test(k.tagName)))) continue;
      if (el.querySelector('img:not([src]), img[loading="lazy"]')) continue;
      out.emptyBoxes.push({ size: `${r2(r.width)}x${r2(r.height)}`, at: r2(r.top + sy), near: textOf(el.parentElement || B).slice(0, 30) });
    }
  }

  // --- hollow-fragment: the first screen's product fragment with panes that hold nothing
  out.hollowFragment = [];
  {
    // (a product replay's window shows its first state here, unfinished on purpose; its beats are judged on their own)
    const ui = [...document.querySelectorAll('[data-ui]')].find((u) => !u.parentElement?.closest('[data-ui]') && !u.closest('[data-replay]') && visible(u) && u.getBoundingClientRect().top + sy < H);
    if (ui) {
      const panes = [ui, ...ui.querySelectorAll('div, section, aside, main, article, ul, ol, form')].filter((p) => { const r = p.getBoundingClientRect(); return r.width >= 160 && r.height >= 120 && visible(p) && (p === ui || filledOn(p) || sides(p) >= 2); });
      for (const p of panes) { const e = emptyInside(p); if (e >= 0.55) out.hollowFragment.push({ text: textOf(p).slice(0, 30), empty: +e.toFixed(2), size: `${r2(p.getBoundingClientRect().width)}x${r2(p.getBoundingClientRect().height)}` }); if (out.hollowFragment.length >= 4) break; }
    }
  }

  // --- scene-track: a rail, scrubber, playhead or progress bar inside a scroll scene
  out.sceneTracks = [];
  {
    const dotLike = (e) => { const w = e.offsetWidth, h = e.offsetHeight; if (w < 4 || h < 4 || w > 20 || h > 20) return false; const cs = getComputedStyle(e); const rad = cs.borderTopLeftRadius; return !!rgb(cs.backgroundColor) && (/%/.test(rad) ? parseFloat(rad) >= 50 : parseFloat(rad) >= Math.min(w, h) / 2 - 0.5); };
    for (const scene of document.querySelectorAll('.scene, [data-scene]')) {
      if (scene.parentElement?.closest('.scene, [data-scene]')) continue;
      const id = sceneId(scene);
      if ([...scene.querySelectorAll('progress, [role=progressbar], [class*=progress i]')].some((e) => e.offsetWidth >= 40 && visible(e))) { out.sceneTracks.push({ id, w: 0, what: 'a progress bar' }); continue; }
      const dots = [...scene.querySelectorAll('span, i, b, div, em')].filter(dotLike);
      for (const l of scene.querySelectorAll('div, span, i, b, li, hr')) {
        if (l.closest('[data-ui]')) continue;
        const w = l.offsetWidth, h = l.offsetHeight; if (h < 1 || h > 6 || w < W * 0.15) continue;
        const cs = getComputedStyle(l); if (!rgb(cs.backgroundColor) && !sides(l) && !(parseFloat(cs.borderTopWidth) >= 1)) continue;
        const r = l.getBoundingClientRect();
        const dot = dots.find((d) => { if (l.contains(d)) return true; const q = d.getBoundingClientRect(); return q.right >= r.left - 4 && q.left <= r.right + 4 && q.bottom >= r.top - 4 && q.top <= r.bottom + 4; });
        const fill = [...l.children].find((c) => rgb(getComputedStyle(c).backgroundColor) && (c.offsetWidth < w - 1 || /matrix\(/.test(getComputedStyle(c).transform)));
        if (dot || fill) { out.sceneTracks.push({ id, w: r2(w), what: dot ? 'a track with a marker' : 'a bar that fills' }); break; }
      }
      if (out.sceneTracks.length >= 4) break;
    }
  }

  // --- the product replay: its beats, its control, never a recording, never doubled with the entrance; the
  // window's size, and how far its section holds it (replay.js holds the stage one beat at a time while the visitor
  // scrolls; a window that plays small and unheld is not noticed, r6-p32)
  // (what changes at a beat: every element replay.js plays; data-point-at only aimed the old cursor, so it is not one)
  const MARK = '[data-at], [data-type-at], [data-roll-at], [data-select-at], [data-flip-at], [data-press-at], [data-style-at], [data-frame-at], [data-says], [data-focus-at], [data-open-at], [data-zoom-at]';
  const beatList = (v) => { const s = []; for (const p of String(v ?? '').split(',')) { const m = p.trim().match(/^(\d+)(?:\s*-\s*(\d+))?$/); if (m) for (let k = +m[1]; k <= Math.min(+(m[2] ?? m[1]), 9); k++) s.push(k); } return s; };
  const accentOf = (() => { for (const el of [D, B]) { const v = getComputedStyle(el).getPropertyValue('--accent').trim(); if (!v) continue; const p = document.createElement('i'); p.style.color = v; B.appendChild(p); const c = rgb(getComputedStyle(p).color); p.remove(); if (c) return c; } return null; })();
  const nearAccent = (c) => !!c && !!accentOf && c.every((v, i) => Math.abs(v - accentOf[i]) <= 14);
  out.replays = [...document.querySelectorAll('[data-replay]')].map((r) => {
    const list = String(r.dataset.replay || '').split(',').map(Number).filter((n) => n > 0);
    const beats = list.length === 1 && list[0] <= 8 ? list[0] : list.length;
    const marks = new Set();
    for (const e of r.querySelectorAll(MARK)) {
      // (data-frame-at still sets .is-framed, but a 2px frame is not a beat)
      for (const k of ['at', 'typeAt', 'rollAt', 'selectAt', 'pressAt', 'styleAt', 'openAt', 'closeAt']) if (e.dataset[k]) marks.add(+e.dataset[k]);
      for (const k of ['flipAt', 'focusAt', 'zoomAt']) for (const b of beatList(e.dataset[k])) marks.add(b);
    }
    marks.delete(0);
    for (const e of r.querySelectorAll('[data-says]')) for (const m of e.dataset.says.matchAll(/(\d+):/g)) if (+m[1] > 0) marks.add(+m[1]);
    const scope = r.closest('.replay-hold, section, article, [data-replay-scope]') || r.parentElement || r;
    const control = [...scope.querySelectorAll('button, [role=button], a')].some((b) => visible(b) && /replay|again|play/i.test(textOf(b) + ' ' + (b.getAttribute('aria-label') || '')));
    const rr = r.getBoundingClientRect();
    const recording = [...r.querySelectorAll('video, img')].some((m) => { const q = m.getBoundingClientRect(); return q.width * q.height >= rr.width * rr.height * 0.4; });
    const clash = r.matches('[data-e], [data-moment], [data-reveal]') || !!r.querySelector('[data-e], [data-moment], [data-reveal]') || (!!r.closest('[data-hero]') && document.body?.dataset.entrance === 'product-at-work');
    // the window a visitor sees: the product panel inside the figure when there is one
    const ui = r.querySelector('[data-ui]'); const wr = (ui && visible(ui) ? ui : r).getBoundingClientRect();
    // the hold: a sticky stage and the room its section gives it below (replay.js), or a pinned spacer (GSAP)
    let hold = 0;
    for (let e = r; e && e !== B; e = e.parentElement) {
      const cs = getComputedStyle(e);
      if (cs.position === 'sticky' && e.parentElement) {
        const p = e.parentElement, pr = p.getBoundingClientRect(), pcs = getComputedStyle(p);
        hold = Math.max(0, pr.bottom - parseFloat(pcs.paddingBottom) - parseFloat(pcs.borderBottomWidth) - e.getBoundingClientRect().bottom);
        break;
      }
      if (e.parentElement?.classList.contains('pin-spacer')) { hold = Math.max(0, e.parentElement.offsetHeight - e.offsetHeight); break; }
    }
    // round 7: what the window is built from. r7-p33 and r6-p32 passed every check above and the judges still did not
    // see their replays: 13-15px type, a drawn cursor, nine look-alike cards on fills a step from their board, and the
    // accent on a filled Replay button instead of on what changed.
    const win = ui || r;
    // its type: every text in the window, the parts that only show at a later beat included
    const sizes = [];
    { const tw = document.createTreeWalker(win, NodeFilter.SHOW_TEXT); let n;
      while ((n = tw.nextNode()) && sizes.length < 600) {
        const el = n.parentElement; const t = n.nodeValue.trim();
        if (!el || !t || el.closest('script, style, svg, [data-replay-cursor], .replay__cursor')) continue;
        const marked = !!el.closest(MARK);
        if (!marked && !visible(el)) continue;
        const size = Math.round(parseFloat(getComputedStyle(el).fontSize) * 10) / 10; if (size) sizes.push({ size, text: t.slice(0, 30), marked });
      } }
    const small = sizes.filter((s) => s.size < 14).sort((a, b) => a.size - b.size);
    const markedSmall = sizes.filter((s) => s.marked).sort((a, b) => a.size - b.size);
    // a drawn cursor or pointer standing in for the visitor (replay.js before round 7 moved one); a utility class
    // (Tailwind's cursor-pointer, pointer-events-none) on an icon is not one
    const UTIL = /^(cursor-(auto|default|pointer|text|move|grab|grabbing|wait|help|crosshair|not-allowed|none|zoom-in|zoom-out)|pointer-events-.*)$/i;
    const drawn = (c) => [...c.classList].some((t) => { const u = t.split(':').pop(); return /(^|[-_])(cursor|pointer)($|[-_])/i.test(u) && !UTIL.test(u); });
    const cursors = r.querySelectorAll('[data-replay-cursor], .replay__cursor').length + [...r.querySelectorAll('[class*="cursor" i], [class*="pointer" i]')].filter((c) => { if (!drawn(c) || c.matches('[data-replay-cursor], .replay__cursor') || c.closest('[data-replay-cursor], .replay__cursor')) return false; const q = c.getBoundingClientRect(), cs = getComputedStyle(c); return /absolute|fixed/.test(cs.position) && q.width <= 56 && q.height <= 56 && q.width >= 6 && visible(c); }).length;
    // boxes in the window: a part with its own fill unlike what it stands on, or outlined on three sides, holding
    // text. The window is the one surface; fields, buttons and whatever a beat changes (the item at work, a panel
    // that opens) are not counted.
    const EXEMPT = 'input, textarea, select, button, [role=button], [role=textbox], .is-focus, .is-selected, .is-open, .is-framed, ' + MARK;
    const boxes = [];
    if (ui) for (const e of ui.querySelectorAll('*')) {
      if (boxes.length >= 24) break;
      if (/^(IMG|VIDEO|CANVAS|PICTURE|IFRAME|svg)$/.test(e.tagName) || e.closest('svg') || e.closest(EXEMPT)) continue;
      // (a status pill or a tag is not a box in the window; a row or a card is: 120px wide and 6000px² or more)
      const q = e.getBoundingClientRect(); if (q.width < 120 || q.width * q.height < 6000 || !visible(e) || !textOf(e)) continue;
      if (filledOn(e) || sides(e) >= 3) boxes.push({ text: textOf(e).slice(0, 28), size: `${r2(q.width)}x${r2(q.height)}`, how: filledOn(e) ? '#' + filledOn(e).map((v) => v.toString(16).padStart(2, '0')).join('') : 'outlined' });
    }
    // look-alikes: an item a beat changes with four or more twins in the window (the same tag and class, a size within
    // 10%, the same fill) and no accent of its own to tell it apart (it is not the item at work, data-focus-at)
    const firstClass = (e) => String(e.className && typeof e.className === 'string' ? e.className : '').split(/\s+/).filter((c) => c && !/^is-/.test(c))[0] || '';
    let lookalike = null;
    if (ui) for (const m of ui.querySelectorAll(MARK)) {
      if (m === ui || m.querySelector('[data-focus-at], [data-select-at]') || m.closest('[data-focus-at], [data-select-at]')) continue;
      const q = m.getBoundingClientRect(); if (q.width * q.height < 8000 || !textOf(m)) continue;
      const fill = opaqueBg(m) || groundOf(m), mcs = getComputedStyle(m);
      // (an accent edge tells it apart only when it is a real share of the item, not a 3px line)
      const edge = ['Left', 'Right', 'Top', 'Bottom'].reduce((a, s) => a + (nearAccent(rgb(mcs[`border${s}Color`])) ? parseFloat(mcs[`border${s}Width`]) * (s === 'Left' || s === 'Right' ? q.height : q.width) : 0), 0);
      if (nearAccent(opaqueBg(m)) || edge >= q.width * q.height * 0.1) continue;
      const twins = [...ui.querySelectorAll(m.tagName)].filter((e) => { if (e === m || firstClass(e) !== firstClass(m)) return false; const b = e.getBoundingClientRect(); if (!b.width || Math.abs(b.width - q.width) > q.width * 0.1 || Math.abs(b.height - q.height) > q.height * 0.1) return false; const f = opaqueBg(e) || groundOf(e); return !differs(f, fill, 12); });
      if (twins.length >= 4) { lookalike = { text: textOf(m).slice(0, 30), twins: twins.length, size: `${r2(q.width)}x${r2(q.height)}` }; break; }
    }
    // the accent on parts no beat changes, and the Replay button filled with it (it outshines the change)
    const accentStill = [];
    if (ui && accentOf) for (const e of ui.querySelectorAll('*')) {
      if (accentStill.length >= 4) break;
      if (e.closest(MARK) || e.closest('input, textarea, select') || !visible(e)) continue;
      const cs = getComputedStyle(e), q = e.getBoundingClientRect();
      const bg = nearAccent(rgb(cs.backgroundColor)) && q.width * q.height >= 300;
      const ink = !e.childElementCount && textOf(e) && nearAccent(rgb(cs.color));
      const edge = ['Left', 'Top', 'Right', 'Bottom'].some((s) => parseFloat(cs[`border${s}Width`]) >= 2 && nearAccent(rgb(cs[`border${s}Color`])));
      if (bg || ink || edge) accentStill.push(textOf(e).slice(0, 24) || e.tagName.toLowerCase());
    }
    const againEl = scope.querySelector('[data-replay-again]') || [...scope.querySelectorAll('button')].find((b) => /replay|again/i.test(textOf(b)));
    const accentButton = !!againEl && !!accentOf && nearAccent(opaqueBg(againEl));
    // (replay.js starts a window that shows under half its words before beat 1 at a later beat, data-replay-start, and
    // holds only for the beats it plays)
    return { beats, start: Math.max(0, Math.min(beats - 1, +r.dataset.replayStart || 0)), marks: marks.size, control, recording, clash, hero: !!r.closest('[data-hero]'), w: +(wr.width / W).toFixed(2), h: +(wr.height / H).toFixed(2), held: +(hold / H).toFixed(2), stage: !!r.closest('.replay-stage'),
      minText: sizes.length ? Math.min(...sizes.map((s) => s.size)) : null, small: small.slice(0, 4), markedMin: markedSmall.length ? markedSmall[0].size : null, markedSmall: markedSmall.filter((s) => s.size < 16).slice(0, 3),
      cursors, boxes, lookalike, accentStill, accentButton };
  });
  // boxes in a panel in a window: any other fragment of the product that sets three or more boxes side by side on a
  // fill unlike its own (r7-p33's step fragments, a list of filled rows inside a filled panel)
  out.fragmentBoxes = [];
  for (const u of document.querySelectorAll('[data-ui]')) {
    if (out.fragmentBoxes.length >= 4) break;
    if (u.parentElement?.closest('[data-ui]') || u.closest('[data-replay]') || !visible(u)) continue;
    for (const list of u.querySelectorAll('*')) {
      if (list.childElementCount < 3) continue;
      const items = [...list.children].filter((c) => visible(c) && textOf(c) && !c.matches('input, textarea, select, button') && (filledOn(c) || sides(c) >= 3));
      if (items.length < 3) continue;
      const q = items[0].getBoundingClientRect();
      if (q.width < 120 || q.width * q.height < 6000) continue;
      out.fragmentBoxes.push({ text: textOf(u).slice(0, 30), n: items.length, first: textOf(items[0]).slice(0, 24) });
      break;
    }
  }

  // ---------- round 6: what judges found on pages every check above passed ----------
  // --- boxed-list: a list drawn as boxes. Three or more sibling items (questions, loads, specs, plans, features,
  // options) each on a fill unlike the ground they stand on, or outlined, with ground between them; a zebra list of
  // pills counts. Not inside a product window, a table, a scene or the navigation; not picture tiles; not fields that
  // tile one band edge to edge. r6-p31 (the loads as pill rows, the configurator's option tiles) and r6-p32 (the
  // questions as filled tiles) were called pages of boxes.
  out.boxedLists = [];
  {
    const boxed = (e) => !!filledOn(e) || sides(e) >= 3;
    // an item is drawn as a box itself, or by the one child that fills it (a label whose span is the tile), down to three
    // levels of single children (r9-p43's season ticket: li, sheet, face)
    const drawnAs = (item) => {
      const b = item.getBoundingClientRect();
      for (let e = item, depth = 0; e && depth < 4; depth++) {
        if (boxed(e)) return e;
        const kids = [...e.children].filter(visible);
        if (kids.length !== 1) return null;
        const a = kids[0].getBoundingClientRect();
        if (a.width * a.height < b.width * b.height * 0.8) return null;
        e = kids[0];
      }
      return null;
    };
    const hex = (c) => '#' + c.map((v) => v.toString(16).padStart(2, '0')).join('');
    let m = 0;
    for (const list of B.querySelectorAll('*')) {
      if (++m > 8000 || out.boxedLists.length >= 6) break;
      if (list.childElementCount < 3 || out.boxedLists.some((x) => x.el.contains(list))) continue;
      if (list.closest('[data-ui], table, header, nav, footer, svg, dialog, [role=dialog], [aria-hidden=true], .replay')) continue;
      // (a scene is looked at in its finished composition: where it rests here, or on the reduced-motion page)
      const sc = list.closest('.scene, [data-scene]');
      if (scenesOnly ? !sc : sc && !sc.classList.contains('is-rest')) continue;
      const items = [...list.children].filter((c) => !/^(SCRIPT|STYLE|TEMPLATE|BR|HR|INPUT)$/.test(c.tagName) && visible(c));
      if (items.length < 3) continue;
      // (filled fields are how a form draws its inputs without outlines; option tiles, radios and checkboxes, still count)
      const FIELD = 'select, textarea, input:not([type=radio]):not([type=checkbox]):not([type=hidden]):not([type=submit]):not([type=button])';
      if (items.filter((c) => c.matches(FIELD) || c.querySelector(FIELD)).length >= items.length * 0.5) continue;
      // (option tiles in a form whose own fields are drawn the same way are that form's look, r6-p30's guests beside
      // its date fields; a configurator of tiles alone, r6-p31, is a page of boxes)
      const form = list.closest('form');
      if (form && items.every((c) => c.querySelector('input[type=radio], input[type=checkbox]')) && [...form.querySelectorAll(FIELD)].some((f) => visible(f) && (filledOn(f) || sides(f) >= 3))) continue;
      const rs = items.map((c) => c.getBoundingClientRect());
      // (a band from screen edge to screen edge is a ground, not a box)
      const filled = items.map((c, i) => ({ c, r: rs[i], d: drawnAs(c) })).filter((x) => x.d && x.r.width >= 44 && x.r.height >= 22 && !(x.r.left <= 1 && x.r.right >= W - 1) && textOf(x.c)
        && ![...x.c.querySelectorAll('img, video, picture, canvas')].some((p) => { const q = p.getBoundingClientRect(); return q.width * q.height >= x.r.width * x.r.height * 0.5; }));
      // of one kind: the same tag, three at least and nearly half the list or more (a zebra list of pills counts)
      const tags = new Map(); for (const x of filled) tags.set(x.c.tagName, (tags.get(x.c.tagName) || 0) + 1);
      const [tag, n] = [...tags.entries()].sort((a, b) => b[1] - a[1])[0] || [null, 0];
      if (n < 3 || n < items.length * 0.45) continue;
      // ground between them: items that tile a band edge to edge are fields of colour, not boxes
      const order = [...rs].sort((a, b) => a.top - b.top || a.left - b.left);
      let touching = 0;
      for (let i = 1; i < order.length; i++) { const a = order[i - 1], b = order[i]; const row = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > Math.min(a.height, b.height) * 0.5; if (Math.abs(row ? b.left - a.right : b.top - a.bottom) <= 1) touching++; }
      if (touching >= (order.length - 1) * 0.6) continue;
      const box = filled.find((x) => x.c.tagName === tag);
      const sec = list.closest('section, article') || list.parentElement;
      // (round 11: how the items are drawn. Items on a fill are cards, wanted; items drawn by an outline alone, items cut to
      // a shape by a mask or a clip-path, and items that hold a box of their own are what the boxed-list check fails)
      const plainClip = (v) => v === 'none' || /^inset\(/.test(v);
      const shapeOf = (it) => { const e = it.d; for (let x = e, i = 0; x && i < 3 && it.c.contains(x); i++, x = x.parentElement) { const cs = getComputedStyle(x); if ((cs.maskImage && cs.maskImage !== 'none') || (cs.webkitMaskImage && cs.webkitMaskImage !== 'none') || !plainClip(cs.clipPath)) return true; } for (const k of e.children) { const cs = getComputedStyle(k); const q = k.getBoundingClientRect(), b = e.getBoundingClientRect(); if (q.width * q.height >= b.width * b.height * 0.8 && ((cs.maskImage && cs.maskImage !== 'none') || !plainClip(cs.clipPath))) return true; } return false; };
      const innerBox = (e) => { const b = e.getBoundingClientRect(); return [...e.querySelectorAll('*')].slice(0, 300).some((k) => { if (/^(BUTTON|INPUT|SELECT|TEXTAREA|IMG|VIDEO|PICTURE|CANVAS|SVG)$/i.test(k.tagName) || k instanceof SVGElement) return false; const ctl = k.closest('a, button'); if (ctl && ctl !== e && e.contains(ctl)) return false; const q = k.getBoundingClientRect(); if (q.width < Math.max(80, b.width * 0.3) || q.height < 40 || q.width * q.height >= b.width * b.height * 0.9 || !visible(k)) return false; return (!!filledOn(k) || sides(k) >= 3) && !!textOf(k); }); };
      const items2 = filled.filter((x) => x.c.tagName === tag);
      const how = items2.some((x) => shapeOf(x)) ? 'shaped' : items2.filter((x) => innerBox(x.d)).length >= Math.min(2, items2.length) ? 'nested' : items2.every((x) => !filledOn(x.d)) ? 'outlined' : 'filled';
      out.boxedLists.push({ el: list, head: textOf(sec?.querySelector('h1, h2, h3') || sec || list).slice(0, 40), first: textOf(box.c).slice(0, 30), n, fill: filledOn(box.d) ? hex(filledOn(box.d)) : 'outlined', how });
    }
    for (const x of out.boxedLists) delete x.el;
  }

  // --- lone-column: a split whose one column holds a heading and nothing else (one short line at most), or nothing
  // for most of the row's height, while the column beside it runs on (r6-p32: "What it costs" and "Questions" alone at
  // the top of an empty left column). A sticky column travels beside its content and is left out; the hero too.
  out.loneColumns = [];
  if (W >= 700) {
    const MEDIA = 'img, video, picture, canvas, iframe, [data-ui], input, select, textarea, button';
    const contentOf = (el) => {
      const rs = textRects(el);
      const add = (e) => { if (!visible(e)) return; const r = e.getBoundingClientRect(); if (r.width > 2 && r.height > 2) rs.push(r); };
      if (el.matches(MEDIA) || filledOn(el) || sides(el) >= 3) add(el);
      let k = 0;
      for (const e of el.querySelectorAll('*')) {
        if (++k > 600) break;
        if (e.parentElement?.closest('svg, [data-ui]')) continue;
        if (e.matches(MEDIA) || (e.tagName === 'svg' && e.getBoundingClientRect().width >= 40) || filledOn(e) || sides(e) >= 3 || /url\(/.test(getComputedStyle(e).backgroundImage)) add(e);
      }
      return rs;
    };
    // the height a set of boxes covers, each grown by 12px above and below (the gap between two paragraphs is not empty)
    const cover = (rs, top, bot) => {
      const iv = rs.map((r) => [Math.max(top, r.top - 12), Math.min(bot, r.bottom + 12)]).filter(([a, b]) => b > a).sort((a, b) => a[0] - b[0]);
      let tot = 0, s = null, e = null;
      for (const [a, b] of iv) { if (s === null || a > e) { if (s !== null) tot += e - s; s = a; e = b; } else e = Math.max(e, b); }
      return s === null ? 0 : tot + e - s;
    };
    const sticky = (el, row) => { for (let e = el; e && e !== row; e = e.parentElement) if (/sticky|fixed/.test(getComputedStyle(e).position)) return true; return [...el.querySelectorAll('h1, h2, h3, h4, div, aside, header')].some((e) => getComputedStyle(e).position === 'sticky'); };
    let m = 0;
    for (const row of B.querySelectorAll('*')) {
      if (++m > 6000 || out.loneColumns.length >= 6) break;
      if (row.childElementCount < 2) continue;
      if (row.closest('header, nav, footer, [data-ui], table, svg, dialog, [role=dialog], .scene, [data-scene], [data-hero], [aria-hidden=true]')) continue;
      const rr = row.getBoundingClientRect(); if (rr.width < W * 0.55 || rr.height < 200) continue;
      const kids = [...row.children].filter((c) => visible(c) && !/absolute|fixed/.test(getComputedStyle(c).position));
      if (kids.length < 2) continue;
      // the columns: children grouped by the horizontal room they share
      let cols = kids.map((k) => { const r = k.getBoundingClientRect(); return { l: r.left, r: r.right, els: [k] }; });
      for (let merged = true; merged;) {
        merged = false;
        outer: for (let i = 0; i < cols.length; i++) for (let j = i + 1; j < cols.length; j++) {
          if (Math.min(cols[i].r, cols[j].r) - Math.max(cols[i].l, cols[j].l) > 8) { cols[i] = { l: Math.min(cols[i].l, cols[j].l), r: Math.max(cols[i].r, cols[j].r), els: [...cols[i].els, ...cols[j].els] }; cols.splice(j, 1); merged = true; break outer; }
        }
      }
      if (cols.length < 2) continue;
      for (const c of cols) { c.rects = c.els.flatMap(contentOf); c.words = c.els.reduce((a, e) => a + words(textOf(e)), 0); }
      const all = cols.flatMap((c) => c.rects); if (!all.length) continue;
      const top = Math.min(...all.map((r) => r.top)), bot = Math.max(...all.map((r) => r.bottom)), span = bot - top;
      if (span < 260) continue;
      for (const c of cols) c.fill = cover(c.rects, top, bot) / span;
      // the column that runs on is text: beside a picture, a product window or a form, a short column is its caption
      const BIG = 'img, video, picture, canvas, iframe, [data-ui], form, select, textarea, input';
      for (const c of cols) c.media = cover(c.els.flatMap((e) => [e, ...e.querySelectorAll(BIG)]).filter((e) => e.matches(BIG) && visible(e)).map((e) => e.getBoundingClientRect()), top, bot) / span;
      const fullCol = cols.reduce((a, b) => (b.fill > a.fill ? b : a));
      if (fullCol.fill < 0.7 || fullCol.words < 40 || fullCol.media >= 0.5) continue;
      for (const c of cols) {
        if (c === fullCol || c.fill > 0.35 || c.r - c.l < W * 0.12 || c.els.some((e) => sticky(e, row))) continue;
        // a heading and a short line alone; or any column, a tool or a paragraph, that floats over a screen or more of
        // empty ground beside the text that runs on (r4-p25: the brew calculator beside the long menu)
        const short = c.words <= 30;
        if (!short && span * (1 - c.fill) < H * 0.75) continue;
        const h = c.els.map((e) => (e.matches('h1, h2, h3, h4, [role=heading]') ? e : e.querySelector('h1, h2, h3, h4, [role=heading]'))).find(Boolean);
        if (h && h.tagName === 'H1') continue;
        out.loneColumns.push({ text: textOf(h || c.els[0]).slice(0, 40) || 'an empty column', heading: !!h && short, fill: +c.fill.toFixed(2), span: r2(span), y: r2(top + sy) });
        break;
      }
    }
  }

  // ---------- round 9 ----------
  // --- split-hero-title: on desktop, the h1 on the first screen with a picture or product window 40% of the width or
  // more beside it, held in the other half of the screen, the h1 not set on it; or with such pictures both above and
  // below it, the h1 in a strip between them. Part A raised split heroes to 5vw: under about 4.4vw (64px at 1440)
  // fails, under 5vw (72px) warns. r7-p34: 57px beside a half-width photograph; r8-p38: 39px in a strip between two
  // product panels. A picture the title sits on is full bleed, not a split. A picture only above or only below the h1
  // is not a split either: hero-object's small corner headline under its object, or a headline over a product window.
  out.splitHero = null;
  if (W >= 1100) {
    const h1 = [...document.querySelectorAll('h1')].find((h) => visible(h) && !h.closest('[data-ui]'));
    const hr = h1 && h1.getBoundingClientRect();
    if (h1 && hr.top + sy < H * 0.9 && hr.bottom + sy > 0 && hr.height > 0) {
      let size = 0; { const tw = document.createTreeWalker(h1, NodeFilter.SHOW_TEXT); let n; while ((n = tw.nextNode())) if (n.nodeValue.trim() && n.parentElement) size = Math.max(size, parseFloat(getComputedStyle(n.parentElement).fontSize)); }
      const h = { l: hr.left, r: hr.right, t: hr.top + sy, b: hr.bottom + sy };
      const cands = [...document.querySelectorAll('img, video, canvas, [data-ui]')].filter((e) => !e.parentElement?.closest('[data-ui]'));
      let k = 0; for (const e of B.querySelectorAll('section, div, figure, a, span, li')) { if (++k > 3000) break; if (/url\(/.test(getComputedStyle(e).backgroundImage)) cands.push(e); }
      const kindOf = (e) => (e.matches('[data-ui]') ? 'product window' : e.tagName === 'VIDEO' ? 'video' : e.tagName === 'CANVAS' ? 'canvas' : 'picture');
      const hMid = (h.l + h.r) / 2;
      let best = null; const above = [], below = [];
      for (const e of cands) {
        if (e.contains(h1) || h1.contains(e) || !visible(e)) continue;
        const r = e.getBoundingClientRect();
        const v = { l: Math.max(0, r.left), r: Math.min(W, r.right), t: Math.max(0, r.top + sy), b: Math.min(H, r.bottom + sy) };
        const w = v.r - v.l, ht = v.b - v.t; if (!(w >= W * 0.4) || !(ht >= H * 0.2)) continue;
        const ox = Math.min(h.r, v.r) - Math.max(h.l, v.l), oy = Math.min(h.b, v.b) - Math.max(h.t, v.t);
        if (ox > 0 && oy > 0 && ox * oy >= (h.r - h.l) * (h.b - h.t) * 0.5) continue; // the title is set on it
        const area = w * ht, item = { area, w, ht, kind: kindOf(e) };
        // beside: no overlap across, half the title's height shared, the picture's middle in the other half of the screen
        if (ox <= 0 && oy >= (h.b - h.t) * 0.5 && ((v.l + v.r) / 2 < W / 2) !== (hMid < W / 2)) { if (!best || area > best.area) best = { ...item, how: 'beside' }; continue; }
        if (w >= W * 0.9) continue; // full bleed above or below
        if (v.b <= h.t + 2) above.push(item); else if (v.t >= h.b - 2) below.push(item);
      }
      if (!best && above.length && below.length) { const big = [...above, ...below].sort((p, q) => q.area - p.area)[0]; best = { ...big, how: 'between' }; }
      if (best) out.splitHero = { text: textOf(h1).slice(0, 50), size: +size.toFixed(1), vw: +((size / W) * 100).toFixed(1), how: best.how, kind: best.kind, w: r2((best.w / W) * 100), h: r2((best.ht / H) * 100) };
    }
  }

  // --- tile-wall: a hero or section built as a wall of tiles (r8-p37: about 14 framed frames in six columns, flat red,
  // teal, brown and yellow among them). Here only the candidates: six or more tiles (pictures, or boxes filled unlike
  // their ground, 80px or more and under 45% of the section's width, the outermost of each nest) in three columns or
  // more and two rows. Each is marked data-ts-tile="wall-tile"; the inspector photographs the wall and reads each
  // tile's fill from the pixels (tileFills), so a frame that is a flat field of colour counts like a coloured box.
  out.tileWalls = []; out.ground = null;
  if (W >= 1100) {
    const tv = document.createElement('canvas'); tv.width = tv.height = 1; const tx = tv.getContext('2d', { willReadFrequently: true });
    const norm = (c) => { tx.clearRect(0, 0, 1, 1); tx.fillStyle = 'rgba(0,0,0,0)'; tx.fillStyle = c || 'transparent'; tx.fillRect(0, 0, 1, 1); return [...tx.getImageData(0, 0, 1, 1).data]; };
    const behind = (el) => { for (let e = el; e && e !== D.parentNode; e = e.parentElement) { const c = norm(getComputedStyle(e).backgroundColor); if (c[3] >= 230) return c; } return [255, 255, 255, 255]; };
    const filledTile = (e) => { const c = norm(getComputedStyle(e).backgroundColor); return c[3] >= 230 && differs(c.slice(0, 3), behind(e.parentElement || B).slice(0, 3)); };
    out.ground = behind(B).slice(0, 3);
    for (const old of document.querySelectorAll('[data-ts-tile]')) old.removeAttribute('data-ts-tile');
    const secs = [...document.querySelectorAll('section, [data-hero], main > div, article')].filter((s) => !s.parentElement?.closest('section, [data-hero], article') && visible(s) && !s.closest('[data-ui], header, footer, nav, dialog'));
    for (const s of secs.slice(0, 40)) {
      const sr = s.getBoundingClientRect(); if (sr.width < W * 0.6 || sr.height < 240) continue;
      const cands = [];
      for (const e of s.querySelectorAll('img, video, canvas, figure, div, li, article, a, aside')) {
        if (cands.length > 80 || e.parentElement?.closest('[data-ui]')) continue;
        const r = e.getBoundingClientRect(); if (r.width < 80 || r.height < 80 || r.width > sr.width * 0.45 || !visible(e)) continue;
        if (/^(IMG|VIDEO|CANVAS)$/.test(e.tagName) || filledTile(e) || e.matches('[data-ui]')) cands.push(e);
      }
      const tiles = cands.filter((e) => !cands.some((o) => o !== e && o.contains(e))).slice(0, 40);
      if (tiles.length < 6) continue;
      const rs = tiles.map((t) => t.getBoundingClientRect());
      const distinct = (vals) => vals.sort((a, b) => a - b).filter((v, i, a) => !i || v - a[i - 1] > 24).length;
      if (distinct(rs.map((r) => r.left)) < 3 || distinct(rs.map((r) => r.top)) < 2) continue;
      const wi = out.tileWalls.length;
      tiles.forEach((t, i) => t.setAttribute('data-ts-tile', `${wi}-${i}`));
      out.tileWalls.push({ head: textOf(s.querySelector('h1, h2, h3') || s).slice(0, 50), top: r2(sr.top + sy), h: r2(sr.height), n: tiles.length, hero: !!s.closest('[data-hero]') || sr.top + sy < H * 0.5 });
      if (out.tileWalls.length >= 3) break;
    }
  }

  // --- dot-and-knob tracks: a horizontal line with a round knob or dots on it, which reads as a slider and is none
  // (r8-p38: three "threads" with dots and a white knob on a 2px line). It is no control: no input, no slider or button
  // role, no tab stop, no pointer cursor. Reported with the decorative controls, at every width.
  out.dotTracks = [];
  {
    // (colours as the browser computes them, color-mix() and color(srgb ...) included)
    const cv = document.createElement('canvas'); cv.width = cv.height = 1; const cx = cv.getContext('2d', { willReadFrequently: true });
    const paints = (c) => { if (!c || c === 'transparent') return false; cx.clearRect(0, 0, 1, 1); cx.fillStyle = 'rgba(0,0,0,0)'; cx.fillStyle = c; cx.fillRect(0, 0, 1, 1); return cx.getImageData(0, 0, 1, 1).data[3] > 25; };
    const paintedLine = (cs) => (paints(cs.backgroundColor) || /gradient|url\(/.test(cs.backgroundImage)) && parseFloat(cs.height) > 0 && parseFloat(cs.height) <= 4;
    const roundBox = (e) => {
      const r = e.getBoundingClientRect(); if (r.width < 5 || r.height < 5 || r.width > 44 || Math.abs(r.width - r.height) > 2) return null;
      const cs = getComputedStyle(e); if (parseFloat(cs.borderTopLeftRadius) < r.width * 0.4 || cs.visibility === 'hidden' || +cs.opacity < 0.2) return null;
      return paints(cs.backgroundColor) || (parseFloat(cs.borderTopWidth) >= 1 && cs.borderTopStyle !== 'none' && paints(cs.borderTopColor)) ? r : null;
    };
    const tracks = new Map(); let k = 0;
    for (const e of B.querySelectorAll('i, b, span, em, div, li, s, u, small, mark')) {
      if (++k > 9000) break;
      if (e.closest('svg, button, a[href], input, select, label, [role=slider], [role=tab], [role=button], [role=radio], [role=checkbox]')) continue;
      const r = roundBox(e); if (!r) continue;
      const cy = r.top + r.height / 2;
      for (let t = e.parentElement, d = 0; t && t !== B && d < 3; t = t.parentElement, d++) {
        const tr = t.getBoundingClientRect(); if (tr.width < Math.max(120, r.width * 5) || cy < tr.top - 2 || cy > tr.bottom + 2) continue;
        // the line: the track itself, its ::before or ::after, a thin child, or a border, through the dots' middle
        const tcs = getComputedStyle(t);
        let line = (tr.height <= 4 && (paints(tcs.backgroundColor) || /gradient/.test(tcs.backgroundImage)));
        for (const ps of ['::before', '::after']) { if (line) break; const p = getComputedStyle(t, ps); if (p.content && p.content !== 'none' && p.content !== 'normal' && paintedLine(p) && (parseFloat(p.width) >= tr.width * 0.6 || p.position === 'absolute')) line = true; }
        if (!line) for (const c of t.children) { if (c === e || c.contains(e)) continue; const cr = c.getBoundingClientRect(); if (cr.height > 0 && cr.height <= 4 && cr.width >= tr.width * 0.6 && Math.abs(cr.top + cr.height / 2 - cy) <= 6 && (paints(getComputedStyle(c).backgroundColor) || /gradient/.test(getComputedStyle(c).backgroundImage))) { line = true; break; } }
        if (!line && ((parseFloat(tcs.borderTopWidth) >= 1 && tcs.borderTopStyle !== 'none' && paints(tcs.borderTopColor) && Math.abs(tr.top - cy) <= 6) || (parseFloat(tcs.borderBottomWidth) >= 1 && tcs.borderBottomStyle !== 'none' && paints(tcs.borderBottomColor) && Math.abs(tr.bottom - cy) <= 6))) line = true;
        if (!line) continue;
        if (t.closest('button, a[href], [role=slider], [tabindex]:not([tabindex="-1"])') || /pointer|grab/.test(tcs.cursor) || /pointer|grab/.test(getComputedStyle(e).cursor)) break;
        const g = tracks.get(t) || { dots: [], t }; g.dots.push({ w: r.width, cy }); tracks.set(t, g);
        break;
      }
    }
    for (const g of tracks.values()) {
      const big = g.dots.some((d) => d.w >= 12), mid = g.dots.map((d) => d.cy).sort((a, b) => a - b)[Math.floor(g.dots.length / 2)];
      const on = g.dots.filter((d) => Math.abs(d.cy - mid) <= 4);
      if (on.length < 2 && !(big && on.length >= 1)) continue;
      const row = g.t.parentElement && textOf(g.t.parentElement).length <= 80 ? g.t.parentElement : g.t;
      out.dotTracks.push({ text: textOf(row).slice(0, 40) || 'a track', dots: on.length, knob: big, ui: !!g.t.closest('[data-ui]') });
      if (out.dotTracks.length >= 8) break;
    }
  }
  return out;
}

// Text over a picture on this screen (text-on-photo, round 9, r7-p35): each block of text that lies on a photograph,
// a video or a canvas (through any translucent layer), with the band its letters fill on each line, its colour and
// opacity. Its text is then made transparent ([data-ts-ink]) so the inspector can photograph what lies under the
// letters; photoTextDone() puts it back. Text over a solid ground is the contrast check's business. Runs in the page.
export function photoText() {
  const W = innerWidth, H = innerHeight;
  const UNITS = 'h1, h2, h3, h4, h5, h6, p, blockquote, li, figcaption, dd, dt, td, th, label, button, a, caption, summary';
  const cvs = document.createElement('canvas'); cvs.width = cvs.height = 1; const cx = cvs.getContext('2d', { willReadFrequently: true });
  const colour = (c) => { cx.clearRect(0, 0, 1, 1); cx.fillStyle = 'rgba(0,0,0,0)'; cx.fillStyle = c; cx.fillRect(0, 0, 1, 1); const d = cx.getImageData(0, 0, 1, 1).data; return [d[0], d[1], d[2], d[3] / 255]; };
  // (a bar pinned to the top passes over every picture of the page; it is judged on the first screen only)
  const pinned = (el) => { for (let p = el; p && p !== document.body; p = p.parentElement) { const cs = getComputedStyle(p); if (cs.position === 'fixed' || cs.position === 'sticky') { const r = p.getBoundingClientRect(); if (r.top < 140 && r.height < 180) return true; } } return false; };
  const memo = new Map();
  const opacityOf = (el) => { if (!el || el === document.documentElement) return 1; if (memo.has(el)) return memo.get(el); const cs = getComputedStyle(el); const v = cs.visibility === 'hidden' ? 0 : +cs.opacity * opacityOf(el.parentElement); memo.set(el, v); return v; };
  // (a layer above the text covers it: a picture, an opaque ground, or a copy of the words in another colour, as a
  // colour swap lays over the ink copy; the visitor sees that layer, so the point is not counted)
  const rq = document.createRange();
  const ownTextAt = (e, x, y) => { for (const c of e.childNodes) { if (c.nodeType !== 3 || !c.nodeValue.trim()) continue; rq.selectNodeContents(c); for (const q of rq.getClientRects()) if (x >= q.left && x <= q.right && y >= q.top && y <= q.bottom) return true; } return false; };
  const covers = (e, x, y) => {
    if (opacityOf(e) < 0.5) return false;
    if (/^(IMG|VIDEO|CANVAS|PICTURE|IFRAME)$/.test(e.tagName)) return true;
    const cs = getComputedStyle(e);
    if (colour(cs.backgroundColor)[3] >= 0.9) return true;
    return colour(cs.color)[3] >= 0.1 && ownTextAt(e, x, y);
  };
  const groundAt = (el, x, y) => {
    const stack = document.elementsFromPoint(x, y); const i = stack.indexOf(el) >= 0 ? stack.indexOf(el) : stack.findIndex((e) => el.contains(e)); if (i < 0) return null;
    for (const e of stack.slice(0, i)) if (!e.contains(el) && covers(e, x, y)) return { covered: true };
    for (const e of stack.slice(i + 1)) {
      if (e === document.body || e === document.documentElement) break;
      if (e.contains(el) && e !== el) { const cs = getComputedStyle(e); if (!/url\(/.test(cs.backgroundImage)) { const c = colour(cs.backgroundColor); if (c[3] >= 0.9) return { solid: true }; continue; } }
      const ecs = getComputedStyle(e);
      const url = (ecs.backgroundImage.match(/url\(["']?([^"')]+)/) || [])[1] || '';
      const size = ecs.backgroundSize.split(',')[0].trim(), stretched = /^\S+\s+\S+$/.test(size) && !/auto|cover|contain/.test(size);
      const picture = /^(IMG|VIDEO|CANVAS|PICTURE|IFRAME)$/.test(e.tagName) || (url && !(/^data:/.test(url) && url.length < 4000) && !stretched && (/cover|contain|%/.test(size) || /no-repeat/.test(ecs.backgroundRepeat)));
      if (picture) return { media: (e.currentSrc || e.getAttribute('poster') || url || e.tagName.toLowerCase()).split('/').pop().split('?')[0].slice(0, 48) || e.tagName.toLowerCase() };
      if (colour(ecs.backgroundColor)[3] >= 0.9) return { solid: true };
    }
    return null;
  };
  // (hit-testing skips pointer-events: none, which scenes set on their layers: switched on while sampling)
  const hit = document.createElement('style'); hit.textContent = '*, *::before, *::after { pointer-events: auto !important; }'; document.head.appendChild(hit);
  const units = new Map(); const tw = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); const rg = document.createRange();
  let lines = 0;
  try { for (let n = tw.nextNode(); n && lines < 900; n = tw.nextNode()) {
    const t = n.nodeValue.replace(/\s+/g, ' ').trim(); const el = n.parentElement;
    if (t.length < 2 || !el || /^(SCRIPT|STYLE|NOSCRIPT|TEMPLATE|OPTION)$/.test(el.tagName) || el.closest('svg, [data-ui], dialog:not([open])')) continue;
    rg.selectNodeContents(n); const rects = [...rg.getClientRects()].filter((r) => r.width >= 4 && r.bottom > 0 && r.top < H && r.right > 0 && r.left < W);
    if (!rects.length) continue;
    const cs = getComputedStyle(el); const size = parseFloat(cs.fontSize); const op = opacityOf(el); const c = colour(cs.color);
    if (op < 0.85 || c[3] < 0.1 || size < 9 || (pinned(el) && scrollY > H * 0.5)) continue;
    const unit = el.closest(UNITS) || el;
    for (const r of rects) {
      lines++;
      const mid = (r.top + r.bottom) / 2, band = { l: Math.max(0, r.left), r: Math.min(W, r.right), t: Math.max(0, mid - size * 0.35), b: Math.min(H, mid + size * 0.35) };
      if (band.r - band.l < 4 || band.b - band.t < 3) continue;
      // (seven points along the line; the band is then cut to the stretch that lies on the picture where the visitor
      // sees these letters, so a copy clipped to a window, or a line half under a cover, is measured where it shows)
      let on = 0, seen = 0, media = null, gl = Infinity, gr = -Infinity; const bw = band.r - band.l;
      for (let k = 0; k < 7; k++) { const x = Math.min(W - 1, band.l + bw * ((k + 0.5) / 7)), g = groundAt(el, x, Math.min(H - 1, Math.max(0, mid))); if (!g || g.covered) continue; seen++; if (g.media) { on++; media = g.media; gl = Math.min(gl, x); gr = Math.max(gr, x); } }
      if (!seen || on / seen < 0.6) continue;
      band.l = Math.max(band.l, gl - bw / 14); band.r = Math.min(band.r, gr + bw / 14);
      if (band.r - band.l < 4) continue;
      // (the words once: a colour-swap copy repeats them inside the same block)
      const said = (unit.innerText || t).replace(/\s+/g, ' ').trim(), twice = said.match(/^(.{3,}?)\s*\1$/);
      const u = units.get(unit) || { els: new Set(), text: (twice ? twice[1] : said).slice(0, 60), size: Math.round(size * 10) / 10, weight: +cs.fontWeight || 400, color: c, op: Math.round(op * 100) / 100, media, rects: [] };
      // (each line keeps its own colour and opacity: the copies of a colour swap are inked differently)
      u.els.add(el); if (u.rects.length < 16) u.rects.push({ l: Math.round(band.l), r: Math.round(band.r), t: Math.round(band.t), b: Math.round(band.b), c: [c[0], c[1], c[2], Math.round(c[3] * op * 100) / 100] });
      units.set(unit, u);
    }
    if (units.size >= 40) break;
  } } finally { hit.remove(); }
  if (!units.size) return [];
  for (const u of units.values()) for (const el of u.els) el.setAttribute('data-ts-ink', '');
  const s = document.createElement('style'); s.id = 'ts-ink';
  s.textContent = '[data-ts-ink], [data-ts-ink] * { color: transparent !important; -webkit-text-fill-color: transparent !important; text-shadow: none !important; -webkit-text-stroke-color: transparent !important; text-decoration-color: transparent !important; caret-color: transparent !important; transition: none !important; }';
  document.head.appendChild(s);
  void document.body.offsetHeight;
  return [...units.values()].map(({ els, ...u }) => u);
}
export function photoTextDone() {
  const s = document.getElementById('ts-ink'); if (!s) return 0;
  // the colour comes back with transitions still off, so a colour transition does not fade the words in again
  s.textContent = '[data-ts-ink], [data-ts-ink] * { transition: none !important; }';
  for (const el of document.querySelectorAll('[data-ts-ink]')) void getComputedStyle(el).color;
  s.remove(); for (const el of document.querySelectorAll('[data-ts-ink]')) el.removeAttribute('data-ts-ink');
  return 1;
}

// The contrast of each block of text from photoText() against the pixels under its letters, from a screenshot taken
// with the text made transparent: the WCAG ratio of the text's colour (blended by its opacity) against every sampled
// pixel of its letter bands, given as the 10th, 25th and 50th percentile and the share under its target (4.5:1, or 3:1
// at 24px and up or 18.5px bold). Runs inside any page; takes [dataUrl, units].
export async function photoContrast([src, units]) {
  const img = new Image(); img.src = src; await img.decode();
  const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
  const x = c.getContext('2d', { willReadFrequently: true }); x.drawImage(img, 0, 0);
  const lin = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
  const L = (r, g, b) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
  // (each line is also cut into stretches of about two letters' height wide, a word or so: a stretch whose median is
  // under the target is a word that cannot be read, however clear the rest of the line is)
  const need = (u) => (u.size >= 24 || (u.size >= 18.5 && u.weight >= 700) ? 3 : 4.5);
  return units.map((u) => {
    const ratios = [], segs = [];
    for (const r of u.rects) {
      const fg = r.c || [u.color[0], u.color[1], u.color[2], u.color[3] * u.op], a = Math.min(1, fg[3]);
      const x0 = Math.max(0, Math.floor(r.l)), y0 = Math.max(0, Math.floor(r.t)), x1 = Math.min(c.width, Math.ceil(r.r)), y1 = Math.min(c.height, Math.ceil(r.b));
      if (x1 - x0 < 2 || y1 - y0 < 2) continue;
      const d = x.getImageData(x0, y0, x1 - x0, y1 - y0).data, w = x1 - x0, hh = y1 - y0;
      const step = Math.max(1, Math.round(Math.sqrt((w * hh) / 1200)));
      const segW = Math.max(40, u.size * 2.5), nSeg = Math.max(1, Math.round(w / segW)), bySeg = Array.from({ length: nSeg }, () => []);
      for (let yy = 0; yy < hh; yy += step) for (let xx = 0; xx < w; xx += step) {
        const i = (yy * w + xx) * 4, br = d[i], bg = d[i + 1], bb = d[i + 2];
        const l1 = L(fg[0] * a + br * (1 - a), fg[1] * a + bg * (1 - a), fg[2] * a + bb * (1 - a)), l2 = L(br, bg, bb);
        const v = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
        ratios.push(v); bySeg[Math.min(nSeg - 1, Math.floor((xx / w) * nSeg))].push(v);
      }
      for (const s of bySeg) if (s.length >= 6) { s.sort((p, q) => p - q); segs.push(s[Math.floor(s.length / 2)]); }
    }
    if (ratios.length < 24) return null;
    ratios.sort((p, q) => p - q);
    const at = (f) => Math.round(ratios[Math.floor(f * (ratios.length - 1))] * 100) / 100;
    const n = need(u), low = segs.filter((v) => v < n);
    return { text: u.text, size: u.size, need: n, media: u.media, p10: at(0.1), p25: at(0.25), p50: at(0.5), under: Math.round((ratios.filter((v) => v < n).length / ratios.length) * 100) / 100, segs: segs.length, segLow: low.length, segWorst: segs.length ? Math.round(Math.min(...segs) * 100) / 100 : null };
  });
}

// Headings set in letters (letters-mid-reveal, round 9, r7-p35's "Booking" captured as "B o" on a phone): an h1-h6,
// [role=heading], paragraph or quotation of 24px or more (any h1-h3) whose text is mostly in elements of one or two
// letters. For each, every letter's opacity and its own transform (with any wrapper's up to the heading): translation,
// scale and rotation. Each heading is numbered once (data-ts-split) so the inspector can compare a screen with the
// state at the end of the walk. { all: true } returns every one, in view or not. Runs in the page.
export function splitLetters(opts = {}) {
  const H = innerHeight;
  window.__tsSplit = window.__tsSplit || 0;
  const out = [];
  const parse = (cs) => {
    let tx = 0, ty = 0, sc = 1, rot = 0;
    const m = cs.transform && cs.transform !== 'none' ? cs.transform.match(/matrix(3d)?\(([^)]+)\)/) : null;
    if (m) { const v = m[2].split(',').map(Number); const [a, b, e, f] = m[1] ? [v[0], v[1], v[12], v[13]] : [v[0], v[1], v[4], v[5]]; tx += e; ty += f; sc *= Math.hypot(a, b); rot += (Math.atan2(b, a) * 180) / Math.PI; }
    if (cs.translate && cs.translate !== 'none') { const p = cs.translate.split(/\s+/).map(parseFloat); tx += p[0] || 0; ty += p[1] || 0; }
    if (cs.scale && cs.scale !== 'none') sc *= parseFloat(cs.scale) || 1;
    if (cs.rotate && cs.rotate !== 'none') rot += parseFloat(cs.rotate) || 0;
    return [tx, ty, sc, rot];
  };
  for (const h of document.querySelectorAll('h1, h2, h3, h4, h5, h6, [role=heading], p, blockquote')) {
    if (h.parentElement?.closest('h1, h2, h3, h4, h5, h6, [role=heading], p, blockquote') || h.closest('svg, [data-ui]')) continue;
    const letters = [...h.querySelectorAll('*')].filter((e) => !e.childElementCount && /^\S{1,2}$/.test((e.textContent || '').trim()));
    if (letters.length < 3) continue;
    const total = (h.textContent || '').replace(/\s+/g, '').length; const inLetters = letters.reduce((a, e) => a + e.textContent.trim().length, 0);
    if (inLetters < total * 0.6) continue;
    const size = parseFloat(getComputedStyle(letters[0]).fontSize); if (size < 24 && !/^H[1-3]$/.test(h.tagName)) continue;
    if (!h.dataset.tsSplit) h.dataset.tsSplit = String(window.__tsSplit++);
    const r = h.getBoundingClientRect(); const seen = r.height > 0 ? (Math.min(r.bottom, H) - Math.max(r.top, 0)) / r.height : 0;
    const inView = seen >= 0.8 && getComputedStyle(h).visibility !== 'hidden';
    if (!opts.all && !inView) continue;
    const state = letters.slice(0, 60).map((l) => {
      let op = 1, tx = 0, ty = 0, sc = 1, rot = 0;
      for (let e = l; e && e !== h; e = e.parentElement) { const cs = getComputedStyle(e); op *= cs.visibility === 'hidden' ? 0 : +cs.opacity; const [a, b, c, d] = parse(cs); tx += a; ty += b; sc *= c; rot += d; }
      return [Math.round(op * 100) / 100, Math.round(tx), Math.round(ty), Math.round(sc * 100) / 100, Math.round(rot)];
    });
    out.push({ id: h.dataset.tsSplit, text: (h.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 40), chars: letters.slice(0, 60).map((l) => l.textContent.trim()), size: Math.round(size), inView, top: Math.round(r.top), letters: state });
    if (out.length >= 30) break;
  }
  return out;
}

// The fill of each tile of a wall (tile-wall), from a screenshot: the commonest colour (4 bits a channel) and its
// share of the tile, sampled on a 3px grid; a tile is filled when one colour covers 45% of it or more and it is not
// the page's ground. Filled tiles are grouped into fills: by hue for colours (22 degrees, 0.2 of lightness), by
// lightness for greys. Runs inside any page; takes [dataUrl, rects, ground].
export async function tileFills([src, rects, ground]) {
  const img = new Image(); img.src = src; await img.decode();
  const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
  const x = c.getContext('2d', { willReadFrequently: true }); x.drawImage(img, 0, 0);
  const hsl = ([r, g, b]) => { r /= 255; g /= 255; b /= 255; const mx = Math.max(r, g, b), mn = Math.min(r, g, b); const l = (mx + mn) / 2; let h = 0, s = 0; if (mx !== mn) { const d = mx - mn; s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn); h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h *= 60; } return { h, s, l }; };
  const tiles = [];
  for (const r of rects) {
    const x0 = Math.max(0, Math.floor(r.x)), y0 = Math.max(0, Math.floor(r.y)), x1 = Math.min(c.width, Math.ceil(r.x + r.w)), y1 = Math.min(c.height, Math.ceil(r.y + r.h));
    if (x1 - x0 < 40 || y1 - y0 < 40 || (x1 - x0) * (y1 - y0) < r.w * r.h * 0.6) continue;
    const d = x.getImageData(x0, y0, x1 - x0, y1 - y0).data, w = x1 - x0, hh = y1 - y0; const bins = new Map(); let n = 0;
    for (let yy = 1; yy < hh; yy += 3) for (let xx = 1; xx < w; xx += 3) { const i = (yy * w + xx) * 4; const k = (d[i] >> 4) << 8 | (d[i + 1] >> 4) << 4 | (d[i + 2] >> 4); const b = bins.get(k) || [0, 0, 0, 0]; b[0] += d[i]; b[1] += d[i + 1]; b[2] += d[i + 2]; b[3]++; bins.set(k, b); n++; }
    const top = [...bins.values()].sort((a, b) => b[3] - a[3])[0]; if (!top) continue;
    const rgb = [top[0] / top[3], top[1] / top[3], top[2] / top[3]].map(Math.round), share = top[3] / n;
    const off = Math.max(...rgb.map((v, i) => Math.abs(v - (ground ? ground[i] : 255))));
    tiles.push({ rgb, share: Math.round(share * 100) / 100, filled: share >= 0.45 && off > 30 });
  }
  const fills = [];
  for (const t of tiles.filter((q) => q.filled)) {
    const v = hsl(t.rgb), chroma = v.s >= 0.25 && v.l > 0.12 && v.l < 0.9;
    const f = fills.find((q) => q.chroma === chroma && (chroma ? Math.min(Math.abs(q.h - v.h), 360 - Math.abs(q.h - v.h)) < 22 && Math.abs(q.l - v.l) < 0.2 : Math.abs(q.l - v.l) < 0.15));
    if (f) f.n++; else fills.push({ chroma, h: v.h, l: v.l, n: 1, hex: '#' + t.rgb.map((q) => q.toString(16).padStart(2, '0')).join('') });
  }
  return { measured: tiles.length, filled: tiles.filter((q) => q.filled).length, fills: fills.map((f) => ({ hex: f.hex, n: f.n, colour: f.chroma })) };
}

// Decorative controls (round 6): a switch, checkbox or slider on the page that changes nothing when it is used
// (r6-p32 listed its features as switches, the ones "off" greyed). Each is used once (clicked, or its value moved),
// watched for 300ms and put back. It is real when words on the page change, something appears, goes or fades out, the
// page's own state or colours (html, body, main) change, a picture or another control changes, or it sits in a form that
// is sent (an action, a button or a submit handler). Restyling its own row is not a change. Also the rows that hold
// these controls, by their contrast (a greyed row is text like any other: 4.5:1, 3:1 at 24px or more). Async: run it
// after everything else, it uses the page.
export async function controls() {
  const W = innerWidth, H = innerHeight, B = document.body || document.documentElement;
  const out = { decorative: [], greyed: [], tested: 0 };
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const shows = (el) => { if (!el || !el.isConnected) return false; const cs = getComputedStyle(el); if (cs.display === 'none' || cs.visibility === 'hidden') return false; const r = el.getBoundingClientRect(); return r.width > 1 && r.height > 1; };
  const textOf = (el) => (el.innerText || el.textContent || '').trim().replace(/\s+/g, ' ');
  const SEL = 'input[type=checkbox], [role=switch], [role=checkbox], input[type=range], [role=slider]';
  // (a form with a button of its own, or a submit handler, is sent, by the browser or by script; a switch drawn as a
  // button is not the form's button)
  const sent = (f) => !!f && (f.hasAttribute('action') || f.method === 'dialog' || !!f.onsubmit || [...f.querySelectorAll('button, [type=submit], input[type=image]')].some((b) => !b.matches(SEL) && !b.querySelector(SEL)));
  const all = [...document.querySelectorAll(SEL)].filter((c) => !c.closest('[data-ui], header, nav, [role=banner], dialog, [role=dialog], [aria-hidden=true], .scene, [data-scene]') && !c.disabled);
  // the control as a visitor sees it: itself, or its label when the input is hidden under a styled label
  const face = (c) => (shows(c) && getComputedStyle(c).opacity > 0.05 ? c : c.closest('label') || (c.id && document.querySelector(`label[for="${CSS.escape(c.id)}"]`)) || c);
  const cands = all.filter((c) => !sent(c.form || c.closest('form')) && shows(face(c))).slice(0, 10);
  // its own row: the largest box round it that holds no other control (and is not the page or a whole section of controls)
  const rowOf = (c) => { let row = c; for (let e = c.parentElement; e && e !== B && e !== document.documentElement && !e.matches('main, section, article, form'); e = e.parentElement) { if (all.some((o) => o !== c && e.contains(o))) break; row = e; } return row; };
  // what the page shows outside the control itself (and the label it sits in): the visible words, how many elements
  // show, the pictures, the other controls' state (an output beside a slider is the slider at work), and its look: the
  // page's own colours (a theme switch done in CSS alone) and which texts outside the control's row are faded out (a
  // price switch that swaps prices by opacity). Restyling its own row is not a change.
  const state = (own, row) => {
    const tw = document.createTreeWalker(B, NodeFilter.SHOW_TEXT); let words = '', n;
    while ((n = tw.nextNode())) { const el = n.parentElement; if (!el || own.contains(el) || !n.nodeValue.trim() || el.closest('script, style')) continue; if (el.getClientRects().length && getComputedStyle(el).visibility !== 'hidden') words += n.nodeValue.trim() + ' '; }
    let shown = 0; for (const e of B.querySelectorAll('*')) if (!own.contains(e) && e.getClientRects().length) shown++;
    const pics = [...document.querySelectorAll('img, video, source')].map((e) => e.currentSrc || e.src || '').join('|');
    const ctl = all.filter((o) => !own.contains(o)).map((o) => (o.checked ? 1 : 0) + ':' + (o.value || '') + ':' + (o.getAttribute('aria-checked') || '')).join('|');
    const page = [document.documentElement, B].map((e) => [...e.attributes].map((a) => a.name + '=' + a.value).join(';')).join('|');
    const look = [document.documentElement, B, document.querySelector('main')].filter(Boolean).map((e) => { const cs = getComputedStyle(e); return cs.backgroundColor + ' ' + cs.color; }).join('|');
    let faded = '', k = 0;
    for (const e of B.querySelectorAll('*')) { if (++k > 4000) break; if (row.contains(e) || e.contains(row) || !e.firstChild || /^(SCRIPT|STYLE)$/.test(e.tagName)) continue; if ([...e.childNodes].some((t) => t.nodeType === 3 && t.nodeValue.trim()) && +getComputedStyle(e).opacity < 0.1) faded += k + ','; }
    return { words, shown, pics, ctl, page, look, faded };
  };
  // a slider is moved half its range (an ARIA slider by the arrow key), a checkbox or switch clicked
  const key = (c, k) => c.dispatchEvent(new KeyboardEvent('keydown', { key: k, code: k, bubbles: true, cancelable: true }));
  const use = (c) => {
    if (c.matches('input[type=range]')) { const v = +c.value, max = +(c.max || 100), min = +(c.min || 0); c.value = String(v < max ? Math.min(max, v + (max - min) / 2) : min); c.dispatchEvent(new Event('input', { bubbles: true })); c.dispatchEvent(new Event('change', { bubbles: true })); return v; }
    if (c.matches('[role=slider]')) { if (c.focus) c.focus({ preventScroll: true }); key(c, 'ArrowRight'); return 'key'; }
    c.click(); return null;
  };
  const undo = (c, v) => { if (v === 'key') key(c, 'ArrowLeft'); else if (v != null) { c.value = String(v); c.dispatchEvent(new Event('input', { bubbles: true })); c.dispatchEvent(new Event('change', { bubbles: true })); } else c.click(); };
  // nothing a control does may leave the page: no submit, no link followed
  const stopSubmit = (e) => e.preventDefault();
  const stopLink = (e) => { const a = e.target.closest && e.target.closest('a[href]'); if (a && !/^#/.test(a.getAttribute('href') || '')) e.preventDefault(); };
  addEventListener('submit', stopSubmit, true); addEventListener('click', stopLink, true);
  const x0 = scrollX, y0 = scrollY;
  try {
    for (const c of cands) {
      const row = rowOf(c);
      // a class, src or data change outside the row on an element that holds or is a picture (a swatch recolouring the
      // product) is a change too; style writes are left out, running animations make them all the time
      const seen = [];
      const mo = new MutationObserver((list) => { for (const m of list) if (m.type === 'attributes' && m.attributeName !== 'style' && !row.contains(m.target) && !m.target.contains(row) && (m.target.matches('img, video, picture, canvas, svg') || m.target.querySelector?.('img, video, canvas'))) seen.push(m.attributeName); });
      const own = c.closest('label') || c;
      const before = state(own, row);
      mo.observe(B, { attributes: true, subtree: true });
      const v = use(c); await wait(300);
      mo.disconnect();
      const after = state(own, row);
      undo(c, v); await wait(120);
      out.tested++;
      const changed = ['words', 'shown', 'pics', 'ctl', 'page', 'look', 'faded'].some((k) => before[k] !== after[k]) || seen.length;
      const label = textOf(row).slice(0, 50) || c.getAttribute('aria-label') || c.name || c.id || c.tagName.toLowerCase();
      if (!changed) out.decorative.push({ text: label, what: c.matches('input[type=range], [role=slider]') ? 'slider' : c.matches('[role=switch]') ? 'switch' : 'checkbox' });
    }
  } finally {
    removeEventListener('submit', stopSubmit, true); removeEventListener('click', stopLink, true);
    scrollTo(x0, y0);
  }
  // the rows of a list of controls, by their contrast: the text against the ground it stands on, faded by opacity
  const rgba = (s) => { const m = s && s.match(/rgba?\(([^)]+)\)/); if (!m) return null; const p = m[1].split(/[ ,/]+/).filter(Boolean).map(Number); return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 }; };
  const lum = (c) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b); };
  const ground = (el) => { for (let e = el; e; e = e.parentElement) { const c = rgba(getComputedStyle(e).backgroundColor); if (c && c.a >= 0.9) return c; } return { r: 255, g: 255, b: 255, a: 1 }; };
  // (the rows of a list of switches or checkboxes outside a form that is sent: a feature list set as settings)
  const rows = cands.map(rowOf);
  if (rows.length >= 2) {
    for (const row of rows.slice(0, 12)) {
      const tw = document.createTreeWalker(row, NodeFilter.SHOW_TEXT); let n;
      while ((n = tw.nextNode())) {
        const el = n.parentElement; const t = n.nodeValue.trim(); if (!el || t.length < 3 || !shows(el)) continue;
        let o = 1; for (let e = el; e && e !== document.documentElement; e = e.parentElement) o *= +getComputedStyle(e).opacity;
        const fg = rgba(getComputedStyle(el).color); if (!fg) continue; const bg = ground(el); const a = fg.a * o;
        const mix = { r: fg.r * a + bg.r * (1 - a), g: fg.g * a + bg.g * (1 - a), b: fg.b * a + bg.b * (1 - a) };
        const l1 = lum(mix), l2 = lum(bg); const ratio = Math.round(((Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)) * 10) / 10;
        // (the contrast check's own targets: 4.5:1 for text, 3:1 for large display, 24px or more)
        const need = parseFloat(getComputedStyle(el).fontSize) >= 24 ? 3 : 4.5;
        if (ratio < need) { out.greyed.push({ text: t.slice(0, 40), ratio, need }); break; }
      }
      if (out.greyed.length >= 6) break;
    }
  }
  return out;
}

// One product replay at the moment it is called (the inspector's beat pass): the beat it shows, whether its stage
// stands held, the window as a visitor sees it (inside the figure when the figure clips a view that moves in, and
// inside the screen), the top and foot of what its stage shows, a bar fixed to the top of the screen, how much of
// the window is bare, and a signature of its parts (a replay on its own clock has no data-beat to read).
// Runs in the page; takes the replay's index among [data-replay].
export function replayState(i) {
  const r = document.querySelectorAll('[data-replay]')[i]; if (!r) return null;
  const W = innerWidth, H = innerHeight;
  const ui = r.querySelector('[data-ui]') || r;
  const u = ui.getBoundingClientRect(), f = r.getBoundingClientRect();
  const clips = getComputedStyle(r).overflowX !== 'visible';
  const l = Math.max(0, u.left, clips ? f.left : -1e9), t = Math.max(0, u.top, clips ? f.top : -1e9);
  const rt = Math.min(W, u.right, clips ? f.right : 1e9), b = Math.min(H, u.bottom, clips ? f.bottom : 1e9);
  const win = { x: Math.round(l), y: Math.round(t), w: Math.max(0, Math.round(rt - l)), h: Math.max(0, Math.round(b - t)) };
  const stage = r.closest('.replay-stage');
  const held = !!stage && stage.classList.contains('is-held');
  const stuck = held && Math.abs(stage.getBoundingClientRect().top - (parseFloat(getComputedStyle(stage).top) || 0)) < 2;
  let top = Infinity, foot = -Infinity;
  for (const c of (stage || r.parentElement || r).children) {
    if (c.classList.contains('replay-hold__run')) continue;
    const cs = getComputedStyle(c); if (cs.display === 'none' || cs.visibility === 'hidden') continue;
    const q = c.getBoundingClientRect(); if (q.width < 2 || q.height < 2) continue;
    top = Math.min(top, q.top); foot = Math.max(foot, q.bottom);
  }
  // a bar fixed or stuck to the top of the screen is not empty space above the stage
  let bar = 0;
  for (const e of document.querySelectorAll('header, nav, [role=banner], body > div, body > *')) {
    const cs = getComputedStyle(e); if (!/fixed|sticky/.test(cs.position) || cs.visibility === 'hidden' || +cs.opacity < 0.1 || e.contains(r)) continue;
    const q = e.getBoundingClientRect(); if (q.top <= 2 && q.bottom > 0 && q.height < H * 0.2 && q.width >= W * 0.5) bar = Math.max(bar, q.bottom);
  }
  // bare window: a 12 x 8 grid of points over it, a point covered within 8px of a line of text, a picture, a field
  // or a painted leaf element (a bar, a dot)
  const fill = [];
  { const tw = document.createTreeWalker(ui, NodeFilter.SHOW_TEXT); const rg = document.createRange(); let n;
    while ((n = tw.nextNode())) { if (!n.nodeValue.trim() || !n.parentElement) continue; const cs = getComputedStyle(n.parentElement); if (cs.visibility === 'hidden' || +cs.opacity < 0.1) continue; rg.selectNodeContents(n); for (const q of rg.getClientRects()) if (q.width > 1 && q.height > 1) fill.push(q); } }
  for (const e of ui.querySelectorAll('*')) {
    const cs = getComputedStyle(e); if (cs.visibility === 'hidden' || +cs.opacity < 0.1) continue;
    if (/^(IMG|VIDEO|CANVAS|PICTURE|IFRAME|INPUT|TEXTAREA|SELECT|svg)$/.test(e.tagName) || (!e.childElementCount && (cs.backgroundColor !== 'rgba(0, 0, 0, 0)' || cs.backgroundImage !== 'none'))) fill.push(e.getBoundingClientRect());
  }
  let bare = 0;
  if (win.w > 8 && win.h > 8) {
    for (let a = 0; a < 12; a++) for (let c = 0; c < 8; c++) {
      const x = win.x + ((a + 0.5) * win.w) / 12, y = win.y + ((c + 0.5) * win.h) / 8;
      if (!fill.some((q) => x >= q.left - 8 && x <= q.right + 8 && y >= q.top - 8 && y <= q.bottom + 8)) bare++;
    }
    bare = Math.round((bare / 96) * 100) / 100;
  }
  const cursor = [...r.querySelectorAll('[data-replay-cursor], .replay__cursor')].some((c) => { const cs = getComputedStyle(c); return cs.display !== 'none' && cs.visibility !== 'hidden' && +cs.opacity > 0.1; });
  // the parts' classes and words, in order: what a beat on a clock changes
  const sig = [...ui.querySelectorAll('*')].slice(0, 500).map((e) => (typeof e.className === 'string' ? e.className : '') + (e.childElementCount ? '' : ':' + String(e.matches('input, textarea') ? e.value : e.textContent).slice(0, 40)) + (getComputedStyle(e).opacity < 0.5 ? '~' : '')).join('|');
  return { beat: r.dataset.beat ?? null, held, stuck, win, top: Math.round(top), foot: Math.round(foot), bar: Math.round(bar), bare, cursor, uid: [...document.querySelectorAll('canvas, [data-ui]')].indexOf(ui), sig, y: Math.round(scrollY) };
}

#!/usr/bin/env node
/*
  taste-skill motion-lint.mjs - finds the motion faults that can be read from the code, before a browser opens.
  Node 22, no packages. The rules it reads are in references/motion.md (Motion craft, Never).

    node <skill>/scripts/motion-lint.mjs <page.html | folder | .css | .js> [more files] [--kind <kind>] [--json] [--kit]

  It reads a page's own motion: its <style> blocks, style="" attributes, inline <script>s, and the stylesheets and
  scripts it links from its own folder. The kit's files (anything linked under assets/) are left out: they are linted
  on their own (node motion-lint.mjs <skill>/assets/motion/motion.css) and pass. --kit reads them as well.
  A .css or .js file given by name is read as it is.

  Levels:
    FAIL  fix it: transition: all, an entrance that starts slow (ease-in), scale(0), a layout property that animates,
          an animated page with no reduced-motion rule, a data-enter variant the kit does not have. The gate blocks on these.
    WARN  fix it, or keep it on purpose and say why in the report: a hover slower than 400ms, linear on a UI step, a
          curve that overshoots, an endless animation with no pause button, a staggered list.
    INFO  look at it.
  Each finding has an id (motion-transition-all, motion-ease-in, ...), a count, examples (file:line and the code), a fix
  and, in --json, every hit. --json prints {files: [...]} and nothing else.
  Exit 0 no FAIL, 1 a FAIL in any file, 2 usage or an unreadable file.
*/
import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const die = (m) => { console.error('motion-lint: ' + m); process.exit(2); };
const files = [];
let asJson = false, KIND = '', KIT = false;
for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (a === '--json') asJson = true;
  else if (a === '--kit') KIT = true;
  else if (a === '--kind' || a === '--page') { KIND = String(args[++i] || '').toLowerCase(); if (!/^(tech|software|gaming|product|place|service)$/.test(KIND)) die('--kind takes tech, software, gaming, product, place or service'); }
  else if (a.startsWith('--')) die('unknown option ' + a);
  else files.push(a);
}
if (!files.length) die('usage: motion-lint.mjs <page.html | folder | .css | .js> [more] [--kind <kind>] [--json] [--kit]');

// the hero entrances the kit has (assets/motion/meta.json, entrances); "" and "off" are the default and the scene's hero
const ENTRANCES = new Set(['', 'rise', 'set-type', 'focus', 'exposure', 'aperture', 'line-blocks', 'doors', 'product-at-work', 'still', 'off']);
const NEEDS_PICTURE = new Set(['exposure', 'aperture', 'set-type']);
const LAYOUT = /^(width|height|min-width|min-height|max-width|max-height|top|left|right|bottom|inset|inset-[a-z-]+|margin|margin-[a-z-]+|padding|padding-[a-z-]+|block-size|inline-size|font-size|line-height|border-width|grid-template-[a-z]+)$/;
const clip = (s, n = 110) => { s = s.replace(/\s+/g, ' ').trim(); return s.length > n ? s.slice(0, n - 1) + '…' : s; };

// ---------------------------------------------------------------- reading
const lineAt = (src, i) => { let n = 1; for (let k = 0; k < i && k < src.length; k++) if (src.charCodeAt(k) === 10) n++; return n; };
// comments become spaces of the same length, so every offset still points at its line
const blankComments = (s) => s.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '));

/** CSS rules: { sel, decls, at, line } (nested rules get their parent's selector), and the @keyframes: { name, body, line } */
function parseCss(src, where, base = 1) {
  const s = blankComments(src), rules = [], frames = [];
  const walk = (from, to, sel, at) => {
    let i = from, start = from;
    while (i < to) {
      const c = s[i];
      if (c === '{') {
        const pre = s.slice(start, i).trim();
        let d = 1, j = i + 1;
        for (; j < to && d; j++) { if (s[j] === '{') d++; else if (s[j] === '}') d--; }
        const end = j - 1, line = base + lineAt(s, start + (s.slice(start, i).length - s.slice(start, i).trimStart().length)) - 1;
        if (/^@(-webkit-)?keyframes\b/i.test(pre)) frames.push({ name: pre.replace(/^@\S+\s*/, '').trim(), body: s.slice(i + 1, end), line, where });
        else if (pre.startsWith('@')) walk(i + 1, end, sel, (at ? at + ' ' : '') + pre);
        else {
          const own = pre.includes('&') || !sel ? pre : pre.split(',').map((p) => sel + ' ' + p.trim()).join(', ');
          const inner = s.slice(i + 1, end);
          // the declarations are the text outside any nested block
          let decls = '', dd = 0;
          for (const ch of inner) { if (ch === '{') dd++; if (!dd) decls += ch; if (ch === '}') dd--; }
          rules.push({ sel: own.replace(/&/g, sel || ''), decls, at: at || '', line, where });
          if (inner.includes('{')) walk(i + 1, end, own, at);
        }
        i = j; start = j; continue;
      }
      if (c === ';' || c === '}') start = i + 1;
      i++;
    }
  };
  walk(0, s.length, '', '');
  return { rules, frames, text: s };
}
const declsOf = (txt) => txt.split(';').map((d) => d.trim()).filter(Boolean).map((d) => { const k = d.indexOf(':'); return k < 0 ? null : [d.slice(0, k).trim().toLowerCase(), d.slice(k + 1).trim()]; }).filter(Boolean);
const splitTop = (v) => { const out = []; let d = 0, cur = ''; for (const ch of v) { if (ch === '(') d++; if (ch === ')') d--; if (ch === ',' && !d) { out.push(cur); cur = ''; } else cur += ch; } out.push(cur); return out.map((x) => x.trim()).filter(Boolean); };
const ms = (t) => { const m = String(t).match(/^(-?[\d.]+)(ms|s)$/i); return m ? parseFloat(m[1]) * (m[2].toLowerCase() === 's' ? 1000 : 1) : null; };
const EASING = /^(ease|ease-in|ease-out|ease-in-out|linear|step-start|step-end)$|^(cubic-bezier|steps|linear)\(/i;
/** one item of a transition or animation shorthand: { prop|name, dur, delay, ease, count } */
function shorthand(item) {
  const toks = item.match(/[a-z-]+\([^)]*\)|[^\s]+/gi) || [];
  const o = { first: '', dur: null, delay: null, ease: '', count: '' };
  for (const t of toks) {
    const m = ms(t);
    if (m != null) { if (o.dur == null) o.dur = m; else o.delay = m; }
    else if (EASING.test(t)) o.ease = t;
    else if (/^(infinite|\d+(\.\d+)?)$/i.test(t)) o.count = t;
    else if (!o.first && !/^(normal|reverse|alternate|alternate-reverse|none|forwards|backwards|both|running|paused|var\(.*)$/i.test(t)) o.first = t;
  }
  return o;
}
// ease-in: starts slow and ends fast (the slope at the start under .6, at the end over 1.5); overshoot: y outside 0..1
function curve(e) {
  if (!e) return '';
  if (/^ease-in$/i.test(e)) return 'in';
  const m = e.match(/^cubic-bezier\(\s*([-\d.]+)\s*,\s*([-\d.]+)\s*,\s*([-\d.]+)\s*,\s*([-\d.]+)\s*\)$/i);
  if (!m) return '';
  const [x1, y1, x2, y2] = m.slice(1).map(Number);
  if (y1 < 0 || y1 > 1 || y2 < 0 || y2 > 1) return 'over';
  const s0 = x1 > 0 ? y1 / x1 : 9, s1 = x2 < 1 ? (1 - y2) / (1 - x2) : 9;
  return s0 < 0.6 && s1 > 1.5 ? 'in' : '';
}
const isZeroScale = (v) => /\bscale\(\s*0(\.0+)?\s*(,\s*0(\.0+)?\s*)?\)|\bscale3d\(\s*0\s*,\s*0\b/i.test(v);
const UI_SEL = /:(hover|focus|focus-visible|focus-within|active)\b|\b(btn|button|nav|menu|tab|link|chip|pill|switch|check|field|input|select|toggle)\b/i;
const MEDIA_SEL = /\b(img|video|picture|frame__img|tile__media|m-zoom)\b/i;
const LOOP_SEL = /data-m-loop|data-ui|data-moment|data-fx|data-big-scene|\.loop|spinner|caret|marquee|ticker/i;
const ENTRANCE_SEL = /data-enter|m-enter|m-rv|is-entering|data-moment|data-scene|data-big-scene/i;

// ---------------------------------------------------------------- one source of CSS
function lintCss(src, where, base, F, ctx) {
  const { rules, frames } = parseCss(src, where, base);
  const hit = (id, r, code) => F(id, `${r.where}:${r.line}`, code);
  const named = new Map(frames.map((f) => [f.name, f]));
  const endlessSel = new Set(rules.filter((r) => /infinite/i.test(r.decls)).map((r) => r.sel));
  for (const r of rules) {
    const ds = declsOf(r.decls);
    if (r.at.includes('prefers-reduced-motion') && /reduce/.test(r.at)) continue;   // the reduced rules stop motion; they are no fault
    for (const [k, v] of ds) {
      const show = `${clip(r.sel, 60)} { ${k}: ${clip(v, 60)} }`;
      if (k === 'transition' || k === 'transition-property') {
        const items = k === 'transition' ? splitTop(v).map(shorthand) : splitTop(v).map((p) => ({ first: p }));
        for (const it of items) {
          const p = (it.first || (k === 'transition' && it.dur != null ? 'all' : '')).toLowerCase();
          if (p === 'all') hit('motion-transition-all', r, show);
          else if (LAYOUT.test(p)) hit('motion-layout', r, show);
          if (k !== 'transition') continue;
          const c = curve(it.ease);
          if (c === 'in') hit('motion-ease-in-ui', r, show);
          if (c === 'over') hit('motion-overshoot', r, show);
          // (a 0s step, a visibility or display flip, has no curve to see)
          if (/^linear$/i.test(it.ease) && it.dur !== 0 && !/^(visibility|display|content-visibility|overlay)$/.test(p) && UI_SEL.test(r.sel) && !LOOP_SEL.test(r.sel)) hit('motion-linear-ui', r, show);
          if (it.dur > 400 && UI_SEL.test(r.sel) && !MEDIA_SEL.test(r.sel) && !MEDIA_SEL.test(p) && !ENTRANCE_SEL.test(r.sel)) hit('motion-slow-ui', r, show);
        }
      }
      if (k === 'transition-timing-function' || k === 'animation-timing-function') {
        const c = curve(v.trim());
        if (c === 'in') hit(k.startsWith('anim') ? 'motion-ease-in' : 'motion-ease-in-ui', r, show);
        if (c === 'over') hit('motion-overshoot', r, show);
      }
      if (k === 'animation' || k === 'animation-name') {
        ctx.animates = true;
        for (const it of (k === 'animation' ? splitTop(v).map(shorthand) : splitTop(v).map((n) => ({ first: n })))) {
          const c = curve(it.ease);
          if (c === 'in') hit('motion-ease-in', r, show);
          if (c === 'over') hit('motion-overshoot', r, show);
          const inf = /infinite/i.test(it.count) || /animation-iteration-count\s*:\s*infinite/i.test(r.decls);
          if (inf && !LOOP_SEL.test(r.sel) && !/data-m-loop|data-ui-loop/.test(r.sel)) ctx.endless.push({ at: `${r.where}:${r.line}`, code: show });
          const f = named.get(it.first);
          if (f) f.used = true;
        }
      }
      // a positive delay per nth-child on something that plays once (a negative one, or one on a loop, only sets a loop's phase)
      if (k === 'animation-delay' && /nth-child|nth-of-type/.test(r.sel) && !/^-/.test(v.trim()) && !endlessSel.has(r.sel.replace(/:nth-(child|of-type)\([^)]*\)/g, ''))) hit('motion-stagger', r, show);
      if (k === 'animation-delay' || k === 'transition-delay') { if (/var\(--(i|index|n|idx|delay-i)\)|calc\([^)]*var\(--(i|index|n|idx)\)/.test(v)) hit('motion-stagger', r, show); }
      if ((k === 'transform' || k === 'scale') && (isZeroScale(v) || (k === 'scale' && /^0(\.0+)?$/.test(v.trim())))) {
        // a scale(0) at rest under a state that never changes is no motion; one beside a transition or in a hidden state is
        if (/transition|animation/.test(r.decls) || /:not\(|is-|\[data-|:hover|:checked|aria-/.test(r.sel)) hit('motion-scale-zero', r, show);
      }
    }
  }
  for (const f of frames) {
    ctx.animates = true;
    const ds = [];
    // the declarations of every keyframe step
    f.body.replace(/\{([^}]*)\}/g, (_, d) => { ds.push(...declsOf(d)); return ''; });
    const bad = [...new Set(ds.filter(([k]) => LAYOUT.test(k)).map(([k]) => k))];
    if (bad.length) F('motion-layout', `${f.where}:${f.line}`, `@keyframes ${f.name} animates ${bad.join(', ')}`);
    if (ds.some(([k, v]) => (k === 'transform' && isZeroScale(v)) || (k === 'scale' && /^0(\.0+)?$/.test(v.trim())))) F('motion-scale-zero', `${f.where}:${f.line}`, `@keyframes ${f.name} starts or ends at scale 0`);
    for (const [k, v] of ds) if (k === 'animation-timing-function') { const c = curve(v); if (c === 'in') F('motion-ease-in', `${f.where}:${f.line}`, `@keyframes ${f.name}: ${k}: ${v}`); }
  }
  if (/prefers-reduced-motion/.test(src)) ctx.reduced = true;
}

// ---------------------------------------------------------------- one script
function lintJs(src, where, base, F, ctx) {
  const s = blankComments(src).replace(/(^|[^:])\/\/[^\n]*/g, (m, a) => a + ' '.repeat(m.length - a.length));
  const at = (i) => `${where}:${base + lineAt(s, i) - 1}`;
  const each = (re, fn) => { for (const m of s.matchAll(re)) fn(m); };
  if (/prefers-reduced-motion/.test(s)) ctx.reduced = true;
  // Web Animations: el.animate([...keyframes], {duration, easing})
  each(/\.animate\(\s*(\[[\s\S]{0,600}?\]|\{[\s\S]{0,300}?\})\s*,\s*(\{[\s\S]{0,300}?\}|\d+)/g, (m) => {
    ctx.animates = true;
    const kf = m[1], opt = m[2];
    const keys = [...kf.matchAll(/([a-zA-Z]+)\s*:/g)].map((k) => k[1].replace(/[A-Z]/g, (c) => '-' + c.toLowerCase()));
    const bad = [...new Set(keys.filter((k) => LAYOUT.test(k)))];
    if (bad.length) F('motion-layout', at(m.index), `animate() moves ${bad.join(', ')}`);
    if (/(?<![a-z-])scale\(\s*0\s*\)|(?<![a-z-])scale\s*:\s*['"]?0['"]?\s*[,}]/i.test(kf)) F('motion-scale-zero', at(m.index), clip(m[0], 90));
    const e = (opt.match(/easing\s*:\s*['"`]([^'"`]+)['"`]/) || [])[1];
    const c = curve((e || '').trim());
    if (c === 'in') F('motion-ease-in', at(m.index), `animate(..., { easing: '${e}' })`);
    if (c === 'over') F('motion-overshoot', at(m.index), `animate(..., { easing: '${e}' })`);
    if (/iterations\s*:\s*Infinity/.test(opt)) ctx.endless.push({ at: at(m.index), code: clip(m[0], 90) });
  });
  // style writes: el.style.transition = 'all ...'; el.style.height = ... inside an animation frame
  each(/\.style\.transition\s*=\s*['"`]([^'"`]*)['"`]/g, (m) => {
    for (const it of splitTop(m[1]).map(shorthand)) {
      const p = (it.first || (it.dur != null ? 'all' : '')).toLowerCase();
      if (p === 'all') F('motion-transition-all', at(m.index), clip(m[0], 90));
      else if (LAYOUT.test(p)) F('motion-layout', at(m.index), clip(m[0], 90));
      if (curve(it.ease) === 'in') F('motion-ease-in-ui', at(m.index), clip(m[0], 90));
    }
  });
  each(/requestAnimationFrame\s*\(([\s\S]{0,500}?)\)/g, (m) => {
    const w = m[1].match(/\.style\.(width|height|top|left|right|bottom|margin\w*|padding\w*)\s*=/);
    if (w) F('motion-layout', at(m.index), `an animation frame writes style.${w[1]}`);
  });
  // GSAP: an ease that starts slow on a from() or to() entrance, a scale of 0, a staggered list
  each(/gsap\.(from|to|fromTo)\s*\(([\s\S]{0,400}?)\)/g, (m) => {
    ctx.animates = true;
    if (/ease\s*:\s*['"`][a-z0-9]+\.in['"`]/i.test(m[2])) F('motion-ease-in', at(m.index), clip(m[0], 90));
    if (/\bscale\s*:\s*0\s*[,}]/.test(m[2])) F('motion-scale-zero', at(m.index), clip(m[0], 90));
    if (/\bstagger\s*:/.test(m[2]) && /\bscrollTrigger\b/.test(m[2])) F('motion-stagger', at(m.index), clip(m[0], 90));
    if (/\b(width|height|top|left|margin\w*|padding\w*)\s*:/.test(m[2].replace(/scrollTrigger\s*:\s*\{[^}]*\}/, ''))) F('motion-layout', at(m.index), clip(m[0], 90));
  });
  // a delay that grows with the index: a staggered list (delay: i * 80, `${i * 0.1}s`)
  each(/(delay|animationDelay|transitionDelay)\s*[:=]\s*[^,;}\n]*\b(i|index|idx|n|k)\s*\*\s*[\d.]+/g, (m) => {
    // the lines of a headline, its words, a number's digits and a hero's steps may follow one another
    if (!/\b(enter|hero|lines?|words?|digits?|steps?|blocks?)\b/i.test(s.slice(Math.max(0, m.index - 600), m.index))) F('motion-stagger', at(m.index), clip(m[0], 90));
  });
  each(/\b(lenis|locomotive-scroll|LocomotiveScroll|ScrollSmoother)\b/g, (m) => F('motion-scroll-library', at(m.index), m[0]));
}

// ---------------------------------------------------------------- one file
const RULES = {
  'motion-transition-all': ['FAIL', 'transition: all (or a shorthand with no property) animates whatever changes next, layout included', 'name the properties: transition: transform 150ms var(--m-ease), opacity 150ms var(--m-ease)'],
  'motion-ease-in': ['FAIL', 'an entrance or animation that starts slow and ends hard (ease-in): it feels late, then lands with a thud', 'use var(--m-ease-enter) for an entrance, var(--m-ease) for a UI step'],
  'motion-scale-zero': ['FAIL', 'something grows from scale 0: nothing in the world appears from nothing', 'start at scale .9 to .96 with opacity 0, or let it fade'],
  'motion-layout': ['FAIL', 'a layout property animates (width, height, top, left, margin, padding): every frame reflows the page and the neighbours jump', 'move it with transform (translate, scale) or a clip-path, and fade with opacity'],
  'motion-no-reduced': ['FAIL', 'the page animates on its own but has no prefers-reduced-motion rule', 'add @media (prefers-reduced-motion: reduce) { ... } that shows the finished frame: animation: none, transition-property: opacity, color'],
  'motion-enter-variant': ['FAIL', 'a hero data-enter value the kit does not have, or one that needs a picture the hero lacks', 'use one of the entrances in assets/motion/meta.json (rise, set-type, focus, exposure, aperture, line-blocks, doors, product-at-work, still), as dealt'],
  'motion-scroll-library': ['FAIL', 'a smooth-scroll library takes the scroll from the visitor', 'delete it: the page scrolls natively; a moment holds its section with position: sticky'],
  'motion-ease-in-ui': ['WARN', 'a UI transition that starts slow (ease-in): the control seems to hesitate', 'var(--m-ease): a fast start and a soft landing'],
  'motion-slow-ui': ['WARN', 'a hover, focus or press transition over 400ms: the control answers late', '150ms in and 120ms out (--m-in, --m-out); a menu 200ms; only a photograph may take 600ms'],
  'motion-linear-ui': ['WARN', 'linear timing on a UI step: it starts and stops like a machine', 'linear is for loops and drifts; a step takes var(--m-ease)'],
  'motion-overshoot': ['WARN', 'a curve that passes its mark (a y value outside 0 to 1): a bounce', 'no bounce on a page; a spring only for a thing the hand moves (a switch knob), at most 2% past the mark'],
  'motion-endless': ['WARN', 'an animation that never ends, outside a card loop, and no pause button on the page', 'run it 1 to 2 times, or put it in a [data-m-loop] panel (motion.js adds its pause button)'],
  'motion-endless-info': ['INFO', 'an animation that never ends (judged on the page that links this file: a pause button, or a card loop)', ''],
  'motion-no-reduced-info': ['INFO', 'no prefers-reduced-motion rule in this file (judged on the page that links it)', ''],
  'motion-stagger': ['WARN', 'a list that comes in item after item (a delay per nth-child or per index)', 'one entrance per group: the heading rises (motion.js does it), the list is simply there'],
};
function lint(file) {
  const raw = fs.readFileSync(file, 'utf8');
  const ext = path.extname(file).toLowerCase(), dir = path.dirname(file);
  const found = new Map();
  const F = (id, where, code) => { if (!found.has(id)) found.set(id, []); found.get(id).push({ where, code }); };
  const ctx = { animates: false, reduced: false, endless: [], paused: false, kind: KIND };
  const rel = (p) => path.relative(process.cwd(), p).split(path.sep).join('/') || p;
  if (ext === '.css') lintCss(raw, rel(file), 1, F, ctx);
  else if (ext === '.js' || ext === '.mjs') lintJs(raw, rel(file), 1, F, ctx);
  else {
    const html = raw.replace(/<!--[\s\S]*?-->/g, (m) => m.replace(/[^\n]/g, ' '));
    const where = rel(file);
    ctx.kind = KIND || ((html.match(/<html\b[^>]*\bdata-type="([a-z]+)"/i) || [])[1] || '').toLowerCase();
    for (const m of html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)) lintCss(m[1], where, lineAt(html, m.index), F, ctx);
    for (const m of html.matchAll(/\sstyle\s*=\s*("([^"]*)"|'([^']*)')/gi)) lintCss(`x{${m[2] ?? m[3]}}`, where, lineAt(html, m.index), F, ctx);
    for (const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
      if (/\bsrc\s*=/.test(m[1]) || /type\s*=\s*["']?(application\/(ld\+)?json|importmap|text\/template)/i.test(m[1])) continue;
      lintJs(m[2], where, lineAt(html, m.index), F, ctx);
    }
    // the page's own linked files, from its folder (the kit under assets/ is linted on its own, unless --kit)
    const linked = [...html.matchAll(/<link\b[^>]*rel=["']?stylesheet[^>]*>/gi)].map((m) => ['css', (m[0].match(/href=["']([^"']+)["']/i) || [])[1]])
      .concat([...html.matchAll(/<script\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi)].map((m) => ['js', m[1]]));
    for (const [t, href] of linked) {
      if (!href || /^(https?:)?\/\//i.test(href) || href.startsWith('data:')) { if (href && /lenis|locomotive/i.test(href)) F('motion-scroll-library', where, href); continue; }
      const p = path.resolve(dir, href.split(/[?#]/)[0]);
      const kit = /(^|\/)assets\//.test(href.replace(/\\/g, '/'));
      if (kit && !KIT) { if (/motion\.(css|js)$/.test(href)) ctx.reduced = true; continue; }
      let txt = ''; try { txt = fs.readFileSync(p, 'utf8'); } catch { continue; }
      if (t === 'css') lintCss(txt, rel(p), 1, F, ctx); else lintJs(txt, rel(p), 1, F, ctx);
    }
    ctx.paused = /class=["'][^"']*\bloop-pause\b|aria-label=["'](Pause|Play)\b|ui\.pausable\(|data-m-loop/i.test(html);
    // the hero's entrance: a variant the kit has, and the picture it needs
    const hero = html.match(/<section\b[^>]*\bclass=["'][^"']*\bhero\b[^"']*["'][^>]*>/i);
    const ev = hero && hero[0].match(/\bdata-enter(?:\s*=\s*["']([^"']*)["'])?/i);
    if (ev) {
      const v = (ev[1] || '').trim();
      const at = `${where}:${lineAt(html, hero.index)}`;
      if (!ENTRANCES.has(v)) F('motion-enter-variant', at, `data-enter="${v}"`);
      else if (NEEDS_PICTURE.has(v)) {
        const end = html.indexOf('</section>', hero.index);
        if (!/<(img|picture|video)\b/i.test(html.slice(hero.index, end < 0 ? undefined : end))) F('motion-enter-variant', at, `data-enter="${v}" with no photograph in the hero`);
      }
    }
  }
  // a page is judged whole; a lone .css or .js file has no page round it, so these two are only told (INFO)
  const page = !['.css', '.js', '.mjs'].includes(ext);
  if (ctx.endless.length && !ctx.paused) for (const e of ctx.endless) F(page ? 'motion-endless' : 'motion-endless-info', e.at, e.code);
  if (ctx.animates && !ctx.reduced) F(page ? 'motion-no-reduced' : 'motion-no-reduced-info', rel(file), 'animations, and no prefers-reduced-motion anywhere in its CSS or scripts');
  const findings = [...found].map(([id, hits]) => {
    const [sev, msg, fix] = RULES[id];
    return { sev, id, count: hits.length, msg, fix, examples: hits.slice(0, 4).map((h) => `${h.where}  ${h.code}`), hits };
  });
  const order = { FAIL: 0, WARN: 1, INFO: 2 };
  findings.sort((a, b) => order[a.sev] - order[b.sev]);
  return { file, kind: ctx.kind || null, findings };
}

// ---------------------------------------------------------------- run
const paths = files.map((f) => { try { return fs.statSync(f).isDirectory() ? path.join(f, 'index.html') : f; } catch { return f; } });
const results = [];
for (const f of paths) { try { results.push(lint(f)); } catch (e) { die(`cannot read ${f}: ${e.message}`); } }
const failed = results.some((r) => r.findings.some((f) => f.sev === 'FAIL'));
if (asJson) console.log(JSON.stringify({ files: results }, null, 1));
else {
  for (const r of results) {
    const n = (s) => r.findings.filter((f) => f.sev === s).length;
    console.log(`\n== ${r.file}  (motion)  ${n('FAIL')} FAIL, ${n('WARN')} WARN`);
    for (const f of r.findings) {
      console.log(`  ${f.sev.padEnd(4)} ${f.id.padEnd(20)} ${f.count} x ${f.msg}`);
      for (const e of f.examples) console.log(`       - ${e}`);
      if (f.fix && f.sev !== 'INFO') console.log(`       fix: ${f.fix}`);
    }
  }
}
process.exit(failed ? 1 : 0);

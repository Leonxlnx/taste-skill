import path from 'node:path';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const directory = fileURLToPath(new URL('../assets/motion/parts/', import.meta.url));
export function partFixture(target) {
  if (!target || /^https?:/i.test(target)) return false;
  const file = /^file:/i.test(target) ? fileURLToPath(target) : path.resolve(target);
  const local = path.relative(directory,file).split(path.sep).join('/');
  const fixture = /^([a-z][a-z-]+)\/(?:demo|phone)\.html$/.exec(local);
  return Boolean(fixture && existsSync(path.join(directory, fixture[1], 'meta.json')));
}

// Executed inside the page by both browser checks. These documents demonstrate
// interactions in isolation. Their navigation, media and viewport must still work.
export function inspectParts() {
  const findings = [];
  const fail = (rule, where, detail) => findings.push({rule, where, detail, sev:'FAIL'});
  const parts = [...document.querySelectorAll('[data-part]')];
  if (!parts.length) fail('missing-part','main','No interaction specimen rendered.');
  if (document.documentElement.scrollWidth > document.documentElement.clientWidth + 1)
    fail('off-viewport','body','The document scrolls horizontally.');
  for (const image of document.images) if (image.complete && !image.naturalWidth)
    fail('assets',image.getAttribute('src'),'The image failed to load.');
  for (const a of document.querySelectorAll('a[href^="#"]')) {
    if (a.hash && !document.getElementById(decodeURIComponent(a.hash.slice(1)))) fail('links',a.hash,'Missing destination.');
  }
  for (const b of document.querySelectorAll('button')) if (b.getClientRects().length && !b.textContent.trim() && !b.getAttribute('aria-label') && !b.getAttribute('aria-labelledby'))
    fail('a11y-name','button','Visible button has no accessible name.');
  for (const part of parts) {
    const frame = part.querySelector('.part-frame');
    if (!frame || !frame.getClientRects().length) continue;
    const r = frame.getBoundingClientRect();
    if (r.width < 1 || r.height < 1) fail('visual-empty',part.dataset.part,'Empty interaction frame.');
    if (['logo-row','feature-tabs','demo-loop'].includes(part.dataset.part) && !frame.querySelector('.loop-pause'))
      fail('loop-pause',part.dataset.part,'Missing playback control.');
  }
  return findings;
}

import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const componentRoot = path.join(root, 'components', 'react-swipeable-list');
const item = await readFile(path.join(componentRoot, 'SwipeableListItem.tsx'), 'utf8');
const itemCss = await readFile(
  path.join(componentRoot, 'SwipeableListItem.css'),
  'utf8',
);
const action = await readFile(path.join(componentRoot, 'SwipeAction.tsx'), 'utf8');
const actionCss = await readFile(path.join(componentRoot, 'SwipeAction.css'), 'utf8');

assert.match(item, /touchcancel/);
assert.match(item, /pointercancel/);
assert.match(item, /window\.addEventListener\('blur'/);
assert.match(item, /removeGlobalDragListeners/);
assert.match(item, /cancelAnimationFrame/);
assert.match(item, /resizeObserver\?\.disconnect/);

assert.match(item, /event\.key === 'Escape'/);
assert.match(item, /'ArrowLeft'/);
assert.match(item, /'ArrowRight'/);
assert.match(item, /aria-hidden=\{!actionsRevealed\}/);
assert.match(item, /inert=\{!actionsRevealed\}/);
assert.match(item, /focusFirstAction/);
assert.match(item, /focusRevealButton/);
assert.match(item, /aria-live="polite"/);
assert.match(action, /Tag = 'button'/);
assert.match(action, /type=\{isNativeButton \? 'button' : undefined\}/);
assert.match(action, /tabIndex=\{actionsRevealed \? 0 : -1\}/);

assert.match(item, /this\.isRtl \? 'trailing' : 'leading'/);
assert.match(item, /this\.isRtl \? 'leading' : 'trailing'/);
assert.match(itemCss, /inset-inline-start: 0/);
assert.match(itemCss, /inset-inline-end: 0/);
assert.match(itemCss, /:dir\(rtl\)/);

assert.match(itemCss, /touch-action: pan-y/);
assert.match(itemCss, /min-width: 44px/);
assert.match(itemCss, /min-height: 44px/);
assert.match(itemCss, /@media \(prefers-reduced-motion: reduce\)/);
assert.match(itemCss, /animation: none/);
assert.match(itemCss, /transition: none/);
assert.match(actionCss, /@media \(prefers-reduced-motion: reduce\)/);
assert.equal((action.match(/window\.setTimeout/g) ?? []).length, 1);
assert.match(action, /window\.clearTimeout/);

const sourceFiles = (await readdir(componentRoot)).filter((file) =>
  /\.(?:css|d\.ts|ts|tsx)$/.test(file),
);
const secretPattern =
  /-----BEGIN (?:RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----|\b(?:AKIA|ASIA)[A-Z0-9]{16}\b|\bsk-(?:proj-)?[A-Za-z0-9_-]{20,}\b/;
const remoteAssetPattern =
  /(?:src|srcset|poster|url\()\s*[:=(]?\s*["']?https?:\/\//i;

for (const file of sourceFiles) {
  const content = await readFile(path.join(componentRoot, file), 'utf8');
  assert.doesNotMatch(content, secretPattern, `${file} contains a possible secret`);
  assert.doesNotMatch(
    content,
    remoteAssetPattern,
    `${file} contains a remote runtime asset`,
  );
  assert.doesNotMatch(content, /[ \t]+$/m, `${file} has trailing whitespace`);
  assert.ok(content.endsWith('\n'), `${file} must end with a newline`);
}

console.log('react-swipeable-list: interaction and source checks passed');

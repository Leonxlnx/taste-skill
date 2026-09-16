import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

import { analyzeRecords, analyzeTargets, collectSourceFiles } from '../tools/lib/taste-check.mjs';

function rules(result) {
  return result.findings.map(item => item.ruleId);
}

test('clean source passes deterministic checks', () => {
  const result = analyzeRecords([{ file: 'page.tsx', content: `
    export function Page() {
      return <section className="hero min-h-[100dvh]">
        <h1>Build interfaces people remember</h1>
        <p>Strong hierarchy, careful motion, and useful details.</p>
        <div><a href="/start">Start building</a><a href="/work">See work</a></div>
      </section>;
    }
  ` }], { cwd: '/' });

  assert.equal(result.summary.errors, 0);
});

test('reports every em-dash with stable line and column', () => {
  const result = analyzeRecords([{ file: 'page.tsx', content: '<h1>Hello — world</h1>\n<p>Again — here</p>' }], { cwd: '/' });
  const matches = result.findings.filter(item => item.ruleId === 'no-em-dash');

  assert.equal(matches.length, 2);
  assert.deepEqual(matches.map(item => [item.line, item.column]), [[1, 11], [2, 10]]);
});

test('ignores em-dashes in source comments', () => {
  const result = analyzeRecords([{ file: 'page.tsx', content: `
    // explanation — not rendered
    /* another — comment */
    export const Page = () => <p>Rendered copy</p>;
  ` }], { cwd: '/' });

  assert.equal(rules(result).includes('no-em-dash'), false);
});

test('detects viewport and direct-scroll implementation violations', () => {
  const result = analyzeRecords([{ file: 'hero.tsx', content: `
    export function Hero() {
      window.addEventListener('scroll', syncHero);
      return <section className="hero h-screen">Hello</section>;
    }
  ` }], { cwd: '/' });

  assert.ok(rules(result).includes('no-h-screen'));
  assert.ok(rules(result).includes('no-scroll-listener'));
});

test('groups CTA siblings while enforcing the four-block hero limit', () => {
  const passing = analyzeRecords([{ file: 'hero.tsx', content: `
    <section className="hero">
      <span className="eyebrow">New release</span>
      <h1><span>Intentional</span> interfaces</h1>
      <p>Make the first screen clear and memorable.</p>
      <div className="actions"><a href="/start">Start</a><button>Demo</button></div>
    </section>
  ` }], { cwd: '/' });
  assert.equal(rules(passing).includes('hero-max-four-text-blocks'), false);

  const failing = analyzeRecords([{ file: 'hero.tsx', content: `
    <section id="hero">
      <span className="eyebrow">New release</span>
      <h1>Intentional interfaces</h1>
      <p>Make the first screen clear.</p>
      <small>Ships today</small>
      <div className="actions"><a href="/start">Start</a><button>Demo</button></div>
    </section>
  ` }], { cwd: '/' });
  const finding = failing.findings.find(item => item.ruleId === 'hero-max-four-text-blocks');
  assert.ok(finding);
  assert.match(finding.detail, /eyebrow, h1, p, small, cta-group/);
});

test('enforces the 20-word hero paragraph limit only inside marked heroes', () => {
  const long = 'one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen twenty twentyone';
  const result = analyzeRecords([{ file: 'page.html', content: `
    <section class="hero"><h1>Title</h1><p>${long}</p></section>
    <section><p>${long}</p></section>
  ` }], { cwd: '/' });

  assert.equal(result.findings.filter(item => item.ruleId === 'hero-subtext-word-limit').length, 1);
});

test('does not treat hero-prefixed descendants as separate hero roots', () => {
  const long = 'one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen twenty twentyone';
  const result = analyzeRecords([{ file: 'page.tsx', content: `
    <section className="hero">
      <div className="hero-copy"><p>${long}</p></div>
    </section>
  ` }], { cwd: '/' });

  assert.equal(result.findings.filter(item => item.ruleId === 'hero-subtext-word-limit').length, 1);
});

test('detects multiple design-system families across project files', () => {
  const result = analyzeRecords([
    { file: 'material.tsx', content: "import '@material/web/button/filled-button.js';" },
    { file: 'fluent.tsx', content: "import { Button } from '@fluentui/react-components';" }
  ], { cwd: '/' });

  const finding = result.findings.find(item => item.ruleId === 'one-design-system');
  assert.ok(finding);
  assert.match(finding.message, /Material, Fluent UI/);
});

test('detects Bootstrap from package.json when mixed with another design system', () => {
  const result = analyzeRecords([
    { file: 'package.json', content: '{"dependencies":{"bootstrap":"^5.3.0","@fluentui/react-components":"latest"}}' }
  ], { cwd: '/' });

  const finding = result.findings.find(item => item.ruleId === 'one-design-system');
  assert.ok(finding);
  assert.match(finding.message, /Fluent UI, Bootstrap|Bootstrap, Fluent UI/);
});

test('counts Next Link siblings as one CTA group', () => {
  const result = analyzeRecords([{ file: 'hero.tsx', content: `
    <section className="hero">
      <span className="eyebrow">New release</span>
      <h1>Intentional interfaces</h1>
      <p>Make the first screen clear.</p>
      <small>Available now</small>
      <div className="actions"><Link href="/start">Start</Link><Link href="/work">Work</Link></div>
    </section>
  ` }], { cwd: '/' });

  const finding = result.findings.find(item => item.ruleId === 'hero-max-four-text-blocks');
  assert.ok(finding);
  assert.match(finding.detail, /cta-group/);
});

test('MDX fenced examples are ignored by structural hero checks', () => {
  const result = analyzeRecords([{ file: 'docs.mdx', content: `
# Example

\`\`\`tsx
<section className="hero">
  <span className="eyebrow">One</span><h1>Two</h1><p>Three</p><small>Four</small><button>Five</button>
</section>
\`\`\`
  ` }], { cwd: '/' });

  assert.equal(rules(result).includes('hero-max-four-text-blocks'), false);
});

test('Markdown documentation does not trigger design-system mixing', () => {
  const result = analyzeRecords([{ file: 'README.md', content: 'Compare @material/web with @fluentui/react-components.' }], { cwd: '/' });
  assert.equal(rules(result).includes('one-design-system'), false);
});

test('directory collection skips generated and dependency directories', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'taste-check-'));
  await writeFile(path.join(root, 'page.tsx'), '<main>ok</main>');
  await mkdir(path.join(root, 'node_modules'));
  await writeFile(path.join(root, 'node_modules', 'bad.tsx'), '<main>—</main>');
  await mkdir(path.join(root, 'dist'));
  await writeFile(path.join(root, 'dist', 'bad.html'), '<main>—</main>');

  const records = await collectSourceFiles([root]);
  assert.deepEqual(records.map(record => path.basename(record.file)), ['page.tsx']);
});

test('CLI returns 1 for findings, 0 for clean input, and supports JSON output', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'taste-check-cli-'));
  const cli = path.resolve('tools/taste-check.mjs');
  await writeFile(path.join(root, 'bad.html'), '<section class="hero"><h1>Bad — copy</h1></section>');

  const bad = spawnSync(process.execPath, [cli, root, '--format', 'json'], { encoding: 'utf8' });
  assert.equal(bad.status, 1);
  const parsed = JSON.parse(bad.stdout);
  assert.equal(parsed.summary.errors, 1);
  assert.equal(parsed.findings[0].ruleId, 'no-em-dash');

  await writeFile(path.join(root, 'bad.html'), '<section class="hero"><h1>Good copy</h1></section>');
  const clean = spawnSync(process.execPath, [cli, root], { encoding: 'utf8' });
  assert.equal(clean.status, 0);
  assert.match(clean.stdout, /Taste pre-flight: PASS/);
  assert.match(clean.stdout, /Manual Section 14 checks are still required/);
});

test('analyzeTargets reports supported files using relative paths', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'taste-check-targets-'));
  const file = path.join(root, 'page.html');
  await writeFile(file, '<p>Quietly in use at teams everywhere</p>');
  const result = await analyzeTargets([root], { cwd: root });

  assert.equal(result.summary.files, 1);
  assert.equal(result.findings[0].file, 'page.html');
  assert.equal(result.findings[0].ruleId, 'no-ai-tell-copy');
});

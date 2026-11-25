#!/usr/bin/env node
// photos.mjs fetch turns a downloaded JPEG into WebP with ffmpeg (toWebp). The file must be a whole RIFF container:
// its size field is the file's length minus 8 and its chunks end at the end of the file. ffmpeg writing to a pipe
// left the size at 0 and 4 stray bytes on every WebP over 32 KB, and Chrome showed a broken image (#224).
//   node tests/photos-webp.mjs        (skipped when ffmpeg is not on the path)
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const hasFfmpeg = (() => { try { return spawnSync('ffmpeg', ['-version'], { stdio: 'ignore' }).status === 0; } catch { return false; } })();
if (!hasFfmpeg) { console.log('ok - skipped (no ffmpeg on the path)'); process.exit(0); }

const { toWebp } = await import('../skills/taste-skill/scripts/photos.mjs');

// what a WebP decoder checks first: RIFF size = length - 8, then chunks that end exactly at the end of the file
const riffProblem = (b) => {
  if (b.toString('latin1', 0, 4) !== 'RIFF' || b.toString('latin1', 8, 12) !== 'WEBP') return 'not a RIFF WEBP file';
  if (b.readUInt32LE(4) !== b.length - 8) return `RIFF size ${b.readUInt32LE(4)}, file length - 8 is ${b.length - 8}`;
  let at = 12;
  while (at + 8 <= b.length) { const n = b.readUInt32LE(at + 4); at += 8 + n + (n & 1); }
  return at === b.length ? null : `chunks end at byte ${at} of ${b.length}`;
};

const tmp = mkdtempSync(join(tmpdir(), 'taste-skill-webp-test-'));
const bad = [];
try {
  // a flat test card (a WebP of a few KB, under ffmpeg's 32 KB write buffer) and a Mandelbrot set (about 80 KB, over it,
  // and still a quarter of its JPEG, so toWebp keeps it)
  const cases = [
    ['small', 'testsrc=size=640x480:rate=1'],
    ['large', 'mandelbrot=size=1600x1200'],
  ];
  for (const [name, src] of cases) {
    const jpg = join(tmp, name + '.jpg');
    const r = spawnSync('ffmpeg', ['-loglevel', 'error', '-y', '-f', 'lavfi', '-i', src, '-frames:v', '1', '-q:v', '2', jpg]);
    if (r.status !== 0) { bad.push(`${name}: ffmpeg could not make the test JPEG`); continue; }
    const jpeg = readFileSync(jpg);
    const webp = toWebp(jpeg);
    if (!webp) { bad.push(`${name}: toWebp returned nothing for a ${Math.round(jpeg.length / 1024)} KB JPEG`); continue; }
    const problem = riffProblem(webp);
    if (problem) bad.push(`${name} (${Math.round(webp.length / 1024)} KB WebP): ${problem}`);
  }
} finally {
  rmSync(tmp, { recursive: true, force: true });
}
if (bad.length) {
  console.error('not ok - photos.mjs toWebp wrote a WebP a browser cannot decode:');
  for (const b of bad) console.error('  ' + b);
  process.exit(1);
}
console.log('ok - toWebp writes whole WebP files (RIFF size and chunk ends match the file), small and large');

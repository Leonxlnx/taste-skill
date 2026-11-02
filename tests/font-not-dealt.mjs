import assert from 'node:assert/strict';
import { test } from 'node:test';
import { checkFonts } from '../skills/taste-skill/scripts/lib/font-check.mjs';

// Test the font-not-dealt check logic using the actual implementation
// This test verifies that the check warns when ANY dealt font is missing,
// not only when ALL dealt fonts are missing.

test('font-not-dealt: warns when only one of two dealt fonts is missing', () => {
  const dealtFonts = ['Outfit', 'Figtree'];
  const usedFamilies = [
    { family: 'Outfit', share: 0.6 },
    { family: 'system-ui', share: 0.4 },
  ];

  const missing = checkFonts(dealtFonts, usedFamilies);

  // Should detect Figtree as missing (only Outfit is used)
  assert.equal(missing.length, 1, 'Should detect one missing font');
  assert.equal(missing[0], 'Figtree', 'Should identify Figtree as missing');
});

test('font-not-dealt: warns when all dealt fonts are missing', () => {
  const dealtFonts = ['Outfit', 'Figtree'];
  const usedFamilies = [
    { family: 'system-ui', share: 0.6 },
    { family: 'sans-serif', share: 0.4 },
  ];

  const missing = checkFonts(dealtFonts, usedFamilies);

  assert.equal(missing.length, 2, 'Should detect both missing fonts');
  assert.deepEqual(missing.sort(), ['Figtree', 'Outfit'].sort(), 'Should identify both as missing');
});

test('font-not-dealt: warns when only display font is used but text font is missing', () => {
  const dealtFonts = ['Outfit', 'Figtree'];
  const usedFamilies = [
    { family: 'Outfit', share: 0.9 },
    { family: 'system-ui', share: 0.1 },
  ];

  const missing = checkFonts(dealtFonts, usedFamilies);

  assert.equal(missing.length, 1, 'Should detect Figtree as missing');
  assert.equal(missing[0], 'Figtree', 'Should identify Figtree as missing');
});

test('font-not-dealt: no warning when all dealt fonts are present', () => {
  const dealtFonts = ['Outfit', 'Figtree'];
  const usedFamilies = [
    { family: 'Outfit', share: 0.6 },
    { family: 'Figtree', share: 0.4 },
  ];

  const missing = checkFonts(dealtFonts, usedFamilies);

  assert.equal(missing.length, 0, 'Should not report any missing fonts when all are present');
});

test('font-not-dealt: case insensitive and handles variable suffix', () => {
  const dealtFonts = ['Outfit Variable', 'Figtree'];
  const usedFamilies = [
    { family: 'outfit', share: 0.6 },
    { family: 'FIGTREE', share: 0.4 },
  ];

  const missing = checkFonts(dealtFonts, usedFamilies);

  assert.equal(missing.length, 0, 'Should match case-insensitively and handle variable suffix');
});

test('font-not-dealt: single dealt font (app mode)', () => {
  const dealtFonts = ['Outfit'];
  const usedFamilies = [
    { family: 'system-ui', share: 0.6 },
    { family: 'sans-serif', share: 0.4 },
  ];

  const missing = checkFonts(dealtFonts, usedFamilies);

  assert.equal(missing.length, 1, 'Should detect missing single font');
  assert.equal(missing[0], 'Outfit', 'Should identify Outfit as missing');
});

test('font-not-dealt: ignores fonts below 10% share threshold', () => {
  const dealtFonts = ['Outfit', 'Figtree'];
  const usedFamilies = [
    { family: 'Outfit', share: 0.05 }, // Below 10% threshold
    { family: 'Figtree', share: 0.95 },
  ];

  const missing = checkFonts(dealtFonts, usedFamilies);

  // Outfit at 5% share should be ignored, Figtree at 95% should count
  assert.equal(missing.length, 1, 'Should only report Outfit as missing (below threshold)');
  assert.equal(missing[0], 'Outfit', 'Should identify Outfit as missing due to low share');
});


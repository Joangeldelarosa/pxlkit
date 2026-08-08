import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateIcon, gridToSignature, jaccard, parseIconSource } from '../check-icon.mjs';
import { gridToSvg, gridToAscii } from '../render-icon.mjs';

/** A well-formed 16x16 icon with a readable, mid-density silhouette. */
function makeIcon(overrides = {}) {
  const grid = Array.from({ length: 16 }, (_, y) =>
    y >= 4 && y <= 11 ? `....GGGGGGGG....` : '.'.repeat(16),
  );
  return {
    name: 'fire-sword',
    size: 16,
    category: 'ui',
    grid,
    palette: { G: '#00FF88' },
    tags: ['sword', 'weapon'],
    ...overrides,
  };
}

test('accepts a well-formed icon', () => {
  assert.deepEqual(validateIcon(makeIcon(), []).errors, []);
});

test('rejects a row with the wrong length', () => {
  const icon = makeIcon();
  icon.grid = [...icon.grid.slice(1), '.'.repeat(15)];
  assert.match(validateIcon(icon, []).errors.join(' '), /16/);
});

test('rejects a grid char missing from the palette', () => {
  const icon = makeIcon();
  icon.grid = icon.grid.map((r) => r.replace(/G/g, 'X'));
  assert.match(validateIcon(icon, []).errors.join(' '), /palette/i);
});

test('rejects a name that is not kebab-case', () => {
  assert.match(validateIcon(makeIcon({ name: 'FireSword' }), []).errors.join(' '), /kebab/i);
});

test('rejects a dot key in the palette', () => {
  const icon = makeIcon({ palette: { G: '#00FF88', '.': '#000000' } });
  assert.match(validateIcon(icon, []).errors.join(' '), /reserved|transparent/i);
});

test('rejects an invalid hex colour', () => {
  assert.match(validateIcon(makeIcon({ palette: { G: 'lime' } }), []).errors.join(' '), /hex/i);
});

test('rejects a fully transparent palette entry', () => {
  assert.match(validateIcon(makeIcon({ palette: { G: '#00FF8800' } }), []).errors.join(' '), /opacity/i);
});

test('rejects a size outside the allowed set', () => {
  assert.match(validateIcon(makeIcon({ size: 20 }), []).errors.join(' '), /size/i);
});

test('warns but does not fail on a near-duplicate without shared tags', () => {
  // Direction families (arrow-up vs arrow-down) overlap by design.
  const icon = makeIcon();
  const known = [{ name: 'arrow-up', pack: 'ui', tags: ['arrow', 'up'], signature: gridToSignature(icon.grid) }];
  const result = validateIcon(icon, known);
  assert.deepEqual(result.errors, []);
  assert.match(result.warnings.join(' '), /similar/i);
});

test('fails on a near-duplicate that also shares a semantic tag', () => {
  const icon = makeIcon();
  const known = [{ name: 'blade', pack: 'ui', tags: ['sword'], signature: gridToSignature(icon.grid) }];
  const result = validateIcon(icon, known);
  assert.match(result.errors.join(' '), /duplicate/i);
});

test('fails on a name already used in the same pack', () => {
  const icon = makeIcon({ category: 'ui' });
  const known = [{ name: 'fire-sword', pack: 'ui', tags: [], signature: 'f'.repeat(64) }];
  assert.match(validateIcon(icon, known).errors.join(' '), /already exists/i);
});

test('allows the same name in a different pack — packs are namespaces', () => {
  // The shipped set relies on this: `heart` exists in gamification and social,
  // `clock` and `lock` in ui and feedback.
  const icon = makeIcon({ category: 'ui' });
  const known = [{ name: 'fire-sword', pack: 'gamification', tags: [], signature: 'f'.repeat(64) }];
  assert.deepEqual(validateIcon(icon, known).errors, []);
});

test('re-validating a shipped icon does not report it as its own duplicate', () => {
  // Every existing file is in the shipped corpus; self-match must be silent.
  const icon = makeIcon({ category: 'ui' });
  const known = [
    { name: 'fire-sword', pack: 'ui', tags: ['sword', 'weapon'], signature: gridToSignature(icon.grid) },
  ];
  assert.deepEqual(validateIcon(icon, known).errors, []);
});

test('warns when the silhouette is nearly empty', () => {
  const grid = Array.from({ length: 16 }, (_, y) => (y === 0 ? 'G'.repeat(2) + '.'.repeat(14) : '.'.repeat(16)));
  assert.match(validateIcon(makeIcon({ grid }), []).warnings.join(' '), /lit/i);
});

test('validates each frame of an animated icon', () => {
  const good = makeIcon();
  const icon = {
    ...good,
    grid: undefined,
    frames: [{ grid: good.grid }, { grid: [...good.grid.slice(1), '.'.repeat(15)] }],
    frameDuration: 120,
    trigger: 'loop',
  };
  assert.match(validateIcon(icon, []).errors.join(' '), /frame 2/);
});

test('rejects an unknown animation trigger', () => {
  const good = makeIcon();
  const icon = { ...good, grid: undefined, frames: [{ grid: good.grid }], frameDuration: 120, trigger: 'spin' };
  assert.match(validateIcon(icon, []).errors.join(' '), /trigger/i);
});

// --- signature parity with the CI gate ---

test('signature is 64 hex chars for a 16x16 grid', () => {
  assert.equal(gridToSignature(makeIcon().grid).length, 64);
});

test('jaccard scores identical grids as 1 and disjoint grids as 0', () => {
  const a = ['G'.repeat(16), ...Array(15).fill('.'.repeat(16))];
  const b = [...Array(15).fill('.'.repeat(16)), 'G'.repeat(16)];
  assert.equal(jaccard(gridToSignature(a), gridToSignature(a)), 1);
  assert.equal(jaccard(gridToSignature(a), gridToSignature(b)), 0);
});

// --- source parsing ---

test('parses an icon out of TypeScript source', () => {
  const source = `import type { PxlKitData } from '@pxlkit/core';

export const Check: PxlKitData = {
  name: 'check',
  size: 16,
  category: 'ui',
  grid: [
${Array.from({ length: 16 }, () => "    '................',").join('\n')}
  ],
  palette: { G: '#00FF88' },
  tags: ['check', 'done'],
};`;
  const [icon] = parseIconSource(source);
  assert.equal(icon.name, 'check');
  assert.equal(icon.size, 16);
  assert.equal(icon.category, 'ui');
  assert.equal(icon.grid.length, 16);
  assert.deepEqual(icon.palette, { G: '#00FF88' });
  assert.deepEqual(icon.tags, ['check', 'done']);
});

// --- rendering ---

test('renders merged horizontal runs as single rects', () => {
  const rows = ['GGGG' + '.'.repeat(12), ...Array(15).fill('.'.repeat(16))];
  const svg = gridToSvg(rows, { G: '#00FF88' });
  assert.match(svg, /viewBox="0 0 16 16"/);
  assert.match(svg, /shape-rendering="crispEdges"/);
  // Four adjacent pixels must become one rect of width 4, not four rects.
  assert.match(svg, /<rect x="0" y="0" width="4" height="1" fill="#00FF88"\/>/);
  assert.equal((svg.match(/<rect/g) ?? []).length, 1);
});

test('splits runs when the colour changes', () => {
  const rows = ['GGRR' + '.'.repeat(12), ...Array(15).fill('.'.repeat(16))];
  const svg = gridToSvg(rows, { G: '#00FF88', R: '#FF0000' });
  assert.equal((svg.match(/<rect/g) ?? []).length, 2);
});

test('ascii preview uses two columns per pixel so it reads square', () => {
  const rows = ['G' + '.'.repeat(15), ...Array(15).fill('.'.repeat(16))];
  const ascii = gridToAscii(rows);
  assert.equal(ascii.split('\n').length, 16);
  assert.equal(ascii.split('\n')[0].length, 32);
});

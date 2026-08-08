import { test } from 'node:test';
import assert from 'node:assert/strict';
import { findRawPaletteClasses } from '../token-purity.mjs';
import { extractUiKitImports, parseDiversityMenu, THRESHOLDS } from '../count-diversity.mjs';

// --- token purity ---

test('flags a raw Tailwind palette class', () => {
  const hits = findRawPaletteClasses('<div className="bg-slate-800 p-4" />');
  assert.equal(hits.length, 1);
  assert.match(hits[0].match, /bg-slate-800/);
});

test('accepts retro tokens', () => {
  assert.equal(findRawPaletteClasses('<div className="bg-retro-surface" />').length, 0);
});

test('flags an inline hex colour in JSX', () => {
  assert.equal(findRawPaletteClasses('<div style={{ color: "#ff0000" }} />').length, 1);
});

test('does not flag hex inside an icon palette definition', () => {
  // Icon data is hex by design; flagging it would make the check unusable.
  assert.equal(findRawPaletteClasses("palette: { G: '#00FF88' }").length, 0);
});

test('does not flag hex anywhere in an icon file', () => {
  assert.equal(findRawPaletteClasses("const c = '#00FF88';", 'src/icons/check.ts').length, 0);
});

test('does not flag hex in a CSS variable declaration', () => {
  assert.equal(findRawPaletteClasses('  --retro-green: #00FF88;').length, 0);
});

test('ignores palette names inside comments', () => {
  assert.equal(findRawPaletteClasses('// never use bg-slate-800 here').length, 0);
});

test('does not flag non-colour utilities that share a palette name', () => {
  // `gap-4` and `p-4` carry no colour, so they are irrelevant to theming.
  assert.equal(findRawPaletteClasses('<div className="gap-4 p-4 grid-cols-3" />').length, 0);
});

test('flags colour utilities beyond bg and text', () => {
  const hits = findRawPaletteClasses('<div className="border-red-500 ring-blue-300 fill-emerald-600" />');
  assert.equal(hits.length, 3);
});

test('reports 1-indexed line numbers', () => {
  const hits = findRawPaletteClasses('line one\nline two\n<div className="text-zinc-400" />');
  assert.equal(hits[0].line, 3);
});

// --- diversity ---

test('extracts named imports from the kit', () => {
  const names = extractUiKitImports("import { PixelButton, PixelCard } from '@pxlkit/ui-kit';");
  assert.deepEqual([...names].sort(), ['PixelCard', 'PixelButton'].sort());
});

test('handles multi-line import blocks', () => {
  const source = `import {
  PixelButton,
  PixelCard,
  PixelBento,
} from '@pxlkit/ui-kit';`;
  assert.equal(extractUiKitImports(source).size, 3);
});

test('counts an aliased import under its real component name', () => {
  const names = extractUiKitImports("import { PixelButton as Btn } from '@pxlkit/ui-kit';");
  assert.ok(names.has('PixelButton'));
  assert.ok(!names.has('Btn'));
});

test('ignores type-only specifiers — importing a props type is not using the component', () => {
  const names = extractUiKitImports("import { type PixelButtonProps, PixelCard } from '@pxlkit/ui-kit';");
  assert.ok(!names.has('PixelButtonProps'));
  assert.ok(names.has('PixelCard'));
});

test('ignores imports from other packages', () => {
  assert.equal(extractUiKitImports("import { PxlKitIcon } from '@pxlkit/core';").size, 0);
});

test('does not let earlier imports swallow the first component of the kit block', () => {
  // Regression: a lazy `[\s\S]*?` walks past the closing brace of these earlier
  // imports and starts its match at line 1, which glues `PixelButton` to the
  // preceding text and drops it while every later name still parses.
  const source = `import { PxlKitIcon, AnimatedPxlKitIcon } from '@pxlkit/core';
import { ArrowRight, Check } from '@pxlkit/ui';
import { Trophy, Crown } from '@pxlkit/gamification';
import {
  PixelButton,
  PixelBadge,
  PixelCard,
} from '@pxlkit/ui-kit';`;
  const names = extractUiKitImports(source);
  assert.ok(names.has('PixelButton'), 'first component of the block must be counted');
  assert.deepEqual([...names].sort(), ['PixelBadge', 'PixelButton', 'PixelCard']);
  // And nothing from the other packages leaks in.
  assert.ok(!names.has('Trophy'));
  assert.ok(!names.has('PxlKitIcon'));
});

test('parses the generated diversity menu into categories and tiers', () => {
  const md = `## actions

- **PixelBareButton** \`[underused]\` — no template uses it yet
- **PixelButton** \`[core]\` — 5 templates: dashboard, docs

## cards

- **PixelFeatureCard** \`[distinctive]\` — 1 template: landing-full`;
  const menu = parseDiversityMenu(md);
  assert.equal(menu.get('PixelBareButton').tier, 'underused');
  assert.equal(menu.get('PixelBareButton').category, 'actions');
  assert.equal(menu.get('PixelButton').tier, 'core');
  assert.equal(menu.get('PixelFeatureCard').category, 'cards');
});

test('thresholds are ordered so a landing demands more than a simple page', () => {
  assert.ok(THRESHOLDS.landing.distinct > THRESHOLDS.dashboard.distinct);
  assert.ok(THRESHOLDS.dashboard.distinct > THRESHOLDS.page.distinct);
});

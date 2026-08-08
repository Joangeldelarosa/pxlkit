#!/usr/bin/env node
/**
 * Token purity check.
 *
 * pxlkit's whole visual identity lives in the `--retro-*` variables. A single
 * `bg-slate-800` is invisible in a diff and unmistakable on screen: it is the one
 * pixel of the page that does not follow the theme, does not flip with dark mode,
 * and does not change when the user re-skins. This is the same rule the repo's own
 * gate 20 (`theme-token-usage`) enforces on the kit's source, applied to generated
 * output.
 *
 * Usage:
 *   node token-purity.mjs <file-or-dir>...
 *
 * Exit 0 when clean, 1 when raw palette usage is found.
 */

import fs from 'node:fs';
import path from 'node:path';

/** Tailwind's built-in palette families. `retro-*` is deliberately absent. */
const TAILWIND_PALETTES = [
  'slate', 'gray', 'grey', 'zinc', 'neutral', 'stone',
  'red', 'orange', 'amber', 'yellow', 'lime', 'green', 'emerald',
  'teal', 'cyan', 'sky', 'blue', 'indigo', 'violet', 'purple',
  'fuchsia', 'pink', 'rose',
].join('|');

/** Utilities that take a colour. Others (`p-4`, `gap-2`) are unaffected by theming. */
const COLOR_UTILITIES = [
  'bg', 'text', 'border', 'ring', 'outline', 'divide', 'from', 'via', 'to',
  'shadow', 'accent', 'caret', 'decoration', 'fill', 'stroke', 'placeholder',
].join('|');

const RAW_CLASS_RE = new RegExp(
  `\\b(?:${COLOR_UTILITIES})-(?:${TAILWIND_PALETTES})-\\d{2,3}\\b`,
  'g',
);

/** A hex colour written straight into JSX or a style object. */
const INLINE_HEX_RE = /#[0-9a-fA-F]{3,8}\b/g;

/**
 * Lines that legitimately contain hex colours.
 *
 * Icon data is the obvious one: a `PxlKitData` palette is *supposed* to be hex, and
 * flagging it would make this check useless in any project that authors icons. The
 * others are places where a hex is data rather than styling.
 */
/**
 * Contexts where a hex literal is data or a documented requirement, not styling.
 *
 * `color=` as a JSX prop is deliberately allowed while `color:` in a style object is
 * not. PxlKitIcon renders through an `<img>` and therefore cannot inherit
 * `currentColor`, so passing an explicit colour is the kit's documented contract —
 * whereas `style={{ color: '#f00' }}` is exactly the theme bypass this check exists
 * to catch.
 */
const HEX_ALLOWED_RE =
  /palette\s*:|monoColor|PxlKitData|AnimatedPxlKitData|--retro-|@theme|:root|\.dark\b|\.light\b|\bcolor=|[A-Za-z_]*(?:HEX|Hex|COLOR|Color)\s*=[^=]|[Mm]askImage|mask-image/;

/**
 * Files whose colours are data or demo scaffolding, not product styling.
 *
 * A colour-picker's tests are full of hex by necessity; example and story files
 * exist to show a component against arbitrary backgrounds. Flagging them would
 * bury the one finding that matters under dozens that never will.
 */
const NON_PRODUCT_FILE_RE = /(^|[\\/])__tests__[\\/]|\.(?:test|spec|stories|examples)\.[tj]sx?$/;

/**
 * Finds raw palette classes and inline hex colours in a source string.
 *
 * @returns One entry per offence: `{ line, match, kind }`, 1-indexed lines.
 */
export function findRawPaletteClasses(source, filename = '') {
  const hits = [];
  // Icon definition files are hex by nature — exempt wholesale.
  const isIconFile = /(^|[\\/])icons?[\\/]/.test(filename) || /\.icon\.[tj]sx?$/.test(filename);
  const isNonProduct = NON_PRODUCT_FILE_RE.test(filename);
  const hexExempt = isIconFile || isNonProduct;

  const lines = source.split('\n');
  lines.forEach((text, index) => {
    // Skip comment-only lines: a mention in prose is not a style.
    const trimmed = text.trim();
    if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*')) return;

    for (const m of text.matchAll(RAW_CLASS_RE)) {
      hits.push({ line: index + 1, match: m[0], kind: 'raw-palette-class' });
    }

    if (hexExempt || HEX_ALLOWED_RE.test(text)) return;
    for (const m of text.matchAll(INLINE_HEX_RE)) {
      hits.push({ line: index + 1, match: m[0], kind: 'inline-hex' });
    }
  });

  return hits;
}

const SCANNED_EXT = new Set(['.tsx', '.jsx', '.ts', '.js', '.mjs', '.css']);

function collectFiles(target, acc = []) {
  const stat = fs.statSync(target);
  if (stat.isFile()) {
    if (SCANNED_EXT.has(path.extname(target))) acc.push(target);
    return acc;
  }
  for (const entry of fs.readdirSync(target, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name.startsWith('.')) continue;
    collectFiles(path.join(target, entry.name), acc);
  }
  return acc;
}

function main() {
  const targets = process.argv.slice(2).filter((a) => !a.startsWith('--'));
  if (targets.length === 0) {
    console.error('usage: node token-purity.mjs <file-or-dir>...');
    process.exit(2);
  }

  let total = 0;
  for (const target of targets) {
    if (!fs.existsSync(target)) {
      console.error(`token-purity: no such path: ${target}`);
      process.exit(2);
    }
    for (const file of collectFiles(target)) {
      const hits = findRawPaletteClasses(fs.readFileSync(file, 'utf8'), file);
      for (const hit of hits) {
        console.log(`${file}:${hit.line}  ${hit.match}  (${hit.kind})`);
        total += 1;
      }
    }
  }

  if (total === 0) {
    console.log('token-purity: clean — only retro tokens in use.');
    process.exit(0);
  }
  console.log(
    `\ntoken-purity: ${total} offence(s). Replace with retro tokens ` +
      '(bg-retro-surface, text-retro-text, border-retro-border, text-retro-{green,cyan,gold,red,purple,pink}) ' +
      'so the colour follows the theme and survives a re-skin.',
  );
  process.exit(1);
}

const invokedDirectly =
  process.argv[1] && import.meta.url === new URL(`file://${path.resolve(process.argv[1])}`).href;
if (invokedDirectly) main();

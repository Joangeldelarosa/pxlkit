#!/usr/bin/env node
/**
 * Pre-flight validator for a new pxlkit icon.
 *
 * A strict superset of the two validators that exist in the repo:
 *   validate-icons.js       the CI gate — blocks publish, regex over file text
 *   validateIconData()      @pxlkit/core — normative, stricter, runtime
 *
 * Running this before writing the file means an icon never reaches CI in a state
 * the gate would reject.
 *
 * On duplicates it deliberately departs from both. The CI gate warns at Jaccard
 * ≥0.93 on silhouette alone, which fires on families that overlap by design —
 * arrow-up against arrow-down, the social pack's faces. Treating that as an error
 * would block legitimate icons. Here a high overlap is an error only when the two
 * icons *also* share a semantic tag; otherwise it is a warning worth a look.
 *
 * Usage:
 *   node check-icon.mjs <icon-file.ts> [--json]
 *
 * Exit 0 when the icon would pass, 1 when it would not.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const VALID_SIZES = [8, 16, 24, 32, 48, 64];
const HEX_RE = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/;
const NAME_RE = /^[a-z][a-z0-9-]*$/;
/** Above this the silhouettes are effectively the same shape. */
const SHAPE_OVERLAP_THRESHOLD = 0.93;

/** Packs occupancy into hex, 4 pixels per char. Mirrors the generator and the CI gate. */
export function gridToSignature(rows) {
  const bits = rows.join('');
  let hex = '';
  for (let i = 0; i < bits.length; i += 4) {
    let nibble = 0;
    for (let b = 0; b < 4; b += 1) {
      const char = bits[i + b];
      if (char !== undefined && char !== '.') nibble |= 1 << (3 - b);
    }
    hex += nibble.toString(16);
  }
  return hex;
}

function signatureToBits(signature) {
  const bits = [];
  for (const char of signature) {
    const nibble = Number.parseInt(char, 16);
    if (Number.isNaN(nibble)) return [];
    for (let b = 0; b < 4; b += 1) bits.push((nibble & (1 << (3 - b))) !== 0);
  }
  return bits;
}

/** |A ∩ B| / |A ∪ B| over lit pixels. Identical to `similarity()` in validate-icons.js. */
export function jaccard(sigA, sigB) {
  if (sigA.length !== sigB.length) return 0;
  const a = signatureToBits(sigA);
  const b = signatureToBits(sigB);
  if (a.length !== b.length) return 0;
  let intersection = 0;
  let union = 0;
  for (let i = 0; i < a.length; i += 1) {
    if (a[i] && b[i]) intersection += 1;
    if (a[i] || b[i]) union += 1;
  }
  return union === 0 ? 1 : intersection / union;
}

/**
 * Validates one icon object against every rule both validators enforce.
 *
 * @param icon   a PxlKitData / AnimatedPxlKitData-shaped object
 * @param known  existing shapes to compare against, `[{name, tags, signature}]`
 * @returns `{ errors: string[], warnings: string[], info: string[] }`
 */
export function validateIcon(icon, known = []) {
  const errors = [];
  const warnings = [];
  const info = [];

  if (!icon || typeof icon !== 'object') {
    return { errors: ['icon is not an object'], warnings, info };
  }

  // --- name ---
  if (typeof icon.name !== 'string' || !NAME_RE.test(icon.name)) {
    errors.push(`name must be non-empty kebab-case matching /^[a-z][a-z0-9-]*$/. Got: ${JSON.stringify(icon.name)}`);
  }

  // --- size ---
  const size = icon.size;
  if (!VALID_SIZES.includes(size)) {
    errors.push(`size must be one of ${VALID_SIZES.join(', ')}. Got: ${JSON.stringify(size)}`);
  }
  if (size !== 16) {
    info.push(`size is ${size}; every shipped pack uses 16, and the CI gate only accepts 16x16.`);
  }

  // --- category ---
  if (typeof icon.category !== 'string' || icon.category.trim().length === 0) {
    errors.push('category must be a non-empty string (the pack id).');
  }

  // --- palette ---
  const palette = icon.palette ?? {};
  if (typeof palette !== 'object' || Array.isArray(palette)) {
    errors.push('palette must be an object mapping single characters to hex colours.');
  } else {
    for (const [key, value] of Object.entries(palette)) {
      if (key === '.') {
        errors.push('"." is reserved for transparent pixels and must not appear in the palette.');
      }
      if (key.length !== 1) {
        errors.push(`palette key must be a single character. Got: "${key}"`);
      }
      if (typeof value !== 'string' || !HEX_RE.test(value)) {
        errors.push(`palette["${key}"] is not a valid hex colour: ${JSON.stringify(value)}. Expected #RGB, #RRGGBB or #RRGGBBAA.`);
      } else if (value.length === 9 && value.slice(7, 9).toLowerCase() === '00') {
        errors.push(`palette["${key}"] has zero opacity. Use "." for transparent pixels instead.`);
      }
    }
  }

  // --- frames ---
  const frames = Array.isArray(icon.frames)
    ? icon.frames.map((f, i) => ({ grid: f?.grid, palette: f?.palette, label: ` frame ${i + 1}` }))
    : [{ grid: icon.grid, palette: undefined, label: '' }];

  if (Array.isArray(icon.frames)) {
    if (icon.frames.length === 0) errors.push('frames must not be empty.');
    if (typeof icon.frameDuration !== 'number' || icon.frameDuration <= 0) {
      errors.push(`frameDuration must be a positive number of milliseconds. Got: ${JSON.stringify(icon.frameDuration)}`);
    }
    const TRIGGERS = ['loop', 'once', 'hover', 'appear', 'ping-pong'];
    if (icon.trigger !== undefined && !TRIGGERS.includes(icon.trigger)) {
      errors.push(`trigger must be one of ${TRIGGERS.join(', ')}. Got: ${JSON.stringify(icon.trigger)}`);
    }
  }

  const expected = VALID_SIZES.includes(size) ? size : 16;
  let litTotal = 0;
  let cellTotal = 0;

  for (const frame of frames) {
    const rows = frame.grid;
    if (!Array.isArray(rows)) {
      errors.push(`${frame.label || 'grid'}: missing grid.`);
      continue;
    }
    if (rows.length !== expected) {
      errors.push(`${frame.label ? `${frame.label}:` : ''} grid has ${rows.length} rows (expected ${expected}).`);
    }
    rows.forEach((row, index) => {
      if (typeof row !== 'string' || row.length !== expected) {
        errors.push(
          `${frame.label ? `${frame.label} ` : ''}row ${index + 1} has ${typeof row === 'string' ? row.length : '?'} chars (expected ${expected}).`,
        );
      }
    });

    const framePalette = { ...palette, ...(frame.palette ?? {}) };
    const used = new Set(rows.join('').split('').filter((c) => c !== '.'));
    for (const char of used) {
      if (!framePalette[char]) {
        errors.push(`${frame.label ? `${frame.label} ` : ''}grid char "${char}" is missing from the palette.`);
      }
    }

    litTotal += rows.join('').split('').filter((c) => c !== '.').length;
    cellTotal += rows.join('').length;
  }

  // --- quality signals (never errors) ---
  if (cellTotal > 0) {
    const density = litTotal / cellTotal;
    if (density < 0.08) {
      warnings.push(`only ${(density * 100).toFixed(1)}% of the grid is lit — the shape may read as empty at 16px.`);
    } else if (density > 0.65) {
      warnings.push(`${(density * 100).toFixed(1)}% of the grid is lit — the shape may read as a solid block.`);
    }
  }
  if (Object.keys(palette).length === 1) {
    info.push('single-colour palette — fine for glyphs, but shading usually reads better at this size.');
  }

  // --- duplicates ---
  const primary = frames[0]?.grid;
  if (Array.isArray(primary) && errors.length === 0) {
    const signature = gridToSignature(primary);
    const tags = new Set(Array.isArray(icon.tags) ? icon.tags : []);
    for (const other of known) {
      if (!other?.signature) continue;
      if (other.name === icon.name) {
        // Same name *and* same pixels means this is the icon itself, seen in the
        // shipped corpus — which is what happens every time an existing file is
        // re-validated. Only a name reused for a different shape is a collision.
        if (other.signature === signature) continue;
        // Packs are namespaces, and the shipped set uses that deliberately: `heart`
        // exists in both gamification and social, `clock` and `lock` in both ui and
        // feedback. A name only collides within the pack it is being added to.
        if (other.pack && icon.category && other.pack !== icon.category) continue;
        errors.push(`an icon named "${icon.name}" already exists in pack "${other.pack ?? '?'}".`);
        continue;
      }
      const score = jaccard(signature, other.signature);
      if (score < SHAPE_OVERLAP_THRESHOLD) continue;

      const sharedTags = (other.tags ?? []).filter((t) => tags.has(t));
      if (sharedTags.length > 0) {
        errors.push(
          `silhouette is ${score.toFixed(2)} similar to "${other.name}" (${other.pack ?? '?'}) and they share the tag(s) ${sharedTags.join(', ')} — this is a duplicate, not a variant. Change the shape or the concept.`,
        );
      } else {
        warnings.push(
          `silhouette is ${score.toFixed(2)} similar to "${other.name}" (${other.pack ?? '?'}), but no tags overlap — likely a legitimate family member (arrows, faces). Confirm it reads differently at 16px.`,
        );
      }
    }
  }

  return { errors, warnings, info };
}

/** Loads the shipped shapes the plugin carries, if present. */
function loadKnownShapes() {
  const candidates = [];
  if (process.env.CLAUDE_PLUGIN_ROOT) {
    candidates.push(path.join(process.env.CLAUDE_PLUGIN_ROOT, 'references', 'icon-shapes.generated.json'));
  }
  const here = path.dirname(fileURLToPath(import.meta.url));
  candidates.push(path.join(here, '..', 'references', 'icon-shapes.generated.json'));
  for (const file of candidates) {
    try {
      const parsed = JSON.parse(fs.readFileSync(file, 'utf8'));
      return Array.isArray(parsed) ? parsed : (parsed.icons ?? parsed.shapes ?? []);
    } catch {
      // try next
    }
  }
  return [];
}

/**
 * Extracts icon objects from a TypeScript source file.
 *
 * The file cannot simply be imported: it is TypeScript, and in a consumer project
 * there is no build step to hand. Instead the object literals are parsed out of the
 * text, the same approach the CI gate takes.
 */
export function parseIconSource(source) {
  const icons = [];
  const nameRe = /name\s*:\s*['"]([^'"]+)['"]/g;
  for (const nameMatch of source.matchAll(nameRe)) {
    const start = nameMatch.index;
    const slice = source.slice(start);

    const size = /size\s*:\s*(\d+)/.exec(slice);
    const category = /category\s*:\s*['"]([^'"]+)['"]/.exec(slice);
    const tagsBlock = /tags\s*:\s*\[([\s\S]*?)\]/.exec(slice);
    const frameDuration = /frameDuration\s*:\s*(\d+)/.exec(slice);
    const trigger = /trigger\s*:\s*['"]([^'"]+)['"]/.exec(slice);

    // Union of *every* palette block in the file, which is what the CI gate does.
    // Taking only the first is wrong for two real shapes: an animated icon whose
    // frames carry their own palettes, and a parallax icon whose layers each define
    // one. Either would report perfectly valid characters as missing.
    const palette = {};
    for (const block of source.matchAll(/palette\s*:\s*\{([\s\S]*?)\}/g)) {
      for (const entry of block[1].matchAll(/['"]?([^\s'":,]{1})['"]?\s*:\s*['"]([^'"]+)['"]/g)) {
        if (!(entry[1] in palette)) palette[entry[1]] = entry[2];
      }
    }

    const grids = [...slice.matchAll(/grid\s*:\s*\[([\s\S]*?)\]/g)].map((m) =>
      [...m[1].matchAll(/['"]([^'"]*)['"]/g)].map((r) => r[1]),
    );
    const isAnimated = /frames\s*:\s*\[/.test(slice.slice(0, slice.indexOf('grid')));

    if (grids.length === 0) continue;

    icons.push({
      name: nameMatch[1],
      size: size ? Number(size[1]) : undefined,
      category: category ? category[1] : undefined,
      palette,
      tags: tagsBlock ? [...tagsBlock[1].matchAll(/['"]([^'"]+)['"]/g)].map((t) => t[1]) : [],
      ...(isAnimated && grids.length > 1
        ? {
            frames: grids.map((grid) => ({ grid })),
            frameDuration: frameDuration ? Number(frameDuration[1]) : undefined,
            ...(trigger ? { trigger: trigger[1] } : {}),
          }
        : { grid: grids[0] }),
    });
    break; // one icon per file is the convention
  }
  return icons;
}

function main() {
  const argv = process.argv.slice(2);
  const asJson = argv.includes('--json');
  const file = argv.find((a) => !a.startsWith('--'));

  if (!file) {
    console.error('usage: node check-icon.mjs <icon-file.ts> [--json]');
    process.exit(2);
  }
  if (!fs.existsSync(file)) {
    console.error(`check-icon: no such file: ${file}`);
    process.exit(2);
  }

  const icons = parseIconSource(fs.readFileSync(file, 'utf8'));
  if (icons.length === 0) {
    console.error(`check-icon: no icon definition found in ${file} (expected a grid: [...] block).`);
    process.exit(1);
  }

  const known = loadKnownShapes();
  const results = icons.map((icon) => ({ icon: icon.name, ...validateIcon(icon, known) }));
  const failed = results.some((r) => r.errors.length > 0);

  if (asJson) {
    console.log(JSON.stringify({ file, knownShapes: known.length, results, ok: !failed }, null, 2));
    process.exit(failed ? 1 : 0);
  }

  for (const result of results) {
    console.log(`check-icon — ${result.icon} (${file})`);
    for (const e of result.errors) console.log(`  ✗ ${e}`);
    for (const w of result.warnings) console.log(`  ⚠ ${w}`);
    for (const i of result.info) console.log(`  · ${i}`);
    if (result.errors.length === 0) console.log(`  ✓ would pass validate-icons.js and validateIconData()`);
  }
  console.log(`\ncompared against ${known.length} shipped icon(s).`);
  process.exit(failed ? 1 : 0);
}

const invokedDirectly =
  process.argv[1] && import.meta.url === new URL(`file://${path.resolve(process.argv[1])}`).href;
if (invokedDirectly) main();

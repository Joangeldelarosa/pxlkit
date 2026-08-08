/**
 * Icon skill reference renderer.
 *
 * Emits two artifacts consumed by the `pxlkit:icon` skill:
 *
 *   icon-spec.generated.md      the authoring contract, transcribed from BOTH validators
 *   icon-shapes.generated.json  occupancy signatures + tags for every shipped icon
 *
 * The signature/similarity pair below is a deliberate re-implementation of the
 * algorithm in `validate-icons.js` (the CI gate). It MUST stay behaviourally
 * identical: the icon skill uses it to predict whether a new icon would trip the
 * gate's duplicate warnings, and a drifting implementation would make the skill
 * emit false positives on legitimate icons — or, worse, wave through a duplicate.
 *
 * One representational difference is intentional. The CI gate keeps signatures as
 * 256-character binary strings because it only ever holds them in memory. We
 * serialise ~226 of them to JSON that ships inside the plugin, so they are packed
 * four bits to a hex character: 64 chars instead of 256, same information.
 */

/** A shipped icon reduced to what duplicate detection and tag search need. */
export interface IconShape {
  /** kebab-case icon name, e.g. `fire-sword` */
  name: string;
  /** Owning pack id: gamification | feedback | social | weather | ui | effects | parallax */
  pack: string;
  /** Searchable tags, used to decide whether a shape collision is also a semantic one */
  tags: string[];
  /** Occupancy bitmap of the first frame, 4 bits per hex char (64 chars for 16x16) */
  signature: string;
  /** How the icon is authored — affects which grid the signature came from */
  kind: 'static' | 'animated' | 'parallax';
}

const PACK_MODULES = [
  'gamification',
  'feedback',
  'social',
  'weather',
  'ui',
  'effects',
  'parallax',
] as const;

/**
 * Packs an occupancy bitmap into hex, 4 pixels per character.
 *
 * Mirrors `occupancySignature()` in validate-icons.js: `.` is empty, every other
 * character is lit. Rows are concatenated in order, so bit `i` is pixel `i` of the
 * flattened grid and nibbles are big-endian (pixel 0 is the high bit of char 0).
 */
export function gridToSignature(rows: string[]): string {
  const bits = rows.join('');
  let hex = '';
  for (let i = 0; i < bits.length; i += 4) {
    let nibble = 0;
    for (let b = 0; b < 4; b += 1) {
      const char = bits[i + b];
      // Past the end of the grid the bit is 0, which keeps odd-length grids honest.
      const lit = char !== undefined && char !== '.';
      if (lit) nibble |= 1 << (3 - b);
    }
    hex += nibble.toString(16);
  }
  return hex;
}

/** Expands a hex signature back into its bit array. */
function signatureToBits(signature: string): boolean[] {
  const bits: boolean[] = [];
  for (const char of signature) {
    const nibble = Number.parseInt(char, 16);
    if (Number.isNaN(nibble)) return [];
    for (let b = 0; b < 4; b += 1) {
      bits.push((nibble & (1 << (3 - b))) !== 0);
    }
  }
  return bits;
}

/**
 * Jaccard similarity over the set of lit pixels — |A ∩ B| / |A ∪ B|.
 *
 * Identical in behaviour to `similarity()` in validate-icons.js, including its two
 * edge cases: signatures of differing length score 0, and two empty signatures
 * score 1 (trivially identical).
 *
 * Positions where both grids are empty are ignored on purpose. The gate used to
 * compare Hamming distance over all 256 positions, which scored any two sparse
 * silhouettes at ≥0.97 simply because their empty pixels agreed.
 */
export function jaccard(sigA: string, sigB: string): number {
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

/** Minimal structural views of the icon shapes we read at runtime. */
interface StaticLike {
  name?: string;
  tags?: string[];
  grid?: string[];
}
interface AnimatedLike {
  name?: string;
  tags?: string[];
  frames?: Array<{ grid?: string[] }>;
}
interface ParallaxLike {
  name?: string;
  tags?: string[];
  layers?: Array<{ icon?: StaticLike & AnimatedLike }>;
}

/** Returns the grid a signature should be computed from, or null if there is none. */
function firstGrid(icon: StaticLike & AnimatedLike): string[] | null {
  if (Array.isArray(icon.grid) && icon.grid.length > 0) return icon.grid;
  const frame = icon.frames?.[0];
  if (Array.isArray(frame?.grid) && frame.grid.length > 0) return frame.grid;
  return null;
}

/**
 * Composites a parallax icon's layers into one silhouette.
 *
 * A parallax icon has no grid of its own — it is a stack of layered icons. The
 * union of every layer's lit pixels is the shape a person actually sees, which is
 * what duplicate detection should compare against.
 */
function parallaxSignature(icon: ParallaxLike): string | null {
  const grids = (icon.layers ?? [])
    .map((layer) => (layer.icon ? firstGrid(layer.icon) : null))
    .filter((grid): grid is string[] => grid !== null);
  if (grids.length === 0) return null;

  const rows = grids[0].length;
  const merged: string[] = [];
  for (let y = 0; y < rows; y += 1) {
    let row = '';
    const width = grids[0][y]?.length ?? 0;
    for (let x = 0; x < width; x += 1) {
      const lit = grids.some((grid) => {
        const char = grid[y]?.[x];
        return char !== undefined && char !== '.';
      });
      row += lit ? '#' : '.';
    }
    merged.push(row);
  }
  return gridToSignature(merged);
}

/**
 * Loads every shipped icon and reduces it to an {@link IconShape}.
 *
 * Reads the built packages rather than the `src/icons/*.ts` files the CI gate
 * scans. That is deliberate: two packs (`feedback`, `social`) build roughly fifty
 * icons procedurally in `src/icons.ts`, which the gate's regex never sees. Going
 * through the packs covers those too, so the skill can catch a collision the gate
 * would miss.
 */
export async function buildIconShapes(): Promise<IconShape[]> {
  const shapes: IconShape[] = [];

  for (const pack of PACK_MODULES) {
    let mod: Record<string, unknown>;
    try {
      mod = (await import(`@pxlkit/${pack}`)) as Record<string, unknown>;
    } catch {
      // A pack that is not built yet is skipped rather than fatal: the corpus stays
      // useful, and the missing pack shows up as a smaller count.
      continue;
    }

    for (const value of Object.values(mod)) {
      // Two shapes exist in the wild: an IconPack object with an `icons` array
      // (six packs) and a bare array of parallax icons (the parallax pack).
      const icons: unknown[] | null = Array.isArray(value)
        ? value
        : value && typeof value === 'object' && Array.isArray((value as { icons?: unknown }).icons)
          ? ((value as { icons: unknown[] }).icons)
          : null;
      if (!icons) continue;

      for (const raw of icons) {
        if (!raw || typeof raw !== 'object') continue;
        const icon = raw as StaticLike & AnimatedLike & ParallaxLike;
        if (typeof icon.name !== 'string') continue;

        let signature: string | null = null;
        let kind: IconShape['kind'] = 'static';

        if (Array.isArray(icon.layers)) {
          signature = parallaxSignature(icon);
          kind = 'parallax';
        } else {
          const grid = firstGrid(icon);
          if (grid) signature = gridToSignature(grid);
          kind = Array.isArray(icon.frames) ? 'animated' : 'static';
        }

        if (!signature) continue;
        if (shapes.some((s) => s.name === icon.name && s.pack === pack)) continue;

        shapes.push({
          name: icon.name,
          pack,
          tags: Array.isArray(icon.tags) ? icon.tags : [],
          signature,
          kind,
        });
      }
    }
  }

  shapes.sort((a, b) => (a.pack === b.pack ? a.name.localeCompare(b.name) : a.pack.localeCompare(b.pack)));
  return shapes;
}

/** The authoring contract, transcribed from the two validators that enforce it. */
export function renderIconSpec(version: string): string {
  return `<!-- GENERATED from @pxlkit/ui-kit v${version} — do not edit; run npm run docs:build -->

# Icon authoring spec — \`PxlKitData\`

pxlkit icons are not SVG files. The source of truth is a TypeScript object holding a
character grid plus a palette; the SVG is generated at runtime by \`@pxlkit/core\`.
Write the object, not the markup.

## 1. The format

\`\`\`ts
interface PxlKitData {
  name: string;                       // kebab-case, unique within the pack
  size: 8 | 16 | 24 | 32 | 48 | 64;   // every shipped pack uses 16
  category: string;                   // the pack id
  grid: string[];                     // exactly \`size\` strings of exactly \`size\` chars
  palette: Record<string, string>;    // single-char key -> hex colour
  tags: string[];                     // searchable
  author?: string;
}
\`\`\`

\`.\` is a transparent pixel. Every other character must have a palette entry.

Animated icons replace \`grid\` with \`frames: Array<{ grid: string[]; palette?: ... }>\`
plus \`frameDuration\` (ms) and \`trigger?: 'loop' | 'once' | 'hover' | 'appear' | 'ping-pong'\`.
A per-frame palette merges over the base one. The legacy \`loop: boolean\` is deprecated
and ignored when \`trigger\` is set.

Parallax icons replace the grid with \`layers: Array<{ icon, depth, offsetX?, offsetY? }>\`
ordered back to front. \`depth: 0\` anchors, \`> 0\` sits behind, \`< 0\` pops out.

## 2. What the validators enforce

Two validators exist and they do not check the same things. An icon must satisfy both.

### \`validate-icons.js\` — the CI gate (blocks publish)

Scans \`packages/{gamification,feedback,social,weather,ui,effects,parallax}/src/icons/*.ts\`
by regex over the file text. Per file, and per frame within a file:

- At least one \`grid: [...]\` block, or \`ERROR: no grid found\`.
- Exactly **16 rows**, each exactly **16 characters**. Any other count is an error.
- Every non-\`.\` character in the grid must appear as a key in some \`palette: {...}\`
  block in the same file.

It also warns — but does **not** fail — on silhouette collisions, comparing the
occupancy bitmap of each icon's first frame by Jaccard similarity:
\`DUPLICATE_SHAPE\` at exactly 1.0, \`NEAR_DUPLICATE_SHAPE\` at ≥ 0.93.

### \`validateIconData()\` — the runtime validator (normative, stricter)

Exported from \`@pxlkit/core\`. Use it when authoring outside the monorepo.

- \`name\` matches \`/^[a-z][a-z0-9-]*$/\`.
- \`size\` is one of 8, 16, 24, 32, 48, 64.
- \`grid.length === size\`, and every row's length \`=== size\`.
- Every non-\`.\` grid character has a palette entry.
- Palette keys are exactly one character, and \`.\` is forbidden as a key.
- Palette values match \`#RGB\`, \`#RRGGBB\` or \`#RRGGBBAA\`.
- A palette entry with \`00\` alpha is an error: use \`.\` for transparent pixels.
- \`category\` is non-empty.

## 3. A complete static icon, verbatim

\`\`\`ts
import type { PxlKitData } from '@pxlkit/core';

export const Check: PxlKitData = {
  name: 'check',
  size: 16,
  category: 'ui',
  grid: [
    '................',
    '................',
    '.............GGG',
    '............GGG.',
    '...........GGG..',
    '..........GGG...',
    '.........GGG....',
    '........GGG.....',
    '.GGG...GGG......',
    '..GGG.GGG.......',
    '...GGGGG........',
    '....GGG.........',
    '.....G..........',
    '................',
    '................',
    '................',
  ],
  palette: { G: '#00FF88' },
  tags: ['check', 'checkmark', 'confirm', 'done', 'valid', 'tick'],
};
\`\`\`

## 4. An animated icon

\`\`\`ts
import type { AnimatedPxlKitData } from '@pxlkit/core';

export const RadarPing: AnimatedPxlKitData = {
  name: 'radar-ping',
  size: 16,
  category: 'effects',
  palette: { B: '#1E3A5F', G: '#00FF88', D: '#0D1F2D', L: '#00CC6A' },
  frames: [
    { grid: [/* 16 rows of 16 chars */] },
    { grid: [/* sweep rotated */] },
  ],
  frameDuration: 120,
  trigger: 'loop',
  loop: true,
  tags: ['radar', 'ping', 'scan'],
};
\`\`\`

Each frame is validated independently against the 16×16 rule.

## 5. Registering an icon in a pack

Three steps. The third is the one that gets forgotten, and skipping it means the icon
exists but never appears in the pack.

1. Create \`packages/<pack>/src/icons/<name>.ts\` exporting \`export const <PascalName>: PxlKitData\`.
   The file name and \`name\` field are kebab-case; the export is PascalCase.
2. Re-export it from \`packages/<pack>/src/index.ts\`.
3. Add it to the \`icons\` array of that pack's \`IconPack\` export (\`UiPack\`, \`FeedbackPack\`, …).

Then run \`node validate-icons.js\` from the repo root and require exit 0.

## 6. Rendering

\`\`\`tsx
import { PxlKitIcon } from '@pxlkit/core';
import { Check } from '@pxlkit/ui';

<PxlKitIcon icon={Check} size={32} appearance="palette" />
\`\`\`

\`appearance\` is \`'palette'\` (the icon's own colours), \`'tinted'\`, or \`'solid'\`.

Gotcha worth knowing before you debug it: \`PxlKitIcon\` renders the generated SVG as a
data URI inside an \`<img>\`, so it can force nearest-neighbour scaling. That isolates it
from the surrounding CSS context, which means **\`currentColor\` does not work** — with
\`appearance="solid"\` you must pass an explicit \`color\`.

## 7. Licensing

An icon you author in your own project is yours. \`LICENSE-ASSETS\` covers the icon packs
that ship with pxlkit; contributing an icon to this repository puts it under
\`CONTRIBUTOR_LICENSE\`. Using pxlkit's existing icons is what requires visible
attribution ("Icons by Pxlkit", linking to pxlkit.xyz).
`;
}

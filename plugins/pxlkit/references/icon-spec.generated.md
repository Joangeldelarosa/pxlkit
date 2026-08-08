<!-- GENERATED from @pxlkit/ui-kit v2.1.1 — do not edit; run npm run docs:build -->

# Icon authoring spec — `PxlKitData`

pxlkit icons are not SVG files. The source of truth is a TypeScript object holding a
character grid plus a palette; the SVG is generated at runtime by `@pxlkit/core`.
Write the object, not the markup.

## 1. The format

```ts
interface PxlKitData {
  name: string;                       // kebab-case, unique within the pack
  size: 8 | 16 | 24 | 32 | 48 | 64;   // every shipped pack uses 16
  category: string;                   // the pack id
  grid: string[];                     // exactly `size` strings of exactly `size` chars
  palette: Record<string, string>;    // single-char key -> hex colour
  tags: string[];                     // searchable
  author?: string;
}
```

`.` is a transparent pixel. Every other character must have a palette entry.

Animated icons replace `grid` with `frames: Array<{ grid: string[]; palette?: ... }>`
plus `frameDuration` (ms) and `trigger?: 'loop' | 'once' | 'hover' | 'appear' | 'ping-pong'`.
A per-frame palette merges over the base one. The legacy `loop: boolean` is deprecated
and ignored when `trigger` is set.

Parallax icons replace the grid with `layers: Array<{ icon, depth, offsetX?, offsetY? }>`
ordered back to front. `depth: 0` anchors, `> 0` sits behind, `< 0` pops out.

## 2. What the validators enforce

Two validators exist and they do not check the same things. An icon must satisfy both.

### `validate-icons.js` — the CI gate (blocks publish)

Scans `packages/{gamification,feedback,social,weather,ui,effects,parallax}/src/icons/*.ts`
by regex over the file text. Per file, and per frame within a file:

- At least one `grid: [...]` block, or `ERROR: no grid found`.
- Exactly **16 rows**, each exactly **16 characters**. Any other count is an error.
- Every non-`.` character in the grid must appear as a key in some `palette: {...}`
  block in the same file.

It also warns — but does **not** fail — on silhouette collisions, comparing the
occupancy bitmap of each icon's first frame by Jaccard similarity:
`DUPLICATE_SHAPE` at exactly 1.0, `NEAR_DUPLICATE_SHAPE` at ≥ 0.93.

### `validateIconData()` — the runtime validator (normative, stricter)

Exported from `@pxlkit/core`. Use it when authoring outside the monorepo.

- `name` matches `/^[a-z][a-z0-9-]*$/`.
- `size` is one of 8, 16, 24, 32, 48, 64.
- `grid.length === size`, and every row's length `=== size`.
- Every non-`.` grid character has a palette entry.
- Palette keys are exactly one character, and `.` is forbidden as a key.
- Palette values match `#RGB`, `#RRGGBB` or `#RRGGBBAA`.
- A palette entry with `00` alpha is an error: use `.` for transparent pixels.
- `category` is non-empty.

## 3. A complete static icon, verbatim

```ts
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
```

## 4. An animated icon

```ts
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
```

Each frame is validated independently against the 16×16 rule.

## 5. Registering an icon in a pack

Three steps. The third is the one that gets forgotten, and skipping it means the icon
exists but never appears in the pack.

1. Create `packages/<pack>/src/icons/<name>.ts` exporting `export const <PascalName>: PxlKitData`.
   The file name and `name` field are kebab-case; the export is PascalCase.
2. Re-export it from `packages/<pack>/src/index.ts`.
3. Add it to the `icons` array of that pack's `IconPack` export (`UiPack`, `FeedbackPack`, …).

Then run `node validate-icons.js` from the repo root and require exit 0.

## 6. Rendering

```tsx
import { PxlKitIcon } from '@pxlkit/core';
import { Check } from '@pxlkit/ui';

<PxlKitIcon icon={Check} size={32} appearance="palette" />
```

`appearance` is `'palette'` (the icon's own colours), `'tinted'`, or `'solid'`.

Gotcha worth knowing before you debug it: `PxlKitIcon` renders the generated SVG as a
data URI inside an `<img>`, so it can force nearest-neighbour scaling. That isolates it
from the surrounding CSS context, which means **`currentColor` does not work** — with
`appearance="solid"` you must pass an explicit `color`.

## 7. Licensing

An icon you author in your own project is yours. `LICENSE-ASSETS` covers the icon packs
that ship with pxlkit; contributing an icon to this repository puts it under
`CONTRIBUTOR_LICENSE`. Using pxlkit's existing icons is what requires visible
attribution ("Icons by Pxlkit", linking to pxlkit.xyz).

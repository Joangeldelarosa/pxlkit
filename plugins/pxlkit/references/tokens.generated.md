<!-- GENERATED from @pxlkit/ui-kit v2.1.1 — do not edit; run npm run docs:build -->

# Tokens & theming

Design tokens of `@pxlkit/ui-kit` v2.1.1, parsed from the shipped sources.

Read "The two tone scales" before writing any component code: `tone` and
`toneMap` are the one pair in this kit that can be confused without a type
error.

## Palette variables

Parsed from `packages/ui-kit/styles.css` — 20 variable(s). Light is the
`:root, :host` block (a variable declared only in the explicit `.light` block is
shown from there); dark is the `.dark` class block. Dark mode is a **class on
`<html>`**, never a media query.

| Variable | Light (`:root, :host`) | Dark (`.dark`) | Tailwind namespace |
| --- | --- | --- | --- |
| `--retro-bg` | `#F2F0EB` | `#0A0A0F` | `retro-bg` |
| `--retro-surface` | `#E6E2DC` | `#12121A` | `retro-surface` |
| `--retro-card` | `#DCD8D0` | `#1A1A2E` | `retro-card` |
| `--retro-text` | `#1A1A2E` | `#E8E6E3` | `retro-text` |
| `--retro-border` | `#BEBAA2` | `#2A2A3E` | `retro-border` |
| `--retro-border-strong` | `#8C8770` | `#4A4A66` | `retro-border-strong` |
| `--retro-primary` | `#4F46E5` | `#818CF8` | `retro-primary` |
| `--retro-secondary` | `#FBBF24` | `#FCD34D` | `retro-secondary` |
| `--retro-accent` | `#10B981` | `#34D399` | `retro-accent` |
| `--retro-muted` | `#646478` | `#8888AA` | `retro-muted` |
| `--retro-green` | `#008C4B` | `#00FF88` | `retro-green` |
| `--retro-green-hover` | `#006E3A` | `#00CC6A` | `retro-green-hover` |
| `--retro-cyan` | `#24827A` | `#4ECDC4` | `retro-cyan` |
| `--retro-red` | `#C83741` | `#FF6B6B` | `retro-red` |
| `--retro-gold` | `#B48700` | `#FFD700` | `retro-gold` |
| `--retro-purple` | `#8237C8` | `#A855F7` | `retro-purple` |
| `--retro-pink` | `#C84678` | `#FF77A8` | `retro-pink` |
| `--retro-shadow-green` | `rgba(0, 140, 75, 0.3)` | `rgba(0, 255, 136, 0.3)` | — |
| `--retro-shadow-green-lg` | `rgba(0, 140, 75, 0.2)` | `rgba(0, 255, 136, 0.2)` | — |
| `--retro-shadow-gold` | `rgba(180, 135, 0, 0.3)` | `rgba(255, 215, 0, 0.3)` | — |

Only variables with a Tailwind namespace can be used as utilities (`bg-…`,
`text-…`, `border-…`, `ring-…`). The rest — notably the `--retro-shadow-*`
trio — are consumed inside other custom properties and are **not** utility
classes: `bg-retro-shadow-green` does not exist and silently renders nothing.

## The two tone scales

**The two tone scales are NOT interchangeable.** The kit ships two
`Record<Tone, …>` maps with overlapping field names. They type-check against
each other, so a mix-up produces no error — only wrong pixels.

- `toneMap` — from `packages/ui-kit/src/common.tsx` — **CONTROLS** (button, input, badge, chip, toast) — keys: `green`, `cyan`, `gold`, `red`, `purple`, `pink`, `neutral`
- `tone` — from `packages/ui-kit/src/tokens.ts` — **SURFACES** (card, hero, bento, charts, sidebar) — keys: `neutral`, `green`, `cyan`, `gold`, `red`, `purple`, `pink`

Which one to reach for:

- Building or restyling a **control** — anything control-scale with a border
  that must stay legible at body-text size: import `toneMap` from `common.tsx`.
  Its borders are `border-*/40` and it carries a `hover` tier because controls
  are interactive.
- Building or restyling a **surface** — a card, section, hero, bento cell,
  chart panel: import `tone` from `tokens.ts`. Its borders are the softer
  `border-*/30` (a large area with a 40 % border reads heavy) and it carries a
  `glow` shadow tier instead of `hover`, because surfaces are not interactive
  by default.

The divergence is a rendered design decision, not drift. Do **not** "sync" the
two maps: aligning them changes shipped pixels for one of the two component
families. See the decision comment on `tone` in `tokens.ts`.

### `toneMap` — control scale (`common.tsx`)

| Tone | `ring` | `text` | `border` | `bg` | `soft` | `hover` | `fill` |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `green` | `focus-visible:ring-retro-green/40` | `text-retro-green` | `border-retro-green/40` | `bg-retro-green/18` | `bg-retro-green/8` | `hover:bg-retro-green/25` | `bg-retro-green` |
| `cyan` | `focus-visible:ring-retro-cyan/40` | `text-retro-cyan` | `border-retro-cyan/40` | `bg-retro-cyan/18` | `bg-retro-cyan/8` | `hover:bg-retro-cyan/25` | `bg-retro-cyan` |
| `gold` | `focus-visible:ring-retro-gold/40` | `text-retro-gold` | `border-retro-gold/40` | `bg-retro-gold/18` | `bg-retro-gold/8` | `hover:bg-retro-gold/25` | `bg-retro-gold` |
| `red` | `focus-visible:ring-retro-red/40` | `text-retro-red` | `border-retro-red/40` | `bg-retro-red/18` | `bg-retro-red/8` | `hover:bg-retro-red/25` | `bg-retro-red` |
| `purple` | `focus-visible:ring-retro-purple/40` | `text-retro-purple` | `border-retro-purple/40` | `bg-retro-purple/18` | `bg-retro-purple/8` | `hover:bg-retro-purple/25` | `bg-retro-purple` |
| `pink` | `focus-visible:ring-retro-pink/40` | `text-retro-pink` | `border-retro-pink/40` | `bg-retro-pink/18` | `bg-retro-pink/8` | `hover:bg-retro-pink/25` | `bg-retro-pink` |
| `neutral` | `focus-visible:ring-retro-border/60` | `text-retro-text` | `border-retro-border` | `bg-retro-surface/70` | `bg-retro-surface/40` | `hover:bg-retro-surface/80` | `bg-retro-text` |

### `tone` — surface scale (`tokens.ts`)

| Tone | `border` | `bg` | `soft` | `glow` | `ring` | `text` | `fill` |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `neutral` | `border-retro-border` | `bg-retro-surface/40` | `bg-retro-surface/20` | `shadow-[0_0_24px_-12px_rgba(0,0,0,0.4)]` | `focus-visible:ring-retro-border` | `text-retro-text` | `bg-retro-muted` |
| `green` | `border-retro-green/30` | `bg-retro-green/18` | `bg-retro-green/8` | `shadow-[0_0_24px_-8px_rgba(0,255,128,0.45)]` | `focus-visible:ring-retro-green/40` | `text-retro-green` | `bg-retro-green` |
| `cyan` | `border-retro-cyan/30` | `bg-retro-cyan/18` | `bg-retro-cyan/8` | `shadow-[0_0_24px_-8px_rgba(14,165,233,0.45)]` | `focus-visible:ring-retro-cyan/40` | `text-retro-cyan` | `bg-retro-cyan` |
| `gold` | `border-retro-gold/30` | `bg-retro-gold/18` | `bg-retro-gold/8` | `shadow-[0_0_24px_-8px_rgba(234,179,8,0.45)]` | `focus-visible:ring-retro-gold/40` | `text-retro-gold` | `bg-retro-gold` |
| `red` | `border-retro-red/30` | `bg-retro-red/18` | `bg-retro-red/8` | `shadow-[0_0_24px_-8px_rgba(239,68,68,0.45)]` | `focus-visible:ring-retro-red/40` | `text-retro-red` | `bg-retro-red` |
| `purple` | `border-retro-purple/30` | `bg-retro-purple/18` | `bg-retro-purple/8` | `shadow-[0_0_24px_-8px_rgba(168,85,247,0.45)]` | `focus-visible:ring-retro-purple/40` | `text-retro-purple` | `bg-retro-purple` |
| `pink` | `border-retro-pink/30` | `bg-retro-pink/18` | `bg-retro-pink/8` | `shadow-[0_0_24px_-8px_rgba(236,72,153,0.45)]` | `focus-visible:ring-retro-pink/40` | `text-retro-pink` | `bg-retro-pink` |

## `surfaceClasses(surface)` — `pixel` vs `linear`

`surfaceClasses(surface: Surface = "pixel"): SurfaceClasses` (exported from
`common.tsx`) resolves the aesthetic bundle every component composes. The
active surface comes from the nearest `PxlKitSurfaceProvider`; a component`s
`surface` prop overrides it for that instance only.
| Field | `pixel` | `linear` |
| --- | --- | --- |
| `border` | `border-2` | `border` |
| `radius` | `pxl-corner-sm` | `rounded-md` |
| `radiusLg` | `pxl-corner-md` | `rounded-xl` |
| `radiusFull` | `pxl-corner-sm` | `rounded-full` |
| `shadow` | `pxl-shadow` | `shadow-sm` |
| `shadowHover` | `pxl-shadow-hover` | `hover:shadow-md` |
| `shadowActive` | `pxl-shadow-active` | `active:shadow-sm` |
| `font` | `font-mono` | `font-sans` |
| `fontDisplay` | `font-pixel uppercase tracking-wider` | `font-semibold tracking-tight` |
| `transition` | `transition-all duration-150` | `transition-all duration-200` |
| `press` | `active:translate-x-[2px] active:translate-y-[2px]` | `active:scale-[0.98]` |

Never hard-code a radius, border width or shadow on a kit component: read it
from `surfaceClasses()` so the component follows the provider. The `pxl-*`
classes are real utilities defined in `styles.css` (`clip-path` staircase
corners plus `filter: drop-shadow`, so the shadow follows the cut silhouette).

## Size scales

Three `Record<Size, string>` maps in `common.tsx`. `Size` is `"sm" | "md" |
"lg"`; `md` is every component`s default.

- `sizeClass` — height + horizontal padding + text size + gap, for controls
  that own their padding (`PixelButton`, `PixelInput`, `PixelSelect`).
- `sizeHeight` — height + text size only, for shells that lay out their own
  interior (input shells, sliders, switches).
- `sizeSquare` — square geometry for icon buttons, avatars and swatches.
| Size | `sizeClass` | `sizeHeight` | `sizeSquare` |
| --- | --- | --- | --- |
| `sm` | `h-8 px-3 text-xs gap-1.5` | `h-8 text-xs` | `h-8 w-8 text-[9px]` |
| `md` | `h-10 px-4 text-sm gap-2` | `h-10 text-sm` | `h-10 w-10 text-[10px]` |
| `lg` | `h-12 px-5 text-sm gap-2.5` | `h-12 text-sm` | `h-12 w-12 text-xs` |

Heights are shared across the three maps at the same step, so a button, an
input shell and an icon button on the same form row align on the baseline.
Mixing steps (an `lg` button next to an `md` input) is the usual cause of a
ragged row.

## Re-skin recipe

Override the `--retro-*` variables **after** importing the stylesheet. One
change propagates to every component and utility, because nothing in the kit
hard-codes a hex value.

The example below re-skins three variables so the pattern is visible end to end.
Repeat the same three-selector treatment for **every** variable you change.

```css
@import "@pxlkit/ui-kit/styles.css";

/* Light theme — the default. */
:root, :host {
  --retro-surface: #F0EFED;
  --retro-text: #1C1917;
  --retro-green: #16A34A;
  --retro-shadow-green: rgba(22, 163, 74, 0.3);
  --retro-shadow-green-lg: rgba(22, 163, 74, 0.2);
}

/* Dark theme — a class on <html>, not a media query. */
.dark {
  --retro-surface: #1C1917;
  --retro-text: #FAFAF9;
  --retro-green: #4ADE80;
  --retro-shadow-green: rgba(74, 222, 128, 0.3);
  --retro-shadow-green-lg: rgba(74, 222, 128, 0.2);

  /* Re-declare the Tailwind mirrors — see gotcha 1. */
  --color-retro-surface: #1C1917;
  --color-retro-text: #FAFAF9;
  --color-retro-green: #4ADE80;
}

/* Explicit light — only needed for a light preview nested inside .dark. */
.light {
  --retro-surface: #F0EFED;
  --retro-text: #1C1917;
  --retro-green: #16A34A;

  --color-retro-surface: #F0EFED;
  --color-retro-text: #1C1917;
  --color-retro-green: #16A34A;
}
```

### Gotcha 1 — `@property` forces re-declaration in `.dark` / `.light`

Tailwind v4's `@theme` registers every `--color-retro-*` mirror with
`@property`, `syntax: "<color>"`, `inherits: true`. A registered property is
**computed at the element that declares it**, so `--color-retro-<name>:
var(--retro-<name>)` resolves to a concrete colour on `:root` and children
inherit *that computed colour*, not the `var()` expression.

Consequence: redefining only `--retro-<name>` inside `.dark` or `.light` changes
raw `var(--retro-<name>)` consumers but leaves every Tailwind utility
(`bg-retro-*`, `text-retro-*`, `border-retro-*`) showing the `:root` colour.
This is why the shipped `.dark` and `.light` blocks each carry a full second
copy of the `--color-retro-*` mirrors. If you add a theme boundary of your own
(a `.theme-brand` class, a nested preview), you must mirror both sets there too.

Redefining on `:root` alone is enough **only** when you are not changing the
value per theme.

### Gotcha 2 — the pixel shadows are wired to green and gold

The `@theme` block hard-wires three shadow utilities to specific palette
variables:

| Utility | Reads |
| --- | --- |
| `shadow-pixel` | `--retro-shadow-green` |
| `shadow-pixel-lg` | `--retro-shadow-green-lg` |
| `shadow-pixel-gold` | `--retro-shadow-gold` |

They are **not** derived from `--retro-green` / `--retro-gold`: the shadow
variables carry their own rgba with baked-in alpha. Change the green or the gold
hue and the offset shadows keep the old tint until you update
`--retro-shadow-green`, `--retro-shadow-green-lg` and `--retro-shadow-gold` by
hand, in **every** selector where you set the hue. There is no green-tinted
shadow for the other tones — cyan, red, purple and pink surfaces reuse the green
shadow or the neutral `.pxl-shadow` (a flat `rgba(0, 0, 0, 0.25)` drop-shadow
that ignores the palette entirely).

### Checklist

1. Import the stylesheet first; your overrides must come after it.
2. Set every variable you change in `:root, :host` **and** `.dark` — a variable
   set in one theme only inherits the other theme's value.
3. Mirror `--color-retro-*` in `.dark` / `.light` (gotcha 1).
4. Update the three `--retro-shadow-*` variables whenever green or gold moves
   (gotcha 2).
5. Do not restyle by patching component classes — a component that stops reading
   `surfaceClasses()` and `tone` / `toneMap` drops out of the theme system.

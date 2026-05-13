<p align="center">
  <img src="https://raw.githubusercontent.com/joangeldelarosa/pxlkit/main/apps/web/public/og-image.png" alt="Pxlkit" width="480" />
</p>

<h1 align="center">@pxlkit/core</h1>

<p align="center">
  <strong>Core rendering engine, React components, and utilities for Pxlkit.</strong><br/>
  Types, SVG generation, color utilities, icon validation, and the foundational components that power the entire Pxlkit ecosystem.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@pxlkit/core"><img src="https://img.shields.io/npm/v/@pxlkit/core?color=blue" alt="npm version" /></a>
  <a href="https://github.com/joangeldelarosa/pxlkit/blob/main/LICENSE-CODE"><img src="https://img.shields.io/badge/license-MIT-22c55e.svg" alt="MIT License" /></a>
  <img src="https://img.shields.io/badge/react-%E2%89%A518-61DAFB?logo=react&logoColor=white" alt="React ≥18" />
  <img src="https://img.shields.io/badge/typescript-strict-3178C6?logo=typescript&logoColor=white" alt="TypeScript strict" />
</p>

---

## Overview

`@pxlkit/core` is the foundation of the [Pxlkit](https://pxlkit.xyz) pixel art icon ecosystem. It provides:

- **React components** for rendering static, animated, and parallax 3D icons
- **SVG generation** from 16×16 character grids
- **Color utilities** for hex/RGB conversion, brightness adjustment
- **Icon validation** and code parsing/generation
- **TypeScript types** for the entire icon data format
- **Toast notifications** with pixel art styling

All icon packs (`@pxlkit/gamification`, `@pxlkit/feedback`, `@pxlkit/social`, etc.) depend on this package.

## Installation

```bash
npm install @pxlkit/core
```

> **Peer dependencies:** `react ≥18.0.0` and `react-dom ≥18.0.0`

## Quick Start

### Rendering a Static Icon

```tsx
import { PxlKitIcon } from '@pxlkit/core';
import { Trophy } from '@pxlkit/gamification';

// Default — original artwork palette
<PxlKitIcon icon={Trophy} size={32} />

// Tinted — preserves detail (highlights/shadows) while shifting hue
<PxlKitIcon icon={Trophy} size={32} appearance="tinted" color="#FF4D4D" />

// Solid — flatten every pixel to one colour
<PxlKitIcon icon={Trophy} size={32} appearance="solid" color="#FFFFFF" />
```

Icons render as `<img>` elements backed by inline SVG data URIs with `image-rendering: pixelated` — every source pixel is preserved at every visual size, no edge dropouts at non-integer scales (e.g. `size={14}` from a 16-grid icon renders pixel-perfect).

### Colour mode contract

| `appearance` | When to use | Result |
| --- | --- | --- |
| `"palette"` *(default)* | Decorative icons that should read as drawn | Full original palette |
| `"tinted"` + `color` | Match a UI tone without losing detail | Palette tinted via SVG `feBlend mode="color"` — preserves luminance |
| `"solid"` + `color` | Chrome glyphs that need flat fill | Every non-transparent pixel = `color` |
| `"solid"` *(no color)* | (legacy) inheriting text colour | `#FFFFFF` fallback — pass an explicit `color` for solid mode inside `<img>` since `currentColor` isn't honoured in isolated img contexts |

> **Migration from v1.2.x**: the boolean `colorful`, `solid`, and `tint` props are accepted as `@deprecated` aliases that map to the new `appearance`. Existing code keeps working; new code should use `appearance` + `color`.

### Animated Icons

```tsx
import { AnimatedPxlKitIcon } from '@pxlkit/core';
import { FireSword } from '@pxlkit/gamification';

// Auto-playing loop (default — full palette)
<AnimatedPxlKitIcon icon={FireSword} size={48} />

// Play on hover only
<AnimatedPxlKitIcon icon={FireSword} size={48} trigger="hover" />

// Half speed + tinted to match a tone
<AnimatedPxlKitIcon icon={FireSword} size={48} speed={0.5} appearance="tinted" color="#8237C8" />
```

### Parallax 3D Icons

```tsx
import { ParallaxPxlKitIcon } from '@pxlkit/core';
import { CoolEmoji } from '@pxlkit/parallax';

// Interactive parallax — layers move with mouse
<ParallaxPxlKitIcon icon={CoolEmoji} size={64} />

// Custom depth strength and perspective
<ParallaxPxlKitIcon icon={CoolEmoji} size={96} strength={24} perspective={300} />
```

### Toast Notifications

```tsx
import { PixelToast } from '@pxlkit/core';
import { CheckCircle } from '@pxlkit/feedback';

<PixelToast
  visible={true}
  title="Saved!"
  message="Your changes have been saved."
  icon={CheckCircle}
  colorfulIcon
  position="bottom-right"
  duration={3000}
/>
```

## Storybook

Explore every component and prop live: **[storybook.pxlkit.xyz](https://storybook.pxlkit.xyz)** — the `Core/` section has stories for `PxlKitIcon`, `AnimatedPxlKitIcon` (all 5 triggers), and `PixelToast` (every tone + position). The `Core / PxlKitIcon / Tint vs Solid — side by side` story is the clearest demo of how tinting preserves detail vs flattening to one colour.

## React Components

| Component | Description |
| --- | --- |
| `<PxlKitIcon>` | Renders a static icon as crisp inline SVG |
| `<AnimatedPxlKitIcon>` | Renders an animated icon with frame playback |
| `<ParallaxPxlKitIcon>` | Renders a multi-layer 3D parallax icon with mouse tracking |
| `<PixelToast>` | Pixel-art styled toast notification |

## Utilities

| Function | Description |
| --- | --- |
| `gridToPixels(icon)` | Converts grid + palette → `Pixel[]` array |
| `pixelsToGrid(pixels, size)` | Converts pixel array back to grid format |
| `gridToSvg(icon, options)` | Generates SVG string from icon data |
| `pixelsToSvg(pixels, size, options)` | Generates SVG from pixel array |
| `generateAnimatedSvg(icon)` | Generates animated SVG with CSS keyframes |
| `svgToDataUri(svg)` | Converts SVG to `data:image/svg+xml` URI |
| `svgToBase64(svg)` | Converts SVG to base64 data URI |
| `parseHexColor(hex)` | Parses hex color string to RGB values |
| `encodeHexColor(r, g, b)` | Encodes RGB values to hex string |
| `hexToRgb(hex)` | Converts hex color to `{ r, g, b }` |
| `rgbToHex(r, g, b)` | Converts RGB values to hex string |
| `adjustBrightness(hex, amount)` | Lighten or darken a hex color |
| `getPerceivedBrightness(hex)` | Gets perceived brightness of a color |
| `validateIconData(icon)` | Validates icon structure, returns errors |
| `isValidIconData(icon)` | Returns `true` if icon data is valid |
| `parseIconCode(code)` | Parses icon code string → `PxlKitData` |
| `parseAnyIconCode(code)` | Parses any icon format code string |
| `generateIconCode(icon)` | Generates TypeScript code from icon data |
| `isAnimatedIcon(icon)` | Type guard for `AnimatedPxlKitData` |
| `isParallexIcon(icon)` | Type guard for `ParallaxPxlKitData` |
| `animatedToFrameIcons(icon)` | Converts animated icon to individual frames |
| `RETRO_PALETTES` | Built-in retro color palette presets |

## Types

```ts
import type {
  GridSize,
  Pixel,
  PxlKitData,
  AnyIcon,
  IconPack,
  SvgOptions,
  PxlKitProps,
  PixelToastProps,
  AnimationFrame,
  AnimationTrigger,
  AnimatedPxlKitData,
  AnimatedPxlKitProps,
  AnimatedIconPack,
  ParallaxLayer,
  ParallaxPxlKitData,
  ParallaxPxlKitProps,
} from '@pxlkit/core';
```

## Animation Triggers

| Trigger | Behavior |
| --- | --- |
| `loop` | Plays continuously in an infinite loop |
| `once` | Plays one time, stops on the last frame |
| `hover` | Plays only while the user hovers |
| `appear` | Plays once when the icon mounts/appears |
| `ping-pong` | Loops forward and backward alternating |

## How Icons Work

Every icon is a **16×16 character grid** paired with a **palette** that maps single characters to hex colors. The `.` character is always transparent.

```ts
import type { PxlKitData } from '@pxlkit/core';

export const Trophy: PxlKitData = {
  name: 'trophy',
  size: 16,
  category: 'gamification',
  grid: [
    '................',
    '..GGGGGGGGGGGG..',
    '.GG.YYYYYYYY.GG.',
    // ... 16 rows total
  ],
  palette: {
    G: '#FFD700',
    Y: '#FFF44F',
    D: '#B8860B',
    B: '#8B4513',
    W: '#FFFFFF',
  },
  tags: ['achievement', 'winner', 'reward'],
  author: 'pxlkit',
};
```

## Related Packages

| Package | Description |
| --- | --- |
| [`@pxlkit/gamification`](https://www.npmjs.com/package/@pxlkit/gamification) | 51 icons — RPG, achievements, rewards |
| [`@pxlkit/feedback`](https://www.npmjs.com/package/@pxlkit/feedback) | 33 icons — alerts, status, notifications |
| [`@pxlkit/social`](https://www.npmjs.com/package/@pxlkit/social) | 43 icons — community, emojis, messaging |
| [`@pxlkit/weather`](https://www.npmjs.com/package/@pxlkit/weather) | 36 icons — climate, moon, temperature |
| [`@pxlkit/ui`](https://www.npmjs.com/package/@pxlkit/ui) | 41 icons — interface controls, navigation |
| [`@pxlkit/effects`](https://www.npmjs.com/package/@pxlkit/effects) | 12 animated VFX icons |
| [`@pxlkit/parallax`](https://www.npmjs.com/package/@pxlkit/parallax) | 10 multi-layer 3D parallax icons |
| [`@pxlkit/ui-kit`](https://www.npmjs.com/package/@pxlkit/ui-kit) | 54 retro React UI components |

## Documentation

Browse all icons, try the visual builder, and explore the full docs at **[pxlkit.xyz](https://pxlkit.xyz)**.

## License

[MIT License](https://github.com/joangeldelarosa/pxlkit/blob/main/LICENSE-CODE) — code package. See the [repo licensing overview](https://github.com/joangeldelarosa/pxlkit/blob/main/LICENSE) for split-license scope details.

Created by [Joangel De La Rosa](https://github.com/joangeldelarosa)

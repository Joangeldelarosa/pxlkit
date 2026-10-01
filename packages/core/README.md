<p align="center">
  <img src="https://raw.githubusercontent.com/joangeldelarosa/pxlkit/main/apps/web/public/og-image.png" alt="Pxlkit" width="480" />
</p>

<h1 align="center">@pxlkit/core</h1>

<p align="center">
  <strong>Pixel art rendering engine for Pxlkit — framework-agnostic core plus React components.</strong><br/>
  Types, SVG rendering, animation and parallax engines, color utilities and icon validation: the foundation every Pxlkit package and framework adapter builds on.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@pxlkit/core"><img src="https://img.shields.io/npm/v/@pxlkit/core?color=blue" alt="npm version" /></a>
  <a href="https://github.com/joangeldelarosa/pxlkit/blob/main/LICENSE-CODE"><img src="https://img.shields.io/badge/license-MIT-22c55e.svg" alt="MIT License" /></a>
  <img src="https://img.shields.io/badge/react-%E2%89%A518-61DAFB?logo=react&logoColor=white" alt="React ≥18" />
  <img src="https://img.shields.io/badge/vue-%E2%89%A53.3-42B883?logo=vuedotjs&logoColor=white" alt="Vue ≥3.3 via @pxlkit/vue" />
  <img src="https://img.shields.io/badge/angular-20%20%7C%2021%20%7C%2022-DD0031?logo=angular&logoColor=white" alt="Angular 20 | 21 | 22 via @pxlkit/angular" />
  <img src="https://img.shields.io/badge/typescript-strict-3178C6?logo=typescript&logoColor=white" alt="TypeScript strict" />
</p>

---

## Overview

`@pxlkit/core` is the foundation of the [Pxlkit](https://pxlkit.xyz) pixel art icon ecosystem. It ships two entry points:

| Entry | Contents | Requires |
| --- | --- | --- |
| `@pxlkit/core` | Everything below **plus** the React components (`PxlKitIcon`, `AnimatedPxlKitIcon`, `ParallaxPxlKitIcon`, `PixelToast`) | React ≥ 18 |
| `@pxlkit/core/vanilla` | The framework-agnostic API: icon data types, utilities and the rendering engine (SVG renderer, animation player, parallax controller, toast view model) | Nothing — no UI framework anywhere in its module graph |

The React, [Vue](https://www.npmjs.com/package/@pxlkit/vue) and [Angular](https://www.npmjs.com/package/@pxlkit/angular) components are all thin adapters over the same engine, so an icon's image is byte-identical — and animates identically — in every framework. All icon packs (`@pxlkit/gamification`, `@pxlkit/feedback`, `@pxlkit/social`, …) are plain data typed against this package.

## Pick your framework

| Framework | Install | Components from |
| --- | --- | --- |
| React ≥ 18 | `npm install @pxlkit/core @pxlkit/gamification` | `@pxlkit/core` |
| Vue ≥ 3.3 | `npm install @pxlkit/vue @pxlkit/gamification` | [`@pxlkit/vue`](https://www.npmjs.com/package/@pxlkit/vue) |
| Angular 20–22 | `npm install @pxlkit/angular @pxlkit/gamification` | [`@pxlkit/angular`](https://www.npmjs.com/package/@pxlkit/angular) |
| Anything else / no framework | `npm install @pxlkit/core @pxlkit/gamification` | `@pxlkit/core/vanilla` |

> **Peer dependencies:** `react` and `react-dom` (≥ 18) are *optional* peers — they are only needed by the root entry's React components. Vue, Angular and vanilla projects never install React.

## Quick Start (React)

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

> **Migration from v1.2.x**: the boolean `colorful`, `solid`, and `tint` props are accepted as `@deprecated` aliases that map to the new `appearance`. Existing code keeps working; new code should use `appearance` + `color`. (The Vue and Angular adapters only accept `appearance` + `color`.)

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

Looping icons pause automatically while they are off-screen (one shared `IntersectionObserver` serves every icon on the page).

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

`PixelToast` is styled with Tailwind CSS utility classes. With Tailwind v4, let it see the classes shipped in this package by adding `@source "../node_modules/@pxlkit/core/dist";` to your stylesheet (adjust the relative path to your CSS file).

## Framework-agnostic API — `@pxlkit/core/vanilla`

Everything that is not a React component, importable without React:

```ts
import { renderIconDataUri, ICON_IMAGE_STYLE } from '@pxlkit/core/vanilla';
import { Trophy } from '@pxlkit/gamification';

// Exactly the image <PxlKitIcon> renders, as a data URI.
const img = document.createElement('img');
img.src = renderIconDataUri(Trophy, { appearance: 'tinted', color: '#FF4D4D' });
img.width = img.height = 32;
img.alt = Trophy.name;
Object.assign(img.style, ICON_IMAGE_STYLE);
document.body.append(img);
```

Animated icons are driven by a framework-agnostic player — the same one the React, Vue and Angular components use:

```ts
import {
  createAnimatedIconPlayer,
  getAnimationFrame,
  renderIconDataUri,
} from '@pxlkit/core/vanilla';
import { FireSword } from '@pxlkit/gamification';

const img = document.querySelector('img')!;
const player = createAnimatedIconPlayer({ icon: FireSword, trigger: 'loop' });
const paint = () => {
  img.src = renderIconDataUri(getAnimationFrame(FireSword, player.getFrameIndex()));
};
paint();
const unsubscribe = player.subscribe(paint);
player.connect(img); // starts the clock; pauses while off-screen

// later
player.disconnect();
unsubscribe();
```

### Engine

| Export | Description |
| --- | --- |
| `renderIconSvg(icon, { appearance, color })` | The standalone SVG document an icon component renders (merged rects, tint filter) |
| `renderIconDataUri(icon, { appearance, color })` | The same SVG as a `data:image/svg+xml` URI for `<img src>` |
| `resolveIconLabel(icon, label?)` | Accessible name: the label, else the icon's name |
| `ICON_IMAGE_STYLE` | Inline style of the icon `<img>` (pixelated, inline-block, middle-aligned) |
| `createAnimatedIconPlayer(options)` | Playback state machine: frame clock, `loop` / `once` / `hover` / `appear` / `ping-pong`, off-screen pausing |
| `getAnimationFrame(icon, index)` | One frame of an animated icon as a static `PxlKitData` (palette overrides merged) |
| `resolveAnimationTrigger(icon, override?)` | Effective trigger (override → `icon.trigger` → legacy `icon.loop`) |
| `resolveFrameDuration(ms, { speed, fps })` | Effective frame duration (fps 1–60 wins over speed 0.1–10) |
| `animatedIconWrapperStyle(size)` | Inline style of the animated icon box |
| `createParallaxController(options)` | 3D motion engine: page-wide mouse tilt, peel-apart intro, click burst with spring-back, pixel particles |
| `resolveParallaxGeometry(size, overrides?)` | Default `perspective` / `layerGap` for a size |
| `parallaxContainerStyle`, `parallaxSceneStyle`, `parallaxLayerStyle`, `PARALLAX_CANVAS_STYLE` | Inline styles of the parallax structure |
| `parallaxParticleColors(icon)` | Distinct palette colours used for particles |
| `resolvePixelToastView(options)` | Classes, colours and icon settings of a `PixelToast` |
| `resolveToastAutoClose(visible, duration?)` | Auto-close delay in ms, or `null` |
| `PIXEL_TOAST_DEFAULTS`, `PIXEL_TOAST_POSITION_CLASSES`, `PIXEL_TOAST_CLOSE_LABEL` | Toast defaults |

Every style helper returns a `StyleMap` — camelCase CSS properties with unit-explicit string values — which React's `style`, Vue's `:style`, Angular's `[style]` and `Object.assign(element.style, …)` all accept as-is.

## React Components

| Component | Description |
| --- | --- |
| `<PxlKitIcon>` | Renders a static icon as an `<img>` backed by an SVG data URI |
| `<AnimatedPxlKitIcon>` | Renders an animated icon with frame playback |
| `<ParallaxPxlKitIcon>` | Renders a multi-layer 3D parallax icon with mouse tracking |
| `<PixelToast>` | Pixel-art styled toast notification |

## Utilities

Exported from both `@pxlkit/core` and `@pxlkit/core/vanilla`.

| Function | Description |
| --- | --- |
| `gridToPixels(icon)` | Converts grid + palette → `Pixel[]` array |
| `pixelsToGrid(pixels, size)` | Converts a pixel array back to grid + palette format |
| `gridToSvg(icon, options)` | Generates an SVG string from icon data |
| `pixelsToSvg(pixels, size, options)` | Generates SVG from a pixel array |
| `generateAnimatedSvg(icon, options?)` | Generates an animated SVG with CSS keyframes |
| `svgToDataUri(svg)` | Converts SVG to a `data:image/svg+xml` URI |
| `svgToBase64(svg)` | Converts SVG to a base64 data URI |
| `parseHexColor(hex)` | Parses `#RGB` / `#RRGGBB` / `#RRGGBBAA` → `{ color, opacity }` |
| `encodeHexColor(color, opacity?)` | Encodes a colour + opacity → `#RRGGBB` or `#RRGGBBAA` |
| `hexToRgb(hex)` | Converts a hex color to `{ r, g, b }` |
| `rgbToHex(r, g, b)` | Converts RGB values to a hex string |
| `adjustBrightness(hex, amount)` | Lightens or darkens a hex color |
| `getPerceivedBrightness(hex)` | Perceived brightness of a color (0–255) |
| `validateIconData(icon)` | Validates icon structure, returns errors |
| `isValidIconData(icon)` | Returns `true` if icon data is valid |
| `parseIconCode(code)` | Parses icon code string → `PxlKitData` |
| `parseAnyIconCode(code)` | Parses static or animated icon code |
| `generateIconCode(icon)` | Generates TypeScript code from icon data |
| `isAnimatedIcon(icon)` | Type guard for `AnimatedPxlKitData` |
| `isParallaxIcon(icon)` | Type guard for `ParallaxPxlKitData` |
| `animatedToFrameIcons(icon)` | Converts an animated icon to individual frames |
| `RETRO_PALETTES` | Built-in retro color palette presets |

## Types

```ts
// The icon data model — framework-agnostic, available from both entries.
import type {
  GridSize,
  Pixel,
  PxlKitData,
  AnyIcon,
  IconPack,
  IconAppearance,
  SvgOptions,
  AnimationFrame,
  AnimationTrigger,
  AnimatedPxlKitData,
  ParallaxLayer,
  ParallaxPxlKitData,
} from '@pxlkit/core/vanilla';

// React component props — root entry only.
import type {
  PxlKitProps,
  AnimatedPxlKitProps,
  ParallaxPxlKitProps,
  PixelToastProps,
} from '@pxlkit/core';
```

## Animation Triggers

| Trigger | Behavior |
| --- | --- |
| `loop` | Plays continuously in an infinite loop |
| `once` | Plays one time, stops on the last frame |
| `hover` | Plays only while the user hovers |
| `appear` | Plays once when 30 % of the icon first enters the viewport |
| `ping-pong` | Loops forward and backward alternating |

## How Icons Work

Every icon is a **16×16 character grid** paired with a **palette** that maps single characters to hex colors. The `.` character is always transparent.

```ts
import type { PxlKitData } from '@pxlkit/core/vanilla';

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

## Storybook

Explore every component and prop live: **[storybook.pxlkit.xyz](https://storybook.pxlkit.xyz)** — the `Core/` section has stories for `PxlKitIcon`, `AnimatedPxlKitIcon` (all 5 triggers), and `PixelToast` (every tone + position). The `Core / PxlKitIcon / Tint vs Solid — side by side` story is the clearest demo of how tinting preserves detail vs flattening to one colour.

## Related Packages

| Package | Description |
| --- | --- |
| [`@pxlkit/vue`](https://www.npmjs.com/package/@pxlkit/vue) | Vue 3 components on this engine |
| [`@pxlkit/angular`](https://www.npmjs.com/package/@pxlkit/angular) | Angular standalone components on this engine |
| [`@pxlkit/gamification`](https://www.npmjs.com/package/@pxlkit/gamification) | 51 icons — RPG, achievements, rewards |
| [`@pxlkit/feedback`](https://www.npmjs.com/package/@pxlkit/feedback) | 33 icons — alerts, status, notifications |
| [`@pxlkit/social`](https://www.npmjs.com/package/@pxlkit/social) | 43 icons — community, emojis, messaging |
| [`@pxlkit/weather`](https://www.npmjs.com/package/@pxlkit/weather) | 36 icons — climate, moon, temperature |
| [`@pxlkit/ui`](https://www.npmjs.com/package/@pxlkit/ui) | 41 icons — interface controls, navigation |
| [`@pxlkit/effects`](https://www.npmjs.com/package/@pxlkit/effects) | 12 animated VFX icons |
| [`@pxlkit/parallax`](https://www.npmjs.com/package/@pxlkit/parallax) | 10 multi-layer 3D parallax icons |
| [`@pxlkit/ui-kit`](https://www.npmjs.com/package/@pxlkit/ui-kit) | Retro React UI kit built on these icons |

## Documentation

Browse all icons, try the visual builder, and explore the full docs at **[pxlkit.xyz](https://pxlkit.xyz)**.

## License

[MIT License](https://github.com/joangeldelarosa/pxlkit/blob/main/LICENSE-CODE) — code package. See the [repo licensing overview](https://github.com/joangeldelarosa/pxlkit/blob/main/LICENSE) for split-license scope details.

Created by [Joangel De La Rosa](https://github.com/joangeldelarosa)

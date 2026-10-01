<p align="center">
  <img src="https://raw.githubusercontent.com/joangeldelarosa/pxlkit/main/apps/web/public/og-image.png" alt="Pxlkit" width="480" />
</p>

<h1 align="center">@pxlkit/angular</h1>

<p align="center">
  <strong>Angular standalone components for Pxlkit pixel art icons.</strong><br/>
  Static, animated and 3D parallax icons plus pixel toasts — the same rendering engine, markup and behaviour as the React and Vue components.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@pxlkit/angular"><img src="https://img.shields.io/npm/v/@pxlkit/angular?color=blue" alt="npm version" /></a>
  <a href="https://github.com/joangeldelarosa/pxlkit/blob/main/LICENSE-CODE"><img src="https://img.shields.io/badge/license-MIT-22c55e.svg" alt="MIT License" /></a>
  <img src="https://img.shields.io/badge/angular-20%20%7C%2021%20%7C%2022-DD0031?logo=angular&logoColor=white" alt="Angular 20 | 21 | 22" />
  <img src="https://img.shields.io/badge/typescript-strict-3178C6?logo=typescript&logoColor=white" alt="TypeScript strict" />
</p>

---

## Installation

```bash
npm install @pxlkit/angular @pxlkit/gamification
```

Add any of the icon packs you need — `@pxlkit/gamification`, `@pxlkit/feedback`, `@pxlkit/social`, `@pxlkit/weather`, `@pxlkit/ui`, `@pxlkit/effects`, `@pxlkit/parallax`. They are plain data and work in every framework.

> **Peer dependencies:** `@angular/core` and `@angular/common` 20, 21 or 22. React is never installed.

## Quick Start

```ts
import { Component } from '@angular/core';
import { AnimatedPxlKitIcon, PxlKitIcon } from '@pxlkit/angular';
import { FireSword, Trophy } from '@pxlkit/gamification';

@Component({
  selector: 'app-root',
  imports: [PxlKitIcon, AnimatedPxlKitIcon],
  template: `
    <!-- Default — original artwork palette -->
    <pxl-icon [icon]="trophy" [size]="32" />

    <!-- Tinted — preserves detail while shifting hue -->
    <pxl-icon [icon]="trophy" size="32" appearance="tinted" color="#FF4D4D" />

    <!-- Solid — every pixel one colour -->
    <pxl-icon [icon]="trophy" size="32" appearance="solid" color="#FFFFFF" ariaLabel="Trophy" />

    <!-- Animated, playing on hover at double speed -->
    <pxl-animated-icon [icon]="fireSword" [size]="48" trigger="hover" [speed]="2" />
  `,
})
export class App {
  protected readonly trophy = Trophy;
  protected readonly fireSword = FireSword;
}
```

Icons render as an `<img>` backed by an inline SVG data URI with `image-rendering: pixelated`: every source pixel stays crisp at every size, and the image is byte-identical to the React and Vue components'.

The components are standalone: add them to the `imports` of the components (or NgModules) that use them.

## Components

Every component is its own root element: `class`, `style` and other attributes set on `<pxl-icon>`, `<pxl-animated-icon>`, `<pxl-parallax-icon>` or `<pxl-toast>` apply to that element, and your `style` wins over the component's own layout styles.

Inputs accept attribute values as well as bindings — `size="48"`, `fps="12"`, a bare `interactive` or `playing` attribute, `shadow="false"` — and an optional input bound to `undefined` falls back to its default, exactly as an omitted React or Vue prop does.

### `<pxl-icon>` — `PxlKitIcon`

| Input | Type | Default | Description |
| --- | --- | --- | --- |
| `icon` | `PxlKitData` | — *(required)* | The icon data |
| `size` | `number` | `32` | Width and height in px |
| `appearance` | `'palette' \| 'tinted' \| 'solid'` | `'palette'` | Colour mode |
| `color` | `string` | — | Tint hue (`tinted`) or flat colour (`solid`); falls back to `#FFFFFF` |
| `ariaLabel` | `string` | icon name | Accessible name, rendered as the image `alt` |

The host is an exact `size`×`size` inline-block box (middle-aligned, never shrunk in flex rows) and the image fills it.

### `<pxl-animated-icon>` — `AnimatedPxlKitIcon`

| Input | Type | Default | Description |
| --- | --- | --- | --- |
| `icon` | `AnimatedPxlKitData` | — *(required)* | The animated icon data |
| `size` | `number` | `32` | Width and height in px |
| `appearance` | `'palette' \| 'tinted' \| 'solid'` | `'palette'` | Colour mode |
| `color` | `string` | — | Tint hue / flat colour |
| `trigger` | `'loop' \| 'once' \| 'hover' \| 'appear' \| 'ping-pong'` | the icon's | When it plays |
| `speed` | `number` | `1` | Speed multiplier, clamped to 0.1–10 |
| `fps` | `number` | — | Fixed frame rate, clamped to 1–60; wins over `speed` |
| `playing` | `boolean` | — | Explicit play / pause override (unset = trigger-driven) |
| `ariaLabel` | `string` | icon name | Accessible name of the frames |

Looping icons pause while they are off-screen. `appear` plays once when 30 % of the icon first enters the viewport.

### `<pxl-parallax-icon>` — `ParallaxPxlKitIcon`

| Input | Type | Default | Description |
| --- | --- | --- | --- |
| `icon` | `ParallaxPxlKitData` | — *(required)* | The multi-layer icon |
| `size` | `number` | `64` | Container size in px |
| `strength` | `number` | `18` | Mouse reactivity (max tilt `clamp(strength × 2, 4, 45)`°) |
| `appearance` / `color` | | | Colour mode applied to every layer |
| `smoothing` | `number` | `0.06` | Rotation lerp factor per frame |
| `perspective` | `number` | `max(200, size × 2.5)` | CSS perspective in px |
| `layerGap` | `number` | `max(12, size × 0.2)` | Z distance between layers in px |
| `shadow` | `boolean` | `true` | Soft depth shadows between layers |
| `interactive` | `boolean` | `true` | Click: explode the layers, jolt the scene, burst particles |
| `ariaLabel` | `string` | icon name | Accessible name (the host is `role="img"`) |

| Output | Payload | Description |
| --- | --- | --- |
| `activate` | `boolean` | Fired on click with the new active state |

```html
<pxl-parallax-icon [icon]="coolEmoji" [size]="128" [strength]="24" (activate)="pressed.set($event)" />
```

### `<pxl-toast>` — `PixelToast`

| Input | Type | Default | Description |
| --- | --- | --- | --- |
| `visible` | `boolean` | — *(required)* | Whether the toast is shown |
| `title` | `string` | — *(required)* | Heading line |
| `message` | `string` | — | Body text |
| `icon` | `PxlKitData` | — | Optional icon (an accent dot is shown without one) |
| `colorfulIcon` | `boolean` | `true` | Palette colours instead of flat `accentColor` |
| `iconSize` | `number` | `24` | Icon size in px |
| `position` | `'top-left' \| 'top-right' \| 'bottom-left' \| 'bottom-right'` | `'top-right'` | Screen corner |
| `duration` | `number` | `2200` | Auto-close delay in ms; `0` disables it |
| `showClose` | `boolean` | `true` | Show the close button |
| `bgColor`, `borderColor`, `textColor`, `accentColor` | `string` | retro palette | Colours |

| Output | Payload | Description |
| --- | --- | --- |
| `closed` | `void` | The close button was pressed or `duration` elapsed — set `visible` to `false` |

```html
<pxl-toast [visible]="saved()" title="Saved!" message="Your changes have been saved." [icon]="checkCircle" (closed)="saved.set(false)" />
```

While hidden, the `<pxl-toast>` host stays in the DOM, empty and `display: none`.

`PixelToast` is styled with Tailwind CSS utilities that ship inside `@pxlkit/core`. With Tailwind v4, add `@source "../node_modules/@pxlkit/core/dist";` to your stylesheet (adjust the relative path).

## Change detection, zones and SSR

- **Zoneless and zone.js.** The components are `OnPush` and signal-based, so they work in zoneless applications (the Angular 21+ default) and in zone.js applications alike.
- **Animation never triggers change detection.** Playback timers, the parallax animation loop and its page-wide mouse listener run outside the Angular zone, and each frame is written straight to the DOM. Outputs and the toast countdown run inside the zone, so their handlers update your view as usual.
- **Server rendering and hydration.** On the server the components render their complete markup — the first frame, the flat parallax stack, a visible toast — and start nothing. Timers, observers and animation frames start after the first render in the browser, so the output hydrates node for node with `provideClientHydration()`.

## Framework-agnostic API

Everything from [`@pxlkit/core/vanilla`](https://www.npmjs.com/package/@pxlkit/core) is re-exported, so one import source covers types, utilities and the rendering engine:

```ts
import { isAnimatedIcon, renderIconDataUri, type PxlKitData } from '@pxlkit/angular';
```

## Coming from React?

The components carry the same class names and render the same markup. Differences follow Angular conventions:

| React (`@pxlkit/core`) | Angular (`@pxlkit/angular`) |
| --- | --- |
| `<PxlKitIcon icon={trophy} />` | `<pxl-icon [icon]="trophy" />` |
| `className`, `style` props | `class` / `style` attributes on the host element |
| `aria-label` prop | `ariaLabel` input |
| `onActivate` | `(activate)` |
| `onClose` | `(closed)` |
| deprecated `colorful` / `solid` / `tint` | not supported — use `appearance` + `color` |

`PxlKitIcon` is the one structural difference: React renders a bare `<img>`, while `<pxl-icon>` is a box around the same `<img>`.

## Compatibility

The package is published in the Angular Package Format with partially compiled declarations, which the Angular CLI links at build time. It supports Angular 20, 21 and 22, with or without zone.js, server rendering and hydration included — verified in Angular CLI applications on each of them (Angular 22 with TypeScript 6).

## Related Packages

| Package | Description |
| --- | --- |
| [`@pxlkit/core`](https://www.npmjs.com/package/@pxlkit/core) | Rendering engine, utilities, types and the React components |
| [`@pxlkit/vue`](https://www.npmjs.com/package/@pxlkit/vue) | Vue 3 components on the same engine |
| [`@pxlkit/gamification`](https://www.npmjs.com/package/@pxlkit/gamification) and the other icon packs | 226+ icons, plain data |

## Documentation

Browse all icons and the full docs at **[pxlkit.xyz](https://pxlkit.xyz)**.

## License

[MIT License](https://github.com/joangeldelarosa/pxlkit/blob/main/LICENSE-CODE) — code package. See the [repo licensing overview](https://github.com/joangeldelarosa/pxlkit/blob/main/LICENSE) for split-license scope details.

Created by [Joangel De La Rosa](https://github.com/joangeldelarosa)

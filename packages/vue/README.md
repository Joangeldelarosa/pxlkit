<p align="center">
  <img src="https://raw.githubusercontent.com/joangeldelarosa/pxlkit/main/apps/web/public/og-image.png" alt="Pxlkit" width="480" />
</p>

<h1 align="center">@pxlkit/vue</h1>

<p align="center">
  <strong>Vue 3 components for Pxlkit pixel art icons.</strong><br/>
  Static, animated and 3D parallax icons plus pixel toasts — the same rendering engine, markup and behaviour as the React and Angular components.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@pxlkit/vue"><img src="https://img.shields.io/npm/v/@pxlkit/vue?color=blue" alt="npm version" /></a>
  <a href="https://github.com/joangeldelarosa/pxlkit/blob/main/LICENSE-CODE"><img src="https://img.shields.io/badge/license-MIT-22c55e.svg" alt="MIT License" /></a>
  <img src="https://img.shields.io/badge/vue-%E2%89%A53.3-42B883?logo=vuedotjs&logoColor=white" alt="Vue ≥3.3" />
  <img src="https://img.shields.io/badge/typescript-strict-3178C6?logo=typescript&logoColor=white" alt="TypeScript strict" />
</p>

---

## Installation

```bash
npm install @pxlkit/vue @pxlkit/gamification
```

Add any of the icon packs you need — `@pxlkit/gamification`, `@pxlkit/feedback`, `@pxlkit/social`, `@pxlkit/weather`, `@pxlkit/ui`, `@pxlkit/effects`, `@pxlkit/parallax`. They are plain data and work in every framework.

> **Peer dependency:** `vue ^3.3.0`. React is never installed.

## Quick Start

```vue
<script setup lang="ts">
import { PxlKitIcon, AnimatedPxlKitIcon } from '@pxlkit/vue';
import { Trophy, FireSword } from '@pxlkit/gamification';
</script>

<template>
  <!-- Default — original artwork palette -->
  <PxlKitIcon :icon="Trophy" :size="32" />

  <!-- Tinted — preserves detail while shifting hue -->
  <PxlKitIcon :icon="Trophy" :size="32" appearance="tinted" color="#FF4D4D" />

  <!-- Solid — every pixel one colour -->
  <PxlKitIcon :icon="Trophy" :size="32" appearance="solid" color="#FFFFFF" aria-label="Trophy" />

  <!-- Animated, playing on hover at double speed -->
  <AnimatedPxlKitIcon :icon="FireSword" :size="48" trigger="hover" :speed="2" />
</template>
```

Icons render as an `<img>` backed by an inline SVG data URI with `image-rendering: pixelated`: every source pixel stays crisp at every size, and the markup is byte-identical to the React component's.

## Components

Props are listed with their declared camelCase names; templates may use either `iconSize` or `icon-size`. `class`, `style` and any other attribute you set fall through to each component's root element (Vue attribute inheritance).

### `<PxlKitIcon>`

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `icon` | `PxlKitData` | — *(required)* | The icon data |
| `size` | `number` | `32` | Width and height in px |
| `appearance` | `'palette' \| 'tinted' \| 'solid'` | `'palette'` | Colour mode |
| `color` | `string` | — | Tint hue (`tinted`) or flat colour (`solid`); falls back to `#FFFFFF` |
| `aria-label` | `string` | icon name | Accessible name, rendered as the image `alt` |

### `<AnimatedPxlKitIcon>`

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `icon` | `AnimatedPxlKitData` | — *(required)* | The animated icon data |
| `size` | `number` | `32` | Width and height in px |
| `appearance` | `'palette' \| 'tinted' \| 'solid'` | `'palette'` | Colour mode |
| `color` | `string` | — | Tint hue / flat colour |
| `trigger` | `'loop' \| 'once' \| 'hover' \| 'appear' \| 'ping-pong'` | the icon's | When it plays |
| `speed` | `number` | `1` | Speed multiplier, clamped to 0.1–10 |
| `fps` | `number` | — | Fixed frame rate, clamped to 1–60; wins over `speed` |
| `playing` | `boolean` | — | Explicit play / pause override (unset = trigger-driven) |
| `aria-label` | `string` | icon name | Accessible name of the frames |

Looping icons pause while they are off-screen. `appear` plays once when 30 % of the icon first enters the viewport.

### `<ParallaxPxlKitIcon>`

| Prop | Type | Default | Description |
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
| `aria-label` | `string` | icon name | Accessible name |

| Event | Payload | Description |
| --- | --- | --- |
| `activate` | `boolean` | Fired on click with the new active state |

```vue
<ParallaxPxlKitIcon :icon="CoolEmoji" :size="128" :strength="24" @activate="(active) => (pressed = active)" />
```

### `<PixelToast>`

| Prop | Type | Default | Description |
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

| Event | Description |
| --- | --- |
| `close` | The close button was pressed or `duration` elapsed — set `visible` to `false` |

```vue
<PixelToast :visible="saved" title="Saved!" message="Your changes have been saved." :icon="CheckCircle" @close="saved = false" />
```

`PixelToast` is styled with Tailwind CSS utilities that ship inside `@pxlkit/core`. With Tailwind v4, add `@source "../node_modules/@pxlkit/core/dist";` to your stylesheet (adjust the relative path).

## Framework-agnostic API

Everything from [`@pxlkit/core/vanilla`](https://www.npmjs.com/package/@pxlkit/core) is re-exported, so one import source covers types, utilities and the rendering engine:

```ts
import { isAnimatedIcon, renderIconDataUri, type PxlKitData } from '@pxlkit/vue';
```

## SSR and Nuxt

Every component is SSR-safe: server rendering produces the complete markup — the first frame, the flat parallax stack, a visible toast — which hydrates without a mismatch, and timers, observers and animation frames only start once mounted in the browser. In Nuxt, import the components where you use them (or register them in a plugin with `nuxtApp.vueApp.component(...)`).

## Compatibility

Vue 3.3 and later — verified on Vue 3.3 and 3.5, in Vite and Nuxt 4 applications. The component types are spelled with the `DefineComponent` signature every supported Vue version shares, so `vue-tsc` checks props and events the same way on all of them.

## Coming from React?

The components carry the same names and render the same markup. Differences follow Vue conventions:

| React (`@pxlkit/core`) | Vue (`@pxlkit/vue`) |
| --- | --- |
| `className`, `style` props | `class` / `style` attributes (fall through) |
| `onActivate` | `@activate` |
| `onClose` | `@close` |
| deprecated `colorful` / `solid` / `tint` | not supported — use `appearance` + `color` |

## Related Packages

| Package | Description |
| --- | --- |
| [`@pxlkit/core`](https://www.npmjs.com/package/@pxlkit/core) | Rendering engine, utilities, types and the React components |
| [`@pxlkit/angular`](https://www.npmjs.com/package/@pxlkit/angular) | Angular standalone components on the same engine |
| [`@pxlkit/gamification`](https://www.npmjs.com/package/@pxlkit/gamification) and the other icon packs | 226+ icons, plain data |

## Documentation

Browse all icons and the full docs at **[pxlkit.xyz](https://pxlkit.xyz)**.

## License

[MIT License](https://github.com/joangeldelarosa/pxlkit/blob/main/LICENSE-CODE) — code package. See the [repo licensing overview](https://github.com/joangeldelarosa/pxlkit/blob/main/LICENSE) for split-license scope details.

Created by [Joangel De La Rosa](https://github.com/joangeldelarosa)

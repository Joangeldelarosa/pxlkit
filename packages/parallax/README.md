<p align="center">
  <img src="https://raw.githubusercontent.com/joangeldelarosa/pxlkit/main/apps/web/public/og-image.png" alt="Pxlkit pixel-art icons" width="480" />
</p>

<h1 align="center">@pxlkit/parallax</h1>

<p align="center">
  <strong>Multi-layer 3D parallax pixel art icons for Pxlkit.</strong><br/>
  Interactive depth-based mouse-tracking icons with 3–5 layers of pixel art that respond to cursor movement.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@pxlkit/parallax"><img src="https://img.shields.io/npm/v/@pxlkit/parallax?color=blue" alt="npm version" /></a>
  <a href="https://github.com/joangeldelarosa/pxlkit/blob/main/LICENSE-ASSETS"><img src="https://img.shields.io/badge/license-asset%20terms-blue.svg" alt="Pxlkit Asset License" /></a>
  <img src="https://img.shields.io/badge/icons-10%20parallax-FFD700?style=flat" alt="10 parallax icons" />
</p>

---

## Overview

`@pxlkit/parallax` is a themed icon pack for the [Pxlkit](https://pxlkit.xyz) ecosystem containing **10 multi-layer 3D parallax icons**. Each icon is composed of 3–5 independent pixel art layers that move at different speeds based on mouse position, creating an interactive depth effect.

## Installation

Install the pack next to the components for your framework:

```bash
npm install @pxlkit/core @pxlkit/parallax      # React
npm install @pxlkit/vue @pxlkit/parallax       # Vue 3
npm install @pxlkit/angular @pxlkit/parallax   # Angular
```

> The pack is plain data (`PxlKitData` objects typed by `@pxlkit/core`); the React components in `@pxlkit/core`, [`@pxlkit/vue`](https://www.npmjs.com/package/@pxlkit/vue) or [`@pxlkit/angular`](https://www.npmjs.com/package/@pxlkit/angular) render it.

## Quick Start

### React

```tsx
import { ParallaxPxlKitIcon } from '@pxlkit/core';
import { CoolEmoji } from '@pxlkit/parallax';

// Interactive parallax — layers move with the mouse
<ParallaxPxlKitIcon icon={CoolEmoji} size={64} />

// Custom depth strength and perspective
<ParallaxPxlKitIcon icon={CoolEmoji} size={96} strength={24} perspective={300} />

// Non-interactive (static 3D)
<ParallaxPxlKitIcon icon={CoolEmoji} size={64} interactive={false} />
```

### Vue

```vue
<script setup lang="ts">
import { ParallaxPxlKitIcon } from '@pxlkit/vue';
import { CoolEmoji } from '@pxlkit/parallax';
</script>

<template>
  <ParallaxPxlKitIcon :icon="CoolEmoji" :size="64" />
  <ParallaxPxlKitIcon :icon="CoolEmoji" :size="96" :strength="24" :perspective="300" />
  <ParallaxPxlKitIcon :icon="CoolEmoji" :size="64" :interactive="false" />
</template>
```

### Angular

```ts
import { Component } from '@angular/core';
import { ParallaxPxlKitIcon } from '@pxlkit/angular';
import { CoolEmoji } from '@pxlkit/parallax';

@Component({
  selector: 'app-mascot',
  imports: [ParallaxPxlKitIcon],
  template: `
    <pxl-parallax-icon [icon]="coolEmoji" [size]="64" />
    <pxl-parallax-icon [icon]="coolEmoji" [size]="96" [strength]="24" [perspective]="300" />
    <pxl-parallax-icon [icon]="coolEmoji" [size]="64" [interactive]="false" />
  `,
})
export class Mascot {
  protected readonly coolEmoji = CoolEmoji;
}
```

## Icons

All icons in this pack are **multi-layer parallax** with interactive mouse tracking:

| Icon | Name | Description |
| --- | --- | --- |
| 😎 | `CoolEmoji` | Cool emoji with sunglasses |
| ❤️ | `PixelHeart` | Layered pixel heart |
| 📺 | `RetroTV` | Retro television set |
| 🚀 | `PixelRocket` | Pixel rocket ship |
| 👻 | `GhostFriend` | Friendly pixel ghost |
| 💀 | `NeonSkull` | Neon-styled skull |
| 🔮 | `MagicOrb` | Magic orb with glow |
| 👑 | `PixelCrown` | Royal pixel crown |
| 🕹️ | `RetroJoystick` | Retro game joystick |
| 👁️ | `CyberEye` | Cyberpunk eye |

## Using the Icon Pack

`ParallaxPack` is an array of every parallax icon:

```tsx
// React
import { ParallaxPxlKitIcon } from '@pxlkit/core';
import { ParallaxPack } from '@pxlkit/parallax';

{ParallaxPack.map((icon) => (
  <ParallaxPxlKitIcon key={icon.name} icon={icon} size={64} />
))}
```

```vue
<!-- Vue -->
<ParallaxPxlKitIcon v-for="icon in ParallaxPack" :key="icon.name" :icon="icon" :size="64" />
```

```html
<!-- Angular: the component exposes `icons = ParallaxPack` -->
@for (icon of icons; track icon.name) {
  <pxl-parallax-icon [icon]="icon" [size]="64" />
}
```

## Parallax Controls

The same options exist in React, Vue and Angular:

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `icon` | `ParallaxPxlKitData` | — *(required)* | The parallax icon data |
| `size` | `number` | `64` | Container size in px |
| `strength` | `number` | `18` | Mouse reactivity (max tilt `clamp(strength × 2, 4, 45)`°) |
| `appearance` | `'palette' \| 'tinted' \| 'solid'` | `'palette'` | Colour mode applied to every layer |
| `color` | `string` | — | Tint hue / flat colour for `tinted` / `solid` |
| `smoothing` | `number` | `0.06` | Rotation lerp factor per frame |
| `perspective` | `number` | `max(200, size × 2.5)` | CSS perspective in px |
| `layerGap` | `number` | `max(12, size × 0.2)` | Z distance between layers in px |
| `shadow` | `boolean` | `true` | Soft depth shadows between layers |
| `interactive` | `boolean` | `true` | Click to explode the layers, jolt the scene and burst particles |

A click toggles a hue-shifted active state, reported by `onActivate` (React), `@activate` (Vue) or `(activate)` (Angular).

## How Parallax Icons Work

Each parallax icon is a stack of **layers**, back to front. Every layer is a complete 16×16 icon — static or animated. The renderer spaces the layers evenly along the Z axis in that order (`layerGap` apart) and tilts the whole stack toward the mouse, creating a convincing 3D depth effect.

```ts
import type { ParallaxPxlKitData } from '@pxlkit/core';

const icon: ParallaxPxlKitData = {
  name: 'cool-emoji',
  size: 16,
  category: 'parallax',
  layers: [
    { icon: shadowLayer, depth: 2 },   // back — a PxlKitData icon
    { icon: faceLayer, depth: 0 },     // middle
    { icon: glassesLayer, depth: -1 }, // front — may also be an AnimatedPxlKitData icon
  ],
  tags: ['emoji', 'cool'],
  author: 'pxlkit',
};
```

## Related Packages

| Package | Description |
| --- | --- |
| [`@pxlkit/core`](https://www.npmjs.com/package/@pxlkit/core) | Rendering engine and React components |
| [`@pxlkit/vue`](https://www.npmjs.com/package/@pxlkit/vue) | Vue 3 components |
| [`@pxlkit/angular`](https://www.npmjs.com/package/@pxlkit/angular) | Angular standalone components |
| [`@pxlkit/gamification`](https://www.npmjs.com/package/@pxlkit/gamification) | 51 icons — RPG, achievements, rewards |
| [`@pxlkit/feedback`](https://www.npmjs.com/package/@pxlkit/feedback) | 33 icons — alerts, status, notifications |
| [`@pxlkit/social`](https://www.npmjs.com/package/@pxlkit/social) | 43 icons — community, emojis, messaging |
| [`@pxlkit/weather`](https://www.npmjs.com/package/@pxlkit/weather) | 36 icons — climate, moon, temperature |
| [`@pxlkit/ui`](https://www.npmjs.com/package/@pxlkit/ui) | 41 icons — interface controls, navigation |
| [`@pxlkit/effects`](https://www.npmjs.com/package/@pxlkit/effects) | 12 animated VFX icons |

## Documentation

Browse all icons and try the visual builder at **[pxlkit.xyz](https://pxlkit.xyz)**.

## License

[Pxlkit Asset License](https://github.com/joangeldelarosa/pxlkit/blob/main/LICENSE-ASSETS) — free with attribution, with paid no-attribution terms in [COMMERCIAL_TERMS](https://github.com/joangeldelarosa/pxlkit/blob/main/COMMERCIAL_TERMS).

Created by [Joangel De La Rosa](https://github.com/joangeldelarosa)

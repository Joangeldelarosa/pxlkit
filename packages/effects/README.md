<p align="center">
  <img src="https://raw.githubusercontent.com/joangeldelarosa/pxlkit/main/apps/web/public/og-image.png" alt="Pxlkit pixel-art icons" width="480" />
</p>

<h1 align="center">@pxlkit/effects</h1>

<p align="center">
  <strong>Animated visual effect icons for Pxlkit.</strong><br/>
  Explosions, signals, particles, glows, and VFX — all as animated pixel art SVGs.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@pxlkit/effects"><img src="https://img.shields.io/npm/v/@pxlkit/effects?color=blue" alt="npm version" /></a>
  <a href="https://github.com/joangeldelarosa/pxlkit/blob/main/LICENSE-ASSETS"><img src="https://img.shields.io/badge/license-asset%20terms-blue.svg" alt="Pxlkit Asset License" /></a>
  <img src="https://img.shields.io/badge/icons-12%20animated-FFD700?style=flat" alt="12 animated icons" />
</p>

---

## Overview

`@pxlkit/effects` is a themed icon pack for the [Pxlkit](https://pxlkit.xyz) ecosystem containing **12 animated visual effect icons**. Each icon is a multi-frame animated SVG rendered at pixel-perfect quality.

This pack focuses on VFX and particle-style effects — explosions, radar pings, flames, shockwaves, and more.

## Installation

Install the pack next to the components for your framework:

```bash
npm install @pxlkit/core @pxlkit/effects      # React
npm install @pxlkit/vue @pxlkit/effects       # Vue 3
npm install @pxlkit/angular @pxlkit/effects   # Angular
```

> The pack is plain data (`PxlKitData` objects typed by `@pxlkit/core`); the React components in `@pxlkit/core`, [`@pxlkit/vue`](https://www.npmjs.com/package/@pxlkit/vue) or [`@pxlkit/angular`](https://www.npmjs.com/package/@pxlkit/angular) render it.

## Quick Start

### React

```tsx
import { AnimatedPxlKitIcon } from '@pxlkit/core';
import { ExplosionBurst } from '@pxlkit/effects';

// Auto-playing animated effect
<AnimatedPxlKitIcon icon={ExplosionBurst} size={48} />

// Play on hover only
<AnimatedPxlKitIcon icon={ExplosionBurst} size={48} trigger="hover" />
```

### Vue

```vue
<script setup lang="ts">
import { AnimatedPxlKitIcon } from '@pxlkit/vue';
import { ExplosionBurst } from '@pxlkit/effects';
</script>

<template>
  <AnimatedPxlKitIcon :icon="ExplosionBurst" :size="48" />
  <AnimatedPxlKitIcon :icon="ExplosionBurst" :size="48" trigger="hover" />
</template>
```

### Angular

```ts
import { Component } from '@angular/core';
import { AnimatedPxlKitIcon } from '@pxlkit/angular';
import { ExplosionBurst } from '@pxlkit/effects';

@Component({
  selector: 'app-effects',
  imports: [AnimatedPxlKitIcon],
  template: `
    <pxl-animated-icon [icon]="explosionBurst" [size]="48" />
    <pxl-animated-icon [icon]="explosionBurst" [size]="48" trigger="hover" />
  `,
})
export class Effects {
  protected readonly explosionBurst = ExplosionBurst;
}
```

## Icons

All icons in this pack are **animated** with multi-frame playback:

| Icon | Name | Description |
| --- | --- | --- |
| 💥 | `ExplosionBurst` | Animated explosion burst effect |
| 📡 | `RadarPing` | Radar ping / sonar signal |
| 🔥 | `Flame` | Flickering pixel flame |
| ✨ | `GlowPulse` | Pulsing glow effect |
| 🌧️ | `PixelRain` | Falling pixel rain particles |
| 🌊 | `Shockwave` | Expanding shockwave ring |
| ⚡ | `SparkBurst` | Sparkling burst of particles |
| 📺 | `ScanSweep` | Scanning sweep line effect |
| ⭐ | `Twinkle` | Twinkling star sparkle |
| 🫧 | `Ripple` | Expanding ripple rings |
| 💡 | `NeonStrobe` | Flashing neon strobe light |
| 🌀 | `PortalSpin` | Spinning portal vortex |

## Using the Icon Pack

Every effect is animated, so `EffectsPack.icons` maps straight onto the animated component:

```tsx
// React
import { AnimatedPxlKitIcon } from '@pxlkit/core';
import { EffectsPack } from '@pxlkit/effects';

{EffectsPack.icons.map((icon) => (
  <AnimatedPxlKitIcon key={icon.name} icon={icon} size={32} />
))}
```

```vue
<!-- Vue -->
<AnimatedPxlKitIcon v-for="icon in EffectsPack.icons" :key="icon.name" :icon="icon" :size="32" />
```

```html
<!-- Angular: the component exposes `effects = EffectsPack.icons` -->
@for (icon of effects; track icon.name) {
  <pxl-animated-icon [icon]="icon" [size]="32" />
}
```

## Animation Controls

The same options exist in every framework (`trigger`, `speed`, `fps`, `playing`):

```tsx
// Loop continuously (the icon's own trigger)
<AnimatedPxlKitIcon icon={Flame} size={48} />

// Play once
<AnimatedPxlKitIcon icon={Flame} size={48} trigger="once" />

// Play on hover
<AnimatedPxlKitIcon icon={Flame} size={48} trigger="hover" />

// Custom speed (0.5 = half speed) or a fixed frame rate
<AnimatedPxlKitIcon icon={Flame} size={48} speed={0.5} />
<AnimatedPxlKitIcon icon={Flame} size={48} fps={12} />
```

In Vue: `<AnimatedPxlKitIcon :icon="Flame" :size="48" trigger="hover" :speed="0.5" />`. In Angular: `<pxl-animated-icon [icon]="flame" [size]="48" trigger="hover" [speed]="0.5" />`.

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
| [`@pxlkit/parallax`](https://www.npmjs.com/package/@pxlkit/parallax) | 10 multi-layer 3D parallax icons |

## Documentation

Browse all icons and try the visual builder at **[pxlkit.xyz](https://pxlkit.xyz)**.

## License

[Pxlkit Asset License](https://github.com/joangeldelarosa/pxlkit/blob/main/LICENSE-ASSETS) — free with attribution, with paid no-attribution terms in [COMMERCIAL_TERMS](https://github.com/joangeldelarosa/pxlkit/blob/main/COMMERCIAL_TERMS).

Created by [Joangel De La Rosa](https://github.com/joangeldelarosa)

<p align="center">
  <img src="https://raw.githubusercontent.com/joangeldelarosa/pxlkit/main/apps/web/public/og-image.png" alt="Pxlkit" width="480" />
</p>

<h1 align="center">@pxlkit/weather</h1>

<p align="center">
  <strong>Weather and nature icon pack for Pxlkit.</strong><br/>
  Sun, rain, clouds, moon phases, storms, and temperature — static and animated pixel art icons for weather conditions.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@pxlkit/weather"><img src="https://img.shields.io/npm/v/@pxlkit/weather?color=blue" alt="npm version" /></a>
  <a href="https://github.com/joangeldelarosa/pxlkit/blob/main/LICENSE-ASSETS"><img src="https://img.shields.io/badge/license-asset%20terms-blue.svg" alt="Pxlkit Asset License" /></a>
  <img src="https://img.shields.io/badge/icons-36-FFD700?style=flat" alt="36 icons" />
</p>

---

## Overview

`@pxlkit/weather` is a themed icon pack for the [Pxlkit](https://pxlkit.xyz) ecosystem containing **36 icons** (30 static + 6 animated) designed for weather conditions, seasons, temperature, and natural phenomena.

## Installation

Install the pack next to the components for your framework:

```bash
npm install @pxlkit/core @pxlkit/weather      # React
npm install @pxlkit/vue @pxlkit/weather       # Vue 3
npm install @pxlkit/angular @pxlkit/weather   # Angular
```

> The pack is plain data (`PxlKitData` objects typed by `@pxlkit/core`); the React components in `@pxlkit/core`, [`@pxlkit/vue`](https://www.npmjs.com/package/@pxlkit/vue) or [`@pxlkit/angular`](https://www.npmjs.com/package/@pxlkit/angular) render it.

## Quick Start

### React

```tsx
import { PxlKitIcon, AnimatedPxlKitIcon } from '@pxlkit/core';
import { Sun, SpinningTornado } from '@pxlkit/weather';

// Static weather icon
<PxlKitIcon icon={Sun} size={32} />

// Animated tornado
<AnimatedPxlKitIcon icon={SpinningTornado} size={48} />
```

### Vue

```vue
<script setup lang="ts">
import { PxlKitIcon, AnimatedPxlKitIcon } from '@pxlkit/vue';
import { Sun, SpinningTornado } from '@pxlkit/weather';
</script>

<template>
  <PxlKitIcon :icon="Sun" :size="32" />
  <AnimatedPxlKitIcon :icon="SpinningTornado" :size="48" />
</template>
```

### Angular

```ts
import { Component } from '@angular/core';
import { AnimatedPxlKitIcon, PxlKitIcon } from '@pxlkit/angular';
import { SpinningTornado, Sun } from '@pxlkit/weather';

@Component({
  selector: 'app-forecast',
  imports: [PxlKitIcon, AnimatedPxlKitIcon],
  template: `
    <pxl-icon [icon]="sun" [size]="32" />
    <pxl-animated-icon [icon]="spinningTornado" [size]="48" />
  `,
})
export class Forecast {
  protected readonly sun = Sun;
  protected readonly spinningTornado = SpinningTornado;
}
```

## Icons

### Static Icons (30)

| Icon | Name | Description |
| --- | --- | --- |
| ☀️ | `Sun` | Sunny / clear sky |
| 🌙 | `Moon` | Night / moon |
| ☁️ | `Cloud` | Cloudy |
| ⛅ | `CloudSun` | Partly cloudy |
| 🌧️ | `Rain` | Rainy |
| ❄️ | `Snow` | Snowy |
| ⛈️ | `Thunder` | Thunderstorm |
| 💨 | `Wind` | Windy |
| 🌡️ | `Thermometer` | Temperature gauge |
| 💧 | `Droplet` | Water drop / humidity |
| 🌪️ | `Tornado` | Tornado / cyclone |
| 🌫️ | `Fog` | Foggy / misty |
| 🌈 | `Rainbow` | Rainbow |
| 🌅 | `Sunrise` | Sunrise / dawn |
| 🌇 | `Sunset` | Sunset / dusk |
| ☂️ | `Umbrella` | Umbrella / rain protection |
| ❄️ | `Snowflake` | Snowflake crystal |
| 🧊 | `Hail` | Hailstorm |
| 🧭 | `Compass` | Wind direction / compass |
| 🌃 | `ClearNight` | Clear night sky |
| 🌥️ | `CloudyNight` | Cloudy night |
| 🌧️ | `RainNight` | Rainy night |
| 🌨️ | `SnowNight` | Snowy night |
| 🔥 | `HotTemp` | Hot temperature |
| 🥶 | `ColdTemp` | Cold temperature |
| 🌑 | `Eclipse` | Solar/lunar eclipse |
| 🌙 | `CrescentMoon` | Crescent moon phase |
| 🌕 | `FullMoon` | Full moon |
| 🌃 | `StarryNight` | Starry night sky |
| 🌦️ | `Drizzle` | Light rain / drizzle |

### Animated Icons (6)

| Icon | Name | Description |
| --- | --- | --- |
| 🌪️ | `SpinningTornado` | Spinning tornado vortex |
| 🌫️ | `DriftingFog` | Drifting fog clouds |
| ❄️ | `FallingSnow` | Falling snowflakes |
| ⚡ | `LightningStrike` | Lightning bolt strike |
| ☀️ | `PulsingSun` | Pulsing sun rays |
| 💨 | `WindGust` | Wind gust effect |

## Using the Icon Pack

`WeatherPack.icons` holds every icon of the pack, static and animated; `isAnimatedIcon` tells them apart.

```tsx
// React
import { PxlKitIcon, AnimatedPxlKitIcon, isAnimatedIcon } from '@pxlkit/core';
import { WeatherPack } from '@pxlkit/weather';

{WeatherPack.icons.map((icon) =>
  isAnimatedIcon(icon) ? (
    <AnimatedPxlKitIcon key={icon.name} icon={icon} size={32} />
  ) : (
    <PxlKitIcon key={icon.name} icon={icon} size={32} />
  ),
)}
```

```vue
<!-- Vue -->
<script setup lang="ts">
import { PxlKitIcon, AnimatedPxlKitIcon, isAnimatedIcon } from '@pxlkit/vue';
import { WeatherPack } from '@pxlkit/weather';
</script>

<template>
  <template v-for="icon in WeatherPack.icons" :key="icon.name">
    <AnimatedPxlKitIcon v-if="isAnimatedIcon(icon)" :icon="icon" :size="32" />
    <PxlKitIcon v-else :icon="icon" :size="32" />
  </template>
</template>
```

```html
<!-- Angular: the component exposes `icons = WeatherPack.icons` and `isAnimated = isAnimatedIcon` -->
@for (icon of icons; track icon.name) {
  @if (isAnimated(icon)) {
    <pxl-animated-icon [icon]="icon" [size]="32" />
  } @else {
    <pxl-icon [icon]="icon" [size]="32" />
  }
}
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
| [`@pxlkit/ui`](https://www.npmjs.com/package/@pxlkit/ui) | 41 icons — interface controls, navigation |
| [`@pxlkit/effects`](https://www.npmjs.com/package/@pxlkit/effects) | 12 animated VFX icons |
| [`@pxlkit/parallax`](https://www.npmjs.com/package/@pxlkit/parallax) | 10 multi-layer 3D parallax icons |

## Documentation

Browse all icons and try the visual builder at **[pxlkit.xyz](https://pxlkit.xyz)**.

## License

[Pxlkit Asset License](https://github.com/joangeldelarosa/pxlkit/blob/main/LICENSE-ASSETS) — free with attribution, with paid no-attribution terms in [COMMERCIAL_TERMS](https://github.com/joangeldelarosa/pxlkit/blob/main/COMMERCIAL_TERMS).

Created by [Joangel De La Rosa](https://github.com/joangeldelarosa)

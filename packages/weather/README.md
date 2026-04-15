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

```bash
npm install @pxlkit/core @pxlkit/weather
```

> `@pxlkit/core` is required as a dependency for rendering components.

## Quick Start

```tsx
import { PxlKitIcon, AnimatedPxlKitIcon } from '@pxlkit/core';
import { Sun, SpinningTornado } from '@pxlkit/weather';

// Static weather icon
<PxlKitIcon icon={Sun} size={32} colorful />

// Animated tornado
<AnimatedPxlKitIcon icon={SpinningTornado} size={48} colorful />
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

```tsx
import { PxlKitIcon, AnimatedPxlKitIcon, isAnimatedIcon } from '@pxlkit/core';
import { WeatherPack } from '@pxlkit/weather';

// Render all weather icons
{WeatherPack.icons.map((icon) =>
  isAnimatedIcon(icon) ? (
    <AnimatedPxlKitIcon key={icon.name} icon={icon} size={32} colorful />
  ) : (
    <PxlKitIcon key={icon.name} icon={icon} size={32} colorful />
  )
)}
```

## Related Packages

| Package | Description |
| --- | --- |
| [`@pxlkit/core`](https://www.npmjs.com/package/@pxlkit/core) | Core rendering engine (required) |
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

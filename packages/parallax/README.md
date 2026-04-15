<p align="center">
  <img src="https://raw.githubusercontent.com/joangeldelarosa/pxlkit/main/apps/web/public/og-image.png" alt="Pxlkit" width="480" />
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

```bash
npm install @pxlkit/core @pxlkit/parallax
```

> `@pxlkit/core` is required as a dependency for rendering components.

## Quick Start

```tsx
import { ParallaxPxlKitIcon } from '@pxlkit/core';
import { CoolEmoji } from '@pxlkit/parallax';

// Interactive parallax — layers move with mouse
<ParallaxPxlKitIcon icon={CoolEmoji} size={64} colorful />

// Custom depth strength and perspective
<ParallaxPxlKitIcon icon={CoolEmoji} size={96} strength={24} perspective={300} />

// Non-interactive (static 3D)
<ParallaxPxlKitIcon icon={CoolEmoji} size={64} interactive={false} />
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

```tsx
import { ParallaxPxlKitIcon } from '@pxlkit/core';
import { ParallaxPack } from '@pxlkit/parallax';

// Render all parallax icons
{ParallaxPack.map((icon) => (
  <ParallaxPxlKitIcon key={icon.name} icon={icon} size={64} colorful />
))}
```

## Parallax Controls

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `icon` | `ParallaxPxlKitData` | — | The parallax icon data |
| `size` | `number` | — | Icon size in pixels |
| `colorful` | `boolean` | `false` | Render with original palette colors |
| `strength` | `number` | `16` | Depth movement strength in pixels |
| `perspective` | `number` | `400` | CSS perspective value for 3D depth |
| `interactive` | `boolean` | `true` | Enable/disable mouse tracking |

## How Parallax Icons Work

Each parallax icon contains multiple **layers**, each with its own 16×16 grid and depth value. Layers closer to the viewer move more with mouse movement, creating a convincing 3D depth effect.

```ts
import type { ParallaxPxlKitData, ParallaxLayer } from '@pxlkit/core';

const icon: ParallaxPxlKitData = {
  name: 'cool-emoji',
  size: 16,
  category: 'parallax',
  layers: [
    { grid: [/* 16 rows */], depth: 0 },   // Background layer
    { grid: [/* 16 rows */], depth: 0.5 },  // Mid layer
    { grid: [/* 16 rows */], depth: 1 },    // Foreground layer
  ],
  palette: { Y: '#FFD700', B: '#000000' },
  tags: ['emoji', 'cool'],
  author: 'pxlkit',
};
```

## Related Packages

| Package | Description |
| --- | --- |
| [`@pxlkit/core`](https://www.npmjs.com/package/@pxlkit/core) | Core rendering engine (required) |
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

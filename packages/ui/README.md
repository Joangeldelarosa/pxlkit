<p align="center">
  <img src="https://raw.githubusercontent.com/joangeldelarosa/pxlkit/main/apps/web/public/og-image.png" alt="Pxlkit" width="480" />
</p>

<h1 align="center">@pxlkit/ui</h1>

<p align="center">
  <strong>UI & interface icon pack for Pxlkit.</strong><br/>
  Tools, controls, navigation, and editor elements — static and animated pixel art icons for user interfaces.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@pxlkit/ui"><img src="https://img.shields.io/npm/v/@pxlkit/ui?color=blue" alt="npm version" /></a>
  <a href="https://github.com/joangeldelarosa/pxlkit/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-Pxlkit%20v1.0-blue.svg" alt="Pxlkit License" /></a>
  <img src="https://img.shields.io/badge/icons-40-FFD700?style=flat" alt="40 icons" />
</p>

---

## Overview

`@pxlkit/ui` is a themed icon pack for the [Pxlkit](https://pxlkit.xyz) ecosystem containing **40 icons** (35 static + 5 animated) designed for interface controls, editor tools, navigation, and common UI actions.

## Installation

```bash
npm install @pxlkit/core @pxlkit/ui
```

> `@pxlkit/core` is required as a dependency for rendering components.

## Quick Start

```tsx
import { PxlKitIcon, AnimatedPxlKitIcon } from '@pxlkit/core';
import { Home, LoadingSpinner } from '@pxlkit/ui';

// Static UI icon
<PxlKitIcon icon={Home} size={32} colorful />

// Animated loading spinner
<AnimatedPxlKitIcon icon={LoadingSpinner} size={32} colorful />
```

## Icons

### Static Icons (35)

| Icon | Name | Description |
| --- | --- | --- |
| ✏️ | `Pencil` | Edit / draw |
| 🧹 | `Eraser` | Erase / clear |
| 🪣 | `PaintBucket` | Fill / paint |
| 💉 | `Eyedropper` | Color picker |
| ▶️ | `Play` | Play / start |
| ⏸️ | `Pause` | Pause |
| ↩️ | `Undo` | Undo action |
| ↪️ | `Redo` | Redo action |
| ✖️ | `Close` | Close / dismiss |
| ✔️ | `Check` | Confirm / done |
| 🎨 | `Palette` | Color palette |
| 🤖 | `Robot` | AI / automation |
| 📦 | `Package` | Package / module |
| ✨ | `SparkleSmall` | Sparkle / new |
| ➡️ | `ArrowRight` | Arrow right / next |
| 🏠 | `Home` | Home / dashboard |
| 🔍 | `Search` | Search / find |
| ⚙️ | `Settings` | Settings |
| ⚙️ | `Gear` | Gear / config |
| ☰ | `Menu` | Menu / hamburger |
| ⋯ | `DotsMenu` | More options |
| 📊 | `Grid` | Grid view |
| 📋 | `List` | List view |
| 🗑️ | `Trash` | Delete / remove |
| ✏️ | `Edit` | Edit / modify |
| 📋 | `Copy` | Copy / duplicate |
| 🔗 | `ChainLink` | Link / chain |
| ↗️ | `ExternalLink` | External link |
| ⬇️ | `Download` | Download |
| ⬆️ | `Upload` | Upload |
| 🕐 | `History` | History / recent |
| 📅 | `Calendar` | Calendar / date |
| 🕐 | `Clock` | Clock / time |
| 🔓 | `LockOpen` | Unlocked |
| 🔒 | `Lock` | Locked |
| ☁️ | `CloudSync` | Cloud sync |

### Animated Icons (5)

| Icon | Name | Description |
| --- | --- | --- |
| 🔄 | `LoadingSpinner` | Spinning loading indicator |
| 🔴 | `PulsingDot` | Pulsing status dot |
| ⬇️ | `BouncingArrow` | Bouncing arrow |
| 🔔 | `ShakingBell` | Shaking notification bell |
| ⚙️ | `SpinningGear` | Spinning gear / processing |

## Using the Icon Pack

```tsx
import { PxlKitIcon, AnimatedPxlKitIcon, isAnimatedIcon } from '@pxlkit/core';
import { UiPack } from '@pxlkit/ui';

// Render all UI icons
{UiPack.icons.map((icon) =>
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
| [`@pxlkit/ui-kit`](https://www.npmjs.com/package/@pxlkit/ui-kit) | 40+ retro React UI components |
| [`@pxlkit/gamification`](https://www.npmjs.com/package/@pxlkit/gamification) | 48 icons — RPG, achievements, rewards |
| [`@pxlkit/feedback`](https://www.npmjs.com/package/@pxlkit/feedback) | 33 icons — alerts, status, notifications |
| [`@pxlkit/social`](https://www.npmjs.com/package/@pxlkit/social) | 43 icons — community, emojis, messaging |
| [`@pxlkit/weather`](https://www.npmjs.com/package/@pxlkit/weather) | 34 icons — climate, moon, temperature |
| [`@pxlkit/effects`](https://www.npmjs.com/package/@pxlkit/effects) | 6 animated VFX icons |
| [`@pxlkit/parallax`](https://www.npmjs.com/package/@pxlkit/parallax) | 10 multi-layer 3D parallax icons |

## Documentation

Browse all icons and try the visual builder at **[pxlkit.xyz](https://pxlkit.xyz)**.

## License

[Pxlkit License v1.0](https://github.com/joangeldelarosa/pxlkit/blob/main/LICENSE) — Free with attribution, commercial licenses available.

Created by [Joangel De La Rosa](https://github.com/joangeldelarosa)

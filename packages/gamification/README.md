<p align="center">
  <img src="https://raw.githubusercontent.com/joangeldelarosa/pxlkit/main/apps/web/public/og-image.png" alt="Pxlkit" width="480" />
</p>

<h1 align="center">@pxlkit/gamification</h1>

<p align="center">
  <strong>Gamification icon pack for Pxlkit.</strong><br/>
  Trophies, swords, potions, RPG gear, coins, and more — static and animated pixel art icons for game mechanics and achievements.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@pxlkit/gamification"><img src="https://img.shields.io/npm/v/@pxlkit/gamification?color=blue" alt="npm version" /></a>
  <a href="https://github.com/joangeldelarosa/pxlkit/blob/main/LICENSE-ASSETS"><img src="https://img.shields.io/badge/license-asset%20terms-blue.svg" alt="Pxlkit Asset License" /></a>
  <img src="https://img.shields.io/badge/icons-51-FFD700?style=flat" alt="51 icons" />
</p>

---

## Overview

`@pxlkit/gamification` is a themed icon pack for the [Pxlkit](https://pxlkit.xyz) ecosystem containing **51 icons** (41 static + 10 animated) designed for game mechanics, achievements, rewards, and RPG elements.

## Installation

```bash
npm install @pxlkit/core @pxlkit/gamification
```

> `@pxlkit/core` is required as a dependency for rendering components.

## Quick Start

```tsx
import { PxlKitIcon, AnimatedPxlKitIcon } from '@pxlkit/core';
import { Trophy, FireSword } from '@pxlkit/gamification';

// Static gamification icon
<PxlKitIcon icon={Trophy} size={32} colorful />

// Animated fire sword
<AnimatedPxlKitIcon icon={FireSword} size={48} colorful />
```

## Icons

### Static Icons (41)

| Icon | Name | Description |
| --- | --- | --- |
| 🏆 | `Trophy` | Achievement trophy |
| ⭐ | `Star` | Star rating / favorite |
| ⚔️ | `Sword` | Weapon / attack |
| 🛡️ | `Shield` | Defense / protection |
| ❤️ | `Heart` | Health / life |
| 🪙 | `Coin` | Currency / reward |
| 👑 | `Crown` | Royalty / top rank |
| ⚡ | `Lightning` | Power / speed |
| 💎 | `Gem` | Rare item / premium |
| 🚩 | `Flag` | Checkpoint / goal |
| 🧪 | `Potion` | Consumable item |
| 🔑 | `Key` | Unlock / access |
| 📦 | `Chest` | Loot chest |
| 🎖️ | `Medal` | Achievement medal |
| 🔥 | `Fire` | Hot streak / damage |
| 🏹 | `Arrow` | Projectile / direction |
| 📜 | `Scroll` | Quest / spell |
| 💀 | `Skull` | Danger / death |
| 🎯 | `Target` | Target / aim |
| 💣 | `Bomb` | Explosive / item |
| 🆙 | `LevelUp` | Level up indicator |
| 🛡️ | `Armor` | Body armor |
| ⛑️ | `Helmet` | Head protection |
| 👢 | `Boots` | Speed / footwear |
| 🏹 | `Bow` | Ranged weapon |
| 🪄 | `MagicWand` | Magic weapon |
| 🔮 | `Staff` | Magic staff |
| 🪓 | `Axe` | Melee weapon |
| 🗡️ | `Dagger` | Quick weapon |
| 📖 | `SpellBook` | Spell collection |
| 💍 | `Ring` | Accessory / buff |
| 📿 | `Amulet` | Magic accessory |
| 📦 | `LootChest` | Loot / treasure |
| 🗺️ | `QuestMap` | Quest navigation |
| 🧭 | `QuestCompass` | Quest direction |
| ❤️‍🩹 | `HealthPotion` | Health restore |
| 🔵 | `ManaPotion` | Mana restore |
| ☠️ | `PoisonVial` | Poison item |
| 🧪 | `Elixir` | Powerful consumable |
| 🎲 | `Dice` | Random / chance |
| 📊 | `XpBar` | Experience progress |

### Animated Icons (10)

| Icon | Name | Description |
| --- | --- | --- |
| 🔥⚔️ | `FireSword` | Sword with animated flames |
| ✨⭐ | `SparkleStar` | Sparkling star |
| 🪙 | `CoinSpin` | Spinning coin |
| ⚽ | `BouncingBall` | Bouncing ball |
| ⚔️✨ | `GlowingSword` | Glowing enchanted sword |
| 💎 | `FloatingGem` | Floating levitating gem |
| ❤️ | `HeartPulse` | Pulsing heart beat |
| 🪙 | `CoinFlip` | Flipping coin |
| 💀 | `FloatingSkull` | Floating skull |
| 🃏 | `CardDraw` | Card draw animation |

## Using the Icon Pack

```tsx
import { PxlKitIcon, AnimatedPxlKitIcon, isAnimatedIcon } from '@pxlkit/core';
import { GamificationPack } from '@pxlkit/gamification';

// Render all gamification icons
{GamificationPack.icons.map((icon) =>
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
| [`@pxlkit/feedback`](https://www.npmjs.com/package/@pxlkit/feedback) | 33 icons — alerts, status, notifications |
| [`@pxlkit/social`](https://www.npmjs.com/package/@pxlkit/social) | 43 icons — community, emojis, messaging |
| [`@pxlkit/weather`](https://www.npmjs.com/package/@pxlkit/weather) | 36 icons — climate, moon, temperature |
| [`@pxlkit/ui`](https://www.npmjs.com/package/@pxlkit/ui) | 41 icons — interface controls, navigation |
| [`@pxlkit/effects`](https://www.npmjs.com/package/@pxlkit/effects) | 12 animated VFX icons |
| [`@pxlkit/parallax`](https://www.npmjs.com/package/@pxlkit/parallax) | 10 multi-layer 3D parallax icons |

## Documentation

Browse all icons and try the visual builder at **[pxlkit.xyz](https://pxlkit.xyz)**.

## License

[Pxlkit Asset License](https://github.com/joangeldelarosa/pxlkit/blob/main/LICENSE-ASSETS) — free with attribution, with paid no-attribution terms in [COMMERCIAL_TERMS](https://github.com/joangeldelarosa/pxlkit/blob/main/COMMERCIAL_TERMS).

Created by [Joangel De La Rosa](https://github.com/joangeldelarosa)

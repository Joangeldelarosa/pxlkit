<p align="center">
  <img src="https://raw.githubusercontent.com/joangeldelarosa/pxlkit/main/apps/web/public/og-image.png" alt="Pxlkit" width="480" />
</p>

<h1 align="center">@pxlkit/social</h1>

<p align="center">
  <strong>Social and media icon pack for Pxlkit.</strong><br/>
  Hearts, shares, users, emojis, messages, and reactions — static and animated pixel art icons for social features.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@pxlkit/social"><img src="https://img.shields.io/npm/v/@pxlkit/social?color=blue" alt="npm version" /></a>
  <a href="https://github.com/joangeldelarosa/pxlkit/blob/main/LICENSE-ASSETS"><img src="https://img.shields.io/badge/license-asset%20terms-blue.svg" alt="Pxlkit Asset License" /></a>
  <img src="https://img.shields.io/badge/icons-43-FFD700?style=flat" alt="43 icons" />
</p>

---

## Overview

`@pxlkit/social` is a themed icon pack for the [Pxlkit](https://pxlkit.xyz) ecosystem containing **43 icons** (35 static + 8 animated) designed for social media, community features, user interaction, and messaging.

## Installation

```bash
npm install @pxlkit/core @pxlkit/social
```

> `@pxlkit/core` is required as a dependency for rendering components.

## Quick Start

```tsx
import { PxlKitIcon, AnimatedPxlKitIcon } from '@pxlkit/core';
import { Heart, PulseHeart } from '@pxlkit/social';

// Static social icon
<PxlKitIcon icon={Heart} size={32} colorful />

// Animated pulsing heart
<AnimatedPxlKitIcon icon={PulseHeart} size={32} colorful />
```

## Icons

### Static Icons (35)

| Icon | Name | Description |
| --- | --- | --- |
| ❤️ | `Heart` | Like / love |
| 💔 | `HeartBroken` | Broken heart |
| 👍 | `ThumbsUp` | Like / approve |
| 👎 | `ThumbsDown` | Dislike |
| 👤 | `User` | User profile |
| 👥 | `UserGroup` | Group / team |
| 🔗 | `Share` | Share / link |
| 🔖 | `Bookmark` | Bookmark / save |
| 📷 | `Camera` | Photo / media |
| 👁️ | `Eye` | Visible / view |
| 🙈 | `EyeOff` | Hidden / private |
| @ | `AtSign` | Mention / tag |
| # | `Hashtag` | Hashtag / topic |
| 🌐 | `Globe` | Public / global |
| 📌 | `Pin` | Pinned / location |
| ⭐ | `SocialStar` | Star / featured |
| 🔥 | `SocialFire` | Trending / hot |
| ✅ | `Verified` | Verified account |
| 💬 | `Comment` | Comment / reply |
| 🔁 | `Repost` | Repost / share |
| 🔔 | `Notification` | Notification |
| ✉️ | `Message` | Direct message |
| 💬 | `ChatBubble` | Chat conversation |
| 👥 | `Community` | Community / group |
| 🤝 | `Friends` | Friends / connection |
| ➕ | `AddUser` | Add user / follow |
| ➖ | `RemoveUser` | Remove user / unfollow |
| 🚫 | `BlockUser` | Block user |
| 😊 | `Smile` | Happy / pleased |
| 😢 | `Sad` | Sad / disappointed |
| 😠 | `Angry` | Angry / upset |
| 😂 | `Laugh` | Laughing / funny |
| 😉 | `Wink` | Wink / playful |
| 😮 | `Surprise` | Surprised / amazed |
| 🤩 | `StarFace` | Star-eyed / excited |

### Animated Icons (8)

| Icon | Name | Description |
| --- | --- | --- |
| ❤️ | `PulseHeart` | Pulsing heart beat |
| 👁️ | `BlinkingEye` | Blinking eye |
| 🏳️ | `WavingFlag` | Waving flag |
| 😉 | `WinkingFace` | Winking face |
| 😂 | `LaughingFace` | Laughing face |
| 💕 | `FloatingHearts` | Floating hearts |
| 💬 | `BouncingMessage` | Bouncing message bubble |
| 📞 | `RingingPhone` | Ringing phone |

## Using the Icon Pack

```tsx
import { PxlKitIcon, AnimatedPxlKitIcon, isAnimatedIcon } from '@pxlkit/core';
import { SocialPack } from '@pxlkit/social';

// Render all social icons
{SocialPack.icons.map((icon) =>
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
| [`@pxlkit/weather`](https://www.npmjs.com/package/@pxlkit/weather) | 36 icons — climate, moon, temperature |
| [`@pxlkit/ui`](https://www.npmjs.com/package/@pxlkit/ui) | 41 icons — interface controls, navigation |
| [`@pxlkit/effects`](https://www.npmjs.com/package/@pxlkit/effects) | 12 animated VFX icons |
| [`@pxlkit/parallax`](https://www.npmjs.com/package/@pxlkit/parallax) | 10 multi-layer 3D parallax icons |

## Documentation

Browse all icons and try the visual builder at **[pxlkit.xyz](https://pxlkit.xyz)**.

## License

[Pxlkit Asset License](https://github.com/joangeldelarosa/pxlkit/blob/main/LICENSE-ASSETS) — free with attribution, with paid no-attribution terms in [COMMERCIAL_TERMS](https://github.com/joangeldelarosa/pxlkit/blob/main/COMMERCIAL_TERMS).

Created by [Joangel De La Rosa](https://github.com/joangeldelarosa)

<p align="center">
  <img src="https://raw.githubusercontent.com/joangeldelarosa/pxlkit/main/apps/web/public/og-image.png" alt="Pxlkit" width="480" />
</p>

<h1 align="center">@pxlkit/feedback</h1>

<p align="center">
  <strong>Feedback and notification icon pack for Pxlkit.</strong><br/>
  Checkmarks, alerts, shields, bugs, badges, loading indicators, and status icons — all in pixel art.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@pxlkit/feedback"><img src="https://img.shields.io/npm/v/@pxlkit/feedback?color=blue" alt="npm version" /></a>
  <a href="https://github.com/joangeldelarosa/pxlkit/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-Pxlkit%20v1.0-blue.svg" alt="Pxlkit License" /></a>
  <img src="https://img.shields.io/badge/icons-33-FFD700?style=flat" alt="33 icons" />
</p>

---

## Overview

`@pxlkit/feedback` is a themed icon pack for the [Pxlkit](https://pxlkit.xyz) ecosystem containing **33 icons** (30 static + 3 animated) designed for notifications, alerts, status messages, toasts, and user feedback.

## Installation

```bash
npm install @pxlkit/core @pxlkit/feedback
```

> `@pxlkit/core` is required as a dependency for rendering components.

## Quick Start

```tsx
import { PxlKitIcon, AnimatedPxlKitIcon, isAnimatedIcon } from '@pxlkit/core';
import { CheckCircle, LoadingCircle } from '@pxlkit/feedback';

// Static feedback icon
<PxlKitIcon icon={CheckCircle} size={32} colorful />

// Animated loading indicator
<AnimatedPxlKitIcon icon={LoadingCircle} size={32} colorful />
```

## Icons

### Static Icons (30)

| Icon | Name | Description |
| --- | --- | --- |
| ✅ | `CheckCircle` | Success / check confirmation |
| ❌ | `XCircle` | Error / close |
| ℹ️ | `InfoCircle` | Information indicator |
| ⚠️ | `WarningTriangle` | Warning alert |
| 🛑 | `ErrorOctagon` | Error / stop |
| 🔔 | `Bell` | Notification bell |
| 🔴 | `NotificationDot` | Unread notification dot |
| 💬 | `MessageSquare` | Message / comment |
| 💭 | `ChatDots` | Chat with typing dots |
| 📧 | `Mail` | Email / mail |
| 📤 | `Send` | Send / submit |
| 🔗 | `Link` | Linked / connected |
| 🔓 | `Unlink` | Unlinked / disconnected |
| 🔒 | `Lock` | Locked / secure |
| 🔓 | `Unlock` | Unlocked / open |
| 🛡️ | `ShieldCheck` | Verified / protected |
| 🛡️ | `ShieldAlert` | Security alert |
| 🕐 | `Clock` | Time / pending |
| ✨ | `Sparkles` | Highlight / new feature |
| 📢 | `Megaphone` | Announcement / broadcast |
| ✅✅ | `DoubleCheck` | Read / confirmed |
| 🏅 | `Badge` | Achievement badge |
| 🎀 | `Ribbon` | Award ribbon |
| 🎯 | `FeedbackTarget` | Feedback target |
| 🎯 | `TargetHit` | Target hit / goal reached |
| 🐛 | `Bug` | Bug report |
| 🐛 | `BugFixed` | Bug fixed / resolved |
| ⚠️ | `Caution` | Caution sign |
| 🛡️ | `ShieldCross` | Blocked / denied |
| 🛡️ | `ShieldExclamation` | Shield warning |

### Animated Icons (3)

| Icon | Name | Description |
| --- | --- | --- |
| 🔄 | `LoadingCircle` | Spinning loading indicator |
| ⏳ | `Hourglass` | Animated hourglass timer |
| 💬 | `TypingDots` | Typing indicator dots |

## Using the Icon Pack

```tsx
import { PxlKitIcon, AnimatedPxlKitIcon, isAnimatedIcon } from '@pxlkit/core';
import { FeedbackPack } from '@pxlkit/feedback';

// Render all feedback icons
{FeedbackPack.icons.map((icon) =>
  isAnimatedIcon(icon) ? (
    <AnimatedPxlKitIcon key={icon.name} icon={icon} size={32} colorful />
  ) : (
    <PxlKitIcon key={icon.name} icon={icon} size={32} colorful />
  )
)}
```

## Toast Notifications

The feedback icons pair perfectly with the `PixelToast` component from `@pxlkit/core`:

```tsx
import { PixelToast } from '@pxlkit/core';
import { CheckCircle, WarningTriangle, ErrorOctagon, InfoCircle } from '@pxlkit/feedback';

// Success toast
<PixelToast visible title="Saved!" message="Your changes have been saved." icon={CheckCircle} colorfulIcon position="bottom-right" duration={3000} />

// Error toast
<PixelToast visible title="Error" message="Something went wrong." icon={ErrorOctagon} colorfulIcon position="bottom-right" />

// Warning toast
<PixelToast visible title="Warning" message="Please check your input." icon={WarningTriangle} colorfulIcon position="top-center" />
```

## Related Packages

| Package | Description |
| --- | --- |
| [`@pxlkit/core`](https://www.npmjs.com/package/@pxlkit/core) | Core rendering engine (required) |
| [`@pxlkit/gamification`](https://www.npmjs.com/package/@pxlkit/gamification) | 48 icons — RPG, achievements, rewards |
| [`@pxlkit/social`](https://www.npmjs.com/package/@pxlkit/social) | 43 icons — community, emojis, messaging |
| [`@pxlkit/weather`](https://www.npmjs.com/package/@pxlkit/weather) | 34 icons — climate, moon, temperature |
| [`@pxlkit/ui`](https://www.npmjs.com/package/@pxlkit/ui) | 40 icons — interface controls, navigation |
| [`@pxlkit/effects`](https://www.npmjs.com/package/@pxlkit/effects) | 6 animated VFX icons |
| [`@pxlkit/parallax`](https://www.npmjs.com/package/@pxlkit/parallax) | 10 multi-layer 3D parallax icons |

## Documentation

Browse all icons and try the visual builder at **[pxlkit.xyz](https://pxlkit.xyz)**.

## License

[Pxlkit License v1.0](https://github.com/joangeldelarosa/pxlkit/blob/main/LICENSE) — Free with attribution, commercial licenses available.

Created by [Joangel De La Rosa](https://github.com/joangeldelarosa)

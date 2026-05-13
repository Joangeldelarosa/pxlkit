<p align="center">
  <img src="https://raw.githubusercontent.com/joangeldelarosa/pxlkit/main/apps/web/public/og-image.png" alt="Pxlkit" width="480" />
</p>

<h1 align="center">@pxlkit/ui-kit</h1>

<p align="center">
  <strong>Retro pixel art UI kit and React components for Pxlkit.</strong><br/>
  54 styled React components with pixel art aesthetics — buttons, inputs, modals, toasts, animations, parallax effects, and full locale support.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@pxlkit/ui-kit"><img src="https://img.shields.io/npm/v/@pxlkit/ui-kit?color=blue" alt="npm version" /></a>
  <a href="https://github.com/joangeldelarosa/pxlkit/blob/main/LICENSE-CODE"><img src="https://img.shields.io/badge/license-MIT-22c55e.svg" alt="MIT License" /></a>
  <img src="https://img.shields.io/badge/components-54-FFD700?style=flat" alt="54 components" />
  <img src="https://img.shields.io/badge/react-%E2%89%A518-61DAFB?logo=react&logoColor=white" alt="React ≥18" />
</p>

---

## Overview

`@pxlkit/ui-kit` is a comprehensive React component library in the [Pxlkit](https://pxlkit.xyz) ecosystem, providing **54 retro pixel art styled components** for building modern web applications with a nostalgic aesthetic. Every component follows a consistent pixel art design language with customizable color tones.

## Installation

```bash
npm install @pxlkit/ui-kit
```

> **Peer dependencies:** `react ^18.2.0 || ^19.0.0` and `react-dom ^18.2.0 || ^19.0.0`

### Import Styles

Add the stylesheet to your app entry point:

```tsx
import '@pxlkit/ui-kit/styles.css';
```

## Quick Start

```tsx
import '@pxlkit/ui-kit/styles.css';
import { PixelButton, PixelCard, PixelInput } from '@pxlkit/ui-kit';

function App() {
  return (
    <PixelCard title="Welcome">
      <PixelInput label="Username" placeholder="Enter your name" />
      <PixelButton tone="green">Get Started</PixelButton>
    </PixelCard>
  );
}
```

## Surface system — pixel ↔ linear

Every visible component accepts a `surface?: 'pixel' | 'linear'` prop that switches the aesthetic:

- **`pixel`** *(default)* — chunky 2px borders, sharp staircase pixel corners (via clip-path), offset block shadow with no blur, mono/pixel typography. The signature retro identity.
- **`linear`** — soft 1px borders, gentle rounded corners, blurred drop shadows, sans typography. Same API, modern aesthetic.

Switch one component:

```tsx
<PixelButton surface="linear">Looks modern</PixelButton>
```

Switch a whole subtree via provider:

```tsx
import { PxlKitSurfaceProvider } from '@pxlkit/ui-kit';

<PxlKitSurfaceProvider surface="linear">
  {/* every nested Pxlkit component inherits surface="linear" */}
</PxlKitSurfaceProvider>
```

## Tone system

Components accept `tone?: 'green' | 'cyan' | 'gold' | 'red' | 'purple' | 'pink' | 'neutral'`. Tones map to design-token colours that respect the active theme (light/dark) and the `--retro-*` CSS variables — override any variable on `:root` or `.dark` to reskin every component.

## Components

### Layout

| Component | Description |
| --- | --- |
| `PixelSection` | Section container with pixel art border styling |
| `PixelDivider` | Decorative divider with optional label |

### Actions

| Component | Description |
| --- | --- |
| `PixelButton` | Primary button with pixel art styling and color tones |
| `PxlKitButton` | Alternative button variant |
| `PixelSplitButton` | Split button with dropdown action |

### Data Display

| Component | Description |
| --- | --- |
| `PixelCard` | Card container with title and pixel borders |
| `PixelStatCard` | Statistics display card |
| `PixelTable` | Data table with pixel art styling |
| `PixelAvatar` | User avatar component |
| `PixelBadge` | Status/count badge |
| `PixelChip` | Tag/chip component |
| `PixelTextLink` | Styled text link |
| `PixelCollapsible` | Expandable/collapsible content |
| `PixelCodeInline` | Inline code snippet |
| `PixelKbd` | Keyboard shortcut display |
| `PixelColorSwatch` | Color swatch display |
| `PixelBareButton` | Unstyled button base |
| `PixelBareInput` | Unstyled input base |
| `PixelBareTextarea` | Unstyled textarea base |

### Inputs

| Component | Description |
| --- | --- |
| `PixelInput` | Text input with label and validation |
| `PixelPasswordInput` | Password input with toggle visibility |
| `PixelTextarea` | Multi-line text input |
| `PixelSelect` | Dropdown select |
| `PixelCheckbox` | Checkbox with pixel styling |
| `PixelRadioGroup` | Radio button group |
| `PixelSwitch` | Toggle switch |
| `PixelSlider` | Range slider |
| `PixelSegmented` | Segmented control / tab-like selector |

### Feedback

| Component | Description |
| --- | --- |
| `PixelAlert` | Alert/notification banner |
| `PixelProgress` | Progress bar |
| `PixelSkeleton` | Loading skeleton placeholder |
| `PixelEmptyState` | Empty state with message |

### Navigation

| Component | Description |
| --- | --- |
| `PixelTabs` | Tab navigation |
| `PixelAccordion` | Accordion / expandable panels |
| `PixelBreadcrumb` | Breadcrumb navigation |
| `PixelPagination` | Page pagination controls |

### Overlay

| Component | Description |
| --- | --- |
| `PixelModal` | Modal dialog |
| `PixelTooltip` | Tooltip popup |
| `PixelDropdown` | Dropdown menu |

### Animations

| Component | Description |
| --- | --- |
| `PixelFadeIn` | Fade-in animation wrapper |
| `PixelSlideIn` | Slide-in animation wrapper |
| `PixelPulse` | Pulse animation wrapper |
| `PixelBounce` | Bounce animation wrapper |
| `PixelTypewriter` | Typewriter text effect |
| `PixelGlitch` | Glitch animation effect |
| `PixelFloat` | Floating animation wrapper |
| `PixelShake` | Shake animation wrapper |
| `PixelRotate` | Rotation animation wrapper |
| `PixelZoomIn` | Zoom-in animation wrapper |
| `PixelFlicker` | Flicker animation effect |

### Parallax

| Component | Description |
| --- | --- |
| `PixelParallaxLayer` | Individual parallax layer |
| `PixelParallaxGroup` | Scroll-based parallax group |
| `PixelMouseParallax` | Mouse-tracking parallax container |

### Locale / i18n

| Export | Description |
| --- | --- |
| `PxlKitLocaleProvider` | Locale context provider (supports `en` and `tr`) |
| `usePxlKitLocale()` | Hook for locale-aware text transforms |
| `toLocaleUpper()` | Locale-safe uppercase (handles Turkish İ/I) |
| `toLocaleLower()` | Locale-safe lowercase (handles Turkish ı/i) |
| `buildGoogleFontsUrl()` | Build Google Fonts URL with correct subset for locale |
| `PXLKIT_FONTS` | Font configuration for Press Start 2P, Inter, JetBrains Mono |
| `TURKISH_CHARACTERS` | Turkish character mapping reference |

## Storybook

Every one of the 54 components is individually documented at **[storybook.pxlkit.xyz](https://storybook.pxlkit.xyz)** under the `UI Kit / *` sidebar. Each story has a Controls panel for live prop manipulation:

- Surface toggle (pixel ↔ linear) on every component
- Tone selector (7 tones)
- Size selector (sm / md / lg)
- Disabled / loading / variant states
- Real animated `@pxlkit` icons in slots
- Side-by-side surface comparison: `Foundations / Surface / Side By Side`

## Turkish Locale Support

```tsx
import { PxlKitLocaleProvider, usePxlKitLocale } from '@pxlkit/ui-kit';

function App() {
  return (
    <PxlKitLocaleProvider locale="tr">
      <MyComponent />
    </PxlKitLocaleProvider>
  );
}

function MyComponent() {
  const { upper } = usePxlKitLocale();
  return <span>{upper('istanbul')}</span>; // → İSTANBUL
}
```

## Related Packages

| Package | Description |
| --- | --- |
| [`@pxlkit/core`](https://www.npmjs.com/package/@pxlkit/core) | Core rendering engine and icon components |
| [`@pxlkit/ui`](https://www.npmjs.com/package/@pxlkit/ui) | 41 UI & interface pixel art icons |
| [`@pxlkit/gamification`](https://www.npmjs.com/package/@pxlkit/gamification) | 51 icons — RPG, achievements, rewards |
| [`@pxlkit/feedback`](https://www.npmjs.com/package/@pxlkit/feedback) | 33 icons — alerts, status, notifications |
| [`@pxlkit/social`](https://www.npmjs.com/package/@pxlkit/social) | 43 icons — community, emojis, messaging |
| [`@pxlkit/weather`](https://www.npmjs.com/package/@pxlkit/weather) | 36 icons — climate, moon, temperature |
| [`@pxlkit/effects`](https://www.npmjs.com/package/@pxlkit/effects) | 12 animated VFX icons |
| [`@pxlkit/parallax`](https://www.npmjs.com/package/@pxlkit/parallax) | 10 multi-layer 3D parallax icons |

## Documentation

Explore the full component showcase and documentation at **[pxlkit.xyz](https://pxlkit.xyz)**.

## License

[MIT License](https://github.com/joangeldelarosa/pxlkit/blob/main/LICENSE-CODE) — code package. See the [repo licensing overview](https://github.com/joangeldelarosa/pxlkit/blob/main/LICENSE) for split-license scope details.

Created by [Joangel De La Rosa](https://github.com/joangeldelarosa)

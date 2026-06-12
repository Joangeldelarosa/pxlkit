<p align="center">
  <img src="https://raw.githubusercontent.com/joangeldelarosa/pxlkit/main/apps/web/public/og-image.png" alt="Pxlkit" width="480" />
</p>

<h1 align="center">@pxlkit/ui-kit</h1>

<p align="center">
  <strong>Retro pixel art UI kit and React components for Pxlkit.</strong><br/>
  111 styled React components with pixel art aesthetics — buttons, inputs, modals, toasts, animations, parallax effects, and full locale support.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@pxlkit/ui-kit"><img src="https://img.shields.io/npm/v/@pxlkit/ui-kit?color=blue" alt="npm version" /></a>
  <a href="https://github.com/joangeldelarosa/pxlkit/blob/main/LICENSE-CODE"><img src="https://img.shields.io/badge/license-MIT-22c55e.svg" alt="MIT License" /></a>
  <img src="https://img.shields.io/badge/components-111-FFD700?style=flat" alt="111 components" />
  <img src="https://img.shields.io/badge/react-%E2%89%A518-61DAFB?logo=react&logoColor=white" alt="React ≥18" />
</p>

> ### 🚀 v2.0 — *Ship a retro-future product without rolling your own design system.*
>
> **111 components · 95%+ test coverage · WCAG 2.1 AA · 30 audit gates · switchable `pixel ↔ linear` surface**
>
> - 📦 **[Release notes →](../../docs/launch/RELEASE-NOTES-V2.0.md)**
> - 🔁 **[Migrating from v1? →](../../docs/migration/V1-TO-V2.md)** (TL;DR: it's `npm install @pxlkit/ui-kit@2` and you're done)
> - 📰 **[Press kit →](../../docs/launch/V2-PRESS-KIT.md)**

---

## Overview

`@pxlkit/ui-kit` is a comprehensive React component library in the [Pxlkit](https://pxlkit.xyz) ecosystem, providing **57 retro pixel art styled components** for building modern web applications with a nostalgic aesthetic. Every component follows a consistent pixel art design language with customizable color tones.

> **New in v1.5.0** — `forwardRef` wired across every interactive primitive, full accessibility pass (ARIA + focus rings + keyboard handlers), and `PixelToast` + `PxlKitToastProvider` shipped inside the kit. See the [CHANGELOG](https://github.com/joangeldelarosa/pxlkit/blob/main/CHANGELOG.md) for the full diff.

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

<!-- COMPONENTS:START -->
<!-- auto-generated from component manifests by scripts/build-docs/generate-readme-package.ts — edit the manifests, then run `npm run docs:build`. -->

| Component | Status | Since | Category |
| --- | --- | --- | --- |
| `PixelAccordion` | stable | 1.0.0 | navigation |
| `PixelAlert` | stable | 1.0.0 | feedback |
| `PixelAlertDialog` | stable | 1.8.0 | overlays |
| `PixelAreaChart` | stable | 1.9.0 | data |
| `PixelAvatar` | stable | 1.0.0 | data |
| `PixelAvatarGroup` | stable | 1.9.0 | data |
| `PixelBadge` | stable | 1.0.0 | data |
| `PixelBadgeGroup` | stable | 1.9.0 | data |
| `PixelBarChart` | stable | 1.9.0 | data |
| `PixelBareButton` | stable | 1.0.0 | actions |
| `PixelBareInput` | stable | 1.0.0 | forms |
| `PixelBareTextarea` | stable | 1.0.0 | forms |
| `PixelBento` | stable | 1.7.0 | layout |
| `PixelBentoCell` | stable | 1.7.0 | layout |
| `PixelBounce` | stable | 1.6.0 | animations |
| `PixelBox` | stable | 1.6.0 | layout |
| `PixelBreadcrumb` | stable | 1.0.0 | navigation |
| `PixelButton` | stable | 1.0.0 | actions |
| `PixelCalendarGrid` | stable | 1.9.0 | forms |
| `PixelCard` | stable | 1.0.0 | cards |
| `PixelCarousel` | stable | 1.9.0 | data |
| `PixelCenter` | stable | 1.6.0 | layout |
| `PixelCheckbox` | stable | 1.0.0 | forms |
| `PixelChip` | stable | 1.0.0 | data |
| `PixelChipGroup` | stable | 1.9.0 | data |
| `PixelCluster` | stable | 1.6.0 | layout |
| `PixelCodeInline` | stable | 1.0.0 | data |
| `PixelCollapsible` | stable | 1.0.0 | data |
| `PixelColorInput` | stable | 1.9.0 | forms |
| `PixelColorSwatch` | stable | 1.0.0 | data |
| `PixelCombobox` | stable | 1.8.0 | forms |
| `PixelCommand` | stable | 1.8.0 | overlays |
| `PixelContainer` | stable | 1.6.0 | layout |
| `PixelDataTable` | stable | 1.9.0 | data |
| `PixelDatePicker` | stable | 1.8.0 | forms |
| `PixelDateRangePicker` | stable | 1.9.0 | forms |
| `PixelDivider` | stable | 1.6.0 | layout |
| `PixelDrawer` | stable | 1.8.0 | overlays |
| `PixelDropdown` | stable | 1.0.0 | overlays |
| `PixelEmptyState` | stable | 1.0.0 | feedback |
| `PixelEqualHeightGrid` | stable | 1.6.0 | layout |
| `PixelFadeIn` | stable | 1.6.0 | animations |
| `PixelFeatureCard` | stable | 1.7.0 | cards |
| `PixelFileUpload` | stable | 1.8.0 | forms |
| `PixelFlicker` | stable | 1.6.0 | animations |
| `PixelFloat` | stable | 1.6.0 | animations |
| `PixelForm` | stable | 1.8.0 | forms |
| `PixelGlitch` | stable | 1.6.0 | animations |
| `PixelGrid` | stable | 1.6.0 | layout |
| `PixelHeroMedia` | stable | 1.7.0 | hero |
| `PixelHeroSection` | stable | 1.7.0 | hero |
| `PixelIconFrame` | stable | 1.7.0 | cards |
| `PixelInput` | stable | 1.0.0 | forms |
| `PixelInputGroup` | stable | 1.9.0 | forms |
| `PixelKbd` | stable | 1.0.0 | data |
| `PixelMenubar` | stable | 1.9.0 | navigation |
| `PixelModal` | stable | 1.0.0 | overlays |
| `PixelMouseParallax` | stable | 1.6.0 | parallax |
| `PixelMultiSelect` | stable | 1.8.0 | forms |
| `PixelNavigationMenu` | stable | 1.9.0 | navigation |
| `PixelNumberInput` | stable | 1.8.0 | forms |
| `PixelOTPInput` | stable | 1.8.0 | forms |
| `PixelPagination` | stable | 1.0.0 | navigation |
| `PixelParallaxGroup` | stable | 1.6.0 | parallax |
| `PixelParallaxLayer` | stable | 1.6.0 | parallax |
| `PixelPasswordInput` | stable | 1.0.0 | forms |
| `PixelPopover` | stable | 1.8.0 | overlay-foundation |
| `PixelPortal` | stable | 1.8.0 | overlay-foundation |
| `PixelPricingCard` | stable | 1.7.0 | cards |
| `PixelProgress` | stable | 1.0.0 | feedback |
| `PixelPulse` | stable | 1.6.0 | animations |
| `PixelRadioGroup` | stable | 1.0.0 | forms |
| `PixelRibbon` | stable | 1.7.0 | cards |
| `PixelRotate` | stable | 1.6.0 | animations |
| `PixelScrollArea` | stable | 1.9.0 | layout |
| `PixelSection` | stable | 1.6.0 | layout |
| `PixelSectionHeader` | stable | 1.6.0 | layout |
| `PixelSegmented` | stable | 1.0.0 | forms |
| `PixelSelect` | stable | 1.0.0 | forms |
| `PixelShake` | stable | 1.6.0 | animations |
| `PixelSheet` | stable | 1.8.0 | overlays |
| `PixelSidebar` | stable | 1.9.0 | navigation |
| `PixelSkeleton` | stable | 1.0.0 | feedback |
| `PixelSlideIn` | stable | 1.6.0 | animations |
| `PixelSlider` | stable | 1.0.0 | forms |
| `PixelSparkline` | stable | 1.9.0 | data |
| `PixelSpinner` | stable | 1.9.0 | feedback |
| `PixelSplitButton` | stable | 1.0.0 | actions |
| `PixelStack` | stable | 1.6.0 | layout |
| `PixelStarRating` | stable | 2.0.0 | cards |
| `PixelStatCard` | stable | 1.0.0 | cards |
| `PixelStatGroup` | stable | 1.9.0 | data |
| `PixelStepper` | stable | 1.9.0 | navigation |
| `PixelSwitch` | stable | 1.0.0 | forms |
| `PixelTable` | stable | 1.0.0 | data |
| `PixelTabs` | stable | 1.0.0 | navigation |
| `PixelTestimonialCard` | stable | 1.7.0 | cards |
| `PixelTextarea` | stable | 1.0.0 | forms |
| `PixelTextLink` | stable | 1.0.0 | data |
| `PixelTimeline` | stable | 1.9.0 | data |
| `PixelToast` | stable | 1.0.0 | feedback |
| `PixelToggle` | stable | 1.9.0 | forms |
| `PixelToggleGroup` | stable | 1.9.0 | forms |
| `PixelTooltip` | stable | 1.0.0 | overlays |
| `PixelTwoColumn` | stable | 1.6.0 | layout |
| `PixelTypewriter` | stable | 1.6.0 | animations |
| `PixelZoomIn` | stable | 1.6.0 | animations |
| `PxlKitButton` | deprecated | 1.0.0 | actions |
| `PxlKitLocaleProvider` | stable | 1.6.0 | overlay-foundation |
| `PxlKitSurfaceProvider` | stable | 1.6.0 | overlay-foundation |
| `PxlKitToastProvider` | stable | 1.8.0 | feedback |
<!-- COMPONENTS:END -->

## Locale / i18n utilities

| Export | Description |
| --- | --- |
| `usePxlKitLocale()` | Hook for locale-aware text transforms |
| `toLocaleUpper()` | Locale-safe uppercase (handles Turkish İ/I) |
| `toLocaleLower()` | Locale-safe lowercase (handles Turkish ı/i) |
| `buildGoogleFontsUrl()` | Build Google Fonts URL with correct subset for locale |
| `PXLKIT_FONTS` | Font configuration for Press Start 2P, Inter, JetBrains Mono |
| `TURKISH_CHARACTERS` | Turkish character mapping reference |

## Storybook

Every one of the 57 components is individually documented at **[storybook.pxlkit.xyz](https://storybook.pxlkit.xyz)** under the `UI Kit / *` sidebar. Each story has a Controls panel for live prop manipulation:

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

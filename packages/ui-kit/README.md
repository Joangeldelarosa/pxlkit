<p align="center">
  <img src="https://raw.githubusercontent.com/joangeldelarosa/pxlkit/main/apps/web/public/og-image.png" alt="Pxlkit — retro pixel-art UI kit for React" width="480" />
</p>

<h1 align="center">@pxlkit/ui-kit</h1>

<p align="center">
  <strong>The retro pixel-art UI kit for React.</strong><br/>
  111 styled React components with pixel art aesthetics — buttons, inputs, modals, toasts, animations, parallax effects, and full locale support. New in 2.2: the same kit for Vue (<code>@pxlkit/ui-kit-vue</code>) and Angular (<code>@pxlkit/ui-kit-angular</code>).
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@pxlkit/ui-kit"><img src="https://img.shields.io/npm/v/@pxlkit/ui-kit?color=blue" alt="npm version" /></a>
  <a href="https://github.com/joangeldelarosa/pxlkit/blob/main/LICENSE-CODE"><img src="https://img.shields.io/badge/license-MIT-22c55e.svg" alt="MIT License" /></a>
  <img src="https://img.shields.io/badge/components-111-FFD700?style=flat" alt="111 components" />
  <img src="https://img.shields.io/badge/react-18.2%2B%20%7C%2019-61DAFB?logo=react&logoColor=white" alt="React 18.2+ | 19" />
</p>

> ### v2.2.0 — *The React kit, now in Vue and Angular.*
>
> **111 components · built for WCAG 2.1 AA · docs checked by a coherence audit · switchable `pixel ↔ linear` surface**
>
> - Vue 3: [`@pxlkit/ui-kit-vue`](https://www.npmjs.com/package/@pxlkit/ui-kit-vue) · Angular 20–22: [`@pxlkit/ui-kit-angular`](https://www.npmjs.com/package/@pxlkit/ui-kit-angular) — the same markup, theme and behaviour, checked against this kit by parity tests
> - [Changelog →](https://github.com/Joangeldelarosa/pxlkit/blob/main/packages/ui-kit/CHANGELOG.md) · [Upgrading from 2.1](#upgrading-from-21) · [Migrating from v1 →](https://github.com/Joangeldelarosa/pxlkit/blob/main/docs/migration/V1-TO-V2.md)

---

## Overview

`@pxlkit/ui-kit` is a comprehensive React component library in the [Pxlkit](https://pxlkit.xyz) ecosystem, providing **111 retro pixel art styled components** for building modern web applications with a nostalgic aesthetic. Every component follows a consistent pixel art design language with customizable color tones.

It is the reference kit: since 2.2, [`@pxlkit/ui-kit-vue`](https://www.npmjs.com/package/@pxlkit/ui-kit-vue) and [`@pxlkit/ui-kit-angular`](https://www.npmjs.com/package/@pxlkit/ui-kit-angular) bring the same components to Vue 3 and Angular, on the framework-neutral [`@pxlkit/ui-kit-core`](https://www.npmjs.com/package/@pxlkit/ui-kit-core) this kit runs on too.

## Installation

```bash
npm install @pxlkit/ui-kit
```

> **Peer dependencies:** `react ^18.2.0 || ^19.0.0` and `react-dom ^18.2.0 || ^19.0.0`

### Tailwind CSS v4 in your build

The kit's stylesheet is a Tailwind CSS v4 entry point, so Tailwind has to process it. If your app does not use Tailwind v4 yet (`create-next-app --tailwind` sets it up):

- **Next.js** — `npm install -D tailwindcss @tailwindcss/postcss postcss`, and `postcss.config.mjs`:
  ```js
  export default { plugins: { '@tailwindcss/postcss': {} } };
  ```
- **Vite** — `npm install -D tailwindcss @tailwindcss/vite`, and in `vite.config.ts`:
  ```ts
  import tailwindcss from '@tailwindcss/vite';
  // …
  plugins: [react(), tailwindcss()],
  ```

Without it the build still succeeds, but the CSS keeps `@theme`, `@source` and `@apply` as written and the components render unstyled.

### Import Styles

The kit's stylesheet imports Tailwind CSS v4 and adds the Pxlkit theme and the kit's class names, so it takes the place of `@import "tailwindcss"` in the stylesheet Tailwind processes (for example `app/globals.css`):

```css
@import "@pxlkit/ui-kit/styles.css";

/* The kit styles the components, not the page: theme <body> yourself */
@layer base {
  body {
    background-color: var(--color-retro-bg);
    color: var(--color-retro-text);
    font-family: var(--font-sans);
  }
}
```

Remove a starter template's own theme rules: create-next-app's `globals.css` sets a white `body` background, `font-family: Arial` and an `@theme inline` that remaps `--font-sans` / `--font-mono` to Geist, all of which override the kit's.

Importing the stylesheet from your entry module instead (`import '@pxlkit/ui-kit/styles.css';`) works the same when your build runs Tailwind CSS on it. Do not import `tailwindcss` separately as well — it would load Tailwind's base styles twice.

### Fonts

The theme names Press Start 2P (`font-pixel`), Inter (`font-sans`) and JetBrains Mono (`font-mono`) but loads none of them. Add the stylesheet `buildGoogleFontsUrl()` builds to `<head>` — in `index.html` with Vite, in `app/layout.tsx` with Next.js:

```tsx
// app/layout.tsx — a Server Component, so the helper comes from @pxlkit/ui-kit-core
// (installed with the kit; add it to your dependencies with pnpm's strict layout)
import { buildGoogleFontsUrl } from '@pxlkit/ui-kit-core';

// inside <head>
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
<link rel="stylesheet" href={buildGoogleFontsUrl('en')} />
```

`buildGoogleFontsUrl('tr')` adds the Latin Extended subset Turkish needs.

## Quick Start

With the stylesheet in place (in the Next.js App Router, see [below](#nextjs-app-router) for where the providers and hooks go):

```tsx
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

### Next.js (App Router)

The components use state, effects and context, so they run as Client Components. Wrap the providers in a client component of your own, so `app/layout.tsx` stays a Server Component:

```tsx
// app/providers.tsx
'use client';

import { PxlKitSurfaceProvider, PxlKitToastProvider } from '@pxlkit/ui-kit';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PxlKitSurfaceProvider surface="pixel">
      <PxlKitToastProvider>{children}</PxlKitToastProvider>
    </PxlKitSurfaceProvider>
  );
}
```

```tsx
// app/layout.tsx
import './globals.css';
import { Providers } from './providers';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

Put `'use client'` at the top of every file that passes event handlers to the components or calls the kit's hooks (`useToast`, `useDarkMode`, `usePxlKitLocale`, …) — the examples on [pxlkit.xyz](https://pxlkit.xyz/ui-kit) use them, so paste them into such a file. In Server Components, take helpers such as `buildGoogleFontsUrl`, `toLocaleUpper` or `cn` from `@pxlkit/ui-kit-core`. Of the icon components in `@pxlkit/core`, `PxlKitIcon` renders in Server Components; `AnimatedPxlKitIcon`, `ParallaxPxlKitIcon` and `PixelToast` need a Client Component.

### Server rendering

The components render on the server and hydrate without mismatches. A calendar shows the current month and marks today, which depends on the reader's clock: give `PixelCalendarGrid` a `month` (or a `value`) for a stable server render, or render a current-month calendar in the browser only — with `next/dynamic` and `ssr: false` in Next.js.

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

## Dark mode

The theme follows a class: `.dark` on `<html>` (or any ancestor) selects the dark palette, `.light` the light one. `useDarkMode()` returns `{ mode, resolved, setMode }`; `setMode('light' | 'dark' | 'system')` stores the choice in `localStorage` (`pxlkit:dark-mode`) and sets the class, and `'system'` follows `prefers-color-scheme`.

```tsx
'use client';
import { PixelButton, useDarkMode } from '@pxlkit/ui-kit';

export function ThemeToggle() {
  const { resolved, setMode } = useDarkMode();
  return (
    <PixelButton onClick={() => setMode(resolved === 'dark' ? 'light' : 'dark')}>
      {resolved === 'dark' ? 'Light theme' : 'Dark theme'}
    </PixelButton>
  );
}
```

The hook starts from `'system'` / `'light'` on the server and reads the stored choice after mounting, so a server-rendered app sets the class before first paint with a small script at the top of `<head>` — the same key and default as the hook:

```html
<script>
  (function () {
    try {
      var raw = localStorage.getItem('pxlkit:dark-mode');
      var mode = raw;
      try { mode = JSON.parse(raw); } catch (e) {}
      var dark = mode === 'dark' || (mode !== 'light' && matchMedia('(prefers-color-scheme: dark)').matches);
      document.documentElement.classList.toggle('dark', dark);
      document.documentElement.classList.toggle('light', !dark);
    } catch (e) {}
  })();
</script>
```

In Next.js, render it with `<script dangerouslySetInnerHTML={{ __html: … }} />` in `app/layout.tsx` and put `suppressHydrationWarning` on `<html>`, whose class the script changes before React hydrates.

To re-skin, redefine any `--retro-*` variable after the kit's import — on `:root` for the light theme, on `.dark` for the dark one:

```css
:root { --retro-green: #22c55e; }
.dark { --retro-green: #4ade80; }
```

## Upgrading from 2.1

- The theme moved to `@pxlkit/ui-kit-core`, installed with the kit; `@import "@pxlkit/ui-kit/styles.css"` still brings everything.
- The stylesheet registers the kit's classes with Tailwind itself: drop any `@source "…/node_modules/@pxlkit/ui-kit/dist"` line, and keep one Tailwind import — the kit's stylesheet replaces `@import "tailwindcss"`.
- Animation keyframes are in the stylesheet (no runtime `<style>` element): import it wherever animations render; a Content Security Policy no longer needs inline styles for them.
- `PixelDropdown`, `PixelMenubar`, `PixelSplitButton`, `PixelStepper` and `PixelNavigationMenu` now follow the WAI-ARIA patterns (`PixelNavigationMenu` dropped its menubar roles): tests that query their old roles need updating — see the [CHANGELOG](https://github.com/Joangeldelarosa/pxlkit/blob/main/packages/ui-kit/CHANGELOG.md).

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

Every one of the 111 components is individually documented at **[storybook.pxlkit.xyz](https://storybook.pxlkit.xyz)** under the `UI Kit / *` sidebar. Each story has a Controls panel for live prop manipulation:

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
| [`@pxlkit/ui-kit-vue`](https://www.npmjs.com/package/@pxlkit/ui-kit-vue) | The same kit for Vue 3 — new in 2.2 |
| [`@pxlkit/ui-kit-angular`](https://www.npmjs.com/package/@pxlkit/ui-kit-angular) | The same kit for Angular 20–22 — new in 2.2 |
| [`@pxlkit/ui-kit-core`](https://www.npmjs.com/package/@pxlkit/ui-kit-core) | Tokens, theme and behaviour shared by the three kits |
| [`@pxlkit/core`](https://www.npmjs.com/package/@pxlkit/core) | Core rendering engine and icon components |
| [`@pxlkit/ui`](https://www.npmjs.com/package/@pxlkit/ui) | 41 UI & interface pixel art icons |
| [`@pxlkit/gamification`](https://www.npmjs.com/package/@pxlkit/gamification) | 51 icons — RPG, achievements, rewards |
| [`@pxlkit/feedback`](https://www.npmjs.com/package/@pxlkit/feedback) | 33 icons — alerts, status, notifications |
| [`@pxlkit/social`](https://www.npmjs.com/package/@pxlkit/social) | 43 icons — community, emojis, messaging |
| [`@pxlkit/weather`](https://www.npmjs.com/package/@pxlkit/weather) | 36 icons — climate, moon, temperature |
| [`@pxlkit/effects`](https://www.npmjs.com/package/@pxlkit/effects) | 12 animated VFX icons |
| [`@pxlkit/parallax`](https://www.npmjs.com/package/@pxlkit/parallax) | 10 multi-layer 3D parallax icons |

## Documentation

Explore the live component showcase at **[pxlkit.xyz/ui-kit](https://pxlkit.xyz/ui-kit)** and the setup guide and component reference at **[pxlkit.xyz/docs](https://pxlkit.xyz/docs)**.

## License

[MIT License](https://github.com/joangeldelarosa/pxlkit/blob/main/LICENSE-CODE) — code package. See the [repo licensing overview](https://github.com/joangeldelarosa/pxlkit/blob/main/LICENSE) for split-license scope details.

Created by [Joangel De La Rosa](https://github.com/joangeldelarosa)

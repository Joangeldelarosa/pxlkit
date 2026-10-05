<p align="center">
  <img src="https://raw.githubusercontent.com/joangeldelarosa/pxlkit/main/apps/web/public/og-image.png" alt="Pxlkit — retro pixel-art UI kit for Vue 3" width="480" />
</p>

<h1 align="center">@pxlkit/ui-kit-vue</h1>

<p align="center">
  <strong>The Pxlkit retro UI kit for Vue 3 — new in Pxlkit 2.2.0.</strong><br/>
  The same components, markup, theme and behaviour as the React kit — buttons, inputs, modals, popovers, tabs, toasts, animations — written as Vue single-file components.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@pxlkit/ui-kit-vue"><img src="https://img.shields.io/npm/v/@pxlkit/ui-kit-vue?color=blue" alt="npm version" /></a>
  <a href="https://github.com/joangeldelarosa/pxlkit/blob/main/LICENSE-CODE"><img src="https://img.shields.io/badge/license-MIT-22c55e.svg" alt="MIT License" /></a>
  <img src="https://img.shields.io/badge/vue-%E2%89%A53.5-42b883?logo=vuedotjs&logoColor=white" alt="Vue ≥3.5" />
  <img src="https://img.shields.io/badge/typescript-strict-3178C6?logo=typescript&logoColor=white" alt="TypeScript strict" />
</p>

---

## Overview

`@pxlkit/ui-kit-vue` is the Vue 3 edition of the [Pxlkit](https://pxlkit.xyz) UI kit. Every component renders the same markup and classes as its React counterpart in [`@pxlkit/ui-kit`](https://www.npmjs.com/package/@pxlkit/ui-kit) and behaves the same way — keyboard handling, focus management, ARIA — which the repository's parity suite verifies example by example. Both kits are built on [`@pxlkit/ui-kit-core`](https://www.npmjs.com/package/@pxlkit/ui-kit-core): one set of design tokens, one Tailwind CSS theme, one implementation of the DOM behaviour.

## Installation

```bash
npm install @pxlkit/ui-kit-vue @pxlkit/vue
```

`@pxlkit/vue` renders the icons the examples use. React is never installed.

> **Peer dependency:** `vue ^3.5.0`. The styles need [Tailwind CSS v4](https://tailwindcss.com) in your build.

### Tailwind CSS v4 in your build

The kit's stylesheet is a Tailwind CSS v4 entry point, so Tailwind has to process it. If your app does not use Tailwind v4 yet:

- **Vite** — `npm install -D tailwindcss @tailwindcss/vite`, and in `vite.config.ts`:
  ```ts
  import tailwindcss from '@tailwindcss/vite';
  // …
  plugins: [vue(), tailwindcss()],
  ```
- **Nuxt** — see [Nuxt](#nuxt) below.

Without it the build still succeeds, but the CSS keeps `@theme`, `@source` and `@apply` as written and the components render unstyled.

### Styles

The kit's stylesheet imports Tailwind CSS v4 and adds the Pxlkit theme and the kit's class names, so it takes the place of `@import "tailwindcss"` in the stylesheet Tailwind processes (for example `src/style.css`):

```css
@import "@pxlkit/ui-kit-vue/styles.css";

/* The kit styles the components, not the page: theme <body> yourself */
@layer base {
  body {
    background-color: var(--color-retro-bg);
    color: var(--color-retro-text);
    font-family: var(--font-sans);
  }
}
```

Once Tailwind CSS v4 processes that stylesheet, there is nothing else to configure. Do not import `tailwindcss` separately as well — it would load Tailwind's base styles twice, and remove a starter template's own `body` and font rules, which override the kit's.

### Fonts

The theme names Press Start 2P (`font-pixel`), Inter (`font-sans`) and JetBrains Mono (`font-mono`) but loads none of them. Add the stylesheet `buildGoogleFontsUrl('en')` builds — from `@pxlkit/ui-kit-core`; `'tr'` adds the Latin Extended subset — to the document head, `index.html` in a Vite app:

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&subset=latin&display=swap" />
```

### Nuxt

No Nuxt module or `build.transpile` entry is needed.

```bash
npm install @pxlkit/ui-kit-vue @pxlkit/vue
npm install -D tailwindcss @tailwindcss/vite
```

```ts
// nuxt.config.ts
import tailwindcss from '@tailwindcss/vite';

export default defineNuxtConfig({
  css: ['~/assets/css/main.css'],
  vite: { plugins: [tailwindcss()] },
});
```

```css
/* app/assets/css/main.css */
@import "@pxlkit/ui-kit-vue/styles.css";
```

Nuxt auto-imports your own components, not a package's: import the kit's components where you use them (`import { PixelButton } from '@pxlkit/ui-kit-vue'`). They render on the server and hydrate; overlays move into `document.body` after mounting.

## Quick start

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { PixelButton, PixelModal } from '@pxlkit/ui-kit-vue';

const open = ref(false);
</script>

<template>
  <PixelButton tone="green" @click="open = true">Get started</PixelButton>
  <PixelModal v-model:open="open" title="Welcome">
    <p>Pixel-perfect, in Vue.</p>
  </PixelModal>
</template>
```

## From the React API to Vue

The props, their names and their defaults are the React kit's; the rest follows Vue conventions:

| React | Vue |
| --- | --- |
| `children` | the default slot |
| other element props (`iconLeft`, `footer`) | named slots, kebab-case (`#icon-left`, `#footer`) |
| `value` + `onChange` | `v-model` |
| `open` + `onOpenChange`, `checked` + `onChange` | `v-model:open`, `v-model:checked` |
| callbacks (`onClose`) | events (`@close`) |
| `asChild` | `as-child`: the single child element of the default slot becomes the root |

Every other attribute and listener falls through to the component's root element (or to the element it documents, such as the input of a form field).

`PixelForm` runs on VeeValidate, as the React kit's runs on React Hook Form: call `const form = useForm(…)` in `<script setup>` and pass it, `<PixelForm :form="form">`. VeeValidate comes with the kit; with pnpm's strict layout, add `vee-validate` to your own dependencies to import `useForm`.

## Surfaces and tones

Every visible component takes `surface?: 'pixel' | 'linear'` — chunky pixel borders and staircase corners, or soft borders and rounded corners — and, where it applies, `tone?: 'green' | 'cyan' | 'gold' | 'red' | 'purple' | 'pink' | 'neutral'`. Switch a whole subtree at once:

```vue
<PxlKitSurfaceProvider surface="linear">
  <!-- every nested component renders with the linear surface -->
</PxlKitSurfaceProvider>
```

Tones and surfaces resolve to the `--retro-*` CSS variables of the theme: override any of them on `:root` or `.dark` to reskin every component.

## Dark mode

The theme follows a class: `.dark` on `<html>` (or any ancestor) selects the dark palette, `.light` the light one. `useDarkMode()` returns `{ mode, resolved, setMode }`; `setMode('light' | 'dark' | 'system')` stores the choice in `localStorage` (`pxlkit:dark-mode`) and sets the class, and `'system'` follows `prefers-color-scheme`.

```vue
<script setup lang="ts">
import { PixelButton, useDarkMode } from '@pxlkit/ui-kit-vue';

const { resolved, setMode } = useDarkMode();
</script>

<template>
  <PixelButton @click="setMode(resolved === 'dark' ? 'light' : 'dark')">
    {{ resolved === 'dark' ? 'Light theme' : 'Dark theme' }}
  </PixelButton>
</template>
```

The composable starts from `'system'` / `'light'` on the server and reads the stored choice after mounting, so a server-rendered app sets the class before first paint with a small inline script in `<head>` that reads the same key — the [`@pxlkit/ui-kit` README](https://github.com/Joangeldelarosa/pxlkit/blob/main/packages/ui-kit/README.md#dark-mode) has it. To re-skin, redefine any `--retro-*` variable after the kit's import, on `:root` for the light theme and on `.dark` for the dark one.

## Server rendering

Components render on the server (Nuxt, `vue/server-renderer`) and hydrate without mismatches. Overlays render their content in place on the server and during hydration, then move it into `document.body`; browser-only behaviour (positioning, focus, listeners) starts after mounting.

A calendar shows the current month and marks today, which depends on the reader's clock: give `PixelCalendarGrid` a `month` (or a `v-model` value) for a stable server render, or render a current-month calendar in the browser only, inside Nuxt's `<ClientOnly>`.

## Composables

The React kit's hooks, as composables: `useDarkMode`, `useLocalStorage`, `useMediaQuery`, `useReducedMotion`, `useFocusTrap`, `useScrollLock`, `useEscape`, `useClickOutside`, `useEventListener`, `useControllableState`, `usePxlKitSurface`, `useEffectiveSurface` and `usePxlKitLocale`.

## Components

<!-- COMPONENTS:START -->
<!-- auto-generated from component manifests by scripts/build-docs/generate-readme-package.ts — edit the manifests, then run `npm run docs:build`. -->

| Component | Status | Category |
| --- | --- | --- |
| `PixelAccordion` | stable | navigation |
| `PixelAlert` | stable | feedback |
| `PixelAlertDialog` | stable | overlays |
| `PixelAreaChart` | stable | data |
| `PixelAvatar` | stable | data |
| `PixelAvatarGroup` | stable | data |
| `PixelBadge` | stable | data |
| `PixelBadgeGroup` | stable | data |
| `PixelBarChart` | stable | data |
| `PixelBareButton` | stable | actions |
| `PixelBareInput` | stable | forms |
| `PixelBareTextarea` | stable | forms |
| `PixelBento` | stable | layout |
| `PixelBentoCell` | stable | layout |
| `PixelBounce` | stable | animations |
| `PixelBox` | stable | layout |
| `PixelBreadcrumb` | stable | navigation |
| `PixelButton` | stable | actions |
| `PixelCalendarGrid` | stable | forms |
| `PixelCard` | stable | cards |
| `PixelCarousel` | stable | data |
| `PixelCenter` | stable | layout |
| `PixelCheckbox` | stable | forms |
| `PixelChip` | stable | data |
| `PixelChipGroup` | stable | data |
| `PixelCluster` | stable | layout |
| `PixelCodeInline` | stable | data |
| `PixelCollapsible` | stable | data |
| `PixelColorInput` | stable | forms |
| `PixelColorSwatch` | stable | data |
| `PixelCombobox` | stable | forms |
| `PixelCommand` | stable | overlays |
| `PixelContainer` | stable | layout |
| `PixelDataTable` | stable | data |
| `PixelDatePicker` | stable | forms |
| `PixelDateRangePicker` | stable | forms |
| `PixelDivider` | stable | layout |
| `PixelDrawer` | stable | overlays |
| `PixelDropdown` | stable | overlays |
| `PixelEmptyState` | stable | feedback |
| `PixelEqualHeightGrid` | stable | layout |
| `PixelFadeIn` | stable | animations |
| `PixelFeatureCard` | stable | cards |
| `PixelFileUpload` | stable | forms |
| `PixelFlicker` | stable | animations |
| `PixelFloat` | stable | animations |
| `PixelForm` | stable | forms |
| `PixelGlitch` | stable | animations |
| `PixelGrid` | stable | layout |
| `PixelHeroMedia` | stable | hero |
| `PixelHeroSection` | stable | hero |
| `PixelIconFrame` | stable | cards |
| `PixelInput` | stable | forms |
| `PixelInputGroup` | stable | forms |
| `PixelKbd` | stable | data |
| `PixelMenubar` | stable | navigation |
| `PixelModal` | stable | overlays |
| `PixelMouseParallax` | stable | parallax |
| `PixelMultiSelect` | stable | forms |
| `PixelNavigationMenu` | stable | navigation |
| `PixelNumberInput` | stable | forms |
| `PixelOTPInput` | stable | forms |
| `PixelPagination` | stable | navigation |
| `PixelParallaxGroup` | stable | parallax |
| `PixelParallaxLayer` | stable | parallax |
| `PixelPasswordInput` | stable | forms |
| `PixelPopover` | stable | overlay-foundation |
| `PixelPortal` | stable | overlay-foundation |
| `PixelPricingCard` | stable | cards |
| `PixelProgress` | stable | feedback |
| `PixelPulse` | stable | animations |
| `PixelRadioGroup` | stable | forms |
| `PixelRibbon` | stable | cards |
| `PixelRotate` | stable | animations |
| `PixelScrollArea` | stable | layout |
| `PixelSection` | stable | layout |
| `PixelSectionHeader` | stable | layout |
| `PixelSegmented` | stable | forms |
| `PixelSelect` | stable | forms |
| `PixelShake` | stable | animations |
| `PixelSheet` | stable | overlays |
| `PixelSidebar` | stable | navigation |
| `PixelSkeleton` | stable | feedback |
| `PixelSlideIn` | stable | animations |
| `PixelSlider` | stable | forms |
| `PixelSparkline` | stable | data |
| `PixelSpinner` | stable | feedback |
| `PixelSplitButton` | stable | actions |
| `PixelStack` | stable | layout |
| `PixelStarRating` | stable | cards |
| `PixelStatCard` | stable | cards |
| `PixelStatGroup` | stable | data |
| `PixelStepper` | stable | navigation |
| `PixelSwitch` | stable | forms |
| `PixelTable` | stable | data |
| `PixelTabs` | stable | navigation |
| `PixelTestimonialCard` | stable | cards |
| `PixelTextarea` | stable | forms |
| `PixelTextLink` | stable | data |
| `PixelTimeline` | stable | data |
| `PixelToast` | stable | feedback |
| `PixelToggle` | stable | forms |
| `PixelToggleGroup` | stable | forms |
| `PixelTooltip` | stable | overlays |
| `PixelTwoColumn` | stable | layout |
| `PixelTypewriter` | stable | animations |
| `PixelZoomIn` | stable | animations |
| `PxlKitButton` | deprecated | actions |
| `PxlKitLocaleProvider` | stable | overlay-foundation |
| `PxlKitSurfaceProvider` | stable | overlay-foundation |
| `PxlKitToastProvider` | stable | feedback |
<!-- COMPONENTS:END -->

## Documentation

The Vue setup at **[pxlkit.xyz/ui-kit#vue](https://pxlkit.xyz/ui-kit#vue)**; every component, with its Vue code, at [pxlkit.xyz/ui-kit](https://pxlkit.xyz/ui-kit) and [pxlkit.xyz/docs](https://pxlkit.xyz/docs).

## Related packages

| Package | Description |
| --- | --- |
| [`@pxlkit/ui-kit`](https://www.npmjs.com/package/@pxlkit/ui-kit) | The React components |
| [`@pxlkit/ui-kit-angular`](https://www.npmjs.com/package/@pxlkit/ui-kit-angular) | The Angular components |
| [`@pxlkit/ui-kit-core`](https://www.npmjs.com/package/@pxlkit/ui-kit-core) | The shared tokens, theme and behaviour |
| [`@pxlkit/vue`](https://www.npmjs.com/package/@pxlkit/vue) | Pixel art icon components for Vue |

## License

[MIT License](https://github.com/joangeldelarosa/pxlkit/blob/main/LICENSE-CODE) — code package. See the [repo licensing overview](https://github.com/joangeldelarosa/pxlkit/blob/main/LICENSE) for split-license scope details.

Created by [Joangel De La Rosa](https://github.com/joangeldelarosa)

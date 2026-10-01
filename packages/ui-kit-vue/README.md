<p align="center">
  <img src="https://raw.githubusercontent.com/joangeldelarosa/pxlkit/main/apps/web/public/og-image.png" alt="Pxlkit" width="480" />
</p>

<h1 align="center">@pxlkit/ui-kit-vue</h1>

<p align="center">
  <strong>The Pxlkit retro UI kit for Vue 3.</strong><br/>
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
npm install @pxlkit/ui-kit-vue
```

> **Peer dependency:** `vue ^3.5.0`. The styles need [Tailwind CSS v4](https://tailwindcss.com) in your build.

### Styles

In the stylesheet Tailwind CSS processes (for example `src/style.css`):

```css
@import "tailwindcss";
@import "@pxlkit/ui-kit-vue/styles.css";
```

The kit's stylesheet brings the Pxlkit theme and registers the kit's class names with Tailwind, so there is nothing else to configure.

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

## Surfaces and tones

Every visible component takes `surface?: 'pixel' | 'linear'` — chunky pixel borders and staircase corners, or soft borders and rounded corners — and, where it applies, `tone?: 'green' | 'cyan' | 'gold' | 'red' | 'purple' | 'pink' | 'neutral'`. Switch a whole subtree at once:

```vue
<PxlKitSurfaceProvider surface="linear">
  <!-- every nested component renders with the linear surface -->
</PxlKitSurfaceProvider>
```

Tones and surfaces resolve to the `--retro-*` CSS variables of the theme: override any of them on `:root` or `.dark` to reskin every component.

## Server rendering

Components render on the server (Nuxt, `vue/server-renderer`) and hydrate without mismatches. Overlays render their content in place on the server and during hydration, then move it into `document.body`; browser-only behaviour (positioning, focus, listeners) starts after mounting.

## Composables

The React kit's hooks, as composables: `useDarkMode`, `useLocalStorage`, `useMediaQuery`, `useReducedMotion`, `useFocusTrap`, `useScrollLock`, `useEscape`, `useClickOutside`, `useEventListener`, `useControllableState`, `usePxlKitSurface`, `useEffectiveSurface` and `usePxlKitLocale`.

## Components

<!-- COMPONENTS:START -->
<!-- auto-generated from component manifests by scripts/build-docs/generate-readme-package.ts — edit the manifests, then run `npm run docs:build`. -->

| Component | Status | Since | Category |
| --- | --- | --- | --- |
| `PixelBadge` | stable | 1.0.0 | data |
| `PixelButton` | stable | 1.0.0 | actions |
| `PixelModal` | stable | 1.0.0 | overlays |
| `PixelPopover` | stable | 1.8.0 | overlay-foundation |
| `PixelPortal` | stable | 1.8.0 | overlay-foundation |
| `PixelStack` | stable | 1.6.0 | layout |
| `PixelSwitch` | stable | 1.0.0 | forms |
| `PixelTabs` | stable | 1.0.0 | navigation |
| `PxlKitLocaleProvider` | stable | 1.6.0 | overlay-foundation |
| `PxlKitSurfaceProvider` | stable | 1.6.0 | overlay-foundation |
<!-- COMPONENTS:END -->

## Documentation

Guides, every component and live examples at **[pxlkit.xyz](https://pxlkit.xyz)**.

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

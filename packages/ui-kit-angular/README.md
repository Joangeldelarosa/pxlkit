<p align="center">
  <img src="https://raw.githubusercontent.com/joangeldelarosa/pxlkit/main/apps/web/public/og-image.png" alt="Pxlkit" width="480" />
</p>

<h1 align="center">@pxlkit/ui-kit-angular</h1>

<p align="center">
  <strong>The Pxlkit retro UI kit for Angular.</strong><br/>
  The same components, markup, theme and behaviour as the React kit — buttons, inputs, modals, popovers, tabs, toasts, animations — as standalone, signal-based Angular components.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@pxlkit/ui-kit-angular"><img src="https://img.shields.io/npm/v/@pxlkit/ui-kit-angular?color=blue" alt="npm version" /></a>
  <a href="https://github.com/joangeldelarosa/pxlkit/blob/main/LICENSE-CODE"><img src="https://img.shields.io/badge/license-MIT-22c55e.svg" alt="MIT License" /></a>
  <img src="https://img.shields.io/badge/angular-20%E2%80%9322-dd0031?logo=angular&logoColor=white" alt="Angular 20–22" />
  <img src="https://img.shields.io/badge/typescript-strict-3178C6?logo=typescript&logoColor=white" alt="TypeScript strict" />
</p>

---

## Overview

`@pxlkit/ui-kit-angular` is the Angular edition of the [Pxlkit](https://pxlkit.xyz) UI kit. Every component renders the same markup and classes as its React counterpart in [`@pxlkit/ui-kit`](https://www.npmjs.com/package/@pxlkit/ui-kit) and behaves the same way — keyboard handling, focus management, ARIA — which the repository's parity suite verifies example by example. Both kits are built on [`@pxlkit/ui-kit-core`](https://www.npmjs.com/package/@pxlkit/ui-kit-core): one set of design tokens, one Tailwind CSS theme, one implementation of the DOM behaviour.

The components are standalone and `OnPush`, use signal inputs, `model()` and `output()`, and work in zoneless and zone.js applications alike. Form controls implement `ControlValueAccessor`, so they work with `ngModel` and reactive forms.

## Installation

```bash
npm install @pxlkit/ui-kit-angular
```

> **Peer dependencies:** `@angular/core`, `@angular/common` and `@angular/forms`, versions 20 to 22. The styles need [Tailwind CSS v4](https://tailwindcss.com) in your build.

### Styles

The kit's stylesheet brings Tailwind CSS v4, the Pxlkit theme and the kit's class names, so it takes the place of `@import "tailwindcss"` in the stylesheet Tailwind processes (for example `src/styles.css`):

```css
@import "@pxlkit/ui-kit-angular/styles.css";
```

There is nothing else to configure. Do not import `tailwindcss` separately as well — it would load Tailwind's base styles twice.

## Quick start

```ts
import { Component, signal } from '@angular/core';
import { PixelButton, PixelModal } from '@pxlkit/ui-kit-angular';

@Component({
  selector: 'app-root',
  imports: [PixelButton, PixelModal],
  template: `
    <button pxlButton tone="green" (click)="open.set(true)">Get started</button>
    <pxl-modal [(open)]="open" title="Welcome">
      <p>Pixel-perfect, in Angular.</p>
    </pxl-modal>
  `,
})
export class App {
  readonly open = signal(false);
}
```

## From the React API to Angular

The inputs, their names and their defaults are the React kit's props; the rest follows Angular conventions:

| React | Angular |
| --- | --- |
| a component rendering `<button>`, `<a>`, `<input>` | an attribute on that element: `<button pxlButton>`, `<a pxlButton>` |
| any other component | an element: `<pxl-badge>`, `<pxl-modal>` |
| `children` | projected content |
| other element props (`footer`, `icon`) | inputs taking text or an `<ng-template>` |
| `value` + `onChange`, `open` + `onOpenChange` | two-way bindings: `[(value)]`, `[(open)]` — form controls also take `ngModel` / `formControlName` |
| callbacks (`onClose`) | outputs (`(closed)`) |

Components that render no element of their own in React (providers, popovers, form fields wrapping a control) have a layout-neutral host (`display: contents`).

## Surfaces and tones

Every visible component takes `surface: 'pixel' | 'linear'` — chunky pixel borders and staircase corners, or soft borders and rounded corners — and, where it applies, `tone: 'green' | 'cyan' | 'gold' | 'red' | 'purple' | 'pink' | 'neutral'`. Switch a whole subtree, or the whole application:

```html
<ng-container pxlKitSurface="linear">
  <!-- every nested component renders with the linear surface -->
</ng-container>
```

```ts
bootstrapApplication(App, { providers: [providePxlKitSurface('linear')] });
```

Tones and surfaces resolve to the `--retro-*` CSS variables of the theme: override any of them on `:root` or `.dark` to reskin every component.

## Server rendering

Components render on the server (`@angular/ssr`) and hydrate without mismatches. Overlays render their content in place on the server and during hydration, then move it into `document.body`; browser-only behaviour (positioning, focus, page-wide listeners) starts after the first render and runs outside the Angular zone.

## Utilities

The React kit's hooks, as injection functions: `injectDarkMode`, `injectLocalStorage`, `injectMediaQuery`, `injectReducedMotion`, `injectFocusTrap`, `injectScrollLock`, `injectEscape`, `injectClickOutside`, `injectEventListener`, `injectPxlKitSurface`, `injectEffectiveSurface` and `injectPxlKitLocale`.

## Components

<!-- COMPONENTS:START -->
<!-- auto-generated from component manifests by scripts/build-docs/generate-readme-package.ts — edit the manifests, then run `npm run docs:build`. -->

| Component | Status | Category |
| --- | --- | --- |
| `PixelAccordion` | stable | navigation |
| `PixelAlertDialog` | stable | overlays |
| `PixelAvatar` | stable | data |
| `PixelAvatarGroup` | stable | data |
| `PixelBadge` | stable | data |
| `PixelBadgeGroup` | stable | data |
| `PixelBareInput` | stable | forms |
| `PixelBareTextarea` | stable | forms |
| `PixelBento` | stable | layout |
| `PixelBentoCell` | stable | layout |
| `PixelBox` | stable | layout |
| `PixelBreadcrumb` | stable | navigation |
| `PixelButton` | stable | actions |
| `PixelCenter` | stable | layout |
| `PixelCheckbox` | stable | forms |
| `PixelChip` | stable | data |
| `PixelChipGroup` | stable | data |
| `PixelCluster` | stable | layout |
| `PixelCodeInline` | stable | data |
| `PixelCollapsible` | stable | data |
| `PixelColorSwatch` | stable | data |
| `PixelCommand` | stable | overlays |
| `PixelContainer` | stable | layout |
| `PixelDivider` | stable | layout |
| `PixelDrawer` | stable | overlays |
| `PixelDropdown` | stable | overlays |
| `PixelEqualHeightGrid` | stable | layout |
| `PixelGrid` | stable | layout |
| `PixelInput` | stable | forms |
| `PixelInputGroup` | stable | forms |
| `PixelKbd` | stable | data |
| `PixelMenubar` | stable | navigation |
| `PixelModal` | stable | overlays |
| `PixelNavigationMenu` | stable | navigation |
| `PixelNumberInput` | stable | forms |
| `PixelPagination` | stable | navigation |
| `PixelPasswordInput` | stable | forms |
| `PixelPopover` | stable | overlay-foundation |
| `PixelPortal` | stable | overlay-foundation |
| `PixelRadioGroup` | stable | forms |
| `PixelScrollArea` | stable | layout |
| `PixelSection` | stable | layout |
| `PixelSectionHeader` | stable | layout |
| `PixelSegmented` | stable | forms |
| `PixelSelect` | stable | forms |
| `PixelSheet` | stable | overlays |
| `PixelSidebar` | stable | navigation |
| `PixelStack` | stable | layout |
| `PixelStepper` | stable | navigation |
| `PixelSwitch` | stable | forms |
| `PixelTabs` | stable | navigation |
| `PixelTextarea` | stable | forms |
| `PixelTextLink` | stable | data |
| `PixelTimeline` | stable | data |
| `PixelToggle` | stable | forms |
| `PixelTooltip` | stable | overlays |
| `PixelTwoColumn` | stable | layout |
| `PxlKitLocaleProvider` | stable | overlay-foundation |
| `PxlKitSurfaceProvider` | stable | overlay-foundation |
<!-- COMPONENTS:END -->

## Documentation

Guides, every component and live examples at **[pxlkit.xyz](https://pxlkit.xyz)**.

## Related packages

| Package | Description |
| --- | --- |
| [`@pxlkit/ui-kit`](https://www.npmjs.com/package/@pxlkit/ui-kit) | The React components |
| [`@pxlkit/ui-kit-vue`](https://www.npmjs.com/package/@pxlkit/ui-kit-vue) | The Vue components |
| [`@pxlkit/ui-kit-core`](https://www.npmjs.com/package/@pxlkit/ui-kit-core) | The shared tokens, theme and behaviour |
| [`@pxlkit/angular`](https://www.npmjs.com/package/@pxlkit/angular) | Pixel art icon components for Angular |

## License

[MIT License](https://github.com/joangeldelarosa/pxlkit/blob/main/LICENSE-CODE) — code package. See the [repo licensing overview](https://github.com/joangeldelarosa/pxlkit/blob/main/LICENSE) for split-license scope details.

Created by [Joangel De La Rosa](https://github.com/joangeldelarosa)

<p align="center">
  <img src="https://raw.githubusercontent.com/joangeldelarosa/pxlkit/main/apps/web/public/og-image.png" alt="Pxlkit — retro pixel-art UI kit for Angular" width="480" />
</p>

<h1 align="center">@pxlkit/ui-kit-angular</h1>

<p align="center">
  <strong>The Pxlkit retro UI kit for Angular — new in Pxlkit 2.2.0.</strong><br/>
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
npm install @pxlkit/ui-kit-angular @pxlkit/angular
```

`@pxlkit/angular` renders the icons the examples use. React is never installed.

> **Peer dependencies:** `@angular/core`, `@angular/common` and `@angular/forms`, versions 20 to 22. The styles need [Tailwind CSS v4](https://tailwindcss.com) in your build.

### Tailwind CSS v4 in your build

The kit's stylesheet is a Tailwind CSS v4 entry point, so Tailwind has to process it. If your app does not use Tailwind v4 yet:

- **Angular CLI 21 and later** — `ng new my-app --style=tailwind`.
- **Angular 20, or an existing app** — `npm install -D tailwindcss @tailwindcss/postcss postcss`, and `.postcssrc.json` at the workspace root:
  ```json
  { "plugins": { "@tailwindcss/postcss": {} } }
  ```

Without it the build still succeeds, but the CSS keeps `@theme`, `@source` and `@apply` as written and the components render unstyled.

### Styles

The kit's stylesheet imports Tailwind CSS v4 and adds the Pxlkit theme and the kit's class names, so it takes the place of `@import "tailwindcss"` in the stylesheet Tailwind processes (for example `src/styles.css`):

```css
@import "@pxlkit/ui-kit-angular/styles.css";

/* The kit styles the components, not the page: theme <body> yourself */
@layer base {
  body {
    background-color: var(--color-retro-bg);
    color: var(--color-retro-text);
    font-family: var(--font-sans);
  }
}
```

Once Tailwind CSS v4 processes that stylesheet, there is nothing else to configure. Do not import `tailwindcss` separately as well — it would load Tailwind's base styles twice.

### Fonts

The theme names Press Start 2P (`font-pixel`), Inter (`font-sans`) and JetBrains Mono (`font-mono`) but loads none of them. Add the stylesheet `buildGoogleFontsUrl('en')` builds — from `@pxlkit/ui-kit-core`; `'tr'` adds the Latin Extended subset — to `src/index.html`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&subset=latin&display=swap" />
```

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

- **Overlays decide nothing on their own.** `<pxl-modal>`, `<pxl-drawer>`, `<pxl-sheet>`, `<pxl-alert-dialog>`, `<pxl-command>` and `<pxl-popover>` take `open` as a required input and show exactly that: the close button, Escape, the backdrop, a press outside or the palette's shortcut only ask through `(openChange)`. Bind `[(open)]`, or `[open]` with `(openChange)` / `(closed)` — a one-way `[open]="true"` with no listener stays open. `<pxl-dropdown-root>` and `<pxl-tooltip>` may stay uncontrolled: leave `open` unbound and set `defaultOpen`.
- **Callbacks whose presence changes React's markup** become a boolean input plus an output, since an output cannot tell whether anyone listens: `PixelChip` — `deletable` + `(delete)`, `clickable` + `(clicked)` (a clickable chip without ×: `<button pxlChip>`); `PixelTable` / `PixelDataTable` — `[clickableRows]` + `(rowClick)`; `PixelStepper` — `[clickable]` + `(stepClick)`.
- **Native attributes on form fields.** `<pxl-input>` passes `id`, `name`, `type`, `placeholder`, `autocomplete`, `pattern`, `minlength`, `maxlength`, `required`, `readonly`, `disabled`, `aria-label` and `aria-describedby` to its `<input>`; any other attribute (`inputmode`, `min`, `step`, `data-*`) stays on the host. Use `<input pxlBareInput>` for full control.
- **Form controls** (`ngModel`, `formControlName`, `[formControl]`): `pxl-input`, `pxl-password-input`, `pxl-textarea`, `pxl-number-input`, `pxl-otp-input`, `pxl-select`, `pxl-combobox`, `pxl-multi-select`, `pxl-date-picker`, `pxl-date-range-picker`, `pxl-calendar-grid`, `pxl-color-input`, `pxl-checkbox`, `pxl-switch`, `fieldset[pxlRadioGroup]`, `pxl-segmented`, `pxl-slider`, `button[pxlToggle]`, `pxl-toggle-group`, `pxl-file-upload`, `pxl-star-rating`, `pxl-chip-group`, `input[pxlBareInput]`, `textarea[pxlBareTextarea]`.

## Surfaces and tones

Every visible component takes `surface: 'pixel' | 'linear'` — chunky pixel borders and staircase corners, or soft borders and rounded corners — and, where it applies, `tone: 'green' | 'cyan' | 'gold' | 'red' | 'purple' | 'pink' | 'neutral'`. Switch a whole subtree, or the whole application:

```html
<ng-container pxlKitSurface="linear">
  <!-- every nested component renders with the linear surface -->
</ng-container>
```

For the whole application, add `providePxlKitSurface('linear')` to the `providers` in `src/app/app.config.ts`, next to the ones the CLI generated:

```ts
import type { ApplicationConfig } from '@angular/core';
import { providePxlKitSurface } from '@pxlkit/ui-kit-angular';

export const appConfig: ApplicationConfig = {
  providers: [
    // …keep the providers `ng new` generated (error listeners, change detection,
    // router, provideClientHydration() in SSR apps), and add:
    providePxlKitSurface('linear'),
  ],
};
```

Tones and surfaces resolve to the `--retro-*` CSS variables of the theme: override any of them on `:root` or `.dark` to reskin every component.

## Dark mode

The theme follows a class: `.dark` on `<html>` (or any ancestor) selects the dark palette, `.light` the light one. `injectDarkMode()` returns `{ mode, resolved, setMode }` as signals and a setter; `setMode('light' | 'dark' | 'system')` stores the choice in `localStorage` (`pxlkit:dark-mode`) and sets the class, and `'system'` follows `prefers-color-scheme`.

```ts
import { Component } from '@angular/core';
import { PixelButton, injectDarkMode } from '@pxlkit/ui-kit-angular';

@Component({
  selector: 'app-theme-toggle',
  imports: [PixelButton],
  template: `
    <button pxlButton (click)="toggle()">
      {{ theme.resolved() === 'dark' ? 'Light theme' : 'Dark theme' }}
    </button>
  `,
})
export class ThemeToggle {
  protected readonly theme = injectDarkMode();

  toggle() {
    this.theme.setMode(this.theme.resolved() === 'dark' ? 'light' : 'dark');
  }
}
```

It starts from `'system'` / `'light'` on the server and reads the stored choice in the browser, so a server-rendered app sets the class before first paint with a small inline script in `src/index.html`'s `<head>` that reads the same key — the [`@pxlkit/ui-kit` README](https://github.com/Joangeldelarosa/pxlkit/blob/main/packages/ui-kit/README.md#dark-mode) has it. To re-skin, redefine any `--retro-*` variable after the kit's import, on `:root` for the light theme and on `.dark` for the dark one.

## Server rendering and hydration

Nothing beyond Angular's own setup: `ng new --ssr` (or `ng add @angular/ssr`), and keep `provideClientHydration()` in `app.config.ts` — removing it makes the browser throw the server markup away and render again. Components render on the server and hydrate without mismatches. Overlays render in place on the server and move into `document.body` after hydration; listeners, positioning and focus start in the browser only, outside the Angular zone. Zoneless applications (the default from Angular 21) and zone.js ones (`zone.js` in `polyfills`, `provideZoneChangeDetection()` in the providers) work alike.

A calendar shows the current month and marks today, which depends on the reader's clock: give `pxl-calendar-grid` a `month` (or a bound value) for a stable server render, or render a current-month calendar in the browser only, inside `@defer`.

## Utilities

The React kit's hooks, as injection functions: `injectDarkMode`, `injectLocalStorage`, `injectMediaQuery`, `injectReducedMotion`, `injectFocusTrap`, `injectScrollLock`, `injectEscape`, `injectClickOutside`, `injectEventListener`, `injectPxlKitSurface`, `injectEffectiveSurface` and `injectPxlKitLocale`.

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

The Angular setup at **[pxlkit.xyz/ui-kit#angular](https://pxlkit.xyz/ui-kit#angular)**; every component, with its Angular code, at [pxlkit.xyz/ui-kit](https://pxlkit.xyz/ui-kit) and [pxlkit.xyz/docs](https://pxlkit.xyz/docs).

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

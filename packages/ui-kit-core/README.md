<p align="center">
  <img src="https://raw.githubusercontent.com/joangeldelarosa/pxlkit/main/apps/web/public/og-image.png" alt="Pxlkit — the framework-neutral core of the retro pixel-art UI kit" width="480" />
</p>

<h1 align="center">@pxlkit/ui-kit-core</h1>

<p align="center">
  <strong>The framework-neutral core of the Pxlkit retro UI kit — new in Pxlkit 2.2.0.</strong><br/>
  Design tokens, the Tailwind CSS theme, class recipes, pixel glyphs, locale data and DOM behaviour — shared by the React kit and its Vue and Angular editions, so all three render the same markup and behave the same way.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@pxlkit/ui-kit-core"><img src="https://img.shields.io/npm/v/@pxlkit/ui-kit-core?color=blue" alt="npm version" /></a>
  <a href="https://github.com/joangeldelarosa/pxlkit/blob/main/LICENSE-CODE"><img src="https://img.shields.io/badge/license-MIT-22c55e.svg" alt="MIT License" /></a>
  <img src="https://img.shields.io/badge/dependencies-1-22c55e" alt="One dependency" />
  <img src="https://img.shields.io/badge/typescript-strict-3178C6?logo=typescript&logoColor=white" alt="TypeScript strict" />
</p>

---

## Do I need to install this?

Usually not directly — it comes with your framework's kit:

| Framework | Kit | Stylesheet |
| --- | --- | --- |
| React | [`@pxlkit/ui-kit`](https://www.npmjs.com/package/@pxlkit/ui-kit) | `@import "@pxlkit/ui-kit/styles.css";` |
| Vue 3 | [`@pxlkit/ui-kit-vue`](https://www.npmjs.com/package/@pxlkit/ui-kit-vue) | `@import "@pxlkit/ui-kit-vue/styles.css";` |
| Angular | [`@pxlkit/ui-kit-angular`](https://www.npmjs.com/package/@pxlkit/ui-kit-angular) | `@import "@pxlkit/ui-kit-angular/styles.css";` |

Each kit's stylesheet imports Tailwind CSS v4 and this package's theme, and points Tailwind at the class names both packages use, so one `@import` of it — in place of `@import "tailwindcss";` — is all the CSS setup there is, once Tailwind CSS v4 runs in your build (its Vite or PostCSS plugin — your kit's README has the step). Without Tailwind in the build, the components render unstyled.

Install it yourself when you build your own components on the same design system, in any framework or none:

```bash
npm install @pxlkit/ui-kit-core
```

## What's inside

| Area | Exports |
| --- | --- |
| Design tokens | `containerWidth`, `pageGutter`, `sectionRhythm`, `stackGap`, `rhythm`, `tone`, `durations`, `easings` |
| Vocabulary | `Tone`, `Size`, `Variant`, `Surface` types |
| Surface system | `surfaceClasses(surface)` — the class bundle of the `pixel` and `linear` aesthetics |
| Control scale | `toneMap`, `sizeClass`, `sizeHeight`, `sizeSquare`, `pixelDot`, `pixelRadius`, `pixelType`, `focusRing`, `inputBase`, `cn` |
| Class recipes | Per-component class tables shared by the three kits (for example `badgeVariantClasses`, `badgeSizeClasses`) |
| Pixel glyphs | `PIXEL_GLYPHS`, `PIXEL_GLYPH_VIEWBOX`, `PIXEL_GLYPH_STYLE` — the chevron, check and close glyphs as data |
| Locale | `PxlKitLocale`, `PXLKIT_FONTS`, `buildGoogleFontsUrl`, `toLocaleUpper`, `toLocaleLower`, `TURKISH_CHARACTERS`, `createLocaleContextValue` |
| DOM behaviour | `trapFocus`, `getFocusableElements`, `lockScroll`, `returnFocusOnRemoval` |
| Floating content | `toPlacement`, `anchoredMiddleware`, `anchorFloating`, `floatingStyles` — popovers anchored with [Floating UI](https://floating-ui.com) |
| Preferences | `readStoredMode`, `writeStoredMode`, `resolveMode`, `applyResolvedMode` (dark mode), `matchesMediaQuery`, `subscribeMediaQuery`, `readStorage`, `writeStorage`, `removeStorage` |

Everything is plain TypeScript, safe to import on the server: DOM helpers check for `window` / `document` and degrade to no-ops. The one runtime dependency is `@floating-ui/dom`, which positions floating content.

## Examples

Compose the kit's classes in your own markup:

```ts
import { cn, focusRing, sizeClass, surfaceClasses, toneMap } from '@pxlkit/ui-kit-core';

const s = surfaceClasses('pixel');
const t = toneMap.cyan;
const className = cn('inline-flex items-center', s.border, s.radius, s.font, sizeClass.md, t.border, t.text, focusRing);
```

Trap focus and lock scrolling while a dialog of your own is open:

```ts
import { lockScroll, trapFocus } from '@pxlkit/ui-kit-core';

const releaseFocus = trapFocus(() => dialogElement);
const releaseScroll = lockScroll();
// …on close:
releaseFocus(); // focus returns to the element that opened the dialog
releaseScroll(); // scroll locks stack across every kit on the page
```

## Theming

The stylesheet defines the `--retro-*` palette for the light theme (`:root`) and the dark theme (`.dark` on `<html>` or any ancestor), maps it onto Tailwind utilities (`bg-retro-bg`, `text-retro-cyan`, …) and adds the pixel utilities (`pxl-corner-*`, `pxl-shadow*`, `pxl-nudge-*`). Override any variable after importing your kit's stylesheet:

```css
@import "@pxlkit/ui-kit/styles.css";

:root { --retro-green: #22c55e; }
.dark { --retro-green: #4ade80; }
```

### Using the theme in your own styles

- Styles Tailwind compiles separately (a Vue `<style>` block, Angular component styles, CSS modules) must reference the theme before `@apply` can use it — otherwise the build stops with `Cannot apply unknown utility class 'bg-retro-…'`:
  ```css
  @reference "@pxlkit/ui-kit-vue/styles.css"; /* or @pxlkit/ui-kit/styles.css, @pxlkit/ui-kit-angular/styles.css */

  .panel { @apply bg-retro-surface text-retro-text font-pixel; }
  ```
- `pxl-corner-*`, `pxl-shadow*` and `pxl-nudge-*` are plain classes: use them in markup; they take no variants and `@apply` rejects them.
- A cut corner (`pxl-corner-*`) is a `clip-path`, which also clips a drop shadow on the same element: put `pxl-shadow` on an element whose corners are whole, or on a wrapper. `pxl-nudge-hover` and `pxl-nudge-active` give the pixel press feel without the shadow — 1px on hover, 2px while pressed — as the kits' pixel buttons do.
- On the pixel surface a cut corner clips a focus ring drawn outside the element, so keyboard focus lights the 2px edge inside: automatically on a `pxl-corner-*` element that takes focus; elsewhere add `pxl-focus-inset` with a variant (`focus-visible:pxl-focus-inset`, `group-focus-visible:pxl-focus-inset`, `has-[input:focus-visible]:pxl-focus-inset`). `--pxl-focus-color` sets its colour (`currentColor`; `Highlight` in forced-colors mode).

## Related Packages

| Package | Description |
| --- | --- |
| [`@pxlkit/ui-kit`](https://www.npmjs.com/package/@pxlkit/ui-kit) | The React components |
| [`@pxlkit/ui-kit-vue`](https://www.npmjs.com/package/@pxlkit/ui-kit-vue) | The Vue 3 components |
| [`@pxlkit/ui-kit-angular`](https://www.npmjs.com/package/@pxlkit/ui-kit-angular) | The Angular components |

## Documentation

Browse every component at **[pxlkit.xyz/ui-kit](https://pxlkit.xyz/ui-kit)** and the setup guide at [pxlkit.xyz/docs](https://pxlkit.xyz/docs#ui-kit).

## License

[MIT License](https://github.com/joangeldelarosa/pxlkit/blob/main/LICENSE-CODE) — code package. See the [repo licensing overview](https://github.com/joangeldelarosa/pxlkit/blob/main/LICENSE) for split-license scope details.

Created by [Joangel De La Rosa](https://github.com/joangeldelarosa)

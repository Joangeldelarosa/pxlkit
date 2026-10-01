<p align="center">
  <img src="https://raw.githubusercontent.com/joangeldelarosa/pxlkit/main/apps/web/public/og-image.png" alt="Pxlkit" width="480" />
</p>

<h1 align="center">@pxlkit/ui-kit-core</h1>

<p align="center">
  <strong>The framework-neutral core of the Pxlkit retro UI kit.</strong><br/>
  Design tokens, the Tailwind CSS theme, class recipes, pixel glyphs, locale data and DOM behaviour — shared by the React, Vue and Angular kits so all three render the same markup and behave the same way.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@pxlkit/ui-kit-core"><img src="https://img.shields.io/npm/v/@pxlkit/ui-kit-core?color=blue" alt="npm version" /></a>
  <a href="https://github.com/joangeldelarosa/pxlkit/blob/main/LICENSE-CODE"><img src="https://img.shields.io/badge/license-MIT-22c55e.svg" alt="MIT License" /></a>
  <img src="https://img.shields.io/badge/dependencies-0-22c55e" alt="Zero dependencies" />
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

Each kit's stylesheet imports this package's theme and points Tailwind CSS v4 at the class names both packages use, so one `@import` after `@import "tailwindcss";` is all the setup there is.

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
| DOM behaviour | `trapFocus`, `getFocusableElements`, `lockScroll` |
| Preferences | `readStoredMode`, `writeStoredMode`, `resolveMode`, `applyResolvedMode` (dark mode), `matchesMediaQuery`, `subscribeMediaQuery`, `readStorage`, `writeStorage`, `removeStorage` |

Everything is plain TypeScript with no runtime dependencies, safe to import on the server: DOM helpers check for `window` / `document` and degrade to no-ops.

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

The stylesheet defines the `--retro-*` palette for the light theme (`:root`) and the dark theme (`.dark` on `<html>` or any ancestor), maps it onto Tailwind utilities (`bg-retro-bg`, `text-retro-cyan`, …) and adds the pixel utilities (`pxl-corner-*`, `pxl-shadow*`). Override any variable after importing your kit's stylesheet:

```css
@import "tailwindcss";
@import "@pxlkit/ui-kit/styles.css";

:root { --retro-green: #22c55e; }
.dark { --retro-green: #4ade80; }
```

## Related Packages

| Package | Description |
| --- | --- |
| [`@pxlkit/ui-kit`](https://www.npmjs.com/package/@pxlkit/ui-kit) | The React components |
| [`@pxlkit/ui-kit-vue`](https://www.npmjs.com/package/@pxlkit/ui-kit-vue) | The Vue 3 components |
| [`@pxlkit/ui-kit-angular`](https://www.npmjs.com/package/@pxlkit/ui-kit-angular) | The Angular components |

## Documentation

Browse every component and the full docs at **[pxlkit.xyz](https://pxlkit.xyz)**.

## License

[MIT License](https://github.com/joangeldelarosa/pxlkit/blob/main/LICENSE-CODE) — code package. See the [repo licensing overview](https://github.com/joangeldelarosa/pxlkit/blob/main/LICENSE) for split-license scope details.

Created by [Joangel De La Rosa](https://github.com/joangeldelarosa)

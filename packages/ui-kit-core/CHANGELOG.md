# Changelog — @pxlkit/ui-kit-core

<!-- This file is hand-maintained — add an entry at the top for each release. -->

## 2.2.0 — 2026-10-03

### Added

- Initial release: the framework-neutral core of the Pxlkit UI kit, shared by `@pxlkit/ui-kit` (React), `@pxlkit/ui-kit-vue` and `@pxlkit/ui-kit-angular`. Versioned in step with the kits.
- Design tokens (`containerWidth`, `pageGutter`, `sectionRhythm`, `stackGap`, `rhythm`, `tone`, `durations`, `easings`), the `Tone` / `Size` / `Variant` / `Surface` vocabulary, the surface system (`surfaceClasses`) and the control scale (`toneMap`, `sizeClass`, `sizeHeight`, `sizeSquare`, `pixelDot`, `pixelRadius`, `pixelType`, `focusRing`, `inputBase`, `cn`) — moved here from the React kit, unchanged.
- The Tailwind CSS v4 theme (`styles.css`), moved from the React kit; it now also registers this package's compiled class names with Tailwind (`@source "./dist"`) and maps `--font-mono` to JetBrains Mono, the mono family of `PXLKIT_FONTS` it never applied. It also styles PixelScrollArea's scrollbar (`.pxl-scroll-*`, `--pxl-scrollbar-size`), which no stylesheet did.
- Keyboard focus on the pixel surface: the theme's `pxl-focus-inset` utility draws focus inside an element's border box — a 2px outline in the text colour (`Highlight` in forced-colors mode, through `--pxl-focus-color`) — where a cut corner's `clip-path` would clip a ring. Every `.pxl-corner-*` element takes it on `:focus-visible`; with a variant (`group-focus-visible:`, `has-[…]:`, `peer-focus-visible:`) a recipe draws one element's focus on another, as `indicatorFocusClasses(surface, tone)` does for a checkbox's or a radio's box. Focus rings hide the outline with `outline-hidden`, which forced-colors mode shows.
- Class recipes shared by the components of every framework, by category (`badgeVariantClasses`, `stackAlignClasses`, `popoverContentClasses`, …).
- The kit's pixel glyphs (chevron, check, close) as data: `PIXEL_GLYPHS`, `PIXEL_GLYPH_VIEWBOX`, `PIXEL_GLYPH_STYLE`, and `pixelGlyphClasses(name, className)`, which gives a glyph the caller's size in place of its own.
- Locale data and helpers: `PXLKIT_FONTS`, `buildGoogleFontsUrl`, `toLocaleUpper`, `toLocaleLower`, `TURKISH_CHARACTERS`, `createLocaleContextValue`.
- DOM behaviour for overlays: `trapFocus` / `getFocusableElements`, the stacking `lockScroll` (one lock count for every kit on the page) and `returnFocusOnRemoval`, which hands focus back to a trigger when focused content closes.
- Floating content anchored to a trigger, on Floating UI (`@floating-ui/dom`, the package's one dependency): `toPlacement`, `anchoredMiddleware`, `anchorFloating` and `floatingStyles`, the inline styles `@floating-ui/react-dom` produces, so every kit positions popovers identically.
- Preference helpers: dark mode (`readStoredMode`, `writeStoredMode`, `resolveMode`, `applyResolvedMode`), media queries (`matchesMediaQuery`, `subscribeMediaQuery`, `REDUCED_MOTION_QUERY`) and failure-tolerant `localStorage` access (`readStorage`, `writeStorage`, `removeStorage`).

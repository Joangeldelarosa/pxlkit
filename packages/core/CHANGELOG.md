# Changelog — @pxlkit/core

<!-- Seeded from git history by scripts/build-docs/generate-changelog.ts (initial generation). -->
<!-- This file is hand-maintained from this point on — add an entry at the top for each release. -->

## 1.4.0 — 2026-10-03

### Added

- `@pxlkit/core/vanilla` — a React-free entry point with the icon data types, every utility and the new framework-agnostic rendering engine. Nothing in its module graph (runtime or type declarations) references a UI framework; it is what `@pxlkit/vue`, `@pxlkit/angular` and the icon packs build on. The root entry re-exports all of it, so `@pxlkit/core` stays a superset.
- Rendering engine, shared by the React, Vue and Angular components: `renderIconSvg` / `renderIconDataUri` (the exact `<img>` markup of `PxlKitIcon`), `createAnimatedIconPlayer` (frame clock, all five triggers, off-screen pausing), `createParallaxController` (mouse tilt, peel-apart intro, click burst, particles), `resolvePixelToastView` / `resolveToastAutoClose`, plus their style helpers (`ICON_IMAGE_STYLE`, `animatedIconWrapperStyle`, `parallax*Style`, `PARALLAX_CANVAS_STYLE`) and supporting resolvers (`resolveIconLabel`, `resolveAnimationTrigger`, `resolveFrameDuration`, `getAnimationFrame`, `resolveParallaxGeometry`, `parallaxParticleColors`).
- `decorative` on `PxlKitIcon`, `AnimatedPxlKitIcon` and `ParallaxPxlKitIcon`, for an icon beside text that already says what it means: the icon renders `alt=""` (the parallax icon's container drops `role="img"` and its label for `aria-hidden="true"`), so screen readers skip it and its name stays out of the page's text. Without it an icon is named by `aria-label`, else by the icon's `name`; an empty `aria-label` still falls back to the name. The engine decides it for the three frameworks: `resolveIconLabel(icon, { label, decorative })` and `resolveIconContainerAria(icon, options)`.

### Changed

- `PixelToast`'s icon is decorative (`alt=""`): the toast's title names the toast, and the icon stands where its status dot would.
- `react` and `react-dom` are now optional peer dependencies: only the root entry's components need them, so Vue, Angular and vanilla installs no longer pull React in.
- The package `exports` map declares separate ESM (`.d.ts`) and CommonJS (`.d.cts`) type declarations per condition, and `typesVersions` resolves the `vanilla` subpath under `moduleResolution: "node"`.
- The React component props (`PxlKitProps`, `AnimatedPxlKitProps`, `ParallaxPxlKitProps`, `PixelToastProps`) moved from `src/types.ts` to the React layer (`src/components/types.ts`); `types.ts` is now the framework-agnostic icon data model. Both are still exported from `@pxlkit/core` under the same names.
- `PxlKitIcon`, `AnimatedPxlKitIcon`, `ParallaxPxlKitIcon` and `PixelToast` render through the shared engine. Their markup is unchanged; `ParallaxPxlKitIcon` no longer re-renders on every frame of its intro animation, and touches its particle canvas only while particles are on screen (it used to call `getContext('2d')` and clear the canvas on every animation frame).

### Fixed

- `ParallaxPxlKitIcon`: after a click burst the layers now spring back to their resting spread. The burst decayed in a ref that never triggered a render, so the stack stayed exploded until something else re-rendered the component.
- `AnimatedPxlKitIcon` with `trigger="ping-pong"`: playback no longer stalls on the first frame when several frame ticks are processed in one React render (high `fps`, a busy main thread), and switching to another icon commits its first frame before paint.
- `AnimatedPxlKitIcon` ignores `NaN` `speed` / `fps` values instead of starting a zero-delay interval.
- `PxlKitIcon`: colour values are XML-escaped inside the generated SVG, so a malformed `color` string can no longer break the image markup.
- `PixelToast`: the root element's class list no longer ends with a stray space when `className` is not set.
- The `ParallaxLayer` and `ParallaxPxlKitData` docs said each layer moves by its `depth`. The renderers place layers by their order in `layers` and tilt the whole stack; the docs now say so, and that `depth` is authoring metadata.

### Deprecated

- `ParallaxLayer.offsetX` and `ParallaxLayer.offsetY`: no renderer has ever applied them. They stay in the type until the next major so existing icon data keeps type-checking.

## 1.3.4 — 2026-07-06

### Fixed

- `PixelToast`: the title now breaks long unbroken strings (`break-words`), matching the existing behavior of the message body.

## 1.3.3 — 2026-05-27

### Added

- add 10 parallax pixel art icons with animated layers _(fa2240a)_
- add comprehensive test suite, Storybook, and CI/infrastructure improvements _(3a0ca4d)_
- add FullscreenMap component for interactive world map overlay _(fbf0787)_
- add ParallaxPxlKitIcon component, cool-emoji parallax icon, landing page showcase, and 50% pricing discount _(6a1ef13)_
- automated npm publish on merge to main with quality gate and version detection _(605c927)_
- comprehensive SEO optimization across all pages, packages, and metadata _(d1c84d7)_
- dramatic 3D parallax with click interactions, pixel particle bursts, page-wide mouse tracking, and 10-icon animated collection _(6559bff)_
- render PxlKitIcon as <img>+data-URI for pixel-perfect scaling (BREAKING) _(f2832b7)_
- rewrite ParallaxPxlKitIcon to true 3D with CSS perspective, rotateX/Y, translateZ, peel-apart intro, and depth shadows _(4f181ad)_

### Changed

- add ParallaxPxlKitIcon tests, isParallaxIcon tests, and code review fixes _(1809aeb)_
- add README.md for all packages and bump patch versions for npm publish _(ec780d4)_
- bump all 10 package versions for npm publish (README doc fixes) _(8df076f)_
- bump package versions and align license docs _(e02cb79)_
- clarify that <img>+data-URI keeps SVG end-to-end _(d9d2b0b)_
- close the remaining 8 doc gaps + storybook v1.3 migration _(65e9ff4)_
- core 1.3.3, feedback 1.2.5, gamification 1.2.4 _(94675d4)_
- fix icon count inconsistencies in effects and weather README files _(c8b69b4)_
- rewrite READMEs + CHANGELOG, add AUDIT + STORYBOOK_DEPLOY + CLAUDE _(3dee565)_
- split licensing model and update copy _(7a08e8f)_

### Fixed

- add `as const` to size literals in gridToPixels.test.ts to satisfy GridSize type _(7a3d534)_
- address code review feedback - remove unused refs and simplify intro logic _(6c90996)_
- align package repository metadata with npm provenance expectations _(c56c873)_
- correct CSS comment syntax in docs and update all icon counts to match source code _(bb780f1)_
- resolve coverage threshold failure by excluding non-testable files and adding AnimatedPxlKitIcon tests _(14882fb)_

## 1.3.1 — 2026-05-12

### Fixed

- correct feBlend operand order in tint filter (1.3.1 → 1.3.2) (BREAKING) _(15d9c77)_

## 1.2.0 — 2026-03-29

### Added

- add @pxlkit/parallax package with 10 multi-layer 3D parallax icons, bump all packages to v1.2.0 _(b1855e9)_

## 1.0.1 — 2026-03-10

### Added

- :sparkles: initial commit 1.0.1 _(d1f5cc8)_

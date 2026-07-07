# Changelog — @pxlkit/core

<!-- Seeded from git history by scripts/build-docs/generate-changelog.ts (initial generation). -->
<!-- This file is hand-maintained from this point on — add an entry at the top for each release. -->

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

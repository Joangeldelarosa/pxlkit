# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.3.0] - 2026-04-08

### Added

- **Turkish Locale Support** — `@pxlkit/ui-kit` v1.3.0
  - New `PxlKitLocaleProvider` component for locale-aware font loading and text transforms
  - `usePxlKitLocale()` hook providing `upper()`, `lower()`, `locale`, and `fontsUrl` from context
  - Standalone utilities: `toLocaleUpper(text, locale)` and `toLocaleLower(text, locale)`
  - `buildGoogleFontsUrl(locale)` — generates Google Fonts CSS2 URLs with correct subsets per locale
  - `PXLKIT_FONTS` configuration object for pixel (Press Start 2P), sans (Inter), mono (JetBrains Mono)
  - `TURKISH_CHARACTERS` constant with lowercase, uppercase, sample text, and pangram
  - `PxlKitLocale` type (`'en' | 'tr'`) for BCP 47 locale tags
  - Turkish locale correctly handles dotted/dotless i: `i → İ`, `ı → I` (uppercase), `İ → i`, `I → ı` (lowercase)
  - CSS `text-transform: uppercase` is locale-aware via `lang="tr"` attribute on provider wrapper div
  - Google Fonts `latin-ext` subset included for Turkish characters (ğ, Ğ, ı, İ, ş, Ş, ç, Ç, ö, Ö, ü, Ü)

- **Locale-Aware Components** — Components now respect the locale context
  - `PixelSection` — title uppercasing via `usePxlKitLocale()` hook
  - `PixelModal` — title uppercasing via `usePxlKitLocale()` hook
  - `PixelAvatar` — initials extraction uses locale-aware uppercasing

- **Test Suite** — 71 tests for `@pxlkit/ui-kit` (vitest + @testing-library/react)
  - Turkish vs English uppercasing/lowercasing
  - Unicode boundary tests (U+0130 İ, U+0131 ı)
  - Roundtrip consistency (lower→upper→lower preserves text)
  - `buildGoogleFontsUrl` output validation
  - `PXLKIT_FONTS` and `TURKISH_CHARACTERS` constant validation
  - `PxlKitLocaleProvider` context injection and `lang` attribute rendering
  - Component integration tests (PixelSection, PixelAvatar, PixelModal with Turkish locale)
  - Edge cases: emoji, numbers, punctuation, empty strings

- **Web App Documentation** — New "Locale / Turkish" section in UI Kit page
  - Comparison table showing English vs Turkish uppercasing differences
  - Live interactive demo with side-by-side locale comparison
  - Turkish character font preview across all three fonts
  - Complete setup guide (React, Next.js, Google Fonts, custom components)
  - Props reference table and exported utilities reference

### Changed

- Google Fonts imports now include `&subset=latin,latin-ext` for Turkish character support
  - Updated in `apps/web/src/app/globals.css`
  - Updated in `example-page/index.html`
- Default locale context fallback uses `toLocaleUpperCase('en')` instead of `toUpperCase()`

### Bumped

- `@pxlkit/ui-kit` bumped to **1.3.0**

## [1.2.0] - 2026-03-29

### Added

- **New Package** — `@pxlkit/parallax` v1.2.0
  - 10 multi-layer 3D parallax pixel icons with interactive mouse-tracking depth effects
  - Icons: CoolEmoji, PixelHeart, RetroTV, PixelRocket, GhostFriend, NeonSkull, MagicOrb, PixelCrown, RetroJoystick, CyberEye
  - Each icon features 3–5 depth layers combining static (`PxlKitData`) and animated (`AnimatedPxlKitData`) sub-layers
  - Uses the `ParallaxPxlKitData` type from `@pxlkit/core` for multi-layer parallax composition
  - Designed for use with the `ParallaxPxlKitIcon` component from `@pxlkit/core`
  - ESM + CJS dual build with full TypeScript declarations
  - Tree-shakeable — import individual icons or the full `ParallaxPack` array

### Bumped

- All packages bumped to **1.2.0**: `@pxlkit/core`, `@pxlkit/effects`, `@pxlkit/feedback`, `@pxlkit/gamification`, `@pxlkit/social`, `@pxlkit/ui`, `@pxlkit/weather`, `@pxlkit/ui-kit`, `@pxlkit/parallax`

## [1.1.0] - 2026-03-29

### Changed

- **CI/CD** — Automated npm publishing on merge to `main`
  - Publish workflow now triggers on push to `main`, tag push (`v*`), and GitHub Releases
  - Added **quality gate** job: build → type-check → tests → icon validation must all pass before publishing
  - Smart version detection compares local `package.json` versions against the npm registry; only packages with new versions are published
  - `@pxlkit/core` is always published first (other packages depend on it)
  - Workflow fails if any publish step fails (no silent `continue-on-error`)

### Bumped

- All packages bumped to **1.1.0**: `@pxlkit/core`, `@pxlkit/effects`, `@pxlkit/feedback`, `@pxlkit/gamification`, `@pxlkit/social`, `@pxlkit/ui`, `@pxlkit/weather`, `@pxlkit/ui-kit`

## [1.0.0] - 2026-03-09

### Added

- **Core** (`@pxlkit/core` v1.0.0)
  - `PxlKit` component — renders static 16×16 pixel art icons as inline SVG
  - `AnimatedPxlKit` component — renders animated icons with frame playback
  - `PixelToast` component — pixel-art styled toast notifications
  - Utility functions: `gridToPixels`, `gridToSvg`, `pixelsToSvg`, `generateAnimatedSvg`, `svgToDataUri`, `parseIconCode`, `generateIconCode`, `validateIconData`
  - Color utilities: `hexToRgb`, `rgbToHex`, `adjustBrightness`, `RETRO_PALETTES`
  - Full TypeScript types: `PxlKitData`, `AnimatedPxlKitData`, `IconPack`, etc.

- **Icon Packs** (all v1.0.0)
  - `@pxlkit/gamification` — 48 icons (39 static, 9 animated): trophies, swords, potions, RPG gear, coins
  - `@pxlkit/feedback` — 33 icons (30 static, 3 animated): checkmarks, alerts, shields, bugs, badges
  - `@pxlkit/social` — 43 icons (35 static, 8 animated): emojis, users, messages, hearts, reactions
  - `@pxlkit/weather` — 34 icons (29 static, 5 animated): sun, moon, storms, temperature, night sky
  - `@pxlkit/ui` — 40 icons (35 static, 5 animated): home, search, settings, navigation, layout
  - `@pxlkit/effects` — 6 animated icons: explosions, radar ping, flame, shockwave

- **Web App** (`@pxlkit/web`)
  - Landing page with interactive icon collage
  - Icon browser with search and filtering
  - Visual Icon Builder (16×16 grid editor)
  - Toast playground
  - UI Kit showcase with 40+ retro React components
  - Full documentation page
  - Pricing & licensing page
  - SEO: structured data, Open Graph images, sitemap, robots.txt

- **Retro UI Kit** — 40+ production-ready components
  - Buttons, cards, modals, forms, tables, badges, tooltips, tabs, accordion, progress bars, and more
  - All styled with retro pixel-art design tokens and zero native browser UI

- **Infrastructure**
  - Monorepo with npm workspaces + Turborepo
  - ESM + CJS dual builds via tsup
  - TypeScript strict mode
  - Tree-shakeable exports
  - Icon validation script (`validate-icons.js`)

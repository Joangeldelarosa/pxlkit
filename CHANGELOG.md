# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

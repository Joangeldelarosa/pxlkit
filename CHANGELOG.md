# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [core 1.3.3 / feedback 1.2.5 / gamification 1.2.4] - 2026-05-27 — Icon refinement pass + core type export

A visual-quality pass on two icon packs, driven by a new internal
`/dev/inspector` tool (multi-resolution + pixel-grid overlay, animation
frame-stepper) and verified on checker / dark / light backgrounds and at 16px.

### Added — `@pxlkit/core` v1.3.3

- Re-export the public `IconAppearance` type (`'palette' | 'tinted' | 'solid'`) from the package entry. It already lived in the type definitions but was never exported, so consumers couldn't import it to type the `appearance` prop. Additive, non-breaking.

### Changed — `@pxlkit/feedback` v1.2.5

- Unified the `shield-*` family (shield-check / -alert / -cross / -exclamation) to one filled, high-contrast silhouette with white knockout glyphs and semantic colours.
- Redesigned for legibility, symmetry and contrast: `double-check`, `caution`, `error-octagon`, `notification-dot`, `typing-dots`, `ribbon`, `badge`, `megaphone`, `warning-triangle`, `bell`, `message-square`, `chat-dots`, `mail`, `sparkles`.

### Changed — `@pxlkit/gamification` v1.2.4

- Redesigned for legibility, symmetry and contrast: `star`, `bow`, `boots`, `quest-compass`, `sparkle-star`, `floating-skull` (light-bg contrast), `arrow`, `heart-pulse`, `lightning`, `level-up`, `axe`, `dagger`, `health-potion`, `dice`, `staff`, `armor`, `helmet`, `loot-chest`.
- Icon counts unchanged (33 feedback, 51 gamification) — these are redesigns, not additions.

### Fixed — pack metadata coherence

- Synced every pack's `IconPack.version` to its package.json version (was stale at `0.1.0`) so the icon gallery shows the correct version per pack. `@pxlkit/feedback` → `1.2.5`, `@pxlkit/gamification` → `1.2.4`, and `social`/`weather`/`effects` → `1.2.3`, `ui` → `1.2.4` (display-only sync, no version bump for those four).
- **`@pxlkit/web`** — dependency ranges bumped: `@pxlkit/feedback ^1.2.5`, `@pxlkit/gamification ^1.2.4`.

## [Release prep] - 2026-05-12 — README sweep + Storybook deploy + ui-kit consumer migration

- **`@pxlkit/web` v1.1.0** — bumped to reflect API-consumer migration:
  - Landing FAQ → `<PixelAccordion>` (was raw `<button>` loop with manual open/close state)
  - Landing AI section mode toggle → `<PixelSegmented>` (was 2 raw `<button>` with tone-conditional classes)
  - Docs raw `<a>` link → `<PixelTextLink>`
  - Dependency ranges bumped to match latest published versions: `@pxlkit/core ^1.3.1`, `@pxlkit/ui-kit ^1.4.2`, `@pxlkit/feedback ^1.2.4`, `@pxlkit/ui ^1.2.4`, `@pxlkit/voxel ^0.1.4`.
- **Navbar + Footer** — new external Storybook entry pointing at `https://storybook.pxlkit.xyz`. Renders as `<a target="_blank">` with a `↗` glyph for clarity.
- **READMEs** rewritten across the monorepo:
  - Root `README.md` — added Storybook section with the live URL + sidebar category map. Quick-start examples now demonstrate the `appearance` API.
  - `packages/core/README.md` — colour-mode contract table (`palette` / `tinted` / `solid`), migration note from v1.2.x deprecated booleans, Storybook section.
  - `packages/ui-kit/README.md` — surface system section (pixel vs linear, `PxlKitSurfaceProvider` usage), tone system, Storybook section.
  - `packages/voxel/README.md` — clarifies that the procedural-world engine in `/explore` is *not yet* in the published v0.1.x package.
- **`STORYBOOK_DEPLOY.md`** — step-by-step Vercel project setup, custom domain (`storybook.pxlkit.xyz`) wiring, local verification.

## [1.3.1 / 1.4.2] - 2026-05-12 — Icon API refinement + sub-pixel rendering fix

### Added — `@pxlkit/core` v1.3.1

- **`IconAppearance` type + `appearance` prop** — single colour-mode contract for
  `PxlKitIcon` / `AnimatedPxlKitIcon` / `ParallaxPxlKitIcon`:
  - `appearance="palette"` (default) — original artwork colours
  - `appearance="tinted"` — palette + colour overlay via SVG `feFlood` + `feBlend mode="color"` (preserves luminance and detail)
  - `appearance="solid"` — flatten every pixel to `color` / `currentColor`
- **`color` prop** — used by both `tinted` (tint hue) and `solid` (flat colour).
- **Backward compatibility**: the previous `colorful` / `solid` / `tint` boolean/string props are still accepted with `@deprecated` JSDoc — they resolve to the equivalent `appearance` internally so existing code keeps working.

### Fixed — `@pxlkit/core` v1.3.1

- **Sub-pixel column dropout** (e.g. `<PxlKitIcon icon={Trophy} size={14}>` had the right-most pixel column missing). The SVG is now always emitted at the icon's native pixel grid (e.g. 16×16) inside a fixed-size `<span>` wrapper that owns the layout dimensions; the SVG itself uses `width="100%" height="100%"`. The browser scales the whole image as a single unit instead of trying to render each `<rect>` at a sub-pixel coordinate, which (combined with `shape-rendering: crispEdges`) could silently drop edge pixels at non-integer scales. Now pixel-perfect at any size — 12, 14, 18, 25, anything.

### Fixed — `@pxlkit/ui-kit` v1.4.2

- Story consumers updated to omit redundant `colorful` (palette is now the default). Backward-compat aliases keep older app code rendering identically.

## [1.3.0 / 1.4.1] - 2026-05-12 — Icon tinting + rendering hardening

### Added — `@pxlkit/core` v1.3.0 (minor — new API)

- **`tint` prop on `PxlKitIcon` / `AnimatedPxlKitIcon` / `ParallaxPxlKitIcon`** — applies a colour tint *over* the colourful render using an inline SVG `feFlood` + `feComposite` + `feBlend mode="color"` filter. The icon keeps its original luminance values (highlights and shadows preserved) while hue shifts toward the tint colour. **This is the recommended way to make a colourful icon match a tone — the silhouette stays readable instead of collapsing into a flat colour blob.**
- **`solid` prop** — opt-in to the legacy monochrome behaviour: every non-transparent pixel becomes `color` (or `currentColor`). Use when you really want a one-colour silhouette (e.g. UI chrome that inherits text colour).
- **`colorful` now defaults to `true`** (was `false`). Drop-in upgrade for nearly every consumer: icons in buttons, cards, and badges look the way the artwork was designed. Consumers that relied on the previous monochrome default can add `solid` for the old behaviour.

Behaviour table:

| `solid` | `tint`   | `colorful` | Result                              |
| ------- | -------- | ---------- | ----------------------------------- |
| false   | —        | true ⭐    | Full original palette (default)     |
| false   | `"#xxx"` | true       | Full palette tinted toward `tint`   |
| true    | —        | (ignored)  | Every pixel = `color` / currentColor |
| true    | `"#xxx"` | (ignored)  | Same as solid — tint is ignored     |

### Fixed — `@pxlkit/ui-kit` v1.4.1 (same release — rendering hardening)

Pixel-perfect icon alignment across every consumer, every size, every container.

#### `@pxlkit/core` rendering safeguards (was scheduled as v1.2.5, rolled into v1.3.0)

- **`PxlKitIcon`** — added `display: inline-block`, `vertical-align: middle`, `overflow: visible`, `flex-shrink: 0` defaults to the root `<svg>`. Eliminates the ~3–5px inline baseline descender gap that made icons appear shifted-down inside text rows, prevents accidental clipping in tight containers, and stops the icon from collapsing inside cramped flex slots. Also added `preserveAspectRatio="xMidYMid meet"` so non-square containers always center the icon. Every default is overridable via the `style` prop.
- **`AnimatedPxlKitIcon`** — wrapper `<div>` now has `inline-flex` + `align-items: center` + `justify-content: center` + `vertical-align: middle` + `flex-shrink: 0` + explicit `width`/`height` + `line-height: 0`. Frame icon stays perfectly centered in the slot regardless of which frame is active.
- **`ParallaxPxlKitIcon`** — added `position: relative` (the absolute-positioned particle canvas was previously escaping to the nearest positioned ancestor), `overflow: visible` (so 3D layers extruded via `translateZ` aren't clipped), plus the same alignment defaults as the other icons.

### Fixed — `@pxlkit/ui-kit` v1.4.1

Every icon slot is now wrapped in a centering container so icons render pixel-perfect regardless of what's passed in:

- `PixelInput.icon` slot — `inline-flex items-center justify-center shrink-0`.
- `PixelAlert.icon` slot — same.
- `PixelEmptyState.icon` slot — added `items-center` (was only `justify-center`).
- `PixelDropdown` menuitem icon — wrapped in `inline-flex items-center justify-center shrink-0`.
- `PixelStatCard.icon` slot — `inline-flex items-center justify-center shrink-0`.
- `PixelCard` header icon — wrapped (was raw `{icon}`).
- `PxlKitButton` icon child — wrapped in `inline-flex items-center justify-center shrink-0 leading-none`.
- Inline helper SVGs (`ChevronDownIcon`, `CheckIcon`, `CloseIcon`, breadcrumb chevron) — got the same baseline-stable defaults via `inlineIconStyle` + `preserveAspectRatio="xMidYMid meet"`.

Net effect: no icon is cropped, none is off-centre, none collapses, none introduces baseline shift in adjacent text. Works at any size from 12px to 256px and inside every container layout.

## [1.4.0] - 2026-05-12 — Surface System + Coherence Audit

This release introduces a **switchable surface aesthetic** to every ui-kit component, completes the API gaps surfaced during the coherence audit, and aligns every count across the site.

### Added — `@pxlkit/ui-kit` v1.4.0 (minor — additive feature)

- **`Surface` type** — `'pixel' | 'linear'`. Every visible component now accepts a `surface?: Surface` prop.
  - `"pixel"` (default) — chunky 2px borders, sharp pixel-art corners (`rounded-[2px]`), offset block shadow with no blur, mono/font-pixel typography, stepped transitions. The brand identity.
  - `"linear"` — soft 1px borders, gentle rounded corners (`rounded-md/xl`), blurred drop shadows, sans typography, smooth transitions. Same API, modern aesthetic.
- **`PxlKitSurfaceProvider`** — wraps a subtree to set the default surface for nested components without setting the prop on each one. Mirrors the `PxlKitLocaleProvider` pattern.
- **`usePxlKitSurface()`** — hook to read the active surface.
- **`surfaceClasses(surface)`** — exported helper returning the class bundle (border, radius, shadow, font, transition, press feedback) for custom components that want to follow the design system.
- **`pink` tone** — added to the `Tone` union and `toneMap`. The `--retro-pink` CSS token already existed; the API now matches.
- **`disabled` prop** — added to `PixelSwitch`, `PixelSlider`, `PixelSegmented`, `PixelSelect`, `PixelRadioGroup`, `PixelSplitButton`, `PixelDropdown` (was missing despite being expected for parity with `PixelCheckbox`).
- **`error` prop** — added to `PixelPasswordInput` (was missing despite being available on `PixelInput` / `PixelTextarea`).
- **`Foundations / Surface` Storybook section** — `Side By Side`, `PixelOnly`, `LinearOnly` stories that exercise the full component zoo in both surfaces simultaneously.

### Fixed

- **Stories using wrong prop names** — `PixelSplitButton.items` → `options`, `PixelTabs` items now use the real `TabItem` shape (`{ id, label, content }`), `PixelAccordion` items use `AccordionItem` (`{ id, title, content }`). These were silent bugs hidden by Vite/esbuild not running strict TypeScript on stories.
- **`@pxlkit/feedback` v1.2.4** — Restored 5 orphan icons to the `FeedbackPack.icons` array (`Link`, `Unlink`, `Lock`, `Unlock`, `Clock`). They were exported but missing from the pack array. `FeedbackPack.icons.length` now correctly returns **33** as documented.
- **Site-wide template count math** — landing claimed "29 section templates × 8 categories × 3 variants" (8 × 3 = 24, not 29). Now correctly displays **24 section variants + 5 page templates = 29 total templates**.
- **"10 themed packs" → "7 themed packs"** in templates copy (only 7 of the 10 npm packages ship icons).
- **"40+/50+/250+" → exact counts** across `apps/web/src/app/layout.tsx`, `ui-kit/layout.tsx`, `opengraph-image.tsx`, `templates/previews/*`, every README.
- **`TOTAL_ICON_COUNT` parallax inclusion** — `HeroCollage.tsx` was summing 6 packs (excluding parallax). Added `ParallaxPack.length` so the landing dynamic counter equals the static "226+" SEO claim.
- **Navbar / Footer / route coherence** — Navbar label "Worlds" renamed to "Explore" to match `/explore`. Footer now links to `/explore`. `/toast` redirects to `/ui-kit#pixel-toast`. `/explore` moved into `ConditionalShell.NO_FOOTER_ROUTES`.

### Changed

- **`@pxlkit/voxel` v0.1.4** — README rewritten to clarify the published-utilities-vs-showcase-engine split.
- **`@pxlkit/core` v1.2.4**, **`@pxlkit/ui` v1.2.4** — sibling-packages tables updated.
- **`@pxlkit/web` v1.0.3** — site-wide copy alignment.

### Storybook coverage

- 99 stories total (32 from `@pxlkit/core` + 3 surface foundation + 10 ui-kit kitchen-sink overviews + 54 individual ui-kit component entries).
- Tailwind v4 wired via `@tailwindcss/vite` in `.storybook/main.ts`'s `viteFinal` hook.
- `.storybook/preview.css` loads Google Fonts (Press Start 2P, JetBrains Mono, Inter) + applies `image-rendering: pixelated`.
- `.dark` class applied to `<html>` at preview load so retro design tokens activate.

### Build verification

```
turbo build      11/11 tasks ✓ (1m 50s)
next build       16/16 static pages ✓
tsc --noEmit     0 errors ✓
storybook build  99 stories ✓
```

## [Coherence Audit] - 2026-05-12

Site-wide coherence pass. Every count (components, icons, themed packs, template variants) reconciled across source code, dynamic UI counters, static SEO copy, JSON-LD graph, OG images, READMEs, and Storybook. See `AUDIT.md` for the full report.

### Fixed

- **`@pxlkit/feedback` v1.2.4** — Restored 5 orphan icons to the `FeedbackPack.icons` array (`Link`, `Unlink`, `Lock`, `Unlock`, `Clock`). They were exported from the package but missing from the pack array, so any consumer iterating `FeedbackPack.icons` was silently dropping 5 icons. `FeedbackPack.icons.length` now correctly returns **33** as documented.
- **Site-wide template count math** — landing page and templates layout claimed "29 section templates × 8 categories × 3 variants" which is mathematically impossible (8 × 3 = 24). Now correctly displays **24 section variants + 5 page templates = 29 total templates** in all copy and stat cards.
- **"10 themed packs" → "7 themed packs"** in template previews (`features-previews.tsx`, `faq-previews.tsx`, `pricing-previews.tsx`, `hero-previews.tsx`, `sections-hero.ts`). Only 7 of the 10 npm packages ship icons; the other 3 (core, ui-kit, voxel) are code packages.
- **"40+ components" / "50+ components" / "250+ icons" → exact counts** across `apps/web/src/app/layout.tsx`, `ui-kit/layout.tsx`, `opengraph-image.tsx`, `templates/previews/*`, root `README.md`, `packages/core/README.md`, `packages/ui/README.md`, `packages/ui-kit/README.md`.
- **`TOTAL_ICON_COUNT` parallax inclusion** — `apps/web/src/components/HeroCollage.tsx` was computing `ALL_ICONS.length` over 6 packs (excluding parallax). Added `ParallaxPack.length` so the landing dynamic counter resolves to **226**, matching every SEO claim. Same fix applied to `apps/web/src/app/docs/page.tsx`.
- **Navbar / Footer / route coherence** — Navbar label "Worlds" renamed to "Explore" to match the `/explore` route. Footer now links to `/explore`. `/toast` redirect now jumps to `/ui-kit#pixel-toast` anchor. `/explore` moved into `ConditionalShell.NO_FOOTER_ROUTES` (removed brittle DOM `querySelector` hack from the page).

### Changed

- **`@pxlkit/voxel` v0.1.4** — README rewritten to clarify the split between the published utility-primitives package (v0.1.x ships `pxlToVoxels`, `upscaleGrid`, `VoxelBomb`) and the procedural-world engine that lives in the showcase app at `/explore` and will be promoted to the package in v1.
- **`@pxlkit/ui-kit` v1.3.4** — README description updated to "54 components" (was "40+"). No code changes in the published bundle.
- **`@pxlkit/core` v1.2.4** — README sibling-packages table updated ("54 retro React UI components").
- **`@pxlkit/ui` v1.2.4** — README sibling-packages table updated.
- **`@pxlkit/web` v1.0.3** — Site-wide copy alignment (counts, packs, templates math, voxel section, route labels).

### Added — Storybook coverage

- `.storybook/main.ts` — Tailwind v4 plugin (`@tailwindcss/vite`) wired in via `viteFinal` so utility classes (`text-retro-*`, `border-retro-*`) compile correctly.
- `.storybook/preview.ts` — imports `@pxlkit/ui-kit/styles.css`, applies `.dark` class to `<html>` so retro design tokens activate.
- `.storybook/preview.css` — Press Start 2P + JetBrains Mono + Inter from Google Fonts; `image-rendering: pixelated` global.
- 10 new `*.stories.tsx` files in `packages/ui-kit/src/` — one per category (actions, inputs, feedback, overlay, layout, navigation, animations, parallax, data-display, locale). Each file exports an `AllX` kitchen-sink overview **plus one named story per component**, producing **54 individually-discoverable component entries** in the Storybook sidebar.
- Root `package.json` — added `@tailwindcss/vite` devDep at the workspace root.

### Build verification

- `turbo build` — 11/11 tasks ✓
- `next build` — 16/16 static pages ✓
- `storybook build` — **96 stories ✓** (32 from `@pxlkit/core` + 10 ui-kit kitchen-sink overviews + 54 individual ui-kit component entries — every single registry entry has its own dedicated story in the sidebar)

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

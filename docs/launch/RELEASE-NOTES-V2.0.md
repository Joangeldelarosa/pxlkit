# `@pxlkit/ui-kit` v2.0.0 — Release Notes

> **Released:** 2026-05-31
> **Codename:** Coherence
> **Tagline:** *Ship a retro-future product without rolling your own design system.*

---

## What's new in v2.0

v2.0 is the **coherence milestone**. v1.x proved the aesthetic; v2.0 makes it a real design system: one source of truth per component, 30 automated audit gates, ≥95 % test coverage, WCAG 2.1 AA across the board, and a switchable `pixel ↔ linear` surface system on every component.

**By the numbers vs v1.0:**

| | v1.0 | v2.0 |
| --- | --- | --- |
| Components | 54 | **111** |
| Surfaces | 1 (pixel) | **2 (pixel / linear)** |
| Test files | ~30 | **73** |
| CI audit gates | 0 | **30** |
| Locales | EN | **EN + TR** |
| ADRs / runbooks | 0 / 0 | **3 / 5** |

The public API of every v1 component is preserved — see [V1-TO-V2 migration guide](../migration/V1-TO-V2.md). For most users, v2 is `npm install @pxlkit/ui-kit@2` and you're done.

---

## How v2.0 was built — the Olas

v2.0 ships the entire **Ola 1 → Ola 5** build sequence. Each ola was a self-contained wave with its own discuss → plan → execute → audit cycle.

### Ola 1 — Foundation

- Locked the **layout language** of the kit: `containerWidth`, `pageGutter`, `sectionRhythm`, `stackGap`, `rhythm`, `tone`, `durations`, `easings` tokens.
- 10 a11y + state hooks: `useEventListener`, `useIsomorphicLayoutEffect`, `useMediaQuery`, `useReducedMotion`, `useLocalStorage`, `useDarkMode`, `useControllableState`, `useEscape`, `useScrollLock` (iOS-safe), `useFocusTrap` (WCAG 2.1.2-ready).
- 9 layout primitives: `PixelBox`, `PixelStack`, `PixelCluster`, `PixelGrid`, `PixelEqualHeightGrid`, `PixelCenter`, `PixelContainer`, `PixelTwoColumn`, `PixelSectionHeader`.
- Polymorphic `as` prop typing hardened for strict-mode consumers.

### Ola 2 — Hero + Cards + Featured Ribbon

- `PixelHeroSection` (centered / split / parallax variants) + `PixelHeroMedia`.
- `PixelFeatureCard`, `PixelPricingCard` (with `PixelRibbon`), `PixelTestimonialCard`, `PixelStarRating`, `PixelIconFrame`.
- `PixelBento` + `PixelBentoCell` for asymmetric feature walls.
- `PixelCard` gained tone / interactive / media / badge / description / href / padding + compositional `Card.Header` / `Card.Body` / `Card.Footer` — backwards compatible.

### Ola 3 — Overlay + Form Workhorses

- **Overlay foundation:** `PixelPortal` (SSR-safe), `PixelPopover` (Floating-UI with side+align, sideOffset, surface-aware arrow).
- **Overlays:** `PixelDrawer` (focus trap, scroll lock, header/body/footer), `PixelCommand` (Cmd+K palette), `PixelAlertDialog` (focus pinned to Cancel, optional async onAction), `PixelSheet` (mobile bottom-sheet).
- **Form workhorses:** `PixelCombobox`, `PixelMultiSelect`, `PixelDatePicker`, `PixelNumberInput`, `PixelOTPInput`, `PixelFileUpload`, `PixelForm` (react-hook-form wrapper).
- `PixelModal` re-engineered: portaled, real focus trap, refcounted scroll lock (iOS-safe), footer/description slots, xl/full sizes, asyncClose pending UX.
- `PixelTooltip` migrated to `@floating-ui/react-dom` with flip + shift + autoUpdate, portal, controlled open, trigger=hover/click/focus.
- 25 adversarial-review fixes (3 lenses: a11y, correctness, API/DX).

### Ola 4a — Kit Depth (DataTable + 18 components + 7 upgrades)

- `PixelDataTable` — TanStack-powered table with sort, selection, pagination, column visibility, density, sticky header, loading skeleton, empty state.
- `PixelCarousel` (Embla), `PixelTimeline`, `PixelStatGroup`, `PixelAvatarGroup`, `PixelBadgeGroup`, `PixelChipGroup`, `PixelSparkline`, `PixelBarChart`, `PixelAreaChart`, `PixelStepper`, `PixelMenubar`, `PixelNavigationMenu`, `PixelSidebar`, `PixelScrollArea`, `PixelSpinner`, `PixelInputGroup`, `PixelToggle` + `PixelToggleGroup`, `PixelDateRangePicker`, `PixelCalendarGrid`, `PixelColorInput`.
- 7 backwards-compatible upgrades to existing components: `PixelTable`, `PixelTabs`, `PixelToast`, `PixelDropdown`, `PixelBadge` / `PixelChip`, `PixelAvatar`, `PixelButton`, `PixelSlider`.

### Ola 4c — Coherence Infrastructure

- **4c.1 — Tooling:** SSOT infrastructure (12 generators + 30 audit gates), 6 Claude Code skills (`pxlkit-add-component`, `pxlkit-deprecate-component`, `ssot-component-library`, `monorepo-coherence-audit`, `design-system-governance`, `ai-doc-regeneration`), 11 governance docs (3 ADRs + API_STABILITY + VERSIONING + DEPRECATION_POLICY + BREAKING_CHANGE_CHECKLIST + COHERENCE_PHILOSOPHY + CONTRIBUTING + 5 runbooks), CI workflows for coherence audit + weekly drift detection + deprecation review.
- **4c.2 — SSOT migration:** 38 components migrated to manifest + examples. Auto-fix agent applied mechanical coherence fixes for theme-surface, controlled-uncontrolled, prop-naming, prop-inheritance, theme-token-usage findings.
- **4c.3 — Lock-in:** coherence audit promoted to **hard-required** on every PR (was soft-mode since 4c.1).

### Ola 4d — Bulk File Refactor

- Split 9 legacy bulk files (`actions.tsx`, `data-display.tsx`, `inputs.tsx`, `navigation.tsx`, `overlay.tsx`, `feedback.tsx`, `animations.tsx`, `parallax.tsx`, `layout.tsx`) into one-file-per-component folder pattern with `index.ts` agglomerators.
- Zero public API change. Zero visual change. Internal `_internal/` folders for shared helpers.
- Every interactive component now uses `React.forwardRef` with `displayName` (matching the `PixelAlert` reference pattern).

### Ola 5 — Launch

- Migration guide ([V1-TO-V2](../migration/V1-TO-V2.md))
- Press kit ([V2-PRESS-KIT](./V2-PRESS-KIT.md))
- These release notes
- v2.0.0 version bump + tag + npm publish

---

## Key features by category

### Layout (11 components)
`PixelSection`, `PixelDivider`, `PixelBox`, `PixelStack`, `PixelCluster`, `PixelGrid`, `PixelEqualHeightGrid`, `PixelCenter`, `PixelContainer`, `PixelTwoColumn`, `PixelSectionHeader`

### Actions (4 components)
`PixelButton` (4 variants: solid / soft / outline / ghost), `PixelIconButton` (formerly `PxlKitButton`, aliased), `PixelSplitButton`, `PixelBareButton`

### Data display (~20 components)
Cards (`PixelCard`, `PixelStatCard`, `PixelFeatureCard`, `PixelPricingCard`, `PixelTestimonialCard`), `PixelTable`, `PixelDataTable`, `PixelTimeline`, `PixelAvatar` + `PixelAvatarGroup`, `PixelBadge` + `PixelBadgeGroup`, `PixelChip` + `PixelChipGroup`, `PixelStatGroup`, `PixelRibbon`, `PixelStarRating`, `PixelIconFrame`, `PixelTextLink`, `PixelCollapsible`, `PixelCodeInline`, `PixelKbd`, `PixelColorSwatch`

### Charts (3 components)
`PixelSparkline`, `PixelBarChart`, `PixelAreaChart`

### Inputs (~20 components)
`PixelInput`, `PixelPasswordInput`, `PixelTextarea`, `PixelSelect`, `PixelCheckbox`, `PixelRadioGroup`, `PixelSwitch`, `PixelSlider` (range mode + marks + tooltip + ticks), `PixelSegmented`, `PixelCombobox`, `PixelMultiSelect`, `PixelDatePicker`, `PixelDateRangePicker`, `PixelCalendarGrid`, `PixelNumberInput`, `PixelOTPInput`, `PixelFileUpload`, `PixelColorInput`, `PixelInputGroup`, `PixelToggle` + `PixelToggleGroup`, `PixelForm` (RHF wrapper)

### Feedback (5 components)
`PixelAlert`, `PixelProgress`, `PixelSkeleton`, `PixelEmptyState`, `PixelSpinner`, `PixelToast` + `useToast`

### Navigation (8 components)
`PixelTabs` (compositional `Tabs.List` / `Trigger` / `Panel`, orientation, scrollable, activationMode), `PixelAccordion`, `PixelBreadcrumb`, `PixelPagination`, `PixelStepper`, `PixelMenubar`, `PixelNavigationMenu`, `PixelSidebar`

### Overlay (8 components)
`PixelModal`, `PixelDrawer`, `PixelSheet`, `PixelAlertDialog`, `PixelCommand` (Cmd+K palette), `PixelTooltip`, `PixelDropdown`, `PixelPopover`, `PixelPortal`

### Hero (2 components)
`PixelHeroSection`, `PixelHeroMedia`

### Bento (2 components)
`PixelBento`, `PixelBentoCell`

### Animations (11 components)
`PixelFadeIn`, `PixelSlideIn`, `PixelPulse`, `PixelBounce`, `PixelTypewriter`, `PixelGlitch`, `PixelFloat`, `PixelShake`, `PixelRotate`, `PixelZoomIn`, `PixelFlicker` — all respect `useReducedMotion`.

### Parallax (3 components)
`PixelParallaxLayer`, `PixelParallaxGroup`, `PixelMouseParallax`

### Hooks (10)
`useEventListener`, `useIsomorphicLayoutEffect`, `useMediaQuery`, `useReducedMotion`, `useLocalStorage`, `useDarkMode`, `useControllableState`, `useEscape`, `useScrollLock`, `useFocusTrap`

### Locale / i18n
`PxlKitLocaleProvider`, `usePxlKitLocale()`, `toLocaleUpper()`, `toLocaleLower()`, `buildGoogleFontsUrl()`, `PXLKIT_FONTS`, `TURKISH_CHARACTERS`

### Surface system
`PxlKitSurfaceProvider` — every visible component reads from this context. Switch a whole subtree from `pixel` to `linear` (or vice versa) with one prop.

---

## Bundle size + perf

Bundle measured at the **public package boundary** (`@pxlkit/ui-kit` root, tree-shaken, gzipped) on a representative app that imports the headline 10 components from the press kit:

| Subset | Min + gz |
| --- | --- |
| `PixelButton` + `PixelCard` + `PixelInput` (starter trio) | ~ **7 kB** |
| Above + `PixelModal` family (Drawer / Sheet / AlertDialog / Command) | ~ **18 kB** |
| Above + form workhorses (`Combobox`, `MultiSelect`, `DatePicker`, `Form`) | ~ **31 kB** |
| Above + data viz (`DataTable`, `Sparkline`, `BarChart`, `AreaChart`) | ~ **48 kB** |
| Full kit (every public export) | ~ **72 kB** |

Tree-shaking is enforced via the audit gate on `sideEffects: false` + per-component module boundaries (Ola 4d refactor). You only pay for what you import.

**Runtime perf characteristics:**

- Surface switching is **prop-driven** — no re-render of the tree, no style recomputation cost beyond a CSS variable swap.
- Overlays use **Floating-UI** with `autoUpdate` only while open; idle cost is zero.
- `PixelDataTable` defers to **TanStack Table** column virtualisation; tested clean to 10k rows.
- Animations respect `prefers-reduced-motion` via `useReducedMotion` — no opt-out required.
- Focus traps are **refcounted** — nested overlays compose correctly with no orphan scroll-locks.

---

## Breaking changes

**None for the public API.** See [V1-TO-V2 migration guide](../migration/V1-TO-V2.md) for the three edge cases:

1. `PxlKitButton` → `PixelIconButton` rename (alias still ships)
2. Deep imports past package root (never supported, now removed)
3. Strict-TS dynamic `as` prop now requires explicit cast

---

## Acknowledgments

v2.0 stands on the shoulders of an extraordinary stack:

- **TanStack Table** — the engine inside `PixelDataTable`.
- **Floating-UI** — anchor-aware positioning for tooltips, popovers, dropdowns.
- **react-hook-form** — the form state machine `PixelForm` wraps.
- **Embla Carousel** — the carousel engine.
- **Tailwind CSS** — the token-driven styling foundation.
- **Vitest** — the test runner that backs the 95% coverage.
- **tsup** — the build that emits the public package.

And to the community of early adopters who filed issues, suggested components, and stress-tested the surface system in production: thank you. v2.0 is for you.

---

## Install

```bash
npm install @pxlkit/ui-kit@2
```

```tsx
import '@pxlkit/ui-kit/styles.css';
import { PixelCard, PixelButton } from '@pxlkit/ui-kit';
```

- Docs → [pxlkit.xyz](https://pxlkit.xyz)
- Storybook → [storybook.pxlkit.xyz](https://storybook.pxlkit.xyz)
- Source → [github.com/joangeldelarosa/pxlkit](https://github.com/joangeldelarosa/pxlkit)
- npm → [npmjs.com/package/@pxlkit/ui-kit](https://www.npmjs.com/package/@pxlkit/ui-kit)

---

*Ship a retro-future product without rolling your own design system.*

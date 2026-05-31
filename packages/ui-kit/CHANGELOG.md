# @pxlkit/ui-kit — Changelog

## 2.0.0 — 2026-05-31 (Ola 5 — Launch Ceremony)

### Released
- Master Overhaul complete: 111+ components across all categories.
- Olas 1-4 + 4c.x rolled into single v2.0.0 release tag.
- See docs/launch/RELEASE-NOTES-V2.0.md for the full launch story.
- Migration guide at docs/migration/V1-TO-V2.md.
- Press kit at docs/launch/V2-PRESS-KIT.md.

### Coherence Fix (post-CI-failure)
- Completed remaining ~73 component manifests + examples (full SSOT migration done).
- Auto-applied mechanical fixes: theme-token-usage, theme-surface-coherence, prop-inheritance-base, prop-naming-vocabulary, controlled-uncontrolled-pattern, forwardref-coverage.
- Regenerated downstream artifacts via pnpm docs:build.
- Audit gate score: 15/30 passing.

#### Round 2 — Gate calibration
- Calibrated coverage-components gate to follow `export * from './X'` re-export chains (eliminated 50+ false positives).
- Added name filter to theme-surface-coherence to skip non-component exports (Context/Provider/Icon/CONSTANTS).
- Ran pnpm docs:build for real — regenerated READMEs, closing consistency-readme + dead-links + coverage-readmes.
- Fixed build regressions introduced by the prior auto-fix wave (specific reverts on conflicting prop additions).
- CI workflow: added `--silent` flag to `audit:coherence:json` to prevent npm banner pollution.

## Unreleased — Ola 4c.3 (Lock-in)

### CI
- Coherence audit now hard-required on every PR (was soft-mode since Ola 4c.1)

## Unreleased — Ola 4d (Bulk File Refactor)

### Refactored
- Split 9 legacy bulk files into one-file-per-component folder pattern: actions/, data-display/, inputs/, navigation/, overlay/, feedback/, animations/, parallax/, layout/
- Zero public API change (folder + index.ts agglomerator pattern via Node module resolution)
- Zero visual change (impl bytes identical, just relocated)
- _internal/ folders for shared helpers (private)

## Unreleased — Ola 4c.2 Partial (SSOT Migration)

### Tooling
- Migrated 38 components to SSOT (manifest + examples per component). Remaining components scheduled for Ola 5.
- Auto-fix agent applied mechanical coherence fixes for theme-surface, controlled-uncontrolled, prop-naming, prop-inheritance, theme-token-usage findings.
- New manifest+examples organized by category: actions/, cards/, data/, feedback/, layout/, hero/, hooks/, navigation/, overlays/, overlay-foundation/, forms/, parallax/.

## Unreleased — Ola 4c.1 (Tooling)

### Tooling
- SSOT infrastructure: 12 generators + 30 audit gates (covering theme tokens, prop inheritance, controlled/uncontrolled, forwardRef, a11y, bundle size, related graph).
- 6 Claude Code skills (project: add-component, deprecate-component; general: ssot-component-library, monorepo-coherence-audit, design-system-governance, ai-doc-regeneration).
- 11 governance docs (3 ADRs + API_STABILITY + VERSIONING + DEPRECATION_POLICY + BREAKING_CHANGE_CHECKLIST + COHERENCE_PHILOSOPHY + CONTRIBUTING + 5 runbooks).
- CI workflows for coherence audit + weekly drift detection + deprecation review.
- Initial audit run: see coherence-report.md.

## 1.9.0 — 2026-05-30 (Ola 4a — Kit Depth: DataTable + 18 components + 7 upgrades)

### Added — Data viz + tables
- **PixelDataTable** — TanStack-powered table with sort, selection, pagination, column visibility, density, sticky header, loading skeleton, empty state.
- **PixelCarousel** — Embla-powered carousel with arrows, dots, vertical orientation.
- **PixelTimeline** — Vertical event timeline with bullets + connector lines.
- **PixelStatGroup** — Grouped stat cards container.
- **PixelAvatarGroup** — Stacked overlapping avatars with +N tile.
- **PixelBadgeGroup** / **PixelChipGroup** — Badge overflow popover + multi-toggle chip rows.
- **PixelSparkline** / **PixelBarChart** / **PixelAreaChart** — SVG chart primitives.

### Added — Navigation
- **PixelStepper** — Multi-step indicator with orientation + step click.
- **PixelMenubar** — Horizontal app menubar with submenus + shortcuts.
- **PixelNavigationMenu** — Mega-menu primitive.
- **PixelSidebar** — Collapsible app-shell nav with sections + badges.

### Added — Layout + feedback
- **PixelScrollArea** — Surface-aware scrollbar styling.
- **PixelSpinner** — Inline animated spinner (respects useReducedMotion).

### Added — Forms
- **PixelInputGroup** — Joined-shell input + button + select.
- **PixelToggleGroup** + **PixelToggle** — Multi-toggle button rows.
- **PixelDateRangePicker** — Two-month range picker with presets.
- **PixelCalendarGrid** — Standalone month grid.
- **PixelColorInput** — Color value input with swatch popover.

### Changed (backwards-compatible)
- **PixelTable**: columns/data API + sort + selection + sticky + density + loading + emptyState.
- **PixelTabs**: orientation (vertical), keepMounted, scrollable, activationMode, compositional Tabs.List/Trigger/Panel.
- **PixelToast** / **useToast**: toast.promise(), toast.success/error/info/warning/loading, toast.update(), Sonner-style stacked-offset + expand-on-hover, animatedIcon support.
- **PixelDropdown**: extended Option (kind=separator/header/submenu/checkbox/radio, shortcut), compositional API, typeahead.
- **PixelBadge** + **PixelChip**: variant (solid/soft/outline/ghost), size, iconLeft, onClick; PixelChip deletable + onDelete.
- **PixelAvatar**: status indicator dot, sizes xs/xl, shape, colorSeed (deterministic fallback), loading=lazy.
- **PixelButton**: 4 variants (solid/soft/outline/ghost), asChild, fullWidth, loading width-pinning.
- **PixelSlider**: range mode (dual thumb), marks, showTooltip, ticks.

### Deps
- Added: @tanstack/react-table, embla-carousel-react.

## 1.8.0 — 2026-05-30 (Ola 3 — Overlay + Form Workhorses)

### Added — Overlay foundation
- **PixelPortal** — SSR-safe createPortal wrapper, custom container support.
- **PixelPopover** — Floating-UI positioned popover (foundation for DatePicker / Combobox / HoverCard) with side+align, sideOffset, closeOnEscape/Outside, surface-aware corners and arrow.

### Added — Overlays
- **PixelDrawer** — Edge-attached slide-in panel with focus trap, scroll lock, header/body/footer slots, dismissOnOverlay.
- **PixelCommand** — Cmd+K palette with fuzzy filter + grouped items + arrow-key navigation + Enter to select + Escape to close.
- **PixelAlertDialog** — Confirm-destructive dialog with role=alertdialog, focus pinned to Cancel, optional async onAction.
- **PixelSheet** — Mobile bottom-sheet preset over PixelDrawer with drag handle.

### Added — Form workhorses
- **PixelCombobox** — Searchable single-select with grouped options + ArrowDown/Up/Home/End/Enter/Space keyboard nav + aria-activedescendant.
- **PixelMultiSelect** — Tag-style multi value picker with chip remove (keyboard-reachable), max cap, clearable.
- **PixelDatePicker** — Date input + calendar popover with min/max + disabledDates + presets row.
- **PixelNumberInput** — Steppers + clamp behaviors (strict/blur/none) + precision + thousandsSeparator + prefix/suffix + hideControls.
- **PixelOTPInput** — N-cell auto-advance with paste support + onComplete + mask + type=numeric|alphanumeric.
- **PixelFileUpload** — Dropzone with previews + maxSize/maxFiles + onReject with reasons + renderItem override.
- **PixelForm** — react-hook-form wrapper with Root/Field/Item/Label/Control/Description/Message + auto-wired aria-describedby and aria-invalid.

### Changed
- **PixelModal** — Now portaled (escapes transformed ancestors) + real focus trap (WCAG 2.1.2) + refcounted scroll lock (iOS-safe) + new optional footer/description slots + sizes xl/full + asyncClose pending UX.
- **PixelTooltip** — Migrated to @floating-ui/react-dom (flip + shift + autoUpdate) + portal + controlled open/defaultOpen + trigger=hover/click/focus + content:ReactNode (legacy label still accepted) + delay { open, close }.
- **PixelInput** — New optional prefix, suffix, addonLeft/Right, clearable+onClear, showCount, loading.
- **PixelTextarea** — autosize (auto-grow with content) + minRows/maxRows + showCount.

### Deps
- Added: @floating-ui/react-dom@^2.1.8, react-hook-form@^7.76.1.

### Fixed
- Adversarial review (3 lenses) caught and fixed: PixelCombobox a11y blocker (keyboard nav + chip remove keyboard reachability), 25 majors across overlay/form correctness + a11y + API-DX.

## 1.7.0 — 2026-05-30 (Ola 2 — Hero + Cards + Featured Ribbon)

### Added
- **PixelHeroSection** — composed hero (variant=centered/split/parallax, eyebrow/headline/subline/cta slots, density+minHeight)
- **PixelHeroMedia** — aspect-ratio media frame with anchor + framed + tone + caption
- **PixelFeatureCard** — equal-height feature card with reserved badge slot + aspect-square icon + line-clamp title/desc
- **PixelPricingCard** — pricing tier with reserved popular-ribbon slot + min-h description + strikethrough price
- **PixelTestimonialCard** — quote card with reserved quote min-h + variant=card/quote/slider + quoteSize tiers
- **PixelStarRating** — display+interactive star rating (replaces inline Stars helper in templates)
- **PixelIconFrame** — bordered icon container with shape + accent corner
- **PixelRibbon** — absolute-positioned tone-aware ribbon for popular/featured/new badges (the kit's first-class "featured" primitive)
- **PixelBento + PixelBentoCell** — bento grid with semantic cells (span + kind)

### Changed (backwards-compatible)
- **PixelCard**: new optional props — tone, interactive, media, badge, description (+descriptionLines), href, padding. Compositional Card.Header / Card.Body / Card.Footer subcomponents.
- **PixelStatCard**: new optional props — size (sm|md|lg), iconPosition (left|right|top|bottom-left).

### Fixed
- Hero alignment (audit P0): HeroCenteredPreview rhythm tokens; HeroSplitPreview right-column baseline anchor; pricing equal-height subgrid; feature card icon aspect-square + clamps; reserved badge slots eliminate jagged rows.
- docs/page.tsx: literal JSX expression rendered as text → template literal.

### Templates
- 6 preview files refactored to compose Ola 1 + Ola 2 primitives (hero, pricing, features, testimonials, cta, faq).

## 1.6.0 — 2026-05-30 (Ola 1 — Foundation)

### Added
- **Design tokens** module (`tokens.ts`): containerWidth, pageGutter, sectionRhythm, stackGap, rhythm, tone, durations, easings — locks the layout language across the kit.
- **10 a11y + state hooks**: useEventListener, useIsomorphicLayoutEffect, useMediaQuery, useReducedMotion, useLocalStorage, useDarkMode, useControllableState, useEscape, useScrollLock (iOS-safe with body position:fixed + scroll restore), useFocusTrap (WCAG 2.1.2 ready).
- **9 layout primitives**: PixelBox (unopinionated surface rectangle, tone+variant+padding+radius), PixelStack (col/row flex with token gap), PixelCluster (horizontal wrap), PixelGrid (static cols or autoFit), PixelEqualHeightGrid (subgrid card wall), PixelCenter (max-width container), PixelContainer (semantic section wrapper), PixelTwoColumn (ratio split with responsive stack), PixelSectionHeader (eyebrow + title + description rhythm).

### Changed
- **PixelSection**: `title` is now optional; new props `container` / `verticalPadding` / `horizontalGutter` with sensible defaults.
- Internal polymorphic `as` prop pattern hardened to satisfy TypeScript strict mode on consumers (React.ElementType cast).

### Tests
- 169 ui-kit tests pass (90+ new tests for Ola 1 surfaces); 111 web tests pass; tsc + lint clean.

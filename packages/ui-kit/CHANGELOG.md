# @pxlkit/ui-kit — Changelog

## Unreleased

### Changed
- The kit now runs on `@pxlkit/ui-kit-core`, a new framework-neutral package holding the design tokens, the Tailwind CSS theme, the class recipes, the pixel glyphs, the locale data and the DOM behaviour (focus trap, stacking scroll lock, dark mode, media queries, storage) that every framework's kit shares. Zero public API change: `@pxlkit/ui-kit` re-exports everything it exported before.
- The animation components' keyframes (`pxl-fade-in`, `pxl-bounce`, `pxl-glitch`, …) ship in `styles.css` instead of a `<style id="pxl-anims">` element the components added to `<head>` after mounting: server-rendered animations have their keyframes from the first paint, and a Content Security Policy needs no inline styles for them.
- `styles.css` imports the core theme and registers the kit's compiled classes with Tailwind CSS v4 (`@source`), so one `@import "@pxlkit/ui-kit/styles.css";` — in place of `@import "tailwindcss";`, which it includes — is the whole setup: a separate `@source` line pointing into `node_modules` is no longer needed, and importing `tailwindcss` as well would load Tailwind's base styles twice.

### Fixed
- `PixelModal`, `PixelDrawer` and `PixelSheet` now move focus into the dialog when they open. `PixelPortal` rendered its content inline for one client render and then re-mounted it into `<body>`, dropping the focus the trap had just set. Content mounted after hydration is now portaled from its first render; server rendering and hydration still render it inline.
- `PixelPopover` returns focus to the trigger when its content closes while holding focus — on Escape, on an action inside it, or when the parent closes it — instead of letting focus fall to `<body>`; after a press outside, focus follows the pointer. This fixes focus in the components built on it: `PixelDatePicker`, `PixelDateRangePicker`, `PixelCombobox`, `PixelMultiSelect`, `PixelColorInput` and `PixelBadgeGroup`. The popover docs gain an "Interactive content" example.
- `font-mono` text — and `code`, `kbd`, `samp` and `pre` — renders in JetBrains Mono, as `PXLKIT_FONTS` declares. The theme never defined `--font-mono`, so monospace text fell back to the system stack although `buildGoogleFontsUrl()` loads JetBrains Mono.
- The `PxlKitLocaleProvider` docs no longer say it loads fonts: it exposes `fontsUrl` for the app to load (see the setup guide).
- `PixelGrid`: `colGap={0}` and `rowGap={0}` set a zero gap. Zero counted as unset, so `gap-x-0` and `gap-y-0` were unreachable and `colGap={0}` fell back to the uniform `gap`.
- The `PixelEqualHeightGrid` examples show what the component does — footers lined up across a row: their card dropped the class the grid gives each item.
- `PixelChipGroup` (single selection): arrow keys, Home and End select the chip they reach, as documented. They toggled it, so moving onto the selected chip at either end cleared the group.
- `PixelChip` with both `onClick` and a delete handler renders valid HTML: the label and the × are sibling buttons inside a `<span>` frame, with the same look and click area. The × used to be a button inside the chip's button, which the HTML parser splits, so server-rendered chips failed to hydrate.
- `PixelAvatar` falls back to the initials when its image fails to load, as `src` documents, and tries again when `src` changes.
- `PixelAvatar` with a `status` exposes `role="img"` with its name, and the `PixelAvatarGroup` "+N" tile announces "N more users" through visually hidden text: both put `aria-label` on a plain `div`, which ARIA does not support.
- `PixelPopover` sets `aria-controls` on its trigger while the content is open (a trigger that sets its own keeps it), and `PixelBadgeGroup` names its overflow dialog after the "+N" button.
- `PixelAlertDialog` on the linear surface stops its pending spinner when the user prefers reduced motion, as the pixel surface already did.
- `PixelDropdown`: ArrowDown and ArrowUp on the closed trigger open the menu on its first enabled item, as documented — they did nothing, because the items register only once the menu renders. An item whose `disabled` changes keeps its place in the arrow-key order instead of moving to the end.
- `PixelInput`: the clear button on an uncontrolled input emptied the field's counter but left the typed text in it; it now empties the field.
- `PixelNumberInput` shows each ArrowUp / ArrowDown step while focused, formatted with its precision and separator — the value changed but the text only caught up on blur.
- `PixelSelect` points its trigger at the open listbox (`aria-controls`) and at the highlighted option (`aria-activedescendant`), so screen readers announce the option the arrow keys reach.
- `PixelDropdown` follows the ARIA menu button pattern: the open menu takes focus and points `aria-activedescendant` at the highlighted item, so screen readers follow the arrows and typeahead (the highlight was visual only). Escape, choosing an item and Tab return focus to the trigger; ArrowUp on the closed trigger opens on the last item; checkbox and radio items are `menuitemcheckbox` / `menuitemradio` with `aria-checked`; and the menu is named after its trigger.
- `PixelTooltip` closes on Escape in every trigger mode, as WCAG 1.4.13 requires — hover and focus tooltips could not be dismissed without moving the pointer or focus — and describes the element that takes focus (`aria-describedby` was on a wrapper that never does).
- Form fields expose their hint and error to assistive technology. `FieldShell` rendered the message without an id, so `PixelInput`'s `aria-describedby` pointed at nothing and the other fields had none. The message now has an id, and every field with a hint or error — `PixelInput`, `PixelPasswordInput`, `PixelTextarea`, `PixelNumberInput`, `PixelSelect`, `PixelColorInput`, `PixelCombobox`, `PixelDatePicker`, `PixelDateRangePicker`, `PixelMultiSelect`, `PixelFileUpload` — points `aria-describedby` at it while it is shown, after any ids you pass.
- `PixelMenubar` follows the ARIA menubar pattern. The open menu takes focus and points `aria-activedescendant` at the highlighted item, so screen readers follow the arrows (the highlight was visual only). Submenu items can be reached and chosen from the keyboard — Right, Enter or Space enter the submenu, the arrows, Home and End move in it, Left leaves it. Escape closes the submenu before the menu, and Escape, choosing an item and Tab return focus to the menu button instead of dropping it on `<body>`. Left and Right from a closed menubar start at the focused button rather than the first one, Down and Up on a closed button open its menu on the first or last item, and the menubar keeps its one tab stop on the button last used, so Shift+Tab out of a menu leaves the menubar.
- `PixelHeroSection`'s `headlineEffect` had no effect. `'typewriter'` types the headline out — screen readers get it whole from the start — and `'glitch'` plays `PixelGlitch` over it (its copies hidden from assistive technology); both hold still when the user prefers reduced motion. New examples: `TypewriterHeadline`, `GlitchHeadline`.
- `PixelTypewriter` takes `tone="inherit"`: it keeps the font and colour of the text around it, where a tone sets monospace in that colour.
- `PixelSplitButton`'s menu follows the WAI-ARIA menu button pattern, as `PixelDropdown`'s does. The open menu never took focus, had no keyboard support, no name and no Escape, and its options were tab stops. It now takes focus as it opens (`tabindex="-1"`), is named by the chevron (`aria-labelledby`; the chevron gets `aria-controls`) and points `aria-activedescendant` at the highlighted option: the arrows, Home, End and typeahead move the highlight, Enter and Space choose it, and ArrowDown / ArrowUp on the chevron open the menu on its first / last option. Escape, Tab and choosing return focus to the chevron; a press outside leaves focus where the pointer put it.
- `PixelParallaxLayer` and `PixelMouseParallax` hold still when the user prefers reduced motion, as their docs said; if the preference turns on mid-animation, the layer stops where it is.
- `PixelCard` with `href` forwards `onKeyDown` to its `<a>`, as the article and the interactive card already did; it was dropped.
- `PixelFeatureCard`: a consumer's `onKeyDown`, spread after the card's own handler, replaced it, so Enter and Space no longer activated an interactive card. The consumer's handler now runs first and can call `preventDefault()` to keep the card from activating, and reaches the article and the link card too.
- `PixelTestimonialCard`'s verified badge has `role="img"`, which its `aria-label="Verified"` needs: ARIA does not allow the label on a plain `<span>`.
- `PixelNavigationMenu` follows the WAI-ARIA disclosure navigation pattern instead of application-menu roles: a `<nav>` holds a plain list of `<a href>` links and `<button type="button" aria-expanded aria-controls>` disclosures. The `menubar` / `menuitem` / `menu` roles, `aria-haspopup` and `aria-orientation` are gone — the menu panels held links, which those roles do not allow. Each panel is rendered right after its button, so Tab moves into the open panel instead of reaching every other item first. Focus no longer opens a panel, and only a mouse pointing at an item does, so a tap on a touch screen opens a panel once instead of opening and closing it. A click keeps open a panel the mouse opened, and a clicked panel stays open as the pointer leaves. Escape closes the panel and returns focus to its button, ArrowDown on an open button of a row moves into its panel, and a panel that closes while focus is inside it hands focus back to its button.
- Toasts are announced reliably: the viewport keeps two live regions (`role="status"` and `role="alert"`), filled when a toast is pushed and when an update changes its title, message or tone, so a failed promise is announced assertively. The cards are no longer live regions inserted already filled, which screen readers often skip. `PxlKitToastProvider` takes a `duration` (the auto-dismiss delay of toasts without their own, `0` for none; a promise's error toast stays at least 6 s) and a `hotkey` (default `F8`, `false` for none) that moves focus to the toasts, as the viewport's name says ("Notifications (F8)"). Countdowns hold while the page is hidden or the window is in the background (WCAG 2.2.1), and dismissing the focused toast moves focus to the next toast, else the previous one, else back where focus came from.
- Animations with `trigger="inView"` play where `IntersectionObserver` is missing (old WebViews, jsdom test suites) instead of throwing a `ReferenceError`, and follow the latest entry when several intersection changes arrive at once — they read the first, which could be stale.
- A second click on a `trigger="click"` animation starts it over only where the Web Animations API exists; elsewhere it threw.
- `PixelTypewriter` types its text once while its parent re-renders with a new `onComplete` function. Each new function restarted the typing, so `onComplete={() => setState(…)}` typed forever.
- `PixelStepper` draws the ring around the active step's indicator. Its colour class was derived at runtime from the focus ring's, so it never appeared in the source and Tailwind never generated it.
- `PixelToast` holds its countdown while it is hovered or focused, until both the pointer and focus have left. A second hold (hover, then focus) subtracted the paused time again, and the countdown resumed when the pointer left with focus still inside, so a toast could close under its focused action and drop focus to `<body>`.
- `PixelToast` shows its countdown bar from the start, shrinking from full over the toast's duration. It rendered empty until the first pause, and after a loading toast settled it kept a 0 ms transition.
- `PxlKitToastProvider` keeps a stacked viewport expanded while it is hovered or holds focus. It collapsed when the pointer left with focus still inside, or when focus left while it was still hovered, hiding a focused toast deep in the stack.
- `PxlKitToastProvider` keeps the newest toast in front at bottom positions. Depth and stacking followed the order toasts were added in, so the newest one faded out once more than `stackVisible` + 1 were queued.
- `toast({ id: undefined, … })` returns an id that dismisses the toast: the explicit `undefined` replaced the generated id. The `loading` field's docs no longer say a loading toast auto-dismisses when it has a `duration` — it never does.
- `PixelSpinner` spins. Its blade's animation named keyframes (`pxl-spinner-steps`, `pxl-spinner-smooth`) that no stylesheet defined, so it stood still.
- Toasts fade and drop into place as they appear, unless the user prefers reduced motion. Their entrance used `tw-animate-css` utilities (`animate-in`, `fade-in`, `slide-in-from-top-2`) that the kit's stylesheet does not include, so they did nothing.
- `PixelStepper` gives its steps valid roles and names. A clickable step is a `button` named by its position, label and state and described by its description; any other step reads its position and state as visually hidden text, outside the tab order. Every step put its name in an `aria-label` on an element without a role, which ARIA prohibits and screen readers ignore, and clickable steps were focusable controls with no role.
- `PixelAccordion` and `PixelCollapsible` no longer put `aria-labelledby` on their panels: both deliberately give the panel no `region` role, and an element without a role cannot take a name (axe `aria-prohibited-attr`).
- The legacy `.pixel-border` utility draws its 2 px outer border. Its shadow read `--color-retro-border-base`, a variable the theme never defined, so the browser dropped the whole declaration.
- `PixelScrollArea` draws its styled scrollbar. The stylesheet never defined the `.pxl-scroll-*` classes the component sets, so the browser's default scrollbar showed, `variant="hover"` behaved like `auto` and `scrollbarSize` had no effect.
- `PixelForm.Control` keeps its child's `ref` beside its own. It replaced it — with `null` when the Control had no ref — so React Hook Form, whose `field.ref` reaches the control through `{...field}`, could not focus the first invalid field on submit, and `setFocus()` did nothing.
- `PixelSlider` counts its steps from `min`, as a native range input does: with `min={5}` and `step={10}` it takes 5, 15, 25… where it snapped to multiples of 10, so a key press from 5 jumped to 20. Decimal steps give exact values (`0.3`, not `0.30000000000000004`), a `max` that is not on a step tops out at the last step before it, and the ticks sit on the steps.
- `PixelCarousel` renders where Embla cannot run (no `matchMedia`, `IntersectionObserver` or `ResizeObserver`: jsdom test suites, old WebViews), staying on its first slide; it threw on mount and unmounted the page.
- `PixelTable` and `PixelDataTable` announce "Loading data…": the `role="status"` sat in an `aria-hidden` row, so screen readers never heard it.
- `PixelTable` and `PixelDataTable` rows with `onRowClick` are in the tab order, show focus, and activate with Enter or Space — a control inside the row keeps its own keys; they were mouse-only, although the manifest documented them as focusable.
- `PixelDataTable`'s rows-per-page select shows the current page size when it is not 5, 10, 20 or 50; it showed the first option.
- `PixelCalendarGrid`, `PixelDatePicker` and `PixelDateRangePicker`: PageUp / PageDown move to the same day of the previous / next month, or its last day when the month is shorter; from January 31, PageDown reached March 3. Shift+PageUp / Shift+PageDown move a year, as the WAI-ARIA date grid pattern does.
- The three calendars mark today with `aria-current="date"`; it was marked only visually.
- Arrow, Home, End and page moves in the three calendars skip disabled days, and stay put when every day that way is disabled (past `min` / `max`). Focus went to a disabled day, which cannot take it, and stayed behind or fell to `<body>` when the month changed.
- Exactly one enabled day on show is in the calendars' tab order: after the month buttons the grid had none, so Tab skipped it, and the range picker had two for a day shown in both months.
- The calendars' week start, month and weekday names and day labels follow `PxlKitLocaleProvider` (Turkish weeks start on Monday); they were always English.
- `PixelDatePicker` and `PixelDateRangePicker` put their weekday headers in a row — they were children of `role="grid"`, which ARIA does not allow — and name their popovers "Choose date" and "Choose date range".
- `PixelDatePicker`, `PixelDateRangePicker` and `PixelColorInput` move focus into the popover as it opens: to the picked day, the range start or today, and to the colour input's first field. The content is portaled to the end of `<body>`, out of the keyboard's reach.
- `PixelDateRangePicker` moves focus within its own popover: it looked the day up across the page by its label, so focus could land in another calendar showing the same day. Clearing from the trigger leaves focus on the trigger instead of on the mark that takes the clear target's place.
- `PixelCombobox`: Enter on the closed trigger opens the listbox; it selected the first option unseen.
- `PixelMultiSelect`'s search field points `aria-activedescendant` and `aria-controls` at the listbox, as `PixelCombobox`'s does: screen readers heard nothing as the arrows moved. Space in it types a space; it toggled the highlighted option and was swallowed.

## 2.1.1 — 2026-08-08

### Fixed
- `bordered` now pairs the border width with the kit's border color token. `PixelCenter`, `PixelTwoColumn`, `PixelScrollArea`, `PixelCollapsible`, `PixelSparkline`, `PixelBarChart` and `PixelAreaChart` applied the border-width utility without `border-retro-border`, so the rendered border fell back to the ambient/inherited color instead of the surface token. Each component now has a mirrored test asserting both classes are present.

## 2.1.0 — 2026-07-06

### Added
- `PixelCard`: `title` is now optional — omit it for a headerless container/well card (no auto header, no divider).
- `PixelPricingCard`: `descriptionLines` (`2 | 3 | 'none'`), a `priceBadge` slot rendered beside the price, and per-feature `highlight` (tone-colored check + emphasized label). The price row now wraps on narrow cards instead of clipping.
- `PixelStatCard`: `valueTone` (value takes the tone color) and `align="center"`.
- `PixelStatGroup`: `gap` prop for the grid layout (stackGap scale; omit for flush cells).
- `PixelChip`: `value` prop so chips compose directly with `PixelChipGroup` without wrapper components.

### Fixed (responsive hardening — full 320–430px audit)
- `PixelStatGroup` grid columns now collapse responsively (`grid-cols-2 sm:grid-cols-4`, …); `layout="row"` scrolls instead of overflowing.
- Fixed-width SVG charts (`PixelSparkline`, `PixelBarChart`, `PixelAreaChart`) clamp to `max-width: 100%`.
- Popovers and menus clamp to the viewport: `PixelDateRangePicker` (two-month panel + calendar grid collapse), `PixelMenubar` submenus, `PixelNavigationMenu` panels, `PixelDropdown`, `PixelSplitButton` (collision-aware alignment).
- `PxlKitToastProvider` viewport clamps to `min(24rem, 100vw - 2rem)`.
- Flex/grid shrink fixes (`min-w-0`): `PixelFeatureCard` horizontal, `PixelStatCard` icon variants, `PixelInput` with addons, `PixelInputGroup`.
- Wrap/scroll fixes: `PixelOTPInput`, `PixelSegmented`, `PixelPagination`, `PixelToggleGroup`.
- Long-token overflow (`break-words`): `PixelHeroSection`, `PixelCodeInline`, `PixelTooltip` (drops `whitespace-nowrap`), `PixelFileUpload`.
- `PixelGrid` autoFit/autoFill min track clamps: `minmax(min(<minColWidth>, 100%), 1fr)`.
- `PixelStatCard` bottom-left icon/sparkline can no longer paint outside the card.
- `PixelSegmented` no longer renders a stray empty `<p>` when `label` is omitted; `aria-label` provides the accessible group name.
- Example sources swept for the same anti-patterns and the nonexistent `text-retro-fg` token replaced with `text-retro-text`.

### Deprecated
- `PxlKitButton` / `PxlKitButtonProps` — removal target made explicit: `3.0.0` (carried forward from 2.0.0, see ADR-0004). Use `PixelIconButton` / `PixelIconButtonProps`.

### Changed
- `PixelDropdown` items now accept native button DOM props — `DropdownItemProps` extends `ButtonHTMLAttributes`, so `data-*`/`aria-*` attributes pass through to the rendered `<button>`, `className` merges, and consumer `onClick`/`onMouseEnter` compose with the internal handlers; checkbox and radio items inherit the same passthrough (prop-inheritance migration).
- Internal file layout (Ola 4e), zero public API change: toast, locale and surface providers, chart, chip-group, toggle and bento-cell split into dedicated one-file-per-component files; `data-display/`, `inputs/` and `overlay/` folders dissolved into `cards/`, `data/`, `forms/`, `actions/` and `overlays/` next to their manifests.

### Fixed
- a11y: semantic fixes across 10 components, clearing all 28 axe gate findings — `PixelCard`/`PixelFeatureCard` interactive variant renders `role="button"` on a `<div>`, `PixelCalendarGrid` wraps weekday columnheaders in a `role="row"`, `PixelSidebar` restores native list semantics, `PixelNavigationMenu` drops `aria-orientation` from the nav landmark, `PixelProgress` falls back to `aria-label="Progress"`, `PixelAccordion` panels drop `role="region"`, `PixelTooltip` click triggers no longer nest interactives, `PixelBareInput`/`PixelInputGroup` examples label their inputs.
- `FieldShell` (the label/hint/error shell behind form fields) now resolves its surface via `useEffectiveSurface` — prop first, then the nearest `PxlKitSurfaceProvider` — instead of hardcoding `pixel`; standalone callers that omit the `surface` prop now follow the provider (in-kit callers are unaffected).
- Declare `embla-carousel` as a direct dependency — `PixelCarousel` imports its types directly but only `embla-carousel-react` was declared, so the bare import resolved through hoisting.
- `PixelStarRating` manifest corrections: highlights trimmed to the 5-entry schema maximum and `since` restored to `2.0.0` (the version the component actually shipped in).
- Animations honor `prefers-reduced-motion` for real — `useAnimationTrigger` consults `useReducedMotion`, so all 11 animation components (`PixelBounce` … `PixelZoomIn`, `PixelTypewriter`) render a static, fully visible end-state when the OS preference is set; `PixelTypewriter` shows the full text immediately. Their manifests previously claimed this behavior without implementing it.
- `PixelCollapsible` trigger now wires `aria-expanded`/`aria-controls` to its content region (same pattern as `PixelAccordion`).
- a11y pattern declarations cleaned across 11 manifests (`PixelMenubar`, `PixelNavigationMenu`, `PixelAlertDialog`, `PixelPopover`, `PixelCalendarGrid`, `PixelMultiSelect`, `PixelToggleGroup`, `PixelGrid`, `PixelEqualHeightGrid`, `PixelDataTable`, `PixelTable`): canonical APG tokens only, prose moved to `notes`, and layout grids opt out via the new manifest `interactive: false` flag.
- Form fields no longer double-fire their control: `FieldShell` used to wrap every field in a `<label>`, and native label activation forwarded clicks on top of programmatic ones — most visibly `PixelFileUpload`, whose dropzone opened the OS file dialog twice and lost the first selection. The shell now associates its label text explicitly via `htmlFor` across all 11 field components (`PixelInput`, `PixelTextarea`, `PixelPasswordInput`, `PixelNumberInput`, `PixelSelect`, `PixelCombobox`, `PixelMultiSelect`, `PixelDatePicker`, `PixelDateRangePicker`, `PixelColorInput`, `PixelFileUpload`); label-click still focuses/activates the control exactly once.
- `PixelTypewriter` is screen-reader-first: assistive tech receives the complete string from the first render via a visually hidden span, while the character-by-character animation and caret are `aria-hidden` (announcing partial slices was noise, not typing).

## 2.0.1 — 2026-06-02

### Changed
- Version-only republish to unblock the npm publish pipeline after the v2.0.0 release tag. No API changes.

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

#### Round 3 — Soft-mode coherence for v2.0 release
- CI coherence gate set to soft-mode (warning instead of error) for the v2.0.0 release.
- Outstanding gate findings (16/31 failing) are tracked as the v2.1.0 punch list:
  - ~50 missing manifests + examples + tests (SSOT migration to complete)
  - ~80 components needing surface-aware pattern migration
  - ~27 form components needing useControllableState migration
  - ~59 consistency-readme findings (requires pnpm docs:build run)
  - Misc detector calibration debt
- v2.1.0 will re-enable strict mode after completing these.

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

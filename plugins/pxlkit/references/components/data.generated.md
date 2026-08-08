<!-- GENERATED from @pxlkit/ui-kit v2.1.1 — do not edit; run npm run docs:build -->

# data

19 components. Import from `@pxlkit/ui-kit`.

### PixelAreaChart
- stable · since 1.9.0
- Pure-SVG filled area chart that closes the trend polyline down to the baseline, with crisp pixel edges or smoothed linear joins.
- Tone-aware stroke + fill via retro-* token classes — matches the rest of the kit. · Three sizes (sm/md/lg) with consistent inner padding and baseline math. · Surface-aware: pixel uses crispEdges + miter joins, linear can smooth via the smooth prop. · Polygon stays polygonal (no curves) so pixel surface remains pixel-perfect. · Auto-normalized [yMin..yMax] scale handles any numeric series.
- related: PixelSparkline, PixelBarChart, PixelStatGroup, PixelDataTable

### PixelAvatar
- stable · since 1.0.0
- Displays a user identity as an initials-or-image badge with optional status dot, tone, shape, and deterministic colored fallback.
- Initials fallback locale-aware via PxlKitLocale (uppercases per locale rules) · Five sizes (xs/sm/md/lg/xl) and three shapes (circle/rounded/square) · Optional status dot (online/away/busy/offline) baked into the accessible name · Deterministic tinted fallback via `colorSeed` (djb2 hash → tone palette) · Lazy/async image loading when `src` is provided
- related: PixelAvatarGroup, PixelBadge, PixelChip

### PixelAvatarGroup
- stable · since 1.9.0
- Clusters PixelAvatar children into an overlapping row with a tone-aware "+N" overflow tile when the count exceeds max.
- Overlapping layout with surface-aware ring isolation against the page background · Configurable max — extras collapse into a single "+N more" tile (tone-aware) · Five sizes (xs/sm/md/lg/xl) with proportional negative-margin overlap · Surface-aware radius (pixel → squared 3px / linear → fully rounded) · role="group" only when an accessible name is provided (aria-label / aria-labelledby)
- related: PixelAvatar, PixelBadge, PixelChip

### PixelBadge
- stable · since 1.0.0
- Compact status indicator that labels objects with tone, variant, and optional icon — renders as a pill (linear) or chamfered tag (pixel).
- Four variants — soft (default), solid, outline, ghost — across all tone keys. · Three sizes (sm/md/lg) with consistent vertical rhythm and font scale. · Optional iconLeft slot for status dots, glyphs, or counters. · Becomes a native <button> with focus ring and hover when onClick is provided. · Surface-aware: pixel chamfered border + pixel font, or linear pill.
- related: PixelChip, PixelBadgeGroup, PixelRibbon, PixelAvatar

### PixelBadgeGroup
- stable · since 1.9.0
- Inline row of badges with automatic "+N" overflow popover when the count exceeds `max`.
- Renders the first `max - 1` badges inline; remaining items collapse into a "+N" trigger. · Overflow trigger opens a PixelPopover with the hidden badges, surface-matched. · Wrapper becomes `role="group"` when an accessible name (aria-label or aria-labelledby) is provided. · Surface-aware: pixel chamfered radius + pixel font or linear pill, propagated to the popover. · Forwarded ref to the underlying div and full passthrough of HTMLAttributes.
- related: PixelBadge, PixelChipGroup, PixelPopover, PixelAvatarGroup

### PixelBarChart
- stable · since 1.9.0
- Pure-SVG bar chart that renders one rect per data point, in vertical (default) or horizontal orientation, with crisp pixel edges or smoothed linear corners.
- Tone-aware fills via retro-* token classes — matches the rest of the kit. · Three sizes (sm/md/lg) with sensible inner padding and gap math. · Vertical or horizontal orientation with auto-normalized [yMin..yMax] scale. · Optional inline value labels above (vertical) or after (horizontal) each bar. · Surface-aware: pixel uses crispEdges + square corners, linear smooths to rx=2.
- related: PixelSparkline, PixelAreaChart, PixelStatGroup, PixelDataTable

### PixelCarousel
- stable · since 1.9.0
- Embla-powered surface-aware carousel with horizontal or vertical orientation, optional arrows and dot pagination, keyboard navigation and reduced-motion support.
- Built on embla-carousel with full opts and plugins pass-through · Horizontal or vertical orientation with arrow and dot navigation · Keyboard navigation (Arrow keys) and aria-roledescription="carousel" landmark · Surface-aware (pixel or linear) with focus-ring tokens · Honors prefers-reduced-motion by zeroing transition duration
- related: PixelTabs, PixelPagination

### PixelChip
- stable · since 1.0.0
- Compact label tag for representing tags, filters, or selections, optionally clickable or removable via an inline delete control.
- Four visual variants (soft, solid, outline, ghost) across the full tone palette · Three sizes (sm, md, lg) with consistent padding + typography rhythm · Optional leading icon slot and built-in deletable X button with stop-propagation · Renders as <button> when onClick is set for native keyboard + screen reader semantics · Pixel + linear surface variants share identical API and chamfered/pill geometry
- related: PixelBadge, PixelChipGroup, PixelToggle

### PixelChipGroup
- stable · since 1.9.0
- Controlled chip row with single-select (radiogroup) or multi-select (group of checkboxes) — wraps each PixelChip in a semantic toggle button.
- Controlled value/onChange API drives selection — chips stay presentational. · Single mode renders role=radiogroup with roving tabindex + arrow / Home / End navigation. · Multi mode renders role=checkbox per chip with aria-checked and Space/Enter toggle. · Surface-aware: forwards pixel or linear surface to chip wrappers for consistent borders. · aria-label / aria-labelledby make the group an accessible landmark.
- related: PixelChip, PixelBadgeGroup, PixelBadge

### PixelCodeInline
- stable · since 1.0.0
- Inline <code> element with tone tinting and surface-aware framing for highlighting commands, identifiers, and short snippets in flowing prose.
- Semantic <code> root so assistive tech announces the inline-code role. · Tone-tinted border, background, and text for at-a-glance categorisation (neutral, cyan, green, gold, red, purple, pink). · Surface-aware: pixel chamfered border + pixel font, or linear pill. · Composable inline — accepts any ReactNode children for icons or multi-token snippets.
- related: PixelKbd

### PixelCollapsible
- stable · since 1.0.0
- Toggleable disclosure block with a tone-coloured chevron header that reveals or hides arbitrary content.
- Single-section disclosure pattern with animated chevron rotation · Seven brand tones applied to the header button (neutral default) · Surface-aware typography (pixel vs linear) via shared surface context · Uncontrolled state with `defaultOpen` for SSR-friendly initial render · SSR-safe and tree-shakable; renders children only when expanded
- related: PixelAccordion, PixelTabs

### PixelColorSwatch
- stable · since 1.0.0
- Design-token preview tile that renders a CSS custom property as a color sample alongside its human name and variable identifier.
- Pairs a 32px color chip with token name + CSS variable label for at-a-glance audits · Reads the color directly from a CSS custom property so it stays in sync with the active theme · Pixel + linear surface variants share identical API and tokenized geometry · Pure presentational primitive — SSR-safe and side-effect free
- related: PixelColorInput

### PixelDataTable
- stable · since 1.9.0
- TanStack-powered surface-aware data table with controlled sorting, filtering, pagination, row selection, column visibility, density, sticky header, loading skeletons and empty state.
- Fully controlled state for sorting, filtering, pagination, row selection and column visibility · Built on TanStack Table with re-exported ColumnDef and createColumnHelper for typed columns · Auto-injected selection column with indeterminate header checkbox when row selection is enabled · Three density presets, sticky header, skeleton loading rows and configurable empty state · Surface-aware (pixel or linear) with focus-ring tokens and retro design system colors
- related: PixelTable, PixelPagination, PixelEmptyState

### PixelKbd
- stable · since 1.0.0
- Styled keyboard shortcut indicator that renders a native <kbd> element with surface-aware framing for inline docs, hints, and command menus.
- Semantic <kbd> root so assistive tech announces the key role correctly. · Surface-aware: pixel chamfered border + pixel font, or linear pill. · Drop-shadow depth tuned per surface for a tactile keycap feel. · Composable inline — accepts any ReactNode children to support icons or multi-character keys.
- related: PixelCodeInline

### PixelSparkline
- stable · since 1.9.0
- Pure-SVG polyline trend chart that plots a series as a single stroke, with an optional filled area underneath — tone-aware and surface-aware.
- Tone-aware stroke + area fill via retro-* token classes — matches the rest of the kit. · Three sizes (sm/md/lg) with auto-normalized [yMin..yMax] Y scale and even X spread. · Optional showArea fills the area beneath the line at 20% opacity for context. · Surface-aware: pixel uses crispEdges + square caps/miter joins, linear smooths to round. · Zero deps — pure SVG, SSR-safe, tree-shakable.
- related: PixelBarChart, PixelAreaChart, PixelStatGroup, PixelDataTable

### PixelStatGroup
- stable · since 1.9.0
- Surface-aware container that groups PixelStatCard tiles in a row with dividers or a responsive grid, with shared tone and accessible group labeling.
- Row layout with vertical dividers or grid layout with configurable columns (1–6). · Tone-driven border color shared by the container and inter-cell dividers. · Surface-aware: pixel chamfered border + pixel radius, or linear rounded corners. · Adopts role="group" automatically when aria-label or aria-labelledby is provided. · Forwards ref to the underlying div and spreads native HTMLAttributes.
- related: PixelStatCard, PixelBadgeGroup, PixelAvatarGroup

### PixelTable
- stable · since 1.0.0
- Generic data table with striped rows, hover highlight, controlled sorting, single/multi row selection, sticky headers, density, loading skeletons and empty state.
- Controlled sort with header buttons + aria-sort semantics · Single or multi-row selection with checkbox column and indeterminate state · Sticky header and sticky first column for wide datasets · Built-in skeleton loading rows and configurable empty state · Three density presets (compact, normal, comfortable) on pixel or linear surface
- related: PixelDataTable, PixelPagination, PixelEmptyState

### PixelTextLink
- stable · since 1.0.0
- Inline anchor or button styled as a tone-coloured underlined link for prose, callouts, and CTAs.
- Polymorphic: renders <a> when `href` is provided, <button type="button"> otherwise · Seven brand tones (cyan default) with consistent focus ring and hover behaviour · Surface-aware typography (pixel vs linear) via shared surface context · Forwards native anchor/button attributes (target, rel, onClick, aria-*, etc.) · SSR-safe and tree-shakable; zero runtime state
- related: PixelButton, PixelBreadcrumb

### PixelTimeline
- stable · since 1.9.0
- Vertical timeline rendered as a semantic ordered list with past/active/upcoming states and surface-aware bullets and connectors.
- Semantic <ol>/<li> with aria-current="step" on the active entry · Configurable bullet size, alignment, and per-item connector variant (solid/dashed/dotted) · Surface-aware (pixel/glass/solid) styling via shared surface tokens · Connector lines marked aria-hidden so screen readers ignore decoration

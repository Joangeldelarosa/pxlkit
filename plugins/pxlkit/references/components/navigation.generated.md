<!-- GENERATED from @pxlkit/ui-kit v2.1.1 — do not edit; run npm run docs:build -->

# navigation

8 components. Import from `@pxlkit/ui-kit`.

### PixelAccordion
- stable · since 1.0.0
- Vertical list of expandable disclosure items with wired aria-controls / aria-expanded / labelled regions.
- Single-open by default; opt into multi-open via `allowMultiple` · First item auto-expanded unless `collapsedByDefault` is set · Surface-aware typography and borders (pixel vs linear) · aria-expanded + aria-controls wired per header for assistive tech · SSR-safe and tree-shakable; unopened panels are not rendered
- related: PixelTabs, PixelCollapsible

### PixelBreadcrumb
- stable · since 1.0.0
- Trail of links representing the user's location in a hierarchical site structure, with pixel-chevron or slash separators per surface.
- Renders <nav> + <ol>/<li> landmark with configurable aria-label. · Active crumb marked with aria-current="page" and emphasised typography. · Per-item href (link), onClick (button), or plain label — choose per crumb. · Pixel surface uses a crisp-edged chevron SVG; linear surface uses a slash separator. · SSR-safe, tree-shakable, and inherits ambient surface context.
- related: PixelPagination, PixelTextLink

### PixelMenubar
- stable · since 1.9.0
- Horizontal application menubar with nested submenus, keyboard navigation, and shortcut hints.
- Top-level menus with click + hover-to-switch behavior · Nested submenus with right-arrow open / left-arrow close · Full arrow-key, Home/End, Enter/Space, and Escape support · Shortcut labels and disabled / separator items · Surface-aware (border, radius, font) via Surface context
- related: PixelDropdown, PixelTabs, PixelBreadcrumbs

### PixelNavigationMenu
- stable · since 1.9.0
- Accessible nav landmark with optional mega-panel submenus, keyboard navigation, and surface-aware styling.
- Horizontal or vertical orientation · Optional shared viewport panel or inline per-item panels · Full keyboard support (Arrow/Home/End/Escape/Enter) · Surface-aware via useEffectiveSurface · SSR-safe, ref-forwarded nav landmark

### PixelPagination
- stable · since 1.0.0
- Windowed page-number navigator with Prev/Next, ellipses, and first/last anchors for navigating long paginated collections.
- Windowed page list with ellipses to handle large totals without overflow. · Configurable siblings to widen or tighten the visible window around the current page. · Prev/Next buttons auto-disable at the edges (page 1 and last page). · Localised prevLabel, nextLabel, and ariaLabel for i18n. · Pixel and linear surfaces follow ambient surface context.
- related: PixelBreadcrumb, PixelTable, PixelDataTable

### PixelSidebar
- stable · since 1.9.0
- Vertical navigation rail with sections, nested items, badges, and an optional collapsible width.
- Sections with optional titles and nested items up to two levels deep · Controlled and uncontrolled collapse with width swap and toggle button · Tone-aware badges per item and surface-coherent borders/typography · aside-style nav landmark with aria-current and aria-expanded toggle

### PixelStepper
- stable · since 1.9.0
- Multi-step progress indicator with completed/active/pending/error/loading states, horizontal or vertical orientation, and full keyboard navigation.
- Compound API (PixelStepper + PixelStepper.Step) keeps step content declarative and easy to reorder. · Per-step states (completed, active, pending, error, loading) with tone-mapped indicators and connectors. · Horizontal or vertical orientation with roving focus, Arrow/Home/End keys, and Enter/Space activation. · Optional onStepClick handler with allowNextStepsSelect gate so future steps stay locked until allowed. · Surface-aware (pixel/linear) and size-aware (sm/md/lg), inheriting kit-wide tokens and focus rings.
- related: PixelTabs, PixelProgress, PixelBreadcrumb

### PixelTabs
- stable · since 1.0.0
- Tabbed panel with roving tabindex and WAI-ARIA keyboard navigation, available as a sugar items[] API or a compositional List/Trigger/Panel API.
- Sugar API (items[]) for quick setup or compositional API (List/Trigger/Panel) for full control over rendering. · Horizontal or vertical orientation with arrow-key navigation, Home/End edges, and roving tabindex. · Automatic activation (select on focus) or manual activation (Enter/Space confirms). · Optional scrollable tablist with a fade-mask for overflow, and keepMounted for persistent panel state. · Pixel and linear surfaces inherit kit-wide tokens; controlled or uncontrolled via value/defaultTab.
- related: PixelAccordion, PixelSegmented, PixelStepper

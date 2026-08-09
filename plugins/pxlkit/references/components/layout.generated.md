<!-- GENERATED from @pxlkit/ui-kit v2.1.1 — do not edit; run npm run docs:build -->

# layout

14 components. Import from `@pxlkit/ui-kit`.

### PixelBento
- stable · since 1.7.0
- Bento-style grid container with span- and kind-aware cells for feature, stat, compact, and media layouts.
- Fixed 3 / 4 / 6 column tracks with token-driven gap spacing · PixelBentoCell with span presets (1x1, 2x1, 1x2, 2x2, 3x1, 1x3) · Cell kinds for feature, stat, compact, and media layouts · Tone- and surface-aware cell styling via tokens · forwardRef on both container and cell; SSR-safe div primitives
- related: PixelGrid, PixelEqualHeightGrid, PixelStack, PixelCluster

### PixelBentoCell
- stable · since 1.7.0
- Surface-aware bento grid cell with span, kind layout, and tone tokens for dashboard collages.
- Span tokens (1x1, 2x1, 1x2, 2x2, 3x1, 1x3) for collage layouts · Kind presets (feature / stat / compact / media) drive internal flex layout · Tone-aware border + background + text via shared token system · Surface-aware (retro / pixel) via useEffectiveSurface · Pairs with PixelBento parent grid for column + gap control
- related: PixelBento, PixelBox, PixelGrid

### PixelBox
- stable · since 1.6.0
- Surface-aware polymorphic container with tone, variant, padding, radius, border, and shadow controls.
- Surface-aware tokens via useEffectiveSurface (retro / pixel) · Tone + variant matrix (solid / soft / outline / ghost) · Polymorphic `as` for semantic landmarks (section, nav, aside, main, header, footer, article) · Dev-time a11y warning when rendered as a landmark without an accessible name · Padding and radius scale tokens with sensible defaults
- related: PixelSection, PixelStack, PixelCluster

### PixelCenter
- stable · since 1.6.0
- Polymorphic max-width wrapper that centers content horizontally with token-driven page gutters.
- Token-driven max-width via the containerWidth scale · Token-driven horizontal padding via the pageGutter scale · Polymorphic via the `as` prop — inherits semantics from the chosen element · Optional text alignment helper (left / center / right) · Surface-aware transition tokens through useEffectiveSurface
- related: PixelSection, PixelContainer

### PixelCluster
- stable · since 1.6.0
- Horizontal wrap container for clustering inline items (chips, tags, actions) with consistent gap, alignment, and justification.
- Flex row with wrap and configurable stack gap token · Surface-aware via useEffectiveSurface for transitions · Polymorphic via `as` to render as any intrinsic element · Align and justify props mirror flexbox semantics
- related: PixelStack, PixelGrid

### PixelContainer
- stable · since 1.6.0
- Surface-aware page section wrapper with token-driven max-width, page gutter, and vertical rhythm.
- Surface-aware tokens via useEffectiveSurface (retro / pixel) · Token-driven maxWidth, padding x (gutter), and padding y (section rhythm) · Polymorphic `as` for semantic landmarks (section, main, header, footer, article, aside, div) · Composes PixelCenter internally for consistent horizontal centering · SSR-safe and forwards refs to the underlying element
- related: PixelSection, PixelCenter, PixelBox

### PixelDivider
- stable · since 1.6.0
- Horizontal rule with optional centered label; pixel surface adds dotted line and diamond ornaments.
- Optional centered label between two rules · Tone-aware label color via shared toneMap · Symmetric vertical spacing presets (none/sm/md/lg) · Pixel surface variant with dotted rule and ◆ ornaments · Surface-aware: falls back to nearest <PxlKitSurface>

### PixelEqualHeightGrid
- stable · since 1.6.0
- Grid wrapper that forces equal-height children via a 3-row subgrid (header / body / footer).
- Inherits PixelGrid props (cols, gap, surface, etc.) minus align (forced to stretch) · Clones children with grid-rows-[auto_1fr_auto] so footers align across the row · Surface-aware via useEffectiveSurface for consistent borders and transitions · rowAlign="top" opts out of stretching while keeping equal-height children
- related: PixelGrid

### PixelGrid
- stable · since 1.6.0
- Surface-aware CSS grid container with responsive column maps, asymmetric gaps, and auto-fit/auto-fill modes.
- Numeric or responsive column spec (base/sm/md/lg/xl) · Asymmetric colGap/rowGap via stack-gap tokens · autoFit / autoFill with configurable minColWidth · Polymorphic via `as`; inherits semantics from rendered element · Surface-aware transition classes via useEffectiveSurface
- related: PixelStack, PixelCluster, PixelBento, PixelEqualHeightGrid

### PixelScrollArea
- stable · since 1.9.0
- Surface-aware scroll container with styled scrollbar, configurable visibility and dimensions.
- Surface-aware scrollbar palette (retro / pixel) via useEffectiveSurface · Scrollbar visibility modes: auto, always, scroll, hover · `maxHeight` caps content before scrolling kicks in · `scrollbarSize` and `offsetScrollbars` (stable gutter) for layout stability · Focusable region (tabIndex 0) with focus-visible ring and dev-time a11y warning
- related: PixelBox, PixelStack, PixelSection

### PixelSection
- stable · since 1.6.0
- Bordered section with optional uppercase title row, subtitle, and surface-aware container.
- Surface-aware borders and typography via useEffectiveSurface · Optional title (uppercased via locale) and subtitle row · Configurable container max-width or full-bleed with page gutter · Vertical rhythm token controls spacing between sections
- related: PixelCenter

### PixelSectionHeader
- stable · since 1.6.0
- Section header with eyebrow, title, description, and actions — rhythm-aware and surface-aware.
- Configurable heading level (h1–h4) preserves document outline · Size and spacing scales (sm/md/lg, tight/normal/loose) use shared rhythm tokens · Optional eyebrow is decorative (aria-hidden) with sr-only restatement in the heading · Tone-aware title coloring via ToneKey · Surface-aware typography via useEffectiveSurface

### PixelStack
- stable · since 1.6.0
- Polymorphic flex container with token-driven gap, direction, alignment, and surface-aware transitions.
- Direction toggle between column and row flex layouts · Token-based gap scale via stackGap for consistent rhythm · Alignment and justification helpers including baseline and space variants · Surface-aware transitions through useEffectiveSurface · Polymorphic via the `as` prop to render any intrinsic element
- related: PixelCluster, PixelGrid, PixelCenter

### PixelTwoColumn
- stable · since 1.6.0
- Two-column grid layout with preset ratios, responsive stacking, and surface-aware transitions.
- Preset ratios (50/50, 60/40, 40/60, 70/30, 30/70) with JIT-safe class maps · Responsive stacking below sm, md, or lg breakpoints · Reverse order toggle to flip visual order without changing markup semantics · Token-based gap scale via stackGap for consistent rhythm · Surface-aware transitions through useEffectiveSurface
- related: PixelGrid, PixelStack, PixelEqualHeightGrid

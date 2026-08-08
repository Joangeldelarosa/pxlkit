<!-- GENERATED from @pxlkit/ui-kit v2.1.1 — do not edit; run npm run docs:build -->

# cards

8 components. Import from `@pxlkit/ui-kit`.

### PixelCard
- stable · since 1.0.0
- Container card with title, optional icon, description, media, ribbon badge, body, and footer — surfaces as <article>, <a href>, or role="button" depending on props.
- Pixel + linear surfaces with optional tone tint on border and soft background · Polymorphic root: renders as <article>, <a href>, or interactive role="button" with Enter/Space activation · Media slot, corner ribbon badge, clamped description, padding scale, and composable Header/Body/Footer subcomponents · Focus-visible ring + keyboard parity when interactive or anchored
- related: PixelStatCard, PixelFeatureCard, PixelPricingCard, PixelTestimonialCard

### PixelFeatureCard
- stable · since 1.7.0
- Feature highlight card with toned icon frame, optional badge, title, clamped description, and footer — renders as <article>, role="button", or <a href> with full-card click target.
- Toned icon frame (48/56/64/80px) with surface-aware border and soft background · Optional badge slot above the icon with independent tone · Vertical or horizontal orientation with consistent alignment · Polymorphic root: <article>, interactive role="button" with Enter/Space, or <a href> with full-card target · Clamped description (2/3/4 lines) keeps cards aligned in grids
- related: PixelCard, PixelStatCard, PixelPricingCard, PixelTestimonialCard

### PixelIconFrame
- stable · since 1.7.0
- Decorative icon container with surface-aware borders, tone tinting, sizes, shapes, and an optional accent badge.
- Five fixed sizes (48 / 56 / 64 / 80 / 112) for consistent layout rhythm · Seven tone keys driven by shared tokens for soft tinted backgrounds · Square, rounded, and circle shapes that respect surface radius · Optional accent badge slot (top-right or bottom-right) · Respects prefers-reduced-motion when animated

### PixelPricingCard
- stable · since 1.7.0
- Pricing tier card with tone-driven highlight, optional popular ribbon, feature list, and CTA slot.
- Surface-aware borders, fonts, and radii via useEffectiveSurface · Tone tokens drive price color, highlight glow, and feature checks · Optional popular ribbon with its own tone override · Feature list supports included/excluded states with tooltip + a11y labels · Strikethrough price exposed to assistive tech via sr-only label
- related: PixelCard, PixelFeatureCard

### PixelRibbon
- stable · since 1.7.0
- Absolutely-positioned decorative ribbon for cards — surface-aware, tone-driven, with corner-tilt presets.
- Five position presets (top-center/left/right, corner-tl/tr) · Tone palette via shared ToneKey tokens · Auto-tilt on corner positions with manual override · Surface-aware borders, radius and display font
- related: PixelBadge, PixelCard

### PixelStarRating
- stable · since 2.0.0
- Pixel-art star rating display with optional interactive selection and surface-aware styling.
- Renders the @pxlkit/gamification Star at 16/20/24px with crisp nearest-neighbour scaling · Gold or green tone tokens for readonly and interactive states, surface-aware via useEffectiveSurface · Optional showCount label renders "N/M" beside the stars · Interactive mode exposes per-star buttons with onChange callback · Polymorphic starIcon prop swaps in any sibling-pack glyph without forking

### PixelStatCard
- stable · since 1.0.0
- Compact metric card surfacing a label, value, optional icon and trend line for dashboards and KPI grids.
- Seven tone presets aligned with the pxlkit palette (green, cyan, gold, red, purple, pink, neutral). · Three sizes (sm/md/lg) that scale padding, value, label and trend typography in lockstep. · Icon position aware: top, left, right or bottom-left layouts without prop drilling. · Surface-aware (pixel vs linear) — inherits the ambient surface context or override per-card. · Pure presentational + SSR-safe — no client hooks, fully tree-shakable.
- related: PixelCard, PixelStatGroup, PixelSparkline

### PixelTestimonialCard
- stable · since 1.7.0
- Surface-aware testimonial card with quote, attribution, avatar, star rating and verified badge.
- Semantic article + blockquote markup for accessible social proof · Tone tokens drive avatar + accents; surface adapts borders, radii and fonts · Optional star rating and VERIFIED badge for trust signals · Three quote-size presets (compact / normal / long) keep card grids aligned
- related: PixelStarRating

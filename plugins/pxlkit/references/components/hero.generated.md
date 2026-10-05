<!-- GENERATED from @pxlkit/ui-kit v2.2.0 — do not edit; run npm run docs:build -->

# hero

2 components. Import from `@pxlkit/ui-kit`.

### PixelHeroMedia
- stable · since 1.7.0
- Aspect-ratio-preserving figure slot for hero media with optional frame, tone border, and caption.
- Four ratio presets (1/1, 4/5, 16/10, 16/9) reserve layout to prevent CLS · Optional framed border driven by surface + tone tokens · Renders as semantic figure/figcaption when caption is provided · Surface-aware (pixel / linear) frame and corners

### PixelHeroSection
- stable · since 1.7.0
- Surface-aware hero section with eyebrow, headline, subline, CTA cluster, install snippet, meta and optional media in centered, split or parallax variants.
- Three variants: centered, split (with media column) and parallax (media behind text) · Density-aware vertical rhythm (compact / comfortable) and tunable min-height · Tone tokens for eyebrow accent + surface-aware typography and transitions · Composable slots: eyebrow, primary/secondary CTA, install, meta and media · Semantic <section> whose headline level is yours to set (`as`, h1 by default)
- related: PixelHeroMedia, PixelContainer, PixelTwoColumn, PixelCluster

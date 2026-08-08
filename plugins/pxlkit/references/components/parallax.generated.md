<!-- GENERATED from @pxlkit/ui-kit v2.1.1 — do not edit; run npm run docs:build -->

# parallax

3 components. Import from `@pxlkit/ui-kit`.

### PixelMouseParallax
- stable · since 1.6.0
- Cursor-tracking parallax layer that translates children based on mouse position with smooth lerp.
- Smoothed translate3d follow with configurable strength · Invert mode to repel children from the cursor · GPU-accelerated via will-change-transform · Forwards ref to the underlying div
- related: PixelParallaxGroup, PixelParallaxLayer, PixelScrollParallax

### PixelParallaxGroup
- stable · since 1.6.0
- Perspective/viewport container that clips parallax children within a shared overflow-hidden, relative-positioned area.
- Establishes a shared viewport for parallax layers · Applies position: relative and overflow: hidden automatically · Polymorphic tag: div, section, header, or main · Forwarded ref for imperative access · SSR-safe — no measurement or window APIs
- related: PixelParallaxLayer, PixelMouseParallax

### PixelParallaxLayer
- stable · since 1.6.0
- Scroll-driven parallax wrapper that GPU-translates its children proportionally to scroll position.
- GPU-composited via translate3d for smooth 60fps motion · Configurable speed multiplier (negative values reverse direction) · Supports x, y, or both axes · Ref-forwarding to underlying div

<!-- GENERATED from @pxlkit/ui-kit v2.1.1 — do not edit; run npm run docs:build -->

# animations

11 components. Import from `@pxlkit/ui-kit`.

### PixelBounce
- stable · since 1.6.0
- Vertical bounce animation with damped follow-through for any inline content.
- Configurable bounce height, duration, easing, and repeat count · Trigger modes: mount, hover, focus, viewport · Forwards refs and merges with internal trigger observers · Respects prefers-reduced-motion automatically
- related: PixelShake, PixelPulse, PixelFloat

### PixelFadeIn
- stable · since 1.6.0
- Fades children from opacity 0 to 1 with configurable duration, delay, easing, and trigger.
- Mount, hover, click, or in-view triggers · Configurable duration, delay, easing, and fill-mode · Iteration count supports finite or infinite repeats · onComplete callback fires after the final iteration · Respects prefers-reduced-motion via useReducedMotion
- related: PixelSlideIn, PixelScaleIn, PixelBlurIn

### PixelFlicker
- stable · since 1.6.0
- Broken-neon-sign opacity flicker loop for retro signage and emphasis.
- Stepped opacity flicker that mimics a broken neon sign · Configurable duration and repeat count · Trigger modes: mount, hover, click, focus, inView, or controlled · Forwards refs and merges with internal trigger observers · Respects prefers-reduced-motion automatically
- related: PixelGlitch, PixelPulse, PixelShake

### PixelFloat
- stable · since 1.6.0
- Gentle vertical sine loop, perfect for hero badges and floating accents.
- Configurable travel distance, duration, easing, and repeat count · Trigger modes: mount, hover, focus, viewport · Forwards refs and merges with internal trigger observers · Respects prefers-reduced-motion automatically
- related: PixelBounce, PixelPulse, PixelFadeIn

### PixelGlitch
- stable · since 1.6.0
- Three-layer glitch effect (R/C ghost layers + main) with clip-path slices and color separation.
- Layered R/C color-separation ghosts for authentic CRT-glitch feel · Configurable duration and horizontal displacement intensity · Animation trigger modes: mount, hover, in-view, manual · Respects prefers-reduced-motion via shared animation hooks · SSR-safe forwardRef wrapper around any children

### PixelPulse
- stable · since 1.6.0
- Gently scales and dims children in a recurring pulse to draw attention.
- Configurable duration, easing, and repeat count · Trigger modes: mount, hover, click, focus, inView, or controlled · Forwards refs and merges with internal trigger observers · Respects prefers-reduced-motion automatically
- related: PixelBounce, PixelFlicker, PixelGlitch

### PixelRotate
- stable · since 1.6.0
- Full 360° rotation loop with configurable direction, duration, and trigger.
- Configurable duration, easing, repeat count, and animation direction · Trigger modes: mount, hover, focus, viewport · Forwards refs and merges with internal trigger observers · Respects prefers-reduced-motion automatically
- related: PixelFloat, PixelPulse, PixelBounce

### PixelShake
- stable · since 1.6.0
- Quick horizontal shake animation, ideal for validation errors or attention cues.
- Configurable duration, distance, repeat count, and easing · Trigger on mount, hover, click, focus, in-view, or controlled boolean · Respects prefers-reduced-motion automatically · onComplete callback fires after the final iteration · Forwards ref to the wrapping div
- related: PixelBounce, PixelPulse, PixelGlitch

### PixelSlideIn
- stable · since 1.6.0
- Translates children in from one of four edges with configurable distance, duration, and trigger.
- Slide from up, down, left, or right edges · Mount, hover, click, or in-view triggers · Configurable duration, delay, distance, easing, and fill-mode · Iteration count supports finite or infinite repeats · Respects prefers-reduced-motion via useReducedMotion
- related: PixelFadeIn, PixelZoomIn, PixelBounce

### PixelTypewriter
- stable · since 1.6.0
- Types out a string one character at a time with an optional blinking caret.
- Configurable speed, delay, and blinking caret · Tone-aware text color via shared tone tokens · Animation trigger modes: mount, view, hover, click · onComplete callback fires when full text is rendered

### PixelZoomIn
- stable · since 1.6.0
- Scales children from a starting scale factor to 1 with a fade-in animation.
- Configurable duration, delay, easing, and start scale · Supports mount, hover, and view-based triggers · Respects prefers-reduced-motion via shared animation hook · Forwards ref to the wrapping div and fires onComplete after final iteration
- related: PixelFadeIn, PixelSlideIn

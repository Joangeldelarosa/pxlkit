# @pxlkit/ui-kit — Changelog

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

# @pxlkit/ui-kit — Changelog

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

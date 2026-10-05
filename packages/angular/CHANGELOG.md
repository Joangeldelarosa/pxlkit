# Changelog — @pxlkit/angular

<!-- This file is hand-maintained — add an entry at the top for each release. -->

## 0.1.0 — 2026-10-05

### Added

- Initial release: Angular bindings for the Pxlkit rendering engine (`@pxlkit/core/vanilla`), published in the Angular Package Format with partially compiled declarations for Angular 20, 21 and 22.
- Standalone, `OnPush`, signal-based components `<pxl-icon>` (`PxlKitIcon`), `<pxl-animated-icon>` (`AnimatedPxlKitIcon`), `<pxl-parallax-icon>` (`ParallaxPxlKitIcon`) and `<pxl-toast>` (`PixelToast`) — the same inputs and rendered markup as the React components in `@pxlkit/core`, verified by a React ↔ Angular parity suite (server rendering, mount, input changes and frame-by-frame playback).
- Angular idioms: the host element is the component's root (`class` / `style` apply to it and the consumer's `style` wins), inputs accept attribute values (`size="48"`, a bare `interactive`), `ariaLabel` input, `(activate)` (parallax) and `(closed)` (toast) outputs; an optional input bound to `undefined` takes its default.
- A `decorative` input, as in React: an icon beside text that already says what it means renders `alt=""` (the parallax icon's host `aria-hidden="true"`), so screen readers skip it; a bare `decorative` attribute sets it. `<pxl-toast>`'s icon is decorative.
- Works zoneless and with zone.js: playback timers, the parallax loop and its mouse listener run outside the Angular zone and write frames straight to the DOM, so an animation never triggers change detection.
- SSR- and hydration-safe: server rendering produces the complete markup and starts nothing; timers, observers and animation frames start after the first render in the browser.
- The whole framework-agnostic API of `@pxlkit/core/vanilla` is re-exported.

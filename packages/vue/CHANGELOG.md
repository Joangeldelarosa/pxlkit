# Changelog — @pxlkit/vue

<!-- This file is hand-maintained — add an entry at the top for each release. -->

## 0.1.0 — 2026-10-06

### Added

- Initial release: Vue 3 bindings for the Pxlkit rendering engine (`@pxlkit/core/vanilla`).
- `PxlKitIcon`, `AnimatedPxlKitIcon`, `ParallaxPxlKitIcon` and `PixelToast` — same names, props and rendered markup as the React components in `@pxlkit/core`, verified by a React ↔ Vue parity suite (server rendering, mount, and frame-by-frame playback).
- Vue idioms: `class` / `style` attribute fallthrough, `aria-label` as a prop, `@activate` (parallax) and `@close` (toast) events.
- `decorative`, as in React: an icon beside text that already says what it means renders `alt=""` (the parallax icon's container `aria-hidden="true"`), so screen readers skip it; `PixelToast`'s icon is decorative.
- SSR- and hydration-safe: server rendering produces the complete markup, which the client adopts without a mismatch; timers, observers and animation frames start on mount, never during server rendering.
- Typings spelled with the `DefineComponent` signature Vue 3.3 already has, so props and events type-check identically from Vue 3.3 to the latest 3.x.
- The whole framework-agnostic API of `@pxlkit/core/vanilla` is re-exported.

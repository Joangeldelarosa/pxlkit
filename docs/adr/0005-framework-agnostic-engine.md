# ADR-0005: Framework-Agnostic Rendering Engine with React, Vue and Angular Bindings

- **Status:** Accepted
- **Date:** 2026-10-01

## Context

Until now `@pxlkit/core` was a React package: the four icon components (`PxlKitIcon`, `AnimatedPxlKitIcon`, `ParallaxPxlKitIcon`, `PixelToast`) held all the rendering and motion logic inside React hooks, `react` and `react-dom` were required peers, and every icon pack imported its types from the React entry point. Vue and Angular teams could not use the icons without React in their bundle, and a port per framework would have meant three copies of the SVG renderer, the frame clock, the parallax physics and the toast styling — three bug surfaces that would drift within a release or two.

The icon data model never depended on React: an icon is a grid plus a palette, rendered to an `<img>` whose `src` is an SVG data URI. What did depend on React was the code around it — state, effects and refs.

## Decision

We split `@pxlkit/core` into a framework-agnostic engine and thin framework bindings.

1. **One engine, in `@pxlkit/core/vanilla`.** A React-free entry point exports the data model, the utilities and the engine: `renderIconSvg` / `renderIconDataUri` (the exact image source), `createAnimatedIconPlayer` (frame clock, triggers, hover, off-screen pausing), `createParallaxController` (mouse tilt, intro, burst, particles), `resolvePixelToastView` / `resolveToastAutoClose`, and the style maps every binding applies. Nothing in its module graph — runtime or type declarations — references a UI framework; a test enforces it.
2. **Bindings own only framework idioms.** `@pxlkit/core` (React), `@pxlkit/vue` and `@pxlkit/angular` turn props into engine calls and engine output into markup. The motion code (players and controllers) is imperative, with a `connect` / `update` / `disconnect` lifecycle each framework maps onto its own (`useSyncExternalStore` and effects, `onMounted` and watchers, `afterNextRender`, effects and `DestroyRef`).
3. **The engine owns per-frame DOM writes.** The parallax controller is the only writer of layer and scene `transform`s, and Angular's animated icon writes each frame straight to its `<img>`. Frameworks re-render on input changes only, never per frame — which also keeps zone.js applications free of app-wide change detection while an icon animates.
4. **Parity is tested, not assumed.** The Vue and Angular suites render the React component and their own side by side and compare a canonical DOM on the server, on mount, after input changes and frame by frame while animating. Any difference is an adapter bug.
5. **Icon packs depend on the vanilla entry only.** They are plain data, so one install of `@pxlkit/gamification` serves every framework. `react` and `react-dom` become optional peers of `@pxlkit/core`.
6. **Angular ships in the Angular Package Format** (partial compilation, linked by the consumer's CLI), built by ng-packagr and published from the package root like every other workspace, so the release workflow and the publish dry-run gate need no special case.

## Consequences

### Positive

- One renderer and one motion model for three frameworks: a fix in the engine fixes React, Vue and Angular at once, and the parity suites prove the outputs stay identical.
- Vue and Angular installs never pull React; the icon packs are framework-neutral.
- The engine is directly usable from vanilla TypeScript or any other framework.
- Moving per-frame work out of the frameworks fixed long-standing React issues on the way (the parallax stack stuck after a burst, ping-pong stalls) and cut re-renders during animations.

### Negative

- Three packages to version and release instead of one. New bindings start at 0.x and follow `@pxlkit/core`'s engine.
- Engine changes must keep every binding's lifecycle in mind (server rendering, React StrictMode double effects, Vue's style patching, Angular zones); the engine's own tests cover those contracts.
- Angular adds a second build tool (ng-packagr) next to tsup.

### Neutral

- Binding APIs follow each framework's conventions — Vue fall-through attributes and `@activate` / `@close`, Angular host elements, signal inputs and `(activate)` / `(closed)` — instead of mirroring React prop for prop. The rendered markup is what stays identical; Angular's `<pxl-icon>` is the one structural difference, a host box around the same `<img>`.
- The legacy React-only colour props (`colorful`, `solid`, `tint`) are not carried over to Vue and Angular.

## Alternatives Considered

- **Web Components (custom elements) as the single implementation.** Rejected: server rendering and hydration of custom elements are still uneven across Next.js, Nuxt and Angular SSR, framework-native typing of inputs and events is weaker, and the React components would have changed shape for existing users.
- **Separate per-framework ports without a shared engine.** Rejected: three copies of the renderer and the motion code, with nothing but discipline keeping them in sync.
- **Mitosis or another compile-to-many-frameworks tool.** Rejected: it constrains how components are written, adds a build step every contributor must learn, and its output still needs per-framework fixes for lifecycles such as zones, StrictMode and SSR.
- **Keep React as a required peer and wrap the React components in Vue / Angular.** Rejected: ships React to every user, two renderers fighting over the same DOM, and no server rendering.

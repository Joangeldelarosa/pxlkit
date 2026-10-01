# ADR-0006: One UI Kit for React, Vue and Angular

- **Status:** Accepted
- **Date:** 2026-10-01

## Context

ADR-0005 gave the icon components a framework-agnostic engine and Vue and Angular bindings. The UI kit was still React only: 111 components in `@pxlkit/ui-kit`, with their design tokens, class maps, Tailwind theme and DOM behaviour (focus trap, scroll lock, dark mode, storage) living inside the React package. Vue and Angular teams had the icons but not the components around them.

Unlike an icon, a UI component is mostly markup and interaction — slots and children, controlled state, context, portals, keyboard handling. There is no small engine to share the way an SVG renderer is shared; the markup itself has to be written per framework.

## Decision

1. **A framework-neutral core, `@pxlkit/ui-kit-core`.** Everything that is not markup moves out of the React package into a core shared by every kit, with no framework dependency (its one runtime dependency is Floating UI, for anchored positioning): design tokens, the `Tone` / `Size` / `Variant` / `Surface` vocabulary, the surface system and control scale, the Tailwind CSS v4 theme (`styles.css`), per-component class recipes, the pixel glyphs as data, locale data, DOM behaviour (`trapFocus`, the stacking `lockScroll`, focus return, floating positioning) and preference helpers (dark mode, media queries, storage). The React kit re-exports what it already exported, so its public API does not change. Pure logic a component needs in every framework (date math, colour conversion, filtering, …) moves into the core when the component is ported, and the React component switches to it — one implementation, three consumers.
2. **One kit per framework, written idiomatically.** `@pxlkit/ui-kit-vue` is written as single-file components (`<script setup lang="ts">`), built by Vite with declarations from vue-tsc and checked with strict templates. `@pxlkit/ui-kit-angular` is standalone, `OnPush`, signal-based (`input()`, `model()`, `output()`), published in the Angular Package Format by ng-packagr and checked by `ngc` with strict templates. Both keep the React kit's component names, prop names, defaults and class strings; each framework's own conventions decide the rest. The mapping rules are written down in [`docs/ui-kit-porting.md`](../ui-kit-porting.md); the main ones:
   - React `children` → Vue default slot / Angular `<ng-content>`; any other `ReactNode` prop → a Vue named slot (kebab-case) / an Angular input that takes text or an `<ng-template>` (`PxlContent`).
   - `value` + `onChange` → Vue `v-model` / Angular `[(value)]` (`model()`); `x` + `onXChange` → `v-model:x` / `[(x)]`; other callbacks → Vue events / Angular outputs.
   - A component whose root is a native element with semantics of its own (`<button>`, `<a>`, `<input>`, …) becomes an Angular attribute selector on that element (`button[pxlButton]`); other components are an element whose host is the root (`<pxl-badge>`).
   - React context → Vue `provide` / `inject` → Angular dependency injection; portals → Vue `<Teleport>` → an Angular structural directive (`*pxlPortal`), all rendering in place on the server and during hydration, so the server markup and hydration agree, and moving into `document.body` after that.
3. **Parity is tested, not assumed.** Every manifest example exists in all three frameworks. A shared harness (`scripts/parity`) renders each example in React and in Vue or Angular and compares a canonical DOM — on mount (portals and focus included), on the server, and after every step of scripted interactions; each kit also hydrates every example from its own server-rendered markup. React is the reference implementation; any difference is a port bug.
4. **The examples are the documentation.** Each manifest example is a React function, a Vue SFC (`examples/<category>/<Component>/<Example>.vue`) and an Angular component (`examples/<category>/<component>.examples.ts`), all importing the published package name. The parity suites prove the three render the same thing, and the docs show all three.
5. **Lockstep versions.** The core and the three kits share their version. A given version has the same components and the same features in every framework.
6. **Tailwind sees every class.** Each package's stylesheet registers its compiled output with `@source`, so `@import "<kit>/styles.css"` after `@import "tailwindcss"` is the whole setup in every framework.

## Consequences

### Positive

- Vue and Angular get the full kit, not a subset, with the same look, markup and keyboard behaviour as React — verified per example.
- One source for tokens, theme, recipes and behaviour: a palette, recipe or focus-trap fix lands in every framework at once.
- The React kit's public API is unchanged, and duplicated logic it had (three copies of the calendar helpers, for instance) collapses into one tested module.

### Negative

- Markup is written three times. The parity suites catch drift, but a visual change now touches three files.
- Four packages to release instead of one, and two more build toolchains (Vite + vue-tsc, ng-packagr).
- Contributors need some familiarity with the three frameworks; the porting guide and the parity failures (which show the exact DOM difference) carry most of that load.

### Neutral

- Framework idioms differ where they must: Vue slots and `v-model`, Angular attribute selectors, `<ng-template>` inputs and `[(…)]` bindings. The docs show each framework's API side by side.
- The Angular test suites compile the sources for JIT with the Angular CLI's own transform (signal inputs, models and queries included); ahead-of-time compilation is covered by `ngc` with strict templates and by the ng-packagr build.

## Alternatives Considered

- **Web Components as the single implementation.** Rejected for the reasons in ADR-0005, and because forms (`v-model`, `ControlValueAccessor`), slots / content projection and server rendering would all be second-class.
- **Headless state machines shared by thin view layers (in the style of Zag.js).** Rejected for now: most of the kit's behaviour is simple enough that a state-machine layer would add more code than it removes; the pieces that are worth sharing (focus trap, scroll lock, date math, filtering) are shared as plain functions in the core.
- **Generating Vue and Angular from the React source (Mitosis and similar).** Rejected: the kit uses React-specific patterns (`asChild`, compound components with context, render props, portals) that such tools translate poorly, and the output would still need per-framework fixes.
- **Wrapping the React kit for Vue and Angular.** Rejected: ships React to every user, two renderers on one DOM, no server rendering.

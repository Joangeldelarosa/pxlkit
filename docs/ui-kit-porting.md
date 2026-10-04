# Porting a UI kit component to Vue and Angular

The UI kit exists three times: `@pxlkit/ui-kit` (React, the reference), `@pxlkit/ui-kit-vue` and `@pxlkit/ui-kit-angular`, all built on `@pxlkit/ui-kit-core`. [ADR-0006](./adr/0006-multi-framework-ui-kit.md) records why. This guide is the how: where a port goes, how React APIs map onto Vue and Angular, and how parity is proven.

A port is done when the component's manifest examples render the same DOM in all three frameworks, on mount, on the server and after every scripted interaction, and when the framework-specific API (`v-model`, `[(…)]`, forms) has tests of its own.

## Where things live

| What | React (reference) | Vue | Angular |
| --- | --- | --- | --- |
| Component | `packages/ui-kit/src/<category>/<Component>.tsx` | `packages/ui-kit-vue/src/<category>/<Component>.vue` (`.ts` for render-function components) | `packages/ui-kit-angular/src/lib/<category>/<component-kebab>.ts` |
| Category barrel | `src/index.tsx` | `src/<category>/index.ts` | `src/lib/<category>/index.ts` |
| Examples | `<Component>.examples.tsx`, listed in `<Component>.manifest.ts` | `examples/<category>/<Component>/<Example>.vue` | `examples/<category>/<component-kebab>.examples.ts`, one class per example |
| Tests | `src/__tests__/<category>/<Component>.test.tsx` | `src/__tests__/<category>/<Component>.test.ts` | `src/__tests__/<category>/<Component>.test.ts` |

Shared pieces:

- **Class recipes** — `packages/ui-kit-core/src/components/<category>/<component>.ts`, exported from the category barrel (`components/<category>/index.ts`). A recipe is the class strings a component composes (`badgeVariantClasses`, `modalClasses(surface, size, state)`, …). Move them out of the React component when you port it and make the React component use them: the three kits then cannot drift apart on a class name.
- **Logic** — anything that is not markup and that every framework needs (date math, filtering, colour conversion) goes next to the recipes, in the same category folder, with its own unit tests; behaviour shared across categories (focus handling, positioning) lives in `src/dom/`. The core keeps 90% coverage on every metric.
- **Parity scenarios** — `scripts/parity/scenarios/<category>.ts` (or `<category>-<part>.ts`; every module in the folder is picked up).
- **Angular host map** — `packages/ui-kit-angular/src/__tests__/hosts/<category>.ts` (see [Angular](#angular)).

The examples import the package by name (`@pxlkit/ui-kit-vue`, `@pxlkit/ui-kit-angular`), as an application does; in the test suites that name resolves to the sources.

## Mapping the API

| React | Vue | Angular |
| --- | --- | --- |
| `children` | default slot | `<ng-content />` |
| other `ReactNode` prop (`icon`, `footer`) | named slot, kebab-case (`#icon-left`) | input taking text or an `<ng-template>` (`PxlContent`), rendered with `*pxlOutlet` |
| `ReactNode` inside data (`items[].content`) | `PxlNode` (text, VNode or render function), rendered with `RenderNode` | `PxlContent` |
| `value` + `onChange` | `v-model` (`modelValue` / `update:modelValue`) | `[(value)]` with `model()` |
| `x` + `onXChange`, `checked` + `onChange` | `v-model:x`, `v-model:checked` | `[(x)]`, `[(checked)]` |
| `defaultValue` | `default-value` prop | `defaultValue` input |
| other callback (`onClose`) | event (`@close`) — also `update:open` when it closes an `open` prop | output, past tense where the present would shadow a DOM event (`(closed)`) |
| context provider | `provide` / `inject` with an `InjectionKey` | an `InjectionToken`, provided by the component or a directive |
| `forwardRef` to the root element | the root element is `$el`; teleported content exposes `element` | the host element (`ElementRef`) |
| portal | `<Teleport>` through `PixelPortal` | `*pxlPortal` |
| `asChild` | `as-child` + the internal `Slot` | an attribute selector on the consumer's element (`a[pxlButton]`) |

Keep the React component name, prop names, defaults and class strings. Where a framework has its own idiom (slots, `v-model`, `[(…)]`, attribute selectors) use it, and record the mapping in the component's docstring example.

### Controlled and uncontrolled state

Form-like components support both, as in React. In Vue, `useControllableState` keeps the local value while the prop is `undefined`, so a controlled prop must default to `undefined` — for booleans, `{ type: Boolean, default: undefined }`, or Vue casts a missing boolean to `false`. In Angular, `model()` holds the state; a form control also implements `ControlValueAccessor` through `FormBridge` and `provideValueAccessor`. A prop whose parent decides — a controlled-only one (`PixelPopover`'s and the dialogs' `open`), or one that is controlled while bound (`PixelDropdownRoot`'s and `PixelTooltip`'s `open`) — is an `input()` with an `xChange` `output()`: `[(x)]` still binds both, the component asks through the output and never sets the input, and while the input is unbound the component keeps its own state (`overlays/_internal/open-state.ts`). A listener that runs outside the zone asks inside `NgZone.run`, so a zone.js application renders the parent's answer.

## Vue

- `<script setup lang="ts">` with a typed `defineProps` interface (`withDefaults` for defaults), `defineEmits` and `defineSlots`. Document every prop, event and slot: the docs read them.
- Imports between sources use explicit extensions (`./foo.js`, `./Bar.vue`).
- Attributes and listeners fall through to the root element. When they belong to an inner element, set `defineOptions({ inheritAttrs: false })` and `v-bind="$attrs"` there.
- A callback whose presence changes the markup (React renders a `<button>` only with `onClick`) is declared as a prop (`onClick?: (event: MouseEvent) => void`), not only as an event.
- Composables mirror the React hooks: `useEffectiveSurface`, `usePxlKitLocale`, `useReducedMotion`, `useFocusTrap`, `useScrollLock`, `useEscape`, `useClickOutside`, `useEventListener`, `useControllableState`.
- Ids come from `useId()`; the parity harness normalises generated ids, so they need not match React's.
- `lint` is `vue-tsc` with unknown-component and unknown-directive checks, over the sources and examples and then over the tests.

## Angular

- Standalone components and directives, `ChangeDetectionStrategy.OnPush`, signal APIs (`input()`, `model()`, `output()`, `viewChild()`), `inject()`.
- **The root element.** A component whose React root is a native element with semantics of its own (`<button>`, `<a>`, `<input>`) is an attribute selector on that element (`button[pxlButton]`). Any other component is an element whose host *is* the root: `<pxl-badge>` stands for React's `<span>`. A component whose React render is a fragment, or conditional, gets a layout-neutral host: `'[style.display]': '"contents"'`.
- **The host's box.** A custom element is inline by default, where transforms do not apply and widths behave differently. A host that stands for a block element (`<div>`, `<section>`) gets `display: block` from the component's styles — `encapsulation: ViewEncapsulation.None` with `styles: '@layer base { pxl-fade-in { display: block; } }'`, so the rule reaches the host and sits in the base layer, where display utilities on the host still win. The parity suite compares the DOM, not the layout, so it cannot catch a missing one: `src/__tests__/host-boxes.test.ts` does, for every host the parity rules register as standing for a block element. A host whose own classes set its display, as React's element does (`PixelSplitButton`'s `inline-flex`), needs no rule and is listed there as an exception.
- **Register the host** in `src/__tests__/hosts/<category>.ts`: the tag React renders in its place, or `null` for a fragment. The parity harness compares `<pxl-badge>` as a `<span>` and drops the implicit role of the element it stands for.
- **Inputs that are also native attributes** stay on the host as attributes when written statically (`title="…"`, `id="…"`, `align="…"`, `disabled`). Clear the ones that would have an effect there with `'[attr.title]': 'null'` (a native tooltip), `[attr.id]` (a duplicated id), `[attr.align]` (legacy centring on a `div`), `[attr.role]` and the form attributes. The parity harness fails on any such attribute left on a host.
- **Coercion.** Optional inputs bound to `undefined` behave as unset: use `withDefault`, `booleanOr`, `numberOr`, `optionalBoolean` from `_internal/coercion`.
- **`ReactNode` props** become `PxlContent` inputs (`string | TemplateRef`), rendered with `*pxlOutlet`.
- **Browser-only work** (listeners on `window` or `document`, measuring, focusing) runs in `afterNextRender` / `afterRenderEffect`, never on the server. Both run outside the Angular zone, so page-wide listeners cost a zone.js application no change detection; writing a signal or a `model()` from them still renders. Focus moves there too, not from a `setTimeout` in the zone. A timer React keeps runs in `NgZone.runOutsideAngular` unless its end changes what is shown — the frame before focus moves on after a paste, the pause after which a menu forgets typed letters: an in-zone timer holds `whenStable()` and costs an app-wide check when it fires.
- **Listener order.** A host listener is registered before the element's own `(click)` bindings. When the consumer's handler must run first (so it can `preventDefault()` the kit's behaviour), register the kit's listener in `ngOnInit` with `Renderer2.listen`.
- **Content projection is eager**: projected content is created with the parent, whether or not the component shows it. When React mounts something lazily (popover content), use a structural directive (`*pxlPopoverContent`) or an `<ng-template>` input.
- **Internal directives** that end up on elements (`svg[pxlGlyph]`) live in an `_internal` folder — `src/lib/_internal/` for the whole kit, `src/lib/<category>/_internal/` for one category. The parity rules pick up every export there, so their selector attributes count as bookkeeping.
- `lint` is `ngc` with strict templates and extended diagnostics as errors over the sources and examples, then `tsc` over the tests. The tests compile the sources for JIT; the build (ng-packagr) and the package suite check the published bundle.

## Behaviour that is easy to get wrong

These all came up during the first ports; the parity suites catch each of them.

- **Focus across a portal.** Moving a focused element in the DOM drops its focus. The Vue and Angular portals put it back (`preserveFocus` in the core); React's portal creates content in place from its first client render.
- **Reader preferences in the first render.** A media query (`prefers-reduced-motion`, a breakpoint) or stored state read while hydrating gives other markup than the server rendered for some readers. `useMediaQuery` / `injectMediaQuery` start from their default value in a component that hydrates and take the reader's value right after (Vue: the component's vnode already holds its server element during `setup`; Angular: the host still carries its `ngh` annotation); a component mounted in the browser reads the reader's value at once. The hydration suites render every example a second time for a reader who prefers reduced motion.
- **Initially open components.** A Vue watcher with `immediate: true` runs during `setup`, before any template ref exists. Effects that need an element (`useFocusTrap`) must also watch the element.
- **Focus return.** Content that closes while it holds focus hands it back to its trigger (`returnFocusOnRemoval`), except after a press outside, where focus follows the pointer.
- **Floating content** is positioned with the core's `anchorFloating` and `floatingStyles`, which reproduce `@floating-ui/react-dom` exactly; positions settle asynchronously, so the parity harness waits a task after every step.
- **CSS lives in the stylesheet.** Keyframes and utilities a component names must exist in `@pxlkit/ui-kit-core`'s `styles.css`: keyframes as plain top-level `@keyframes` (Tailwind CSS v4 emits a `@theme` keyframe only when a utility uses it), never a `<style>` element added at run time, which a server render lacks until hydration and a Content Security Policy may block.
- **SVG attributes keep their case** (`viewBox`, `preserveAspectRatio`, `pxlGlyph`); HTML attributes are lower-cased.
- **Scroll lock** is shared: one lock count for every kit on the page. Unmount what you mount in tests, or an open modal's lock leaks into the next test (Vue: `enableAutoUnmount`; Angular's TestBed destroys fixtures itself).

## Proving parity

1. **Write the examples.** One Vue SFC and one Angular class per manifest example, named after the React export, rendering the same content with the same props. Use the ported kit's own components where the React example uses kit components, and the framework's icon components where it renders `PxlKitIcon`: `@pxlkit/vue`'s `PxlKitIcon`, `@pxlkit/angular`'s `<pxl-icon>` (the Angular parity rules read that host as the image it renders). Import the packages by name, never by a relative path: the site shows each example's code as what a reader pastes.
2. **Add scenarios** for every interaction the component has, in `scripts/parity/scenarios/`. A scenario starts from an example and lists steps (`click`, `pointerdown`, `hover`, `focus`, `keydown` with modifiers, `input`, `select`, a failed `error` load, `wait` on the simulated clock, the page's `visibility` and the `window` losing or regaining focus); the DOM is compared after each step. `reducedMotion: true` renders it for a reader who prefers reduced motion.
3. **Run the suites** in each kit:

   ```bash
   npx vitest run src/__tests__/parity.test.ts -t PixelModal   # mount + interactions vs React
   npx vitest run src/__tests__/ssr src/__tests__/hydration.test.ts
   npm run lint
   ```

   An example without a port shows up as a `todo`, not a failure; a port that differs fails with the exact DOM difference.
4. **Test the framework API** the parity suite cannot see: `v-model` / `[(…)]` round trips, one-way bindings, events and outputs, form integration (`ngModel`, reactive forms), slots and templates, and zone.js applications (`src/__tests__/zone`).

The canonical DOM compares classes as sets, styles declaration by declaration, form controls by state, generated ids by order of appearance, the focused element, and the inline styles of `<html>` and `<body>` (a scroll lock). Comments, attribute order and framework bookkeeping (`data-v-*`, `_ngcontent-*`, `ng-reflect-*`) are ignored.

## Checklist

- [ ] Recipes and shared logic moved to `@pxlkit/ui-kit-core`, with tests; the React component uses them and its tests pass.
- [ ] Vue component, exported from its category barrel, with documented props, events and slots.
- [ ] Angular component or directive, exported from its category barrel; host registered; native attributes cleared from the host.
- [ ] Every manifest example ported in both frameworks.
- [ ] Parity scenarios for every interaction; parity, SSR and hydration suites green in both kits.
- [ ] Framework-specific API tests.
- [ ] `npm run docs:build` run: it writes the component's reference section in the three frameworks, the ports' README tables and the component's Vue and Angular stories (`stories/`), which `npm run storybook:vue` and `npm run storybook:angular` show.
- [ ] `npm run lint` and `npm test` green at the repository root.

# Changelog — @pxlkit/ui-kit-vue

<!-- This file is hand-maintained — add an entry at the top for each release. -->

## 2.2.0 — 2026-10-05

### Added

- Initial release: the Pxlkit UI kit for Vue 3, versioned in step with `@pxlkit/ui-kit` (React) and `@pxlkit/ui-kit-angular`. The components render the same markup and classes as the React kit and behave the same way — verified example by example against React, on mount, on the server and after scripted interactions.
- Built on `@pxlkit/ui-kit-core`: the same design tokens, Tailwind CSS v4 theme (`@import "@pxlkit/ui-kit-vue/styles.css"`), class recipes and DOM behaviour.
- Vue conventions for the React API: slots for `children` and element props, `v-model` / `v-model:open` / `v-model:checked` for controlled state, events for callbacks, `as-child` for `asChild`.
- Composables for the React kit's hooks: `useDarkMode`, `useLocalStorage`, `useMediaQuery`, `useReducedMotion`, `useFocusTrap`, `useScrollLock`, `useEscape`, `useClickOutside`, `useEventListener`, `useControllableState`, `usePxlKitSurface`, `useEffectiveSurface`, `usePxlKitLocale`.
- Server rendering and hydration without mismatches; overlays move into `document.body` after mounting and keep the focus a focus trap set. `useMediaQuery` and `useReducedMotion` start from their default value in a component that hydrates server-rendered markup and take the reader's value once mounted, so pages hydrate for readers who prefer reduced motion too; a component mounted in the browser starts from the reader's value. Those readers see server-rendered animations at rest from the first paint.
- `PixelHeroSection` `as` (`h1`–`h6`) and `PixelGlitch` `label` / `as`, as in React: the glitch headline is one heading with its text in the document once.
- The components written with `defineComponent` are marked `/* @__PURE__ */`, so webpack and esbuild drop the ones an application does not import (they do not read Vue's own `#__NO_SIDE_EFFECTS__`).
- `PixelForm` runs on VeeValidate, as React's runs on React Hook Form: `<PixelForm :form="useForm({ initialValues })" @submit>`, with `PixelFormField` (VeeValidate rules or a schema; `v-slot="{ field, fieldState }"`, and `v-bind="field"` on the control), `PixelFormItem`, `PixelFormLabel`, `PixelFormControl`, `PixelFormDescription` and `PixelFormMessage` in place of `PixelForm.Field` and the other parts. As in React, no field is validated before the first submit; after it, fields validate as they change, and a submit focuses the first invalid field.
- `PixelTable` takes `v-model:sort` and `v-model:selected-ids`; `PixelDataTable` takes TanStack `ColumnDef`s and `v-model:sorting`, `v-model:filtering`, `v-model:pagination`, `v-model:row-selection` and `v-model:column-visibility` — the kit re-exports `createColumnHelper` and the state types, so no direct TanStack import is needed. `PixelCarousel` hands over the Embla API with an `@api` event.
- The calendars' `renderDay` is the `#day` scoped slot (`#day="{ date }"`).
- As in React, `PixelDrawer` slides in from its side, a loading `PixelButton` holds still under the pointer, skeletons, indeterminate progress bars and loading spinners hold still for readers who prefer reduced motion from the server-rendered markup on, the pixel `PixelKbd` shows its depth as a thicker bottom edge, the linear `PixelProgress` fills its track with the tone's solid colour and `PixelAvatarGroup`'s "+N" is semibold like the initials.

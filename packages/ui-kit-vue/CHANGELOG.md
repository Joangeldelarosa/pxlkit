# Changelog — @pxlkit/ui-kit-vue

<!-- This file is hand-maintained — add an entry at the top for each release. -->

## 2.2.0 — unreleased

### Added

- Initial release: the Pxlkit UI kit for Vue 3, versioned in step with `@pxlkit/ui-kit` (React) and `@pxlkit/ui-kit-angular`. The components render the same markup and classes as the React kit and behave the same way — verified example by example against React, on mount, on the server and after scripted interactions.
- Built on `@pxlkit/ui-kit-core`: the same design tokens, Tailwind CSS v4 theme (`@import "@pxlkit/ui-kit-vue/styles.css"`), class recipes and DOM behaviour.
- Vue conventions for the React API: slots for `children` and element props, `v-model` / `v-model:open` / `v-model:checked` for controlled state, events for callbacks, `as-child` for `asChild`.
- Composables for the React kit's hooks: `useDarkMode`, `useLocalStorage`, `useMediaQuery`, `useReducedMotion`, `useFocusTrap`, `useScrollLock`, `useEscape`, `useClickOutside`, `useEventListener`, `useControllableState`, `usePxlKitSurface`, `useEffectiveSurface`, `usePxlKitLocale`.
- Server rendering and hydration without mismatches; overlays move into `document.body` after mounting and keep the focus a focus trap set.
- `PixelForm` runs on VeeValidate, as React's runs on React Hook Form: `<PixelForm :form="useForm({ initialValues })" @submit>`, with `PixelFormField` (VeeValidate rules or a schema; `v-slot="{ field, fieldState }"`, and `v-bind="field"` on the control), `PixelFormItem`, `PixelFormLabel`, `PixelFormControl`, `PixelFormDescription` and `PixelFormMessage` in place of `PixelForm.Field` and the other parts. As in React, no field is validated before the first submit; after it, fields validate as they change, and a submit focuses the first invalid field.
- `PixelTable` takes `v-model:sort` and `v-model:selected-ids`; `PixelDataTable` takes TanStack `ColumnDef`s and `v-model:sorting`, `v-model:filtering`, `v-model:pagination`, `v-model:row-selection` and `v-model:column-visibility` — the kit re-exports `createColumnHelper` and the state types, so no direct TanStack import is needed. `PixelCarousel` hands over the Embla API with an `@api` event.

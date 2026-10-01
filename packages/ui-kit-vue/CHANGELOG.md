# Changelog — @pxlkit/ui-kit-vue

<!-- This file is hand-maintained — add an entry at the top for each release. -->

## 2.2.0 — unreleased

### Added

- Initial release: the Pxlkit UI kit for Vue 3, versioned in step with `@pxlkit/ui-kit` (React) and `@pxlkit/ui-kit-angular`. The components render the same markup and classes as the React kit and behave the same way — verified example by example against React, on mount, on the server and after scripted interactions.
- Built on `@pxlkit/ui-kit-core`: the same design tokens, Tailwind CSS v4 theme (`@import "@pxlkit/ui-kit-vue/styles.css"`), class recipes and DOM behaviour.
- Vue conventions for the React API: slots for `children` and element props, `v-model` / `v-model:open` / `v-model:checked` for controlled state, events for callbacks, `as-child` for `asChild`.
- Composables for the React kit's hooks: `useDarkMode`, `useLocalStorage`, `useMediaQuery`, `useReducedMotion`, `useFocusTrap`, `useScrollLock`, `useEscape`, `useClickOutside`, `useEventListener`, `useControllableState`, `usePxlKitSurface`, `useEffectiveSurface`, `usePxlKitLocale`.
- Server rendering and hydration without mismatches; overlays move into `document.body` after mounting and keep the focus a focus trap set.

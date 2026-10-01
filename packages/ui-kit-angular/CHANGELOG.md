# Changelog — @pxlkit/ui-kit-angular

<!-- This file is hand-maintained — add an entry at the top for each release. -->

## 2.2.0 — unreleased

### Added

- Initial release: the Pxlkit UI kit for Angular 20–22, versioned in step with `@pxlkit/ui-kit` (React) and `@pxlkit/ui-kit-vue`. The components render the same markup and classes as the React kit and behave the same way — verified example by example against React, on mount, on the server and after scripted interactions.
- Built on `@pxlkit/ui-kit-core`: the same design tokens, Tailwind CSS v4 theme (`@import "@pxlkit/ui-kit-angular/styles.css"`), class recipes and DOM behaviour.
- Standalone, `OnPush`, signal-based components (`input()`, `model()`, `output()`) for zoneless and zone.js applications; native elements keep their semantics (`<button pxlButton>`); two-way bindings for controlled state; form controls implement `ControlValueAccessor` for `ngModel` and reactive forms.
- Injection functions for the React kit's hooks: `injectDarkMode`, `injectLocalStorage`, `injectMediaQuery`, `injectReducedMotion`, `injectFocusTrap`, `injectScrollLock`, `injectEscape`, `injectClickOutside`, `injectEventListener`, `injectPxlKitSurface`, `injectEffectiveSurface`, `injectPxlKitLocale`; `providePxlKitSurface` for an application-wide surface.
- Published in the Angular Package Format (partial compilation), with server rendering and hydration support.

<!-- GENERATED from @pxlkit/ui-kit v2.2.0 — do not edit; run npm run docs:build -->

# overlay-foundation

4 components. Import from `@pxlkit/ui-kit`.

### PixelPopover
- stable · since 1.8.0
- Controlled floating panel anchored to a trigger, with focus return, dismiss-on-escape, and outside-click handling.
- Controlled open state for predictable behaviour: `open` + `onOpenChange` (React), `v-model:open` (Vue), `[(open)]` (Angular) · Floating-UI placement with side, align, and sideOffset · closeOnEscape and closeOnOutsideClick dismissal · Portal-rendered content with surface-aware theming · Compound API: Trigger, Content, Arrow
- related: PixelTooltip, PixelDropdown, PixelModal

### PixelPortal
- stable · since 1.8.0
- SSR-safe portal primitive: renders children inline on the server and while hydrating, then portals them into document.body or a container, keeping the focus set inside them.
- SSR-safe: renders inline on the server and during hydration to avoid hydration mismatches · Focus set inside the content stays put as the content reaches its target · Targets document.body by default; the container prop picks another element · Can be disabled to keep its content inline (useful for testing or conditional portaling) · The content keeps its place in the component tree, so providers still reach it (in React, its events also bubble through that tree)

### PxlKitLocaleProvider
- stable · since 1.6.0
- Sets the locale for every nested PxlKit component: lang on a layout-neutral wrapper, locale-aware upper/lower helpers and the matching Google Fonts URL.
- Sets lang on a wrapper so CSS text-transform handles Turkish i → İ correctly · Builds Google Fonts URL with the correct subsets (latin-ext for Turkish) · Exposes locale-aware upper() and lower() helpers via usePxlKitLocale() (injectPxlKitLocale() in Angular) · Supports BCP 47 locales en and tr out of the box

### PxlKitSurfaceProvider
- stable · since 1.6.0
- Sets the default surface (pixel | linear) for every nested PxlKit component — React context, Vue provide/inject or Angular dependency injection.
- Switches the entire subtree between the pixel and linear aesthetics in one line · Per-component surface prop still overrides the provider for one-off variants · Defaults to "pixel" so consumers without a provider keep the brand look · Renders no element of its own and is safe for server rendering

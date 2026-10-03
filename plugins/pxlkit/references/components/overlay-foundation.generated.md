<!-- GENERATED from @pxlkit/ui-kit v2.2.0 — do not edit; run npm run docs:build -->

# overlay-foundation

4 components. Import from `@pxlkit/ui-kit`.

### PixelPopover
- stable · since 1.8.0
- Controlled floating panel anchored to a trigger, with focus return, dismiss-on-escape, and outside-click handling.
- Controlled open/onOpenChange API for predictable state · Floating-UI placement with side, align, and sideOffset · closeOnEscape and closeOnOutsideClick dismissal · Portal-rendered content with surface-aware theming · Compound API: Trigger, Content, Arrow
- related: PixelTooltip, PixelDropdown, PixelModal

### PixelPortal
- stable · since 1.8.0
- SSR-safe portal primitive: renders children inline on the server and while hydrating, then portals them into document.body or a container. Content mounted later on the client is portaled from its first render.
- SSR-safe: renders inline on the server and during hydration to avoid hydration mismatches · Content mounted after hydration is portaled from its first render, so focus set inside it stays put · Targets document.body by default; the container prop picks another element · Can be disabled to keep children inline (useful for testing or conditional portaling) · Preserves React tree context so focus, events, and providers flow normally

### PxlKitLocaleProvider
- stable · since 1.6.0
- Sets the locale for every nested PxlKit component: lang on a layout-neutral wrapper, locale-aware upper/lower helpers and the matching Google Fonts URL.
- Sets lang on a wrapper so CSS text-transform handles Turkish i → İ correctly · Builds Google Fonts URL with the correct subsets (latin-ext for Turkish) · Exposes locale-aware upper() and lower() helpers via usePxlKitLocale() · Supports BCP 47 locales en and tr out of the box

### PxlKitSurfaceProvider
- stable · since 1.6.0
- Sets the default surface (pixel | linear) for every nested PxlKit component — React context, Vue provide/inject or Angular dependency injection.
- Switches the entire subtree between the pixel and linear aesthetics in one line · Per-component surface prop still overrides the provider for one-off variants · Defaults to "pixel" so consumers without a provider keep the brand look · Renders no element of its own and is safe for server rendering

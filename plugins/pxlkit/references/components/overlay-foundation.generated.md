<!-- GENERATED from @pxlkit/ui-kit v2.1.1 — do not edit; run npm run docs:build -->

# overlay-foundation

4 components. Import from `@pxlkit/ui-kit`.

### PixelPopover
- stable · since 1.8.0
- Controlled floating panel anchored to a trigger, with focus return, dismiss-on-escape, and outside-click handling.
- Controlled open/onOpenChange API for predictable state · Floating-UI placement with side, align, and sideOffset · closeOnEscape and closeOnOutsideClick dismissal · Portal-rendered content with surface-aware theming · Compound API: Trigger, Content, Arrow
- related: PixelTooltip, PixelDropdown, PixelModal

### PixelPortal
- stable · since 1.8.0
- SSR-safe portal primitive that renders children inline during SSR and first hydration, then swaps to a real createPortal after mount.
- SSR-safe: renders inline on the server and on first client paint to avoid hydration mismatches · Swaps to React.createPortal after mount, targeting document.body by default · Accepts a custom container element via the container prop · Can be disabled to keep children inline (useful for testing or conditional portaling) · Preserves React tree context so focus, events, and providers flow normally

### PxlKitLocaleProvider
- stable · since 1.6.0
- Provides locale-aware font loading and text utilities (upper/lower) to all PxlKit components via context.
- Sets lang on a wrapper so CSS text-transform handles Turkish i → İ correctly · Builds Google Fonts URL with the correct subsets (latin-ext for Turkish) · Exposes locale-aware upper() and lower() helpers via usePxlKitLocale() · Supports BCP 47 locales en and tr out of the box

### PxlKitSurfaceProvider
- stable · since 1.6.0
- Sets the default surface (pixel | linear) for every nested PxlKit component via React context.
- Switches the entire subtree between the pixel and linear aesthetics in one line · Per-component surface prop still overrides the provider for one-off variants · Defaults to "pixel" so consumers without a provider keep the brand look · SSR-safe context provider with zero runtime cost when value is unchanged

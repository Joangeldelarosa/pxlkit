<!-- GENERATED from @pxlkit/ui-kit v2.2.0 — do not edit; run npm run docs:build -->

# actions

4 components. Import from `@pxlkit/ui-kit`.

### PixelBareButton
- stable · since 1.0.0
- Unstyled passthrough `<button>` primitive — escape hatch for composing custom buttons without inheriting pixel-kit visuals.
- Zero styling — renders a raw <button> with all native attributes forwarded · Defaults type="button" to prevent accidental form submissions · Its element is the native <button> itself, for focus and measurement: a ref in React, `$el` in Vue, the `button[pxlBareButton]` element in Angular · Ideal for icon triggers, custom-styled CTAs, or wrapping inside compound components · Tree-shakable and SSR-safe
- related: PixelButton, PixelBareInput, PixelBareTextarea

### PixelButton
- stable · since 1.0.0
- Versatile button primitive with tone, size, variant, surface, icon slots, loading state, and a link form for anchors and router links (`asChild` in React and Vue, `a[pxlButton]` in Angular).
- Four variants — solid, soft, outline, ghost — across seven tones · Loading state pins the rendered width to prevent collapse when text swaps to spinner · Styles a link or router link as the button: `asChild` in React and Vue, `<a pxlButton>` in Angular · Pixel and linear surfaces inherit from PxlKitSurfaceProvider · Accepts every native <button> attribute
- related: PixelIconButton, PxlKitButton, PixelSplitButton, PixelBareButton

### PixelSplitButton
- stable · since 1.0.0
- Composite button pairing a primary action with a chevron-triggered dropdown menu for related secondary actions.
- Primary click handler plus a menu of alternate actions in a single control · Inherits tone + surface theming from the design system · Its menu closes on an outside press, Escape or Tab · aria-haspopup="menu" + aria-expanded on the chevron trigger
- related: PixelButton, PixelDropdown, PixelIconButton

### PxlKitButton
- deprecated · since 1.0.0
- Deprecated alias for PixelIconButton — a square icon-only button with a required accessible label.
- Identical runtime to PixelIconButton (re-exported as-is). · Renders a square, icon-only button with required `label` exposed as aria-label and title. · Supports tones, sizes, and pixel/linear surface aesthetics. · Kept as an alias for backward compatibility; removal carried forward to v3.0.0 (see ADR-0004).
- related: PixelIconButton, PixelButton, PixelSplitButton

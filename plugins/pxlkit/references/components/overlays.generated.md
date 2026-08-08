<!-- GENERATED from @pxlkit/ui-kit v2.1.1 — do not edit; run npm run docs:build -->

# overlays

7 components. Import from `@pxlkit/ui-kit`.

### PixelAlertDialog
- stable · since 1.8.0
- Modal confirmation dialog for destructive or irreversible actions, with async-aware action handling and Cancel-focused defaults.
- role="alertdialog" + aria-modal with initial focus pinned to Cancel for safer destructive flows · Async onAction with pending state, spinner, and stays open on rejection when onError is provided · Destructive tone variant switches the action accent to red · Surface-aware styling via useEffectiveSurface (pixel chrome vs. modern) · Scroll lock, focus trap, and Escape-to-close baked in
- related: PixelDialog, PixelPortal

### PixelCommand
- stable · since 1.8.0
- Command palette overlay with fuzzy search, grouped items, keyboard shortcut binding, focus trap, scroll lock and Escape-to-close.
- Configurable global shortcut (default mod+k) toggles the palette open from anywhere · Grouped items with headings, icons, keywords for search, and per-item keyboard hints · Full keyboard navigation: ArrowUp/Down, Home/End, Enter to select, Escape to close · Surface-aware chrome (pixel vs linear) inherited from theme context · Combobox + listbox a11y pattern with aria-activedescendant for assistive tech
- related: PixelDropdown, PixelModal, PixelPopover

### PixelDrawer
- stable · since 1.8.0
- Side-anchored modal panel (right/left/top/bottom) with focus trap, scroll lock and Escape-to-close.
- Four anchor sides (right/left/top/bottom) and five sizes (sm/md/lg/xl/full) · Focus trap, scroll lock and Escape-to-close out of the box · WCAG 4.1.2 compliant: requires `title` or `aria-label` for accessible name · Surface-aware borders inherited from theme context · Composable subparts: PixelDrawer.Header / Body / Footer
- related: PixelModal, PixelPortal, PixelSheet

### PixelDropdown
- stable · since 1.0.0
- Button-triggered menu of actions with keyboard navigation, typeahead, and a compositional API for advanced layouts.
- Dual API: declarative `items[]` sugar and compositional `Root/Trigger/Content/Item` parts. · Item kinds: item, separator, header, checkbox, radio, submenu (chevron affordance). · Full keyboard support: arrow navigation, Home/End, Enter/Space activation, printable-key typeahead. · Tones + destructive styling, optional shortcut kbd badges, and disabled rows skipped by focus. · Pixel and linear surfaces honored across trigger, menu, separators, and shortcut chips.
- related: PixelSelect, PixelMenubar, PixelNavigationMenu, PixelTooltip

### PixelModal
- stable · since 1.0.0
- Centered modal dialog with title bar, optional description and footer, surface-aware chrome, focus trap, scroll lock, and async close support.
- Five sizes (sm/md/lg/xl/full) with surface-aware chrome — pixel renders an old-school window, linear a flat card · Focus trap, scroll lock, and Escape-to-close come built in via shared hooks · Optional description wired via aria-describedby and optional footer slot for actions · asyncClose awaits a promise (with loading affordance on the close button) before unmounting · Portals to document.body by default; accepts a custom container override
- related: PixelDrawer, PixelAlertDialog, PixelSheet, PixelPopover

### PixelSheet
- stable · since 1.8.0
- Mobile-first bottom/top sheet with focus trap, scroll lock, Escape-to-close and optional drag handle.
- Bottom or top anchored, four sizes (sm/md/lg/full) · Focus trap, scroll lock and Escape-to-close out of the box · Optional drag handle affordance for touch dismissal · WCAG 4.1.2 compliant: requires `title` or `aria-label` for accessible name · Surface-aware borders inherited from theme context
- related: PixelDrawer, PixelModal, PixelPortal

### PixelTooltip
- stable · since 1.0.0
- Floating-UI-positioned tooltip that anchors a portal-rendered hint to a trigger, with hover/focus/click activation, controlled or uncontrolled open state, and configurable open/close delays.
- Auto-flip and shift via floating-ui — stays inside the viewport across all four positions. · Three trigger modes (hover, focus, click) — click variant accepts pointer events and dismisses on outside click or Escape. · Portal-rendered so it escapes overflow/transform ancestors without z-index gymnastics. · Controlled (`open` + `onOpenChange`) or uncontrolled (`defaultOpen`) — uses useControllableState internally. · Surface-aware (pixel/linear) and inherits from PxlKitSurfaceProvider when no surface prop is passed.
- related: PixelPopover, PixelDropdown

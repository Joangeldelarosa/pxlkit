<!-- GENERATED from @pxlkit/ui-kit v2.1.1 — do not edit; run npm run docs:build -->

# forms

24 components. Import from `@pxlkit/ui-kit`.

### PixelBareInput
- stable · since 1.0.0
- Unstyled, forwardRef-enabled `<input>` primitive used as an escape hatch for fully custom field compositions.
- Native `<input>` semantics — accepts every `InputHTMLAttributes` prop verbatim. · forwardRef passthrough exposes the underlying `HTMLInputElement` for measurement, focus, or imperative APIs. · Zero styling — pair with parent surfaces (PixelInputGroup, PixelFieldset) when building bespoke field widgets. · SSR-safe and tree-shakable — no client effects or runtime dependencies.
- related: PixelInput, PixelBareTextarea, PixelBareButton

### PixelBareTextarea
- stable · since 1.0.0
- Unstyled escape-hatch <textarea> passthrough for building custom multi-line inputs without the opinionated PixelTextarea chrome.
- Zero styling — pure passthrough to the native <textarea> element · Forwards every standard TextareaHTMLAttributes prop (value, rows, maxLength, etc.) · forwardRef-friendly: refs land on the underlying HTMLTextAreaElement · SSR-safe and tree-shakable; no runtime state or context · Ideal for composing bespoke field chrome while keeping native form semantics
- related: PixelTextarea, PixelBareInput, PixelBareButton

### PixelCalendarGrid
- stable · since 1.9.0
- Standalone month grid for date selection — usable inline or composed inside date pickers and range pickers.
- Controlled or uncontrolled month navigation via month / onMonthChange · Min/max date bounds plus custom disabledDates (array or predicate) · Optional rangePreview prop highlights start/end + in-range cells · Full keyboard nav: Arrows, Home/End, PageUp/PageDown, Enter/Space · Surface-aware via useEffectiveSurface — inherits container theme
- related: PixelDatePicker, PixelDateRangePicker

### PixelCheckbox
- stable · since 1.0.0
- Controlled boolean checkbox with a chunky pixel check mark, tone-aware fill, and optional form serialization.
- Fully controlled via checked + onChange(next: boolean) · Seven tones via the shared toneMap palette · Pixel and linear surface variants share the same API · Hidden mirror input lets it participate in native <form> submissions when name is set · Renders as role="checkbox" with aria-checked, aria-disabled, and aria-required
- related: PixelRadioGroup, PixelSwitch, PixelToggle

### PixelColorInput
- stable · since 1.9.0
- Color picker field with a hex text input, native color swatch, and a keyboard-navigable preset grid inside a popover.
- Outputs hex, rgb(), or hsl() depending on the format prop · Popover with native color input, hex draft field, and preset swatch grid · Roving tabindex with 2-D arrow key navigation across presets · Surface-aware styling for pixel and modern variants · Controlled or uncontrolled via value / defaultValue
- related: PixelInput, PixelPopover, FieldShell

### PixelCombobox
- stable · since 1.8.0
- Searchable single-value combobox built on a button trigger + listbox popover with type-to-filter, optional grouping, and full keyboard navigation.
- WAI-ARIA combobox pattern — `role="combobox"` trigger paired with a `role="listbox"` popup and `aria-activedescendant` for highlight tracking. · Type-to-filter search input is opt-out (`searchable={false}`) for short lists where filtering adds friction. · Optional `group` field on options renders sticky group headings in the listbox without breaking keyboard navigation. · Controlled or uncontrolled — `value` + `onChange` or `defaultValue`; integrates with native forms via hidden `name` input. · Tone-free surface theming (pixel/linear) and shared size scale (sm/md/lg) match the rest of the input family.
- related: PixelSelect, PixelMultiSelect, PixelDropdown

### PixelDatePicker
- stable · since 1.8.0
- Accessible date input with popover calendar grid, keyboard navigation, presets, and min/max constraints.
- Controlled and uncontrolled usage via value/defaultValue + onChange · Popover calendar with roving tabindex and full keyboard navigation · Min/max bounds plus disabledDates (array or predicate) · Optional quick-select presets and clearable trigger · Surface-aware styling with FieldShell label/hint/error wiring
- related: PixelInput, PixelPopover, PixelSelect

### PixelDateRangePicker
- stable · since 1.9.0
- Accessible date range picker with one or two-month grid, hover preview, presets, and min/max constraints.
- Controlled and uncontrolled usage via value/defaultValue + onChange · One or two-month calendar with hover preview while picking · Auto-swap of from/to when the second pick precedes the first · Optional quick-select presets and clearable trigger · Surface-aware styling with FieldShell label/hint/error wiring
- related: PixelDatePicker, PixelCalendarGrid, PixelPopover

### PixelFileUpload
- stable · since 1.8.0
- Dropzone + click-to-browse file uploader with accept/size/count validation, image thumbnails, and per-item removal.
- Drag-and-drop or click/keyboard to open the native file picker · Validates against accept, maxSize, and maxFiles with onReject callback · Image previews via object URLs with automatic revoke on unmount · Controlled or uncontrolled file list via useControllableState · Surface-aware styling with size, label, hint, and error props
- related: PixelInput, PixelTextarea, PixelForm

### PixelForm
- stable · since 1.8.0
- shadcn-style compound wrapper around react-hook-form: Root / Field / Item / Label / Control / Description / Message auto-wire ids and aria-* across each field.
- Compound API (`PixelForm.Root` + `.Field` + `.Item` + `.Label` + `.Control` + `.Description` + `.Message`) for composable forms. · Auto-generates linked ids and wires `aria-describedby` + `aria-invalid` on the controlled field. · Uses `react-hook-form` `Controller` under the hood — works with any input that accepts `value`/`onChange`/`ref`. · `Message` auto-renders the field error when present; falls back to children otherwise. · Surface-aware: `surface` prop on Root/Label/Description/Message follows kit-wide design tokens.
- related: PixelInput, PixelTextarea, PixelSelect, PixelCheckbox, PixelRadioGroup

### PixelInput
- stable · since 1.0.0
- Single-line text input with label, hint, error message, tone/size/surface variants, prefix/suffix slots, joinable addons, clearable button, char counter, and loading state.
- Controlled or uncontrolled — works with `value`/`onChange` or `defaultValue`. · Inside-shell `prefix`/`suffix` slots plus outside-shell `addonLeft`/`addonRight` for joined groups. · Optional `clearable` × button, `loading` spinner, and `showCount` character counter. · `tone`, `size`, and `surface` follow the kit-wide design tokens. · Accessible: pairs `aria-invalid` + `aria-describedby` with hint/error text.
- related: PixelPasswordInput, PixelTextarea, PixelBareInput, PixelInputGroup, PixelNumberInput

### PixelInputGroup
- stable · since 1.9.0
- Visually joins multiple form controls into a single shell — strips inner borders/radii from children and adds segment dividers, so combos like country-code + phone read as one field.
- Composes any form children (input, button, select) into a single joined shell. · `size` and `surface` props inherit the kit-wide design tokens. · Accessible: applies `role="group"` only when an `aria-label`/`aria-labelledby` is provided. · Dev-mode warning when a multi-child group is missing an accessible name. · Preserves child `className` (consumer styles win over the join overrides).
- related: PixelInput, PixelBareInput, PixelSelect, PixelButton

### PixelMultiSelect
- stable · since 1.8.0
- Multi-select combobox with chip-based selected values, optional search, and max-selection cap.
- Combobox + listbox with aria-multiselectable · Chip rendering for selected values with keyboard removal (Backspace) · Optional searchable filter and clearable affordance · Max-selection cap with live count footer · Surface-aware (flat/linear) field shell with hint/error states
- related: PixelSelect, PixelCombobox, PixelTagInput

### PixelNumberInput
- stable · since 1.8.0
- Numeric input with spin controls, clamp behaviors, precision, prefix/suffix, and thousands-separator formatting.
- Spinbutton with ArrowUp/ArrowDown step bumps and clickable increment/decrement controls · Configurable clamp behavior (strict, on-blur, or none) with min/max bounds · Precision rounding avoids floating-point artifacts (e.g. 0.1 + 0.2) · Optional prefix, suffix, and thousands-separator with parse-aware display · Surface/tone aware, controlled or uncontrolled via useControllableState
- related: PixelInput, PixelSlider

### PixelOTPInput
- stable · since 1.8.0
- One-time passcode input with auto-advance, paste-fill, and per-cell keyboard navigation.
- Configurable length and numeric or alphanumeric input mode · Auto-advance on entry and backspace-to-previous behavior · Paste support distributes characters across cells · Optional mask mode and custom separator between cells · Controlled or uncontrolled via value / defaultValue
- related: PixelInput, PixelPasswordInput

### PixelPasswordInput
- stable · since 1.0.0
- Password text field with an inline show/hide toggle that swaps the input type between password and text.
- Inline visibility toggle with localizable labels via toggleLabels · Label, hint, and error slots wired through the shared FieldShell · Tone, size, and surface variants matched to PixelInput · Forwarded ref to the underlying <input> for form-library integration · Toggle button reflects state via aria-pressed for assistive tech
- related: PixelInput, PixelOTPInput

### PixelRadioGroup
- stable · since 1.0.0
- Single-select grouped radios with a pixel dot indicator, fieldset/legend semantics, and tone + surface variants.
- Controlled via value + onChange(next: string) over a list of options. · Renders as a real <fieldset> with role="radiogroup" and a <legend> from label. · Seven tones and pixel/linear surfaces share the kit-wide design tokens. · Optional name emits a hidden input so it serializes inside native forms. · disabled cascades to every option button (not just visually).
- related: PixelCheckbox, PixelSegmented, PixelToggleGroup

### PixelSegmented
- stable · since 1.0.0
- Single-select segmented control for toggling between a small set of mutually exclusive options inline.
- Controlled via value + onChange(next: string) over a list of options. · Compact horizontal layout for 2-5 options that share visual real estate. · Seven tones and pixel/linear surfaces share the kit-wide design tokens. · Optional name emits a hidden input so it serializes inside native forms. · disabled cascades to every option button (not just visually).
- related: PixelRadioGroup, PixelToggleGroup, PixelTabs

### PixelSelect
- stable · since 1.0.0
- Custom single-value dropdown built on a button + listbox (no native `<select>`) with full keyboard navigation and tone/size/surface theming.
- WAI-ARIA combobox + listbox semantics — `aria-expanded`, `aria-haspopup`, `aria-selected` wired to the trigger and options. · Full keyboard support: ArrowUp/Down, Home/End, Enter/Space to select, Escape to close, Tab to dismiss. · Controlled or uncontrolled — `value` + `onChange` or `defaultValue`; emits the selected option value as a string. · Form-friendly — hidden mirror input lets the value participate in native `<form>` submissions via `name`. · Tone, size, and surface (pixel/linear) variants share the same primitives as the rest of the input family.
- related: PixelCombobox, PixelMultiSelect, PixelDropdown

### PixelSlider
- stable · since 1.0.0
- Controlled single- or range-thumb slider with optional marks, tick grid, and per-thumb tooltips.
- Single (value: number) and range (value: [number, number]) modes share one component · Seven tones via the shared toneMap palette; pixel and linear surfaces · Optional labeled marks and step-aligned tick grid under the track · Per-thumb tooltips with always / drag / never visibility modes · Full keyboard support: arrows, Home, End, PageUp, PageDown
- related: PixelNumberInput, PixelProgress

### PixelSwitch
- stable · since 1.0.0
- Two-state toggle switch with a sliding pixel thumb — flips a boolean setting on or off.
- Controlled boolean via `checked` + `onChange(next)`. · Tone and surface follow the kit-wide tokens (`pixel` keeps square corners, `linear` rounds the track). · Optional `name`/`value`/`required` mirror the state into a hidden input for native form submission. · Accessible: renders as `role="switch"` with `aria-checked`, `aria-disabled`, and `aria-required`. · SSR-safe and tree-shakable; no portals or browser-only APIs.
- related: PixelCheckbox, PixelToggle

### PixelTextarea
- stable · since 1.0.0
- Multi-line text input with label, hint, error chrome plus optional auto-grow and character counter.
- Label / hint / error chrome via FieldShell — same DX as PixelInput · Optional autosize between minRows and maxRows, scrolling beyond the cap · Character counter (showCount) — total or N/max with overflow styling · Full tone + surface (pixel/linear) theming aligned with the rest of forms · Controlled and uncontrolled value patterns, ref forwards to <textarea>
- related: PixelInput, PixelBareTextarea

### PixelToggle
- stable · since 1.9.0
- Two-state toggle button with aria-pressed semantics. Works standalone or as a child of PixelToggleGroup for single/multi-select toolbars.
- Standalone controlled (pressed + onPressedChange) or composed inside PixelToggleGroup · Inherits size, variant, and surface from a parent PixelToggleGroup context · Cyan tone pressed state with surface-aware borders, radius, and transitions · Renders as role="radio" with aria-checked inside a single-select group, aria-pressed otherwise · Forwards refs and registers with the group for roving-tabindex keyboard navigation
- related: PixelToggleGroup, PixelSwitch, PixelCheckbox

### PixelToggleGroup
- stable · since 1.9.0
- Grouped pressable toggles with single- or multi-select semantics, roving focus, and surface-aware styling.
- Discriminated union API: type="single" → string value, type="multiple" → string[] value · Optional roving tabindex with arrow-key navigation and Home/End support · Single mode exposes radiogroup/radio semantics; multi mode uses aria-pressed buttons · Surface-aware (pixel/linear) and supports soft, solid, outline, and ghost variants
- related: PixelToggle, PixelSegmentedControl, PixelCheckbox

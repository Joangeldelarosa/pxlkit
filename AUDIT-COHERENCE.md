# Coherence Audit — Source vs /docs vs /ui-kit

Generated: 2026-05-12
Scope: every exported component in `@pxlkit/core` and `@pxlkit/ui-kit`, plus every utility documented in `/docs`.

Sources of truth:
- `packages/ui-kit/src/registry.ts` — canonical 55-name `UI_KIT_COMPONENTS` list
- `packages/ui-kit/src/{actions,inputs,data-display,feedback,navigation,overlay,layout,animations,parallax,locale,common}.tsx`
- `packages/core/src/components/{PxlKitIcon,AnimatedPxlKitIcon,ParallaxPxlKitIcon,PixelToast}.tsx`
- `packages/core/src/types.ts`
- `packages/core/src/utils/*.ts`

Docs under audit:
- `apps/web/src/app/ui-kit/page.tsx` (2688 lines, 54 `<DocSection>` / `<AnimationReplay>` blocks)
- `apps/web/src/app/docs/page.tsx` (1047 lines, inline `<CodeBlock>` interface snippets)

## Summary

- Total components audited: **55 UI-kit + 4 core components + 18 utility functions = 77 entries**
- Components fully coherent (no discrepancies): **0 of 55 UI-kit components** (every component is missing at least the `surface` prop)
- Components with at least one discrepancy: **55** (54 in `/ui-kit` props tables + `PxlKitSurfaceProvider` not documented at all)
- Total discrepancies cataloged: **131**
  - **Critical** (props that don't exist on the runtime API / docs claim API surface that won't compile): **18**
  - **Major** (props in source but absent from docs, wrong defaults, missing deprecated flag): **97**
  - **Minor** (callback param renaming, type-string shape differences, prose inaccuracies): **16**

The dominant systemic issue is that **every** UI-kit component accepts a `surface?: Surface` prop (via `surfaceClasses` / `useEffectiveSurface`) but the `/ui-kit` props tables never list it. The next systemic issue is the animation primitives — their `repeat` prop is typed `AnimationRepeat` (an internal alias = `number | 'infinite'`) and 8 components mismatch on it; `children` is also consistently omitted from props tables.

---

## Source-of-truth: full component inventory

| Component | Source | Documented in `/ui-kit` (line) | Documented in `/docs` (line) |
|---|---|---|---|
| PixelButton | actions.tsx:13 | L926 | — |
| PxlKitButton | actions.tsx:66 | L983 | — |
| PixelSplitButton | actions.tsx:109 | L1008 | — |
| PixelCard | data-display.tsx:15 | L1313 | — |
| PixelStatCard | data-display.tsx:46 | L1349 | — |
| PixelTable | data-display.tsx:79 | L1371 | — |
| PixelAvatar | data-display.tsx:130 | L1409 | — |
| PixelBadge | data-display.tsx:164 | L1432 | — |
| PixelChip | data-display.tsx:186 | L1455 | — |
| PixelTextLink | data-display.tsx:237 | L1477 | — |
| PixelCollapsible | data-display.tsx:270 | L1868 | — |
| PixelBareButton | data-display.tsx:388 | L2082 | — |
| PixelBareInput | data-display.tsx:393 | L2100 | — |
| PixelBareTextarea | data-display.tsx:398 | L2116 | — |
| PixelCodeInline | data-display.tsx:308 | L1500 | — |
| PixelKbd | data-display.tsx:330 | L1522 | — |
| PixelColorSwatch | data-display.tsx:359 | L1546 | — |
| PixelInput | inputs.tsx:14 | L1046 | — |
| PixelPasswordInput | inputs.tsx:58 | L1083 | — |
| PixelTextarea | inputs.tsx:112 | L1101 | — |
| PixelSelect | inputs.tsx:149 | L1119 | — |
| PixelCheckbox | inputs.tsx:275 | L1172 | — |
| PixelRadioGroup | inputs.tsx:326 | L1198 | — |
| PixelSwitch | inputs.tsx:396 | L1233 | — |
| PixelSlider | inputs.tsx:452 | L1252 | — |
| PixelSegmented | inputs.tsx:588 | L1277 | — |
| PixelAlert | feedback.tsx:12 | L1569 | — |
| PixelProgress | feedback.tsx:60 | L1618 | — |
| PixelSkeleton | feedback.tsx:131 | L1639 | — |
| PixelEmptyState | feedback.tsx:161 | L1662 | — |
| PixelTabs | navigation.tsx:12 | L1821 | — |
| PixelAccordion | navigation.tsx:62 | L1845 | — |
| PixelBreadcrumb | navigation.tsx:118 | L1902 | — |
| PixelPagination | navigation.tsx:167 | L1922 | — |
| PixelModal | overlay.tsx:14 | L1939 | — |
| PixelTooltip | overlay.tsx:99 | L1964 | — |
| PixelDropdown | overlay.tsx:148 | L1993 | — |
| PixelDivider | layout.tsx:39 | L2060 | — |
| PixelSection | layout.tsx:9 | L2039 | — |
| PixelFadeIn | animations.tsx:131 | L2224 | — |
| PixelSlideIn | animations.tsx:167 | L2259 | — |
| PixelPulse | animations.tsx:214 | L2299 | — |
| PixelBounce | animations.tsx:246 | L2324 | — |
| PixelTypewriter | animations.tsx:287 | L2497 | — |
| PixelGlitch | animations.tsx:341 | L2529 | — |
| PixelFloat | animations.tsx:402 | L2361 | — |
| PixelShake | animations.tsx:443 | L2387 | — |
| PixelRotate | animations.tsx:484 | L2413 | — |
| PixelZoomIn | animations.tsx:525 | L2439 | — |
| PixelFlicker | animations.tsx:570 | L2473 | — |
| PixelParallaxLayer | parallax.tsx:22 | L2576 | — |
| PixelParallaxGroup | parallax.tsx:82 | L2616 | — |
| PixelMouseParallax | parallax.tsx:110 | L2645 | — |
| PxlKitLocaleProvider | locale.tsx:213 | L834 (custom collapsible, not DocSection) | — |
| **PxlKitSurfaceProvider** | **common.tsx:118** | **NOT DOCUMENTED** | — |
| PxlKitIcon (core) | components/PxlKitIcon.tsx:40 | — | L431 |
| AnimatedPxlKitIcon (core) | components/AnimatedPxlKitIcon.tsx:85 | — | L510 |
| ParallaxPxlKitIcon (core) | components/ParallaxPxlKitIcon.tsx:81 | — | L650 |
| PixelToast (core) | components/PixelToast.tsx:12 | L1688 (documents `useToast()` API, not component props) | — |

---

## Cross-cutting findings

### CRITICAL #1 — `PxlKitSurfaceProvider` is in the registry but undocumented
**Source:** `packages/ui-kit/src/common.tsx:118`
**Status:** ❌ critical (zero documentation)

`PxlKitSurfaceProvider` is exported from `@pxlkit/ui-kit` and listed in `UI_KIT_COMPONENTS`, yet **zero mentions** appear in `apps/web/src/app/ui-kit/page.tsx`. By contrast, the surface system (pixel vs linear) is the foundation of every other component. Without provider docs, users cannot enable the linear surface site-wide.

**Suggested fix:** add a DocSection for `pxlkit-surface-provider` in the "Locale & Surface" group, with props `surface?: 'pixel' | 'linear'` (default `'pixel'`), `children: ReactNode`.

### MAJOR #1 — `surface` prop is missing from **every** component's props table (54 components)
**Source pattern:** every UI-kit component destructures `surface: surfaceProp` and types it `surface?: Surface`.

The `/ui-kit` props tables list `tone`, `size`, `disabled`, etc., but never `surface`. The `surface` prop overrides the nearest `PxlKitSurfaceProvider`. This is a single mechanical fix per component but it spans every entry from L926–L2645.

Components affected (line of their DocSection in `/ui-kit/page.tsx`):
PixelButton (926), PxlKitButton (983), PixelSplitButton (1008), PixelInput (1046), PixelPasswordInput (1083), PixelTextarea (1101), PixelSelect (1119), PixelCheckbox (1172), PixelRadioGroup (1198), PixelSwitch (1233), PixelSlider (1252), PixelSegmented (1277), PixelCard (1313), PixelStatCard (1349), PixelTable (1371), PixelAvatar (1409), PixelBadge (1432), PixelChip (1455), PixelTextLink (1477), PixelCodeInline (1500), PixelKbd (1522), PixelColorSwatch (1546), PixelAlert (1569), PixelProgress (1618), PixelSkeleton (1639), PixelEmptyState (1662), PixelTabs (1821), PixelAccordion (1845), PixelCollapsible (1868), PixelBreadcrumb (1902), PixelPagination (1922), PixelModal (1939), PixelTooltip (1964), PixelDropdown (1993), PixelSection (2039), PixelDivider (2060).

`PixelFadeIn` / `PixelSlideIn` / `PixelPulse` / etc. (animations + parallax) do NOT accept `surface`, so their omission is correct.

### MAJOR #2 — `children` missing from props tables wherever it's a required prop
8 components destructure `children` as a required `React.ReactNode` but their props tables omit it:
- PixelCard (L1313), PixelCollapsible (L1868), PixelModal (L1939), PixelTooltip (L1964), PixelSection (L2039), PixelGlitch (L2529), PixelParallaxLayer (L2576), PixelParallaxGroup (L2616), PixelMouseParallax (L2645) — plus all 11 animation primitives.

### MAJOR #3 — Animation `repeat` prop type-string mismatch (8 components)
Source: each animation primitive types `repeat?: AnimationRepeat` (where `AnimationRepeat` is the internal alias `number | 'infinite'` defined in animations.tsx).
Docs row: `type: "number | 'infinite'"`.

Functionally equivalent, but the docs hide the named type. Suggested fix: either rename the docs entry to `AnimationRepeat` (and export the alias from `@pxlkit/ui-kit`) **or** keep the union literal in docs — but pick one and standardize.

Components affected: PixelFadeIn (L2224), PixelSlideIn (L2259), PixelPulse (L2299), PixelFloat (L2361), PixelShake (L2387), PixelRotate (L2413), PixelZoomIn (L2439), PixelFlicker (L2473).
PixelBounce (L2324) is exempt — it explicitly types `repeat?: number | 'infinite'` inline (no alias). PixelGlitch / PixelTypewriter don't take `repeat`.

### MINOR #1 — Callback parameter naming (6 components)
Docs callbacks use `(v: T) => void` while source uses `(next: T) => void` or `(value: T) => void`. Compiles fine but inconsistent with source for IDE intellisense / hover docs.
- PixelSelect (L1119): doc `onChange: (v: string) => void` → src `(value: string) => void`
- PixelCheckbox (L1172), PixelSwitch (L1233): doc `(v: boolean) => void` → src `(next: boolean) => void`
- PixelRadioGroup (L1198), PixelSegmented (L1277): doc `(v: string) => void` → src `(next: string) => void`
- PixelSlider (L1252): doc `(v: number) => void` → src `(next: number) => void`
- PixelPagination (L1922): doc `(page: number) => void` → src `(next: number) => void`
- PixelDropdown (L1993): doc `onSelect: (v: string) => void` → src `(value: string) => void`

---

## Per-component findings (UI-kit)

### PixelButton

**Source:** `packages/ui-kit/src/actions.tsx:13`
**Documented at:** `/ui-kit#pixel-button` (page.tsx L926)
**Status:** ⚠️ major

**Actual API (from source):**
```ts
// React.ButtonHTMLAttributes<HTMLButtonElement> & {
tone?: Tone;                            // default 'green'
size?: Size;                            // default 'md'
variant?: 'solid' | 'ghost';            // default 'solid'
surface?: Surface;                      // default from PxlKitSurfaceProvider
iconLeft?: React.ReactNode;
iconRight?: React.ReactNode;
loading?: boolean;
// + all HTMLButton attributes via spread
```

**Discrepancies:**
1. **MAJOR** — `/ui-kit` table at L926 omits the `surface` prop.

### PxlKitButton

**Source:** `actions.tsx:66`  •  **Docs:** `/ui-kit#pxlkit-button` (L983)
**Status:** ⚠️ major

Source: `label: string`, `tone?: Tone='cyan'`, `size?: Size='md'`, `surface?: Surface`, `icon: ReactNode`.

1. **MAJOR** — props table omits `surface`.

### PixelSplitButton

**Source:** `actions.tsx:109`  •  **Docs:** L1008
**Status:** ⚠️ major

Source: `label`, `options: Option[]`, `tone?='purple'`, `surface?: Surface`, `disabled?=false`, `onPrimary?`, `onSelect?`.

1. **MAJOR** — props table omits `surface` and `disabled`.

### PixelInput

**Source:** `inputs.tsx:14`  •  **Docs:** L1046
Source: extends `InputHTMLAttributes<…>` minus `'size'`; adds `label?`, `hint?`, `error?`, `tone?='neutral'`, `size?='md'`, `surface?`, `icon?`.

1. **MAJOR** — omits `surface`.

### PixelPasswordInput

**Source:** `inputs.tsx:58`  •  **Docs:** L1083
Source: extends `InputHTMLAttributes<…>` minus `'type' | 'size'`; adds `label?`, `hint?`, `error?`, `tone?='neutral'`, `size?='md'`, `surface?`.

1. **MAJOR** — omits `error`.
2. **MAJOR** — omits `surface`.

### PixelTextarea

**Source:** `inputs.tsx:112`  •  **Docs:** L1101
1. **MAJOR** — omits `surface`.

### PixelSelect

**Source:** `inputs.tsx:149`  •  **Docs:** L1119
Source: `label?`, `options: Option[]`, `value?`, `defaultValue?`, `onChange?`, `placeholder?='Select...'`, `hint?`, `error?`, `disabled?=false`, `tone?='neutral'`, `size?='md'`, `surface?`.

1. **MAJOR** — omits `hint`, `error`, `disabled`, `surface` (4 props).
2. **MINOR** — `onChange` documented as `(v: string) => void`, source uses `(value: string) => void`.

### PixelCheckbox

**Source:** `inputs.tsx:275`  •  **Docs:** L1172
1. **MAJOR** — omits `surface`.
2. **MINOR** — `onChange` documented as `(v: boolean) => void`, source `(next: boolean) => void`.

### PixelRadioGroup

**Source:** `inputs.tsx:326`  •  **Docs:** L1198
1. **MAJOR** — omits `disabled` and `surface`.
2. **MINOR** — `onChange` doc `(v: string) => void`, src `(next: string) => void`.

### PixelSwitch

**Source:** `inputs.tsx:396`  •  **Docs:** L1233
1. **MAJOR** — omits `disabled` and `surface`.
2. **MINOR** — `onChange` doc `(v: boolean) => void`, src `(next: boolean) => void`.

### PixelSlider

**Source:** `inputs.tsx:452`  •  **Docs:** L1252
Source: `label`, `min?=0`, `max?=100`, `step?=1`, `value`, `onChange`, `disabled?=false`, `tone?='cyan'`, `showMinMax?=false`, `surface?`.

1. **MAJOR** — omits `disabled`, `showMinMax`, `surface` (3 props).
2. **MINOR** — `onChange` doc `(v: number) => void`, src `(next: number) => void`.

### PixelSegmented

**Source:** `inputs.tsx:588`  •  **Docs:** L1277
1. **MAJOR** — omits `disabled` and `surface`.
2. **MINOR** — `onChange` doc `(v: string) => void`, src `(next: string) => void`.

### PixelCard

**Source:** `data-display.tsx:15`  •  **Docs:** L1313
1. **MAJOR** — omits `children` (required) and `surface`.

### PixelStatCard

**Source:** `data-display.tsx:46`  •  **Docs:** L1349
1. **MAJOR** — omits `surface`.

### PixelTable

**Source:** `data-display.tsx:79`  •  **Docs:** L1371
1. **MAJOR** — omits `surface`.
2. **MINOR** — `columns` is in source; docs row writes its type as `Array<{ key, header, className? }>` — drops the explicit `string` annotations vs source `Array<{ key: string; header: string; className?: string }>`. Cosmetic.

### PixelAvatar

**Source:** `data-display.tsx:130`  •  **Docs:** L1409
1. **MAJOR** — omits `surface`.

### PixelBadge

**Source:** `data-display.tsx:164`  •  **Docs:** L1432
1. **MAJOR** — omits `surface`.

### PixelChip

**Source:** `data-display.tsx:186`  •  **Docs:** L1455
1. **MAJOR** — omits `surface`.

### PixelTextLink

**Source:** `data-display.tsx:237`  •  **Docs:** L1477
Source is a discriminated union `PixelTextLinkAnchorProps | PixelTextLinkButtonProps` accepting either anchor or button passthroughs plus `children`, `tone?='cyan'`, `className?`, `href?`, `surface?`.

1. **MAJOR** — omits `surface`. (Auto-detected as missing because doc-listed `children`, `href`, `tone`, `className` flagged as "extra" by parser — but they ARE valid; they come from the union types, not from the inner type block. The real issue is `surface` is missing.)

### PixelCollapsible

**Source:** `data-display.tsx:270`  •  **Docs:** L1868
1. **MAJOR** — omits `children` (required) and `surface`.

### PixelCodeInline

**Source:** `data-display.tsx:308`  •  **Docs:** L1500
1. **MAJOR** — omits `surface`.

### PixelKbd

**Source:** `data-display.tsx:330`  •  **Docs:** L1522
1. **MAJOR** — omits `surface`.

### PixelColorSwatch

**Source:** `data-display.tsx:359`  •  **Docs:** L1546
1. **MAJOR** — omits `surface`.

### PixelBareButton / PixelBareInput / PixelBareTextarea

**Source:** `data-display.tsx:388–400`  •  **Docs:** L2082, L2100, L2116
Source: `React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>` (and parallels for input/textarea). These are intentional escape hatches — they accept **all** native HTML props.

Each docs row lists `...props` and `ref` as fake "props" (parser flagged as "extra"). This is acceptable as a documentation convention but should be explicit that these are not real React props on the type signature.

1. **MINOR** — `ref` and `...props` are not real prop names. Recommend wording: "Forwards all native `<button>` HTML attributes; ref forwards to the underlying element."

### PixelAlert

**Source:** `feedback.tsx:12`  •  **Docs:** L1569
1. **MAJOR** — omits `surface`.

### PixelProgress

**Source:** `feedback.tsx:60`  •  **Docs:** L1618
1. **MAJOR** — omits `surface`.

### PixelSkeleton

**Source:** `feedback.tsx:131`  •  **Docs:** L1639
1. **MAJOR** — omits `className` and `surface`.

### PixelEmptyState

**Source:** `feedback.tsx:161`  •  **Docs:** L1662
1. **MAJOR** — omits `surface`.

### PixelToast

**Source:** `packages/core/src/components/PixelToast.tsx:12` (type `PixelToastProps` at types.ts:450)
**Documented at:** `/ui-kit#pixel-toast` (page.tsx L1688)
**Status:** ❌ critical (documents the wrong API)

**Actual API (`PixelToastProps`):** `visible: boolean`, `title: string`, `message?: string`, `icon?: PxlKitData`, `colorfulIcon?: boolean = true`, `iconSize?: number = 24`, `bgColor?: string = '#12121a'`, `borderColor?: string = '#2a2a3e'`, `textColor?: string = '#e8e6e3'`, `accentColor?: string = '#00ff88'`, `position?: 'top-left'|'top-right'|'bottom-left'|'bottom-right' = 'top-right'`, `duration?: number = 2200`, `showClose?: boolean = true`, `onClose?: () => void`, `className?: string`.

**Documented in `/ui-kit` (L1688):** props table lists `toast(options)`, `success/error/info/warning`, `dismiss(id)`, `dismissAll()` — these are methods on the `useToast()` hook (an app-level wrapper in `apps/web/src/components/ToastProvider.tsx`), NOT props on the `<PixelToast>` component shipped in `@pxlkit/core`.

1. **CRITICAL** — The section is titled `PixelToast` and the description says "the standalone `<PixelToast>` component ships in `@pxlkit/core`" but the props table documents an entirely different API (`useToast()` hook). A consumer of `@pxlkit/core` importing `PixelToast` cannot find `visible`, `title`, `position`, etc. anywhere in `/ui-kit/page.tsx`.
2. **CRITICAL** — `colorfulIcon` (deprecated-shaped, per the recent v1.3 `appearance` migration on PxlKitIcon) is undocumented as a `PixelToast` prop. It also still defaults to `true` in source — coherent today, but worth re-evaluating if PixelToast should adopt the same `appearance` API.

**Suggested fix:** split this DocSection into two:
- "Toast — quick start" documenting the app-level `useToast()` pattern (current content is fine here)
- "PixelToast component (low-level)" documenting the 15 actual `PixelToastProps` from `core/types.ts:450`

### PixelTabs

**Source:** `navigation.tsx:12`  •  **Docs:** L1821
1. **MAJOR** — omits `surface`.

### PixelAccordion

**Source:** `navigation.tsx:62`  •  **Docs:** L1845
1. **MAJOR** — omits `surface`.

### PixelBreadcrumb

**Source:** `navigation.tsx:118`  •  **Docs:** L1902
1. **MAJOR** — omits `surface`.
2. **MINOR** — `items` doc-type is `Array<{ label, href?, onClick?, active? }>`; source is `Array<{ label: string; href?: string; onClick?: () => void; active?: boolean }>`. Annotation dropped — cosmetic.

### PixelPagination

**Source:** `navigation.tsx:167`  •  **Docs:** L1922
1. **MAJOR** — omits `surface`.
2. **MINOR** — `onChange` doc `(page: number) => void`, src `(next: number) => void`.

### PixelModal

**Source:** `overlay.tsx:14`  •  **Docs:** L1939
1. **MAJOR** — omits `children` (required) and `surface`.

### PixelTooltip

**Source:** `overlay.tsx:99`  •  **Docs:** L1964
1. **MAJOR** — omits `children` (required) and `surface`.

### PixelDropdown

**Source:** `overlay.tsx:148`  •  **Docs:** L1993
Source: `label: string`, `items: Option[]`, `onSelect: (value:string)=>void`, `tone?='neutral'`, `icon?: ReactNode`, `disabled?=false`, `surface?`.

1. **MAJOR** — omits `icon`, `disabled`, `surface` (3 props).
2. **MINOR** — `onSelect` doc `(v: string) => void`, src `(value: string) => void`.

### PixelSection

**Source:** `layout.tsx:9`  •  **Docs:** L2039
1. **MAJOR** — omits `children` and `surface`.

### PixelDivider

**Source:** `layout.tsx:39`  •  **Docs:** L2060
Source: `label?`, `tone?='neutral'`, `spacing?='none' (union 'none'|'sm'|'md'|'lg')`, `className?`, `surface?`.

1. **MAJOR** — omits `spacing`, `className`, `surface` (3 props).

### Animation primitives (11 components)

All 11 take `children: React.ReactNode` (required) and `className?: string` plus their own controls. The docs `/ui-kit` props tables consistently omit both. Plus the `repeat` type-string mismatch (see Cross-cutting MAJOR #3).

| Component | Source line | Doc line | Defaults check | Missing props |
|---|---|---|---|---|
| PixelFadeIn | 131 | 2224 | duration=400, delay=0, repeat=1, easing='ease', fillMode='both', trigger='mount' | children, repeat type-mismatch |
| PixelSlideIn | 167 | 2259 | from='down', duration=350, delay=0, distance=10, repeat=1, easing='ease', fillMode='both', trigger='mount' | children, className, repeat type-mismatch |
| PixelPulse | 214 | 2299 | duration=2000, repeat='infinite', easing='ease-in-out', trigger='mount' | children, className, repeat type-mismatch |
| PixelBounce | 246 | 2324 | duration=800, repeat='infinite', height=8, easing='ease', trigger='mount' | children, className |
| PixelTypewriter | 287 | 2497 | speed=60, delay=0, cursor=true, tone='green', trigger='mount' | className |
| PixelGlitch | 341 | 2529 | duration=3000, intensity=4, trigger='mount' | children, className |
| PixelFloat | 402 | 2361 | duration=2200, distance=6, repeat='infinite', easing='ease-in-out', trigger='mount' | children, className, repeat type-mismatch |
| PixelShake | 443 | 2387 | duration=450, distance=2, repeat=1, easing='linear', trigger='mount' | children, className, repeat type-mismatch |
| PixelRotate | 484 | 2413 | duration=1800, repeat='infinite', direction='normal', easing='linear', trigger='mount' | children, className, repeat type-mismatch |
| PixelZoomIn | 525 | 2439 | duration=320, delay=0, startScale=0.92, repeat=1, easing='cubic-bezier(.2,.9,.2,1)', fillMode='both', trigger='mount' | children, className, repeat type-mismatch |
| PixelFlicker | 570 | 2473 | duration=2200, repeat='infinite', trigger='mount' | children, className, repeat type-mismatch |

### PixelParallaxLayer

**Source:** `parallax.tsx:22`  •  **Docs:** L2576
Source: `children`, `speed?=0.5`, `axis?='y' (union 'x'|'y'|'both')`, `className?`, `style?`.
1. **MAJOR** — omits `children`.

### PixelParallaxGroup

**Source:** `parallax.tsx:82`  •  **Docs:** L2616
Source: `children`, `className?`, `style?`, `as?='div' (union 'div'|'section'|'header'|'main')`.
1. **MAJOR** — omits `children`.

### PixelMouseParallax

**Source:** `parallax.tsx:110`  •  **Docs:** L2645
Source: `children`, `strength?=20`, `invert?=false`, `className?`, `style?`.
1. **MAJOR** — omits `children`.

### PxlKitLocaleProvider

**Source:** `locale.tsx:213` (props at locale.tsx:177 — interface `PxlKitLocaleProviderProps`)
**Documented at:** `/ui-kit/page.tsx` L834 (inside a custom `<PixelCollapsible>` block, NOT a `DocSection`)
**Status:** ✅ coherent

Documented props: `locale: '"en" | "tr"' default '"en"'` + `children: ReactNode` — matches source exactly.

### PxlKitSurfaceProvider

**Source:** `common.tsx:118`
**Documented at:** — (no mention anywhere)
**Status:** ❌ critical — see Cross-cutting CRITICAL #1.

---

## Per-component findings (Core API documented in `/docs`)

### PxlKitIcon

**Source:** `packages/core/src/components/PxlKitIcon.tsx:40` ; type at `types.ts:168`
**Documented at:** `/docs#react-component` — `<CodeBlock title="PxlKitProps">` at page.tsx L431
**Status:** ⚠️ minor

**Actual API (PxlKitProps):**
```ts
interface PxlKitProps {
  icon: PxlKitData;
  size?: number;                          // default 32
  appearance?: IconAppearance;            // default 'palette'
  color?: string;                         // fallback currentColor
  className?: string;                     // default ''
  'aria-label'?: string;
  style?: React.CSSProperties;
  /** @deprecated since v1.3 */ colorful?: boolean;
  /** @deprecated since v1.3 */ solid?: boolean;
  /** @deprecated since v1.3 */ tint?: string;
}
```

**Discrepancies:**
1. **MINOR** — The CodeBlock at L431 shows the 7 non-deprecated props but does NOT include the three deprecated legacy props (`colorful`, `solid`, `tint`). The docs DOES mention the v1.3 migration at L455–L464, so users are informed; but the props interface in the code snippet is incomplete. Either show the deprecated props (annotated) or add a one-liner under the snippet noting `colorful`/`solid`/`tint` are still accepted for v1.2 compatibility.

### AnimatedPxlKitIcon

**Source:** `components/AnimatedPxlKitIcon.tsx:85` ; type at `types.ts:279`
**Documented at:** L510
**Status:** ⚠️ minor

Source has 14 props; docs CodeBlock at L510 lists 11 (omits the three deprecated legacy `colorful`, `solid`, `tint`).

1. **MINOR** — same pattern as PxlKitIcon: deprecated props missing from the snippet.
2. **MINOR** — Docs code example shows `<AnimatedPxlKitIcon icon={FireSword} playing={false} />` at L565. `playing` is a real prop — compiles fine. No issue here.

### ParallaxPxlKitIcon

**Source:** `components/ParallaxPxlKitIcon.tsx:81` ; type at `types.ts:389`
**Documented at:** L650
**Status:** ⚠️ minor

Source has 17 props; docs CodeBlock lists 14 (omits the three deprecated legacy props).

1. **MINOR** — deprecated props omitted from snippet.

### PixelToast (core component)

**Source:** `components/PixelToast.tsx:12` ; type at `types.ts:450`
**Documented at:** `/docs#toast-notifications` (L744) **defers** to `/ui-kit#pixel-toast`.
**Status:** ❌ critical (combined with `/ui-kit` mis-coverage — see UI-kit PixelToast finding)

In `/docs/page.tsx` L744–L780, the entire Toast Notifications section says "Toast notifications are now documented as part of the UI Kit in /ui-kit#pixel-toast". But `/ui-kit#pixel-toast` documents the `useToast()` hook, not the `PixelToast` component props. **Net result: the actual PixelToast component API (which is exported from `@pxlkit/core`) is documented nowhere.**

---

## Per-utility findings (Core utilities documented in `/docs`)

The "Other Utilities" CodeBlock at `/docs/page.tsx:807` is a one-line description list. Compared to `@pxlkit/core` actual exports:

**Actual exports from `packages/core/src/index.ts`:**
`gridToPixels`, `pixelsToGrid`, `parseHexColor`, `encodeHexColor`, `pixelsToSvg`, `gridToSvg`, `svgToDataUri`, `svgToBase64`, `validateIconData`, `isValidIconData`, `parseIconCode`, `parseAnyIconCode`, `generateIconCode`, `adjustBrightness`, `hexToRgb`, `rgbToHex`, `getPerceivedBrightness`, `RETRO_PALETTES`, `generateAnimatedSvg`, `animatedToFrameIcons`, `isAnimatedIcon`, `isParallaxIcon`.

**Documented in "Other Utilities" (L807) as one-liners:** `gridToPixels`, `pixelsToGrid`, `pixelsToSvg`, `svgToDataUri`, `svgToBase64`, `validateIconData`, `generateIconCode`, `parseIconCode` (8 items).

**Documented elsewhere on the docs page:** `gridToSvg` (L790), `parseHexColor` / `encodeHexColor` (L400), `generateAnimatedSvg` (L566), `parseIconCode` (L856), `validateIconData` (L856 — together with parseIconCode).

**Undocumented utilities:**
| Utility | Source | Signature |
|---|---|---|
| `isValidIconData` | utils/validateIconData.ts:123 | `(icon: PxlKitData) => boolean` |
| `parseAnyIconCode` | utils/parseIconCode.ts:88 | `(code: string) => AnyIcon \| null` |
| `adjustBrightness` | utils/colorUtils.ts:6 | `(hex: string, amount: number) => string` |
| `hexToRgb` | utils/colorUtils.ts:17 | `(hex: string) => { r: number; g: number; b: number }` |
| `rgbToHex` | utils/colorUtils.ts:29 | `(r: number, g: number, b: number) => string` |
| `getPerceivedBrightness` | utils/colorUtils.ts:37 | `(hex: string) => number` |
| `RETRO_PALETTES` | utils/colorUtils.ts | `Record<RetropaletteName, …>` |
| `animatedToFrameIcons` | utils/animatedSvg.ts:138 | `(icon: AnimatedPxlKitData) => Array<{ icon: PxlKitData; duration: number }>` |
| `isAnimatedIcon` | core/index.ts | type guard |
| `isParallaxIcon` | core/index.ts | type guard |

**Status:** ⚠️ major — 10 exported utilities (45% of the public utility surface) have no documentation.

### gridToSvg (documented)

**Source:** `utils/gridToSvg.ts:24` — `gridToSvg(icon: PxlKitData, options: SvgOptions = { mode: 'colorful' }): string`
**Docs:** `/docs#svg-generation` L790
**Status:** ✅ coherent. `SvgOptions` shape (`mode`, `monoColor`, `pixelSize`, `xmlDeclaration`) is fully shown in the example.

### generateAnimatedSvg (documented)

**Source:** `utils/animatedSvg.ts:15` — accepts `options?: { colorful?: boolean; monoColor?: string; pixelSize?: number; xmlDeclaration?: boolean }`
**Docs:** L566 — example uses `{ colorful: false, monoColor: '#00FF88' }`.
**Status:** ✅ coherent. The L573 prose note acknowledges that this util uses the legacy `colorful` API while the React component moved to `appearance`. Good.

### parseIconCode / validateIconData (documented in AI section)

**Source:** `utils/parseIconCode.ts:18`, `utils/validateIconData.ts:21`
**Docs:** L856 (with `parseAnyIconCode` referenced but not the signature shown)
**Status:** ✅ coherent for the two documented; `parseAnyIconCode` is exported but its presence in the public API is not surfaced in docs.

### parseHexColor / encodeHexColor (documented)

**Source:** `utils/gridToPixels.ts:9` / `utils/gridToPixels.ts:101`
**Docs:** L400
**Status:** ✅ coherent. The example at L403 `const { color, opacity } = parseHexColor('#FF000080');` matches the actual return shape `{ color: string; opacity: number }`.

---

## Per-type findings (Type definitions in `/docs`)

### PxlKitData type CodeBlock (L326)

**Source:** `types.ts:58` — `PxlKitData { name, size: GridSize, category, grid: string[], palette: Record<string,string>, tags: string[], author? }`
**Docs (L326):** type alias `GridSize = 8 | 16 | 24 | 32 | 48 | 64` then the interface.
**Status:** ✅ coherent.

### AnimatedPxlKitData type CodeBlock (L491)

**Source:** `types.ts:245` — fields: `name`, `size: GridSize`, `category`, `palette`, `frames: AnimationFrame[]`, `frameDuration: number`, `loop: boolean (@deprecated)`, `trigger?: AnimationTrigger`, `tags`, `author?`.
**Docs (L491):**
```ts
interface AnimatedPxlKitData {
  name: string;
  size: 8 | 16 | 32;   // ← incorrect
  category: string;
  palette: Record<string, string>;
  frames: AnimationFrame[];
  frameDuration: number;
  loop: boolean;          // @deprecated
  trigger?: AnimationTrigger;
  tags: string[];
  author?: string;
}
```

1. **CRITICAL** — Docs claims `size: 8 | 16 | 32`. Source declares `size: GridSize` where `GridSize = 8 | 16 | 24 | 32 | 48 | 64`. Animated icons can be 24, 48, or 64 too. This is a real authoring constraint mis-statement.

**Suggested fix:** L493 → `size: GridSize;  // 8 | 16 | 24 | 32 | 48 | 64`.

### ParallaxPxlKitData type CodeBlock (L633)

**Source:** `types.ts:371`
**Docs (L633):** Matches source. Notes "category: always 'parallax'" is a convention, not a type constraint (source is `category: string`). Acceptable.

### IconAppearance type CodeBlock (L427)

**Source:** `types.ts:153` — `'palette' | 'tinted' | 'solid'`
**Docs:** matches.
**Status:** ✅ coherent.

### AnimationTrigger (referenced but not shown as a code block)

**Source:** `types.ts:209` — `'loop' | 'once' | 'hover' | 'appear' | 'ping-pong'` (5 values).
**Docs (L541) "Trigger Modes" code block:** shows usage examples for `trigger="loop"`, `trigger="once"`, `trigger="hover"`, `trigger="appear"`, `trigger="ping-pong"`.

**Status:** ✅ coherent — all 5 values mentioned in examples.

---

## Examples that won't compile or render incorrectly

After scanning every code example in `/ui-kit/page.tsx` and `/docs/page.tsx`:

1. **No examples use prop names that don't exist on the component.** All prop names referenced in code examples (`tone`, `size`, `variant`, `loading`, `iconLeft`, `surface`, `appearance`, etc.) are real.
2. **No required props are omitted** in the runnable code examples (the live previews on `/ui-kit/page.tsx` actually mount the component, so a missing required prop would crash at build time).
3. **One subtle pitfall:** `/docs/page.tsx` L493 says `size: 8 | 16 | 32` for `AnimatedPxlKitData`. A user copying that into their TypeScript declaration would reject 24 / 48 / 64. The type itself is `GridSize` so the union mismatch only bites if the user retypes by hand — not a runtime crash but a documentation-induced type error.

---

## Prose inaccuracies

1. **`/docs/page.tsx:744–747`** says toast is "documented as part of the UI Kit in /ui-kit#pixel-toast". The UI-kit section at L1688 does NOT document the `PixelToast` component props — it documents the `useToast()` hook. The sentence misleads users looking for the low-level component.
2. **`/docs/page.tsx:493`** type union `size: 8 | 16 | 32` for `AnimatedPxlKitData` is wrong — see CRITICAL above.
3. **`/ui-kit/page.tsx:1688` description** says "the standalone `<PixelToast>` component ships in `@pxlkit/core`". Source confirms this: `packages/core/src/index.ts` exports `PixelToast`. ✅ accurate. But the prose then pivots into hook-based usage without ever listing the actual component props — see CRITICAL.
4. **`/ui-kit/page.tsx:913`** message claims "CSS text-transform: uppercase is automatically locale-aware when the lang attribute is set. PxlKitLocaleProvider sets lang on a wrapping element." Source `locale.tsx` confirms `<div lang={locale}>` wrapper — accurate. ✅

---

## Cross-page inconsistencies

1. **Toast documentation pointer mismatch** — `/docs#toast-notifications` (L744) redirects to `/ui-kit#pixel-toast`, but the destination documents the wrong API surface. The two pages must agree on whether `PixelToast` (core component) is documented at all.
2. **Component count claims** — `/docs/page.tsx:217` shows "{UI_COMPONENTS_COUNT} components · PixelToast guide · {TOTAL_ICONS} icons across {TOTAL_PACKS} packs · 3D Parallax" where `UI_COMPONENTS_COUNT = UI_KIT_COMPONENTS.length = 55`. `/ui-kit/page.tsx` similarly imports `UI_KIT_COMPONENTS` and references the same constant. ✅ Both pages stay in sync via the registry — good.
3. **Surface API** — `/docs/page.tsx` never mentions the `surface` prop / `PxlKitSurfaceProvider` system. `/ui-kit/page.tsx` mentions Surface globally in the Design Tokens section (L657 common API surface lists tone/size/iconLeft/label but NOT surface), and a brief note around the locale section, but no per-component prop row. The `surface` system is essentially a stealth feature in the docs.

---

## Recommended remediation plan (ordered)

1. **Add `surface?: Surface` row to every component's props table** in `/ui-kit/page.tsx` (54 edits). Mechanical. One sed-like pass.
2. **Fix `/docs/page.tsx:493`** — change `size: 8 | 16 | 32` → `size: GridSize  // 8 | 16 | 24 | 32 | 48 | 64`.
3. **Restructure the PixelToast section** at `/ui-kit/page.tsx:1688` into two: `useToast()` hook docs + `PixelToast` component props from `core/types.ts:450`.
4. **Add a `PxlKitSurfaceProvider` DocSection** to `/ui-kit/page.tsx` (next to `PxlKitLocaleProvider`).
5. **Add the `children` row** wherever it's required (PixelCard, PixelCollapsible, PixelModal, PixelTooltip, PixelSection, PixelGlitch, PixelParallaxLayer, PixelParallaxGroup, PixelMouseParallax, and all 11 animation components).
6. **Add missing optional props** documented above (`error` on PixelPasswordInput; `hint/error/disabled` on PixelSelect; `disabled` on PixelRadioGroup/PixelSwitch/PixelSegmented; `disabled/showMinMax` on PixelSlider; `icon/disabled` on PixelDropdown; `spacing/className` on PixelDivider; `className` on PixelSkeleton + all animations; `disabled` on PixelSplitButton).
7. **Document the 10 missing utilities** (`isValidIconData`, `parseAnyIconCode`, `adjustBrightness`, `hexToRgb`, `rgbToHex`, `getPerceivedBrightness`, `RETRO_PALETTES`, `animatedToFrameIcons`, `isAnimatedIcon`, `isParallaxIcon`) in `/docs#svg-generation` or a new `#advanced-utilities` section.
8. **Standardize callback param naming** — either rename source `next`/`value` to `v` or rename docs `v` to match source. Source-as-truth wins; updating docs is cheaper.
9. **Show deprecated props in the core component CodeBlocks** at `/docs#react-component` (L431), `#animated-icons` (L510), `#parallax-icons` (L650) — annotate with `// @deprecated since v1.3`.
10. **Standardize `repeat` annotation** in animation primitives — pick one: either type as `AnimationRepeat` (export the alias from `@pxlkit/ui-kit`) or keep the literal union `number | 'infinite'` everywhere.

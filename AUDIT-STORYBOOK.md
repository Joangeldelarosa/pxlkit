# Storybook story coherence audit

Generated: 2026-05-12
Scope: every `.stories.tsx` matched by `.storybook/main.ts` glob (`packages/ui-kit/src/**/*.stories.@(ts|tsx)` + `packages/core/src/**/*.stories.@(ts|tsx)`).
Sources of truth: `packages/ui-kit/src/{actions,inputs,data-display,feedback,navigation,overlay,layout,animations,parallax,locale,common}.tsx` and `packages/core/src/components/{PxlKitIcon,AnimatedPxlKitIcon,ParallaxPxlKitIcon,PixelToast}.tsx`.

---

## Story files inventory

| File | Module section | Components covered | Stories exported | Verdict |
|---|---|---:|---:|---|
| `packages/ui-kit/src/actions.stories.tsx` | UI Kit / Actions | PixelButton, PxlKitButton, PixelSplitButton | 4 | ✅ |
| `packages/ui-kit/src/inputs.stories.tsx` | UI Kit / Inputs | PixelInput, PixelPasswordInput, PixelTextarea, PixelSelect, PixelCheckbox, PixelRadioGroup, PixelSwitch, PixelSlider, PixelSegmented | 10 | ⚠️ |
| `packages/ui-kit/src/data-display.stories.tsx` | UI Kit / Data Display | PixelCard, PixelStatCard, PixelTable, PixelAvatar, PixelBadge, PixelChip, PixelTextLink, PixelCollapsible, PixelCodeInline, PixelKbd, PixelColorSwatch, PixelBareButton, PixelBareInput, PixelBareTextarea | 14 | ⚠️ |
| `packages/ui-kit/src/feedback.stories.tsx` | UI Kit / Feedback | PixelAlert, PixelProgress, PixelSkeleton, PixelEmptyState | 5 | ⚠️ |
| `packages/ui-kit/src/navigation.stories.tsx` | UI Kit / Navigation | PixelTabs, PixelAccordion, PixelBreadcrumb, PixelPagination | 5 | ⚠️ |
| `packages/ui-kit/src/overlay.stories.tsx` | UI Kit / Overlay | PixelModal, PixelTooltip, PixelDropdown | 4 | ✅ |
| `packages/ui-kit/src/layout.stories.tsx` | UI Kit / Layout | PixelSection, PixelDivider | 3 | ✅ |
| `packages/ui-kit/src/animations.stories.tsx` | UI Kit / Animations | PixelFadeIn, PixelSlideIn, PixelPulse, PixelBounce, PixelTypewriter, PixelGlitch, PixelFloat, PixelShake, PixelRotate, PixelZoomIn, PixelFlicker | 12 | ⚠️ |
| `packages/ui-kit/src/parallax.stories.tsx` | UI Kit / Parallax | PixelParallaxGroup, PixelParallaxLayer, PixelMouseParallax | 4 | ⚠️ |
| `packages/ui-kit/src/locale.stories.tsx` | UI Kit / Locale | PxlKitLocaleProvider | 2 | ✅ |
| `packages/ui-kit/src/surface.stories.tsx` | Foundations / Surface | PxlKitSurfaceProvider (+ 16 child kit components in demo) | 3 | ✅ |
| `packages/core/src/components/PxlKitIcon.stories.tsx` | Core / PxlKitIcon | PxlKitIcon | 11 | ❌ |
| `packages/core/src/components/AnimatedPxlKitIcon.stories.tsx` | Core / AnimatedPxlKitIcon | AnimatedPxlKitIcon | 9 | ❌ |
| `packages/core/src/components/PixelToast.stories.tsx` | Core / PixelToast | PixelToast | 11 | ✅ |

**Totals:** 14 story files, 97 exported stories, 58 components/providers covered.

Statuses: ✅ no factual discrepancies / ⚠️ stale-but-functional (uses deprecated alias or has cosmetic argType drift) / ❌ entire file uses deprecated v1.2 API.

---

## Per-file findings

### actions.stories.tsx
**Stories:** 4 (`AllActions`, `PixelButtonStory`, `PxlKitButtonStory`, `PixelSplitButtonStory`)
**Components:** PixelButton, PxlKitButton, PixelSplitButton
**Status:** ✅ no factual issues

- `TONES` constant at L7 lists `'green' | 'cyan' | 'gold' | 'red' | 'purple' | 'pink' | 'neutral'` — matches `Tone` definition in `packages/ui-kit/src/common.tsx:7` exactly (7 entries).
- `SIZES` (`sm | md | lg`) matches `Size` in `common.tsx:8`.
- `SURFACES` (`pixel | linear`) matches `Surface` in `common.tsx:26`.
- All props used (`tone`, `size`, `variant`, `surface`, `iconLeft`, `iconRight`, `loading`, `disabled`, `label`, `icon`, `options`, `onPrimary`, `onSelect`) exist on the corresponding source types.
- `meta.title = 'UI Kit / Actions'` — no `meta.component` set because `meta` uses generic `Meta` (no component binding); stories render explicitly. Functional.

### inputs.stories.tsx
**Stories:** 10
**Components:** PixelInput, PixelPasswordInput, PixelTextarea, PixelSelect, PixelCheckbox, PixelRadioGroup, PixelSwitch, PixelSlider, PixelSegmented
**Status:** ⚠️ minor issues

- L16: `import { Mail, Lock } from '@pxlkit/feedback'` — `Lock` is imported but never referenced. Dead import. (`Mail` is used at L49.)
- All props referenced (`label`, `value`, `defaultValue`, `placeholder`, `hint`, `error`, `tone`, `size`, `surface`, `disabled`, `checked`, `min`, `max`, `step`, `showMinMax`, `options`, `rows`) match source signatures. No drift.
- `PixelTextareaStory` argTypes (L166–174) does **not** include `size` — and source `inputs.tsx:112` confirms `PixelTextarea` does not accept `size`. Coherent.
- `PixelCheckboxStory.argTypes` includes `surface` and `disabled` per Common API Surface convention. Matches source `inputs.tsx:275–289`.
- `meta.title = 'UI Kit / Inputs'` — no `meta.component`. Stories use individual render functions. Functional.

### data-display.stories.tsx
**Stories:** 14
**Components:** PixelCard, PixelStatCard, PixelTable, PixelAvatar, PixelBadge, PixelChip, PixelTextLink, PixelCollapsible, PixelCodeInline, PixelKbd, PixelColorSwatch, PixelBareButton, PixelBareInput, PixelBareTextarea
**Status:** ⚠️ deprecated-API usage (functional)

- L51, L52, L53, L56, L59, L101, L122: passes `colorful` prop to `PxlKitIcon` / `AnimatedPxlKitIcon`. `colorful` is deprecated since v1.3 — the new API is `appearance="palette"` (default). The deprecated prop still works via alias (`PxlKitIcon.tsx` `mergeLegacyProps`), but every such usage signals a stale story.

  Count: 7 instances of `colorful` on icon usage in this file alone.

- `PixelChipStory` (L160–169) does not list `onRemove` in argTypes; that's reasonable since it's a function — the render function injects one. OK.
- `PixelCollapsibleStory.argTypes` (L190–195): lists `defaultOpen`, `tone`, `label`, `surface`, `children`. Source `data-display.tsx:270–282` declares exactly these 5. ✅
- `PixelTableStory.args` includes `columns`, `data`, `striped`, `surface`. Source `data-display.tsx:79–88` declares exactly these 4. ✅
- `PixelStatCardStory.args` includes `label`, `value`, `trend`, `tone`, `surface`, `icon`. Source `data-display.tsx:46–60` matches. ✅
- `PixelBareButtonStory`, `PixelBareInputStory`, `PixelBareTextareaStory` (L251–267): no argTypes — pass-through stories with default `args` for `children` / `placeholder` / `rows`. Coherent with the "forwards all native attributes" intent.

### feedback.stories.tsx
**Stories:** 5 (`AllFeedback`, `PixelAlertStory`, `PixelProgressStory`, `PixelSkeletonStory`, `PixelEmptyStateStory`)
**Components:** PixelAlert, PixelProgress, PixelSkeleton, PixelEmptyState
**Status:** ⚠️ deprecated-API usage (functional)

- L24–28, L50, L80, L122, L147: passes `colorful` prop to `PxlKitIcon` / `AnimatedPxlKitIcon`. Same v1.3 alias situation as above — 6 instances in this file.
- All props (`tone`, `title`, `message`, `icon`, `action`, `surface`, `value`, `label`, `showValue`, `width`, `height`, `rounded`, `description`) exist on source types. Verified:
  - PixelAlert: source `feedback.tsx:12` ✅
  - PixelProgress: source `feedback.tsx:60` ✅
  - PixelSkeleton: source `feedback.tsx:131–142` — `rounded` exists ✅
  - PixelEmptyState: source `feedback.tsx:161–172` — uses `description` (not `message`) ✅
- `PixelSkeletonStory` argTypes lists `rounded` — matches source. ✅

### navigation.stories.tsx
**Stories:** 5
**Components:** PixelTabs, PixelAccordion, PixelBreadcrumb, PixelPagination
**Status:** ⚠️ deprecated-API usage (functional)

- L13–15: TABS array passes `colorful` to `PxlKitIcon`. Same v1.3 alias.
- `PixelTabsStory.argTypes` (L66–70): `surface`, `defaultTab`. Source `navigation.tsx:12–19` declares `items`, `defaultTab`, `surface` — coherent. Note: `items` is passed via `args` (L70) which is correct.
- `PixelAccordionStory.argTypes` (L79–82): `allowMultiple`, `surface`. Source `navigation.tsx:62–69` matches. ✅
- `PixelBreadcrumbStory` items array shape (L97–101): `{ label, href?, active? }` — matches source `navigation.tsx:118–126` (`Array<{ label, href?, onClick?, active? }>`).
- `PixelPaginationStory.argTypes` (L114–118): `page`, `total`, `surface`. Source `navigation.tsx:167–179` declares `page`, `total`, `onChange`, `surface`. Coherent.

### overlay.stories.tsx
**Stories:** 4
**Components:** PixelModal, PixelTooltip, PixelDropdown
**Status:** ✅ no factual issues

- All props used (`open`, `title`, `surface`, `size`, `onClose`, `content`, `position`, `label`, `tone`, `icon`, `onSelect`, `items`, `disabled`) exist on source.
- `PixelModalStory.argTypes` (L76–80): includes `size` with `['sm', 'md', 'lg']` — matches source `overlay.tsx:14`.
- `PixelTooltipStory.argTypes` (L94–98): `position` with `['top', 'bottom', 'left', 'right']` — matches source `overlay.tsx:99`.
- `PixelDropdownStory.argTypes` (L112–117): `label`, `tone`, `surface`, `disabled` — matches source `overlay.tsx:148`.

### layout.stories.tsx
**Stories:** 3
**Components:** PixelSection, PixelDivider
**Status:** ✅ no factual issues

- `PixelDividerStory.argTypes` (L75–80): includes `spacing` with `['none', 'sm', 'md', 'lg']` — matches source `layout.tsx:49`.
- All other props (`label`, `subtitle`, `title`, `tone`, `surface`) exist on source.

### animations.stories.tsx
**Stories:** 12 (`AllAnimations` + 11 per-component)
**Components:** all 11 animation primitives
**Status:** ⚠️ deprecated-API usage + 1 argType drift

- L20: `const TRIGGERS = ['mount', 'hover', 'click', 'inView'] as const;` — **missing `'focus'`** value. Source `animations.tsx:46` declares `AnimationTrigger = 'mount' | 'hover' | 'click' | 'focus' | 'inView' | boolean`. The `argTypes.trigger.options` (used by `animationBaseControls` at L90) therefore offers 4 controls instead of 5. Discrepancy: `focus` will not appear in the Storybook control dropdown but the prop accepts it. **Minor argType drift.**
  - `boolean` is not exposed as a control either, but that's a UX choice (booleans for trigger don't make sense in a radio control) — not a discrepancy.
- L34, L37, L40, L43, L46, L49, L52, L55, L58, L61: every icon inside `AllAnimations` passes `colorful` to `PxlKitIcon`/`AnimatedPxlKitIcon`. Same v1.3 alias situation. Count: 10 instances.
- Per-component argTypes verified:
  - `PixelFadeInStory` (L98–103): `trigger`, `duration`, `delay`, `repeat`. Source `animations.tsx:131–149` declares all of these plus `easing`, `fillMode`, `className`, `onComplete`. Story omits the last four from argTypes but that's a control-coverage gap, not a discrepancy.
  - `PixelSlideInStory` (L108–117): adds `from`, `distance`. Source `animations.tsx:167–189` declares `from`, `duration`, `delay`, `distance`, `repeat`, `easing`, `fillMode`, `trigger`, `onComplete`. Story argTypes accurate for `from`/`distance`. ✅
  - `PixelBounceStory` (L132–140): adds `height`. Source `animations.tsx:246–262` declares `height`. ✅
  - `PixelFloatStory` (L145–153): adds `distance`. Source `animations.tsx:402–418` declares `distance`. ✅
  - `PixelShakeStory` (L158–166): adds `distance`. Source `animations.tsx:443–459` declares `distance`. ✅
  - `PixelRotateStory` (L171–179): adds `direction` with `['normal','reverse','alternate','alternate-reverse']`. Source `animations.tsx:484–500` declares `direction` with the same 4 values. ✅
  - `PixelZoomInStory` (L184–192): adds `startScale`. Source `animations.tsx:525–545` declares `startScale`. ✅
  - `PixelGlitchStory` (L207–215): adds `intensity`. Source `animations.tsx:341–353` declares `intensity`. ✅
  - `PixelTypewriterStory` (L220–243): `text`, `speed`, `delay`, `cursor`, `tone`, `trigger`. Source `animations.tsx:287–305` declares exactly these 7 (plus `onComplete`, `className`). ✅

### parallax.stories.tsx
**Stories:** 4 (`AllParallax`, `PixelParallaxGroupStory`, `PixelParallaxLayerStory`, `PixelMouseParallaxStory`)
**Components:** PixelParallaxGroup, PixelParallaxLayer, PixelMouseParallax
**Status:** ⚠️ deprecated-API usage (functional)

- L22, L26, L30, L39, L54, L71, L90: passes `colorful` to icon components. 7 instances of v1.3-deprecated alias.
- `PixelParallaxGroupStory.argTypes` (L57–60): `as` with `['div','section','header','main']` — matches source `parallax.tsx:82–95`.
- `PixelParallaxLayerStory.argTypes` (L75–79): `speed`, `axis: ['x','y','both']` — matches source `parallax.tsx:22–35`.
- `PixelMouseParallaxStory.argTypes` (L94–97): `strength`, `invert` — matches source `parallax.tsx:110–115`.

### locale.stories.tsx
**Stories:** 2 (`EnglishVsTurkish`, `PxlKitLocaleProviderStory`)
**Components:** PxlKitLocaleProvider
**Status:** ✅ no factual issues

- L2: imports `TURKISH_CHARACTERS` from `./locale` — confirmed exported from `packages/ui-kit/src/locale.tsx`.
- `PxlKitLocaleProviderStory.argTypes` (L72–75): `locale: ['en', 'tr']`, `surface`. Source `locale.tsx:213` declares `locale: 'en' | 'tr'` + `children: ReactNode`. The story's `surface` argType is decorative — it's not a prop of `PxlKitLocaleProvider` (which doesn't accept `surface`) but is forwarded to the child components inside the demo. Acceptable as a Storybook control pattern; not a discrepancy on the type-level.

### surface.stories.tsx
**Stories:** 3 (`SideBySide`, `PixelOnly`, `LinearOnly`)
**Components:** PxlKitSurfaceProvider (+ ~16 kit components in `ComponentZoo`)
**Status:** ✅ no factual issues

- `meta.title = 'Foundations / Surface'` — distinct from `UI Kit / *` namespace, intentional.
- `ComponentZoo` (L27–98) instantiates: PixelButton, PxlKitButton, PixelStatCard, PixelInput, PixelCheckbox, PixelSwitch, PixelBadge, PixelChip, PixelSlider, PixelSegmented, PixelProgress, PixelTabs, PixelAlert, PixelDivider, PixelCard, PixelKbd, PixelCodeInline, PixelSection. Every prop used (`tone`, `iconLeft`, `variant`, `loading`, `value`, `trend`, `defaultValue`, `hint`, `error`, `checked`, `onChange`, `showMinMax`, `options`, `items`) exists on source.
- No deprecated `colorful` etc. usage in this file.

### Core / PxlKitIcon.stories.tsx
**Stories:** 11 (`Default`, `TintRed`, `TintCyan`, `TintPurple`, `SolidMonochrome`, `SolidCustomColor`, `TintSideBySide`, `Size16/32/48/64/128`, `WithClassName`, `WithAriaLabel`)
**Components:** PxlKitIcon
**Status:** ❌ entire file uses deprecated v1.2 API

- L52, L58, L66, L74, L82, L88, L126, L133, L140, L149, L158, L164, L171: every story passes `colorful: true`, `tint: '#xxx'`, or `solid: true`. **No story uses the new `appearance` prop.**
- Source `PxlKitIcon.tsx:40` documents the canonical API as `appearance?: IconAppearance = 'palette' | 'tinted' | 'solid'`. The deprecated alias path (`colorful`/`solid`/`tint`) still resolves at runtime via `mergeLegacyProps`, so stories render correctly — but they teach the wrong API to anyone reading them in Storybook.
- `meta.component = PxlKitIcon` and `meta.tags = ['autodocs']` — autodocs will introspect the type definition (which marks `colorful`/`solid`/`tint` as `@deprecated`) and emit deprecation warnings in the autogenerated controls. Visible as a yellow "Deprecated" badge in the auto-generated Controls panel.
- **Recommendation:** rewrite the 11 stories to use the new API:
  - `Default` → `appearance: 'palette'` (or omit, since it's the default)
  - `Tint*` → `appearance: 'tinted'` + `color: '#xxx'`
  - `Solid*` → `appearance: 'solid'` + optional `color`
  - `TintSideBySide` render function → use `appearance="tinted"` / `appearance="solid"` per panel
- argTypes are not declared; the controls come from `meta.tags = ['autodocs']`. argType drift n/a.

### Core / AnimatedPxlKitIcon.stories.tsx
**Stories:** 9 (`Loop`, `HoverTrigger`, `OnceTrigger`, `PingPongTrigger`, `DoubleSpeed`, `HalfSpeed`, `CustomFps`, `Paused`, `Monochrome`)
**Components:** AnimatedPxlKitIcon
**Status:** ❌ entire file uses deprecated v1.2 API

- L97, L104, L111, L118, L126, L135, L144, L152, L161: every story passes `colorful: true` (or `colorful: false` in `Monochrome`). **No story uses the new `appearance` prop.**
- `Monochrome` at L158–164 uses `colorful: false` + `color`. The intended new API is `appearance: 'solid'` + `color`.
- `meta.component = AnimatedPxlKitIcon` and `meta.tags = ['autodocs']` — same autodocs deprecation badges as above.
- `trigger` values used (`'loop'`, `'hover'`, `'once'`, `'ping-pong'`) all match the core type alias `packages/core/src/types.ts:209` which declares `AnimationTrigger = 'loop' | 'once' | 'hover' | 'appear' | 'ping-pong'`. **`'appear'` is the only valid trigger not covered by a story** — a documentation coverage gap, not a discrepancy.
- **Recommendation:** mirror the rewrite for PxlKitIcon. Rename `Monochrome` → use `appearance="solid"`. Add an `Appear` story to cover the 5th trigger.

### Core / PixelToast.stories.tsx
**Stories:** 11 (`Default`, `WithMessage`, `WithIcon`, `WithoutCloseButton`, `TopLeft/Right`, `BottomLeft/Right`, `CustomColors`, `AutoDismiss`)
**Components:** PixelToast
**Status:** ✅ no factual issues

- Every prop used (`visible`, `title`, `message`, `icon`, `colorfulIcon`, `iconSize`, `bgColor`, `borderColor`, `textColor`, `accentColor`, `position`, `duration`, `showClose`, `onClose`) matches `PixelToastProps` at `packages/core/src/types.ts:450–481`.
- `WithIcon` (L62–70) uses `colorfulIcon: true` — **this is a real `PixelToastProps` member**, not the deprecated `colorful` alias on icon components. Coherent.
- `position` values (`'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'`) match source — and correctly **do not** include `'top-center' / 'bottom-center'` (those exist only on the app-level `ToastProvider` wrapper, not on `PixelToastProps`).
- `meta.component = PixelToast` + `meta.tags = ['autodocs']` — autodocs accurate.
- `AutoDismiss` (L119–145) is the only render-function story; uses `useState` correctly to toggle `visible`.

---

## Cross-file findings

### CF-1. Deprecated `colorful` / `solid` / `tint` API usage across many files
Aggregate count of `colorful`, `tint`, or `solid` props passed to `PxlKitIcon` / `AnimatedPxlKitIcon` / `ParallaxPxlKitIcon` (the v1.2 deprecated alias path):

| File | Occurrences |
|---|---:|
| `packages/core/src/components/PxlKitIcon.stories.tsx` | 13 (one per story body) |
| `packages/core/src/components/AnimatedPxlKitIcon.stories.tsx` | 9 |
| `packages/ui-kit/src/animations.stories.tsx` | 10 |
| `packages/ui-kit/src/data-display.stories.tsx` | 7 |
| `packages/ui-kit/src/feedback.stories.tsx` | 6 |
| `packages/ui-kit/src/navigation.stories.tsx` | 3 |
| `packages/ui-kit/src/parallax.stories.tsx` | 7 |
| `packages/ui-kit/src/locale.stories.tsx` | 0 |
| `packages/ui-kit/src/surface.stories.tsx` | 0 |
| `packages/ui-kit/src/overlay.stories.tsx` | 0 |
| `packages/ui-kit/src/layout.stories.tsx` | 0 |
| `packages/ui-kit/src/actions.stories.tsx` | 0 (uses no icons in deprecated mode) |
| `packages/ui-kit/src/inputs.stories.tsx` | 0 |

**Total:** **55 deprecated-API call sites across 7 files.** None break functionality (the alias path is intact in `mergeLegacyProps`) but every one is a stale story that teaches the v1.2 API to new readers.

The `core/PxlKitIcon.stories.tsx` and `core/AnimatedPxlKitIcon.stories.tsx` files are the most acutely stale — every single story passes a deprecated prop. Highest-leverage to rewrite.

### CF-2. argType drift in animations.stories.tsx
`TRIGGERS` array at `animations.stories.tsx:20` is missing `'focus'` (4 values instead of 5 in source `AnimationTrigger`). All 11 animation stories use `animationBaseControls` which references this constant — so every animation story's `trigger` radio control under-represents the source union.

**Fix:** `const TRIGGERS = ['mount', 'hover', 'click', 'focus', 'inView'] as const;`

### CF-3. Unused import in inputs.stories.tsx
`packages/ui-kit/src/inputs.stories.tsx:16` imports `Lock` from `@pxlkit/feedback` but never uses it. Minor cleanup.

### CF-4. `meta.component` binding inconsistency
- Files that bind `meta.component` (enables autodocs + correct type inference for `StoryObj<typeof Component>`):
  - `core/PxlKitIcon.stories.tsx`
  - `core/AnimatedPxlKitIcon.stories.tsx`
  - `core/PixelToast.stories.tsx`
- Files that do NOT bind `meta.component` and use generic `Meta` + `StoryObj<any>`:
  - All 11 UI-Kit story files

The generic `Meta` + `StoryObj<any>` approach loses type-safety on `args` and disables autodocs introspection. The UI-Kit files compensate by writing argTypes explicitly and casting `args: any` in render functions. **Stylistic inconsistency, not a discrepancy** — but worth standardising. If the team wants autodocs in Storybook for UI-Kit components, switch each file's pattern to:

```ts
const meta: Meta<typeof PixelButton> = {
  title: 'UI Kit / Actions / PixelButton',
  component: PixelButton,
  tags: ['autodocs'],
};
```

(This would require splitting multi-component files like `actions.stories.tsx` into one per component, OR using one `meta` per group with autodocs disabled.)

### CF-5. No stories use a non-existent prop or invalid union literal
I verified every prop name and every literal-union value passed in args/argTypes across all 14 story files against the source-of-truth type definitions. **Zero ghost props.** Zero invalid `tone` values (no `'lime'`, `'pink'` is real, no `'orange'`, etc.). Zero invalid `position` / `axis` / `from` / `direction` / `size` / `surface` literals. Zero non-existent components imported.

### CF-6. PxlKitIcon size at L7 of PxlKitIcon.stories.tsx — `size: 16`
`size: 16` matches `GridSize` (the source-of-truth `GridSize` union is `8 | 16 | 24 | 32 | 48 | 64`). Coherent. Same applies to `AnimatedPxlKitIcon.stories.tsx:7` and `PixelToast.stories.tsx:8` (where `size: 8` is used for the small bell icon).

### CF-7. PixelToast position story coverage
`PixelToast.stories.tsx` covers the 4 corner positions (`TopLeft`, `TopRight`, `BottomLeft`, `BottomRight`) which are the only valid `PixelToastProps.position` values. Coherent — does NOT include `top-center`/`bottom-center` because those are wrapper-level (`ToastProvider`) positions, not component-level.

---

## Summary scorecard

| Category | Count |
|---|---:|
| Stories that pass a non-existent prop | **0** |
| Stories that import a non-existent component | **0** |
| Stories with invalid union literals in argTypes | **1** (`animations.stories.tsx` — missing `'focus'` trigger) |
| Stories using deprecated alias props | **55** (across 7 files) |
| Files with full v1.3-deprecated API in every story | **2** (`core/PxlKitIcon.stories.tsx`, `core/AnimatedPxlKitIcon.stories.tsx`) |
| Files with `meta.component` binding | **3** (all in core/) |
| Files using generic `Meta` + `StoryObj<any>` | **11** (all in ui-kit/) |
| Dead/unused imports | **1** (`Lock` in `inputs.stories.tsx`) |
| Coverage gap: `AnimationTrigger='appear'` (core) | **1** missing story in `AnimatedPxlKitIcon.stories.tsx` |
| Coverage gap: `trigger='focus'` (ui-kit animations) | **1** value not exposed in TRIGGERS const |

**Verdict:** the stories are factually accurate (no fake props, no broken imports, no invalid union literals) but **the two core icon stories files are entirely written against the v1.2 API**. Anyone exploring Storybook to learn the kit will see `colorful={true}`, `tint="#FF0000"`, `solid` — and miss the canonical v1.3 `appearance="palette" | "tinted" | "solid"` API entirely.

The highest-priority remediation is rewriting `core/PxlKitIcon.stories.tsx` (11 stories) and `core/AnimatedPxlKitIcon.stories.tsx` (9 stories) to use `appearance` + `color`. After that, an optional cleanup pass to update the 33 other deprecated-API call sites in UI-kit stories would complete the migration.

No regressions to flag — every story renders something real and passes valid runtime props.

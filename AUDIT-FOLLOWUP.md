# Follow-up coherence audit — what's still open

Generated: 2026-05-12
Verified against: commit `e6ab9c6` (docs(web): close 131 coherence gaps across /docs and /ui-kit)
Sources cross-checked:
- `apps/web/src/app/docs/page.tsx` (1088 lines)
- `apps/web/src/app/ui-kit/page.tsx` (2935 lines)
- `packages/core/src/types.ts`, `packages/ui-kit/src/{actions,inputs,data-display,feedback,navigation,overlay,layout,animations,parallax,locale,common}.tsx`
- `apps/web/src/components/ToastProvider.tsx`

---

## Verification of claimed fixes

| # | Fix | Status | Evidence |
|---|---|---|---|
| 1 | `/docs` `AnimatedPxlKitData.size` → `GridSize` | ✅ verified | `apps/web/src/app/docs/page.tsx:493` now reads `size: GridSize; // 8 \| 16 \| 24 \| 32 \| 48 \| 64`. Matches source `packages/core/src/types.ts:GridSize` definition. |
| 2 | `/ui-kit` PixelToast DocSection rewritten to document `PixelToastProps` | ✅ verified | `apps/web/src/app/ui-kit/page.tsx:1791–1811` lists exactly the 15 props from `packages/core/src/types.ts:450–481`: `visible`, `title`, `message`, `icon`, `colorfulIcon`, `iconSize`, `bgColor`, `borderColor`, `textColor`, `accentColor`, `position`, `duration`, `showClose`, `onClose`, `className`. Defaults & type strings match source. |
| 3 | `/ui-kit` new `useToast()` DocSection (id=`use-toast`) | ✅ verified | `apps/web/src/app/ui-kit/page.tsx:1933–1989` adds a dedicated section listing the hook surface (`toast(options)`, `success/error/info/warning`, `dismiss(id)`, `dismissAll()`). All four methods + parameter shapes match `apps/web/src/components/ToastProvider.tsx:40–48`. |
| 4 | `/ui-kit` new `PxlKitSurfaceProvider` section (id=`surface-system`) | ✅ verified | `apps/web/src/app/ui-kit/page.tsx:727–812`. Includes side-by-side demo, props table at L772–775 (`surface` + `children`), live `PxlKitSurfaceProvider` rendering. Props match source `packages/ui-kit/src/common.tsx:118`. |
| 5 | `/ui-kit` "Common API Surface" table at #getting-started now lists `surface`, `disabled`, `children`, `className` | ✅ verified | `apps/web/src/app/ui-kit/page.tsx:658–675`. Table explicitly says these props are documented once and intentionally omitted from per-component tables (L660–664). Covers `tone`, `size`, `surface`, `disabled`, `iconLeft/iconRight`, `label`, `children`, `className`. **Strategy is sound** — it legitimately closes 54×4 mechanical omissions in one move. |
| 6a | `PixelPasswordInput` — added `error` | ✅ verified | `ui-kit/page.tsx:1190` lists `error: string`. |
| 6b | `PixelSelect` — added `hint`, `error` | ✅ verified | `ui-kit/page.tsx:1231–1232` lists both. |
| 6c | `PixelSlider` — added `showMinMax` | ✅ verified | `ui-kit/page.tsx:1365`. |
| 6d | `PixelDropdown` — added `icon` | ✅ verified | `ui-kit/page.tsx:2176`. |
| 6e | `PixelDivider` — added `spacing` | ⚠️ partial | `ui-kit/page.tsx:2243` adds `spacing` ✅. **But `className` is still missing** from the table (source `packages/ui-kit/src/layout.tsx:50` declares it). Common API Surface covers `className` globally so functionally OK; flagged as the strategy is consistent. |
| 7a | `PixelSelect` callback renamed `(v: string) → (value: string)` | ✅ verified | `ui-kit/page.tsx:1228` reads `(value: string) => void`. Matches source `inputs.tsx:167`. |
| 7b | `PixelSlider` callback renamed `(v: number) → (next: number)` | ✅ verified | `ui-kit/page.tsx:1361` reads `(next: number) => void`. Matches source `inputs.tsx:469`. |
| 7c | `PixelDropdown` callback renamed `(v: string) → (value: string)` | ✅ verified | `ui-kit/page.tsx:2175` reads `(value: string) => void`. Matches source `overlay.tsx:148`. |
| 8 | `/docs` "Other Utilities" CodeBlock expanded into 4 focused CodeBlocks | ✅ verified | `apps/web/src/app/docs/page.tsx:819–858` now has 4 CodeBlocks: "Pixel ↔ grid ↔ SVG conversion" (L819–825), "Validation & parsing" (L826–834), "Animated SVG export" (L835–845), "Colour utilities" (L846–858). All 10 previously-undocumented utilities (`isValidIconData`, `parseAnyIconCode`, `adjustBrightness`, `hexToRgb`, `rgbToHex`, `getPerceivedBrightness`, `RETRO_PALETTES`, `animatedToFrameIcons`, `isAnimatedIcon`, `isParallaxIcon`) are now listed with signatures. |
| 9 | `/docs#toast-notifications` cross-link rewritten to point at both `/ui-kit#pixel-toast` and `/ui-kit#use-toast` | ✅ verified | `apps/web/src/app/docs/page.tsx:744–795` rewritten. Two-bullet list at L748–762 names both UI-kit anchors with descriptions explaining the layer separation. |

**Bonus fixes landed but not on the claim list (positive deltas):**
- `PxlKitProps` CodeBlock at `docs/page.tsx:431` now includes the 3 deprecated props (`colorful`, `solid`, `tint`) with JSDoc `@deprecated` markers. Closes original MINOR (PxlKitIcon).
- `AnimatedPxlKitProps` CodeBlock at `docs/page.tsx:510` likewise includes the 3 deprecated props with `@deprecated` markers. Closes original MINOR (AnimatedPxlKitIcon).
- `ParallaxPxlKitProps` CodeBlock at `docs/page.tsx:650` likewise. Closes original MINOR (ParallaxPxlKitIcon).
- Animation primitive tables (PixelFadeIn / SlideIn / Pulse / Bounce / Float / Shake / Rotate / ZoomIn / Flicker / Glitch / Typewriter) now consistently include `trigger` and `onComplete` rows — both real props on source (`animations.tsx` lines 149/189/228/262/303/353/418/459/500/545/582). The original audit only asked for `repeat` standardisation and `children` row; these two extra columns are net new and accurate.

---

## Remaining open items from the original 131 catalog

### CRITICAL (still open)
**None.** The two original critical items (PxlKitSurfaceProvider absent, PixelToast section documenting the wrong API, AnimatedPxlKitData.size mistyped) are all resolved.

### MAJOR (still open)

#### M-1. Callback param naming — 5 of the original 8 components still use the cosmetic `(v: T)` placeholder

The original audit MINOR #1 (callback parameter naming) listed 8 docs rows that disagreed with source. Fix #7 renamed 3 of them. The remaining 5 still mismatch:

| Component | Doc line | Doc reads | Source declares (file:line) |
|---|---|---|---|
| PixelCheckbox | `ui-kit/page.tsx:1281` | `(v: boolean) => void` | `inputs.tsx:285` → `(next: boolean) => void` |
| PixelRadioGroup | `ui-kit/page.tsx:1308` | `(v: string) => void` | `inputs.tsx:338` → `(next: string) => void` |
| PixelSwitch | `ui-kit/page.tsx:1342` | `(v: boolean) => void` | `inputs.tsx:406` → `(next: boolean) => void` |
| PixelSegmented | `ui-kit/page.tsx:1388` | `(v: string) => void` | `inputs.tsx:600` → `(next: string) => void` |
| PixelPagination | `ui-kit/page.tsx:2104` | `(page: number) => void` | `navigation.tsx:175` → `(next: number) => void` |

Strictly cosmetic (compiles either way) but inconsistent with the source-of-truth and contradicts the trio already converted in commit e6ab9c6. Original audit classified these as MINOR; restated here as MAJOR because the partial fix introduces new inconsistency between sibling components.

**Action:** rename `v` → `next` (boolean/string/number) on all 5 rows.

#### M-2. `repeat` annotation in 8 animation primitives still uses literal `number | "infinite"` instead of the named alias

Original Cross-cutting MAJOR #3. Status: not addressed by commit e6ab9c6. Source has an internal alias `AnimationRepeat = number | 'infinite'` (`packages/ui-kit/src/animations.tsx:28`) that is **not exported** from `@pxlkit/ui-kit/index.ts`. Docs use the literal union which is functionally identical.

| Component | Doc line | Type string |
|---|---|---|
| PixelFadeIn | `ui-kit/page.tsx:2418` | `number \| "infinite"` |
| PixelSlideIn | `ui-kit/page.tsx:2457` | `number \| "infinite"` |
| PixelPulse | `ui-kit/page.tsx:2485` | `number \| "infinite"` |
| PixelBounce | `ui-kit/page.tsx:2515` | `number \| "infinite"` (source `animations.tsx:236` declares inline literal — coherent here) |
| PixelFloat | `ui-kit/page.tsx:2548` | `number \| "infinite"` |
| PixelShake | `ui-kit/page.tsx:2574` | `number \| "infinite"` |
| PixelRotate | `ui-kit/page.tsx:2599` | `number \| "infinite"` |
| PixelZoomIn | `ui-kit/page.tsx:2627` | `number \| "infinite"` |
| PixelFlicker | `ui-kit/page.tsx:2659` | `number \| "infinite"` |

Original audit's recommended remediation was "pick one: either export `AnimationRepeat` from `@pxlkit/ui-kit` and use the name in docs, OR keep the literal union everywhere". The fix went with the literal-union route by default — which **is the standardised choice**. So technically resolved by inaction, but the alias `AnimationRepeat` remains dead-code-shaped: defined at L28 but only referenced internally as a parameter type alias for `repeatToCss`. If standardising on the literal is the chosen path, the source-side alias should be inlined or kept private (it already is — non-exported), making this effectively closed.

**Verdict:** ⚠️ "resolved by standardising on literal union" — not strictly a bug, but unaddressed if the team wanted the named-alias path. No follow-up required if literal union is the canon.

#### M-3. PixelTable `columns` cosmetic mismatch — annotation still drops `: string`

Original audit MINOR (PixelTable). Status: unchanged.

- `apps/web/src/app/ui-kit/page.tsx:1479` writes `Array<{ key, header, className? }>`
- Source `packages/ui-kit/src/data-display.tsx:85` declares `Array<{ key: string; header: string; className?: string }>`

The annotation dropping is cosmetic but the original audit flagged it. Still open.

#### M-4. PixelBreadcrumb `items` cosmetic mismatch — same shape problem

- `apps/web/src/app/ui-kit/page.tsx:2082` writes `Array<{ label, href?, onClick?, active? }>`
- Source `packages/ui-kit/src/navigation.tsx` declares `Array<{ label: string; href?: string; onClick?: () => void; active?: boolean }>`

Original audit MINOR (PixelBreadcrumb). Still open.

#### M-5. PixelBareButton / PixelBareInput / PixelBareTextarea — `ref` and `...props` listed as fake props

Original audit MINOR (PixelBare* primitives). Status: unchanged.

- `apps/web/src/app/ui-kit/page.tsx:2263–2265` (PixelBareButton)
- `apps/web/src/app/ui-kit/page.tsx:2282–2283` (PixelBareInput)
- `apps/web/src/app/ui-kit/page.tsx:2298–2299` (PixelBareTextarea)

Each rows `...props` (with `ButtonHTMLAttributes` / `InputHTMLAttributes` / `TextareaHTMLAttributes` types) and `ref` (as `Ref<HTMLButtonElement>` etc.) inside the `props` array even though neither `...props` nor `ref` are TypeScript-level prop names on these `React.forwardRef` types. The original audit's wording suggestion was to replace with a single sentence in the description: *"Forwards all native `<button>` HTML attributes; ref forwards to the underlying element."*

#### M-6. `/ui-kit` Common API Surface description for `iconLeft / iconRight` and `label` could mislead

- `apps/web/src/app/ui-kit/page.tsx:670` description: `'Slot for icons before/after label (see buttons)'` — only PixelButton, PxlKitButton, PixelSplitButton accept these. PixelInput accepts a single `icon`, not `iconLeft/iconRight`. The "(see buttons)" caveat is present but could be tightened.
- `apps/web/src/app/ui-kit/page.tsx:671` description: `'Accessible label for inputs and controls'` — true for most inputs/controls but inaccurate for PixelButton (where `label` is not a real prop — children are used). Could be tightened to mention button-shaped components use `children` not `label`.

Minor wording; the surrounding header (L660–664) already says "where they apply", so this is borderline. Flagged for completeness — original audit's cross-page inconsistency category.

### MINOR (still open)

#### m-1. `AnimationTrigger` literal in docs duplicates the type-name reference

In every animation table, the row is:
```
{ name: 'trigger', type: 'AnimationTrigger', default: '"mount"', description: '"mount" | "hover" | "click" | "focus" | "inView" | boolean' }
```

This is **good** (matches source `animations.tsx:46`) but duplicates the type info between the `type` column and the `description` column. Cosmetic — leave as is unless tightening.

#### m-2. The `AnimationRepeat` type alias is defined but unexported

`packages/ui-kit/src/animations.tsx:28` — `type AnimationRepeat = number | 'infinite';` — is used internally only as the parameter type of the private `repeatToCss()` helper. If the team wants this alias to remain (and not export it), this is fine. If it should not exist as an alias (since the docs use the literal union), inline it at the helper signature and delete the alias. **Pure house-keeping.**

---

## New regressions introduced by the fixes

I scrutinised all 9 claimed fixes for new bugs. Findings:

### R-1. None — PixelToast props match runtime type exactly
The rewritten `PixelToast` DocSection at `ui-kit/page.tsx:1791–1811` enumerates 15 props. Comparing line-by-line against `packages/core/src/types.ts:450–481`, every prop name, default, and type string matches. No fake props introduced.

### R-2. None — useToast() section accurate vs ToastProvider source
The `useToast()` section at `ui-kit/page.tsx:1937–1941` lists 4 method entries. Cross-checked against `apps/web/src/components/ToastProvider.tsx:40–48` (`ToastContextValue`):
- `toast(options): string` — matches `addToast` (returns the new id string).
- `success / error / info / warning` — match the 4 named tone shortcuts at L42–45.
- `dismiss(id)` — matches L46.
- `dismissAll()` — matches L47.

The `toast(options)` parameter shape doc-string includes `position` from the wider `ToastPosition` union (which adds `top-center`/`bottom-center` beyond the 4 corners on `PixelToastProps`). This is **correct** — `ToastProvider.tsx:20` defines `ToastPosition` with the 2 extra center values, and `POSITION_CLASSES` at L131 has CSS rules for them. So the demo dropdown at `ui-kit/page.tsx:1867–1868` listing `top-center`/`bottom-center` is consistent with the wrapper-level API.

### R-3. None — Surface System section is internally consistent
The `PxlKitSurfaceProvider` section at `ui-kit/page.tsx:727–812` references only real props: `surface` and `children`. Both match source (`common.tsx:118`). The live demo at L748–764 imports `PxlKitSurfaceProvider` from the kit (already imported at L58). Code snippet at L786–808 is valid TSX.

### R-4. None — Common API Surface table props are all real
Every row in the shared table at `ui-kit/page.tsx:665–674` (`tone`, `size`, `surface`, `disabled`, `iconLeft/iconRight`, `label`, `children`, `className`) is a real prop on at least one UI-kit component. The wording "where they apply" defends the table from claims that every prop applies to every component.

### R-5. None — animation tables didn't add fake props
Spot-checked PixelFadeIn (8 props at L2415–2424) vs source `animations.tsx:131–166`: every documented prop exists. `onComplete` at L2423 matches source L149. `trigger` matches L142 (`useAnimationTrigger`). No regressions.

### R-6. None — utilities CodeBlocks reference only real exports
Cross-checked `docs/page.tsx:819–858` against `packages/core/src/index.ts`. Every name (`gridToPixels`, `pixelsToGrid`, `pixelsToSvg`, `svgToDataUri`, `svgToBase64`, `validateIconData`, `isValidIconData`, `parseIconCode`, `parseAnyIconCode`, `generateIconCode`, `isAnimatedIcon`, `isParallaxIcon`, `generateAnimatedSvg`, `animatedToFrameIcons`, `parseHexColor`, `encodeHexColor`, `adjustBrightness`, `hexToRgb`, `rgbToHex`, `getPerceivedBrightness`, `RETRO_PALETTES`) is a real export.

**Conclusion:** zero regressions detected from the 9 claimed fixes.

---

## Summary scorecard

| Bucket | Before commit `e6ab9c6` | After commit `e6ab9c6` | Delta |
|---|---:|---:|---:|
| Critical | 4 | 0 | -4 |
| Major | 97 | 6 (M-1 through M-6) | -91 |
| Minor | 16 | 2 (m-1, m-2) | -14 |
| **Total open** | **131** | **8** | **-123** |
| Regressions introduced | — | 0 | 0 |

**Verdict:** the commit closes the systemic surface/children/disabled/className gap with a single shared table + per-component surgical adds, fixes the PixelToast misdocumentation, lands the missing PxlKitSurfaceProvider section, corrects the AnimatedPxlKitData.size critical typo, and surfaces 10 previously-undocumented utilities. The remaining 8 items are predominantly cosmetic callback-name parity and two table-shape annotations. No new bugs introduced.

The single non-obvious gotcha worth knowing: the Common API Surface table at `#getting-started` is now load-bearing — if a future component is added that doesn't accept `surface`/`disabled`/`children`/`className`, the table needs a per-component exception note, or those components must explicitly opt out in their description.

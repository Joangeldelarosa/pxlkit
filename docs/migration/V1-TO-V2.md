# Migrating from `@pxlkit/ui-kit` v1.x → v2.0

> **TL;DR:** v2.0 is **mostly drop-in**. The public API of every v1 component is preserved. The bulk of v2 is **additive** (57 new components, new SSOT-backed docs, new surface variants). The only real "breaking" notes are around (a) **internal source layout** if you were deep-importing past the package boundary, (b) the **`PxlKitButton` → `PixelIconButton` rename**, which is already aliased, and (c) the **forwardRef contract** if you were forking components.

---

## Quick assessment — do I actually need to change anything?

Answer the three questions below. If all three are **no**, you can bump the version and ship without touching code.

1. Were you importing from anything **other than** the package root, e.g. `@pxlkit/ui-kit/dist/actions` or `@pxlkit/ui-kit/src/...`?
2. Were you depending on **`PxlKitButton`** as the canonical name in your codebase, types, or generated docs?
3. Were you **forking / wrapping** ui-kit components and forwarding refs yourself?

If any are **yes**, read the matching section below.

---

## 1. Renames

### `PxlKitButton` → `PixelIconButton`

`PxlKitButton` was the historical name for the icon-only button variant. In v2 the canonical name is **`PixelIconButton`** to align with the `Pixel*` naming convention used by every other component.

**Status:** `PxlKitButton` is **still exported** as a deprecated alias. Existing code keeps working. There is **no runtime change**.

**Recommended migration (optional in v2.x, required in v3):**

```diff
- import { PxlKitButton } from '@pxlkit/ui-kit';
+ import { PixelIconButton } from '@pxlkit/ui-kit';

- <PxlKitButton icon={<MyIcon />} aria-label="Save" />
+ <PixelIconButton icon={<MyIcon />} aria-label="Save" />
```

**Codemod (sed / ripgrep one-liner):**

```bash
# *nix / WSL / Git Bash
rg -l 'PxlKitButton' src/ | xargs sed -i 's/PxlKitButton/PixelIconButton/g'
```

```powershell
# Windows PowerShell
Get-ChildItem -Path src -Recurse -Include *.tsx,*.ts |
  ForEach-Object { (Get-Content $_) -replace 'PxlKitButton','PixelIconButton' | Set-Content $_ }
```

The component manifest is unchanged — same props, same behaviour, same surface support. Only the symbol name changes.

---

## 2. Public API stability

Every component shipped in v1.x keeps its **prop signature, default behaviour, and visual output** in v2.0. Where v2 adds new features (variants, sizes, compositional sub-components, etc.) the additions are **opt-in** and ignored if you don't pass them.

Concretely, all of these continue to work without code changes:

- `PixelButton`, `PixelInput`, `PixelPasswordInput`, `PixelTextarea`, `PixelSelect`, `PixelCheckbox`, `PixelRadioGroup`, `PixelSwitch`, `PixelSlider`, `PixelSegmented`
- `PixelCard`, `PixelStatCard`, `PixelTable`, `PixelAvatar`, `PixelBadge`, `PixelChip`, `PixelTextLink`, `PixelCollapsible`, `PixelCodeInline`, `PixelKbd`, `PixelColorSwatch`
- `PixelSection`, `PixelDivider`, `PixelAlert`, `PixelProgress`, `PixelSkeleton`, `PixelEmptyState`
- `PixelTabs`, `PixelAccordion`, `PixelBreadcrumb`, `PixelPagination`
- `PixelModal`, `PixelTooltip`, `PixelDropdown`
- All `Pixel*` animation wrappers, all parallax components, all locale exports

If you were on `1.9.x` and only used the public surface, **a `npm install @pxlkit/ui-kit@2`** is the whole migration.

---

## 3. Source layout (internal, but worth flagging)

In v1.x several categories lived as single bulk files (`actions.tsx`, `data-display.tsx`, `inputs.tsx`, etc.) re-exported from the package entry. In v2 these were refactored into the **folder + `index.ts`** pattern (Ola 4d):

```
src/actions.tsx                  →  src/actions/index.ts
                                    src/actions/PixelButton.tsx
                                    src/actions/PixelIconButton.tsx
                                    src/actions/PixelSplitButton.tsx
                                    src/actions/_internal/*
```

**Why this matters:** if you were importing from anything other than the package root, those paths no longer resolve.

```diff
- import { PixelButton } from '@pxlkit/ui-kit/dist/actions';   // ❌ no longer exists
- import { PixelButton } from '@pxlkit/ui-kit/src/actions';    // ❌ no longer exists
+ import { PixelButton } from '@pxlkit/ui-kit';                // ✅ canonical
```

**The package root re-exports every public component.** Always import from `@pxlkit/ui-kit`. Deep imports were never part of the supported API.

---

## 4. `forwardRef` contract (forks / wrappers only)

In v2 every interactive component (buttons, inputs, overlays, etc.) is implemented with `React.forwardRef` and a named `displayName`. This matches the `feedback.tsx` `PixelAlert` reference pattern and unblocks ref-driven integrations (focus management, scroll-into-view, animation libraries).

If you were **wrapping a ui-kit component and forwarding refs of your own**, your wrapper must also be a `forwardRef` to compose cleanly:

```diff
- export function MySaveButton(props: MyProps) {
-   return <PixelButton {...props} />;
- }
+ export const MySaveButton = React.forwardRef<HTMLButtonElement, MyProps>(
+   (props, ref) => <PixelButton ref={ref} {...props} />
+ );
+ MySaveButton.displayName = 'MySaveButton';
```

If you were **not** forwarding refs, no change is required — passing a ref to a wrapped component is exactly as well-defined as it was in v1 (i.e. it would warn). v2 simply makes the inner ref actually do something.

---

## 5. Polymorphic `as` prop

A handful of layout primitives accept an `as` prop to change the rendered element. In v1 these were typed with `React.ElementType<any>` for ergonomic reasons. In v2 the typing was tightened to a **literal cast** (Ola 1 + 4d hardening) so TypeScript strict-mode consumers no longer see implicit-any leaks.

**Consumer impact:** none in JS. In strict TS, if you were assigning a dynamic union to `as` you may need an explicit cast at the call site:

```diff
- <PixelBox as={Component} />
+ <PixelBox as={Component as 'div'} />   // when Component's tag is known
```

For most users this never fires.

---

## 6. New features you get for free in v2.0

Even with zero code changes, upgrading to v2.0 gives you:

- **57 new components** (DataTable, Carousel, Timeline, charts, Hero family, Pricing/Feature/Testimonial cards, Bento, Combobox, MultiSelect, DatePicker family, Form/RHF wrapper, Modal/Drawer/Sheet/AlertDialog/Command palette, 18 Ola 4a kit-depth additions).
- **Surface system** — switch any subtree to `linear` via `<PxlKitSurfaceProvider surface="linear">` for a modern aesthetic with zero refactor.
- **Locale system** — `PxlKitLocaleProvider` with Turkish-safe casing helpers.
- **30 audit gates** running on every PR — drift impossible, breaking changes flagged in CI.
- **WCAG 2.1 AA** verified per component (focus rings, focus traps in overlays, keyboard nav, aria-* contracts).

---

## 7. Cheatsheet

| Change | Action required |
| --- | --- |
| `PxlKitButton` symbol in your code | Optional rename to `PixelIconButton` — alias still ships. |
| Deep imports past package root | Switch to `@pxlkit/ui-kit` root import. |
| Wrapped components forwarding refs | Use `React.forwardRef` in your wrapper. |
| Strict-TS `as` prop with dynamic union | Add explicit cast at call site. |
| Anything else | None — straight `npm install @pxlkit/ui-kit@2`. |

---

## 8. Reporting an issue

If you find a v1 → v2 regression that isn't covered here, please open an issue at [github.com/joangeldelarosa/pxlkit/issues](https://github.com/joangeldelarosa/pxlkit/issues) with a minimal repro. We treat v2.0 → v2.x as **fully backwards-compatible** under the project's [VERSIONING policy](../governance/VERSIONING.md); any genuine break is a bug.

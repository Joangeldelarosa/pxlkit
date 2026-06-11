# ADR-0004: Carry Forward PxlKitButton Removal to v3.0.0

- **Status:** Accepted
- **Date:** 2026-06-11

## Context

`PxlKitButton` was deprecated as an alias of `PixelIconButton` (the `PxlKit*`
prefix is reserved for system primitives; leaf components use `Pixel*`). Its
manifest and JSDoc promised removal "in the next major", which at the time
meant **v2.0.0**.

v2.0.0 (Master Overhaul) shipped on 2026-05-31 **without removing the alias**:
the release focused on the SSOT migration, the bulk-file split, and the
coherence lock-in, and the removal was not in scope. The alias is still
exported from `packages/ui-kit/src/actions` and listed in `registry.ts`.

`docs/governance/DEPRECATION_POLICY.md` rule 2 states that a deprecation not
removed at its target major "gets explicitly re-justified in an ADR and
carried forward". This is that ADR.

Separately, the manifest lacked `deprecatedRemovedIn`, which the
`deprecated-lifecycle` coherence gate (gate 17) requires for every
`status: 'deprecated'` manifest. The monthly deprecation-review workflow
exists to catch exactly this case (issue #55).

## Decision

- The removal of `PxlKitButton` (and the `PxlKitButtonProps` type alias) is
  **carried forward to v3.0.0**.
- The manifest now declares `deprecatedRemovedIn: '3.0.0'`, satisfying the
  lifecycle gate's window rule (removal major ≤ current major + 1).
- The alias remains a zero-cost re-export of `PixelIconButton` until then —
  no runtime divergence is permitted between the two names.
- No other deprecations are carried forward by this ADR.

## Consequences

- Consumers on 2.x keep a working `PxlKitButton` with deprecation warnings;
  they migrate by renaming the import to `PixelIconButton` (mechanical
  search-replace, no prop changes).
- v3.0.0's breaking-change checklist must include this removal: delete the
  re-export and type alias in `PixelIconButton.tsx`, drop the name from
  `registry.ts`, delete `PxlKitButton.manifest.ts` and
  `PxlKitButton.examples.tsx`, and record the removal in the CHANGELOG under
  `### Removed`.
- If v3.0.0 ships without the removal again, this ADR must be superseded by
  a new one — silent carry-forward is not an option.

## Alternatives considered

- **Remove immediately.** Removing a stable export outside a major violates
  semver and our own policy; cutting v3.0.0 just for one alias is not
  justified.
- **Un-deprecate the alias.** Keeping two permanent names for one component
  contradicts ADR-0002's naming system (`PxlKit*` = system primitives) and
  doubles the documented surface forever.

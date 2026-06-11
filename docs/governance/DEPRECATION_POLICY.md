# Deprecation Policy

**Status:** Active
**Scope:** All public surfaces of `@pxlkit/ui-kit` and any package published from this monorepo.
**Owners:** Core maintainers.

## Purpose

Define how we retire public API surface (components, props, tokens, exports, hooks, utilities) without breaking downstream consumers without warning. This policy is the contract: if it is not followed, the change does not ship.

## Definitions

- **Public surface**: anything exported from a package's `main`/`module`/`exports` entry, anything documented in the showcase or `README.md`, and any prop, slot, or CSS custom property referenced in published docs.
- **Deprecated**: still works, still ships, emits a warning, scheduled for removal.
- **Removed**: no longer exists. Importing or using it fails (compile-time or runtime).

## Rules (non-negotiable)

1. **Minimum one minor release of deprecation warning before removal.** If a deprecation lands in `1.4.0`, the earliest possible removal is `2.0.0`. There is no shortcut, including for "obvious" or "unused" APIs.
2. **Removal happens in the next major release after the deprecation, not later.** We do not let deprecations rot. If a deprecation in `1.4.0` is not ready to remove by `2.0.0`, it gets explicitly re-justified in an ADR and carried forward — but the default is: remove at the next major.
3. **No silent deprecations.** Every deprecation lands in the manifest, the CHANGELOG, the showcase, and the migration guide simultaneously. If any of those four is missing, the PR does not merge.
4. **A codemod or a documented manual migration is required.** "Just rewrite your code" is not a migration plan.

## Procedure

Every deprecation follows these steps, in order. Each step has a concrete artifact.

### 1. Update the deprecation manifest

File: `packages/ui-kit/src/_meta/deprecations.json` (canonical source of truth).

```jsonc
{
  "ButtonV1": {
    "since": "1.4.0",
    "removeIn": "2.0.0",
    "replacement": "Button",
    "reason": "Unified Button API with variant prop; ButtonV1 was an early shim.",
    "migration": "docs/migrations/buttonv1-to-button.md",
    "codemod": "scripts/codemods/buttonv1-to-button.ts"
  }
}
```

Every field is required. `codemod` may be `null` only if `migration` documents a mechanical search-replace that a human can do in under one minute per occurrence.

### 2. Emit a runtime / compile-time warning

- **TypeScript surface**: add `@deprecated` JSDoc with the `since`, `removeIn`, and `replacement`. This surfaces in IDEs and `tsc`.

  ```ts
  /**
   * @deprecated since 1.4.0, removed in 2.0.0. Use {@link Button} with `variant="legacy"`.
   * Migration: docs/migrations/buttonv1-to-button.md
   */
  export function ButtonV1(props: ButtonV1Props): JSX.Element;
  ```

- **Runtime (components/hooks)**: emit a `console.warn` exactly once per mount, gated by `process.env.NODE_ENV !== 'production'`. Message format:

  ```
  [pxlkit] ButtonV1 is deprecated since 1.4.0 and will be removed in 2.0.0.
  Use Button instead. See docs/migrations/buttonv1-to-button.md
  ```

- **Removed tokens / CSS vars**: leave a CSS comment in the compiled output pointing to the new token name.

### 3. Update the CHANGELOG

Under the next release's `### Deprecated` section, in this exact format:

```md
### Deprecated

- `ButtonV1` — use `Button` with `variant="legacy"`. Removed in `2.0.0`. Codemod: `npx pxlkit-codemod buttonv1-to-button`. Migration guide: [docs/migrations/buttonv1-to-button.md](../migrations/buttonv1-to-button.md).
```

If multiple deprecations land in one release, each gets its own bullet.

### 4. Banner in the showcase

The showcase reads `deprecations.json` at build time and renders a yellow banner on every deprecated component's page:

> Deprecated in `1.4.0`, removed in `2.0.0`. Use `Button` (linked to its showcase page). Migration guide: `docs/migrations/buttonv1-to-button.md`.

This banner is generated, not hand-written. If it does not show up, the manifest entry is malformed.

### 5. Auto-generated migration guide

`scripts/build-docs/gen-migrations.ts` reads `deprecations.json` and produces / updates `docs/migrations/<from>-to-<to>.md` with:

- What changed and why (pulled from `reason`).
- Side-by-side before/after code samples (pulled from the component's `__examples__/` folder).
- Codemod invocation, if a codemod exists.
- Manual checklist, otherwise.

The author of the deprecation fills in the before/after examples; the rest is generated.

## Removal

When `removeIn` lands in a real release:

1. Delete the deprecated export, prop, or token.
2. Move the manifest entry from `deprecations.json` to `removals.json` with the actual removal version.
3. Update the CHANGELOG `### Removed` section, linking back to the original deprecation release.
4. Run the migration guide's codemod against the showcase and internal usages before publishing — there must be zero internal consumers of the removed API at the time of removal.

## Enforcement

- The coherence audit (`.github/workflows/coherence-audit.yml`) fails the build if any item in `deprecations.json` is missing a `migration` field, a CHANGELOG entry, or a showcase banner.
- The deprecation review workflow (`.github/workflows/deprecation-review.yml`) runs on a schedule and opens an issue for any deprecation whose `removeIn` is the next major and which still has internal consumers.

## Examples of what counts as a breaking change requiring this policy

- Renaming a prop (`color` → `tone`).
- Removing a variant value (`variant="ghost"` no longer accepted).
- Tightening a type (`string` → `'sm' | 'md' | 'lg'`).
- Changing default behavior (default `size` changes from `md` to `sm`).
- Renaming a CSS custom property (`--pxl-button-bg` → `--pxl-btn-bg`).
- Removing a slot or render prop.

Anything in this list goes through this policy. No exceptions for "small" or "internal-ish" changes.

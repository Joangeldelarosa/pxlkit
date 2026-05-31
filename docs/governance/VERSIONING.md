# Versioning

pxlkit follows [Semantic Versioning 2.0.0](https://semver.org/spec/v2.0.0.html), strictly. This document defines how we apply it in practice, what we consider a breaking change, and how a code change translates into a version bump.

Read this together with [`API_STABILITY.md`](./API_STABILITY.md). Stability tells you *what we promise*; versioning tells you *how we signal* when that promise changes.

---

## Semver, strictly

Every published package version has the shape `MAJOR.MINOR.PATCH`.

- **MAJOR** — incremented for incompatible API changes.
- **MINOR** — incremented for backward-compatible feature additions.
- **PATCH** — incremented for backward-compatible bug fixes.

No exceptions. Not for "small" breaking changes. Not for "obvious" ones. Not because we are between two milestones and want the version number to "feel right". If we break a `stable` API, the next release is a major. If we cannot accept the major bump right now, we do not ship the break.

Pre-release identifiers (`1.4.0-beta.1`, `2.0.0-rc.3`) are used for previews. Build metadata (`+sha.abc123`) is reserved for CI and not promised stable.

---

## What constitutes a breaking change

A breaking change is **any change that requires a consumer of a `stable` API to modify their code, types, build, or runtime configuration to keep their existing usage working**.

### Type-level breaks

- Removing or renaming an exported symbol (component, hook, type, constant).
- Removing or renaming a public prop or method.
- Making an optional prop required.
- Narrowing a prop's accepted type (e.g. `string | number` → `string`).
- Widening a return type in a way that breaks downstream inference.
- Removing an overload.
- Changing the module path of an export (e.g. moving from top-level to a subpath).

### Runtime-level breaks

- Changing the default value of a prop in a way that alters rendered output or behavior.
- Changing the DOM structure of a component in a way that breaks documented CSS hooks (e.g. `data-*` attributes, BEM class names, ref targets).
- Changing the order or semantics of callback arguments.
- Changing peer dependency ranges to exclude a previously supported version.
- Raising the minimum Node, React, or TypeScript version.

### Not breaking changes

- Adding a new optional prop.
- Adding a new exported symbol.
- Adding a new overload, provided existing overloads still resolve identically.
- Loosening a type (e.g. `string` → `string | number`), provided downstream inference does not regress.
- Fixing a bug where the previous behavior contradicted documented behavior.
- Internal refactors with no observable surface change.
- Performance improvements with no observable surface change.
- Visual tweaks within documented design tokens, when the component does not promise pixel stability.

### The "obvious bug" rule

If a `stable` symbol has behavior that is clearly a bug — it throws on documented input, it returns the wrong type, it leaks memory — we may fix it in a patch even if some consumer has worked around the bug. We will note the fix in `CHANGELOG.md` under `Fixed` with a clear description so workaround code can be cleaned up.

This is not a license to relabel breaking changes as bug fixes. If the previous behavior was documented, intentional, or non-obviously wrong, it is a break, and it needs a major.

---

## Pre-1.0 rules

While the package version is `0.x.y`:

- The MAJOR slot is locked at `0`.
- **MINOR bumps may contain breaking changes.** This is the standard semver carve-out for `0.x`.
- PATCH bumps remain backward-compatible bug fixes only.
- We still write a `Breaking` section in `CHANGELOG.md` when a minor contains a break, with the same migration notes a post-1.0 major would carry.
- Consumers should pin with `~0.x.y` (patch range), not `^0.x.y` (minor range).

Reaching `1.0.0` is a deliberate decision, not a side effect of accumulating features. It happens when:

- The core surface (every `apiStability: 'stable'` symbol) has been stable through at least two `0.x` minors with no breaking changes.
- We are willing to maintain the current API for at least 12 months without a major bump.
- The CHANGELOG, ADRs, and migration runbooks are coherent for someone arriving at the project today.

## Post-1.0 rules

Once the package is `1.0.0` or higher:

- MAJOR is the only slot that may contain breaking changes.
- MINOR is for backward-compatible additions and `beta` API changes (which are scoped breaks consumers opted into).
- PATCH is for backward-compatible bug fixes only.
- Each major must ship with: a migration runbook in `docs/runbooks/`, a `CHANGELOG.md` `Breaking` section, and a codemod where mechanically possible.

---

## Version bump trigger map

The CHANGELOG follows [Keep a Changelog](https://keepachangelog.com/). Each section header maps to a version bump:

| CHANGELOG section | Pre-1.0 bump  | Post-1.0 bump | Notes                                                                 |
| ----------------- | ------------- | ------------- | --------------------------------------------------------------------- |
| `Added`           | MINOR         | MINOR         | New `stable`, `beta`, or `experimental` symbol.                       |
| `Changed`         | MINOR         | MINOR         | Backward-compatible behavior change, or `beta` API revision.          |
| `Deprecated`      | MINOR         | MINOR         | Marking an existing symbol for removal in a future major.             |
| `Removed`         | MINOR         | MAJOR         | Removing a `stable` symbol. `experimental` removals can be PATCH.     |
| `Fixed`           | PATCH         | PATCH         | Bug fix that does not change documented behavior.                     |
| `Security`        | PATCH         | PATCH         | Security fix. Promote to MINOR if the fix requires a config change.   |
| `Breaking`        | MINOR (0.x)   | MAJOR         | Any change matching the "breaking change" definition above.           |

### Worked examples

**You added a new optional prop to `Button`.**
→ `Added` entry. MINOR bump.

**You fixed a bug where `Tooltip` rendered above the viewport on small screens.**
→ `Fixed` entry. PATCH bump.

**You renamed `Card`'s `variant` prop from `'outline'` to `'outlined'`.**
→ `Breaking` entry. MAJOR bump post-1.0, MINOR bump pre-1.0. Ships with a codemod and a migration note.

**You deprecated `Spinner` in favor of `Loader`.**
→ `Deprecated` entry for `Spinner` plus `Added` entry for `Loader`. MINOR bump. The actual removal of `Spinner` is a future MAJOR.

**You changed an `experimental` hook's signature.**
→ `Changed` entry, called out as experimental. MINOR bump. No deprecation window required.

**You bumped the minimum React peer from `18.0` to `18.2`.**
→ `Breaking` entry. MAJOR bump post-1.0. Document the reason in the CHANGELOG.

**You promoted `useTheme` from `beta` to `stable`.**
→ `Changed` entry. MINOR bump. Not a break; the contract is strengthened, not loosened.

---

## How the bump gets decided

1. The contributor adds a CHANGELOG entry under the appropriate section as part of their PR.
2. CI runs the coherence audit, which checks that the manifest changes match the CHANGELOG sections used (e.g. you cannot add a `Removed` entry without the corresponding manifest no longer existing).
3. The ship agent reads the CHANGELOG, computes the required bump from the trigger map above, applies it to `package.json`, tags the release, and publishes.

Contributors do not edit `package.json` version fields directly. The CHANGELOG is the source of truth for what kind of release this is.

---

## Yanking and re-publishing

If a published version is found to be broken or to contain a security issue:

- We publish a follow-up PATCH (or MINOR/MAJOR if the fix itself requires it) with the fix and a `Fixed` or `Security` entry.
- The broken version is deprecated on the registry with `npm deprecate` and a message pointing to the fix.
- We do not unpublish, except in the narrow cases where the registry's unpublish policy requires it (e.g. accidental leak of secrets).

The version number never goes backward, and the same version number is never republished with different contents.

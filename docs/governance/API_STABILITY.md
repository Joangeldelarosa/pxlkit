# API Stability

This document defines the stability contract pxlkit makes with consumers for every exported surface. Read this before you depend on anything that is not marked `stable`, and before you ship anything that is.

Stability is a **per-symbol** promise, not a per-package one. The same package can ship `stable` primitives next to `experimental` ones. The tier travels with the symbol, declared in its manifest.

---

## The three tiers

### `stable`

The default tier for anything we believe in. A `stable` symbol will not break in any release of the current major (`1.x`, `2.x`, etc.).

What "will not break" means, precisely:

- The public type signature does not change in a backward-incompatible way.
- Required props stay required; optional props stay optional.
- Documented behavior does not change in a way that would silently corrupt a downstream caller.
- Default values do not shift in a way that changes visual or functional output.
- Deprecation is allowed, but the symbol keeps working until the next major.

Bug fixes are not breaking changes, even if they change observed output, provided the previous output was contrary to documented behavior.

### `beta`

A symbol that is shipped, documented, and supported, but **may break in any minor release**. We use this when we want feedback from real consumers before locking the surface.

Promise to consumers:

- The symbol works and is tested.
- The signature may change in `1.(N+1).0`.
- We will mention the change in `CHANGELOG.md` under `Changed` or `Breaking` and provide a one-line migration note.
- Patch releases (`1.N.X`) will not break a `beta` symbol — only minors do.

Use `beta` for: new components mid-design, new variants that may be renamed, new hooks whose ergonomics we are still tuning.

### `experimental`

Anything goes. The symbol exists, it might work, and we reserve the right to delete it, rename it, or invert its behavior in any release including a patch.

Promise to consumers:

- None. Pin the exact version if you depend on this.
- Likely shipped behind a subpath import (e.g. `@pxlkit/ui-kit/experimental`) or named with an `unstable_` prefix.
- Not covered by the deprecation policy. It may disappear without a deprecation window.

Use `experimental` for: spikes we want real users to try, performance escape hatches, internal-but-exported helpers.

---

## How tier is declared

Stability lives in two fields of the component manifest, colocated with the source:

```ts
// packages/ui-kit/src/Button.manifest.ts
export const manifest = {
  name: 'Button',
  status: 'stable',          // lifecycle: alpha | beta | stable | deprecated
  apiStability: 'stable',    // contract: stable | beta | experimental
  // ...
} as const;
```

Two fields, because they answer two different questions:

- `status` — **lifecycle stage**. Are we still building this? Is it done? Is it on its way out?
- `apiStability` — **contract tier**. What do consumers get to assume about the shape of this API?

They are usually aligned but not always. A symbol can be `status: 'stable'` (we're done iterating, it's our recommended option) while still `apiStability: 'beta'` (we want one release cycle of real-world use before we lock the signature). The reverse — `status: 'beta'` with `apiStability: 'stable'` — is not allowed, because we cannot promise a contract on something we are still actively reshaping.

Allowed combinations:

| `status`       | `apiStability`            |
| -------------- | ------------------------- |
| `alpha`        | `experimental`            |
| `beta`         | `experimental`, `beta`    |
| `stable`       | `beta`, `stable`          |
| `deprecated`   | `stable` (until removed)  |

CI enforces these combinations via the coherence audit.

---

## Promise to consumers per tier

| Tier            | Breaks allowed in | Deprecation window      | Subpath / naming                     | Covered by codemod? |
| --------------- | ----------------- | ----------------------- | ------------------------------------ | ------------------- |
| `stable`        | Major only        | One full major          | Top-level export                     | Yes                 |
| `beta`          | Any minor         | Single minor (notice in CHANGELOG) | Top-level export, marked in docs | Best effort         |
| `experimental`  | Any release       | None                    | `unstable_` prefix or `/experimental` subpath | No        |

"Covered by codemod" means: when we break a `stable` API, we ship a `pxlkit-codemod` script that rewrites consumer call sites where mechanically possible.

---

## Tier migration paths

The promotion path:

```
experimental -> beta -> stable -> deprecated -> removed
```

Promotions and demotions follow strict rules.

### `experimental` → `beta`

Triggered when we want broader feedback. Requires:

- All public props documented in TSDoc.
- A manifest entry with `apiStability: 'beta'`.
- A `CHANGELOG.md` entry under `Added` noting the beta status.
- An entry in the docs site marked with the beta badge.

Released in a minor.

### `beta` → `stable`

Triggered when we are confident the surface is right. Requires:

- At least one minor release as `beta`.
- No outstanding RFCs or open issues proposing breaking changes to the surface.
- 100% of public props covered by tests in `packages/ui-kit/src/__tests__/`.
- Manifest updated to `apiStability: 'stable'`.
- `CHANGELOG.md` entry under `Changed` noting the promotion.

Released in a minor. Promotion itself is not a breaking change.

### `stable` → `deprecated`

Triggered when we plan to remove the symbol in the next major. Requires:

- An ADR (`docs/adr/`) explaining the deprecation rationale and the recommended replacement.
- `manifest.status` set to `'deprecated'`, with a `deprecatedSince` version and `removeIn` version.
- A `@deprecated` TSDoc tag on the export.
- A runtime warning in development builds on first use (silent in production).
- A migration entry in `docs/runbooks/` if the replacement is non-obvious.

The symbol keeps working until `removeIn`. `apiStability` stays `stable` during the deprecation window — that is the whole point.

### `deprecated` → removed

Only in a major. The removal is listed under `Breaking` in `CHANGELOG.md`. If a codemod is feasible, it ships with the major.

### Demotions

A `stable` symbol cannot be demoted to `beta` or `experimental`. If a `stable` API turns out to be wrong, we either:

1. Fix it in a backward-compatible way (preferred), or
2. Deprecate it and ship a replacement at a new name, or
3. Break it in the next major.

A `beta` symbol can be demoted to `experimental` if we discover the design is more uncertain than we thought. This requires a CHANGELOG entry but not a major bump.

---

## What this means in practice

If you are a consumer:

- Pin to a minor (`^1.4.0`) for `stable` APIs.
- Pin to a patch (`~1.4.0`) for `beta` APIs.
- Pin to an exact version (`1.4.0`) for `experimental` APIs, and read every changelog.

If you are a maintainer:

- Default new symbols to `experimental` unless you already know the shape is right.
- Do not promote to `stable` to make a release feel more impressive. The promise is the product.
- When in doubt, deprecate and replace. We have all the time in the world; consumers do not have all the patience in the world.

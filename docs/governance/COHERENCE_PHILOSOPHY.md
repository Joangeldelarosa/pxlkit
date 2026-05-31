# Coherence Philosophy

> Why pxlkit treats incoherence as a P0 bug, and how the coherence pipeline keeps the kit honest as it grows.

## TL;DR

- **Every component has exactly one source of truth (SSOT).** The implementation file, its manifest, its examples, and its tests are colocated. Everything downstream — docs site, registry JSON, search index, READMEs — is **generated** from that SSOT.
- **Drift is the enemy.** If the same fact lives in two places, those two places will eventually disagree, and a contributor or consumer will get burned.
- **The auditor is not optional.** A red CI gate on coherence means a bug. It is not a "nice-to-have warning."

## What "coherence" means here

Coherence is the guarantee that **what the kit says it is** matches **what the kit actually is**.

Concretely, that means:

- The `<Component>.manifest.ts` next to `Component.tsx` is the only place a component declares its name, category, props summary, status, and examples.
- The docs site (`apps/web`), the registry JSON consumed by the visual builder, and any READMEs that list components are all **regenerated** from the manifests by `scripts/build-docs/`.
- The coherence auditor (`scripts/audit-coherence/`) walks the source tree and verifies that:
  - Every component has the four required colocated files (impl, manifest, examples, tests).
  - Every manifest passes schema validation.
  - No two components share a display name.
  - No manifest references an example or prop that no longer exists.
  - No registry entry points at a deleted or renamed component.
  - Deprecated components still ship their tombstone metadata.

If any of those checks fail, CI fails. No exceptions for "I'll fix it in the next PR."

## Why we pay this tax

The kit has 40+ UI components, 226+ icons, a voxel engine, and a visual builder that consumes the registry at runtime. At that scale, **manual coherence is impossible**. We tried. It always rotted.

Three concrete failure modes drove this discipline:

1. **The renamed-component-ghost.** A component was renamed in source but the registry, search index, and one README still referenced the old name. Consumers got 404s for two weeks before anyone noticed.
2. **The phantom prop.** A prop was removed from the impl but its manifest still advertised it. The visual builder shipped a control for a prop that did nothing.
3. **The silent deprecation.** A component was deleted with a deprecation note in the PR description — but the deprecation was never written into the manifest. Consumers on the previous minor version had no migration path.

Each of those is a small bug in isolation. Together they erode trust. The coherence pipeline exists so those classes of bugs **cannot ship**.

## The contract

If you are adding, editing, or removing a component, you are responsible for:

1. Keeping the four SSOT files in sync **in the same commit**.
2. Running `pnpm --filter @pxlkit/ui-kit docs:build` after manifest changes so generated artifacts are up to date.
3. Running `pnpm --filter @pxlkit/ui-kit audit:coherence` before opening a PR.
4. Reading the auditor output. The auditor explains *why* a check failed and which file to fix.

If you are reviewing a PR, you are responsible for:

1. Confirming the coherence CI job is green.
2. Treating any manual workaround for a coherence failure as a blocking review comment.

## What is NOT in scope for coherence

The auditor checks structural and referential integrity. It does not check:

- Visual design quality (use `pxlkit:icon-refinement` and Storybook review).
- Runtime correctness (use the test suite).
- Bundle size or perf regressions (separate workflows).
- License header presence on assets (separate auditor).

Coherence is the floor, not the ceiling. Passing the auditor means the kit is internally consistent. It does not mean the change is good.

## When the rules cost more than they help

Rules calcify. If a coherence check is consistently flagging legitimate work as broken, the check is wrong, not the work. The path is:

1. Open an ADR proposing the rule change.
2. Update the auditor and the relevant skill templates in the same PR.
3. Update this document if the philosophy itself shifts.

Do not silence the auditor. Fix the rule.

## Further reading

- `docs/governance/CONTRIBUTING.md` — the entrypoint for contributors.
- `docs/runbooks/audit-coherence.md` — how to run the auditor and read its output.
- `docs/runbooks/add-component.md` — the happy path for new components.
- `docs/runbooks/deprecate-component.md` — the happy path for removals.
- `docs/adr/` — durable decisions, including the original coherence ADR.

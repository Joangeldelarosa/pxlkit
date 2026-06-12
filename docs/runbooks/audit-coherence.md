# Runbook: Run the Coherence Auditor

> How to run `scripts/audit-coherence/`, read its output, and fix the common failure modes.

## When to use

Use this runbook when:

- You changed a component, manifest, example, or test and want to verify before pushing.
- CI failed on the `audit-coherence` job and you need to reproduce locally.
- You are reviewing a PR and want to sanity-check the auditor's verdict.
- You suspect a downstream artifact (docs site, registry JSON) drifted from the manifests.

The auditor runs automatically on every PR and on every merge to `main`. You should rarely need to run it manually as a sanity check — but you **always** need to read its output when it fails.

## What the auditor checks

The auditor walks `packages/ui-kit/src/` and validates structural and referential integrity. Concretely:

1. **File presence.** Every component directory has the four required files: impl, manifest, examples, at least one test.
2. **Manifest schema.** Every `*.manifest.ts` matches the manifest schema (name, displayName, category, kind, description, examples, status, optional deprecation block).
3. **Name uniqueness.** No two manifests share a `name` or `displayName`. Includes tombstones in `_deprecated/`.
4. **Example coherence.** Every name in a manifest's `examples` array corresponds to an exported value in the sibling `examples.tsx` file. Every export in `examples.tsx` is listed in the manifest.
5. **Prop coherence.** Every prop documented in the manifest exists on the component's exported `Props` type. Every required prop on the `Props` type is documented in the manifest.
6. **Registry coherence.** Every entry in the generated registry JSON points at a live manifest. Every live manifest has a registry entry (unless it's experimental and gated).
7. **Deprecation coherence.** Every component with `status: "deprecated"` has a complete `deprecation` block. Every `replacement` reference points at a live component. No live component references a deprecated component as a dependency.
8. **Category validity.** Every component's directory matches its manifest's `category`. The category is in the allowed list.
9. **Search index coherence.** The generated search index includes every published component and excludes every removed one.

Each check that fails reports the specific file and the specific reason. The auditor does not fail on the first error — it surfaces the full list so you can fix them in one pass.

## How to run it

### Local, all checks

```bash
pnpm --filter @pxlkit/ui-kit audit:coherence
```

Exit code `0` = pass, `1` = fail. Human-readable output by default.

### Local, JSON output (for tools)

```bash
pnpm --filter @pxlkit/ui-kit audit:coherence -- --json > coherence-report.json
```

The JSON shape is documented at the top of `scripts/audit-coherence/index.ts`. CI parses this output to annotate PRs.

### Local, single-component scope

```bash
pnpm --filter @pxlkit/ui-kit audit:coherence -- --component PixelStatGrid
```

Useful when iterating on one component without paying the cost of scanning everything.

### CI

The `.github/workflows/coherence.yml` workflow runs the auditor on every PR and every push to `main`. Failures block merge.

## How to read the output

The default output is grouped by check, then by component. Example:

```
audit:coherence — 3 failures

[file-presence]
  packages/ui-kit/src/cards/PixelStatGrid/
    missing: __tests__/PixelStatGrid.test.tsx

[example-coherence]
  packages/ui-kit/src/forms/PixelLoginForm/
    manifest lists example "WithSocialAuth" but examples.tsx has no matching export.
    examples.tsx exports "WithOAuth" which is not listed in the manifest.

[deprecation-coherence]
  packages/ui-kit/src/_deprecated/PixelOldThing/PixelOldThing.manifest.ts
    deprecation.replacement points at "PixelNewThing" which does not exist.

Exit code: 1
```

Each block tells you:

- **Which check fired.**
- **Which file is at fault.**
- **What the auditor expected vs found.**

If the message is ambiguous, run with `--verbose` to see the auditor's reasoning step-by-step.

## Common failures and fixes

### `file-presence: missing __tests__/X.test.tsx`

You added a component without a test file, or the test file was deleted. Restore it. The `pxlkit:add-component` skill scaffolds a placeholder; never delete it without replacing it with real tests.

### `example-coherence: manifest lists example X but examples.tsx has no matching export`

You renamed an example export but didn't update the manifest. Update the manifest's `examples` array to match the new export name.

### `example-coherence: examples.tsx exports X which is not listed in the manifest`

You added an example export but didn't add it to the manifest. Add it.

### `prop-coherence: manifest documents prop X which is not on Props type`

You removed a prop from the impl but the manifest still describes it. Remove it from the manifest.

### `prop-coherence: required prop X on Props type is not documented in manifest`

You added a required prop but didn't document it in the manifest. Document it.

### `name-uniqueness: name X collides with existing component`

You picked a name another component (live or deprecated) already uses. Rename. Deprecated tombstones reserve names indefinitely.

### `deprecation-coherence: deprecation.replacement points at X which does not exist`

The replacement you specified for a deprecated component is itself missing (typo, deleted, or never existed). Fix the manifest.

### `registry-coherence: registry entry for X points at missing manifest`

The generated registry JSON references a component that no longer exists. Run `pnpm docs:build` to regenerate. If the regenerate doesn't fix it, the registry build itself has a bug — file an issue.

### `category-validity: component in directory X but manifest declares category Y`

The directory and the manifest disagree. Pick one and update the other. Moving a component to a different category requires updating the directory, the manifest, and any external references — consider whether you actually want this.

### Auditor passes locally but fails in CI

Almost always:

- You forgot to commit a regenerated file (`pnpm docs:build` outputs).
- A different PR merged between your branch and CI, introducing a name collision.
- Your local node version differs from CI and a TS compile difference produced different output.

Rebase, run `pnpm install && pnpm docs:build && pnpm audit:coherence` locally, recommit, push.

### Auditor fails locally but passes in CI

You have uncommitted changes that break coherence. Commit them, or `git stash`, or `git clean -fd` (with care).

## Fixing in bulk

If a refactor introduces many auditor failures at once:

1. Run `pnpm audit:coherence -- --json > report.json`.
2. Group failures by check type — the same root cause often manifests across many components.
3. Fix the root cause (e.g., a template change in the add-component skill) and re-run the affected components one at a time.
4. Do **not** silence the auditor or commit `--allow-failures`. There is no such flag, and there should not be.

## When to update the auditor itself

The auditor encodes the rules in `COHERENCE_PHILOSOPHY.md`. If a rule needs to change:

1. Open an ADR.
2. Update the auditor in `scripts/audit-coherence/`.
3. Update the templates in `.claude/skills/pxlkit-add-component/templates/` so the skill produces compliant output.
4. Update `docs/governance/COHERENCE_PHILOSOPHY.md` if the philosophy shifted.
5. Update this runbook if the failure modes changed.

Do **not** add per-component exceptions in the auditor. The rules are universal; exceptions are the road to incoherence.

## See also

- `docs/governance/COHERENCE_PHILOSOPHY.md` — the *why*.
- `docs/runbooks/add-component.md` — the happy path that avoids most auditor failures.
- `docs/runbooks/deprecate-component.md` — the happy path for removals.
- `scripts/audit-coherence/` — the auditor implementation.
- `.github/workflows/coherence.yml` — the CI gate.

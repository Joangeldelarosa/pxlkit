# Runbook: Deprecate a Component

> End-to-end flow for marking a component deprecated or removing it from `@pxlkit/ui-kit`. Driven by the `pxlkit:deprecate-component` skill.

## When to use

Use this runbook when:

- A component is being **renamed** (deprecate the old name, add the new one).
- A component is being **removed** because a better primitive replaces it.
- A component is being **retired** because its use case no longer exists.

Do **not** use this runbook to:

- Hide a component temporarily — flip its `status` to `experimental` in the manifest instead.
- Remove a hook or utility — those follow a separate path (no tombstones needed).
- Delete files outright — never. Even removed components leave a tombstone.

## The model

Deprecation in pxlkit is a **two-phase process**:

1. **Deprecate phase (current release).** The component still ships and still works, but its manifest is updated with deprecation metadata: `status: "deprecated"`, `deprecatedSince`, `replacement`, `removalTarget`. A warning fires in dev when consumers use it.
2. **Removal phase (later release, ≥ 1 minor cycle later).** The implementation moves to `packages/ui-kit/src/_deprecated/<name>/` with only the manifest preserved as a tombstone. The deprecation review workflow archives the tombstone after a configured TTL.

You cannot skip the deprecate phase. Consumers need at least one minor version of overlap to migrate.

## Prerequisites

- You are on a feature branch off the latest internal base branch.
- You know:
  - **The component's name and category.**
  - **Why it is being deprecated.** Write this down — it goes in the tombstone.
  - **The replacement**, if any. Either a sibling component or "no direct replacement; use `<X> + <Y>`".
  - **The removal target** — typically the next major version, or `2 minors from now`.

If the component has external consumers (open issues, PR comments asking about it, examples in `apps/web`), check those before deprecating. Deprecation that surprises consumers erodes trust.

## Steps

### 1. Run the skill

```bash
# From the repo root, in a Claude session:
pxlkit:deprecate-component
```

The skill asks:

- Which component (autocompletes from the manifest registry).
- Phase: `deprecate` (mark deprecated, keep shipping) or `remove` (move to tombstone).
- Replacement, reason, removal target.

It then:

- For `deprecate`: edits the manifest in place, adds the deprecation block, and inserts a `console.warn` (gated to dev) in the implementation.
- For `remove`: moves the directory to `_deprecated/`, strips everything except the manifest, and updates the manifest to `status: "removed"`.

### 2. Verify the manifest change

The deprecation block must look like:

```ts
deprecation: {
  status: "deprecated",           // or "removed" in phase 2
  since: "1.4.0",                  // current version
  replacement: "PixelStatGrid",   // or null
  reason: "Replaced by PixelStatGrid which supports loading + empty states natively.",
  removalTarget: "2.0.0",
}
```

If the skill left `TODO` markers in any of those fields, fill them in.

### 3. Update consumers in the kit itself

Search the monorepo for usages of the deprecated component:

```bash
# Apps/web examples may use it.
# Storybook stories may reference it.
# Other components may compose it.
git grep -n "PixelOldThing"
```

For each usage:

- If it's in `apps/web` or Storybook, migrate to the replacement.
- If it's in another component's impl, that component itself may need a deprecation cycle. Stop and think.

The auditor will flag remaining in-kit usages of deprecated components as warnings; in-kit usages of `removed` components as errors.

### 4. Update the migration guide

If this is a non-trivial deprecation (anything more than "renamed, no API change"), add a section to `docs/migrations/` describing:

- Before → after code snippet.
- Behavior differences, if any.
- Edge cases the replacement handles differently.

The docs site picks this up automatically.

### 5. Regenerate downstream artifacts

```bash
pnpm --filter @pxlkit/ui-kit docs:build
```

The docs site will now show the component as deprecated with the migration note. The registry JSON marks it as deprecated so the visual builder hides it (or renders it with a warning chip) for new projects.

### 6. Run the auditor

```bash
pnpm --filter @pxlkit/ui-kit audit:coherence
```

Common failures for deprecations:

- **`deprecation block missing required field`** — fill in the TODO.
- **`replacement target does not exist`** — the replacement name in the manifest doesn't match any active component.
- **`in-kit usage of removed component`** — you ran the `remove` phase without migrating internal consumers first. Roll back and do step 3.
- **`removalTarget is in the past`** — pick a future version.

### 7. Update CHANGELOG

Add an entry under the appropriate version:

```md
### Deprecated

- `PixelOldThing` — replaced by `PixelStatGrid`. Removal target: 2.0.0. See migration guide.
```

For `remove` phase:

```md
### Removed

- `PixelOldThing` — deprecated since 1.4.0. Use `PixelStatGrid`.
```

### 8. Open the PR

Commit message:

```
chore(ui-kit): deprecate PixelOldThing in favor of PixelStatGrid

- Status: deprecated, removal target 2.0.0.
- Reason: PixelStatGrid covers all use cases with better loading state.
- Migration guide: docs/migrations/pixel-old-thing-to-stat-grid.md.
```

PR checklist:

- [ ] Manifest updated with full deprecation block.
- [ ] All in-kit usages migrated (or explicitly deferred with a tracking issue).
- [ ] Migration guide added if non-trivial.
- [ ] Docs regenerated and auditor green.
- [ ] CHANGELOG updated.

## The removal phase (later)

When the removal target version arrives, the **deprecation review workflow** (`.github/workflows/deprecation-review.yml`) opens an issue listing components past their removal target. For each:

1. Confirm no critical external consumers remain (check issues, search github).
2. Run the skill again with phase `remove`.
3. Open a PR with the tombstone move. CHANGELOG entry under Removed.

The deprecation review workflow runs on a schedule (monthly). Do not pre-empt it — components occasionally get reprieves when usage data shows they are still load-bearing.

## Common mistakes

- **Deleting the manifest entirely.** Never. The tombstone exists so the auditor can detect attempts to resurrect the name.
- **Skipping the deprecate phase.** Going straight to `remove` breaks consumers on the previous minor. The kit's compatibility promise is one minor of deprecation overlap, minimum.
- **Vague reasons.** "Old" is not a reason. Write the *actual* reason so the next maintainer (or future you) understands why this happened.
- **Deprecating without a replacement.** Allowed, but the manifest must say `replacement: null` and the reason must explain why no replacement is needed. The auditor flags missing `replacement` as a warning.

## See also

- `pxlkit:deprecate-component` skill: `.claude/skills/pxlkit-deprecate-component/SKILL.md`.
- Add-component runbook: `docs/runbooks/add-component.md`.
- Coherence philosophy: `docs/governance/COHERENCE_PHILOSOPHY.md`.
- Deprecation review workflow: `.github/workflows/deprecation-review.yml`.

# Breaking Change Checklist

**Status:** Active
**Scope:** Any PR that introduces a breaking change to a published package in this monorepo.
**Owners:** Core maintainers + PR author.

## When this checklist applies

A change is breaking if it can cause a downstream consumer's existing, correct code to fail to compile, fail at runtime, or render differently in a user-visible way after upgrading. This includes:

- Removing or renaming any public export, prop, slot, token, or CSS variable.
- Changing the type signature of a public API in a way that is not strictly more permissive.
- Changing default values, default variants, or default styling.
- Changing peer-dependency ranges to exclude previously supported versions.
- Changing the minimum supported Node, React, or TypeScript version.
- Changing the package's `exports` map in a way that breaks existing import paths.

If unsure, assume it is breaking and run the checklist. Cost of a false positive is one extra ADR; cost of a false negative is a broken downstream.

## Pre-flight checklist

Every item is required. PRs that do not check every box do not merge. Reviewers refuse to approve incomplete checklists.

### 1. ADR written and merged

- [ ] An ADR exists under `docs/adr/` with a `Status: Accepted` line.
- [ ] The ADR documents: the problem, the rejected alternatives, the chosen solution, and the migration story.
- [ ] The ADR is linked from the PR description.

The ADR lands **before** the implementation PR, or as the first commit in the same PR. "I'll write the ADR after" is not acceptable — by then the design has already been frozen by the implementation.

### 2. Deprecation cycle (if the API is being changed, not added)

- [ ] If this PR removes or renames API, a prior release deprecated it per [DEPRECATION_POLICY.md](./DEPRECATION_POLICY.md).
- [ ] The current major is greater than the major in which the deprecation landed.
- [ ] `packages/ui-kit/src/_meta/deprecations.json` entry is being moved to `removals.json` in this PR.

If you are introducing a new breaking API surface (not removing an old one) and there is no prior deprecation, document why in the ADR. The default expectation is: deprecate first, remove later.

### 3. Migration codemod available

- [ ] A codemod exists in `scripts/codemods/<name>.ts` and is invocable via the published codemod runner.
- [ ] The codemod has tests under `scripts/codemods/__tests__/<name>.test.ts` covering at least: the basic case, the renamed-import case, the spread-props case, and a no-op (already-migrated) case.
- [ ] The codemod runs cleanly against the showcase and against `apps/web` with zero manual fixups required.

If a codemod is truly impossible (e.g., the migration requires runtime knowledge), the ADR must explain why, and a manual migration guide must include:

- Exact search patterns (regex or AST query) to find affected code.
- Step-by-step transformation per pattern.
- A worked example from the showcase or a real consumer.

### 4. Impact analysis

- [ ] Internal usage count: `pnpm run audit:usage <api>` was run; the output is pasted in the PR description.
- [ ] Showcase pages using the API are listed in the PR description.
- [ ] If any internal consumer cannot be migrated by the codemod, it is listed with a follow-up issue link.
- [ ] Downstream impact estimate is in the ADR: which kinds of consumers (apps, libs, design systems built on top) are most affected, and what their migration looks like end-to-end.

A breaking change with no impact analysis is a breaking change shipped blind. Reviewers must reject these on sight.

### 5. Communication plan

- [ ] CHANGELOG entry under the next major's `### Removed` or `### Changed` section, with a link to the migration guide and the codemod command.
- [ ] Migration guide at `docs/migrations/<from>-to-<to>.md` is written, builds, and renders in the docs site.
- [ ] A release-notes draft exists at `docs/release-notes/<version>.md` (or in the PR description) that summarizes every breaking change in this major in plain language.
- [ ] If this change is one of three or more breakings landing in the same major, the release notes summarize the upgrade story end-to-end and not one bullet per change.

Consumers should be able to read one document and understand the full upgrade. They should not have to reconstruct it from a CHANGELOG.

### 6. Versioning and release

- [ ] The package version bump is correct (`major`, never `minor` or `patch` for breaking changes).
- [ ] The PR is targeting the next-major branch or main per release strategy. Breakings do not land on a maintenance branch.
- [ ] If this is the first breaking change of the cycle, a `next` dist-tag publish is planned to give early adopters a chance to test before the final release.

### 7. Tests and coverage

- [ ] Existing tests for the old behavior have been updated, not just deleted. The diff should show the old expectations being replaced with new expectations, not vanishing.
- [ ] New tests cover the new behavior, including edge cases the old behavior may have masked.
- [ ] Visual regression / snapshot tests are regenerated and the new snapshots are reviewed (not blindly accepted).
- [ ] The codemod has been run on the showcase and any visual diff is intentional.

### 8. Rollback story

- [ ] The PR description includes a rollback plan: how a downstream pinned to the new major can pin back to the previous major without losing other fixes shipped between.
- [ ] If the change touches persisted state (local storage keys, cookies, IndexedDB schemas), the rollback plan covers data compatibility.

## Reviewer responsibilities

- Read the ADR before reading the diff. If the ADR does not justify the change, reject the PR regardless of code quality.
- Verify the codemod by running it locally on at least one of: the showcase, `apps/web`, or a checked-out external consumer.
- Check that the CHANGELOG, migration guide, and release notes are consistent. If three documents tell three slightly different stories, the change is not ready.
- Confirm at least one other maintainer has reviewed the impact analysis. Breakings are not single-reviewer territory.

## Worked example

A PR renames `<Button color="primary">` to `<Button tone="primary">`.

1. ADR `docs/adr/0042-button-color-to-tone.md` accepted, explaining the rename aligns Button with Badge and Alert.
2. Prior release (`1.6.0`) added `tone` as a synonym, deprecated `color` via JSDoc + runtime warn, and added an entry to `deprecations.json` with `removeIn: 2.0.0`.
3. This PR (targeting `2.0.0`):
   - Removes the `color` prop entirely.
   - Moves the manifest entry to `removals.json`.
   - Ships `scripts/codemods/button-color-to-tone.ts` with four test cases.
   - Pastes `pnpm run audit:usage Button.color` showing 47 internal call sites, all migrated by the codemod.
   - Updates the CHANGELOG `### Removed` section.
   - Updates `docs/migrations/button-color-to-tone.md` (auto-generated, then hand-tightened).
   - Bumps `packages/ui-kit/package.json` to `2.0.0`.
4. Reviewer runs `pnpm run codemod button-color-to-tone` against the showcase, confirms zero diff after re-run (idempotent), approves.

This is the bar. Anything less is debt the next major will pay for.

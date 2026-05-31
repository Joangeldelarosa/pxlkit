# Runbook: Ship a Release

> End-to-end flow for cutting a release of `@pxlkit/ui-kit` and the rest of the monorepo. Owned by the **release agent**; contributors do not run this.

## When to use

Use this runbook when:

- A milestone of work has landed on the internal base branch and is ready to ship.
- A hotfix needs to go out (see `handle-incident.md` first; this runbook covers the release mechanics, not the triage).
- A scheduled release window has arrived (cadence is defined in the release ADR).

Do **not** use this runbook to:

- Push experimental changes — those ship as `next` tag from a separate flow.
- Ship docs-only changes — those auto-deploy on merge to `main`.
- Bump a single package out of band — the kit ships as a cascade.

## The model

A pxlkit release is a **synchronized cascade**:

1. **Determine the bump** — patch, minor, or major. Driven by the CHANGELOG since the last tag.
2. **Bump versions** — all publishable packages get the same version. Internal deps follow.
3. **Regenerate downstream artifacts** — docs, registry, search index, READMEs.
4. **Consolidate CHANGELOG** — promote `## Unreleased` to `## <version> — <date>`.
5. **Tag, push, publish** — git tag, push, npm publish, deploy docs.

Each step has a gate. Failing any gate aborts the release.

## Prerequisites

- You are the release agent (or running with explicit auth from the maintainers).
- `main` is green: all CI gates pass on the latest commit.
- The CHANGELOG `## Unreleased` section is non-empty and accurate.
- You have npm publish auth, GitHub push auth to `main`, and Cloudflare Pages deploy auth.
- No open `release/*` branches exist (kill them first; only one release in flight at a time).

## Steps

### 1. Determine the bump

Read `CHANGELOG.md`'s `## Unreleased` section. The rule:

- **Major (`X.0.0`)** — any breaking change. Removal of a deprecated component counts. API changes that break consumers count. New peerDeps with no fallback count.
- **Minor (`x.Y.0`)** — new components, new features, new exports. Deprecations (not removals) are minor.
- **Patch (`x.y.Z`)** — bug fixes, internal refactors, doc fixes that don't change public API.

When in doubt, bump higher. Consumers can handle a too-high bump; they cannot handle a missed breaking change.

### 2. Cut a release branch

```bash
git checkout main
git pull --ff-only
git checkout -b release/v<X.Y.Z>
```

All release-mechanics commits go on this branch. It merges to `main` at the end with the tag.

### 3. Run the bump cascade

```bash
pnpm run release:bump -- --version <X.Y.Z>
```

This is the **only** correct way to bump. It:

- Updates every `package.json` in `packages/*` and `apps/*` to the new version.
- Updates internal `workspace:` deps to `workspace:^<X.Y.Z>` (or whatever the protocol expects).
- Updates `peerDependencies` ranges in the kit package per the peerdep policy in the relevant ADR.

Do **not** hand-edit `package.json` files. The script enforces invariants the auditor checks later.

### 4. Regenerate downstream artifacts

```bash
pnpm --filter @pxlkit/ui-kit docs:build
pnpm --filter @pxlkit/ui-kit registry:build
```

Verify the generated artifacts have the new version baked in (READMEs, registry JSON, search index). If `docs:build` introduces no diffs and you expected diffs, something is wrong — investigate before continuing.

### 5. Consolidate the CHANGELOG

Move the `## Unreleased` block to `## <X.Y.Z> — <YYYY-MM-DD>` and create a fresh empty `## Unreleased` above it. Sections within the version block:

```md
## 1.5.0 — 2026-05-30

### Added
- ...

### Changed
- ...

### Deprecated
- ...

### Removed
- ...

### Fixed
- ...

### Security
- ...
```

Drop empty sections. Each bullet must reference a PR or commit SHA at the end: `(#123)` or `(abc1234)`.

### 6. Run the full gate suite

```bash
pnpm run lint
pnpm run build
pnpm run test
pnpm --filter @pxlkit/ui-kit audit:coherence
```

All four must be green. If any fail, stop. A failed release is recoverable; a shipped broken release is not.

### 7. Commit the release

```bash
git add .
git commit -m "chore(release): v<X.Y.Z>"
```

A single commit. Do not split bump, regenerate, and changelog into separate commits — the cascade is atomic by design.

### 8. Open the release PR

```bash
git push -u origin release/v<X.Y.Z>
gh pr create --base main --title "chore(release): v<X.Y.Z>" --body "$(cat <<'EOF'
## Release v<X.Y.Z>

See CHANGELOG.md for the full set of changes.

### Gate status
- Lint: green
- Build: green
- Test: green
- Coherence audit: green

### Post-merge
- Tag and publish happen automatically via the release workflow.
EOF
)"
```

Wait for the PR's CI to go fully green. The release workflow only fires on merge with a green main check.

### 9. Merge and tag

Merge the PR with a **merge commit** (not squash, not rebase). The merge commit preserves the release commit as a discoverable point.

The release workflow then:

- Creates the git tag `v<X.Y.Z>` on the merge commit.
- Publishes the kit to npm under `latest`.
- Triggers the docs site deploy to Cloudflare Pages.
- Posts a GitHub Release with the relevant CHANGELOG section as the body.

If any of those steps fail, the workflow leaves a comment on the merged PR with the failure and the recovery action.

### 10. Verify

After the workflow finishes:

```bash
npm view @pxlkit/ui-kit version          # should be <X.Y.Z>
curl -sI https://pxlkit.xyz | head -1     # docs site responding
gh release view v<X.Y.Z>                  # GitHub release exists
```

If any verification fails, follow `handle-incident.md`.

## Hotfix variant

For a hotfix release (patch off a previous minor, not off latest `main`):

1. Branch from the last release tag: `git checkout -b release/v<X.Y.Z+1> v<X.Y.Z>`.
2. Cherry-pick the fix commits.
3. Skip step 1 (bump is always patch).
4. Continue from step 3 (bump cascade) onward.
5. After publish, **also** open a PR back to `main` with the same fix if it applies — otherwise the next release reverts the hotfix silently.

## Common mistakes

- **Hand-editing `package.json` versions.** The cascade script enforces invariants. Hand-editing skips them and ships subtly broken `peerDependencies`.
- **Skipping `docs:build`.** The registry JSON includes the version. Consumers of the visual builder will see the previous version's registry served against the new package — coherence failure in production.
- **Forgetting to consolidate the CHANGELOG.** Empty `## Unreleased` after release is the signal that the consolidation happened. If `## Unreleased` still has content after the merge, you missed step 5.
- **Squash-merging the release PR.** The merge commit is the tag anchor. Squash hides the structure.
- **Running on a non-green `main`.** A release should never be the thing that turns CI green. Fix `main` first, then release.

## See also

- `docs/runbooks/handle-incident.md` — what to do when a release goes wrong.
- `docs/runbooks/audit-coherence.md` — the auditor that gates step 6.
- Release workflow: `.github/workflows/release.yml` (if present).
- Versioning ADR: `docs/adr/` (look for the semver / release cadence decision).

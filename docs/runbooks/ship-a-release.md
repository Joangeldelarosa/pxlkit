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

### 3. Bump the package versions — **manual today**

> **There is no `release:bump` script in this repo.** Earlier revisions of this runbook told you to run
> `pnpm run release:bump`. That command does not exist in the root `package.json` nor in any
> `packages/*/package.json`, and the repo is on **npm** (`packageManager: npm@10.9.0`), not pnpm.
> Automating the cascade is still an open task. Until it lands, **step 3 is done by hand.**

Edit, by hand, for every publishable package you are shipping:

- The `version` field of each `packages/*/package.json` you are releasing.
- The internal cross-package dependency ranges that point at the bumped packages (this repo pins
  them as normal semver ranges, not `workspace:` protocol).
- The `peerDependencies` ranges in the kit package, if the peerdep policy in the relevant ADR calls
  for it.

Because this is manual, the coherence auditor in step 6 is the only thing standing between a typo
and a broken publish. Do not skip it, and do not bump a package you are not actually shipping —
the publish workflow decides what to push by comparing each local `version` against npm.

### 3b. Sync the Claude Code plugin version

The plugin manifests are **not** part of the package bump above and will silently drift if you
forget them. Run:

```bash
npm run release:bump-plugin -- --version <X.Y.Z>
```

This rewrites exactly two files — `plugins/pxlkit/.claude-plugin/plugin.json` and the `pxlkit`
entry in `.claude-plugin/marketplace.json` — and nothing else. It validates the version as strict
semver (`X.Y.Z`, no prerelease suffix) and refuses to run otherwise. Run it **before** `docs:build`,
so any generated artifact that embeds the plugin version picks up the new number.

### 4. Regenerate downstream artifacts

```bash
npm run docs:build --workspace=@pxlkit/ui-kit
```

Verify the generated artifacts have the new version baked in (READMEs, registry JSON, search index).
If `docs:build` introduces no diffs and you expected diffs, something is wrong — investigate before
continuing.

> There is no separate `registry:build` script — the registry JSON is emitted as part of
> `docs:build`. An older revision of this runbook listed it as its own step; it never existed.

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
npm run lint
npm run build
npm run test
npm run audit
```

(`npm run audit` is the root alias for `npm run audit:coherence --workspace=@pxlkit/ui-kit`.)

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

### 9b. Tag the plugin

The Claude Code plugin is tagged separately, by `claude plugin tag`, which produces a tag of the
form `pxlkit--v<X.Y.Z>` (plugin name, double dash, `v`-prefixed version).

**Two tags therefore exist per release and this divergence is expected:**

| Tag | Created by | Purpose |
| --- | --- | --- |
| `v<X.Y.Z>` | the publish workflow (`.github/workflows/publish.yml`, which triggers on `v*`) | npm publish + GitHub Release anchor |
| `pxlkit--v<X.Y.Z>` | `claude plugin tag`, run by hand | plugin marketplace resolution |

Do not "clean up" `pxlkit--v*` tags and do not try to make the plugin reuse `v<X.Y.Z>` — the
publish workflow listens on `v*`, so a plugin tag in that namespace would fire an npm publish.
The `X.Y.Z` in both tags must match, which is what step 3b guarantees.

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
4. Continue from step 3 (manual version bump) and 3b (plugin sync) onward.
5. After publish, **also** open a PR back to `main` with the same fix if it applies — otherwise the next release reverts the hotfix silently.

## Common mistakes

- **Assuming a bump script exists.** There is no `release:bump`. Step 3 is manual, so the coherence audit in step 6 is not optional — it is the only invariant check between your hand edit and npm.
- **Forgetting `release:bump-plugin`.** The plugin manifests are outside the package bump. A plugin still advertising the previous version after the kit ships is a coherence failure users see in the marketplace.
- **Skipping `docs:build`.** The registry JSON includes the version. Consumers of the visual builder will see the previous version's registry served against the new package — coherence failure in production.
- **Forgetting to consolidate the CHANGELOG.** Empty `## Unreleased` after release is the signal that the consolidation happened. If `## Unreleased` still has content after the merge, you missed step 5.
- **Squash-merging the release PR.** The merge commit is the tag anchor. Squash hides the structure.
- **Running on a non-green `main`.** A release should never be the thing that turns CI green. Fix `main` first, then release.

## See also

- `docs/runbooks/handle-incident.md` — what to do when a release goes wrong.
- `docs/runbooks/audit-coherence.md` — the auditor that gates step 6.
- Release workflow: `.github/workflows/release.yml` (if present).
- Versioning ADR: `docs/adr/` (look for the semver / release cadence decision).

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
2. **Bump versions** — each package you ship takes its own next version: the kit, `@pxlkit/core`,
   the icon packs and the framework packages version independently. Internal ranges follow.
3. **Regenerate downstream artifacts** — docs, registry, search index, READMEs.
4. **Consolidate CHANGELOG** — promote `## Unreleased` to `## <version> — <date>`.
5. **Merge, publish, release** — merging to `main` publishes to npm, creates the GitHub Release and
   its tag, and deploys the site.

Each step has a gate. Failing any gate aborts the release.

## Prerequisites

- You are the release agent (or running with explicit auth from the maintainers).
- `main` is green: all CI gates pass on the latest commit.
- The CHANGELOG `## Unreleased` section is non-empty and accurate.
- The `NPM_TOKEN` repository secret holds an npm token that may publish every package in the
  `@pxlkit` scope, new package names included. npm caps granular write tokens at 90 days: a token
  that has expired makes every `npm publish` fail with a 404.
- Optionally, the `RELEASE_TOKEN` repository secret: a fine-grained token for this repository with
  Contents and Workflows: Read and write. The GitHub Release workflow needs it only for a version
  that is no longer at the tip of `main` when it runs (step 9).
- Vercel needs nothing: it deploys pxlkit.xyz and storybook.pxlkit.xyz from `main`.
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

### 3b. Decide whether the Claude Code plugin ships too

**The plugin versions independently of the packages.** It is not part of the cascade above, and
that is deliberate rather than an oversight: a change to a `SKILL.md` or a validation script is a
real release users should be offered, and it happens without the kit moving at all. Locking the two
together would make those releases invisible to the plugin's own update check — the one thing that
check exists to prevent.

So there are two questions, not one:

| Did the kit change? | Did the plugin change? | Do this |
| --- | --- | --- |
| yes | no | bump packages only; leave the plugin version alone |
| no | yes | bump the plugin only; the packages stay put |
| yes | yes | bump both, with independent version numbers |

To bump the plugin:

```bash
npm run release:bump-plugin -- --version <X.Y.Z>
```

It rewrites exactly two files — `plugins/pxlkit/.claude-plugin/plugin.json` and the `pxlkit` entry
in `.claude-plugin/marketplace.json` — validates the version as strict semver (`X.Y.Z`, no
prerelease suffix), and refuses to run otherwise. Run it **before** `docs:build`, which regenerates
`plugins/pxlkit/references/VERSION.json` and copies the new plugin version into it.

Coherence gate 36 checks two chains separately and will tell you which one is wrong:

- **plugin chain** — `plugin.json` = the marketplace entry = `VERSION.json#plugin`
- **kit chain** — `VERSION.json#uiKit` = `packages/ui-kit/package.json#version`

A mismatch in the kit chain means the reference corpus describes an API that is no longer the one
shipping: run `npm run docs:build` and commit the result.

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

Move the `## Unreleased` block to `## <X.Y.Z> — <YYYY-MM-DD>` and create a fresh empty `## Unreleased` above it.
Date it with the day the release reaches npm — the day you merge — so the changelogs, the site, npm
and the GitHub Release agree.

The root `CHANGELOG.md` heading names the release's packages in brackets, the kit first:
`## [ui-kit 2.2.0 / core 1.4.0 / vue 0.1.0 / angular 0.1.0] - 2026-10-06 — <title>`. The GitHub
Release takes its title and notes from that section; a kit release without one falls back to its
section in `packages/ui-kit/CHANGELOG.md`. Sections within the version block:

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
- npm publish, the GitHub Release and its tag, and the site deploy happen automatically.
EOF
)"
```

Wait for the PR's CI to go fully green before you merge.

### 9. Merge, publish and release

Merge the PR; a squash merge is fine. The commit that lands on `main` is the one npm publishes from
and the release tag points at. Then, with no further step:

- **Publish to npm** (`.github/workflows/publish.yml`) runs the quality gate again and publishes,
  with provenance and under `latest`, every package whose version is not on npm yet; it skips the
  rest. Its `publish` job runs in the `npm` environment, so the repository's Deployments list it.
- **GitHub Release** (`.github/workflows/github-release.yml`) runs after a successful publish and
  creates the release `v<X.Y.Z>` for the kit's version, tagged on the commit npm published
  `@pxlkit/ui-kit` from: the CHANGELOG section as notes, after a table of every package published
  from that commit. It is marked Latest. Versions that already have a release are left alone, so it
  can run any time: Actions → GitHub Release → Run workflow creates whatever is missing.
  The workflow's own token tags the merged commit while it is the tip of `main`. GitHub may refuse
  it a tag on an older commit — a past version, or the new one when another merge reached `main`
  first — with `HTTP 403: Resource not accessible by integration`, since that takes the Workflows
  permission no workflow token has; the run then uses `RELEASE_TOKEN`. Without the secret, a past
  version is left with a warning and the newest fails the run. A tag made with `RELEASE_TOKEN`
  starts the publish workflow of the tagged commit, which publishes nothing that is already on npm.
- **Vercel** deploys pxlkit.xyz and storybook.pxlkit.xyz from `main` as their Production
  deployments.

If the publish fails, fix the cause (an expired `NPM_TOKEN` shows as a 404 on every package) and
re-run the failed job: it skips what already reached npm, and the release follows its success.

### 9b. Tag the plugin

The Claude Code plugin is tagged separately, by `claude plugin tag`, which produces a tag of the
form `pxlkit--v<X.Y.Z>` (plugin name, double dash, `v`-prefixed version).

**Two tags therefore exist per release and this divergence is expected:**

| Tag | Created by | Purpose |
| --- | --- | --- |
| `v<X.Y.Z>` | the GitHub Release workflow (`.github/workflows/github-release.yml`), after npm publish | GitHub Release anchor, on the commit npm published the kit from |
| `pxlkit--v<X.Y.Z>` | `claude plugin tag`, run by hand | plugin marketplace resolution |

Do not "clean up" `pxlkit--v*` tags and do not try to make the plugin reuse `v<X.Y.Z>` — the
publish workflow also runs on `v*` tags pushed by hand, so a plugin tag in that namespace would fire
an npm publish. The two versions are independent (step 3b): `v<X.Y.Z>` is the kit's version, the
plugin tag carries the plugin's.

### 10. Verify

After the workflow finishes:

```bash
npm view @pxlkit/ui-kit version          # should be <X.Y.Z>
curl -sI https://pxlkit.xyz | head -1     # docs site responding
gh release view v<X.Y.Z>                  # GitHub release exists, marked Latest
```

On GitHub, the Releases list shows `v<X.Y.Z>` as Latest, and the Deployments list shows the `npm`
environment and Vercel's Production deployments on the merged commit.

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
- **Dating the release with the day it was cut.** Date it with the day it reaches npm, the merge day;
  otherwise the changelogs and the site disagree with npm and the GitHub Release.
- **Letting `NPM_TOKEN` expire.** Every `npm publish` then fails with a 404. Replace the secret and
  re-run the failed job.
- **Running on a non-green `main`.** A release should never be the thing that turns CI green. Fix `main` first, then release.

## See also

- `docs/runbooks/handle-incident.md` — what to do when a release goes wrong.
- `docs/runbooks/audit-coherence.md` — the auditor that gates step 6.
- Workflows: `.github/workflows/publish.yml` (npm) and `.github/workflows/github-release.yml`
  (GitHub Releases, `scripts/release/github-release.mjs`).
- Versioning ADR: `docs/adr/` (look for the semver / release cadence decision).

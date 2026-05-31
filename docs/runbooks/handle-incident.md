# Runbook: Handle an Incident

> What to do when CI gates fail on `main`, a release ships broken, or a downstream consumer reports a regression. Diagnose → rollback → hotfix.

## When to use

Use this runbook when:

- A CI gate on `main` is red after a merge.
- A published release is broken (npm install fails, runtime error, etc.).
- A consumer reports a regression that bisects to a recent merge.
- The docs site is down or serving stale content.
- The coherence auditor passes locally but fails in CI (or vice versa).

Do **not** use this runbook for:

- Feature branch CI failures — those are normal; fix them on the branch.
- Suspected vulnerabilities — follow `SECURITY.md` instead.
- Cloud infra outages outside our control (Cloudflare, npm registry) — wait it out and post a status update.

## The model

Incidents have three phases:

1. **Diagnose** — understand what broke and how. No code changes yet. Time-bounded to ~15 minutes for the initial read; escalate if you can't characterize the failure in that window.
2. **Stop the bleed** — get `main` and the published artifact back to a known-good state. Either revert or roll forward. Prefer revert unless roll-forward is genuinely faster.
3. **Hotfix** — write the actual fix, ship it through the release flow, and write a post-mortem.

Skipping phases is how small incidents become bad ones. The temptation to roll forward with "I know what's wrong, give me 10 minutes" is real and usually wrong.

## Phase 1: Diagnose

### Step 1.1: Identify the failing gate

Open the CI run on the failed commit. Note:

- Which job failed (`lint`, `build`, `test`, `audit-coherence`, `deploy-docs`, etc.).
- Which step within the job failed.
- The actual error message (not the summary).

Common patterns:

- **`audit:coherence` failure on `main` but not on the PR** — the PR was rebased after a manifest change on `main`, and the auditor caught the conflict. Check what other PRs merged between the rebase and this one.
- **`build` failure with "module not found"** — a publish or workspace dependency change introduced an unresolved import. Check the diff for `package.json` or `tsconfig` changes.
- **`test` failure that's flaky locally** — race condition, time-dependent test, or test-pollution. Re-run; if it fails again, it's real.
- **`deploy-docs` failure** — usually Cloudflare auth or build artifact size. Check the deploy logs, not the workflow logs.

### Step 1.2: Identify the offending commit

```bash
git log --oneline main -20
```

If the failure correlates with a single merge, that's your suspect. If `main` has been failing for multiple commits, find the first failing commit:

```bash
git bisect start
git bisect bad main
git bisect good <last-known-good-tag>
# Bisect runs the gate locally on each step.
```

### Step 1.3: Characterize blast radius

Before doing anything, answer:

- **Is the published release affected?** If a tag was cut from this state, consumers are seeing it.
- **Is the docs site affected?** If the deploy succeeded but content is stale or wrong, consumers see it.
- **Is `main` blocked for other PRs?** If yes, every contributor is blocked until this clears.

If all three are "no" and the failure is only on `main` head with no release yet, you have room to take time. If any is "yes", you are in **stop-the-bleed** mode.

## Phase 2: Stop the bleed

### Step 2.1: Pick revert or roll-forward

**Revert** when:

- The offending commit is identifiable and revertable cleanly.
- The fix is non-trivial or you don't know it yet.
- The blast radius includes a published release or the docs site.

**Roll forward** when:

- You have a one-line fix that is genuinely obvious and testable.
- The offending commit cannot be cleanly reverted (e.g., it landed alongside other changes that depend on it).
- A revert would itself cause coherence failures.

When in doubt: revert. Reverts are reversible; bad hotfixes compound the incident.

### Step 2.2a: Revert

```bash
git checkout main
git pull --ff-only
git revert <bad-sha> --no-edit
git push
```

If the bad commit is a merge commit, use `git revert -m 1 <merge-sha>`.

Wait for CI on the revert to go green. If the revert itself fails CI, the situation is worse — escalate to the maintainers.

### Step 2.2b: Roll forward

Open a `hotfix/` branch from `main`:

```bash
git checkout -b hotfix/<short-description>
# Make the minimal fix.
# Run the full local gate suite.
pnpm run lint && pnpm run build && pnpm run test && pnpm --filter @pxlkit/ui-kit audit:coherence
```

Open a PR with the label `hotfix`. The label tells reviewers to drop everything; merge as soon as one reviewer approves and CI is green.

### Step 2.3: If a release was affected

If a published npm release is broken:

1. Do **not** unpublish. Unpublishing breaks lockfiles for every consumer who already installed.
2. Cut a new patch release with the fix (revert or hotfix), following `ship-a-release.md`.
3. After the patch is published, run `npm dist-tag add @pxlkit/ui-kit@<new-version> latest` if the workflow didn't already.
4. Post a note in the GitHub Release of the broken version pointing at the patch.

If the docs site is serving wrong content:

1. Trigger a manual redeploy from the Cloudflare Pages dashboard pointing at the last green commit.
2. After the fix lands on `main`, let the normal deploy take over.

## Phase 3: Hotfix and post-mortem

### Step 3.1: Write the actual fix

If you reverted in phase 2, you still need to write the real fix. The revert bought time; it did not solve the problem.

Standard rules:

- Write a failing test first that reproduces the incident. The test must fail on the reverted-without-fix code.
- Implement the fix. Test goes green.
- Run the full gate suite locally before pushing.
- Open the PR with a link to the incident and the post-mortem (in progress is fine).

### Step 3.2: Ship the fix

Follow `ship-a-release.md`. The bump is almost always patch.

If the fix is large or risky, ship it under the `next` npm tag first and let it bake. The release ADR specifies when `next` is required.

### Step 3.3: Write the post-mortem

Add a markdown file to `docs/post-mortems/<YYYY-MM-DD>-<short-slug>.md`. Required sections:

```md
# <YYYY-MM-DD>: <one-line incident summary>

## Impact
Who was affected, for how long, in what way.

## Timeline
Wall-clock events with timestamps (UTC). Include detection, diagnosis, stop-the-bleed, fix, post-mortem.

## Root cause
What actually broke and why. No "user error" framings — focus on the system.

## What worked
What in our process caught or limited the incident.

## What didn't work
What in our process let it through or made it worse.

## Action items
Concrete, owned, dated. Tracking issues linked.
```

Post-mortems are blameless. The goal is system improvement, not accountability theater.

### Step 3.4: Close the loop

- Update relevant ADRs if the incident reveals a missing decision.
- Update relevant runbooks if a step in this incident was missing or wrong.
- If the incident exposed a missing CI gate, open an issue to add it.

## Common mistakes

- **Skipping diagnosis to "save time".** You will spend the saved time on a worse incident next month. Always do step 1.
- **Pushing a hotfix without running the full gate suite locally.** The incident already proved the remote gates can be wrong-in-context. Trust local + remote, not just remote.
- **Unpublishing an npm release.** Don't. Ever. Patch over instead.
- **Reverting a merge commit without `-m 1`.** Git will refuse or do the wrong thing.
- **Calling the incident done before the post-mortem ships.** The post-mortem *is* part of the incident response. Without it, the next one is the same one.

## Escalation

If at any point you are unsure or the incident is widening:

1. Stop touching things.
2. Post in the maintainers channel with: failing gate, suspected commit, blast radius, what you've tried.
3. Wait for backup. Two heads on a live incident is always better than one head moving fast.

## See also

- `docs/runbooks/ship-a-release.md` — release mechanics for the hotfix.
- `docs/runbooks/audit-coherence.md` — common auditor failures.
- `docs/governance/COHERENCE_PHILOSOPHY.md` — why coherence gates are non-bypassable.
- `SECURITY.md` — vulnerability disclosure (different process from incidents).

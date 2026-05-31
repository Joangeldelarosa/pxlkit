# Contributing to pxlkit

> The main entrypoint for contributors. Read this first; the runbooks linked below cover the specific workflows.

The root `CONTRIBUTING.md` covers the high-level OSS contribution flow (forks, branches, commit convention). This document is the **internal contributor guide**: it explains *how the kit is organized*, *what discipline you are expected to follow*, and *which runbook or skill to reach for in each situation*.

If you are contributing from outside the maintainer team, you still need to follow these rules. They are not optional, and CI enforces most of them.

## The mental model

pxlkit is a **monorepo with a strict SSOT discipline**. Every UI component is described by four colocated files:

```
packages/ui-kit/src/<category>/<ComponentName>/
  <ComponentName>.tsx              # implementation
  <ComponentName>.manifest.ts      # SSOT metadata: name, category, props, status, examples
  <ComponentName>.examples.tsx     # exported example snippets used by docs + Storybook
  __tests__/<ComponentName>.test.tsx
```

Everything downstream — the docs site, the registry consumed by the visual builder, search indexes, READMEs — is **generated** from those manifests. You never hand-edit a downstream artifact. If a downstream artifact is wrong, fix the manifest and regenerate.

Read `docs/governance/COHERENCE_PHILOSOPHY.md` once. It explains *why* this discipline exists. The rest of this document assumes you have.

## Before you start

- **Node ≥ 20, npm ≥ 10.** The root `CONTRIBUTING.md` covers install.
- **Read the relevant ADR.** Anything in `docs/adr/` is a durable decision. If your change conflicts with an ADR, open a new ADR proposing the change before writing code.
- **Check the deprecation list.** `packages/ui-kit/src/_deprecated/` contains tombstones for removed components. Do not resurrect a deprecated name; pick a new one.

## What to do, by situation

### "I want to add a new component"

Use the **`pxlkit:add-component`** skill. Then follow `docs/runbooks/add-component.md`.

The skill scaffolds all four SSOT files from templates, asks you three questions (Name, Category, Kind), and triggers the docs build + auditor at the end. Do not hand-roll a new component directory. The skill encodes conventions that change over time; the templates always match what the auditor expects.

### "I want to edit an existing component"

Just open the file. Standard rules:

- Edits to props or behavior must update the manifest in the **same commit**.
- Edits to examples must keep `examples.tsx` exports in sync with the manifest's `examples` array.
- Run `pnpm --filter @pxlkit/ui-kit docs:build && pnpm --filter @pxlkit/ui-kit audit:coherence` before pushing.

### "I want to deprecate or remove a component"

Use the **`pxlkit:deprecate-component`** skill. Then follow `docs/runbooks/deprecate-component.md`.

Never delete a component file without going through the runbook. Removal without a tombstone breaks downstream consumers on the previous minor version.

### "I want to ship a release"

Follow `docs/runbooks/ship-a-release.md`. This covers the version bump cascade, docs regeneration, CHANGELOG consolidation, and tagging. The **release agent** owns the actual commit and tag — contributors do not push releases directly.

### "CI is failing on `main` and I need to triage"

Follow `docs/runbooks/handle-incident.md`. It covers the diagnose → rollback → hotfix loop and which gates are blocking vs advisory.

### "The coherence auditor is yelling at me"

Run `docs/runbooks/audit-coherence.md`. It walks through the common failure modes and their fixes.

### "I want to add or modify icons"

Run `node validate-icons.js` after any change under `packages/ui-kit/src/icons/`. For polish passes on existing icons, use the **`pxlkit:icon-refinement`** skill.

### "I want to change a coherence rule"

Open an ADR. Update the auditor, the relevant skill template, and `COHERENCE_PHILOSOPHY.md` in the same PR. Do not silence the auditor.

## The discipline (non-negotiables)

1. **SSOT or it didn't happen.** If a fact about a component lives in two files, you have already created a bug. Generated artifacts are not SSOT.
2. **Manifest and impl ship together.** A commit that changes one without the other is a coherence failure waiting to happen.
3. **The auditor is a CI gate, not a warning.** Red auditor = blocked merge. Fix the rule or fix the code.
4. **Skills exist so you don't have to remember conventions.** If there is a skill for what you are doing, use it. Hand-rolling is allowed but you own every drift it introduces.
5. **Deprecate, don't delete.** Components leave the kit through `_deprecated/` with a tombstone manifest. The deprecation review workflow archives them later.
6. **No commits to `main` from contributor PRs.** Everything goes through review. The release agent and the docs regeneration bot are the only exceptions.

## Commit convention

The root `CONTRIBUTING.md` covers the Conventional Commits format. The additional rule for component work:

- `feat(ui-kit): add PixelStatGrid` — a new component.
- `fix(ui-kit): PixelDataTable column resize off-by-one` — a bug fix.
- `chore(ui-kit): regenerate docs and registry` — a generated-artifact-only commit (usually from the docs bot).
- `chore(ui-kit): deprecate PixelOldThing` — a tombstone commit.

Keep generated-artifact commits separate from logic commits. It makes review and revert sane.

## Runbooks index

The runbooks live in `docs/runbooks/`:

- [`add-component.md`](../runbooks/add-component.md) — adding a new component end-to-end.
- [`deprecate-component.md`](../runbooks/deprecate-component.md) — removing or marking a component deprecated.
- [`ship-a-release.md`](../runbooks/ship-a-release.md) — release flow: bump, regenerate, changelog, tag.
- [`handle-incident.md`](../runbooks/handle-incident.md) — CI failures on `main` and hotfix flow.
- [`audit-coherence.md`](../runbooks/audit-coherence.md) — running the auditor and fixing common failures.

## Governance docs

- [`COHERENCE_PHILOSOPHY.md`](./COHERENCE_PHILOSOPHY.md) — why we treat coherence as load-bearing.
- ADRs live under `docs/adr/`. Read before proposing structural changes.

## Skills index

Project-scoped Claude skills live under `.claude/skills/`. The ones you will actually use:

- `pxlkit:add-component` — scaffold a new component (see add-component runbook).
- `pxlkit:deprecate-component` — tombstone an existing component (see deprecate runbook).
- `pxlkit:icon-refinement` — guided polish pass on icons.
- `monorepo:coherence-audit` — what CI runs; you usually invoke via the npm script.
- `design-system:governance` — design-token and visual-language reviews.
- `ssot:component-library` — the meta-skill that codifies the SSOT discipline above.

## Questions

If a runbook does not answer your question, open a discussion. Do **not** invent a new convention silently. The kit is small enough that one wrong pattern, copy-pasted three times, becomes the new de facto standard.

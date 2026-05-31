# Runbook: Add a Component

> End-to-end flow for adding a new component to `@pxlkit/ui-kit`. Driven by the `pxlkit:add-component` skill.

## When to use

Use this runbook when you are adding a **brand-new component** to `packages/ui-kit/src/<category>/`. If you are editing an existing component, skip this runbook and edit the file directly (but remember: manifest + impl ship together).

Do **not** use this runbook for:

- Hooks or utilities (`hooks/`, `utils/` — different conventions).
- Storybook-only variants of an existing component (edit the existing `examples.tsx`).
- Renames (deprecate the old name, add the new one — see `deprecate-component.md`).

## Prerequisites

- You are on a feature branch off the latest internal base branch (not `main`).
- The kit builds clean: `pnpm --filter @pxlkit/ui-kit build` succeeds before you start.
- You know:
  - **Name** — PascalCase, prefixed `Pixel*` (e.g. `PixelStatGrid`). Must not collide with an existing or deprecated name.
  - **Category** — lowercase directory: one of `cards`, `forms`, `data`, `overlays`, `feedback`, `navigation`, `layout`, `hero`. New categories require an ADR.
  - **Kind** — one of `form | overlay | data | card | feedback | navigation | layout | hero`. Drives the example scaffold.

If you cannot answer all three confidently, stop and read the relevant ADRs in `docs/adr/` or ask in the design-system channel.

## Steps

### 1. Run the skill

```bash
# From the repo root, in a Claude session:
pxlkit:add-component
```

The skill prompts for Name, Category, and Kind, then writes four files into `packages/ui-kit/src/<category>/<ComponentName>/`:

- `<ComponentName>.tsx` — implementation stub.
- `<ComponentName>.manifest.ts` — SSOT metadata.
- `<ComponentName>.examples.tsx` — example snippets.
- `__tests__/<ComponentName>.test.tsx` — failing placeholder test.

### 2. Fill in the manifest

Open `<ComponentName>.manifest.ts` and replace every `TODO` marker. The required fields:

- `name` — must match the PascalCase component name exactly.
- `displayName` — kebab-case, e.g. `pixel-stat-grid`. Used as a stable ID across the kit.
- `category` — lowercase, matches the directory.
- `kind` — matches what you passed the skill.
- `description` — **one sentence, ends with a period.** No marketing.
- `examples` — array of names that **must** correspond to exports in `examples.tsx`.
- `status` — `experimental` for new components by default; promote to `stable` in a later PR after real usage.

### 3. Implement the component

Edit `<ComponentName>.tsx`. Standard rules:

- TypeScript strict throughout.
- Props interface exported as `<ComponentName>Props`.
- Forward refs where it makes sense (anything that wraps a DOM element).
- No inline styles for design tokens — use the existing token system.
- No new dependencies without an ADR.

### 4. Write the examples

`examples.tsx` exports must match the manifest's `examples` array exactly. At minimum, one example named `Default`. Add `WithIcons`, `Loading`, `Disabled`, etc. as appropriate for the Kind.

Each example must render with no required props from the parent — they are mounted in isolation by the docs site and Storybook.

### 5. Write the test

Replace the placeholder in `__tests__/<ComponentName>.test.tsx`. Minimum bar:

- One render test (component mounts without throwing).
- One behavior test for the primary prop or interaction.

The full test discipline is in the testing ADR. The skill's placeholder is *not* sufficient — it is a starting point.

### 6. Regenerate downstream artifacts

```bash
pnpm --filter @pxlkit/ui-kit docs:build
```

This rebuilds the docs site content, the registry JSON, and the search index from the manifests.

### 7. Run the auditor

```bash
pnpm --filter @pxlkit/ui-kit audit:coherence
```

Expected output: green. If it is red, the message tells you which file to fix. Common new-component failures:

- **`manifest references example X which is not exported`** — the `examples` array has a name that does not match an `examples.tsx` export.
- **`displayName collision with deprecated component`** — pick a different name; do not resurrect deprecated names.
- **`test file missing`** — the skill's placeholder was deleted; restore it.
- **`category Y is not in the allowed list`** — you typo'd the directory, or you are inventing a new category (open an ADR).

For other failures, see `docs/runbooks/audit-coherence.md`.

### 8. Storybook visual check

```bash
pnpm --filter @pxlkit/ui-kit storybook
```

Confirm the new component appears in the sidebar under the right category, all examples render, and controls work. If anything looks off, fix it before opening a PR.

### 9. Open the PR

Commit message convention:

```
feat(ui-kit): add PixelStatGrid

- Stat card grid for dashboard hero areas.
- Kind: data. Examples: Default, Loading, Empty.
- Status: experimental.
```

PR checklist:

- [ ] All four SSOT files committed together.
- [ ] Docs site regenerated (`pnpm docs:build`).
- [ ] Auditor green (`pnpm audit:coherence`).
- [ ] Storybook entry verified visually.
- [ ] No new dependencies (or ADR linked if there are).

## Common mistakes

- **Editing generated files instead of manifests.** The docs site, registry JSON, and search index are *outputs*. If you edit them directly, your changes will be overwritten on the next `docs:build`. Always fix the manifest.
- **Splitting impl and manifest across commits.** The coherence auditor passes per-commit on `main`. Splitting them means one commit is broken in isolation, which breaks `git bisect`.
- **Marking experimental components as stable.** Don't. Status is promoted in a follow-up PR after the component has been used in at least one real consumer.
- **Skipping the test.** The auditor checks for file presence, not test quality. A placeholder test passes the auditor but fails review.

## See also

- `pxlkit:add-component` skill: `.claude/skills/pxlkit-add-component/SKILL.md`.
- Coherence philosophy: `docs/governance/COHERENCE_PHILOSOPHY.md`.
- Auditor runbook: `docs/runbooks/audit-coherence.md`.
- Deprecation runbook: `docs/runbooks/deprecate-component.md`.

---
name: icon
description: Use when creating a pixel-art icon in pxlkit's PxlKitData format (16x16 grid plus palette), static or animated. Validates against both pxlkit icon validators before writing.
allowed-tools: [Read, Write, Edit, Glob, Grep, Bash]
argument-hint: "[name] [description] [--pack ui|feedback|social|weather|gamification|effects|parallax] [--animated]"
---

# Authoring a pxlkit icon

pxlkit icons are not SVG files. The source of truth is a TypeScript object holding a character grid and a palette; `@pxlkit/core` generates the SVG at runtime. You are writing that object.

The full contract is in `${CLAUDE_PLUGIN_ROOT}/references/icon-spec.generated.md`, transcribed from both validators. Read it before designing.

## Which mode you are in

**Standalone — the default.** The user is working in their own project. Write the icon to `src/icons/<name>.ts` there and validate it. This is the common case; do not assume otherwise.

**Contributor.** Only when you detect the pxlkit monorepo itself — `validate-icons.js` at the root and a `packages/core` directory. Then there are three extra steps, and the third is the one people forget.

## Step 0 — Context

```bash
node ${CLAUDE_PLUGIN_ROOT}/scripts/check-updates.mjs
```

Hold the output for the end.

## Step 1 — Check the concept is not already covered

`${CLAUDE_PLUGIN_ROOT}/references/icon-shapes.generated.json` carries the name, tags and silhouette of all 226 shipped icons. Search it by tag before designing anything.

If something close already exists, say so and show it. Reaching for an existing icon is a better outcome than a near-duplicate that fragments the set.

## Step 2 — Design the grid

Sixteen strings of exactly sixteen characters. `.` is transparent; every other character needs a palette entry.

Default palette, unless the user asks otherwise — these are the dark-theme `--retro-*` values, which is what makes a new icon sit naturally beside the existing packs:

```
#00FF88  green      #4ECDC4  cyan       #FFD700  gold
#FF6B6B  red        #A78BFA  purple     #F472B6  pink
```

What works at this size, in order of how often it goes wrong:

- **Silhouette before detail.** At 16×16 the outline carries the meaning. If it is unreadable in one colour it will not be saved by shading.
- **Two or three colours.** A base, a shadow, and one highlight. More reads as noise.
- **Anchor to the grid.** Centre the mass; leave a one-pixel margin so the icon does not collide with its neighbours.
- **No anti-aliasing.** Every pixel is on or off. Diagonal edges are staircases, and that is the aesthetic, not a compromise.

Show the ASCII grid in your reply as you iterate. The grid *is* the preview.

## Step 3 — Look at it

```bash
node ${CLAUDE_PLUGIN_ROOT}/scripts/render-icon.mjs <draft.ts> --out preview.svg
```

Prints an ASCII block preview and writes an 8× SVG. Actually look at the result and ask whether the shape reads at 16 pixels. Character grids lie: shapes that look fine as text frequently do not resolve as images.

## Step 4 — Validate before writing anything final

```bash
node ${CLAUDE_PLUGIN_ROOT}/scripts/check-icon.mjs <draft.ts>
```

Exit 0 is required. This is a strict superset of both validators the project runs, so passing here means passing CI.

How to read what it reports:

- **Errors** must be fixed. Row length, palette coverage, kebab-case name, hex format, zero-opacity entries, a name already used *in the same pack*.
- **A duplicate error** — high silhouette overlap *and* a shared semantic tag — means it is the same icon with a different name. Change the concept or the shape.
- **A duplicate warning** — high overlap, no shared tags — is usually a legitimate family member. Arrows and faces overlap by design. Confirm it reads differently at 16px and move on.
- **Density warnings** mean the grid is nearly empty or nearly solid. Both read badly at this size.

## Step 5 — Write it

**Standalone:** `src/icons/<name>.ts`, exporting `export const <PascalName>: PxlKitData`. File and `name` are kebab-case; the export is PascalCase. Show the usage snippet:

```tsx
import { PxlKitIcon } from '@pxlkit/core';
import { MyIcon } from './icons/my-icon';

<PxlKitIcon icon={MyIcon} size={32} />
```

With `appearance="solid"` you must pass an explicit `color`. The icon renders as a data-URI `<img>` so it can force nearest-neighbour scaling, which cuts it off from the CSS context — `currentColor` never reaches it.

**Contributor:** all three steps, then verify each.

1. `packages/<pack>/src/icons/<name>.ts`
2. Re-export from `packages/<pack>/src/index.ts`
3. **Add it to the `icons` array of that pack's `IconPack` export** (`UiPack`, `FeedbackPack`, …). Skip this and the icon exists but never appears in the pack — the failure is invisible until someone asks why their icon is missing.

Then, from the repo root:

```bash
node validate-icons.js
```

Exit 0, and the reported file count must be one higher than before.

## Animated and parallax

Animated icons swap `grid` for `frames`, plus `frameDuration` in milliseconds and a `trigger` of `loop`, `once`, `hover`, `appear` or `ping-pong`. Every frame is validated independently. A per-frame palette merges over the base.

Parallax icons are layered compositions: `layers` ordered back to front, `depth: 0` anchoring, positive behind, negative popping out.

## Licensing — get this right

An icon the user creates in their own project **is theirs**. `LICENSE-ASSETS` covers the icon packs that ship with pxlkit, and `CONTRIBUTOR_LICENSE` applies only if they contribute the icon to the repository.

What does require visible attribution — "Icons by Pxlkit", linking to pxlkit.xyz — is *using* pxlkit's existing icons. Say that when it applies, and do not imply the user owes anything for an icon they drew.

Put any update-check line at the very end.

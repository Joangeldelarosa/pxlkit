---
name: imagine
description: Use when the user wants to build a new pixel-art or retro frontend, page, or app with pxlkit (@pxlkit/ui-kit) - landings, dashboards, portfolios, game UI, marketing pages. Composes from the real component API instead of freehand JSX. Triggers - "pixel art landing", "retro dashboard with pxlkit", "build a page with pxlkit", "imagine a pxlkit frontend", "make a game UI with pxlkit".
allowed-tools: [Read, Write, Edit, Glob, Grep, Bash]
argument-hint: "[description] [--from landing|dashboard|ecommerce|portfolio|docs] [--surface pixel|linear]"
---

# Building a frontend with pxlkit

The failure mode this skill exists to prevent is generic React wearing a retro colour scheme: eight components used repeatedly, hand-rolled divs where the kit has a component, and Tailwind greys that ignore the theme. Everything below serves the opposite outcome.

## Phase 0 — Ground yourself in the real project

```bash
node ${CLAUDE_PLUGIN_ROOT}/scripts/preflight.mjs --json <project-dir>
node ${CLAUDE_PLUGIN_ROOT}/scripts/check-updates.mjs
```

Exit 2 means stop and hand off to `/pxlkit:start`. Exit 1 means fix the setup first — a page built before `styles.css` is imported looks broken for a reason that has nothing to do with the page.

Then compare the installed kit version against `${CLAUDE_PLUGIN_ROOT}/references/VERSION.json`. **If they differ by minor or major, `node_modules` wins.** Read the real types from the installed package and say so. The bundled digest is a map, not the territory.

Hold the update-check output for the end of your reply.

## Phase 1 — Decide the structure before touching code

Ask at most **three** questions, all in one message, and only about things the request genuinely left open: what kind of page, the dominant tone, light or dark by default. If the request already answers them, ask nothing.

Load `${CLAUDE_PLUGIN_ROOT}/references/recipes.generated.md` and choose five to nine sections. The recipes are extracted from templates that actually ship, so they are known to compile and known to look right.

## Phase 2 — Budget the composition, in writing, before any code

Produce a table: section → recipe → primary components → tone → the one thing that makes this section memorable. Show it to the user.

This exists because composition decided while typing JSX converges on whatever is easiest to type. Deciding first, in a table, is what produces range.

Check it against `${CLAUDE_PLUGIN_ROOT}/references/diversity-menu.generated.md`, which marks every component by how many real templates already use it. Floors:

| Page type | Distinct components | Categories | Marked `[underused]` |
|---|---|---|---|
| Landing | 25 | 8 | 3 |
| Dashboard | 20 | 6 | 2 |
| Simple page | 12 | 5 | 1 |

**These are floors with a justifiable exception, not quotas.** They are calibrated from the repo's own templates — its best landing reaches 27 components across 8 categories — so they ask for parity with hand-written work. But adding a `PixelDatePicker` to a landing page to clear a number makes the page worse. If an honest page cannot reach the floor, say so in the report and explain why. Gaming the measurement is a worse outcome than missing it.

Also: adjacent sections should not share a primary component, at least four tones should appear, and every hero needs either `media` or a motion effect.

## Phase 3 — Write it

Load only the `references/components/<category>.generated.md` files for the categories you are actually using. Loading all twelve wastes context you need for the work.

Follow the shape the real templates use: data in `const` arrays at the top, JSX that maps over them. It reads better and it makes the content editable without touching markup.

Rules that are not stylistic preferences — each one is a bug that compiles:

- Never mix the two tone scales. `toneMap` (`common.tsx`) is for controls; the `tone` record (`tokens.ts`) is for surfaces. Same seven key names, different purposes.
- Only `retro-*` tokens for colour. No `bg-slate-800`, no `text-[#00ff00]`, no inline hex.
- `useToast()` requires `PxlKitToastProvider` above it, or it throws at runtime.
- `PixelCard` with `href` must not contain buttons or links.
- `PixelCard` with `interactive` and no `href` needs an `onClick`.
- With `PixelForm.Field`, do not also pass `label` or `error` to the input.
- `PxlKitIcon` with `appearance="solid"` needs an explicit `color`; it renders through an `<img>` and cannot see `currentColor`.
- `font-pixel` for display type only — it is unreadable as body text.
- `PixelDataTable` paginates only when you pass `pagination`.
- Sections use the canonical `PixelContainer` wrapper from the recipes rather than ad-hoc padding.

Providers go at the application root, not per page.

## Phase 4 — Validate

Run the `/pxlkit:audit` gates against what you just wrote. Not a summary of them — the gates themselves, with their exit codes. Fix and re-run, up to three rounds per gate.

The fastest signal, worth running first:

```bash
node ${CLAUDE_PLUGIN_ROOT}/scripts/token-purity.mjs <path>
node ${CLAUDE_PLUGIN_ROOT}/scripts/count-diversity.mjs --type <type> <path>
```

## Phase 5 — Report

Give the gate table with real PASS / FAIL / SKIP values, the distinct-component count against the floor, and the underused components you reached for. If something is still failing after three rounds, say so — that is more useful than a clean-looking summary that does not survive first contact.

Suggest `/pxlkit:audit --visual` as the follow-up. Put any update-check line last.

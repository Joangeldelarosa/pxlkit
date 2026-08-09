---
name: audit
description: Use when reviewing or fixing an existing UI built with pxlkit (@pxlkit/ui-kit) for canonical API usage, accessibility and pixel-perfect visual quality. Also the validation subroutine the pxlkit imagine and pixelate skills run on their own output. Triggers - "audit my pxlkit UI", "is this pxlkit code correct", "fix my pxlkit styling", "check my pixel art page".
allowed-tools: [Read, Edit, Glob, Grep, Bash]
argument-hint: "[path] [--fix] [--visual]"
---

# Auditing a pxlkit UI

Two things separate this from reading the code and forming an opinion: every check is a command with an exit code, and a check that could not run is reported as skipped rather than passed.

**The rule that matters most:** if a gate still fails after three attempts, report it as failing. Do not soften it, do not relabel it, do not describe partial progress as success. A false PASS is worse than a FAIL, because the user stops looking.

## Step 0 — Version context

Read the kit version the target project actually has:

```bash
node -p "require('<project>/node_modules/@pxlkit/ui-kit/package.json').version"
```

Compare it to `${CLAUDE_PLUGIN_ROOT}/references/VERSION.json`. If they differ by a minor or major version, **the installed package wins**: read the real types from `node_modules/@pxlkit/ui-kit/` rather than trusting the bundled digest, and say you are doing so. The digest orients; it does not override what is installed.

Run `node ${CLAUDE_PLUGIN_ROOT}/scripts/check-updates.mjs` and save any output for the very end.

## The gates

Run every one. Report the table even when everything passes.

| Gate | Command | Passes when | Severity |
|---|---|---|---|
| G1 types | `npx tsc --noEmit` | exit 0 | blocker |
| G2 build | the project's build script | exit 0 | blocker |
| G3 runtime | load each route in a browser | no console errors, no 404 assets | blocker |
| G4 diversity | `node ${CLAUDE_PLUGIN_ROOT}/scripts/count-diversity.mjs --type <landing\|dashboard\|page> <path>` | meets the floor | major |
| G5 token purity | `node ${CLAUDE_PLUGIN_ROOT}/scripts/token-purity.mjs <path>` | exit 0 | major |
| G6 visual | screenshots at 390 / 768 / 1440, light and dark | checklist ≥ 8/10, no horizontal overflow | major |
| G7 a11y | axe-core per route | no serious or critical violations | major |
| G8 setup | `node ${CLAUDE_PLUGIN_ROOT}/scripts/preflight.mjs <project>` | exit 0 | blocker |

**On missing tooling.** G3, G6 and G7 need a browser. If one is available in this environment, use it. If not, ask before installing — `npx playwright install chromium` pulls roughly 300 MB onto the user's machine, and doing that unannounced is not acceptable. Without a browser those three gates are **SKIP**, reported as SKIP in the table. A skip is never a pass.

## Static rules

These are the mistakes that compile, render, and are still wrong. Grep for each; for every hit give `file:line`, the reason, and the fix.

**The two tone scales are not interchangeable.** `toneMap` in `common.tsx` styles *controls* — buttons, inputs, toasts. The `tone` record in `tokens.ts` styles *surfaces* — cards, hero, bento, charts. They share the same seven key names, which is exactly why the mistake is easy and invisible: the wrong one produces a component that is subtly off-palette rather than broken. See `references/tokens.generated.md`.

**Raw palette classes and inline hex.** Anything like `bg-slate-800`, `text-[#00ff00]`, or `style={{ color: '#f00' }}` is a pixel of the page that ignores the theme, does not flip in dark mode, and survives no re-skin. `token-purity.mjs` finds these. Legitimate exceptions it already knows about: icon palettes, `color=` passed to `PxlKitIcon`, mask gradients.

**`PixelCard` with `href` containing interactive children.** Renders an anchor wrapping a button — invalid HTML, and keyboard navigation breaks. Use `onClick` on the card, or move the action outside it.

**`interactive` without `onClick`.** The card announces itself as a button to assistive tech and then does nothing.

**`useToast()` outside `PxlKitToastProvider`.** Throws at runtime, not build time, so it survives every check that is not this one.

**`const toast = useToast()`.** The hook returns an object; the toast function is a property of it. It is `const { toast } = useToast()`. The wrong form type-errors on first use, but it is the single most common way to get this API wrong.

**`PixelRibbon` wrapped around a grid child.** The ribbon is positioned decoration, so wrapping a grid or flex child pulls it out of flow — the child lands somewhere else on the page entirely, and the layout silently loses an item. For "mark this card", the canonical route is `PixelCard`'s own `badge={{ label, tone }}` prop.

**A `2x2` bento cell beside cells with minimal content.** The small cells stretch to the tall row's height and leave dead space. Bento hierarchy is for blocks of comparable weight; one large block plus several minimal ones belongs in a `PixelStatGroup` under the feature card, not in the same bento.

**A looping `PixelGlitch` or `PixelFlicker` on text that must be read.** Names, headings and numbers spend part of every cycle illegible. Use `trigger="hover"` so the effect is on demand.

**`toast.loading` with no resolution.** A spinner that never ends. Every loading toast needs an `update` or a `promise`.

**`PixelForm.Field` with `label` or `error` also on the input.** The field renders them; passing them again duplicates the label and breaks the `htmlFor` association.

**`PxlKitIcon appearance="solid"` without `color`.** The icon renders as a data-URI `<img>` so it can force nearest-neighbour scaling, which isolates it from CSS — `currentColor` does not reach it. This is documented behaviour, not a bug, and the fix is an explicit `color`.

**`font-pixel` on body text.** Press Start 2P is unreadable below roughly 12px. Display type only.

**`PixelDataTable` expectations.** Pagination appears only when `pagination` is passed; `rowSelection` injects a checkbox column that changes the layout.

## The visual checklist

Judge these from the screenshots, not from the source. Each is yes or no. Pass at 8 of 10.

1. Staircase corners visible on cards and buttons — this is the proof `styles.css` actually loaded.
2. Hard offset shadows, no blur.
3. Display type in `font-pixel`; body in mono or sans per surface.
4. At least four tones present and distinguishable.
5. At least one element in motion (Glitch, Float, Parallax, Carousel).
6. Dark mode is a real dark palette with neon accents, not an inverted light theme.
7. No flat white cards, no raw Tailwind greys.
8. Density: hero carries an eyebrow and supporting meta; stats carry sparklines.
9. Focus ring visible when tabbing.
10. If there is a bento, it has real hierarchy — at least one 2×2 cell, not a uniform grid.

## Reporting

A table of `rule · file:line · fix`, ordered blocker, then major, then minor — the same vocabulary the repo's own coherence gates use.

With `--fix`: apply only the mechanical corrections, **show the diff before writing**, and list separately everything that needs a human decision. Composition and hierarchy problems are never auto-fixed.

If the update check produced a line, add it at the very end.

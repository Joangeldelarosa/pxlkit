---
name: start
description: Use when setting up a project to use pxlkit (@pxlkit/ui-kit), or when asked what the pxlkit skills do. Checks React and Tailwind v4 compatibility, then applies the setup for the detected framework.
allowed-tools: [Read, Write, Edit, Glob, Grep, Bash]
argument-hint: "[project directory]"
---

# Getting a project ready for pxlkit

Your job is to answer one question honestly — can this project use `@pxlkit/ui-kit`? — and then either make it ready or explain why it cannot be.

## Step 0 — Read the ground truth

Run the preflight. Do not infer any of this by reading files yourself; the script exists so the answer is consistent across every skill in this suite.

```bash
node ${CLAUDE_PLUGIN_ROOT}/scripts/preflight.mjs --json <project-dir>
```

Exit code is the verdict:

- **2 — incompatible.** Stop. Report the blockers verbatim and explain the consequence. Do not offer to work around them.
- **1 — repairable.** Continue to Step 2.
- **0 — ready.** Skip to Step 3.

Also run the update check and hold its output for the end of your reply:

```bash
node ${CLAUDE_PLUGIN_ROOT}/scripts/check-updates.mjs
```

This makes one network request at most once a day, caches the result, times out in two seconds, and stays silent on any failure. Say so if the user asks; `PXLKIT_SKIP_UPDATE_CHECK=1` turns it off.

## Step 1 — The three blocking cases, and why they block

**Tailwind v3.** The kit's `styles.css` is not self-contained: it opens with `@import "tailwindcss"` and defines an `@theme`, so it needs a v4 pipeline. Migrating v3 to v4 changes how every existing style in the project compiles. That is a project-wide decision with a real chance of breaking things the user cares about, and it is not something to do as a side effect of adding a component library. Say that plainly, offer to plan the migration as separate work, and stop. **Never migrate inline.**

**No Tailwind at all.** Same root cause, simpler conversation: the kit needs a Tailwind v4 build. Offer to add it as its own step.

**No React, or React below 18.2.** The peer range is `^18.2.0 || ^19.0.0`. Vue, Svelte and Astro-without-React are out of scope — say so rather than improvising.

## Step 2 — Apply the setup for *this* project

Load `${CLAUDE_PLUGIN_ROOT}/references/setup.generated.md` and apply **only** the variant matching what preflight detected. It covers three frameworks (Next App Router, Next Pages Router, Vite/CRA) and three package managers, because the details genuinely differ:

- The `@source` directive that lets Tailwind see the kit's classes resolves differently under pnpm, where the package is symlinked beneath `.pnpm/`, and does not apply at all under Yarn PnP.
- In the App Router, the providers are client components, so they need a `'use client'` boundary; under Pages Router they go in `_app`; under Vite neither applies.

Propose the install command rather than running it. Show the diff for each file you touch.

The pieces that must end up present, in this order:

1. `import '@pxlkit/ui-kit/styles.css'` in the app's entry stylesheet or root layout. **Without this the pixel surface degrades silently** — components still render, they just look like plain boxes, and nothing in the console says why. It is the single most common cause of "pxlkit looks broken".
2. The `@source` directive pointing at the installed package.
3. `PxlKitSurfaceProvider`, then `PxlKitLocaleProvider`, then `PxlKitToastProvider` at the root. The toast provider is not optional if anything calls `useToast()` — it throws without it.
4. The fonts, via `buildGoogleFontsUrl(locale)`.
5. Dark mode by `.dark` class. The kit ships no theme provider, so include the inline anti-FOUC script from the reference; without it the page flashes light before hydration.

Re-run preflight afterwards and show the result. If it does not reach exit 0, say which item is still missing instead of declaring success.

## Step 3 — Introduce the suite

Five commands. Give each one line and one concrete example using something from *this* project, not a generic placeholder:

| Command | What it does |
|---|---|
| `/pxlkit:imagine` | Builds a new page or app with the kit |
| `/pxlkit:pixelate` | Converts existing React code to the kit |
| `/pxlkit:icon` | Authors an icon in the `PxlKitData` format |
| `/pxlkit:audit` | Checks an existing pxlkit UI and can fix what it finds |
| `/pxlkit:start` | This one |

## Out of scope — say so, do not improvise

The voxel engine and 3D, the web icon builder, Storybook generation, and non-React frameworks. If asked, say it is not covered rather than attempting it.

## Closing

End with one suggested next step naming something real from the project — for example, *"Try: /pxlkit:imagine a pricing page for <the actual product>"*. If the update check printed a line, add it last, on its own. Never open with it.

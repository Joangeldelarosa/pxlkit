# pxlkit — Claude Code plugin

Five skills for building pixel-art interfaces with [`@pxlkit/ui-kit`](https://www.npmjs.com/package/@pxlkit/ui-kit).

```bash
claude plugin marketplace add Joangeldelarosa/pxlkit && claude plugin install pxlkit@pxlkit
```

Documentation: [pxlkit.xyz/skills](https://pxlkit.xyz/skills) ·
Machine-readable: [pxlkit.xyz/skills/llms.txt](https://pxlkit.xyz/skills/llms.txt)

## The skills

| Command | Purpose |
| --- | --- |
| `/pxlkit:start` | Checks whether a project can run pxlkit, then applies the setup for its framework |
| `/pxlkit:imagine` | Builds a page from the real component API, budgeting composition before writing code |
| `/pxlkit:pixelate` | Converts existing React, preserving routes, state, handlers and tests |
| `/pxlkit:icon` | Authors a `PxlKitData` icon that passes both pxlkit validators |
| `/pxlkit:audit` | Types, build, runtime, diversity, token purity, screenshots, a11y |

## How it is built

Two decisions carry most of the weight.

**Nothing in `references/` is written by hand.** A `docs:build` step generates the
whole corpus — 19 files covering every component, both tone scales, the setup
recipes and occupancy signatures for every shipped icon — from the registry, the
component manifests, `tokens.ts`, `styles.css` and `core/types.ts`. Coherence gate
36 fails the build when it drifts. A reference corpus that ages in silence is worse
than none, because it is confidently wrong.

**Every quality claim is a command with an exit code.** The skills do not decide
whether their own output is good; they run `scripts/` and report what came back. A
check that could not run is reported as SKIP, never as a pass.

```
skills/          one directory per skill, each a SKILL.md
references/      generated from the kit — do not edit, run `npm run docs:build`
  pixelate-map.md  the one curated file; gate 36 checks every component it names
scripts/         dependency-free Node, since the plugin ships without node_modules
  preflight.mjs      ready / repairable / incompatible
  check-updates.mjs  cached, 2s timeout, silent on failure
  token-purity.mjs   raw Tailwind palette classes and inline hex
  count-diversity.mjs component spread against calibrated floors
  check-icon.mjs     strict superset of both icon validators
  render-icon.mjs    SVG + ASCII preview
```

## Versioning

The plugin and the kit version **independently**, and the reason matters: a fix to a
`SKILL.md` or a validation script is a real change users should be offered, and it
happens without the kit moving at all. Pinning them together would make those
releases invisible to the update check — the one thing that check exists to prevent.

`references/VERSION.json` records both:

```json
{ "plugin": "1.0.0", "uiKit": "2.1.1", "date": "…", "digestHash": "…" }
```

`plugin` is what users install and update to. `uiKit` records which version of the
kit the digest was generated from, so a skill can tell whether its map still matches
the territory — and when the project it is working in has a different version
installed, the installed package wins.

Gate 36 checks the two chains separately: `plugin.json` = the marketplace entry =
`VERSION.json#plugin`, and `VERSION.json#uiKit` = the kit's actual version.

To release the plugin:

```bash
npm run release:bump-plugin -- --version X.Y.Z
npm run docs:build     # regenerates VERSION.json#plugin
npm run audit          # gate 36 verifies both chains
```

## Network use

`check-updates.mjs` asks `pxlkit.xyz/skills/version.json` — falling back to the npm
registry — at most once every 24 hours, with a 2-second timeout. Every failure path
is silent and exits 0; it can never be the reason a skill fails.

Set `PXLKIT_SKIP_UPDATE_CHECK=1` to disable it entirely.

## Out of scope

The voxel engine and 3D, the web icon builder, Storybook generation, and frameworks
without React. The skills say so rather than improvising.

## Licence

Plugin code is MIT, like the rest of `LICENSE-CODE`. The icon artwork the skills
help you *use* is under `LICENSE-ASSETS` — free commercially with visible
attribution. An icon you author yourself is yours.

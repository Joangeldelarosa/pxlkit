# CLAUDE.md — `pxlkit`

Operating notes for Claude Code when working in this repo. Loaded automatically.

## What this is

**Pxlkit** ([pxlkit.xyz](https://pxlkit.xyz)) — Joangel De La Rosa's open-source retro pixel-art monorepo. Three concerns wired together:

1. **226+ pixel-art SVG icons** in 7 themed packs (`@pxlkit/{gamification,feedback,social,weather,ui,effects,parallax}`).
2. **`@pxlkit/ui-kit`** — 40+ retro React UI components with locale provider (54 names in `packages/ui-kit/src/registry.ts`).
3. **`@pxlkit/voxel`** + the in-app `apps/web/src/components/procedural-terrain/` engine — 3D voxel city on Three.js + R3F (Three 0.183 / R3F 9.5 / drei 10.7). Demo lives at `/explore`.

## Stack at a glance

- Node ≥20, npm 10.9.0 (pinned), Turborepo 2.4.
- React 19, Next.js 15.1, TypeScript 5.7 (strict), Tailwind 4.2.
- Vitest 4 + jsdom + @testing-library/react 16. Storybook 8.6 at root `.storybook/`.
- tsup builds every package (ESM + CJS + dts + sourcemaps + treeshake, react externalized).
- Vercel for hosting (`@vercel/analytics`, `@vercel/kv`). PayPal REST + Resend for license delivery.

## Workspace layout

```
packages/
  core/            MIT — types, components (PxlKitIcon, AnimatedPxlKitIcon, ParallaxPxlKitIcon, PixelToast), utils
  ui-kit/          MIT — 40+ retro components + PxlKitLocaleProvider
  voxel/           MIT — pxlToVoxels, upscaleGrid, VoxelBomb (v0.1.x, breaking changes allowed)
  parallax/        Asset license — 10 multi-layer 3D parallax icons
  gamification/    Asset license — 51 icons
  feedback/        Asset license — 33 icons
  social/          Asset license — 43 icons
  weather/         Asset license — 36 icons
  ui/              Asset license — 41 icons
  effects/         Asset license — 12 animated VFX
apps/
  web/             Next.js 15 showcase site (@pxlkit/web v1.0.2) — port 3333
```

`apps/web/tsconfig.json` aliases every `@pxlkit/*` to `../../packages/<name>/src`, and `next.config.ts` lists them all in `transpilePackages` — dev runs against live source with no rebuilds.

## Routes (`apps/web/src/app/`)

`/` `/docs` `/icons` `/ui-kit` `/templates` `/templates/preview` (isolated, no shell) `/builder` `/explore` (R3F voxel city) `/pricing` `/toast` `/api/paypal/capture`. `ConditionalShell` skips Navbar+Footer only for `/templates/preview`.

## Commands

| | |
|---|---|
| `npm run dev` | `turbo dev` — web on `http://localhost:3333` |
| `npm run build` | `turbo build` |
| `npm run test` | `turbo test` |
| `npm run lint` | `turbo lint` |
| `npm run storybook` | Storybook on port 6006 |
| `node validate-icons.js` | Audit icon-pack grids/palettes (run from root) |

PayPal local-dev shortcut: POST `orderID: 'DEV_ORDER_ID'` to `/api/paypal/capture` while `NODE_ENV === 'development'` to simulate a successful capture without real PayPal creds.

## Licensing (don't conflate)

- `LICENSE-CODE` (MIT) → `@pxlkit/core`, `@pxlkit/ui-kit`, `@pxlkit/voxel`, the Next.js app source.
- `LICENSE-ASSETS` (source-available, attribution required) → icon-pack packages + all exported icon data + screenshots/marketing imagery.
- `COMMERCIAL_TERMS` → paid plans remove the attribution requirement **on assets only**; MIT code is unaffected.
- `TRADEMARK_POLICY` → the `Pxlkit` name, `@pxlkit/*` namespace, logo, and pxlkit.xyz trade dress are **not** licensed by the above. Only factual "Built with Pxlkit" / attribution is allowed.
- `CONTRIBUTOR_LICENSE.md`, `THIRD_PARTY_NOTICES`, `SECURITY.md` round out the model.

When adding a code package use MIT; when adding an icon pack use the asset license + symlink `LICENSE` to `LICENSE-ASSETS`. Contributors who add a complete pack get a free Team license (documented in `CONTRIBUTING.md`).

## Icon authoring rules

- Files: kebab-case (`fire-sword.ts`).
- Grid: **exactly 16 rows × 16 chars**.
- Palette keys: single uppercase letters (`A–Z`). `.` is always transparent — never declare it in the palette.
- Tags: 2–5 meaningful entries for searchability.
- `author: 'pxlkit'` for community contributions.
- Hex palette supports 8-digit alpha (`#RRGGBBAA`).
- Validate with `node validate-icons.js` before committing.

## Commit convention

Conventional Commits: `feat`, `fix`, `docs`, `chore`, `refactor`, `test`, `style`, `perf`. Example: `feat: add lightning-bolt icon to weather pack`.

## Procedural terrain — heads up

`apps/web/src/components/procedural-terrain/` is the active R&D for `@pxlkit/voxel`. ~25 files split across `camera/`, `city/`, `effects/`, `generation/`, `rendering/`, `ui/`, `utils/`, plus a 1663-line vitest suite (`__tests__/highway.test.ts`). Recent commits added continent system, inter-biome highways with tunnels/bridges, GameHUD via `@pxlkit/ui-kit`, fog-color chunk fade-in (don't re-introduce the shader reveal system — explicitly removed as fragile). The `<Canvas>` mounts from `procedural-terrain/index.tsx` on the `/explore` route.

## Theme

Dark default (`#0A0A0F`), light toggle persisted to `localStorage` key `pxlkit-theme`. Class `.dark`/`.light` toggled on `<html>` by `ThemeProvider`. Globally: `image-rendering: pixelated`, SVGs use `shapeRendering="crispEdges"`.

## Required env (Vercel + `apps/web/.env.local`)

`NEXT_PUBLIC_PAYPAL_CLIENT_ID` (sandbox if it starts with `sb-`), `PAYPAL_SECRET` (alias: `PAYPAL_CLIENT_SECRET`), `RESEND_API_KEY`, plus Vercel KV creds.

## Working preferences

- Operate in Spanish when conversing with the user.
- Prefer exhaustive autonomous analysis; don't gate on confirmations for read-only investigation.
- Use Turbo from the root; don't `cd` into a package to build unless debugging that package in isolation.
- Don't bypass ESLint or pre-commit hooks. `next build` already ignores ESLint errors (`ignoreDuringBuilds: true`); don't add that to other tools.

## Git rules (hard requirements)

- **Never commit automatically.** Wait for an explicit "haz commit" / "commit this" instruction. Read-only investigation and code edits are fine without asking; the commit itself is not.
- **Never push automatically.** Wait for explicit instruction even after a commit lands.
- **Never set Claude as author or co-author.** No `--author="Claude…"`, no `Co-Authored-By: Claude…` trailer, no `Generated with Claude Code` footer.
- **Do not override the author field.** Use the user's globally configured git identity (Joangel De La Rosa). Don't pass `--author`, don't edit `.git/config`, don't add author metadata in commit messages.
- Conventional Commits style only (`feat:`, `fix:`, `docs:`, `chore:`, `refactor:`, `test:`, `style:`, `perf:`).
- Prefer new commits over `--amend` unless explicitly asked.

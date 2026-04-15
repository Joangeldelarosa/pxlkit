<p align="center">
  <img src="https://raw.githubusercontent.com/joangeldelarosa/pxlkit/main/apps/web/public/og-image.png" alt="Pxlkit — Retro React UI Kit, Licensed Pixel Art Icons & MIT Voxel Engine" width="640" />
</p>

<h1 align="center">Pxlkit</h1>

<p align="center">
  <strong>Bring retro aesthetics to the modern web — and build 3D voxel games with React.</strong><br/>
  Pxlkit is a comprehensive source-available React toolkit featuring 226+ pixel art SVG icons across 10 themed npm packages, 40+ retro UI components, interactive 3D parallax icons, animated SVGs, a visual icon builder, toast notifications, and <strong>@pxlkit/voxel</strong> — an MIT-licensed 3D voxel game engine powered by Three.js &amp; React Three Fiber with procedural world generation, 9+ biomes, physics, NPCs, and real-time chunk streaming.
</p>

<p align="center">
  <a href="https://pxlkit.xyz"><img src="https://img.shields.io/badge/docs-pxlkit.xyz-00FF88?style=flat&logo=vercel&logoColor=black" alt="Documentation" /></a>
  <a href="https://github.com/joangeldelarosa/pxlkit/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-split%20licenses-blue.svg" alt="Pxlkit split licensing" /></a>
  <img src="https://img.shields.io/badge/icons-226%2B-FFD700?style=flat" alt="226+ icons" />
  <img src="https://img.shields.io/badge/components-40%2B-4ECDC4?style=flat" alt="40+ components" />
  <img src="https://img.shields.io/badge/react-%E2%89%A518-61DAFB?logo=react&logoColor=white" alt="React ≥18" />
  <img src="https://img.shields.io/badge/typescript-strict-3178C6?logo=typescript&logoColor=white" alt="TypeScript strict" />
  <img src="https://img.shields.io/badge/voxel%20engine-Three.js%20%2B%20R3F-black?logo=threedotjs&logoColor=white" alt="Voxel Engine: Three.js + React Three Fiber" />
</p>

---

## Overview

**[Pxlkit.xyz](https://pxlkit.xyz)** is a monorepo containing **226+ pixel art icons** organized into themed packs, a retro React UI kit with **40+ components**, a core rendering engine, a **3D voxel game engine** with procedural world generation, and a Next.js showcase website. Every icon is a 16×16 character grid mapped to a color palette — designed to be hand-editable, AI-generatable, and version-control friendly. You can browse and visually edit all icons at the [official website](https://pxlkit.xyz).

```
pxlkit/
├── packages/
│   ├── core/           → Types, React components, SVG utilities
│   ├── ui-kit/         → 40+ retro pixel art React UI components
│   ├── gamification/   → 51 icons — RPG, achievements, rewards
│   ├── feedback/       → 33 icons — alerts, status, notifications
│   ├── social/         → 43 icons — community, emojis, messaging
│   ├── weather/        → 36 icons — climate, moon phases, temperature
│   ├── ui/             → 41 icons — interface controls, navigation
│   ├── effects/        → 12 icons — animated VFX, particles
│   ├── parallax/       → 10 icons — multi-layer 3D parallax
│   └── voxel/          → 3D voxel game engine (Three.js + R3F)
└── apps/
    └── web/            → Next.js 15 showcase & documentation site
```

## Licensing Model

- `@pxlkit/core`, `@pxlkit/ui-kit`, and `@pxlkit/voxel` are MIT-licensed code packages.
- The icon-pack packages and visual assets are source-available under [`LICENSE-ASSETS`](./LICENSE-ASSETS): free with attribution, with paid no-attribution terms in [`COMMERCIAL_TERMS`](./COMMERCIAL_TERMS).
- The `Pxlkit` name, logos, and brand presentation are covered by [`TRADEMARK_POLICY`](./TRADEMARK_POLICY).
- Third-party software and hosted fonts are listed in [`THIRD_PARTY_NOTICES`](./THIRD_PARTY_NOTICES).

## Icon Packs

| Pack             | Package                | Static | Animated |  Total | Description                                |
| ---------------- | ---------------------- | -----: | -------: | -----: | ------------------------------------------ |
| **Gamification** | `@pxlkit/gamification` |     41 |       10 | **51** | Trophies, swords, potions, RPG gear, coins |
| **Feedback**     | `@pxlkit/feedback`     |     30 |        3 | **33** | Checkmarks, alerts, shields, bugs, badges  |
| **Social**       | `@pxlkit/social`       |     35 |        8 | **43** | Emojis, users, messages, hearts, reactions |
| **Weather**      | `@pxlkit/weather`      |     30 |        6 | **36** | Sun, moon, storms, temperature, night sky  |
| **UI**           | `@pxlkit/ui`           |     36 |        5 | **41** | Home, search, settings, navigation, layout |
| **Effects**      | `@pxlkit/effects`      |      0 |       12 | **12** | Explosions, radar ping, flame, shockwave   |
| **Parallax**     | `@pxlkit/parallax`     |      — |        — | **10** | Multi-layer 3D parallax icons (3–5 layers) |

## @pxlkit/voxel — MIT-Licensed 3D Voxel Game Engine 🎮

> **Status: In active development** — usable now for procedural world exploration, game engine features expanding rapidly.

`@pxlkit/voxel` is an MIT-licensed 3D voxel game engine built on **Three.js** and **React Three Fiber**. It's designed for building browser-based voxel games with React — think Minecraft-like worlds running natively in the browser.

### Features

- 🌍 **Procedural World Generation** — Infinite, deterministic worlds using seeded Perlin noise and fractal Brownian motion (FBM)
- 🏔️ **9+ Biomes** — Plains, desert, tundra, forest, mountains, ocean, city, swamp, village — each with unique terrain, vegetation, and structures
- 🏗️ **Chunk-Based Streaming** — 16×16 chunks load dynamically around the camera with frustum culling
- 🌅 **Day/Night Cycle** — 12-keyframe sun/moon/sky interpolation with animated window lights
- 🏙️ **Procedural Cities** — 20+ building types, 5 zoning types, multi-lot buildings, major avenues
- 🚣 **Dynamic Entities** — Boats on water, sky birds, ground critters, ambient weather particles
- 🎮 **Fly Camera** — Pointer-lock fly camera with configurable speed and controls
- 📦 **Tree-Shakeable** — Import only what you need
- 🔧 **TypeScript-First** — Full type safety with strict mode
- ⚡ **React-Native Integration** — Built for React Three Fiber, works anywhere R3F works

### Live Demo

Explore procedural voxel worlds live at **[pxlkit.xyz/explore](https://pxlkit.xyz/explore)** — fly through infinite terrain with dynamic biomes, day/night cycles, and real-time chunk generation.

### Roadmap

- Physics engine integration (collision detection, rigid bodies)
- NPC system with behavior trees and pathfinding
- Inventory and item management
- Multiplayer support via WebSockets
- Sound engine with spatial audio
- Modular entity-component system

## Quick Start

### Install

```bash
npm install @pxlkit/core @pxlkit/gamification
```

Install only the packs you need:

```bash
npm install @pxlkit/core @pxlkit/feedback @pxlkit/social
```

For parallax 3D icons:

```bash
npm install @pxlkit/core @pxlkit/parallax
```

### Use in React

```tsx
import { PxlKitIcon } from '@pxlkit/core';
import { Trophy } from '@pxlkit/gamification';

// Monochrome — inherits text color
<PxlKitIcon icon={Trophy} size={32} />

// Full color — renders with original palette
<PxlKitIcon icon={Trophy} size={48} colorful />

// Custom monochrome color
<PxlKitIcon icon={Trophy} size={32} color="#E74C3C" />
```

### Animated Icons

```tsx
import { AnimatedPxlKitIcon } from '@pxlkit/core';
import { FireSword } from '@pxlkit/gamification';

// Auto-playing loop
<AnimatedPxlKitIcon icon={FireSword} size={48} colorful />

// Play on hover only
<AnimatedPxlKitIcon icon={FireSword} size={48} colorful trigger="hover" />

// Half speed
<AnimatedPxlKitIcon icon={FireSword} size={48} colorful speed={0.5} />
```

### Parallax 3D Icons

```tsx
import { ParallaxPxlKitIcon } from '@pxlkit/core';
import { CoolEmoji } from '@pxlkit/parallax';

// Interactive parallax — layers move with mouse
<ParallaxPxlKitIcon icon={CoolEmoji} size={64} colorful />

// Custom depth strength and perspective
<ParallaxPxlKitIcon icon={CoolEmoji} size={96} strength={24} perspective={300} />

// Non-interactive (static 3D)
<ParallaxPxlKitIcon icon={CoolEmoji} size={64} interactive={false} />
```

### Toast Notifications

```tsx
import { PixelToast } from "@pxlkit/core";
import { CheckCircle } from "@pxlkit/feedback";

<PixelToast
  visible={true}
  title="Saved!"
  message="Your changes have been saved."
  icon={CheckCircle}
  colorfulIcon
  position="bottom-right"
  duration={3000}
/>;
```

### Browse Full Pack

```tsx
import { GamificationPack } from "@pxlkit/gamification";
import { PxlKitIcon, AnimatedPxlKitIcon, isAnimatedIcon } from "@pxlkit/core";

{
  GamificationPack.icons.map((icon) =>
    isAnimatedIcon(icon) ? (
      <AnimatedPxlKitIcon key={icon.name} icon={icon} size={32} colorful />
    ) : (
      <PxlKitIcon key={icon.name} icon={icon} size={32} colorful />
    ),
  );
}
```

## How Icons Work

Every icon is a **16×16 character grid** paired with a **palette** that maps single characters to hex colors. The `.` character is always transparent.

```ts
import type { PxlKitData } from "@pxlkit/core";

export const Trophy: PxlKitData = {
  name: "trophy",
  size: 16,
  category: "gamification",
  grid: [
    "................",
    "..GGGGGGGGGGGG..",
    ".GG.YYYYYYYY.GG.",
    ".G..YYYYYYYY..G.",
    ".G..YYYWYYYY..G.",
    ".GG.YYYYYYYY.GG.",
    "..GGGGGGGGGGGG..",
    "....GGGGGGGG....",
    ".....GGGGGG.....",
    "......GGGG......",
    "......GGGG......",
    ".....DDDDDD.....",
    "....DDDDDDDD....",
    "....BBBBBBBB....",
    "...BBBBBBBBBB...",
    "................",
  ],
  palette: {
    G: "#FFD700", // Gold
    Y: "#FFF44F", // Yellow highlight
    D: "#B8860B", // Dark gold
    B: "#8B4513", // Brown base
    W: "#FFFFFF", // White shine
  },
  tags: ["achievement", "winner", "reward"],
  author: "pxlkit",
};
```

**Animated icons** use multiple frames with the same grid format:

```ts
import type { AnimatedPxlKitData } from "@pxlkit/core";

export const FireSword: AnimatedPxlKitData = {
  name: "fire-sword",
  size: 16,
  category: "gamification",
  palette: { S: "#C0C0C0", F: "#FF4500" },
  frames: [
    {
      grid: [
        /* frame 1 — 16 rows */
      ],
    },
    {
      grid: [
        /* frame 2 — 16 rows */
      ],
      palette: { F: "#FF6600" },
    },
    // optional per-frame palette overrides
  ],
  frameDuration: 150, // ms per frame
  loop: true,
  trigger: "loop", // 'loop' | 'once' | 'hover' | 'appear' | 'ping-pong'
  tags: ["sword", "fire", "animated"],
  author: "pxlkit",
};
```

## Core API

### React Components

| Component                | Description                                            |
| ------------------------ | ------------------------------------------------------ |
| `<PxlKitIcon>`           | Renders a static icon as crisp inline SVG              |
| `<AnimatedPxlKitIcon>`   | Renders an animated icon with frame playback           |
| `<ParallaxPxlKitIcon>`   | Renders a multi-layer 3D parallax icon with mouse tracking |
| `<PixelToast>`           | Pixel-art styled toast notification                    |

### Utilities

| Function                             | Description                               |
| ------------------------------------ | ----------------------------------------- |
| `gridToPixels(icon)`                 | Converts grid + palette → `Pixel[]` array |
| `gridToSvg(icon, options)`           | Generates SVG string from icon data       |
| `pixelsToSvg(pixels, size, options)` | Generates SVG from pixel array            |
| `generateAnimatedSvg(icon)`          | Generates animated SVG with CSS keyframes |
| `svgToDataUri(svg)`                  | Converts SVG to `data:image/svg+xml` URI  |
| `svgToBase64(svg)`                   | Converts SVG to base64 data URI           |
| `validateIconData(icon)`             | Validates icon structure, returns errors  |
| `isAnimatedIcon(icon)`               | Type guard for `AnimatedPxlKitData`       |
| `isParallaxIcon(icon)`               | Type guard for `ParallaxPxlKitData`       |
| `parseIconCode(code)`                | Parses icon code string → `PxlKitData`    |
| `generateIconCode(icon)`             | Generates TypeScript code from icon data  |
| `hexToRgb(hex)` / `rgbToHex(r,g,b)`  | Color conversion utilities                |
| `adjustBrightness(hex, amount)`      | Lighten or darken a hex color             |
| `RETRO_PALETTES`                     | Built-in retro color palette presets      |

### Animation Triggers

| Trigger     | Behavior                                |
| ----------- | --------------------------------------- |
| `loop`      | Plays continuously in an infinite loop  |
| `once`      | Plays one time, stops on the last frame |
| `hover`     | Plays only while the user hovers        |
| `appear`    | Plays once when the icon mounts/appears |
| `ping-pong` | Loops forward and backward alternating  |

## Development

### Prerequisites

- **Node.js** ≥ 20
- **npm** ≥ 10

### Setup

```bash
git clone https://github.com/joangeldelarosa/pxlkit.git
cd pxlkit
npm install
```

### Commands

| Command         | Description                              |
| --------------- | ---------------------------------------- |
| `npm run dev`   | Start all packages + web app in dev mode |
| `npm run build` | Build all packages and the web app       |
| `npm run lint`  | Type-check all packages                  |
| `npm run clean` | Remove all `dist/` and `.next/` outputs  |

The web app runs on **http://localhost:3333**.

### Project Structure

```
packages/
  core/                 → @pxlkit/core
    src/
      types.ts          → PxlKitData, AnimatedPxlKitData, ParallaxPxlKitData, IconPack, etc.
      components/       → PxlKitIcon, AnimatedPxlKitIcon, ParallaxPxlKitIcon, PixelToast
      utils/            → gridToPixels, gridToSvg, colorUtils, validateIconData
  gamification/         → @pxlkit/gamification
    src/icons/          → One .ts file per icon (trophy.ts, sword.ts, ...)
    src/index.ts        → Re-exports + GamificationPack
  feedback/             → @pxlkit/feedback
  social/               → @pxlkit/social
  weather/              → @pxlkit/weather
  ui/                   → @pxlkit/ui
  effects/              → @pxlkit/effects
  parallax/             → @pxlkit/parallax
    src/icons/          → One .ts file per parallax icon (cool-emoji.ts, pixel-heart.ts, ...)
    src/index.ts        → Re-exports + ParallaxPack
apps/
  web/                  → @pxlkit/web (Next.js 15 + Tailwind + Framer Motion)
    src/app/            → Home, icons browser, builder, toast playground, docs
    src/components/     → Navbar, Footer, HeroCollage, IconCard, etc.
```

### Creating a New Icon

1. Create a new `.ts` file in the appropriate `packages/<pack>/src/icons/` directory
2. Define a `PxlKitData` or `AnimatedPxlKitData` export using the grid format
3. Add the export and import to the pack's `src/index.ts`
4. Add it to the pack's `icons: [...]` array

Grid rules:

- Exactly **16 rows**, each string exactly **16 characters**
- `.` = transparent pixel
- Any other character maps to a color in `palette`
- Palette keys are single uppercase characters

### Validating Icons

```bash
node validate-icons.js
```

Checks grid dimensions (16×16), palette usage, and detects unused/missing palette keys.

## Tech Stack

| Layer          | Technology                                                   |
| -------------- | ------------------------------------------------------------ |
| **Monorepo**   | npm workspaces + Turborepo                                   |
| **Build**      | tsup (ESM + CJS)                                             |
| **Language**   | TypeScript 5.7 (strict)                                      |
| **Components** | React ≥ 18                                                   |
| **Web App**    | Next.js 15 · React 19 · Tailwind CSS 3.4 · Framer Motion 11 |
| **3D Engine**  | Three.js · React Three Fiber · @react-three/drei             |
| **Engine**     | Node.js ≥ 20                                                 |

## Packages

| Package                | npm                                                                                                                        | Description                                     |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| `@pxlkit/core`         | [![npm](https://img.shields.io/npm/v/@pxlkit/core?color=blue)](https://www.npmjs.com/package/@pxlkit/core)                 | Types, components, SVG engine                   |
| `@pxlkit/ui-kit`       | [![npm](https://img.shields.io/npm/v/@pxlkit/ui-kit?color=blue)](https://www.npmjs.com/package/@pxlkit/ui-kit)             | 40+ retro pixel art React UI components         |
| `@pxlkit/voxel`        | [![npm](https://img.shields.io/npm/v/@pxlkit/voxel?color=blue)](https://www.npmjs.com/package/@pxlkit/voxel)               | 3D voxel game engine, procedural worlds         |
| `@pxlkit/gamification` | [![npm](https://img.shields.io/npm/v/@pxlkit/gamification?color=blue)](https://www.npmjs.com/package/@pxlkit/gamification) | RPG, achievements, rewards                      |
| `@pxlkit/feedback`     | [![npm](https://img.shields.io/npm/v/@pxlkit/feedback?color=blue)](https://www.npmjs.com/package/@pxlkit/feedback)         | Alerts, status, notifications                   |
| `@pxlkit/social`       | [![npm](https://img.shields.io/npm/v/@pxlkit/social?color=blue)](https://www.npmjs.com/package/@pxlkit/social)             | Community, emojis, messaging                    |
| `@pxlkit/weather`      | [![npm](https://img.shields.io/npm/v/@pxlkit/weather?color=blue)](https://www.npmjs.com/package/@pxlkit/weather)           | Climate, moon, temperature                      |
| `@pxlkit/ui`           | [![npm](https://img.shields.io/npm/v/@pxlkit/ui?color=blue)](https://www.npmjs.com/package/@pxlkit/ui)                     | Interface controls, navigation                  |
| `@pxlkit/effects`      | [![npm](https://img.shields.io/npm/v/@pxlkit/effects?color=blue)](https://www.npmjs.com/package/@pxlkit/effects)           | Animated VFX, particles                         |
| `@pxlkit/parallax`     | [![npm](https://img.shields.io/npm/v/@pxlkit/parallax?color=blue)](https://www.npmjs.com/package/@pxlkit/parallax)         | Multi-layer 3D parallax icons                   |

## Automated npm Publishing (CI/CD)

All packages are published automatically to npm via GitHub Actions. The workflow supports **three triggers** and includes a **quality gate** (build + lint + test) that must pass before any publish.

### How It Works

The workflow (`.github/workflows/publish.yml`) runs on:

- **Push to `main`** — automatically publishes when a PR is merged (most common)
- **Tag push** — pushing a tag matching `v*` (e.g. `v1.2.0`)
- **GitHub Release** — creating/publishing a release in the GitHub UI

**Pipeline:**

1. **Quality gate** — installs, builds, type-checks, runs all tests, and validates icons
2. **Publish** (only if quality gate passes) — compares each package's local version against the npm registry and publishes only the packages whose version has changed. Packages already at the same version on npm are safely skipped.

> `@pxlkit/core` is always published first because other packages depend on it.

### Setup

1. **Generate an npm access token**
   - Go to [npmjs.com → Access Tokens](https://www.npmjs.com/settings/~/tokens) and create a **Granular Access Token** with read/write permission for packages under the `@pxlkit` scope.

2. **Add the token to GitHub Secrets**
   - In the repository, go to **Settings → Secrets and variables → Actions → New repository secret**.
   - Name: `NPM_TOKEN`
   - Value: paste the token from step 1.

3. **Verify package versions**
   - Before releasing, bump the `version` field in every `packages/*/package.json` that you want to publish. npm rejects publishes when the version already exists on the registry.

### How to Release

**Automatic (recommended):** Simply bump the version in the relevant `packages/*/package.json` files, commit, and merge your PR into `main`. The workflow detects the version change and publishes automatically.

```bash
# 1. Bump versions in the packages you changed
# 2. Commit and push to your PR branch
git add .
git commit -m "chore: bump versions to 1.2.0"
git push

# 3. Merge the PR — publish triggers automatically on main
```

**Manual (tag-based):** Create and push a version tag, or create a GitHub Release.

```bash
git tag v1.2.0
git push origin main --follow-tags
```

### Published Packages

| Package | Workspace path |
| --- | --- |
| `@pxlkit/core` | `packages/core` |
| `@pxlkit/ui-kit` | `packages/ui-kit` |
| `@pxlkit/voxel` | `packages/voxel` |
| `@pxlkit/gamification` | `packages/gamification` |
| `@pxlkit/feedback` | `packages/feedback` |
| `@pxlkit/social` | `packages/social` |
| `@pxlkit/weather` | `packages/weather` |
| `@pxlkit/ui` | `packages/ui` |
| `@pxlkit/effects` | `packages/effects` |
| `@pxlkit/parallax` | `packages/parallax` |

> Private packages (`apps/web`, `example-page`) are **not** published.

### Common Errors

| Error | Cause | Fix |
| --- | --- | --- |
| `403 Forbidden` | Invalid or expired `NPM_TOKEN` | Regenerate the token on npmjs.com and update the GitHub secret |
| `402 Payment Required` | Publishing a scoped package as private | Ensure `--access public` is used (already set in the workflow) |
| `EPUBLISHCONFLICT` / `You cannot publish over the previously published versions` | Version already exists on npm | Bump the `version` field in the package's `package.json` before tagging |
| `npm ERR! Workspaces: ...` | Incorrect `--workspace` path | Verify that the workspace path in the workflow matches the actual directory |

### Secrets Reference

| Secret | Required | Description |
| --- | --- | --- |
| `NPM_TOKEN` | **Yes** | npm access token with publish permissions for the `@pxlkit` scope |

## Contributing

Contributions are welcome! Whether it's new icons, bug fixes, or documentation improvements.

1. **Fork** the repository
2. Create a feature branch: `git checkout -b feat/my-new-icon`
3. Follow the icon format (16×16 grid, `.ts` file, proper palette)
4. Run `npm run build` to verify everything compiles
5. Submit a **Pull Request**

### Icon Design Guidelines

- Grid size: **16×16** characters
- Use uppercase single letters for palette keys
- `.` is always transparent — never define it in the palette
- Use descriptive JSDoc comments with palette documentation
- Include meaningful `tags` for searchability
- Keep file names in `kebab-case`

## License

Pxlkit now uses a split licensing model:

- [LICENSE](./LICENSE) — repo-wide licensing overview
- [LICENSE-CODE](./LICENSE-CODE) — MIT license for code packages like `@pxlkit/core`, `@pxlkit/ui-kit`, and `@pxlkit/voxel`
- [LICENSE-ASSETS](./LICENSE-ASSETS) — source-available terms for icon packs and visual assets
- [COMMERCIAL_TERMS](./COMMERCIAL_TERMS) — paid no-attribution terms for icon/assets usage
- [TRADEMARK_POLICY](./TRADEMARK_POLICY) — rules for the Pxlkit name, logo, and branding
- [THIRD_PARTY_NOTICES](./THIRD_PARTY_NOTICES) — third-party software and font notices

Created by [Joangel De La Rosa](https://github.com/joangeldelarosa).

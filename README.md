<p align="center">
  <img src="https://raw.githubusercontent.com/joangeldelarosa/pxlkit/main/apps/web/public/og-image.png" alt="Pxlkit" width="640" />
</p>

<h1 align="center">Pxlkit</h1>

<p align="center">
  <strong>Bring retro aesthetics to the modern web.</strong><br/>
  Pxlkit is a comprehensive React UI toolkit and icon library featuring over 200 pixel art icons divided into 6 themed packs. Includes 40+ styled components, animated SVGs, a visual builder, and a robust toast system.
</p>

<p align="center">
  <a href="https://pxlkit.xyz"><img src="https://img.shields.io/badge/docs-pxlkit.xyz-00FF88?style=flat&logo=vercel&logoColor=black" alt="Documentation" /></a>
  <a href="https://github.com/joangeldelarosa/pxlkit/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-Pxlkit%20v1.0-blue.svg" alt="Pxlkit License" /></a>
  <img src="https://img.shields.io/badge/icons-204%2B-FFD700?style=flat" alt="204+ icons" />
  <img src="https://img.shields.io/badge/react-%E2%89%A518-61DAFB?logo=react&logoColor=white" alt="React ≥18" />
  <img src="https://img.shields.io/badge/typescript-strict-3178C6?logo=typescript&logoColor=white" alt="TypeScript strict" />
</p>

---

## Overview

**[Pxlkit.xyz](https://pxlkit.xyz)** is a monorepo containing **204+ pixel art icons** organized into themed packs, a retro React UI kit with **40+ components**, a core rendering engine, and a Next.js showcase website. Every icon is a 16×16 character grid mapped to a color palette — designed to be hand-editable, AI-generatable, and version-control friendly. You can browse and visually edit all icons at the [official website](https://pxlkit.xyz).

```
pxlkit/
├── packages/
│   ├── core/           → Types, React components, SVG utilities
│   ├── gamification/   → 48 icons — RPG, achievements, rewards
│   ├── feedback/       → 33 icons — alerts, status, notifications
│   ├── social/         → 43 icons — community, emojis, messaging
│   ├── weather/        → 34 icons — climate, moon phases, temperature
│   ├── ui/             → 40 icons — interface controls, navigation
│   └── effects/        →  6 icons — animated VFX, particles
└── apps/
    └── web/            → Next.js 15 showcase & documentation site
```

## Icon Packs

| Pack             | Package                | Static | Animated |  Total | Description                                |
| ---------------- | ---------------------- | -----: | -------: | -----: | ------------------------------------------ |
| **Gamification** | `@pxlkit/gamification` |     39 |        9 | **48** | Trophies, swords, potions, RPG gear, coins |
| **Feedback**     | `@pxlkit/feedback`     |     30 |        3 | **33** | Checkmarks, alerts, shields, bugs, badges  |
| **Social**       | `@pxlkit/social`       |     35 |        8 | **43** | Emojis, users, messages, hearts, reactions |
| **Weather**      | `@pxlkit/weather`      |     29 |        5 | **34** | Sun, moon, storms, temperature, night sky  |
| **UI**           | `@pxlkit/ui`           |     35 |        5 | **40** | Home, search, settings, navigation, layout |
| **Effects**      | `@pxlkit/effects`      |      0 |        6 |  **6** | Explosions, radar ping, flame, shockwave   |

## Quick Start

### Install

```bash
npm install @pxlkit/core @pxlkit/gamification
```

Install only the packs you need:

```bash
npm install @pxlkit/core @pxlkit/feedback @pxlkit/social
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

| Component          | Description                                  |
| ------------------ | -------------------------------------------- |
| `<PxlKitIcon>`         | Renders a static icon as crisp inline SVG    |
| `<AnimatedPxlKitIcon>` | Renders an animated icon with frame playback |
| `<PixelToast>`     | Pixel-art styled toast notification          |

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
      types.ts          → PxlKitData, AnimatedPxlKitData, IconPack, etc.
      components/       → PxlKitIcon, AnimatedPxlKitIcon, PixelToast
      utils/            → gridToPixels, gridToSvg, colorUtils, validateIconData
  gamification/         → @pxlkit/gamification
    src/icons/          → One .ts file per icon (trophy.ts, sword.ts, ...)
    src/index.ts        → Re-exports + GamificationPack
  feedback/             → @pxlkit/feedback
  social/               → @pxlkit/social
  weather/              → @pxlkit/weather
  ui/                   → @pxlkit/ui
  effects/              → @pxlkit/effects
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

| Layer          | Technology                                                  |
| -------------- | ----------------------------------------------------------- |
| **Monorepo**   | npm workspaces + Turborepo                                  |
| **Build**      | tsup (ESM + CJS)                                            |
| **Language**   | TypeScript 5.7 (strict)                                     |
| **Components** | React ≥ 18                                                  |
| **Web App**    | Next.js 15 · React 19 · Tailwind CSS 3.4 · Framer Motion 11 |
| **Engine**     | Node.js ≥ 20                                                |

## Packages

| Package                | npm                                                                                                                        | Description                    |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------- | ------------------------------ |
| `@pxlkit/core`         | [![npm](https://img.shields.io/npm/v/@pxlkit/core?color=blue)](https://www.npmjs.com/package/@pxlkit/core)                 | Types, components, SVG engine  |
| `@pxlkit/gamification` | [![npm](https://img.shields.io/npm/v/@pxlkit/gamification?color=blue)](https://www.npmjs.com/package/@pxlkit/gamification) | RPG, achievements, rewards     |
| `@pxlkit/feedback`     | [![npm](https://img.shields.io/npm/v/@pxlkit/feedback?color=blue)](https://www.npmjs.com/package/@pxlkit/feedback)         | Alerts, status, notifications  |
| `@pxlkit/social`       | [![npm](https://img.shields.io/npm/v/@pxlkit/social?color=blue)](https://www.npmjs.com/package/@pxlkit/social)             | Community, emojis, messaging   |
| `@pxlkit/weather`      | [![npm](https://img.shields.io/npm/v/@pxlkit/weather?color=blue)](https://www.npmjs.com/package/@pxlkit/weather)           | Climate, moon, temperature     |
| `@pxlkit/ui`           | [![npm](https://img.shields.io/npm/v/@pxlkit/ui?color=blue)](https://www.npmjs.com/package/@pxlkit/ui)                     | Interface controls, navigation |
| `@pxlkit/effects`      | [![npm](https://img.shields.io/npm/v/@pxlkit/effects?color=blue)](https://www.npmjs.com/package/@pxlkit/effects)           | Animated VFX, particles        |

## Automated npm Publishing (CI/CD)

All packages are published automatically to npm via GitHub Actions whenever a new **version tag** is pushed or a **GitHub Release** is created.

### How It Works

The workflow (`.github/workflows/publish.yml`) runs on:

- **Tag push** — pushing a tag matching `v*` (e.g. `v1.2.0`)
- **GitHub Release** — creating/publishing a release in the GitHub UI

It builds every workspace package, validates icons, and publishes all `@pxlkit/*` packages to npm with [provenance](https://docs.npmjs.com/generating-provenance-statements) enabled. Packages whose version is already on npm are safely skipped (`continue-on-error`).

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

```bash
# 1. Bump versions in the packages you changed
# 2. Commit the version bumps
git add .
git commit -m "chore: bump versions to 1.1.0"

# 3. Create and push a tag
git tag v1.1.0
git push origin main --follow-tags
```

Alternatively, create a **Release** from the GitHub UI (which also creates a tag) — the workflow triggers on both events.

### Published Packages

| Package | Workspace path |
| --- | --- |
| `@pxlkit/core` | `packages/core` |
| `@pxlkit/gamification` | `packages/gamification` |
| `@pxlkit/feedback` | `packages/feedback` |
| `@pxlkit/social` | `packages/social` |
| `@pxlkit/weather` | `packages/weather` |
| `@pxlkit/ui` | `packages/ui` |
| `@pxlkit/effects` | `packages/effects` |
| `@pxlkit/ui-kit` | `packages/ui-kit` |

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

[Pxlkit License v1.0](./LICENSE) — Free with attribution, commercial licenses available.

Created by [Joangel De La Rosa](https://github.com/joangeldelarosa)

See [COMMERCIAL_LICENSE.md](./COMMERCIAL_LICENSE.md) for pricing details.

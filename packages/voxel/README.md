<p align="center">
  <img src="https://raw.githubusercontent.com/joangeldelarosa/pxlkit/main/apps/web/public/og-image.png" alt="Pxlkit voxel toolkit — early preview" width="480" />
</p>

<h1 align="center">@pxlkit/voxel</h1>

<p align="center">
  <strong>Voxel toolkit for Pxlkit — early preview, not yet on npm.</strong><br/>
  Convert 2D pixel art icons into 3D voxel data — designed for use with React Three Fiber and other 3D rendering engines.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/npm-not%20yet%20published-lightgrey" alt="Not yet published to npm" />
  <a href="https://github.com/joangeldelarosa/pxlkit/blob/main/LICENSE-CODE"><img src="https://img.shields.io/badge/license-MIT-22c55e.svg" alt="MIT License" /></a>
  <img src="https://img.shields.io/badge/status-early%20preview-orange" alt="Early preview" />
</p>

---

## Overview

`@pxlkit/voxel` is an **early-stage** package in the [Pxlkit](https://pxlkit.xyz) ecosystem that provides utilities for converting 2D pixel art icons into 3D voxel representations. It includes:

- **`pxlToVoxels()`** — Converts any `PxlKitData` icon into an array of 3D voxel data
- **`upscaleGrid()`** — Upscales pixel grids for higher-resolution voxel output
- **Types** — `Voxel`, `VoxelData`, `VoxelConvertOptions` for typed voxel workflows
- **`VoxelBomb`** — A sample voxel icon

> ⚠️ **Early preview, not yet published to npm.** This package is in active development (version 0.1.5, in this repository). The API may change before its first release.

## Live procedural-world engine

The chunk-streaming city engine you can fly through at **[pxlkit.xyz/explore](https://pxlkit.xyz/explore)** is *not* part of this package yet — it lives in [`apps/web/src/components/procedural-terrain/`](https://github.com/joangeldelarosa/pxlkit/tree/main/apps/web/src/components/procedural-terrain) and ships with biomes, continents, day/night cycles, highways, tunnels and a Game HUD built on `@pxlkit/ui-kit`. The plan for v1 is to promote those modules into this package and publish it, so consumers can `npm install @pxlkit/voxel` and get the full engine.

## Installation

`@pxlkit/voxel` is not on npm yet. In this repository it is a workspace package — the showcase app imports it as `@pxlkit/voxel`:

```bash
git clone https://github.com/Joangeldelarosa/pxlkit.git
cd pxlkit
npm install
npm run build --workspace=@pxlkit/voxel
```

> It depends on `@pxlkit/core` for the icon types.

## Quick Start

```ts
import { pxlToVoxels } from '@pxlkit/voxel';
import { Trophy } from '@pxlkit/gamification';

// Convert a 2D pixel art icon to 3D voxel data
const voxels = pxlToVoxels(Trophy);
// Returns: Voxel[] — array of { x, y, z, color } objects
```

### Upscaling for Higher Resolution

```ts
import { upscaleGrid } from '@pxlkit/voxel';

// Double the resolution of a grid
const upscaled = upscaleGrid(originalGrid, 2);
```

## Types

```ts
import type { Voxel, VoxelData, VoxelConvertOptions } from '@pxlkit/voxel';

// A single voxel in 3D space
interface Voxel {
  x: number;
  y: number;
  z: number;
  color: string;
}
```

## Sample Icon

```tsx
import { VoxelBomb } from '@pxlkit/voxel';
// A pre-defined voxel icon for testing and demos
```

## Related Packages

| Package | Description |
| --- | --- |
| [`@pxlkit/core`](https://www.npmjs.com/package/@pxlkit/core) | Core rendering engine (required) |
| [`@pxlkit/gamification`](https://www.npmjs.com/package/@pxlkit/gamification) | 51 icons — RPG, achievements, rewards |
| [`@pxlkit/feedback`](https://www.npmjs.com/package/@pxlkit/feedback) | 33 icons — alerts, status, notifications |
| [`@pxlkit/social`](https://www.npmjs.com/package/@pxlkit/social) | 43 icons — community, emojis, messaging |
| [`@pxlkit/weather`](https://www.npmjs.com/package/@pxlkit/weather) | 36 icons — climate, moon, temperature |
| [`@pxlkit/ui`](https://www.npmjs.com/package/@pxlkit/ui) | 41 icons — interface controls, navigation |
| [`@pxlkit/effects`](https://www.npmjs.com/package/@pxlkit/effects) | 12 animated VFX icons |
| [`@pxlkit/parallax`](https://www.npmjs.com/package/@pxlkit/parallax) | 10 multi-layer 3D parallax icons |

## Documentation

Fly through the procedural-world demo at **[pxlkit.xyz/explore](https://pxlkit.xyz/explore)**; the rest of the Pxlkit ecosystem is at [pxlkit.xyz](https://pxlkit.xyz).

## License

[MIT License](https://github.com/joangeldelarosa/pxlkit/blob/main/LICENSE-CODE) — code package. See the [repo licensing overview](https://github.com/joangeldelarosa/pxlkit/blob/main/LICENSE) for split-license scope details.

Created by [Joangel De La Rosa](https://github.com/joangeldelarosa)

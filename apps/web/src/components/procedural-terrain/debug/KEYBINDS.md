# Debug Keybinds (procedural-terrain)

Active only when the debug system is enabled — via `?debug=1` URL param
or `NODE_ENV !== 'production'`.

| Key | Action |
|---|---|
| `` ` `` (backtick) | Toggle the DebugPanel DOM overlay |
| `F3` | Toggle the DebugScene (all canvas overlays at once) |
| `G` | Chunk grid wireframes |
| `B` | Biome tint quads |
| `Shift+H` | Highway path visualization |
| `T` | Tunnel zones (red) |
| `Shift+B` | Bridge zones (blue) |
| `J` | Boat-viable spawn candidates |
| `K` | Water depth heatmap |

## Reserved keys (do NOT remap)

| Key | Owner | Action |
|---|---|---|
| `W`, `A`, `S`, `D`, `↑`, `↓`, `←`, `→` | `index.tsx` | Camera movement |
| `Space` | `FlyCamera` | Move up |
| `Shift` | `FlyCamera` | Move down |
| `M` | `GameHUD` | Toggle minimap |
| `H` | `GameHUD` | Toggle stats column |
| `F2` | `GameHUD` | Screenshot |
| `Esc` | Browser | Pointer unlock |
| `+`, `-` | `FullscreenMap` | Zoom (when map open) |
| `Enter` | `SettingsPanel` | Apply seed |

## URL parameters

The debug system also reads URL params at world load:

| Param | Effect |
|---|---|
| `debug=1` | Enable the entire debug system |
| `overlay=grid,highway,...` | Pre-enable specific overlays |
| `teleport=highway\|tunnel\|bridge\|ocean\|coast\|mountain\|forest\|desert\|city\|village` | Auto-teleport on world ready |
| `worldMode=infinite\|finite` | Override saved world mode |
| `renderDistance=N` | Override saved render distance (2..100) |
| `boatDensity=F` | Override saved boat density (0..1) |
| `paused=1` | (Phase 3+) Freeze time/chunks after first ready |

Example: `http://localhost:3333/explore?seed=42&debug=1&overlay=grid,tunnel&teleport=tunnel`

## window.__pxlTerrain (programmatic API)

Exposed only when debug mode is active. Full surface in
[global.ts](./global.ts). Used by Playwright visual scenarios.

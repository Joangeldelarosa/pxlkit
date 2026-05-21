/* ═══════════════════════════════════════════════════════════════
 *  URL parameter parsing for /explore
 *
 *  Backwards-compatible extension of the existing
 *  ?seed=&px=&py=&pz=&rx=&ry=&rz= surface.
 *
 *  New params (all optional):
 *    debug=1           enable window.__pxlTerrain + debug overlays
 *    overlay=a,b,c     enable specific overlays on load
 *    teleport=X        auto-teleport to feature/biome on world ready
 *    worldMode=X       force 'infinite' | 'finite'
 *    renderDistance=N  override saved render distance
 *    boatDensity=F     override boat density (0..1)
 *    paused=1          freeze chunk generation / time after first ready
 * ═══════════════════════════════════════════════════════════════ */

import type { WorldMode } from '../types';

export type OverlayKind =
  | 'grid'
  | 'biome'
  | 'highway'
  | 'tunnel'
  | 'bridge'
  | 'water'
  | 'boats';

export type TeleportTarget =
  | 'highway'
  | 'tunnel'
  | 'bridge'
  | 'ocean'
  | 'coast'
  | 'mountain'
  | 'forest'
  | 'desert'
  | 'city'
  | 'village';

export interface ScenePartial {
  seed?: number;
  pos?: [number, number, number];
  rot?: [number, number, number];
}

export interface DebugUrlParams {
  scene: ScenePartial | null;
  debug: boolean;
  overlays: OverlayKind[];
  teleport: TeleportTarget | null;
  worldMode: WorldMode | null;
  renderDistance: number | null;
  boatDensity: number | null;
  paused: boolean;
}

const OVERLAY_SET = new Set<string>([
  'grid', 'biome', 'highway', 'tunnel', 'bridge', 'water', 'boats',
]);

const TELEPORT_SET = new Set<string>([
  'highway', 'tunnel', 'bridge', 'ocean', 'coast',
  'mountain', 'forest', 'desert', 'city', 'village',
]);

function clamp01(n: number): number { return Math.max(0, Math.min(1, n)); }
function clampInt(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, Math.round(n)));
}

export function parseDebugUrlParams(search: string = window.location.search): DebugUrlParams {
  const empty: DebugUrlParams = {
    scene: null, debug: false, overlays: [],
    teleport: null, worldMode: null, renderDistance: null,
    boatDensity: null, paused: false,
  };
  let params: URLSearchParams;
  try { params = new URLSearchParams(search); } catch { return empty; }

  // Scene (back-compat)
  let scene: ScenePartial | null = null;
  const seedStr = params.get('seed');
  if (seedStr) {
    const seed = parseInt(seedStr, 10);
    if (!Number.isNaN(seed)) {
      scene = { seed };
      const px = params.get('px'), py = params.get('py'), pz = params.get('pz');
      if (px && py && pz) {
        const a = parseFloat(px), b = parseFloat(py), c = parseFloat(pz);
        if ([a, b, c].every(Number.isFinite)) scene.pos = [a, b, c];
      }
      const rx = params.get('rx'), ry = params.get('ry'), rz = params.get('rz');
      if (rx && ry && rz) {
        const a = parseFloat(rx), b = parseFloat(ry), c = parseFloat(rz);
        if ([a, b, c].every(Number.isFinite)) scene.rot = [a, b, c];
      }
    }
  }

  const debug = params.get('debug') === '1';

  const overlayStr = params.get('overlay');
  const overlays = overlayStr
    ? overlayStr.split(',').map(s => s.trim()).filter((s): s is OverlayKind => OVERLAY_SET.has(s))
    : [];

  const teleportStr = params.get('teleport');
  const teleport = teleportStr && TELEPORT_SET.has(teleportStr)
    ? (teleportStr as TeleportTarget)
    : null;

  const worldModeStr = params.get('worldMode');
  const worldMode: WorldMode | null = worldModeStr === 'infinite' || worldModeStr === 'finite'
    ? worldModeStr
    : null;

  const rdStr = params.get('renderDistance');
  const renderDistance = rdStr && Number.isFinite(parseFloat(rdStr))
    ? clampInt(parseFloat(rdStr), 2, 100)
    : null;

  const bdStr = params.get('boatDensity');
  const boatDensity = bdStr && Number.isFinite(parseFloat(bdStr))
    ? clamp01(parseFloat(bdStr))
    : null;

  const paused = params.get('paused') === '1';

  return {
    scene, debug, overlays, teleport,
    worldMode, renderDistance, boatDensity, paused,
  };
}

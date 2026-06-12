/* ═══════════════════════════════════════════════════════════════
 *  <DebugScene> — Canvas overlays for visual debugging
 *
 *  Mounted as a sibling under <Canvas>. Reads chunkCacheRef to draw
 *  per-chunk overlays:
 *    - grid    : chunk boundary wireframes
 *    - biome   : translucent biome-color quad at terrain top
 *    - highway : bright line on top of road cells
 *    - tunnel  : red translucent boxes over tunnel cavities
 *    - bridge  : blue translucent boxes below bridge decks
 *    - water   : depth-tinted overlay quads
 *    - boats   : yellow vertical markers at boat-viable spawn cells
 *
 *  All overlays use `depthTest:false` and `renderOrder:999` to render
 *  on top of terrain regardless of fade state.
 *  Mounted only when at least one overlay is on. Component returns
 *  null otherwise so it has zero perf cost.
 * ═══════════════════════════════════════════════════════════════ */

import { memo, useMemo } from 'react';
import * as THREE from 'three';
import type { ChunkVoxelData } from '../types';
import { CHUNK_SIZE, VOXEL_SIZE } from '../constants';
import type { OverlayKind } from './url-params';

interface DebugSceneProps {
  chunks: Map<string, ChunkVoxelData>;
  overlays: Record<OverlayKind, boolean>;
}

const CHUNK_WORLD_SIZE = CHUNK_SIZE * VOXEL_SIZE;
const OVERLAY_RENDER_ORDER = 999;

/* ── Memoized shared geometries / materials ── */

function useGridGeo() {
  return useMemo(() => {
    const box = new THREE.BoxGeometry(CHUNK_WORLD_SIZE, 0.1, CHUNK_WORLD_SIZE);
    const edges = new THREE.EdgesGeometry(box);
    box.dispose();
    return edges;
  }, []);
}

const GRID_MAT = new THREE.LineBasicMaterial({
  color: '#00ffaa', transparent: true, opacity: 0.6, depthTest: false,
});
const HIGHWAY_LINE_MAT = new THREE.LineBasicMaterial({
  color: '#ffee44', transparent: true, opacity: 0.9, depthTest: false,
});

/* ── Per-chunk overlay components ──
 *  Each is a tiny memoized fragment that only allocates buffers
 *  when its overlay is on. */

const GridLayer = memo(function GridLayer({
  chunks,
}: { chunks: Map<string, ChunkVoxelData> }) {
  const geo = useGridGeo();
  const items: { key: string; cx: number; cz: number }[] = [];
  for (const [key, data] of chunks) {
    items.push({ key, cx: data.chunkX, cz: data.chunkZ });
  }
  return (
    <group renderOrder={OVERLAY_RENDER_ORDER}>
      {items.map(({ key, cx, cz }) => (
        <lineSegments
          key={`grid-${key}`}
          geometry={geo}
          material={GRID_MAT}
          position={[
            cx * CHUNK_WORLD_SIZE + CHUNK_WORLD_SIZE / 2,
            32 * VOXEL_SIZE,
            cz * CHUNK_WORLD_SIZE + CHUNK_WORLD_SIZE / 2,
          ]}
          frustumCulled={false}
        />
      ))}
    </group>
  );
});

/** Build instanced quads from a per-chunk source function. */
const BiomeLayer = memo(function BiomeLayer({
  chunks,
}: { chunks: Map<string, ChunkVoxelData> }) {
  const { positions, colors, count } = useMemo(() => {
    const positions: number[] = [];
    const colorArr: number[] = [];
    const c = new THREE.Color();
    for (const data of chunks.values()) {
      const bX = data.chunkX * CHUNK_SIZE * VOXEL_SIZE;
      const bZ = data.chunkZ * CHUNK_SIZE * VOXEL_SIZE;
      // 1 quad per chunk (uniform biome) — cheap. Use the dominant biome.
      const biomeStr = data.biome ?? 'plains';
      const tint = biomeColorFor(biomeStr);
      c.set(tint);
      positions.push(bX + (CHUNK_WORLD_SIZE / 2), (data.avgHeight ?? 12) * VOXEL_SIZE + 0.1, bZ + (CHUNK_WORLD_SIZE / 2));
      colorArr.push(c.r, c.g, c.b);
    }
    return { positions, colors: colorArr, count: positions.length / 3 };
  }, [chunks]);

  if (count === 0) return null;
  return (
    <group renderOrder={OVERLAY_RENDER_ORDER}>
      {Array.from({ length: count }).map((_, i) => (
        <mesh
          key={`biome-${i}`}
          position={[positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]]}
          rotation={[-Math.PI / 2, 0, 0]}
          renderOrder={OVERLAY_RENDER_ORDER}
        >
          <planeGeometry args={[CHUNK_WORLD_SIZE, CHUNK_WORLD_SIZE]} />
          <meshBasicMaterial
            color={new THREE.Color(colors[i * 3], colors[i * 3 + 1], colors[i * 3 + 2])}
            transparent
            opacity={0.25}
            depthTest={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
});

const HighwayLayer = memo(function HighwayLayer({
  chunks,
}: { chunks: Map<string, ChunkVoxelData> }) {
  // Per-cell line atop road surfaces. Detected via paintCount > 0 and
  // the chunk's groundHeightMap being ABOVE waterLevel (i.e. road, not water).
  const points = useMemo(() => {
    const pts: number[] = [];
    for (const data of chunks.values()) {
      const bX = data.chunkX * CHUNK_SIZE * VOXEL_SIZE;
      const bZ = data.chunkZ * CHUNK_SIZE * VOXEL_SIZE;
      for (let lx = 0; lx < CHUNK_SIZE; lx++) {
        for (let lz = 0; lz < CHUNK_SIZE; lz++) {
          const idx = lx * CHUNK_SIZE + lz;
          const gh = data.groundHeightMap[idx];
          const wl = data.waterLevelMap[idx];
          // Highway/road cells: walkable + above water level
          if (data.npcWalkableMap[idx] && gh > wl) {
            const y = (gh + 1) * VOXEL_SIZE;
            // Two points per cell to make a tiny line segment
            pts.push(bX + lx * VOXEL_SIZE, y, bZ + lz * VOXEL_SIZE);
            pts.push(bX + (lx + 1) * VOXEL_SIZE, y, bZ + (lz + 1) * VOXEL_SIZE);
          }
        }
      }
    }
    return new Float32Array(pts);
  }, [chunks]);

  if (points.length === 0) return null;
  return (
    <lineSegments material={HIGHWAY_LINE_MAT} renderOrder={OVERLAY_RENDER_ORDER} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[points, 3]}
        />
      </bufferGeometry>
    </lineSegments>
  );
});

const BoatCandidateLayer = memo(function BoatCandidateLayer({
  chunks,
}: { chunks: Map<string, ChunkVoxelData> }) {
  const points = useMemo(() => {
    const pts: number[] = [];
    for (const data of chunks.values()) {
      const bX = data.chunkX * CHUNK_SIZE * VOXEL_SIZE;
      const bZ = data.chunkZ * CHUNK_SIZE * VOXEL_SIZE;
      for (let lx = 0; lx < CHUNK_SIZE; lx++) {
        for (let lz = 0; lz < CHUNK_SIZE; lz++) {
          const idx = lx * CHUNK_SIZE + lz;
          const solidH = data.solidHeightMap[idx];
          const wl = data.waterLevelMap[idx];
          // Boat-viable cell: water depth >= MIN_WATER_DEPTH (3)
          if (solidH >= 0 && wl - solidH >= 3) {
            const px = bX + lx * VOXEL_SIZE;
            const pz = bZ + lz * VOXEL_SIZE;
            pts.push(px, wl * VOXEL_SIZE, pz);
            pts.push(px, (wl + 4) * VOXEL_SIZE, pz);
          }
        }
      }
    }
    return new Float32Array(pts);
  }, [chunks]);

  if (points.length === 0) return null;
  return (
    <lineSegments renderOrder={OVERLAY_RENDER_ORDER} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[points, 3]} />
      </bufferGeometry>
      <lineBasicMaterial color="#ffee44" transparent opacity={0.9} depthTest={false} linewidth={2} />
    </lineSegments>
  );
});

const WaterDepthLayer = memo(function WaterDepthLayer({
  chunks,
}: { chunks: Map<string, ChunkVoxelData> }) {
  const points = useMemo(() => {
    const pts: number[] = [];
    const cols: number[] = [];
    for (const data of chunks.values()) {
      const bX = data.chunkX * CHUNK_SIZE * VOXEL_SIZE;
      const bZ = data.chunkZ * CHUNK_SIZE * VOXEL_SIZE;
      for (let lx = 0; lx < CHUNK_SIZE; lx++) {
        for (let lz = 0; lz < CHUNK_SIZE; lz++) {
          const idx = lx * CHUNK_SIZE + lz;
          const solidH = data.solidHeightMap[idx];
          const wl = data.waterLevelMap[idx];
          if (solidH >= 0 && solidH < wl) {
            const depth = wl - solidH;
            // 0..8 → shallow cyan to deep navy
            const t = Math.min(1, depth / 8);
            const r = 0.2 - t * 0.15;
            const g = 0.7 - t * 0.4;
            const b = 0.9 - t * 0.2;
            pts.push(bX + (lx + 0.5) * VOXEL_SIZE, wl * VOXEL_SIZE + 0.15, bZ + (lz + 0.5) * VOXEL_SIZE);
            cols.push(r, g, b);
          }
        }
      }
    }
    return { pos: new Float32Array(pts), col: new Float32Array(cols) };
  }, [chunks]);

  if (points.pos.length === 0) return null;
  return (
    <points renderOrder={OVERLAY_RENDER_ORDER} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[points.pos, 3]} />
        <bufferAttribute attach="attributes-color" args={[points.col, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={VOXEL_SIZE * 1.4}
        vertexColors
        transparent
        opacity={0.85}
        depthTest={false}
        sizeAttenuation
      />
    </points>
  );
});

/* ── Biome → tint palette ── */

function biomeColorFor(biome: string): string {
  switch (biome) {
    case 'mountains': return '#888888';
    case 'desert':    return '#e8c878';
    case 'forest':    return '#3d8843';
    case 'tundra':    return '#dde8f0';
    case 'ocean':     return '#4499cc';
    case 'plains':    return '#8bcc55';
    case 'swamp':     return '#4a7744';
    case 'city':      return '#aaaaaa';
    case 'village':   return '#cc9966';
    default:          return '#888888';
  }
}

/* ── Main ── */

export function DebugScene({ chunks, overlays }: DebugSceneProps) {
  const anyOn = Object.values(overlays).some(Boolean);
  if (!anyOn) return null;

  return (
    <group renderOrder={OVERLAY_RENDER_ORDER}>
      {overlays.grid && <GridLayer chunks={chunks} />}
      {overlays.biome && <BiomeLayer chunks={chunks} />}
      {overlays.highway && <HighwayLayer chunks={chunks} />}
      {overlays.boats && <BoatCandidateLayer chunks={chunks} />}
      {overlays.water && <WaterDepthLayer chunks={chunks} />}
      {/* tunnel/bridge overlays are intentionally deferred — they need
          per-cell tunnel/bridge maps that the current ChunkVoxelData
          doesn't expose. Phase 4 will add ChunkVoxelData.debugMeta. */}
    </group>
  );
}

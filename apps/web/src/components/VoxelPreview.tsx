'use client';

import { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float } from '@react-three/drei';
import * as THREE from 'three';

/* ═══════════════════════════════════════════════════════════
 *  Types
 * ═══════════════════════════════════════════════════════════ */

interface Voxel3D {
  x: number;
  y: number;
  z: number;
  color: string;
}

export type SceneTab = 'island' | 'terrain' | 'character' | 'world';

/* ═══════════════════════════════════════════════════════════
 *  Color Palettes
 * ═══════════════════════════════════════════════════════════ */

const BOMB_BODY = [
  '#141424', '#1c1c34', '#242444', '#2c2c54',
  '#343464', '#3c3c74', '#444484', '#4c4c94',
];
const X_RED = '#ff5555';
const X_RED_D = '#dd3333';
const RING = ['#bbaa66', '#ddcc88', '#eeddaa'];
const FUSE_C = ['#ddbb55', '#eedd77', '#ffee88'];

const GRASS = ['#66ee88', '#77ff99', '#88ffaa'];
const DIRT = ['#cc8844', '#dd9955', '#eeaa66'];
const DEEP_DIRT = ['#aa7733', '#bb8844', '#cc9955'];
const STONE = ['#99aabb', '#aabbcc', '#bbccdd'];

const TRUNK = ['#AA7744', '#BB8855', '#996633'];
const LEAF = ['#44dd66', '#55ee77', '#66ff88'];

const WATER_C = '#88ddff';
const SAND = ['#ffeecc', '#fff5dd', '#fff8ee'];
const WALL = ['#ffeecc', '#fff5dd'];
const ROOF = ['#ee5544', '#ff6655'];
const WINDOW_C = '#aaddff';
const DOOR_C = '#AA7744';

const ROBOT_BODY = ['#99aabb', '#aabbcc', '#bbccdd'];
const ROBOT_EYE = '#66ffbb';
const ROBOT_SCREEN = '#556677';
const ROBOT_JOINT = '#8899aa';
const ROBOT_LIGHT = '#ff8888';
const ROBOT_CHEST = '#88ccff';
const ROBOT_ANTENNA = '#ccddee';

const FLOWER_COLORS = ['#ff9999', '#ffdd66', '#ccaaff', '#ff99cc', '#99ccff'];
const ROCK_COLORS = ['#aabbcc', '#bbccdd', '#ccddee'];

/* World scene extra palettes */
const MOUNTAIN = ['#8899aa', '#99aabb', '#aabbcc', '#bbccdd'];
const SNOW = ['#eef4ff', '#f4f8ff', '#ffffff'];
const PATH_C = ['#ddcc99', '#ccbb88', '#bbaa77'];
const BRIDGE_WOOD = ['#bb8844', '#aa7733', '#996622'];
const RIVER_C = '#77ccee';
const PINE_TRUNK = ['#886644', '#775533', '#664422'];
const PINE_LEAF = ['#339955', '#44aa66', '#22884d'];
const LAMP_POST = '#667788';
const LAMP_GLOW = '#ffee88';
const FENCE_C = '#aa8855';

/* ═══════════════════════════════════════════════════════════
 *  GENERATOR: 3D Spherical Bomb
 * ═══════════════════════════════════════════════════════════ */

function generateBomb3D(R = 7): { voxels: Voxel3D[]; fuseTip: [number, number, number] } {
  const voxels: Voxel3D[] = [];

  // Pre-compute the front-most Z for each (x, y) — for X marking detection
  const frontZ = new Map<string, number>();
  for (let x = -R; x <= R; x++) {
    for (let y = -R; y <= R; y++) {
      const maxZ2 = R * R - x * x - y * y;
      if (maxZ2 >= 0) frontZ.set(`${x},${y}`, Math.floor(Math.sqrt(maxZ2)));
    }
  }

  // Build a set of occupied cells for neighbor-culling optimisation
  const occupied = new Set<string>();
  const shellCells: { x: number; y: number; z: number; dist: number }[] = [];
  for (let x = -R; x <= R; x++) {
    for (let y = -R; y <= R; y++) {
      for (let z = -R; z <= R; z++) {
        const dist = Math.sqrt(x * x + y * y + z * z);
        if (dist > R + 0.3 || dist < R - 1.8) continue;
        if (y >= R - 1 && x * x + z * z <= 3) continue; // fuse hole
        occupied.add(`${x},${y},${z}`);
        shellCells.push({ x, y, z, dist });
      }
    }
  }

  // Only emit voxels that have at least one exposed face
  for (const { x, y, z, dist } of shellCells) {
    const hasExposed =
      !occupied.has(`${x + 1},${y},${z}`) || !occupied.has(`${x - 1},${y},${z}`) ||
      !occupied.has(`${x},${y + 1},${z}`) || !occupied.has(`${x},${y - 1},${z}`) ||
      !occupied.has(`${x},${y},${z + 1}`) || !occupied.has(`${x},${y},${z - 1}`);
    if (!hasExposed) continue;

    const isSurface = dist > R - 1.1;
    let color: string;

    if (isSurface) {
      const fz = frontZ.get(`${x},${y}`);
      const isFront = fz !== undefined && z >= fz - 1 && z > 0;
      if (isFront && Math.abs(x) <= 4 && Math.abs(y) <= 4) {
        const onD1 = Math.abs(x - y) <= 1;
        const onD2 = Math.abs(x + y) <= 1;
        if (onD1 || onD2) {
          const exact = Math.abs(x - y) === 0 || Math.abs(x + y) === 0;
          voxels.push({ x, y, z, color: exact ? X_RED : X_RED_D });
          continue;
        }
      }
      const n = dist || 1;
      const dot = (x / n) * -0.35 + (y / n) * 0.55 + (z / n) * 0.45;
      const idx = Math.min(7, Math.max(0, Math.floor((dot + 0.7) / 1.4 * 8)));
      color = BOMB_BODY[idx];
    } else {
      color = BOMB_BODY[0];
    }
    voxels.push({ x, y, z, color });
  }

  // Metallic nozzle ring at top
  for (let x = -2; x <= 2; x++) {
    for (let z = -2; z <= 2; z++) {
      const rd = Math.sqrt(x * x + z * z);
      if (rd > 2.5 || rd < 0.9) continue;
      for (let ly = 0; ly < 2; ly++) {
        const lit = x < 0 && z > 0;
        voxels.push({ x, y: R + ly, z, color: lit ? RING[2] : ly === 0 ? RING[1] : RING[0] });
      }
    }
  }

  // Curved fuse cord
  const fusePath: [number, number, number][] = [
    [0, R + 2, 0], [1, R + 3, 0], [1, R + 4, 1],
    [2, R + 5, 1], [3, R + 6, 0], [3, R + 7, 0],
  ];
  for (let i = 0; i < fusePath.length; i++) {
    const [fx, fy, fz] = fusePath[i];
    const near = i >= fusePath.length - 2;
    voxels.push({ x: fx, y: fy, z: fz, color: near ? FUSE_C[2] : FUSE_C[1] });
    voxels.push({ x: fx, y: fy, z: fz + 1, color: near ? FUSE_C[1] : FUSE_C[0] });
  }

  const tip = fusePath[fusePath.length - 1];
  return { voxels, fuseTip: [tip[0], tip[1] + 1, tip[2]] };
}

/* ═══════════════════════════════════════════════════════════
 *  GENERATOR: Voxel Tree
 * ═══════════════════════════════════════════════════════════ */

function generateTree(bx: number, bz: number, h = 5, cr = 3): Voxel3D[] {
  const voxels: Voxel3D[] = [];
  // Trunk (2×2)
  for (let y = 0; y < h; y++) {
    voxels.push({ x: bx, y, z: bz, color: TRUNK[y % 3] });
    voxels.push({ x: bx + 1, y, z: bz, color: TRUNK[(y + 1) % 3] });
    voxels.push({ x: bx, y, z: bz + 1, color: TRUNK[(y + 2) % 3] });
    voxels.push({ x: bx + 1, y, z: bz + 1, color: TRUNK[y % 3] });
  }
  // Leaf crown (sphere)
  const cy = h + cr - 1;
  for (let dx = -cr; dx <= cr; dx++) {
    for (let dy = -cr; dy <= cr; dy++) {
      for (let dz = -cr; dz <= cr; dz++) {
        if (Math.sqrt(dx * dx + dy * dy + dz * dz) > cr + 0.3) continue;
        const lIdx = dy > 0 ? 2 : dx < 0 ? 1 : 0;
        voxels.push({ x: bx + dx, y: cy + dy, z: bz + dz, color: LEAF[lIdx] });
      }
    }
  }
  return voxels;
}

/* ═══════════════════════════════════════════════════════════
 *  GENERATOR: Floating Island (returns Voxel3D[])
 * ═══════════════════════════════════════════════════════════ */

function generateIsland(w: number, d: number): Voxel3D[] {
  const voxels: Voxel3D[] = [];
  const cx = w / 2, cz = d / 2;
  const maxR = Math.min(w, d) / 2;

  for (let x = 0; x < w; x++) {
    for (let z = 0; z < d; z++) {
      const dx = x - cx + 0.5, dz = z - cz + 0.5;
      const dist = Math.sqrt(dx * dx + dz * dz);
      const noise = Math.sin(x * 0.8) * 0.7 + Math.cos(z * 0.6) * 0.7 + Math.sin((x + z) * 0.4) * 0.5;
      const effR = maxR - 1.5 + noise;
      if (dist > effR) continue;

      const edge = 1 - dist / effR;
      const depth = Math.max(1, Math.floor(edge * 5.5) + 1);
      const ix = x - Math.floor(cx), iz = z - Math.floor(cz);

      // Grass top
      voxels.push({ x: ix, y: 0, z: iz, color: GRASS[(x + z) % 3] });
      // Sub-layers
      for (let ly = 1; ly < depth; ly++) {
        let c: string;
        if (ly <= 2) c = DIRT[(x + ly) % 3];
        else if (ly <= 4) c = DEEP_DIRT[(z + ly) % 3];
        else c = STONE[(x + z + ly) % 3];
        voxels.push({ x: ix, y: -ly, z: iz, color: c });
      }
    }
  }
  return voxels;
}

/* ═══════════════════════════════════════════════════════════
 *  GENERATOR: Small Decorations (flowers, rocks)
 * ═══════════════════════════════════════════════════════════ */

function generateFlowers(positions: [number, number][], by = 1): Voxel3D[] {
  return positions.map(([x, z], i) => ({
    x, y: by, z, color: FLOWER_COLORS[i % FLOWER_COLORS.length],
  }));
}

function generateRock(bx: number, bz: number, by = 1): Voxel3D[] {
  return [
    { x: bx, y: by, z: bz, color: ROCK_COLORS[0] },
    { x: bx + 1, y: by, z: bz, color: ROCK_COLORS[1] },
    { x: bx, y: by, z: bz + 1, color: ROCK_COLORS[2] },
    { x: bx + 1, y: by, z: bz + 1, color: ROCK_COLORS[0] },
    { x: bx, y: by + 1, z: bz, color: ROCK_COLORS[2] },
  ];
}

/* ═══════════════════════════════════════════════════════════
 *  HELPER: Surface-aware placement
 * ═══════════════════════════════════════════════════════════ */

/** Get the maximum terrain height under a footprint area */
function maxHeightUnder(heightAt: (x: number, z: number) => number, bx: number, bz: number, w = 1, d = 1): number {
  let maxH = 0;
  for (let dx = 0; dx < w; dx++) {
    for (let dz = 0; dz < d; dz++) {
      maxH = Math.max(maxH, heightAt(bx + dx, bz + dz));
    }
  }
  return maxH;
}

/** Offset all voxels in a model by a Y delta */
function offsetVoxelsY(voxels: Voxel3D[], dy: number): Voxel3D[] {
  return voxels.map(v => ({ ...v, y: v.y + dy }));
}

/** Generate a windmill structure */
function generateWindmill(bx: number, bz: number, by: number): Voxel3D[] {
  const v: Voxel3D[] = [];
  const MILL_STONE = ['#ccbbaa', '#ddccbb', '#eeddcc'];
  const MILL_ROOF = ['#665544', '#776655'];
  const BLADE = '#ddccbb';

  // Cylindrical tower (radius ~2, height 8)
  for (let y = 0; y < 8; y++) {
    for (let dx = -2; dx <= 2; dx++) {
      for (let dz = -2; dz <= 2; dz++) {
        const dist = Math.sqrt(dx * dx + dz * dz);
        if (dist > 2.5) continue;
        // Only shell (hollow inside)
        if (dist < 1.5 && y > 0 && y < 7) continue;
        // Door opening
        if (dz === -2 && dx === 0 && y < 2) continue;
        // Window
        if (y === 4 && dz === -2 && dx === 0) {
          v.push({ x: bx + dx, y: by + y, z: bz + dz, color: WINDOW_C });
          continue;
        }
        v.push({ x: bx + dx, y: by + y, z: bz + dz, color: MILL_STONE[Math.abs(dx + y + dz) % 3] });
      }
    }
  }

  // Conical roof
  for (let ly = 0; ly < 3; ly++) {
    const r = 3 - ly;
    for (let dx = -r; dx <= r; dx++) {
      for (let dz = -r; dz <= r; dz++) {
        if (Math.sqrt(dx * dx + dz * dz) > r + 0.3) continue;
        v.push({ x: bx + dx, y: by + 8 + ly, z: bz + dz, color: MILL_ROOF[Math.abs(dx + dz + ly) % 2] });
      }
    }
  }

  // Blades (4 directions from center at height 6)
  const bladeY = by + 6;
  const bladeZ = bz - 3; // front face
  for (const dir of [[0, 1], [0, -1], [1, 0], [-1, 0]] as [number, number][]) {
    for (let i = 1; i <= 4; i++) {
      v.push({ x: bx + dir[0] * i, y: bladeY + dir[1] * i, z: bladeZ, color: BLADE });
    }
  }

  return v;
}

/* ═══════════════════════════════════════════════════════════
 *  GENERATOR: Terrain with Heightmap + Water
 * ═══════════════════════════════════════════════════════════ */

function generateTerrain(size: number): { solid: Voxel3D[]; water: Voxel3D[]; heightAt: (wx: number, wz: number) => number } {
  const solid: Voxel3D[] = [];
  const water: Voxel3D[] = [];
  const WATER_LVL = 3;
  const half = Math.floor(size / 2);
  const heightMap = new Map<string, number>();

  // Helper to compute height at any grid position
  const computeHeight = (x: number, z: number) => {
    const nx = x / size * 4, nz = z / size * 4;
    return Math.max(0, Math.floor(
      3.5 + Math.sin(nx * 1.8) * 2 + Math.cos(nz * 2.2) * 1.5
      + Math.sin((nx + nz) * 1.1) * 1 + Math.cos(nx * 0.5 - nz * 1.5) * 1.5
    ));
  };

  for (let x = 0; x < size; x++) {
    for (let z = 0; z < size; z++) {
      const h = computeHeight(x, z);
      const ix = x - half, iz = z - half;
      heightMap.set(`${ix},${iz}`, h);

      for (let y = 0; y <= h; y++) {
        let c: string;
        if (y === h && h > WATER_LVL) c = GRASS[(x + z) % 3];
        else if (y === h && h >= WATER_LVL - 1 && h <= WATER_LVL) c = SAND[(x + z) % 3];
        else if (y >= h - 2) c = DIRT[(x + y) % 3];
        else c = STONE[(x + y + z) % 3];
        solid.push({ x: ix, y, z: iz, color: c });
      }
      if (h < WATER_LVL) {
        for (let y = h + 1; y <= WATER_LVL; y++) {
          water.push({ x: ix, y, z: iz, color: WATER_C });
        }
      }
    }
  }

  // Return heightmap lookup (accepts world-space coords)
  const heightAt = (wx: number, wz: number) => {
    const key = `${Math.round(wx)},${Math.round(wz)}`;
    return heightMap.get(key) ?? 0;
  };

  return { solid, water, heightAt };
}

/* ═══════════════════════════════════════════════════════════
 *  GENERATOR: Small Voxel House
 * ═══════════════════════════════════════════════════════════ */

function generateHouse(bx: number, bz: number, by: number): Voxel3D[] {
  const v: Voxel3D[] = [];
  const W = 5, H = 4, D = 4;

  for (let x = 0; x < W; x++) {
    for (let y = 0; y < H; y++) {
      for (let z = 0; z < D; z++) {
        // Walls only (hollow inside)
        const isEdge = x === 0 || x === W - 1 || z === 0 || z === D - 1 || y === H - 1;
        if (!isEdge) continue;

        let c = WALL[(x + y + z) % 2];
        // Door on front face
        if (z === 0 && x === 2 && y < 2) c = DOOR_C;
        // Windows
        if (z === 0 && y === 2 && (x === 1 || x === 3)) c = WINDOW_C;
        if (z === D - 1 && y === 2 && x === 2) c = WINDOW_C;

        v.push({ x: bx + x, y: by + y, z: bz + z, color: c });
      }
    }
  }
  // Gable roof
  for (let ly = 0; ly < 3; ly++) {
    for (let x = ly; x <= W - 1 - ly; x++) {
      for (let z = -1; z <= D; z++) {
        v.push({ x: bx + x, y: by + H + ly, z: bz + z, color: ROOF[(x + z + ly) % 2] });
      }
    }
  }
  return v;
}

/* ═══════════════════════════════════════════════════════════
 *  GENERATOR: Robot Character
 * ═══════════════════════════════════════════════════════════ */

function generateRobot(): Voxel3D[] {
  const v: Voxel3D[] = [];

  // Helper
  const box = (ox: number, oy: number, oz: number, w: number, h: number, d: number, cf: (x: number, y: number, z: number) => string) => {
    for (let x = 0; x < w; x++) {
      for (let y = 0; y < h; y++) {
        for (let z = 0; z < d; z++) {
          v.push({ x: ox + x, y: oy + y, z: oz + z, color: cf(x, y, z) });
        }
      }
    }
  };

  // Legs (2 wide × 4 tall × 2 deep each, gap of 2 between)
  for (const sx of [-2, 1]) {
    box(sx, 0, 0, 2, 4, 2, (_x, y) => y === 2 ? ROBOT_JOINT : y < 2 ? ROBOT_BODY[0] : ROBOT_BODY[1]);
  }

  // Body (6 wide × 6 tall × 3 deep)
  box(-3, 4, -1, 6, 6, 3, (x, y, z) => {
    // Chest panel on front
    if (z === 0 && x >= 1 && x <= 4 && y >= 1 && y <= 4) {
      if (x === 2 && y === 3) return ROBOT_CHEST;
      if (x === 3 && y === 3) return ROBOT_CHEST;
      return ROBOT_BODY[2];
    }
    return (x + y) % 2 === 0 ? ROBOT_BODY[1] : ROBOT_BODY[0];
  });

  // Arms (2 wide × 5 tall × 2 deep each)
  for (const sx of [-5, 3]) {
    box(sx, 5, 0, 2, 5, 2, (_x, y) => y === 2 ? ROBOT_JOINT : ROBOT_BODY[1]);
  }

  // Head (5 wide × 5 tall × 4 deep)
  box(-2, 10, -1, 5, 5, 4, (x, y, z) => {
    // Screen face (front z=0 relative → z=-1 world)
    if (z === 0) {
      if (y >= 1 && y <= 3 && x >= 1 && x <= 3) {
        // Eyes
        if (y === 3 && (x === 1 || x === 3)) return ROBOT_EYE;
        if (y === 2 && x === 2) return ROBOT_EYE;
        // Mouth
        if (y === 1 && x >= 1 && x <= 3) return x === 2 ? ROBOT_SCREEN : '#004422';
        return ROBOT_SCREEN;
      }
      return ROBOT_BODY[0];
    }
    return (x + y + z) % 2 === 0 ? ROBOT_BODY[1] : ROBOT_BODY[0];
  });

  // Antenna
  v.push({ x: 0, y: 15, z: 1, color: ROBOT_ANTENNA });
  v.push({ x: 0, y: 16, z: 1, color: ROBOT_ANTENNA });
  v.push({ x: 0, y: 17, z: 1, color: ROBOT_LIGHT });

  return v;
}

/* ═══════════════════════════════════════════════════════════
 *  GENERATOR: Circular Stone Platform
 * ═══════════════════════════════════════════════════════════ */

function generatePlatform(r = 6): Voxel3D[] {
  const v: Voxel3D[] = [];
  for (let x = -r; x <= r; x++) {
    for (let z = -r; z <= r; z++) {
      const d = Math.sqrt(x * x + z * z);
      if (d > r + 0.3) continue;
      v.push({ x, y: 0, z, color: STONE[(Math.abs(x) + Math.abs(z)) % 3] });
      if (d < r - 0.5) {
        v.push({ x, y: -1, z, color: STONE[(Math.abs(x + z)) % 3] });
      }
    }
  }
  return v;
}

/* ═══════════════════════════════════════════════════════════
 *  RENDERER: Instanced Voxel Cubes
 * ═══════════════════════════════════════════════════════════ */

interface VoxelModelProps {
  voxels: Voxel3D[];
  position?: [number, number, number];
  cubeSize?: number;
  roughness?: number;
  metalness?: number;
  opacity?: number;
  transparent?: boolean;
}

function Voxel3DModel({
  voxels,
  position = [0, 0, 0],
  cubeSize = 0.5,
  roughness = 0.6,
  metalness = 0.0,
  opacity = 1,
  transparent = false,
}: VoxelModelProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const count = voxels.length;

  const { matrices, colors } = useMemo(() => {
    const m: THREE.Matrix4[] = [];
    const c: THREE.Color[] = [];
    for (const v of voxels) {
      const mat = new THREE.Matrix4();
      mat.setPosition(v.x * cubeSize, v.y * cubeSize, v.z * cubeSize);
      m.push(mat);
      c.push(new THREE.Color(v.color));
    }
    return { matrices: m, colors: c };
  }, [voxels, cubeSize]);

  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh || count === 0) return;
    for (let i = 0; i < count; i++) {
      mesh.setMatrixAt(i, matrices[i]);
      mesh.setColorAt(i, colors[i]);
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [count, matrices, colors]);

  if (count === 0) return null;

  const gap = cubeSize * 0.92;
  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]} position={position} castShadow receiveShadow>
      <boxGeometry args={[gap, gap, gap]} />
      <meshStandardMaterial
        roughness={roughness}
        metalness={metalness}
        transparent={transparent}
        opacity={opacity}
        depthWrite={!transparent}
      />
    </instancedMesh>
  );
}

/* ═══════════════════════════════════════════════════════════
 *  FX: Fuse Spark (dual-glow animated)
 * ═══════════════════════════════════════════════════════════ */

function FuseSpark({ position }: { position: [number, number, number] }) {
  const l1 = useRef<THREE.PointLight>(null);
  const l2 = useRef<THREE.PointLight>(null);
  const outer = useRef<THREE.Mesh>(null);
  const core = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const p1 = 0.6 + Math.sin(t * 8) * 0.4;
    const p2 = 0.7 + Math.sin(t * 14) * 0.3;
    if (l1.current) l1.current.intensity = p1 * 3.5;
    if (l2.current) l2.current.intensity = p2 * 2;
    if (outer.current) outer.current.scale.setScalar(0.3 + p1 * 0.4);
    if (core.current) core.current.scale.setScalar(0.15 + p2 * 0.2);
  });

  return (
    <group position={position}>
      <pointLight ref={l1} color="#FFD700" intensity={3} distance={15} decay={2} />
      <pointLight ref={l2} color="#FF6600" intensity={1.5} distance={8} decay={2} />
      <mesh ref={outer}>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshBasicMaterial color="#FFD700" transparent opacity={0.7} />
      </mesh>
      <mesh ref={core}>
        <sphereGeometry args={[0.3, 12, 12]} />
        <meshBasicMaterial color="#FFFFFF" transparent opacity={0.9} />
      </mesh>
    </group>
  );
}

/* ═══════════════════════════════════════════════════════════
 *  FX: Robot Antenna Light
 * ═══════════════════════════════════════════════════════════ */

function AntennaLight({ position }: { position: [number, number, number] }) {
  const lightRef = useRef<THREE.PointLight>(null);
  useFrame(({ clock }) => {
    if (lightRef.current) {
      const blink = Math.sin(clock.getElapsedTime() * 3) > 0.3 ? 2.5 : 0.3;
      lightRef.current.intensity = blink;
    }
  });
  return (
    <group position={position}>
      <pointLight ref={lightRef} color="#FF4444" intensity={2} distance={6} decay={2} />
    </group>
  );
}

/* ═══════════════════════════════════════════════════════════
 *  FX: Auto-Rotate
 * ═══════════════════════════════════════════════════════════ */

function AutoRotate({ children, speed = 0.15 }: { children: React.ReactNode; speed?: number }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, dt) => { if (ref.current) ref.current.rotation.y += dt * speed; });
  return <group ref={ref}>{children}</group>;
}

/* ═══════════════════════════════════════════════════════════
 *  FX: Sparkle Particles
 * ═══════════════════════════════════════════════════════════ */

function Sparkles({ count = 30, range = 18, color = '#FFD700' }: { count?: number; range?: number; color?: string }) {
  const ref = useRef<THREE.Points>(null);

  const geometry = useMemo(() => {
    // Deterministic pseudo-random (mulberry32) to satisfy react-hooks/purity
    let seed = count * 73856093 + Math.round(range * 19349663);
    const rand = () => { seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (rand() - 0.5) * range;
      pos[i * 3 + 1] = rand() * range * 0.5 + 2;
      pos[i * 3 + 2] = (rand() - 0.5) * range;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    return geo;
  }, [count, range]);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    const attr = ref.current.geometry.getAttribute('position') as THREE.BufferAttribute;
    for (let i = 0; i < count; i++) {
      attr.array[i * 3 + 1] += Math.sin(t * 0.5 + i) * 0.01;
      if (attr.array[i * 3 + 1] > range * 0.6) attr.array[i * 3 + 1] = -1;
    }
    attr.needsUpdate = true;
  });

  return (
    <points ref={ref} geometry={geometry}>
      <pointsMaterial color={color} size={0.2} transparent opacity={0.6} sizeAttenuation />
    </points>
  );
}

/* ═══════════════════════════════════════════════════════════
 *  Shared Lighting Setup
 * ═══════════════════════════════════════════════════════════ */

function SharedLighting() {
  return (
    <>
      {/* Moderate ambient — with NoToneMapping, colors output directly */}
      <ambientLight intensity={0.9} color="#ffffff" />
      {/* Hemisphere: white for faithful vertex colors */}
      <hemisphereLight color="#ffffff" groundColor="#ffffff" intensity={0.6} />
      {/* Key light — strong white sunlight */}
      <directionalLight
        position={[15, 25, 15]}
        intensity={1.5}
        color="#ffffff"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-far={80}
        shadow-camera-left={-25}
        shadow-camera-right={25}
        shadow-camera-top={25}
        shadow-camera-bottom={-25}
      />
      {/* Fill light from left */}
      <directionalLight position={[-12, 10, -8]} intensity={0.8} color="#ffffff" />
      {/* Rim light from behind */}
      <directionalLight position={[0, 8, -15]} intensity={0.5} color="#ffffff" />
      {/* Bottom fill */}
      <directionalLight position={[0, -10, 5]} intensity={0.4} color="#ffffff" />
    </>
  );
}

/* ═══════════════════════════════════════════════════════════
 *  SCENE 1: Floating Island + 3D Bomb + Trees + Decorations
 * ═══════════════════════════════════════════════════════════ */

function IslandScene() {
  const CS = 0.55;
  const bombR = 7;
  const bombY = (bombR + 2) * CS; // bomb floats above island grass

  const { islandVoxels, bombData, sparkPos, treeVoxels, decoVoxels } = useMemo(() => {
    const isl = generateIsland(28, 28);
    const bomb = generateBomb3D(bombR);
    const trees = [
      ...generateTree(-8, -7, 5, 3),
      ...generateTree(7, -5, 6, 3),
      ...generateTree(-6, 8, 4, 2),
    ];
    const deco = [
      ...generateFlowers([[-4, -3], [3, 5], [-2, 6], [5, -2], [-7, 2], [0, -8], [6, 7]]),
      ...generateRock(4, -6),
      ...generateRock(-9, 3),
    ];
    const sp: [number, number, number] = [
      bomb.fuseTip[0] * CS,
      bomb.fuseTip[1] * CS + bombY,
      bomb.fuseTip[2] * CS,
    ];
    return { islandVoxels: isl, bombData: bomb, sparkPos: sp, treeVoxels: trees, decoVoxels: deco };
  }, [bombY]);

  return (
    <AutoRotate speed={0.12}>
      {/* Island terrain */}
      <Voxel3DModel voxels={islandVoxels} position={[0, -3, 0]} cubeSize={CS} roughness={0.7} />
      {/* Trees + decorations on island */}
      <Voxel3DModel voxels={[...treeVoxels, ...decoVoxels]} position={[0, -3, 0]} cubeSize={CS} roughness={0.6} />
      {/* 3D Bomb floating above island */}
      <Float speed={1.5} rotationIntensity={0.1} floatIntensity={1.2} floatingRange={[-0.3, 0.3]}>
        <Voxel3DModel voxels={bombData.voxels} position={[0, bombY - 3, 0]} cubeSize={CS} roughness={0.5} metalness={0.05} />
        <FuseSpark position={[sparkPos[0], sparkPos[1] - 3, sparkPos[2]]} />
      </Float>
      <Sparkles count={25} range={16} />
    </AutoRotate>
  );
}

/* ═══════════════════════════════════════════════════════════
 *  SCENE 2: Terrain Landscape + Water + Windmill + Trees
 * ═══════════════════════════════════════════════════════════ */

function TerrainScene() {
  const CS = 0.5;

  const { solidVoxels, waterVoxels, extras } = useMemo(() => {
    const terrain = generateTerrain(28);

    // Windmill on a high point — find max height under its footprint
    const millX = 3, millZ = -3;
    const millH = maxHeightUnder(terrain.heightAt, millX - 2, millZ - 2, 5, 5);
    const windmill = generateWindmill(millX, millZ, millH + 1);

    // Trees — placed ON the terrain surface
    const treeDefs: [number, number, number, number][] = [[-8, -6, 4, 2], [-5, 6, 5, 3], [8, 4, 5, 2], [5, -8, 4, 2]];
    const trees = treeDefs.flatMap(([tx, tz, th, tc]) => {
      const surfH = maxHeightUnder(terrain.heightAt, tx, tz, 2, 2);
      return offsetVoxelsY(generateTree(tx, tz, th, tc), surfH + 1);
    });

    // Flowers — each placed at its terrain height
    const flowerDefs: [number, number][] = [[-3, 3], [6, -2], [-7, -1], [1, 8], [9, 0], [-2, -6]];
    const flowers = flowerDefs.flatMap(([fx, fz]) => {
      const fH = terrain.heightAt(fx, fz);
      return generateFlowers([[fx, fz]], fH + 1);
    });

    // Rocks — placed on surface
    const rockDefs: [number, number][] = [[4, -7], [-9, 4]];
    const rocks = rockDefs.flatMap(([rx, rz]) => {
      const rH = maxHeightUnder(terrain.heightAt, rx, rz, 2, 2);
      return generateRock(rx, rz, rH + 1);
    });

    return {
      solidVoxels: terrain.solid,
      waterVoxels: terrain.water,
      extras: [...windmill, ...trees, ...flowers, ...rocks],
    };
  }, []);

  return (
    <AutoRotate speed={0.1}>
      <group position={[0, -4, 0]}>
        <Voxel3DModel voxels={solidVoxels} cubeSize={CS} roughness={0.7} />
        <Voxel3DModel voxels={extras} cubeSize={CS} roughness={0.6} />
        {waterVoxels.length > 0 && (
          <Voxel3DModel voxels={waterVoxels} cubeSize={CS} roughness={0.2} metalness={0.05} transparent opacity={0.65} />
        )}
      </group>
      <Sparkles count={15} range={14} color="#88CCFF" />
    </AutoRotate>
  );
}

/* ═══════════════════════════════════════════════════════════
 *  SCENE 3: Robot Character on Platform
 * ═══════════════════════════════════════════════════════════ */

function CharacterScene() {
  const CS = 0.5;

  const { robotVoxels, platformVoxels, antennaPos } = useMemo(() => {
    const robot = generateRobot();
    const platform = generatePlatform(7);
    const aPos: [number, number, number] = [0 * CS, 17 * CS + 0.5, 1 * CS];
    return { robotVoxels: robot, platformVoxels: platform, antennaPos: aPos };
  }, []);

  return (
    <AutoRotate speed={0.15}>
      <group position={[0, -4, 0]}>
        {/* Platform */}
        <Voxel3DModel voxels={platformVoxels} cubeSize={CS} roughness={0.7} metalness={0.05} />
        {/* Robot (sits on platform at y=1) */}
        <Float speed={2} rotationIntensity={0.05} floatIntensity={0.6} floatingRange={[-0.15, 0.15]}>
          <Voxel3DModel voxels={robotVoxels} position={[0, CS, 0]} cubeSize={CS} roughness={0.5} metalness={0.1} />
          <AntennaLight position={[antennaPos[0], antennaPos[1], antennaPos[2]]} />
        </Float>
      </group>
      <Sparkles count={12} range={10} color="#4488FF" />
    </AutoRotate>
  );
}

/* ═══════════════════════════════════════════════════════════
 *  GENERATORS: World Scene elements
 * ═══════════════════════════════════════════════════════════ */

/** Generate a larger terrain with mountains, valley, and river channel */
function generateWorldTerrain(size: number): { solid: Voxel3D[]; water: Voxel3D[]; heightAt: (wx: number, wz: number) => number } {
  const solid: Voxel3D[] = [];
  const water: Voxel3D[] = [];
  const WATER_LVL = 2;
  const half = Math.floor(size / 2);
  const heightMap = new Map<string, number>();

  const computeHeight = (x: number, z: number) => {
    const nx = x / size, nz = z / size;
    // Base rolling hills
    let h = 2 + Math.sin(nx * 8) * 1.5 + Math.cos(nz * 10) * 1.2 + Math.sin((nx + nz) * 6) * 0.8;
    // Mountain ridge on left side
    const mDist = Math.abs(nx - 0.15);
    if (mDist < 0.2) h += (0.2 - mDist) * 35;
    // River channel through center (carve down)
    const riverCenter = 0.5 + Math.sin(nz * 4) * 0.08;
    const rDist = Math.abs(nx - riverCenter);
    if (rDist < 0.08) h = Math.min(h, WATER_LVL - 1 + rDist * 15);
    return Math.max(0, Math.floor(h));
  };

  for (let x = 0; x < size; x++) {
    for (let z = 0; z < size; z++) {
      const h = computeHeight(x, z);
      const ix = x - half, iz = z - half;
      heightMap.set(`${ix},${iz}`, h);

      for (let y = 0; y <= h; y++) {
        let c: string;
        if (h > 8 && y >= h - 1) c = SNOW[(x + z) % 3]; // Snow caps
        else if (h > 6 && y >= h - 1) c = MOUNTAIN[(x + z) % 4]; // Mountain rock
        else if (y === h && h > WATER_LVL) c = GRASS[(x + z) % 3];
        else if (y === h && h >= WATER_LVL - 1) c = SAND[(x + z) % 3];
        else if (y >= h - 2) c = DIRT[(x + y) % 3];
        else c = STONE[(x + y + z) % 3];
        solid.push({ x: ix, y, z: iz, color: c });
      }
      if (h < WATER_LVL) {
        for (let y = h + 1; y <= WATER_LVL; y++) {
          water.push({ x: ix, y, z: iz, color: RIVER_C });
        }
      }
    }
  }

  const heightAt = (wx: number, wz: number) => {
    const key = `${Math.round(wx)},${Math.round(wz)}`;
    return heightMap.get(key) ?? 0;
  };

  return { solid, water, heightAt };
}

/** Pine tree — taller and more conical than the regular tree */
function generatePineTree(bx: number, bz: number, h = 7): Voxel3D[] {
  const voxels: Voxel3D[] = [];
  // Trunk
  for (let y = 0; y < h; y++) {
    voxels.push({ x: bx, y, z: bz, color: PINE_TRUNK[y % 3] });
  }
  // Conical crown (3 layers, getting narrower)
  for (let layer = 0; layer < 3; layer++) {
    const r = 3 - layer;
    const baseY = h - 2 + layer * 2;
    for (let dy = 0; dy < 2; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        for (let dz = -r; dz <= r; dz++) {
          if (Math.abs(dx) + Math.abs(dz) > r + 1) continue;
          voxels.push({ x: bx + dx, y: baseY + dy, z: bz + dz, color: PINE_LEAF[Math.abs(dx + dz + layer) % 3] });
        }
      }
    }
  }
  return voxels;
}

/** Wooden bridge across a gap */
function generateBridge(x1: number, x2: number, z: number, y: number): Voxel3D[] {
  const voxels: Voxel3D[] = [];
  for (let x = x1; x <= x2; x++) {
    // Deck
    for (let dz = -1; dz <= 1; dz++) {
      voxels.push({ x, y, z: z + dz, color: BRIDGE_WOOD[Math.abs(x + dz) % 3] });
    }
    // Rails on sides
    if (x % 2 === 0) {
      voxels.push({ x, y: y + 1, z: z - 1, color: FENCE_C });
      voxels.push({ x, y: y + 1, z: z + 1, color: FENCE_C });
    }
  }
  return voxels;
}

/** Small lamp post */
function generateLamp(bx: number, bz: number, by: number): Voxel3D[] {
  return [
    { x: bx, y: by, z: bz, color: LAMP_POST },
    { x: bx, y: by + 1, z: bz, color: LAMP_POST },
    { x: bx, y: by + 2, z: bz, color: LAMP_POST },
    { x: bx, y: by + 3, z: bz, color: LAMP_GLOW },
  ];
}

/* ═══════════════════════════════════════════════════════════
 *  SCENE 4: World — large coherent landscape
 * ═══════════════════════════════════════════════════════════ */

function WorldScene() {
  const CS = 0.35; // Smaller cubes for bigger world

  const { solidVoxels, waterVoxels, structureVoxels } = useMemo(() => {
    const terrain = generateWorldTerrain(40);
    const hAt = terrain.heightAt;

    // Village houses — grounded to max height under full footprint (5×4)
    const houseDefs: [number, number][] = [[5, 5], [5, -6], [10, 0]];
    const houses = houseDefs.flatMap(([hx, hz]) => {
      const baseH = maxHeightUnder(hAt, hx, hz, 5, 4);
      return generateHouse(hx, hz, baseH + 1);
    });

    // Forest of pines on the mountain side — placed on surface
    const pineDefs: [number, number, number][] = [
      [-12, -8, 6], [-14, -4, 7], [-10, -2, 5],
      [-13, 3, 6], [-11, 7, 7], [-15, 0, 5], [-9, 10, 6],
    ];
    const pines = pineDefs.flatMap(([px, pz, ph]) => {
      const surfH = hAt(px, pz);
      return offsetVoxelsY(generatePineTree(px, pz, ph), surfH + 1);
    });

    // Regular trees near village — placed on surface
    const treeDefs: [number, number, number, number][] = [[8, 8, 4, 2], [12, -5, 5, 2], [3, -10, 4, 2]];
    const trees = treeDefs.flatMap(([tx, tz, th, tc]) => {
      const surfH = maxHeightUnder(hAt, tx, tz, 2, 2);
      return offsetVoxelsY(generateTree(tx, tz, th, tc), surfH + 1);
    });

    // Bridge over the river — find water level +1
    const bridgeY = Math.max(hAt(-1, 2), hAt(1, 2), 3);
    const bridge = generateBridge(-3, 3, 2, bridgeY);

    // Lamps — each grounded individually
    const lampDefs: [number, number][] = [[4, 3], [7, -3], [11, 3]];
    const lamps = lampDefs.flatMap(([lx, lz]) => generateLamp(lx, lz, hAt(lx, lz) + 1));

    // Fence — each post at its own terrain height
    const fenceVoxels: Voxel3D[] = [];
    for (let fx = 6; fx <= 12; fx++) {
      const fy = hAt(fx, 3) + 1;
      fenceVoxels.push({ x: fx, y: fy, z: 3, color: FENCE_C });
      if (fx % 2 === 0) fenceVoxels.push({ x: fx, y: fy + 1, z: 3, color: FENCE_C });
    }

    // Path connecting houses — each tile at its own height
    const pathVoxels: Voxel3D[] = [];
    for (let px = 4; px <= 12; px++) {
      for (const pz of [0, 1]) {
        const py = hAt(px, pz) + 1;
        pathVoxels.push({ x: px, y: py, z: pz, color: PATH_C[px % PATH_C.length] });
      }
    }

    // Flowers — each at its own terrain height
    const flowerDefs: [number, number][] = [[6, 7], [8, -7], [3, 4], [11, 5], [7, -9], [13, 2]];
    const flowers = flowerDefs.flatMap(([fx, fz]) => generateFlowers([[fx, fz]], hAt(fx, fz) + 1));

    // Rocks — grounded
    const rockDefs: [number, number][] = [[9, 7], [14, -3]];
    const rocks = rockDefs.flatMap(([rx, rz]) => {
      const rH = maxHeightUnder(hAt, rx, rz, 2, 2);
      return generateRock(rx, rz, rH + 1);
    });

    return {
      solidVoxels: terrain.solid,
      waterVoxels: terrain.water,
      structureVoxels: [...houses, ...pines, ...trees, ...bridge, ...lamps, ...fenceVoxels, ...pathVoxels, ...flowers, ...rocks],
    };
  }, []);

  return (
    <AutoRotate speed={0.08}>
      <group position={[0, -3, 0]}>
        <Voxel3DModel voxels={solidVoxels} cubeSize={CS} roughness={0.7} />
        <Voxel3DModel voxels={structureVoxels} cubeSize={CS} roughness={0.55} />
        {waterVoxels.length > 0 && (
          <Voxel3DModel voxels={waterVoxels} cubeSize={CS} roughness={0.15} metalness={0.05} transparent opacity={0.6} />
        )}
      </group>
      <Sparkles count={20} range={16} color="#FFD700" />
      <Sparkles count={10} range={12} color="#88CCFF" />
    </AutoRotate>
  );
}

/* ═══════════════════════════════════════════════════════════
 *  Main Export — Canvas + Tab Switcher
 * ═══════════════════════════════════════════════════════════ */

const TABS: { id: SceneTab; label: string; icon: string }[] = [
  { id: 'island', label: 'Island', icon: '🏝️' },
  { id: 'terrain', label: 'Terrain', icon: '🌍' },
  { id: 'character', label: 'Character', icon: '🤖' },
  { id: 'world', label: 'World', icon: '🏔️' },
];

export default function VoxelPreview({ onTabChange, initialTab = 'island', showTabs = true }: { onTabChange?: (tab: SceneTab) => void; initialTab?: SceneTab; showTabs?: boolean }) {
  const [tab, setTab] = useState<SceneTab>(initialTab);

  const handleTab = (t: SceneTab) => {
    setTab(t);
    onTabChange?.(t);
  };

  return (
    <div className="w-full h-full relative">
      {/* Tab buttons */}
      {showTabs && (
        <div className="absolute top-2 sm:top-3 left-0 right-0 z-10 flex justify-center gap-1 sm:gap-2 px-2 pointer-events-auto">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => handleTab(t.id)}
              className={`
                font-pixel text-[7px] sm:text-[9px] md:text-[10px] px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded border transition-all duration-200 cursor-pointer
                backdrop-blur-sm select-none whitespace-nowrap
                ${tab === t.id
                  ? 'bg-retro-green/20 border-retro-green/60 text-retro-green shadow-[0_0_8px_rgba(74,222,128,0.15)]'
                  : 'bg-retro-bg/60 border-retro-border/40 text-retro-muted/60 hover:text-retro-muted hover:border-retro-border/60'
                }
              `}
            >
              <span className="mr-0.5 sm:mr-1">{t.icon}</span>
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          ))}
        </div>
      )}

      <Canvas
        camera={{ position: [0, 10, 24], fov: 42, near: 0.1, far: 100 }}
        shadows
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, toneMapping: THREE.NoToneMapping }}
        style={{ background: 'transparent' }}
      >
        <SharedLighting />
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          minPolarAngle={Math.PI / 5}
          maxPolarAngle={Math.PI / 2.3}
          autoRotate
          autoRotateSpeed={0.5}
          target={[0, 0.5, 0]}
        />
        {tab === 'island' && <IslandScene />}
        {tab === 'terrain' && <TerrainScene />}
        {tab === 'character' && <CharacterScene />}
        {tab === 'world' && <WorldScene />}
      </Canvas>
    </div>
  );
}

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

export type SceneTab = 'island' | 'terrain' | 'character';

/* ═══════════════════════════════════════════════════════════
 *  Color Palettes
 * ═══════════════════════════════════════════════════════════ */

const BOMB_BODY = [
  '#5a5a7a', '#6868a8', '#7878b0', '#8585c0',
  '#9494d0', '#a4a4dd', '#b8b8e8', '#d0d0f5',
];
const X_RED = '#ff4444';
const X_RED_D = '#cc2222';
const RING = ['#997744', '#bbaa66', '#ddcc88'];
const FUSE_C = ['#bb9933', '#ddbb55', '#ffdd66'];

const GRASS = ['#55cc77', '#66dd88', '#77ee99'];
const DIRT = ['#aa6622', '#bb7733', '#cc8844'];
const DEEP_DIRT = ['#885520', '#996630', '#887744'];
const STONE = ['#778888', '#889999', '#99aaaa'];

const TRUNK = ['#8B5A2B', '#9B6B3B', '#7B4A1B'];
const LEAF = ['#33aa55', '#44cc66', '#55dd77'];

const WATER_C = '#66bbff';
const SAND = ['#f0ddb0', '#f8e8cc', '#ffe8d0'];
const WALL = ['#eed8bb', '#f8e8d0'];
const ROOF = ['#cc4433', '#dd5544'];
const WINDOW_C = '#88ccff';
const DOOR_C = '#8B5A2B';

const ROBOT_BODY = ['#7788aa', '#8899bb', '#99aacc'];
const ROBOT_EYE = '#44ffaa';
const ROBOT_SCREEN = '#334455';
const ROBOT_JOINT = '#667788';
const ROBOT_LIGHT = '#ff6666';
const ROBOT_CHEST = '#66aaff';
const ROBOT_ANTENNA = '#aabbcc';

const FLOWER_COLORS = ['#ff8888', '#ffcc44', '#bb99ff', '#ff88bb', '#77bbff'];
const ROCK_COLORS = ['#8899aa', '#99aabb', '#aabbcc'];

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

  // Sphere shell
  for (let x = -R; x <= R; x++) {
    for (let y = -R; y <= R; y++) {
      for (let z = -R; z <= R; z++) {
        const dist = Math.sqrt(x * x + y * y + z * z);
        if (dist > R + 0.3 || dist < R - 1.8) continue; // shell only
        if (y >= R - 1 && x * x + z * z <= 3) continue; // fuse hole

        const isSurface = dist > R - 1.1;
        let color: string;

        if (isSurface) {
          // X marking on front-facing surface
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
          // Simulated directional lighting via surface normal
          const n = dist || 1;
          const dot = (x / n) * -0.35 + (y / n) * 0.55 + (z / n) * 0.45;
          const idx = Math.min(7, Math.max(0, Math.floor((dot + 0.7) / 1.4 * 8)));
          color = BOMB_BODY[idx];
        } else {
          color = BOMB_BODY[0];
        }
        voxels.push({ x, y, z, color });
      }
    }
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

function generateFlowers(positions: [number, number][]): Voxel3D[] {
  return positions.map(([x, z], i) => ({
    x, y: 1, z, color: FLOWER_COLORS[i % FLOWER_COLORS.length],
  }));
}

function generateRock(bx: number, bz: number): Voxel3D[] {
  return [
    { x: bx, y: 1, z: bz, color: ROCK_COLORS[0] },
    { x: bx + 1, y: 1, z: bz, color: ROCK_COLORS[1] },
    { x: bx, y: 1, z: bz + 1, color: ROCK_COLORS[2] },
    { x: bx + 1, y: 1, z: bz + 1, color: ROCK_COLORS[0] },
    { x: bx, y: 2, z: bz, color: ROCK_COLORS[2] },
  ];
}

/* ═══════════════════════════════════════════════════════════
 *  GENERATOR: Terrain with Heightmap + Water
 * ═══════════════════════════════════════════════════════════ */

function generateTerrain(size: number): { solid: Voxel3D[]; water: Voxel3D[] } {
  const solid: Voxel3D[] = [];
  const water: Voxel3D[] = [];
  const WATER_LVL = 3;
  const half = Math.floor(size / 2);

  for (let x = 0; x < size; x++) {
    for (let z = 0; z < size; z++) {
      const nx = x / size * 4, nz = z / size * 4;
      const h = Math.max(0, Math.floor(
        3.5 + Math.sin(nx * 1.8) * 2 + Math.cos(nz * 2.2) * 1.5
        + Math.sin((nx + nz) * 1.1) * 1 + Math.cos(nx * 0.5 - nz * 1.5) * 1.5
      ));
      const ix = x - half, iz = z - half;

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
  return { solid, water };
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
  roughness = 0.45,
  metalness = 0.05,
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
        vertexColors
        roughness={roughness}
        metalness={metalness}
        transparent={transparent}
        opacity={opacity}
        depthWrite={!transparent}
        envMapIntensity={0.5}
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
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * range;
      pos[i * 3 + 1] = Math.random() * range * 0.5 + 2;
      pos[i * 3 + 2] = (Math.random() - 0.5) * range;
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
      {/* Strong ambient fill — prevents any surface from being pure black */}
      <ambientLight intensity={1.0} color="#e8e0f0" />
      {/* Hemisphere: sky blue above, warm green below — natural outdoor feel */}
      <hemisphereLight color="#aaddff" groundColor="#88cc88" intensity={0.8} />
      {/* Key light — warm sunlight from upper-right-front */}
      <directionalLight
        position={[15, 25, 15]}
        intensity={2.0}
        color="#fff8ee"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-far={80}
        shadow-camera-left={-25}
        shadow-camera-right={25}
        shadow-camera-top={25}
        shadow-camera-bottom={-25}
      />
      {/* Fill light — cooler from the left-back to soften shadows */}
      <directionalLight position={[-12, 10, -8]} intensity={0.8} color="#bbccff" />
      {/* Rim/back light — subtle purple tint for depth */}
      <directionalLight position={[0, 5, -15]} intensity={0.5} color="#ccaaff" />
      {/* Gentle fog — pushed far back so scene stays bright */}
      <fog attach="fog" args={['#0d1117', 50, 100]} />
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
      <Voxel3DModel voxels={islandVoxels} position={[0, -3, 0]} cubeSize={CS} roughness={0.5} />
      {/* Trees + decorations on island */}
      <Voxel3DModel voxels={[...treeVoxels, ...decoVoxels]} position={[0, -3, 0]} cubeSize={CS} roughness={0.45} />
      {/* 3D Bomb floating above island */}
      <Float speed={1.5} rotationIntensity={0.1} floatIntensity={1.2} floatingRange={[-0.3, 0.3]}>
        <Voxel3DModel voxels={bombData.voxels} position={[0, bombY - 3, 0]} cubeSize={CS} roughness={0.4} metalness={0.1} />
        <FuseSpark position={[sparkPos[0], sparkPos[1] - 3, sparkPos[2]]} />
      </Float>
      <Sparkles count={25} range={16} />
    </AutoRotate>
  );
}

/* ═══════════════════════════════════════════════════════════
 *  SCENE 2: Terrain Landscape + Water + House + Trees
 * ═══════════════════════════════════════════════════════════ */

function TerrainScene() {
  const CS = 0.5;

  const { solidVoxels, waterVoxels, extras } = useMemo(() => {
    const terrain = generateTerrain(28);
    const house = generateHouse(3, -4, 6);
    const trees = [
      ...generateTree(-8, -6, 4, 2),
      ...generateTree(-5, 6, 5, 3),
      ...generateTree(8, 4, 5, 2),
      ...generateTree(5, -8, 4, 2),
    ];
    const flowers = generateFlowers([[-3, 3], [6, -2], [-7, -1], [1, 8], [9, 0], [-2, -6]]);
    return {
      solidVoxels: terrain.solid,
      waterVoxels: terrain.water,
      extras: [...house, ...trees, ...flowers],
    };
  }, []);

  return (
    <AutoRotate speed={0.1}>
      <group position={[0, -4, 0]}>
        <Voxel3DModel voxels={solidVoxels} cubeSize={CS} roughness={0.5} />
        <Voxel3DModel voxels={extras} cubeSize={CS} roughness={0.45} />
        {waterVoxels.length > 0 && (
          <Voxel3DModel voxels={waterVoxels} cubeSize={CS} roughness={0.15} metalness={0.15} transparent opacity={0.6} />
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
        <Voxel3DModel voxels={platformVoxels} cubeSize={CS} roughness={0.6} metalness={0.1} />
        {/* Robot (sits on platform at y=1) */}
        <Float speed={2} rotationIntensity={0.05} floatIntensity={0.6} floatingRange={[-0.15, 0.15]}>
          <Voxel3DModel voxels={robotVoxels} position={[0, CS, 0]} cubeSize={CS} roughness={0.35} metalness={0.2} />
          <AntennaLight position={[antennaPos[0], antennaPos[1], antennaPos[2]]} />
        </Float>
      </group>
      <Sparkles count={12} range={10} color="#4488FF" />
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
];

export default function VoxelPreview({ onTabChange }: { onTabChange?: (tab: SceneTab) => void }) {
  const [tab, setTab] = useState<SceneTab>('island');

  const handleTab = (t: SceneTab) => {
    setTab(t);
    onTabChange?.(t);
  };

  return (
    <div className="w-full h-full relative">
      {/* Tab buttons */}
      <div className="absolute top-3 left-0 right-0 z-10 flex justify-center gap-2 pointer-events-auto">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => handleTab(t.id)}
            className={`
              font-pixel text-[9px] sm:text-[10px] px-2.5 py-1 rounded border transition-all duration-200 cursor-pointer
              backdrop-blur-sm select-none
              ${tab === t.id
                ? 'bg-retro-green/20 border-retro-green/60 text-retro-green shadow-[0_0_8px_rgba(74,222,128,0.15)]'
                : 'bg-retro-bg/60 border-retro-border/40 text-retro-muted/60 hover:text-retro-muted hover:border-retro-border/60'
              }
            `}
          >
            <span className="mr-1">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      <Canvas
        camera={{ position: [0, 10, 24], fov: 42, near: 0.1, far: 100 }}
        shadows
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.6 }}
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
      </Canvas>
    </div>
  );
}

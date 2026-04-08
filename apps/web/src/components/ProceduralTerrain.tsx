'use client';

import { useRef, useMemo, useEffect, useState, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

/* ═══════════════════════════════════════════════════════════
 *  Seeded PRNG — mulberry32
 * ═══════════════════════════════════════════════════════════ */

function mulberry32(seed: number) {
  return () => {
    seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ═══════════════════════════════════════════════════════════
 *  Simplex-like 2D Noise (seeded)
 * ═══════════════════════════════════════════════════════════ */

function createNoise2D(seed: number) {
  const rand = mulberry32(seed);
  // Generate a permutation table
  const perm = new Uint8Array(512);
  const p = new Uint8Array(256);
  for (let i = 0; i < 256; i++) p[i] = i;
  // Fisher-Yates shuffle with seeded PRNG
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [p[i], p[j]] = [p[j], p[i]];
  }
  for (let i = 0; i < 512; i++) perm[i] = p[i & 255];

  // Gradient vectors for 2D
  const GRAD = [
    [1, 1], [-1, 1], [1, -1], [-1, -1],
    [1, 0], [-1, 0], [0, 1], [0, -1],
  ];

  function dot2(gIdx: number, x: number, y: number) {
    const g = GRAD[gIdx % 8];
    return g[0] * x + g[1] * y;
  }

  function fade(t: number) { return t * t * t * (t * (t * 6 - 15) + 10); }
  function lerp(a: number, b: number, t: number) { return a + t * (b - a); }

  return function noise2D(x: number, y: number): number {
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;
    const xf = x - Math.floor(x);
    const yf = y - Math.floor(y);
    const u = fade(xf);
    const v = fade(yf);

    const aa = perm[perm[X] + Y];
    const ab = perm[perm[X] + Y + 1];
    const ba = perm[perm[X + 1] + Y];
    const bb = perm[perm[X + 1] + Y + 1];

    return lerp(
      lerp(dot2(aa, xf, yf), dot2(ba, xf - 1, yf), u),
      lerp(dot2(ab, xf, yf - 1), dot2(bb, xf - 1, yf - 1), u),
      v,
    );
  };
}

/* ═══════════════════════════════════════════════════════════
 *  Fractal Brownian Motion
 * ═══════════════════════════════════════════════════════════ */

function fbm(noise: (x: number, y: number) => number, x: number, y: number, octaves: number, lacunarity = 2.0, gain = 0.5): number {
  let value = 0;
  let amplitude = 1;
  let frequency = 1;
  let maxVal = 0;
  for (let i = 0; i < octaves; i++) {
    value += noise(x * frequency, y * frequency) * amplitude;
    maxVal += amplitude;
    amplitude *= gain;
    frequency *= lacunarity;
  }
  return value / maxVal;
}

/* ═══════════════════════════════════════════════════════════
 *  Biome Definitions
 * ═══════════════════════════════════════════════════════════ */

type BiomeType = 'plains' | 'desert' | 'tundra' | 'forest' | 'mountains' | 'ocean';

interface BiomeConfig {
  name: string;
  heightScale: number;
  heightBase: number;
  waterLevel: number;
  colors: {
    top: string[];
    mid: string[];
    bottom: string[];
    accent: string[];
    water: string;
  };
}

const BIOMES: Record<BiomeType, BiomeConfig> = {
  plains: {
    name: 'Plains',
    heightScale: 4,
    heightBase: 8,
    waterLevel: 5,
    colors: {
      top: ['#66ee88', '#77ff99', '#55dd77', '#88ffaa'],
      mid: ['#cc8844', '#dd9955', '#bb7733'],
      bottom: ['#99aabb', '#aabbcc', '#889999'],
      accent: ['#ff9999', '#ffdd66', '#ccaaff', '#ff99cc'],
      water: '#88ddff',
    },
  },
  desert: {
    name: 'Desert',
    heightScale: 3,
    heightBase: 6,
    waterLevel: 2,
    colors: {
      top: ['#ffeecc', '#fff5dd', '#ffe8bb', '#ffdda0'],
      mid: ['#ddbb88', '#ccaa77', '#bb9966'],
      bottom: ['#aa8866', '#997755', '#886644'],
      accent: ['#88cc55', '#559944'],
      water: '#66bbdd',
    },
  },
  tundra: {
    name: 'Tundra',
    heightScale: 5,
    heightBase: 7,
    waterLevel: 4,
    colors: {
      top: ['#eef4ff', '#f4f8ff', '#ffffff', '#e8eeff'],
      mid: ['#99aabb', '#aabbcc', '#8899aa'],
      bottom: ['#778899', '#667788', '#556677'],
      accent: ['#aaddff', '#88bbdd'],
      water: '#77ccee',
    },
  },
  forest: {
    name: 'Forest',
    heightScale: 6,
    heightBase: 8,
    waterLevel: 5,
    colors: {
      top: ['#339955', '#44aa66', '#22884d', '#55bb77'],
      mid: ['#886644', '#775533', '#664422'],
      bottom: ['#556655', '#667766', '#445544'],
      accent: ['#ee5544', '#ff6655', '#dd4433'],
      water: '#55aacc',
    },
  },
  mountains: {
    name: 'Mountains',
    heightScale: 14,
    heightBase: 4,
    waterLevel: 3,
    colors: {
      top: ['#bbccdd', '#ccddee', '#aabbcc', '#99aabb'],
      mid: ['#8899aa', '#99aabb', '#7788aa'],
      bottom: ['#667788', '#556677', '#778899'],
      accent: ['#eef4ff', '#ffffff'],
      water: '#6699bb',
    },
  },
  ocean: {
    name: 'Ocean',
    heightScale: 3,
    heightBase: 2,
    waterLevel: 8,
    colors: {
      top: ['#ffeecc', '#fff5dd', '#ffe8bb'],
      mid: ['#ddcc99', '#ccbb88', '#bbaa77'],
      bottom: ['#99aabb', '#aabbcc', '#889999'],
      accent: ['#ff9999', '#ffcc66'],
      water: '#4499cc',
    },
  },
};

/* ═══════════════════════════════════════════════════════════
 *  Chunk Constants
 * ═══════════════════════════════════════════════════════════ */

const CHUNK_SIZE = 16;
const VOXEL_SIZE = 0.5;
const RENDER_DISTANCE = 6; // chunks
const MAX_HEIGHT = 32;

/* ═══════════════════════════════════════════════════════════
 *  Chunk Key Helpers
 * ═══════════════════════════════════════════════════════════ */

function chunkKey(cx: number, cz: number): string {
  return `${cx},${cz}`;
}

function worldToChunk(wx: number, wz: number): [number, number] {
  return [
    Math.floor(wx / (CHUNK_SIZE * VOXEL_SIZE)),
    Math.floor(wz / (CHUNK_SIZE * VOXEL_SIZE)),
  ];
}

/* ═══════════════════════════════════════════════════════════
 *  Determine biome from noise
 * ═══════════════════════════════════════════════════════════ */

function getBiome(
  biomeNoise: (x: number, y: number) => number,
  tempNoise: (x: number, y: number) => number,
  wx: number,
  wz: number,
): BiomeType {
  const temp = fbm(tempNoise, wx * 0.005, wz * 0.005, 3);
  const moisture = fbm(biomeNoise, wx * 0.004 + 100, wz * 0.004 + 100, 3);

  if (temp < -0.25) return 'tundra';
  if (temp > 0.3 && moisture < -0.1) return 'desert';
  if (moisture > 0.3) return 'ocean';
  if (temp > 0.0 && moisture > 0.05) return 'forest';
  if (fbm(biomeNoise, wx * 0.008, wz * 0.008, 2) > 0.25) return 'mountains';
  return 'plains';
}

/* ═══════════════════════════════════════════════════════════
 *  Generate Chunk Data
 * ═══════════════════════════════════════════════════════════ */

interface ChunkVoxelData {
  matrices: Float32Array;
  colors: Float32Array;
  count: number;
  waterMatrices: Float32Array;
  waterColors: Float32Array;
  waterCount: number;
}

function generateChunkData(
  cx: number,
  cz: number,
  heightNoise: (x: number, y: number) => number,
  detailNoise: (x: number, y: number) => number,
  biomeNoise: (x: number, y: number) => number,
  tempNoise: (x: number, y: number) => number,
  treeNoise: (x: number, y: number) => number,
): ChunkVoxelData {
  const solidPositions: number[] = [];
  const solidColors: number[] = [];
  const waterPositions: number[] = [];
  const waterColorArr: number[] = [];

  const baseX = cx * CHUNK_SIZE;
  const baseZ = cz * CHUNK_SIZE;

  // Pre-compute height map for the chunk + 1 border for neighbor checks
  const heights: number[][] = [];
  const biomes: BiomeType[][] = [];
  for (let lx = -1; lx <= CHUNK_SIZE; lx++) {
    const row: number[] = [];
    const bRow: BiomeType[] = [];
    for (let lz = -1; lz <= CHUNK_SIZE; lz++) {
      const wx = baseX + lx;
      const wz = baseZ + lz;

      const biome = getBiome(biomeNoise, tempNoise, wx, wz);
      const cfg = BIOMES[biome];

      const h = fbm(heightNoise, wx * 0.02, wz * 0.02, 5, 2.0, 0.5);
      const detail = fbm(detailNoise, wx * 0.08, wz * 0.08, 3, 2.0, 0.4) * 0.3;
      const height = Math.max(0, Math.floor(cfg.heightBase + (h + detail) * cfg.heightScale));

      row.push(Math.min(height, MAX_HEIGHT));
      bRow.push(biome);
    }
    heights.push(row);
    biomes.push(bRow);
  }

  const tmpColor = new THREE.Color();

  for (let lx = 0; lx < CHUNK_SIZE; lx++) {
    for (let lz = 0; lz < CHUNK_SIZE; lz++) {
      const h = heights[lx + 1][lz + 1];
      const biome = biomes[lx + 1][lz + 1];
      const cfg = BIOMES[biome];

      const wx = baseX + lx;
      const wz = baseZ + lz;

      // Get neighbor heights for occlusion culling
      const hN = heights[lx + 1][lz];
      const hS = heights[lx + 1][lz + 2];
      const hE = heights[lx + 2][lz + 1];
      const hW = heights[lx][lz + 1];

      for (let y = 0; y <= h; y++) {
        // Only render voxels that have at least one exposed face
        const isTop = y === h;
        const hasExposed = isTop || y === 0 ||
          y > hN || y > hS || y > hE || y > hW;

        if (!hasExposed) continue;

        // Determine color based on height layers
        let colorHex: string;
        if (isTop) {
          // Snow caps on mountains
          if (biome === 'mountains' && y > 18) {
            colorHex = cfg.colors.accent[Math.abs(wx + wz) % cfg.colors.accent.length];
          } else {
            colorHex = cfg.colors.top[Math.abs(wx + wz) % cfg.colors.top.length];
          }
        } else if (y >= h - 3) {
          colorHex = cfg.colors.mid[Math.abs(wx + y) % cfg.colors.mid.length];
        } else {
          colorHex = cfg.colors.bottom[Math.abs(wx + y + wz) % cfg.colors.bottom.length];
        }

        const worldX = (baseX + lx) * VOXEL_SIZE;
        const worldY = y * VOXEL_SIZE;
        const worldZ = (baseZ + lz) * VOXEL_SIZE;

        solidPositions.push(worldX, worldY, worldZ);
        tmpColor.set(colorHex);
        solidColors.push(tmpColor.r, tmpColor.g, tmpColor.b);
      }

      // Water fill
      if (h < cfg.waterLevel) {
        for (let y = h + 1; y <= cfg.waterLevel; y++) {
          // Only top water surface and edges
          const isWaterTop = y === cfg.waterLevel;
          if (!isWaterTop && y > h + 1) continue;

          const worldX = (baseX + lx) * VOXEL_SIZE;
          const worldY = y * VOXEL_SIZE;
          const worldZ = (baseZ + lz) * VOXEL_SIZE;

          waterPositions.push(worldX, worldY, worldZ);
          tmpColor.set(cfg.colors.water);
          waterColorArr.push(tmpColor.r, tmpColor.g, tmpColor.b);
        }
      }

      // Trees (sparse, only on top layer of certain biomes)
      if (
        (biome === 'plains' || biome === 'forest') &&
        h > cfg.waterLevel + 1
      ) {
        const treeVal = treeNoise(wx * 0.5, wz * 0.5);
        const threshold = biome === 'forest' ? 0.2 : 0.38;
        if (treeVal > threshold && lx > 1 && lx < CHUNK_SIZE - 2 && lz > 1 && lz < CHUNK_SIZE - 2) {
          // Simple tree: trunk + crown
          const trunkH = biome === 'forest' ? 4 : 3;
          const trunkColor = biome === 'forest' ? '#664422' : '#AA7744';
          const leafColor = biome === 'forest'
            ? ['#339955', '#44aa66', '#22884d'][Math.abs(wx) % 3]
            : ['#44dd66', '#55ee77', '#66ff88'][Math.abs(wx) % 3];

          for (let ty = 1; ty <= trunkH; ty++) {
            const worldX = (baseX + lx) * VOXEL_SIZE;
            const worldY = (h + ty) * VOXEL_SIZE;
            const worldZ = (baseZ + lz) * VOXEL_SIZE;
            solidPositions.push(worldX, worldY, worldZ);
            tmpColor.set(trunkColor);
            solidColors.push(tmpColor.r, tmpColor.g, tmpColor.b);
          }

          // Leaf crown (small sphere)
          const crownR = biome === 'forest' ? 2 : 2;
          const crownY = h + trunkH + crownR;
          for (let dx = -crownR; dx <= crownR; dx++) {
            for (let dy = -crownR; dy <= crownR; dy++) {
              for (let dz = -crownR; dz <= crownR; dz++) {
                if (dx * dx + dy * dy + dz * dz > crownR * crownR + 0.5) continue;
                const worldX = (baseX + lx + dx) * VOXEL_SIZE;
                const worldY = (crownY + dy) * VOXEL_SIZE;
                const worldZ = (baseZ + lz + dz) * VOXEL_SIZE;
                solidPositions.push(worldX, worldY, worldZ);
                tmpColor.set(leafColor);
                solidColors.push(tmpColor.r, tmpColor.g, tmpColor.b);
              }
            }
          }
        }
      }

      // Cacti in desert
      if (biome === 'desert' && h > cfg.waterLevel) {
        const cactusVal = treeNoise(wx * 0.7 + 50, wz * 0.7 + 50);
        if (cactusVal > 0.42 && lx > 0 && lx < CHUNK_SIZE - 1 && lz > 0 && lz < CHUNK_SIZE - 1) {
          const cactusH = 3 + Math.floor(Math.abs(treeNoise(wx, wz)) * 3);
          for (let cy = 1; cy <= cactusH; cy++) {
            solidPositions.push((baseX + lx) * VOXEL_SIZE, (h + cy) * VOXEL_SIZE, (baseZ + lz) * VOXEL_SIZE);
            tmpColor.set('#55aa44');
            solidColors.push(tmpColor.r, tmpColor.g, tmpColor.b);
          }
          // Arms
          if (cactusH > 3) {
            solidPositions.push((baseX + lx + 1) * VOXEL_SIZE, (h + 3) * VOXEL_SIZE, (baseZ + lz) * VOXEL_SIZE);
            tmpColor.set('#66bb55');
            solidColors.push(tmpColor.r, tmpColor.g, tmpColor.b);
            solidPositions.push((baseX + lx + 1) * VOXEL_SIZE, (h + 4) * VOXEL_SIZE, (baseZ + lz) * VOXEL_SIZE);
            tmpColor.set('#66bb55');
            solidColors.push(tmpColor.r, tmpColor.g, tmpColor.b);
          }
        }
      }
    }
  }

  // Convert to typed arrays
  const count = solidPositions.length / 3;
  const matrices = new Float32Array(count * 16);
  const colors = new Float32Array(count * 3);
  const tmpMat = new THREE.Matrix4();

  for (let i = 0; i < count; i++) {
    tmpMat.identity();
    tmpMat.setPosition(solidPositions[i * 3], solidPositions[i * 3 + 1], solidPositions[i * 3 + 2]);
    tmpMat.toArray(matrices, i * 16);
    colors[i * 3] = solidColors[i * 3];
    colors[i * 3 + 1] = solidColors[i * 3 + 1];
    colors[i * 3 + 2] = solidColors[i * 3 + 2];
  }

  const waterCount = waterPositions.length / 3;
  const waterMatrices = new Float32Array(waterCount * 16);
  const waterColors = new Float32Array(waterCount * 3);

  for (let i = 0; i < waterCount; i++) {
    tmpMat.identity();
    tmpMat.setPosition(waterPositions[i * 3], waterPositions[i * 3 + 1], waterPositions[i * 3 + 2]);
    tmpMat.toArray(waterMatrices, i * 16);
    waterColors[i * 3] = waterColorArr[i * 3];
    waterColors[i * 3 + 1] = waterColorArr[i * 3 + 1];
    waterColors[i * 3 + 2] = waterColorArr[i * 3 + 2];
  }

  return { matrices, colors, count, waterMatrices, waterColors, waterCount };
}

/* ═══════════════════════════════════════════════════════════
 *  Chunk Mesh Component
 * ═══════════════════════════════════════════════════════════ */

function ChunkMesh({ data }: { data: ChunkVoxelData }) {
  const solidRef = useRef<THREE.InstancedMesh>(null);
  const waterRef = useRef<THREE.InstancedMesh>(null);

  const gap = VOXEL_SIZE * 0.92;

  useEffect(() => {
    const mesh = solidRef.current;
    if (!mesh || data.count === 0) return;
    const mat4 = new THREE.Matrix4();
    const col = new THREE.Color();
    for (let i = 0; i < data.count; i++) {
      mat4.fromArray(data.matrices, i * 16);
      mesh.setMatrixAt(i, mat4);
      col.setRGB(data.colors[i * 3], data.colors[i * 3 + 1], data.colors[i * 3 + 2]);
      mesh.setColorAt(i, col);
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [data]);

  useEffect(() => {
    const mesh = waterRef.current;
    if (!mesh || data.waterCount === 0) return;
    const mat4 = new THREE.Matrix4();
    const col = new THREE.Color();
    for (let i = 0; i < data.waterCount; i++) {
      mat4.fromArray(data.waterMatrices, i * 16);
      mesh.setMatrixAt(i, mat4);
      col.setRGB(data.waterColors[i * 3], data.waterColors[i * 3 + 1], data.waterColors[i * 3 + 2]);
      mesh.setColorAt(i, col);
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [data]);

  return (
    <group>
      {data.count > 0 && (
        <instancedMesh ref={solidRef} args={[undefined, undefined, data.count]} frustumCulled={false}>
          <boxGeometry args={[gap, gap, gap]} />
          <meshStandardMaterial roughness={0.7} />
        </instancedMesh>
      )}
      {data.waterCount > 0 && (
        <instancedMesh ref={waterRef} args={[undefined, undefined, data.waterCount]} frustumCulled={false}>
          <boxGeometry args={[gap, gap, gap]} />
          <meshStandardMaterial roughness={0.2} metalness={0.05} transparent opacity={0.6} depthWrite={false} />
        </instancedMesh>
      )}
    </group>
  );
}

/* ═══════════════════════════════════════════════════════════
 *  Fly Camera Controller
 * ═══════════════════════════════════════════════════════════ */

function FlyCamera({
  keysRef,
  speedRef,
}: {
  keysRef: React.RefObject<Set<string>>;
  speedRef: React.RefObject<number>;
}) {
  const { camera } = useThree();

  // Initialize camera position
  useEffect(() => {
    camera.position.set(0, 12, 20);
    camera.lookAt(0, 6, 0);
  }, [camera]);

  useFrame((_, delta) => {
    const keys = keysRef.current;
    if (!keys) return;

    const speed = (speedRef.current ?? 12) * delta;
    const direction = new THREE.Vector3();
    const right = new THREE.Vector3();

    camera.getWorldDirection(direction);
    right.crossVectors(direction, camera.up).normalize();

    // Forward/Backward (W/ArrowUp, S/ArrowDown)
    if (keys.has('w') || keys.has('arrowup')) {
      camera.position.addScaledVector(direction, speed);
    }
    if (keys.has('s') || keys.has('arrowdown')) {
      camera.position.addScaledVector(direction, -speed);
    }

    // Strafe (A/ArrowLeft, D/ArrowRight)
    if (keys.has('a') || keys.has('arrowleft')) {
      camera.position.addScaledVector(right, -speed);
    }
    if (keys.has('d') || keys.has('arrowright')) {
      camera.position.addScaledVector(right, speed);
    }

    // Ascend/Descend (Space, Shift)
    if (keys.has(' ')) {
      camera.position.y += speed;
    }
    if (keys.has('shift')) {
      camera.position.y -= speed;
    }

    // Mouse look — handled by pointer lock in parent
  });

  return null;
}

/* ═══════════════════════════════════════════════════════════
 *  Mouse Look Controller
 * ═══════════════════════════════════════════════════════════ */

function MouseLook({ isLocked }: { isLocked: boolean }) {
  const { camera, gl } = useThree();
  const euler = useRef(new THREE.Euler(0, 0, 0, 'YXZ'));

  useEffect(() => {
    if (!isLocked) return;

    euler.current.setFromQuaternion(camera.quaternion);

    const onMouseMove = (e: MouseEvent) => {
      const sensitivity = 0.002;
      euler.current.y -= e.movementX * sensitivity;
      euler.current.x -= e.movementY * sensitivity;
      euler.current.x = Math.max(-Math.PI / 2 + 0.01, Math.min(Math.PI / 2 - 0.01, euler.current.x));
      camera.quaternion.setFromEuler(euler.current);
    };

    const canvas = gl.domElement;
    canvas.addEventListener('mousemove', onMouseMove);
    return () => canvas.removeEventListener('mousemove', onMouseMove);
  }, [isLocked, camera, gl]);

  return null;
}

/* ═══════════════════════════════════════════════════════════
 *  Lighting
 * ═══════════════════════════════════════════════════════════ */

function WorldLighting() {
  return (
    <>
      <ambientLight intensity={0.8} color="#ffffff" />
      <hemisphereLight color="#aaccff" groundColor="#886644" intensity={0.5} />
      <directionalLight
        position={[50, 80, 50]}
        intensity={1.4}
        color="#ffffff"
        castShadow={false}
      />
      <directionalLight position={[-30, 40, -30]} intensity={0.6} color="#ffffff" />
      <directionalLight position={[0, -20, 20]} intensity={0.3} color="#ffffff" />
    </>
  );
}

/* ═══════════════════════════════════════════════════════════
 *  Sky Gradient Background
 * ═══════════════════════════════════════════════════════════ */

function SkyGradient() {
  const meshRef = useRef<THREE.Mesh>(null);
  const { camera } = useThree();

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.position.copy(camera.position);
    }
  });

  const shaderMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {},
      vertexShader: `
        varying vec3 vWorldPosition;
        void main() {
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPosition.xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vWorldPosition;
        void main() {
          float h = normalize(vWorldPosition).y;
          vec3 skyTop = vec3(0.2, 0.35, 0.65);
          vec3 skyBottom = vec3(0.6, 0.75, 0.9);
          vec3 horizon = vec3(0.85, 0.75, 0.6);
          vec3 color;
          if (h > 0.0) {
            color = mix(horizon, skyTop, smoothstep(0.0, 0.5, h));
          } else {
            color = mix(horizon, skyBottom, smoothstep(0.0, -0.3, h));
          }
          gl_FragColor = vec4(color, 1.0);
        }
      `,
      side: THREE.BackSide,
      depthWrite: false,
    });
  }, []);

  return (
    <mesh ref={meshRef} material={shaderMaterial}>
      <sphereGeometry args={[500, 32, 32]} />
    </mesh>
  );
}

/* ═══════════════════════════════════════════════════════════
 *  Fog Effect
 * ═══════════════════════════════════════════════════════════ */

function FogEffect() {
  const { scene } = useThree();
  useEffect(() => {
    scene.fog = new THREE.FogExp2('#b0c8e0', 0.012);
    return () => { scene.fog = null; };
  }, [scene]);
  return null;
}

/* ═══════════════════════════════════════════════════════════
 *  Stats Display (Chunk Count, etc.)
 * ═══════════════════════════════════════════════════════════ */

interface OverlayStatsProps {
  seed: number;
  chunkCount: number;
  position: [number, number, number];
  biome: string;
}

function OverlayStats({ seed, chunkCount, position, biome }: OverlayStatsProps) {
  return (
    <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 font-mono text-[9px] sm:text-[10px] space-y-0.5 pointer-events-none select-none">
      <div className="text-retro-green/70">
        SEED: <span className="text-retro-green">{seed}</span>
      </div>
      <div className="text-retro-cyan/70">
        BIOME: <span className="text-retro-cyan">{biome}</span>
      </div>
      <div className="text-retro-gold/70">
        POS: <span className="text-retro-gold">{position[0].toFixed(0)}, {position[1].toFixed(0)}, {position[2].toFixed(0)}</span>
      </div>
      <div className="text-retro-purple/70">
        CHUNKS: <span className="text-retro-purple">{chunkCount}</span>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
 *  Camera Info Tracker
 * ═══════════════════════════════════════════════════════════ */

function CameraTracker({
  onUpdate,
  biomeNoise,
  tempNoise,
}: {
  onUpdate: (pos: [number, number, number], biome: string) => void;
  biomeNoise: ((x: number, y: number) => number) | null;
  tempNoise: ((x: number, y: number) => number) | null;
}) {
  const { camera } = useThree();
  const lastUpdate = useRef(0);

  useFrame(({ clock }) => {
    if (clock.getElapsedTime() - lastUpdate.current < 0.2) return;
    lastUpdate.current = clock.getElapsedTime();

    const pos: [number, number, number] = [camera.position.x, camera.position.y, camera.position.z];

    let biome = 'Unknown';
    if (biomeNoise && tempNoise) {
      const wx = camera.position.x / VOXEL_SIZE;
      const wz = camera.position.z / VOXEL_SIZE;
      biome = BIOMES[getBiome(biomeNoise, tempNoise, wx, wz)].name;
    }

    onUpdate(pos, biome);
  });

  return null;
}

/* ═══════════════════════════════════════════════════════════
 *  Main Procedural Terrain Component
 * ═══════════════════════════════════════════════════════════ */

export default function ProceduralTerrain() {
  const [seed, setSeed] = useState(42);
  const [renderDistance, setRenderDistance] = useState(RENDER_DISTANCE);
  const [isLocked, setIsLocked] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [cameraPos, setCameraPos] = useState<[number, number, number]>([0, 12, 20]);
  const [currentBiome, setCurrentBiome] = useState('Plains');
  const [chunkCount, setChunkCount] = useState(0);
  const [seedInput, setSeedInput] = useState('42');
  const [flySpeed, setFlySpeed] = useState(12);

  const keysRef = useRef<Set<string>>(new Set());
  const speedRef = useRef(flySpeed);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Track noise functions for biome display
  const [noises, setNoises] = useState<{
    biome: ((x: number, y: number) => number) | null;
    temp: ((x: number, y: number) => number) | null;
  }>({ biome: null, temp: null });

  useEffect(() => {
    speedRef.current = flySpeed;
  }, [flySpeed]);

  // Recreate noise references when seed changes
  useEffect(() => {
    setNoises({
      biome: createNoise2D(seed + 2),
      temp: createNoise2D(seed + 3),
    });
  }, [seed]);

  // Keyboard handlers
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      // Prevent default for game keys
      if (['w', 'a', 's', 'd', ' ', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(e.key.toLowerCase())) {
        e.preventDefault();
      }
      keysRef.current.add(e.key.toLowerCase());
    };
    const onKeyUp = (e: KeyboardEvent) => {
      keysRef.current.delete(e.key.toLowerCase());
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  // Pointer lock
  const requestPointerLock = useCallback(() => {
    const canvas = canvasRef.current?.querySelector('canvas');
    if (canvas) {
      canvas.requestPointerLock();
    }
  }, []);

  useEffect(() => {
    const onLockChange = () => {
      setIsLocked(!!document.pointerLockElement);
    };
    document.addEventListener('pointerlockchange', onLockChange);
    return () => document.removeEventListener('pointerlockchange', onLockChange);
  }, []);

  const handleCameraUpdate = useCallback((pos: [number, number, number], biome: string) => {
    setCameraPos(pos);
    setCurrentBiome(biome);
  }, []);

  const generateNewSeed = useCallback(() => {
    const newSeed = Math.floor(Math.random() * 999999);
    setSeed(newSeed);
    setSeedInput(String(newSeed));
  }, []);

  const applySeed = useCallback(() => {
    const parsed = parseInt(seedInput, 10);
    if (!isNaN(parsed)) {
      setSeed(parsed);
    }
  }, [seedInput]);

  // Track chunk count
  const handleChunkCount = useCallback((count: number) => {
    setChunkCount(count);
  }, []);

  return (
    <div className="relative w-full h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-4rem)] overflow-hidden bg-black">
      {/* ── Hero Overlay ── */}
      {showControls && !isLocked && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center pointer-events-none">
          {/* Title */}
          <div className="text-center pointer-events-auto mb-4 sm:mb-6">
            <h1 className="font-pixel text-lg sm:text-2xl md:text-3xl lg:text-4xl text-retro-green text-glow mb-2 sm:mb-3 drop-shadow-lg">
              PROCEDURAL WORLDS
            </h1>
            <p className="font-pixel text-[8px] sm:text-[10px] md:text-xs text-retro-purple/80 mb-1 drop-shadow">
              @pxlkit/voxel — Coming Soon
            </p>
            <p className="text-retro-muted/70 text-[10px] sm:text-xs md:text-sm max-w-md mx-auto px-4 leading-relaxed">
              Infinite procedural voxel worlds with dynamic biomes, chunk loading, and frustum culling.
              <span className="text-retro-gold font-bold"> Click to fly.</span>
            </p>
          </div>

          {/* Controls Panel */}
          <div className="pointer-events-auto bg-retro-bg/80 backdrop-blur-md border border-retro-border/50 rounded-xl p-3 sm:p-4 md:p-5 max-w-sm w-[calc(100%-2rem)] space-y-3 sm:space-y-4 shadow-xl">
            {/* Seed Input */}
            <div className="space-y-1.5">
              <label className="font-pixel text-[8px] sm:text-[9px] text-retro-green/80 uppercase tracking-wider">World Seed</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={seedInput}
                  onChange={(e) => setSeedInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && applySeed()}
                  className="flex-1 bg-retro-surface/80 border border-retro-border/50 rounded px-2 sm:px-3 py-1.5 font-mono text-xs sm:text-sm text-retro-text focus:border-retro-green/60 focus:outline-none transition-colors"
                  placeholder="Enter seed..."
                />
                <button
                  onClick={applySeed}
                  className="px-2 sm:px-3 py-1.5 bg-retro-green/20 hover:bg-retro-green/30 border border-retro-green/50 rounded font-pixel text-[8px] sm:text-[9px] text-retro-green transition-all cursor-pointer"
                >
                  GO
                </button>
              </div>
            </div>

            {/* Random Seed */}
            <button
              onClick={generateNewSeed}
              className="w-full py-2 bg-retro-purple/20 hover:bg-retro-purple/30 border border-retro-purple/50 rounded font-pixel text-[8px] sm:text-[9px] text-retro-purple transition-all cursor-pointer"
            >
              🎲 RANDOM WORLD
            </button>

            {/* Render Distance Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="font-pixel text-[8px] sm:text-[9px] text-retro-cyan/80 uppercase tracking-wider">Render Distance</label>
                <span className="font-mono text-[9px] sm:text-[10px] text-retro-cyan">{renderDistance} chunks</span>
              </div>
              <input
                type="range"
                min={2}
                max={10}
                value={renderDistance}
                onChange={(e) => setRenderDistance(Number(e.target.value))}
                className="w-full accent-retro-cyan h-1 bg-retro-surface/80 rounded-full appearance-none cursor-pointer"
              />
            </div>

            {/* Speed Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="font-pixel text-[8px] sm:text-[9px] text-retro-gold/80 uppercase tracking-wider">Fly Speed</label>
                <span className="font-mono text-[9px] sm:text-[10px] text-retro-gold">{flySpeed}</span>
              </div>
              <input
                type="range"
                min={4}
                max={40}
                value={flySpeed}
                onChange={(e) => setFlySpeed(Number(e.target.value))}
                className="w-full accent-retro-gold h-1 bg-retro-surface/80 rounded-full appearance-none cursor-pointer"
              />
            </div>

            {/* Start Button */}
            <button
              onClick={requestPointerLock}
              className="w-full py-2.5 sm:py-3 bg-retro-green/20 hover:bg-retro-green/30 border-2 border-retro-green/60 rounded-lg font-pixel text-[9px] sm:text-[10px] md:text-xs text-retro-green transition-all cursor-pointer hover:shadow-[0_0_20px_rgba(74,222,128,0.2)]"
            >
              ▶ CLICK TO EXPLORE
            </button>

            {/* Controls hint */}
            <div className="text-center space-y-0.5">
              <p className="font-mono text-[8px] sm:text-[9px] text-retro-muted/50">
                WASD / Arrows = Move · Space = Up · Shift = Down
              </p>
              <p className="font-mono text-[8px] sm:text-[9px] text-retro-muted/50">
                Mouse = Look · ESC = Release cursor
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Locked Overlay (minimal HUD) ── */}
      {isLocked && (
        <>
          {/* Crosshair */}
          <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
            <div className="w-4 h-4 sm:w-5 sm:h-5 relative opacity-40">
              <div className="absolute top-1/2 left-0 right-0 h-px bg-white" />
              <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white" />
            </div>
          </div>

          {/* Mini stats */}
          <OverlayStats
            seed={seed}
            chunkCount={chunkCount}
            position={cameraPos}
            biome={currentBiome}
          />

          {/* ESC hint */}
          <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 pointer-events-none">
            <span className="font-pixel text-[7px] sm:text-[8px] text-retro-muted/40 bg-retro-bg/40 px-2 py-1 rounded border border-retro-border/20">
              ESC to release
            </span>
          </div>
        </>
      )}

      {/* ── Settings toggle when locked ── */}
      {!isLocked && !showControls && (
        <button
          onClick={() => setShowControls(true)}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 p-2 bg-retro-bg/80 border border-retro-border/50 rounded font-pixel text-[9px] text-retro-muted hover:text-retro-green transition-all cursor-pointer"
        >
          ⚙ Settings
        </button>
      )}

      {/* ── Three.js Canvas ── */}
      <div ref={canvasRef} className="w-full h-full">
        <Canvas
          camera={{ fov: 65, near: 0.1, far: 300 }}
          dpr={[1, 1.5]}
          gl={{ antialias: true, toneMapping: THREE.NoToneMapping }}
          style={{ background: '#1a2a3a' }}
        >
          <SkyGradient />
          <FogEffect />
          <WorldLighting />
          <FlyCamera keysRef={keysRef} speedRef={speedRef} />
          <MouseLook isLocked={isLocked} />
          <ChunkManagerWithCounter seed={seed} renderDistance={renderDistance} onChunkCount={handleChunkCount} />
          <CameraTracker onUpdate={handleCameraUpdate} biomeNoise={noises.biome} tempNoise={noises.temp} />
        </Canvas>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
 *  Chunk Manager wrapper that reports count
 * ═══════════════════════════════════════════════════════════ */

function ChunkManagerWithCounter({
  seed,
  renderDistance,
  onChunkCount,
}: {
  seed: number;
  renderDistance: number;
  onChunkCount: (count: number) => void;
}) {
  const { camera } = useThree();
  const chunkCache = useRef<Map<string, ChunkVoxelData>>(new Map());
  const [visibleChunks, setVisibleChunks] = useState<Map<string, ChunkVoxelData>>(new Map());
  const lastCameraChunk = useRef<string>('');
  const frustum = useRef(new THREE.Frustum());
  const projScreenMatrix = useRef(new THREE.Matrix4());

  const noises = useMemo(() => ({
    height: createNoise2D(seed),
    detail: createNoise2D(seed + 1),
    biome: createNoise2D(seed + 2),
    temp: createNoise2D(seed + 3),
    tree: createNoise2D(seed + 4),
  }), [seed]);

  useEffect(() => {
    chunkCache.current.clear();
    setVisibleChunks(new Map());
    lastCameraChunk.current = '';
  }, [seed]);

  useFrame(() => {
    const [ccx, ccz] = worldToChunk(camera.position.x, camera.position.z);
    const currentKey = `${ccx},${ccz}`;

    if (currentKey === lastCameraChunk.current) return;
    lastCameraChunk.current = currentKey;

    projScreenMatrix.current.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
    frustum.current.setFromProjectionMatrix(projScreenMatrix.current);

    const newVisible = new Map<string, ChunkVoxelData>();
    const chunkWorldSize = CHUNK_SIZE * VOXEL_SIZE;

    for (let dx = -renderDistance; dx <= renderDistance; dx++) {
      for (let dz = -renderDistance; dz <= renderDistance; dz++) {
        if (dx * dx + dz * dz > renderDistance * renderDistance) continue;

        const cx = ccx + dx;
        const cz = ccz + dz;
        const key = chunkKey(cx, cz);

        const minX = cx * chunkWorldSize;
        const minZ = cz * chunkWorldSize;
        const bbox = new THREE.Box3(
          new THREE.Vector3(minX, 0, minZ),
          new THREE.Vector3(minX + chunkWorldSize, MAX_HEIGHT * VOXEL_SIZE, minZ + chunkWorldSize),
        );

        if (!frustum.current.intersectsBox(bbox)) continue;

        let data = chunkCache.current.get(key);
        if (!data) {
          data = generateChunkData(cx, cz, noises.height, noises.detail, noises.biome, noises.temp, noises.tree);
          chunkCache.current.set(key, data);
        }

        newVisible.set(key, data);
      }
    }

    // Memory management — prune distant chunks
    const maxCache = (renderDistance * 2 + 2) ** 2;
    if (chunkCache.current.size > maxCache * 2) {
      const toDelete: string[] = [];
      for (const [key] of chunkCache.current) {
        const parts = key.split(',');
        const kx = Number(parts[0]);
        const kz = Number(parts[1]);
        if ((kx - ccx) ** 2 + (kz - ccz) ** 2 > (renderDistance * 2) ** 2) {
          toDelete.push(key);
        }
      }
      for (const k of toDelete) chunkCache.current.delete(k);
    }

    setVisibleChunks(newVisible);
    onChunkCount(newVisible.size);
  });

  const entries = useMemo(() => Array.from(visibleChunks.entries()), [visibleChunks]);

  return (
    <>
      {entries.map(([key, data]) => (
        <ChunkMesh key={key} data={data} />
      ))}
    </>
  );
}

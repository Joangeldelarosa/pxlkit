'use client';

import { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float } from '@react-three/drei';
import * as THREE from 'three';
import { VoxelBomb } from '@pxlkit/voxel';

/* ═══════════════════════════════════════════════════
 *  Voxel Model — Instanced cubes from PxlKitData
 * ═══════════════════════════════════════════════════ */

interface VoxelModelProps {
  grid: string[];
  palette: Record<string, string>;
  position?: [number, number, number];
  cubeSize?: number;
}

function VoxelModel({ grid, palette, position = [0, 0, 0], cubeSize = 1 }: VoxelModelProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);

  const { count, matrices, colors } = useMemo(() => {
    const tempMatrices: THREE.Matrix4[] = [];
    const tempColors: THREE.Color[] = [];
    const size = grid.length;
    const halfSize = (size * cubeSize) / 2;

    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        const char = grid[row]?.[col];
        if (!char || char === '.') continue;
        const hex = palette[char];
        if (!hex) continue;

        const matrix = new THREE.Matrix4();
        matrix.setPosition(
          col * cubeSize - halfSize + cubeSize / 2,
          (size - 1 - row) * cubeSize - halfSize + cubeSize / 2,
          0,
        );
        tempMatrices.push(matrix);
        tempColors.push(new THREE.Color(hex));
      }
    }
    return { count: tempMatrices.length, matrices: tempMatrices, colors: tempColors };
  }, [grid, palette, cubeSize]);

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

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]} position={position} castShadow receiveShadow>
      <boxGeometry args={[cubeSize * 0.92, cubeSize * 0.92, cubeSize * 0.92]} />
      <meshStandardMaterial
        vertexColors
        roughness={0.65}
        metalness={0.05}
      />
    </instancedMesh>
  );
}

/* ═══════════════════════════════════════════════════
 *  Floating Island — Grass + Dirt layers
 * ═══════════════════════════════════════════════════ */

interface IslandProps {
  width?: number;
  depth?: number;
  position?: [number, number, number];
  cubeSize?: number;
}

function FloatingIsland({ width = 28, depth = 28, position = [0, 0, 0], cubeSize = 1 }: IslandProps) {
  const grassRef = useRef<THREE.InstancedMesh>(null);
  const dirtRef = useRef<THREE.InstancedMesh>(null);
  const deepDirtRef = useRef<THREE.InstancedMesh>(null);
  const stoneRef = useRef<THREE.InstancedMesh>(null);

  const { grass, dirt, deepDirt, stone } = useMemo(() => {
    const grassCubes: THREE.Matrix4[] = [];
    const dirtCubes: THREE.Matrix4[] = [];
    const deepDirtCubes: THREE.Matrix4[] = [];
    const stoneCubes: THREE.Matrix4[] = [];

    const halfW = (width * cubeSize) / 2;
    const halfD = (depth * cubeSize) / 2;
    const centerX = width / 2;
    const centerZ = depth / 2;
    const maxRadius = Math.min(width, depth) / 2;

    for (let x = 0; x < width; x++) {
      for (let z = 0; z < depth; z++) {
        const dx = x - centerX + 0.5;
        const dz = z - centerZ + 0.5;
        const dist = Math.sqrt(dx * dx + dz * dz);

        // Organic island shape with noise
        const noise = Math.sin(x * 0.8) * 0.7 + Math.cos(z * 0.6) * 0.7 + Math.sin((x + z) * 0.4) * 0.5;
        const effectiveRadius = maxRadius - 1.5 + noise;

        if (dist > effectiveRadius) continue;

        // How deep this column goes (deeper in center, shallow at edges)
        const edgeFactor = 1 - dist / effectiveRadius;
        const columnDepth = Math.max(1, Math.floor(edgeFactor * 5.5) + 1);

        const posX = x * cubeSize - halfW + cubeSize / 2;
        const posZ = z * cubeSize - halfD + cubeSize / 2;

        // Grass layer (top)
        const grassMatrix = new THREE.Matrix4();
        grassMatrix.setPosition(posX, 0, posZ);
        grassCubes.push(grassMatrix);

        // Dirt layers
        for (let layer = 1; layer < columnDepth; layer++) {
          const m = new THREE.Matrix4();
          m.setPosition(posX, -layer * cubeSize, posZ);
          if (layer <= 2) {
            dirtCubes.push(m);
          } else if (layer <= 4) {
            deepDirtCubes.push(m);
          } else {
            stoneCubes.push(m);
          }
        }
      }
    }

    return {
      grass: grassCubes,
      dirt: dirtCubes,
      deepDirt: deepDirtCubes,
      stone: stoneCubes,
    };
  }, [width, depth, cubeSize]);

  // Apply instance matrices
  useEffect(() => {
    const refs = [
      { ref: grassRef, data: grass },
      { ref: dirtRef, data: dirt },
      { ref: deepDirtRef, data: deepDirt },
      { ref: stoneRef, data: stone },
    ];

    for (const { ref, data } of refs) {
      const mesh = ref.current;
      if (!mesh || data.length === 0) continue;
      for (let i = 0; i < data.length; i++) {
        mesh.setMatrixAt(i, data[i]);
      }
      mesh.instanceMatrix.needsUpdate = true;
    }
  }, [grass, dirt, deepDirt, stone]);

  const geoArgs: [number, number, number] = [cubeSize * 0.98, cubeSize * 0.98, cubeSize * 0.98];

  return (
    <group position={position}>
      {/* Grass */}
      {grass.length > 0 && (
        <instancedMesh ref={grassRef} args={[undefined, undefined, grass.length]} castShadow receiveShadow>
          <boxGeometry args={geoArgs} />
          <meshStandardMaterial color="#4ade80" roughness={0.8} metalness={0} />
        </instancedMesh>
      )}
      {/* Dirt */}
      {dirt.length > 0 && (
        <instancedMesh ref={dirtRef} args={[undefined, undefined, dirt.length]} castShadow receiveShadow>
          <boxGeometry args={geoArgs} />
          <meshStandardMaterial color="#92400e" roughness={0.9} metalness={0} />
        </instancedMesh>
      )}
      {/* Deep Dirt */}
      {deepDirt.length > 0 && (
        <instancedMesh ref={deepDirtRef} args={[undefined, undefined, deepDirt.length]} castShadow receiveShadow>
          <boxGeometry args={geoArgs} />
          <meshStandardMaterial color="#78350f" roughness={0.95} metalness={0} />
        </instancedMesh>
      )}
      {/* Stone */}
      {stone.length > 0 && (
        <instancedMesh ref={stoneRef} args={[undefined, undefined, stone.length]} castShadow receiveShadow>
          <boxGeometry args={geoArgs} />
          <meshStandardMaterial color="#57534e" roughness={1} metalness={0.1} />
        </instancedMesh>
      )}
    </group>
  );
}

/* ═══════════════════════════════════════════════════
 *  Fuse Spark — Glowing animated point light
 * ═══════════════════════════════════════════════════ */

function FuseSpark({ position }: { position: [number, number, number] }) {
  const lightRef = useRef<THREE.PointLight>(null);
  const sparkRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const pulse = 0.6 + Math.sin(t * 8) * 0.4;
    if (lightRef.current) {
      lightRef.current.intensity = pulse * 3;
    }
    if (sparkRef.current) {
      sparkRef.current.scale.setScalar(0.3 + pulse * 0.3);
    }
  });

  return (
    <group position={position}>
      <pointLight ref={lightRef} color="#FFD700" intensity={2} distance={12} decay={2} />
      <mesh ref={sparkRef}>
        <sphereGeometry args={[0.4, 8, 8]} />
        <meshBasicMaterial color="#FFD700" transparent opacity={0.9} />
      </mesh>
    </group>
  );
}

/* ═══════════════════════════════════════════════════
 *  Auto-Rotating Group
 * ═══════════════════════════════════════════════════ */

function AutoRotate({ children, speed = 0.15 }: { children: React.ReactNode; speed?: number }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * speed;
    }
  });

  return <group ref={groupRef}>{children}</group>;
}

/* ═══════════════════════════════════════════════════
 *  Particle Sparkles — Floating embers around the bomb
 * ═══════════════════════════════════════════════════ */

function Sparkles({ count = 30, range = 18 }: { count?: number; range?: number }) {
  const ref = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * range;
      pos[i * 3 + 1] = Math.random() * range * 0.5 + 2;
      pos[i * 3 + 2] = (Math.random() - 0.5) * range;
    }
    return pos;
  }, [count, range]);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    return geo;
  }, [positions]);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    const geo = ref.current.geometry;
    const posAttr = geo.getAttribute('position') as THREE.BufferAttribute;
    for (let i = 0; i < count; i++) {
      const idx = i * 3;
      posAttr.array[idx + 1] += Math.sin(t * 0.5 + i) * 0.01;
      if (posAttr.array[idx + 1] > range * 0.6) {
        posAttr.array[idx + 1] = -1;
      }
    }
    posAttr.needsUpdate = true;
  });

  return (
    <points ref={ref} geometry={geometry}>
      <pointsMaterial color="#FFD700" size={0.2} transparent opacity={0.6} sizeAttenuation />
    </points>
  );
}

/* ═══════════════════════════════════════════════════
 *  Main Scene
 * ═══════════════════════════════════════════════════ */

function VoxelScene() {
  const bombGrid = VoxelBomb.grid;
  const bombPalette = VoxelBomb.palette;

  // Position the bomb to sit on top of the island
  // Island grass top is at y=0, bomb center at ~half its height above
  const bombYOffset = 2.5;

  return (
    <>
      {/* Camera controls — limited orbit */}
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 2.2}
        autoRotate
        autoRotateSpeed={0.5}
      />

      {/* Lighting */}
      <ambientLight intensity={0.35} color="#c4b5fd" />
      <hemisphereLight
        color="#87ceeb"
        groundColor="#4ade80"
        intensity={0.4}
      />
      <directionalLight
        position={[15, 25, 10]}
        intensity={1.2}
        color="#fff5e6"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-far={80}
        shadow-camera-left={-25}
        shadow-camera-right={25}
        shadow-camera-top={25}
        shadow-camera-bottom={-25}
      />
      <directionalLight
        position={[-10, 8, -10]}
        intensity={0.3}
        color="#a78bfa"
      />

      {/* Fog for atmosphere */}
      <fog attach="fog" args={['#0d1117', 30, 80]} />

      {/* Scene content */}
      <AutoRotate speed={0.12}>
        {/* Floating island */}
        <FloatingIsland
          width={26}
          depth={26}
          position={[0, -3, 0]}
          cubeSize={0.85}
        />

        {/* Bomb model — floating with bobbing animation */}
        <Float
          speed={1.5}
          rotationIntensity={0.1}
          floatIntensity={1.2}
          floatingRange={[-0.3, 0.3]}
        >
          <VoxelModel
            grid={bombGrid}
            palette={bombPalette}
            position={[0, bombYOffset, 0]}
            cubeSize={0.5}
          />
          {/* Fuse spark glow */}
          <FuseSpark position={[3.5, bombYOffset + 8.5, 0]} />
        </Float>

        {/* Floating sparkle particles */}
        <Sparkles count={25} range={16} />
      </AutoRotate>
    </>
  );
}

/* ═══════════════════════════════════════════════════
 *  Exported Canvas Wrapper
 * ═══════════════════════════════════════════════════ */

export default function VoxelPreview() {
  return (
    <div className="w-full h-full relative">
      <Canvas
        camera={{
          position: [0, 12, 28],
          fov: 42,
          near: 0.1,
          far: 100,
        }}
        shadows
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <VoxelScene />
      </Canvas>
    </div>
  );
}

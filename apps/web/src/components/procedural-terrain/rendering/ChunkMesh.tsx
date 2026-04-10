/* ═══════════════════════════════════════════════════════════════
 *  Rendering — ChunkMesh & FloatingPickup
 *
 *  Water uses a SINGLE flat plane per chunk at the water surface level.
 *  This eliminates all grid seams between water voxels.
 *  Underwater side voxels are still rendered as instanced boxes.
 * ═══════════════════════════════════════════════════════════════ */
'use client';

import { useRef, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { ChunkVoxelData } from '../types';
import { VOXEL_SIZE, CHUNK_SIZE } from '../constants';
import { getPickupIcons } from '../generation/chunk';

/* Shared geometry & materials */
const sharedGeo = new THREE.BoxGeometry(VOXEL_SIZE, VOXEL_SIZE, VOXEL_SIZE);
const sharedSolidMat = new THREE.MeshStandardMaterial({ roughness: 0.7 });

/* Water surface plane: covers the entire chunk + slight overlap (2%) for seamless tiling.
 * A single PlaneGeometry per chunk at the water level → NO grid lines ever. */
const WATER_PLANE_OVERLAP = 1.02;   // 2% overlap to hide chunk boundaries
const chunkWorldSize = CHUNK_SIZE * VOXEL_SIZE;
const waterPlaneGeo = new THREE.PlaneGeometry(
  chunkWorldSize * WATER_PLANE_OVERLAP,
  chunkWorldSize * WATER_PLANE_OVERLAP,
);
waterPlaneGeo.rotateX(-Math.PI / 2); // make horizontal

const sharedWaterPlaneMat = new THREE.MeshStandardMaterial({
  roughness: 0.08, metalness: 0.2,
  transparent: true, opacity: 0.55,
  depthWrite: false,
  side: THREE.DoubleSide,
});

/* Underwater side/bottom voxels still use instanced cubes */
const sharedWaterVoxelGeo = new THREE.BoxGeometry(VOXEL_SIZE, VOXEL_SIZE, VOXEL_SIZE);
const sharedWaterVoxelMat = new THREE.MeshStandardMaterial({
  roughness: 0.15, metalness: 0.1, transparent: true, opacity: 0.4,
  depthWrite: false,
});

export function ChunkMesh({ data }: { data: ChunkVoxelData }) {
  const solidRef = useRef<THREE.InstancedMesh>(null);
  const waterVoxelRef = useRef<THREE.InstancedMesh>(null);
  const waterPlaneRef = useRef<THREE.Mesh>(null);

  /* ── Separate water voxels into surface (skip) and underwater (keep) ── */
  const underwaterData = useMemo(() => {
    if (data.waterCount === 0 || !data.hasWater) return null;
    const surfaceY = data.waterSurfaceLevel * VOXEL_SIZE;
    const threshold = VOXEL_SIZE * 0.1; // tolerance
    // Filter: keep only non-surface water voxels (underwater sides/depths)
    const positions: number[] = [];
    const colors: number[] = [];
    for (let i = 0; i < data.waterCount; i++) {
      const i3 = i * 3;
      const vy = data.waterPositions[i3 + 1];
      // Skip the top surface layer — that's rendered by the plane
      if (Math.abs(vy - surfaceY) < threshold) continue;
      positions.push(data.waterPositions[i3], data.waterPositions[i3 + 1], data.waterPositions[i3 + 2]);
      colors.push(data.waterColors[i3], data.waterColors[i3 + 1], data.waterColors[i3 + 2]);
    }
    return { positions: new Float32Array(positions), colors: new Float32Array(colors), count: positions.length / 3 };
  }, [data]);

  /* ── Water plane material (cloned per chunk for unique biome color) ── */
  const waterPlaneMat = useMemo(() => {
    const mat = sharedWaterPlaneMat.clone();
    if (data.hasWater && data.waterSurfaceColor) {
      mat.color.set(data.waterSurfaceColor);
    }
    return mat;
  }, [data.hasWater, data.waterSurfaceColor]);

  useEffect(() => {
    const mesh = solidRef.current;
    if (!mesh || data.count === 0) return;
    const m = new THREE.Matrix4(), c = new THREE.Color();
    for (let i = 0; i < data.count; i++) {
      const i3 = i * 3;
      m.identity(); m.elements[12] = data.positions[i3]; m.elements[13] = data.positions[i3 + 1]; m.elements[14] = data.positions[i3 + 2];
      mesh.setMatrixAt(i, m);
      c.setRGB(data.colors[i3], data.colors[i3 + 1], data.colors[i3 + 2]);
      mesh.setColorAt(i, c);
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [data]);

  /* ── Underwater voxel instances ── */
  useEffect(() => {
    const mesh = waterVoxelRef.current;
    if (!mesh || !underwaterData || underwaterData.count === 0) return;
    const m = new THREE.Matrix4(), c = new THREE.Color();
    for (let i = 0; i < underwaterData.count; i++) {
      const i3 = i * 3;
      m.identity(); m.elements[12] = underwaterData.positions[i3]; m.elements[13] = underwaterData.positions[i3 + 1]; m.elements[14] = underwaterData.positions[i3 + 2];
      mesh.setMatrixAt(i, m);
      c.setRGB(underwaterData.colors[i3], underwaterData.colors[i3 + 1], underwaterData.colors[i3 + 2]);
      mesh.setColorAt(i, c);
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [underwaterData]);

  /* ── Water surface plane: position at chunk center, water level Y ── */
  useEffect(() => {
    const plane = waterPlaneRef.current;
    if (!plane || !data.hasWater || data.waterSurfaceLevel < 0) return;
    const chunkCenterX = (data.chunkX * CHUNK_SIZE + CHUNK_SIZE / 2) * VOXEL_SIZE;
    const chunkCenterZ = (data.chunkZ * CHUNK_SIZE + CHUNK_SIZE / 2) * VOXEL_SIZE;
    // Place plane at top of water level + small offset to avoid z-fighting with terrain
    const planeY = (data.waterSurfaceLevel + 0.5) * VOXEL_SIZE + 0.01;
    plane.position.set(chunkCenterX, planeY, chunkCenterZ);
  }, [data]);

  return (
    <group>
      {data.count > 0 && <instancedMesh ref={solidRef} args={[sharedGeo, sharedSolidMat, data.count]} frustumCulled={false} />}
      {data.hasWater && data.waterSurfaceLevel >= 0 && (
        <mesh ref={waterPlaneRef} geometry={waterPlaneGeo} material={waterPlaneMat} frustumCulled={false} />
      )}
      {underwaterData && underwaterData.count > 0 && (
        <instancedMesh ref={waterVoxelRef} args={[sharedWaterVoxelGeo, sharedWaterVoxelMat, underwaterData.count]} frustumCulled={false} />
      )}
    </group>
  );
}

/* ── Floating Icon Pickup ── */

const pickupPxSize = VOXEL_SIZE * 0.18;
const pickupGeo = new THREE.BoxGeometry(pickupPxSize, pickupPxSize, pickupPxSize * 0.3);
const pickupMat = new THREE.MeshStandardMaterial({ roughness: 0.3, metalness: 0.1 });

export function FloatingPickup({ position, iconIdx }: { position: [number, number, number]; iconIdx: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const icons = getPickupIcons();
  const { voxels, icon } = icons[iconIdx % icons.length];
  const count = voxels.length;
  const baseY = useRef(position[1]);

  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh || count === 0) return;
    const m = new THREE.Matrix4(), c = new THREE.Color();
    const hs = icon.size / 2;
    for (let i = 0; i < count; i++) {
      const v = voxels[i];
      m.identity(); m.elements[12] = (v.x - hs) * pickupPxSize; m.elements[13] = (v.y - hs) * pickupPxSize; m.elements[14] = 0;
      mesh.setMatrixAt(i, m);
      c.set(v.color); mesh.setColorAt(i, c);
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [count, voxels, icon.size]);

  useFrame(({ clock }) => {
    const g = groupRef.current; if (!g) return;
    const t = clock.getElapsedTime();
    g.rotation.y = t * 1.2;
    g.position.y = baseY.current + Math.sin(t * 2) * 0.3;
  });

  return (
    <group ref={groupRef} position={position}>
      {count > 0 && <instancedMesh ref={meshRef} args={[pickupGeo, pickupMat, count]} />}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.4, 0]}>
        <ringGeometry args={[0.3, 0.5, 16]} />
        <meshBasicMaterial color="#ffdd44" transparent opacity={0.25} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

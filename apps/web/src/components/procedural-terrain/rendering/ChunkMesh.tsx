/* ═══════════════════════════════════════════════════════════════
 *  Rendering — ChunkMesh & FloatingPickup
 * ═══════════════════════════════════════════════════════════════ */
'use client';

import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { ChunkVoxelData } from '../types';
import { VOXEL_SIZE } from '../constants';
import { getPickupIcons } from '../generation/chunk';

/* Shared geometry & materials */
const sharedGeo = new THREE.BoxGeometry(VOXEL_SIZE, VOXEL_SIZE, VOXEL_SIZE);
const sharedSolidMat = new THREE.MeshStandardMaterial({ roughness: 0.7 });
/* Water uses a flat horizontal plane — no side faces means no z-fighting at chunk seams */
const sharedWaterGeo = (() => {
  const g = new THREE.PlaneGeometry(VOXEL_SIZE, VOXEL_SIZE);
  g.rotateX(-Math.PI / 2);
  return g;
})();
const sharedWaterMat = new THREE.MeshStandardMaterial({
  roughness: 0.2, metalness: 0.05, transparent: true, opacity: 0.6,
  depthWrite: false, side: THREE.DoubleSide,
});
/* Mini-voxel geometry for street furniture (lampposts, hydrants, etc.) — 15% of full voxel */
const MINI_VS = VOXEL_SIZE * 0.15;
const miniGeo = new THREE.BoxGeometry(MINI_VS, MINI_VS, MINI_VS);
const miniMat = new THREE.MeshStandardMaterial({ roughness: 0.5 });

/* Road paint geometry — paper-thin horizontal plane (1×1 base, scaled per instance) */
const paintGeo = (() => {
  const g = new THREE.PlaneGeometry(1, 1);
  g.rotateX(-Math.PI / 2); // lay flat on XZ plane
  return g;
})();
const paintMat = new THREE.MeshStandardMaterial({
  roughness: 0.85, metalness: 0, depthWrite: true,
  polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1,
});

export function ChunkMesh({ data }: { data: ChunkVoxelData }) {
  const solidRef = useRef<THREE.InstancedMesh>(null);
  const waterRef = useRef<THREE.InstancedMesh>(null);
  const miniRef = useRef<THREE.InstancedMesh>(null);
  const paintRef = useRef<THREE.InstancedMesh>(null);

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

  useEffect(() => {
    const mesh = waterRef.current;
    if (!mesh || data.waterCount === 0) return;
    const m = new THREE.Matrix4(), c = new THREE.Color();
    for (let i = 0; i < data.waterCount; i++) {
      const i3 = i * 3;
      m.identity(); m.elements[12] = data.waterPositions[i3]; m.elements[13] = data.waterPositions[i3 + 1]; m.elements[14] = data.waterPositions[i3 + 2];
      mesh.setMatrixAt(i, m);
      c.setRGB(data.waterColors[i3], data.waterColors[i3 + 1], data.waterColors[i3 + 2]);
      mesh.setColorAt(i, c);
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [data]);

  useEffect(() => {
    const mesh = miniRef.current;
    if (!mesh || data.miniVoxelCount === 0) return;
    const m = new THREE.Matrix4(), c = new THREE.Color();
    for (let i = 0; i < data.miniVoxelCount; i++) {
      const i3 = i * 3;
      m.identity();
      m.elements[12] = data.miniVoxelPositions[i3];
      m.elements[13] = data.miniVoxelPositions[i3 + 1];
      m.elements[14] = data.miniVoxelPositions[i3 + 2];
      mesh.setMatrixAt(i, m);
      c.setRGB(data.miniVoxelColors[i3], data.miniVoxelColors[i3 + 1], data.miniVoxelColors[i3 + 2]);
      mesh.setColorAt(i, c);
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [data]);

  /* ── Road paint: flat decals scaled per-instance ── */
  useEffect(() => {
    const mesh = paintRef.current;
    if (!mesh || data.paintCount === 0) return;
    const m = new THREE.Matrix4(), c = new THREE.Color();
    for (let i = 0; i < data.paintCount; i++) {
      const i3 = i * 3;
      const i2 = i * 2;
      const sx = data.paintScales[i2];      // width in X
      const sz = data.paintScales[i2 + 1];  // width in Z
      // PlaneGeometry is 1×1 on XZ after rotation, scale to desired size
      m.makeScale(sx, 1, sz);
      m.elements[12] = data.paintPositions[i3];
      m.elements[13] = data.paintPositions[i3 + 1];
      m.elements[14] = data.paintPositions[i3 + 2];
      mesh.setMatrixAt(i, m);
      c.setRGB(data.paintColors[i3], data.paintColors[i3 + 1], data.paintColors[i3 + 2]);
      mesh.setColorAt(i, c);
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [data]);

  return (
    <group>
      {data.count > 0 && <instancedMesh ref={solidRef} args={[sharedGeo, sharedSolidMat, data.count]} frustumCulled={false} />}
      {data.waterCount > 0 && <instancedMesh ref={waterRef} args={[sharedWaterGeo, sharedWaterMat, data.waterCount]} frustumCulled={false} />}
      {data.miniVoxelCount > 0 && <instancedMesh ref={miniRef} args={[miniGeo, miniMat, data.miniVoxelCount]} frustumCulled={false} />}
      {data.paintCount > 0 && <instancedMesh ref={paintRef} args={[paintGeo, paintMat, data.paintCount]} frustumCulled={false} />}
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

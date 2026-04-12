/* ═══════════════════════════════════════════════════════════════
 *  Rendering — ChunkMesh & FloatingPickup
 *
 *  Uses plain MeshStandardMaterial (no shader modifications).
 *  Three.js's standard FogExp2 handles atmospheric distance haze.
 *
 *  Per-chunk fade-in:  new chunks animate Y-scale 0→1 ("rise from
 *  ground") over ~0.5s, plus distance-based fade controlled by
 *  chunkFadeStart / chunkFadeStrength config values.
 *
 *  Instance data is set up in useLayoutEffect (not useEffect) to
 *  avoid a 1-2 frame window where instances render at the world
 *  origin before positions are set.
 * ═══════════════════════════════════════════════════════════════ */
'use client';

import { useRef, useLayoutEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { ChunkVoxelData } from '../types';
import { VOXEL_SIZE, CHUNK_SIZE } from '../constants';
import { getPickupIcons } from '../generation/chunk';

/* Shared geometry & materials — plain, no shader mods */
const sharedGeo = new THREE.BoxGeometry(VOXEL_SIZE, VOXEL_SIZE, VOXEL_SIZE);
const sharedSolidMat = new THREE.MeshStandardMaterial({ roughness: 0.7 });
const sharedWaterGeo = (() => {
  const g = new THREE.PlaneGeometry(VOXEL_SIZE, VOXEL_SIZE);
  g.rotateX(-Math.PI / 2);
  return g;
})();
const sharedWaterMat = new THREE.MeshStandardMaterial({
  roughness: 0.2, metalness: 0.05, transparent: true, opacity: 0.6,
  depthWrite: false, side: THREE.DoubleSide,
});
const MINI_VS = VOXEL_SIZE * 0.15;
const miniGeo = new THREE.BoxGeometry(MINI_VS, MINI_VS, MINI_VS);
const miniMat = new THREE.MeshStandardMaterial({ roughness: 0.5 });
const paintGeo = (() => {
  const g = new THREE.PlaneGeometry(1, 1);
  g.rotateX(-Math.PI / 2);
  return g;
})();
const paintMat = new THREE.MeshStandardMaterial({
  roughness: 0.85, metalness: 0, depthWrite: true,
  polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1,
});

/* Chunk world-space size */
const CWS = CHUNK_SIZE * VOXEL_SIZE;

/* Fade-in animation duration (seconds) */
const FADE_IN_DURATION = 0.5;

export function ChunkMesh({
  data, renderDistance, chunkFadeStart, chunkFadeStrength,
}: {
  data: ChunkVoxelData;
  renderDistance: number;
  chunkFadeStart: number;
  chunkFadeStrength: number;
}) {
  const solidRef = useRef<THREE.InstancedMesh>(null);
  const waterRef = useRef<THREE.InstancedMesh>(null);
  const miniRef  = useRef<THREE.InstancedMesh>(null);
  const paintRef = useRef<THREE.InstancedMesh>(null);
  const groupRef = useRef<THREE.Group>(null);

  /* Birth-time fade: tracks how far along the fade-in we are (0→1) */
  const fadeProgress = useRef(0);

  /* Chunk centre in world-space (for distance fade) */
  const chunkCx = (data.chunkX + 0.5) * CWS;
  const chunkCz = (data.chunkZ + 0.5) * CWS;

  /* All instance data in useLayoutEffect — positions are correct
   * before the first render, preventing the "origin fog flash"
   * that occurred with useEffect (deferred). */
  useLayoutEffect(() => {
    const tmpM = new THREE.Matrix4(), tmpC = new THREE.Color();

    /* Solid voxels */
    const solidMesh = solidRef.current;
    if (solidMesh && data.count > 0) {
      for (let i = 0; i < data.count; i++) {
        const i3 = i * 3;
        tmpM.identity(); tmpM.elements[12] = data.positions[i3]; tmpM.elements[13] = data.positions[i3 + 1]; tmpM.elements[14] = data.positions[i3 + 2];
        solidMesh.setMatrixAt(i, tmpM);
        tmpC.setRGB(data.colors[i3], data.colors[i3 + 1], data.colors[i3 + 2]);
        solidMesh.setColorAt(i, tmpC);
      }
      solidMesh.instanceMatrix.needsUpdate = true;
      if (solidMesh.instanceColor) solidMesh.instanceColor.needsUpdate = true;
    }

    /* Water */
    const waterMesh = waterRef.current;
    if (waterMesh && data.waterCount > 0) {
      for (let i = 0; i < data.waterCount; i++) {
        const i3 = i * 3;
        tmpM.identity(); tmpM.elements[12] = data.waterPositions[i3]; tmpM.elements[13] = data.waterPositions[i3 + 1]; tmpM.elements[14] = data.waterPositions[i3 + 2];
        waterMesh.setMatrixAt(i, tmpM);
        tmpC.setRGB(data.waterColors[i3], data.waterColors[i3 + 1], data.waterColors[i3 + 2]);
        waterMesh.setColorAt(i, tmpC);
      }
      waterMesh.instanceMatrix.needsUpdate = true;
      if (waterMesh.instanceColor) waterMesh.instanceColor.needsUpdate = true;
    }

    /* Mini-voxels (street furniture) */
    const miniMesh = miniRef.current;
    if (miniMesh && data.miniVoxelCount > 0) {
      for (let i = 0; i < data.miniVoxelCount; i++) {
        const i3 = i * 3;
        tmpM.identity();
        tmpM.elements[12] = data.miniVoxelPositions[i3];
        tmpM.elements[13] = data.miniVoxelPositions[i3 + 1];
        tmpM.elements[14] = data.miniVoxelPositions[i3 + 2];
        miniMesh.setMatrixAt(i, tmpM);
        tmpC.setRGB(data.miniVoxelColors[i3], data.miniVoxelColors[i3 + 1], data.miniVoxelColors[i3 + 2]);
        miniMesh.setColorAt(i, tmpC);
      }
      miniMesh.instanceMatrix.needsUpdate = true;
      if (miniMesh.instanceColor) miniMesh.instanceColor.needsUpdate = true;
    }

    /* Road paint decals */
    const paintMesh = paintRef.current;
    if (paintMesh && data.paintCount > 0) {
      for (let i = 0; i < data.paintCount; i++) {
        const i3 = i * 3;
        const i2 = i * 2;
        const sx = data.paintScales[i2];
        const sz = data.paintScales[i2 + 1];
        tmpM.makeScale(sx, 1, sz);
        tmpM.elements[12] = data.paintPositions[i3];
        tmpM.elements[13] = data.paintPositions[i3 + 1];
        tmpM.elements[14] = data.paintPositions[i3 + 2];
        paintMesh.setMatrixAt(i, tmpM);
        tmpC.setRGB(data.paintColors[i3], data.paintColors[i3 + 1], data.paintColors[i3 + 2]);
        paintMesh.setColorAt(i, tmpC);
      }
      paintMesh.instanceMatrix.needsUpdate = true;
      if (paintMesh.instanceColor) paintMesh.instanceColor.needsUpdate = true;
    }
  }, [data]);

  /* ── Per-frame: fade-in animation + distance-based fade ── */
  useFrame(({ camera }, delta) => {
    const g = groupRef.current;
    if (!g) return;

    /* ── Birth fade-in (Y-scale 0→1) ── */
    /* Cap delta to 100ms so tab-switch or frame stutter doesn't
     * cause a single huge jump through the entire animation. */
    const dt = Math.min(0.1, delta);
    if (fadeProgress.current < 1) {
      fadeProgress.current = Math.min(1, fadeProgress.current + dt / FADE_IN_DURATION);
    }
    /* Smooth ease-out: 1 - (1-t)^2 */
    const eased = 1 - (1 - fadeProgress.current) * (1 - fadeProgress.current);

    /* ── Distance-based fade (smoothstep falloff) ── */
    const dx = camera.position.x - chunkCx;
    const dz = camera.position.z - chunkCz;
    const dist = Math.sqrt(dx * dx + dz * dz);
    const maxDist = renderDistance * CWS;
    let distFade = 1;
    if (maxDist > 0 && chunkFadeStrength > 0.01) {
      const normDist = Math.min(1, dist / maxDist);
      const fs = Math.max(0, Math.min(1, chunkFadeStart));
      if (normDist > fs) {
        const t = (normDist - fs) / (1 - fs);
        const ss = t * t * (3 - 2 * t); // smoothstep
        distFade = 1 - ss * Math.min(1, chunkFadeStrength);
      }
    }

    /* Combined: birth fade * distance fade */
    const combined = eased * distFade;
    g.scale.set(1, combined, 1);
    g.visible = combined > 0.01;
  });

  return (
    <group ref={groupRef} scale={[1, 0, 1]}>
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

  useLayoutEffect(() => {
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

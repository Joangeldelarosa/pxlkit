/* ═══════════════════════════════════════════════════════════════
 *  Night Window Lights — glowing windows on buildings at night
 *
 *  Uses registered window positions from chunk generation to render
 *  warm-colored emissive cubes that fade in at dusk and out at dawn.
 *  Each window has a deterministic on/off state and flicker pattern.
 * ═══════════════════════════════════════════════════════════════ */
'use client';

import { useRef, useMemo, useContext } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import type { ChunkVoxelData } from '../types';
import { VOXEL_SIZE, CHUNK_SIZE } from '../constants';
import { TimeContext } from './DayNightCycle';

const WIN_GEO = new THREE.BoxGeometry(VOXEL_SIZE * 0.95, VOXEL_SIZE * 0.95, VOXEL_SIZE * 0.95);

const WINDOW_LIT_PROBABILITY = 0.65;   // ~65% of windows lit at night
const FLICKER_HASH_THRESHOLD = 0.5;    // only windows with hash > this can flicker off
const FLICKER_OFF_THRESHOLD = -0.3;    // sin value below which flickering windows go dark
function winHash(x: number, y: number, z: number): number {
  let h = (Math.round(x * 100) * 374761393 + Math.round(y * 100) * 668265263 + Math.round(z * 100) * 1274126177) | 0;
  h = Math.imul(h ^ (h >>> 13), 1103515245);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

/** Warm window light colors */
const WARM_COLORS = [
  new THREE.Color('#ffdd88'),  // warm yellow
  new THREE.Color('#ffeebb'),  // bright warm
  new THREE.Color('#ffcc66'),  // golden
  new THREE.Color('#eebb55'),  // amber
  new THREE.Color('#88bbff'),  // cool blue (TV screen)
];

export function NightWindowLights({
  chunkCacheRef,
}: {
  chunkCacheRef: React.RefObject<Map<string, ChunkVoxelData>>;
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const timeRef = useContext(TimeContext);
  const { camera } = useThree();
  const maxInstances = 4000;
  const prevCount = useRef(0);

  const mat = useMemo(() => new THREE.MeshBasicMaterial({
    transparent: true,
    opacity: 0,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  }), []);

  useFrame(({ clock }) => {
    const mesh = meshRef.current;
    if (!mesh || !timeRef) return;

    const state = timeRef.current;
    const hour = state.hour;

    // Calculate night intensity: 0 during day, 1 at deep night
    let nightFactor = 0;
    if (hour >= 18 && hour < 19.5) {
      nightFactor = (hour - 18) / 1.5; // fade in during dusk
    } else if (hour >= 19.5 || hour < 5) {
      nightFactor = 1; // full night
    } else if (hour >= 5 && hour < 6.5) {
      nightFactor = 1 - (hour - 5) / 1.5; // fade out at dawn
    }

    if (nightFactor <= 0.01) {
      mat.opacity = 0;
      mesh.count = 0;
      if (mesh.instanceMatrix) mesh.instanceMatrix.needsUpdate = true;
      prevCount.current = 0;
      return;
    }

    mat.opacity = nightFactor * 0.85;

    // Gather windows from nearby chunks
    const cache = chunkCacheRef.current;
    if (!cache) return;

    const camCX = Math.floor(camera.position.x / (CHUNK_SIZE * VOXEL_SIZE));
    const camCZ = Math.floor(camera.position.z / (CHUNK_SIZE * VOXEL_SIZE));
    const viewDist = 6; // chunks to check

    const m = new THREE.Matrix4();
    const c = new THREE.Color();
    let count = 0;
    const t = clock.getElapsedTime();

    for (const [, data] of cache) {
      if (count >= maxInstances) break;

      // Skip distant chunks
      const dx = data.chunkX - camCX;
      const dz = data.chunkZ - camCZ;
      if (dx * dx + dz * dz > viewDist * viewDist) continue;

      for (let i = 0; i < data.windowLightCount && count < maxInstances; i++) {
        const i3 = i * 3;
        const wx = data.windowLights[i3];
        const wy = data.windowLights[i3 + 1];
        const wz = data.windowLights[i3 + 2];

        // Deterministic: ~65% of windows are lit at night
        const h = winHash(wx, wy, wz);
        if (h > WINDOW_LIT_PROBABILITY) continue;

        // Some windows flicker on/off with a slow pattern
        const flickerPhase = h * 100;
        const flickerSpeed = 0.1 + h * 0.2;
        const flicker = Math.sin(t * flickerSpeed + flickerPhase);
        if (h > FLICKER_HASH_THRESHOLD && flicker < FLICKER_OFF_THRESHOLD) continue;

        m.identity();
        m.elements[12] = wx;
        m.elements[13] = wy;
        m.elements[14] = wz;
        mesh.setMatrixAt(count, m);

        // Choose warm color based on position hash
        const colorIdx = Math.floor(h * WARM_COLORS.length) % WARM_COLORS.length;
        c.copy(WARM_COLORS[colorIdx]);

        // Slight brightness variation
        const brightness = 0.7 + h * 0.3 + flicker * 0.05;
        c.multiplyScalar(brightness);
        mesh.setColorAt(count, c);

        count++;
      }
    }

    mesh.count = count;
    if (mesh.instanceMatrix) mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    prevCount.current = count;
  });

  return (
    <instancedMesh ref={meshRef} args={[WIN_GEO, mat, maxInstances]} frustumCulled={false} />
  );
}

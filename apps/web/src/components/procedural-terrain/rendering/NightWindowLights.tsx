/* ═══════════════════════════════════════════════════════════════
 *  Night Window Lights — glowing windows on buildings at night
 *
 *  Two-layer rendering for maximum visibility:
 *  1. Inner glow: slightly larger than voxel so it protrudes past the
 *     opaque building wall (fixes z-fighting with same-position voxels).
 *  2. Outer halo: larger, softer glow around each window for bloom effect.
 *
 *  Each window has a deterministic on/off state, flicker pattern, and
 *  warm color chosen from the palette.
 * ═══════════════════════════════════════════════════════════════ */
'use client';

import { useRef, useMemo, useContext } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import type { ChunkVoxelData } from '../types';
import { VOXEL_SIZE, CHUNK_SIZE } from '../constants';
import { TimeContext } from './DayNightCycle';

/* ── Geometry: inner glow protrudes 20% past wall; outer halo is 2.2× ── */
const WIN_INNER_GEO = new THREE.BoxGeometry(VOXEL_SIZE * 1.2, VOXEL_SIZE * 1.2, VOXEL_SIZE * 1.2);
const WIN_OUTER_GEO = new THREE.BoxGeometry(VOXEL_SIZE * 2.2, VOXEL_SIZE * 2.2, VOXEL_SIZE * 2.2);

/* ── Tuning constants ── */
const FLICKER_HASH_THRESHOLD = 0.55;   // windows above this can flicker
const FLICKER_OFF_THRESHOLD = -0.35;   // sin threshold for flicker-off
const VIEW_DIST_CHUNKS = 8;            // how many chunks to scan
const MAX_INSTANCES = 6000;

function winHash(x: number, y: number, z: number): number {
  let h = (Math.round(x * 100) * 374761393 + Math.round(y * 100) * 668265263 + Math.round(z * 100) * 1274126177) | 0;
  h = Math.imul(h ^ (h >>> 13), 1103515245);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

/** Warm window light colors — saturated for additive blending visibility */
const WARM_COLORS = [
  new THREE.Color('#ffdd88'),  // warm yellow
  new THREE.Color('#ffeebb'),  // bright warm
  new THREE.Color('#ffcc66'),  // golden
  new THREE.Color('#eebb55'),  // amber
  new THREE.Color('#ffaa44'),  // deep amber
  new THREE.Color('#88bbff'),  // cool blue (TV screen)
];

export function NightWindowLights({
  chunkCacheRef,
  windowLitProbability,
}: {
  chunkCacheRef: React.RefObject<Map<string, ChunkVoxelData>>;
  windowLitProbability: number;
}) {
  const innerRef = useRef<THREE.InstancedMesh>(null);
  const outerRef = useRef<THREE.InstancedMesh>(null);
  const timeRef = useContext(TimeContext);
  const { camera } = useThree();

  /* Inner glow: brighter, slightly transparent, additive */
  const innerMat = useMemo(() => new THREE.MeshBasicMaterial({
    transparent: true, opacity: 0, depthWrite: false,
    blending: THREE.AdditiveBlending, toneMapped: false,
  }), []);

  /* Outer halo: very transparent, large, soft bloom */
  const outerMat = useMemo(() => new THREE.MeshBasicMaterial({
    transparent: true, opacity: 0, depthWrite: false,
    blending: THREE.AdditiveBlending, toneMapped: false,
  }), []);

  useFrame(({ clock }) => {
    const inner = innerRef.current;
    const outer = outerRef.current;
    if (!inner || !outer || !timeRef) return;

    const state = timeRef.current;
    const hour = state.hour;

    // Night intensity: 0 during day, 1 at deep night
    let nightFactor = 0;
    if (hour >= 17.5 && hour < 19.5) {
      nightFactor = (hour - 17.5) / 2; // start earlier, fade in during dusk
    } else if (hour >= 19.5 || hour < 5) {
      nightFactor = 1;
    } else if (hour >= 5 && hour < 6.5) {
      nightFactor = 1 - (hour - 5) / 1.5;
    }

    if (nightFactor <= 0.01) {
      // eslint-disable-next-line react-hooks/immutability
      innerMat.opacity = 0;
      // eslint-disable-next-line react-hooks/immutability
      outerMat.opacity = 0;
      inner.count = 0;
      outer.count = 0;
      if (inner.instanceMatrix) inner.instanceMatrix.needsUpdate = true;
      if (outer.instanceMatrix) outer.instanceMatrix.needsUpdate = true;
      return;
    }

    innerMat.opacity = nightFactor * 0.95;
    outerMat.opacity = nightFactor * 0.25;

    const cache = chunkCacheRef.current;
    if (!cache) return;

    const camCX = Math.floor(camera.position.x / (CHUNK_SIZE * VOXEL_SIZE));
    const camCZ = Math.floor(camera.position.z / (CHUNK_SIZE * VOXEL_SIZE));

    const m = new THREE.Matrix4();
    const c = new THREE.Color();
    let count = 0;
    const t = clock.getElapsedTime();

    for (const [, data] of cache) {
      if (count >= MAX_INSTANCES) break;

      const dx = data.chunkX - camCX;
      const dz = data.chunkZ - camCZ;
      if (dx * dx + dz * dz > VIEW_DIST_CHUNKS * VIEW_DIST_CHUNKS) continue;

      for (let i = 0; i < data.windowLightCount && count < MAX_INSTANCES; i++) {
        const i3 = i * 3;
        const wx = data.windowLights[i3];
        const wy = data.windowLights[i3 + 1];
        const wz = data.windowLights[i3 + 2];

        const h = winHash(wx, wy, wz);
        if (h > windowLitProbability) continue;

        // Flicker
        const flickerPhase = h * 100;
        const flickerSpeed = 0.08 + h * 0.15;
        const flicker = Math.sin(t * flickerSpeed + flickerPhase);
        if (h > FLICKER_HASH_THRESHOLD && flicker < FLICKER_OFF_THRESHOLD) continue;

        // Set transform for both inner and outer meshes
        m.identity();
        m.elements[12] = wx;
        m.elements[13] = wy;
        m.elements[14] = wz;
        inner.setMatrixAt(count, m);
        outer.setMatrixAt(count, m);

        // Warm color
        const colorIdx = Math.floor(h * WARM_COLORS.length) % WARM_COLORS.length;
        c.copy(WARM_COLORS[colorIdx]);
        const brightness = 0.8 + h * 0.4 + flicker * 0.08;
        c.multiplyScalar(brightness);
        inner.setColorAt(count, c);

        // Outer halo is dimmer / slightly different hue
        c.multiplyScalar(0.5);
        outer.setColorAt(count, c);

        count++;
      }
    }

    inner.count = count;
    outer.count = count;
    if (inner.instanceMatrix) inner.instanceMatrix.needsUpdate = true;
    if (inner.instanceColor) inner.instanceColor.needsUpdate = true;
    if (outer.instanceMatrix) outer.instanceMatrix.needsUpdate = true;
    if (outer.instanceColor) outer.instanceColor.needsUpdate = true;
  });

  return (
    <>
      <instancedMesh ref={outerRef} args={[WIN_OUTER_GEO, outerMat, MAX_INSTANCES]} frustumCulled={false} renderOrder={998} />
      <instancedMesh ref={innerRef} args={[WIN_INNER_GEO, innerMat, MAX_INSTANCES]} frustumCulled={false} renderOrder={999} />
    </>
  );
}

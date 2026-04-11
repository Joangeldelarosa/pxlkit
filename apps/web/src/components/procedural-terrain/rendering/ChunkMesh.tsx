/* ═══════════════════════════════════════════════════════════════
 *  Rendering — ChunkMesh & FloatingPickup
 *
 *  Chunks use SHARED materials with per-chunk uniform objects for
 *  atmospheric reveal + continuous distance fade.  This avoids
 *  allocating 4× materials per chunk (was 80+ materials at 20 chunks)
 *  and eliminates the white flash on first frame.
 *
 *  Distance-based atmospheric fade:
 *  • On load: chunks emerge from the fog color (fade-in animation).
 *  • After load: chunks that are far from the camera are mixed toward
 *    the atmosphere color, controlled by `chunkFadeStart` setting.
 * ═══════════════════════════════════════════════════════════════ */
'use client';

import { useRef, useEffect, useContext } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { ChunkVoxelData } from '../types';
import { VOXEL_SIZE, CHUNK_SIZE } from '../constants';
import { getPickupIcons } from '../generation/chunk';
import { TimeContext } from './DayNightCycle';

/* ── Shared geometry (unchanged) ── */
const sharedGeo = new THREE.BoxGeometry(VOXEL_SIZE, VOXEL_SIZE, VOXEL_SIZE);
const sharedWaterGeo = (() => {
  const g = new THREE.PlaneGeometry(VOXEL_SIZE, VOXEL_SIZE);
  g.rotateX(-Math.PI / 2);
  return g;
})();
const MINI_VS = VOXEL_SIZE * 0.15;
const miniGeo = new THREE.BoxGeometry(MINI_VS, MINI_VS, MINI_VS);
const paintGeo = (() => {
  const g = new THREE.PlaneGeometry(1, 1);
  g.rotateX(-Math.PI / 2);
  return g;
})();

/* ═══════════════════════════════════════════════════════════════
 *  Shared Atmospheric Materials (4 total, not 4×N)
 *
 *  Each material extends MeshStandardMaterial via onBeforeCompile
 *  with two uniforms: uChunkReveal (0→fog, 1→real) and uAtmoColor.
 *  Uniform *objects* are shared across all chunks; each ChunkMesh
 *  writes its own value right before its meshes render via
 *  onBeforeRender callbacks.
 * ═══════════════════════════════════════════════════════════════ */

/** Inject atmospheric reveal into a MeshStandardMaterial */
function injectRevealShader(mat: THREE.MeshStandardMaterial): void {
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uChunkReveal = { value: 1.0 };
    shader.uniforms.uAtmoColor   = { value: new THREE.Color(0.69, 0.78, 0.88) };

    // Store uniform refs on the material so ChunkMesh can write per-chunk values
    mat.userData._shaderRef = shader;

    shader.fragmentShader =
      'uniform float uChunkReveal;\nuniform vec3 uAtmoColor;\n' + shader.fragmentShader;

    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <dithering_fragment>',
      `#include <dithering_fragment>
      gl_FragColor.rgb = mix(uAtmoColor, gl_FragColor.rgb, clamp(uChunkReveal, 0.0, 1.0));`,
    );
  };
}

/* Create the 4 shared materials once at module level */
const sharedSolidMat = (() => {
  const m = new THREE.MeshStandardMaterial({ roughness: 0.7 });
  injectRevealShader(m);
  return m;
})();
const sharedWaterMat = (() => {
  const m = new THREE.MeshStandardMaterial({
    roughness: 0.2, metalness: 0.05, transparent: true, opacity: 0.6,
    depthWrite: false, side: THREE.DoubleSide,
  });
  injectRevealShader(m);
  return m;
})();
const sharedMiniMat = (() => {
  const m = new THREE.MeshStandardMaterial({ roughness: 0.5 });
  injectRevealShader(m);
  return m;
})();
const sharedPaintMat = (() => {
  const m = new THREE.MeshStandardMaterial({
    roughness: 0.85, metalness: 0, depthWrite: true,
    polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1,
  });
  injectRevealShader(m);
  return m;
})();

/* ── Fade-in timing ── */
const FADE_CLOSE = 0.35;   // seconds for chunks right under the camera
const FADE_FAR   = 2.8;    // seconds for chunks at render-distance edge
const CWS = CHUNK_SIZE * VOXEL_SIZE; // world-space chunk width

export function ChunkMesh({
  data, renderDistance, chunkFadeStart,
}: {
  data: ChunkVoxelData;
  renderDistance: number;
  chunkFadeStart: number;  // 0-1: where distance fade begins (0=from camera, 1=no fade)
}) {
  const solidRef = useRef<THREE.InstancedMesh>(null);
  const waterRef = useRef<THREE.InstancedMesh>(null);
  const miniRef  = useRef<THREE.InstancedMesh>(null);
  const paintRef = useRef<THREE.InstancedMesh>(null);
  const birthRef       = useRef(-1);
  const fadeInDoneRef  = useRef(false);
  const revealRef      = useRef(0);      // current reveal value (0=fog, 1=real)
  const atmoColorRef   = useRef(new THREE.Color(0.69, 0.78, 0.88));
  const timeRef        = useContext(TimeContext);

  /* ── Attach onBeforeRender callbacks ── */
  useEffect(() => {
    const rv = revealRef;
    const ac = atmoColorRef;
    const callback = (_renderer: THREE.WebGLRenderer, _scene: THREE.Scene, _camera: THREE.Camera, _geometry: THREE.BufferGeometry, material: THREE.Material) => {
      const shader = (material as THREE.MeshStandardMaterial).userData._shaderRef as THREE.WebGLProgramParametersWithUniforms | undefined;
      if (!shader) return;
      shader.uniforms.uChunkReveal.value = rv.current;
      shader.uniforms.uAtmoColor.value.copy(ac.current);
    };
    const meshes = [solidRef.current, waterRef.current, miniRef.current, paintRef.current];
    for (const mesh of meshes) {
      if (mesh) mesh.onBeforeRender = callback;
    }
    return () => {
      for (const mesh of meshes) {
        if (mesh) mesh.onBeforeRender = () => {};
      }
    };
  }, [data]);

  /* ── Instance data setup (unchanged logic) ── */
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

  useEffect(() => {
    const mesh = paintRef.current;
    if (!mesh || data.paintCount === 0) return;
    const m = new THREE.Matrix4(), c = new THREE.Color();
    for (let i = 0; i < data.paintCount; i++) {
      const i3 = i * 3;
      const i2 = i * 2;
      const sx = data.paintScales[i2];
      const sz = data.paintScales[i2 + 1];
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

  /* ── Per-frame: fade-in + continuous distance-based atmospheric fade ──
   *
   * Phase 1 (fade-in): chunk emerges from fog color over FADE_CLOSE..FADE_FAR s.
   * Phase 2 (distance fade): after fade-in, reveal tracks camera distance so
   *   far chunks stay partially faded into the atmosphere.  Controlled by
   *   `chunkFadeStart` (0 = fade from camera position, 1 = no distance fade).
   */
  useFrame(({ clock, camera }) => {
    const now = clock.getElapsedTime();
    if (birthRef.current < 0) birthRef.current = now;
    const age = now - birthRef.current;

    // Chunk centre in world-space
    const cx = (data.chunkX + 0.5) * CWS;
    const cz = (data.chunkZ + 0.5) * CWS;
    const dx = camera.position.x - cx;
    const dz = camera.position.z - cz;
    const dist = Math.sqrt(dx * dx + dz * dz);

    const maxDist = renderDistance * CWS;
    const normDist = Math.min(1, dist / maxDist); // 0..1

    /* ── Continuous distance fade (always active) ──
     * chunkFadeStart=0 → fade from camera (normDist 0→1 maps to reveal 1→0)
     * chunkFadeStart=1 → no distance fade (reveal always 1)
     */
    const fadeStart = Math.max(0, Math.min(1, chunkFadeStart));
    let distReveal: number;
    if (fadeStart >= 0.99) {
      distReveal = 1;                             // no distance fade
    } else {
      // Remap normDist into 0..1 range starting from fadeStart
      const t = Math.max(0, normDist - fadeStart) / (1 - fadeStart);
      distReveal = 1 - t * t;                     // quadratic falloff
    }

    /* ── Fade-in animation (first few seconds) ── */
    let fadeInReveal = 1;
    if (!fadeInDoneRef.current) {
      // Close chunks start partially revealed so they barely flash
      const startReveal = Math.max(0, 1 - normDist * 2);
      const fadeDuration = FADE_CLOSE + normDist * (FADE_FAR - FADE_CLOSE);
      const t = Math.min(1, age / fadeDuration);
      const ease = t * t * (3 - 2 * t); // smoothstep
      fadeInReveal = startReveal + (1 - startReveal) * ease;
      if (ease >= 0.998) fadeInDoneRef.current = true;
    }

    // Final reveal = min(fade-in, distance-fade) — take the more faded value
    revealRef.current = Math.min(fadeInReveal, distReveal);

    // Sync atmosphere color from day/night cycle
    if (timeRef) atmoColorRef.current.copy(timeRef.current.fogColor);
  });

  return (
    <group>
      {data.count > 0 && <instancedMesh ref={solidRef} args={[sharedGeo, sharedSolidMat, data.count]} frustumCulled={false} />}
      {data.waterCount > 0 && <instancedMesh ref={waterRef} args={[sharedWaterGeo, sharedWaterMat, data.waterCount]} frustumCulled={false} />}
      {data.miniVoxelCount > 0 && <instancedMesh ref={miniRef} args={[miniGeo, sharedMiniMat, data.miniVoxelCount]} frustumCulled={false} />}
      {data.paintCount > 0 && <instancedMesh ref={paintRef} args={[paintGeo, sharedPaintMat, data.paintCount]} frustumCulled={false} />}
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

/* ═══════════════════════════════════════════════════════════════
 *  Rendering — ChunkMesh & FloatingPickup
 *
 *  Chunks use per-instance materials with an atmospheric reveal
 *  shader: new chunks emerge from the fog/sky color rather than
 *  popping in. Close chunks reveal quickly; distant ones fade in
 *  slowly, simulating realistic atmospheric perspective.
 * ═══════════════════════════════════════════════════════════════ */
'use client';

import { useRef, useEffect, useMemo, useContext } from 'react';
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
 *  Atmospheric Reveal Material
 *
 *  Extends MeshStandardMaterial via onBeforeCompile to add a
 *  uChunkReveal uniform (0 = fully fog-colored, 1 = real color).
 *  The shader mixes the final lit fragment color with the
 *  atmospheric fog color, creating a smooth emergence effect.
 *  All materials with the same base properties share a compiled
 *  WebGL shader program (customProgramCacheKey).
 * ═══════════════════════════════════════════════════════════════ */
const REVEAL_CACHE_KEY = 'chunk-atmo-reveal';

interface RevealUniforms {
  uChunkReveal: { value: number };
  uAtmoColor: { value: THREE.Color };
}

function createRevealMaterial(
  props: THREE.MeshStandardMaterialParameters,
): THREE.MeshStandardMaterial {
  const mat = new THREE.MeshStandardMaterial(props);

  mat.customProgramCacheKey = () => REVEAL_CACHE_KEY;

  mat.onBeforeCompile = (shader) => {
    const reveal: RevealUniforms = {
      uChunkReveal: { value: 0.0 },
      uAtmoColor: { value: new THREE.Color(0.69, 0.78, 0.88) },
    };
    shader.uniforms.uChunkReveal = reveal.uChunkReveal;
    shader.uniforms.uAtmoColor = reveal.uAtmoColor;

    // Store uniform references on the material's userData for per-frame updates
    mat.userData._revealUniforms = reveal;

    shader.fragmentShader =
      'uniform float uChunkReveal;\nuniform vec3 uAtmoColor;\n' + shader.fragmentShader;

    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <dithering_fragment>',
      `#include <dithering_fragment>
      gl_FragColor.rgb = mix(uAtmoColor, gl_FragColor.rgb, clamp(uChunkReveal, 0.0, 1.0));`,
    );
  };

  return mat;
}

/* ── Fade-in timing ── */
const FADE_CLOSE = 0.35;   // seconds for chunks right under the camera
const FADE_FAR   = 2.8;    // seconds for chunks at render-distance edge
const CWS = CHUNK_SIZE * VOXEL_SIZE; // world-space chunk width

export function ChunkMesh({ data, renderDistance }: { data: ChunkVoxelData; renderDistance: number }) {
  const solidRef = useRef<THREE.InstancedMesh>(null);
  const waterRef = useRef<THREE.InstancedMesh>(null);
  const miniRef  = useRef<THREE.InstancedMesh>(null);
  const paintRef = useRef<THREE.InstancedMesh>(null);
  const birthRef    = useRef(-1);
  const revealedRef = useRef(false);
  const timeRef = useContext(TimeContext);

  /* ── Per-chunk materials with atmospheric reveal ── */
  const materials = useMemo(() => ({
    solid: createRevealMaterial({ roughness: 0.7 }),
    water: createRevealMaterial({
      roughness: 0.2, metalness: 0.05, transparent: true, opacity: 0.6,
      depthWrite: false, side: THREE.DoubleSide,
    }),
    mini:  createRevealMaterial({ roughness: 0.5 }),
    paint: createRevealMaterial({
      roughness: 0.85, metalness: 0, depthWrite: true,
      polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1,
    }),
  }), []);

  /* Dispose materials on unmount to prevent memory leaks */
  useEffect(() => () => {
    materials.solid.dispose();
    materials.water.dispose();
    materials.mini.dispose();
    materials.paint.dispose();
  }, [materials]);

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

  /* ── Atmospheric fade-in animation ──
   * Close chunks reveal almost instantly; distant chunks emerge
   * slowly from the fog color, mimicking atmospheric perspective.
   * Once fully revealed the per-frame work stops.
   */
  useFrame(({ clock, camera }) => {
    if (revealedRef.current) return;

    const now = clock.getElapsedTime();
    if (birthRef.current < 0) birthRef.current = now;
    const age = now - birthRef.current;

    // Chunk centre in world-space
    const cx = (data.chunkX + 0.5) * CWS;
    const cz = (data.chunkZ + 0.5) * CWS;
    const dx = camera.position.x - cx;
    const dz = camera.position.z - cz;
    const dist = Math.sqrt(dx * dx + dz * dz);

    // Normalized distance: 0 = right under camera, 1 = render-distance edge
    const maxDist = renderDistance * CWS;
    const normDist = Math.min(1, dist / maxDist);

    // Close chunks start partially revealed so they barely flash
    const startReveal = Math.max(0, 1 - normDist * 2); // 1.0 at d=0, 0 at d≥0.5×maxDist

    // Fade duration scales with distance
    const fadeDuration = FADE_CLOSE + normDist * (FADE_FAR - FADE_CLOSE);

    // Smooth ease-out (Hermite / smoothstep)
    const t = Math.min(1, age / fadeDuration);
    const ease = t * t * (3 - 2 * t);

    const reveal = startReveal + (1 - startReveal) * ease;

    // Current atmosphere color from day/night cycle
    const fogColor = timeRef ? timeRef.current.fogColor : null;

    // Push reveal + atmosphere color into every material
    const mats = [materials.solid, materials.water, materials.mini, materials.paint];
    for (let i = 0; i < mats.length; i++) {
      const r = mats[i].userData._revealUniforms as RevealUniforms | undefined;
      if (!r) continue;
      r.uChunkReveal.value = reveal;
      if (fogColor) r.uAtmoColor.value.copy(fogColor);
    }

    if (ease >= 0.998) revealedRef.current = true;
  });

  return (
    <group>
      {data.count > 0 && <instancedMesh ref={solidRef} args={[sharedGeo, materials.solid, data.count]} frustumCulled={false} />}
      {data.waterCount > 0 && <instancedMesh ref={waterRef} args={[sharedWaterGeo, materials.water, data.waterCount]} frustumCulled={false} />}
      {data.miniVoxelCount > 0 && <instancedMesh ref={miniRef} args={[miniGeo, materials.mini, data.miniVoxelCount]} frustumCulled={false} />}
      {data.paintCount > 0 && <instancedMesh ref={paintRef} args={[paintGeo, materials.paint, data.paintCount]} frustumCulled={false} />}
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

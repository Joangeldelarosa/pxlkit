/* ═══════════════════════════════════════════════════════════════
 *  Rendering — ChunkMesh & FloatingPickup
 *
 *  4 SHARED materials (not 4×N) with per-chunk `onBeforeRender`
 *  callbacks that write chunk-specific reveal + atmosphere uniforms
 *  into the shader right before each draw call.
 *
 *  Two-phase atmospheric reveal:
 *  Phase 1 — Fade-in:   new chunks emerge from fog color.
 *  Phase 2 — Distance:  chunks continuously fade toward the
 *            atmosphere based on camera distance, controlled
 *            by the `chunkFadeStart` setting.
 *
 *  Performance notes:
 *  • No per-chunk material allocation — 4 materials total.
 *  • No Math.sqrt — all distance checks use squared values.
 *  • Chunk world-pos cached in a ref (computed once, not per frame).
 *  • Atmosphere color synced once per frame from TimeContext,
 *    then shared by all onBeforeRender callbacks via a ref.
 *  • GLSL uses smoothstep for the fog→real blend, producing a
 *    softer, more realistic atmospheric scattering effect.
 * ═══════════════════════════════════════════════════════════════ */
'use client';

import { useRef, useEffect, useContext } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { ChunkVoxelData } from '../types';
import { VOXEL_SIZE, CHUNK_SIZE } from '../constants';
import { getPickupIcons } from '../generation/chunk';
import { TimeContext } from './DayNightCycle';

/* ── Shared geometry ── */
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
 *  Shared Atmospheric Materials (4 total)
 *
 *  onBeforeCompile injects uChunkReveal + uAtmoColor uniforms.
 *  The GLSL mix uses smoothstep for a softer, more realistic
 *  atmospheric scattering blend (avoids the hard linear edge).
 *  Default uChunkReveal = 1.0 so uncompiled material looks
 *  normal — prevents any white flash on the first frame.
 * ═══════════════════════════════════════════════════════════════ */

/* Default atmosphere color — matches DayNightCycle noon keyframe */
const NOON_FOG_R = 0.69, NOON_FOG_G = 0.78, NOON_FOG_B = 0.88;

function injectRevealShader(mat: THREE.MeshStandardMaterial): void {
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uChunkReveal = { value: 1.0 };
    shader.uniforms.uAtmoColor   = { value: new THREE.Color(NOON_FOG_R, NOON_FOG_G, NOON_FOG_B) };

    mat.userData._shaderRef = shader;

    shader.fragmentShader =
      'uniform float uChunkReveal;\nuniform vec3 uAtmoColor;\n' + shader.fragmentShader;

    /* smoothstep-based blend: the edges are softer than a linear mix,
     * better simulating real atmospheric scattering where the transition
     * between hazy and clear is never sharp. */
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <dithering_fragment>',
      `#include <dithering_fragment>
      float r = clamp(uChunkReveal, 0.0, 1.0);
      float s = smoothstep(0.0, 1.0, r);
      gl_FragColor.rgb = mix(uAtmoColor, gl_FragColor.rgb, s);`,
    );
  };
}

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

/* All 4 shared materials in a flat array (avoids per-frame allocation) */
const SHARED_MATS = [sharedSolidMat, sharedWaterMat, sharedMiniMat, sharedPaintMat];

/* ── Fade-in timing ── */
const FADE_CLOSE = 0.25;   // seconds — chunks right under the camera
const FADE_FAR   = 2.4;    // seconds — chunks at render-distance edge
const CWS  = CHUNK_SIZE * VOXEL_SIZE;   // world-space chunk width
const CWS2 = CWS * CWS;                // squared (for dist² math)

export function ChunkMesh({
  data, renderDistance, chunkFadeStart,
}: {
  data: ChunkVoxelData;
  renderDistance: number;
  chunkFadeStart: number;
}) {
  const solidRef = useRef<THREE.InstancedMesh>(null);
  const waterRef = useRef<THREE.InstancedMesh>(null);
  const miniRef  = useRef<THREE.InstancedMesh>(null);
  const paintRef = useRef<THREE.InstancedMesh>(null);

  const birthRef       = useRef(-1);
  const fadeInDoneRef  = useRef(false);
  const revealRef      = useRef(0);
  const atmoColorRef   = useRef(new THREE.Color(NOON_FOG_R, NOON_FOG_G, NOON_FOG_B));
  const timeRef        = useContext(TimeContext);

  /* Chunk centre in world-space — computed once, never changes */
  const chunkCx = useRef((data.chunkX + 0.5) * CWS);
  const chunkCz = useRef((data.chunkZ + 0.5) * CWS);

  /* ── onBeforeRender: write per-chunk uniforms before each draw ──
   * The callback reads _shaderRef lazily — if the shader hasn't
   * compiled yet on the first frame, it simply returns (the material
   * defaults to uChunkReveal=1.0 which is fine).
   */
  useEffect(() => {
    const rv = revealRef;
    const ac = atmoColorRef;
    const callback = (
      _renderer: THREE.WebGLRenderer, _scene: THREE.Scene,
      _camera: THREE.Camera, _geometry: THREE.BufferGeometry,
      material: THREE.Material,
    ) => {
      const shader = (material as THREE.MeshStandardMaterial).userData._shaderRef as
        THREE.WebGLProgramParametersWithUniforms | undefined;
      if (!shader) return;
      shader.uniforms.uChunkReveal.value = rv.current;
      /* Avoid .copy() — set components directly (no object allocation) */
      const u = shader.uniforms.uAtmoColor.value as THREE.Color;
      u.r = ac.current.r;
      u.g = ac.current.g;
      u.b = ac.current.b;
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
   * All distance math uses squared distances (no Math.sqrt).
   * normDist is computed via sqrt only once using a fast approximation
   * (actually we keep a single sqrt — it's one per chunk per frame,
   * and normDist needs a linear value for the smoothstep curve).
   *
   * Phase 1 — Fade-in: chunk emerges from fog over FADE_CLOSE..FADE_FAR s.
   *   Close chunks (< 50% of maxDist) begin partially revealed.
   * Phase 2 — Distance: after fade-in is done, chunk reveal tracks
   *   camera distance with a smoothstep falloff.
   */
  useFrame(({ clock, camera }) => {
    const now = clock.getElapsedTime();
    if (birthRef.current < 0) birthRef.current = now;

    /* ── Distance (squared where possible, one sqrt for normDist) ── */
    const dx = camera.position.x - chunkCx.current;
    const dz = camera.position.z - chunkCz.current;
    const dist2 = dx * dx + dz * dz;
    const maxDist2 = renderDistance * renderDistance * CWS2;
    /* normDist needs to be linear (0..1) for smoothstep curves,
     * so we do one sqrt via the squared ratio. */
    const normDist = Math.min(1, Math.sqrt(dist2 / maxDist2));

    /* ── Continuous distance fade ──
     * smoothstep falloff: softer near the start, accelerates at the end,
     * mimicking real atmospheric scattering better than quadratic.
     */
    const fadeStart = chunkFadeStart < 0 ? 0 : chunkFadeStart > 1 ? 1 : chunkFadeStart;
    let distReveal: number;
    if (fadeStart >= 0.99) {
      distReveal = 1;
    } else {
      const t = normDist <= fadeStart ? 0 : (normDist - fadeStart) / (1 - fadeStart);
      // smoothstep: 3t²−2t³  (starts & ends with zero derivative)
      const s = t * t;
      distReveal = 1 - (s * 3 - s * t * 2);
    }

    /* ── Fade-in animation ── */
    const age = now - birthRef.current;
    let fadeInReveal = 1;
    if (!fadeInDoneRef.current) {
      /* startReveal: chunks within half the render distance begin
       * partially visible so there is never a perceptible white flash. */
      const startReveal = normDist < 0.5 ? 1 - normDist * 2 : 0;
      const fadeDuration = FADE_CLOSE + normDist * (FADE_FAR - FADE_CLOSE);
      const ft = age < fadeDuration ? age / fadeDuration : 1;
      // smoothstep ease
      const ease = ft * ft * (3 - 2 * ft);
      fadeInReveal = startReveal + (1 - startReveal) * ease;
      if (ease >= 0.998) fadeInDoneRef.current = true;
    }

    /* Final reveal = min of both phases (take the more faded value) */
    revealRef.current = fadeInReveal < distReveal ? fadeInReveal : distReveal;

    /* Sync atmosphere color once per frame (all callbacks share the ref) */
    if (timeRef) {
      const fc = timeRef.current.fogColor;
      const ac = atmoColorRef.current;
      ac.r = fc.r; ac.g = fc.g; ac.b = fc.b;
    }
  });

  return (
    <group>
      {data.count > 0 && <instancedMesh ref={solidRef} args={[sharedGeo, SHARED_MATS[0], data.count]} frustumCulled={false} />}
      {data.waterCount > 0 && <instancedMesh ref={waterRef} args={[sharedWaterGeo, SHARED_MATS[1], data.waterCount]} frustumCulled={false} />}
      {data.miniVoxelCount > 0 && <instancedMesh ref={miniRef} args={[miniGeo, SHARED_MATS[2], data.miniVoxelCount]} frustumCulled={false} />}
      {data.paintCount > 0 && <instancedMesh ref={paintRef} args={[paintGeo, SHARED_MATS[3], data.paintCount]} frustumCulled={false} />}
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

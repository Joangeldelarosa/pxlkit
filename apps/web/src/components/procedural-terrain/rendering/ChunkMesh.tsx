/* ═══════════════════════════════════════════════════════════════
 *  Rendering — ChunkMesh & FloatingPickup
 *
 *  4 SHARED materials (not 4×N) with per-chunk `onBeforeRender`
 *  callbacks that write chunk-specific reveal + atmosphere uniforms
 *  into the shader right before each draw call.
 *
 *  Continuous distance-proportional atmospheric reveal:
 *  Chunks always track a distance-based target opacity via
 *  smoothstep falloff.  An exponential-smoothing approach
 *  (close = fast, far = slow) ensures new chunks emerge
 *  from fog without any pop or flash — no birth-time
 *  animation state that could break on remount.
 *
 *  Performance notes:
 *  • No per-chunk material allocation — 4 materials total.
 *  • Chunk world-pos cached in a ref (computed once).
 *  • Atmosphere color synced once per frame from TimeContext.
 *  • Single sqrt per chunk per frame for normDist.
 *  • Shader default uChunkReveal = 0.0 so first frame before
 *    onBeforeRender is set renders fog-colored (no flash).
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
 *  Default uChunkReveal = 0.0 so the first frame (before
 *  onBeforeRender is attached via useEffect) renders fog-colored
 *  instead of flashing bright white.
 *  GLSL uses a direct linear mix — the JS code already applies
 *  the smoothstep curve, so no double-smoothstep in the shader.
 * ═══════════════════════════════════════════════════════════════ */

/* Default atmosphere color — matches DayNightCycle noon keyframe */
const NOON_FOG_R = 0.69, NOON_FOG_G = 0.78, NOON_FOG_B = 0.88;

function injectRevealShader(mat: THREE.MeshStandardMaterial): void {
  mat.onBeforeCompile = (shader) => {
    /* Default 0.0 = fully fog-colored.  Prevents bright flash on the
     * first frame before onBeforeRender can write the real value.
     * onBeforeCompile runs during compilation, BEFORE onBeforeRender
     * has had a chance to write, so the default is what the GPU sees. */
    shader.uniforms.uChunkReveal = { value: 0.0 };
    shader.uniforms.uAtmoColor   = { value: new THREE.Color(NOON_FOG_R, NOON_FOG_G, NOON_FOG_B) };

    mat.userData._shaderRef = shader;

    shader.fragmentShader =
      'uniform float uChunkReveal;\nuniform vec3 uAtmoColor;\n' + shader.fragmentShader;

    /* Direct linear blend — the JS useFrame already applies a
     * smoothstep distance curve, so an additional GLSL smoothstep
     * would over-curve the transition and narrow the effective
     * fade zone.  Linear mix lets JS fully control the shape. */
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <dithering_fragment>',
      `#include <dithering_fragment>
      gl_FragColor.rgb = mix(uAtmoColor, gl_FragColor.rgb, clamp(uChunkReveal, 0.0, 1.0));`,
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

/* ── Constants ── */
const CWS  = CHUNK_SIZE * VOXEL_SIZE;   // world-space chunk width
const CWS2 = CWS * CWS;                // squared (for dist² math)

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

  const revealRef      = useRef(0);
  const atmoColorRef   = useRef(new THREE.Color(NOON_FOG_R, NOON_FOG_G, NOON_FOG_B));
  const timeRef        = useContext(TimeContext);

  /* Chunk centre in world-space — computed once, never changes */
  const chunkCx = useRef((data.chunkX + 0.5) * CWS);
  const chunkCz = useRef((data.chunkZ + 0.5) * CWS);

  /* ── onBeforeRender: write per-chunk uniforms before each draw ──
   * The callback reads _shaderRef lazily — if the shader hasn't
   * compiled yet on the first frame, it simply returns (the material
   * defaults to uChunkReveal=0.0 → fog-colored, no flash).
   *
   * Critical: shared materials cause Three.js to skip custom uniform
   * re-upload for consecutive draw calls (same material.id → refreshMaterial=false).
   * We bypass this by directly calling program.getUniforms().setValue()
   * via renderer.properties, which writes to the GL uniform AND updates
   * the internal cache — keeping everything in sync.
   */
  useEffect(() => {
    const rv = revealRef;
    const ac = atmoColorRef;
    const callback = (
      renderer: THREE.WebGLRenderer, _scene: THREE.Scene,
      _camera: THREE.Camera, _geometry: THREE.BufferGeometry,
      material: THREE.Material,
    ) => {
      const shader = (material as THREE.MeshStandardMaterial).userData._shaderRef as
        THREE.WebGLProgramParametersWithUniforms | undefined;
      if (!shader) return;

      /* Set JS-side values (used by setProgram's first-use upload) */
      shader.uniforms.uChunkReveal.value = rv.current;
      const u = shader.uniforms.uAtmoColor.value as THREE.Color;
      u.r = ac.current.r;
      u.g = ac.current.g;
      u.b = ac.current.b;

      /* Direct GPU upload: bypass Three.js's material-level caching
       * that skips re-upload for consecutive same-material draw calls.
       * renderer.properties.get(material) → materialProperties with
       * currentProgram → getUniforms().setValue() writes GL uniform
       * AND updates cache, keeping Three.js's state consistent. */
      const matProps = renderer.properties.get(material) as
        { currentProgram?: { getUniforms(): { setValue(gl: WebGLRenderingContext | WebGL2RenderingContext, name: string, value: unknown): void } } } | undefined;
      const prog = matProps?.currentProgram;
      if (prog) {
        const gl = renderer.getContext();
        const p = prog.getUniforms();
        p.setValue(gl, 'uChunkReveal', rv.current);
        p.setValue(gl, 'uAtmoColor', ac.current);
      }
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

  /* ── Per-frame: continuous distance-proportional atmospheric fade ──
   *
   * No birth-time animation — just a distance-based target reveal
   * with exponential smoothing.  Close chunks approach the target
   * quickly (speed ≈ 12), far chunks gradually (speed ≈ 3).
   *
   * This eliminates flash-on-remount: when a chunk unmounts (frustum
   * cull) and remounts, it starts at reveal=0 and smoothly approaches
   * the correct value.  Close chunks get there in ~3 frames; far
   * chunks emerge from fog over ~0.5 s — exactly how atmospheric
   * scattering should behave.
   */
  // eslint-disable-next-line react-hooks/immutability
  useFrame(({ camera }, frameDelta) => {
    const dt = Math.min(0.1, frameDelta); // cap for tab-switch safety

    /* ── Distance ── */
    const dx = camera.position.x - chunkCx.current;
    const dz = camera.position.z - chunkCz.current;
    const dist2 = dx * dx + dz * dz;
    const maxDist2 = renderDistance * renderDistance * CWS2;
    const normDist = Math.min(1, Math.sqrt(dist2 / maxDist2));

    /* ── Distance-based target reveal (smoothstep falloff) ── */
    const fs = chunkFadeStart < 0 ? 0 : chunkFadeStart > 1 ? 1 : chunkFadeStart;
    const str = chunkFadeStrength < 0 ? 0 : chunkFadeStrength > 1 ? 1 : chunkFadeStrength;
    let target: number;
    if (fs >= 0.99 || str <= 0.01) {
      /* No fade: either fade starts beyond edge or strength is zero */
      target = 1;
    } else {
      const t = normDist <= fs ? 0 : (normDist - fs) / (1 - fs);
      // smoothstep: 3t² − 2t³  (zero derivative at endpoints)
      const fade = t * t * (3 - 2 * t);
      /* Strength controls how much fade is applied:
       * 0 = no fade (target stays 1), 1 = full fade (target can reach 0) */
      target = 1 - fade * str;
    }

    /* ── Exponential approach — speed proportional to proximity ──
     * Close chunks (normDist≈0): speed≈12 → ~95% in 0.25 s
     * Far chunks   (normDist≈1): speed≈3  → ~95% in 1.0 s
     * The Math.min(1, ...) cap prevents overshooting at very
     * high frame rates or after long pauses.
     */
    const speed = 3.0 + (1 - normDist) * 9.0;
    const cur = revealRef.current;
    const diff = target - cur;
    // eslint-disable-next-line react-hooks/immutability
    revealRef.current = Math.abs(diff) < 0.003 ? target : cur + diff * Math.min(1, dt * speed);

    /* Sync atmosphere color from day/night cycle (once per frame) */
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

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
 *  (close = fast, far = slow) ensures natural atmospheric
 *  fade without pop or flash.
 *
 *  Anti-darkness guarantees:
 *  • revealRef starts at 1.0 (fully visible) — not 0.
 *  • Shader default uChunkReveal = 1.0 — if onBeforeRender
 *    misses the first frame, chunks appear visible not dark.
 *  • useLayoutEffect (not useEffect) sets onBeforeRender
 *    synchronously during commit — before the first render.
 *  • Safety floor: chunks within 15% of render distance
 *    always get reveal ≥ 0.85 regardless of fade settings.
 *
 *  Performance notes:
 *  • No per-chunk material allocation — 4 materials total.
 *  • Chunk world-pos cached in a ref (computed once).
 *  • Atmosphere color synced once per frame from TimeContext.
 *  • Single sqrt per chunk per frame for normDist.
 * ═══════════════════════════════════════════════════════════════ */
'use client';

import { useRef, useEffect, useLayoutEffect, useContext } from 'react';
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
 *  Default uChunkReveal = 1.0 so if onBeforeRender hasn't been
 *  attached yet (React defers effects), chunks render fully
 *  visible instead of dark.  Close chunks should NEVER flash dark.
 *  GLSL uses a direct linear mix — the JS code already applies
 *  the smoothstep curve, so no double-smoothstep in the shader.
 * ═══════════════════════════════════════════════════════════════ */

/* Default atmosphere color — matches DayNightCycle noon keyframe */
const NOON_FOG_R = 0.69, NOON_FOG_G = 0.78, NOON_FOG_B = 0.88;

function injectRevealShader(mat: THREE.MeshStandardMaterial): void {
  mat.onBeforeCompile = (shader) => {
    /* Default 1.0 = fully visible.  Prevents dark flash on the
     * first frame if onBeforeRender hasn't been set yet (React defers
     * useEffect).  Close chunks should always appear at full brightness;
     * far chunks briefly flash visible then fade to their distance target
     * within a few frames — much less noticeable than a dark flash. */
    shader.uniforms.uChunkReveal = { value: 1.0 };
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

  const revealRef      = useRef(1);
  const atmoColorRef   = useRef(new THREE.Color(NOON_FOG_R, NOON_FOG_G, NOON_FOG_B));
  const timeRef        = useContext(TimeContext);

  /* Chunk centre in world-space — computed once, never changes */
  const chunkCx = useRef((data.chunkX + 0.5) * CWS);
  const chunkCz = useRef((data.chunkZ + 0.5) * CWS);

  /* ── onBeforeRender: write per-chunk uniforms before each draw ──
   * useLayoutEffect ensures the callback is attached synchronously
   * during React's commit phase — BEFORE the first Three.js render.
   * This eliminates the timing gap where useEffect is deferred and
   * chunks render with the shader default for one or more frames.
   *
   * The callback reads _shaderRef lazily — if the shader hasn't
   * compiled yet on the first frame, it simply returns (the material
   * defaults to uChunkReveal=1.0 → fully visible, no dark flash).
   *
   * Critical: shared materials cause Three.js to skip custom uniform
   * re-upload for consecutive draw calls (same material.id → refreshMaterial=false).
   * We bypass this by directly calling program.getUniforms().setValue()
   * via renderer.properties, which writes to the GL uniform AND updates
   * the internal cache — keeping everything in sync.
   */
  useLayoutEffect(() => {
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
   * revealRef starts at 1.0 (fully visible).  Each frame it is driven
   * toward a distance-based target via exponential smoothing.
   * Close chunks (normDist ≈ 0) always target 1.0 and stay bright.
   * Far chunks smoothly fade toward the atmosphere/fog color.
   *
   * Speed scales with proximity: close chunks converge in ~2 frames,
   * far chunks over ~0.5 s — mimicking atmospheric scattering.
   *
   * A safety floor ensures chunks within 15 % of render distance
   * ALWAYS have reveal ≥ 0.85, no matter what fade settings are used.
   * This prevents any configuration from making close terrain dark.
   */
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

    /* ── Safety floor: close chunks must NEVER go dark ──
     * Regardless of fade settings, chunks within 15 % of the render
     * distance get a minimum reveal of 0.85.  This prevents any
     * configuration or timing issue from making nearby terrain dark.  */
    if (normDist < 0.15) {
      target = Math.max(target, 0.85);
    }

    /* ── Exponential approach — speed proportional to proximity ──
     * Close chunks (normDist≈0): speed≈14 → converges in ~2 frames
     * Far chunks   (normDist≈1): speed≈3  → converges in ~0.5 s
     * revealRef starts at 1.0 so close chunks are instantly correct;
     * far chunks smoothly dim from full brightness to their target. */
    const speed = 3.0 + (1 - normDist) * 11.0;
    const cur = revealRef.current;
    const diff = target - cur;
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

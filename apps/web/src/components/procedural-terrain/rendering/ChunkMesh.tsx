/* ═══════════════════════════════════════════════════════════════
 *  Rendering — ChunkMesh & FloatingPickup
 *
 *  4 SHARED materials with per-chunk `onBeforeRender` callbacks
 *  that write chunk-specific reveal uniforms before each draw call.
 *
 *  Fog + chunk-edge-fade strategy (separate passes, not combined):
 *  ─────────────────────────────────────────────────────────────
 *  Three.js's standard #include <fog_fragment> is LEFT UNTOUCHED.
 *  Fog is computed exactly as Three.js does it — per-pixel, based
 *  on vFogDepth.  This guarantees close chunks look identical to
 *  un-modified MeshStandardMaterial; zero custom behaviour for them.
 *
 *  The per-chunk edge-fade (reveal) is injected AFTER
 *  #include <dithering_fragment> as a SEPARATE, isolated step.
 *  It only activates when uChunkReveal < 1.0 — i.e. for chunks
 *  near the render-distance edge.  Close chunks (reveal = 1.0)
 *  skip the reveal mix entirely → zero visual change.
 *
 *  Safety guarantees:
 *  • revealRef starts at 1.0 (fully visible).
 *  • Shader default uChunkReveal = 1.0.
 *  • useLayoutEffect sets BOTH onBeforeRender AND instance data
 *    synchronously before the first render.
 *  • Safety floor: chunks within 30% of render distance always
 *    get reveal = 1.0 regardless of fade settings.
 *
 *  Performance notes:
 *  • 4 materials total (not per-chunk).
 *  • Each material has a unique customProgramCacheKey.
 *  • Chunk world-pos cached in a ref (computed once).
 *  • Single sqrt per chunk per frame for normDist.
 * ═══════════════════════════════════════════════════════════════ */
'use client';

import { useRef, useLayoutEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { ChunkVoxelData } from '../types';
import { VOXEL_SIZE, CHUNK_SIZE } from '../constants';
import { getPickupIcons } from '../generation/chunk';

/* eslint-disable @typescript-eslint/no-explicit-any */

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
 *  onBeforeCompile injects a uChunkReveal uniform.
 *  Standard Three.js fog (#include <fog_fragment>) is LEFT INTACT.
 *  Reveal is applied AFTER dithering as a separate step — it only
 *  activates when uChunkReveal < 1.0 (far edge chunks).
 *
 *  For close chunks, uChunkReveal = 1.0 → the reveal step is
 *  skipped entirely → rendering is IDENTICAL to un-modified
 *  MeshStandardMaterial.  This eliminates all the fragile
 *  interactions between custom fog code and Three.js internals.
 * ═══════════════════════════════════════════════════════════════ */

let _matIdx = 0;
function injectRevealShader(mat: THREE.MeshStandardMaterial): void {
  const uid = `chunk-edge-reveal-${_matIdx++}`;

  mat.onBeforeCompile = (shader) => {
    /* Default 1.0 = fully visible.  If onBeforeRender hasn't
     * been attached yet, chunks render with zero reveal effect. */
    shader.uniforms.uChunkReveal = { value: 1.0 };

    mat.userData._shaderRef = shader;

    /* Declare the uniform at the top of the fragment shader */
    shader.fragmentShader =
      'uniform float uChunkReveal;\n' + shader.fragmentShader;

    /* Inject AFTER #include <dithering_fragment> — this runs
     * AFTER standard fog has already been applied normally.
     * Only does something when uChunkReveal < 1.0.
     *
     * For close chunks: uChunkReveal = 1.0 → cr = 1.0
     *   → (1.0 - 1.0) = 0.0 → mix factor = 0.0 → NO CHANGE.
     *
     * For far chunks: uChunkReveal < 1.0 → additional blend
     *   toward fogColor / black.  Yes, this "double-darkens"
     *   with fog, but at the render-distance edge fog already
     *   makes chunks ≈90% invisible, so the extra darkening is
     *   imperceptible and ensures smooth pop-out. */
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <dithering_fragment>',
      `#include <dithering_fragment>
       float cr = clamp(uChunkReveal, 0.0, 1.0);
       #ifdef USE_FOG
         gl_FragColor.rgb = mix(fogColor, gl_FragColor.rgb, cr);
       #else
         gl_FragColor.rgb *= cr;
       #endif`,
    );
  };
  mat.customProgramCacheKey = () => uid;
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

  const revealRef = useRef(1);

  /* Chunk centre in world-space — computed once, never changes */
  const chunkCx = useRef((data.chunkX + 0.5) * CWS);
  const chunkCz = useRef((data.chunkZ + 0.5) * CWS);

  /* ── onBeforeRender + instance data: ALL in useLayoutEffect ──
   *
   * CRITICAL: Both the onBeforeRender callback AND the instance data
   * setup MUST run synchronously before the first Three.js render.
   *
   * Previously, onBeforeRender was in useLayoutEffect (synchronous)
   * but instance data was in useEffect (DEFERRED).  This caused a
   * 1-2 frame window where:
   *   1. Meshes exist with default identity matrices (all at origin)
   *   2. onBeforeRender sets uChunkReveal = 1.0 (correct)
   *   3. Three.js renders instances at ORIGIN instead of real positions
   *   4. vFogDepth = distance(camera, origin) → potentially HUGE
   *   5. fogFactor → HIGH → combinedVis → LOW → chunk appears fogged
   *
   * Since the camera constantly moves and new chunks stream in,
   * there were always SOME chunks in this "origin fog flash" state,
   * creating persistent dark/fogged patches near the camera.
   *
   * By doing everything in useLayoutEffect, instance positions are
   * correct BEFORE the first render — no more origin-fog flash.
   */
  useLayoutEffect(() => {
    /* ── Set up instance data (positions + colors) ── */
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

    /* ── Attach onBeforeRender callbacks ── */
    const rv = revealRef;
    const callback = (
      renderer: THREE.WebGLRenderer, _scene: THREE.Scene,
      _camera: THREE.Camera, _geometry: THREE.BufferGeometry,
      material: THREE.Material,
    ) => {
      const shader = (material as THREE.MeshStandardMaterial).userData._shaderRef as
        { uniforms: Record<string, { value: unknown }> } | undefined;
      if (!shader) return;

      /* Set JS-side value (used by Three.js's first-use upload) */
      shader.uniforms.uChunkReveal.value = rv.current;

      /* Direct GPU upload: bypass Three.js's material-level caching
       * that skips re-upload for consecutive same-material draw calls. */
      const matProps = (renderer.properties as any).get(material) as
        { currentProgram?: { getUniforms(): { setValue(gl: WebGLRenderingContext | WebGL2RenderingContext, name: string, value: unknown): void } } } | undefined;
      const prog = matProps?.currentProgram;
      if (prog) {
        const gl = renderer.getContext();
        prog.getUniforms().setValue(gl, 'uChunkReveal', rv.current);
      }
    };
    const meshes = [solidMesh, waterMesh, miniMesh, paintMesh];
    for (const mesh of meshes) {
      if (mesh) mesh.onBeforeRender = callback;
    }
    return () => {
      for (const mesh of meshes) {
        if (mesh) mesh.onBeforeRender = () => {};
      }
    };
  }, [data]);

  /* ── Per-frame: continuous distance-proportional edge fade ──
   *
   * revealRef starts at 1.0 (fully visible).  Each frame it is driven
   * toward a distance-based target via exponential smoothing.
   * Close chunks always target 1.0 and stay bright.
   * Far chunks smoothly fade toward 0 to hide the render edge.
   *
   * Standard Three.js FogExp2 handles the per-pixel atmospheric haze.
   * The reveal only controls the render-distance edge — chunks that
   * are about to pop in/out of existence.  The post-dithering shader
   * step blends toward fogColor proportionally to (1 - reveal).
   *
   * Safety floor: chunks within 30% of render distance always get
   * reveal = 1.0 (fully visible), guaranteed.  Combined with the
   * fact that the shader skips the reveal mix when cr ≈ 1.0, this
   * ensures close/mid-range terrain is ONLY affected by standard
   * Three.js fog — zero custom behaviour.
   */
  useFrame(({ camera }, frameDelta) => {
    const dt = Math.min(0.1, frameDelta); // cap for tab-switch safety

    /* ── Distance ── */
    const dx = camera.position.x - chunkCx.current;
    const dz = camera.position.z - chunkCz.current;
    const dist2 = dx * dx + dz * dz;
    const maxDist2 = renderDistance * renderDistance * CWS2;

    /* Guard: if renderDistance is 0 or NaN, default to fully visible */
    if (!(maxDist2 > 0)) {
      revealRef.current = 1;
      return;
    }

    const normDist = Math.min(1, Math.sqrt(dist2 / maxDist2));

    /* ── Distance-based target reveal (smoothstep falloff) ── */
    const fs = chunkFadeStart < 0 ? 0 : chunkFadeStart > 1 ? 1 : chunkFadeStart;
    const str = chunkFadeStrength < 0 ? 0 : chunkFadeStrength > 1 ? 1 : chunkFadeStrength;
    let target: number;
    if (fs >= 0.99 || str <= 0.01) {
      target = 1;
    } else {
      const t = normDist <= fs ? 0 : (normDist - fs) / (1 - fs);
      const fade = t * t * (3 - 2 * t); // smoothstep
      target = 1 - fade * str;
    }

    /* ── Safety floor: close/mid chunks are always fully visible ──
     * Chunks within 30% of render distance are LOCKED to 1.0.
     * This guarantees they get ZERO reveal effect — only standard
     * Three.js fog affects them. */
    if (normDist < 0.3) {
      target = 1;
    }

    /* ── Exponential approach ── */
    const speed = 4.0 + (1 - normDist) * 11.0;
    const cur = revealRef.current;
    const diff = target - cur;
    const next = Math.abs(diff) < 0.003 ? target : cur + diff * Math.min(1, dt * speed);

    /* NaN guard */
    revealRef.current = Number.isFinite(next) ? next : 1;
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

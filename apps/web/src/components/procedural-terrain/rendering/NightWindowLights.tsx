/* ═══════════════════════════════════════════════════════════════
 *  Night Window Lights — glowing windows on buildings at night
 *
 *  Two-layer rendering for maximum visibility:
 *  1. Inner glow: slightly larger than voxel so it protrudes past the
 *     opaque building wall (fixes z-fighting with same-position voxels).
 *  2. Outer halo: larger, softer glow around each window for bloom effect.
 *
 *  Street lamp lights use smooth sprite-based rendering:
 *  - Sprite at fixture: smooth radial gradient (no polygon edges)
 *  - Ground pool: flat disc sprite projected below for realistic light cone
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

/* ── Street lamp: smooth sprite-based glow (no polygon edges) ── */
// Generate radial gradient texture for smooth light glow
function createGlowTexture(size: number, falloffPower: number): THREE.Texture {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const center = size / 2;
  const gradient = ctx.createRadialGradient(center, center, 0, center, center, center);
  gradient.addColorStop(0, 'rgba(255,255,255,1.0)');
  gradient.addColorStop(0.15, 'rgba(255,255,255,0.8)');
  gradient.addColorStop(0.4, `rgba(255,255,255,${(0.3 / falloffPower).toFixed(2)})`);
  gradient.addColorStop(0.7, `rgba(255,255,255,${(0.08 / falloffPower).toFixed(2)})`);
  gradient.addColorStop(1, 'rgba(255,255,255,0.0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

// Fixture glow sprite (bright, compact)
const LAMP_GLOW_TEX = createGlowTexture(128, 1.0);
const LAMP_FIXTURE_SIZE = VOXEL_SIZE * 3.0;
const LAMP_FIXTURE_GEO = new THREE.PlaneGeometry(LAMP_FIXTURE_SIZE, LAMP_FIXTURE_SIZE);

// Ground light pool (wide, soft disc)
const LAMP_GROUND_TEX = createGlowTexture(128, 0.6);
const LAMP_GROUND_SIZE = VOXEL_SIZE * 8.0;
const LAMP_GROUND_GEO = (() => {
  const g = new THREE.PlaneGeometry(LAMP_GROUND_SIZE, LAMP_GROUND_SIZE);
  g.rotateX(-Math.PI / 2); // lay flat
  return g;
})();

/* ── Tuning constants ── */
const FLICKER_HASH_THRESHOLD = 0.55;
const FLICKER_OFF_THRESHOLD = -0.35;
/** Base window light instance budget. Scales up dynamically with lightDistance. */
const BASE_WINDOW_INSTANCES = 6000;
/** Base street lamp instance budget. Scales up dynamically with lightDistance. */
const BASE_LAMP_INSTANCES = 1024;

/* ── Lamp color temperature presets ── */
const LAMP_COLOR_PRESETS: Record<string, { fixture: string; ground: string }> = {
  warm:    { fixture: '#ffe8cc', ground: '#ffd9a0' },
  neutral: { fixture: '#fff5e6', ground: '#ffe8cc' },
  cool:    { fixture: '#e8f0ff', ground: '#d0e0ff' },
  sodium:  { fixture: '#ffaa44', ground: '#ff9933' },
};

function winHash(x: number, y: number, z: number): number {
  let h = (Math.round(x * 100) * 374761393 + Math.round(y * 100) * 668265263 + Math.round(z * 100) * 1274126177) | 0;
  h = Math.imul(h ^ (h >>> 13), 1103515245);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

function setMaterialOpacity(mat: THREE.MeshBasicMaterial, opacity: number) {
  mat.opacity = opacity;
}

/** Warm window light colors — saturated for additive blending visibility */
const WARM_COLORS = [
  new THREE.Color('#ffdd88'),
  new THREE.Color('#ffeebb'),
  new THREE.Color('#ffcc66'),
  new THREE.Color('#eebb55'),
  new THREE.Color('#ffaa44'),
  new THREE.Color('#88bbff'),
];

export function NightWindowLights({
  chunkCacheRef,
  windowLitProbability,
  lightDistance,
  lightFadeStart,
  lampBrightness,
  lampColorTemp,
}: {
  chunkCacheRef: React.RefObject<Map<string, ChunkVoxelData>>;
  windowLitProbability: number;
  lightDistance: number;
  lightFadeStart: number;
  lampBrightness: number;
  lampColorTemp: string;
}) {
  const innerRef = useRef<THREE.InstancedMesh>(null);
  const outerRef = useRef<THREE.InstancedMesh>(null);
  const lampFixtureRef = useRef<THREE.InstancedMesh>(null);
  const lampGroundRef = useRef<THREE.InstancedMesh>(null);
  const timeRef = useContext(TimeContext);
  const { camera } = useThree();

  /* ── Dynamic instance budget: scales with lightDistance ── */
  const maxWindowInstances = useMemo(() => {
    const scale = Math.max(1, lightDistance / 12);
    return Math.min(30000, Math.round(BASE_WINDOW_INSTANCES * scale));
  }, [lightDistance]);

  const maxLampInstances = useMemo(() => {
    const scale = Math.max(1, lightDistance / 12);
    return Math.min(8192, Math.round(BASE_LAMP_INSTANCES * scale));
  }, [lightDistance]);

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

  /* Lamp fixture: smooth sprite glow — billboard-facing camera */
  const lampFixtureMat = useMemo(() => new THREE.MeshBasicMaterial({
    transparent: true, opacity: 0, depthWrite: false,
    blending: THREE.AdditiveBlending, toneMapped: false,
    map: LAMP_GLOW_TEX, side: THREE.DoubleSide,
  }), []);

  /* Lamp ground pool: flat disc of light */
  const lampGroundMat = useMemo(() => new THREE.MeshBasicMaterial({
    transparent: true, opacity: 0, depthWrite: false,
    blending: THREE.AdditiveBlending, toneMapped: false,
    map: LAMP_GROUND_TEX, side: THREE.DoubleSide,
  }), []);

  /* ── Reusable objects for per-frame work (avoids GC churn) ── */
  const _camDir = useMemo(() => new THREE.Vector3(), []);

  useFrame(({ clock }) => {
    const inner = innerRef.current;
    const outer = outerRef.current;
    const lampFixture = lampFixtureRef.current;
    const lampGround = lampGroundRef.current;
    if (!inner || !outer || !lampFixture || !lampGround || !timeRef) return;

    const state = timeRef.current;
    const hour = state.hour;

    // Night intensity: 0 during day, 1 at deep night
    let nightFactor = 0;
    if (hour >= 17.5 && hour < 19.5) {
      nightFactor = (hour - 17.5) / 2;
    } else if (hour >= 19.5 || hour < 5) {
      nightFactor = 1;
    } else if (hour >= 5 && hour < 6.5) {
      nightFactor = 1 - (hour - 5) / 1.5;
    }

    /* ── Sleep cycle: realistic window turn-off pattern through the night ──
     *  People go to bed progressively starting around 22:00.
     *  By 2:00am only ~15% of windows remain lit (night owls, 24hr shops).
     *  Early risers start turning lights on around 4:30.
     *  This modulates the effective windowLitProbability. */
    let sleepFactor = 1.0; // 1 = all awake, 0.15 = deep sleep (only insomniacs left)
    if (hour >= 21 && hour < 24) {
      // 21:00 → 24:00: gradual decline from 100% to 25%
      sleepFactor = 1.0 - 0.75 * ((hour - 21) / 3);
    } else if (hour >= 0 && hour < 2) {
      // 0:00 → 2:00: continue declining from 25% to 15%
      sleepFactor = 0.25 - 0.10 * (hour / 2);
    } else if (hour >= 2 && hour < 4.5) {
      // 2:00 → 4:30: deep sleep, minimal lights
      sleepFactor = 0.15;
    } else if (hour >= 4.5 && hour < 6) {
      // 4:30 → 6:00: early risers, lights coming back on
      sleepFactor = 0.15 + 0.85 * ((hour - 4.5) / 1.5);
    }
    // During daytime or early evening (6:00-21:00), sleepFactor stays at 1.0
    const effectiveLitProb = windowLitProbability * sleepFactor;

    if (nightFactor <= 0.01) {
      setMaterialOpacity(innerMat, 0);
      setMaterialOpacity(outerMat, 0);
      setMaterialOpacity(lampFixtureMat, 0);
      setMaterialOpacity(lampGroundMat, 0);
      inner.count = 0;
      outer.count = 0;
      lampFixture.count = 0;
      lampGround.count = 0;
      if (inner.instanceMatrix) inner.instanceMatrix.needsUpdate = true;
      if (outer.instanceMatrix) outer.instanceMatrix.needsUpdate = true;
      if (lampFixture.instanceMatrix) lampFixture.instanceMatrix.needsUpdate = true;
      if (lampGround.instanceMatrix) lampGround.instanceMatrix.needsUpdate = true;
      return;
    }

    const brightMul = lampBrightness;
    setMaterialOpacity(innerMat, nightFactor * 0.95);
    setMaterialOpacity(outerMat, nightFactor * 0.25);
    setMaterialOpacity(lampFixtureMat, nightFactor * Math.min(1.0, 0.85 * brightMul));
    setMaterialOpacity(lampGroundMat, nightFactor * Math.min(1.0, 0.35 * brightMul));

    const cache = chunkCacheRef.current;
    if (!cache) return;

    const chunkWorldSize = CHUNK_SIZE * VOXEL_SIZE;
    const camCX = Math.floor(camera.position.x / chunkWorldSize);
    const camCZ = Math.floor(camera.position.z / chunkWorldSize);
    const camWX = camera.position.x;
    const camWY = camera.position.y;
    const camWZ = camera.position.z;

    const viewDistSq = lightDistance * lightDistance;

    /* ── Per-light distance fade parameters (world-space) ──
     *  maxWorldDist: maximum world distance for any light to be rendered
     *  fadeWorldStart: world distance where fade begins (full brightness below this)
     *  Lights beyond maxWorldDist are skipped entirely.
     *  Lights between fadeWorldStart and maxWorldDist fade smoothly to 0.
     *  lightFadeStart=0.5 means fade begins at 50% of max distance (default).
     *  lightFadeStart=1.0 means no fade at all (hard cutoff).
     *  lightFadeStart=0.0 means fade from the very beginning. */
    const maxWorldDist = lightDistance * chunkWorldSize;
    const fadeWorldStart = maxWorldDist * Math.max(0, Math.min(1, lightFadeStart));
    const fadeRange = maxWorldDist - fadeWorldStart;

    /* ── Camera forward direction (XZ plane) for directional prioritization ── */
    camera.getWorldDirection(_camDir);
    const fwdX = _camDir.x;
    const fwdZ = _camDir.z;
    const fwdLen = Math.sqrt(fwdX * fwdX + fwdZ * fwdZ);
    const nfwdX = fwdLen > 0.001 ? fwdX / fwdLen : 0;
    const nfwdZ = fwdLen > 0.001 ? fwdZ / fwdLen : -1;

    const m = new THREE.Matrix4();
    const c = new THREE.Color();
    let count = 0;
    let lampCount = 0;
    const t = clock.getElapsedTime();

    /* ── Street lamp color from config ── */
    const preset = LAMP_COLOR_PRESETS[lampColorTemp] || LAMP_COLOR_PRESETS.sodium;
    const lampColor = new THREE.Color(preset.fixture);
    const lampGroundColor = new THREE.Color(preset.ground);

    // Billboard rotation: make fixture sprites face camera
    const camQuat = camera.quaternion;

    /* ── Build sorted chunk list ──
     *  Two-tier priority: (1) distance is PRIMARY — close chunks ALWAYS come first,
     *  (2) direction is SECONDARY — within similar distances, front-facing get priority.
     *  This guarantees nearby lights are never starved by distant front-facing chunks. */
    type ChunkEntry = { data: ChunkVoxelData; distSq: number };
    const sortedChunks: ChunkEntry[] = [];

    for (const [, data] of cache) {
      const dx = data.chunkX - camCX;
      const dz = data.chunkZ - camCZ;
      const distSq = dx * dx + dz * dz;
      if (distSq > viewDistSq) continue;
      sortedChunks.push({ data, distSq });
    }

    // Sort by distance first (close = first), then direction as tiebreaker
    sortedChunks.sort((a, b) => {
      // Primary: distance bands (group into rings of 2 chunk radius)
      const aBand = Math.floor(Math.sqrt(a.distSq) * 0.5);
      const bBand = Math.floor(Math.sqrt(b.distSq) * 0.5);
      if (aBand !== bBand) return aBand - bBand;
      // Secondary: within same distance band, front-facing chunks first
      const aDx = a.data.chunkX - camCX, aDz = a.data.chunkZ - camCZ;
      const bDx = b.data.chunkX - camCX, bDz = b.data.chunkZ - camCZ;
      const aLen = Math.sqrt(a.distSq) || 1;
      const bLen = Math.sqrt(b.distSq) || 1;
      const aDot = (aDx * nfwdX + aDz * nfwdZ) / aLen;
      const bDot = (bDx * nfwdX + bDz * nfwdZ) / bLen;
      return bDot - aDot; // higher dot = more in front = first
    });

    /* ── Helper: per-light world-space distance fade ──
     *  Returns brightness multiplier 0-1 based on 3D distance from camera to light.
     *  Lights within fadeWorldStart get 1.0.
     *  Lights between fadeWorldStart and maxWorldDist fade linearly to 0.
     *  Lights beyond maxWorldDist are 0 (but shouldn't reach here due to chunk filter). */
    function lightFade(lx: number, ly: number, lz: number): number {
      const dx = lx - camWX;
      const dy = ly - camWY;
      const dz = lz - camWZ;
      const worldDist = Math.sqrt(dx * dx + dy * dy + dz * dz);
      if (worldDist <= fadeWorldStart) return 1.0;
      if (fadeRange < 0.001) return worldDist <= maxWorldDist ? 1.0 : 0.0;
      const t2 = (worldDist - fadeWorldStart) / fadeRange;
      return Math.max(0, 1.0 - t2);
    }

    /* ── Process sorted chunks ── */
    for (const entry of sortedChunks) {
      const { data } = entry;

      /* ── Window lights ── */
      if (count < maxWindowInstances) {
        for (let i = 0; i < data.windowLightCount && count < maxWindowInstances; i++) {
          const i3 = i * 3;
          const wx = data.windowLights[i3];
          const wy = data.windowLights[i3 + 1];
          const wz = data.windowLights[i3 + 2];

          const h = winHash(wx, wy, wz);
          if (h > effectiveLitProb) continue;

          // Per-light distance fade
          const fade = lightFade(wx, wy, wz);
          if (fade <= 0.01) continue; // skip invisible lights entirely

          const flickerPhase = h * 100;
          const flickerSpeed = 0.08 + h * 0.15;
          const flicker = Math.sin(t * flickerSpeed + flickerPhase);
          if (h > FLICKER_HASH_THRESHOLD && flicker < FLICKER_OFF_THRESHOLD) continue;

          m.identity();
          m.elements[12] = wx;
          m.elements[13] = wy;
          m.elements[14] = wz;
          inner.setMatrixAt(count, m);
          outer.setMatrixAt(count, m);

          const colorIdx = Math.floor(h * WARM_COLORS.length) % WARM_COLORS.length;
          c.copy(WARM_COLORS[colorIdx]);
          const brightness = (0.8 + h * 0.4 + flicker * 0.08) * fade;
          c.multiplyScalar(brightness);
          inner.setColorAt(count, c);

          c.multiplyScalar(0.5);
          outer.setColorAt(count, c);

          count++;
        }
      }

      /* ── Street lamp lights (smooth sprite-based) ── */
      if (data.streetLights && lampCount < maxLampInstances) {
        for (let i = 0; i < data.streetLightCount && lampCount < maxLampInstances; i++) {
          const i3 = i * 3;
          const lx = data.streetLights[i3];
          const ly = data.streetLights[i3 + 1];
          const lz = data.streetLights[i3 + 2];

          // Per-light distance fade
          const fade = lightFade(lx, ly, lz);
          if (fade <= 0.01) continue; // skip invisible lamps entirely

          // Subtle flicker (very mild — mostly steady)
          const lh = winHash(lx, ly, lz);
          const lampFlicker = 0.95 + Math.sin(t * 0.3 + lh * 50) * 0.05;

          // Fixture sprite: billboard facing camera
          m.makeRotationFromQuaternion(camQuat);
          m.elements[12] = lx;
          m.elements[13] = ly;
          m.elements[14] = lz;
          lampFixture.setMatrixAt(lampCount, m);

          // Ground light pool: flat disc below lamp
          const groundY = ly - VOXEL_SIZE * 5.5;
          m.identity();
          m.elements[12] = lx;
          m.elements[13] = groundY;
          m.elements[14] = lz;
          lampGround.setMatrixAt(lampCount, m);

          // Colors with brightness multiplier and per-light distance fade
          const lampFade = lampFlicker * brightMul * fade;
          c.copy(lampColor).multiplyScalar(lampFade);
          lampFixture.setColorAt(lampCount, c);
          c.copy(lampGroundColor).multiplyScalar(lampFade * 0.5);
          lampGround.setColorAt(lampCount, c);

          lampCount++;
        }
      }
    }

    inner.count = count;
    outer.count = count;
    lampFixture.count = lampCount;
    lampGround.count = lampCount;
    if (inner.instanceMatrix) inner.instanceMatrix.needsUpdate = true;
    if (inner.instanceColor) inner.instanceColor.needsUpdate = true;
    if (outer.instanceMatrix) outer.instanceMatrix.needsUpdate = true;
    if (outer.instanceColor) outer.instanceColor.needsUpdate = true;
    if (lampFixture.instanceMatrix) lampFixture.instanceMatrix.needsUpdate = true;
    if (lampFixture.instanceColor) lampFixture.instanceColor.needsUpdate = true;
    if (lampGround.instanceMatrix) lampGround.instanceMatrix.needsUpdate = true;
    if (lampGround.instanceColor) lampGround.instanceColor.needsUpdate = true;
  });

  return (
    <>
      <instancedMesh ref={outerRef} args={[WIN_OUTER_GEO, outerMat, maxWindowInstances]} frustumCulled={false} renderOrder={998} />
      <instancedMesh ref={innerRef} args={[WIN_INNER_GEO, innerMat, maxWindowInstances]} frustumCulled={false} renderOrder={999} />
      {/* Street lamp lights — smooth sprite-based */}
      <instancedMesh ref={lampGroundRef} args={[LAMP_GROUND_GEO, lampGroundMat, maxLampInstances]} frustumCulled={false} renderOrder={996} />
      <instancedMesh ref={lampFixtureRef} args={[LAMP_FIXTURE_GEO, lampFixtureMat, maxLampInstances]} frustumCulled={false} renderOrder={1000} />
    </>
  );
}

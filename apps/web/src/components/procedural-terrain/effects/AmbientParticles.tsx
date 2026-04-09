/* ═══════════════════════════════════════════════════════════════
 *  Biome-Aware Ambient Particles
 * ═══════════════════════════════════════════════════════════════ */
'use client';

import { useRef, useEffect, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const BIOME_PARTICLE_CONFIG: Record<string, { color: string; count: number; size: number; speed: number; drift: [number, number, number]; opacity: number; heightRange: [number, number] }> = {
  Forest:    { color: '#ddee55', count: 50, size: 0.12, speed: 0.3, drift: [0.2, 0.4, 0.2], opacity: 0.7, heightRange: [0.5, 5] },
  Desert:    { color: '#eeddaa', count: 30, size: 0.08, speed: 0.8, drift: [1.2, 0.1, 0.4], opacity: 0.4, heightRange: [0.3, 3] },
  Tundra:    { color: '#ffffff', count: 60, size: 0.10, speed: 0.5, drift: [0.3, -0.6, 0.3], opacity: 0.6, heightRange: [0.5, 6] },
  Ocean:     { color: '#aaddee', count: 25, size: 0.06, speed: 0.4, drift: [0.1, 0.5, 0.1], opacity: 0.35, heightRange: [0.2, 3] },
  Plains:    { color: '#ffffee', count: 20, size: 0.07, speed: 0.2, drift: [0.15, 0.3, 0.15], opacity: 0.45, heightRange: [0.3, 4] },
  Mountains: { color: '#bbccdd', count: 35, size: 0.09, speed: 0.15, drift: [0.4, 0.1, 0.4], opacity: 0.3, heightRange: [1, 8] },
  City:      { color: '#ffeecc', count: 15, size: 0.05, speed: 0.1, drift: [0.1, 0.15, 0.1], opacity: 0.25, heightRange: [0.5, 4] },
  Swamp:    { color: '#88aa44', count: 40, size: 0.08, speed: 0.2, drift: [0.1, 0.2, 0.1], opacity: 0.5, heightRange: [0.3, 4] },
  Village:  { color: '#ffee88', count: 15, size: 0.06, speed: 0.15, drift: [0.1, 0.2, 0.1], opacity: 0.4, heightRange: [0.5, 3] },
};

export function AmbientParticles({ biome, intensity }: { biome: string; intensity: number }) {
  const ref = useRef<THREE.Points>(null);
  const { camera } = useThree();
  const cfg = BIOME_PARTICLE_CONFIG[biome] || BIOME_PARTICLE_CONFIG.Plains;
  const RANGE = 10;
  const activeCount = Math.max(1, Math.round(cfg.count * intensity));

  const geo = useMemo(() => {
    let seed2 = 42;
    const rand = () => { seed2 = (seed2 + 0x6D2B79F5) | 0; let t = Math.imul(seed2 ^ (seed2 >>> 15), 1 | seed2); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
    const maxC = 60;
    const pos = new Float32Array(maxC * 3);
    for (let i = 0; i < maxC; i++) {
      pos[i * 3]     = (rand() - 0.5) * RANGE * 2;
      pos[i * 3 + 1] = cfg.heightRange[0] + rand() * (cfg.heightRange[1] - cfg.heightRange[0]);
      pos[i * 3 + 2] = (rand() - 0.5) * RANGE * 2;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    return g;
  }, [cfg.heightRange]);

  const mat = useMemo(() => new THREE.PointsMaterial({
    color: cfg.color, size: cfg.size, transparent: true, opacity: cfg.opacity,
    sizeAttenuation: true, depthWrite: false,
  }), [cfg.color, cfg.size, cfg.opacity]);

  useEffect(() => { geo.setDrawRange(0, activeCount); }, [geo, activeCount]);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    const attr = ref.current.geometry.getAttribute('position') as THREE.BufferAttribute;
    const arr = attr.array as Float32Array;

    for (let i = 0; i < activeCount; i++) {
      const i3 = i * 3;
      arr[i3]     += Math.sin(t * cfg.speed + i * 1.7) * cfg.drift[0] * 0.02;
      arr[i3 + 1] += cfg.drift[1] * 0.01 + Math.sin(t * 0.3 + i * 2.3) * 0.005;
      arr[i3 + 2] += Math.cos(t * cfg.speed + i * 2.1) * cfg.drift[2] * 0.02;

      const dx2 = arr[i3] - (camera.position.x - ref.current.position.x);
      const dz2 = arr[i3 + 2] - (camera.position.z - ref.current.position.z);
      const maxH = cfg.heightRange[1] + 2;
      if (dx2 * dx2 + dz2 * dz2 > RANGE * RANGE * 4 || arr[i3 + 1] > maxH || arr[i3 + 1] < 0) {
        arr[i3]     = (Math.random() - 0.5) * RANGE * 2;
        arr[i3 + 1] = cfg.heightRange[0] + Math.random() * (cfg.heightRange[1] - cfg.heightRange[0]);
        arr[i3 + 2] = (Math.random() - 0.5) * RANGE * 2;
      }
    }
    attr.needsUpdate = true;
    ref.current.position.copy(camera.position);
  });

  return <points ref={ref} geometry={geo} material={mat} />;
}

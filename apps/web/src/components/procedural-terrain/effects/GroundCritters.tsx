/* ═══════════════════════════════════════════════════════════════
 *  Ground Critters — small life near terrain surface
 * ═══════════════════════════════════════════════════════════════ */
'use client';

import { useRef, useEffect, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface CritterState {
  dir: number;
  speed: number;
  moveTime: number;
  pauseTime: number;
  moving: boolean;
}

const BIOME_CRITTER_CONFIG: Record<string, { count: number; color: string; size: number; speedRange: [number, number]; groundY: number }> = {
  Forest:    { count: 8, color: '#886633', size: 0.06, speedRange: [0.3, 0.8], groundY: 0.15 },
  Plains:    { count: 6, color: '#669944', size: 0.05, speedRange: [0.5, 1.2], groundY: 0.12 },
  Desert:    { count: 4, color: '#ccaa77', size: 0.05, speedRange: [0.8, 1.8], groundY: 0.10 },
  Tundra:    { count: 3, color: '#ddeeff', size: 0.06, speedRange: [0.2, 0.5], groundY: 0.12 },
  Ocean:     { count: 3, color: '#cc6644', size: 0.05, speedRange: [0.3, 0.6], groundY: 0.08 },
  City:      { count: 5, color: '#888888', size: 0.04, speedRange: [0.6, 1.5], groundY: 0.10 },
  Mountains: { count: 2, color: '#99aabb', size: 0.05, speedRange: [0.2, 0.4], groundY: 0.12 },
};

const MAX_CRITTERS = 12;

export function GroundCritters({ biome, intensity }: { biome: string; intensity: number }) {
  const ref = useRef<THREE.Points>(null);
  const { camera } = useThree();
  const cfg = BIOME_CRITTER_CONFIG[biome] || BIOME_CRITTER_CONFIG.Plains;
  const RANGE = 8;
  const activeCount = Math.max(0, Math.round(cfg.count * intensity));

  const states = useRef<CritterState[]>([]);

  const geo = useMemo(() => {
    let s2 = 31337;
    const rnd = () => { s2 = (s2 + 0x6D2B79F5) | 0; let t2 = Math.imul(s2 ^ (s2 >>> 15), 1 | s2); t2 = (t2 + Math.imul(t2 ^ (t2 >>> 7), 61 | t2)) ^ t2; return ((t2 ^ (t2 >>> 14)) >>> 0) / 4294967296; };
    const pos = new Float32Array(MAX_CRITTERS * 3);
    const st: CritterState[] = [];
    for (let i = 0; i < MAX_CRITTERS; i++) {
      pos[i * 3]     = (rnd() - 0.5) * RANGE * 2;
      pos[i * 3 + 1] = cfg.groundY;
      pos[i * 3 + 2] = (rnd() - 0.5) * RANGE * 2;
      st.push({
        dir: rnd() * Math.PI * 2,
        speed: cfg.speedRange[0] + rnd() * (cfg.speedRange[1] - cfg.speedRange[0]),
        moveTime: 0.5 + rnd() * 2,
        pauseTime: 0,
        moving: true,
      });
    }
    states.current = st;
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setDrawRange(0, cfg.count);
    return g;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [RANGE]);

  useEffect(() => { geo.setDrawRange(0, Math.min(activeCount, MAX_CRITTERS)); }, [geo, activeCount]);

  const mat = useMemo(() => new THREE.PointsMaterial({
    color: cfg.color, size: cfg.size, transparent: true, opacity: 0.7,
    sizeAttenuation: true, depthWrite: false,
  }), [cfg.color, cfg.size]);

  useFrame((_, delta) => {
    if (!ref.current) return;
    const attr = ref.current.geometry.getAttribute('position') as THREE.BufferAttribute;
    const arr = attr.array as Float32Array;
    const dt = Math.min(delta, 0.05);

    for (let i = 0; i < activeCount && i < MAX_CRITTERS; i++) {
      const st = states.current[i];
      if (!st) continue;
      const i3 = i * 3;

      if (st.moving) {
        arr[i3]     += Math.cos(st.dir) * st.speed * dt;
        arr[i3 + 2] += Math.sin(st.dir) * st.speed * dt;
        arr[i3 + 1] = cfg.groundY;

        st.moveTime -= dt;
        if (st.moveTime <= 0) {
          st.moving = false;
          st.pauseTime = 0.3 + Math.random() * 1.5;
        }
      } else {
        st.pauseTime -= dt;
        if (st.pauseTime <= 0) {
          st.dir = Math.random() * Math.PI * 2;
          st.speed = cfg.speedRange[0] + Math.random() * (cfg.speedRange[1] - cfg.speedRange[0]);
          st.moveTime = 0.5 + Math.random() * 2.5;
          st.moving = true;
        }
      }

      const dx2 = arr[i3], dz2 = arr[i3 + 2];
      if (dx2 * dx2 + dz2 * dz2 > RANGE * RANGE * 4) {
        arr[i3]     = (Math.random() - 0.5) * RANGE;
        arr[i3 + 2] = (Math.random() - 0.5) * RANGE;
        st.dir = Math.random() * Math.PI * 2;
      }
    }
    attr.needsUpdate = true;
    ref.current.position.set(camera.position.x, 0, camera.position.z);
  });

  return <points ref={ref} geometry={geo} material={mat} />;
}

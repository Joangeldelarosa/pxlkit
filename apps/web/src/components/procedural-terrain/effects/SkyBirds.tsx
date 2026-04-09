/* ═══════════════════════════════════════════════════════════════
 *  Sky Birds — flock simulation
 * ═══════════════════════════════════════════════════════════════ */
'use client';

import { useRef, useEffect, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface BirdFlock {
  cx: number; cz: number;
  baseAlt: number;
  orbitR: number;
  speed: number;
  count: number;
  phaseOff: number;
}

const BIOME_BIRD_CONFIG: Record<string, { flocks: number; color: string; wingColor: string; size: number }> = {
  Forest:    { flocks: 3, color: '#443322', wingColor: '#554433', size: 0.18 },
  Plains:    { flocks: 3, color: '#553322', wingColor: '#664433', size: 0.16 },
  Mountains: { flocks: 2, color: '#445566', wingColor: '#556677', size: 0.20 },
  Tundra:    { flocks: 1, color: '#667788', wingColor: '#778899', size: 0.15 },
  Desert:    { flocks: 1, color: '#887766', wingColor: '#998877', size: 0.14 },
  Ocean:     { flocks: 2, color: '#aabbcc', wingColor: '#bbccdd', size: 0.17 },
  City:      { flocks: 1, color: '#555555', wingColor: '#666666', size: 0.12 },
};

const MAX_BIRD_POINTS = 120;

export function SkyBirds({ biome, intensity }: { biome: string; intensity: number }) {
  const ref = useRef<THREE.Points>(null);
  const { camera } = useThree();
  const cfg = BIOME_BIRD_CONFIG[biome] || BIOME_BIRD_CONFIG.Plains;
  const effectiveFlocks = Math.max(0, Math.round(cfg.flocks * intensity));

  const flocks = useMemo(() => {
    const sd = { v: 7919 };
    const rnd = () => { sd.v = (sd.v + 0x6D2B79F5) | 0; let t = Math.imul(sd.v ^ (sd.v >>> 15), 1 | sd.v); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
    const fl: BirdFlock[] = [];
    for (let f = 0; f < effectiveFlocks; f++) {
      const isLone = rnd() < 0.35;
      fl.push({
        cx: (rnd() - 0.5) * 30,
        cz: (rnd() - 0.5) * 30,
        baseAlt: 10 + rnd() * 12,
        orbitR: 4 + rnd() * 8,
        speed: 0.15 + rnd() * 0.25,
        count: isLone ? 1 : 3 + Math.floor(rnd() * 5),
        phaseOff: rnd() * Math.PI * 2,
      });
    }
    return fl;
  }, [effectiveFlocks]);

  const totalPts = useMemo(() => {
    let n = 0;
    for (const f of flocks) n += f.count * 3;
    return Math.min(n, MAX_BIRD_POINTS);
  }, [flocks]);

  const geo = useMemo(() => {
    const pos = new Float32Array(MAX_BIRD_POINTS * 3);
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setDrawRange(0, totalPts);
    return g;
  }, [totalPts]);

  const colGeo = useMemo(() => {
    const col = new Float32Array(MAX_BIRD_POINTS * 3);
    const bodyC = new THREE.Color(cfg.color);
    const wingC = new THREE.Color(cfg.wingColor);
    let idx = 0;
    for (const f of flocks) {
      for (let b = 0; b < f.count && idx < MAX_BIRD_POINTS; b++) {
        col[idx * 3] = bodyC.r; col[idx * 3 + 1] = bodyC.g; col[idx * 3 + 2] = bodyC.b; idx++;
        if (idx < MAX_BIRD_POINTS) { col[idx * 3] = wingC.r; col[idx * 3 + 1] = wingC.g; col[idx * 3 + 2] = wingC.b; idx++; }
        if (idx < MAX_BIRD_POINTS) { col[idx * 3] = wingC.r; col[idx * 3 + 1] = wingC.g; col[idx * 3 + 2] = wingC.b; idx++; }
      }
    }
    return new THREE.Float32BufferAttribute(col, 3);
  }, [flocks, cfg.color, cfg.wingColor]);

  useEffect(() => { geo.setAttribute('color', colGeo); }, [geo, colGeo]);

  const mat = useMemo(() => new THREE.PointsMaterial({
    size: cfg.size, vertexColors: true, transparent: true, opacity: 0.85,
    sizeAttenuation: true, depthWrite: false,
  }), [cfg.size]);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    const attr = ref.current.geometry.getAttribute('position') as THREE.BufferAttribute;
    const arr = attr.array as Float32Array;

    let pi = 0;
    for (const f of flocks) {
      for (let b = 0; b < f.count && pi < MAX_BIRD_POINTS; b++) {
        const phase = f.phaseOff + b * 0.4;
        const angle = t * f.speed + phase;
        const bx = f.cx + Math.cos(angle) * f.orbitR + Math.sin(t * 0.1 + b) * 1.5;
        const bz = f.cz + Math.sin(angle) * f.orbitR + Math.cos(t * 0.08 + b * 2) * 1.5;
        const wingBeat = Math.sin(t * 4 + b * 1.7) * 0.15;
        const by = f.baseAlt + Math.sin(t * 0.2 + phase) * 1.5 + wingBeat;

        arr[pi * 3] = bx; arr[pi * 3 + 1] = by; arr[pi * 3 + 2] = bz; pi++;

        if (pi < MAX_BIRD_POINTS) {
          const dx = -Math.sin(angle) * 0.3;
          const dz = Math.cos(angle) * 0.3;
          const wingDip = Math.sin(t * 6 + b * 2.1) * 0.12;
          arr[pi * 3] = bx + dx; arr[pi * 3 + 1] = by + wingDip; arr[pi * 3 + 2] = bz + dz; pi++;
        }
        if (pi < MAX_BIRD_POINTS) {
          const dx = Math.sin(angle) * 0.3;
          const dz = -Math.cos(angle) * 0.3;
          const wingDip = Math.sin(t * 6 + b * 2.1 + Math.PI) * 0.12;
          arr[pi * 3] = bx + dx; arr[pi * 3 + 1] = by + wingDip; arr[pi * 3 + 2] = bz + dz; pi++;
        }
      }
    }
    attr.needsUpdate = true;
    ref.current.position.copy(camera.position);
  });

  return <points ref={ref} geometry={geo} material={mat} />;
}

'use client';

import { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useMouse } from './mouseContext';

const PARTICLE_COUNT = 60;
const Z_MIN = -8;
const Z_MAX = -3;
const COLOR_HOT = new THREE.Color('#7CFFB7');
const COLOR_COLD = new THREE.Color('#FFFFFF');

type Particle = {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  baseOpacity: number;
  phase: number;
  warm: boolean;
};

function Dust() {
  const { mouseRef } = useMouse();
  const groupRef = useRef<THREE.Group>(null);

  const particles = useMemo<Particle[]>(
    () =>
      Array.from({ length: PARTICLE_COUNT }, () => ({
        x: (Math.random() - 0.5) * 16,
        y: (Math.random() - 0.5) * 10,
        z: Z_MIN + Math.random() * (Z_MAX - Z_MIN),
        vx: (Math.random() - 0.5) * 0.0025,
        vy: (Math.random() - 0.5) * 0.0025,
        baseOpacity: 0.2 + Math.random() * 0.5,
        phase: Math.random() * Math.PI * 2,
        warm: Math.random() < 0.25,
      })),
    [],
  );

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.elapsedTime;
    const children = groupRef.current.children;
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      if (p.x > 8.5) p.x = -8.5;
      else if (p.x < -8.5) p.x = 8.5;
      if (p.y > 5.5) p.y = -5.5;
      else if (p.y < -5.5) p.y = 5.5;

      const m = children[i] as THREE.Mesh | undefined;
      if (!m) continue;
      // subtle parallax from mouse
      m.position.set(p.x + mouseRef.current.x * 0.45, p.y + mouseRef.current.y * 0.25, p.z);
      const mat = m.material as THREE.MeshBasicMaterial;
      mat.opacity = p.baseOpacity * (0.55 + 0.45 * Math.sin(t * 1.6 + p.phase));
    }
  });

  return (
    <group ref={groupRef}>
      {particles.map((p, i) => (
        <mesh key={i} position={[p.x, p.y, p.z]}>
          <planeGeometry args={[0.05, 0.05]} />
          <meshBasicMaterial
            color={p.warm ? COLOR_HOT : COLOR_COLD}
            transparent
            opacity={p.baseOpacity}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}

/**
 * Default-export so HeroCinematic can `next/dynamic` import this with ssr:false.
 * Tiny <Canvas> in the back-most z-layer of the hero, ~60 sprite particles
 * drifting + softly pulsing opacity, with mild mouse parallax.
 */
export default function DustParticles() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 1 }}
    >
      <Canvas
        gl={{ alpha: true, antialias: false, powerPreference: 'low-power' }}
        dpr={1}
        camera={{ position: [0, 0, 5], fov: 50 }}
      >
        <Dust />
      </Canvas>
    </div>
  );
}

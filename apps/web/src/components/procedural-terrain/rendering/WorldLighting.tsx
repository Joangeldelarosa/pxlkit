/* ═══════════════════════════════════════════════════════════════
 *  Lighting, Sky Gradient, and Fog
 * ═══════════════════════════════════════════════════════════════ */
'use client';

import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

export function WorldLighting() {
  return (
    <>
      <ambientLight intensity={0.8} color="#ffffff" />
      <hemisphereLight color="#aaccff" groundColor="#886644" intensity={0.5} />
      <directionalLight position={[50, 80, 50]} intensity={1.4} color="#ffffff" castShadow={false} />
      <directionalLight position={[-30, 40, -30]} intensity={0.6} color="#ffffff" />
    </>
  );
}

export function SkyGradient({ backgroundDetail }: { backgroundDetail: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const { camera } = useThree();
  useFrame(() => { if (meshRef.current) meshRef.current.position.copy(camera.position); });

  const mat = useMemo(() => new THREE.ShaderMaterial({
    uniforms: { uDetail: { value: backgroundDetail } },
    vertexShader: `
      varying vec3 vWP;
      void main() {
        vec4 w = modelMatrix * vec4(position, 1.0);
        vWP = w.xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
    fragmentShader: `
      uniform float uDetail;
      varying vec3 vWP;
      float hash(float n) { return fract(sin(n) * 43758.5453); }
      float snoise(float x) {
        float i = floor(x);
        float f = fract(x);
        f = f * f * (3.0 - 2.0 * f);
        return mix(hash(i), hash(i + 1.0), f);
      }
      void main() {
        vec3 dir = normalize(vWP);
        float h = dir.y;
        vec3 topSky  = vec3(0.20, 0.35, 0.65);
        vec3 horizon = vec3(0.75, 0.68, 0.58);
        vec3 botSky  = vec3(0.55, 0.70, 0.85);
        vec3 sky = h > 0.0
          ? mix(horizon, topSky, smoothstep(0.0, 0.5, h))
          : mix(horizon, botSky, smoothstep(0.0, -0.3, h));
        if (uDetail > 0.01) {
          float angle = atan(dir.z, dir.x);
          float ridge1 = 0.0;
          ridge1 += sin(angle * 3.0) * 0.04;
          ridge1 += sin(angle * 7.0 + 1.5) * 0.025;
          ridge1 += snoise(angle * 5.0) * 0.03;
          ridge1 += snoise(angle * 12.0 + 3.0) * 0.015;
          ridge1 += 0.06;
          ridge1 *= uDetail;
          float ridge2 = 0.0;
          ridge2 += sin(angle * 4.0 + 2.0) * 0.035;
          ridge2 += sin(angle * 9.0 + 0.7) * 0.02;
          ridge2 += snoise(angle * 8.0 + 10.0) * 0.025;
          ridge2 += 0.04;
          ridge2 *= uDetail;
          float ridge3 = 0.0;
          ridge3 += sin(angle * 6.0 + 4.0) * 0.025;
          ridge3 += sin(angle * 14.0 + 2.3) * 0.012;
          ridge3 += snoise(angle * 15.0 + 20.0) * 0.018;
          ridge3 += 0.02;
          ridge3 *= uDetail;
          vec3 mtnFar  = mix(horizon, vec3(0.45, 0.50, 0.58), 0.4 * uDetail);
          vec3 mtnMid  = mix(horizon, vec3(0.35, 0.42, 0.50), 0.55 * uDetail);
          vec3 mtnNear = mix(horizon, vec3(0.25, 0.33, 0.42), 0.7 * uDetail);
          if (h < ridge1 && h > -0.05) sky = mix(sky, mtnFar,  smoothstep(ridge1, ridge1 - 0.01, h));
          if (h < ridge2 && h > -0.05) sky = mix(sky, mtnMid,  smoothstep(ridge2, ridge2 - 0.008, h));
          if (h < ridge3 && h > -0.05) sky = mix(sky, mtnNear, smoothstep(ridge3, ridge3 - 0.006, h));
        }
        gl_FragColor = vec4(sky, 1.0);
      }`,
    side: THREE.BackSide, depthWrite: false,
  }), [backgroundDetail]);

  return <mesh ref={meshRef} material={mat}><sphereGeometry args={[500, 32, 32]} /></mesh>;
}

export function FogEffect({ density }: { density: number }) {
  /* Simple fixed formula — works well at all render distances.
   * #b0c8e0 = noon sky colour from DayNightCycle.
   * DayNightLighting overrides fog.color every frame. */
  return <fogExp2 attach="fog" args={['#b0c8e0', 0.005 + density * 0.02]} />;
}

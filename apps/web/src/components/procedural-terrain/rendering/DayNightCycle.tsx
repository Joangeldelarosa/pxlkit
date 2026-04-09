/* ═══════════════════════════════════════════════════════════════
 *  Day/Night Cycle — dynamic lighting, sky color, and time provider
 * ═══════════════════════════════════════════════════════════════ */
'use client';

import { useRef, useMemo, createContext, useContext } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

/* ── Time context so any component can read the current hour ── */
export interface TimeState {
  hour: number;         // 0-24 fractional hour
  sunIntensity: number; // 0-1 how bright the sun is
  moonIntensity: number; // 0-1 how bright the moon is
  isNight: boolean;
  sunColor: THREE.Color;
  ambientColor: THREE.Color;
  skyTopColor: THREE.Color;
  skyHorizonColor: THREE.Color;
  fogColor: THREE.Color;
}

export const TimeContext = createContext<React.MutableRefObject<TimeState> | null>(null);

export function useTimeState() {
  const ref = useContext(TimeContext);
  return ref;
}

/* ── Color interpolation helpers ── */
interface TimeKeyframe {
  hour: number;
  sunIntensity: number;
  moonIntensity: number;
  sunColor: [number, number, number];
  ambientColor: [number, number, number];
  skyTop: [number, number, number];
  skyHorizon: [number, number, number];
  fogColor: [number, number, number];
}

const KEYFRAMES: TimeKeyframe[] = [
  { hour: 0,  sunIntensity: 0,    moonIntensity: 0.3,  sunColor: [0.1, 0.1, 0.2],   ambientColor: [0.08, 0.08, 0.15], skyTop: [0.02, 0.02, 0.08], skyHorizon: [0.05, 0.05, 0.12], fogColor: [0.05, 0.05, 0.1] },
  { hour: 4,  sunIntensity: 0,    moonIntensity: 0.25, sunColor: [0.1, 0.1, 0.2],   ambientColor: [0.08, 0.08, 0.15], skyTop: [0.03, 0.03, 0.1],  skyHorizon: [0.08, 0.06, 0.15], fogColor: [0.06, 0.06, 0.12] },
  { hour: 5,  sunIntensity: 0.2,  moonIntensity: 0.1,  sunColor: [0.9, 0.5, 0.3],   ambientColor: [0.3, 0.2, 0.15],   skyTop: [0.12, 0.1, 0.25],  skyHorizon: [0.8, 0.4, 0.25],   fogColor: [0.5, 0.35, 0.25] },
  { hour: 6,  sunIntensity: 0.6,  moonIntensity: 0,    sunColor: [1.0, 0.7, 0.4],   ambientColor: [0.5, 0.4, 0.3],    skyTop: [0.25, 0.3, 0.55],  skyHorizon: [0.85, 0.6, 0.4],   fogColor: [0.7, 0.55, 0.4] },
  { hour: 8,  sunIntensity: 1.1,  moonIntensity: 0,    sunColor: [1.0, 0.95, 0.85], ambientColor: [0.7, 0.7, 0.75],   skyTop: [0.2, 0.35, 0.65],  skyHorizon: [0.7, 0.65, 0.6],   fogColor: [0.65, 0.72, 0.82] },
  { hour: 12, sunIntensity: 1.4,  moonIntensity: 0,    sunColor: [1.0, 1.0, 1.0],   ambientColor: [0.8, 0.8, 0.85],   skyTop: [0.2, 0.35, 0.65],  skyHorizon: [0.75, 0.68, 0.58], fogColor: [0.69, 0.78, 0.88] },
  { hour: 16, sunIntensity: 1.2,  moonIntensity: 0,    sunColor: [1.0, 0.95, 0.85], ambientColor: [0.7, 0.7, 0.72],   skyTop: [0.2, 0.33, 0.6],   skyHorizon: [0.72, 0.62, 0.5],  fogColor: [0.65, 0.7, 0.78] },
  { hour: 18, sunIntensity: 0.7,  moonIntensity: 0,    sunColor: [1.0, 0.6, 0.3],   ambientColor: [0.5, 0.35, 0.25],  skyTop: [0.15, 0.15, 0.4],  skyHorizon: [0.85, 0.45, 0.2],  fogColor: [0.6, 0.4, 0.28] },
  { hour: 19, sunIntensity: 0.3,  moonIntensity: 0.05, sunColor: [0.8, 0.4, 0.2],   ambientColor: [0.3, 0.2, 0.2],    skyTop: [0.08, 0.06, 0.2],  skyHorizon: [0.6, 0.25, 0.15],  fogColor: [0.35, 0.2, 0.18] },
  { hour: 20, sunIntensity: 0.05, moonIntensity: 0.15, sunColor: [0.15, 0.1, 0.2],  ambientColor: [0.12, 0.1, 0.18],  skyTop: [0.04, 0.03, 0.12], skyHorizon: [0.15, 0.1, 0.15],  fogColor: [0.1, 0.08, 0.12] },
  { hour: 22, sunIntensity: 0,    moonIntensity: 0.3,  sunColor: [0.1, 0.1, 0.2],   ambientColor: [0.08, 0.08, 0.15], skyTop: [0.02, 0.02, 0.08], skyHorizon: [0.06, 0.05, 0.1],  fogColor: [0.05, 0.05, 0.1] },
  { hour: 24, sunIntensity: 0,    moonIntensity: 0.3,  sunColor: [0.1, 0.1, 0.2],   ambientColor: [0.08, 0.08, 0.15], skyTop: [0.02, 0.02, 0.08], skyHorizon: [0.05, 0.05, 0.12], fogColor: [0.05, 0.05, 0.1] },
];

function lerpArr(a: [number, number, number], b: [number, number, number], t: number): [number, number, number] {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
}

function getTimeState(hour: number): TimeState {
  const h = ((hour % 24) + 24) % 24;
  let i0 = 0;
  for (let i = 0; i < KEYFRAMES.length - 1; i++) {
    if (h >= KEYFRAMES[i].hour && h < KEYFRAMES[i + 1].hour) { i0 = i; break; }
  }
  const k0 = KEYFRAMES[i0], k1 = KEYFRAMES[i0 + 1];
  const t = (h - k0.hour) / (k1.hour - k0.hour);
  
  const sunI = k0.sunIntensity + (k1.sunIntensity - k0.sunIntensity) * t;
  const moonI = k0.moonIntensity + (k1.moonIntensity - k0.moonIntensity) * t;
  const sc = lerpArr(k0.sunColor, k1.sunColor, t);
  const ac = lerpArr(k0.ambientColor, k1.ambientColor, t);
  const st = lerpArr(k0.skyTop, k1.skyTop, t);
  const sh = lerpArr(k0.skyHorizon, k1.skyHorizon, t);
  const fc = lerpArr(k0.fogColor, k1.fogColor, t);

  return {
    hour: h,
    sunIntensity: sunI,
    moonIntensity: moonI,
    isNight: h < 5.5 || h > 19.5,
    sunColor: new THREE.Color(sc[0], sc[1], sc[2]),
    ambientColor: new THREE.Color(ac[0], ac[1], ac[2]),
    skyTopColor: new THREE.Color(st[0], st[1], st[2]),
    skyHorizonColor: new THREE.Color(sh[0], sh[1], sh[2]),
    fogColor: new THREE.Color(fc[0], fc[1], fc[2]),
  };
}

/* ── Sun position based on hour ── */
function getSunPosition(hour: number): [number, number, number] {
  const angle = ((hour - 6) / 24) * Math.PI * 2; // sunrise at 6
  const x = Math.cos(angle) * 80;
  const y = Math.sin(angle) * 80;
  const z = 30;
  return [x, y, z];
}

/* ── Dynamic Lighting Component ── */
export function DayNightLighting({ timeMode, fixedHour, dayDurationSeconds }: {
  timeMode: 'fixed' | 'cycle';
  fixedHour: number;
  dayDurationSeconds: number;
}) {
  const ambRef = useRef<THREE.AmbientLight>(null);
  const hemiRef = useRef<THREE.HemisphereLight>(null);
  const sunRef = useRef<THREE.DirectionalLight>(null);
  const fillRef = useRef<THREE.DirectionalLight>(null);
  const moonRef = useRef<THREE.DirectionalLight>(null);
  const timeRef = useContext(TimeContext);
  const { scene } = useThree();

  useFrame(({ clock }) => {
    let hour: number;
    if (timeMode === 'fixed') {
      hour = fixedHour;
    } else {
      const elapsed = clock.getElapsedTime();
      hour = ((elapsed / dayDurationSeconds) * 24) % 24;
    }

    const state = getTimeState(hour);
    if (timeRef) timeRef.current = state;

    // Update lights
    if (ambRef.current) {
      ambRef.current.intensity = 0.3 + state.sunIntensity * 0.5;
      ambRef.current.color.copy(state.ambientColor);
    }
    if (hemiRef.current) {
      hemiRef.current.intensity = 0.2 + state.sunIntensity * 0.3;
      hemiRef.current.color.copy(state.ambientColor);
    }
    if (sunRef.current) {
      sunRef.current.intensity = state.sunIntensity;
      sunRef.current.color.copy(state.sunColor);
      const [sx, sy, sz] = getSunPosition(hour);
      sunRef.current.position.set(sx, Math.max(sy, -10), sz);
    }
    if (fillRef.current) {
      fillRef.current.intensity = state.sunIntensity * 0.4;
      fillRef.current.color.copy(state.sunColor);
    }
    if (moonRef.current) {
      moonRef.current.intensity = state.moonIntensity;
      const [sx, sy, sz] = getSunPosition(hour + 12);
      moonRef.current.position.set(sx, Math.max(sy, -10), sz);
    }

    // Update fog color
    if (scene.fog && scene.fog instanceof THREE.FogExp2) {
      scene.fog.color.copy(state.fogColor);
    }
  });

  return (
    <>
      <ambientLight ref={ambRef} intensity={0.8} color="#ffffff" />
      <hemisphereLight ref={hemiRef} color="#aaccff" groundColor="#886644" intensity={0.5} />
      <directionalLight ref={sunRef} position={[50, 80, 50]} intensity={1.4} color="#ffffff" castShadow={false} />
      <directionalLight ref={fillRef} position={[-30, 40, -30]} intensity={0.6} color="#ffffff" />
      <directionalLight ref={moonRef} position={[-50, 40, -30]} intensity={0} color="#8899cc" />
    </>
  );
}

/* ── Dynamic Sky Gradient ── */
export function DayNightSky({ backgroundDetail, starDensity }: { backgroundDetail: number; starDensity: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const { camera } = useThree();
  const timeRef = useContext(TimeContext);

  const mat = useMemo(() => new THREE.ShaderMaterial({
    uniforms: {
      uDetail: { value: backgroundDetail },
      uSkyTop: { value: new THREE.Color(0.20, 0.35, 0.65) },
      uHorizon: { value: new THREE.Color(0.75, 0.68, 0.58) },
      uSunIntensity: { value: 1.0 },
      uSunDir: { value: new THREE.Vector3(0.5, 0.7, 0.3).normalize() },
      uMoonIntensity: { value: 0.0 },
      uStarDensity: { value: starDensity },
    },
    vertexShader: `
      varying vec3 vWP;
      void main() {
        vec4 w = modelMatrix * vec4(position, 1.0);
        vWP = w.xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
    fragmentShader: `
      uniform float uDetail;
      uniform vec3 uSkyTop;
      uniform vec3 uHorizon;
      uniform float uSunIntensity;
      uniform vec3 uSunDir;
      uniform float uMoonIntensity;
      uniform float uStarDensity;
      varying vec3 vWP;
      
      float hash(float n) { return fract(sin(n) * 43758.5453); }
      float hash2(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      float snoise(float x) {
        float i = floor(x);
        float f = fract(x);
        f = f * f * (3.0 - 2.0 * f);
        return mix(hash(i), hash(i + 1.0), f);
      }
      
      void main() {
        vec3 dir = normalize(vWP);
        float h = dir.y;
        
        // Base gradient from horizon to sky
        vec3 botSky = mix(uHorizon, uSkyTop * 0.8, 0.3);
        vec3 sky = h > 0.0
          ? mix(uHorizon, uSkyTop, smoothstep(0.0, 0.5, h))
          : mix(uHorizon, botSky, smoothstep(0.0, -0.3, h));
        
        // Sun glow
        if (uSunIntensity > 0.01) {
          float sunDot = max(0.0, dot(dir, uSunDir));
          float sunGlow = pow(sunDot, 32.0) * uSunIntensity;
          float sunHalo = pow(sunDot, 4.0) * uSunIntensity * 0.3;
          vec3 sunCol = mix(vec3(1.0, 0.8, 0.5), vec3(1.0, 1.0, 0.95), uSunIntensity);
          sky += sunCol * sunGlow + vec3(1.0, 0.7, 0.4) * sunHalo;
        }
        
        // Stars at night — realistic small dots with varying brightness
        if (uSunIntensity < 0.2 && h > 0.0 && uStarDensity > 0.0) {
          float nightFade = (1.0 - uSunIntensity * 5.0);
          float heightFade = smoothstep(0.0, 0.15, h);
          
          // Fine grid for small star points
          float gridScale = 200.0;
          vec2 starUV = vec2(atan(dir.z, dir.x), asin(clamp(dir.y, -1.0, 1.0)));
          vec2 cell = floor(starUV * gridScale);
          vec2 frac2 = fract(starUV * gridScale);
          
          // Star presence and properties from cell hash
          float starSeed = hash2(cell);
          // Threshold: higher starDensity = more stars
          float threshold = 1.0 - uStarDensity * 0.06;
          
          if (starSeed > threshold) {
            // Star position within cell (centered with jitter)
            vec2 starPos = vec2(hash2(cell + 0.5), hash2(cell + 1.5)) * 0.6 + 0.2;
            float dist = length(frac2 - starPos);
            
            // Small, round star with soft falloff
            float starSize = 0.06 + hash2(cell + 2.5) * 0.1;
            float starBright = smoothstep(starSize, starSize * 0.2, dist);
            
            // Twinkle animation
            float twinkle = 0.6 + 0.4 * sin(starSeed * 6283.0 + uSunIntensity * 10.0);
            
            // Color variation: most white, some warm, some cool
            vec3 starColor = vec3(1.0);
            float colorSeed = hash2(cell + 3.5);
            if (colorSeed > 0.85) starColor = vec3(1.0, 0.85, 0.7); // warm
            else if (colorSeed > 0.7) starColor = vec3(0.8, 0.9, 1.0); // cool blue
            
            // Brightness variation (magnitude)
            float magnitude = 0.4 + hash2(cell + 4.5) * 0.6;
            
            sky += starColor * starBright * nightFade * twinkle * heightFade * magnitude;
          }
        }
        
        // Moon glow
        if (uMoonIntensity > 0.01) {
          vec3 moonDir = -uSunDir;
          float moonDot = max(0.0, dot(dir, moonDir));
          float moonGlow = pow(moonDot, 64.0) * uMoonIntensity * 2.0;
          float moonHalo = pow(moonDot, 8.0) * uMoonIntensity * 0.4;
          sky += vec3(0.7, 0.8, 1.0) * moonGlow + vec3(0.5, 0.6, 0.8) * moonHalo;
        }
        
        // Mountain silhouettes (from original)
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
          vec3 mtnFar  = mix(uHorizon, vec3(0.45, 0.50, 0.58) * (0.3 + uSunIntensity * 0.7), 0.4 * uDetail);
          vec3 mtnMid  = mix(uHorizon, vec3(0.35, 0.42, 0.50) * (0.3 + uSunIntensity * 0.7), 0.55 * uDetail);
          vec3 mtnNear = mix(uHorizon, vec3(0.25, 0.33, 0.42) * (0.3 + uSunIntensity * 0.7), 0.7 * uDetail);
          if (h < ridge1 && h > -0.05) sky = mix(sky, mtnFar,  smoothstep(ridge1, ridge1 - 0.01, h));
          if (h < ridge2 && h > -0.05) sky = mix(sky, mtnMid,  smoothstep(ridge2, ridge2 - 0.008, h));
          if (h < ridge3 && h > -0.05) sky = mix(sky, mtnNear, smoothstep(ridge3, ridge3 - 0.006, h));
        }
        
        gl_FragColor = vec4(sky, 1.0);
      }`,
    side: THREE.BackSide, depthWrite: false,
  }), [backgroundDetail, starDensity]);

  useFrame(() => {
    if (!meshRef.current) return;
    meshRef.current.position.copy(camera.position);
    
    if (timeRef) {
      const state = timeRef.current;
      mat.uniforms.uSkyTop.value.copy(state.skyTopColor);
      mat.uniforms.uHorizon.value.copy(state.skyHorizonColor);
      // eslint-disable-next-line react-hooks/immutability
      mat.uniforms.uSunIntensity.value = state.sunIntensity;
      mat.uniforms.uMoonIntensity.value = state.moonIntensity;
      
      // Sun direction
      const hour = state.hour;
      const angle = ((hour - 6) / 24) * Math.PI * 2;
      mat.uniforms.uSunDir.value.set(Math.cos(angle), Math.sin(angle), 0.3).normalize();
    }
  });

  return <mesh ref={meshRef} material={mat}><sphereGeometry args={[500, 32, 32]} /></mesh>;
}

export { getTimeState };

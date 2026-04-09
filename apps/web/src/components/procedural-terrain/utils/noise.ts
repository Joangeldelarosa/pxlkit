/* ═══════════════════════════════════════════════════════════════
 *  Noise Generation — Seeded Perlin noise + FBM
 * ═══════════════════════════════════════════════════════════════ */

/** Seeded PRNG — mulberry32 */
export function mulberry32(seed: number) {
  return () => {
    seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Creates a 2D Perlin-like noise function seeded by `seed` */
export function createNoise2D(seed: number) {
  const P = new Uint8Array(512);
  const rng = mulberry32(seed);
  const p = new Uint8Array(256);
  for (let i = 0; i < 256; i++) p[i] = i;
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [p[i], p[j]] = [p[j], p[i]];
  }
  P.set(p); P.set(p, 256);

  function fade(t: number) { return t * t * t * (t * (t * 6 - 15) + 10); }
  function lerp(a: number, b: number, t: number) { return a + t * (b - a); }
  function grad(h: number, x: number, y: number) {
    const v = h & 3;
    return (v === 0 ? x + y : v === 1 ? -x + y : v === 2 ? x - y : -x - y);
  }

  return (x: number, y: number) => {
    const X = Math.floor(x) & 255, Y = Math.floor(y) & 255;
    const xf = x - Math.floor(x), yf = y - Math.floor(y);
    const u = fade(xf), v = fade(yf);
    const aa = P[P[X] + Y], ab = P[P[X] + Y + 1];
    const ba = P[P[X + 1] + Y], bb = P[P[X + 1] + Y + 1];
    return lerp(
      lerp(grad(aa, xf, yf), grad(ba, xf - 1, yf), u),
      lerp(grad(ab, xf, yf - 1), grad(bb, xf - 1, yf - 1), u), v,
    );
  };
}

/** Fractal Brownian Motion for richer terrain */
export function fbm(
  noise: (x: number, y: number) => number,
  x: number, y: number,
  octaves = 4, lacunarity = 2.0, gain = 0.5,
): number {
  let sum = 0, amp = 1, freq = 1;
  for (let i = 0; i < octaves; i++) {
    sum += noise(x * freq, y * freq) * amp;
    freq *= lacunarity; amp *= gain;
  }
  return sum;
}

import type { ParallaxPxlKitData } from '../types';
import { clamp, px, type StyleMap } from './style';

/** Resolved 3D geometry of a parallax icon. */
export interface ParallaxGeometry {
  /** CSS `perspective` distance in px. */
  perspective: number;
  /** Z distance between adjacent layers in px. */
  layerGap: number;
}

/**
 * Resolves the 3D geometry, deriving the defaults from the icon size:
 * `perspective = max(200, size × 2.5)` and `layerGap = max(12, size × 0.2)`.
 */
export function resolveParallaxGeometry(
  size: number,
  overrides: Partial<ParallaxGeometry> = {},
): ParallaxGeometry {
  return {
    perspective: overrides.perspective ?? Math.max(200, size * 2.5),
    layerGap: overrides.layerGap ?? Math.max(12, size * 0.2),
  };
}

/**
 * Inline style of the parallax container: an exact `size`×`size` inline-flex
 * box carrying the CSS `perspective`, positioned so the particle canvas can
 * overlay it, and `overflow: visible` so extruded layers are never clipped.
 */
export function parallaxContainerStyle(options: {
  size: number;
  perspective: number;
  interactive: boolean;
}): StyleMap {
  const style: Record<string, string> = {
    display: 'inline-flex',
    position: 'relative',
    overflow: 'visible',
    alignItems: 'center',
    justifyContent: 'center',
    verticalAlign: 'middle',
    flexShrink: '0',
    lineHeight: '0',
    width: px(options.size),
    height: px(options.size),
    perspective: px(options.perspective),
  };
  if (options.interactive) style.cursor = 'pointer';
  return style;
}

/**
 * Inline style of the 3D scene that rotates as a whole. While `active` (the
 * icon was toggled on by a click) the scene is hue-shifted.
 *
 * The scene `transform` is deliberately absent: the
 * {@link ParallaxController} writes it on every animation frame.
 */
export function parallaxSceneStyle(options: { size: number; active: boolean }): StyleMap {
  const style: Record<string, string> = {
    position: 'relative',
    width: px(options.size),
    height: px(options.size),
    transformStyle: 'preserve-3d',
    willChange: 'transform',
    transition: options.active ? 'filter 0.3s ease' : 'filter 0.6s ease',
  };
  if (options.active) style.filter = 'hue-rotate(30deg) saturate(1.3)';
  return style;
}

/**
 * Inline style of one layer wrapper, `index` counted from the back. Every
 * layer but the back one casts a soft depth shadow when `shadow` is on.
 *
 * The layer `transform` is deliberately absent: the
 * {@link ParallaxController} owns it from `connect()` on (peel-apart intro,
 * click burst). A framework that re-applies every inline-style key on
 * re-render (Vue does) would otherwise reset the depth on each update.
 */
export function parallaxLayerStyle(options: {
  index: number;
  layerCount: number;
  layerGap: number;
  shadow: boolean;
}): StyleMap {
  const style: Record<string, string> = {
    position: 'absolute',
    inset: '0px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    willChange: 'transform',
    pointerEvents: 'none',
  };
  if (options.shadow && options.index > 0) {
    const depth = Math.abs(layerOffset(options.index, options.layerCount)) * 3;
    const blur = Math.max(4, options.layerGap * 0.6);
    style.filter = `drop-shadow(0px ${depth}px ${blur}px rgba(0,0,0,0.3))`;
  }
  return style;
}

/** Inline style of the particle canvas that overlays the container. */
export const PARALLAX_CANVAS_STYLE: StyleMap = Object.freeze({
  position: 'absolute',
  inset: '0px',
  pointerEvents: 'none',
  imageRendering: 'pixelated',
});

/** Every distinct palette colour across the layers — the particle colours. */
export function parallaxParticleColors(icon: ParallaxPxlKitData): string[] {
  const colors = new Set<string>();
  for (const layer of icon.layers) {
    for (const color of Object.values(layer.icon.palette)) colors.add(color);
  }
  return Array.from(colors);
}

/** Signed distance of layer `index` from the stack's middle, in layer units. */
function layerOffset(index: number, layerCount: number): number {
  return index - (layerCount - 1) / 2;
}

/** Inputs of the {@link ParallaxController} motion model. */
export interface ParallaxMotionOptions {
  /** The parallax icon; its layer count drives the stack. */
  icon: ParallaxPxlKitData;
  /** Container size in px. */
  size: number;
  /** Mouse reactivity: the maximum tilt is `clamp(strength × 2, 4, 45)` degrees. */
  strength: number;
  /** Rotation lerp factor per frame, 0–1. */
  smoothing: number;
  /** Z distance between adjacent layers in px. */
  layerGap: number;
}

/** DOM nodes a {@link ParallaxController} animates. */
export interface ParallaxElements {
  /** The container whose centre the page-wide mouse tracking is measured from. */
  container: HTMLElement;
  /** The 3D scene; its element children are the layers, back to front. */
  scene: HTMLElement;
  /** The particle canvas, when the icon is interactive. */
  canvas?: HTMLCanvasElement | null;
}

/**
 * Framework-agnostic motion engine of a parallax icon: one
 * `requestAnimationFrame` loop that tilts the scene toward the page-wide
 * mouse position, peels the layers apart on mount, springs them back after a
 * click burst and draws the pixel particles.
 *
 * It writes the per-frame `transform`s straight to the DOM, so adapters never
 * re-render while it animates.
 */
export interface ParallaxController {
  /** Starts the loop and the page-wide mouse tracking (browser only). */
  connect(elements: ParallaxElements): void;
  /** Stops the loop and removes every listener. */
  disconnect(): void;
  /**
   * Replaces the motion options. A new icon, size, strength or smoothing
   * re-centres the scene and replays the peel-apart intro; a new layer gap
   * applies on the next frame.
   */
  update(options: ParallaxMotionOptions): void;
  /** Swaps the particle canvas (e.g. when `interactive` toggles). */
  setCanvas(canvas: HTMLCanvasElement | null): void;
  /** Click burst: layers explode apart, the scene jolts and particles fly. */
  burst(): void;
}

/** Duration of the peel-apart intro in ms. */
const INTRO_DURATION = 700;

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  /** Remaining life, 1 → 0. */
  life: number;
  size: number;
}

/** Creates a {@link ParallaxController}. Side-effect free until `connect()`. */
export function createParallaxController(initial: ParallaxMotionOptions): ParallaxController {
  let options: ParallaxMotionOptions = { ...initial };
  let colors = parallaxParticleColors(options.icon);
  let container: HTMLElement | null = null;
  let scene: HTMLElement | null = null;
  let canvas: HTMLCanvasElement | null = null;
  /** 2D context of `canvas`, resolved on the first draw; `undefined` until then. */
  let context: CanvasRenderingContext2D | null | undefined;
  let canvasDirty = false;
  let frameRequest = 0;
  let connected = false;
  let introStart = 0;
  let intro = 0;
  let burstLevel = 0;
  const rotation = { x: 0, y: 0 };
  const target = { x: 0, y: 0 };
  const jolt = { x: 0, y: 0 };
  const particles: Particle[] = [];
  /** Last transform written per layer element — skips redundant writes. */
  const writtenTransforms = new WeakMap<Element, string>();

  const now = (): number =>
    typeof performance !== 'undefined' ? performance.now() : Date.now();

  function restartIntro(): void {
    rotation.x = rotation.y = 0;
    target.x = target.y = 0;
    intro = 0;
    introStart = now();
  }

  function onMouseMove(event: MouseEvent): void {
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const radius = Math.max(window.innerWidth, window.innerHeight) * 0.5;
    const nx = clamp((event.clientX - (rect.left + rect.width / 2)) / radius, -1, 1);
    const ny = clamp((event.clientY - (rect.top + rect.height / 2)) / radius, -1, 1);
    const maxTilt = clamp(options.strength * 2, 4, 45);
    target.x = -ny * maxTilt;
    target.y = nx * maxTilt;
  }

  function applyLayerTransforms(): void {
    if (!scene) return;
    const layers = scene.children;
    const layerCount = options.icon.layers.length;
    const spread = options.layerGap * (1 + burstLevel * 1.8) * intro;
    for (let i = 0; i < layers.length && i < layerCount; i++) {
      const layer = layers[i] as HTMLElement;
      const transform = `translateZ(${layerOffset(i, layerCount) * spread}px)`;
      if (writtenTransforms.get(layer) === transform) continue;
      layer.style.transform = transform;
      writtenTransforms.set(layer, transform);
    }
  }

  function stepParticles(): void {
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.08; // gravity
      p.life -= 0.02;
      if (p.life <= 0) particles.splice(i, 1);
    }
    if (!canvas || (particles.length === 0 && !canvasDirty)) return;
    // Resolved once per canvas, and only once there is something to draw:
    // getContext() is not free, and DOMs without a canvas implementation
    // (server renderers, test DOMs) throw or log on every call.
    if (context === undefined) context = canvas.getContext('2d');
    if (!context) return;
    const { size } = options;
    context.clearRect(0, 0, size, size);
    for (const p of particles) {
      context.globalAlpha = Math.max(0, p.life);
      context.fillStyle = p.color;
      context.fillRect(Math.round(p.x - p.size / 2), Math.round(p.y - p.size / 2), p.size, p.size);
    }
    context.globalAlpha = 1;
    canvasDirty = particles.length > 0;
  }

  function animate(time: number): void {
    const t = clamp((time - introStart) / INTRO_DURATION, 0, 1);
    intro = 1 - Math.pow(1 - t, 3); // ease-out cubic

    burstLevel = burstLevel > 0.01 ? burstLevel * 0.92 : 0;
    jolt.x *= 0.9;
    jolt.y *= 0.9;

    rotation.x += (target.x + jolt.x - rotation.x) * options.smoothing;
    rotation.y += (target.y + jolt.y - rotation.y) * options.smoothing;
    if (scene) scene.style.transform = `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`;

    applyLayerTransforms();
    stepParticles();
    frameRequest = requestAnimationFrame(animate);
  }

  function setCanvas(next: HTMLCanvasElement | null): void {
    if (next === canvas) return;
    canvas = next;
    context = undefined;
    canvasDirty = false;
  }

  function disconnect(): void {
    if (!connected) return;
    connected = false;
    if (typeof cancelAnimationFrame === 'function') cancelAnimationFrame(frameRequest);
    window.removeEventListener('mousemove', onMouseMove);
    container = null;
    scene = null;
    setCanvas(null);
  }

  function connect(elements: ParallaxElements): void {
    if (typeof window === 'undefined') return;
    disconnect();
    connected = true;
    container = elements.container;
    scene = elements.scene;
    setCanvas(elements.canvas ?? null);
    restartIntro();
    window.addEventListener('mousemove', onMouseMove);
    if (typeof requestAnimationFrame === 'function') {
      applyLayerTransforms(); // the flat resting stack, before the first frame
      frameRequest = requestAnimationFrame(animate);
    } else {
      // No animation frames: settle straight into the spread stack.
      intro = 1;
      applyLayerTransforms();
    }
  }

  function update(next: ParallaxMotionOptions): void {
    const previous = options;
    options = { ...next };
    if (next.icon !== previous.icon) colors = parallaxParticleColors(next.icon);
    if (
      next.icon !== previous.icon ||
      next.size !== previous.size ||
      next.strength !== previous.strength ||
      next.smoothing !== previous.smoothing
    ) {
      restartIntro();
    }
  }

  function burst(): void {
    burstLevel = 1;
    jolt.x = (Math.random() - 0.5) * 30;
    jolt.y = (Math.random() - 0.5) * 30;

    const { size } = options;
    const count = Math.max(6, Math.floor(size / 8));
    const half = size / 2;
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.8;
      const speed = 1 + Math.random() * 3;
      particles.push({
        x: half,
        y: half,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: colors[Math.floor(Math.random() * colors.length)] || '#FFD700',
        life: 1,
        size: Math.max(2, size / 16),
      });
    }
  }

  return { connect, disconnect, update, setCanvas, burst };
}

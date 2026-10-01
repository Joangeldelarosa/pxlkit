import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  PARALLAX_CANVAS_STYLE,
  createParallaxController,
  parallaxContainerStyle,
  parallaxLayerStyle,
  parallaxParticleColors,
  parallaxSceneStyle,
  resolveParallaxGeometry,
  type ParallaxController,
  type ParallaxMotionOptions,
} from '../../engine/parallax';
import { testAnimatedIcon, testParallaxIcon } from '../fixtures';

describe('resolveParallaxGeometry', () => {
  it('derives perspective and layer gap from the size', () => {
    expect(resolveParallaxGeometry(64)).toEqual({ perspective: 200, layerGap: 12.8 });
    expect(resolveParallaxGeometry(200)).toEqual({ perspective: 500, layerGap: 40 });
    expect(resolveParallaxGeometry(16)).toEqual({ perspective: 200, layerGap: 12 });
  });

  it('keeps explicit overrides', () => {
    expect(resolveParallaxGeometry(64, { perspective: 900, layerGap: 3 })).toEqual({
      perspective: 900,
      layerGap: 3,
    });
  });
});

describe('parallax styles', () => {
  it('container: exact box with perspective, pointer cursor only when interactive', () => {
    const style = parallaxContainerStyle({ size: 96, perspective: 300, interactive: true });
    expect(style).toMatchObject({ width: '96px', height: '96px', perspective: '300px', cursor: 'pointer', position: 'relative', overflow: 'visible' });
    expect(parallaxContainerStyle({ size: 96, perspective: 300, interactive: false })).not.toHaveProperty('cursor');
  });

  it('scene: preserve-3d, hue-shifted only while active, transform left to the controller', () => {
    const idle = parallaxSceneStyle({ size: 64, active: false });
    expect(idle).toMatchObject({ transformStyle: 'preserve-3d', transition: 'filter 0.6s ease' });
    expect(idle).not.toHaveProperty('filter');
    expect(idle).not.toHaveProperty('transform');
    expect(parallaxSceneStyle({ size: 64, active: true })).toMatchObject({
      transition: 'filter 0.3s ease',
      filter: 'hue-rotate(30deg) saturate(1.3)',
    });
  });

  it('layers: depth shadows on every layer but the back one, transform left to the controller', () => {
    const back = parallaxLayerStyle({ index: 0, layerCount: 3, layerGap: 20, shadow: true });
    expect(back).not.toHaveProperty('transform');
    expect(back).toMatchObject({ position: 'absolute', willChange: 'transform', pointerEvents: 'none' });
    expect(back).not.toHaveProperty('filter');
    expect(parallaxLayerStyle({ index: 1, layerCount: 3, layerGap: 20, shadow: true }).filter).toBe(
      'drop-shadow(0px 0px 12px rgba(0,0,0,0.3))',
    );
    expect(parallaxLayerStyle({ index: 2, layerCount: 3, layerGap: 5, shadow: true }).filter).toBe(
      'drop-shadow(0px 3px 4px rgba(0,0,0,0.3))',
    );
    expect(parallaxLayerStyle({ index: 2, layerCount: 3, layerGap: 20, shadow: false })).not.toHaveProperty('filter');
  });

  it('canvas: a frozen pixelated overlay', () => {
    expect(PARALLAX_CANVAS_STYLE).toMatchObject({ position: 'absolute', pointerEvents: 'none', imageRendering: 'pixelated' });
    expect(Object.isFrozen(PARALLAX_CANVAS_STYLE)).toBe(true);
  });
});

describe('parallaxParticleColors', () => {
  it('collects the distinct palette colours of every layer (static or animated)', () => {
    const colors = parallaxParticleColors({
      ...testParallaxIcon,
      layers: [...testParallaxIcon.layers, { icon: testAnimatedIcon, depth: 1 }],
    });
    expect(colors).toEqual(['#FFD700', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#1A1A2E']);
  });
});

describe('createParallaxController', () => {
  let now: number;
  let frames: FrameRequestCallback[];
  let container: HTMLElement;
  let scene: HTMLElement;
  let controller: ParallaxController;
  const options: ParallaxMotionOptions = { icon: testParallaxIcon, size: 64, strength: 18, smoothing: 0.5, layerGap: 20 };

  beforeEach(() => {
    now = 0;
    frames = [];
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      frames.push(cb);
      return frames.length;
    });
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {
      frames = [];
    });
    vi.spyOn(performance, 'now').mockImplementation(() => now);
    container = document.createElement('div');
    scene = document.createElement('div');
    for (let i = 0; i < testParallaxIcon.layers.length; i++) scene.appendChild(document.createElement('div'));
    container.appendChild(scene);
    document.body.appendChild(container);
  });

  afterEach(() => {
    controller?.disconnect();
    container.remove();
    vi.restoreAllMocks();
  });

  function step(count: number): void {
    for (let i = 0; i < count; i++) {
      now += 16;
      const due = frames.splice(0);
      for (const cb of due) cb(now);
    }
  }

  const layerZ = () => Array.from(scene.children).map((l) => (l as HTMLElement).style.transform);

  it('peels the layers apart during the intro', () => {
    controller = createParallaxController(options);
    controller.connect({ container, scene });
    // Connecting writes the flat resting stack before the first frame.
    expect(layerZ()).toEqual(['translateZ(0px)', 'translateZ(0px)', 'translateZ(0px)']);
    step(1);
    const early = layerZ();
    expect(early[0]).not.toBe('translateZ(-20px)');
    step(60);
    expect(layerZ()).toEqual(['translateZ(-20px)', 'translateZ(0px)', 'translateZ(20px)']);
  });

  it('explodes on burst and springs back to the resting spread', () => {
    controller = createParallaxController(options);
    controller.connect({ container, scene });
    step(60);
    controller.burst();
    step(1);
    const exploded = Number(/-?[\d.]+/.exec(layerZ()[0])![0]);
    expect(exploded).toBeLessThan(-40);
    step(200);
    expect(layerZ()).toEqual(['translateZ(-20px)', 'translateZ(0px)', 'translateZ(20px)']);
  });

  it('tilts the scene toward the page-wide mouse position', () => {
    controller = createParallaxController(options);
    controller.connect({ container, scene });
    window.dispatchEvent(new MouseEvent('mousemove', { clientX: 10_000, clientY: 0 }));
    step(40);
    const match = /rotateX\((-?[\d.]+)deg\) rotateY\((-?[\d.]+)deg\)/.exec(scene.style.transform);
    expect(match).not.toBeNull();
    // Cursor far right → positive Y rotation, capped at clamp(strength × 2) = 36°.
    expect(Number(match![2])).toBeCloseTo(36, 0);
  });

  it('replays the intro when the icon, size, strength or smoothing change — not the gap', () => {
    controller = createParallaxController(options);
    controller.connect({ container, scene });
    step(60);
    controller.update({ ...options, layerGap: 10 });
    step(1);
    expect(layerZ()[0]).toBe('translateZ(-10px)');

    controller.update({ ...options, layerGap: 10, size: 80 });
    step(1);
    expect(layerZ()[0]).not.toBe('translateZ(-10px)');
  });

  it('draws particles on the canvas while they live and clears it afterwards', () => {
    const ctx = { clearRect: vi.fn(), fillRect: vi.fn(), globalAlpha: 1, fillStyle: '' };
    const canvas = document.createElement('canvas');
    const getContext = vi.fn(() => ctx);
    canvas.getContext = getContext as unknown as HTMLCanvasElement['getContext'];

    controller = createParallaxController(options);
    controller.connect({ container, scene, canvas });
    step(5);
    expect(ctx.clearRect).not.toHaveBeenCalled(); // idle canvas: no work

    controller.burst();
    step(1);
    expect(ctx.fillRect).toHaveBeenCalledTimes(Math.max(6, Math.floor(64 / 8)));
    step(60); // particles die after 50 frames
    const clears = ctx.clearRect.mock.calls.length;
    step(5);
    expect(ctx.clearRect.mock.calls.length).toBe(clears); // idle again
    expect(getContext).toHaveBeenCalledTimes(1);
  });

  it('can swap or drop the canvas at any time', () => {
    controller = createParallaxController(options);
    controller.connect({ container, scene });
    const canvas = document.createElement('canvas');
    const getContext = vi.fn(() => null);
    canvas.getContext = getContext as unknown as HTMLCanvasElement['getContext'];
    controller.setCanvas(canvas);
    controller.setCanvas(canvas);
    controller.burst();
    step(3); // no 2D context: the particles simply are not drawn
    expect(getContext).toHaveBeenCalledTimes(1);
    controller.setCanvas(null);
    controller.burst();
    expect(() => step(3)).not.toThrow();
    expect(getContext).toHaveBeenCalledTimes(1);
  });

  it('never touches the canvas before there is something to draw', () => {
    const canvas = document.createElement('canvas');
    const getContext = vi.fn(() => {
      throw new Error('not implemented'); // e.g. a server-side DOM
    });
    canvas.getContext = getContext as unknown as HTMLCanvasElement['getContext'];
    controller = createParallaxController(options);
    controller.setCanvas(canvas); // before connect, as on a server render
    controller.connect({ container, scene, canvas });
    step(30);
    controller.setCanvas(null);
    controller.setCanvas(canvas);
    step(30);
    expect(getContext).not.toHaveBeenCalled();
  });

  it('stops the loop and the mouse tracking on disconnect', () => {
    const remove = vi.spyOn(window, 'removeEventListener');
    controller = createParallaxController(options);
    controller.connect({ container, scene });
    controller.disconnect();
    expect(frames).toHaveLength(0);
    expect(remove).toHaveBeenCalledWith('mousemove', expect.any(Function));
    controller.disconnect(); // idempotent
    expect(remove).toHaveBeenCalledTimes(1);
  });

  it('settles straight into the spread stack without requestAnimationFrame', () => {
    vi.stubGlobal('requestAnimationFrame', undefined);
    controller = createParallaxController(options);
    controller.connect({ container, scene });
    expect(layerZ()).toEqual(['translateZ(-20px)', 'translateZ(0px)', 'translateZ(20px)']);
    vi.unstubAllGlobals();
  });
});

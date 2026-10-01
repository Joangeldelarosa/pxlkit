import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { render, fireEvent, act } from '@testing-library/react';
import { ParallaxPxlKitIcon } from '../../components/ParallaxPxlKitIcon';
import { testParallaxIcon } from '../fixtures';
import type { ParallaxPxlKitData } from '../../types';
import { testAnimatedIcon } from '../fixtures';

describe('ParallaxPxlKitIcon', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders a container div with role="img"', () => {
    const { container } = render(
      <ParallaxPxlKitIcon icon={testParallaxIcon} />
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.tagName).toBe('DIV');
    expect(wrapper.getAttribute('role')).toBe('img');
  });

  it('renders an inner scene div with preserve-3d', () => {
    const { container } = render(
      <ParallaxPxlKitIcon icon={testParallaxIcon} />
    );
    const wrapper = container.firstChild as HTMLElement;
    const scene = wrapper.children[0] as HTMLElement;
    expect(scene.tagName).toBe('DIV');
    expect(scene.style.transformStyle).toBe('preserve-3d');
  });

  it('renders one child div per layer inside the scene', () => {
    const { container } = render(
      <ParallaxPxlKitIcon icon={testParallaxIcon} />
    );
    const wrapper = container.firstChild as HTMLElement;
    const scene = wrapper.children[0] as HTMLElement;
    expect(scene.children.length).toBe(testParallaxIcon.layers.length);
  });

  it('renders one <img> per layer inside the scene', () => {
    const { container } = render(
      <ParallaxPxlKitIcon icon={testParallaxIcon} colorful />
    );
    // Each layer is a PxlKitIcon which renders as <img src="data:image/svg+xml,..">.
    const imgs = container.querySelectorAll('img');
    expect(imgs.length).toBe(testParallaxIcon.layers.length);
  });

  it('uses icon name as default aria-label', () => {
    const { container } = render(
      <ParallaxPxlKitIcon icon={testParallaxIcon} />
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.getAttribute('aria-label')).toBe(testParallaxIcon.name);
  });

  it('custom aria-label overrides default', () => {
    const { container } = render(
      <ParallaxPxlKitIcon icon={testParallaxIcon} aria-label="My 3D Icon" />
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.getAttribute('aria-label')).toBe('My 3D Icon');
  });

  it('applies size prop to container dimensions', () => {
    const { container } = render(
      <ParallaxPxlKitIcon icon={testParallaxIcon} size={128} />
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.style.width).toBe('128px');
    expect(wrapper.style.height).toBe('128px');
  });

  it('applies default size of 64', () => {
    const { container } = render(
      <ParallaxPxlKitIcon icon={testParallaxIcon} />
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.style.width).toBe('64px');
    expect(wrapper.style.height).toBe('64px');
  });

  it('applies perspective to container', () => {
    const { container } = render(
      <ParallaxPxlKitIcon icon={testParallaxIcon} perspective={500} />
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.style.perspective).toBe('500px');
  });

  it('applies default perspective based on size', () => {
    const { container } = render(
      <ParallaxPxlKitIcon icon={testParallaxIcon} size={100} />
    );
    const wrapper = container.firstChild as HTMLElement;
    // default = max(200, size * 2.5) = 250
    expect(wrapper.style.perspective).toBe('250px');
  });

  it('applies className to container', () => {
    const { container } = render(
      <ParallaxPxlKitIcon icon={testParallaxIcon} className="my-parallax" />
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.classList.contains('my-parallax')).toBe(true);
  });

  it('applies style prop to container', () => {
    const { container } = render(
      <ParallaxPxlKitIcon icon={testParallaxIcon} style={{ opacity: 0.7 }} />
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.style.opacity).toBe('0.7');
  });

  it('layer divs have pointer-events: none', () => {
    const { container } = render(
      <ParallaxPxlKitIcon icon={testParallaxIcon} />
    );
    const scene = (container.firstChild as HTMLElement).children[0] as HTMLElement;
    const layerDiv = scene.children[0] as HTMLElement;
    expect(layerDiv.style.pointerEvents).toBe('none');
  });

  it('layer divs have will-change: transform', () => {
    const { container } = render(
      <ParallaxPxlKitIcon icon={testParallaxIcon} />
    );
    const scene = (container.firstChild as HTMLElement).children[0] as HTMLElement;
    const layerDiv = scene.children[0] as HTMLElement;
    expect(layerDiv.style.willChange).toBe('transform');
  });

  it('layer divs have translateZ transforms for 3D depth', () => {
    const { container } = render(
      <ParallaxPxlKitIcon icon={testParallaxIcon} layerGap={20} />
    );
    const scene = (container.firstChild as HTMLElement).children[0] as HTMLElement;
    // Layers: 3 layers, midIndex = 1.
    // layer 0: zNorm = 0 - 1 = -1, z = -20 * introProgress (starts at 0)
    // layer 1: zNorm = 1 - 1 = 0, z = 0
    // layer 2: zNorm = 2 - 1 = 1, z = 20 * introProgress (starts at 0)
    // At mount, introProgress starts at 0, so all should be translateZ(0px)
    const firstLayer = scene.children[0] as HTMLElement;
    expect(firstLayer.style.transform).toContain('translateZ');
  });

  it('renders animated layers with AnimatedPxlKitIcon', () => {
    const parallaxWithAnimated: ParallaxPxlKitData = {
      name: 'animated-parallax',
      size: 8,
      category: 'test',
      layers: [
        { icon: testAnimatedIcon, depth: 1 },
        { icon: testParallaxIcon.layers[1].icon, depth: 0 },
      ],
      tags: ['test'],
    };
    const { container } = render(
      <ParallaxPxlKitIcon icon={parallaxWithAnimated} colorful />
    );
    // Animated layer renders an inner <img> via PxlKitIcon; static layer
    // also renders an <img>. Two layers → two imgs.
    const imgs = container.querySelectorAll('img');
    expect(imgs.length).toBe(2);
  });

  it('applies drop-shadow filter on non-back layers when shadow=true', () => {
    const { container } = render(
      <ParallaxPxlKitIcon icon={testParallaxIcon} shadow={true} />
    );
    const scene = (container.firstChild as HTMLElement).children[0] as HTMLElement;
    // First layer (back) should NOT have shadow
    const backLayer = scene.children[0] as HTMLElement;
    expect(backLayer.style.filter).toBe('');
    // Second layer should have shadow
    const midLayer = scene.children[1] as HTMLElement;
    expect(midLayer.style.filter).toContain('drop-shadow');
  });

  it('does not apply shadow filter when shadow=false', () => {
    const { container } = render(
      <ParallaxPxlKitIcon icon={testParallaxIcon} shadow={false} />
    );
    const scene = (container.firstChild as HTMLElement).children[0] as HTMLElement;
    const midLayer = scene.children[1] as HTMLElement;
    expect(midLayer.style.filter).toBe('');
  });

  it('handles mousemove and mouseleave events without crashing', () => {
    const { container } = render(
      <ParallaxPxlKitIcon icon={testParallaxIcon} strength={10} />
    );
    const wrapper = container.firstChild as HTMLElement;

    // Simulate mouse events — should not throw
    expect(() => {
      fireEvent.mouseMove(wrapper, { clientX: 50, clientY: 50 });
      fireEvent.mouseLeave(wrapper);
    }).not.toThrow();
  });
});

describe('ParallaxPxlKitIcon — click burst and motion (shared parallax controller)', () => {
  let now = 0;
  let frames: FrameRequestCallback[] = [];

  beforeEach(() => {
    // jsdom has no canvas: hand the particle renderer a context that draws nothing.
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(
      (() => ({ clearRect() {}, fillRect() {}, globalAlpha: 1, fillStyle: '' })) as unknown as HTMLCanvasElement['getContext'],
    );
    now = 0;
    frames = [];
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      frames.push(cb);
      return frames.length;
    });
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});
    vi.spyOn(performance, 'now').mockImplementation(() => now);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function step(count: number) {
    for (let i = 0; i < count; i++) {
      now += 16;
      const due = frames.splice(0);
      act(() => due.forEach((cb) => cb(now)));
    }
  }

  function layerTransforms(container: HTMLElement): string[] {
    const scene = (container.firstChild as HTMLElement).children[0] as HTMLElement;
    return Array.from(scene.children).map((layer) => (layer as HTMLElement).style.transform);
  }

  it('peels the layers apart, explodes on click and springs back', () => {
    const { container } = render(<ParallaxPxlKitIcon icon={testParallaxIcon} layerGap={20} />);
    expect(layerTransforms(container)).toEqual(['translateZ(0px)', 'translateZ(0px)', 'translateZ(0px)']);

    step(60);
    const resting = ['translateZ(-20px)', 'translateZ(0px)', 'translateZ(20px)'];
    expect(layerTransforms(container)).toEqual(resting);

    fireEvent.click(container.firstChild as HTMLElement);
    step(1);
    expect(Number(/-?[\d.]+/.exec(layerTransforms(container)[0])![0])).toBeLessThan(-40);

    // Before the shared controller the stack stayed exploded until the next re-render.
    step(200);
    expect(layerTransforms(container)).toEqual(resting);
  });

  it('toggles the active hue-shift and reports it through onActivate', () => {
    const onActivate = vi.fn();
    const { container } = render(<ParallaxPxlKitIcon icon={testParallaxIcon} onActivate={onActivate} />);
    const root = container.firstChild as HTMLElement;
    const scene = root.children[0] as HTMLElement;

    fireEvent.click(root);
    expect(onActivate).toHaveBeenLastCalledWith(true);
    expect(scene.style.filter).toBe('hue-rotate(30deg) saturate(1.3)');

    fireEvent.click(root);
    expect(onActivate).toHaveBeenLastCalledWith(false);
    expect(scene.style.filter).toBe('');
  });

  it('is inert when interactive is false: no canvas, no pointer, no activation', () => {
    const onActivate = vi.fn();
    const { container } = render(
      <ParallaxPxlKitIcon icon={testParallaxIcon} interactive={false} onActivate={onActivate} />,
    );
    const root = container.firstChild as HTMLElement;
    expect(container.querySelector('canvas')).toBeNull();
    expect(root.style.cursor).toBe('');
    fireEvent.click(root);
    expect(onActivate).not.toHaveBeenCalled();
  });

  it('renders a size×size particle canvas when interactive', () => {
    const { container } = render(<ParallaxPxlKitIcon icon={testParallaxIcon} size={96} />);
    const canvas = container.querySelector('canvas')!;
    expect(canvas.getAttribute('width')).toBe('96');
    expect(canvas.getAttribute('height')).toBe('96');
    expect(canvas.style.pointerEvents).toBe('none');
  });

  it('stops animating once unmounted', () => {
    const { unmount } = render(<ParallaxPxlKitIcon icon={testParallaxIcon} />);
    unmount();
    expect(window.cancelAnimationFrame).toHaveBeenCalled();
  });
});

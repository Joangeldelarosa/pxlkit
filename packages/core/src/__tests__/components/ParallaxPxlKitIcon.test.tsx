import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
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

  it('renders SVGs inside layer divs', () => {
    const { container } = render(
      <ParallaxPxlKitIcon icon={testParallaxIcon} colorful />
    );
    const svgs = container.querySelectorAll('svg');
    expect(svgs.length).toBe(testParallaxIcon.layers.length);
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
    // Should render without errors
    const svgs = container.querySelectorAll('svg');
    expect(svgs.length).toBe(2);
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

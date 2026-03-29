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

  it('renders one child div per layer', () => {
    const { container } = render(
      <ParallaxPxlKitIcon icon={testParallaxIcon} />
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.children.length).toBe(testParallaxIcon.layers.length);
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
    const wrapper = container.firstChild as HTMLElement;
    const layerDiv = wrapper.children[0] as HTMLElement;
    expect(layerDiv.style.pointerEvents).toBe('none');
  });

  it('layer divs have will-change: transform', () => {
    const { container } = render(
      <ParallaxPxlKitIcon icon={testParallaxIcon} />
    );
    const wrapper = container.firstChild as HTMLElement;
    const layerDiv = wrapper.children[0] as HTMLElement;
    expect(layerDiv.style.willChange).toBe('transform');
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

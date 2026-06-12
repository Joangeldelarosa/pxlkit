import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { PixelFlicker } from '../../animations/PixelFlicker';

/**
 * jsdom lacks native CSS animation support, so React registers the
 * vendor-prefixed `webkitAnimationEnd` event there. Dispatch both variants —
 * exactly one is registered, so the handler fires exactly once.
 */
function dispatchAnimationEnd(el: Element) {
  fireEvent.animationEnd(el);
  el.dispatchEvent(new Event('webkitAnimationEnd', { bubbles: true }));
}

describe('PixelFlicker', () => {
  it('renders children inside the wrapper', () => {
    const { getByText } = render(<PixelFlicker>neon sign</PixelFlicker>);
    expect(getByText('neon sign')).toBeTruthy();
  });

  it('applies the pxl-flicker animation on mount with steps(1) timing', () => {
    const { container } = render(<PixelFlicker>x</PixelFlicker>);
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.animation).toContain('pxl-flicker');
    expect(el.style.animation).toContain('2200ms');
    expect(el.style.animation).toContain('steps(1)');
    expect(el.style.animation).toContain('infinite');
  });

  it('reflects duration and finite repeat props', () => {
    const { container } = render(<PixelFlicker duration={1000} repeat={4}>x</PixelFlicker>);
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.animation).toContain('1000ms');
    expect(el.style.animation).toContain(' 4 ');
  });

  it('does not animate when trigger={false} (controlled off)', () => {
    const { container } = render(<PixelFlicker trigger={false}>x</PixelFlicker>);
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.animation).toBe('');
  });

  it('trigger="click" only animates after a click', () => {
    const { container } = render(<PixelFlicker trigger="click">x</PixelFlicker>);
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.animation).toBe('');
    fireEvent.click(el);
    expect(el.style.animation).toContain('pxl-flicker');
  });

  it('fires onComplete when the animation ends on the wrapper', () => {
    const onComplete = vi.fn();
    const { container } = render(
      <PixelFlicker repeat={1} onComplete={onComplete}>x</PixelFlicker>,
    );
    dispatchAnimationEnd(container.firstElementChild as HTMLElement);
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('forwards className and injects the shared keyframes stylesheet once', () => {
    const { container } = render(<PixelFlicker className="custom">x</PixelFlicker>);
    const el = container.firstElementChild as HTMLElement;
    expect(el.className).toContain('custom');
    expect(document.querySelectorAll('#pxl-anims')).toHaveLength(1);
  });
});

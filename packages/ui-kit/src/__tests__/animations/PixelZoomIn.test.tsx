import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { PixelZoomIn } from '../../animations/PixelZoomIn';

/**
 * jsdom lacks native CSS animation support, so React registers the
 * vendor-prefixed `webkitAnimationEnd` event there. Dispatch both variants —
 * exactly one is registered, so the handler fires exactly once.
 */
function dispatchAnimationEnd(el: Element) {
  fireEvent.animationEnd(el);
  el.dispatchEvent(new Event('webkitAnimationEnd', { bubbles: true }));
}

describe('PixelZoomIn', () => {
  it('renders children inside the wrapper', () => {
    const { getByText } = render(<PixelZoomIn>zoomy</PixelZoomIn>);
    expect(getByText('zoomy')).toBeTruthy();
  });

  it('applies the pxl-zoom-in animation on mount with defaults', () => {
    const { container } = render(<PixelZoomIn>x</PixelZoomIn>);
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.animation).toContain('pxl-zoom-in');
    expect(el.style.animation).toContain('320ms');
    expect(el.style.getPropertyValue('--pxl-zoom-start')).toBe('0.92');
  });

  it('reflects duration, delay, startScale and repeat props', () => {
    const { container } = render(
      <PixelZoomIn duration={640} delay={80} startScale={0.5} repeat={3}>x</PixelZoomIn>,
    );
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.animation).toContain('640ms');
    expect(el.style.animation).toContain('80ms');
    expect(el.style.animation).toContain(' 3 ');
    expect(el.style.getPropertyValue('--pxl-zoom-start')).toBe('0.5');
  });

  it('does not animate when trigger={false} (controlled off)', () => {
    const { container } = render(<PixelZoomIn trigger={false}>x</PixelZoomIn>);
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.animation).toBe('');
  });

  it('trigger="click" only animates after a click', () => {
    const { container } = render(<PixelZoomIn trigger="click">x</PixelZoomIn>);
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.animation).toBe('');
    fireEvent.click(el);
    expect(el.style.animation).toContain('pxl-zoom-in');
  });

  it('fires onComplete when the animation ends on the wrapper', () => {
    const onComplete = vi.fn();
    const { container } = render(<PixelZoomIn onComplete={onComplete}>x</PixelZoomIn>);
    dispatchAnimationEnd(container.firstElementChild as HTMLElement);
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('forwards className and injects the shared keyframes stylesheet once', () => {
    const { container } = render(<PixelZoomIn className="custom">x</PixelZoomIn>);
    const el = container.firstElementChild as HTMLElement;
    expect(el.className).toContain('custom');
    expect(document.querySelectorAll('#pxl-anims')).toHaveLength(1);
  });
});

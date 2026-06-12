import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { PixelRotate } from '../../animations/PixelRotate';

/**
 * jsdom lacks native CSS animation support, so React registers the
 * vendor-prefixed `webkitAnimationEnd` event there. Dispatch both variants —
 * exactly one is registered, so the handler fires exactly once.
 */
function dispatchAnimationEnd(el: Element) {
  fireEvent.animationEnd(el);
  el.dispatchEvent(new Event('webkitAnimationEnd', { bubbles: true }));
}

describe('PixelRotate', () => {
  it('renders children inside the wrapper', () => {
    const { getByText } = render(<PixelRotate>spinner</PixelRotate>);
    expect(getByText('spinner')).toBeTruthy();
  });

  it('applies the pxl-rotate animation on mount with defaults', () => {
    const { container } = render(<PixelRotate>x</PixelRotate>);
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.animation).toContain('pxl-rotate');
    expect(el.style.animation).toContain('1800ms');
    expect(el.style.animation).toContain('linear');
    expect(el.style.animation).toContain('infinite');
  });

  it('reflects duration, repeat and direction props', () => {
    const { container } = render(
      <PixelRotate duration={600} repeat={2} direction="reverse">x</PixelRotate>,
    );
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.animation).toContain('600ms');
    expect(el.style.animation).toContain(' 2 ');
    expect(el.style.animationDirection).toBe('reverse');
  });

  it('does not animate when trigger={false} (controlled off)', () => {
    const { container } = render(<PixelRotate trigger={false}>x</PixelRotate>);
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.animation).toBe('');
  });

  it('trigger="click" only animates after a click', () => {
    const { container } = render(<PixelRotate trigger="click">x</PixelRotate>);
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.animation).toBe('');
    fireEvent.click(el);
    expect(el.style.animation).toContain('pxl-rotate');
  });

  it('fires onComplete when the animation ends on the wrapper', () => {
    const onComplete = vi.fn();
    const { container } = render(
      <PixelRotate repeat={1} onComplete={onComplete}>x</PixelRotate>,
    );
    dispatchAnimationEnd(container.firstElementChild as HTMLElement);
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('merges className with inline-block and injects keyframes once', () => {
    const { container } = render(<PixelRotate className="custom">x</PixelRotate>);
    const el = container.firstElementChild as HTMLElement;
    expect(el.className).toContain('inline-block');
    expect(el.className).toContain('custom');
    expect(document.querySelectorAll('#pxl-anims')).toHaveLength(1);
  });
});

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { PixelBounce } from '../../animations/PixelBounce';

/**
 * jsdom lacks native CSS animation support, so React registers the
 * vendor-prefixed `webkitAnimationEnd` event there. Dispatch both variants —
 * exactly one is registered, so the handler fires exactly once.
 */
function dispatchAnimationEnd(el: Element) {
  fireEvent.animationEnd(el);
  el.dispatchEvent(new Event('webkitAnimationEnd', { bubbles: true }));
}

describe('PixelBounce', () => {
  it('renders children inside the wrapper', () => {
    const { getByText } = render(<PixelBounce>bounce me</PixelBounce>);
    expect(getByText('bounce me')).toBeTruthy();
  });

  it('applies the pxl-bounce animation on mount with default duration', () => {
    const { container } = render(<PixelBounce>x</PixelBounce>);
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.animation).toContain('pxl-bounce');
    expect(el.style.animation).toContain('800ms');
    expect(el.style.animation).toContain('infinite');
  });

  it('reflects duration, repeat and height props in inline styles', () => {
    const { container } = render(
      <PixelBounce duration={500} repeat={3} height={16}>x</PixelBounce>,
    );
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.animation).toContain('500ms');
    expect(el.style.animation).toContain(' 3 ');
    expect(el.style.getPropertyValue('--pxl-bounce-height')).toBe('16px');
  });

  it('does not animate when trigger={false} (controlled off)', () => {
    const { container } = render(<PixelBounce trigger={false}>x</PixelBounce>);
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.animation).toBe('');
  });

  it('trigger="click" only animates after a click', () => {
    const { container } = render(<PixelBounce trigger="click">x</PixelBounce>);
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.animation).toBe('');
    fireEvent.click(el);
    expect(el.style.animation).toContain('pxl-bounce');
  });

  it('fires onComplete when the animation ends on the wrapper', () => {
    const onComplete = vi.fn();
    const { container } = render(
      <PixelBounce repeat={1} onComplete={onComplete}>x</PixelBounce>,
    );
    const el = container.firstElementChild as HTMLElement;
    dispatchAnimationEnd(el);
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('merges className and injects the shared keyframes stylesheet once', () => {
    const { container } = render(<PixelBounce className="custom">x</PixelBounce>);
    const el = container.firstElementChild as HTMLElement;
    expect(el.className).toContain('inline-block');
    expect(el.className).toContain('custom');
    expect(document.querySelectorAll('#pxl-anims')).toHaveLength(1);
  });
});

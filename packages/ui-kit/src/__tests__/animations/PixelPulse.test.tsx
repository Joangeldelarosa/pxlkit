import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { PixelPulse } from '../../animations/PixelPulse';

/**
 * jsdom lacks native CSS animation support, so React registers the
 * vendor-prefixed `webkitAnimationEnd` event there. Dispatch both variants —
 * exactly one is registered, so the handler fires exactly once.
 */
function dispatchAnimationEnd(el: Element) {
  fireEvent.animationEnd(el);
  el.dispatchEvent(new Event('webkitAnimationEnd', { bubbles: true }));
}

describe('PixelPulse', () => {
  it('renders children inside the wrapper', () => {
    const { getByText } = render(<PixelPulse>pulse me</PixelPulse>);
    expect(getByText('pulse me')).toBeTruthy();
  });

  it('applies the pxl-pulse animation on mount with defaults', () => {
    const { container } = render(<PixelPulse>x</PixelPulse>);
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.animation).toContain('pxl-pulse');
    expect(el.style.animation).toContain('2000ms');
    expect(el.style.animation).toContain('infinite');
  });

  it('reflects duration, repeat and easing props', () => {
    const { container } = render(
      <PixelPulse duration={750} repeat={5} easing="linear">x</PixelPulse>,
    );
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.animation).toContain('750ms');
    expect(el.style.animation).toContain(' 5 ');
    expect(el.style.animation).toContain('linear');
  });

  it('does not animate when trigger={false} (controlled off)', () => {
    const { container } = render(<PixelPulse trigger={false}>x</PixelPulse>);
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.animation).toBe('');
  });

  it('trigger="click" only animates after a click', () => {
    const { container } = render(<PixelPulse trigger="click">x</PixelPulse>);
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.animation).toBe('');
    fireEvent.click(el);
    expect(el.style.animation).toContain('pxl-pulse');
  });

  it('fires onComplete when the animation ends on the wrapper', () => {
    const onComplete = vi.fn();
    const { container } = render(
      <PixelPulse repeat={1} onComplete={onComplete}>x</PixelPulse>,
    );
    dispatchAnimationEnd(container.firstElementChild as HTMLElement);
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('forwards className and injects the shared keyframes stylesheet once', () => {
    const { container } = render(<PixelPulse className="custom">x</PixelPulse>);
    const el = container.firstElementChild as HTMLElement;
    expect(el.className).toContain('custom');
    expect(document.querySelectorAll('#pxl-anims')).toHaveLength(1);
  });
});

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { PixelFloat } from '../../animations/PixelFloat';
import { mockMatchMedia } from './matchmedia-mock';

/**
 * jsdom lacks native CSS animation support, so React registers the
 * vendor-prefixed `webkitAnimationEnd` event there. Dispatch both variants —
 * exactly one is registered, so the handler fires exactly once.
 */
function dispatchAnimationEnd(el: Element) {
  fireEvent.animationEnd(el);
  el.dispatchEvent(new Event('webkitAnimationEnd', { bubbles: true }));
}

describe('PixelFloat', () => {
  it('renders children inside the wrapper', () => {
    const { getByText } = render(<PixelFloat>floaty</PixelFloat>);
    expect(getByText('floaty')).toBeTruthy();
  });

  it('applies the pxl-float animation on mount with defaults', () => {
    const { container } = render(<PixelFloat>x</PixelFloat>);
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.animation).toContain('pxl-float');
    expect(el.style.animation).toContain('2200ms');
    expect(el.style.animation).toContain('infinite');
  });

  it('reflects duration, repeat and distance props', () => {
    const { container } = render(
      <PixelFloat duration={1500} repeat={2} distance={12}>x</PixelFloat>,
    );
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.animation).toContain('1500ms');
    expect(el.style.animation).toContain(' 2 ');
    expect(el.style.getPropertyValue('--pxl-float-distance')).toBe('12px');
  });

  it('does not animate when trigger={false} (controlled off)', () => {
    const { container } = render(<PixelFloat trigger={false}>x</PixelFloat>);
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.animation).toBe('');
  });

  it('trigger="click" only animates after a click', () => {
    const { container } = render(<PixelFloat trigger="click">x</PixelFloat>);
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.animation).toBe('');
    fireEvent.click(el);
    expect(el.style.animation).toContain('pxl-float');
  });

  it('fires onComplete when the animation ends on the wrapper', () => {
    const onComplete = vi.fn();
    const { container } = render(
      <PixelFloat repeat={1} onComplete={onComplete}>x</PixelFloat>,
    );
    dispatchAnimationEnd(container.firstElementChild as HTMLElement);
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('renders children statically (no animation) when the user prefers reduced motion', () => {
    const ctl = mockMatchMedia(true);
    try {
      const { container, getByText } = render(<PixelFloat>calm</PixelFloat>);
      const el = container.firstElementChild as HTMLElement;
      expect(el.style.animation).toBe('');
      expect(getByText('calm')).toBeTruthy();
    } finally {
      ctl.restore();
    }
  });

  it('merges className with inline-block and injects keyframes once', () => {
    const { container } = render(<PixelFloat className="custom">x</PixelFloat>);
    const el = container.firstElementChild as HTMLElement;
    expect(el.className).toContain('inline-block');
    expect(el.className).toContain('custom');
    expect(document.querySelectorAll('#pxl-anims')).toHaveLength(1);
  });
});

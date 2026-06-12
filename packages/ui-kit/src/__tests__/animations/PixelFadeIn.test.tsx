import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { PixelFadeIn } from '../../animations/PixelFadeIn';
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

describe('PixelFadeIn', () => {
  it('renders children inside the wrapper', () => {
    const { getByText } = render(<PixelFadeIn>fade me</PixelFadeIn>);
    expect(getByText('fade me')).toBeTruthy();
  });

  it('applies the pxl-fade-in animation on mount with defaults', () => {
    const { container } = render(<PixelFadeIn>x</PixelFadeIn>);
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.animation).toContain('pxl-fade-in');
    expect(el.style.animation).toContain('400ms');
    expect(el.style.animation).toContain('both');
  });

  it('reflects duration, delay, repeat and fillMode props', () => {
    const { container } = render(
      <PixelFadeIn duration={900} delay={150} repeat={2} fillMode="forwards">x</PixelFadeIn>,
    );
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.animation).toContain('900ms');
    expect(el.style.animation).toContain('150ms');
    expect(el.style.animation).toContain(' 2 ');
    expect(el.style.animation).toContain('forwards');
  });

  it('does not animate when trigger={false} (controlled off)', () => {
    const { container } = render(<PixelFadeIn trigger={false}>x</PixelFadeIn>);
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.animation).toBe('');
  });

  it('trigger="click" only animates after a click', () => {
    const { container } = render(<PixelFadeIn trigger="click">x</PixelFadeIn>);
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.animation).toBe('');
    fireEvent.click(el);
    expect(el.style.animation).toContain('pxl-fade-in');
  });

  it('fires onComplete when the animation ends on the wrapper', () => {
    const onComplete = vi.fn();
    const { container } = render(<PixelFadeIn onComplete={onComplete}>x</PixelFadeIn>);
    dispatchAnimationEnd(container.firstElementChild as HTMLElement);
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('renders children statically (fully visible, no animation) when the user prefers reduced motion', () => {
    const ctl = mockMatchMedia(true);
    try {
      const { container, getByText } = render(<PixelFadeIn>calm</PixelFadeIn>);
      const el = container.firstElementChild as HTMLElement;
      expect(el.style.animation).toBe('');
      expect(getByText('calm')).toBeTruthy();
    } finally {
      ctl.restore();
    }
  });

  it('forwards className and injects the shared keyframes stylesheet once', () => {
    const { container } = render(<PixelFadeIn className="custom">x</PixelFadeIn>);
    const el = container.firstElementChild as HTMLElement;
    expect(el.className).toContain('custom');
    expect(document.querySelectorAll('#pxl-anims')).toHaveLength(1);
  });
});

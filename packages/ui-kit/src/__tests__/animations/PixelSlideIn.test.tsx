import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { PixelSlideIn } from '../../animations/PixelSlideIn';
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

describe('PixelSlideIn', () => {
  it('renders children inside the wrapper', () => {
    const { getByText } = render(<PixelSlideIn>slide me</PixelSlideIn>);
    expect(getByText('slide me')).toBeTruthy();
  });

  it('slides from "down" by default with the default duration', () => {
    const { container } = render(<PixelSlideIn>x</PixelSlideIn>);
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.animation).toContain('pxl-slide-down');
    expect(el.style.animation).toContain('350ms');
  });

  it.each(['up', 'down', 'left', 'right'] as const)(
    'from="%s" picks the matching keyframe',
    (from) => {
      const { container } = render(<PixelSlideIn from={from}>x</PixelSlideIn>);
      const el = container.firstElementChild as HTMLElement;
      expect(el.style.animation).toContain(`pxl-slide-${from}`);
    },
  );

  it('reflects duration, delay, distance and repeat props', () => {
    const { container } = render(
      <PixelSlideIn duration={500} delay={100} distance={24} repeat={2}>x</PixelSlideIn>,
    );
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.animation).toContain('500ms');
    expect(el.style.animation).toContain('100ms');
    expect(el.style.animation).toContain(' 2 ');
    expect(el.style.getPropertyValue('--pxl-slide-distance')).toBe('24px');
  });

  it('does not animate when trigger={false} (controlled off)', () => {
    const { container } = render(<PixelSlideIn trigger={false}>x</PixelSlideIn>);
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.animation).toBe('');
  });

  it('trigger="click" only animates after a click', () => {
    const { container } = render(<PixelSlideIn trigger="click">x</PixelSlideIn>);
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.animation).toBe('');
    fireEvent.click(el);
    expect(el.style.animation).toContain('pxl-slide-down');
  });

  it('fires onComplete when the animation ends on the wrapper', () => {
    const onComplete = vi.fn();
    const { container } = render(<PixelSlideIn onComplete={onComplete}>x</PixelSlideIn>);
    dispatchAnimationEnd(container.firstElementChild as HTMLElement);
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('renders children statically (fully visible, no animation) when the user prefers reduced motion', () => {
    const ctl = mockMatchMedia(true);
    try {
      const { container, getByText } = render(<PixelSlideIn>calm</PixelSlideIn>);
      const el = container.firstElementChild as HTMLElement;
      expect(el.style.animation).toBe('');
      expect(getByText('calm')).toBeTruthy();
    } finally {
      ctl.restore();
    }
  });

  it('forwards className and injects the shared keyframes stylesheet once', () => {
    const { container } = render(<PixelSlideIn className="custom">x</PixelSlideIn>);
    const el = container.firstElementChild as HTMLElement;
    expect(el.className).toContain('custom');
    expect(document.querySelectorAll('#pxl-anims')).toHaveLength(1);
  });
});

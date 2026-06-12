import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { PixelShake } from '../../animations/PixelShake';
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

describe('PixelShake', () => {
  it('renders children inside the wrapper', () => {
    const { getByText } = render(<PixelShake>shaky</PixelShake>);
    expect(getByText('shaky')).toBeTruthy();
  });

  it('applies the pxl-shake animation on mount with defaults (single run)', () => {
    const { container } = render(<PixelShake>x</PixelShake>);
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.animation).toContain('pxl-shake');
    expect(el.style.animation).toContain('450ms');
    expect(el.style.animation).toContain(' 1 ');
  });

  it('reflects duration, repeat and distance props', () => {
    const { container } = render(
      <PixelShake duration={300} repeat="infinite" distance={6}>x</PixelShake>,
    );
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.animation).toContain('300ms');
    expect(el.style.animation).toContain('infinite');
    expect(el.style.getPropertyValue('--pxl-shake-distance')).toBe('6px');
  });

  it('does not animate when trigger={false} (controlled off)', () => {
    const { container } = render(<PixelShake trigger={false}>x</PixelShake>);
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.animation).toBe('');
  });

  it('trigger="click" only animates after a click', () => {
    const { container } = render(<PixelShake trigger="click">x</PixelShake>);
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.animation).toBe('');
    fireEvent.click(el);
    expect(el.style.animation).toContain('pxl-shake');
  });

  it('fires onComplete when the animation ends on the wrapper', () => {
    const onComplete = vi.fn();
    const { container } = render(<PixelShake onComplete={onComplete}>x</PixelShake>);
    dispatchAnimationEnd(container.firstElementChild as HTMLElement);
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('renders children statically (no animation) when the user prefers reduced motion', () => {
    const ctl = mockMatchMedia(true);
    try {
      const { container, getByText } = render(<PixelShake>calm</PixelShake>);
      const el = container.firstElementChild as HTMLElement;
      expect(el.style.animation).toBe('');
      expect(getByText('calm')).toBeTruthy();
    } finally {
      ctl.restore();
    }
  });

  it('merges className with inline-block and injects keyframes once', () => {
    const { container } = render(<PixelShake className="custom">x</PixelShake>);
    const el = container.firstElementChild as HTMLElement;
    expect(el.className).toContain('inline-block');
    expect(el.className).toContain('custom');
    expect(document.querySelectorAll('#pxl-anims')).toHaveLength(1);
  });
});

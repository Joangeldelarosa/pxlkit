import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { OverlayBackdrop } from '../../overlays/_internal/OverlayBackdrop';

describe('OverlayBackdrop — internal scrim primitive', () => {
  it('renders a div with data-pxl-overlay-backdrop attribute', () => {
    const { container } = render(<OverlayBackdrop />);
    const el = container.querySelector('[data-pxl-overlay-backdrop]');
    expect(el).toBeTruthy();
    expect(el?.tagName).toBe('DIV');
  });

  it('defaults to fixed positioning, bg-retro-bg/80, backdrop-blur-sm', () => {
    const { container } = render(<OverlayBackdrop />);
    const el = container.querySelector('[data-pxl-overlay-backdrop]') as HTMLElement;
    expect(el.className).toContain('fixed');
    expect(el.className).toContain('inset-0');
    expect(el.className).toContain('bg-retro-bg/80');
    expect(el.className).toContain('backdrop-blur-sm');
    // Must NOT use the buggy --retro-text token.
    expect(el.className).not.toContain('bg-retro-text');
  });

  it('position="absolute" switches positioning class', () => {
    const { container } = render(<OverlayBackdrop position="absolute" />);
    const el = container.querySelector('[data-pxl-overlay-backdrop]') as HTMLElement;
    expect(el.className).toContain('absolute');
    expect(el.className).not.toMatch(/\bfixed\b/);
  });

  it('blur={false} omits the backdrop-blur class', () => {
    const { container } = render(<OverlayBackdrop blur={false} />);
    const el = container.querySelector('[data-pxl-overlay-backdrop]') as HTMLElement;
    expect(el.className).not.toContain('backdrop-blur-sm');
  });

  it('opacity={70} renders bg-retro-bg/70', () => {
    const { container } = render(<OverlayBackdrop opacity={70} />);
    const el = container.querySelector('[data-pxl-overlay-backdrop]') as HTMLElement;
    expect(el.className).toContain('bg-retro-bg/70');
    expect(el.className).not.toContain('bg-retro-bg/80');
  });

  it('opacity={90} renders bg-retro-bg/90', () => {
    const { container } = render(<OverlayBackdrop opacity={90} />);
    const el = container.querySelector('[data-pxl-overlay-backdrop]') as HTMLElement;
    expect(el.className).toContain('bg-retro-bg/90');
  });

  it('opacity={60} renders bg-retro-bg/60', () => {
    const { container } = render(<OverlayBackdrop opacity={60} />);
    const el = container.querySelector('[data-pxl-overlay-backdrop]') as HTMLElement;
    expect(el.className).toContain('bg-retro-bg/60');
  });

  it('fires onClick when clicked', () => {
    const onClick = vi.fn();
    const { container } = render(<OverlayBackdrop onClick={onClick} />);
    const el = container.querySelector('[data-pxl-overlay-backdrop]') as HTMLElement;
    fireEvent.click(el);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('defaults aria-hidden to true', () => {
    const { container } = render(<OverlayBackdrop />);
    const el = container.querySelector('[data-pxl-overlay-backdrop]') as HTMLElement;
    expect(el.getAttribute('aria-hidden')).toBe('true');
  });

  it('forwards extra props (e.g. data-* hooks) to the underlying div', () => {
    const { container } = render(
      <OverlayBackdrop data-pxl-drawer-overlay="" />,
    );
    const el = container.querySelector('[data-pxl-drawer-overlay]') as HTMLElement;
    expect(el).toBeTruthy();
    expect(el.getAttribute('data-pxl-overlay-backdrop')).toBe('');
  });

  it('exposes the expected displayName', () => {
    expect(OverlayBackdrop.displayName).toBe('OverlayBackdrop');
  });
});

import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render } from '@testing-library/react';
import { PixelSpinner } from '../../feedback/PixelSpinner';

type Listener = (e: { matches: boolean }) => void;

function createMatchMediaMock(initialMatches: boolean) {
  const listeners = new Set<Listener>();
  const mql = {
    matches: initialMatches,
    media: '',
    addEventListener: vi.fn((_evt: string, cb: Listener) => {
      listeners.add(cb);
    }),
    removeEventListener: vi.fn((_evt: string, cb: Listener) => {
      listeners.delete(cb);
    }),
    addListener: vi.fn((cb: Listener) => listeners.add(cb)),
    removeListener: vi.fn((cb: Listener) => listeners.delete(cb)),
    dispatchEvent: vi.fn(),
    onchange: null,
  };
  return { mql };
}

describe('PixelSpinner', () => {
  let originalMatchMedia: typeof window.matchMedia | undefined;

  beforeEach(() => {
    originalMatchMedia = window.matchMedia;
    // Default: no reduced motion match.
    const { mql } = createMatchMediaMock(false);
    window.matchMedia = vi.fn().mockReturnValue(mql) as unknown as typeof window.matchMedia;
  });

  afterEach(() => {
    if (originalMatchMedia) {
      window.matchMedia = originalMatchMedia;
    } else {
      // @ts-expect-error cleanup
      delete window.matchMedia;
    }
    vi.restoreAllMocks();
  });

  it('renders span with role=status', () => {
    const { getByRole } = render(<PixelSpinner label="Loading" />);
    const el = getByRole('status');
    expect(el).toBeTruthy();
    expect(el.tagName).toBe('SPAN');
  });

  it('label provides accessible name', () => {
    const { getByRole } = render(<PixelSpinner label="Cargando datos" />);
    const el = getByRole('status');
    expect(el.getAttribute('aria-label')).toBe('Cargando datos');
  });

  it('size sm applies sm class', () => {
    const { getByRole } = render(<PixelSpinner label="x" size="sm" />);
    const el = getByRole('status');
    // sm = h-3 w-3
    expect(el.className).toContain('h-3');
    expect(el.className).toContain('w-3');
  });

  it('tone cyan applies cyan color', () => {
    const { getByRole } = render(<PixelSpinner label="x" tone="cyan" />);
    const el = getByRole('status');
    expect(el.className).toContain('text-retro-cyan');
  });

  it('respects useReducedMotion (mock matchMedia → no animation)', () => {
    // Re-mock matchMedia to report reduced-motion=true.
    const { mql } = createMatchMediaMock(true);
    window.matchMedia = vi.fn().mockReturnValue(mql) as unknown as typeof window.matchMedia;

    const { getByRole } = render(<PixelSpinner label="x" />);
    const el = getByRole('status');
    // No animate-* utility should be applied when reduced motion is on.
    expect(el.className).not.toMatch(/animate-/);
    // Inner spinning element should also not carry an animation style.
    const inner = el.querySelector('[data-pxl-spinner-blade]');
    if (inner) {
      const style = (inner as HTMLElement).getAttribute('style') || '';
      expect(style).not.toMatch(/animation/i);
    }
  });
});

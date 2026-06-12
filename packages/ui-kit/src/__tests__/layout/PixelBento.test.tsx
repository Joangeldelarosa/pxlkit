import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { PixelBento } from '../../layout/PixelBento';

// PixelBentoCell-specific behavior lives in ./PixelBentoCell.test.tsx.

describe('PixelBento', () => {
  it('renders responsive grid with columns=3 by default (mobile-first 1-col stack)', () => {
    const { getByTestId } = render(<PixelBento data-testid="bento" />);
    const el = getByTestId('bento');
    expect(el.className).toContain('grid');
    // Responsive Tailwind classes — 1 col on mobile, 2 on sm, 3 on lg
    expect(el.className).toContain('grid-cols-1');
    expect(el.className).toContain('sm:grid-cols-2');
    expect(el.className).toContain('lg:grid-cols-3');
    expect(el.getAttribute('data-columns')).toBe('3');
    // gridTemplateColumns is no longer inline — Tailwind drives it via breakpoint classes
    expect(el.style.gridTemplateColumns).toBe('');
    // gridAutoRows still inline
    expect(el.style.gridAutoRows).toContain('minmax(160px');
  });

  it('renders responsive grid with columns=4', () => {
    const { getByTestId } = render(<PixelBento data-testid="bento" columns={4} />);
    const el = getByTestId('bento');
    expect(el.className).toContain('lg:grid-cols-4');
    expect(el.getAttribute('data-columns')).toBe('4');
  });

  it('renders responsive grid with columns=6', () => {
    const { getByTestId } = render(<PixelBento data-testid="bento" columns={6} />);
    const el = getByTestId('bento');
    expect(el.className).toContain('lg:grid-cols-6');
    expect(el.getAttribute('data-columns')).toBe('6');
  });

});

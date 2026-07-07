import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { PixelGrid } from '../../layout/PixelGrid';

describe('PixelGrid', () => {
  it('cols=3 produces grid-cols-3', () => {
    const { getByTestId } = render(<PixelGrid data-testid="grid" cols={3} />);
    const el = getByTestId('grid');
    expect(el.className).toContain('grid');
    expect(el.className).toContain('grid-cols-3');
  });

  it('cols={base:1, md:2, lg:3} contains grid-cols-1 md:grid-cols-2 lg:grid-cols-3', () => {
    const { getByTestId } = render(
      <PixelGrid data-testid="grid" cols={{ base: 1, md: 2, lg: 3 }} />,
    );
    const el = getByTestId('grid');
    expect(el.className).toContain('grid-cols-1');
    expect(el.className).toContain('md:grid-cols-2');
    expect(el.className).toContain('lg:grid-cols-3');
  });

  it('autoFit produces inline style with auto-fit and minmax', () => {
    const { getByTestId } = render(
      <PixelGrid data-testid="grid" autoFit minColWidth="200px" />,
    );
    const el = getByTestId('grid');
    expect(el.style.gridTemplateColumns).toContain('auto-fit');
    expect(el.style.gridTemplateColumns).toContain('minmax(min(200px, 100%)');
  });

  it('gap=6 produces gap-6', () => {
    const { getByTestId } = render(<PixelGrid data-testid="grid" gap={6} />);
    const el = getByTestId('grid');
    expect(el.className).toContain('gap-6');
  });
});

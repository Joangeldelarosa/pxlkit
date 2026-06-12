import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PixelColorSwatch } from '../../data/PixelColorSwatch';

describe('PixelColorSwatch — rendering', () => {
  it('renders the token name and the CSS var label', () => {
    render(<PixelColorSwatch name="Cyan 500" cssVar="--retro-cyan" />);
    expect(screen.getByText('Cyan 500')).toBeInTheDocument();
    expect(screen.getByText('--retro-cyan')).toBeInTheDocument();
  });

  it('paints the preview square with backgroundColor var(<cssVar>)', () => {
    const { container } = render(
      <PixelColorSwatch name="Gold" cssVar="--retro-gold" />,
    );
    const square = container.querySelector('div.h-8.w-8') as HTMLElement;
    expect(square).not.toBeNull();
    expect(square.style.backgroundColor).toBe('var(--retro-gold)');
  });
});

describe('PixelColorSwatch — surface', () => {
  it('default pixel surface uses border-2 + staircase corner on the square', () => {
    const { container } = render(
      <PixelColorSwatch name="N" cssVar="--x" />,
    );
    const square = container.querySelector('div.h-8.w-8') as HTMLElement;
    expect(square.className).toContain('border-2');
    expect(square.className).toContain('pxl-corner-sm');
  });

  it('surface="linear" uses rounded corner + thin border on the square', () => {
    const { container } = render(
      <PixelColorSwatch name="N" cssVar="--x" surface="linear" />,
    );
    const square = container.querySelector('div.h-8.w-8') as HTMLElement;
    expect(square.className).toContain('rounded-md');
    expect(square.className).not.toContain('border-2');
  });
});

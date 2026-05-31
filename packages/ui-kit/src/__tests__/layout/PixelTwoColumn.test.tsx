import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { PixelTwoColumn } from '../../layout/PixelTwoColumn';

describe('PixelTwoColumn', () => {
  it('renders two children in their slots', () => {
    const { getByTestId } = render(
      <PixelTwoColumn
        data-testid="tc"
        left={<div data-testid="left">L</div>}
        right={<div data-testid="right">R</div>}
      />,
    );
    expect(getByTestId('left')).toBeInTheDocument();
    expect(getByTestId('right')).toBeInTheDocument();
    expect(getByTestId('left').textContent).toBe('L');
    expect(getByTestId('right').textContent).toBe('R');
  });

  it('ratio="60/40" applies grid template columns 3fr 2fr', () => {
    const { getByTestId } = render(
      <PixelTwoColumn
        data-testid="tc"
        ratio="60/40"
        stackBelow={undefined as unknown as 'md'}
        left={<div>L</div>}
        right={<div>R</div>}
      />,
    );
    const el = getByTestId('tc');
    // The breakpoint-prefixed class encodes the ratio
    expect(el.className).toContain('md:grid-cols-[3fr_2fr]');
  });

  it('stackBelow="md" produces grid-cols-1 md:grid-cols-[3fr_2fr] pattern', () => {
    const { getByTestId } = render(
      <PixelTwoColumn
        data-testid="tc"
        ratio="60/40"
        stackBelow="md"
        left={<div>L</div>}
        right={<div>R</div>}
      />,
    );
    const el = getByTestId('tc');
    expect(el.className).toContain('grid-cols-1');
    expect(el.className).toContain('md:grid-cols-[3fr_2fr]');
  });

  it('reverse=true swaps DOM order via CSS order', () => {
    const { getByTestId } = render(
      <PixelTwoColumn
        data-testid="tc"
        reverse
        left={<div data-testid="left">L</div>}
        right={<div data-testid="right">R</div>}
      />,
    );
    const left = getByTestId('left').parentElement!;
    const right = getByTestId('right').parentElement!;
    // When reverse=true, left slot gets a higher CSS order than right
    expect(left.className).toContain('order-2');
    expect(right.className).toContain('order-1');
  });
});

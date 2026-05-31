import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { PixelBento, PixelBentoCell } from '../../layout/PixelBento';

describe('PixelBento', () => {
  it('renders grid with columns=3 by default', () => {
    const { getByTestId } = render(<PixelBento data-testid="bento" />);
    const el = getByTestId('bento');
    expect(el.className).toContain('grid');
    expect(el.style.gridTemplateColumns).toContain('repeat(3');
  });

  it('PixelBentoCell span="2x2" applies col-span-2 row-span-2', () => {
    const { getByTestId } = render(
      <PixelBento>
        <PixelBentoCell data-testid="cell" span="2x2" />
      </PixelBento>,
    );
    const el = getByTestId('cell');
    expect(el.className).toContain('col-span-2');
    expect(el.className).toContain('row-span-2');
  });

  it('PixelBentoCell kind="stat" renders a stat-style layout', () => {
    const { getByTestId } = render(
      <PixelBento>
        <PixelBentoCell data-testid="cell" kind="stat">
          <span>42</span>
        </PixelBentoCell>
      </PixelBento>,
    );
    const el = getByTestId('cell');
    expect(el.getAttribute('data-kind')).toBe('stat');
  });

  it('PixelBentoCell tone="purple" bordered applies purple border', () => {
    const { getByTestId } = render(
      <PixelBento>
        <PixelBentoCell data-testid="cell" tone="purple" bordered />
      </PixelBento>,
    );
    const el = getByTestId('cell');
    expect(el.className).toContain('border-retro-purple/30');
  });
});

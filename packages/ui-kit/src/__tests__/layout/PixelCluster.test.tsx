import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { PixelCluster } from '../../layout/PixelCluster';

describe('PixelCluster', () => {
  it('renders with flex-row + flex-wrap + items-center default', () => {
    const { getByTestId } = render(<PixelCluster data-testid="cluster" />);
    const el = getByTestId('cluster');
    expect(el.className).toContain('flex');
    expect(el.className).toContain('flex-row');
    expect(el.className).toContain('flex-wrap');
    expect(el.className).toContain('items-center');
  });

  it('gap=2 produces gap-2', () => {
    const { getByTestId } = render(<PixelCluster data-testid="cluster" gap={2} />);
    const el = getByTestId('cluster');
    expect(el.className).toContain('gap-2');
  });

  it('justify=end produces justify-end', () => {
    const { getByTestId } = render(<PixelCluster data-testid="cluster" justify="end" />);
    const el = getByTestId('cluster');
    expect(el.className).toContain('justify-end');
  });
});

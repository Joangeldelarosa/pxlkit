import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { PixelStack } from '../../layout/PixelStack';

describe('PixelStack', () => {
  it('renders flex flex-col with gap-4 by default', () => {
    const { getByTestId } = render(<PixelStack data-testid="stack" />);
    const el = getByTestId('stack');
    expect(el.className).toContain('flex');
    expect(el.className).toContain('flex-col');
    expect(el.className).toContain('gap-4');
  });

  it('direction="row" produces flex-row', () => {
    const { getByTestId } = render(<PixelStack data-testid="stack" direction="row" />);
    const el = getByTestId('stack');
    expect(el.className).toContain('flex-row');
  });

  it('wrap=true produces flex-wrap', () => {
    const { getByTestId } = render(<PixelStack data-testid="stack" wrap />);
    const el = getByTestId('stack');
    expect(el.className).toContain('flex-wrap');
  });

  it('gap=8 produces gap-8', () => {
    const { getByTestId } = render(<PixelStack data-testid="stack" gap={8} />);
    const el = getByTestId('stack');
    expect(el.className).toContain('gap-8');
  });

  it('forwards className', () => {
    const { getByTestId } = render(<PixelStack data-testid="stack" className="custom-class" />);
    const el = getByTestId('stack');
    expect(el.className).toContain('custom-class');
  });
});

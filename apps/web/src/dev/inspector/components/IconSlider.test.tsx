import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import type { IconPack, PxlKitData } from '@pxlkit/core';
import { IconSlider } from './IconSlider';

const makeIcon = (name: string): PxlKitData => ({
  name,
  size: 16,
  category: 't',
  grid: Array.from({ length: 16 }, () => '.'.repeat(16)),
  palette: {},
  tags: [],
});

const pack: IconPack = {
  id: 't',
  name: 'T',
  description: '',
  version: '1.0.0',
  author: 'x',
  icons: Array.from({ length: 12 }, (_, i) => makeIcon(`i${i}`)),
};

const props = { cell: 48, grid: false, gridColor: '#fff', bg: 'dark' as const, appearance: 'palette' as const };

describe('IconSlider', () => {
  it('shows at most perPage icons per page', () => {
    const { container } = render(<IconSlider pack={pack} perPage={9} {...props} />);
    expect(container.querySelectorAll('[data-testid="icon-stage"]')).toHaveLength(9);
  });

  it('advances to the next page on next click', () => {
    const { container } = render(<IconSlider pack={pack} perPage={9} {...props} />);
    fireEvent.click(screen.getByTestId('slider-next'));
    expect(container.querySelectorAll('[data-testid="icon-stage"]')).toHaveLength(3);
  });

  it('exposes a page indicator', () => {
    render(<IconSlider pack={pack} perPage={9} {...props} />);
    expect(screen.getByTestId('slider-page')).toHaveTextContent('1 / 2');
  });
});

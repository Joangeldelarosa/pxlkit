import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import type { IconPack, PxlKitData } from '@pxlkit/core';
import { IconStrip } from './IconStrip';

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
  icons: Array.from({ length: 11 }, (_, i) => makeIcon(`i${i}`)),
};

describe('IconStrip', () => {
  it('renders the whole collection in a single band', () => {
    const { container } = render(
      <IconStrip pack={pack} cell={48} grid={false} gridColor="#fff" bg="dark" appearance="palette" />,
    );
    expect(container.querySelector('[data-testid="icon-strip"]')).not.toBeNull();
    expect(container.querySelectorAll('[data-testid="icon-stage"]')).toHaveLength(11);
  });
});

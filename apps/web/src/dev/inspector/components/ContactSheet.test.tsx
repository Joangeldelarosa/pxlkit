import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { IconPack, PxlKitData } from '@pxlkit/core';
import { ContactSheet } from './ContactSheet';

const makeIcon = (name: string): PxlKitData => ({
  name,
  size: 16,
  category: 'test',
  grid: Array.from({ length: 16 }, () => '.'.repeat(16)),
  palette: {},
  tags: [],
});

const pack: IconPack = {
  id: 'test',
  name: 'Test',
  description: '',
  version: '1.0.0',
  author: 'x',
  icons: [makeIcon('dot'), makeIcon('dot-two')],
};

describe('ContactSheet', () => {
  it('renders one stage per pack icon', () => {
    const { container } = render(
      <ContactSheet pack={pack} cell={48} grid={false} gridColor="#fff" bg="dark" appearance="palette" />,
    );
    expect(container.querySelectorAll('[data-testid="icon-stage"]')).toHaveLength(2);
  });

  it('labels each cell with the icon name', () => {
    render(<ContactSheet pack={pack} cell={48} grid={false} gridColor="#fff" bg="dark" appearance="palette" />);
    expect(screen.getByText('dot')).toBeInTheDocument();
    expect(screen.getByText('dot-two')).toBeInTheDocument();
  });
});

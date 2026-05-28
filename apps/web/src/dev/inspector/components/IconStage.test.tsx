import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { PxlKitData } from '@pxlkit/core';
import { IconStage } from './IconStage';

const fakeIcon: PxlKitData = {
  name: 'dot',
  size: 16,
  category: 'test',
  grid: Array.from({ length: 16 }, () => '.'.repeat(16)),
  palette: {},
  tags: [],
};

describe('IconStage', () => {
  it('renders the icon image and a size + scale label', () => {
    const { container } = render(
      <IconStage icon={fakeIcon} size={64} grid={false} gridColor="#fff" bg="dark" appearance="palette" />,
    );
    expect(container.querySelector('img')).not.toBeNull();
    expect(screen.getByText(/64px/)).toBeInTheDocument();
    expect(screen.getByText(/4×/)).toBeInTheDocument();
  });

  it('mounts the grid overlay only when grid is on', () => {
    const { container, rerender } = render(
      <IconStage icon={fakeIcon} size={64} grid={false} gridColor="#fff" bg="dark" appearance="palette" />,
    );
    expect(container.querySelector('[data-testid="grid-overlay"]')).toBeNull();

    rerender(
      <IconStage icon={fakeIcon} size={64} grid gridColor="#fff" bg="dark" appearance="palette" />,
    );
    expect(container.querySelector('[data-testid="grid-overlay"]')).not.toBeNull();
  });

  it('exposes a stable test id', () => {
    const { container } = render(
      <IconStage icon={fakeIcon} size={32} grid={false} gridColor="#fff" bg="checker" appearance="palette" />,
    );
    expect(container.querySelector('[data-testid="icon-stage"]')).not.toBeNull();
  });
});

import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import type { PxlKitData } from '@pxlkit/core';
import { MultiResRow } from './MultiResRow';

const fakeIcon: PxlKitData = {
  name: 'dot',
  size: 16,
  category: 'test',
  grid: Array.from({ length: 16 }, () => '.'.repeat(16)),
  palette: {},
  tags: [],
};

describe('MultiResRow', () => {
  it('renders one stage per requested size', () => {
    const { container } = render(
      <MultiResRow icon={fakeIcon} sizes={[16, 32, 64]} grid gridColor="#fff" bg="checker" appearance="palette" />,
    );
    expect(container.querySelectorAll('[data-testid="icon-stage"]')).toHaveLength(3);
  });

  it('renders nothing extra for an empty size list', () => {
    const { container } = render(
      <MultiResRow icon={fakeIcon} sizes={[]} grid gridColor="#fff" bg="checker" appearance="palette" />,
    );
    expect(container.querySelectorAll('[data-testid="icon-stage"]')).toHaveLength(0);
  });
});

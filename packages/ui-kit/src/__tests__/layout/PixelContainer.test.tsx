import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { PixelContainer } from '../../layout/PixelContainer';

describe('PixelContainer', () => {
  it('renders section by default', () => {
    const { getByTestId } = render(<PixelContainer data-testid="container" />);
    const el = getByTestId('container');
    expect(el.tagName).toBe('SECTION');
  });

  it('renders main when as="main"', () => {
    const { getByTestId } = render(<PixelContainer data-testid="container" as="main" />);
    const el = getByTestId('container');
    expect(el.tagName).toBe('MAIN');
  });

  it('padding="xl" applies py-20 sm:py-28 lg:py-32', () => {
    const { getByTestId } = render(
      <PixelContainer data-testid="container" padding="xl" />,
    );
    const el = getByTestId('container');
    expect(el.className).toContain('py-20');
    expect(el.className).toContain('sm:py-28');
    expect(el.className).toContain('lg:py-32');
  });

  it('maxWidth="3xl" passes max-w-7xl down to inner center', () => {
    const { getByTestId } = render(
      <PixelContainer data-testid="container" maxWidth="3xl">
        <span data-testid="child">x</span>
      </PixelContainer>,
    );
    const outer = getByTestId('container');
    const inner = outer.querySelector('.max-w-7xl');
    expect(inner).not.toBeNull();
  });
});

import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PixelStatCard } from '../../cards/PixelStatCard';

/* Extracted from __tests__/data-display.test.tsx (Ola 2 additive upgrade)
   into the mirrored per-component file. */

describe('PixelStatCard — legacy behavior preserved', () => {
  it('renders label + value at default size/position', () => {
    const { container } = render(<PixelStatCard label="Users" value="1,234" />);
    expect(container.textContent).toContain('Users');
    expect(container.textContent).toContain('1,234');
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toContain('p-4');
  });

  it('renders trend when provided', () => {
    render(<PixelStatCard label="Users" value="1,234" trend="+5%" />);
    expect(screen.getByText('+5%')).toBeInTheDocument();
  });
});

describe('PixelStatCard — size prop', () => {
  it('size="sm" applies smaller padding', () => {
    const { container } = render(<PixelStatCard label="L" value="V" size="sm" />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toContain('p-3');
  });

  it('size="lg" applies larger padding and font sizes', () => {
    const { container } = render(<PixelStatCard label="L" value="V" size="lg" />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toContain('p-6');
    const ps = Array.from(container.querySelectorAll('p'));
    const labelEl = ps.find((p) => p.textContent === 'L');
    const valueEl = ps.find((p) => p.textContent === 'V');
    expect(labelEl!.className).toContain('text-sm');
    expect(valueEl!.className).toMatch(/text-(lg|2xl)/);
  });
});

describe('PixelStatCard — iconPosition prop', () => {
  it('iconPosition="right" renders icon in right cell of a grid', () => {
    const { container, getByTestId } = render(
      <PixelStatCard
        label="L"
        value="V"
        iconPosition="right"
        icon={<span data-testid="ico">i</span>}
      />,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toContain('grid');
    expect(root.className).toContain('grid-cols-[1fr_auto]');
    const icon = getByTestId('ico');
    // Icon should be the last cell of the grid
    expect(root.lastElementChild!.contains(icon)).toBe(true);
  });

  it('iconPosition="bottom-left" renders icon at absolute bottom-left', () => {
    const { container, getByTestId } = render(
      <PixelStatCard
        label="L"
        value="V"
        iconPosition="bottom-left"
        icon={<span data-testid="ico">i</span>}
      />,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toContain('relative');
    const iconWrapper = getByTestId('ico').parentElement!;
    expect(iconWrapper.className).toContain('absolute');
    expect(iconWrapper.className).toContain('bottom-0');
    expect(iconWrapper.className).toContain('left-0');
  });

  it('iconPosition="left" places icon before content in a flex row', () => {
    const { container, getByTestId } = render(
      <PixelStatCard
        label="L"
        value="V"
        iconPosition="left"
        icon={<span data-testid="ico">i</span>}
      />,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toContain('flex');
    const icon = getByTestId('ico');
    expect(root.firstElementChild!.contains(icon)).toBe(true);
  });
});

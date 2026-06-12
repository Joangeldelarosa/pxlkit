import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PixelEmptyState } from '../../feedback/PixelEmptyState';

describe('PixelEmptyState — rendering', () => {
  it('renders title as a heading and the description', () => {
    render(
      <PixelEmptyState title="No results" description="Try another search." />,
    );
    const heading = screen.getByRole('heading', { name: 'No results' });
    expect(heading.tagName).toBe('H4');
    expect(screen.getByText('Try another search.')).toBeInTheDocument();
  });

  it('renders the optional action node', () => {
    render(
      <PixelEmptyState
        title="Empty"
        description="d"
        action={<button data-testid="cta">Create one</button>}
      />,
    );
    expect(screen.getByTestId('cta')).toBeInTheDocument();
  });

  it('omits the action wrapper when no action is passed', () => {
    const { container } = render(
      <PixelEmptyState title="Empty" description="d" />,
    );
    expect(container.querySelector('.mt-5')).toBeNull();
  });

  it('renders the icon inside an aria-hidden decorative wrapper', () => {
    const { container } = render(
      <PixelEmptyState
        title="t"
        description="d"
        icon={<svg data-testid="ico" />}
      />,
    );
    const wrapper = container.querySelector('div[aria-hidden]');
    expect(wrapper).not.toBeNull();
    expect(wrapper!.querySelector('[data-testid="ico"]')).not.toBeNull();
  });
});

describe('PixelEmptyState — chrome', () => {
  it('uses the dashed placeholder border', () => {
    const { container } = render(
      <PixelEmptyState title="t" description="d" />,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toContain('border-dashed');
    expect(root.className).toContain('text-center');
  });

  it('surface="linear" swaps the radius token', () => {
    const { container } = render(
      <PixelEmptyState title="t" description="d" surface="linear" />,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toContain('rounded-xl');
    expect(root.className).not.toContain('pxl-corner-md');
  });
});

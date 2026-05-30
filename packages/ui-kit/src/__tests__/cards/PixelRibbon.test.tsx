import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { PixelRibbon } from '../../cards/PixelRibbon';

describe('PixelRibbon', () => {
  it('renders with absolute positioning by default', () => {
    const { getByTestId } = render(
      <PixelRibbon data-testid="ribbon">Popular</PixelRibbon>,
    );
    const el = getByTestId('ribbon');
    expect(el.className).toContain('absolute');
  });

  it('position="top-right" applies right-4 -top-3 classes', () => {
    const { getByTestId } = render(
      <PixelRibbon data-testid="ribbon" position="top-right">
        New
      </PixelRibbon>,
    );
    const el = getByTestId('ribbon');
    expect(el.className).toContain('right-4');
    expect(el.className).toContain('-top-3');
  });

  it('position="corner-tr" applies rotate-12 (positive tilt)', () => {
    const { getByTestId } = render(
      <PixelRibbon data-testid="ribbon" position="corner-tr">
        Featured
      </PixelRibbon>,
    );
    const el = getByTestId('ribbon');
    expect(el.className).toContain('rotate-12');
  });

  it('tone="gold" applies gold tone classes (border-retro-gold)', () => {
    const { getByTestId } = render(
      <PixelRibbon data-testid="ribbon" tone="gold">
        Hot
      </PixelRibbon>,
    );
    const el = getByTestId('ribbon');
    expect(el.className).toContain('border-retro-gold');
  });

  it('forwards className and ...rest props', () => {
    const { getByTestId } = render(
      <PixelRibbon
        data-testid="ribbon"
        className="custom-class"
        id="my-ribbon"
        role="status"
      >
        Tag
      </PixelRibbon>,
    );
    const el = getByTestId('ribbon');
    expect(el.className).toContain('custom-class');
    expect(el.id).toBe('my-ribbon');
    expect(el.getAttribute('role')).toBe('status');
  });

  it('renders children inside the ribbon', () => {
    const { getByText } = render(
      <PixelRibbon>Most Popular</PixelRibbon>,
    );
    expect(getByText('Most Popular')).toBeInTheDocument();
  });
});

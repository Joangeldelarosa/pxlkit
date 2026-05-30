import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { PixelBox } from '../../layout/PixelBox';

describe('PixelBox', () => {
  it('renders a div by default', () => {
    const { getByTestId } = render(<PixelBox data-testid="box" />);
    const el = getByTestId('box');
    expect(el.tagName).toBe('DIV');
  });

  it('renders a section when as="section"', () => {
    const { getByTestId } = render(<PixelBox data-testid="box" as="section" />);
    const el = getByTestId('box');
    expect(el.tagName).toBe('SECTION');
  });

  it('applies tone.green.soft + border when variant=soft tone=green border', () => {
    const { getByTestId } = render(
      <PixelBox data-testid="box" tone="green" variant="soft" border />,
    );
    const el = getByTestId('box');
    expect(el.className).toContain('bg-retro-green/8');
    expect(el.className).toContain('border-retro-green/30');
  });

  it('padding="md" maps to px-4 and py-3', () => {
    const { getByTestId } = render(<PixelBox data-testid="box" padding="md" />);
    const el = getByTestId('box');
    expect(el.className).toContain('px-4');
    expect(el.className).toContain('py-3');
  });

  it('forwards className and ...rest props', () => {
    const { getByTestId } = render(
      <PixelBox data-testid="box" className="custom-class" id="my-box" role="region" />,
    );
    const el = getByTestId('box');
    expect(el.className).toContain('custom-class');
    expect(el.id).toBe('my-box');
    expect(el.getAttribute('role')).toBe('region');
  });
});

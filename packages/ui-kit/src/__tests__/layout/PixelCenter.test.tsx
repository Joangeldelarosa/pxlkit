import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { PixelCenter } from '../../layout/PixelCenter';

describe('PixelCenter', () => {
  it('applies mx-auto with default max-w-[1600px]', () => {
    const { getByTestId } = render(<PixelCenter data-testid="center" />);
    const el = getByTestId('center');
    expect(el.className).toContain('mx-auto');
    expect(el.className).toContain('max-w-[1600px]');
  });

  it('maxWidth="prose" produces max-w-prose', () => {
    const { getByTestId } = render(<PixelCenter data-testid="center" maxWidth="prose" />);
    const el = getByTestId('center');
    expect(el.className).toContain('max-w-prose');
  });

  it('gutter="md" produces px-4 sm:px-6', () => {
    const { getByTestId } = render(<PixelCenter data-testid="center" gutter="md" />);
    const el = getByTestId('center');
    expect(el.className).toContain('px-4');
    expect(el.className).toContain('sm:px-6');
  });

  it('text="center" adds text-center', () => {
    const { getByTestId } = render(<PixelCenter data-testid="center" text="center" />);
    const el = getByTestId('center');
    expect(el.className).toContain('text-center');
  });
});

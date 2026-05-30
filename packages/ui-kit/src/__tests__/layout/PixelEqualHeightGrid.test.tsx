import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { PixelEqualHeightGrid } from '../../layout/PixelEqualHeightGrid';

describe('PixelEqualHeightGrid', () => {
  it('renders grid with stretch alignment', () => {
    const { getByTestId } = render(
      <PixelEqualHeightGrid data-testid="grid" cols={3}>
        <div>a</div>
        <div>b</div>
        <div>c</div>
      </PixelEqualHeightGrid>,
    );
    const el = getByTestId('grid');
    expect(el.className).toContain('grid');
    expect(el.className).toContain('items-stretch');
  });

  it('each direct child has grid-rows-[auto_1fr_auto] class', () => {
    const { getByTestId } = render(
      <PixelEqualHeightGrid data-testid="grid" cols={3}>
        <div data-testid="child-a">a</div>
        <div data-testid="child-b">b</div>
        <div data-testid="child-c">c</div>
      </PixelEqualHeightGrid>,
    );
    const el = getByTestId('grid');
    const children = Array.from(el.children) as HTMLElement[];
    expect(children.length).toBe(3);
    for (const child of children) {
      expect(child.className).toContain('grid-rows-[auto_1fr_auto]');
    }
  });

  it('passes through cols, gap to PixelGrid', () => {
    const { getByTestId } = render(
      <PixelEqualHeightGrid data-testid="grid" cols={4} gap={6}>
        <div>a</div>
      </PixelEqualHeightGrid>,
    );
    const el = getByTestId('grid');
    expect(el.className).toContain('grid-cols-4');
    expect(el.className).toContain('gap-6');
  });
});

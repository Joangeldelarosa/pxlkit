import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { PixelStatGroup } from '../../data/PixelStatGroup';

describe('PixelStatGroup', () => {
  it('renders children inside a bordered group', () => {
    const { getByTestId } = render(
      <PixelStatGroup data-testid="group">
        <div data-testid="cell-1">A</div>
        <div data-testid="cell-2">B</div>
      </PixelStatGroup>,
    );
    const group = getByTestId('group');
    expect(group.contains(getByTestId('cell-1'))).toBe(true);
    expect(group.contains(getByTestId('cell-2'))).toBe(true);
    expect(group.className).toMatch(/border/);
  });

  it('layout="row" applies flex-row + vertical dividers', () => {
    const { getByTestId } = render(
      <PixelStatGroup data-testid="group" layout="row">
        <div>A</div>
        <div>B</div>
      </PixelStatGroup>,
    );
    const group = getByTestId('group');
    expect(group.className).toContain('flex');
    expect(group.className).toContain('flex-row');
    // vertical dividers: divide-x utility
    expect(group.className).toMatch(/divide-x/);
  });

  it('layout="grid" + columns=3 applies grid-cols-3', () => {
    const { getByTestId } = render(
      <PixelStatGroup data-testid="group" layout="grid" columns={3}>
        <div>A</div>
        <div>B</div>
        <div>C</div>
      </PixelStatGroup>,
    );
    const group = getByTestId('group');
    expect(group.className).toContain('grid');
    expect(group.className).toContain('grid-cols-3');
    // grid layout has no vertical divider
    expect(group.className).not.toMatch(/divide-x/);
  });

  it('tone="cyan" applies cyan border', () => {
    const { getByTestId } = render(
      <PixelStatGroup data-testid="group" tone="cyan">
        <div>A</div>
      </PixelStatGroup>,
    );
    const group = getByTestId('group');
    expect(group.className).toContain('border-retro-cyan/30');
  });
});

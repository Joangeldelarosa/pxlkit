import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { PixelBadgeGroup } from '../../data/PixelBadgeGroup';
import { PixelBadge } from '../../data/PixelBadge';

// PixelChipGroup tests moved to ./PixelChipGroup.test.tsx (mirrored
// per-component file).

describe('PixelBadgeGroup', () => {
  it('renders all children when count <= max', () => {
    const { getByText, queryByText } = render(
      <PixelBadgeGroup data-testid="group" max={5}>
        <PixelBadge>One</PixelBadge>
        <PixelBadge>Two</PixelBadge>
        <PixelBadge>Three</PixelBadge>
      </PixelBadgeGroup>,
    );
    expect(getByText('One')).toBeTruthy();
    expect(getByText('Two')).toBeTruthy();
    expect(getByText('Three')).toBeTruthy();
    // No overflow trigger when within max
    expect(queryByText(/^\+\d/)).toBeNull();
  });

  it('shows +N popover trigger when overflowing and reveals remaining on click', () => {
    const { getByText, queryByText, getByLabelText } = render(
      <PixelBadgeGroup data-testid="group" max={3}>
        <PixelBadge>A</PixelBadge>
        <PixelBadge>B</PixelBadge>
        <PixelBadge>C</PixelBadge>
        <PixelBadge>D</PixelBadge>
        <PixelBadge>E</PixelBadge>
      </PixelBadgeGroup>,
    );
    // Visible: first 2 (max - 1 reserved for +N), then +3 trigger
    expect(getByText('A')).toBeTruthy();
    expect(getByText('B')).toBeTruthy();
    // C/D/E not visible inline before opening
    expect(queryByText('C')).toBeNull();
    expect(queryByText('D')).toBeNull();
    expect(queryByText('E')).toBeNull();

    const trigger = getByLabelText('Show 3 more');
    expect(trigger.textContent).toBe('+3');

    // Click +N to open popover
    fireEvent.click(trigger);
    expect(getByText('C')).toBeTruthy();
    expect(getByText('D')).toBeTruthy();
    expect(getByText('E')).toBeTruthy();
  });
});

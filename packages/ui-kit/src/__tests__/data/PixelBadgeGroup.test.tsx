import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { PixelBadgeGroup, PixelChipGroup } from '../../data/PixelBadgeGroup';
import { PixelBadge } from '../../data-display';

// PixelChip in data-display doesn't carry a `value` prop. The group consumes
// `child.props.value`; the inner chip surface is purely presentational. Use a
// thin stand-in so TS stays happy.
function Chip({ value: _value, label }: { value: string; label: string }) {
  return <span>{label}</span>;
}

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

describe('PixelChipGroup', () => {
  it('multi=true allows multiple selection', () => {
    const onChange = vi.fn();
    const { getByText, rerender } = render(
      <PixelChipGroup multiple value={[]} onChange={onChange}>
        <Chip value="a" label="Alpha" />
        <Chip value="b" label="Bravo" />
        <Chip value="c" label="Charlie" />
      </PixelChipGroup>,
    );

    fireEvent.click(getByText('Alpha'));
    expect(onChange).toHaveBeenLastCalledWith(['a']);

    rerender(
      <PixelChipGroup multiple value={['a']} onChange={onChange}>
        <Chip value="a" label="Alpha" />
        <Chip value="b" label="Bravo" />
        <Chip value="c" label="Charlie" />
      </PixelChipGroup>,
    );

    fireEvent.click(getByText('Bravo'));
    // multi: appends, keeping previous
    expect(onChange).toHaveBeenLastCalledWith(['a', 'b']);
  });

  it('single mode deselects others on click', () => {
    const onChange = vi.fn();
    const { getByText, rerender } = render(
      <PixelChipGroup value={['a']} onChange={onChange}>
        <Chip value="a" label="Alpha" />
        <Chip value="b" label="Bravo" />
      </PixelChipGroup>,
    );

    fireEvent.click(getByText('Bravo'));
    // single: replaces previous → only 'b'
    expect(onChange).toHaveBeenLastCalledWith(['b']);

    rerender(
      <PixelChipGroup value={['b']} onChange={onChange}>
        <Chip value="a" label="Alpha" />
        <Chip value="b" label="Bravo" />
      </PixelChipGroup>,
    );

    // Clicking selected chip in single mode deselects
    fireEvent.click(getByText('Bravo'));
    expect(onChange).toHaveBeenLastCalledWith([]);
  });
});

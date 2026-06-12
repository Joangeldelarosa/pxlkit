import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { PixelChipGroup } from '../../data/PixelChipGroup';

/* Extracted from __tests__/data/PixelBadgeGroup.test.tsx into the mirrored
   per-component file. */

// PixelChip in data-display doesn't carry a `value` prop. The group consumes
// `child.props.value`; the inner chip surface is purely presentational. Use a
// thin stand-in so TS stays happy.
function Chip({ value: _value, label }: { value: string; label: string }) {
  return <span>{label}</span>;
}

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

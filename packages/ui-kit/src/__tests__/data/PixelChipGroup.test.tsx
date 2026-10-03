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

  // Regression: arrow keys, Home and End toggled the chip they landed on, so
  // at the ends (or on the selected chip) they cleared the selection instead
  // of selecting.
  it('single mode: arrows, Home and End select the chip they reach and never clear the selection', () => {
    const onChange = vi.fn();
    const { getByText } = render(
      <PixelChipGroup value={['c']} onChange={onChange} aria-label="Letters">
        <Chip value="a" label="Alpha" />
        <Chip value="b" label="Bravo" />
        <Chip value="c" label="Charlie" />
      </PixelChipGroup>,
    );
    const charlie = getByText('Charlie').closest('button')!;
    fireEvent.keyDown(charlie, { key: 'ArrowRight' });
    fireEvent.keyDown(charlie, { key: 'End' });
    expect(onChange).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(charlie);

    fireEvent.keyDown(charlie, { key: 'Home' });
    expect(onChange).toHaveBeenLastCalledWith(['a']);
    expect(document.activeElement).toBe(getByText('Alpha').closest('button'));
  });

  // Regression: on the linear surface the selection ring and the focus ring
  // were the same; on the pixel surface the cut corners clipped the selection
  // ring, the only mark of a selected chip.
  it('marks the selected chip apart from keyboard focus on both surfaces', () => {
    const { getAllByRole } = render(
      <>
        <PixelChipGroup value={['a']} onChange={() => {}} aria-label="Pixel" surface="pixel">
          <Chip value="a" label="Alpha" />
          <Chip value="b" label="Bravo" />
        </PixelChipGroup>
        <PixelChipGroup value={['a']} onChange={() => {}} aria-label="Linear" surface="linear">
          <Chip value="a" label="Alpha" />
          <Chip value="b" label="Bravo" />
        </PixelChipGroup>
      </>,
    );
    const [pixelSelected, pixelOther, linearSelected, linearOther] = getAllByRole('radio').map((chip) => chip.className.split(' '));
    // Pixel: a frame inside the selected chip, which the cut corners leave
    // whole; focus lights up the chip's edge from a layer over the chip.
    expect(pixelSelected).toEqual(expect.arrayContaining(['pxl-corner-sm', '*:outline-2', '*:-outline-offset-4', '*:outline-retro-cyan/60']));
    expect(pixelSelected!.filter((c) => c.includes('ring'))).toEqual([]);
    expect(pixelOther!.filter((c) => c.startsWith('*:'))).toEqual([]);
    for (const chip of [pixelSelected!, pixelOther!]) expect(chip).toContain('focus-visible:after:pxl-focus-inset');
    // Linear: the selection ring hugs the chip; the focus ring stands off it.
    expect(linearSelected).toEqual(expect.arrayContaining(['ring-2', 'ring-retro-cyan/60', 'focus-visible:ring-offset-2']));
    expect(linearOther).toEqual(expect.arrayContaining(['focus-visible:ring-2', 'focus-visible:ring-offset-2']));
    expect(linearOther).not.toContain('ring-2');
  });
});

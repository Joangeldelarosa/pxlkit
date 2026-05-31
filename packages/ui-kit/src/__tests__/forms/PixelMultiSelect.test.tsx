import React, { useState } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { PixelMultiSelect } from '../../forms/PixelMultiSelect';
import type { PixelMultiSelectOption } from '../../forms/PixelMultiSelect';

const OPTIONS: PixelMultiSelectOption[] = [
  { value: 'a', label: 'Apple' },
  { value: 'b', label: 'Banana' },
  { value: 'c', label: 'Cherry' },
  { value: 'd', label: 'Date' },
  { value: 'e', label: 'Elderberry' },
];

function ControlledHarness({
  initial = [] as string[],
  onChange,
  max,
  clearable,
}: {
  initial?: string[];
  onChange?: (next: string[]) => void;
  max?: number;
  clearable?: boolean;
}) {
  const [value, setValue] = useState<string[]>(initial);
  return (
    <PixelMultiSelect
      value={value}
      onChange={(next) => {
        setValue(next);
        onChange?.(next);
      }}
      options={OPTIONS}
      placeholder="Pick fruits…"
      max={max}
      clearable={clearable}
      name="fruits"
    />
  );
}

describe('PixelMultiSelect', () => {
  it('renders the placeholder when there is no value', () => {
    const { getByText } = render(
      <PixelMultiSelect
        options={OPTIONS}
        placeholder="Pick fruits…"
      />,
    );
    expect(getByText('Pick fruits…')).toBeTruthy();
  });

  it('clicking the trigger opens the listbox', () => {
    const { getByRole, queryByRole } = render(
      <PixelMultiSelect options={OPTIONS} placeholder="Pick fruits…" />,
    );
    expect(queryByRole('listbox')).toBeNull();
    fireEvent.click(getByRole('combobox'));
    expect(getByRole('listbox')).toBeTruthy();
  });

  it('selecting an option adds it to value (controlled)', () => {
    const onChange = vi.fn();
    const { getByRole, getByText } = render(
      <ControlledHarness onChange={onChange} />,
    );
    fireEvent.click(getByRole('combobox'));
    fireEvent.click(getByText('Banana'));
    expect(onChange).toHaveBeenCalledWith(['b']);
  });

  it('selecting an already-selected option removes it', () => {
    const onChange = vi.fn();
    const { getByRole, getAllByRole } = render(
      <ControlledHarness initial={['b']} onChange={onChange} />,
    );
    fireEvent.click(getByRole('combobox'));
    const banana = getAllByRole('option').find((o) =>
      o.textContent?.includes('Banana'),
    );
    fireEvent.click(banana!);
    expect(onChange).toHaveBeenCalledWith([]);
  });

  it('max=3 prevents further selection after 3 selected', () => {
    const onChange = vi.fn();
    const { getByRole, getAllByRole } = render(
      <ControlledHarness
        initial={['a', 'b', 'c']}
        max={3}
        onChange={onChange}
      />,
    );
    fireEvent.click(getByRole('combobox'));
    const optionByLabel = (label: string) =>
      getAllByRole('option').find((o) =>
        o.textContent?.includes(label),
      )!;
    // Click an unselected option — should be ignored / not add.
    fireEvent.click(optionByLabel('Date'));
    // Either onChange not called, or called with the same value — never a 4-length array.
    for (const call of onChange.mock.calls) {
      expect((call[0] as string[]).length).toBeLessThanOrEqual(3);
    }
    // But clicking an already-selected option should still allow deselection.
    fireEvent.click(optionByLabel('Apple'));
    expect(onChange).toHaveBeenCalledWith(['b', 'c']);
  });

  it('clearable X clears value', () => {
    const onChange = vi.fn();
    const { getByLabelText } = render(
      <ControlledHarness initial={['a', 'b']} clearable onChange={onChange} />,
    );
    const clearBtn = getByLabelText(/clear/i);
    fireEvent.click(clearBtn);
    expect(onChange).toHaveBeenCalledWith([]);
  });

  it('renders multiple hidden inputs to serialize all values', () => {
    const { container } = render(
      <PixelMultiSelect
        defaultValue={['a', 'b', 'c']}
        options={OPTIONS}
        name="fruits"
      />,
    );
    const hidden = container.querySelectorAll(
      'input[type="hidden"][name="fruits"]',
    );
    expect(hidden.length).toBe(3);
    const values = Array.from(hidden).map(
      (n) => (n as HTMLInputElement).value,
    );
    expect(values).toEqual(['a', 'b', 'c']);
  });
});

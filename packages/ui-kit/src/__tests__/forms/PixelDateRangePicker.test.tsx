import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { PixelDateRangePicker } from '../../forms/PixelDateRangePicker';

function toISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

describe('PixelDateRangePicker', () => {
  it('renders placeholder when no value', () => {
    const { getByTestId } = render(
      <PixelDateRangePicker
        placeholder="Pick a range"
        data-testid="trigger"
      />,
    );
    const trigger = getByTestId('trigger');
    expect(trigger.textContent).toContain('Pick a range');
  });

  it('clicking trigger opens calendars', () => {
    const { getByTestId, queryAllByRole } = render(
      <PixelDateRangePicker data-testid="trigger" />,
    );
    expect(queryAllByRole('grid').length).toBe(0);
    fireEvent.click(getByTestId('trigger'));
    // Default numberOfMonths=2 → two grids visible.
    expect(queryAllByRole('grid').length).toBe(2);
  });

  it('two clicks select a range (from and to)', () => {
    const onChange = vi.fn();
    const initial = { from: new Date(2026, 5, 10), to: new Date(2026, 5, 10) };
    const { getByTestId, getAllByLabelText } = render(
      <PixelDateRangePicker
        defaultValue={initial}
        onChange={onChange}
        data-testid="trigger"
      />,
    );
    fireEvent.click(getByTestId('trigger'));

    // First click: pick June 12 → resets to { from: 12 }
    const day12 = getAllByLabelText(/June 12, 2026/i)[0];
    fireEvent.click(day12);

    // Second click: pick June 20 → completes range
    const day20 = getAllByLabelText(/June 20, 2026/i)[0];
    fireEvent.click(day20);

    // onChange called at least twice (once per click)
    expect(onChange).toHaveBeenCalled();
    const last = onChange.mock.calls[onChange.mock.calls.length - 1][0] as {
      from?: Date;
      to?: Date;
    };
    expect(last.from).toBeInstanceOf(Date);
    expect(last.to).toBeInstanceOf(Date);
    expect(last.from!.getDate()).toBe(12);
    expect(last.to!.getDate()).toBe(20);
  });

  it('preset selects predefined range', () => {
    const onChange = vi.fn();
    const presetFrom = new Date(2026, 0, 1);
    const presetTo = new Date(2026, 0, 7);
    const { getByTestId, getByText } = render(
      <PixelDateRangePicker
        onChange={onChange}
        presets={[
          { label: 'First Week', value: { from: presetFrom, to: presetTo } },
        ]}
        data-testid="trigger"
      />,
    );
    fireEvent.click(getByTestId('trigger'));
    fireEvent.click(getByText('First Week'));
    expect(onChange).toHaveBeenCalledTimes(1);
    const arg = onChange.mock.calls[0][0] as { from?: Date; to?: Date };
    expect(arg.from!.getDate()).toBe(1);
    expect(arg.to!.getDate()).toBe(7);
  });

  it('numberOfMonths=1 renders single calendar', () => {
    const { getByTestId, queryAllByRole } = render(
      <PixelDateRangePicker numberOfMonths={1} data-testid="trigger" />,
    );
    fireEvent.click(getByTestId('trigger'));
    expect(queryAllByRole('grid').length).toBe(1);
  });

  it('clearable clears the value', () => {
    const onChange = vi.fn();
    const initial = {
      from: new Date(2026, 5, 10),
      to: new Date(2026, 5, 20),
    };
    const { getByTestId, getByText } = render(
      <PixelDateRangePicker
        defaultValue={initial}
        onChange={onChange}
        clearable
        data-testid="trigger"
      />,
    );
    fireEvent.click(getByTestId('trigger'));
    fireEvent.click(getByText(/clear/i));
    expect(onChange).toHaveBeenCalled();
    const arg = onChange.mock.calls[onChange.mock.calls.length - 1][0] as {
      from?: Date;
      to?: Date;
    };
    expect(arg.from).toBeUndefined();
    expect(arg.to).toBeUndefined();
  });

  it('hidden inputs serialize from/to ISO dates', () => {
    const value = {
      from: new Date(2026, 5, 10),
      to: new Date(2026, 5, 20),
    };
    const { container } = render(
      <PixelDateRangePicker value={value} name="range" />,
    );
    const from = container.querySelector(
      'input[type="hidden"][name="range.from"]',
    ) as HTMLInputElement | null;
    const to = container.querySelector(
      'input[type="hidden"][name="range.to"]',
    ) as HTMLInputElement | null;
    expect(from).not.toBeNull();
    expect(to).not.toBeNull();
    expect(from!.value).toBe(toISO(value.from));
    expect(to!.value).toBe(toISO(value.to));
  });
});

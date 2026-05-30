import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { PixelDatePicker } from '../../forms/PixelDatePicker';

function toISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

describe('PixelDatePicker', () => {
  it('renders placeholder when no value', () => {
    const { getByTestId } = render(
      <PixelDatePicker placeholder="Pick a date" data-testid="trigger" />,
    );
    const trigger = getByTestId('trigger');
    expect(trigger.textContent).toContain('Pick a date');
  });

  it('clicking trigger opens calendar', () => {
    const { getByTestId, queryByRole } = render(
      <PixelDatePicker data-testid="trigger" />,
    );
    expect(queryByRole('grid')).toBeNull();
    fireEvent.click(getByTestId('trigger'));
    expect(queryByRole('grid')).not.toBeNull();
  });

  it('clicking a day calls onChange with that date and closes', () => {
    const onChange = vi.fn();
    const initial = new Date(2026, 5, 15); // June 15, 2026
    const { getByTestId, queryByRole, getByLabelText } = render(
      <PixelDatePicker
        defaultValue={initial}
        onChange={onChange}
        data-testid="trigger"
      />,
    );
    fireEvent.click(getByTestId('trigger'));
    expect(queryByRole('grid')).not.toBeNull();

    // Click on day 20 in the current month (June 2026)
    const day20 = getByLabelText(/June 20, 2026/i);
    fireEvent.click(day20);

    expect(onChange).toHaveBeenCalledTimes(1);
    const arg = onChange.mock.calls[0][0] as Date;
    expect(arg).toBeInstanceOf(Date);
    expect(arg.getFullYear()).toBe(2026);
    expect(arg.getMonth()).toBe(5);
    expect(arg.getDate()).toBe(20);

    // popover should be closed
    expect(queryByRole('grid')).toBeNull();
  });

  it('next-month arrow advances calendar month', () => {
    const initial = new Date(2026, 5, 15); // June 2026
    const { getByTestId, getByLabelText, getByText } = render(
      <PixelDatePicker defaultValue={initial} data-testid="trigger" />,
    );
    fireEvent.click(getByTestId('trigger'));
    // The month label should read June 2026
    expect(getByText(/June 2026/i)).toBeTruthy();
    fireEvent.click(getByLabelText(/next month/i));
    expect(getByText(/July 2026/i)).toBeTruthy();
  });

  it('min/max bounds disable out-of-range days', () => {
    const initial = new Date(2026, 5, 15);
    const min = new Date(2026, 5, 10);
    const max = new Date(2026, 5, 20);
    const onChange = vi.fn();
    const { getByTestId, getByLabelText } = render(
      <PixelDatePicker
        defaultValue={initial}
        min={min}
        max={max}
        onChange={onChange}
        data-testid="trigger"
      />,
    );
    fireEvent.click(getByTestId('trigger'));

    // Day 5 should be disabled (before min)
    const day5 = getByLabelText(/June 5, 2026/i) as HTMLButtonElement;
    expect(day5.disabled).toBe(true);
    fireEvent.click(day5);
    expect(onChange).not.toHaveBeenCalled();

    // Day 25 should be disabled (after max)
    const day25 = getByLabelText(/June 25, 2026/i) as HTMLButtonElement;
    expect(day25.disabled).toBe(true);

    // Day 15 should be enabled
    const day15 = getByLabelText(/June 15, 2026/i) as HTMLButtonElement;
    expect(day15.disabled).toBe(false);
  });

  it('preset click selects preset value', () => {
    const onChange = vi.fn();
    const preset = new Date(2026, 0, 1);
    const { getByTestId, getByText } = render(
      <PixelDatePicker
        onChange={onChange}
        presets={[{ label: 'New Year', value: preset }]}
        data-testid="trigger"
      />,
    );
    fireEvent.click(getByTestId('trigger'));
    fireEvent.click(getByText('New Year'));
    expect(onChange).toHaveBeenCalledTimes(1);
    const arg = onChange.mock.calls[0][0] as Date;
    expect(arg.getFullYear()).toBe(2026);
    expect(arg.getMonth()).toBe(0);
    expect(arg.getDate()).toBe(1);
  });

  it('hidden input serializes ISO date', () => {
    const value = new Date(2026, 5, 15);
    const { container } = render(
      <PixelDatePicker value={value} name="birthday" />,
    );
    const hidden = container.querySelector(
      'input[type="hidden"][name="birthday"]',
    ) as HTMLInputElement | null;
    expect(hidden).not.toBeNull();
    expect(hidden!.value).toBe(toISO(value));
  });
});

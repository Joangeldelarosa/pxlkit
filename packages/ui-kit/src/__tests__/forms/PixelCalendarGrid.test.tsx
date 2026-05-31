import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { PixelCalendarGrid } from '../../forms/PixelCalendarGrid';

describe('PixelCalendarGrid', () => {
  it('renders month label for given month', () => {
    const month = new Date(2026, 5, 1); // June 2026
    const { getByText } = render(<PixelCalendarGrid month={month} />);
    expect(getByText(/June 2026/i)).toBeTruthy();
  });

  it('next-month arrow advances month state', () => {
    const onMonthChange = vi.fn();
    const month = new Date(2026, 5, 1);
    const { getByLabelText } = render(
      <PixelCalendarGrid month={month} onMonthChange={onMonthChange} />,
    );
    fireEvent.click(getByLabelText(/next month/i));
    expect(onMonthChange).toHaveBeenCalledTimes(1);
    const arg = onMonthChange.mock.calls[0][0] as Date;
    expect(arg.getFullYear()).toBe(2026);
    expect(arg.getMonth()).toBe(6); // July
  });

  it('clicking a day calls onChange with that date', () => {
    const onChange = vi.fn();
    const month = new Date(2026, 5, 1);
    const { getByLabelText } = render(
      <PixelCalendarGrid month={month} onChange={onChange} />,
    );
    const day20 = getByLabelText(/June 20, 2026/i);
    fireEvent.click(day20);
    expect(onChange).toHaveBeenCalledTimes(1);
    const arg = onChange.mock.calls[0][0] as Date;
    expect(arg.getFullYear()).toBe(2026);
    expect(arg.getMonth()).toBe(5);
    expect(arg.getDate()).toBe(20);
  });

  it('disabled day is not clickable', () => {
    const onChange = vi.fn();
    const month = new Date(2026, 5, 1);
    const disabled = new Date(2026, 5, 10);
    const { getByLabelText } = render(
      <PixelCalendarGrid
        month={month}
        onChange={onChange}
        disabledDates={[disabled]}
      />,
    );
    const day10 = getByLabelText(/June 10, 2026/i) as HTMLButtonElement;
    expect(day10.disabled).toBe(true);
    fireEvent.click(day10);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('rangePreview tints cells between from and hover', () => {
    const month = new Date(2026, 5, 1);
    const from = new Date(2026, 5, 10);
    const hover = new Date(2026, 5, 15);
    const { getByLabelText } = render(
      <PixelCalendarGrid
        month={month}
        rangePreview={{ from, hover }}
      />,
    );
    // Day between from and hover should have in-range attribute
    const day12 = getByLabelText(/June 12, 2026/i);
    expect(day12.getAttribute('data-in-range')).toBe('true');
    // Day outside the range should not have it
    const day5 = getByLabelText(/June 5, 2026/i);
    expect(day5.getAttribute('data-in-range')).not.toBe('true');
    // Endpoints should be marked
    const day10 = getByLabelText(/June 10, 2026/i);
    expect(day10.getAttribute('data-range-endpoint')).toBe('true');
    const day15 = getByLabelText(/June 15, 2026/i);
    expect(day15.getAttribute('data-range-endpoint')).toBe('true');
  });
});

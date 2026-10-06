import React from 'react';
import { afterEach, describe, it, expect, vi } from 'vitest';
import { act, render, fireEvent, screen } from '@testing-library/react';
import { PixelCalendarGrid } from '../../forms/PixelCalendarGrid';
import { PxlKitLocaleProvider } from '../../locale';

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

describe('PixelCalendarGrid — date grid keyboard and semantics', () => {
  const cell = (label: string) => screen.getByRole('gridcell', { name: label });
  const focused = () => document.activeElement?.getAttribute('aria-label');
  const press = (key: string, init: { shiftKey?: boolean } = {}) =>
    fireEvent.keyDown(document.activeElement!, { key, ...init });
  const tabStops = () =>
    screen.getAllByRole('gridcell').filter((day) => day.tabIndex === 0).map((day) => day.getAttribute('aria-label'));

  afterEach(() => {
    vi.useRealTimers();
  });

  it('marks today as the current date', () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2026, 5, 15, 10, 30));
    render(<PixelCalendarGrid month={new Date(2026, 5, 1)} />);
    expect(cell('June 15, 2026')).toHaveAttribute('aria-current', 'date');
    expect(document.querySelectorAll('[aria-current]')).toHaveLength(1);
  });

  it('pages by month to the same day, or the last day of a shorter month, and by year with Shift', () => {
    render(<PixelCalendarGrid defaultValue={new Date(2026, 2, 31)} />);
    act(() => cell('March 31, 2026').focus());
    press('PageUp');
    expect(focused()).toBe('February 28, 2026');
    expect(screen.getByRole('grid')).toHaveAccessibleName('February 2026');
    press('PageDown');
    expect(focused()).toBe('March 28, 2026');
    press('PageDown', { shiftKey: true });
    expect(focused()).toBe('March 28, 2027');
    press('PageUp', { shiftKey: true });
    press('PageUp', { shiftKey: true });
    expect(focused()).toBe('March 28, 2025');
  });

  it('moves focus past disabled days, and keeps it where no enabled day lies that way', () => {
    const weekends = (d: Date) => d.getDay() === 0 || d.getDay() === 6;
    render(
      <PixelCalendarGrid month={new Date(2026, 9, 1)} minDate={new Date(2026, 9, 1)} disabledDates={weekends} />,
    );
    act(() => cell('October 9, 2026').focus());
    press('ArrowRight');
    expect(focused()).toBe('October 12, 2026');
    press('Home');
    expect(focused()).toBe('October 12, 2026');
    act(() => cell('October 1, 2026').focus());
    press('ArrowLeft');
    press('ArrowUp');
    expect(focused()).toBe('October 1, 2026');
    expect(tabStops()).toEqual(['October 1, 2026']);
  });

  it('keeps one enabled day of the month on show in the tab order as the month changes', () => {
    const weekends = (d: Date) => d.getDay() === 0 || d.getDay() === 6;
    render(<PixelCalendarGrid defaultValue={new Date(2026, 9, 14)} disabledDates={weekends} />);
    expect(tabStops()).toEqual(['October 14, 2026']);
    fireEvent.click(screen.getByLabelText(/next month/i));
    // November 2026 starts on a Sunday.
    expect(tabStops()).toEqual(['November 2, 2026']);
  });

  it('takes its week, month and weekday names from the locale', () => {
    render(
      <PxlKitLocaleProvider locale="tr">
        <PixelCalendarGrid defaultValue={new Date(2026, 5, 20)} />
      </PxlKitLocaleProvider>,
    );
    expect(screen.getByRole('grid')).toHaveAccessibleName('Haziran 2026');
    expect(screen.getAllByRole('columnheader').map((header) => header.textContent)).toEqual([
      'Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct', 'Pz',
    ]);
    // The week starts on Monday: June 1, 2026 is one.
    expect(screen.getAllByRole('gridcell')[0]).toHaveAccessibleName('1 Haziran 2026');
    act(() => cell('20 Haziran 2026').focus());
    press('Home');
    expect(focused()).toBe('15 Haziran 2026');
    press('End');
    expect(focused()).toBe('21 Haziran 2026');
  });
});

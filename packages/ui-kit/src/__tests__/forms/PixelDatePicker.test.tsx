import React from 'react';
import { afterEach, describe, it, expect, vi } from 'vitest';
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import { PixelDatePicker } from '../../forms/PixelDatePicker';
import { PxlKitLocaleProvider } from '../../locale';

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

describe('PixelDatePicker — hint / error description', () => {
  it('describes the trigger with the hint, then with the error, only while one shows', () => {
    const { getByTestId, rerender } = render(
      <PixelDatePicker label="Due" hint="Weekdays only" data-testid="trigger" />,
    );
    const trigger = getByTestId('trigger');
    expect(trigger).toHaveAccessibleDescription('Weekdays only');
    rerender(<PixelDatePicker label="Due" hint="Weekdays only" error="Pick a date" data-testid="trigger" />);
    expect(trigger).toHaveAccessibleDescription('Pick a date');
    rerender(<PixelDatePicker label="Due" data-testid="trigger" />);
    expect(trigger).not.toHaveAttribute('aria-describedby');
  });
});

describe('PixelDatePicker — calendar dialog', () => {
  const focused = () => document.activeElement?.getAttribute('aria-label');
  const press = (key: string, init: { shiftKey?: boolean } = {}) =>
    fireEvent.keyDown(document.activeElement!, { key, ...init });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('opens a named dialog whose weekday headers sit in a row of the grid', () => {
    render(<PixelDatePicker defaultValue={new Date(2026, 5, 15)} data-testid="trigger" />);
    fireEvent.click(screen.getByTestId('trigger'));
    expect(screen.getByRole('dialog')).toHaveAccessibleName('Choose date');
    const headers = screen.getAllByRole('columnheader');
    expect(headers).toHaveLength(7);
    for (const header of headers) expect(header.parentElement).toHaveAttribute('role', 'row');
    expect(screen.getByRole('grid').children[0]).toBe(headers[0]!.parentElement);
  });

  it('moves focus to the picked day as it opens, and back to the trigger on Escape', async () => {
    render(<PixelDatePicker defaultValue={new Date(2026, 5, 15)} data-testid="trigger" />);
    const trigger = screen.getByTestId('trigger');
    fireEvent.click(trigger);
    expect(focused()).toBe('June 15, 2026');
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByRole('grid')).toBeNull();
    // Focus returns once the dialog is gone (a microtask later).
    await waitFor(() => expect(document.activeElement).toBe(trigger));
  });

  it("moves focus to today without a value, marked as the current date — or to the month's first enabled day", () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2026, 5, 15, 9));
    const { unmount } = render(<PixelDatePicker data-testid="trigger" />);
    fireEvent.click(screen.getByTestId('trigger'));
    expect(focused()).toBe('June 15, 2026');
    expect(document.activeElement).toHaveAttribute('aria-current', 'date');
    unmount();
    render(<PixelDatePicker min={new Date(2026, 5, 20)} data-testid="trigger" />);
    fireEvent.click(screen.getByTestId('trigger'));
    expect(focused()).toBe('June 20, 2026');
  });

  it('pages by month to the same day, or the last day of a shorter month, and by year with Shift', () => {
    render(<PixelDatePicker defaultValue={new Date(2026, 0, 31)} data-testid="trigger" />);
    fireEvent.click(screen.getByTestId('trigger'));
    press('PageDown');
    expect(focused()).toBe('February 28, 2026');
    press('PageDown', { shiftKey: true });
    expect(focused()).toBe('February 28, 2027');
    press('PageUp');
    expect(focused()).toBe('January 28, 2027');
    expect(screen.getByRole('grid')).toHaveAccessibleName('January 2027');
  });

  it('moves focus past disabled days and keeps one enabled day of the month on show in the tab order', () => {
    const weekends = (d: Date) => d.getDay() === 0 || d.getDay() === 6;
    render(<PixelDatePicker defaultValue={new Date(2026, 9, 9)} disabledDates={weekends} data-testid="trigger" />);
    fireEvent.click(screen.getByTestId('trigger'));
    press('ArrowRight');
    expect(focused()).toBe('October 12, 2026');
    fireEvent.click(screen.getByLabelText(/next month/i));
    const tabStops = screen.getAllByRole('gridcell').filter((day) => day.tabIndex === 0);
    // November 2026 starts on a Sunday.
    expect(tabStops.map((day) => day.getAttribute('aria-label'))).toEqual(['November 2, 2026']);
  });

  it('takes its week, names and default format from the locale', () => {
    render(
      <PxlKitLocaleProvider locale="tr">
        <PixelDatePicker defaultValue={new Date(2026, 5, 20)} data-testid="trigger" />
      </PxlKitLocaleProvider>,
    );
    expect(screen.getByTestId('trigger')).toHaveTextContent('20 Haziran 2026');
    fireEvent.click(screen.getByTestId('trigger'));
    expect(screen.getByRole('grid')).toHaveAccessibleName('Haziran 2026');
    expect(screen.getAllByRole('columnheader')[0]).toHaveTextContent('Pt');
    expect(focused()).toBe('20 Haziran 2026');
    press('Home');
    expect(focused()).toBe('15 Haziran 2026');
  });
});

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { act, render, fireEvent, screen, waitFor, within } from '@testing-library/react';
import { PixelCalendarGrid } from '../../forms/PixelCalendarGrid';
import { PixelDateRangePicker } from '../../forms/PixelDateRangePicker';
import { PxlKitLocaleProvider } from '../../locale';

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

describe('PixelDateRangePicker — hint / error description', () => {
  it('describes the trigger with the hint, then with the error, only while one shows', () => {
    const { getByTestId, rerender } = render(
      <PixelDateRangePicker label="Stay" hint="Up to two weeks" data-testid="trigger" />,
    );
    const trigger = getByTestId('trigger');
    expect(trigger).toHaveAccessibleDescription('Up to two weeks');
    rerender(<PixelDateRangePicker label="Stay" hint="Up to two weeks" error="Pick both dates" data-testid="trigger" />);
    expect(trigger).toHaveAccessibleDescription('Pick both dates');
    rerender(<PixelDateRangePicker label="Stay" data-testid="trigger" />);
    expect(trigger).not.toHaveAttribute('aria-describedby');
  });
});

describe('PixelDateRangePicker — calendar dialog', () => {
  const focused = () => document.activeElement?.getAttribute('aria-label');
  const press = (key: string, init: { shiftKey?: boolean } = {}) =>
    fireEvent.keyDown(document.activeElement!, { key, ...init });
  const range = { from: new Date(2026, 9, 29), to: new Date(2026, 10, 3) };

  it('opens a named dialog whose grids keep their weekday headers in a row', () => {
    render(<PixelDateRangePicker defaultValue={range} data-testid="trigger" />);
    fireEvent.click(screen.getByTestId('trigger'));
    expect(screen.getByRole('dialog')).toHaveAccessibleName('Choose date range');
    for (const grid of screen.getAllByRole('grid')) {
      const headers = within(grid).getAllByRole('columnheader');
      expect(headers).toHaveLength(7);
      for (const header of headers) expect(header.parentElement).toHaveAttribute('role', 'row');
    }
  });

  it('moves focus to the start of the range as it opens, and back to the trigger on Escape', async () => {
    render(<PixelDateRangePicker defaultValue={range} data-testid="trigger" />);
    const trigger = screen.getByTestId('trigger');
    fireEvent.click(trigger);
    expect(focused()).toBe('October 29, 2026');
    fireEvent.keyDown(window, { key: 'Escape' });
    await waitFor(() => expect(document.activeElement).toBe(trigger));
  });

  it('keeps one tab stop across both months, on the day in its own month', () => {
    render(<PixelDateRangePicker defaultValue={range} data-testid="trigger" />);
    fireEvent.click(screen.getByTestId('trigger'));
    // From October 29 to Saturday, November 7, which shows in both months: after October, and in November.
    press('ArrowDown');
    press('End');
    expect(screen.getAllByRole('gridcell', { name: 'November 7, 2026' })).toHaveLength(2);
    const stops = screen.getAllByRole('gridcell').filter((day) => day.tabIndex === 0);
    expect(stops).toHaveLength(1);
    expect(stops[0]).toBe(document.activeElement);
    expect(within(screen.getAllByRole('grid')[1]!).getByRole('gridcell', { name: 'November 7, 2026' })).toBe(stops[0]);
  });

  it('keeps focus in its own months when another grid shows the same days', () => {
    render(
      <>
        <PixelCalendarGrid month={new Date(2026, 9, 1)} />
        <PixelDateRangePicker defaultValue={range} data-testid="trigger" />
      </>,
    );
    fireEvent.click(screen.getByTestId('trigger'));
    const dialog = screen.getByRole('dialog');
    act(() => within(dialog).getByRole('gridcell', { name: 'October 29, 2026' }).focus());
    press('ArrowRight');
    expect(focused()).toBe('October 30, 2026');
    expect(dialog).toContainElement(document.activeElement as HTMLElement);
  });

  it('pages by month to the same day, or the last day of a shorter month, and by year with Shift', () => {
    render(<PixelDateRangePicker defaultValue={{ from: new Date(2026, 0, 31) }} numberOfMonths={1} data-testid="trigger" />);
    fireEvent.click(screen.getByTestId('trigger'));
    press('PageDown');
    expect(focused()).toBe('February 28, 2026');
    press('PageUp', { shiftKey: true });
    expect(focused()).toBe('February 28, 2025');
    expect(screen.getByRole('grid')).toHaveAccessibleName('February 2025');
  });

  it('moves focus no further than max, and marks the start of a range picked with the keyboard', () => {
    const onChange = vi.fn();
    render(
      <PixelDateRangePicker
        defaultValue={{ from: new Date(2026, 9, 30) }}
        max={new Date(2026, 9, 31)}
        onChange={onChange}
        data-testid="trigger"
      />,
    );
    fireEvent.click(screen.getByTestId('trigger'));
    press('ArrowRight');
    press('ArrowRight');
    expect(focused()).toBe('October 31, 2026');
    press('Enter');
    expect(onChange).toHaveBeenLastCalledWith({ from: new Date(2026, 9, 31), to: undefined });
  });

  it('hands focus to the trigger when its clear target clears the range', () => {
    const onChange = vi.fn();
    render(<PixelDateRangePicker defaultValue={range} clearable onChange={onChange} data-testid="trigger" />);
    const clear = screen.getByRole('button', { name: 'Clear range' });
    act(() => clear.focus());
    fireEvent.keyDown(clear, { key: 'Enter' });
    expect(onChange).toHaveBeenLastCalledWith({});
    expect(screen.queryByRole('button', { name: 'Clear range' })).toBeNull();
    expect(document.activeElement).toBe(screen.getByTestId('trigger'));
  });

  it('takes its week, names and default format from the locale', () => {
    render(
      <PxlKitLocaleProvider locale="tr">
        <PixelDateRangePicker defaultValue={range} data-testid="trigger" />
      </PxlKitLocaleProvider>,
    );
    expect(screen.getByTestId('trigger')).toHaveTextContent('29 Ekim 2026 → 3 Kasım 2026');
    fireEvent.click(screen.getByTestId('trigger'));
    for (const grid of screen.getAllByRole('grid')) {
      expect(within(grid).getAllByRole('columnheader')[0]).toHaveTextContent('Pt');
    }
    expect(screen.getAllByRole('grid')[1]).toHaveAccessibleName('Kasım 2026');
    expect(focused()).toBe('29 Ekim 2026');
  });
});

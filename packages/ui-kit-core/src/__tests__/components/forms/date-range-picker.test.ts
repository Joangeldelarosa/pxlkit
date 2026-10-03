import { describe, expect, it } from 'vitest';
import { calendarLocale, dateRangeText, pickDateRange } from '../../../index';

const day = (year: number, month: number, date: number) => new Date(year, month, date);

describe('date range picks', () => {
  it('starts a range on the first pick, as a day', () => {
    expect(pickDateRange(null, new Date(2026, 9, 12, 16, 30))).toEqual({
      range: { from: day(2026, 9, 12), to: undefined },
      pending: day(2026, 9, 12),
    });
  });

  it('completes it on the second pick, in order whichever day came first', () => {
    expect(pickDateRange(day(2026, 9, 12), new Date(2026, 9, 20, 9))).toEqual({
      range: { from: day(2026, 9, 12), to: day(2026, 9, 20) },
      pending: null,
    });
    expect(pickDateRange(day(2027, 0, 3), day(2026, 11, 28))).toEqual({
      range: { from: day(2026, 11, 28), to: day(2027, 0, 3) },
      pending: null,
    });
    expect(pickDateRange(day(2026, 9, 12), day(2026, 9, 12)).range).toEqual({ from: day(2026, 9, 12), to: day(2026, 9, 12) });
  });
});

describe('date range text', () => {
  const { formatDay } = calendarLocale('en');

  it('shows both days, the start and an ellipsis, or the placeholder', () => {
    expect(dateRangeText({ from: day(2026, 9, 12), to: day(2026, 9, 20) }, formatDay, 'Pick')).toBe(
      'October 12, 2026 → October 20, 2026',
    );
    expect(dateRangeText({ from: day(2026, 9, 12) }, formatDay, 'Pick')).toBe('October 12, 2026 → …');
    expect(dateRangeText({}, formatDay, 'Pick')).toBe('Pick');
    expect(dateRangeText({ to: day(2026, 9, 20) }, formatDay, 'Pick')).toBe('Pick');
  });

  it('writes the days the way it is given', () => {
    expect(dateRangeText({ from: day(2026, 9, 12), to: day(2026, 9, 20) }, calendarLocale('tr').formatDay, '')).toBe(
      '12 Ekim 2026 → 20 Ekim 2026',
    );
  });
});

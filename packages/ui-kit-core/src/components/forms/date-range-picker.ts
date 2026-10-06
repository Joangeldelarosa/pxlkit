/**
 * PixelDateRangePicker — PixelDatePicker's trigger over one or two months
 * of PixelCalendarGrid's grid, where two picks make a range. How picks build
 * the range and what the trigger says; the recipes are the date picker's and
 * the grid's.
 */
import { orderDays, startOfDay } from './calendar-grid';

/** A range of days: its start, then its end once picked. */
export interface DateRangeValue {
  from?: Date;
  to?: Date;
}

/** A range after a pick, and the day a range in progress started on (`null` once it is complete). */
export interface DateRangePick {
  range: DateRangeValue;
  pending: Date | null;
}

/**
 * Pick a day: the first pick starts a new range on it, the second completes
 * the range — earlier day first, in whichever order they were picked.
 */
export function pickDateRange(pending: Date | null, picked: Date): DateRangePick {
  if (!pending) {
    const from = startOfDay(picked);
    return { range: { from, to: undefined }, pending: from };
  }
  return { range: orderDays(pending, picked), pending: null };
}

/**
 * What the trigger says: both days, the start and an ellipsis while the end
 * is to come, else the placeholder.
 */
export function dateRangeText({ from, to }: DateRangeValue, formatDay: (date: Date) => string, placeholder: string): string {
  if (from && to) return `${formatDay(from)} → ${formatDay(to)}`;
  if (from) return `${formatDay(from)} → …`;
  return placeholder;
}

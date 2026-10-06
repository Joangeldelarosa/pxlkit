/**
 * PixelCalendarGrid — the month grid PixelDatePicker and PixelDateRangePicker
 * show too: the six weeks of a month, the week and the names of the locale,
 * the day each key moves focus to, the one day that holds the tab stop, the
 * days `min` / `max` / `disabledDates` rule out, the span a range highlights,
 * and the class recipes of the grid's parts.
 *
 * Every date is a local calendar day, built with `new Date(year, month, day)`
 * and moved by calendar fields — never by a number of milliseconds, which a
 * 23- or 25-hour day (a daylight saving change) would throw off.
 */
import { cn, surfaceClasses, toneMap, type Surface } from '../../common';
import type { PxlKitLocale } from '../../locale';

const MS_PER_DAY = 86_400_000;

/** The day of a date as a whole number of days, the same in every time zone: what days are compared by. */
function dayNumber(date: Date): number {
  return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / MS_PER_DAY;
}

/**
 * The start of the local day `date` falls on: midnight, or the first moment
 * of a day whose clocks skip midnight.
 */
export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/** Whether two dates fall on the same local day, whatever their times. */
export function isSameDay(a: Date, b: Date): boolean {
  return dayNumber(a) === dayNumber(b);
}

/** `YYYY-MM-DD` of the local day: the value a hidden input submits, and a key for the day's cell. */
export function toIsoDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

/** The day `count` days after `date`'s day — before it, for a negative count. */
export function addDays(date: Date, count: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + count);
}

/** A month of a year, `month` counted 0–11 as `Date` counts it. */
export interface CalendarMonth {
  year: number;
  month: number;
}

/** The month `date` falls in. */
export function monthOf(date: Date): CalendarMonth {
  return { year: date.getFullYear(), month: date.getMonth() };
}

/** The month `count` months after `month` — before it, for a negative count. */
export function shiftMonth({ year, month }: CalendarMonth, count: number): CalendarMonth {
  const index = year * 12 + month + count;
  const shiftedYear = Math.floor(index / 12);
  return { year: shiftedYear, month: index - shiftedYear * 12 };
}

/** Whether `date` falls in `month`. */
export function isInMonth(date: Date, { year, month }: CalendarMonth): boolean {
  return date.getFullYear() === year && date.getMonth() === month;
}

/** Number of days in a month. */
export function daysInMonth({ year, month }: CalendarMonth): number {
  return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
}

/**
 * The same day of the month `count` months later — earlier, for a negative
 * count — or the last day of a shorter month: January 31 plus one month is
 * the last day of February.
 */
export function addMonths(date: Date, count: number): Date {
  const target = shiftMonth(monthOf(date), count);
  return new Date(target.year, target.month, Math.min(date.getDate(), daysInMonth(target)));
}

/* ── Locale ─────────────────────────────────────────────────────────────── */

/** The week and the names the calendars show in a locale. */
export interface CalendarLocale {
  /** First day of the week: 0 for Sunday, 1 for Monday, … */
  weekStartsOn: number;
  /** The months' names, January first. */
  months: readonly string[];
  /** The weekdays' short names, Sunday first. */
  weekdays: readonly string[];
  /** A day in words: the label of its cell, and a date picker's text for it. */
  formatDay(date: Date): string;
}

const ENGLISH_MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const TURKISH_MONTHS = [
  'Ocak',
  'Şubat',
  'Mart',
  'Nisan',
  'Mayıs',
  'Haziran',
  'Temmuz',
  'Ağustos',
  'Eylül',
  'Ekim',
  'Kasım',
  'Aralık',
];

// Written out rather than read from `Intl`, whose names differ between
// engines and versions: the server and the browser must agree on every one.
const CALENDAR_LOCALES: Record<PxlKitLocale, CalendarLocale> = {
  en: {
    weekStartsOn: 0,
    months: ENGLISH_MONTHS,
    weekdays: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
    formatDay: (date) => `${ENGLISH_MONTHS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`,
  },
  tr: {
    weekStartsOn: 1,
    months: TURKISH_MONTHS,
    weekdays: ['Pz', 'Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct'],
    formatDay: (date) => `${date.getDate()} ${TURKISH_MONTHS[date.getMonth()]} ${date.getFullYear()}`,
  },
};

/** The calendar of a locale (the kit's locale provider sets it); English without one. */
export function calendarLocale(locale: PxlKitLocale = 'en'): CalendarLocale {
  return CALENDAR_LOCALES[locale] ?? CALENDAR_LOCALES.en;
}

/** The weekdays' short names in the order the grid's columns show them, from the first day of the week. */
export function calendarWeekdays({ weekdays, weekStartsOn }: CalendarLocale): string[] {
  return weekdays.map((_, column) => weekdays[(weekStartsOn + column) % 7]!);
}

/** A month's title: the grid's name and heading. */
export function calendarTitle({ months }: CalendarLocale, { year, month }: CalendarMonth): string {
  return `${months[month]} ${year}`;
}

/* ── The grid ───────────────────────────────────────────────────────────── */

/** A cell of a month's grid. */
export interface CalendarDay {
  date: Date;
  /** The day belongs to the month on show, not to a week around it. */
  inMonth: boolean;
  /** `YYYY-MM-DD` — unique within a grid, a key for the cell. */
  iso: string;
}

/**
 * The six weeks a month's grid shows, from the week its first day falls in:
 * every month fits, and the grid keeps its height from month to month.
 */
export function calendarWeeks({ year, month }: CalendarMonth, weekStartsOn: number): CalendarDay[][] {
  // Days of the previous month before the 1st, in the first week.
  const lead = (new Date(Date.UTC(year, month, 1)).getUTCDay() - weekStartsOn + 7) % 7;
  return Array.from({ length: 6 }, (_, week) =>
    Array.from({ length: 7 }, (_, column) => {
      const date = new Date(year, month, 1 - lead + week * 7 + column);
      return { date, inMonth: date.getMonth() === month, iso: toIsoDate(date) };
    }),
  );
}

/** The days a calendar rules out. */
export interface CalendarBounds {
  /** The first day that can be picked. */
  min?: Date;
  /** The last day that can be picked. */
  max?: Date;
  /** Days that cannot be picked: a list, or a test of each day. */
  disabledDates?: readonly Date[] | ((date: Date) => boolean);
}

/** Whether a day is ruled out: before `min`, after `max`, or one of `disabledDates` — compared by day. */
export function isDayDisabled(date: Date, { min, max, disabledDates }: CalendarBounds): boolean {
  const day = dayNumber(date);
  if (min && day < dayNumber(min)) return true;
  if (max && day > dayNumber(max)) return true;
  if (typeof disabledDates === 'function') return disabledDates(date);
  return disabledDates?.some((disabled) => isSameDay(disabled, date)) ?? false;
}

/**
 * The day that holds the tab stop of the grids on show (roving tabindex),
 * given every day they show in order: the focused day where it shows and is
 * enabled — in its own month's grid first —, else the first enabled day of
 * the first month. `undefined` while no day on show is enabled.
 */
export function calendarTabStop(
  days: readonly CalendarDay[],
  focused: Date,
  isDisabled: (date: Date) => boolean,
): CalendarDay | undefined {
  const enabled = days.filter((day) => !isDisabled(day.date));
  const focusedDays = enabled.filter((day) => isSameDay(day.date, focused));
  return focusedDays.find((day) => day.inMonth) ?? focusedDays[0] ?? enabled.find((day) => day.inMonth);
}

/* ── Keyboard ───────────────────────────────────────────────────────────── */

/** What a key pressed on a day does. */
export interface CalendarKeyResult {
  /** The day focus moves to; none when every day that way is disabled. */
  focus?: Date;
  /** Enter or Space: pick the focused day. */
  select?: true;
}

export interface CalendarKeyOptions {
  /** First day of the week (Home and End): 0 for Sunday. */
  weekStartsOn: number;
  /** Shift is held: PageUp and PageDown move by a year. */
  shiftKey?: boolean;
  /** Days focus does not land on. */
  isDisabled?: (date: Date) => boolean;
}

/** How many days a move tries before it gives up on finding an enabled one. */
const SEARCH_LIMIT = 366;

/** The first enabled day of at most `tries` days from `from`, `step` days apart. */
function firstEnabled(from: Date, step: number, tries: number, isDisabled: (date: Date) => boolean): Date | undefined {
  let day = from;
  for (let tried = 0; tried < tries; tried++) {
    if (!isDisabled(day)) return day;
    day = addDays(day, step);
  }
  return undefined;
}

/**
 * What a key pressed on the focused day does, as the WAI-ARIA date picker
 * grid has it: the arrows move a day or a week, Home and End to the first or
 * last day of the week, PageUp and PageDown a month — a year with Shift — to
 * the same day, or the last day of a shorter month; Enter and Space pick the
 * focused day. A move that lands on a disabled day goes on in its direction
 * to the next enabled one (Home and End: back towards the focused day), and
 * focus stays where it is when there is none. `null` for a key the grid
 * leaves alone.
 */
export function calendarKeydown(
  key: string,
  focused: Date,
  { weekStartsOn, shiftKey = false, isDisabled = () => false }: CalendarKeyOptions,
): CalendarKeyResult | null {
  const intoWeek = (focused.getDay() - weekStartsOn + 7) % 7;
  const move = (from: Date, step: number, tries = SEARCH_LIMIT): CalendarKeyResult => ({
    focus: firstEnabled(from, step, tries, isDisabled),
  });
  switch (key) {
    case 'ArrowLeft':
      return move(addDays(focused, -1), -1);
    case 'ArrowRight':
      return move(addDays(focused, 1), 1);
    case 'ArrowUp':
      return move(addDays(focused, -7), -7);
    case 'ArrowDown':
      return move(addDays(focused, 7), 7);
    case 'Home':
      return move(addDays(focused, -intoWeek), 1, intoWeek + 1);
    case 'End':
      return move(addDays(focused, 6 - intoWeek), -1, 7 - intoWeek);
    case 'PageUp':
      return move(addMonths(focused, shiftKey ? -12 : -1), -1);
    case 'PageDown':
      return move(addMonths(focused, shiftKey ? 12 : 1), 1);
    case 'Enter':
    case ' ':
      return { select: true };
    default:
      return null;
  }
}

/* ── Ranges ─────────────────────────────────────────────────────────────── */

/** The first and the last day of a span of days. */
export interface DaySpan {
  from: Date;
  to: Date;
}

/** Two days in order, the earlier first, as days (their times dropped). */
export function orderDays(a: Date, b: Date): DaySpan {
  const first = startOfDay(a);
  const second = startOfDay(b);
  return dayNumber(first) <= dayNumber(second) ? { from: first, to: second } : { from: second, to: first };
}

/** A range a grid highlights: from `from` to `to`, or to the hovered day while `to` is not picked yet. */
export interface CalendarRangePreview {
  from?: Date;
  to?: Date;
  hover?: Date | null;
}

/** The days a range preview spans, or `null` while it has only one end. */
export function rangeSpan({ from, to, hover }: CalendarRangePreview): DaySpan | null {
  const end = to ?? hover;
  return from && end ? orderDays(from, end) : null;
}

/** Whether a day lies within a span, its ends included. */
export function isDayInSpan(date: Date, span: DaySpan | null): boolean {
  if (!span) return false;
  const day = dayNumber(date);
  return day >= dayNumber(span.from) && day <= dayNumber(span.to);
}

/* ── Class recipes ──────────────────────────────────────────────────────── */

export interface CalendarClasses {
  /** PixelCalendarGrid's root. */
  root: string;
  /** A month of PixelDateRangePicker's popover. */
  panel: string;
  /** The previous / next buttons around the month's title. */
  header: string;
  nav: string;
  /** Holds a navigation button's place where a range picker's month has none. */
  navSpacer: string;
  title: string;
  grid: string;
  /** A week, or the weekdays' row: `display: contents`, so their cells lay out on the grid. */
  row: string;
  weekday: string;
}

/** Classes of the parts of a month's grid. */
export function calendarClasses(surface: Surface): CalendarClasses {
  const s = surfaceClasses(surface);
  return {
    root: cn('inline-block', s.font),
    panel: 'min-w-[16rem]',
    header: 'mb-2 flex items-center justify-between',
    nav: cn(
      'h-7 w-7 inline-flex items-center justify-center',
      s.border,
      s.radius,
      'border-retro-border-strong hover:bg-retro-surface/60',
    ),
    navSpacer: 'h-7 w-7',
    title: 'text-xs font-semibold uppercase tracking-wider text-retro-text',
    grid: 'grid grid-cols-7 gap-0.5',
    row: 'contents',
    weekday: 'text-center text-[10px] uppercase text-retro-muted py-1',
  };
}

export interface CalendarDayClassOptions {
  /** The day belongs to the month on show. */
  inMonth: boolean;
  /** The day is selected — a range picker's ends are. */
  selected: boolean;
  today: boolean;
  disabled: boolean;
  /** An end of a range preview that is not the selected day: filled like one. */
  rangeEnd?: boolean;
  /** Within the range on show, its ends included: tinted. */
  inRange?: boolean;
  /** That range is the selection rather than a preview: its days keep their tint under the pointer. */
  rangeSelected?: boolean;
}

/** A day cell. */
export function calendarDayClasses(
  surface: Surface,
  { inMonth, selected, today, disabled, rangeEnd = false, inRange = false, rangeSelected = false }: CalendarDayClassOptions,
): string {
  const s = surfaceClasses(surface);
  const cyan = toneMap.cyan;
  return cn(
    'h-8 text-xs inline-flex items-center justify-center',
    s.radius,
    'motion-safe:transition-colors',
    // One text colour: days of other months stay dimmed, in a range too.
    !inMonth ? 'text-retro-muted/50' : selected || rangeEnd || inRange ? cyan.text : 'text-retro-text',
    inRange && !selected && !rangeEnd && cyan.soft,
    rangeEnd && !selected && cn(cyan.bg, 'font-semibold'),
    selected && cn(cyan.bg, 'font-semibold'),
    today && !selected && !rangeEnd && cn(cyan.border, 'border'),
    disabled && 'opacity-40 line-through cursor-not-allowed',
    !disabled && !selected && !rangeEnd && !(rangeSelected && inRange) && 'hover:bg-retro-surface/60',
  );
}

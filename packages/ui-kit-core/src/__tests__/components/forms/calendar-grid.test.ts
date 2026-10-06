import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import {
  addDays,
  addMonths,
  calendarClasses,
  calendarDayClasses,
  calendarKeydown,
  calendarLocale,
  calendarTabStop,
  calendarTitle,
  calendarWeekdays,
  calendarWeeks,
  daysInMonth,
  isDayDisabled,
  isDayInSpan,
  isInMonth,
  isSameDay,
  monthOf,
  orderDays,
  rangeSpan,
  shiftMonth,
  startOfDay,
  surfaceClasses,
  toIsoDate,
  toneMap,
  type CalendarDay,
  type PxlKitLocale,
  type Surface,
} from '../../../index';

/**
 * Zones whose days are not all 24 hours long, or whose midnight does not
 * always exist, or that sit far from UTC: dates are local days built from
 * calendar fields, so every zone must see the same calendar.
 */
const ZONES: Record<string, number> = {
  // Zone → its offset from local time to UTC on January 1 2026, in minutes.
  UTC: 0,
  'America/Los_Angeles': 480, // 23- and 25-hour days at 2 am
  'America/Sao_Paulo': 180, // midnight skipped on 2018-11-04
  'America/Santiago': 180, // midnight skipped on 2022-09-11
  'America/Havana': 300, // midnight skipped on 2023-03-12
  'Asia/Beirut': -120, // midnight skipped on 2023-03-26
  'Australia/Lord_Howe': -660, // half-hour daylight saving
  'Asia/Kathmandu': -345,
  'Pacific/Kiritimati': -840, // a different UTC date most of the day
  'Pacific/Pago_Pago': 660,
};

/** Runs a suite with `process.env.TZ` set to `zone`. */
function inZone(zone: string): void {
  let previous: string | undefined;
  beforeAll(() => {
    previous = process.env.TZ;
    process.env.TZ = zone;
  });
  afterAll(() => {
    if (previous === undefined) delete process.env.TZ;
    else process.env.TZ = previous;
  });
}

/** `YYYY-MM-DD` of a calendar day counted from a month, independent of any time zone. */
const utcIso = (year: number, month: number, day: number) => new Date(Date.UTC(year, month, day)).toISOString().slice(0, 10);
const iso = (date: Date | undefined) => (date ? toIsoDate(date) : undefined);
const day = (year: number, month: number, date: number) => new Date(year, month, date);
const weekend = (date: Date) => date.getDay() === 0 || date.getDay() === 6;
const SURFACES: Surface[] = ['pixel', 'linear'];

/** The day a zone skipped midnight on, as `[year, month, date]`. */
const SKIPPED_MIDNIGHTS: Record<string, readonly [number, number, number]> = {
  'America/Sao_Paulo': [2018, 10, 4],
  'America/Santiago': [2022, 8, 11],
  'America/Havana': [2023, 2, 12],
  'Asia/Beirut': [2023, 2, 26],
};

describe.each(Object.keys(ZONES))('calendar days in %s', (zone) => {
  inZone(zone);

  it('runs in the zone', () => {
    expect(day(2026, 0, 1).getTimezoneOffset()).toBe(ZONES[zone]);
    const skipped = SKIPPED_MIDNIGHTS[zone];
    if (skipped) expect(day(...skipped).getHours()).toBe(1);
  });

  it('lays out every month of 2018–2028 as six weeks of consecutive days from the first day of the week', () => {
    for (const weekStartsOn of [0, 1]) {
      for (let year = 2018; year <= 2028; year++) {
        for (let month = 0; month < 12; month++) {
          const weeks = calendarWeeks({ year, month }, weekStartsOn);
          const days = weeks.flat();
          expect(weeks.map((week) => week.length)).toEqual([7, 7, 7, 7, 7, 7]);
          const lead = (new Date(Date.UTC(year, month, 1)).getUTCDay() - weekStartsOn + 7) % 7;
          expect(days.map((cell) => cell.iso)).toEqual(days.map((_, i) => utcIso(year, month, 1 - lead + i)));
          expect(days.map((cell) => toIsoDate(cell.date))).toEqual(days.map((cell) => cell.iso));
          expect(days[0]!.date.getDay()).toBe(weekStartsOn);
          expect(days.filter((cell) => cell.inMonth)).toHaveLength(daysInMonth({ year, month }));
          expect(days[lead]!.date.getDate()).toBe(1);
          expect(days.every((cell) => cell.inMonth === (cell.date.getMonth() === month))).toBe(true);
          // Each cell is the start of its day — 1 am where midnight was skipped.
          expect(days.every((cell) => startOfDay(cell.date).getTime() === cell.date.getTime())).toBe(true);
        }
      }
    }
  });

  it('moves by calendar days, across 23- and 25-hour days and skipped midnights', () => {
    for (const [year, month, date] of [
      [2026, 2, 8],
      [2026, 10, 1],
      [2018, 10, 4],
      [2022, 8, 11],
      [2023, 2, 12],
      [2023, 2, 26],
    ] as const) {
      const before = day(year, month, date - 1);
      expect(iso(addDays(before, 1))).toBe(utcIso(year, month, date));
      expect(iso(addDays(before, 2))).toBe(utcIso(year, month, date + 1));
      expect(iso(addDays(day(year, month, date + 1), -2))).toBe(utcIso(year, month, date - 1));
      expect(addDays(before, 2).getHours()).toBe(0);
    }
    expect(iso(addDays(day(2026, 11, 31), 1))).toBe('2027-01-01');
    expect(iso(addDays(day(2027, 0, 1), -1))).toBe('2026-12-31');
    expect(iso(addDays(day(2028, 1, 28), 1))).toBe('2028-02-29');
    expect(iso(addDays(day(2026, 0, 1), 365))).toBe('2027-01-01');
  });

  it('compares and writes dates as local days, whatever their times', () => {
    expect(isSameDay(new Date(2026, 0, 1, 0, 30), new Date(2026, 0, 1, 23, 59))).toBe(true);
    expect(isSameDay(new Date(2025, 11, 31, 23, 59), new Date(2026, 0, 1, 0, 1))).toBe(false);
    expect(toIsoDate(new Date(2026, 0, 1, 23, 59))).toBe('2026-01-01');
    expect(toIsoDate(new Date(2026, 8, 5))).toBe('2026-09-05');
    expect(startOfDay(new Date(2026, 5, 20, 17, 45)).getTime()).toBe(new Date(2026, 5, 20).getTime());
    expect(monthOf(new Date(2026, 11, 31, 23))).toEqual({ year: 2026, month: 11 });
    expect(isInMonth(new Date(2026, 11, 31, 23), { year: 2026, month: 11 })).toBe(true);
    expect(isInMonth(new Date(2027, 0, 1), { year: 2026, month: 11 })).toBe(false);
    expect(isInMonth(new Date(2025, 11, 1), { year: 2026, month: 11 })).toBe(false);
  });

  it('moves by months to the same day, or the last day of a shorter month', () => {
    expect(iso(addMonths(day(2026, 0, 31), 1))).toBe('2026-02-28');
    expect(iso(addMonths(day(2028, 0, 31), 1))).toBe('2028-02-29');
    expect(iso(addMonths(day(2026, 2, 31), -1))).toBe('2026-02-28');
    expect(iso(addMonths(day(2026, 4, 31), 1))).toBe('2026-06-30');
    expect(iso(addMonths(day(2026, 11, 15), 1))).toBe('2027-01-15');
    expect(iso(addMonths(day(2026, 0, 15), -1))).toBe('2025-12-15');
    expect(iso(addMonths(day(2028, 1, 29), 12))).toBe('2029-02-28');
    expect(iso(addMonths(day(2028, 1, 29), -12))).toBe('2027-02-28');
    expect(iso(addMonths(day(2028, 1, 29), 48))).toBe('2032-02-29');
    expect(iso(addMonths(day(2018, 9, 4), 1))).toBe('2018-11-04');
  });

  it('steps the focus by days, weeks, months and years across month and year ends', () => {
    const keys = (key: string, from: Date, weekStartsOn = 0, shiftKey = false) =>
      iso(calendarKeydown(key, from, { weekStartsOn, shiftKey })?.focus);
    expect(keys('ArrowRight', day(2026, 11, 31))).toBe('2027-01-01');
    expect(keys('ArrowLeft', day(2027, 0, 1))).toBe('2026-12-31');
    expect(keys('ArrowDown', day(2026, 11, 28))).toBe('2027-01-04');
    expect(keys('ArrowUp', day(2027, 0, 3))).toBe('2026-12-27');
    expect(keys('ArrowDown', day(2018, 9, 31))).toBe('2018-11-07');
    expect(keys('PageDown', day(2026, 0, 31))).toBe('2026-02-28');
    expect(keys('PageUp', day(2026, 2, 31))).toBe('2026-02-28');
    expect(keys('PageUp', day(2026, 0, 10))).toBe('2025-12-10');
    expect(keys('PageDown', day(2026, 11, 10))).toBe('2027-01-10');
    expect(keys('PageDown', day(2028, 1, 29), 0, true)).toBe('2029-02-28');
    expect(keys('PageUp', day(2028, 1, 29), 0, true)).toBe('2027-02-28');
    expect(keys('PageUp', day(2026, 5, 20), 0, true)).toBe('2025-06-20');
    // Thursday, October 1 2026: its week starts in September.
    expect(keys('Home', day(2026, 9, 1))).toBe('2026-09-27');
    expect(keys('End', day(2026, 9, 1))).toBe('2026-10-03');
    expect(keys('Home', day(2026, 9, 1), 1)).toBe('2026-09-28');
    expect(keys('End', day(2026, 9, 1), 1)).toBe('2026-10-04');
    // Thursday, December 31 2026: its week ends in 2027.
    expect(keys('End', day(2026, 11, 31))).toBe('2027-01-02');
    expect(keys('End', day(2026, 11, 31), 1)).toBe('2027-01-03');
    // A Sunday is the last day of a week that starts on Monday.
    expect(keys('Home', day(2026, 9, 4), 1)).toBe('2026-09-28');
    expect(keys('End', day(2026, 9, 4), 1)).toBe('2026-10-04');
    expect(keys('Home', day(2026, 9, 4))).toBe('2026-10-04');
  });
});

describe('calendar month arithmetic', () => {
  it('shifts months across year ends, both ways', () => {
    expect(shiftMonth({ year: 2026, month: 11 }, 1)).toEqual({ year: 2027, month: 0 });
    expect(shiftMonth({ year: 2026, month: 0 }, -1)).toEqual({ year: 2025, month: 11 });
    expect(shiftMonth({ year: 2026, month: 5 }, -18)).toEqual({ year: 2024, month: 11 });
    expect(shiftMonth({ year: 2026, month: 5 }, 30)).toEqual({ year: 2028, month: 11 });
    expect(shiftMonth({ year: 2026, month: 5 }, 0)).toEqual({ year: 2026, month: 5 });
  });

  it('counts the days of every month, leap years included', () => {
    const lengths = (year: number) => Array.from({ length: 12 }, (_, month) => daysInMonth({ year, month }));
    expect(lengths(2026)).toEqual([31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]);
    expect(lengths(2028)[1]).toBe(29);
    expect(lengths(2000)[1]).toBe(29);
    expect(lengths(2100)[1]).toBe(28);
  });
});

describe('calendar keyboard', () => {
  const at = (key: string, from: Date, options: Partial<Parameters<typeof calendarKeydown>[2]> = {}) =>
    calendarKeydown(key, from, { weekStartsOn: 0, ...options });

  it('picks the focused day with Enter or Space and leaves other keys alone', () => {
    expect(at('Enter', day(2026, 5, 20))).toEqual({ select: true });
    expect(at(' ', day(2026, 5, 20))).toEqual({ select: true });
    expect(at('Tab', day(2026, 5, 20))).toBeNull();
    expect(at('a', day(2026, 5, 20))).toBeNull();
    expect(at('Escape', day(2026, 5, 20))).toBeNull();
  });

  it('moves on past disabled days in the direction of the move', () => {
    const isDisabled = weekend;
    // Friday, October 9 2026, and Monday, October 12.
    expect(iso(at('ArrowRight', day(2026, 9, 9), { isDisabled })?.focus)).toBe('2026-10-12');
    expect(iso(at('ArrowLeft', day(2026, 9, 12), { isDisabled })?.focus)).toBe('2026-10-09');
    expect(iso(at('ArrowDown', day(2026, 9, 9), { isDisabled })?.focus)).toBe('2026-10-16');
    // PageDown from Thursday, October 1 lands on Sunday, November 1: on to Monday.
    expect(iso(at('PageDown', day(2026, 9, 1), { isDisabled })?.focus)).toBe('2026-11-02');
    // PageUp from Monday, November 2 lands on Friday, October 2.
    expect(iso(at('PageUp', day(2026, 10, 2), { isDisabled })?.focus)).toBe('2026-10-02');
    // PageUp from Tuesday, December 1 lands on Sunday, November 1: back to Friday, October 30.
    expect(iso(at('PageUp', day(2026, 11, 1), { isDisabled })?.focus)).toBe('2026-10-30');
    // Home and End stop at the first and last weekday of the week.
    expect(iso(at('Home', day(2026, 9, 7), { isDisabled })?.focus)).toBe('2026-10-05');
    expect(iso(at('End', day(2026, 9, 7), { isDisabled })?.focus)).toBe('2026-10-09');
    expect(iso(at('Home', day(2026, 9, 7), { isDisabled, weekStartsOn: 1 })?.focus)).toBe('2026-10-05');
    expect(iso(at('End', day(2026, 9, 7), { isDisabled, weekStartsOn: 1 })?.focus)).toBe('2026-10-09');
  });

  it('stays put where no enabled day lies that way', () => {
    const min = day(2026, 9, 1);
    const max = day(2026, 9, 31);
    const isDisabled = (date: Date) => isDayDisabled(date, { min, max });
    expect(at('ArrowLeft', min, { isDisabled })).toEqual({ focus: undefined });
    expect(at('ArrowUp', day(2026, 9, 7), { isDisabled })).toEqual({ focus: undefined });
    expect(at('PageDown', day(2026, 9, 15), { isDisabled })).toEqual({ focus: undefined });
    expect(at('PageUp', day(2026, 9, 15), { isDisabled, shiftKey: true })).toEqual({ focus: undefined });
    expect(at('ArrowDown', max, { isDisabled })).toEqual({ focus: undefined });
    // Home and End look no further than the focused day: the week before October 1 is out of bounds.
    expect(iso(at('Home', min, { isDisabled })?.focus)).toBe('2026-10-01');
    expect(iso(at('End', max, { isDisabled })?.focus)).toBe('2026-10-31');
    expect(at('ArrowRight', min, { isDisabled: () => true })).toEqual({ focus: undefined });
  });
});

describe('calendar tab stop', () => {
  const october = calendarWeeks({ year: 2026, month: 9 }, 0).flat();
  const november = calendarWeeks({ year: 2026, month: 10 }, 0).flat();
  const never = () => false;
  const iso = (cell: CalendarDay | undefined) => cell && `${cell.iso}${cell.inMonth ? '' : ' (outside)'}`;

  it('is the focused day where it shows and is enabled, in its own month first', () => {
    expect(iso(calendarTabStop(october, day(2026, 9, 14), never))).toBe('2026-10-14');
    // November 3 shows as a day after October too; its own month's cell wins.
    const both = [...october, ...november];
    expect(both.filter((cell) => cell.iso === '2026-11-03')).toHaveLength(2);
    expect(calendarTabStop(both, day(2026, 10, 3), never)).toBe(november.find((cell) => cell.iso === '2026-11-03'));
    // A day of the weeks around the month holds it when it is focused (a click put focus there).
    expect(iso(calendarTabStop(october, day(2026, 8, 30), never))).toBe('2026-09-30 (outside)');
  });

  it('falls back on the first enabled day of the first month on show', () => {
    expect(iso(calendarTabStop(october, day(2026, 11, 25), never))).toBe('2026-10-01');
    expect(iso(calendarTabStop(october, day(2026, 9, 10), weekend))).toBe('2026-10-01');
    // Thursday, October 1 disabled: the next enabled day of October.
    expect(iso(calendarTabStop(october, day(2026, 5, 1), (date) => date.getDate() < 5 || weekend(date)))).toBe('2026-10-05');
    expect(calendarTabStop(october, day(2026, 9, 14), () => true)).toBeUndefined();
  });
});

describe('calendar bounds and ranges', () => {
  it('rules out days before min and after max by day, whatever their times', () => {
    const bounds = { min: new Date(2026, 9, 10, 15), max: new Date(2026, 9, 20, 9) };
    expect(isDayDisabled(day(2026, 9, 9), bounds)).toBe(true);
    expect(isDayDisabled(day(2026, 9, 10), bounds)).toBe(false);
    expect(isDayDisabled(new Date(2026, 9, 20, 23), bounds)).toBe(false);
    expect(isDayDisabled(day(2026, 9, 21), bounds)).toBe(true);
    expect(isDayDisabled(day(2026, 9, 21), {})).toBe(false);
  });

  it('rules out listed days and the days a test rejects', () => {
    const listed = { disabledDates: [new Date(2026, 9, 12, 18)] };
    expect(isDayDisabled(day(2026, 9, 12), listed)).toBe(true);
    expect(isDayDisabled(day(2026, 9, 13), listed)).toBe(false);
    const tested = { disabledDates: weekend };
    expect(isDayDisabled(day(2026, 9, 10), tested)).toBe(true);
    expect(isDayDisabled(day(2026, 9, 12), tested)).toBe(false);
    expect(isDayDisabled(day(2026, 9, 10), { max: day(2026, 9, 9), disabledDates: () => false })).toBe(true);
  });

  it('orders two days, earlier first, dropping their times', () => {
    expect(orderDays(new Date(2026, 9, 20, 8), new Date(2026, 9, 10, 22))).toEqual({ from: day(2026, 9, 10), to: day(2026, 9, 20) });
    expect(orderDays(day(2025, 11, 31), day(2026, 0, 1))).toEqual({ from: day(2025, 11, 31), to: day(2026, 0, 1) });
    expect(orderDays(new Date(2026, 9, 10, 22), new Date(2026, 9, 10, 8))).toEqual({ from: day(2026, 9, 10), to: day(2026, 9, 10) });
  });

  it('spans a range preview from its start to its end, or to the hovered day', () => {
    const from = new Date(2026, 9, 20, 13);
    expect(rangeSpan({})).toBeNull();
    expect(rangeSpan({ from })).toBeNull();
    expect(rangeSpan({ to: day(2026, 9, 25), hover: day(2026, 9, 1) })).toBeNull();
    expect(rangeSpan({ from, to: day(2026, 9, 25) })).toEqual({ from: day(2026, 9, 20), to: day(2026, 9, 25) });
    expect(rangeSpan({ from, hover: day(2026, 9, 15) })).toEqual({ from: day(2026, 9, 15), to: day(2026, 9, 20) });
    expect(rangeSpan({ from, to: day(2026, 9, 25), hover: day(2026, 9, 1) })).toEqual({ from: day(2026, 9, 20), to: day(2026, 9, 25) });
    expect(rangeSpan({ from, hover: null })).toBeNull();
  });

  it('tells the days within a span, its ends included', () => {
    const span = { from: day(2026, 11, 30), to: day(2027, 0, 2) };
    expect([29, 30, 31].map((date) => isDayInSpan(new Date(2026, 11, date, 12), span))).toEqual([false, true, true]);
    expect([1, 2, 3].map((date) => isDayInSpan(new Date(2027, 0, date, 23), span))).toEqual([true, true, false]);
    expect(isDayInSpan(day(2026, 11, 31), null)).toBe(false);
  });
});

describe('calendar locales', () => {
  it('starts the week on Sunday in English and on Monday in Turkish', () => {
    expect(calendarLocale().weekStartsOn).toBe(0);
    expect(calendarWeekdays(calendarLocale('en'))).toEqual(['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']);
    expect(calendarLocale('tr').weekStartsOn).toBe(1);
    expect(calendarWeekdays(calendarLocale('tr'))).toEqual(['Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct', 'Pz']);
    expect(calendarLocale('xx' as PxlKitLocale)).toBe(calendarLocale('en'));
  });

  it('names days and months in the locale', () => {
    expect(calendarLocale('en').formatDay(new Date(2026, 5, 20, 18))).toBe('June 20, 2026');
    expect(calendarLocale('tr').formatDay(new Date(2026, 1, 3))).toBe('3 Şubat 2026');
    expect(calendarTitle(calendarLocale('en'), { year: 2026, month: 11 })).toBe('December 2026');
    expect(calendarTitle(calendarLocale('tr'), { year: 2027, month: 7 })).toBe('Ağustos 2027');
    expect(calendarLocale('tr').months).toHaveLength(12);
  });
});

describe('calendar recipes', () => {
  it('composes the grid parts from the surface', () => {
    for (const surface of SURFACES) {
      const s = surfaceClasses(surface);
      const c = calendarClasses(surface);
      expect(c.root).toBe(`inline-block ${s.font}`);
      expect(c.nav).toBe(
        `h-7 w-7 inline-flex items-center justify-center ${s.border} ${s.radius} border-retro-border-strong hover:bg-retro-surface/60`,
      );
      expect([c.panel, c.header, c.navSpacer, c.title, c.grid, c.row, c.weekday]).toEqual([
        'min-w-[16rem]',
        'mb-2 flex items-center justify-between',
        'h-7 w-7',
        'text-xs font-semibold uppercase tracking-wider text-retro-text',
        'grid grid-cols-7 gap-0.5',
        'contents',
        'text-center text-[10px] uppercase text-retro-muted py-1',
      ]);
    }
  });

  const base = { inMonth: true, selected: false, today: false, disabled: false };
  const cyan = toneMap.cyan;

  it('mutes the days around the month, fills the selected day and rings today', () => {
    for (const surface of SURFACES) {
      const { radius } = surfaceClasses(surface);
      const start = `h-8 text-xs inline-flex items-center justify-center ${radius} motion-safe:transition-colors`;
      expect(calendarDayClasses(surface, base)).toBe(`${start} text-retro-text hover:bg-retro-surface/60`);
      expect(calendarDayClasses(surface, { ...base, inMonth: false })).toBe(`${start} text-retro-muted/50 hover:bg-retro-surface/60`);
      expect(calendarDayClasses(surface, { ...base, selected: true, today: true })).toBe(
        `${start} ${cyan.text} ${cyan.bg} font-semibold`,
      );
      expect(calendarDayClasses(surface, { ...base, today: true })).toBe(
        `${start} text-retro-text ${cyan.border} border hover:bg-retro-surface/60`,
      );
      expect(calendarDayClasses(surface, { ...base, disabled: true })).toBe(
        `${start} text-retro-text opacity-40 line-through cursor-not-allowed`,
      );
    }
  });

  // Regression: days in a range kept the plain `text-retro-text` next to the
  // range's cyan, which Tailwind emits after it, so their text never turned
  // cyan.
  it('tints a range preview, which still lights up under the pointer, and fills its ends', () => {
    expect(calendarDayClasses('pixel', { ...base, inRange: true })).toBe(
      `h-8 text-xs inline-flex items-center justify-center pxl-corner-sm motion-safe:transition-colors ${cyan.text} ${cyan.soft} hover:bg-retro-surface/60`,
    );
    expect(calendarDayClasses('pixel', { ...base, inRange: true, rangeEnd: true, today: true })).toBe(
      `h-8 text-xs inline-flex items-center justify-center pxl-corner-sm motion-safe:transition-colors ${cyan.text} ${cyan.bg} font-semibold`,
    );
    const otherMonth = calendarDayClasses('pixel', { ...base, inMonth: false, inRange: true }).split(' ');
    expect(otherMonth).toEqual(expect.arrayContaining(['text-retro-muted/50', cyan.soft]));
    expect(otherMonth).not.toContain(cyan.text);
  });

  it('keeps a selected range tinted under the pointer, and fills its selected ends', () => {
    const range = { ...base, inRange: true, rangeSelected: true };
    expect(calendarDayClasses('linear', range)).toBe(
      `h-8 text-xs inline-flex items-center justify-center rounded-md motion-safe:transition-colors ${cyan.text} ${cyan.soft}`,
    );
    expect(calendarDayClasses('linear', { ...range, selected: true })).toBe(
      `h-8 text-xs inline-flex items-center justify-center rounded-md motion-safe:transition-colors ${cyan.text} ${cyan.bg} font-semibold`,
    );
    expect(calendarDayClasses('linear', { ...base, rangeSelected: true })).toContain('hover:bg-retro-surface/60');
  });
});

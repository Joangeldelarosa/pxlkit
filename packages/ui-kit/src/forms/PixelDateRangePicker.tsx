'use client';

import React, { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  calendarClasses,
  calendarDayClasses,
  calendarKeydown,
  calendarLocale,
  calendarTabStop,
  calendarTitle,
  calendarWeekdays,
  calendarWeeks,
  dateRangeText,
  datePickerClasses,
  fieldDescribedBy,
  fieldMessageId,
  isDayDisabled,
  isDayInSpan,
  isInMonth,
  isSameDay,
  orderDays,
  pickDateRange,
  rangeSpan,
  shiftMonth,
  startOfDay,
  toIsoDate,
  type CalendarDay,
  type CalendarLocale,
  type DateRangeValue,
} from '@pxlkit/ui-kit-core';
import {
  Surface,
  useEffectiveSurface,
  FieldShell,
} from '../common';
import { useControllableState } from '../hooks/useControllableState';
import { usePxlKitLocale } from '../locale';
import { PixelPopover } from '../overlay-foundation/PixelPopover';

export type { DateRangeValue } from '@pxlkit/ui-kit-core';

/* ──────────────────────────────────────────────────────────────────────────
   PixelDateRangePicker
   ────────────────────────────────────────────────────────────────────────── */

export interface PixelDateRangePickerProps {
  value?: DateRangeValue;
  defaultValue?: DateRangeValue;
  onChange?: (next: DateRangeValue) => void;
  min?: Date;
  max?: Date;
  presets?: { label: string; value: { from: Date; to: Date } }[];
  numberOfMonths?: 1 | 2;
  surface?: Surface;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  hint?: string;
  error?: string;
  placeholder?: string;
  clearable?: boolean;
  name?: string;
  id?: string;
  ['data-testid']?: string;
}

interface CalendarPanelProps {
  year: number;
  month: number;
  weeks: CalendarDay[][];
  calendar: CalendarLocale;
  from?: Date;
  to?: Date;
  hover: Date | null;
  setHover: (d: Date | null) => void;
  onPick: (d: Date) => void;
  isDisabled: (d: Date) => boolean;
  showPrev: boolean;
  showNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  panelId: string;
  surface: Surface;
  /** The day that holds the tab stop of both panels. */
  tabStop: CalendarDay | undefined;
  onFocusDate: (d: Date) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => void;
}

function CalendarPanel({
  year,
  month,
  weeks,
  calendar,
  from,
  to,
  hover,
  setHover,
  onPick,
  isDisabled,
  showPrev,
  showNext,
  onPrev,
  onNext,
  panelId,
  surface,
  tabStop,
  onFocusDate,
  onKeyDown,
}: CalendarPanelProps) {
  const classes = calendarClasses(surface);
  const today = startOfDay(new Date());

  // The span on show: the range, or from its start to the hovered day while
  // only "from" is set.
  const span = rangeSpan({ from, to, hover });

  return (
    <div className={classes.panel}>
      <div className={classes.header}>
        {showPrev ? (
          <button
            type="button"
            aria-label="Previous month"
            onClick={onPrev}
            className={classes.nav}
          >
            ‹
          </button>
        ) : (
          <span className={classes.navSpacer} aria-hidden />
        )}
        <span
          id={panelId}
          className={classes.title}
          aria-live="polite"
        >
          {calendarTitle(calendar, { year, month })}
        </span>
        {showNext ? (
          <button
            type="button"
            aria-label="Next month"
            onClick={onNext}
            className={classes.nav}
          >
            ›
          </button>
        ) : (
          <span className={classes.navSpacer} aria-hidden />
        )}
      </div>

      <div
        role="grid"
        aria-labelledby={panelId}
        className={classes.grid}
        onKeyDown={onKeyDown}
      >
        {/* Column headers belong in a row, like the days below. */}
        <div role="row" className={classes.row}>
          {calendarWeekdays(calendar).map((wd) => (
            <div key={wd} role="columnheader" className={classes.weekday}>
              {wd}
            </div>
          ))}
        </div>
        {weeks.map((week, rowIdx) => (
          <div key={`row-${rowIdx}`} role="row" className={classes.row}>
            {week.map((cell) => {
              const disabled = isDisabled(cell.date);
              const isToday = isSameDay(cell.date, today);
              const isFrom = from ? isSameDay(cell.date, from) : false;
              const isTo = to ? isSameDay(cell.date, to) : false;
              const isEdge = isFrom || isTo;
              return (
                <button
                  key={cell.iso}
                  type="button"
                  role="gridcell"
                  aria-label={calendar.formatDay(cell.date)}
                  aria-selected={isEdge || undefined}
                  aria-current={isToday ? 'date' : undefined}
                  aria-disabled={disabled || undefined}
                  disabled={disabled}
                  tabIndex={cell === tabStop ? 0 : -1}
                  onClick={() => onPick(cell.date)}
                  onMouseEnter={() => setHover(cell.date)}
                  onFocus={() => { setHover(cell.date); onFocusDate(cell.date); }}
                  className={calendarDayClasses(surface, {
                    inMonth: cell.inMonth,
                    selected: isEdge,
                    today: isToday,
                    disabled,
                    inRange: isDayInSpan(cell.date, span),
                    rangeSelected: true,
                  })}
                >
                  {cell.date.getDate()}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

export const PixelDateRangePicker = forwardRef<
  HTMLButtonElement,
  PixelDateRangePickerProps
>(function PixelDateRangePicker(
  {
    value,
    defaultValue,
    onChange,
    min,
    max,
    presets,
    numberOfMonths = 2,
    surface: surfaceProp,
    size = 'md',
    label,
    hint,
    error,
    placeholder = 'Select date range',
    clearable = false,
    name,
    id,
    ['data-testid']: dataTestId,
  },
  ref,
) {
  const surface = useEffectiveSurface(surfaceProp);
  // Week start, month and weekday names follow the kit's locale.
  const calendar = calendarLocale(usePxlKitLocale().locale);

  const [range, setRange] = useControllableState<DateRangeValue>({
    value,
    defaultValue: defaultValue ?? {},
    onChange,
  });

  const [open, setOpen] = useState(false);
  const [hover, setHover] = useState<Date | null>(null);
  // Pending-from tracks the in-progress selection cycle (first click).
  const [pendingFrom, setPendingFrom] = useState<Date | null>(null);

  // Left calendar anchor.
  const initialAnchor = range.from ?? defaultValue?.from ?? new Date();
  const [viewYear, setViewYear] = useState(initialAnchor.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialAnchor.getMonth());

  // Roving tabindex anchor for grid keyboard nav.
  const [focusedDate, setFocusedDate] = useState<Date>(() => startOfDay(initialAnchor));
  const shouldRefocusRef = useRef(false);
  const contentRef = useRef<HTMLDivElement | null>(null);

  // Each opening jumps the view to range.from and starts a new pick, set
  // before the months first render so focus moves into them.
  const handleOpenChange = useCallback(
    (next: boolean) => {
      if (next) {
        const anchor = range.from ?? new Date();
        setViewYear(anchor.getFullYear());
        setViewMonth(anchor.getMonth());
        setFocusedDate(startOfDay(anchor));
        setPendingFrom(null);
        setHover(null);
        shouldRefocusRef.current = true;
      }
      setOpen(next);
    },
    [range.from],
  );

  const view = { year: viewYear, month: viewMonth };
  const right = shiftMonth(view, 1);
  const leftWeeks = useMemo(
    () => calendarWeeks({ year: viewYear, month: viewMonth }, calendar.weekStartsOn),
    [viewYear, viewMonth, calendar.weekStartsOn],
  );
  const rightWeeks = useMemo(
    () => calendarWeeks(shiftMonth({ year: viewYear, month: viewMonth }, 1), calendar.weekStartsOn),
    [viewYear, viewMonth, calendar.weekStartsOn],
  );

  const isDisabled = useCallback(
    (d: Date): boolean => isDayDisabled(d, { min, max }),
    [min, max],
  );

  // One day of the months on show is in the tab order: the focused one, or
  // the left month's first enabled day while that one is not on show.
  const tabStop = calendarTabStop(
    numberOfMonths === 2 ? [...leftWeeks.flat(), ...rightWeeks.flat()] : leftWeeks.flat(),
    focusedDate,
    isDisabled,
  );

  // After opening or keyboard nav, focus the tab stop — in this picker's own
  // popover, where a day shows once in each month it borders.
  useEffect(() => {
    if (!open || !shouldRefocusRef.current) return;
    shouldRefocusRef.current = false;
    contentRef.current?.querySelector<HTMLButtonElement>('[role="gridcell"][tabindex="0"]')?.focus();
  }, [focusedDate, open, tabStop]);

  const handlePick = useCallback(
    (d: Date) => {
      if (isDisabled(d)) return;
      // First click → reset range to single-anchor; second click → close
      // range, auto-swap if needed.
      const pick = pickDateRange(pendingFrom, d);
      setRange(pick.range);
      setPendingFrom(pick.pending);
      if (pick.pending) return;
      setHover(null);
      setOpen(false);
    },
    [isDisabled, pendingFrom, setRange],
  );

  const handleGridKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const action = calendarKeydown(e.key, focusedDate, {
      weekStartsOn: calendar.weekStartsOn,
      shiftKey: e.shiftKey,
      isDisabled,
    });
    if (!action) return;
    e.preventDefault();
    if (action.select) {
      handlePick(focusedDate);
      return;
    }
    const next = action.focus;
    if (!next) return;
    shouldRefocusRef.current = true;
    setFocusedDate(next);
    // A page moves the left month to the new day's; a day or a week moves
    // the view only when the new day leaves both visible months.
    const paged = e.key === 'PageUp' || e.key === 'PageDown';
    const visible = isInMonth(next, view) || (numberOfMonths === 2 && isInMonth(next, right));
    if (paged || !visible) {
      setViewYear(next.getFullYear());
      setViewMonth(next.getMonth());
    }
  };

  const handlePreset = useCallback(
    (preset: { from: Date; to: Date }) => {
      setRange(orderDays(preset.from, preset.to));
      setPendingFrom(null);
      setHover(null);
      setOpen(false);
    },
    [setRange],
  );

  const handleClear = useCallback(() => {
    setRange({});
    setPendingFrom(null);
    setHover(null);
  }, [setRange]);

  // The trigger's clear target turns into the ▾ mark once the range is gone:
  // focus moves to the trigger it sits in rather than stay on a hidden mark.
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const setTriggerRef = useCallback(
    (node: HTMLButtonElement | null) => {
      triggerRef.current = node;
      if (typeof ref === 'function') ref(node);
      else if (ref) ref.current = node;
    },
    [ref],
  );
  const clearFromTrigger = (e: React.SyntheticEvent) => {
    e.stopPropagation();
    handleClear();
    triggerRef.current?.focus();
  };

  const goPrev = () => {
    const next = shiftMonth(view, -1);
    setViewYear(next.year);
    setViewMonth(next.month);
  };
  const goNext = () => {
    const next = shiftMonth(view, 1);
    setViewYear(next.year);
    setViewMonth(next.month);
  };

  const triggerLabel = dateRangeText(range, calendar.formatDay, placeholder);

  const isPlaceholder = !range.from && !range.to;

  const classes = datePickerClasses(surface, { size, invalid: !!error, placeholder: isPlaceholder, months: numberOfMonths });

  const reactId = React.useId();
  const triggerId = id ?? `pxl-daterange-${reactId}`;
  const leftPanelId = `${reactId}-left`;
  const rightPanelId = `${reactId}-right`;

  // "Display" range — show pending-from + hover preview while picking.
  const displayFrom = pendingFrom ?? range.from;
  const displayTo = pendingFrom ? undefined : range.to;

  const panel = {
    calendar,
    from: displayFrom,
    to: displayTo,
    hover,
    setHover,
    onPick: handlePick,
    isDisabled,
    onPrev: goPrev,
    onNext: goNext,
    surface,
    tabStop,
    onFocusDate: setFocusedDate,
    onKeyDown: handleGridKeyDown,
  };

  return (
    <FieldShell label={label} hint={hint} error={error} surface={surface} htmlFor={triggerId} messageId={fieldMessageId(triggerId)}>
      <span className={classes.anchor}>
        <PixelPopover
          open={open}
          onOpenChange={handleOpenChange}
          side="bottom"
          align="start"
          surface={surface}
        >
          <PixelPopover.Trigger>
            <button
              ref={setTriggerRef}
              type="button"
              id={triggerId}
              data-testid={dataTestId}
              aria-haspopup="dialog"
              aria-invalid={error ? true : undefined}
              aria-describedby={fieldDescribedBy(triggerId, { hint, error })}
              className={classes.trigger}
            >
              <span className={classes.value}>{triggerLabel}</span>
              {clearable && (range.from || range.to) ? (
                <span
                  role="button"
                  tabIndex={0}
                  aria-label="Clear range"
                  onClick={clearFromTrigger}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      clearFromTrigger(e);
                    }
                  }}
                  className={classes.clearMark}
                >
                  ×
                </span>
              ) : (
                <span aria-hidden className={classes.mark}>▾</span>
              )}
            </button>
          </PixelPopover.Trigger>

          <PixelPopover.Content
            ref={contentRef}
            surface={surface}
            aria-label="Choose date range"
            className={classes.content}
          >
            {presets && presets.length > 0 && (
              <div className={classes.presets}>
                {presets.map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => handlePreset(p.value)}
                    className={classes.preset}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            )}

            <div className={classes.months}>
              <CalendarPanel
                {...panel}
                year={viewYear}
                month={viewMonth}
                weeks={leftWeeks}
                showPrev
                showNext={numberOfMonths === 1}
                panelId={leftPanelId}
              />
              {numberOfMonths === 2 && (
                <CalendarPanel
                  {...panel}
                  year={right.year}
                  month={right.month}
                  weeks={rightWeeks}
                  showPrev={false}
                  showNext
                  panelId={rightPanelId}
                />
              )}
            </div>

            {clearable && (range.from || range.to) && (
              <div className={classes.footer}>
                <button
                  type="button"
                  onClick={handleClear}
                  className={classes.clear}
                >
                  Clear
                </button>
              </div>
            )}
          </PixelPopover.Content>
        </PixelPopover>

        {name && (
          <>
            <input
              type="hidden"
              name={`${name}.from`}
              value={range.from ? toIsoDate(range.from) : ''}
              readOnly
            />
            <input
              type="hidden"
              name={`${name}.to`}
              value={range.to ? toIsoDate(range.to) : ''}
              readOnly
            />
          </>
        )}
      </span>
    </FieldShell>
  );
});

PixelDateRangePicker.displayName = 'PixelDateRangePicker';

'use client';

import React, { forwardRef, useCallback, useMemo, useRef, useState } from 'react';
import {
  calendarClasses,
  calendarDayClasses,
  calendarKeydown,
  calendarLocale,
  calendarTabStop,
  calendarTitle,
  calendarWeekdays,
  calendarWeeks,
  isDayDisabled,
  isDayInSpan,
  isInMonth,
  isSameDay,
  rangeSpan,
  startOfDay,
  toIsoDate,
} from '@pxlkit/ui-kit-core';
import { Surface, useEffectiveSurface } from '../common';
import { useControllableState } from '../hooks/useControllableState';
import { usePxlKitLocale } from '../locale';

/* ──────────────────────────────────────────────────────────────────────────
   PixelCalendarGrid — standalone month grid.
   Usable inline, or composed inside DatePicker / DateRangePicker.
   ────────────────────────────────────────────────────────────────────────── */

export interface PixelCalendarGridProps {
  value?: Date | null;
  defaultValue?: Date | null;
  onChange?: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
  disabledDates?: Date[] | ((d: Date) => boolean);
  renderDay?: (d: Date) => React.ReactNode;
  month?: Date;
  onMonthChange?: (m: Date) => void;
  surface?: Surface;
  rangePreview?: { from?: Date; to?: Date; hover?: Date };
  /** Optional hook for tests. */
  ['data-testid']?: string;
}

export const PixelCalendarGrid = forwardRef<HTMLDivElement, PixelCalendarGridProps>(
  function PixelCalendarGrid(
    {
      value: valueProp,
      defaultValue,
      onChange,
      minDate,
      maxDate,
      disabledDates,
      renderDay,
      month,
      onMonthChange,
      surface: surfaceProp,
      rangePreview,
      ['data-testid']: dataTestId,
    },
    ref,
  ) {
    const surface = useEffectiveSurface(surfaceProp);
    const classes = calendarClasses(surface);
    // Week start, month and weekday names follow the kit's locale.
    const calendar = calendarLocale(usePxlKitLocale().locale);
    const [value, setValue] = useControllableState<Date | null | undefined>({
      value: valueProp,
      defaultValue: defaultValue ?? null,
      onChange: onChange ? ((next) => { if (next) onChange(next); }) : undefined,
    });

    // Uncontrolled fallback for month when `month` not provided.
    const initial = month ?? value ?? new Date();
    const [internalMonth, setInternalMonth] = useState<Date>(
      new Date(initial.getFullYear(), initial.getMonth(), 1),
    );
    const viewDate = month ?? internalMonth;
    const viewYear = viewDate.getFullYear();
    const viewMonth = viewDate.getMonth();
    const title = calendarTitle(calendar, { year: viewYear, month: viewMonth });

    const setView = useCallback(
      (next: Date) => {
        const firstOfMonth = new Date(next.getFullYear(), next.getMonth(), 1);
        if (month === undefined) setInternalMonth(firstOfMonth);
        onMonthChange?.(firstOfMonth);
      },
      [month, onMonthChange],
    );

    const goPrev = () => {
      setView(new Date(viewYear, viewMonth - 1, 1));
    };
    const goNext = () => {
      setView(new Date(viewYear, viewMonth + 1, 1));
    };

    const isDisabled = useCallback(
      (d: Date): boolean => isDayDisabled(d, { min: minDate, max: maxDate, disabledDates }),
      [minDate, maxDate, disabledDates],
    );

    const today = useMemo(() => startOfDay(new Date()), []);
    const weeks = useMemo(
      () => calendarWeeks({ year: viewYear, month: viewMonth }, calendar.weekStartsOn),
      [viewYear, viewMonth, calendar.weekStartsOn],
    );

    // Roving tabindex anchor.
    const [focusedDate, setFocusedDate] = useState<Date>(
      () => value ?? new Date(viewYear, viewMonth, 1),
    );
    // One day of the grid is in the tab order: the focused one, or the
    // month's first enabled day while that one is not on show.
    const tabStop = calendarTabStop(weeks.flat(), focusedDate, isDisabled);
    const dayBtnRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
    const shouldRefocusRef = useRef(false);

    React.useEffect(() => {
      if (!shouldRefocusRef.current) return;
      const key = toIsoDate(focusedDate);
      const btn = dayBtnRefs.current.get(key);
      if (btn) {
        btn.focus();
        shouldRefocusRef.current = false;
      }
    }, [focusedDate]);

    const moveFocus = (next: Date) => {
      shouldRefocusRef.current = true;
      setFocusedDate(next);
      if (!isInMonth(next, { year: viewYear, month: viewMonth })) setView(next);
    };

    const pickDate = (d: Date) => {
      if (isDisabled(d)) return;
      setValue(startOfDay(d));
    };

    const handleGridKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      const action = calendarKeydown(e.key, focusedDate, {
        weekStartsOn: calendar.weekStartsOn,
        shiftKey: e.shiftKey,
        isDisabled,
      });
      if (!action) return;
      e.preventDefault();
      if (action.select) pickDate(focusedDate);
      else if (action.focus) moveFocus(action.focus);
    };

    // Range preview math.
    const previewSpan = useMemo(() => (rangePreview ? rangeSpan(rangePreview) : null), [rangePreview]);

    return (
      <div
        ref={ref}
        data-testid={dataTestId}
        className={classes.root}
      >
        <div className={classes.header}>
          <button
            type="button"
            aria-label="Previous month"
            onClick={goPrev}
            className={classes.nav}
          >
            ‹
          </button>
          <span className={classes.title} aria-live="polite">
            {title}
          </span>
          <button
            type="button"
            aria-label="Next month"
            onClick={goNext}
            className={classes.nav}
          >
            ›
          </button>
        </div>

        <div
          role="grid"
          aria-label={title}
          className={classes.grid}
          onKeyDown={handleGridKeyDown}
        >
          {/* role="grid" only allows row/rowgroup children, and columnheader
              cells must live inside a row — wrap the weekday header strip in
              its own display:contents row like the week rows below. */}
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
                const isSelected = value ? isSameDay(cell.date, value) : false;
                const cellInRange = isDayInSpan(cell.date, previewSpan);
                const cellEndpoint =
                  !!previewSpan && (isSameDay(cell.date, previewSpan.from) || isSameDay(cell.date, previewSpan.to));
                return (
                  <button
                    key={cell.iso}
                    ref={(node) => {
                      if (node) dayBtnRefs.current.set(cell.iso, node);
                      else dayBtnRefs.current.delete(cell.iso);
                    }}
                    type="button"
                    role="gridcell"
                    aria-label={calendar.formatDay(cell.date)}
                    aria-selected={isSelected || undefined}
                    aria-current={isToday ? 'date' : undefined}
                    aria-disabled={disabled || undefined}
                    disabled={disabled}
                    tabIndex={cell === tabStop ? 0 : -1}
                    data-in-range={cellInRange || undefined}
                    data-range-endpoint={cellEndpoint || undefined}
                    data-today={isToday || undefined}
                    data-out-of-month={!cell.inMonth || undefined}
                    onClick={() => pickDate(cell.date)}
                    onFocus={() => setFocusedDate(cell.date)}
                    className={calendarDayClasses(surface, {
                      inMonth: cell.inMonth,
                      selected: isSelected,
                      today: isToday,
                      disabled,
                      rangeEnd: cellEndpoint,
                      inRange: cellInRange,
                    })}
                  >
                    {renderDay ? renderDay(cell.date) : cell.date.getDate()}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  },
);

PixelCalendarGrid.displayName = 'PixelCalendarGrid';

'use client';

import React, { forwardRef, useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import {
  calendarClasses,
  calendarDayClasses,
  calendarKeydown,
  calendarLocale,
  calendarTabStop,
  calendarTitle,
  calendarWeekdays,
  calendarWeeks,
  datePickerClasses,
  fieldDescribedBy,
  fieldMessageId,
  isDayDisabled,
  isSameDay,
  startOfDay,
  toIsoDate,
} from '@pxlkit/ui-kit-core';
import {
  Surface,
  Size,
  useEffectiveSurface,
  FieldShell,
} from '../common';
import { useControllableState } from '../hooks/useControllableState';
import { usePxlKitLocale } from '../locale';
import { PixelPopover } from '../overlay-foundation/PixelPopover';

/* ──────────────────────────────────────────────────────────────────────────
   PixelDatePicker
   ────────────────────────────────────────────────────────────────────────── */

export interface PixelDatePickerProps {
  value?: Date | null;
  defaultValue?: Date;
  onChange?: (date: Date | null) => void;
  min?: Date;
  max?: Date;
  disabledDates?: Date[] | ((d: Date) => boolean);
  format?: (d: Date) => string;
  placeholder?: string;
  clearable?: boolean;
  presets?: { label: string; value: Date }[];
  surface?: Surface;
  size?: Size;
  label?: string;
  hint?: string;
  error?: string;
  name?: string;
  id?: string;
  /** Hook for tests + custom triggers. */
  ['data-testid']?: string;
}

export const PixelDatePicker = forwardRef<
  HTMLButtonElement,
  PixelDatePickerProps
>(function PixelDatePicker(
  {
    value,
    defaultValue,
    onChange,
    min,
    max,
    disabledDates,
    format,
    placeholder = 'Select date',
    clearable = false,
    presets,
    surface: surfaceProp,
    size = 'md',
    label,
    hint,
    error,
    name,
    id,
    ['data-testid']: dataTestId,
  },
  ref,
) {
  const surface = useEffectiveSurface(surfaceProp);
  const reactId = useId();
  const triggerId = id ?? `pxl-date-${reactId}`;
  // Week start, month and weekday names follow the kit's locale.
  const calendar = calendarLocale(usePxlKitLocale().locale);
  const formatDate = format ?? calendar.formatDay;

  const [current, setCurrent] = useControllableState<Date | null>({
    value,
    defaultValue: defaultValue ?? null,
    onChange,
  });

  const [open, setOpen] = useState(false);

  // The month/year currently displayed inside the calendar grid.
  const initialView = current ?? defaultValue ?? new Date();
  const [viewYear, setViewYear] = useState(initialView.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialView.getMonth());

  // Keep view in sync with the controlled/uncontrolled value when it changes
  // externally (consumer rerenders with a date in a different month).
  const currentTime = current ? current.getTime() : null;
  useEffect(() => {
    if (!current) return;
    setViewYear(current.getFullYear());
    setViewMonth(current.getMonth());
    // Only re-run when the date value's day-instant changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTime]);

  // Roving tabindex anchor — the date that should currently own focus.
  const [focusedDate, setFocusedDate] = useState<Date>(() => current ?? new Date());
  const dayBtnRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const shouldRefocusRef = useRef(false);

  // Each opening shows the value's month with focus on its day (today's
  // without a value), set before the grid first renders so focus moves in.
  const handleOpenChange = useCallback(
    (next: boolean) => {
      if (next) {
        if (current) {
          setViewYear(current.getFullYear());
          setViewMonth(current.getMonth());
        }
        setFocusedDate(current ?? new Date());
        shouldRefocusRef.current = true;
      }
      setOpen(next);
    },
    [current],
  );

  // A value cleared or replaced while open resets the focused day.
  useEffect(() => {
    if (open) {
      setFocusedDate(current ?? new Date());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current]);

  const isDisabled = (d: Date): boolean => isDayDisabled(d, { min, max, disabledDates });

  const today = startOfDay(new Date());
  const weeks = useMemo(
    () => calendarWeeks({ year: viewYear, month: viewMonth }, calendar.weekStartsOn),
    [viewYear, viewMonth, calendar.weekStartsOn],
  );
  // One day of the grid is in the tab order: the focused one, or the
  // month's first enabled day while that one is not on show.
  const tabStop = calendarTabStop(weeks.flat(), focusedDate, isDisabled);

  // After opening or arrow nav, move actual DOM focus onto the tab stop.
  useEffect(() => {
    if (!open || !shouldRefocusRef.current) return;
    shouldRefocusRef.current = false;
    if (tabStop) dayBtnRefs.current.get(tabStop.iso)?.focus();
  }, [focusedDate, open, tabStop]);

  const pickDate = (d: Date) => {
    if (isDisabled(d)) return;
    setCurrent(startOfDay(d));
    setOpen(false);
  };

  const clear = () => {
    setCurrent(null);
  };

  const goPrev = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };
  const goNext = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const moveFocus = (next: Date) => {
    shouldRefocusRef.current = true;
    setFocusedDate(next);
    // Page the view to the new date's month so the cell exists.
    setViewYear(next.getFullYear());
    setViewMonth(next.getMonth());
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

  const triggerText = current ? formatDate(current) : placeholder;
  const classes = datePickerClasses(surface, { size, invalid: !!error, placeholder: !current });
  const grid = calendarClasses(surface);
  const title = calendarTitle(calendar, { year: viewYear, month: viewMonth });

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
              ref={ref}
              type="button"
              id={triggerId}
              data-testid={dataTestId}
              aria-haspopup="dialog"
              aria-invalid={error ? true : undefined}
              aria-describedby={fieldDescribedBy(triggerId, { hint, error })}
              className={classes.trigger}
            >
              <span className={classes.value}>{triggerText}</span>
              <span aria-hidden className={classes.mark}>
                {current ? '×' : '▾'}
              </span>
            </button>
          </PixelPopover.Trigger>

          <PixelPopover.Content
            surface={surface}
            aria-label="Choose date"
            className={classes.content}
          >
            {presets && presets.length > 0 && (
              <div className={classes.presets}>
                {presets.map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => pickDate(p.value)}
                    className={classes.preset}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            )}

            <div className={grid.header}>
              <button
                type="button"
                aria-label="Previous month"
                onClick={goPrev}
                className={grid.nav}
              >
                ‹
              </button>
              <span className={grid.title} aria-live="polite">
                {title}
              </span>
              <button
                type="button"
                aria-label="Next month"
                onClick={goNext}
                className={grid.nav}
              >
                ›
              </button>
            </div>

            <div
              role="grid"
              aria-label={title}
              className={grid.grid}
              onKeyDown={handleGridKeyDown}
            >
              {/* Column headers belong in a row, like the days below. */}
              <div role="row" className={grid.row}>
                {calendarWeekdays(calendar).map((wd) => (
                  <div key={wd} role="columnheader" className={grid.weekday}>
                    {wd}
                  </div>
                ))}
              </div>
              {weeks.map((week, rowIdx) => (
                <div key={`row-${rowIdx}`} role="row" className={grid.row}>
                  {week.map((cell) => {
                    const disabled = isDisabled(cell.date);
                    const isToday = isSameDay(cell.date, today);
                    const isSelected = current ? isSameDay(cell.date, current) : false;
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
                        onClick={() => pickDate(cell.date)}
                        onFocus={() => setFocusedDate(cell.date)}
                        className={calendarDayClasses(surface, {
                          inMonth: cell.inMonth,
                          selected: isSelected,
                          today: isToday,
                          disabled,
                        })}
                      >
                        {cell.date.getDate()}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>

            {clearable && current && (
              <div className={classes.footer}>
                <button
                  type="button"
                  onClick={clear}
                  className={classes.clear}
                >
                  Clear
                </button>
              </div>
            )}
          </PixelPopover.Content>
        </PixelPopover>

        {name && (
          <input
            type="hidden"
            name={name}
            value={current ? toIsoDate(current) : ''}
            readOnly
          />
        )}
      </span>
    </FieldShell>
  );
});

PixelDatePicker.displayName = 'PixelDatePicker';

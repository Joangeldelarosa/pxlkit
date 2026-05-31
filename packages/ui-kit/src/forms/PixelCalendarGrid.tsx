'use client';

import React, { forwardRef, useCallback, useMemo, useRef, useState } from 'react';
import {
  Surface,
  cn,
  surfaceClasses,
  useEffectiveSurface,
  toneMap,
} from '../common';

/* ──────────────────────────────────────────────────────────────────────────
   Date helpers — pure, no deps. (Mirror PixelDatePicker semantics.)
   ────────────────────────────────────────────────────────────────────────── */

const MONTH_NAMES = [
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

const WEEKDAY_SHORT = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function toISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

function formatDateLabel(d: Date): string {
  return `${MONTH_NAMES[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

interface DayCell {
  date: Date;
  inMonth: boolean;
}

function buildMonthGrid(year: number, month: number): DayCell[] {
  const first = new Date(year, month, 1);
  const firstWeekday = first.getDay();
  const gridStart = new Date(year, month, 1 - firstWeekday);
  const cells: DayCell[] = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(
      gridStart.getFullYear(),
      gridStart.getMonth(),
      gridStart.getDate() + i,
    );
    cells.push({ date: d, inMonth: d.getMonth() === month });
  }
  return cells;
}

/* ──────────────────────────────────────────────────────────────────────────
   PixelCalendarGrid — standalone month grid.
   Usable inline, or composed inside DatePicker / DateRangePicker.
   ────────────────────────────────────────────────────────────────────────── */

export interface PixelCalendarGridProps {
  value?: Date | null;
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
      value,
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
    const s = surfaceClasses(surface);

    // Uncontrolled fallback for month when `month` not provided.
    const initial = month ?? value ?? new Date();
    const [internalMonth, setInternalMonth] = useState<Date>(
      new Date(initial.getFullYear(), initial.getMonth(), 1),
    );
    const viewDate = month ?? internalMonth;
    const viewYear = viewDate.getFullYear();
    const viewMonth = viewDate.getMonth();

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

    const minStart = useMemo(() => (minDate ? startOfDay(minDate) : null), [minDate]);
    const maxStart = useMemo(() => (maxDate ? startOfDay(maxDate) : null), [maxDate]);

    const isDisabled = useCallback(
      (d: Date): boolean => {
        const ds = startOfDay(d);
        if (minStart && ds.getTime() < minStart.getTime()) return true;
        if (maxStart && ds.getTime() > maxStart.getTime()) return true;
        if (Array.isArray(disabledDates)) {
          if (disabledDates.some((x) => sameDay(x, d))) return true;
        } else if (typeof disabledDates === 'function') {
          if (disabledDates(d)) return true;
        }
        return false;
      },
      [minStart, maxStart, disabledDates],
    );

    const today = useMemo(() => startOfDay(new Date()), []);
    const cells = useMemo(
      () => buildMonthGrid(viewYear, viewMonth),
      [viewYear, viewMonth],
    );

    // Roving tabindex anchor.
    const [focusedDate, setFocusedDate] = useState<Date>(
      () => value ?? new Date(viewYear, viewMonth, 1),
    );
    const dayBtnRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
    const shouldRefocusRef = useRef(false);

    React.useEffect(() => {
      if (!shouldRefocusRef.current) return;
      const key = toISO(focusedDate);
      const btn = dayBtnRefs.current.get(key);
      if (btn) {
        btn.focus();
        shouldRefocusRef.current = false;
      }
    }, [focusedDate]);

    const moveFocus = useCallback(
      (deltaDays: number) => {
        setFocusedDate((prev) => {
          const next = new Date(
            prev.getFullYear(),
            prev.getMonth(),
            prev.getDate() + deltaDays,
          );
          shouldRefocusRef.current = true;
          if (
            next.getFullYear() !== viewYear ||
            next.getMonth() !== viewMonth
          ) {
            setView(new Date(next.getFullYear(), next.getMonth(), 1));
          }
          return next;
        });
      },
      [viewYear, viewMonth, setView],
    );

    const jumpFocus = useCallback(
      (next: Date) => {
        shouldRefocusRef.current = true;
        setFocusedDate(next);
        if (
          next.getFullYear() !== viewYear ||
          next.getMonth() !== viewMonth
        ) {
          setView(new Date(next.getFullYear(), next.getMonth(), 1));
        }
      },
      [viewYear, viewMonth, setView],
    );

    const pickDate = (d: Date) => {
      if (isDisabled(d)) return;
      onChange?.(startOfDay(d));
    };

    // Range preview math.
    const previewBounds = useMemo<{ start: Date; end: Date } | null>(() => {
      if (!rangePreview) return null;
      const { from, to, hover } = rangePreview;
      if (!from) return null;
      const second = to ?? hover;
      if (!second) return null;
      const a = startOfDay(from);
      const b = startOfDay(second);
      const start = a.getTime() <= b.getTime() ? a : b;
      const end = a.getTime() <= b.getTime() ? b : a;
      return { start, end };
    }, [rangePreview]);

    const inRange = useCallback(
      (d: Date): boolean => {
        if (!previewBounds) return false;
        const t = startOfDay(d).getTime();
        return (
          t >= previewBounds.start.getTime() && t <= previewBounds.end.getTime()
        );
      },
      [previewBounds],
    );

    const isRangeEndpoint = useCallback(
      (d: Date): boolean => {
        if (!previewBounds) return false;
        return (
          sameDay(d, previewBounds.start) || sameDay(d, previewBounds.end)
        );
      },
      [previewBounds],
    );

    const handleGridKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLDivElement>) => {
        switch (e.key) {
          case 'ArrowLeft':
            e.preventDefault();
            moveFocus(-1);
            return;
          case 'ArrowRight':
            e.preventDefault();
            moveFocus(1);
            return;
          case 'ArrowUp':
            e.preventDefault();
            moveFocus(-7);
            return;
          case 'ArrowDown':
            e.preventDefault();
            moveFocus(7);
            return;
          case 'Home':
            e.preventDefault();
            moveFocus(-focusedDate.getDay());
            return;
          case 'End':
            e.preventDefault();
            moveFocus(6 - focusedDate.getDay());
            return;
          case 'PageUp':
            e.preventDefault();
            jumpFocus(
              new Date(
                focusedDate.getFullYear(),
                focusedDate.getMonth() - 1,
                focusedDate.getDate(),
              ),
            );
            return;
          case 'PageDown':
            e.preventDefault();
            jumpFocus(
              new Date(
                focusedDate.getFullYear(),
                focusedDate.getMonth() + 1,
                focusedDate.getDate(),
              ),
            );
            return;
          case 'Enter':
          case ' ':
            e.preventDefault();
            pickDate(focusedDate);
            return;
          default:
            return;
        }
      },
      [focusedDate, moveFocus, jumpFocus],
    );

    const weekRows = useMemo<DayCell[][]>(() => {
      const rows: DayCell[][] = [];
      for (let i = 0; i < 6; i++) rows.push(cells.slice(i * 7, i * 7 + 7));
      return rows;
    }, [cells]);

    return (
      <div
        ref={ref}
        data-testid={dataTestId}
        className={cn('inline-block', s.font)}
      >
        <div className="mb-2 flex items-center justify-between">
          <button
            type="button"
            aria-label="Previous month"
            onClick={goPrev}
            className={cn(
              'h-7 w-7 inline-flex items-center justify-center',
              s.border,
              s.radius,
              'border-retro-border-strong hover:bg-retro-surface/60',
            )}
          >
            ‹
          </button>
          <span
            className={cn(
              'text-xs font-semibold uppercase tracking-wider text-retro-text',
            )}
            aria-live="polite"
          >
            {MONTH_NAMES[viewMonth]} {viewYear}
          </span>
          <button
            type="button"
            aria-label="Next month"
            onClick={goNext}
            className={cn(
              'h-7 w-7 inline-flex items-center justify-center',
              s.border,
              s.radius,
              'border-retro-border-strong hover:bg-retro-surface/60',
            )}
          >
            ›
          </button>
        </div>

        <div
          role="grid"
          aria-label={`${MONTH_NAMES[viewMonth]} ${viewYear}`}
          className="grid grid-cols-7 gap-0.5"
          onKeyDown={handleGridKeyDown}
        >
          {WEEKDAY_SHORT.map((wd) => (
            <div
              key={wd}
              role="columnheader"
              className="text-center text-[10px] uppercase text-retro-muted py-1"
            >
              {wd}
            </div>
          ))}
          {weekRows.map((week, rowIdx) => (
            <div key={`row-${rowIdx}`} role="row" className="contents">
              {week.map((cell) => {
                const disabled = isDisabled(cell.date);
                const isToday = sameDay(cell.date, today);
                const isSelected = value ? sameDay(cell.date, value) : false;
                const isFocused = sameDay(cell.date, focusedDate);
                const cellInRange = inRange(cell.date);
                const cellEndpoint = isRangeEndpoint(cell.date);
                const iso = toISO(cell.date);
                return (
                  <button
                    key={iso}
                    ref={(node) => {
                      if (node) dayBtnRefs.current.set(iso, node);
                      else dayBtnRefs.current.delete(iso);
                    }}
                    type="button"
                    role="gridcell"
                    aria-label={formatDateLabel(cell.date)}
                    aria-selected={isSelected || undefined}
                    aria-disabled={disabled || undefined}
                    disabled={disabled}
                    tabIndex={isFocused ? 0 : -1}
                    data-in-range={cellInRange || undefined}
                    data-range-endpoint={cellEndpoint || undefined}
                    data-today={isToday || undefined}
                    data-out-of-month={!cell.inMonth || undefined}
                    onClick={() => pickDate(cell.date)}
                    onFocus={() => setFocusedDate(cell.date)}
                    className={cn(
                      'h-8 text-xs inline-flex items-center justify-center',
                      s.radius,
                      'motion-safe:transition-colors',
                      !cell.inMonth && 'text-retro-muted/50',
                      cell.inMonth && !isSelected && 'text-retro-text',
                      cellInRange &&
                        !isSelected &&
                        !cellEndpoint &&
                        cn(toneMap.cyan.soft, toneMap.cyan.text),
                      cellEndpoint &&
                        !isSelected &&
                        cn(toneMap.cyan.bg, toneMap.cyan.text, 'font-semibold'),
                      isSelected &&
                        cn(toneMap.cyan.bg, toneMap.cyan.text, 'font-semibold'),
                      isToday &&
                        !isSelected &&
                        !cellEndpoint &&
                        cn(toneMap.cyan.border, 'border'),
                      disabled && 'opacity-40 line-through cursor-not-allowed',
                      !disabled && !isSelected && !cellEndpoint && 'hover:bg-retro-surface/60',
                    )}
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

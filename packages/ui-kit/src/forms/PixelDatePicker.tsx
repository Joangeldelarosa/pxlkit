'use client';

import React, { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Surface,
  Size,
  cn,
  surfaceClasses,
  useEffectiveSurface,
  FieldShell,
  inputBase,
  focusRing,
  sizeHeight,
  toneMap,
} from '../common';
import { useControllableState } from '../hooks/useControllableState';
import { PixelPopover } from '../overlay-foundation/PixelPopover';

/* ──────────────────────────────────────────────────────────────────────────
   Date helpers — pure, no deps.
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
  const out = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  return out;
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

function defaultFormat(d: Date): string {
  return `${MONTH_NAMES[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

interface DayCell {
  date: Date;
  inMonth: boolean;
}

function buildMonthGrid(year: number, month: number): DayCell[] {
  const first = new Date(year, month, 1);
  const firstWeekday = first.getDay(); // 0=Sun
  // Start grid 'firstWeekday' days before the 1st of the month
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
    format = defaultFormat,
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
  const s = surfaceClasses(surface);

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
  // externally (consumer rerenders with a date in a different month) AND
  // when the popover opens (jump to the value's month on each open).
  const currentTime = current ? current.getTime() : null;
  useEffect(() => {
    if (!current) return;
    setViewYear(current.getFullYear());
    setViewMonth(current.getMonth());
    // Only re-run when the date value's day-instant changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTime]);
  useEffect(() => {
    if (!open || !current) return;
    setViewYear(current.getFullYear());
    setViewMonth(current.getMonth());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Roving tabindex anchor — the date that should currently own focus.
  const [focusedDate, setFocusedDate] = useState<Date>(() => current ?? new Date());
  const dayBtnRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const shouldRefocusRef = useRef(false);

  // Reset focused day when reopening.
  useEffect(() => {
    if (open) {
      setFocusedDate(current ?? new Date());
    }
  }, [open, current]);

  // After arrow nav, move actual DOM focus onto the new focusedDate cell.
  useEffect(() => {
    if (!open || !shouldRefocusRef.current) return;
    const key = toISO(focusedDate);
    const btn = dayBtnRefs.current.get(key);
    if (btn) {
      btn.focus();
      shouldRefocusRef.current = false;
    }
  }, [focusedDate, open]);

  const minStart = useMemo(() => (min ? startOfDay(min) : null), [min]);
  const maxStart = useMemo(() => (max ? startOfDay(max) : null), [max]);

  const isDisabled = (d: Date): boolean => {
    const ds = startOfDay(d);
    if (minStart && ds.getTime() < minStart.getTime()) return true;
    if (maxStart && ds.getTime() > maxStart.getTime()) return true;
    if (Array.isArray(disabledDates)) {
      if (disabledDates.some((x) => sameDay(x, d))) return true;
    } else if (typeof disabledDates === 'function') {
      if (disabledDates(d)) return true;
    }
    return false;
  };

  const today = startOfDay(new Date());
  const cells = useMemo(
    () => buildMonthGrid(viewYear, viewMonth),
    [viewYear, viewMonth],
  );

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

  // Pre-split cells into 6 weeks of 7 days for explicit `role="row"` wrapping.
  const weekRows = useMemo<DayCell[][]>(() => {
    const rows: DayCell[][] = [];
    for (let i = 0; i < 6; i++) rows.push(cells.slice(i * 7, i * 7 + 7));
    return rows;
  }, [cells]);

  const moveFocusedDate = useCallback(
    (deltaDays: number) => {
      setFocusedDate((prev) => {
        const next = new Date(
          prev.getFullYear(),
          prev.getMonth(),
          prev.getDate() + deltaDays,
        );
        shouldRefocusRef.current = true;
        // Page the view to the new date's month so the cell exists.
        setViewYear(next.getFullYear());
        setViewMonth(next.getMonth());
        return next;
      });
    },
    [],
  );

  const jumpFocusedDate = useCallback(
    (next: Date) => {
      shouldRefocusRef.current = true;
      setFocusedDate(next);
      setViewYear(next.getFullYear());
      setViewMonth(next.getMonth());
    },
    [],
  );

  const handleGridKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          moveFocusedDate(-1);
          return;
        case 'ArrowRight':
          e.preventDefault();
          moveFocusedDate(1);
          return;
        case 'ArrowUp':
          e.preventDefault();
          moveFocusedDate(-7);
          return;
        case 'ArrowDown':
          e.preventDefault();
          moveFocusedDate(7);
          return;
        case 'Home':
          e.preventDefault();
          moveFocusedDate(-focusedDate.getDay());
          return;
        case 'End':
          e.preventDefault();
          moveFocusedDate(6 - focusedDate.getDay());
          return;
        case 'PageUp': {
          e.preventDefault();
          jumpFocusedDate(
            new Date(focusedDate.getFullYear(), focusedDate.getMonth() - 1, focusedDate.getDate()),
          );
          return;
        }
        case 'PageDown': {
          e.preventDefault();
          jumpFocusedDate(
            new Date(focusedDate.getFullYear(), focusedDate.getMonth() + 1, focusedDate.getDate()),
          );
          return;
        }
        case 'Enter':
        case ' ': {
          e.preventDefault();
          pickDate(focusedDate);
          return;
        }
        default:
          return;
      }
    },
    [focusedDate, moveFocusedDate, jumpFocusedDate, pickDate],
  );

  const triggerText = current ? format(current) : placeholder;
  const isPlaceholder = !current;

  const triggerClasses = cn(
    inputBase,
    s.font,
    s.border,
    s.radius,
    s.transition,
    sizeHeight[size],
    focusRing,
    toneMap.neutral.ring,
    error ? 'border-retro-red/60' : 'border-retro-border-strong',
    'inline-flex items-center justify-between px-3 text-left',
    isPlaceholder && 'text-retro-muted',
  );

  return (
    <FieldShell label={label} hint={hint} error={error} surface={surface}>
      <span className="relative block">
        <PixelPopover
          open={open}
          onOpenChange={setOpen}
          side="bottom"
          align="start"
          surface={surface}
        >
          <PixelPopover.Trigger>
            <button
              ref={ref}
              type="button"
              id={id}
              data-testid={dataTestId}
              aria-haspopup="dialog"
              aria-invalid={error ? true : undefined}
              className={triggerClasses}
            >
              <span className="truncate">{triggerText}</span>
              <span aria-hidden className="ml-2 text-retro-muted text-xs">
                {current ? '×' : '▾'}
              </span>
            </button>
          </PixelPopover.Trigger>

          <PixelPopover.Content
            surface={surface}
            className={cn('w-[18rem]', s.font)}
          >
            {presets && presets.length > 0 && (
              <div
                className={cn(
                  'mb-2 flex flex-wrap gap-1 pb-2 border-b border-retro-border/60',
                )}
              >
                {presets.map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => pickDate(p.value)}
                    className={cn(
                      'px-2 py-1 text-[11px] uppercase tracking-wide',
                      s.border,
                      s.radius,
                      'border-retro-border-strong bg-retro-surface/40 text-retro-text',
                      'hover:bg-retro-surface/70',
                      s.transition,
                    )}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            )}

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
                    const isSelected = current ? sameDay(cell.date, current) : false;
                    const isFocused = sameDay(cell.date, focusedDate);
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
                        aria-label={defaultFormat(cell.date)}
                        aria-selected={isSelected || undefined}
                        aria-disabled={disabled || undefined}
                        disabled={disabled}
                        tabIndex={isFocused ? 0 : -1}
                        onClick={() => pickDate(cell.date)}
                        onFocus={() => setFocusedDate(cell.date)}
                        className={cn(
                          'h-8 text-xs inline-flex items-center justify-center',
                          s.radius,
                          'motion-safe:transition-colors',
                          !cell.inMonth && 'text-retro-muted/50',
                          cell.inMonth && !isSelected && 'text-retro-text',
                          isSelected && cn(toneMap.cyan.bg, toneMap.cyan.text, 'font-semibold'),
                          isToday && !isSelected && cn(toneMap.cyan.border, 'border'),
                          disabled && 'opacity-40 line-through cursor-not-allowed',
                          !disabled && !isSelected && 'hover:bg-retro-surface/60',
                        )}
                      >
                        {cell.date.getDate()}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>

            {clearable && current && (
              <div className="mt-2 pt-2 border-t border-retro-border/60 flex justify-end">
                <button
                  type="button"
                  onClick={clear}
                  className={cn(
                    'px-2 py-1 text-[11px] uppercase tracking-wide',
                    s.border,
                    s.radius,
                    'border-retro-border-strong text-retro-muted hover:text-retro-text',
                    s.transition,
                  )}
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
            value={current ? toISO(current) : ''}
            readOnly
          />
        )}
      </span>
    </FieldShell>
  );
});

PixelDatePicker.displayName = 'PixelDatePicker';

'use client';

import React, { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Surface,
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

function defaultFormat(d: Date): string {
  return `${MONTH_NAMES[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

function addMonths(year: number, month: number, delta: number): { year: number; month: number } {
  const m = month + delta;
  const y = year + Math.floor(m / 12);
  const mm = ((m % 12) + 12) % 12;
  return { year: y, month: mm };
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
   PixelDateRangePicker
   ────────────────────────────────────────────────────────────────────────── */

export interface DateRangeValue {
  from?: Date;
  to?: Date;
}

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
  focusedDate: Date;
  onFocusDate: (d: Date) => void;
  onMoveFocus: (deltaDays: number) => void;
  onJumpMonth: (delta: number) => void;
}

function CalendarPanel({
  year,
  month,
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
  focusedDate,
  onFocusDate,
  onMoveFocus,
  onJumpMonth,
}: CalendarPanelProps) {
  const s = surfaceClasses(surface);
  const today = startOfDay(new Date());

  // Active "to" used for hover preview when only "from" is set.
  const activeTo = to ?? (from && hover ? hover : undefined);
  const rangeLo = from && activeTo ? (from <= activeTo ? from : activeTo) : null;
  const rangeHi = from && activeTo ? (from <= activeTo ? activeTo : from) : null;

  const cells = useMemo(() => buildMonthGrid(year, month), [year, month]);
  const weekRows = useMemo<DayCell[][]>(() => {
    const rows: DayCell[][] = [];
    for (let i = 0; i < 6; i++) rows.push(cells.slice(i * 7, i * 7 + 7));
    return rows;
  }, [cells]);

  const handleGridKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    switch (e.key) {
      case 'ArrowLeft': e.preventDefault(); onMoveFocus(-1); return;
      case 'ArrowRight': e.preventDefault(); onMoveFocus(1); return;
      case 'ArrowUp': e.preventDefault(); onMoveFocus(-7); return;
      case 'ArrowDown': e.preventDefault(); onMoveFocus(7); return;
      case 'Home': e.preventDefault(); onMoveFocus(-focusedDate.getDay()); return;
      case 'End': e.preventDefault(); onMoveFocus(6 - focusedDate.getDay()); return;
      case 'PageUp': e.preventDefault(); onJumpMonth(-1); return;
      case 'PageDown': e.preventDefault(); onJumpMonth(1); return;
      case 'Enter':
      case ' ':
        e.preventDefault();
        onPick(focusedDate);
        return;
      default: return;
    }
  };

  return (
    <div className="min-w-[16rem]">
      <div className="mb-2 flex items-center justify-between">
        {showPrev ? (
          <button
            type="button"
            aria-label="Previous month"
            onClick={onPrev}
            className={cn(
              'h-7 w-7 inline-flex items-center justify-center',
              s.border,
              s.radius,
              'border-retro-border-strong hover:bg-retro-surface/60',
            )}
          >
            ‹
          </button>
        ) : (
          <span className="h-7 w-7" aria-hidden />
        )}
        <span
          id={panelId}
          className={cn('text-xs font-semibold uppercase tracking-wider text-retro-text')}
          aria-live="polite"
        >
          {MONTH_NAMES[month]} {year}
        </span>
        {showNext ? (
          <button
            type="button"
            aria-label="Next month"
            onClick={onNext}
            className={cn(
              'h-7 w-7 inline-flex items-center justify-center',
              s.border,
              s.radius,
              'border-retro-border-strong hover:bg-retro-surface/60',
            )}
          >
            ›
          </button>
        ) : (
          <span className="h-7 w-7" aria-hidden />
        )}
      </div>

      <div
        role="grid"
        aria-labelledby={panelId}
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
              const isFrom = from ? sameDay(cell.date, from) : false;
              const isTo = to ? sameDay(cell.date, to) : false;
              const isEdge = isFrom || isTo;
              const isFocused = sameDay(cell.date, focusedDate);
              const inRange =
                rangeLo && rangeHi
                  ? cell.date >= startOfDay(rangeLo) && cell.date <= startOfDay(rangeHi)
                  : false;
              const iso = toISO(cell.date);
              return (
                <button
                  key={iso}
                  type="button"
                  role="gridcell"
                  aria-label={defaultFormat(cell.date)}
                  aria-selected={isEdge || undefined}
                  aria-disabled={disabled || undefined}
                  disabled={disabled}
                  tabIndex={isFocused ? 0 : -1}
                  onClick={() => onPick(cell.date)}
                  onMouseEnter={() => setHover(cell.date)}
                  onFocus={() => { setHover(cell.date); onFocusDate(cell.date); }}
                  className={cn(
                    'h-8 text-xs inline-flex items-center justify-center',
                    s.radius,
                    'motion-safe:transition-colors',
                    !cell.inMonth && 'text-retro-muted/50',
                    cell.inMonth && !isEdge && 'text-retro-text',
                    inRange && !isEdge && cn(toneMap.cyan.soft, toneMap.cyan.text),
                    isEdge && cn(toneMap.cyan.bg, toneMap.cyan.text, 'font-semibold'),
                    isToday && !isEdge && cn(toneMap.cyan.border, 'border'),
                    disabled && 'opacity-40 line-through cursor-not-allowed',
                    !disabled && !isEdge && !inRange && 'hover:bg-retro-surface/60',
                  )}
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
  const s = surfaceClasses(surface);

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

  // Jump view to range.from on each open.
  useEffect(() => {
    if (!open) return;
    const anchor = range.from ?? new Date();
    setViewYear(anchor.getFullYear());
    setViewMonth(anchor.getMonth());
    setFocusedDate(startOfDay(anchor));
    setPendingFrom(null);
    setHover(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // After focusedDate change driven by keyboard nav, focus the matching cell.
  useEffect(() => {
    if (!shouldRefocusRef.current) return;
    const iso = toISO(focusedDate);
    // Two panels can render the same focused cell; first one wins.
    const node = document.querySelector(
      `[role="grid"] button[aria-label="${defaultFormat(focusedDate).replace(/"/g, '\\"')}"]`,
    ) as HTMLButtonElement | null;
    if (node) {
      node.focus();
      shouldRefocusRef.current = false;
    }
    // Hush unused-iso lint.
    void iso;
  }, [focusedDate]);

  const moveFocusedDate = useCallback(
    (deltaDays: number) => {
      setFocusedDate((prev) => {
        const next = new Date(prev.getFullYear(), prev.getMonth(), prev.getDate() + deltaDays);
        shouldRefocusRef.current = true;
        // If next date leaves both visible months (left+right), shift the view.
        const leftYM = viewYear * 12 + viewMonth;
        const rightYM = leftYM + 1;
        const nextYM = next.getFullYear() * 12 + next.getMonth();
        const inLeft = nextYM === leftYM;
        const inRight = numberOfMonths === 2 ? nextYM === rightYM : false;
        if (!inLeft && !inRight) {
          setViewYear(next.getFullYear());
          setViewMonth(next.getMonth());
        }
        return next;
      });
    },
    [viewYear, viewMonth, numberOfMonths],
  );

  const jumpFocusedMonth = useCallback(
    (delta: number) => {
      setFocusedDate((prev) => {
        const next = new Date(prev.getFullYear(), prev.getMonth() + delta, prev.getDate());
        shouldRefocusRef.current = true;
        setViewYear(next.getFullYear());
        setViewMonth(next.getMonth());
        return next;
      });
    },
    [],
  );

  const minStart = useMemo(() => (min ? startOfDay(min) : null), [min]);
  const maxStart = useMemo(() => (max ? startOfDay(max) : null), [max]);

  const isDisabled = useCallback(
    (d: Date): boolean => {
      const ds = startOfDay(d);
      if (minStart && ds.getTime() < minStart.getTime()) return true;
      if (maxStart && ds.getTime() > maxStart.getTime()) return true;
      return false;
    },
    [minStart, maxStart],
  );

  const handlePick = useCallback(
    (d: Date) => {
      if (isDisabled(d)) return;
      const day = startOfDay(d);

      if (pendingFrom == null) {
        // First click → reset range to single-anchor.
        setPendingFrom(day);
        setRange({ from: day, to: undefined });
        return;
      }
      // Second click → close range, auto-swap if needed.
      let from = pendingFrom;
      let to = day;
      if (to.getTime() < from.getTime()) {
        const tmp = from;
        from = to;
        to = tmp;
      }
      setRange({ from, to });
      setPendingFrom(null);
      setHover(null);
      setOpen(false);
    },
    [isDisabled, pendingFrom, setRange],
  );

  const handlePreset = useCallback(
    (preset: { from: Date; to: Date }) => {
      const from = startOfDay(preset.from);
      const to = startOfDay(preset.to);
      const ordered =
        from.getTime() <= to.getTime() ? { from, to } : { from: to, to: from };
      setRange(ordered);
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

  const goPrev = () => {
    const next = addMonths(viewYear, viewMonth, -1);
    setViewYear(next.year);
    setViewMonth(next.month);
  };
  const goNext = () => {
    const next = addMonths(viewYear, viewMonth, 1);
    setViewYear(next.year);
    setViewMonth(next.month);
  };

  const triggerLabel = useMemo(() => {
    if (range.from && range.to) {
      return `${defaultFormat(range.from)} → ${defaultFormat(range.to)}`;
    }
    if (range.from) return `${defaultFormat(range.from)} → …`;
    return placeholder;
  }, [range, placeholder]);

  const isPlaceholder = !range.from && !range.to;

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

  const reactId = React.useId();
  const leftPanelId = `${reactId}-left`;
  const rightPanelId = `${reactId}-right`;

  const right = addMonths(viewYear, viewMonth, 1);
  // "Display" range — show pending-from + hover preview while picking.
  const displayFrom = pendingFrom ?? range.from;
  const displayTo = pendingFrom ? undefined : range.to;

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
              <span className="truncate">{triggerLabel}</span>
              {clearable && (range.from || range.to) ? (
                <span
                  role="button"
                  tabIndex={0}
                  aria-label="Clear range"
                  onClick={(e) => { e.stopPropagation(); handleClear(); }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      e.stopPropagation();
                      handleClear();
                    }
                  }}
                  className="ml-2 text-retro-muted hover:text-retro-text text-xs cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-retro-cyan/40 rounded-[2px]"
                >
                  ×
                </span>
              ) : (
                <span aria-hidden className="ml-2 text-retro-muted text-xs">▾</span>
              )}
            </button>
          </PixelPopover.Trigger>

          <PixelPopover.Content
            surface={surface}
            className={cn(
              numberOfMonths === 2 ? 'w-[34rem]' : 'w-[18rem]',
              s.font,
            )}
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
                    onClick={() => handlePreset(p.value)}
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

            <div
              className={cn(
                'grid gap-4',
                numberOfMonths === 2 ? 'grid-cols-2' : 'grid-cols-1',
              )}
            >
              <CalendarPanel
                year={viewYear}
                month={viewMonth}
                from={displayFrom}
                to={displayTo}
                hover={hover}
                setHover={setHover}
                onPick={handlePick}
                isDisabled={isDisabled}
                showPrev
                showNext={numberOfMonths === 1}
                onPrev={goPrev}
                onNext={goNext}
                panelId={leftPanelId}
                surface={surface}
                focusedDate={focusedDate}
                onFocusDate={setFocusedDate}
                onMoveFocus={moveFocusedDate}
                onJumpMonth={jumpFocusedMonth}
              />
              {numberOfMonths === 2 && (
                <CalendarPanel
                  year={right.year}
                  month={right.month}
                  from={displayFrom}
                  to={displayTo}
                  hover={hover}
                  setHover={setHover}
                  onPick={handlePick}
                  isDisabled={isDisabled}
                  showPrev={false}
                  showNext
                  onPrev={goPrev}
                  onNext={goNext}
                  panelId={rightPanelId}
                  surface={surface}
                  focusedDate={focusedDate}
                  onFocusDate={setFocusedDate}
                  onMoveFocus={moveFocusedDate}
                  onJumpMonth={jumpFocusedMonth}
                />
              )}
            </div>

            {clearable && (range.from || range.to) && (
              <div className="mt-2 pt-2 border-t border-retro-border/60 flex justify-end">
                <button
                  type="button"
                  onClick={handleClear}
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
          <>
            <input
              type="hidden"
              name={`${name}.from`}
              value={range.from ? toISO(range.from) : ''}
              readOnly
            />
            <input
              type="hidden"
              name={`${name}.to`}
              value={range.to ? toISO(range.to) : ''}
              readOnly
            />
          </>
        )}
      </span>
    </FieldShell>
  );
});

PixelDateRangePicker.displayName = 'PixelDateRangePicker';

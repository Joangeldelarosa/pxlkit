'use client';

import React, {
  Children,
  forwardRef,
  isValidElement,
  useCallback,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Surface,
  cn,
  surfaceClasses,
  useEffectiveSurface,
} from '../common';
import { PixelPopover } from '../overlay-foundation/PixelPopover';
import { useControllableState } from '../hooks/useControllableState';

/* ──────────────────────────────────────────────────────────────────────────
   PixelBadgeGroup — inline row of badges with +N overflow popover.

   When the number of children exceeds `max`, renders the first `max - 1`
   inline and a "+N" trigger that opens a PixelPopover containing the
   remaining badges. Wraps badges in a horizontally-flowing `flex` row.
   ────────────────────────────────────────────────────────────────────────── */

export interface PixelBadgeGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  max?: number;
  surface?: Surface;
  /**
   * Optional accessible name for the group. When provided, the wrapper renders
   * `role="group"` so SR users can navigate the landmark; otherwise it stays a
   * plain div to avoid an unlabeled group announcement.
   */
  'aria-label'?: string;
  'aria-labelledby'?: string;
  children: React.ReactNode;
}

export const PixelBadgeGroup = forwardRef<HTMLDivElement, PixelBadgeGroupProps>(
  function PixelBadgeGroup(
    { max = 5, surface: surfaceProp, className, children, ...rest },
    ref,
  ) {
    const surface = useEffectiveSurface(surfaceProp);
    const s = surfaceClasses(surface);
    const [open, setOpen] = useState(false);

    const items = Children.toArray(children).filter(isValidElement);
    const count = items.length;
    const overflowing = count > max;
    const visibleCount = overflowing ? Math.max(0, max - 1) : count;
    const visible = items.slice(0, visibleCount);
    const hidden = items.slice(visibleCount);
    const remainder = hidden.length;

    const ariaLabel = (rest as { 'aria-label'?: string })['aria-label'];
    const ariaLabelledBy = (rest as { 'aria-labelledby'?: string })['aria-labelledby'];
    const hasName = !!(ariaLabel || ariaLabelledBy);

    return (
      <div
        ref={ref}
        role={hasName ? 'group' : undefined}
        className={cn('inline-flex flex-row flex-wrap items-center gap-1.5', className)}
        {...rest}
      >
        {visible.map((child, idx) => (
          <React.Fragment key={(child as React.ReactElement).key ?? idx}>
            {child}
          </React.Fragment>
        ))}
        {overflowing && (
          <PixelPopover
            open={open}
            onOpenChange={setOpen}
            surface={surface}
            haspopup="dialog"
            role="dialog"
          >
            <PixelPopover.Trigger>
              <button
                type="button"
                aria-label={`Show ${remainder} more`}
                className={cn(
                  'inline-flex items-center px-2.5 py-1 text-[11px] leading-none',
                  'bg-retro-surface/40 text-retro-text border-retro-border',
                  'transition-colors hover:bg-retro-surface/70',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-retro-cyan/60',
                  s.border,
                  s.radiusFull,
                  s.font,
                )}
              >
                {`+${remainder}`}
              </button>
            </PixelPopover.Trigger>
            <PixelPopover.Content surface={surface}>
              <div className="flex flex-row flex-wrap items-center gap-1.5 max-w-xs">
                {hidden.map((child, idx) => (
                  <React.Fragment key={(child as React.ReactElement).key ?? idx}>
                    {child}
                  </React.Fragment>
                ))}
              </div>
            </PixelPopover.Content>
          </PixelPopover>
        )}
      </div>
    );
  },
);

PixelBadgeGroup.displayName = 'PixelBadgeGroup';

/* ──────────────────────────────────────────────────────────────────────────
   PixelChipGroup — controlled filter chip row with single/multi selection.

   Each child must declare a `value` prop. The group wraps each child in a
   role=radio (single) or role=checkbox (multi) button so the chip surface
   stays purely presentational while the wrapper owns the toggle semantics.
   Keyboard: Tab moves between chips; Space/Enter activates.
   ────────────────────────────────────────────────────────────────────────── */

interface ChipChildProps {
  value: string;
}

export interface PixelChipGroupProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
  /** Controlled selection. */
  value?: string[];
  /** Uncontrolled initial selection. */
  defaultValue?: string[];
  onChange?: (next: string[]) => void;
  multiple?: boolean;
  surface?: Surface;
  /** Accessible name (required when single-select so SR users hear the group). */
  'aria-label'?: string;
  'aria-labelledby'?: string;
  children: React.ReactNode;
}

export const PixelChipGroup = forwardRef<HTMLDivElement, PixelChipGroupProps>(
  function PixelChipGroup(
    {
      value: valueProp,
      defaultValue,
      onChange,
      multiple = false,
      surface: surfaceProp,
      className,
      children,
      ...rest
    },
    ref,
  ) {
    const surface = useEffectiveSurface(surfaceProp);
    const s = surfaceClasses(surface);
    const [value, setValue] = useControllableState<string[]>({
      value: valueProp,
      defaultValue: defaultValue ?? [],
      onChange,
    });

    const toggle = (chipValue: string) => {
      const current = value ?? [];
      const isSelected = current.includes(chipValue);
      let next: string[];
      if (multiple) {
        next = isSelected
          ? current.filter((v) => v !== chipValue)
          : [...current, chipValue];
      } else {
        next = isSelected ? [] : [chipValue];
      }
      setValue(next);
    };

    const items = Children.toArray(children).filter(isValidElement);

    // Collect ordered radio values for roving tabindex + arrow nav (single mode).
    const radioValues = useMemo(() => {
      const out: string[] = [];
      for (const child of items) {
        const el = child as React.ReactElement<ChipChildProps>;
        const v = el.props?.value;
        if (typeof v === 'string') out.push(v);
      }
      return out;
    }, [items]);

    const btnRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
    const setBtnRef = useCallback((val: string, el: HTMLButtonElement | null) => {
      if (el) btnRefs.current.set(val, el);
      else btnRefs.current.delete(val);
    }, []);
    const selectedRadio = !multiple ? ((value ?? [])[0] ?? null) : null;
    const focusableRadio = selectedRadio ?? radioValues[0] ?? null;

    const moveRadio = useCallback(
      (current: string, direction: 1 | -1 | 'first' | 'last') => {
        if (radioValues.length === 0) return;
        let nextIdx: number;
        if (direction === 'first') nextIdx = 0;
        else if (direction === 'last') nextIdx = radioValues.length - 1;
        else {
          const idx = radioValues.indexOf(current);
          if (idx === -1) return;
          nextIdx = Math.max(0, Math.min(radioValues.length - 1, idx + direction));
        }
        const nextVal = radioValues[nextIdx];
        btnRefs.current.get(nextVal)?.focus();
        // In radiogroup pattern, arrow key both focuses AND selects.
        toggle(nextVal);
      },
      // toggle is stable across renders of the same value/onChange combo; we
      // re-create the callback per radio order/value change anyway.
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [radioValues],
    );

    const ariaLabel = (rest as { 'aria-label'?: string })['aria-label'];
    const ariaLabelledBy = (rest as { 'aria-labelledby'?: string })['aria-labelledby'];
    const hasName = !!(ariaLabel || ariaLabelledBy);

    return (
      <div
        ref={ref}
        role={multiple ? (hasName ? 'group' : undefined) : 'radiogroup'}
        className={cn('inline-flex flex-row flex-wrap items-center gap-1.5', className)}
        {...rest}
      >
        {items.map((child, idx) => {
          const el = child as React.ReactElement<ChipChildProps>;
          const chipValue = el.props?.value;
          if (typeof chipValue !== 'string') {
            return (
              <React.Fragment key={el.key ?? idx}>
                {el}
              </React.Fragment>
            );
          }
          const selected = (value ?? []).includes(chipValue);
          const handleClick = () => toggle(chipValue);
          const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              toggle(chipValue);
              return;
            }
            if (!multiple) {
              switch (e.key) {
                case 'ArrowRight':
                case 'ArrowDown':
                  e.preventDefault(); moveRadio(chipValue, 1); return;
                case 'ArrowLeft':
                case 'ArrowUp':
                  e.preventDefault(); moveRadio(chipValue, -1); return;
                case 'Home':
                  e.preventDefault(); moveRadio(chipValue, 'first'); return;
                case 'End':
                  e.preventDefault(); moveRadio(chipValue, 'last'); return;
                default: return;
              }
            }
          };
          // Single-mode roving tabindex: only the selected (or first) radio is
          // Tab-reachable; others -1.
          const rovingTabIndex = !multiple
            ? (chipValue === focusableRadio ? 0 : -1)
            : undefined;
          return (
            <button
              key={el.key ?? idx}
              ref={(node) => setBtnRef(chipValue, node)}
              type="button"
              role={multiple ? 'checkbox' : 'radio'}
              aria-checked={selected}
              tabIndex={rovingTabIndex}
              data-value={chipValue}
              data-selected={selected ? 'true' : 'false'}
              onClick={handleClick}
              onKeyDown={handleKeyDown}
              className={cn(
                'inline-flex items-center transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-retro-cyan/60',
                s.radius,
                selected && 'ring-2 ring-retro-cyan/60',
              )}
            >
              {el}
            </button>
          );
        })}
      </div>
    );
  },
);

PixelChipGroup.displayName = 'PixelChipGroup';

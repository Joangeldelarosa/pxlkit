'use client';

import React, {
  Children,
  forwardRef,
  isValidElement,
  useCallback,
  useRef,
} from 'react';
import {
  chipGroupClasses,
  chipGroupItemClasses,
  chipGroupKeyAction,
  chipGroupMove,
  chipGroupRole,
  chipGroupTabStop,
  toggleChipSelection,
  type ChipGroupMove,
} from '@pxlkit/ui-kit-core';
import {
  Surface,
  cn,
  useEffectiveSurface,
} from '../common';
import { useControllableState } from '../hooks/useControllableState';

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
    const [value, setValue] = useControllableState<string[]>({
      value: valueProp,
      defaultValue: defaultValue ?? [],
      onChange,
    });
    const selection = value ?? [];

    const toggle = (chipValue: string) => setValue(toggleChipSelection(selection, chipValue, multiple));

    const items = Children.toArray(children).filter(isValidElement);

    // Ordered radio values for roving tabindex + arrow nav (single mode).
    const radioValues: string[] = [];
    for (const child of items) {
      const v = (child as React.ReactElement<ChipChildProps>).props?.value;
      if (typeof v === 'string') radioValues.push(v);
    }

    const btnRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
    const setBtnRef = useCallback((val: string, el: HTMLButtonElement | null) => {
      if (el) btnRefs.current.set(val, el);
      else btnRefs.current.delete(val);
    }, []);
    const focusableRadio = multiple ? undefined : chipGroupTabStop(radioValues, selection);

    // In the radiogroup pattern an arrow key both focuses AND selects.
    const moveRadio = (current: string, direction: ChipGroupMove) => {
      const move = chipGroupMove(radioValues, selection, current, direction);
      if (!move) return;
      btnRefs.current.get(move.focus)?.focus();
      if (move.selection) setValue(move.selection);
    };

    const ariaLabel = (rest as { 'aria-label'?: string })['aria-label'];
    const ariaLabelledBy = (rest as { 'aria-labelledby'?: string })['aria-labelledby'];
    const hasName = !!(ariaLabel || ariaLabelledBy);

    return (
      <div
        ref={ref}
        role={chipGroupRole(multiple, hasName)}
        className={cn(chipGroupClasses, className)}
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
          const selected = selection.includes(chipValue);
          const handleClick = () => toggle(chipValue);
          const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
            const action = chipGroupKeyAction(e.key, multiple);
            if (action === undefined) return;
            e.preventDefault();
            if (action === 'toggle') toggle(chipValue);
            else moveRadio(chipValue, action);
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
              className={chipGroupItemClasses(surface, selected)}
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

'use client';

import React, {
  createContext,
  forwardRef,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import {
  toggleGroupClasses,
  toggleGroupEmptyValue,
  toggleGroupIsPressed,
  toggleGroupKeyMove,
  toggleGroupMoveTarget,
  toggleGroupRole,
  toggleGroupToggle,
  type ToggleGroupMove,
  type ToggleGroupSize,
  type ToggleGroupVariant,
} from '@pxlkit/ui-kit-core';
import {
  Surface,
  cn,
  useEffectiveSurface,
} from '../common';
import { useControllableState } from '../hooks/useControllableState';

export type GroupSize = ToggleGroupSize;
export type GroupVariant = ToggleGroupVariant;

export interface ToggleGroupContextValue {
  type: 'single' | 'multiple';
  value: string | string[];
  isPressed: (value: string) => boolean;
  toggleValue: (value: string) => void;
  registerItem: (el: HTMLButtonElement | null, value: string) => void;
  unregisterItem: (value: string) => void;
  onItemKeyDown: (e: React.KeyboardEvent<HTMLButtonElement>, value: string) => void;
  rovingFocus: boolean;
  focusedValue: string | null;
  size: GroupSize;
  variant: GroupVariant;
  surface: Surface;
}

export const ToggleGroupContext = createContext<ToggleGroupContextValue | null>(null);

// PixelToggle moved to its own file; re-exported so this module's API
// stays unchanged. Keep this re-export BELOW the ToggleGroupContext
// definition — PixelToggle.tsx imports the context back from this module
// (intentional cycle), so the context must be initialized first.
export { PixelToggle, type PixelToggleProps } from './PixelToggle';

/** Shared props (no value/onChange — those vary by discriminator). */
interface PixelToggleGroupSharedProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** Only one toggle is in the tab order; the arrow keys, Home and End move between them. */
  rovingFocus?: boolean;
  /** The arrow keys wrap from the last toggle to the first and back. */
  loop?: boolean;
  /** Size of the toggles. */
  size?: GroupSize;
  /** Variant of the toggles. */
  variant?: GroupVariant;
  /** Surface of the toggles; defaults to the nearest provider. */
  surface?: Surface;
  /** Accessible label for the toolbar / radiogroup. */
  'aria-label'?: string;
  /** The `PixelToggle`s. */
  children: React.ReactNode;
}

interface PixelToggleGroupSingleProps extends PixelToggleGroupSharedProps {
  /**
   * `single`: one value, a radiogroup of radios; `multiple`: any number of values, pressed buttons.
   */
  type?: 'single';
  /**
   * Value: a string in single mode (`''` for none), an array in multiple mode; leave unset for an
   * uncontrolled group.
   */
  value?: string;
  /** Initial value while uncontrolled; nothing pressed by default. */
  defaultValue?: string;
  /** Called with the new value, after each press. */
  onChange?: (next: string) => void;
}

interface PixelToggleGroupMultipleProps extends PixelToggleGroupSharedProps {
  /**
   * `single`: one value, a radiogroup of radios; `multiple`: any number of values, pressed buttons.
   */
  type: 'multiple';
  /**
   * Value: a string in single mode (`''` for none), an array in multiple mode; leave unset for an
   * uncontrolled group.
   */
  value?: string[];
  /** Initial value while uncontrolled; nothing pressed by default. */
  defaultValue?: string[];
  /** Called with the new value, after each press. */
  onChange?: (next: string[]) => void;
}

/**
 * Public prop bag for {@link PixelToggleGroup}. Discriminated by `type`:
 *
 * - `type` omitted or `'single'` → value/onChange are `string`.
 * - `type='multiple'` → value/onChange are `string[]`.
 */
export type PixelToggleGroupProps =
  | PixelToggleGroupSingleProps
  | PixelToggleGroupMultipleProps;

// Internal widened shape used inside the component body so destructuring works.
// The public PixelToggleGroupProps stays a discriminated union (better DX).
interface _InternalToggleGroupProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  type?: 'single' | 'multiple';
  value?: string | string[];
  defaultValue?: string | string[];
  onChange?: (next: string | string[]) => void;
  rovingFocus?: boolean;
  loop?: boolean;
  size?: GroupSize;
  variant?: GroupVariant;
  surface?: Surface;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  children: React.ReactNode;
}

export const PixelToggleGroup = forwardRef<HTMLDivElement, PixelToggleGroupProps>(
  function PixelToggleGroup(props, ref) {
    const {
      type = 'single',
      value,
      defaultValue,
      onChange,
      rovingFocus = false,
      loop = false,
      size = 'md',
      variant = 'soft',
      surface: surfaceProp,
      className,
      children,
      ...rest
    } = props as _InternalToggleGroupProps;
    const surface = useEffectiveSurface(surfaceProp);

    const resolvedDefault = defaultValue !== undefined ? defaultValue : toggleGroupEmptyValue(type);

    const [internalValue, setInternalValue] = useControllableState<string | string[]>({
      value,
      defaultValue: resolvedDefault,
      onChange,
    });

    const itemsRef = useRef<Map<string, HTMLButtonElement>>(new Map());
    const orderRef = useRef<string[]>([]);
    const focusedValueRef = useRef<string | null>(null);
    const [focusedValue, setFocusedValue] = React.useState<string | null>(null);

    const registerItem = useCallback((el: HTMLButtonElement | null, val: string) => {
      if (el) {
        itemsRef.current.set(val, el);
        if (!orderRef.current.includes(val)) orderRef.current.push(val);
        // Seed first focusable on first registration
        if (focusedValueRef.current === null) {
          focusedValueRef.current = val;
          setFocusedValue(val);
        }
      }
    }, []);

    const unregisterItem = useCallback((val: string) => {
      itemsRef.current.delete(val);
      orderRef.current = orderRef.current.filter((v) => v !== val);
      if (focusedValueRef.current === val) {
        focusedValueRef.current = orderRef.current[0] ?? null;
        setFocusedValue(focusedValueRef.current);
      }
    }, []);

    const isPressed = useCallback(
      (val: string) => toggleGroupIsPressed(type, internalValue, val),
      [type, internalValue],
    );

    const toggleValue = useCallback(
      // Single mode: clicking the pressed item unsets it.
      (val: string) => setInternalValue(toggleGroupToggle(type, internalValue, val)),
      [type, internalValue, setInternalValue],
    );

    const moveFocus = useCallback(
      (currentValue: string, direction: ToggleGroupMove) => {
        const nextValue = toggleGroupMoveTarget(orderRef.current, currentValue, direction, loop);
        if (nextValue === undefined) return;
        const nextEl = itemsRef.current.get(nextValue);
        if (nextEl) {
          focusedValueRef.current = nextValue;
          setFocusedValue(nextValue);
          nextEl.focus();
        }
      },
      [loop],
    );

    const onItemKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLButtonElement>, val: string) => {
        const move = toggleGroupKeyMove(e.key);
        if (move === undefined) return;
        e.preventDefault();
        moveFocus(val, move);
      },
      [moveFocus],
    );

    const ctxValue = useMemo<ToggleGroupContextValue>(
      () => ({
        type,
        value: internalValue,
        isPressed,
        toggleValue,
        registerItem,
        unregisterItem,
        onItemKeyDown,
        rovingFocus,
        focusedValue,
        size,
        variant,
        surface,
      }),
      [
        type,
        internalValue,
        isPressed,
        toggleValue,
        registerItem,
        unregisterItem,
        onItemKeyDown,
        rovingFocus,
        focusedValue,
        size,
        variant,
        surface,
      ],
    );

    const ariaLabel = (rest as { 'aria-label'?: string })['aria-label'];
    const ariaLabelledBy = (rest as { 'aria-labelledby'?: string })['aria-labelledby'];
    // Single mode = radiogroup; multi = toolbar group. Group needs an
    // accessible name to be exposed at all — fall back to no role if unnamed
    // and multi-select (keeps the SR tree clean instead of announcing "group").
    const wrapperRole = toggleGroupRole(type, !!(ariaLabel || ariaLabelledBy));

    return (
      <div
        ref={ref}
        role={wrapperRole}
        className={cn(toggleGroupClasses, className)}
        {...rest}
      >
        <ToggleGroupContext.Provider value={ctxValue}>
          {children}
        </ToggleGroupContext.Provider>
      </div>
    );
  },
);

PixelToggleGroup.displayName = 'PixelToggleGroup';

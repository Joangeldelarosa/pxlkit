'use client';

import React, {
  createContext,
  forwardRef,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import {
  Surface,
  Variant,
  cn,
  useEffectiveSurface,
} from '../common';
import { useControllableState } from '../hooks/useControllableState';

export type GroupSize = 'sm' | 'md' | 'lg';
export type GroupVariant = Extract<Variant, 'solid' | 'soft' | 'outline' | 'ghost'>;

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
// stays unchanged.
export { PixelToggle, type PixelToggleProps } from './PixelToggle';

/** Shared props (no value/onChange — those vary by discriminator). */
interface PixelToggleGroupSharedProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  rovingFocus?: boolean;
  loop?: boolean;
  size?: GroupSize;
  variant?: GroupVariant;
  surface?: Surface;
  /** Accessible label for the toolbar / radiogroup. */
  'aria-label'?: string;
  children: React.ReactNode;
}

interface PixelToggleGroupSingleProps extends PixelToggleGroupSharedProps {
  type?: 'single';
  value?: string;
  defaultValue?: string;
  onChange?: (next: string) => void;
}

interface PixelToggleGroupMultipleProps extends PixelToggleGroupSharedProps {
  type: 'multiple';
  value?: string[];
  defaultValue?: string[];
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

    const resolvedDefault =
      defaultValue !== undefined ? defaultValue : type === 'multiple' ? [] : '';

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
      (val: string) => {
        if (type === 'multiple') {
          return Array.isArray(internalValue) && internalValue.includes(val);
        }
        return internalValue === val;
      },
      [type, internalValue],
    );

    const toggleValue = useCallback(
      (val: string) => {
        if (type === 'multiple') {
          const current = Array.isArray(internalValue) ? internalValue : [];
          const next = current.includes(val)
            ? current.filter((v) => v !== val)
            : [...current, val];
          setInternalValue(next);
        } else {
          // Single mode: clicking pressed item unsets it
          const next = internalValue === val ? '' : val;
          setInternalValue(next);
        }
      },
      [type, internalValue, setInternalValue],
    );

    const moveFocus = useCallback(
      (currentValue: string, direction: 1 | -1 | 'first' | 'last') => {
        const order = orderRef.current;
        if (order.length === 0) return;
        let nextIndex: number;
        if (direction === 'first') {
          nextIndex = 0;
        } else if (direction === 'last') {
          nextIndex = order.length - 1;
        } else {
          const idx = order.indexOf(currentValue);
          if (idx === -1) return;
          nextIndex = idx + direction;
          if (loop) {
            nextIndex = (nextIndex + order.length) % order.length;
          } else {
            nextIndex = Math.max(0, Math.min(order.length - 1, nextIndex));
          }
        }
        const nextValue = order[nextIndex];
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
        switch (e.key) {
          case 'ArrowRight':
          case 'ArrowDown':
            e.preventDefault();
            moveFocus(val, 1);
            break;
          case 'ArrowLeft':
          case 'ArrowUp':
            e.preventDefault();
            moveFocus(val, -1);
            break;
          case 'Home':
            e.preventDefault();
            moveFocus(val, 'first');
            break;
          case 'End':
            e.preventDefault();
            moveFocus(val, 'last');
            break;
          default:
            break;
        }
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
    const hasName = !!(ariaLabel || ariaLabelledBy);
    // Single mode = radiogroup; multi = toolbar group. Group needs an
    // accessible name to be exposed at all — fall back to no role if unnamed
    // and multi-select (keeps the SR tree clean instead of announcing "group").
    const wrapperRole = type === 'single' ? 'radiogroup' : (hasName ? 'group' : undefined);

    return (
      <div
        ref={ref}
        role={wrapperRole}
        className={cn('inline-flex items-center gap-1', className)}
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

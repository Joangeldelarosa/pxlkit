import { useCallback, useRef, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';

export interface UseControllableStateOptions<T> {
  value?: T;
  defaultValue?: T;
  onChange?: (next: T) => void;
}

/**
 * Hook for a value that may be either controlled (`value` prop set) or
 * uncontrolled (use `defaultValue`). The returned setter is
 * `Dispatch<SetStateAction<T>>` so it plugs into any React API that expects
 * a state setter.
 *
 * Overloads:
 * - If `value` is `T | undefined` (i.e. potentially uncontrolled), the
 *   `defaultValue` is required — otherwise the hook would return
 *   `undefined` pretending to be `T`.
 * - If `value` is explicitly `T`, `defaultValue` is optional.
 */
export function useControllableState<T>(
  opts: { value: T; defaultValue?: T; onChange?: (next: T) => void },
): readonly [T, Dispatch<SetStateAction<T>>];
export function useControllableState<T>(
  opts: { value?: T; defaultValue: T; onChange?: (next: T) => void },
): readonly [T, Dispatch<SetStateAction<T>>];
export function useControllableState<T>(
  opts: UseControllableStateOptions<T>,
): readonly [T, Dispatch<SetStateAction<T>>] {
  const { value, defaultValue, onChange } = opts;
  const isControlled = value !== undefined;

  const [internal, setInternal] = useState<T | undefined>(defaultValue);

  const current = (isControlled ? value : internal) as T;

  const currentRef = useRef(current);
  currentRef.current = current;

  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const isControlledRef = useRef(isControlled);
  isControlledRef.current = isControlled;

  const setValue = useCallback<Dispatch<SetStateAction<T>>>((next) => {
    const resolved =
      typeof next === 'function'
        ? (next as (prev: T) => T)(currentRef.current)
        : next;

    if (!isControlledRef.current) {
      setInternal(resolved);
    }

    onChangeRef.current?.(resolved);
  }, []);

  return [current, setValue] as const;
}

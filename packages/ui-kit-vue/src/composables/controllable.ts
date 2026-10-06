import { computed, ref, type Ref } from 'vue';

export interface UseControllableStateOptions<T> {
  /** The controlling prop — `undefined` leaves the state uncontrolled. */
  value: () => T | undefined;
  /** Initial value while uncontrolled. */
  defaultValue: () => T;
  /** Called with every new value (the `update:*` emit). */
  onChange?: (next: T) => void;
}

/**
 * State that is either controlled by a prop (bound with `v-model`, or passed
 * one-way) or, when the prop is left out, kept locally from `defaultValue` —
 * the Vue counterpart of the React kit's `useControllableState`.
 *
 * The setter always reports the new value through `onChange`; it changes the
 * local value only while uncontrolled, so a controlled component shows
 * whatever its parent passes. Like React's state setter it also takes an
 * updater function.
 *
 * Props tracked here must default to `undefined` (for booleans:
 * `{ type: Boolean, default: undefined }`), or "left out" cannot be told
 * apart from "passed".
 */
export function useControllableState<T>(
  options: UseControllableStateOptions<T>,
): readonly [Readonly<Ref<T>>, (next: T | ((prev: T) => T)) => void] {
  const local = ref(options.defaultValue()) as Ref<T>;
  const state = computed<T>(() => {
    const controlled = options.value();
    return controlled === undefined ? local.value : controlled;
  });
  const setState = (next: T | ((prev: T) => T)) => {
    const resolved = typeof next === 'function' ? (next as (prev: T) => T)(state.value) : next;
    if (options.value() === undefined) local.value = resolved;
    options.onChange?.(resolved);
  };
  return [state, setState] as const;
}

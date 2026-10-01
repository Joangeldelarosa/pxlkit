import { booleanAttribute, numberAttribute } from '@angular/core';

// Input transforms. As with the React and Vue components, an optional input
// bound to `undefined` (or `null`) behaves as if it were not set at all.

/** Optional input with a default: unset falls back to `fallback`. */
export function withDefault<T>(fallback: T): (value: T | undefined) => T {
  return (value) => value ?? fallback;
}

/**
 * Number with a default: accepts numbers and numeric attribute strings
 * (`size="48"`); unset or non-numeric values fall back to `fallback`.
 */
export function numberOr(fallback: number): (value: unknown) => number {
  return (value) => numberAttribute(value, fallback);
}

/**
 * Boolean with a default, coerced like `booleanAttribute` — a bare attribute
 * (`interactive`) reads as `true`, `"false"` as `false`; unset falls back to
 * `fallback`.
 */
export function booleanOr(fallback: boolean): (value: unknown) => boolean {
  return (value) => (value == null ? fallback : booleanAttribute(value));
}

/**
 * Optional number without a default: unset, empty or non-numeric values stay
 * `undefined`, which tells the engine to derive the value.
 */
export function optionalNumber(value: unknown): number | undefined {
  const number = numberAttribute(value, Number.NaN);
  return Number.isNaN(number) ? undefined : number;
}

/**
 * Tri-state boolean: unset stays `undefined` ("no override"); anything else
 * is coerced like `booleanAttribute`, so a bare `playing` attribute reads as
 * `true`.
 */
export function optionalBoolean(value: unknown): boolean | undefined {
  return value == null ? undefined : booleanAttribute(value);
}

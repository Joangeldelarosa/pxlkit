import { numberAttribute } from '@angular/core';
import type { AnimationRepeat } from '@pxlkit/ui-kit-core';

/**
 * `repeat` input: `'infinite'`, or a count — numeric attribute strings
 * (`repeat="3"`) included; unset or anything else falls back to `fallback`.
 */
export function repeatOr(
  fallback: AnimationRepeat,
): (value: AnimationRepeat | `${number}` | undefined) => AnimationRepeat {
  return (value) => {
    if (value === 'infinite') return value;
    const count = numberAttribute(value, Number.NaN);
    return Number.isNaN(count) ? fallback : count;
  };
}

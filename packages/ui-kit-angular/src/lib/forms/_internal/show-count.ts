import type { ShowCount } from '@pxlkit/ui-kit-core';

/** `showCount` input transform: a bare `showCount` attribute counts characters. */
export function showCountAttribute(value: ShowCount | '' | undefined): ShowCount {
  return value === '' ? true : (value ?? false);
}

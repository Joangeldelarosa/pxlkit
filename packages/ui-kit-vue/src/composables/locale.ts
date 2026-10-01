import { createLocaleContextValue, type PxlKitLocaleContextValue } from '@pxlkit/ui-kit-core';
import { computed, inject, type ComputedRef, type InjectionKey } from 'vue';

/** Injection key of the locale set by the nearest `PxlKitLocaleProvider`. */
export const PXLKIT_LOCALE: InjectionKey<ComputedRef<PxlKitLocaleContextValue>> = Symbol('pxlkit-locale');

const ENGLISH = createLocaleContextValue('en');

/**
 * The locale of the nearest `PxlKitLocaleProvider` (English without one):
 * `locale`, locale-aware `upper` / `lower` and the matching Google Fonts URL.
 *
 * @example
 * const locale = usePxlKitLocale();
 * locale.value.upper('istanbul'); // "İSTANBUL" under <PxlKitLocaleProvider locale="tr">
 */
export function usePxlKitLocale(): ComputedRef<PxlKitLocaleContextValue> {
  const provided = inject(PXLKIT_LOCALE, null);
  return computed(() => provided?.value ?? ENGLISH);
}

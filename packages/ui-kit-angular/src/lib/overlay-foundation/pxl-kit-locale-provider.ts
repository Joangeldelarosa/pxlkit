import {
  ChangeDetectionStrategy,
  Component,
  InjectionToken,
  computed,
  inject,
  input,
  type Signal,
} from '@angular/core';
import { createLocaleContextValue, type PxlKitLocale, type PxlKitLocaleContextValue } from '@pxlkit/ui-kit-core';
import { withDefault } from '../_internal/coercion';

/** The locale every nested Pxlkit component uses. */
export const PXLKIT_LOCALE = new InjectionToken<Signal<PxlKitLocaleContextValue>>('PXLKIT_LOCALE');

const ENGLISH = createLocaleContextValue('en');

/**
 * Locale-aware text handling for every Pxlkit component inside:
 *
 * 1. Sets `lang` on the host (`display: contents`, so it does not affect
 *    layout), which makes CSS `text-transform: uppercase` handle the Turkish
 *    `i → İ` correctly.
 * 2. Provides `injectPxlKitLocale()`: locale-aware `upper()` / `lower()` and
 *    the Google Fonts URL with the subsets the locale needs (`fontsUrl`).
 *
 * For server-rendered apps, also set `lang` on `<html>`.
 *
 * @example
 * <pxl-locale-provider locale="tr">…</pxl-locale-provider>
 */
@Component({
  selector: 'pxl-locale-provider',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: PXLKIT_LOCALE, useFactory: () => inject(PxlKitLocaleProvider).context }],
  host: {
    '[attr.lang]': 'locale()',
    '[style.display]': '"contents"',
  },
  template: '<ng-content />',
})
export class PxlKitLocaleProvider {
  /** BCP 47 locale tag. */
  readonly locale = input<PxlKitLocale, PxlKitLocale | undefined>('en', { transform: withDefault<PxlKitLocale>('en') });

  /** @internal */
  readonly context: Signal<PxlKitLocaleContextValue> = computed(() => createLocaleContextValue(this.locale()));
}

/**
 * The locale of the nearest `<pxl-locale-provider>` (English without one):
 * `locale`, locale-aware `upper` / `lower` and the matching Google Fonts URL.
 */
export function injectPxlKitLocale(): Signal<PxlKitLocaleContextValue> {
  const provided = inject(PXLKIT_LOCALE, { optional: true });
  return computed(() => provided?.() ?? ENGLISH);
}

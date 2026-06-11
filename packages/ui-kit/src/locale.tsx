'use client';

/**
 * Back-compat shim (Ola 4e). The locale system moved next to its manifest:
 * `overlay-foundation/PxlKitLocaleProvider.tsx` now owns the provider,
 * context, `usePxlKitLocale`, font config, and text utilities. This module
 * re-exports the full original `./locale` API so existing imports keep
 * working unchanged.
 */
export {
  PxlKitLocaleProvider,
  usePxlKitLocale,
  buildGoogleFontsUrl,
  toLocaleUpper,
  toLocaleLower,
  PXLKIT_FONTS,
  TURKISH_CHARACTERS,
  type PxlKitLocale,
  type PxlKitFontConfig,
  type PxlKitLocaleProviderProps,
} from './overlay-foundation/PxlKitLocaleProvider';

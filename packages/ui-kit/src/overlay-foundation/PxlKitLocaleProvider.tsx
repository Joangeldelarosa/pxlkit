'use client';

import React, { createContext, useContext, useMemo } from 'react';
import { createLocaleContextValue, type PxlKitLocale, type PxlKitLocaleContextValue } from '@pxlkit/ui-kit-core';

// Locale data and text helpers are framework-neutral and shared with the Vue
// and Angular kits; this module adds the React context and provider.
export {
  PXLKIT_FONTS,
  TURKISH_CHARACTERS,
  buildGoogleFontsUrl,
  toLocaleLower,
  toLocaleUpper,
  type PxlKitFontConfig,
  type PxlKitLocale,
} from '@pxlkit/ui-kit-core';

/* ═══════════════════════════════════════════════════════════════════════════════
   LOCALE CONTEXT
   ═══════════════════════════════════════════════════════════════════════════════ */


const PxlKitLocaleContext = createContext<PxlKitLocaleContextValue>(createLocaleContextValue('en'));

/**
 * Hook to access the current PxlKit locale context.
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { locale, upper } = usePxlKitLocale();
 *   return <h1>{upper('istanbul')}</h1>; // → "İSTANBUL" when locale is "tr"
 * }
 * ```
 */
export function usePxlKitLocale(): PxlKitLocaleContextValue {
  return useContext(PxlKitLocaleContext);
}

/* ═══════════════════════════════════════════════════════════════════════════════
   LOCALE PROVIDER
   ═══════════════════════════════════════════════════════════════════════════════ */

export interface PxlKitLocaleProviderProps {
  /**
   * BCP 47 locale tag.
   * @default "en"
   */
  locale?: PxlKitLocale;
  children: React.ReactNode;
}

/**
 * Provides the locale and locale-aware text utilities to all PxlKit components.
 *
 * ### What it does
 * 1. Sets `lang` on a layout-neutral wrapper (`<div lang={locale}>` with
 *    `display: contents`) so that CSS `text-transform: uppercase` handles
 *    Turkish `i → İ` correctly.
 * 2. Exposes `upper()` / `lower()` helpers via context so components can do
 *    locale-aware string transforms in JavaScript.
 * 3. Exposes `fontsUrl`, the Google Fonts URL with the subsets the locale needs
 *    (`latin-ext` for Turkish). The provider loads no fonts itself — add the
 *    URL as a stylesheet `<link>` (or self-host the fonts) where your app loads
 *    its fonts.
 *
 * ### Usage
 * ```tsx
 * import { PxlKitLocaleProvider } from '@pxlkit/ui-kit';
 *
 * // In your app root:
 * <PxlKitLocaleProvider locale="tr">
 *   <App />
 * </PxlKitLocaleProvider>
 * ```
 *
 * For server-rendered apps (Next.js), also set `lang` on the `<html>` tag:
 * ```tsx
 * // app/layout.tsx
 * <html lang="tr">
 * ```
 */
export function PxlKitLocaleProvider({
  locale = 'en',
  children,
}: PxlKitLocaleProviderProps) {
  const ctx = useMemo(() => createLocaleContextValue(locale), [locale]);

  return (
    <PxlKitLocaleContext.Provider value={ctx}>
      <div lang={locale} style={{ display: 'contents' }}>
        {children}
      </div>
    </PxlKitLocaleContext.Provider>
  );
}

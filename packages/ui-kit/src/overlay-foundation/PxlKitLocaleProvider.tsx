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
 * Provides locale-aware font loading and text utilities to all PxlKit components.
 *
 * ### What it does
 * 1. Sets `lang` on the nearest parent (via a wrapper `<div lang={locale}>`) so
 *    that CSS `text-transform: uppercase` handles Turkish `i → İ` correctly.
 * 2. Injects a `<link>` tag to load Google Fonts with the appropriate subsets
 *    (`latin-ext` for Turkish).
 * 3. Exposes `upper()` / `lower()` helpers via context so components can do
 *    locale-aware string transforms in JavaScript.
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

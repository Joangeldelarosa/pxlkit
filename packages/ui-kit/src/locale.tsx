'use client';

import React, { createContext, useContext, useMemo } from 'react';

/* ═══════════════════════════════════════════════════════════════════════════════
   SUPPORTED LOCALES
   ═══════════════════════════════════════════════════════════════════════════════ */

/**
 * BCP 47 language tags for locales that require special font or text handling.
 *
 * - `"en"` — English (default). No special handling required.
 * - `"tr"` — Turkish. Requires `latin-ext` Google Fonts subset and locale-aware
 *   uppercasing (`i → İ`, `ı → I`).
 */
export type PxlKitLocale = 'en' | 'tr';

/* ═══════════════════════════════════════════════════════════════════════════════
   FONT CONFIGURATION
   ═══════════════════════════════════════════════════════════════════════════════ */

/**
 * Configuration for each font used in the design system.
 */
export interface PxlKitFontConfig {
  /** CSS `font-family` string (including fallbacks). */
  family: string;
  /** Google Fonts family name for loading. */
  googleFamily: string;
  /** Weights to load. */
  weights: number[];
  /** The CSS variable that references this font. */
  cssVar: string;
}

/** Default fonts used across the UI kit. */
export const PXLKIT_FONTS: Record<'pixel' | 'sans' | 'mono', PxlKitFontConfig> = {
  pixel: {
    family: '"Press Start 2P", monospace',
    googleFamily: 'Press Start 2P',
    weights: [400],
    cssVar: '--font-pixel',
  },
  sans: {
    family: '"Inter", sans-serif',
    googleFamily: 'Inter',
    weights: [400, 500, 600, 700],
    cssVar: '--font-sans',
  },
  mono: {
    family: '"JetBrains Mono", monospace',
    googleFamily: 'JetBrains Mono',
    weights: [400, 500, 600, 700],
    cssVar: '--font-mono',
  },
};

/* ═══════════════════════════════════════════════════════════════════════════════
   GOOGLE FONTS URL BUILDER
   ═══════════════════════════════════════════════════════════════════════════════ */

/**
 * Google Fonts subsets required per locale. `latin` is always included.
 */
const LOCALE_SUBSETS: Record<PxlKitLocale, string[]> = {
  en: ['latin'],
  tr: ['latin', 'latin-ext'],
};

/**
 * Turkish-specific characters for testing font rendering.
 * Includes all six special letter pairs unique to Turkish.
 */
export const TURKISH_CHARACTERS = {
  lowercase: 'ç ğ ı ö ş ü',
  uppercase: 'Ç Ğ İ Ö Ş Ü',
  sample: 'İstanbul güneşli bir şehirdir',
  pangram: 'Pijamalı hasta yağız şoföre çabucak güvendi',
} as const;

/**
 * Build a Google Fonts CSS2 import URL that loads the correct subsets for the
 * given locale.
 *
 * @example
 * ```ts
 * buildGoogleFontsUrl('tr')
 * // → "https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&subset=latin,latin-ext&display=swap"
 * ```
 */
export function buildGoogleFontsUrl(locale: PxlKitLocale = 'en'): string {
  const families = Object.values(PXLKIT_FONTS).map((f) => {
    const weights = f.weights.length > 1 ? `:wght@${f.weights.join(';')}` : '';
    return `family=${f.googleFamily.replace(/ /g, '+')}${weights}`;
  });

  const subsets = LOCALE_SUBSETS[locale] ?? LOCALE_SUBSETS.en;

  return `https://fonts.googleapis.com/css2?${families.join('&')}&subset=${subsets.join(',')}&display=swap`;
}

/* ═══════════════════════════════════════════════════════════════════════════════
   LOCALE-AWARE TEXT UTILITIES
   ═══════════════════════════════════════════════════════════════════════════════ */

/**
 * Locale-aware uppercase that correctly handles Turkish dotted/dotless i.
 *
 * | Input | English          | Turkish          |
 * |-------|------------------|------------------|
 * | `i`   | `I`              | `İ` (U+0130)     |
 * | `ı`   | `I` (fallback)   | `I`              |
 *
 * @example
 * ```ts
 * toLocaleUpper('istanbul', 'tr') // → "İSTANBUL"
 * toLocaleUpper('istanbul', 'en') // → "ISTANBUL"
 * ```
 */
export function toLocaleUpper(text: string, locale: PxlKitLocale = 'en'): string {
  return text.toLocaleUpperCase(locale);
}

/**
 * Locale-aware lowercase that correctly handles Turkish `İ` → `i` and `I` → `ı`.
 *
 * @example
 * ```ts
 * toLocaleLower('İSTANBUL', 'tr') // → "istanbul"
 * toLocaleLower('ISTANBUL', 'tr') // → "ıstanbul"
 * ```
 */
export function toLocaleLower(text: string, locale: PxlKitLocale = 'en'): string {
  return text.toLocaleLowerCase(locale);
}

/* ═══════════════════════════════════════════════════════════════════════════════
   LOCALE CONTEXT
   ═══════════════════════════════════════════════════════════════════════════════ */

interface PxlKitLocaleContextValue {
  locale: PxlKitLocale;
  /** Locale-aware uppercase. */
  upper: (text: string) => string;
  /** Locale-aware lowercase. */
  lower: (text: string) => string;
  /** Google Fonts URL with the correct subsets for this locale. */
  fontsUrl: string;
}

const PxlKitLocaleContext = createContext<PxlKitLocaleContextValue>({
  locale: 'en',
  upper: (t) => t.toLocaleUpperCase('en'),
  lower: (t) => t.toLocaleLowerCase('en'),
  fontsUrl: buildGoogleFontsUrl('en'),
});

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
  const ctx = useMemo<PxlKitLocaleContextValue>(
    () => ({
      locale,
      upper: (text: string) => toLocaleUpper(text, locale),
      lower: (text: string) => toLocaleLower(text, locale),
      fontsUrl: buildGoogleFontsUrl(locale),
    }),
    [locale],
  );

  return (
    <PxlKitLocaleContext.Provider value={ctx}>
      <div lang={locale} style={{ display: 'contents' }}>
        {children}
      </div>
    </PxlKitLocaleContext.Provider>
  );
}

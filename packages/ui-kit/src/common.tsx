'use client';

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';



export type Tone = 'green' | 'cyan' | 'gold' | 'red' | 'purple' | 'pink' | 'neutral';
export type Size = 'sm' | 'md' | 'lg';
export type Option = { value: string; label: string; icon?: React.ReactNode };
export type TabItem = { id: string; label: string; icon?: React.ReactNode; content: React.ReactNode };
export type AccordionItem = { id: string; title: string; content: React.ReactNode };

/**
 * Surface — visual aesthetic of a Pxlkit component.
 *
 * - `"pixel"` (default) — chunky 2px borders, sharp pixel-art corners, offset
 *   block shadow with no blur, mono typography. Matches the brand identity.
 * - `"linear"` — soft 1px borders, gentle rounded corners, blurred drop
 *   shadows, sans typography. For projects that want the same components
 *   without the retro aesthetic.
 *
 * Every component reads its surface from the nearest `PxlKitSurfaceProvider`
 * (default: `"pixel"`); the `surface` prop on a component overrides the
 * provider for that single instance.
 */
export type Surface = 'pixel' | 'linear';

/**
 * Class bundles returned by `surfaceClasses(surface)`.
 * Every component composes these to match the active aesthetic.
 */
export interface SurfaceClasses {
  /** Border width — `border-2` (pixel) vs `border` (linear). */
  border: string;
  /** Standard interactive radius. */
  radius: string;
  /** Larger radius for cards / modals / panels. */
  radiusLg: string;
  /** Radius for chips and badges (pill in linear, chamfered in pixel). */
  radiusFull: string;
  /** Resting drop shadow. */
  shadow: string;
  /** Hover shadow (subtle elevation change). */
  shadowHover: string;
  /** Active / pressed shadow. */
  shadowActive: string;
  /** Body / control typography. */
  font: string;
  /** Display / heading typography. */
  fontDisplay: string;
  /** Transition timing. */
  transition: string;
  /** Press feedback — pixel translates, linear scales. */
  press: string;
}

const SURFACE_TOKENS: Record<Surface, SurfaceClasses> = {
  pixel: {
    border: 'border-2',
    // Staircase pixel corners — see styles.css `.pxl-corner-*`
    radius: 'pxl-corner-sm',
    radiusLg: 'pxl-corner-md',
    radiusFull: 'pxl-corner-sm',
    // drop-shadow follows the staircase silhouette
    shadow: 'pxl-shadow',
    shadowHover: 'pxl-shadow-hover',
    shadowActive: 'pxl-shadow-active',
    font: 'font-mono',
    fontDisplay: 'font-pixel uppercase tracking-wider',
    transition: 'transition-all duration-150',
    press: 'active:translate-x-[2px] active:translate-y-[2px]',
  },
  linear: {
    border: 'border',
    radius: 'rounded-md',
    radiusLg: 'rounded-xl',
    radiusFull: 'rounded-full',
    shadow: 'shadow-sm',
    shadowHover: 'hover:shadow-md',
    shadowActive: 'active:shadow-sm',
    font: 'font-sans',
    fontDisplay: 'font-semibold tracking-tight',
    transition: 'transition-all duration-200',
    press: 'active:scale-[0.98]',
  },
};

/**
 * Resolve surface-specific class strings.
 * @example
 * const s = surfaceClasses(surface);
 * <div className={cn(s.border, s.radius, s.shadow)}>...</div>
 */
export function surfaceClasses(surface: Surface = 'pixel'): SurfaceClasses {
  return SURFACE_TOKENS[surface];
}

/* ──────────────────────────────────────────────────────────────────────────
   PxlKitSurfaceProvider — sets the default surface for nested components.
   Each component still accepts a `surface` prop that overrides the context.
   ────────────────────────────────────────────────────────────────────────── */

const PxlKitSurfaceContext = createContext<Surface>('pixel');

export function usePxlKitSurface(): Surface {
  return useContext(PxlKitSurfaceContext);
}

/**
 * Wrap a subtree to change the default `surface` of every nested Pxlkit
 * component without setting the prop on each one individually.
 *
 * @example
 * <PxlKitSurfaceProvider surface="linear">
 *   <PixelButton>Looks modern</PixelButton>
 * </PxlKitSurfaceProvider>
 */
export function PxlKitSurfaceProvider({
  surface = 'pixel',
  children,
}: {
  surface?: Surface;
  children: React.ReactNode;
}) {
  return (
    <PxlKitSurfaceContext.Provider value={surface}>
      {children}
    </PxlKitSurfaceContext.Provider>
  );
}

/**
 * Internal helper used by every component to resolve its effective surface.
 * Prop wins over context; falls back to `"pixel"`.
 */
export function useEffectiveSurface(propSurface?: Surface): Surface {
  const ctx = usePxlKitSurface();
  return propSurface ?? ctx;
}



export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}

export function useClickOutside(ref: React.RefObject<HTMLElement | null>, handler: () => void) {
  useEffect(() => {
    const listener = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) handler();
    };
    document.addEventListener('mousedown', listener);
    return () => document.removeEventListener('mousedown', listener);
  }, [ref, handler]);
}



export const toneMap: Record<Tone, { ring: string; text: string; border: string; bg: string; soft: string; hover: string; fill: string }> = {
  green: {
    ring: 'focus-visible:ring-retro-green/40',
    text: 'text-retro-green',
    border: 'border-retro-green/40',
    bg: 'bg-retro-green/10',
    soft: 'bg-retro-green/5',
    hover: 'hover:bg-retro-green/15',
    fill: 'bg-retro-green',
  },
  cyan: {
    ring: 'focus-visible:ring-retro-cyan/40',
    text: 'text-retro-cyan',
    border: 'border-retro-cyan/40',
    bg: 'bg-retro-cyan/10',
    soft: 'bg-retro-cyan/5',
    hover: 'hover:bg-retro-cyan/15',
    fill: 'bg-retro-cyan',
  },
  gold: {
    ring: 'focus-visible:ring-retro-gold/40',
    text: 'text-retro-gold',
    border: 'border-retro-gold/40',
    bg: 'bg-retro-gold/10',
    soft: 'bg-retro-gold/5',
    hover: 'hover:bg-retro-gold/15',
    fill: 'bg-retro-gold',
  },
  red: {
    ring: 'focus-visible:ring-retro-red/40',
    text: 'text-retro-red',
    border: 'border-retro-red/40',
    bg: 'bg-retro-red/10',
    soft: 'bg-retro-red/5',
    hover: 'hover:bg-retro-red/15',
    fill: 'bg-retro-red',
  },
  purple: {
    ring: 'focus-visible:ring-retro-purple/40',
    text: 'text-retro-purple',
    border: 'border-retro-purple/40',
    bg: 'bg-retro-purple/10',
    soft: 'bg-retro-purple/5',
    hover: 'hover:bg-retro-purple/15',
    fill: 'bg-retro-purple',
  },
  pink: {
    ring: 'focus-visible:ring-retro-pink/40',
    text: 'text-retro-pink',
    border: 'border-retro-pink/40',
    bg: 'bg-retro-pink/10',
    soft: 'bg-retro-pink/5',
    hover: 'hover:bg-retro-pink/15',
    fill: 'bg-retro-pink',
  },
  neutral: {
    ring: 'focus-visible:ring-retro-border/60',
    text: 'text-retro-text',
    border: 'border-retro-border',
    bg: 'bg-retro-surface',
    soft: 'bg-retro-surface/50',
    hover: 'hover:bg-retro-surface/80',
    fill: 'bg-retro-text',
  },
};

export const sizeClass: Record<Size, string> = {
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-12 px-5 text-sm gap-2.5',
};

export const focusRing = 'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-retro-bg';

export const inputBase =
  'w-full rounded-md border bg-retro-bg/70 text-retro-text font-mono transition-all outline-none disabled:opacity-50 disabled:cursor-not-allowed';



/**
 * Shared base styles for the inline pixel SVG helpers in this file.
 * `inline-block` removes the descender gap; `vertical-align: middle` aligns
 * with adjacent text; `overflow: visible` prevents accidental clipping;
 * `flex-shrink: 0` keeps the icon at its declared size inside flex slots.
 */
const inlineIconStyle: React.CSSProperties = {
  display: 'inline-block',
  verticalAlign: 'middle',
  overflow: 'visible',
  flexShrink: 0,
};

export function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 8 8" className={cn('h-2.5 w-2.5 shrink-0', className)} shapeRendering="crispEdges" fill="currentColor" preserveAspectRatio="xMidYMid meet" style={inlineIconStyle}>
      <rect x="1" y="2" width="1" height="1" />
      <rect x="2" y="3" width="1" height="1" />
      <rect x="3" y="4" width="2" height="1" />
      <rect x="5" y="3" width="1" height="1" />
      <rect x="6" y="2" width="1" height="1" />
    </svg>
  );
}

export function CheckIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 8 8" className={cn('h-3 w-3 shrink-0', className)} shapeRendering="crispEdges" fill="currentColor" preserveAspectRatio="xMidYMid meet" style={inlineIconStyle}>
      <rect x="6" y="1" width="1" height="1" />
      <rect x="5" y="2" width="1" height="1" />
      <rect x="4" y="3" width="1" height="1" />
      <rect x="3" y="4" width="1" height="1" />
      <rect x="2" y="4" width="1" height="1" />
      <rect x="1" y="3" width="1" height="1" />
    </svg>
  );
}

export function CloseIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 8 8" className={cn('h-3 w-3 shrink-0', className)} shapeRendering="crispEdges" fill="currentColor" preserveAspectRatio="xMidYMid meet" style={inlineIconStyle}>
      <rect x="1" y="1" width="1" height="1" />
      <rect x="2" y="2" width="1" height="1" />
      <rect x="5" y="2" width="1" height="1" />
      <rect x="6" y="1" width="1" height="1" />
      <rect x="3" y="3" width="2" height="2" />
      <rect x="1" y="6" width="1" height="1" />
      <rect x="2" y="5" width="1" height="1" />
      <rect x="5" y="5" width="1" height="1" />
      <rect x="6" y="6" width="1" height="1" />
    </svg>
  );
}



export function FieldShell({
  label,
  hint,
  error,
  surface = 'pixel',
  children,
}: {
  label?: string;
  hint?: string;
  error?: string;
  surface?: Surface;
  children: React.ReactNode;
}) {
  const s = surfaceClasses(surface);
  return (
    <label className="block space-y-1.5">
      {label && <span className={cn('text-xs text-retro-muted', s.font)}>{label}</span>}
      {children}
      {error ? (
        <span className={cn('text-xs text-retro-red', s.font)}>{error}</span>
      ) : hint ? (
        <span className={cn('text-xs text-retro-muted', s.font)}>{hint}</span>
      ) : null}
    </label>
  );
}


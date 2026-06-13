'use client';

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';



export type Tone = 'green' | 'cyan' | 'gold' | 'red' | 'purple' | 'pink' | 'neutral';
export type Size = 'sm' | 'md' | 'lg';
/**
 * Shared visual weight axis used across the kit. Every component that has
 * a visible body picks one of these.
 *
 * - `solid` — opaque tone background + contrasting text (highest weight).
 * - `soft` — tinted tone background + tone text (default for cards / badges / chips).
 * - `ghost` — transparent body until hover, tone text + border.
 * - `outline` — transparent body, tone border, tone text.
 *
 * Components that historically only accepted `solid | ghost` continue to do
 * so; this union is the canonical superset and is what new components should
 * accept.
 */
export type Variant = 'solid' | 'soft' | 'ghost' | 'outline';
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

// Exported for internal sharing with overlay-foundation/PxlKitSurfaceProvider.tsx
// (the extracted provider renders this context's Provider). NOT part of the
// package public API — index.tsx re-exports named symbols only.
export const PxlKitSurfaceContext = createContext<Surface>('pixel');

export function usePxlKitSurface(): Surface {
  return useContext(PxlKitSurfaceContext);
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

/**
 * Fires `handler` when a `pointerdown` lands outside `ref.current`.
 *
 * Uses `pointerdown` (not `mousedown`) so iOS Safari tap-to-dismiss works —
 * a `mousedown`-only listener routinely misses the first tap on iOS,
 * leaving menus stuck open until the second tap.
 */
export function useClickOutside(ref: React.RefObject<HTMLElement | null>, handler: () => void) {
  useEffect(() => {
    const listener = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) handler();
    };
    document.addEventListener('pointerdown', listener);
    return () => document.removeEventListener('pointerdown', listener);
  }, [ref, handler]);
}



/**
 * Per-tone class bundle. Conventions:
 *  - `bg`   ≈ 18 % tint — soft surface for chip / badge / alert / stat bodies.
 *    18 % (vs the 10 % we used pre-v1.4.3) brings light-theme contrast above
 *    the 3:1 floor for badge text on light backgrounds.
 *  - `soft` ≈ 8 % tint — even gentler surface for hover states or nested fills.
 *  - `hover` adds another ~7 % on interaction.
 *  - `border` 40 % opacity — visible at body sizes; for thin dividers prefer
 *    `border-retro-border` or `/30`.
 *  - `ring`  40 % — keyboard focus ring.
 *  - `fill`  opaque — solid tone backgrounds (`solid` variant of any
 *    component).
 *
 * NOTE: `tokens.ts` exports a *separate* `tone` map for layout/surface-scale
 * components (cards, hero, bento, …) that intentionally uses `border-*\/30`
 * + a `glow` tier. The two maps are different design tiers, not a drifted
 * copy — see the decision comment on `tone` in tokens.ts before changing
 * either one to "match" the other.
 */
export const toneMap: Record<Tone, { ring: string; text: string; border: string; bg: string; soft: string; hover: string; fill: string }> = {
  green: {
    ring: 'focus-visible:ring-retro-green/40',
    text: 'text-retro-green',
    border: 'border-retro-green/40',
    bg: 'bg-retro-green/18',
    soft: 'bg-retro-green/8',
    hover: 'hover:bg-retro-green/25',
    fill: 'bg-retro-green',
  },
  cyan: {
    ring: 'focus-visible:ring-retro-cyan/40',
    text: 'text-retro-cyan',
    border: 'border-retro-cyan/40',
    bg: 'bg-retro-cyan/18',
    soft: 'bg-retro-cyan/8',
    hover: 'hover:bg-retro-cyan/25',
    fill: 'bg-retro-cyan',
  },
  gold: {
    ring: 'focus-visible:ring-retro-gold/40',
    text: 'text-retro-gold',
    border: 'border-retro-gold/40',
    bg: 'bg-retro-gold/18',
    soft: 'bg-retro-gold/8',
    hover: 'hover:bg-retro-gold/25',
    fill: 'bg-retro-gold',
  },
  red: {
    ring: 'focus-visible:ring-retro-red/40',
    text: 'text-retro-red',
    border: 'border-retro-red/40',
    bg: 'bg-retro-red/18',
    soft: 'bg-retro-red/8',
    hover: 'hover:bg-retro-red/25',
    fill: 'bg-retro-red',
  },
  purple: {
    ring: 'focus-visible:ring-retro-purple/40',
    text: 'text-retro-purple',
    border: 'border-retro-purple/40',
    bg: 'bg-retro-purple/18',
    soft: 'bg-retro-purple/8',
    hover: 'hover:bg-retro-purple/25',
    fill: 'bg-retro-purple',
  },
  pink: {
    ring: 'focus-visible:ring-retro-pink/40',
    text: 'text-retro-pink',
    border: 'border-retro-pink/40',
    bg: 'bg-retro-pink/18',
    soft: 'bg-retro-pink/8',
    hover: 'hover:bg-retro-pink/25',
    fill: 'bg-retro-pink',
  },
  neutral: {
    ring: 'focus-visible:ring-retro-border/60',
    text: 'text-retro-text',
    border: 'border-retro-border',
    // Neutral uses /70 + /40 (vs /10 + /5 for colour tones) because grey on
    // grey needs more opacity to be perceptually similar to a tinted hue.
    // This makes neutral cards visually congruent with coloured siblings
    // rather than visibly heavier.
    bg: 'bg-retro-surface/70',
    soft: 'bg-retro-surface/40',
    hover: 'hover:bg-retro-surface/80',
    fill: 'bg-retro-text',
  },
};

/**
 * Default control geometry — height + horizontal padding + text size + gap.
 * Used by interactive elements that own their own padding (`PixelButton`,
 * `PixelInput`, `PixelSelect`, ...).
 */
export const sizeClass: Record<Size, string> = {
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-12 px-5 text-sm gap-2.5',
};

/**
 * Standalone control height + body text size (no horizontal padding) — for
 * elements that provide their own internal layout: input shells, sliders,
 * switches, container divs. Matches `sizeClass` height / text-size for
 * baseline-level consistency with other controls on the same form row.
 */
export const sizeHeight: Record<Size, string> = {
  sm: 'h-8 text-xs',
  md: 'h-10 text-sm',
  lg: 'h-12 text-sm',
};

/**
 * Square control geometry — for icon buttons, avatars, swatches and any
 * other control where width = height. Single source of truth replacing the
 * inline ternaries in actions / data-display / inputs.
 */
export const sizeSquare: Record<Size, string> = {
  sm: 'h-8 w-8 text-[9px]',
  md: 'h-10 w-10 text-[10px]',
  lg: 'h-12 w-12 text-xs',
};

/**
 * Pixel "dot" — small interactive squares (checkbox, switch handle, radio
 * marker, slider thumb). Sized for crisp pixel rendering, not tied to the
 * text scale.
 */
export const pixelDot: Record<Size, string> = {
  sm: 'h-4 w-4',
  md: 'h-[1.125rem] w-[1.125rem]',
  lg: 'h-5 w-5',
};

/**
 * Two flavours of pixel corner. `dot` is the 2 px rounded square used on
 * inline indicators; `square` is the 3 px corner used on avatars and small
 * card chips. Use these instead of inlining `rounded-[2px]` everywhere.
 */
export const pixelRadius = {
  dot: 'rounded-[2px]',
  square: 'rounded-[3px]',
} as const;

/**
 * Pixel typography scale. Drops any text below 10 px (below WCAG sidebar
 * thresholds) and pins the available steps for the kit. Use these instead
 * of arbitrary `text-[9px]` etc. on body text — the `micro` step is
 * intentionally the floor.
 */
export const pixelType = {
  /** 10 px — chips, kbd, tooltips. */
  micro: 'text-[10px]',
  /** 12 px — captions, helper text. */
  xs: 'text-xs',
  /** 14 px — body. */
  sm: 'text-sm',
  /** 16 px — section bodies. */
  base: 'text-base',
} as const;

export const focusRing = 'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-retro-bg';

/**
 * Base styles shared by every input shell. Notably does NOT pin a radius
 * — the active `SurfaceClasses.radius` owns radius — and uses
 * `bg-retro-surface/40` (with `/70` on focus) so inputs stay visually
 * "depressed" against both `retro-bg` (page) and `retro-card` (cards) in
 * either theme.
 */
export const inputBase =
  'w-full border bg-retro-surface/40 focus:bg-retro-surface/70 text-retro-text font-mono transition-all outline-none disabled:opacity-50 disabled:cursor-not-allowed';



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
  surface: surfaceProp,
  htmlFor,
  children,
}: {
  label?: string;
  hint?: string;
  error?: string;
  surface?: Surface;
  /**
   * Id of the field's primary control. When provided, the label text is a
   * real `<label htmlFor>`; without it the text renders as a plain span.
   */
  htmlFor?: string;
  children: React.ReactNode;
}) {
  // Resolve like every other surface-aware component: prop wins, then the
  // nearest PxlKitSurfaceProvider, then "pixel". (Previously hardcoded a
  // `surface = 'pixel'` default, which bypassed the provider for callers
  // that omit the prop — every in-kit caller passes it explicitly, so this
  // only makes standalone usage more correct.)
  const surface = useEffectiveSurface(surfaceProp);
  const s = surfaceClasses(surface);
  // NOT a wrapping <label>: native label activation forwards clicks to the
  // contained control, which DOUBLE-fired fields whose children also
  // trigger it programmatically (PixelFileUpload's dropzone opened the OS
  // file dialog twice and dropped the first selection). Explicit htmlFor
  // keeps a single, correct association instead.
  const labelClass = cn('text-xs text-retro-muted', s.font);
  return (
    <div className="block space-y-1.5">
      {label &&
        (htmlFor ? (
          <label htmlFor={htmlFor} className={labelClass}>
            {label}
          </label>
        ) : (
          <span className={labelClass}>{label}</span>
        ))}
      {children}
      {error ? (
        <span className={cn('text-xs text-retro-red', s.font)}>{error}</span>
      ) : hint ? (
        <span className={cn('text-xs text-retro-muted', s.font)}>{hint}</span>
      ) : null}
    </div>
  );
}

// PxlKitSurfaceProvider moved next to its manifest (overlay-foundation/);
// re-exported so this module's API stays unchanged. Keep this re-export at
// the END of the file — PxlKitSurfaceProvider.tsx imports PxlKitSurfaceContext
// back from this module (intentional cycle), so every shared value must be
// initialized above this re-export.
export { PxlKitSurfaceProvider } from './overlay-foundation/PxlKitSurfaceProvider';


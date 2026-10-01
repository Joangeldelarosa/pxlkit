'use client';

import React, { createContext, useContext, useEffect } from 'react';
import {
  PIXEL_GLYPHS,
  PIXEL_GLYPH_STYLE,
  PIXEL_GLYPH_VIEWBOX,
  cn,
  surfaceClasses,
  type PixelGlyphName,
  type Surface,
} from '@pxlkit/ui-kit-core';

// The kit's shared vocabulary — tone, size and variant types, the surface
// system and the class maps — lives in @pxlkit/ui-kit-core, so the React, Vue
// and Angular components compose the very same classes.
export {
  cn,
  focusRing,
  inputBase,
  pixelDot,
  pixelRadius,
  pixelType,
  sizeClass,
  sizeHeight,
  sizeSquare,
  surfaceClasses,
  toneMap,
  type Size,
  type Surface,
  type SurfaceClasses,
  type Tone,
  type Variant,
} from '@pxlkit/ui-kit-core';

export type Option = { value: string; label: string; icon?: React.ReactNode };
export type TabItem = { id: string; label: string; icon?: React.ReactNode; content: React.ReactNode };
export type AccordionItem = { id: string; title: string; content: React.ReactNode };

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

function PixelGlyph({ name, className }: { name: PixelGlyphName; className?: string }) {
  const glyph = PIXEL_GLYPHS[name];
  return (
    <svg viewBox={PIXEL_GLYPH_VIEWBOX} className={cn(glyph.className, className)} shapeRendering="crispEdges" fill="currentColor" preserveAspectRatio="xMidYMid meet" style={PIXEL_GLYPH_STYLE}>
      {glyph.rects.map(([x, y, width, height]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width={width} height={height} />
      ))}
    </svg>
  );
}

export function ChevronDownIcon({ className }: { className?: string }) {
  return <PixelGlyph name="chevronDown" className={className} />;
}

export function CheckIcon({ className }: { className?: string }) {
  return <PixelGlyph name="check" className={className} />;
}

export function CloseIcon({ className }: { className?: string }) {
  return <PixelGlyph name="close" className={className} />;
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


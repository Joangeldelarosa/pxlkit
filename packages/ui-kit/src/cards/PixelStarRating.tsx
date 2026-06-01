'use client';

import React, { forwardRef, type ReactNode } from 'react';
import { PxlKitIcon } from '@pxlkit/core';
import { Star } from '@pxlkit/gamification';
import {
  Surface,
  cn,
  surfaceClasses,
  useEffectiveSurface,
} from '../common';
import { useControllableState } from '../hooks/useControllableState';

type StarSize = 'sm' | 'md' | 'lg';
type StarTone = 'gold' | 'green';

/**
 * Pixel-art glyph footprint for the OUTLINED (empty) state — kept as
 * Tailwind h/w utility classes so the silhouette of the inline rect-SVG
 * matches the filled gamification Star at every breakpoint.
 */
const outlineDimMap: Record<StarSize, string> = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
};

/**
 * Pixel sizes (in CSS px) for the gamification Star rendered via
 * {@link PxlKitIcon}. PxlKitIcon takes a numeric `size` prop, not Tailwind
 * classes — the values mirror outlineDimMap so the filled and outlined
 * glyphs share the same footprint.
 */
const sizePxMap: Record<StarSize, number> = {
  sm: 16,
  md: 20,
  lg: 24,
};

const toneFill: Record<StarTone, string> = {
  gold: 'text-retro-gold',
  green: 'text-retro-green',
};

/**
 * Solid-mode hex resolution for {@link PxlKitIcon}. The icon renders as
 * `<img>` (isolated context) so `currentColor` is not honoured — we MUST
 * pass an explicit hex to preserve the `tone` prop across surfaces.
 * Values sourced from styles.css dark-mode tokens.
 */
const toneHex: Record<StarTone, string> = {
  gold: '#FFD700',
  green: '#00FF88',
};

export interface PixelStarRatingProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
  /** Controlled rating value (0..max). */
  value?: number;
  /** Uncontrolled initial rating value (0..max). */
  defaultValue?: number;
  /** Total number of stars rendered. Default 5. */
  max?: number;
  /** Visual size of each star — maps to 16 / 20 / 24 px for sm / md / lg. */
  size?: StarSize;
  /** Color tone applied to filled stars. */
  tone?: StarTone;
  /** When true, renders "N/M" beside the stars. */
  showCount?: boolean;
  /** When true, exposes each star as a button that updates the rating on click. */
  interactive?: boolean;
  /** Called with the new rating when the user clicks a star (interactive only). */
  onChange?: (next: number) => void;
  /** Override the ambient surface (pixel | linear). */
  surface?: Surface;
  /**
   * Polymorphic escape hatch. Replace the default gamification Star glyph
   * with any custom node, or a render function called per-star with
   * `{ filled, size, tone }` so the caller can choose a different sibling
   * pack icon (Heart, Coin, Crown…) without forking the component.
   *
   * - `undefined` (default) → render the gamification {@link Star} for
   *   filled positions and the inline outlined rect-SVG for empty ones.
   * - `ReactNode` → render for filled positions only; empty positions
   *   continue to use the outlined fallback for the empty-state silhouette.
   * - `(args) => ReactNode` → render for both filled and empty positions,
   *   giving full control over the glyph in every state.
   */
  starIcon?:
    | ReactNode
    | ((args: { filled: boolean; size: number; tone: StarTone }) => ReactNode);
}

function OutlinedStarSvg({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 8 8"
      className={cn('shrink-0', className)}
      shapeRendering="crispEdges"
      fill="currentColor"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden
    >
      <rect x="3" y="0" width="2" height="1" />
      <rect x="2" y="1" width="1" height="1" />
      <rect x="5" y="1" width="1" height="1" />
      <rect x="1" y="2" width="1" height="1" />
      <rect x="6" y="2" width="1" height="1" />
      <rect x="0" y="3" width="1" height="2" />
      <rect x="7" y="3" width="1" height="2" />
      <rect x="1" y="5" width="1" height="1" />
      <rect x="6" y="5" width="1" height="1" />
      <rect x="2" y="6" width="1" height="1" />
      <rect x="5" y="6" width="1" height="1" />
      <rect x="1" y="7" width="2" height="1" />
      <rect x="5" y="7" width="2" height="1" />
    </svg>
  );
}

export const PixelStarRating = forwardRef<HTMLDivElement, PixelStarRatingProps>(
  function PixelStarRating(
    {
      value,
      defaultValue,
      max = 5,
      size = 'md',
      tone = 'gold',
      showCount = false,
      interactive = false,
      onChange,
      surface: surfaceProp,
      starIcon,
      className,
      ...rest
    },
    ref,
  ) {
    const surface = useEffectiveSurface(surfaceProp);
    const s = surfaceClasses(surface);
    const [internalValue, setInternalValue] = useControllableState<number>({
      value,
      defaultValue: defaultValue ?? 0,
      onChange,
    });
    const safe = Math.max(0, Math.min(max, Math.round(internalValue ?? 0)));
    const px = sizePxMap[size];
    const outlineDim = outlineDimMap[size];
    const fillClass = toneFill[tone];
    const outlineClass = 'text-retro-muted/40';

    function renderGlyph(filled: boolean): ReactNode {
      if (typeof starIcon === 'function') {
        return starIcon({ filled, size: px, tone });
      }
      if (starIcon !== undefined && filled) {
        return starIcon;
      }
      if (filled) {
        return (
          <PxlKitIcon
            icon={Star}
            size={px}
            appearance="solid"
            color={toneHex[tone]}
            aria-label="star"
          />
        );
      }
      return <OutlinedStarSvg className={outlineDim} />;
    }

    const stars = Array.from({ length: max }).map((_, i) => {
      const filled = i < safe;
      const status = filled ? 'filled' : 'outlined';
      const colorClass = filled ? fillClass : outlineClass;

      if (interactive) {
        return (
          <button
            key={i}
            type="button"
            data-pxl-star={status}
            aria-label={`Rate ${i + 1} of ${max}`}
            aria-pressed={filled}
            onClick={() => setInternalValue(i + 1)}
            className={cn(
              'cursor-pointer inline-flex items-center justify-center bg-transparent border-0 p-0',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-retro-cyan/60 focus-visible:ring-offset-2 focus-visible:ring-offset-retro-bg',
              colorClass,
              s.transition,
            )}
          >
            {renderGlyph(filled)}
          </button>
        );
      }

      return (
        <span
          key={i}
          data-pxl-star={status}
          className={cn('inline-flex items-center justify-center', colorClass)}
        >
          {renderGlyph(filled)}
        </span>
      );
    });

    return (
      <div
        ref={ref}
        role={interactive ? 'group' : 'img'}
        aria-label={
          interactive ? `Rating, ${safe} of ${max}` : `${safe} out of ${max}`
        }
        className={cn('inline-flex items-center gap-1', s.font, className)}
        {...rest}
      >
        <span className="inline-flex items-center gap-0.5">{stars}</span>
        {showCount && (
          <span className={cn('ml-1 text-xs text-retro-muted', s.font)}>
            {safe}/{max}
          </span>
        )}
      </div>
    );
  },
);

PixelStarRating.displayName = 'PixelStarRating';

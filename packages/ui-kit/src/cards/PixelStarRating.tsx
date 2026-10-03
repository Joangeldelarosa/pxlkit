'use client';

import React, { forwardRef, type ReactNode } from 'react';
import { PxlKitIcon } from '@pxlkit/core';
import { Star } from '@pxlkit/gamification';
import {
  STAR_RATING_ICON_LABEL,
  STAR_RATING_MUTED_COLOR,
  starRatingButtonLabel,
  starRatingClasses,
  starRatingLabel,
  starRatingSizes,
  starRatingStarClasses,
  starRatingStars,
  starRatingToneColors,
  starRatingValue,
  type StarRatingSize as StarSize,
  type StarRatingTone as StarTone,
} from '@pxlkit/ui-kit-core';
import { Surface, cn, useEffectiveSurface } from '../common';
import { useControllableState } from '../hooks/useControllableState';

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
    const [internalValue, setInternalValue] = useControllableState<number>({
      value,
      defaultValue: defaultValue ?? 0,
      onChange,
    });
    const safe = starRatingValue(internalValue, max);
    const px = starRatingSizes[size];
    const classes = starRatingClasses(surface);

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
            color={starRatingToneColors[tone]}
            aria-label={STAR_RATING_ICON_LABEL}
          />
        );
      }
      return (
        <span className={classes.muted}>
          <PxlKitIcon
            icon={Star}
            size={px}
            appearance="solid"
            color={STAR_RATING_MUTED_COLOR}
            aria-label={STAR_RATING_ICON_LABEL}
          />
        </span>
      );
    }

    const stars = starRatingStars(safe, max).map(({ value: starValue, filled }) => {
      const status = filled ? 'filled' : 'outlined';
      const className = starRatingStarClasses(surface, { interactive, filled, tone });

      if (interactive) {
        return (
          <button
            key={starValue}
            type="button"
            data-pxl-star={status}
            aria-label={starRatingButtonLabel(starValue, max)}
            aria-pressed={filled}
            onClick={() => setInternalValue(starValue)}
            className={className}
          >
            {renderGlyph(filled)}
          </button>
        );
      }

      return (
        <span key={starValue} data-pxl-star={status} className={className}>
          {renderGlyph(filled)}
        </span>
      );
    });

    return (
      <div
        ref={ref}
        role={interactive ? 'group' : 'img'}
        aria-label={starRatingLabel(safe, max, interactive)}
        className={cn(classes.root, className)}
        {...rest}
      >
        <span className={classes.stars}>{stars}</span>
        {showCount && (
          <span className={classes.count}>
            {safe}/{max}
          </span>
        )}
      </div>
    );
  },
);

PixelStarRating.displayName = 'PixelStarRating';

'use client';

import React, { forwardRef } from 'react';
import {
  Surface,
  cn,
  surfaceClasses,
  useEffectiveSurface,
} from '../common';

type StarSize = 'sm' | 'md' | 'lg';
type StarTone = 'gold' | 'green';

const sizeMap: Record<StarSize, string> = {
  sm: 'h-3 w-3',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
};

const toneFill: Record<StarTone, string> = {
  gold: 'text-retro-gold',
  green: 'text-retro-green',
};

export interface PixelStarRatingProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  value: number;
  max?: number;
  size?: StarSize;
  tone?: StarTone;
  showCount?: boolean;
  interactive?: boolean;
  onChange?: (next: number) => void;
  surface?: Surface;
}

function StarSvg({
  filled,
  className,
}: {
  filled: boolean;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 8 8"
      className={cn('shrink-0', className)}
      shapeRendering="crispEdges"
      fill="currentColor"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden
    >
      {filled ? (
        <>
          <rect x="3" y="0" width="2" height="1" />
          <rect x="2" y="1" width="4" height="1" />
          <rect x="1" y="2" width="6" height="1" />
          <rect x="0" y="3" width="8" height="2" />
          <rect x="1" y="5" width="6" height="1" />
          <rect x="2" y="6" width="2" height="1" />
          <rect x="4" y="6" width="2" height="1" />
          <rect x="1" y="7" width="2" height="1" />
          <rect x="5" y="7" width="2" height="1" />
        </>
      ) : (
        <>
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
        </>
      )}
    </svg>
  );
}

export const PixelStarRating = forwardRef<HTMLDivElement, PixelStarRatingProps>(
  function PixelStarRating(
    {
      value,
      max = 5,
      size = 'md',
      tone = 'gold',
      showCount = false,
      interactive = false,
      onChange,
      surface: surfaceProp,
      className,
      ...rest
    },
    ref,
  ) {
    const surface = useEffectiveSurface(surfaceProp);
    const s = surfaceClasses(surface);
    const safe = Math.max(0, Math.min(max, Math.round(value)));
    const dim = sizeMap[size];
    const fillClass = toneFill[tone];
    const outlineClass = 'text-retro-border';

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
            onClick={() => onChange?.(i + 1)}
            className={cn(
              'cursor-pointer inline-flex items-center justify-center bg-transparent border-0 p-0',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-retro-cyan/60 focus-visible:ring-offset-2 focus-visible:ring-offset-retro-bg',
              colorClass,
              s.transition,
            )}
          >
            <StarSvg filled={filled} className={dim} />
          </button>
        );
      }

      return (
        <span
          key={i}
          data-pxl-star={status}
          className={cn('inline-flex items-center justify-center', colorClass)}
        >
          <StarSvg filled={filled} className={dim} />
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

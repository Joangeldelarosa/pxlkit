'use client';

import React, { forwardRef } from 'react';
import { cn, Surface, useEffectiveSurface, surfaceClasses } from '../common';
import { tone as toneTokens, ToneKey } from '../tokens';

type Ratio = '1/1' | '4/5' | '16/10' | '16/9';
type Anchor = 'center' | 'baseline-headline';

const ratioMap: Record<Ratio, string> = {
  '1/1': '1 / 1',
  '4/5': '4 / 5',
  '16/10': '16 / 10',
  '16/9': '16 / 9',
};

export interface PixelHeroMediaProps extends React.HTMLAttributes<HTMLElement> {
  ratio?: Ratio;
  anchor?: Anchor;
  framed?: boolean;
  tone?: ToneKey;
  caption?: string;
  /** Optional className applied to the inner caption (figcaption). */
  captionClassName?: string;
  surface?: Surface;
  children: React.ReactNode;
}

export const PixelHeroMedia = forwardRef<HTMLElement, PixelHeroMediaProps>(
  function PixelHeroMedia(
    {
      ratio = '16/10',
      anchor = 'center',
      framed = false,
      tone = 'neutral',
      caption,
      captionClassName,
      surface: surfaceProp,
      className,
      style,
      children,
      ...rest
    },
    ref,
  ) {
    const surface = useEffectiveSurface(surfaceProp);
    const s = surfaceClasses(surface);
    const t = toneTokens[tone];

    return (
      <figure
        ref={ref as React.Ref<HTMLElement>}
        className={cn(
          'relative flex w-full flex-col overflow-hidden',
          anchor === 'baseline-headline' ? 'self-end' : 'self-center',
          framed && s.border,
          framed && s.radiusLg,
          framed && t.border,
          className,
        )}
        style={{ aspectRatio: ratioMap[ratio], ...style }}
        {...(rest as React.HTMLAttributes<HTMLElement>)}
      >
        <div className="relative w-full flex-1">
          {children}
        </div>
        {caption && (
          <figcaption
            className={cn('mt-3 text-xs text-retro-muted', s.font, captionClassName)}
          >
            {caption}
          </figcaption>
        )}
      </figure>
    );
  },
);

PixelHeroMedia.displayName = 'PixelHeroMedia';

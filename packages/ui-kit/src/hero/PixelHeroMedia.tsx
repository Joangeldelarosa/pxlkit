'use client';

import React, { forwardRef } from 'react';
import {
  heroMediaBodyClasses,
  heroMediaCaptionClasses,
  heroMediaClasses,
  heroMediaRatios,
  type HeroMediaAnchor,
  type HeroMediaRatio,
} from '@pxlkit/ui-kit-core';
import { cn, Surface, useEffectiveSurface } from '../common';
import { ToneKey } from '../tokens';

export interface PixelHeroMediaProps extends React.HTMLAttributes<HTMLElement> {
  ratio?: HeroMediaRatio;
  anchor?: HeroMediaAnchor;
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

    return (
      <figure
        ref={ref as React.Ref<HTMLElement>}
        className={cn(heroMediaClasses(surface, { anchor, framed, tone }), className)}
        style={{ aspectRatio: heroMediaRatios[ratio], ...style }}
        {...(rest as React.HTMLAttributes<HTMLElement>)}
      >
        <div className={heroMediaBodyClasses}>
          {children}
        </div>
        {caption && (
          <figcaption
            className={cn(heroMediaCaptionClasses(surface), captionClassName)}
          >
            {caption}
          </figcaption>
        )}
      </figure>
    );
  },
);

PixelHeroMedia.displayName = 'PixelHeroMedia';

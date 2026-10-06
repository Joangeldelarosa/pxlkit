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
  /** Aspect ratio of the figure. */
  ratio?: HeroMediaRatio;
  /** Centred across its row, or on the row's end beside a headline. */
  anchor?: HeroMediaAnchor;
  /** Draw the surface border and radius in the tone's border colour. */
  framed?: boolean;
  /** Tone of the frame. */
  tone?: ToneKey;
  /** Caption under the media, in a `<figcaption>`. */
  caption?: string;
  /** Optional className applied to the inner caption (figcaption). */
  captionClassName?: string;
  /** Surface override; defaults to the nearest provider. */
  surface?: Surface;
  /** The media. */
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

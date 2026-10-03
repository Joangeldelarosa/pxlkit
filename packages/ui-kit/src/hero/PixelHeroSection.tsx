'use client';

import React, { forwardRef } from 'react';
import {
  heroAlign,
  heroContainerPadding,
  heroLayout,
  heroParallaxBodyClasses,
  heroParallaxMediaClasses,
  heroSectionClasses,
  heroSplitMediaClasses,
  type HeroDensity,
  type HeroHeadlineEffect,
  type HeroMinHeight,
  type HeroVariant,
} from '@pxlkit/ui-kit-core';
import { cn, Surface, useEffectiveSurface } from '../common';
import { ToneKey } from '../tokens';
import { PixelContainer } from '../layout/PixelContainer';
import { PixelTwoColumn } from '../layout/PixelTwoColumn';
import { PixelCluster } from '../layout/PixelCluster';
import { PixelGlitch } from '../animations/PixelGlitch';
import { PixelTypewriter } from '../animations/PixelTypewriter';

export interface PixelHeroSectionProps extends React.HTMLAttributes<HTMLElement> {
  variant?: HeroVariant;
  eyebrow?: string;
  headline: string;
  /**
   * Animates the headline: `'typewriter'` types it out once — screen readers
   * get the whole headline from the start — and `'glitch'` plays PixelGlitch
   * over it. Both hold still when the user prefers reduced motion. Default
   * `'none'`.
   */
  headlineEffect?: HeroHeadlineEffect;
  subline?: string;
  primaryCta?: React.ReactNode;
  secondaryCta?: React.ReactNode;
  install?: React.ReactNode;
  meta?: React.ReactNode;
  media?: React.ReactNode;
  tone?: ToneKey;
  density?: HeroDensity;
  minHeight?: HeroMinHeight;
  surface?: Surface;
}

export const PixelHeroSection = forwardRef<HTMLElement, PixelHeroSectionProps>(
  function PixelHeroSection(
    {
      variant = 'centered',
      eyebrow,
      headline,
      headlineEffect = 'none',
      subline,
      primaryCta,
      secondaryCta,
      install,
      meta,
      media,
      tone: toneProp = 'neutral',
      density = 'comfortable',
      minHeight = 'md',
      surface: surfaceProp,
      className,
      ...rest
    },
    ref,
  ) {
    const surface = useEffectiveSurface(surfaceProp);
    const align = heroAlign(variant);
    const layout = heroLayout(variant, !!media);
    const c = heroSectionClasses(surface, { tone: toneProp, density, minHeight, align, hasEyebrow: !!eyebrow });

    const eyebrowNode = eyebrow ? (
      <span className={c.eyebrow}>
        {eyebrow}
      </span>
    ) : null;

    const headlineNode = (
      <h1 className={c.headline}>
        {headlineEffect === 'typewriter' ? <PixelTypewriter label={headline} tone="inherit" /> : headline}
      </h1>
    );

    const sublineNode = subline ? (
      <p className={c.subline}>
        {subline}
      </p>
    ) : null;

    const ctaNode = (primaryCta || secondaryCta) ? (
      <PixelCluster
        gap={3}
        align="center"
        justify={align}
        surface={surface}
        className={c.ctas}
      >
        {primaryCta}
        {secondaryCta}
      </PixelCluster>
    ) : null;

    const installNode = install ? (
      <div className={c.install}>
        {install}
      </div>
    ) : null;

    const metaNode = meta ? (
      <div className={c.meta}>
        {meta}
      </div>
    ) : null;

    const textColumn = (
      <div className={c.text}>
        {eyebrowNode}
        {headlineEffect === 'glitch' ? <PixelGlitch>{headlineNode}</PixelGlitch> : headlineNode}
        {sublineNode}
        {ctaNode}
        {installNode}
        {metaNode}
      </div>
    );

    const body = layout === 'split' ? (
      <PixelTwoColumn
        ratio="60/40"
        gap={8}
        stackBelow="md"
        align="center"
        left={textColumn}
        right={<div className={heroSplitMediaClasses}>{media}</div>}
        surface={surface}
      />
    ) : layout === 'parallax' ? (
      <div className={heroParallaxBodyClasses}>
        {media && (
          <div
            aria-hidden
            className={heroParallaxMediaClasses}
          >
            {media}
          </div>
        )}
        {textColumn}
      </div>
    ) : (
      <>
        {textColumn}
        {media && (
          <div className={c.media}>
            {media}
          </div>
        )}
      </>
    );

    return (
      <section
        ref={ref as React.Ref<HTMLElement>}
        className={cn(c.root, className)}
        {...rest}
      >
        <PixelContainer
          as="div"
          maxWidth="xl"
          padding={heroContainerPadding(density)}
          surface={surface}
        >
          {body}
        </PixelContainer>
      </section>
    );
  },
);

PixelHeroSection.displayName = 'PixelHeroSection';

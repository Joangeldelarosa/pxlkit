'use client';

import React, { forwardRef } from 'react';
import { cn, Surface, useEffectiveSurface, surfaceClasses } from '../common';
import { tone, ToneKey, rhythm } from '../tokens';
import { PixelContainer } from '../layout/PixelContainer';
import { PixelTwoColumn } from '../layout/PixelTwoColumn';
import { PixelCluster } from '../layout/PixelCluster';

type HeadlineEffect = 'typewriter' | 'glitch' | 'none';
type HeroVariant = 'centered' | 'split' | 'parallax';
type HeroDensity = 'compact' | 'comfortable';
type HeroMinHeight = 'sm' | 'md' | 'lg' | 'fullscreen';

const minHeightMap: Record<HeroMinHeight, string> = {
  sm: 'min-h-[400px]',
  md: 'min-h-[480px]',
  lg: 'min-h-[640px]',
  fullscreen: 'min-h-screen',
};

const headlineSize = {
  compact: 'text-3xl sm:text-4xl lg:text-5xl',
  comfortable: 'text-4xl sm:text-5xl lg:text-6xl',
} as const;

const eyebrowSize = 'text-xs sm:text-sm';
const sublineSize = {
  compact: 'text-base sm:text-lg',
  comfortable: 'text-lg sm:text-xl',
} as const;

const densityRhythm = {
  compact: {
    eyebrowToHeadline: 'mt-3',
    headlineToSubline: 'mt-2',
    sublineToCtas: 'mt-5',
    ctasToInstall: 'mt-6',
    installToMeta: 'mt-4',
  },
  comfortable: {
    eyebrowToHeadline: rhythm.eyebrowToHeadline,
    headlineToSubline: rhythm.headlineToSubline,
    sublineToCtas: rhythm.sublineToCtas,
    ctasToInstall: rhythm.ctasToMeta,
    installToMeta: rhythm.metaToInstall,
  },
} as const;

export interface PixelHeroSectionProps extends React.HTMLAttributes<HTMLElement> {
  variant?: HeroVariant;
  eyebrow?: string;
  headline: string;
  headlineEffect?: HeadlineEffect;
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
      headlineEffect: _headlineEffect = 'none',
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
    const s = surfaceClasses(surface);
    const sp = densityRhythm[density];
    const t = tone[toneProp];

    const isCentered = variant === 'centered';
    const isSplit = variant === 'split' && media;
    const isParallax = variant === 'parallax';
    const align = isCentered || isParallax ? 'center' : 'start';

    const eyebrowNode = eyebrow ? (
      <span
        className={cn(
          eyebrowSize,
          s.fontDisplay,
          'uppercase tracking-[0.18em]',
          t.text,
        )}
      >
        {eyebrow}
      </span>
    ) : null;

    const headlineNode = (
      <h1
        className={cn(
          headlineSize[density],
          s.fontDisplay,
          'font-bold leading-tight text-retro-text',
          eyebrow && sp.eyebrowToHeadline,
        )}
      >
        {headline}
      </h1>
    );

    const sublineNode = subline ? (
      <p
        className={cn(
          sublineSize[density],
          s.font,
          'text-retro-muted leading-relaxed max-w-prose',
          sp.headlineToSubline,
          align === 'center' && 'mx-auto',
        )}
      >
        {subline}
      </p>
    ) : null;

    const ctaNode = (primaryCta || secondaryCta) ? (
      <PixelCluster
        gap={3}
        align="center"
        justify={align === 'center' ? 'center' : 'start'}
        surface={surface}
        className={sp.sublineToCtas}
      >
        {primaryCta}
        {secondaryCta}
      </PixelCluster>
    ) : null;

    const installNode = install ? (
      <div className={cn(sp.ctasToInstall, align === 'center' && 'mx-auto')}>
        {install}
      </div>
    ) : null;

    const metaNode = meta ? (
      <div className={cn(sp.installToMeta, align === 'center' && 'mx-auto')}>
        {meta}
      </div>
    ) : null;

    const textColumn = (
      <div
        className={cn(
          'flex flex-col',
          align === 'center' && 'items-center text-center mx-auto max-w-3xl',
        )}
      >
        {eyebrowNode}
        {headlineNode}
        {sublineNode}
        {ctaNode}
        {installNode}
        {metaNode}
      </div>
    );

    const body = isSplit ? (
      <PixelTwoColumn
        ratio="60/40"
        gap={8}
        stackBelow="md"
        align="center"
        left={textColumn}
        right={<div className="w-full">{media}</div>}
        surface={surface}
      />
    ) : isParallax ? (
      <div className="relative w-full">
        {media && (
          <div
            aria-hidden
            className="absolute inset-0 -z-10 overflow-hidden pointer-events-none"
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
          <div className={cn('mt-10 w-full', align === 'center' && 'mx-auto')}>
            {media}
          </div>
        )}
      </>
    );

    return (
      <section
        ref={ref as React.Ref<HTMLElement>}
        className={cn(
          'relative w-full flex flex-col justify-center',
          minHeightMap[minHeight],
          s.transition,
          className,
        )}
        {...rest}
      >
        <PixelContainer
          as="div"
          maxWidth="xl"
          padding={density === 'compact' ? 'md' : 'lg'}
          surface={surface}
        >
          {body}
        </PixelContainer>
      </section>
    );
  },
);

PixelHeroSection.displayName = 'PixelHeroSection';

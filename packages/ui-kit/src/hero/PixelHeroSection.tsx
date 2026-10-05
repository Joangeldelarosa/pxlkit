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
  type SectionHeaderLevel,
} from '@pxlkit/ui-kit-core';
import { cn, Surface, useEffectiveSurface } from '../common';
import { ToneKey } from '../tokens';
import { PixelContainer } from '../layout/PixelContainer';
import { PixelTwoColumn } from '../layout/PixelTwoColumn';
import { PixelCluster } from '../layout/PixelCluster';
import { PixelGlitch } from '../animations/PixelGlitch';
import { PixelTypewriter } from '../animations/PixelTypewriter';

export interface PixelHeroSectionProps extends React.HTMLAttributes<HTMLElement> {
  /**
   * `'centered'` and `'parallax'` centre the text; `'split'` puts the `media`
   * in a column beside it. Default `'centered'`.
   */
  variant?: HeroVariant;
  /** Small upper-cased line above the headline, in the tone. */
  eyebrow?: string;
  /** The headline: the page's `<h1>`, unless `as` sets another level. */
  headline: string;
  /**
   * Element of the headline. Default `'h1'`, the page's heading: a hero
   * embedded under the page's own `<h1>` (a demo, a template) takes a lower
   * level.
   */
  as?: SectionHeaderLevel;
  /**
   * Animates the headline: `'typewriter'` types it out once — screen readers
   * get the whole headline from the start — and `'glitch'` plays PixelGlitch
   * over it. Both hold still when the user prefers reduced motion. Default
   * `'none'`.
   */
  headlineEffect?: HeroHeadlineEffect;
  /** Paragraph under the headline. */
  subline?: string;
  /** First call to action. */
  primaryCta?: React.ReactNode;
  /** Second call to action, after the first. */
  secondaryCta?: React.ReactNode;
  /** Install snippet under the calls to action. */
  install?: React.ReactNode;
  /** Meta line at the end of the text. */
  meta?: React.ReactNode;
  /** Media, placed by the `variant`: beside the text, behind it or below it. */
  media?: React.ReactNode;
  /** Tone of the eyebrow. Default `'neutral'`. */
  tone?: ToneKey;
  /** Type sizes and vertical rhythm. Default `'comfortable'`. */
  density?: HeroDensity;
  /** Minimum height of the section. Default `'md'`. */
  minHeight?: HeroMinHeight;
  /** Surface override; defaults to the nearest provider. */
  surface?: Surface;
}

export const PixelHeroSection = forwardRef<HTMLElement, PixelHeroSectionProps>(
  function PixelHeroSection(
    {
      variant = 'centered',
      eyebrow,
      headline,
      as = 'h1',
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

    // One heading, its text once, whatever the effect: the glitch goes inside
    // the heading, as a span, and its copies of the text are drawn by CSS.
    const Heading = as as 'h1';
    const headlineNode = (
      <Heading className={c.headline}>
        {headlineEffect === 'typewriter' ? (
          <PixelTypewriter label={headline} tone="inherit" />
        ) : headlineEffect === 'glitch' ? (
          <PixelGlitch as="span" label={headline} />
        ) : (
          headline
        )}
      </Heading>
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
        {headlineNode}
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

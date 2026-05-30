'use client';

import React, { forwardRef } from 'react';
import { cn, Surface, useEffectiveSurface, surfaceClasses } from '../common';
import { rhythm, tone, ToneKey } from '../tokens';

const titleSize = {
  sm: 'text-xl sm:text-2xl',
  md: 'text-2xl sm:text-3xl',
  lg: 'text-3xl sm:text-4xl lg:text-5xl',
} as const;

const eyebrowSize = {
  sm: 'text-[10px]',
  md: 'text-xs',
  lg: 'text-xs sm:text-sm',
} as const;

const descriptionSize = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-base sm:text-lg',
} as const;

const blockSpacing = {
  tight: {
    eyebrowToTitle: 'mt-2',
    titleToDescription: 'mt-2',
    descriptionToActions: 'mt-4',
  },
  normal: {
    eyebrowToTitle: rhythm.eyebrowToHeadline,
    titleToDescription: rhythm.headlineToSubline,
    descriptionToActions: rhythm.sublineToCtas,
  },
  loose: {
    eyebrowToTitle: 'mt-6',
    titleToDescription: 'mt-5',
    descriptionToActions: 'mt-10',
  },
} as const;

export interface PixelSectionHeaderProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
  eyebrow?: string;
  title: string;
  titleTone?: ToneKey;
  description?: string;
  align?: 'start' | 'center';
  size?: 'sm' | 'md' | 'lg';
  spacing?: 'tight' | 'normal' | 'loose';
  actions?: React.ReactNode;
  as?: 'h1' | 'h2' | 'h3' | 'h4';
  surface?: Surface;
}

export const PixelSectionHeader = forwardRef<HTMLElement, PixelSectionHeaderProps>(
  function PixelSectionHeader(
    {
      eyebrow,
      title,
      titleTone,
      description,
      align = 'start',
      size = 'md',
      spacing = 'normal',
      actions,
      as = 'h2',
      surface: surfaceProp,
      className,
      ...rest
    },
    ref,
  ) {
    const surface = useEffectiveSurface(surfaceProp);
    const s = surfaceClasses(surface);
    const Heading = as as 'h2';
    const sp = blockSpacing[spacing];
    const titleColor = titleTone ? tone[titleTone].text : 'text-retro-text';
    const eyebrowColor = titleTone ? tone[titleTone].text : 'text-retro-muted';

    return (
      <header
        ref={ref as React.Ref<HTMLElement>}
        className={cn('w-full', className)}
        {...rest}
      >
        <div
          className={cn(
            'flex flex-col',
            align === 'center' && 'mx-auto text-center items-center max-w-3xl',
          )}
        >
          {eyebrow && (
            <span
              aria-hidden="true"
              className={cn(
                eyebrowSize[size],
                s.fontDisplay,
                'uppercase tracking-[0.18em]',
                eyebrowColor,
              )}
            >
              {eyebrow}
            </span>
          )}
          <Heading
            className={cn(
              titleSize[size],
              s.fontDisplay,
              'font-bold leading-tight',
              titleColor,
              eyebrow && sp.eyebrowToTitle,
            )}
          >
            {eyebrow && (
              <span className="sr-only">{`${eyebrow}: `}</span>
            )}
            {title}
          </Heading>
          {description && (
            <p
              className={cn(
                descriptionSize[size],
                s.font,
                'text-retro-muted leading-relaxed max-w-prose',
                sp.titleToDescription,
                align === 'center' && 'mx-auto',
              )}
            >
              {description}
            </p>
          )}
          {actions && (
            <div
              className={cn(
                'flex flex-wrap gap-3',
                sp.descriptionToActions,
                align === 'center' && 'justify-center',
              )}
            >
              {actions}
            </div>
          )}
        </div>
      </header>
    );
  },
);

PixelSectionHeader.displayName = 'PixelSectionHeader';

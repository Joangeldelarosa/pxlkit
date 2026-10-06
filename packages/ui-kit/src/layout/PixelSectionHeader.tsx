'use client';

import React, { forwardRef } from 'react';
import {
  sectionHeaderClasses,
  type SectionHeaderAlign,
  type SectionHeaderLevel,
  type SectionHeaderSize,
  type SectionHeaderSpacing,
} from '@pxlkit/ui-kit-core';
import { cn, Surface, useEffectiveSurface } from '../common';
import { ToneKey } from '../tokens';

export interface PixelSectionHeaderProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
  /** Small uppercase line above the title. */
  eyebrow?: string;
  /** The heading. */
  title: string;
  /** Tone of the title and eyebrow. */
  titleTone?: ToneKey;
  /** Paragraph under the title. */
  description?: string;
  /** Start-aligned, or centred with a capped width. */
  align?: SectionHeaderAlign;
  /** Type scale. */
  size?: SectionHeaderSize;
  /** Gaps between the blocks. */
  spacing?: SectionHeaderSpacing;
  /** Buttons or links under the description. */
  actions?: React.ReactNode;
  /** Heading level of the title. */
  as?: SectionHeaderLevel;
  /** Surface override; defaults to the nearest provider. */
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
    const c = sectionHeaderClasses(surface, { titleTone, align, size, spacing, eyebrow: Boolean(eyebrow) });
    const Heading = as as 'h2';

    return (
      <header
        ref={ref as React.Ref<HTMLElement>}
        className={cn(c.header, className)}
        {...rest}
      >
        <div className={c.stack}>
          {eyebrow && (
            <span aria-hidden="true" className={c.eyebrow}>
              {eyebrow}
            </span>
          )}
          <Heading className={c.title}>
            {eyebrow && (
              <span className="sr-only">{`${eyebrow}: `}</span>
            )}
            {title}
          </Heading>
          {description && <p className={c.description}>{description}</p>}
          {actions && <div className={c.actions}>{actions}</div>}
        </div>
      </header>
    );
  },
);

PixelSectionHeader.displayName = 'PixelSectionHeader';

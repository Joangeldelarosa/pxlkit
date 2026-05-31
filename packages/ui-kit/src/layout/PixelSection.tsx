'use client';

/* ─────────────────────────────────────────────────────────────────────────
   PixelSection — bordered section with optional title row and subtitle.
   ───────────────────────────────────────────────────────────────────────── */

import React, { forwardRef } from 'react';
import { cn, Surface, surfaceClasses, useEffectiveSurface } from '../common';
import { usePxlKitLocale } from '../locale';
import { PixelCenter } from './PixelCenter';
import {
  sectionRhythm,
  pageGutter,
  type ContainerWidth,
  type PageGutter,
  type SectionRhythmKey,
} from '../tokens';

export interface PixelSectionProps {
  /** Title rendered as an uppercase heading row at the top of the section. */
  title?: string;
  /** Optional subtitle below the title. */
  subtitle?: string;
  children: React.ReactNode;
  /** Surface variant. Falls back to nearest <PxlKitSurface>. */
  surface?: Surface;
  /** Inner container max-width. Pass `false` to skip the centered container wrapper. */
  container?: ContainerWidth | false;
  /** Vertical padding token (margin between consecutive sections). */
  verticalPadding?: SectionRhythmKey;
  /** Horizontal gutter token (used only when `container` is `false`). */
  horizontalGutter?: PageGutter;
}

export const PixelSection = forwardRef<HTMLElement, PixelSectionProps>(function PixelSection(
  {
    title,
    subtitle,
    children,
    surface: surfaceProp,
    container = '5xl',
    verticalPadding = 'xl',
    horizontalGutter = 'lg',
  },
  ref,
) {
  const surface = useEffectiveSurface(surfaceProp);
  const s = surfaceClasses(surface);
  const { upper } = usePxlKitLocale();

  const inner = (
    <>
      {title && (
        <div className="mb-4">
          <h3 className={cn('text-xs text-retro-green', surface === 'pixel' ? 'font-pixel' : 'font-semibold text-sm')}>{upper(title)}</h3>
          {subtitle && <p className={cn('mt-2 text-sm text-retro-muted', s.font)}>{subtitle}</p>}
        </div>
      )}
      {children}
    </>
  );

  return (
    <section
      ref={ref}
      className={cn(
        'bg-retro-card/40 p-4 sm:p-6',
        s.border,
        s.radiusLg,
        'border-retro-border/40',
        sectionRhythm[verticalPadding],
        !container && pageGutter[horizontalGutter],
      )}
    >
      {container ? (
        <PixelCenter maxWidth={container} gutter={horizontalGutter} surface={surface}>
          {inner}
        </PixelCenter>
      ) : (
        inner
      )}
    </section>
  );
});

PixelSection.displayName = 'PixelSection';

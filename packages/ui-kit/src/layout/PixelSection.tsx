'use client';

/* ─────────────────────────────────────────────────────────────────────────
   PixelSection — bordered section with optional title row and subtitle.
   ───────────────────────────────────────────────────────────────────────── */

import React, { forwardRef } from 'react';
import { sectionClasses } from '@pxlkit/ui-kit-core';
import { Surface, useEffectiveSurface } from '../common';
import { usePxlKitLocale } from '../locale';
import { PixelCenter } from './PixelCenter';
import { type ContainerWidth, type PageGutter, type SectionRhythmKey } from '../tokens';

export interface PixelSectionProps {
  /** Title rendered as an uppercase heading row at the top of the section. */
  title?: string;
  /** Optional subtitle below the title. */
  subtitle?: string;
  /** Section content. */
  children: React.ReactNode;
  /** Surface variant. Falls back to nearest <PxlKitSurface>. */
  surface?: Surface;
  /** Inner container max-width. Pass `false` to skip the centered container wrapper. */
  container?: ContainerWidth | false;
  /** Vertical padding token (margin between consecutive sections). */
  verticalPadding?: SectionRhythmKey;
  /** Horizontal gutter token (used only when `container` is `false`). */
  horizontalGutter?: PageGutter;
  /** Render with surface-aware border + radius chrome. Defaults to false (no chrome). */
  bordered?: boolean;
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
    bordered = false,
  },
  ref,
) {
  const surface = useEffectiveSurface(surfaceProp);
  const c = sectionClasses(surface, { bordered, verticalPadding, container, horizontalGutter });
  const { upper } = usePxlKitLocale();

  const inner = (
    <>
      {title && (
        <div className="mb-4">
          <h3 className={c.title}>{upper(title)}</h3>
          {subtitle && <p className={c.subtitle}>{subtitle}</p>}
        </div>
      )}
      {children}
    </>
  );

  return (
    <section ref={ref} className={c.section}>
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

'use client';

import React, { forwardRef } from 'react';
import {
  scrollAreaClasses,
  scrollAreaNameWarning,
  scrollAreaStyle,
  type ScrollAreaVariant,
} from '@pxlkit/ui-kit-core';
import { cn, Surface, useEffectiveSurface } from '../common';

export interface PixelScrollAreaProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'type'> {
  maxHeight?: string | number;
  /** Canonical structural variant (scrollbar visibility mode). */
  variant?: ScrollAreaVariant;
  /**
   * @deprecated Use `variant` instead. Retained as alias for one minor.
   */
  type?: ScrollAreaVariant;
  offsetScrollbars?: boolean;
  scrollbarSize?: number;
  surface?: Surface;
  /** Render with surface-aware border + radius chrome. Defaults to false (no chrome). */
  bordered?: boolean;
  /**
   * Accessible name for the scrollable region. Required for keyboard users to
   * understand what they've landed on. Provide either `aria-label` or
   * `aria-labelledby`. In dev, a missing label logs a warning.
   */
  'aria-label'?: string;
  'aria-labelledby'?: string;
  children: React.ReactNode;
}

/**
 * Surface-aware scroll container with styled scrollbar (CSS `scrollbar-width`
 * + `::-webkit-scrollbar`). Use `type` to control scrollbar visibility,
 * `maxHeight` to cap height before content scrolls.
 *
 * The styled scrollbar palette is owned by `styles.css` `.pxl-scroll-*`
 * classes; this component only wires the variant + dimensions.
 */
export const PixelScrollArea = forwardRef<HTMLDivElement, PixelScrollAreaProps>(function PixelScrollArea(
  {
    maxHeight,
    variant,
    type,
    offsetScrollbars = false,
    scrollbarSize,
    surface: surfaceProp,
    bordered = false,
    className,
    children,
    style,
    ...rest
  },
  ref,
) {
  const surface = useEffectiveSurface(surfaceProp);
  const resolvedVariant: ScrollAreaVariant = variant ?? type ?? 'auto';

  const inlineStyle: React.CSSProperties = {
    ...style,
    ...scrollAreaStyle({ maxHeight, scrollbarSize, offsetScrollbars }),
  };

  const ariaLabel = (rest as { 'aria-label'?: string })['aria-label'];
  const ariaLabelledBy = (rest as { 'aria-labelledby'?: string })['aria-labelledby'];
  const explicitTabIndex = (rest as { tabIndex?: number }).tabIndex;
  const explicitRole = (rest as { role?: string }).role;

  if (process.env.NODE_ENV !== 'production') {
    const warning = scrollAreaNameWarning({ label: ariaLabel, labelledBy: ariaLabelledBy, tabIndex: explicitTabIndex });
    // eslint-disable-next-line no-console
    if (warning) console.warn(warning);
  }

  return (
    <div
      ref={ref}
      data-scrollbar={resolvedVariant}
      data-surface={surface}
      role={explicitRole ?? 'region'}
      tabIndex={explicitTabIndex ?? 0}
      className={cn(scrollAreaClasses(surface, { variant: resolvedVariant, bordered }), className)}
      style={inlineStyle}
      {...rest}
    >
      {children}
    </div>
  );
});

PixelScrollArea.displayName = 'PixelScrollArea';

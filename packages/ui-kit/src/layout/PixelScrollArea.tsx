'use client';

import React, { forwardRef } from 'react';
import { cn, Surface, useEffectiveSurface, surfaceClasses } from '../common';

type ScrollType = 'auto' | 'always' | 'scroll' | 'hover';

export interface PixelScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  maxHeight?: string | number;
  type?: ScrollType;
  offsetScrollbars?: boolean;
  scrollbarSize?: number;
  surface?: Surface;
  /**
   * Accessible name for the scrollable region. Required for keyboard users to
   * understand what they've landed on. Provide either `aria-label` or
   * `aria-labelledby`. In dev, a missing label logs a warning.
   */
  'aria-label'?: string;
  'aria-labelledby'?: string;
  children: React.ReactNode;
}

const typeClass: Record<ScrollType, string> = {
  auto: 'pxl-scroll-auto overflow-auto',
  always: 'pxl-scroll-always overflow-scroll',
  scroll: 'pxl-scroll-scroll overflow-scroll',
  hover: 'pxl-scroll-hover overflow-auto',
};

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
    type = 'auto',
    offsetScrollbars = false,
    scrollbarSize,
    surface: surfaceProp,
    className,
    children,
    style,
    ...rest
  },
  ref,
) {
  const surface = useEffectiveSurface(surfaceProp);
  const s = surfaceClasses(surface);

  const inlineStyle: React.CSSProperties = {
    ...style,
    ...(maxHeight !== undefined
      ? { maxHeight: typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight }
      : null),
    ...(scrollbarSize !== undefined
      ? ({ ['--pxl-scrollbar-size' as string]: `${scrollbarSize}px` } as React.CSSProperties)
      : null),
    ...(offsetScrollbars
      ? { scrollbarGutter: 'stable' as React.CSSProperties['scrollbarGutter'] }
      : null),
  };

  const ariaLabel = (rest as { 'aria-label'?: string })['aria-label'];
  const ariaLabelledBy = (rest as { 'aria-labelledby'?: string })['aria-labelledby'];
  const explicitTabIndex = (rest as { tabIndex?: number }).tabIndex;
  const explicitRole = (rest as { role?: string }).role;

  if (
    process.env.NODE_ENV !== 'production' &&
    !ariaLabel &&
    !ariaLabelledBy &&
    explicitTabIndex === undefined
  ) {
    // eslint-disable-next-line no-console
    console.warn(
      '[PixelScrollArea] missing aria-label / aria-labelledby on a focusable scroll region. ' +
        'Provide one so keyboard + screen-reader users know what they\'re scrolling.',
    );
  }

  return (
    <div
      ref={ref}
      data-scrollbar={type}
      data-surface={surface}
      role={explicitRole ?? 'region'}
      tabIndex={explicitTabIndex ?? 0}
      className={cn(
        'relative outline-none focus-visible:ring-2 focus-visible:ring-retro-cyan/40',
        typeClass[type],
        s.font,
        surface === 'pixel' ? 'pxl-scroll-pixel' : 'pxl-scroll-linear',
        className,
      )}
      style={inlineStyle}
      {...rest}
    >
      {children}
    </div>
  );
});

PixelScrollArea.displayName = 'PixelScrollArea';

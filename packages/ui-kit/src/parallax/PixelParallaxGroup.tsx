'use client';

/* ─────────────────────────────────────────────────────────────────────────
   PixelParallaxGroup — perspective/viewport container for parallax children
   ───────────────────────────────────────────────────────────────────────── */

import React, { forwardRef } from 'react';
import { parallaxGroupClasses, type ParallaxGroupElement } from '@pxlkit/ui-kit-core';
import { cn } from '../common';

export interface PixelParallaxGroupProps {
  /** The layers (`PixelParallaxLayer`, `PixelMouseParallax`). */
  children: React.ReactNode;
  /** Extra classes on the root element. */
  className?: string;
  /** Inline styles of the root element. */
  style?: React.CSSProperties;
  /** HTML tag to render. Default `"div"`. */
  as?: ParallaxGroupElement;
}

/**
 * PixelParallaxGroup — Container that establishes a perspective context.
 *
 * Wrap multiple `PixelParallaxLayer` or `PixelMouseParallax` elements inside
 * this to clip them within a shared viewport area. Applies `overflow: hidden`
 * and `position: relative` automatically.
 */
export const PixelParallaxGroup = forwardRef<HTMLElement, PixelParallaxGroupProps>(
  function PixelParallaxGroup({ children, className, style, as = 'div' }, ref) {
    const Tag = as as 'div';
    return (
      <Tag
        ref={ref as React.Ref<HTMLDivElement>}
        className={cn(parallaxGroupClasses, className)}
        style={style}
      >
        {children}
      </Tag>
    );
  }
);

PixelParallaxGroup.displayName = 'PixelParallaxGroup';

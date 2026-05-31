'use client';

/* ─────────────────────────────────────────────────────────────────────────
   PixelParallaxGroup — perspective/viewport container for parallax children
   ───────────────────────────────────────────────────────────────────────── */

import React, { forwardRef } from 'react';
import { cn } from '../common';

type GroupTag = 'div' | 'section' | 'header' | 'main';

export interface PixelParallaxGroupProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  /** HTML tag to render. Default `"div"`. */
  as?: GroupTag;
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
        className={cn('relative overflow-hidden', className)}
        style={style}
      >
        {children}
      </Tag>
    );
  }
);

PixelParallaxGroup.displayName = 'PixelParallaxGroup';

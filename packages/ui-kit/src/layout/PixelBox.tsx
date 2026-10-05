'use client';

import React, { forwardRef, useEffect } from 'react';
import {
  boxClasses,
  boxLandmarkWarning,
  type BoxElement,
  type BoxPadding,
  type BoxRadius,
} from '@pxlkit/ui-kit-core';
import { cn, Surface, Tone, Variant, useEffectiveSurface } from '../common';

export interface PixelBoxProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'color'> {
  /** Tone of the fill and border. */
  tone?: Tone;
  /** Surface override; defaults to the nearest provider. */
  surface?: Surface;
  /** `solid` and `soft` fill; `outline` and `ghost` stay transparent. */
  variant?: Variant;
  /** Padding scale. */
  padding?: BoxPadding;
  /** Fixed radius; the surface's large radius when unset. */
  radius?: BoxRadius;
  /**
   * Whether to render a border. Defaults to `true` when `variant === 'outline'`
   * (outlines without a border are meaningless), `false` otherwise. Pass `true`
   * to force a border on `solid`/`soft`/`ghost`; pass `false` to force-off on
   * outline. Note: when polymorphic `as` is a landmark element (`section`,
   * `nav`, `aside`, `main`), supply `aria-label` or `aria-labelledby` for a11y.
   */
  border?: boolean;
  /** Surface drop shadow. */
  shadow?: boolean;
  /** Element to render. */
  as?: BoxElement;
}

/**
 * Surface-aware container box.
 *
 * Polymorphic ref note: the ref is typed `HTMLDivElement` because that's the
 * default render target. When you set `as="nav"` / `"section"` etc, the
 * underlying element is still focusable/queryable via the ref — TypeScript
 * just won't know the narrower subtype. If you need a narrower type, cast at
 * the call site or use `React.useRef<HTMLElement>()`.
 */
export const PixelBox = forwardRef<HTMLDivElement, PixelBoxProps>(function PixelBox(
  {
    tone = 'neutral',
    surface: surfaceProp,
    variant = 'solid',
    padding = 'md',
    radius,
    border,
    shadow = false,
    as,
    className,
    children,
    ...rest
  },
  ref,
) {
  const surface = useEffectiveSurface(surfaceProp);
  const Comp = (as ?? 'div') as 'div';

  useEffect(() => {
    if (process.env.NODE_ENV === 'production') return;
    const r = rest as Record<string, unknown>;
    const warning = boxLandmarkWarning(as, {
      label: r['aria-label'],
      labelledBy: r['aria-labelledby'],
      title: r['title'],
    });
    // eslint-disable-next-line no-console
    if (warning) console.warn(warning);
  }, [as, rest]);

  return (
    <Comp
      ref={ref}
      className={cn(boxClasses(surface, { tone, variant, padding, radius, border, shadow }), className)}
      {...rest}
    >
      {children}
    </Comp>
  );
});

PixelBox.displayName = 'PixelBox';

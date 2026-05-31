'use client';

import React, { forwardRef, useEffect } from 'react';
import { cn, Surface, Tone, Variant, useEffectiveSurface, surfaceClasses } from '../common';
import { tone as toneTokens } from '../tokens';

type BoxPadding = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
type BoxRadius = 'none' | 'sm' | 'md' | 'lg' | 'full';
type BoxAs =
  | 'div'
  | 'section'
  | 'article'
  | 'aside'
  | 'header'
  | 'footer'
  | 'main'
  | 'nav';

const paddingMap: Record<BoxPadding, string> = {
  none: 'p-0',
  xs: 'px-2 py-1',
  sm: 'px-3 py-2',
  md: 'px-4 py-3',
  lg: 'px-6 py-4',
  xl: 'px-8 py-6',
};

const radiusMap: Record<BoxRadius, string> = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  full: 'rounded-full',
};

const LANDMARK_TAGS = new Set<BoxAs>(['section', 'nav', 'aside', 'main']);

export interface PixelBoxProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'color'> {
  tone?: Tone;
  surface?: Surface;
  variant?: Variant;
  padding?: BoxPadding;
  radius?: BoxRadius;
  /**
   * Whether to render a border. Defaults to `true` when `variant === 'outline'`
   * (outlines without a border are meaningless), `false` otherwise. Pass `true`
   * to force a border on `solid`/`soft`/`ghost`; pass `false` to force-off on
   * outline. Note: when polymorphic `as` is a landmark element (`section`,
   * `nav`, `aside`, `main`), supply `aria-label` or `aria-labelledby` for a11y.
   */
  border?: boolean;
  shadow?: boolean;
  as?: BoxAs;
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
  const s = surfaceClasses(surface);
  const Comp = (as ?? 'div') as 'div';
  const t = toneTokens[tone];

  const variantBg =
    variant === 'solid'
      ? t.bg
      : variant === 'soft'
        ? t.soft
        : null;

  const variantBorder =
    variant === 'solid' || variant === 'soft' || variant === 'outline'
      ? t.border
      : null;

  // Outline without a border is meaningless. Make border implicit-on for the
  // outline variant when the consumer hasn't explicitly opted out.
  const wantsBorder = border ?? variant === 'outline';
  const showBorder = wantsBorder && variantBorder;

  useEffect(() => {
    if (process.env.NODE_ENV === 'production') return;
    if (!as || !LANDMARK_TAGS.has(as)) return;
    const r = rest as Record<string, unknown>;
    if (r['aria-label'] || r['aria-labelledby'] || r['title']) return;
    // eslint-disable-next-line no-console
    console.warn(
      `[pxlkit] PixelBox as="${as}" is a landmark/sectioning element but has no accessible name. ` +
        `Add aria-label, aria-labelledby, or title.`,
    );
  }, [as, rest]);

  return (
    <Comp
      ref={ref}
      className={cn(
        paddingMap[padding],
        radius ? radiusMap[radius] : s.radiusLg,
        variantBg,
        showBorder && s.border,
        showBorder && variantBorder,
        shadow && s.shadow,
        className,
      )}
      {...rest}
    >
      {children}
    </Comp>
  );
});

PixelBox.displayName = 'PixelBox';

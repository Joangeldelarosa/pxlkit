import React, { forwardRef } from 'react';
import {
  Tone, Size, Surface, cn,
  toneMap, surfaceClasses, useEffectiveSurface,
} from '../common';
import { variantClasses, PixelBadgeVariant } from './_internal/variantClasses';

/* ─────────────────────────────────────────────────────────────────────────
   PixelBadge — status badge. Pixel surface = chamfered, linear = pill.

   Upgraded additively: `variant` (soft default | solid | outline | ghost),
   `size` (sm | md | lg), `iconLeft`, and `onClick`. When `onClick` is
   provided, the root renders as a `<button>` for native keyboard semantics.
   ───────────────────────────────────────────────────────────────────────── */

export type { PixelBadgeVariant } from './_internal/variantClasses';

const badgeSizeCls: Record<Size, string> = {
  sm: 'px-2 py-0.5 text-[10px] gap-1',
  md: 'px-2.5 py-1 text-[11px] gap-1.5',
  lg: 'px-3 py-1.5 text-xs gap-1.5',
};

export interface PixelBadgeProps extends Omit<React.HTMLAttributes<HTMLElement>, 'onClick'> {
  /** Badge content. */
  children: React.ReactNode;
  /** Tone tint. Defaults to `'green'`. */
  tone?: Tone;
  /** Visual surface override. */
  surface?: Surface;
  /** Variant axis: soft (default), solid, outline, ghost. */
  variant?: PixelBadgeVariant;
  /** Size scale. Defaults to `'md'`. */
  size?: Size;
  /** Optional leading icon. */
  iconLeft?: React.ReactNode;
  /** When provided the root renders as a `<button>` for keyboard / SR parity. */
  onClick?: React.MouseEventHandler<HTMLElement>;
}

export const PixelBadge = forwardRef<HTMLElement, PixelBadgeProps>(function PixelBadge(
  {
    children,
    tone = 'green',
    surface: surfaceProp,
    variant = 'soft',
    size = 'md',
    iconLeft,
    onClick,
    className,
    ...rest
  },
  ref,
) {
  const surface = useEffectiveSurface(surfaceProp);
  const s = surfaceClasses(surface);
  const cls = cn(
    'inline-flex items-center leading-none',
    s.border,
    s.radiusFull,
    s.font,
    badgeSizeCls[size],
    variantClasses(variant, tone),
    onClick && cn(
      'cursor-pointer transition-colors',
      toneMap[tone].hover,
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-retro-bg',
      toneMap[tone].ring,
    ),
    className,
  );
  const content = (
    <>
      {iconLeft && <span className="inline-flex items-center shrink-0">{iconLeft}</span>}
      {children}
    </>
  );
  if (onClick) {
    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        type="button"
        className={cls}
        onClick={onClick as React.MouseEventHandler<HTMLButtonElement>}
        {...(rest as React.ButtonHTMLAttributes<HTMLButtonElement>)}
      >
        {content}
      </button>
    );
  }
  return (
    <span
      ref={ref as React.Ref<HTMLSpanElement>}
      className={cls}
      {...rest}
    >
      {content}
    </span>
  );
});
PixelBadge.displayName = 'PixelBadge';

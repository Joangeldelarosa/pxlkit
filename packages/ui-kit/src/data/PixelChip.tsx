import React, { forwardRef } from 'react';
import {
  Tone, Size, Surface, cn,
  toneMap, surfaceClasses, useEffectiveSurface,
  CloseIcon,
} from '../common';
import { variantClasses, PixelBadgeVariant } from './_internal/variantClasses';

/* ─────────────────────────────────────────────────────────────────────────
   PixelChip — label tag, optionally removable / clickable.

   Upgraded additively: `variant`, `size`, `iconLeft`, `onClick` (chip becomes
   button), and `deletable` + `onDelete` (X button on the right). `onRemove`
   stays as the legacy delete handler alias.
   ───────────────────────────────────────────────────────────────────────── */

const chipSizeCls: Record<Size, string> = {
  sm: 'px-2 py-0.5 text-[11px] gap-1 tracking-wide',
  md: 'px-2.5 py-1 text-xs gap-1.5 tracking-wide',
  lg: 'px-3 py-1.5 text-sm gap-2 tracking-wide',
};

export interface PixelChipProps extends Omit<React.HTMLAttributes<HTMLElement>, 'onClick'> {
  /** Chip label. */
  label: string;
  /** Tone tint. Defaults to `'cyan'`. */
  tone?: Tone;
  /** Visual surface override. */
  surface?: Surface;
  /** Variant axis shared with PixelBadge. */
  variant?: PixelBadgeVariant;
  /** Size scale. Defaults to `'md'`. */
  size?: Size;
  /** Optional leading icon. */
  iconLeft?: React.ReactNode;
  /** Legacy alias for `onDelete`. */
  onRemove?: () => void;
  /** When true (or when onDelete is provided), renders an X button on the right. */
  deletable?: boolean;
  /** Called when the X button is activated. */
  onDelete?: () => void;
  /** When provided the root renders as a `<button>`. The delete X stays a nested button. */
  onClick?: React.MouseEventHandler<HTMLElement>;
}

export const PixelChip = forwardRef<HTMLElement, PixelChipProps>(function PixelChip(
  {
    label,
    tone = 'cyan',
    surface: surfaceProp,
    variant = 'soft',
    size = 'md',
    iconLeft,
    onRemove,
    deletable,
    onDelete,
    onClick,
    className,
    ...rest
  },
  ref,
) {
  const surface = useEffectiveSurface(surfaceProp);
  const s = surfaceClasses(surface);
  const removeHandler = onDelete ?? onRemove;
  const showDelete = !!removeHandler && (deletable !== false);

  const cls = cn(
    'inline-flex items-center',
    s.border,
    s.radius,
    s.font,
    chipSizeCls[size],
    variantClasses(variant, tone),
    onClick && cn(
      'cursor-pointer transition-colors',
      toneMap[tone].hover,
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-retro-bg',
      toneMap[tone].ring,
    ),
    className,
  );

  const inner = (
    <>
      {iconLeft && <span className="inline-flex items-center shrink-0">{iconLeft}</span>}
      <span>{label}</span>
      {showDelete && (
        <button
          type="button"
          className={cn('p-0.5 transition-colors hover:bg-retro-bg/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-offset-retro-bg', toneMap[tone].ring, s.radius)}
          onClick={(e) => {
            e.stopPropagation();
            removeHandler!();
          }}
          aria-label={`Remove ${label}`}
        >
          <CloseIcon className="h-2 w-2" />
        </button>
      )}
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
        {inner}
      </button>
    );
  }

  return (
    <span
      ref={ref as React.Ref<HTMLSpanElement>}
      className={cls}
      {...rest}
    >
      {inner}
    </span>
  );
});
PixelChip.displayName = 'PixelChip';

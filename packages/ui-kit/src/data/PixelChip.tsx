import React, { forwardRef } from 'react';
import { chipClasses, chipDeleteLabel } from '@pxlkit/ui-kit-core';
import {
  Tone, Size, Surface, cn,
  useEffectiveSurface,
  CloseIcon,
} from '../common';
import { PixelBadgeVariant } from './_internal/variantClasses';

/* ─────────────────────────────────────────────────────────────────────────
   PixelChip — label tag, optionally removable / clickable.

   Upgraded additively: `variant`, `size`, `iconLeft`, `onClick` (chip becomes
   button), and `deletable` + `onDelete` (X button on the right). `onRemove`
   stays as the legacy delete handler alias. A chip that is both clickable
   and deletable is a frame around two sibling buttons, the label and the X:
   a button cannot contain a button.
   ───────────────────────────────────────────────────────────────────────── */

export interface PixelChipProps extends Omit<React.HTMLAttributes<HTMLElement>, 'onClick'> {
  /** Chip label. */
  label: string;
  /** Selection value consumed by a wrapping PixelChipGroup. Never rendered to the DOM. */
  value?: string;
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
  /**
   * When provided the root renders as a `<button>`. With a delete handler too,
   * a button cannot contain a button, so the label and the X become sibling
   * buttons in a `<span>` frame that draws the chip; the label button takes the
   * ref and the other props, the frame takes `className`.
   */
  onClick?: React.MouseEventHandler<HTMLElement>;
}

export const PixelChip = forwardRef<HTMLElement, PixelChipProps>(function PixelChip(
  {
    label,
    value: _value,
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
  const removeHandler = onDelete ?? onRemove;
  const showDelete = !!removeHandler && (deletable !== false);
  const classes = chipClasses(surface, { tone, variant, size, interactive: !!onClick });
  const cls = cn(classes.root, className);

  const content = (
    <>
      {iconLeft && <span className={classes.icon}>{iconLeft}</span>}
      <span>{label}</span>
    </>
  );
  const deleteButton = showDelete && (
    <button
      type="button"
      className={classes.deleteButton}
      onClick={(e) => {
        e.stopPropagation();
        removeHandler!();
      }}
      aria-label={chipDeleteLabel(label)}
    >
      <CloseIcon className={classes.deleteIcon} />
    </button>
  );

  if (onClick && showDelete) {
    return (
      <span className={cn(classes.frame, className)}>
        <button
          ref={ref as React.Ref<HTMLButtonElement>}
          type="button"
          data-chip-action=""
          className={classes.action}
          onClick={onClick as React.MouseEventHandler<HTMLButtonElement>}
          {...(rest as React.ButtonHTMLAttributes<HTMLButtonElement>)}
        >
          {content}
        </button>
        {deleteButton}
      </span>
    );
  }

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
      {deleteButton}
    </span>
  );
});
PixelChip.displayName = 'PixelChip';

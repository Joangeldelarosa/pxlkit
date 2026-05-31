import React, { forwardRef, useRef, useState } from 'react';
import { useIsomorphicLayoutEffect } from '../hooks/useIsomorphicLayoutEffect';
import {
  Tone, Size, Surface, Variant, cn,
  toneMap, sizeClass, focusRing, surfaceClasses, useEffectiveSurface,
} from '../common';

/* ─────────────────────────────────────────────────────────────────────────
   PixelButton — versatile button with tones, sizes, icon slots, loading,
   variants (solid | soft | outline | ghost), surface aesthetic, asChild slot.
   ───────────────────────────────────────────────────────────────────────── */

/**
 * Public prop bag for {@link PixelButton}. Extends every native
 * `<button>` attribute, so consumers can pass `name`, `form`,
 * `formAction`, `type`, `aria-*` etc. without ceremony.
 */
export interface PixelButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Color tone (maps to `toneMap`). */
  tone?: Tone;
  /** Visual size (`xs`–`xl`). */
  size?: Size;
  /** Full Variant union — `solid` | `soft` | `outline` | `ghost`. */
  variant?: Variant;
  /** Surface aesthetic override; defaults to nearest provider. */
  surface?: Surface;
  /** Leading icon node; replaced by a spinner while `loading` is true. */
  iconLeft?: React.ReactNode;
  /** Trailing icon node. */
  iconRight?: React.ReactNode;
  /** When true, swaps the left icon for a spinner and force-disables the button. */
  loading?: boolean;
  /** Stretch to fill the parent's inline axis (`w-full`). */
  fullWidth?: boolean;
  /**
   * Render the children as the root element (Radix Slot pattern). Expects a
   * SINGLE React element child; receives merged className, ref, and onClick.
   * Useful for `<Link>` / `<a>` wrappers without sacrificing the styling.
   */
  asChild?: boolean;
}

function mergeRefs<T>(...refs: Array<React.Ref<T> | undefined | null>): React.RefCallback<T> {
  return (node) => {
    refs.forEach((r) => {
      if (!r) return;
      if (typeof r === 'function') r(node);
      else (r as React.MutableRefObject<T | null>).current = node;
    });
  };
}

export const PixelButton = forwardRef<HTMLButtonElement, PixelButtonProps>(function PixelButton(
  {
    tone = 'green',
    size = 'md',
    variant = 'solid',
    surface: surfaceProp,
    iconLeft,
    iconRight,
    loading,
    fullWidth,
    asChild,
    className,
    children,
    onClick,
    ...rest
  },
  ref,
) {
  const surface = useEffectiveSurface(surfaceProp);
  const s = surfaceClasses(surface);
  const t = toneMap[tone];
  const isGhost = variant === 'ghost';
  const isOutline = variant === 'outline';
  const isSoft = variant === 'soft';

  // Pin min-width to pre-load measurement so the button doesn't collapse when
  // the spinner replaces wider text content.
  const innerRef = useRef<HTMLButtonElement | null>(null);
  const [minWidth, setMinWidth] = useState<number | null>(null);
  const prevLoading = useRef<boolean>(!!loading);
  useIsomorphicLayoutEffect(() => {
    // Capture the rendered width the frame BEFORE we flip into loading.
    if (!prevLoading.current && loading && innerRef.current) {
      setMinWidth(innerRef.current.getBoundingClientRect().width);
    }
    if (!loading) setMinWidth(null);
    prevLoading.current = !!loading;
  }, [loading]);

  const variantClasses = isGhost
    ? cn('border border-transparent bg-transparent', t.hover)
    : isOutline
      ? cn(s.border, t.border, 'bg-transparent', t.hover, !rest.disabled && s.shadow, !rest.disabled && s.shadowHover)
      : isSoft
        ? cn(s.border, t.border, t.soft, t.hover, !rest.disabled && s.shadow, !rest.disabled && s.shadowHover)
        : cn(s.border, t.border, t.bg, t.hover, !rest.disabled && s.shadow, !rest.disabled && s.shadowHover);

  const mergedClassName = cn(
    'inline-flex items-center justify-center font-medium outline-none disabled:opacity-50 disabled:cursor-not-allowed',
    s.font, s.radius, s.transition,
    sizeClass[size],
    focusRing,
    t.ring,
    t.text,
    fullWidth && 'w-full',
    variantClasses,
    !rest.disabled && (isGhost || isOutline ? 'active:scale-[0.97]' : s.shadowActive),
    className,
  );

  const callerStyle = (rest as { style?: React.CSSProperties }).style;
  const mergedStyle: React.CSSProperties | undefined =
    minWidth !== null ? { ...callerStyle, minWidth: `${minWidth}px` } : callerStyle;

  const content = (
    <>
      {loading ? (
        <span
          data-testid="pxl-button-spinner"
          aria-hidden
          className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-r-transparent"
        />
      ) : (
        iconLeft
      )}
      <span>{children}</span>
      {iconRight}
    </>
  );

  // asChild slot pattern: clone the single child, merging className/ref/onClick.
  // Useful for `<Link>`/`<a>` wrappers. Single-child only — multiple children
  // get re-routed through the regular <button> path.
  if (asChild && React.isValidElement(children)) {
    const child = children as React.ReactElement<{
      className?: string;
      onClick?: React.MouseEventHandler<HTMLElement>;
      ref?: React.Ref<HTMLElement>;
    }>;
    const childProps = child.props as {
      className?: string;
      onClick?: React.MouseEventHandler<HTMLElement>;
      ref?: React.Ref<HTMLElement>;
    };
    return React.cloneElement(child, {
      className: cn(mergedClassName, childProps.className),
      onClick: (e: React.MouseEvent<HTMLElement>) => {
        childProps.onClick?.(e);
        onClick?.(e as unknown as React.MouseEvent<HTMLButtonElement>);
      },
      ref: mergeRefs(ref as React.Ref<HTMLElement>, (child as unknown as { ref?: React.Ref<HTMLElement> }).ref ?? null),
    } as Partial<typeof childProps> & { ref?: React.Ref<HTMLElement> });
  }

  return (
    <button
      {...rest}
      ref={mergeRefs<HTMLButtonElement>(ref, innerRef)}
      className={mergedClassName}
      style={mergedStyle}
      disabled={loading || rest.disabled}
      onClick={onClick}
    >
      {content}
    </button>
  );
});

PixelButton.displayName = 'PixelButton';

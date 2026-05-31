import React, { forwardRef, useRef, useState } from 'react';
import { useIsomorphicLayoutEffect } from './hooks/useIsomorphicLayoutEffect';
import {
  Tone, Size, Surface, Option, Variant, cn, useClickOutside,
  toneMap, sizeClass, sizeSquare, focusRing, surfaceClasses, useEffectiveSurface,
  ChevronDownIcon,
} from './common';

/* ──────────────────────────────────────────────────────────────────────────
   PixelButton — versatile button with tones, sizes, icon slots, loading,
   variants (solid | soft | outline | ghost), surface aesthetic, and asChild
   slot pattern.
   ────────────────────────────────────────────────────────────────────────── */

/**
 * Public prop bag for {@link PixelButton}. Extends every native
 * `<button>` attribute, so consumers can pass `name`, `form`,
 * `formAction`, `type`, `aria-*` etc. without ceremony.
 */
export interface PixelButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  tone?: Tone;
  size?: Size;
  /** Full Variant union — `solid` | `soft` | `outline` | `ghost`. */
  variant?: Variant;
  surface?: Surface;
  iconLeft?: React.ReactNode;
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

/* ──────────────────────────────────────────────────────────────────────────
   PixelIconButton — square icon-only button with required `label` for
   screen readers. Accessible via `aria-label` + `title`.
   ────────────────────────────────────────────────────────────────────────── */

/** Public prop bag for {@link PixelIconButton}. */
export interface PixelIconButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  /** Accessible label — set as `aria-label` and `title`. Required. */
  label: string;
  tone?: Tone;
  size?: Size;
  surface?: Surface;
  /** The icon to render inside the square. */
  icon: React.ReactNode;
}

export const PixelIconButton = forwardRef<HTMLButtonElement, PixelIconButtonProps>(function PixelIconButton(
  {
    label,
    tone = 'cyan',
    size = 'md',
    surface: surfaceProp,
    icon,
    className,
    ...rest
  },
  ref,
) {
  const surface = useEffectiveSurface(surfaceProp);
  const s = surfaceClasses(surface);
  const t = toneMap[tone];
  return (
    <button
      ref={ref}
      aria-label={label}
      title={label}
      className={cn(
        'inline-flex items-center justify-center outline-none disabled:opacity-50 disabled:cursor-not-allowed',
        s.border, s.radius, s.transition,
        sizeSquare[size],
        t.text, t.border, t.bg, t.hover,
        focusRing, t.ring,
        !rest.disabled && s.shadow, !rest.disabled && s.shadowHover, !rest.disabled && s.shadowActive,
        className,
      )}
      {...rest}
    >
      <span className="inline-flex items-center justify-center shrink-0 leading-none">{icon}</span>
    </button>
  );
});

/**
 * @deprecated Renamed to {@link PixelIconButton}. The `PxlKit*` prefix is
 * reserved for system primitives (`PxlKitSurfaceProvider`,
 * `PxlKitLocaleProvider`); leaf components use `Pixel*`. The alias will be
 * removed in the next major.
 */
export const PxlKitButton = PixelIconButton;
/** @deprecated Renamed to {@link PixelIconButtonProps}. */
export type PxlKitButtonProps = PixelIconButtonProps;

/* ──────────────────────────────────────────────────────────────────────────
   PixelSplitButton — primary action + chevron dropdown for secondary options.
   ────────────────────────────────────────────────────────────────────────── */

/** Public prop bag for {@link PixelSplitButton}. */
export interface PixelSplitButtonProps {
  /** Text shown on the primary (left) button. */
  label: string;
  /** Options shown in the dropdown menu. */
  options: Option[];
  tone?: Tone;
  surface?: Surface;
  disabled?: boolean;
  onPrimary?: () => void;
  onSelect?: (value: string) => void;
}

export const PixelSplitButton = forwardRef<HTMLDivElement, PixelSplitButtonProps>(function PixelSplitButton(
  {
    label,
    options,
    tone = 'purple',
    surface: surfaceProp,
    disabled = false,
    onPrimary,
    onSelect,
  },
  ref,
) {
  const surface = useEffectiveSurface(surfaceProp);
  const s = surfaceClasses(surface);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  useClickOutside(rootRef, () => setOpen(false));

  return (
    <div
      ref={(node) => {
        rootRef.current = node;
        if (typeof ref === 'function') ref(node);
        else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
      }}
      className="relative inline-flex"
    >
      <div className={cn('inline-flex overflow-hidden', s.border, s.radius, toneMap[tone].border)}>
        <PixelButton
          tone={tone}
          surface={surface}
          disabled={disabled}
          className="rounded-none border-0 shadow-none hover:shadow-none active:shadow-none hover:translate-x-0 hover:translate-y-0 active:translate-x-0 active:translate-y-0"
          onClick={onPrimary}
        >
          {label}
        </PixelButton>
        <button
          type="button"
          aria-label="More options"
          aria-haspopup="menu"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            'flex items-center border-0 border-l px-2 outline-none disabled:opacity-50 disabled:cursor-not-allowed',
            s.transition,
            toneMap[tone].border,
            toneMap[tone].bg, toneMap[tone].hover, toneMap[tone].text,
          )}
          onClick={() => setOpen(!open)}
        >
          <ChevronDownIcon className={cn('transition-transform', open && 'rotate-180')} />
        </button>
      </div>
      {open && (
        <div
          role="menu"
          className={cn(
            'absolute left-0 top-full z-40 mt-1 min-w-40 bg-retro-bg p-1 shadow-xl',
            s.border, s.radiusLg, 'border-retro-border-strong',
          )}
        >
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              role="menuitem"
              className={cn(
                'flex w-full items-center text-left text-xs px-3 py-2 text-retro-muted transition-colors hover:bg-retro-surface hover:text-retro-text',
                s.font, s.radius,
              )}
              onClick={() => { onSelect?.(opt.value); setOpen(false); }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
});

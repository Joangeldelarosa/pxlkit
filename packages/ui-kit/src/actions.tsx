import React, { useRef, useState } from 'react';
import {
  Tone, Size, Surface, Option, cn, useClickOutside,
  toneMap, sizeClass, focusRing, surfaceClasses, useEffectiveSurface,
  ChevronDownIcon,
} from './common';

/* ──────────────────────────────────────────────────────────────────────────
   PixelButton — versatile button with tones, sizes, icon slots, loading,
   ghost variant, and surface aesthetic (pixel | linear).
   ────────────────────────────────────────────────────────────────────────── */

export function PixelButton({
  tone = 'green',
  size = 'md',
  variant = 'solid',
  surface: surfaceProp,
  iconLeft,
  iconRight,
  loading,
  className,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  tone?: Tone;
  size?: Size;
  variant?: 'solid' | 'ghost';
  surface?: Surface;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  loading?: boolean;
}) {
  const surface = useEffectiveSurface(surfaceProp);
  const s = surfaceClasses(surface);
  const t = toneMap[tone];
  const isGhost = variant === 'ghost';
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center font-medium outline-none disabled:opacity-50 disabled:cursor-not-allowed',
        s.font, s.radius, s.transition,
        sizeClass[size],
        focusRing,
        t.ring,
        t.text,
        isGhost
          ? cn('border border-transparent bg-transparent', t.hover)
          : cn(s.border, t.border, t.bg, t.hover, !props.disabled && s.shadow, !props.disabled && s.shadowHover),
        !props.disabled && (isGhost ? 'active:scale-[0.97]' : s.shadowActive),
        className,
      )}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-r-transparent" /> : iconLeft}
      <span>{children}</span>
      {iconRight}
    </button>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   PxlKitButton — square icon-only button. Accessible via `label`.
   ────────────────────────────────────────────────────────────────────────── */

export function PxlKitButton({
  label,
  tone = 'cyan',
  size = 'md',
  surface: surfaceProp,
  icon,
  className,
  ...props
}: Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'> & {
  label: string;
  tone?: Tone;
  size?: Size;
  surface?: Surface;
  icon: React.ReactNode;
}) {
  const surface = useEffectiveSurface(surfaceProp);
  const s = surfaceClasses(surface);
  const t = toneMap[tone];
  const dim = size === 'sm' ? 'h-8 w-8' : size === 'lg' ? 'h-12 w-12' : 'h-10 w-10';
  return (
    <button
      aria-label={label}
      title={label}
      className={cn(
        'inline-flex items-center justify-center outline-none disabled:opacity-50 disabled:cursor-not-allowed',
        s.border, s.radius, s.transition,
        dim,
        t.text, t.border, t.bg, t.hover,
        focusRing, t.ring,
        !props.disabled && s.shadow, !props.disabled && s.shadowHover, !props.disabled && s.shadowActive,
        className,
      )}
      {...props}
    >
      <span className="inline-flex items-center justify-center shrink-0 leading-none">{icon}</span>
    </button>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   PixelSplitButton — primary action + chevron dropdown for secondary options.
   ────────────────────────────────────────────────────────────────────────── */

export function PixelSplitButton({
  label,
  options,
  tone = 'purple',
  surface: surfaceProp,
  disabled = false,
  onPrimary,
  onSelect,
}: {
  label: string;
  options: Option[];
  tone?: Tone;
  surface?: Surface;
  disabled?: boolean;
  onPrimary?: () => void;
  onSelect?: (value: string) => void;
}) {
  const surface = useEffectiveSurface(surfaceProp);
  const s = surfaceClasses(surface);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, () => setOpen(false));

  return (
    <div ref={ref} className="relative inline-flex">
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
            s.border, s.radiusLg, 'border-retro-border',
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
}

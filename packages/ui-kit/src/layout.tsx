import React from 'react';
import { Tone, Surface, cn, toneMap, surfaceClasses, useEffectiveSurface } from './common';
import { usePxlKitLocale } from './locale';

/* ──────────────────────────────────────────────────────────────────────────
   PixelSection — bordered section with title row and optional subtitle.
   ────────────────────────────────────────────────────────────────────────── */

export function PixelSection({
  title,
  subtitle,
  children,
  surface: surfaceProp,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  surface?: Surface;
}) {
  const surface = useEffectiveSurface(surfaceProp);
  const s = surfaceClasses(surface);
  const { upper } = usePxlKitLocale();
  return (
    <section className={cn('bg-retro-card/40 p-4 sm:p-6', s.border, s.radiusLg, 'border-retro-border/40')}>
      <div className="mb-4">
        <h3 className={cn('text-xs text-retro-green', surface === 'pixel' ? 'font-pixel' : 'font-semibold text-sm')}>{upper(title)}</h3>
        {subtitle && <p className={cn('mt-2 text-sm text-retro-muted', s.font)}>{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   PixelDivider — horizontal rule with optional label.
   Pixel surface adds dotted line + diamond ornaments around the label.
   ────────────────────────────────────────────────────────────────────────── */

export function PixelDivider({
  label,
  tone = 'neutral',
  spacing = 'none',
  className,
  surface: surfaceProp,
}: {
  label?: string;
  tone?: Tone;
  /** Symmetric vertical padding. */
  spacing?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
  surface?: Surface;
}) {
  const surface = useEffectiveSurface(surfaceProp);
  const s = surfaceClasses(surface);
  const spacingClass = spacing === 'lg' ? 'py-10' : spacing === 'md' ? 'py-6' : spacing === 'sm' ? 'py-3' : '';
  const rule = surface === 'pixel' ? 'border-t-2 border-dotted' : 'border-t';

  if (!label) {
    return <hr className={cn(rule, 'border-retro-border/40', spacingClass, className)} />;
  }
  return (
    <div className={cn('flex items-center gap-3', spacingClass, className)}>
      <hr className={cn(rule, 'flex-1 border-retro-border/40')} />
      <span className={cn('text-[10px] uppercase tracking-wider inline-flex items-center gap-1.5', surface === 'pixel' ? 'font-pixel' : s.fontDisplay, toneMap[tone].text)}>
        {surface === 'pixel' && <span aria-hidden className="opacity-60">◆</span>}
        {label}
        {surface === 'pixel' && <span aria-hidden className="opacity-60">◆</span>}
      </span>
      <hr className={cn(rule, 'flex-1 border-retro-border/40')} />
    </div>
  );
}

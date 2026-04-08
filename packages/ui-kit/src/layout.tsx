import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Tone, Size, Option, TabItem, AccordionItem, cn, useClickOutside,
  toneMap, sizeClass, focusRing, inputBase,
  ChevronDownIcon, CheckIcon, CloseIcon, FieldShell
} from './common';
import { usePxlKitLocale } from './locale';



export function PixelSection({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  const { upper } = usePxlKitLocale();
  return (
    <section className="rounded-xl border border-retro-border/40 bg-retro-card/40 p-4 sm:p-6">
      <div className="mb-4">
        <h3 className="font-pixel text-xs text-retro-green">{upper(title)}</h3>
        {subtitle && <p className="mt-2 text-sm text-retro-muted">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}

export function PixelDivider({ label, tone = 'neutral', spacing = 'none', className }: { label?: string; tone?: Tone; /** Symmetric vertical padding. */ spacing?: 'none' | 'sm' | 'md' | 'lg'; className?: string }) {
  const spacingClass = spacing === 'lg' ? 'py-10' : spacing === 'md' ? 'py-6' : spacing === 'sm' ? 'py-3' : '';
  if (!label) return <hr className={cn('border-retro-border/40', spacingClass, className)} />;
  return (
    <div className={cn('flex items-center gap-3', spacingClass, className)}>
      <hr className="flex-1 border-retro-border/40" />
      <span className={cn('text-[10px] font-pixel uppercase tracking-wider', toneMap[tone].text)}>{label}</span>
      <hr className="flex-1 border-retro-border/40" />
    </div>
  );
}


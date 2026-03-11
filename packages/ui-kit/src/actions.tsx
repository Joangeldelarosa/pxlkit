import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Tone, Size, Option, TabItem, AccordionItem, cn, useClickOutside,
  toneMap, sizeClass, focusRing, inputBase,
  ChevronDownIcon, CheckIcon, CloseIcon, FieldShell
} from './common';



export function PixelButton({
  tone = 'green',
  size = 'md',
  variant = 'solid',
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
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  loading?: boolean;
}) {
  const t = toneMap[tone];
  const isGhost = variant === 'ghost';
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-md font-mono font-medium transition-all outline-none disabled:opacity-50 disabled:cursor-not-allowed',
        sizeClass[size],
        focusRing,
        t.ring,
        t.text,
        isGhost
          ? cn('border border-transparent bg-transparent', t.hover)
          : cn('border', t.border, t.bg, t.hover),
        !props.disabled && 'active:scale-[0.97]',
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

export function PxlKitButton({
  label,
  tone = 'cyan',
  size = 'md',
  icon,
  className,
  ...props
}: Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'> & {
  label: string;
  tone?: Tone;
  size?: Size;
  icon: React.ReactNode;
}) {
  const t = toneMap[tone];
  const dim = size === 'sm' ? 'h-8 w-8' : size === 'lg' ? 'h-12 w-12' : 'h-10 w-10';
  return (
    <button
      aria-label={label}
      title={label}
      className={cn(
        'inline-flex items-center justify-center rounded-md border transition-all outline-none active:scale-95',
        dim,
        t.text, t.border, t.bg, t.hover,
        focusRing, t.ring,
        className,
      )}
      {...props}
    >
      {icon}
    </button>
  );
}

export function PixelSplitButton({
  label,
  options,
  tone = 'purple',
  onPrimary,
  onSelect,
}: {
  label: string;
  options: Option[];
  tone?: Tone;
  onPrimary?: () => void;
  onSelect?: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, () => setOpen(false));

  return (
    <div ref={ref} className="relative inline-flex">
      <div className="inline-flex overflow-hidden rounded-md border border-retro-border/50">
        <PixelButton tone={tone} className="rounded-none border-0" onClick={onPrimary}>
          {label}
        </PixelButton>
        <button
          type="button"
          aria-label="More options"
          className={cn(
            'flex items-center border-0 border-l border-retro-border/50 px-2 transition-colors',
            toneMap[tone].bg, toneMap[tone].hover, toneMap[tone].text,
          )}
          onClick={() => setOpen(!open)}
        >
          <ChevronDownIcon className={cn('transition-transform', open && 'rotate-180')} />
        </button>
      </div>
      {open && (
        <div className="absolute left-0 top-full z-40 mt-1 min-w-40 rounded-md border border-retro-border bg-retro-bg p-1 shadow-xl">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className="flex w-full items-center rounded px-3 py-2 text-left text-xs font-mono text-retro-muted transition-colors hover:bg-retro-surface hover:text-retro-text"
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


import React, { useEffect, useRef, useState } from 'react';
import {
  Tone, Surface, Option, cn, useClickOutside,
  toneMap, surfaceClasses, useEffectiveSurface,
  ChevronDownIcon, CloseIcon,
} from './common';
import { PixelButton } from './actions';
import { usePxlKitLocale } from './locale';

/* ──────────────────────────────────────────────────────────────────────────
   PixelModal — dialog with title bar (pixel surface = old-school window).
   ────────────────────────────────────────────────────────────────────────── */

export function PixelModal({
  open,
  title,
  children,
  onClose,
  size = 'md',
  surface: surfaceProp,
}: {
  open: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  size?: 'sm' | 'md' | 'lg';
  surface?: Surface;
}) {
  const surface = useEffectiveSurface(surfaceProp);
  const s = surfaceClasses(surface);
  const { upper } = usePxlKitLocale();
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  const maxW = size === 'sm' ? 'max-w-sm' : size === 'lg' ? 'max-w-2xl' : 'max-w-md';

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={title}>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div
        className={cn(
          'relative w-full bg-retro-bg shadow-2xl',
          s.border, s.radiusLg, 'border-retro-border',
          surface === 'pixel' ? 'p-0' : 'p-5',
          maxW,
        )}
      >
        {surface === 'pixel' ? (
          <>
            {/* Pixel surface: explicit title bar like an old window */}
            <div className={cn('flex items-center justify-between border-b-2 border-retro-border bg-retro-surface/60 px-3 py-2')}>
              <h4 className="font-pixel text-[11px] text-retro-green">{upper(title)}</h4>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="flex h-6 w-6 items-center justify-center border-2 border-retro-border text-retro-muted transition-colors hover:bg-retro-red/10 hover:border-retro-red/40 hover:text-retro-red"
              >
                <CloseIcon />
              </button>
            </div>
            <div className="p-5 text-sm text-retro-muted">{children}</div>
          </>
        ) : (
          <>
            <div className="mb-4 flex items-center justify-between">
              <h4 className={cn('text-base font-semibold text-retro-text', s.fontDisplay)}>{upper(title)}</h4>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="flex h-7 w-7 items-center justify-center rounded-md border border-retro-border text-retro-muted transition-colors hover:bg-retro-surface hover:text-retro-text"
              >
                <CloseIcon />
              </button>
            </div>
            <div className="text-sm text-retro-muted">{children}</div>
          </>
        )}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   PixelTooltip — tooltip with 4 positions. Pixel surface = chunky border.
   ────────────────────────────────────────────────────────────────────────── */

export function PixelTooltip({
  content,
  children,
  position = 'top',
  surface: surfaceProp,
}: {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  surface?: Surface;
}) {
  const surface = useEffectiveSurface(surfaceProp);
  const s = surfaceClasses(surface);
  const [visible, setVisible] = useState(false);
  const posClass: Record<string, string> = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };
  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {children}
      {visible && (
        <span
          role="tooltip"
          className={cn(
            'absolute z-50 whitespace-nowrap bg-retro-bg px-2 py-1 text-[11px] text-retro-text shadow-lg pointer-events-none',
            s.border, s.radius, s.font, 'border-retro-border',
            posClass[position],
          )}
        >
          {content}
        </span>
      )}
    </span>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   PixelDropdown — button + dropdown menu of actions.
   ────────────────────────────────────────────────────────────────────────── */

export function PixelDropdown({
  label,
  items,
  onSelect,
  tone = 'neutral',
  icon,
  disabled = false,
  surface: surfaceProp,
}: {
  label: string;
  items: Option[];
  onSelect: (value: string) => void;
  tone?: Tone;
  icon?: React.ReactNode;
  disabled?: boolean;
  surface?: Surface;
}) {
  const surface = useEffectiveSurface(surfaceProp);
  const s = surfaceClasses(surface);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  useClickOutside(containerRef, () => setOpen(false));

  return (
    <div ref={containerRef} className="relative inline-block">
      <PixelButton
        tone={tone}
        surface={surface}
        disabled={disabled}
        iconRight={icon ?? <ChevronDownIcon className={cn('transition-transform', open && 'rotate-180')} />}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        {label}
      </PixelButton>
      {open && (
        <div
          role="menu"
          className={cn(
            'absolute left-0 top-full z-40 mt-1.5 min-w-44 bg-retro-bg p-1 shadow-xl',
            s.border, s.radiusLg, 'border-retro-border',
          )}
        >
          {items.map((item) => (
            <button
              key={item.value}
              type="button"
              role="menuitem"
              className={cn(
                'flex w-full items-center px-3 py-2 text-left text-xs text-retro-muted transition-colors hover:bg-retro-surface hover:text-retro-text',
                s.font, s.radius,
              )}
              onClick={() => { onSelect(item.value); setOpen(false); }}
            >
              {item.icon && <span className="mr-2 inline-flex items-center justify-center opacity-80 shrink-0">{item.icon}</span>}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

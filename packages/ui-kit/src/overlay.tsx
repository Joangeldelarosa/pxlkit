import React, { forwardRef, useEffect, useId, useRef, useState } from 'react';
import {
  Tone, Surface, Option, cn, useClickOutside,
  surfaceClasses, useEffectiveSurface,
  ChevronDownIcon, CloseIcon,
} from './common';
import { PixelButton } from './actions';
import { usePxlKitLocale } from './locale';

/* ──────────────────────────────────────────────────────────────────────────
   PixelModal — dialog with title bar (pixel surface = old-school window).
   ────────────────────────────────────────────────────────────────────────── */

/** Public prop bag for {@link PixelModal}. */
export interface PixelModalProps {
  open: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  size?: 'sm' | 'md' | 'lg';
  surface?: Surface;
  /** Optional override for the close button's accessible label. */
  closeLabel?: string;
}

export function PixelModal({
  open, title, children, onClose,
  size = 'md',
  surface: surfaceProp,
  closeLabel = 'Close',
}: PixelModalProps) {
  const surface = useEffectiveSurface(surfaceProp);
  const s = surfaceClasses(surface);
  const { upper } = usePxlKitLocale();
  const titleId = useId();
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const lastFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    lastFocused.current = document.activeElement as HTMLElement | null;
    // Move focus into the dialog so AT users land inside the modal.
    const t = setTimeout(() => closeBtnRef.current?.focus(), 0);
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      clearTimeout(t);
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
      // Restore focus to the trigger if it's still in the DOM.
      const prev = lastFocused.current;
      if (prev && typeof prev.focus === 'function' && document.body.contains(prev)) prev.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  const maxW = size === 'sm' ? 'max-w-sm' : size === 'lg' ? 'max-w-2xl' : 'max-w-md';

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby={titleId}>
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
            <div className={cn('flex items-center justify-between border-b-2 border-retro-border bg-retro-surface/60 px-3 py-2')}>
              <h4 id={titleId} className="font-pixel text-[11px] text-retro-green">{upper(title)}</h4>
              <button
                ref={closeBtnRef}
                type="button"
                onClick={onClose}
                aria-label={closeLabel}
                className="flex h-6 w-6 items-center justify-center border-2 border-retro-border text-retro-muted transition-colors hover:bg-retro-red/10 hover:border-retro-red/40 hover:text-retro-red focus:outline-none focus-visible:ring-2 focus-visible:ring-retro-red/40"
              >
                <CloseIcon />
              </button>
            </div>
            <div className="p-5 text-sm text-retro-muted">{children}</div>
          </>
        ) : (
          <>
            <div className="mb-4 flex items-center justify-between">
              <h4 id={titleId} className={cn('text-base font-semibold text-retro-text', s.fontDisplay)}>{upper(title)}</h4>
              <button
                ref={closeBtnRef}
                type="button"
                onClick={onClose}
                aria-label={closeLabel}
                className="flex h-7 w-7 items-center justify-center rounded-md border border-retro-border text-retro-muted transition-colors hover:bg-retro-surface hover:text-retro-text focus:outline-none focus-visible:ring-2 focus-visible:ring-retro-cyan/40"
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

/** Public prop bag for {@link PixelTooltip}. */
export interface PixelTooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  surface?: Surface;
  /** Delay before showing on hover, ms. Defaults to 200. */
  delay?: number;
}

export function PixelTooltip({ content, children, position = 'top', surface: surfaceProp, delay = 200 }: PixelTooltipProps) {
  const surface = useEffectiveSurface(surfaceProp);
  const s = surfaceClasses(surface);
  const [visible, setVisible] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tipId = useId();
  const posClass: Record<string, string> = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  const show = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setVisible(true), delay);
  };
  const hide = () => {
    if (timer.current) clearTimeout(timer.current);
    setVisible(false);
  };

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
      aria-describedby={visible ? tipId : undefined}
    >
      {children}
      {visible && (
        <span
          id={tipId}
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
   PixelDropdown — button + dropdown menu of actions, keyboard navigable.
   ────────────────────────────────────────────────────────────────────────── */

/** Public prop bag for {@link PixelDropdown}. */
export interface PixelDropdownProps {
  label: string;
  items: Option[];
  onSelect: (value: string) => void;
  tone?: Tone;
  icon?: React.ReactNode;
  disabled?: boolean;
  surface?: Surface;
  /** ARIA label override when the trigger label is purely decorative. */
  ariaLabel?: string;
}

export const PixelDropdown = forwardRef<HTMLDivElement, PixelDropdownProps>(function PixelDropdown(
  { label, items, onSelect, tone = 'neutral', icon, disabled = false, surface: surfaceProp, ariaLabel },
  ref,
) {
  const surface = useEffectiveSurface(surfaceProp);
  const s = surfaceClasses(surface);
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  const setRefs = (node: HTMLDivElement | null) => {
    (containerRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
    if (typeof ref === 'function') ref(node);
    else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
  };

  useClickOutside(containerRef, () => { setOpen(false); setHighlighted(-1); });

  // Reset highlight whenever the menu closes.
  useEffect(() => { if (!open) setHighlighted(-1); }, [open]);

  const onKey = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (e.key === 'Escape') { setOpen(false); return; }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!open) { setOpen(true); setHighlighted(0); return; }
      setHighlighted((p) => Math.min(p + 1, items.length - 1));
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!open) { setOpen(true); setHighlighted(items.length - 1); return; }
      setHighlighted((p) => Math.max(p - 1, 0));
      return;
    }
    if (e.key === 'Home') { e.preventDefault(); setOpen(true); setHighlighted(0); return; }
    if (e.key === 'End') { e.preventDefault(); setOpen(true); setHighlighted(items.length - 1); return; }
    if ((e.key === 'Enter' || e.key === ' ') && open && highlighted >= 0) {
      e.preventDefault();
      onSelect(items[highlighted].value);
      setOpen(false);
    }
  };

  return (
    <div ref={setRefs} className="relative inline-block" onKeyDown={onKey}>
      <PixelButton
        tone={tone}
        surface={surface}
        disabled={disabled}
        iconRight={icon ?? <ChevronDownIcon className={cn('transition-transform', open && 'rotate-180')} />}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        aria-label={ariaLabel}
      >
        {label}
      </PixelButton>
      {open && (
        <div
          id={menuId}
          role="menu"
          aria-orientation="vertical"
          className={cn(
            'absolute left-0 top-full z-40 mt-1.5 min-w-44 bg-retro-bg p-1 shadow-xl',
            s.border, s.radiusLg, 'border-retro-border',
          )}
        >
          {items.map((item, idx) => (
            <button
              key={item.value}
              type="button"
              role="menuitem"
              tabIndex={-1}
              data-highlighted={idx === highlighted || undefined}
              className={cn(
                'flex w-full items-center px-3 py-2 text-left text-xs text-retro-muted transition-colors hover:bg-retro-surface hover:text-retro-text',
                idx === highlighted && 'bg-retro-surface text-retro-text',
                s.font, s.radius,
              )}
              onMouseEnter={() => setHighlighted(idx)}
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
});

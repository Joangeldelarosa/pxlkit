import React, { forwardRef, useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import {
  autoUpdate,
  flip,
  offset as floatingOffset,
  shift,
  useFloating,
  type Placement,
} from '@floating-ui/react-dom';
import {
  Tone, Surface, Option, cn, useClickOutside,
  surfaceClasses, useEffectiveSurface,
  ChevronDownIcon, CloseIcon,
} from './common';
import { PixelButton } from './actions';
import { usePxlKitLocale } from './locale';
import { PixelPortal } from './overlay-foundation/PixelPortal';
import { useFocusTrap } from './hooks/useFocusTrap';
import { useScrollLock } from './hooks/useScrollLock';
import { useEscape } from './hooks/useEscape';
import { useControllableState } from './hooks/useControllableState';
import { useReducedMotion } from './hooks/useReducedMotion';

/* ──────────────────────────────────────────────────────────────────────────
   PixelModal — dialog with title bar (pixel surface = old-school window).
   ────────────────────────────────────────────────────────────────────────── */

/** Public prop bag for {@link PixelModal}. */
export interface PixelModalProps {
  open: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  surface?: Surface;
  /** Optional override for the close button's accessible label. */
  closeLabel?: string;
  /** Optional footer node, rendered at the bottom separated by a surface-aware divider. */
  footer?: React.ReactNode;
  /** Optional description, wired via `aria-describedby` for AT users. */
  description?: React.ReactNode;
  /**
   * When provided, the close button awaits this promise (and shows a loading
   * state) before the consumer-controlled `onClose` is invoked. Lets callers
   * persist or animate-out before unmounting.
   */
  asyncClose?: () => Promise<void>;
  /** Optional portal container override. Defaults to `document.body`. */
  container?: HTMLElement | null;
}

export const PixelModal = forwardRef<HTMLDivElement, PixelModalProps>(function PixelModal({
  open, title, children, onClose,
  size = 'md',
  surface: surfaceProp,
  closeLabel = 'Close',
  footer,
  description,
  asyncClose,
  container,
}, forwardedRef) {
  const surface = useEffectiveSurface(surfaceProp);
  const s = surfaceClasses(surface);
  const { upper } = usePxlKitLocale();
  const titleId = useId();
  const descId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const [closing, setClosing] = useState(false);
  const reducedMotion = useReducedMotion();
  const pulseClass = reducedMotion ? '' : 'animate-pulse';

  const setRefs = useCallback((node: HTMLDivElement | null) => {
    (dialogRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
    if (typeof forwardedRef === 'function') forwardedRef(node);
    else if (forwardedRef && typeof forwardedRef === 'object') {
      (forwardedRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
    }
  }, [forwardedRef]);

  useFocusTrap(open, dialogRef);
  useScrollLock(open);
  useEscape(() => { if (!closing) void handleClose(); }, open);

  async function handleClose() {
    if (asyncClose) {
      try {
        setClosing(true);
        await asyncClose();
      } finally {
        setClosing(false);
        onClose();
      }
      return;
    }
    onClose();
  }

  if (!open) return null;

  const maxW =
    size === 'sm' ? 'max-w-sm' :
    size === 'lg' ? 'max-w-2xl' :
    size === 'xl' ? 'max-w-4xl' :
    size === 'full' ? 'max-w-[95vw] max-h-[95vh] overflow-y-auto' :
    'max-w-md';

  const dividerClass = surface === 'pixel'
    ? 'border-t-2 border-retro-border'
    : 'border-t border-retro-border';

  return (
    <PixelPortal container={container}>
      <div
        className="fixed inset-0 z-[80] flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descId : undefined}
      >
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          onClick={() => { if (!closing) void handleClose(); }}
          aria-hidden="true"
        />
        <div
          ref={setRefs}
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
                  type="button"
                  onClick={() => { void handleClose(); }}
                  aria-label={closeLabel}
                  aria-busy={closing || undefined}
                  disabled={closing}
                  className={cn(
                    'flex h-6 w-6 items-center justify-center border-2 border-retro-border text-retro-muted transition-colors hover:bg-retro-red/10 hover:border-retro-red/40 hover:text-retro-red focus:outline-none focus-visible:ring-2 focus-visible:ring-retro-red/40',
                    closing && 'opacity-60 cursor-wait',
                  )}
                >
                  {closing ? <span aria-hidden className={cn('block h-2 w-2 bg-retro-muted', pulseClass)} /> : <CloseIcon />}
                </button>
              </div>
              <div className="p-5 text-sm text-retro-muted">
                {description && <p id={descId} className="mb-3 text-xs text-retro-muted/80">{description}</p>}
                {children}
              </div>
              {footer && (
                <div className={cn(dividerClass, 'flex items-center justify-end gap-2 bg-retro-surface/40 px-5 py-3')}>
                  {footer}
                </div>
              )}
            </>
          ) : (
            <>
              <div className="mb-4 flex items-center justify-between">
                <h4 id={titleId} className={cn('text-base font-semibold text-retro-text', s.fontDisplay)}>{upper(title)}</h4>
                <button
                  type="button"
                  onClick={() => { void handleClose(); }}
                  aria-label={closeLabel}
                  aria-busy={closing || undefined}
                  disabled={closing}
                  className={cn(
                    'flex h-7 w-7 items-center justify-center rounded-md border border-retro-border text-retro-muted transition-colors hover:bg-retro-surface hover:text-retro-text focus:outline-none focus-visible:ring-2 focus-visible:ring-retro-cyan/40',
                    closing && 'opacity-60 cursor-wait',
                  )}
                >
                  {closing ? <span aria-hidden className={cn('block h-2 w-2 rounded-full bg-retro-muted', pulseClass)} /> : <CloseIcon />}
                </button>
              </div>
              {description && <p id={descId} className="mb-3 text-xs text-retro-muted/80">{description}</p>}
              <div className="text-sm text-retro-muted">{children}</div>
              {footer && (
                <div className={cn(dividerClass, 'mt-5 flex items-center justify-end gap-2 pt-4')}>
                  {footer}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </PixelPortal>
  );
});
PixelModal.displayName = 'PixelModal';

/* ──────────────────────────────────────────────────────────────────────────
   PixelTooltip — floating-ui-positioned tooltip with hover/click/focus
   triggers, controlled/uncontrolled state, and ReactNode content. Renders
   into a portal so it escapes overflow/transform ancestors.
   ────────────────────────────────────────────────────────────────────────── */

type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';
type TooltipTrigger = 'hover' | 'click' | 'focus';

/** Public prop bag for {@link PixelTooltip}. */
export interface PixelTooltipProps {
  /** Tooltip body. Accepts any ReactNode; falls back to {@link PixelTooltipProps.label} when omitted. */
  content?: React.ReactNode;
  /** Backwards-compat string alias for {@link PixelTooltipProps.content}. */
  label?: string;
  children: React.ReactNode;
  /** Preferred placement. floating-ui will flip/shift away from viewport edges. */
  position?: TooltipPosition;
  surface?: Surface;
  /**
   * Open/close delays in ms. A bare `number` is treated as `{ open }` for
   * backwards-compat with the previous API. Defaults to `{ open: 200, close: 100 }`.
   */
  delay?: number | { open?: number; close?: number };
  /** Controlled open state. When provided, the tooltip ignores its internal state. */
  open?: boolean;
  /** Initial open state when uncontrolled. */
  defaultOpen?: boolean;
  /** Called whenever the tooltip wants to change open state (controlled or uncontrolled). */
  onOpenChange?: (open: boolean) => void;
  /** How the tooltip opens. Default `'hover'`. */
  trigger?: TooltipTrigger;
  /** Distance in px from the trigger. Default `8`. */
  sideOffset?: number;
}

const DEFAULT_OPEN_DELAY = 200;
const DEFAULT_CLOSE_DELAY = 100;

function resolveDelays(delay: PixelTooltipProps['delay']): { open: number; close: number } {
  if (typeof delay === 'number') return { open: delay, close: DEFAULT_CLOSE_DELAY };
  return {
    open: delay?.open ?? DEFAULT_OPEN_DELAY,
    close: delay?.close ?? DEFAULT_CLOSE_DELAY,
  };
}

export const PixelTooltip = forwardRef<HTMLSpanElement, PixelTooltipProps>(function PixelTooltip({
  content,
  label,
  children,
  position = 'top',
  surface: surfaceProp,
  delay,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  trigger = 'hover',
  sideOffset = 8,
}, forwardedRef) {
  const surface = useEffectiveSurface(surfaceProp);
  const s = surfaceClasses(surface);
  const tipId = useId();
  const delays = useMemo(() => resolveDelays(delay), [delay]);
  const openTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef = useRef<HTMLSpanElement | null>(null);
  const floatingNodeRef = useRef<HTMLSpanElement | null>(null);

  const [open, setOpen] = useControllableState<boolean>({
    value: openProp,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });

  const { refs, floatingStyles } = useFloating({
    open,
    placement: position as Placement,
    whileElementsMounted: autoUpdate,
    middleware: [floatingOffset(sideOffset), flip(), shift({ padding: 8 })],
  });

  const clearTimers = useCallback(() => {
    if (openTimer.current) { clearTimeout(openTimer.current); openTimer.current = null; }
    if (closeTimer.current) { clearTimeout(closeTimer.current); closeTimer.current = null; }
  }, []);

  const scheduleOpen = useCallback(() => {
    clearTimers();
    if (delays.open <= 0) { setOpen(true); return; }
    openTimer.current = setTimeout(() => setOpen(true), delays.open);
  }, [clearTimers, delays.open, setOpen]);

  const scheduleClose = useCallback(() => {
    clearTimers();
    if (delays.close <= 0) { setOpen(false); return; }
    closeTimer.current = setTimeout(() => setOpen(false), delays.close);
  }, [clearTimers, delays.close, setOpen]);

  useEffect(() => () => clearTimers(), [clearTimers]);

  // Click-trigger needs explicit dismissal: outside-pointerdown + Escape.
  useEffect(() => {
    if (trigger !== 'click' || !open) return;
    const handler = (e: PointerEvent) => {
      const target = e.target as Node | null;
      if (!target) return;
      if (wrapperRef.current?.contains(target)) return;
      if (floatingNodeRef.current?.contains(target)) return;
      setOpen(false);
    };
    document.addEventListener('pointerdown', handler);
    return () => document.removeEventListener('pointerdown', handler);
  }, [trigger, open, setOpen]);
  useEscape(() => setOpen(false), trigger === 'click' && open);

  const triggerProps: React.HTMLAttributes<HTMLSpanElement> = {};
  if (trigger === 'hover') {
    triggerProps.onMouseEnter = scheduleOpen;
    triggerProps.onMouseLeave = scheduleClose;
    triggerProps.onFocus = scheduleOpen;
    triggerProps.onBlur = scheduleClose;
  } else if (trigger === 'focus') {
    triggerProps.onFocus = scheduleOpen;
    triggerProps.onBlur = scheduleClose;
  } else if (trigger === 'click') {
    triggerProps.onClick = () => { clearTimers(); setOpen(!open); };
    // Make wrapper focusable so keyboard users can open a click tooltip.
    triggerProps.tabIndex = 0;
    triggerProps.onKeyDown = (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        clearTimers();
        setOpen(!open);
      }
    };
    triggerProps.role = 'button';
    (triggerProps as Record<string, unknown>)['aria-expanded'] = open;
    (triggerProps as Record<string, unknown>)['aria-controls'] = open ? tipId : undefined;
  }

  const setWrapperRef = (node: HTMLSpanElement | null) => {
    wrapperRef.current = node;
    (refs.setReference as unknown as (n: HTMLSpanElement | null) => void)(node);
    if (typeof forwardedRef === 'function') forwardedRef(node);
    else if (forwardedRef && typeof forwardedRef === 'object') {
      (forwardedRef as React.MutableRefObject<HTMLSpanElement | null>).current = node;
    }
  };

  const setFloatingRef = (node: HTMLSpanElement | null) => {
    floatingNodeRef.current = node;
    (refs.setFloating as unknown as (n: HTMLSpanElement | null) => void)(node);
  };

  const body = content ?? label;

  return (
    <>
      <span
        ref={setWrapperRef}
        className="relative inline-flex"
        aria-describedby={open ? tipId : undefined}
        {...triggerProps}
      >
        {children}
      </span>
      {open && body != null && (
        <PixelPortal>
          <span
            ref={setFloatingRef}
            id={tipId}
            role="tooltip"
            style={{ ...floatingStyles, zIndex: 70 }}
            className={cn(
              'whitespace-nowrap bg-retro-bg px-2 py-1 text-[11px] text-retro-text shadow-lg',
              // Hover/focus tooltips are non-interactive; click tooltips
              // must accept clicks (e.g. to copy text or click links inside).
              trigger === 'click' ? '' : 'pointer-events-none',
              s.border, s.radius, s.font, 'border-retro-border',
            )}
          >
            {body}
          </span>
        </PixelPortal>
      )}
    </>
  );
});
PixelTooltip.displayName = 'PixelTooltip';

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

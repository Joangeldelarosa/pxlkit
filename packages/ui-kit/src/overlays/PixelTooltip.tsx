/* ─────────────────────────────────────────────────────────────────────────
   PixelTooltip — floating-ui-positioned tooltip with hover/click/focus
   triggers, controlled/uncontrolled state, and ReactNode content.
   ───────────────────────────────────────────────────────────────────────── */

import React, { forwardRef, useCallback, useEffect, useId, useMemo, useRef } from 'react';
import {
  autoUpdate,
  flip,
  offset as floatingOffset,
  shift,
  useFloating,
  type Placement,
} from '@floating-ui/react-dom';
import {
  Surface, cn,
  surfaceClasses, useEffectiveSurface,
} from '../common';
import { PixelPortal } from '../overlay-foundation/PixelPortal';
import { useEscape } from '../hooks/useEscape';
import { useControllableState } from '../hooks/useControllableState';

type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';
type TooltipTrigger = 'hover' | 'click' | 'focus';

/** Public prop bag for {@link PixelTooltip}. */
export interface PixelTooltipProps {
  /** Tooltip body. Accepts any ReactNode; falls back to {@link PixelTooltipProps.label} when omitted. */
  content?: React.ReactNode;
  /** Backwards-compat string alias for {@link PixelTooltipProps.content}. */
  label?: string;
  /** The element the tooltip is anchored to. */
  children: React.ReactNode;
  /** Preferred placement. floating-ui will flip/shift away from viewport edges. */
  position?: TooltipPosition;
  /** Visual surface override. Falls back to nearest `<PxlKitProvider>` surface. */
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
    // The wrapper stays non-interactive: role="button" + tabIndex here nests
    // interactive controls when the anchor child is a button/link — the
    // common case — which axe flags as nested-interactive. Clicks on the
    // child bubble up to this handler, and a native-button child provides
    // Enter/Space activation for free. Anchor click tooltips to an
    // interactive child for keyboard support.
    triggerProps.onClick = () => { clearTimers(); setOpen(!open); };
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

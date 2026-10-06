/* ─────────────────────────────────────────────────────────────────────────
   PixelTooltip — floating-ui-positioned tooltip with hover/click/focus
   triggers, controlled/uncontrolled state, and ReactNode content.
   ───────────────────────────────────────────────────────────────────────── */

import React, { forwardRef, useCallback, useEffect, useId, useMemo, useRef } from 'react';
import { autoUpdate, useFloating } from '@floating-ui/react-dom';
import {
  TOOLTIP_Z_INDEX,
  anchoredMiddleware,
  describeTooltipTrigger,
  resolveTooltipDelays,
  tooltipClasses,
  tooltipTriggerClasses,
  type TooltipDelay,
  type TooltipPosition,
  type TooltipTrigger,
} from '@pxlkit/ui-kit-core';
import { Surface, useEffectiveSurface } from '../common';
import { PixelPortal } from '../overlay-foundation/PixelPortal';
import { useEscape } from '../hooks/useEscape';
import { useControllableState } from '../hooks/useControllableState';

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
  delay?: TooltipDelay;
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
  const tipId = useId();
  const delays = useMemo(() => resolveTooltipDelays(delay), [delay]);
  const openTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef = useRef<HTMLSpanElement | null>(null);
  const floatingNodeRef = useRef<HTMLSpanElement | null>(null);
  // Set when Escape dismisses the tooltip: hover and focus leave it closed
  // until the pointer or focus has left the trigger.
  const dismissedRef = useRef(false);

  const [open, setOpen] = useControllableState<boolean>({
    value: openProp,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });

  const { refs, floatingStyles } = useFloating({
    open,
    placement: position,
    whileElementsMounted: autoUpdate,
    middleware: anchoredMiddleware(sideOffset),
  });

  const clearTimers = useCallback(() => {
    if (openTimer.current) { clearTimeout(openTimer.current); openTimer.current = null; }
    if (closeTimer.current) { clearTimeout(closeTimer.current); closeTimer.current = null; }
  }, []);

  const scheduleOpen = useCallback(() => {
    if (dismissedRef.current) return;
    clearTimers();
    if (delays.open <= 0) { setOpen(true); return; }
    openTimer.current = setTimeout(() => {
      openTimer.current = null;
      setOpen(true);
    }, delays.open);
  }, [clearTimers, delays.open, setOpen]);

  const scheduleClose = useCallback(() => {
    clearTimers();
    if (delays.close <= 0) { setOpen(false); return; }
    closeTimer.current = setTimeout(() => setOpen(false), delays.close);
  }, [clearTimers, delays.close, setOpen]);

  const leave = useCallback(() => {
    dismissedRef.current = false;
    scheduleClose();
  }, [scheduleClose]);

  useEffect(() => () => clearTimers(), [clearTimers]);

  // Escape dismisses the tooltip in every mode (WCAG 1.4.13), a pending
  // open included.
  useEscape(() => {
    if (!open && !openTimer.current) return;
    clearTimers();
    if (trigger !== 'click') dismissedRef.current = true;
    if (open) setOpen(false);
  });

  // A click tooltip also closes on a press outside it.
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

  const triggerProps: React.HTMLAttributes<HTMLSpanElement> = {};
  if (trigger === 'hover') {
    triggerProps.onMouseEnter = scheduleOpen;
    triggerProps.onMouseLeave = leave;
    triggerProps.onFocus = scheduleOpen;
    triggerProps.onBlur = leave;
  } else if (trigger === 'focus') {
    triggerProps.onFocus = scheduleOpen;
    triggerProps.onBlur = leave;
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
  const shown = open && body != null;

  // While shown, the tooltip describes the element that takes focus — the
  // first focusable one inside the wrapper, else the wrapper itself.
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!shown || !wrapper) return;
    return describeTooltipTrigger(wrapper, tipId);
  }, [shown, tipId]);

  return (
    <>
      <span
        ref={setWrapperRef}
        className={tooltipTriggerClasses}
        {...triggerProps}
      >
        {children}
      </span>
      {shown && (
        <PixelPortal>
          <span
            ref={setFloatingRef}
            id={tipId}
            role="tooltip"
            style={{ ...floatingStyles, zIndex: TOOLTIP_Z_INDEX }}
            className={tooltipClasses(surface, trigger)}
          >
            {body}
          </span>
        </PixelPortal>
      )}
    </>
  );
});
PixelTooltip.displayName = 'PixelTooltip';

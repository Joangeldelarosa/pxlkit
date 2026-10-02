/**
 * PixelTooltip — a floating hint anchored to its trigger: the open and close
 * delays every kit applies, the wrapper around the trigger and the panel.
 */
import { cn, surfaceClasses, type Surface } from '../../common';
import { POPOVER_Z_INDEX } from '../overlay-foundation/popover';

export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';
/** What opens the tooltip: hover (and focus), focus only, or a click that toggles it. */
export type TooltipTrigger = 'hover' | 'click' | 'focus';
/** Open / close delays in ms; a bare number is the open delay. */
export type TooltipDelay = number | { open?: number; close?: number };

/** Delays used for the ones left out, in ms. */
export const TOOLTIP_DEFAULT_DELAYS = { open: 200, close: 100 } as const;

/** Both delays, in ms, from a `delay` prop. */
export function resolveTooltipDelays(delay?: TooltipDelay): { open: number; close: number } {
  if (typeof delay === 'number') return { open: delay, close: TOOLTIP_DEFAULT_DELAYS.close };
  return {
    open: delay?.open ?? TOOLTIP_DEFAULT_DELAYS.open,
    close: delay?.close ?? TOOLTIP_DEFAULT_DELAYS.close,
  };
}

/** Stacking order of the tooltip: the floating layer of popovers. */
export const TOOLTIP_Z_INDEX = POPOVER_Z_INDEX;

/** The wrapper around the trigger, which the tooltip is anchored to. */
export const tooltipTriggerClasses = 'relative inline-flex';

/**
 * The tooltip panel. Hover and focus tooltips let the pointer through; a
 * click tooltip takes clicks (to copy its text or follow a link inside).
 */
export function tooltipClasses(surface: Surface, trigger: TooltipTrigger): string {
  const s = surfaceClasses(surface);
  return cn(
    'w-max max-w-[calc(100vw-16px)] break-words bg-retro-bg px-2 py-1 text-[11px] text-retro-text shadow-lg',
    trigger === 'click' ? '' : 'pointer-events-none',
    s.border,
    s.radius,
    s.font,
    'border-retro-border',
  );
}

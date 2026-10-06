/**
 * PixelTooltip — a floating hint anchored to its trigger: the open and close
 * delays every kit applies, the wrapper around the trigger, the panel, and
 * the `aria-describedby` reference to it.
 */
import { cn, surfaceClasses, type Surface } from '../../common';
import { getFocusableElements } from '../../dom/focus-trap';
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

const DESCRIBED_BY = 'aria-describedby';

const idList = (element: Element) => (element.getAttribute(DESCRIBED_BY) ?? '').split(/\s+/).filter(Boolean);

/**
 * Describe the trigger by the open tooltip `tooltipId`: its id joins the
 * `aria-describedby` of the first focusable element inside `wrapper` — the
 * one a screen reader announces on focus — or of the wrapper itself when
 * nothing inside takes focus. Returns the function that takes it out again,
 * leaving the element's own references as they were.
 */
export function describeTooltipTrigger(wrapper: HTMLElement, tooltipId: string): () => void {
  const target = getFocusableElements(wrapper)[0] ?? wrapper;
  target.setAttribute(DESCRIBED_BY, [...idList(target), tooltipId].join(' '));
  return () => {
    const rest = idList(target).filter((id) => id !== tooltipId);
    if (rest.length) target.setAttribute(DESCRIBED_BY, rest.join(' '));
    else target.removeAttribute(DESCRIBED_BY);
  };
}

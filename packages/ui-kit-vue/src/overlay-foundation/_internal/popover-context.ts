import { inject, type ComponentPublicInstance, type ComputedRef, type InjectionKey } from 'vue';
import type { FloatingAlign, FloatingSide, FloatingStyles, Surface } from '@pxlkit/ui-kit-core';

export type PopoverSide = FloatingSide;
export type PopoverAlign = FloatingAlign;
/** `aria-haspopup` advertised on the trigger. */
export type PopoverHasPopup = 'dialog' | 'listbox' | 'menu' | 'tree' | 'grid';
/** Role of the content panel; `none` leaves the role to an inner widget. */
export type PopoverRole = 'dialog' | 'none' | 'listbox' | 'menu';

/** A template ref target: an element, or a component whose root element is meant. */
export type RefTarget = Element | ComponentPublicInstance | null;

export interface PixelPopoverContext {
  open: ComputedRef<boolean>;
  setOpen(open: boolean): void;
  side: ComputedRef<PopoverSide>;
  surface: ComputedRef<Surface>;
  haspopup: ComputedRef<PopoverHasPopup>;
  role: ComputedRef<PopoverRole>;
  floatingStyles: ComputedRef<FloatingStyles>;
  /** Function ref of the trigger element. */
  setTrigger(target: RefTarget): void;
  /** Function ref of the content panel. */
  setContent(target: RefTarget): void;
}

export const PIXEL_POPOVER: InjectionKey<PixelPopoverContext> = Symbol('pixel-popover');

export function usePopoverContext(component: string): PixelPopoverContext {
  const context = inject(PIXEL_POPOVER, null);
  if (!context) throw new Error(`${component} must be used inside a <PixelPopover> root.`);
  return context;
}

/** The element behind a template ref target. */
export function refElement(target: RefTarget): HTMLElement | null {
  if (!target) return null;
  const element = target instanceof Element ? target : (target.$el as unknown);
  return element instanceof HTMLElement ? element : null;
}

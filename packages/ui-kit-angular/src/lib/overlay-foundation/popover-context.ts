import { InjectionToken, inject, type Signal } from '@angular/core';
import type { FloatingAlign, FloatingSide, FloatingStyles, Surface } from '@pxlkit/ui-kit-core';

export type PopoverSide = FloatingSide;
export type PopoverAlign = FloatingAlign;
/** `aria-haspopup` advertised on the trigger. */
export type PopoverHasPopup = 'dialog' | 'listbox' | 'menu' | 'tree' | 'grid';
/** Role of the content panel; `none` leaves the role to an inner widget. */
export type PopoverRole = 'dialog' | 'none' | 'listbox' | 'menu';

/** What the parts of a `<pxl-popover>` share. */
export interface PixelPopoverContext {
  readonly open: Signal<boolean>;
  readonly side: Signal<PopoverSide>;
  readonly surface: Signal<Surface>;
  readonly haspopup: Signal<PopoverHasPopup>;
  readonly role: Signal<PopoverRole>;
  readonly floatingStyles: Signal<FloatingStyles>;
  setOpen(open: boolean): void;
  setTrigger(element: HTMLElement | null): void;
  /** The content panel; `null` right before it leaves the page. */
  setContent(element: HTMLElement | null): void;
}

export const PIXEL_POPOVER = new InjectionToken<PixelPopoverContext>('PIXEL_POPOVER');

export function injectPopoverContext(component: string): PixelPopoverContext {
  const context = inject(PIXEL_POPOVER, { optional: true });
  if (!context) throw new Error(`${component} must be used inside a <pxl-popover> root.`);
  return context;
}

import { InjectionToken, type Signal } from '@angular/core';
import type { Surface, ToggleGroupSize, ToggleGroupVariant } from '@pxlkit/ui-kit-core';

/** What a `<pxl-toggle-group>` shares with the toggles inside it. */
export interface PixelToggleGroupContext {
  /** `single` makes the toggles radios of a radiogroup; `multiple` keeps them pressed buttons. */
  readonly type: Signal<'single' | 'multiple'>;
  readonly size: Signal<ToggleGroupSize>;
  readonly variant: Signal<ToggleGroupVariant>;
  readonly surface: Signal<Surface>;
  /** Only one toggle is in the tab order, and arrow keys move between them. */
  readonly rovingFocus: Signal<boolean>;
  /** The toggle holding the tab stop while `rovingFocus` is on. */
  readonly focusedValue: Signal<string | null>;
  isPressed(value: string): boolean;
  toggle(value: string): void;
  registerItem(value: string, element: HTMLButtonElement): void;
  unregisterItem(value: string): void;
  onItemKeydown(event: KeyboardEvent, value: string): void;
}

export const PIXEL_TOGGLE_GROUP = new InjectionToken<PixelToggleGroupContext>('PIXEL_TOGGLE_GROUP');

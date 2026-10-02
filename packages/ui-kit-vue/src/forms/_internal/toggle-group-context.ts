import { inject, type ComputedRef, type InjectionKey, type Ref } from 'vue';
import type { Surface, ToggleGroupSize, ToggleGroupVariant } from '@pxlkit/ui-kit-core';

/** What a `PixelToggleGroup` shares with the toggles inside it. */
export interface PixelToggleGroupContext {
  /** `single` makes the toggles radios of a radiogroup; `multiple` keeps them pressed buttons. */
  type: ComputedRef<'single' | 'multiple'>;
  size: ComputedRef<ToggleGroupSize>;
  variant: ComputedRef<ToggleGroupVariant>;
  surface: ComputedRef<Surface>;
  /** Only one toggle is in the tab order, and arrow keys move between them. */
  rovingFocus: ComputedRef<boolean>;
  /** The toggle holding the tab stop while `rovingFocus` is on. */
  focusedValue: Readonly<Ref<string | null>>;
  isPressed(value: string): boolean;
  toggle(value: string): void;
  registerItem(value: string, element: HTMLButtonElement): void;
  unregisterItem(value: string): void;
  onItemKeydown(event: KeyboardEvent, value: string): void;
}

export const PIXEL_TOGGLE_GROUP: InjectionKey<PixelToggleGroupContext> = Symbol('pixel-toggle-group');

/** The enclosing group, or `null` for a standalone toggle. */
export function useToggleGroupContext(): PixelToggleGroupContext | null {
  return inject(PIXEL_TOGGLE_GROUP, null);
}

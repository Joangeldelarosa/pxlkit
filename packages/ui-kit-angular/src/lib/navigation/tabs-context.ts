import { InjectionToken, inject, type Signal } from '@angular/core';
import type { Surface } from '@pxlkit/ui-kit-core';

export type TabsOrientation = 'horizontal' | 'vertical';
export type TabsActivationMode = 'automatic' | 'manual';

/** What the parts of a `<pxl-tabs>` share. */
export interface PixelTabsContext {
  readonly baseId: string;
  readonly active: Signal<string | undefined>;
  readonly orientation: Signal<TabsOrientation>;
  readonly activationMode: Signal<TabsActivationMode>;
  readonly keepMounted: Signal<boolean>;
  readonly surface: Signal<Surface>;
  select(id: string): void;
  registerTrigger(id: string, element: HTMLElement): void;
  unregisterTrigger(id: string): void;
  focusByOffset(currentId: string, offset: number): void;
  focusEdge(edge: 'first' | 'last'): void;
}

export const PIXEL_TABS = new InjectionToken<PixelTabsContext>('PIXEL_TABS');

export function injectTabsContext(component: string): PixelTabsContext {
  const context = inject(PIXEL_TABS, { optional: true });
  if (!context) throw new Error(`${component} must be used inside a <pxl-tabs> root.`);
  return context;
}

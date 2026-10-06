import { inject, type ComputedRef, type InjectionKey, type Ref } from 'vue';
import type { Surface } from '@pxlkit/ui-kit-core';

export type TabsOrientation = 'horizontal' | 'vertical';
export type TabsActivationMode = 'automatic' | 'manual';

export interface PixelTabsContext {
  baseId: string;
  active: Readonly<Ref<string | undefined>>;
  select(id: string): void;
  registerTrigger(id: string, element: HTMLButtonElement): void;
  unregisterTrigger(id: string): void;
  focusByOffset(currentId: string, offset: number): void;
  focusEdge(edge: 'first' | 'last'): void;
  orientation: ComputedRef<TabsOrientation>;
  activationMode: ComputedRef<TabsActivationMode>;
  keepMounted: ComputedRef<boolean>;
  surface: ComputedRef<Surface>;
}

export const PIXEL_TABS: InjectionKey<PixelTabsContext> = Symbol('pixel-tabs');

export function useTabsContext(component: string): PixelTabsContext {
  const context = inject(PIXEL_TABS, null);
  if (!context) throw new Error(`${component} must be used inside a <PixelTabs> root.`);
  return context;
}

import React, { createContext, useContext } from 'react';
import type { Surface } from '../../common';

export type TabsOrientation = 'horizontal' | 'vertical';
export type TabsActivationMode = 'automatic' | 'manual';

export interface PixelTabsContextValue {
  baseId: string;
  active: string | undefined;
  select: (id: string) => void;
  registerTrigger: (id: string, el: HTMLButtonElement | null) => void;
  unregisterTrigger: (id: string) => void;
  triggerOrder: React.MutableRefObject<string[]>;
  focusTriggerById: (id: string) => void;
  focusByOffset: (currentId: string, offset: number) => void;
  focusEdge: (edge: 'first' | 'last') => void;
  orientation: TabsOrientation;
  activationMode: TabsActivationMode;
  keepMounted: boolean;
  surface: Surface;
}

export const PixelTabsContext = createContext<PixelTabsContextValue | null>(null);

export function useTabsContext(component: string): PixelTabsContextValue {
  const ctx = useContext(PixelTabsContext);
  if (!ctx) {
    throw new Error(`${component} must be used inside a <PixelTabs> root.`);
  }
  return ctx;
}

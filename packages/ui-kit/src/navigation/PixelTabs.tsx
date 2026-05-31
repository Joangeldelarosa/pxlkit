import React, {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Surface, TabItem, cn, useEffectiveSurface } from '../common';
import {
  PixelTabsContext,
  PixelTabsContextValue,
  TabsActivationMode,
  TabsOrientation,
} from './_internal/tabsContext';
import { PixelTabsList } from './PixelTabsList';
import { PixelTabsTrigger } from './PixelTabsTrigger';
import { PixelTabsPanel } from './PixelTabsPanel';

/* ─────────────────────────────────────────────────────────────────────────
   PixelTabs — tabbed panel with roving tabindex + keyboard nav.
   Sugar API (items[]) + compositional API (List/Trigger/Panel).
   ───────────────────────────────────────────────────────────────────────── */

/** Public prop bag for {@link PixelTabs}. */
export interface PixelTabsProps {
  /** Sugar API. When omitted, use <PixelTabs.List>/<PixelTabs.Trigger>/<PixelTabs.Panel>. */
  items?: TabItem[];
  /** Uncontrolled initial active tab id. Ignored when `value` is set. */
  defaultTab?: string;
  /** Controlled active tab id. When set, `defaultTab` is ignored. */
  value?: string;
  /** Fires whenever the active tab changes (controlled or uncontrolled). */
  onChange?: (id: string) => void;
  /** Visual surface treatment override. */
  surface?: Surface;
  /** Accessible label for the tablist. */
  ariaLabel?: string;
  /** Layout direction for the tab list + keyboard nav. */
  orientation?: TabsOrientation;
  /** When true, all panels render in the DOM (hidden via CSS). */
  keepMounted?: boolean;
  /** When true, the tablist scrolls horizontally with a fade-mask. Ignored for vertical orientation. */
  scrollable?: boolean;
  /** 'automatic' (default) selects on focus. 'manual' requires Enter/Space. */
  activationMode?: TabsActivationMode;
  /** Compositional children. Ignored when `items` is provided. */
  children?: React.ReactNode;
}

function PixelTabsRoot(
  {
    items,
    defaultTab,
    value,
    onChange,
    surface: surfaceProp,
    ariaLabel = 'Tabs',
    orientation = 'horizontal',
    keepMounted = false,
    scrollable = false,
    activationMode = 'automatic',
    children,
  }: PixelTabsProps,
  ref: React.Ref<HTMLDivElement>,
) {
  const surface = useEffectiveSurface(surfaceProp);
  const isControlled = value !== undefined;
  const sugar = items && items.length > 0;
  const [internal, setInternal] = useState<string | undefined>(
    defaultTab ?? items?.[0]?.id,
  );
  const active = isControlled ? value : internal;
  const baseId = useId();

  const triggerRefs = useRef<Map<string, HTMLButtonElement | null>>(new Map());
  const triggerOrder = useRef<string[]>([]);

  const select = useCallback(
    (id: string) => {
      if (!isControlled) setInternal(id);
      onChange?.(id);
    },
    [isControlled, onChange],
  );

  const registerTrigger = useCallback((id: string, el: HTMLButtonElement | null) => {
    triggerRefs.current.set(id, el);
    if (el && !triggerOrder.current.includes(id)) {
      triggerOrder.current.push(id);
    }
    // Auto-seed: compositional API with no defaultTab/value → activate the first
    // registered trigger so a panel renders + tablist is keyboard-reachable.
    if (el && !sugar && !isControlled && internal === undefined && triggerOrder.current[0] === id) {
      setInternal(id);
    }
  }, [sugar, isControlled, internal]);

  const unregisterTrigger = useCallback((id: string) => {
    triggerRefs.current.delete(id);
    triggerOrder.current = triggerOrder.current.filter((x) => x !== id);
  }, []);

  const focusTriggerById = useCallback((id: string) => {
    triggerRefs.current.get(id)?.focus();
  }, []);

  const focusByOffset = useCallback((currentId: string, offset: number) => {
    const order = triggerOrder.current;
    const len = order.length;
    if (!len) return;
    const idx = order.indexOf(currentId);
    const fromIdx = idx === -1 ? 0 : idx;
    const nextIdx = ((fromIdx + offset) % len + len) % len;
    const nextId = order[nextIdx];
    triggerRefs.current.get(nextId)?.focus();
  }, []);

  const focusEdge = useCallback((edge: 'first' | 'last') => {
    const order = triggerOrder.current;
    if (!order.length) return;
    const id = edge === 'first' ? order[0] : order[order.length - 1];
    triggerRefs.current.get(id)?.focus();
  }, []);

  // Pre-register sugar items so triggerOrder reflects them even before mount.
  useEffect(() => {
    if (!sugar) return;
    triggerOrder.current = items!.map((i) => i.id);
  }, [sugar, items]);

  const ctx = useMemo<PixelTabsContextValue>(
    () => ({
      baseId,
      active,
      select,
      registerTrigger,
      unregisterTrigger,
      triggerOrder,
      focusTriggerById,
      focusByOffset,
      focusEdge,
      orientation,
      activationMode,
      keepMounted,
      surface,
    }),
    [
      baseId,
      active,
      select,
      registerTrigger,
      unregisterTrigger,
      focusTriggerById,
      focusByOffset,
      focusEdge,
      orientation,
      activationMode,
      keepMounted,
      surface,
    ],
  );

  return (
    <PixelTabsContext.Provider value={ctx}>
      <div
        ref={ref}
        className={cn(
          orientation === 'horizontal' ? 'space-y-3' : 'flex gap-3',
        )}
        data-orientation={orientation}
      >
        {sugar ? (
          <>
            <PixelTabsList ariaLabel={ariaLabel} scrollable={scrollable}>
              {items!.map((item) => (
                <PixelTabsTrigger key={item.id} value={item.id} icon={item.icon}>
                  {item.label}
                </PixelTabsTrigger>
              ))}
            </PixelTabsList>
            <div className={cn(orientation === 'vertical' && 'flex-1 min-w-0')}>
              {items!.map((item) => (
                <PixelTabsPanel key={item.id} value={item.id}>
                  {item.content}
                </PixelTabsPanel>
              ))}
            </div>
          </>
        ) : (
          children
        )}
      </div>
    </PixelTabsContext.Provider>
  );
}

const PixelTabsRootFwd = forwardRef<HTMLDivElement, PixelTabsProps>(PixelTabsRoot);
PixelTabsRootFwd.displayName = 'PixelTabs';

type PixelTabsComponent = typeof PixelTabsRootFwd & {
  List: typeof PixelTabsList;
  Trigger: typeof PixelTabsTrigger;
  Panel: typeof PixelTabsPanel;
};

export const PixelTabs = PixelTabsRootFwd as PixelTabsComponent;
PixelTabs.List = PixelTabsList;
PixelTabs.Trigger = PixelTabsTrigger;
PixelTabs.Panel = PixelTabsPanel;

import React, {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Surface, TabItem, AccordionItem, cn,
  focusRing, surfaceClasses, useEffectiveSurface,
  ChevronDownIcon,
} from './common';
/* ──────────────────────────────────────────────────────────────────────────
   PixelTabs — tabbed panel with roving tabindex + keyboard nav.
   Sugar API (items[]) + compositional API (List/Trigger/Panel).
   ────────────────────────────────────────────────────────────────────────── */

type TabsOrientation = 'horizontal' | 'vertical';
type TabsActivationMode = 'automatic' | 'manual';

interface PixelTabsContextValue {
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

const PixelTabsContext = createContext<PixelTabsContextValue | null>(null);

function useTabsContext(component: string): PixelTabsContextValue {
  const ctx = useContext(PixelTabsContext);
  if (!ctx) {
    throw new Error(`${component} must be used inside a <PixelTabs> root.`);
  }
  return ctx;
}

/** Public prop bag for {@link PixelTabs}. */
export interface PixelTabsProps {
  /** Sugar API. When omitted, use <PixelTabs.List>/<PixelTabs.Trigger>/<PixelTabs.Panel>. */
  items?: TabItem[];
  defaultTab?: string;
  /** Controlled active tab id. When set, `defaultTab` is ignored. */
  value?: string;
  onChange?: (id: string) => void;
  surface?: Surface;
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

/* ── PixelTabs.List ──────────────────────────────────────────────────── */

export interface PixelTabsListProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'role'> {
  ariaLabel?: string;
  scrollable?: boolean;
}

export const PixelTabsList = forwardRef<HTMLDivElement, PixelTabsListProps>(
  function PixelTabsList({ ariaLabel = 'Tabs', scrollable = false, className, children, ...rest }, ref) {
    const ctx = useTabsContext('PixelTabs.List');
    const isVertical = ctx.orientation === 'vertical';
    const effectiveScrollable = scrollable && !isVertical;

    return (
      <div
        className={cn(
          // Vertical: column container with border on the right.
          isVertical
            ? 'flex flex-col gap-1 self-start border-r-2 border-retro-border/40 pr-px'
            : 'border-b-2 border-retro-border/40 pb-px',
          effectiveScrollable && 'relative',
          className,
        )}
      >
        <div
          ref={ref}
          role="tablist"
          aria-label={ariaLabel}
          aria-orientation={ctx.orientation}
          className={cn(
            'flex gap-1',
            isVertical ? 'flex-col' : 'flex-wrap',
            effectiveScrollable && 'flex-nowrap overflow-x-auto scrollbar-hidden',
            effectiveScrollable && 'overflow-y-hidden',
          )}
          data-scrollable={effectiveScrollable ? 'true' : undefined}
          style={
            effectiveScrollable
              ? ({
                  // Fade-mask on left/right edges for horizontal overflow indicator.
                  WebkitMaskImage:
                    'linear-gradient(to right, transparent 0, #000 16px, #000 calc(100% - 16px), transparent 100%)',
                  maskImage:
                    'linear-gradient(to right, transparent 0, #000 16px, #000 calc(100% - 16px), transparent 100%)',
                  scrollbarWidth: 'none',
                } as React.CSSProperties)
              : undefined
          }
          {...rest}
        >
          {children}
        </div>
      </div>
    );
  },
);

/* ── PixelTabs.Trigger ───────────────────────────────────────────────── */

export interface PixelTabsTriggerProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'role' | 'value'> {
  value: string;
  icon?: React.ReactNode;
}

export const PixelTabsTrigger = forwardRef<HTMLButtonElement, PixelTabsTriggerProps>(
  function PixelTabsTrigger({ value, icon, children, className, onKeyDown, onClick, onFocus, ...rest }, forwardedRef) {
    const ctx = useTabsContext('PixelTabs.Trigger');
    const s = surfaceClasses(ctx.surface);
    const isVertical = ctx.orientation === 'vertical';
    const selected = ctx.active === value;

    const innerRef = useRef<HTMLButtonElement | null>(null);
    const setRefs = (el: HTMLButtonElement | null) => {
      innerRef.current = el;
      ctx.registerTrigger(value, el);
      if (typeof forwardedRef === 'function') forwardedRef(el);
      else if (forwardedRef) (forwardedRef as React.MutableRefObject<HTMLButtonElement | null>).current = el;
    };

    useEffect(() => {
      return () => ctx.unregisterTrigger(value);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value]);

    const tabRadius = ctx.surface === 'pixel'
      ? (isVertical ? 'rounded-l-[3px]' : 'rounded-t-[3px]')
      : (isVertical ? 'rounded-l-md' : 'rounded-t-md');

    const sideBorder = isVertical ? 'border-r-0' : 'border-b-0';
    const offset = isVertical ? '-mr-px' : '-mb-px';

    const handleKey = (e: React.KeyboardEvent<HTMLButtonElement>) => {
      onKeyDown?.(e);
      if (e.defaultPrevented) return;
      const prevKey = isVertical ? 'ArrowUp' : 'ArrowLeft';
      const nextKey = isVertical ? 'ArrowDown' : 'ArrowRight';
      switch (e.key) {
        case nextKey:
          e.preventDefault();
          ctx.focusByOffset(value, 1);
          break;
        case prevKey:
          e.preventDefault();
          ctx.focusByOffset(value, -1);
          break;
        case 'Home':
          e.preventDefault();
          ctx.focusEdge('first');
          break;
        case 'End':
          e.preventDefault();
          ctx.focusEdge('last');
          break;
        case 'Enter':
        case ' ':
          if (ctx.activationMode === 'manual') {
            e.preventDefault();
            ctx.select(value);
          }
          break;
      }
    };

    const handleFocus = (e: React.FocusEvent<HTMLButtonElement>) => {
      onFocus?.(e);
      if (ctx.activationMode === 'automatic') {
        ctx.select(value);
      }
    };

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(e);
      ctx.select(value);
    };

    return (
      <button
        ref={setRefs}
        type="button"
        role="tab"
        id={`${ctx.baseId}-tab-${value}`}
        aria-selected={selected}
        aria-controls={`${ctx.baseId}-panel-${value}`}
        tabIndex={selected ? 0 : -1}
        data-state={selected ? 'active' : 'inactive'}
        onKeyDown={handleKey}
        onFocus={handleFocus}
        onClick={handleClick}
        className={cn(
          'flex items-center gap-1.5 px-3 py-2 text-xs outline-none transition-colors',
          offset,
          s.font, tabRadius,
          s.border, sideBorder,
          focusRing,
          selected
            ? 'border-retro-border/40 bg-retro-bg text-retro-green'
            : 'border-transparent text-retro-muted hover:text-retro-text',
          className,
        )}
        {...rest}
      >
        {icon}
        {children}
      </button>
    );
  },
);

/* ── PixelTabs.Panel ─────────────────────────────────────────────────── */

export interface PixelTabsPanelProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'role'> {
  value: string;
  /** Override the root's keepMounted setting for this panel. */
  keepMounted?: boolean;
}

export const PixelTabsPanel = forwardRef<HTMLDivElement, PixelTabsPanelProps>(
  function PixelTabsPanel({ value, keepMounted, className, children, ...rest }, ref) {
    const ctx = useTabsContext('PixelTabs.Panel');
    const s = surfaceClasses(ctx.surface);
    const selected = ctx.active === value;
    const shouldMount = (keepMounted ?? ctx.keepMounted) || selected;

    if (!shouldMount) return null;

    return (
      <div
        ref={ref}
        role="tabpanel"
        id={`${ctx.baseId}-panel-${value}`}
        aria-labelledby={`${ctx.baseId}-tab-${value}`}
        hidden={!selected}
        data-state={selected ? 'active' : 'inactive'}
        tabIndex={0}
        className={cn(
          'bg-retro-bg/50 p-3 text-sm text-retro-muted outline-none',
          s.border, s.radius, 'border-retro-border/40',
          focusRing, 'focus-visible:ring-retro-cyan/30',
          className,
        )}
        {...rest}
      >
        {children}
      </div>
    );
  },
);

PixelTabsList.displayName = 'PixelTabs.List';
PixelTabsTrigger.displayName = 'PixelTabs.Trigger';
PixelTabsPanel.displayName = 'PixelTabs.Panel';

type PixelTabsComponent = typeof PixelTabsRootFwd & {
  List: typeof PixelTabsList;
  Trigger: typeof PixelTabsTrigger;
  Panel: typeof PixelTabsPanel;
};

export const PixelTabs = PixelTabsRootFwd as PixelTabsComponent;
PixelTabs.List = PixelTabsList;
PixelTabs.Trigger = PixelTabsTrigger;
PixelTabs.Panel = PixelTabsPanel;

/* ──────────────────────────────────────────────────────────────────────────
   PixelAccordion — list of expandable items with aria-controls + id wiring.
   ────────────────────────────────────────────────────────────────────────── */

/** Public prop bag for {@link PixelAccordion}. */
export interface PixelAccordionProps {
  items: AccordionItem[];
  allowMultiple?: boolean;
  /** When set, no item is initially expanded. Defaults to expanding the first. */
  collapsedByDefault?: boolean;
  surface?: Surface;
}

export const PixelAccordion = forwardRef<HTMLDivElement, PixelAccordionProps>(function PixelAccordion(
  { items, allowMultiple = false, collapsedByDefault = false, surface: surfaceProp },
  ref,
) {
  const surface = useEffectiveSurface(surfaceProp);
  const s = surfaceClasses(surface);
  const baseId = useId();
  const [openIds, setOpenIds] = useState<Set<string>>(
    () => new Set(!collapsedByDefault && items[0] ? [items[0].id] : []),
  );

  const toggle = (id: string) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else {
        if (!allowMultiple) next.clear();
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div ref={ref} className="space-y-1.5">
      {items.map((item) => {
        const isOpen = openIds.has(item.id);
        const headerId = `${baseId}-h-${item.id}`;
        const panelId = `${baseId}-p-${item.id}`;
        return (
          <div key={item.id} className={cn('bg-retro-surface/40', s.border, s.radius, 'border-retro-border/40')}>
            <button
              id={headerId}
              type="button"
              aria-expanded={isOpen}
              aria-controls={panelId}
              className={cn(
                'flex w-full items-center justify-between px-3 py-2.5 text-left text-sm text-retro-text outline-none transition-colors hover:bg-retro-surface/60',
                s.font, focusRing, 'focus-visible:ring-retro-cyan/30',
              )}
              onClick={() => toggle(item.id)}
            >
              <span>{item.title}</span>
              <ChevronDownIcon className={cn('text-retro-muted transition-transform duration-200', isOpen && 'rotate-180')} />
            </button>
            {isOpen && (
              <div
                id={panelId}
                role="region"
                aria-labelledby={headerId}
                className="border-t border-retro-border/30 px-3 py-2.5 text-sm text-retro-muted"
              >
                {item.content}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
});

/* ──────────────────────────────────────────────────────────────────────────
   PixelBreadcrumb — trail with pixel chevron separators.
   ────────────────────────────────────────────────────────────────────────── */

/** Single crumb item for {@link PixelBreadcrumb}. */
export type PixelBreadcrumbItem = { label: string; href?: string; onClick?: () => void; active?: boolean };

/** Public prop bag for {@link PixelBreadcrumb}. */
export interface PixelBreadcrumbProps {
  items: PixelBreadcrumbItem[];
  surface?: Surface;
  ariaLabel?: string;
}

export const PixelBreadcrumb = forwardRef<HTMLElement, PixelBreadcrumbProps>(function PixelBreadcrumb(
  { items, surface: surfaceProp, ariaLabel = 'Breadcrumb' },
  ref,
) {
  const surface = useEffectiveSurface(surfaceProp);
  const s = surfaceClasses(surface);
  return (
    <nav ref={ref} aria-label={ariaLabel} className={cn('flex items-center gap-1.5 text-xs', s.font)}>
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((item, idx) => (
          <li key={idx} className="flex items-center gap-1.5">
            {idx > 0 && (
              surface === 'pixel' ? (
                <svg viewBox="0 0 8 8" className="h-2 w-2 shrink-0 text-retro-border" shapeRendering="crispEdges" fill="currentColor" preserveAspectRatio="xMidYMid meet" aria-hidden style={{ display: 'inline-block', verticalAlign: 'middle', overflow: 'visible' }}>
                  <rect x="2" y="1" width="1" height="1" />
                  <rect x="3" y="2" width="1" height="1" />
                  <rect x="4" y="3" width="2" height="1" />
                  <rect x="3" y="5" width="1" height="1" />
                  <rect x="2" y="6" width="1" height="1" />
                </svg>
              ) : (
                <span aria-hidden className="text-retro-border">/</span>
              )
            )}
            {item.active ? (
              <span aria-current="page" className="text-retro-text font-medium">{item.label}</span>
            ) : item.onClick ? (
              <button type="button" onClick={item.onClick} className="text-retro-muted transition-colors hover:text-retro-green focus:outline-none focus-visible:underline">
                {item.label}
              </button>
            ) : item.href ? (
              <a href={item.href} className="text-retro-muted transition-colors hover:text-retro-green focus:outline-none focus-visible:underline">
                {item.label}
              </a>
            ) : (
              <span className="text-retro-muted">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
});

/* ──────────────────────────────────────────────────────────────────────────
   PixelPagination — windowed page-number buttons with first/last + ellipses.
   ────────────────────────────────────────────────────────────────────────── */

const ELLIPSIS = '…';

/** Builds a windowed sequence like [1, '…', 4, 5, 6, '…', 20]. */
function buildPageWindow(page: number, total: number, siblings = 1): Array<number | typeof ELLIPSIS> {
  const out: Array<number | typeof ELLIPSIS> = [];
  if (total <= 7) {
    for (let i = 1; i <= total; i++) out.push(i);
    return out;
  }
  const left = Math.max(2, page - siblings);
  const right = Math.min(total - 1, page + siblings);
  out.push(1);
  if (left > 2) out.push(ELLIPSIS);
  for (let i = left; i <= right; i++) out.push(i);
  if (right < total - 1) out.push(ELLIPSIS);
  out.push(total);
  return out;
}

/** Public prop bag for {@link PixelPagination}. */
export interface PixelPaginationProps {
  page: number;
  total: number;
  onChange: (next: number) => void;
  /** Sibling pages to show around the current. Defaults to 1. */
  siblings?: number;
  surface?: Surface;
  ariaLabel?: string;
  /** Localised labels for the Prev/Next buttons. */
  prevLabel?: string;
  nextLabel?: string;
}

export const PixelPagination = forwardRef<HTMLElement, PixelPaginationProps>(function PixelPagination(
  { page, total, onChange, siblings = 1, surface: surfaceProp, ariaLabel = 'Pagination', prevLabel = 'Prev', nextLabel = 'Next' },
  ref,
) {
  const surface = useEffectiveSurface(surfaceProp);
  const s = surfaceClasses(surface);
  const baseBtn = cn('h-8 text-xs transition-colors', s.font, s.border, s.radius);
  const pages = useMemo(() => buildPageWindow(page, total, siblings), [page, total, siblings]);

  return (
    <nav ref={ref} aria-label={ariaLabel} className="inline-flex items-center gap-1">
      <button
        type="button"
        disabled={page <= 1}
        aria-label={prevLabel}
        onClick={() => onChange(Math.max(1, page - 1))}
        className={cn(
          baseBtn, 'inline-flex items-center px-2.5',
          page <= 1 ? 'opacity-50 cursor-not-allowed border-retro-border text-retro-muted' : 'border-retro-border text-retro-muted hover:bg-retro-surface hover:text-retro-text',
        )}
      >
        {prevLabel}
      </button>
      {pages.map((p, idx) =>
        p === ELLIPSIS ? (
          <span key={`ell-${idx}`} aria-hidden className={cn('h-8 w-8 flex items-center justify-center text-retro-muted', s.font)}>
            {ELLIPSIS}
          </span>
        ) : (
          <button
            key={p}
            type="button"
            aria-current={p === page ? 'page' : undefined}
            className={cn(
              baseBtn, 'w-8',
              p === page
                ? 'border-retro-green/50 bg-retro-green/10 text-retro-green'
                : 'border-retro-border text-retro-muted hover:bg-retro-surface hover:text-retro-text',
            )}
            onClick={() => onChange(p)}
          >
            {p}
          </button>
        ),
      )}
      <button
        type="button"
        disabled={page >= total}
        aria-label={nextLabel}
        onClick={() => onChange(Math.min(total, page + 1))}
        className={cn(
          baseBtn, 'inline-flex items-center px-2.5',
          page >= total ? 'opacity-50 cursor-not-allowed border-retro-border text-retro-muted' : 'border-retro-border text-retro-muted hover:bg-retro-surface hover:text-retro-text',
        )}
      >
        {nextLabel}
      </button>
    </nav>
  );
});

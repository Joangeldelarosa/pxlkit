import React, { forwardRef, useId, useMemo, useRef, useState } from 'react';
import {
  Surface, TabItem, AccordionItem, cn,
  focusRing, surfaceClasses, useEffectiveSurface,
  ChevronDownIcon,
} from './common';
/* ──────────────────────────────────────────────────────────────────────────
   PixelTabs — tabbed panel with roving tabindex + keyboard nav.
   ────────────────────────────────────────────────────────────────────────── */

/** Public prop bag for {@link PixelTabs}. */
export interface PixelTabsProps {
  items: TabItem[];
  defaultTab?: string;
  /** Controlled active tab id. When set, `defaultTab` is ignored. */
  value?: string;
  onChange?: (id: string) => void;
  surface?: Surface;
  ariaLabel?: string;
}

export const PixelTabs = forwardRef<HTMLDivElement, PixelTabsProps>(function PixelTabs(
  { items, defaultTab, value, onChange, surface: surfaceProp, ariaLabel = 'Tabs' },
  ref,
) {
  const surface = useEffectiveSurface(surfaceProp);
  const s = surfaceClasses(surface);
  const isControlled = value !== undefined;
  const [internal, setInternal] = useState(defaultTab ?? items[0]?.id);
  const active = isControlled ? value : internal;
  const current = items.find((i) => i.id === active) ?? items[0];
  const tabRadius = surface === 'pixel' ? 'rounded-t-[3px]' : 'rounded-t-md';
  const baseId = useId();
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const select = (id: string) => {
    if (!isControlled) setInternal(id);
    onChange?.(id);
  };

  const focusTab = (idx: number) => {
    const len = items.length;
    if (!len) return;
    const next = ((idx % len) + len) % len;
    tabRefs.current[next]?.focus();
    select(items[next].id);
  };

  const onKey = (e: React.KeyboardEvent, idx: number) => {
    switch (e.key) {
      case 'ArrowRight': e.preventDefault(); focusTab(idx + 1); break;
      case 'ArrowLeft': e.preventDefault(); focusTab(idx - 1); break;
      case 'Home': e.preventDefault(); focusTab(0); break;
      case 'End': e.preventDefault(); focusTab(items.length - 1); break;
    }
  };

  return (
    <div ref={ref} className="space-y-3">
      <div className="flex flex-wrap gap-1 border-b-2 border-retro-border/40 pb-px" role="tablist" aria-label={ariaLabel}>
        {items.map((item, idx) => {
          const selected = active === item.id;
          return (
            <button
              key={item.id}
              ref={(el) => { tabRefs.current[idx] = el; }}
              type="button"
              role="tab"
              id={`${baseId}-tab-${item.id}`}
              aria-selected={selected}
              aria-controls={`${baseId}-panel-${item.id}`}
              tabIndex={selected ? 0 : -1}
              onKeyDown={(e) => onKey(e, idx)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-2 text-xs outline-none -mb-px transition-colors',
                s.font, tabRadius,
                s.border, 'border-b-0',
                focusRing,
                selected
                  ? 'border-retro-border/40 bg-retro-bg text-retro-green'
                  : 'border-transparent text-retro-muted hover:text-retro-text',
              )}
              onClick={() => select(item.id)}
            >
              {item.icon}
              {item.label}
            </button>
          );
        })}
      </div>
      <div
        role="tabpanel"
        id={`${baseId}-panel-${current?.id}`}
        aria-labelledby={`${baseId}-tab-${current?.id}`}
        tabIndex={0}
        className={cn('bg-retro-bg/50 p-3 text-sm text-retro-muted outline-none', s.border, s.radius, 'border-retro-border/40', focusRing, 'focus-visible:ring-retro-cyan/30')}
      >
        {current?.content}
      </div>
    </div>
  );
});

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

import React, { useState } from 'react';
import {
  Surface, TabItem, AccordionItem, cn,
  toneMap, focusRing, surfaceClasses, useEffectiveSurface,
  ChevronDownIcon,
} from './common';

/* ──────────────────────────────────────────────────────────────────────────
   PixelTabs — tabbed panel. Pixel surface uses file-folder tabs.
   ────────────────────────────────────────────────────────────────────────── */

export function PixelTabs({
  items,
  defaultTab,
  surface: surfaceProp,
}: {
  items: TabItem[];
  defaultTab?: string;
  surface?: Surface;
}) {
  const surface = useEffectiveSurface(surfaceProp);
  const s = surfaceClasses(surface);
  const [active, setActive] = useState(defaultTab ?? items[0]?.id);
  const current = items.find((i) => i.id === active) ?? items[0];
  const tabRadius = surface === 'pixel' ? 'rounded-t-[3px]' : 'rounded-t-md';
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1 border-b-2 border-retro-border/40 pb-px" role="tablist">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={active === item.id}
            className={cn(
              'flex items-center gap-1.5 px-3 py-2 text-xs outline-none -mb-px transition-colors',
              s.font, tabRadius,
              s.border, 'border-b-0',
              focusRing,
              active === item.id
                ? 'border-retro-border/40 bg-retro-bg text-retro-green'
                : 'border-transparent text-retro-muted hover:text-retro-text',
            )}
            onClick={() => setActive(item.id)}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </div>
      <div role="tabpanel" className={cn('bg-retro-bg/50 p-3 text-sm text-retro-muted', s.border, s.radius, 'border-retro-border/40')}>
        {current?.content}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   PixelAccordion — list of expandable items.
   ────────────────────────────────────────────────────────────────────────── */

export function PixelAccordion({
  items,
  allowMultiple = false,
  surface: surfaceProp,
}: {
  items: AccordionItem[];
  allowMultiple?: boolean;
  surface?: Surface;
}) {
  const surface = useEffectiveSurface(surfaceProp);
  const s = surfaceClasses(surface);
  const [openIds, setOpenIds] = useState<Set<string>>(new Set(items[0] ? [items[0].id] : []));

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
    <div className="space-y-1.5">
      {items.map((item) => {
        const isOpen = openIds.has(item.id);
        return (
          <div key={item.id} className={cn('bg-retro-surface/40', s.border, s.radius, 'border-retro-border/40')}>
            <button
              type="button"
              aria-expanded={isOpen}
              className={cn('flex w-full items-center justify-between px-3 py-2.5 text-left text-sm text-retro-text outline-none', s.font)}
              onClick={() => toggle(item.id)}
            >
              <span>{item.title}</span>
              <ChevronDownIcon className={cn('text-retro-muted transition-transform duration-200', isOpen && 'rotate-180')} />
            </button>
            {isOpen && (
              <div className="border-t border-retro-border/30 px-3 py-2.5 text-sm text-retro-muted">
                {item.content}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   PixelBreadcrumb — trail with pixel chevron separators.
   ────────────────────────────────────────────────────────────────────────── */

export function PixelBreadcrumb({
  items,
  surface: surfaceProp,
}: {
  items: Array<{ label: string; href?: string; onClick?: () => void; active?: boolean }>;
  surface?: Surface;
}) {
  const surface = useEffectiveSurface(surfaceProp);
  const s = surfaceClasses(surface);
  return (
    <nav aria-label="Breadcrumb" className={cn('flex items-center gap-1.5 text-xs', s.font)}>
      {items.map((item, idx) => (
        <React.Fragment key={idx}>
          {idx > 0 && (
            surface === 'pixel' ? (
              <svg viewBox="0 0 8 8" className="h-2 w-2 shrink-0 text-retro-border" shapeRendering="crispEdges" fill="currentColor" preserveAspectRatio="xMidYMid meet" style={{ display: 'inline-block', verticalAlign: 'middle', overflow: 'visible' }}>
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
            <span className="text-retro-text font-medium">{item.label}</span>
          ) : item.onClick ? (
            <button type="button" onClick={item.onClick} className="text-retro-muted transition-colors hover:text-retro-green">
              {item.label}
            </button>
          ) : item.href ? (
            <a href={item.href} className="text-retro-muted transition-colors hover:text-retro-green">
              {item.label}
            </a>
          ) : (
            <span className="text-retro-muted">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   PixelPagination — chunky page-number buttons.
   ────────────────────────────────────────────────────────────────────────── */

export function PixelPagination({
  page,
  total,
  onChange,
  surface: surfaceProp,
}: {
  page: number;
  total: number;
  onChange: (next: number) => void;
  surface?: Surface;
}) {
  const surface = useEffectiveSurface(surfaceProp);
  const s = surfaceClasses(surface);
  const pages = Array.from({ length: total }, (_, idx) => idx + 1);
  const baseBtn = cn('h-8 text-xs transition-colors', s.font, s.border, s.radius);
  return (
    <nav aria-label="Pagination" className="inline-flex items-center gap-1">
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onChange(Math.max(1, page - 1))}
        className={cn(
          baseBtn, 'inline-flex items-center px-2.5',
          page <= 1 ? 'opacity-50 cursor-not-allowed border-retro-border text-retro-muted' : 'border-retro-border text-retro-muted hover:bg-retro-surface hover:text-retro-text',
        )}
      >
        Prev
      </button>
      {pages.map((p) => (
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
      ))}
      <button
        type="button"
        disabled={page >= total}
        onClick={() => onChange(Math.min(total, page + 1))}
        className={cn(
          baseBtn, 'inline-flex items-center px-2.5',
          page >= total ? 'opacity-50 cursor-not-allowed border-retro-border text-retro-muted' : 'border-retro-border text-retro-muted hover:bg-retro-surface hover:text-retro-text',
        )}
      >
        Next
      </button>
    </nav>
  );
}

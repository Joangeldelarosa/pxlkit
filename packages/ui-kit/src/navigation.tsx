import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Tone, Size, Option, TabItem, AccordionItem, cn, useClickOutside,
  toneMap, sizeClass, focusRing, inputBase,
  ChevronDownIcon, CheckIcon, CloseIcon, FieldShell
} from './common';



export function PixelTabs({ items, defaultTab }: { items: TabItem[]; defaultTab?: string }) {
  const [active, setActive] = useState(defaultTab ?? items[0]?.id);
  const current = items.find((i) => i.id === active) ?? items[0];
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1 border-b border-retro-border/40 pb-px" role="tablist">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={active === item.id}
            className={cn(
              'flex items-center gap-1.5 rounded-t-md border border-b-0 px-3 py-2 text-xs font-mono transition-colors outline-none -mb-px',
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
      <div role="tabpanel" className="rounded-md border border-retro-border/40 bg-retro-bg/50 p-3 text-sm text-retro-muted">
        {current?.content}
      </div>
    </div>
  );
}

export function PixelAccordion({ items, allowMultiple = false }: { items: AccordionItem[]; allowMultiple?: boolean }) {
  const [openIds, setOpenIds] = useState<Set<string>>(new Set(items[0] ? [items[0].id] : []));

  const toggle = (id: string) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
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
          <div key={item.id} className="rounded-md border border-retro-border/40 bg-retro-surface/40">
            <button
              type="button"
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between px-3 py-2.5 text-left text-sm font-mono text-retro-text outline-none"
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

export function PixelBreadcrumb({
  items,
}: {
  items: Array<{ label: string; href?: string; onClick?: () => void; active?: boolean }>;
}) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 font-mono text-xs">
      {items.map((item, idx) => (
        <React.Fragment key={idx}>
          {idx > 0 && (
            <svg viewBox="0 0 8 8" className="h-2 w-2 shrink-0 text-retro-border" shapeRendering="crispEdges" fill="currentColor">
              <rect x="2" y="1" width="1" height="1" />
              <rect x="3" y="2" width="1" height="1" />
              <rect x="4" y="3" width="2" height="1" />
              <rect x="3" y="5" width="1" height="1" />
              <rect x="2" y="6" width="1" height="1" />
            </svg>
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

export function PixelPagination({
  page,
  total,
  onChange,
}: {
  page: number;
  total: number;
  onChange: (next: number) => void;
}) {
  const pages = Array.from({ length: total }, (_, idx) => idx + 1);
  return (
    <nav aria-label="Pagination" className="inline-flex items-center gap-1">
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onChange(Math.max(1, page - 1))}
        className={cn(
          'inline-flex h-8 items-center rounded-md border px-2.5 text-xs font-mono transition-colors',
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
            'h-8 w-8 rounded-md border text-xs font-mono transition-colors',
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
          'inline-flex h-8 items-center rounded-md border px-2.5 text-xs font-mono transition-colors',
          page >= total ? 'opacity-50 cursor-not-allowed border-retro-border text-retro-muted' : 'border-retro-border text-retro-muted hover:bg-retro-surface hover:text-retro-text',
        )}
      >
        Next
      </button>
    </nav>
  );
}


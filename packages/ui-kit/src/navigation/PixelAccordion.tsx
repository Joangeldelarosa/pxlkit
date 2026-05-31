import React, { forwardRef, useId, useState } from 'react';
import {
  AccordionItem,
  ChevronDownIcon,
  Surface,
  cn,
  focusRing,
  surfaceClasses,
  useEffectiveSurface,
} from '../common';

/* ─────────────────────────────────────────────────────────────────────────
   PixelAccordion — list of expandable items with aria-controls + id wiring.
   ───────────────────────────────────────────────────────────────────────── */

/** Public prop bag for {@link PixelAccordion}. */
export interface PixelAccordionProps {
  /** Accordion items rendered in order. First item is expanded by default. */
  items: AccordionItem[];
  /** When true, multiple items can be expanded simultaneously. */
  allowMultiple?: boolean;
  /** When set, no item is initially expanded. Defaults to expanding the first. */
  collapsedByDefault?: boolean;
  /** Visual surface treatment override. */
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

PixelAccordion.displayName = 'PixelAccordion';

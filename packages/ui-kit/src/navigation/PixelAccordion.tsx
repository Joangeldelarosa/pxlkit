import React, { forwardRef, useId, useState } from 'react';
import {
  accordionClasses,
  accordionIds,
  accordionInitialOpen,
  accordionItemClasses,
  toggleAccordionItem,
} from '@pxlkit/ui-kit-core';
import {
  AccordionItem,
  ChevronDownIcon,
  Surface,
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
  const baseId = useId();
  const [openIds, setOpenIds] = useState<string[]>(() => accordionInitialOpen(items, collapsedByDefault));

  const toggle = (id: string) => {
    setOpenIds((prev) => toggleAccordionItem(prev, id, allowMultiple));
  };

  return (
    <div ref={ref} className={accordionClasses}>
      {items.map((item) => {
        const isOpen = openIds.includes(item.id);
        const ids = accordionIds(baseId, item.id);
        const classes = accordionItemClasses(surface, isOpen);
        return (
          <div key={item.id} className={classes.item}>
            <button
              id={ids.header}
              type="button"
              aria-expanded={isOpen}
              aria-controls={ids.panel}
              className={classes.trigger}
              onClick={() => toggle(item.id)}
            >
              <span>{item.title}</span>
              <ChevronDownIcon className={classes.chevron} />
            </button>
            {isOpen && (
              // No role="region": the component cannot guarantee unique panel
              // names across instances, and duplicate region landmarks trip
              // axe's landmark-unique rule (APG also discourages region here
              // to avoid landmark proliferation). Without a role the panel
              // takes no name either: ARIA prohibits aria-labelledby on it.
              <div id={ids.panel} className={classes.panel}>
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

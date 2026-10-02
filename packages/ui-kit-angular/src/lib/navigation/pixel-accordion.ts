import { ChangeDetectionStrategy, Component, computed, input, signal, type OnInit } from '@angular/core';
import {
  accordionClasses,
  accordionIds,
  accordionInitialOpen,
  accordionItemClasses,
  toggleAccordionItem,
  type Surface,
} from '@pxlkit/ui-kit-core';
import { booleanOr } from '../_internal/coercion';
import { injectId } from '../_internal/ids';
import { PxlOutlet, type PxlContent } from '../_internal/outlet';
import { PixelGlyph } from '../_internal/pixel-glyph';
import { injectEffectiveSurface } from '../overlay-foundation/pxl-kit-surface-provider';

/** One item of a `<pxl-accordion>`. A `content` template receives the item as its context (`let-item`). */
export interface AccordionItem {
  id: string;
  /** Header text. */
  title: string;
  /** Panel content: text or an `<ng-template>`. */
  content: PxlContent;
}

/**
 * Stack of disclosure items: each header is a button reporting
 * `aria-expanded` that shows and hides its panel (`aria-controls`), which
 * refers back to it. One item is open at a time unless `allowMultiple`; the
 * first starts open unless `collapsedByDefault`. A closed panel is not
 * rendered.
 *
 * @example
 * <pxl-accordion [items]="[{ id: 'faq', title: 'FAQ', content: 'Short answers.' }]" allowMultiple />
 */
@Component({
  selector: 'pxl-accordion',
  imports: [PxlOutlet, PixelGlyph],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': 'classes' },
  template: `
    @for (row of rows(); track row.item.id) {
      <div [class]="row.classes.item">
        <button
          [id]="row.ids.header"
          type="button"
          [attr.aria-expanded]="row.open"
          [attr.aria-controls]="row.ids.panel"
          [class]="row.classes.trigger"
          (click)="toggle(row.item.id)"
        >
          <span>{{ row.item.title }}</span>
          <svg pxlGlyph="chevronDown" [class]="row.classes.chevron"></svg>
        </button>
        @if (row.open) {
          <div [id]="row.ids.panel" [attr.aria-labelledby]="row.ids.header" [class]="row.classes.panel">
            <ng-container *pxlOutlet="row.item.content; context: { $implicit: row.item }; let text">{{ text }}</ng-container>
          </div>
        }
      </div>
    }
  `,
})
export class PixelAccordion implements OnInit {
  /** The items, in order. */
  readonly items = input.required<AccordionItem[]>();
  /** Several items can be open at once. */
  readonly allowMultiple = input(false, { transform: booleanOr(false) });
  /** Every item starts closed, instead of the first one open. */
  readonly collapsedByDefault = input(false, { transform: booleanOr(false) });
  /** Surface override; defaults to the nearest provider. */
  readonly surface = input<Surface>();

  /** @internal */
  protected readonly classes = accordionClasses;
  private readonly baseId = injectId();
  private readonly effectiveSurface = injectEffectiveSurface(() => this.surface());
  private readonly open = signal<string[]>([]);
  /** @internal */
  protected readonly rows = computed(() =>
    this.items().map((item) => {
      const open = this.open().includes(item.id);
      return {
        item,
        open,
        ids: accordionIds(this.baseId, item.id),
        classes: accordionItemClasses(this.effectiveSurface(), open),
      };
    }),
  );

  // Like React's initial state, the items open on first render are read once.
  ngOnInit(): void {
    this.open.set(accordionInitialOpen(this.items(), this.collapsedByDefault()));
  }

  /** @internal */
  protected toggle(id: string): void {
    this.open.update((open) => toggleAccordionItem(open, id, this.allowMultiple()));
  }
}

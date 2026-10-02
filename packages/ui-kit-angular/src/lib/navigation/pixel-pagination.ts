import { ChangeDetectionStrategy, Component, computed, input, model, ViewEncapsulation } from '@angular/core';
import {
  PAGINATION_ELLIPSIS,
  paginationClasses,
  paginationEllipsisClasses,
  paginationPageClasses,
  paginationStepClasses,
  paginationSteps,
  paginationWindow,
  type Surface,
} from '@pxlkit/ui-kit-core';
import { numberOr, withDefault } from '../_internal/coercion';
import { injectEffectiveSurface } from '../overlay-foundation/pxl-kit-surface-provider';

/**
 * Page navigator in a navigation landmark: Prev, a window of page numbers
 * around the current page (the first and last always shown, `…` for the gaps)
 * and Next, disabled at the ends. The current page carries
 * `aria-current="page"`. Bind the page with `[(page)]`. The host is the
 * landmark (`role="navigation"`), named by `ariaLabel`.
 *
 * @example
 * <pxl-pagination [(page)]="page" [total]="20" />
 */
@Component({
  selector: 'pxl-pagination',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // The host stands for React's <nav>: a block box, in the base layer, so
  // display utilities set on it still win.
  encapsulation: ViewEncapsulation.None,
  styles: '@layer base { pxl-pagination { display: block; } }',
  host: {
    role: 'navigation',
    '[attr.aria-label]': 'ariaLabel()',
    '[class]': 'classes',
  },
  template: `
    <button
      type="button"
      [disabled]="steps().prev.disabled"
      [attr.aria-label]="prevLabel()"
      [class]="stepClasses(steps().prev.disabled)"
      (click)="page.set(steps().prev.page)"
    >{{ prevLabel() }}</button>
    @for (entry of pages(); track entry === ellipsis ? 'ell-' + $index : entry) {
      @if (entry === ellipsis) {
        <span aria-hidden="true" [class]="ellipsisClasses()">{{ ellipsis }}</span>
      } @else {
        <button
          type="button"
          [attr.aria-current]="entry === page() ? 'page' : null"
          [class]="pageClasses(entry === page())"
          (click)="page.set(entry)"
        >{{ entry }}</button>
      }
    }
    <button
      type="button"
      [disabled]="steps().next.disabled"
      [attr.aria-label]="nextLabel()"
      [class]="stepClasses(steps().next.disabled)"
      (click)="page.set(steps().next.page)"
    >{{ nextLabel() }}</button>
  `,
})
export class PixelPagination {
  /** Current page, from 1 (`[(page)]`). */
  readonly page = model.required<number>();
  /** Number of pages. */
  readonly total = input.required<number, unknown>({ transform: numberOr(0) });
  /** Pages shown on each side of the current one. */
  readonly siblings = input(1, { transform: numberOr(1) });
  /** Surface override; defaults to the nearest provider. */
  readonly surface = input<Surface>();
  /** Accessible name of the landmark. */
  readonly ariaLabel = input<string, string | undefined>('Pagination', { transform: withDefault('Pagination') });
  /** Label of the previous-page button. */
  readonly prevLabel = input<string, string | undefined>('Prev', { transform: withDefault('Prev') });
  /** Label of the next-page button. */
  readonly nextLabel = input<string, string | undefined>('Next', { transform: withDefault('Next') });

  /** @internal */
  protected readonly classes = paginationClasses;
  /** @internal */
  protected readonly ellipsis = PAGINATION_ELLIPSIS;
  private readonly effectiveSurface = injectEffectiveSurface(() => this.surface());
  /** @internal */
  protected readonly pages = computed(() => paginationWindow(this.page(), this.total(), this.siblings()));
  /** @internal */
  protected readonly steps = computed(() => paginationSteps(this.page(), this.total()));
  /** @internal */
  protected readonly ellipsisClasses = computed(() => paginationEllipsisClasses(this.effectiveSurface()));

  /** @internal */
  protected stepClasses(disabled: boolean): string {
    return paginationStepClasses(this.effectiveSurface(), disabled);
  }

  /** @internal */
  protected pageClasses(current: boolean): string {
    return paginationPageClasses(this.effectiveSurface(), current);
  }
}

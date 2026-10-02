import { ChangeDetectionStrategy, Component, computed, input, ViewEncapsulation } from '@angular/core';
import { cn } from '@pxlkit/ui-kit-core';
import { booleanOr, withDefault } from '../_internal/coercion';
import { injectTabsContext } from './tabs-context';

const FADE_MASK = 'linear-gradient(to right, transparent 0, #000 16px, #000 calc(100% - 16px), transparent 100%)';

/**
 * The tablist of a compositional `<pxl-tabs>`. The host is the outer wrapper;
 * the `role="tablist"` element is inside.
 */
@Component({
  selector: 'pxl-tabs-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // The host stands for React's <div>: a block box, in the base layer, so
  // display utilities set on it still win.
  encapsulation: ViewEncapsulation.None,
  styles: '@layer base { pxl-tabs-list { display: block; } }',
  host: { '[class]': 'wrapperClasses()' },
  template: `
    <div
      role="tablist"
      [attr.aria-label]="ariaLabel()"
      [attr.aria-orientation]="context.orientation()"
      [class]="listClasses()"
      [attr.data-scrollable]="scrolls() ? 'true' : null"
      [style.-webkit-mask-image]="scrolls() ? fadeMask : null"
      [style.mask-image]="scrolls() ? fadeMask : null"
      [style.scrollbar-width]="scrolls() ? 'none' : null"
    >
      <ng-content />
    </div>
  `,
})
export class PixelTabsList {
  /** Accessible label of the tablist. */
  readonly ariaLabel = input<string, string | undefined>('Tabs', { transform: withDefault('Tabs') });
  /** Scroll horizontally with a fade mask (ignored when vertical). */
  readonly scrollable = input(false, { transform: booleanOr(false) });

  /** @internal */
  protected readonly context = injectTabsContext('PixelTabsList');
  /** @internal */
  protected readonly fadeMask = FADE_MASK;
  private readonly vertical = computed(() => this.context.orientation() === 'vertical');
  /** @internal */
  protected readonly scrolls = computed(() => this.scrollable() && !this.vertical());

  /** @internal */
  protected readonly wrapperClasses = computed(() =>
    cn(
      this.vertical()
        ? 'flex flex-col gap-1 self-start border-r-2 border-retro-border/40 pr-px'
        : 'border-b-2 border-retro-border/40 pb-px',
      this.scrolls() && 'relative',
    ),
  );

  /** @internal */
  protected readonly listClasses = computed(() =>
    cn(
      'flex gap-1',
      this.vertical() ? 'flex-col' : 'flex-wrap',
      this.scrolls() && 'flex-nowrap overflow-x-auto scrollbar-hidden',
      this.scrolls() && 'overflow-y-hidden',
    ),
  );
}

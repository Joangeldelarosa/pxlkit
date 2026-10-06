import { ChangeDetectionStrategy, Component, computed, input, ViewEncapsulation } from '@angular/core';
import { emptyStateClasses, type Surface } from '@pxlkit/ui-kit-core';
import { PxlOutlet, type PxlContent } from '../_internal/outlet';
import { injectEffectiveSurface } from '../overlay-foundation/pxl-kit-surface-provider';

/**
 * Placeholder for an empty collection or a search without results: a dashed,
 * centred block with a title (`<h4>`), a description and an optional
 * decorative icon and call to action (text or an `<ng-template>`). The host
 * is the block.
 *
 * @example
 * <pxl-empty-state title="No results found" description="Try other filters." [action]="reset" />
 * <ng-template #reset><button pxlButton size="sm">Reset filters</button></ng-template>
 */
@Component({
  selector: 'pxl-empty-state',
  imports: [PxlOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  // The host stands for React's <div>: a block box, in the base layer, so
  // display utilities set on it still win.
  encapsulation: ViewEncapsulation.None,
  styles: '@layer base { pxl-empty-state { display: block; } }',
  host: {
    '[class]': 'classes().root',
    // `title` is the heading; on the host it would show a native tooltip.
    '[attr.title]': 'null',
  },
  template: `
    @if (icon()) {
      <div [class]="classes().icon" aria-hidden="true"><ng-container *pxlOutlet="icon(); let text">{{ text }}</ng-container></div>
    }
    <h4 [class]="classes().title">{{ title() }}</h4>
    <p [class]="classes().description">{{ description() }}</p>
    @if (action()) {
      <div [class]="classes().action"><ng-container *pxlOutlet="action(); let text">{{ text }}</ng-container></div>
    }
  `,
})
export class PixelEmptyState {
  /** Short title (e.g. `"No results"`). */
  readonly title = input.required<string>();
  /** Supporting description below the title. */
  readonly description = input.required<string>();
  /** Call to action under the description (a button, a link). */
  readonly action = input<PxlContent>();
  /** Decorative icon above the title (hidden from assistive tech). */
  readonly icon = input<PxlContent>();
  /** Surface override; defaults to the nearest provider. */
  readonly surface = input<Surface>();

  private readonly effectiveSurface = injectEffectiveSurface(() => this.surface());
  /** @internal */
  protected readonly classes = computed(() => emptyStateClasses(this.effectiveSurface()));
}

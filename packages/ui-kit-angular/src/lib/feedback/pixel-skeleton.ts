import { ChangeDetectionStrategy, Component, computed, input, ViewEncapsulation } from '@angular/core';
import { SKELETON_DEFAULT_HEIGHT, SKELETON_DEFAULT_LABEL, skeletonClasses, type Surface } from '@pxlkit/ui-kit-core';
import { booleanOr, withDefault } from '../_internal/coercion';
import { injectEffectiveSurface } from '../overlay-foundation/pxl-kit-surface-provider';

/**
 * Pulsing loading placeholder (`role="status"`) that reserves the space of
 * the content it stands for. The host is the block: classes and attributes
 * set on it stay, and `[style.width]` / `[style.height]` bindings win over
 * the inputs.
 *
 * @example
 * <pxl-skeleton width="10rem" ariaLabel="Loading user profile" />
 */
@Component({
  selector: 'pxl-skeleton',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // The host stands for React's <div>: a block box, in the base layer, so
  // display utilities set on it still win.
  encapsulation: ViewEncapsulation.None,
  styles: '@layer base { pxl-skeleton { display: block; } }',
  host: {
    role: 'status',
    '[attr.aria-label]': 'ariaLabel()',
    '[class]': 'classes()',
    '[style.width]': 'width()',
    '[style.height]': 'height()',
  },
  template: '',
})
export class PixelSkeleton {
  /** CSS width (e.g. `"100%"`, `"12rem"`). */
  readonly width = input<string>();
  /** CSS height. */
  readonly height = input<string, string | undefined>(SKELETON_DEFAULT_HEIGHT, {
    transform: withDefault(SKELETON_DEFAULT_HEIGHT),
  });
  /** A circle on the linear surface, a 2px chamfer on the pixel one, instead of the surface radius. */
  readonly rounded = input(false, { transform: booleanOr(false) });
  /** Surface override; defaults to the nearest provider. */
  readonly surface = input<Surface>();
  /** Accessible label. */
  readonly ariaLabel = input<string, string | undefined>(SKELETON_DEFAULT_LABEL, {
    transform: withDefault(SKELETON_DEFAULT_LABEL),
  });

  private readonly effectiveSurface = injectEffectiveSurface(() => this.surface());
  /** @internal */
  protected readonly classes = computed(() => skeletonClasses(this.effectiveSurface(), { rounded: this.rounded() }));
}

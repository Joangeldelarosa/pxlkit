import { ChangeDetectionStrategy, Component, computed, input, ViewEncapsulation } from '@angular/core';
import { drawerHeaderClasses, type Surface } from '@pxlkit/ui-kit-core';
import { injectEffectiveSurface } from '../overlay-foundation/pxl-kit-surface-provider';

/** Header bar of a `<pxl-drawer>`, set off from the body by a surface-aware divider. */
@Component({
  selector: 'pxl-drawer-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // The host stands for React's <div>: a block box, in the base layer, so
  // display utilities set on it still win.
  encapsulation: ViewEncapsulation.None,
  styles: '@layer base { pxl-drawer-header { display: block; } }',
  host: { '[class]': 'classes()' },
  template: '<ng-content />',
})
export class PixelDrawerHeader {
  /** Surface override; defaults to the nearest provider. */
  readonly surface = input<Surface>();

  private readonly effectiveSurface = injectEffectiveSurface(() => this.surface());
  /** @internal */
  protected readonly classes = computed(() => drawerHeaderClasses(this.effectiveSurface()));
}

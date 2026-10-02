import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { drawerHeaderClasses, type Surface } from '@pxlkit/ui-kit-core';
import { injectEffectiveSurface } from '../overlay-foundation/pxl-kit-surface-provider';

/** Header bar of a `<pxl-drawer>`, set off from the body by a surface-aware divider. */
@Component({
  selector: 'pxl-drawer-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
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

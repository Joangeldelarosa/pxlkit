import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { drawerFooterClasses, type Surface } from '@pxlkit/ui-kit-core';
import { injectEffectiveSurface } from '../overlay-foundation/pxl-kit-surface-provider';

/** Footer bar of a `<pxl-drawer>` for its actions, set off by a surface-aware divider. */
@Component({
  selector: 'pxl-drawer-footer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': 'classes()' },
  template: '<ng-content />',
})
export class PixelDrawerFooter {
  /** Surface override; defaults to the nearest provider. */
  readonly surface = input<Surface>();

  private readonly effectiveSurface = injectEffectiveSurface(() => this.surface());
  /** @internal */
  protected readonly classes = computed(() => drawerFooterClasses(this.effectiveSurface()));
}

import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { drawerBodyClasses } from '@pxlkit/ui-kit-core';

/** Scrolling body of a `<pxl-drawer>`. */
@Component({
  selector: 'pxl-drawer-body',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // The host stands for React's <div>: a block box, in the base layer, so
  // display utilities set on it still win.
  encapsulation: ViewEncapsulation.None,
  styles: '@layer base { pxl-drawer-body { display: block; } }',
  host: { '[class]': 'classes' },
  template: '<ng-content />',
})
export class PixelDrawerBody {
  /** @internal */
  protected readonly classes = drawerBodyClasses;
}
